#!/usr/bin/env node
/*
 * contrast-fixture.mjs
 *
 * Render every text token against every surface token and measure the real
 * WCAG ratio. Zero dependencies, no browser, runs in well under a second, so
 * it belongs in CI rather than in a review.
 *
 * Why this exists: "measure, do not estimate" is easy to agree with and hard
 * to keep doing. A fixture that fails the build does it for you. It also
 * catches the two token bugs that are invisible in a token file:
 *   1. an accent used as text that never had a contrast safe sibling
 *   2. a border token that is indistinguishable from a surface token, which
 *      makes that surface invisible and looks like a rendering bug
 *
 * This measures TOKEN pairs. It is the cheap half. It does not replace
 * sampling rendered pixels for text set over photographs, where the CSS
 * background is transparent and only the browser knows the answer. That job
 * belongs to the contrast lens of the audit harness.
 *
 * USAGE
 *   node contrast-fixture.mjs <tokens.css> [options]
 *
 * OPTIONS
 *   --text a,b,c       token names (no leading --) treated as text roles
 *   --surface a,b,c    token names treated as surfaces
 *   --pair fg:bg       add one required pair, repeatable
 *   --exempt fg:bg     drop one required pair, repeatable
 *   --min 4.5          minimum ratio for normal text
 *   --large 3.0        minimum ratio for text at 24px and above
 *   --ground <name>    surface used to composite translucent colours
 *   --quiet            print failures and the summary only
 *   --json             machine readable output
 *
 * With no --text or --surface, roles are inferred from token names, which is
 * good enough to start and wrong often enough that you should pin them once
 * the contract settles.
 *
 * EXIT CODES
 *   0  every required pair passes
 *   1  at least one required pair fails
 *   2  bad usage or unparseable input
 */

import { readFileSync } from 'node:fs'
import { basename } from 'node:path'

/* ---------- arguments ---------------------------------------------------- */

const argv = process.argv.slice(2)
const file = argv.find(a => !a.startsWith('--'))
const flag = (n, d = null) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1] }
const has = (n) => argv.includes(`--${n}`)
const many = (n) => argv.reduce((acc, a, i) => (a === `--${n}` ? [...acc, argv[i + 1]] : acc), [])
const csv = (v) => (v ? v.split(',').map(s => s.trim().replace(/^--/, '')).filter(Boolean) : null)

if (!file) {
  console.error('usage: node contrast-fixture.mjs <tokens.css> [--text a,b] [--surface a,b] [--pair fg:bg] [--min 4.5]')
  process.exit(2)
}

const MIN = Number(flag('min', '4.5'))
const LARGE = Number(flag('large', '3'))
const QUIET = has('quiet')
const JSON_OUT = has('json')

/* ---------- parse custom properties -------------------------------------- */

const src = readFileSync(file, 'utf8')
const decls = new Map()
for (const m of src.matchAll(/(--[a-zA-Z0-9-]+)\s*:\s*([^;{}]+);/g)) {
  decls.set(m[1].slice(2), m[2].trim())
}
if (decls.size === 0) {
  console.error(`no custom properties found in ${file}`)
  process.exit(2)
}

/* ---------- colour parsing ----------------------------------------------- */

// Resolve var() chains up to a small depth so a token may alias another token.
function resolve (value, depth = 0) {
  if (depth > 8) return value
  const m = value.match(/^var\(\s*--([a-zA-Z0-9-]+)\s*(?:,[^)]*)?\)$/)
  if (!m) return value
  const next = decls.get(m[1])
  return next === undefined ? value : resolve(next.trim(), depth + 1)
}

function parseColor (raw) {
  const value = resolve(String(raw).trim())
  let m
  if ((m = value.match(/^#([0-9a-fA-F]{3,8})$/))) {
    let h = m[1]
    if (h.length === 3 || h.length === 4) h = [...h].map(c => c + c).join('')
    if (h.length !== 6 && h.length !== 8) return null
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
    }
  }
  if ((m = value.match(/^rgba?\(([^)]+)\)$/i))) {
    const parts = m[1].split(/[,\s/]+/).filter(Boolean)
    if (parts.length < 3) return null
    const n = (s) => (s.endsWith('%') ? (parseFloat(s) / 100) * 255 : parseFloat(s))
    return {
      r: n(parts[0]), g: n(parts[1]), b: n(parts[2]),
      a: parts[3] === undefined ? 1 : (parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : parseFloat(parts[3])),
    }
  }
  return null   // named colours, oklch, gradients: out of scope on purpose
}

const over = (fg, bg) =>
  fg.a >= 1 ? fg : {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  }

const chan = (v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 }
const lum = (c) => 0.2126 * chan(c.r) + 0.7152 * chan(c.g) + 0.0722 * chan(c.b)
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }
const hex = (c) => '#' + [c.r, c.g, c.b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase()

/* ---------- classify ------------------------------------------------------ */

const colors = new Map()
for (const [name, value] of decls) {
  const c = parseColor(value)
  if (c) colors.set(name, c)
}

const SURFACE_HINT = /^(paper|surface|card|ground|bg|ivory|cream|canvas)(-|$)|(-|^)wash$/
const TEXT_HINT = /^(ink|text|soft|brown|fg)(-|$)|-ink$|^(few|full|error|ok|warn|success|danger|muted)$/
const LINE_HINT = /^(line|border|divider|rule|hairline)(-|$)/

const surfaces = csv(flag('surface')) || [...colors.keys()].filter(n => SURFACE_HINT.test(n))
const texts = csv(flag('text')) || [...colors.keys()].filter(n => TEXT_HINT.test(n))
const lines = [...colors.keys()].filter(n => LINE_HINT.test(n))

for (const n of [...surfaces, ...texts]) {
  if (!colors.has(n)) { console.error(`unknown or unparseable token: --${n}`); process.exit(2) }
}
if (!surfaces.length || !texts.length) {
  console.error('could not infer text or surface roles. Pass --text and --surface explicitly.')
  process.exit(2)
}

const ground = flag('ground', surfaces[0])
const groundColor = colors.get(ground)
if (!groundColor) { console.error(`unknown --ground token: --${ground}`); process.exit(2) }

/* ---------- build the required matrix ------------------------------------ */

const key = (fg, bg) => `${fg}:${bg}`
const required = new Map()
for (const bg of surfaces) for (const fg of texts) required.set(key(fg, bg), { fg, bg })
for (const p of many('pair')) {
  const [fg, bg] = String(p).split(':').map(s => s.replace(/^--/, ''))
  if (!colors.has(fg) || !colors.has(bg)) { console.error(`--pair ${p}: unknown token`); process.exit(2) }
  required.set(key(fg, bg), { fg, bg })
}
for (const p of many('exempt')) {
  const [fg, bg] = String(p).split(':').map(s => s.replace(/^--/, ''))
  required.delete(key(fg, bg))
}

const measure = (fgName, bgName) => {
  const bg = over(colors.get(bgName), groundColor)
  const fg = over(colors.get(fgName), bg)
  return { r: ratio(fg, bg), fgHex: hex(fg), bgHex: hex(bg) }
}

const results = [...required.values()].map(({ fg, bg }) => {
  const { r, fgHex, bgHex } = measure(fg, bg)
  return { fg, bg, ratio: r, fgHex, bgHex, pass: r >= MIN, passLarge: r >= LARGE }
}).sort((a, b) => a.ratio - b.ratio)

const informational = [...colors.keys()]
  .filter(n => !texts.includes(n) && !surfaces.includes(n) && !lines.includes(n))
  .map(n => ({ name: n, ratio: measure(n, ground).r }))
  .sort((a, b) => a.ratio - b.ratio)

// Two colours this close cannot be told apart. If a line token lands this near
// a surface token, that surface is invisible wherever the two meet.
const LINE_FLOOR = 1.08
const lineFindings = []
for (const l of lines) {
  for (const s of surfaces) {
    const { r } = measure(l, s)
    if (r < LINE_FLOOR) lineFindings.push({ line: l, surface: s, ratio: r })
  }
}

const failures = results.filter(x => !x.pass)

/* ---------- output -------------------------------------------------------- */

if (JSON_OUT) {
  console.log(JSON.stringify({ file, ground, min: MIN, large: LARGE, results, informational, lineFindings, failed: failures.length }, null, 2))
  process.exit(failures.length ? 1 : 0)
}

const pad = (s, n) => String(s).padEnd(n)
const fx = (n) => n.toFixed(2).padStart(6) + ':1'

console.log(`\nprom-design contrast fixture`)
console.log(`file    ${basename(file)}`)
console.log(`ground  --${ground}   min ${MIN}:1 normal, ${LARGE}:1 at 24px and above\n`)

console.log(`REQUIRED  ${results.length} pairs`)
for (const x of results) {
  if (QUIET && x.pass) continue
  const verdict = x.pass ? 'pass ' : (x.passLarge ? 'LARGE' : 'FAIL ')
  console.log(`  ${verdict}  ${pad('--' + x.fg, 18)} on ${pad('--' + x.bg, 22)} ${fx(x.ratio)}   ${x.fgHex} on ${x.bgHex}`)
}

if (!QUIET && informational.length) {
  console.log(`\nINFORMATIONAL  every other colour token on --${ground}, not enforced`)
  for (const x of informational) {
    const note = x.ratio < MIN ? '   below the text floor, so this token is a fill, not type' : ''
    console.log(`         ${pad('--' + x.name, 18)} ${' '.repeat(25)}${fx(x.ratio)}${note}`)
  }
}

if (!QUIET) {
  console.log(`\nLINE CHECK  a border within ${LINE_FLOOR}:1 of a surface is invisible on it`)
  if (!lineFindings.length) console.log('  clear: every line token is distinguishable on every surface')
  for (const f of lineFindings) {
    console.log(`  note   --${f.line} on --${f.surface} is ${f.ratio.toFixed(3)}:1. Do not pair them; use the next line step.`)
  }
}

console.log(`\n${results.length} required, ${results.length - failures.length} pass, ${failures.length} fail`)
process.exit(failures.length ? 1 : 0)
