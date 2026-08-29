# The audit harness

Read this before any customer preview. `scripts/design-audit.mjs` generates the
whole thing for one project in a second, and this file is why it is shaped the
way it is, so you can adapt it without breaking the parts that make it work.

Six agents. Five sealed lenses in parallel, then one ranker that re verifies
every broken claim against the source before keeping it.

## Contents

1. The five principles
2. The shared brief, annotated
3. The finding schema
4. Lens 1, flows
5. Lens 2, visual
6. Lens 3, contrast
7. Lens 4, code
8. Lens 5, content and data
9. The rank phase
10. Running it without an orchestrator
11. Reading the output
12. Cost and when not to run it

---

## 1. The five principles

If you adapt the harness, keep these. Everything else is detail.

**Parallel and sealed, then reconciled.** Lenses never see each other's output.
That way, when two lenses independently report the same defect, the agreement
is real corroboration rather than an echo. The ranker is the only agent that
sees everything. A panel that compares notes converges on one opinion held five
times, which is exactly the failure a panel exists to avoid.

**Rank is falsification, not formatting.** The ranker re checks every broken
claim against the actual source and drops or downgrades what it cannot confirm.
The justifying line is worth memorising: auditors describing a tree from memory
get things wrong. An audit that only formats findings will confidently hand you
things that are not true, and chasing a finding that was never real costs more
than the finding would have.

**Supply the priors.** Tell each lens what probably went wrong. "This codebase
just went through a rapid redesign; a bottom tab bar, a segmented nav, a first
run tour and filter chips all landed fast; things will have been left half
finished. Assume nothing is fine because it looks fine." That converts a vague
sweep into a hunt, and a hunt finds things.

**Give each lens a different instrument.** Driving the browser, reading
screenshots, sampling pixels, reading source statically, reading the seed data.
Same schema, five different ways of knowing. Five agents with the same
instrument produce one opinion five times, which is the same failure as an
unsealed panel arriving by a different road.

**Let severity encode the business.** `broken` outranks `polish` because the
run exists to win a deal, and the ranker is told so in those words. Severity
that does not encode what is at stake produces a list ordered by how easy
things are to fix.

---

## 2. The shared brief, annotated

Five things, in this order, in the context block every lens receives.

**1. What the product is and what is commercially at stake.** An auditor cannot
rank by impact without knowing what impact means here. "This goes in front of a
prospective client on Thursday" changes what counts as severe.

**2. The architecture in one paragraph.** Naming "server rendered, no build
step, no client framework, all CSS inlined from one file" lets an auditor make
categorical claims instead of hedged ones. Without it you get "there may be a
hydration issue" from a product that does not hydrate.

**3. Where the law lives.** Absolute paths to the design source of truth and
the repo rules. A lens that has to guess the rules audits against its own
taste, and its own taste is not what you are paying for.

**4. The prior that primes suspicion,** naming the components that shipped most
recently. Recency is the single best predictor of half finished work.

**5. Tooling with the gotchas pre solved.** This is the part most audits omit
and it is why they stall. Include the exact local URL and port, how to locate
the browser driver, how to skip or trigger the first run tour and whether that
state lives in local storage or a cookie, how to set the theme, and a working
sign in recipe with real selectors. An agent that spends forty percent of its
budget working out how to log in has forty percent less budget for finding
defects.

Then the rules paragraph, which is worth lifting close to verbatim:

> Every finding must name the route, the exact selector or `file:line`, the
> MEASURED evidence (a number, a status code, a console error, a screenshot
> observation), and a concrete fix. No speculation, no "might be", no padding.
> If your area is clean, say so in one line. Never use em dashes or en dashes.
> Your output is raw material for a fixer, not prose for a human.

Four separable rules live in that paragraph, and each one removes a specific
kind of waste:

- Location plus measurement plus fix, or it is not a finding. This alone
  removes most of the volume, and all of the useless volume.
- Hedges are banned. "Might be" is a finding that has not been checked, and it
  transfers the checking to you.
- A clean area is a one line result, not silence. Silence is ambiguous between
  "clean" and "did not look".
- The output is machine feedstock, so narrative filler is a defect. Auditors
  left to write prose will write an essay with three findings in it.

---

## 3. The finding schema

```json
{
  "type": "object",
  "properties": {
    "findings": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "severity": { "type": "string", "description": "broken | half-finished | risk | polish" },
          "where":    { "type": "string", "description": "route and/or file:line" },
          "what":     { "type": "string", "description": "the defect, with the measured evidence" },
          "fix":      { "type": "string", "description": "the concrete change" }
        },
        "required": ["severity", "where", "what", "fix"]
      }
    },
    "cleanAreas": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["findings", "cleanAreas"]
}
```

Two choices in there are load bearing.

**The severity vocabulary is product shaped, and `half-finished` is the point.**
It catches work that no pass or fail test can see because nothing throws: a
class that is styled but no longer rendered, a filter that renders but filters
nothing, a tour step that was never written. Those are invisible to a test
suite and obvious to a customer.

**`cleanAreas` is required.** Forcing each lens to state its negative space is
what lets the ranker distinguish "nobody looked" from "somebody looked and it
was fine". Without it, an empty section of the report is unreadable.

---

## 4. Lens 1, flows

Scope: functional QA by driving the product. Find what is broken, not what is
ugly. Someone else owns ugly, and a lens that drifts into taste stops driving.

Four coverage patterns, each of which generalises to any product:

**State transition.** The whole journey signed out, then the same journey
signed in. Half finished work hides in exactly one of the two states, and
whichever one the builder used most is the one that works.

**Dismissal.** Everything that opens must close three ways: by its own control,
by Escape or Close, and by browser Back. The third is the one that fails, and
it fails on phones, where Back is the gesture people actually use.

**Boundary.** Empty, valid, and one over the limit. If a field caps at 100
characters, send 101. Confirm the error renders on the right field or the right
step, not at the top of a page the user has already scrolled past.

**Console capture as a standing tax.** Record console and page errors on every
single navigation and report all of them, including the ones that look
harmless. A 404 on a font file is a finding: it is the reason the page renders
in a fallback face on a cold cache.

---

## 5. Lens 2, visual

Scope: visual regression at three widths, in every theme.

Screenshot every route, then **read the images**. A lens that does not look at
its own screenshots reports nothing, and this is the most common way this lens
quietly fails: it produces a confident report assembled from the DOM.

Enumerate routes explicitly, covering each page archetype plus filtered and
unfiltered states. "All routes" gets interpreted as "the three I thought of".

The defect vocabulary to hand it: overlapping elements, clipped text, broken
spacing, orphaned headings, empty containers, elements that render with no
content, duplicated content on one page, sections that look unfinished, images
at the wrong aspect ratio, and anything that simply reads as a bug to a person
looking at it.

Then bolt on one hard measurement: **report `document.body.scrollHeight`
divided by viewport height per route** at the narrowest width, and flag
anything over budget. That single number turns the taste complaint "too much
scrolling" into something trackable across a project. The budget table is in
`mobile.md` section 1.

---

## 6. Lens 3, contrast

The most transferable idea in the whole method:

> Compute real contrast by sampling the rendered pixels rather than trusting
> computed styles, because much of this product sets text over photographs
> where the CSS background is transparent.

Report anything under 4.5:1, or under 3:1 at 24px and above, naming the element
and the measured ratio. Never present an estimated ratio as a measurement, and
be explicit that an estimate is a hallucination risk here rather than a
shortcut.

Walk every theme. Supply the prior if one theme was retuned late, because a
late retune is where the failures cluster. Name the surfaces that must not be
skipped: the bottom bar, the header and account menu, the first run tour, every
pill and chip, disabled states, placeholder text, and anything over an image.

Cross check statically as well: grep the stylesheet for colour literals outside
the token definitions and check each renders acceptably.

**Run the token half first.** `scripts/contrast-fixture.mjs` measures every
text token on every surface token in under a second and fails the build below
4.5:1. That is the cheap half, and it means this lens can spend its whole
budget on what a fixture cannot see: text over imagery, states that only exist
at runtime, and the theme that was retuned on Friday.

---

## 7. Lens 4, code

Scope: code health. Read the source, do not drive the browser. Every finding
carries `file:line`.

Hunt dead components, props, helpers and CSS classes that nothing uses; near
duplicate rules that should collapse; selectors that can never match; props
threaded through three layers and then ignored; TODOs; commented out code; and
anything left half migrated.

The high yield check, wherever styles are centralised, is **bidirectional**:

1. Every class rendered in source has a matching rule.
2. Every non trivial rule is actually rendered somewhere.

**List both directions.** One direction alone finds about half the rot, and
which half depends on whether the project was recently added to or recently
refactored.

---

## 8. Lens 5, content and data

All four jobs are quantitative. A sentence of impression is not a finding here.

1. **Inventory credibility.** Exact counts per category and per axis. A
   category with one thin entry and no dates looks broken in a demo even though
   nothing is technically broken. This is the finding a purely technical audit
   never produces and a client notices in four seconds.
2. **Asset utilisation.** Which supplied photographs are used, which are not,
   and which entities render a generated fallback instead of a real image. A
   folder of forty client photographs with eleven used is a finding.
3. **Copy defects.** Placeholder, lorem, TODO, invented filler, repeated
   sentences, and statements that contradict each other across two screens.
   Check for em dashes and en dashes **in the rendered HTML**, not the source,
   because rendered output is where the rule applies and where a templating
   layer can reintroduce them.
4. **Temporal validity.** Every seeded date genuinely in the future, nothing
   rendering as an invalid date, nothing that reads as stale next week.

---

## 9. The rank phase

Flatten the five schema'd results into one digest, then give one agent the tech
lead role with this framing: five auditors worked in parallel and did not talk
to each other.

Its six duties, in order:

1. **Dedupe**, merging the same defect found under different names, and record
   which lenses saw it, because independent agreement is evidence worth
   keeping and it should survive into the final document.
2. **Verify what matters.** Check every `broken` claim against the real source
   before keeping it. Drop or downgrade anything unconfirmed and say that you
   did. Saying so is part of the deliverable: it tells the reader which claims
   were checked and which were merely plausible.
3. **Rank by user impact for this audience,** not by ease of fix. Something
   that stops a booking outranks a contrast nit, even though the nit is a one
   line change and the booking bug is an afternoon.
4. **Per item:** a one line title, the file and line, the exact fix, and whether
   it risks breaking existing tests. Naming the real test count in the prompt
   forces the ranker to think about the regression surface rather than treating
   every fix as free.
5. **List what is pending separately from what is broken:** started and not
   finished, or promised and never done. It is a genuinely different
   deliverable, and mixing it in is how it gets lost.
6. **End with the three things to fix first, and why.**

Keep the digest format and the artefact format identical, so the wire format is
the document:

```
[severity] where
  WHAT: ...
  FIX: ...
```

---

## 10. Running it without an orchestrator

The harness does not need a workflow engine. `scripts/design-audit.mjs` writes
plain prompt files, and there are three honest ways to run them.

**With an orchestrator.** If your agent can execute a script that calls
`agent()` and `parallel()`, run the generated `orchestrate.mjs`.

**With subagents, no orchestrator.** Start five subagents, hand each the whole
contents of its numbered file, and tell them not to talk to each other. Collect
the results into the digest format, paste it into the rank prompt in place of
the marker, and run that as a sixth agent.

**By hand, one at a time.** The lenses are genuinely independent, so they can
be run one per session across a morning. Sealed is the requirement. Parallel is
only the convenience.

Whichever path you take, the two rules that must not bend: lenses do not see
each other's output, and the ranker verifies before it keeps.

---

## 11. Reading the output

Work the ranked list top down and resist the urge to start with the easy ones.

Then do the part that compounds: **after every audit, add a grep gate to the
test suite for the defect class it found.** Not for the instance, for the
class. If the audit found one class rendered but never styled, the gate checks
every class. Each defect class then gets discovered exactly once in the life of
the project, and the next audit finds new things instead of the same things.

The two gates in this skill exist because they were written this way:
`token-gate.mjs` is the grep gate for the colour, z-index and dash classes, and
`contrast-fixture.mjs` is the grep gate for the token contrast class.

---

## 12. Cost and when not to run it

Six agents at high effort is not free, and the harness is worth its cost at
exactly one moment: before something is shown to someone whose opinion decides
the outcome.

Do not run it instead of the localhost review gate. Screenshots at three widths
cost almost nothing and catch the obvious half. An audit that spends its budget
on defects a screenshot would have shown is an expensive screenshot.

Do not run it on a half built surface. The prior that makes it effective,
"things will have been left half finished", becomes true of everything, and
every lens returns the same finding in five different accents.

Do run it when the answer to "are you sure there are no loose ends" has to be
yes.
