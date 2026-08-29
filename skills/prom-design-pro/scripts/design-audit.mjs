#!/usr/bin/env node
/*
 * design-audit.mjs
 *
 * Generate the six agent design audit for one project.
 *
 * This does not run the audit. It writes a directory of ready prompts with
 * your paths, port, routes, priors and sign in recipe already filled in,
 * because the reason most audits stall is not that the agents lack judgement.
 * It is that they do not know which port to hit, how to sign in, or how to
 * dismiss the first run overlay, so they spend their budget rediscovering the
 * tooling. Pre-solving that is most of the value here.
 *
 * OUTPUT
 *   .design-audit/
 *     README.md          how to run it, with and without an orchestrator
 *     00-context.md      the shared brief every lens receives
 *     schema.json        the finding schema every lens returns
 *     01-flows.md        lens 1: drive the product, find what is broken
 *     02-visual.md       lens 2: three widths, and actually look
 *     03-contrast.md     lens 3: sample the rendered pixels
 *     04-code.md         lens 4: read the source, do not drive
 *     05-content.md      lens 5: content, data and imagery, quantitative
 *     06-rank.md         the ranker, which verifies before it keeps
 *     orchestrate.mjs    optional driver for agents that expose agent()
 *
 * USAGE
 *   node design-audit.mjs \
 *     --repo /abs/path/to/source \
 *     --base http://127.0.0.1:8788 \
 *     --routes / /events /join \
 *     --product "a members club booking product going in front of a client" \
 *     --arch "server rendered, no build step, all CSS inlined from one file" \
 *     --recent "bottom tab bar, segmented nav, first run tour, filter chips" \
 *     --tests 271
 *
 * OPTIONS
 *   --out <dir>          default ./.design-audit
 *   --design <path>      design source of truth. Default DESIGN.md
 *   --rules <path>       repo rules file. Default AGENTS.md
 *   --widths <a,b,c>     default 320,390,1440
 *   --signin "<recipe>"  real selectors, not a description
 *   --skip-tour "<how>"  e.g. "localStorage app.tour=1", set in an init script
 *   --theme-cookie "<k=v>"
 *   --themes <a,b>       default light
 *   --lens <id>          emit only these lenses, repeatable
 *
 * EXIT CODES
 *   0 written   2 bad usage
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve, join } from 'node:path'

const argv = process.argv.slice(2)
const flag = (n, d = null) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1] }
const many = (n) => argv.reduce((acc, a, i) => (a === `--${n}` ? [...acc, argv[i + 1]] : acc), [])
const list = (n) => {
  const i = argv.indexOf(`--${n}`)
  if (i === -1) return []
  const out = []
  for (let j = i + 1; j < argv.length && !argv[j].startsWith('--'); j++) out.push(argv[j])
  return out
}

const repo = flag('repo')
if (!repo) {
  console.error('--repo is required (absolute path to the source root).')
  process.exit(2)
}

const base = flag('base', 'http://127.0.0.1:8788')
const routes = list('routes').length ? list('routes') : ['/']
const product = flag('product', 'a client facing web product')
const arch = flag('arch', 'describe the architecture in one paragraph')
const recent = flag('recent', 'the components that shipped most recently')
const tests = flag('tests', '0')
const design = flag('design', 'DESIGN.md')
const rules = flag('rules', 'AGENTS.md')
const widths = flag('widths', '320,390,1440')
const themes = flag('themes', 'light')
const signin = flag('signin', '')
const skipTour = flag('skip-tour', '')
const themeCookie = flag('theme-cookie', '')
const outDir = resolve(flag('out', './.design-audit'))
const onlyLenses = many('lens')

/* ---------------------------------------------------------------- context */

const CONTEXT = `# Shared brief

Every lens receives this block verbatim. The order matters: stakes first so
findings can be ranked by impact, then architecture so claims can be
categorical instead of hedged, then where the law lives, then the prior that
primes suspicion, then the tooling with its gotchas already solved.

PRODUCT: ${product}
WHAT IS AT STAKE: this run exists so that nothing embarrassing is in front of a
customer. A defect that stops the main action outranks anything cosmetic.

ARCHITECTURE: ${arch}

DESIGN SOURCE OF TRUTH: ${join(repo, design)}
REPO RULES: ${join(repo, rules)}
SOURCE ROOT: ${repo}
LOCAL URL: ${base}

IMPORTANT PRIOR: this codebase has recently been through rapid change.
Recently added: ${recent}.
Things WILL have been left half finished, duplicated, or subtly broken. Your
job is to find them. Assume nothing is fine because it looks fine.

ROUTES IN SCOPE:
${routes.map(r => `  ${r}`).join('\n')}

WIDTHS: ${widths}
THEMES: ${themes}

TOOLING, ALREADY SOLVED, DO NOT REDISCOVER:
- Drive a real browser with playwright-core from the npx cache. Locate it with
  ls -d "$HOME"/.npm/_npx/*/node_modules/playwright-core
  then import its index.mjs and call chromium.launch({ channel: 'chrome' }).
- The free prom-design skill ships scripts/shots.mjs, which captures every
  route at every width and reports HTTP status, scroll height in screens,
  horizontal overflow, broken images, rendered em and en dashes, and console
  errors. Use it rather than writing your own screenshot loop.
- Write scratch scripts into a temp directory and run them with node.
${skipTour ? `- Dismiss the first run overlay BEFORE navigating: ${skipTour}. Set it in an\n  init script that runs before page load, not after.\n` : ''}${themeCookie ? `- Theme is a cookie: ${themeCookie}.\n` : ''}${signin ? `- Sign in recipe: ${signin}\n` : ''}
RULES FOR YOUR OUTPUT:
Every finding must name the route, the exact selector or file:line, the
MEASURED evidence (a number, a status code, a console error, a screenshot
observation), and a concrete fix. No speculation, no "might be", no padding.
If your area is clean, say so in one line. Never use em dashes or en dashes.
Your output is raw material for a fixer, not prose for a human.

Return your result in the shape of schema.json in this directory. cleanAreas
is required: state your negative space so the ranker can tell "nobody looked"
apart from "somebody looked and it was fine".
`

/* ------------------------------------------------------------------ schema */

const SCHEMA = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { type: 'string', description: 'broken | half-finished | risk | polish' },
          where: { type: 'string', description: 'route and/or file:line' },
          what: { type: 'string', description: 'the defect, with the measured evidence' },
          fix: { type: 'string', description: 'the concrete change' },
        },
        required: ['severity', 'where', 'what', 'fix'],
      },
    },
    cleanAreas: { type: 'array', items: { type: 'string' } },
  },
  required: ['findings', 'cleanAreas'],
}

/* ------------------------------------------------------------------ lenses */

const LENSES = [
  ['flows', '01', `# Lens 1: flows

YOUR SCOPE: functional QA by driving the product. Find what is BROKEN, not
what is ugly. Someone else owns ugly.

Walk the real journeys, signed out and then signed in. Four coverage patterns,
each of which has caught something real:

1. STATE TRANSITION. The whole journey signed out, then the same journey signed
   in. Half finished work hides in exactly one of those two states.
2. DISMISSAL. Everything that opens must close three ways: by its own control,
   by Escape or Close, and by browser Back. Report any that closes in fewer.
3. BOUNDARY. Submit every form empty, then valid, then one character over any
   stated limit. If a field caps at 100 characters, send 101. Confirm the error
   renders on the right field or the right step, not at the top of the page.
4. CONSOLE CAPTURE AS A STANDING TAX. Record console errors and page errors on
   EVERY navigation you make and report every one, even the ones that look
   harmless. A silent 404 on a font is a finding.

Do not report visual taste. Do not report code style. Report what does not work.`],

  ['visual', '02', `# Lens 2: visual

YOUR SCOPE: visual regression at widths ${widths}, themes ${themes}.

Screenshot every route in scope and then ACTUALLY LOOK at the images. A lens
that does not read its own screenshots reports nothing, and this is the single
most common way this lens fails.

Look for: overlapping elements, clipped text, broken spacing, orphaned
headings, empty containers, elements that render with no content, content
duplicated on one page, sections that look unfinished, images at the wrong
aspect ratio, and anything that simply reads as a bug to a person looking at
it.

Then take one hard measurement: report document.body.scrollHeight divided by
the viewport height for every route, at the narrowest width. That number is
the complaint "too much scrolling" turned into something you can track. On an
app screen, 1 to 2 screens is good, 2 to 3 is acceptable for a browse or list
screen, 3 to 4.5 needs every section justified, and above 4.5 the screen is a
landing page wearing an app costume. Say which routes are over budget.

Cover each page archetype plus filtered and unfiltered states, not just the
happy path.`],

  ['contrast', '03', `# Lens 3: contrast

YOUR SCOPE: colour and contrast, measured rather than assumed.

Compute REAL contrast by sampling the RENDERED PIXELS instead of trusting
computed styles, because text is often set over photographs where the CSS
background is transparent and the computed style is a lie.

Report any text under 4.5:1, or under 3:1 at 24px and above, naming the
element and the measured ratio. Never present an estimated ratio as a
measurement.

Walk every theme the product ships (${themes}). Do not skip: the nav and any
bottom bar, menus, overlays and first run tours, every pill and chip, disabled
states, placeholder text, and any text over an image.

Cross check statically as well. Grep the stylesheet for colour literals
outside the token definitions and check that each one renders acceptably. The
token level half of this job can be done in a second with the pro skill's
scripts/contrast-fixture.mjs, so run that first and spend your budget on the
part it cannot see: text over imagery, and states that only exist at runtime.`],

  ['code', '04', `# Lens 4: code

YOUR SCOPE: code health. READ the source, do not drive the browser. Every
finding carries file:line.

Hunt: dead components, props, helpers and CSS classes that nothing uses;
duplicate or near duplicate rules that should collapse; selectors that can
never match; props threaded through three layers and then ignored; TODOs;
commented out code; and anything left half migrated, meaning an old class
still styled but no longer rendered, or a new class rendered but never styled.

The high yield check, wherever styles are centralised, is BIDIRECTIONAL, and
you must list BOTH directions:
  a. every class rendered in source has a matching rule
  b. every non trivial rule is actually rendered somewhere
One direction alone finds about half the rot.

Also report the size of the stylesheet and whether anything obvious in it is
wasted.`],

  ['content', '05', `# Lens 5: content and data

YOUR SCOPE: content, data and imagery. All four jobs are quantitative. A
sentence of impression is not a finding here.

1. INVENTORY CREDIBILITY. Exact counts per category and per axis. A category
   with one thin entry and no dates looks broken in a demo even though nothing
   is technically broken. Report the counts, then say which look thin.
2. ASSET UTILISATION. Which supplied photographs are used, which are not, and
   which entities are rendering a generated fallback instead of a real image.
3. COPY DEFECTS. Placeholder text, lorem, TODO, invented filler, repeated
   sentences, and statements that contradict each other between two screens.
   Check for em dashes and en dashes in the RENDERED HTML by fetching pages and
   grepping, not in the source, because the rendered output is where the rule
   actually applies.
4. TEMPORAL VALIDITY. Every seeded date genuinely in the future, nothing
   rendering as an invalid date, nothing that will read as stale next week.`],
]

const RANK = `# The rank phase

You are the tech lead. ${LENSES.length} auditors worked in parallel and DID NOT
talk to each other. Paste their results below the marker before running this.

Independent agreement between sealed lenses is evidence. An echo is not.

--- DIGEST START ---
{{DIGEST}}
--- DIGEST END ---

Your duties, in order:

1. DEDUPE. The same defect will have been found by two or three lenses under
   different names. Merge those into one entry and SAY WHICH LENSES SAW IT.

2. VERIFY THE CLAIMS THAT MATTER. For anything marked broken, check it against
   the actual source at ${repo} before you keep it. Auditors describing a tree
   from memory get things wrong. Drop or downgrade anything you cannot confirm,
   and say that you did. This step is the reason the output is trustworthy, and
   it is the step people skip.

3. RANK by real user impact for this audience, not by how easy the fix is.
   Something that stops a user completing the main action outranks a contrast
   nit, even though the contrast nit is a one line change.

4. PER ITEM: a one line title, the file and line, the exact fix, and whether it
   risks breaking any of the ${tests} existing tests.

5. SEPARATELY list WHAT IS PENDING rather than broken: work that was started
   and not finished, and work that was promised and never done. That is a
   different deliverable and it gets lost when it is mixed in.

6. END with the three things you would fix first, and why.

Keep the wire format and the document format identical, so the digest and the
artefact are the same shape:

    [severity] where
      WHAT: ...
      FIX: ...

Output one markdown document. No em dashes or en dashes.`

/* ------------------------------------------------------------------- write */

const selected = onlyLenses.length ? LENSES.filter(l => onlyLenses.includes(l[0])) : LENSES

mkdirSync(outDir, { recursive: true })
const written = []
const put = (name, body) => { writeFileSync(join(outDir, name), body); written.push(name) }

put('00-context.md', CONTEXT)
put('schema.json', JSON.stringify(SCHEMA, null, 2) + '\n')
for (const [id, num, body] of selected) put(`${num}-${id}.md`, `${CONTEXT}\n---\n\n${body}\n`)
put('06-rank.md', RANK)

put('orchestrate.mjs', `// Optional driver, for agents that expose agent() and parallel() to a script.
// If yours does not, follow README.md instead: the prompts are plain files and
// work perfectly well handed to five subagents in sequence.
//
// This is not a standalone node program. The host supplies agent(), parallel()
// and the top level return, so \`node orchestrate.mjs\` will refuse it.

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DIR = ${JSON.stringify(outDir)}
const read = (f) => readFileSync(join(DIR, f), 'utf8')
const schema = JSON.parse(read('schema.json'))
const lensFiles = readdirSync(DIR).filter(f => /^0[1-5]-.+\\.md$/.test(f)).sort()

const results = await parallel(lensFiles.map(f => () =>
  agent(read(f), { label: f.replace(/^\\d+-|\\.md$/g, ''), schema, effort: 'high' })
))

const digest = results.map((r, i) => {
  if (!r) return ''
  const name = lensFiles[i].replace(/^\\d+-|\\.md$/g, '').toUpperCase()
  const clean = (r.cleanAreas || []).join('; ')
  const items = (r.findings || [])
    .map(f => \`[\${f.severity}] \${f.where}\\n  WHAT: \${f.what}\\n  FIX: \${f.fix}\`).join('\\n')
  return \`\\n\\n===== \${name} =====\\nCLEAN: \${clean}\\n\${items}\`
}).join('')

return { ranked: await agent(read('06-rank.md').replace('{{DIGEST}}', digest), { label: 'rank', effort: 'high' }) }
`)

put('README.md', `# The audit, generated for this project

Six agents. Five sealed lenses in parallel, then one ranker that re verifies
every broken claim against the source before keeping it.

Generated from:
  repo    ${repo}
  base    ${base}
  routes  ${routes.join(' ')}
  widths  ${widths}
  themes  ${themes}
  tests   ${tests}

## Run it, three ways

**With an orchestrator.** If your agent can execute a script that calls
agent() and parallel(), run orchestrate.mjs.

**With subagents, no orchestrator.** Start five subagents and give each one the
whole contents of its numbered file. Tell them not to talk to each other, which
is the entire point: two lenses reporting the same defect independently is
corroboration, and lenses that compare notes produce an echo instead. Collect
the five results into the digest format below, paste it into 06-rank.md in
place of {{DIGEST}}, and run that as a sixth agent.

**By hand, one at a time.** The lenses are independent, so run them one per
session over a morning. Sealed is the requirement, parallel is only the
convenience.

## The digest format

The wire format and the document format are the same shape on purpose.

    ===== FLOWS =====
    CLEAN: sign in, empty states
    [broken] /events, card grid
      WHAT: ...
      FIX: ...

## What to do with the output

Fix in ranked order. Then add a grep gate to the test suite for whatever the
audit found, so each defect class can only ever be discovered once. An audit
finds what already happened. Gates are what stop it happening again, and the
pro skill ships two of them: scripts/token-gate.mjs and
scripts/contrast-fixture.mjs.
`)

console.log(`\nWrote ${written.length} files to ${outDir}\n`)
for (const w of written.sort()) console.log(`  ${w}`)
console.log(`\nNext: open ${join(outDir, 'README.md')}. Nothing runs until you start it.\n`)
