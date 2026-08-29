#!/usr/bin/env node
/*
 * token-gate.mjs
 *
 * The build gate that keeps the design contract honest. Zero dependencies,
 * scans a few hundred files in well under a second, so it belongs in CI and in
 * a pre-commit hook rather than in a review.
 *
 * A token file that components ignore is worse than no token file, because it
 * reports that the system is fine while the drift happens somewhere else. The
 * only version of "no raw hex in a component" that survives a deadline is the
 * one a machine enforces.
 *
 * FOUR RULES
 *   prom-allow: the next line names the very patterns this file hunts for
 *   colour    a raw #hex, rgb(), hsl() or oklch() outside the token files
 *   zindex    a numeric z-index outside the token files, which is how the
 *             z-index bug category exists at all
 *   dash      an em dash or an en dash anywhere, including comments and commit
 *             ready strings, because the rule applies to rendered output and
 *             the only place to catch it reliably is before it renders
 *   px        (opt in) a raw px value outside the token files
 *
 * ESCAPE HATCH
 *   Put `prom-allow` in a comment on the offending line or the line above it.
 *   Genuine exceptions exist (a shader constant, a third party embed) and they
 *   should carry a comment explaining themselves rather than a silenced rule.
 *
 * USAGE
 *   node token-gate.mjs --src src --src app --tokens tokens,theme
 *
 * OPTIONS
 *   --src <dir>        directory to scan, repeatable. Default: the cwd
 *   --tokens <a,b>     path substrings that mark the token files, exempt from
 *                      the colour, zindex and px rules. Default: tokens,theme
 *   --ext <a,b>        extensions to scan. Default: css,scss,ts,tsx,js,jsx,
 *                      mjs,html,vue,svelte,astro,md
 *   --strict-px        also fail on raw px outside the token files
 *   --no-dash          skip the dash rule
 *   --max <n>          print at most n findings per rule. Default: 40
 *   --json             machine readable output
 *
 * EXIT CODES
 *   0  clean
 *   1  at least one violation
 *   2  bad usage
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname, relative, resolve } from 'node:path'

const argv = process.argv.slice(2)
const flag = (n, d = null) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1] }
const has = (n) => argv.includes(`--${n}`)
const many = (n) => argv.reduce((acc, a, i) => (a === `--${n}` ? [...acc, argv[i + 1]] : acc), [])

const roots = (many('src').length ? many('src') : ['.']).map(p => resolve(p))
const tokenMarks = (flag('tokens', 'tokens,theme')).split(',').map(s => s.trim()).filter(Boolean)
const exts = (flag('ext', 'css,scss,ts,tsx,js,jsx,mjs,html,vue,svelte,astro,md')).split(',').map(s => '.' + s.trim().replace(/^\./, ''))
const STRICT_PX = has('strict-px')
const DASHES = !has('no-dash')
const MAX = Number(flag('max', '40'))
const JSON_OUT = has('json')

const SKIP_DIR = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'out', 'coverage', '.turbo', '.cache', 'vendor', '.venv'])

const RULES = [
  {
    id: 'colour',
    tokenExempt: true,
    re: /(?<!url\()#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3}(?:[0-9a-fA-F]{2})?)?\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\s*\(/g,
    say: 'raw colour outside the token files. Bind it to a token.',
  },
  {
    id: 'zindex',
    tokenExempt: true,
    re: /z-?index\s*[:=]\s*['"]?-?\d/gi,
    say: 'numeric z-index. Use a named level from the z ladder.',
  },
  {
    id: 'dash',
    tokenExempt: false,
    re: /[\u2013\u2014]/g,
    say: 'em dash or en dash. Use a comma, a colon, a period, or parentheses.',
  },
  {
    id: 'px',
    tokenExempt: true,
    optIn: true,
    re: /[:=]\s*-?\d+(?:\.\d+)?px\b/g,
    say: 'raw px outside the token files. Use a spacing or chrome token.',
  },
]

const active = RULES.filter(r => (r.id !== 'px' || STRICT_PX) && (r.id !== 'dash' || DASHES))

function walk (dir, out = []) {
  let entries
  try { entries = readdirSync(dir) } catch { return out }
  for (const name of entries) {
    if (name.startsWith('.') && name !== '.claude-plugin') continue
    if (SKIP_DIR.has(name)) continue
    const full = join(dir, name)
    let st
    try { st = statSync(full) } catch { continue }
    if (st.isDirectory()) walk(full, out)
    else if (exts.includes(extname(name))) out.push(full)
  }
  return out
}

const files = [...new Set(roots.flatMap(r => {
  try { return statSync(r).isDirectory() ? walk(r) : [r] } catch { return [] }
}))].sort()

if (!files.length) {
  console.error(`token-gate: nothing to scan under ${roots.join(', ')}`)
  process.exit(2)
}

const isTokenFile = (p) => tokenMarks.some(m => p.includes(m))
const findings = []

for (const file of files) {
  const inTokens = isTokenFile(file)
  let lines
  try { lines = readFileSync(file, 'utf8').split('\n') } catch { continue }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const allowed = line.includes('prom-allow') || (i > 0 && lines[i - 1].includes('prom-allow'))
    if (allowed) continue
    for (const rule of active) {
      if (rule.tokenExempt && inTokens) continue
      rule.re.lastIndex = 0
      let m
      while ((m = rule.re.exec(line)) !== null) {
        findings.push({
          rule: rule.id,
          file: relative(process.cwd(), file),
          line: i + 1,
          col: m.index + 1,
          text: line.trim().slice(0, 110),
          match: m[0],
        })
        if (m[0].length === 0) rule.re.lastIndex++
      }
    }
  }
}

if (JSON_OUT) {
  console.log(JSON.stringify({ scanned: files.length, findings }, null, 2))
  process.exit(findings.length ? 1 : 0)
}

console.log(`\nprom-design token gate`)
console.log(`scanned ${files.length} files under ${roots.map(r => relative(process.cwd(), r) || '.').join(', ')}`)
console.log(`token files marked by: ${tokenMarks.join(', ')}`)
console.log(`rules: ${active.map(r => r.id).join(', ')}\n`)

for (const rule of active) {
  const hits = findings.filter(f => f.rule === rule.id)
  if (!hits.length) { console.log(`  clean  ${rule.id}`); continue }
  console.log(`  FAIL   ${rule.id}: ${hits.length} in ${new Set(hits.map(h => h.file)).size} files. ${rule.say}`)
  for (const h of hits.slice(0, MAX)) console.log(`         ${h.file}:${h.line}:${h.col}  ${h.text}`)
  if (hits.length > MAX) console.log(`         and ${hits.length - MAX} more`)
}

console.log(`\n${findings.length} violation${findings.length === 1 ? '' : 's'}`)
process.exit(findings.length ? 1 : 0)
