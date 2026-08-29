---
name: prom-design-pro
description: >
  The operator's edition of the prom-design house style: the full working loop
  and its gates (brief, design contract, build order, localhost review gate,
  multi lens audit, ship), both proven token systems at full depth with the
  reasoning and two runnable gate scripts, and the mobile web app playbook
  (density budget, bottom tab bar spec, compaction passes, coach overlays,
  shadow galleries, component borrowing rules). Examples use two fictional
  brands, AURA Heights and The Assembly.
  Trigger on "full design workflow", "design audit harness", "mobile app
  playbook", "design contract", "token gate", "contrast fixture", "density
  budget", "multi lens audit", "localhost review gate", "bottom tab bar spec",
  "compaction pass", "prom design pro".
  This is the depth layer. The free prom-design skill owns the taste, the
  patterns, the copy and imagery rules, and the screenshot gate, and it is the
  right front door for "make this look expensive". Use this one when the job is
  to run the process, write the contract, enforce the gates, or audit before a
  customer sees it. Not for inventing a fresh visual direction from a blank
  brief: this applies ONE proven aesthetic.
---

# Prom Design Pro

This style shipped real client work. Examples throughout use two fictional
stand in brands, **AURA Heights** (a beachfront residence) and **The Assembly**
(a members events web app), so the rules can be shown at full specificity
without exposing any client. The rules are the transferable part.

**Start with the free edition.** [sva-admin/sv-academy-prom-design](https://github.com/sva-admin/sv-academy-prom-design)
carries the thesis, the two registers, the five laws, the component patterns,
the copy and imagery rules, and `shots.mjs` for the screenshot gate. It is
complete on its own and it is what you want for "make this page look
expensive".

This edition is the layer underneath: the process that produced the style, the
contracts that keep it, and the harness that verifies it before a customer
sees it. The two are designed to be installed together.

## What this skill owns

| Pillar | Read | Ships |
|---|---|---|
| The working loop, gate by gate | `references/loop.md` | The brief and contract templates, the handover checklist, the defect vocabulary as checks |
| The audit harness | `references/audit-harness.md` | `scripts/design-audit.mjs`, which generates six agent prompts for your project |
| The token systems, at depth | `references/tokens-deep.md` | `assets/tokens-cinematic.css`, `assets/tokens-instrument.css`, `scripts/token-gate.mjs`, `scripts/contrast-fixture.mjs` |
| The mobile web app pack | `references/mobile.md` | Density budget, tab bar spec, twelve compaction moves, coach overlay and spotlight, shadow gallery, borrowing rules |

## The loop, and where each gate lives

Seven steps. The gates are the method; skipping them is how projects go wrong.

1. **Brief, out loud, before any file.** Register, user, the one action, what
   the brand already owns, the proof behind every claim, three benchmarks, what
   is out of scope. Gate: say the plan before building it.
2. **Design contract.** Tokens before components, because retrofitting a type
   scale across forty files is how a week disappears. Gate: no component exists
   until the token file does, and the token gate is wired.
3. **Build.** Tokens, then primitives, then one vertical slice finished end to
   end, then breadth. Gate: the first finished route is where every unresolved
   decision surfaces once instead of six times.
4. **The localhost review gate.** Never push to show work. Three widths, looked
   at rather than measured. Gate: the handover checklist in `loop.md`.
5. **Critique in the house vocabulary.** Eleven named defect classes, each with
   a check you can run on yourself before presenting.
6. **The multi lens audit.** Five sealed lenses in parallel, then a ranker that
   verifies every broken claim against the source before keeping it.
7. **Ship, then check the live URL.** Deployed is not done.

Full detail, with the specific failure each gate stands in front of, is in
`references/loop.md`.

## Run the gates

```bash
# The design contract, enforced. Fails on a raw colour, a bare z-index, or a
# dash outside the token files. Zero dependencies, well under a second.
node ~/.claude/skills/prom-design-pro/scripts/token-gate.mjs \
  --src src --src app --tokens tokens,theme

# Every text token on every surface token, measured rather than estimated.
# Exits non zero below 4.5:1, so it belongs in CI.
node ~/.claude/skills/prom-design-pro/scripts/contrast-fixture.mjs \
  src/tokens.css --text ink,ink-2,ink-3 --surface paper,paper-2,card

# Generate the six agent audit with your paths, port, routes and priors filled
# in. Writes .design-audit/ with one prompt file per lens plus a ranker.
node ~/.claude/skills/prom-design-pro/scripts/design-audit.mjs \
  --repo /abs/path/to/source --base http://127.0.0.1:8788 \
  --routes / /events /join --tests 271

# A reference token contract to start from, in either register.
cp ~/.claude/skills/prom-design-pro/assets/tokens-cinematic.css ./src/tokens.css
cp ~/.claude/skills/prom-design-pro/assets/tokens-instrument.css ./src/tokens.css

# Installed as a plugin rather than a plain skill? The files live in the plugin
# cache. Locate them once with:
#   find ~/.claude/plugins -path '*prom-design-pro*' -name token-gate.mjs
```

All three scripts are plain Node with no dependencies and no network access.
The audit generator writes prompt files and nothing else: nothing runs until
you start it.

## The register decision still comes first

Everything downstream depends on it, and it is the free skill's first section
for a reason.

| | **Cinematic** (AURA Heights) | **Instrument** (The Assembly) |
|---|---|---|
| The user is | deciding whether to care | trying to get something done |
| Success is | a feeling, then an enquiry | a completed task, fast |
| Mobile | a smaller cinema | a native feeling app with a tab bar |
| Contract | `assets/tokens-cinematic.css` | `assets/tokens-instrument.css` |
| Then read | `references/tokens-deep.md` section 3 | `references/mobile.md`, all of it |

If the honest answer is both, build two registers under one token system rather
than compromising into a mush.

## House hard rules

- **No em dashes or en dashes anywhere,** in code, copy, comments, or commit
  messages. Use commas, colons, periods, or parentheses. `token-gate.mjs`
  enforces this so it stops being something a human has to remember.
- **No raw hex, `rgb()`, `hsl()`, `oklch()`, or bare `z-index` in a component.**
  Tokens are the only source of truth, and the only version of that rule which
  survives a deadline is the one a machine enforces.
- **Never push to show work.** Localhost link first, verified by you at 375px,
  768px and 1280px.
- **Measure, do not estimate.** Contrast comes from rendered pixels or from the
  fixture. An estimated ratio presented as a measurement is worse than no
  number.
- **Placeholder content is a design defect,** not a content to do. Lorem ipsum
  hides exactly the specificity this style depends on.
- **Anything interactive announces itself in words.** A control that only
  reveals itself on hover does not exist on a phone.
- **Cost gate.** If a step spends money, print the plan and the expected cost
  and get a yes first.

## Where to go next

Read the file that matches the step you are on. They are written to be read one
at a time.

| File | Read it when |
|---|---|
| `references/loop.md` | Starting a project, or standing at any gate |
| `references/tokens-deep.md` | Writing the design contract, or retrofitting tokens onto a codebase that has none |
| `references/mobile.md` | **The register is instrument.** Density budget, tab bar, compaction, coach overlays, shadow galleries, borrowing |
| `references/audit-harness.md` | Preparing for a customer preview |

For the taste itself, the component patterns, the copy voice, the imagery rules
and the screenshot gate, use the free
[prom-design](https://github.com/sva-admin/sv-academy-prom-design) skill
alongside this one.

Two public skills are useful companions and neither is required: `impeccable`
for universal design review, and `design-dna` when a screenshot or reference
image is the input to the contract.
