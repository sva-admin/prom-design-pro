# The loop: brief to shipped

Read this before starting a project, and again at each gate. The free
prom-design skill states the loop in one paragraph per step. This file is the
operator's version: what each step produces, what the gate actually asks, and
which specific failure each gate is standing in front of.

The gates are the whole method. A studio that skips the brief and audits at the
end spends its budget on rework. A studio that keeps every gate produces work
that survives a customer preview, which is the only test that matters.

## Contents

1. The loop at a glance
2. Step 1, the brief
3. Step 2, the design contract
4. Step 3, build order
5. Step 4, the localhost review gate
6. Step 5, critique in the house vocabulary
7. Step 6, the multi lens audit
8. Step 7, ship and verify live
9. The gates as CI
10. How the loop itself fails

---

## 1. The loop at a glance

| Step | Gate | Artefact | The failure it prevents |
|---|---|---|---|
| Brief | Say the plan before building it | Half a page, out loud | Building the wrong register for two days |
| Design contract | No component until tokens exist | A token file | Retrofitting a type scale across forty files |
| Build | One vertical slice before breadth | One route, finished | Forty half finished routes |
| Review gate | Localhost link, never a push | Three widths, looked at | A hero that silently fails on a phone |
| Critique | Name your own defects first | A list, in the house words | Being handed the list by the client |
| Audit | Five sealed lenses, then verify | A ranked document | Shipping a broken flow to a preview |
| Ship | Load the real domain on a phone | A confirmed live URL | Deployed and still wrong |

Every gate is cheap and every one of them is skipped for the same reason: it
feels like delay when the work seems fine. It seems fine because nobody has
looked yet.

---

## 2. Step 1, the brief

Nothing is written until the brief is said out loud and agreed. This is the
cheapest possible place to catch a wrong direction, and the standing house
instruction is to explain how you will do it first.

### The eight questions

1. **Which register.** Cinematic or instrument. If the honest answer is both,
   say so, and plan two registers under one token system rather than a
   compromise between them.
2. **Who is the user, in one sentence,** and are they deciding whether to care
   or trying to get something done. This is the same question as the register,
   asked from the other side, and the two answers must match.
3. **What is the one action.** Not the three actions. If a screen has two
   primary actions it has none.
4. **What does the brand already own.** A logo, a font licence, a folder of
   photographs, a printed brochure, an existing site. Client assets arrive as a
   document or a folder far more often than as a brand guide, so extract the
   real brand from what exists instead of inventing one that has to be defended
   later.
5. **What is the proof.** For every claim the page will make, what makes a
   sceptic believe it. If there is no answer, the claim is not ready to be on
   the page. This question is what separates the style from luxury pastiche.
6. **What are the three benchmarks.** Name three real products that solve a
   similar interaction problem well, say in one sentence each what they get
   right mechanically, and then state what this project will do differently and
   why the brand demands it. Take the mechanism, never the skin.
7. **What is out of scope.** Written down, because scope arrives quietly.
8. **What is the review path.** Who sees it, on what device, and when. A client
   who will open it on a phone in a car changes the build.

### The brief template

```
REGISTER      cinematic | instrument | both, as two registers
USER          one sentence
ONE ACTION    the single thing this surface exists to cause
BRAND OWNS    logo / fonts / photography / documents / existing site
PROOF         claim -> the evidence that will sit next to it
BENCHMARKS    three products, what each gets right, what we do differently
OUT OF SCOPE  ...
REVIEW        who, on what device, by when
UNKNOWNS      the things we are guessing at, listed as guesses
```

The UNKNOWNS line matters more than it looks. Writing "we are guessing the
audience skews mobile" turns an assumption into something a client can correct
in thirty seconds, which is the cheapest correction available anywhere in the
loop.

**The gate: say the plan before building it.** Not a document, not ceremony.
A short spoken or written statement of the register, the one action, and the
first slice, agreed before a file exists.

---

## 3. Step 2, the design contract

Lock the decisions before components exist. Retrofitting a type scale across
forty files is how a week disappears, and the retrofit is never clean because
by then some of those forty files depend on the old scale by accident.

### What a contract answers

A contract is not a palette. It answers seven questions, in this order, and
each answer is a token:

1. **What is the ground and what is the ink.** Never white, never black.
2. **What is the one accent, and what is its darker sibling for text.** The
   accent almost always fails contrast as type. Budget for the sibling now
   rather than discovering it in a review.
3. **What are the lines.** Drawn from the brand hue at low alpha, and at least
   two steps so a border can express hierarchy.
4. **What are the type roles.** One display face, one working sans, at most one
   script used once per page. Then the scale, with its deliberate empty middle.
5. **What is the spacing base and the section rhythm.**
6. **What is the elevation family and the one easing curve.**
7. **What is the app chrome,** if there is any: header, tab bar and action bar
   heights, as tokens, because every scroll container and safe area calculation
   has to reference the same numbers.

Both proven answers, at full depth with the reasoning, are in
`tokens-deep.md`, and the two runnable reference implementations are
`assets/tokens-cinematic.css` and `assets/tokens-instrument.css`.

### Locking it

The contract is only real if it is enforced. Two lines in CI:

```bash
node scripts/token-gate.mjs --src src --tokens tokens
node scripts/contrast-fixture.mjs src/tokens/tokens.css --text ink,ink-2 --surface paper,paper-2
```

The first fails the build on a raw colour, a bare z-index, or a dash outside
the token files. The second measures every text token on every surface token
and fails below 4.5:1. Together they are the difference between a token file
that is the source of truth and a token file that is documentation.

**The gate: no component exists until the token file does.** A component
written first will contain values, and those values will still be there in
production.

---

## 4. Step 3, build order

Build order is a quality decision, not a scheduling one.

1. **Tokens.** The contract from step 2, as a real file, with the gates wired.
2. **Primitives.** The dozen classes every page shares: the shell, the band,
   the eyebrow, the one button, the reveal. Ten minutes here saves an
   inconsistency in every later file.
3. **One vertical slice, finished.** One route, end to end, with real copy,
   real images, real data, at all three widths. Not a skeleton of six routes.
   The first finished route is where every unresolved decision surfaces, and it
   surfaces once instead of six times.
4. **Show the slice.** Review gate, step 4. This is the correction point. A
   direction change here costs an hour. The same change after six routes costs
   a day.
5. **Breadth.** The remaining routes, now that the pattern is settled.
6. **Content pass.** Copy is part of the design, not a later pass, but there is
   always a final sweep where placeholder survivors are found. Placeholder
   content is a design defect, not a content to do: lorem ipsum hides exactly
   the specificity this style depends on.

Two build rules that are always worth the friction:

- **Photography is not optional.** Zero images is a bug, not restraint. The
  usual failure is a beautiful image with the wrong context, which reads as
  stock and undoes the honesty the rest of the page is buying.
- **Every interactive thing announces itself in words.** A control that only
  reveals itself on hover does not exist on a phone. This is the most repeated
  correction in the entire project history, so treat it as the sorest point in
  the house.

---

## 5. Step 4, the localhost review gate

**Never push to show work.** Put it on localhost, hand over the link, and
verify it yourself before claiming it works.

Verify at **375px, 768px and 1280px**, and look at the images rather than
trusting that the CSS is correct. The reason this is a rule rather than a
suggestion is a specific and repeated failure: a hero silently failing on
mobile while the desktop view looked perfect, discovered by the client.

The free prom-design skill ships `scripts/shots.mjs`, which captures every
route at the three widths and reports HTTP status, scroll height in screens,
horizontal overflow, broken images, rendered dashes and console errors in one
command. Use it, then look at the PNGs. The report tells you where to look. It
cannot tell you whether the page is good.

### The handover checklist

Before sending the link:

- [ ] Every route loads with a 200 and no console errors.
- [ ] Three widths, looked at, not just measured.
- [ ] Zero placeholder strings and zero placeholder images.
- [ ] Every claim on the page has its proof beside it.
- [ ] Every draggable, swipeable or expandable thing says so in words.
- [ ] Scroll height inside budget on mobile, if the register is instrument.
- [ ] Nothing hides behind fixed chrome at the bottom of any scroll container.
- [ ] The one action is obvious within two seconds on the narrowest width.

Send the link with the two or three things you are unsure about named
explicitly. A review that starts with your own list is a conversation. A review
that starts with theirs is a defence.

---

## 6. Step 5, critique in the house vocabulary

Work is reviewed with a small, consistent set of words. Each one is a named
defect class, and the point of the vocabulary is that you can check for them
yourself before presenting. Finding your own faults is much cheaper than being
handed them.

| The word | What it usually means | The check |
|---|---|---|
| cluttered | Too many competing weights in one region | Count the elements asking for attention. More than three is the defect. |
| chopped off | Clipping at a width you did not test | Look at 320px, not just 375px. |
| out of place | A borrowed component still wearing its own skin | Does every value bind to a token. |
| odd | A spacing or ratio that is nearly right | Check it against the scale. Odd usually means off scale. |
| over complicated | A mechanism where a sentence would do | Can the user say what this does without trying it. |
| too generic | The palette and type are guessable from the category | Run the benchmark and diverge step again. |
| ai slop | Purple gradient, emoji grid, promises without proof | Every claim has evidence beside it. |
| negative empty space | Cinematic rhythm applied to an instrument | Measure screens at 375px. |
| too much scrolling | The payload is below the fold | Is the thing they came for visible without scrolling. |
| irrelevant | Content that exists because the template had a slot | Name the reason this section exists. If you cannot, delete it. |
| not seamless | Inconsistent navigation, a jump between pages | Is the chrome identical on every page. |

The two that carry the most weight are **too generic** and **not seamless**,
because both are structural. The rest are usually one commit.

---

## 7. Step 6, the multi lens audit

Before any customer preview, the question is always some version of "check and
verify, no loose ends". One reviewer misses what a panel catches, but a panel
that is not reconciled produces noise, and noise costs more time than it saves.

The shape that solves both, plus the five lens prompts and the ranker, is in
`audit-harness.md`. `scripts/design-audit.mjs` generates the whole thing with
your paths, port, routes, priors and sign in recipe filled in.

Two things about placement in the loop. **Run it after the review gate, not
instead of it.** An audit is expensive and it should not be spending its budget
on defects a screenshot would have shown. And **run it before the client sees
it, not after the client complains**, which sounds obvious and is the single
most common scheduling mistake.

---

## 8. Step 7, ship and verify live

Deployed is not done.

Load the real domain on a real phone viewport and confirm the specific thing
you fixed is actually fixed in production. Deploys serve stale assets, caches
lie, and a green pipeline says the build succeeded, not that the page is right.

Three checks that have each caught a live regression:

1. **Load the fixed thing, not the home page.** Deep link straight to it.
2. **Hard reload once, then a normal reload.** If only the hard reload is
   correct, you have a caching problem in front of your users right now.
3. **Check the document cache header.** Some browsers heuristically cache page
   HTML, so a phone can serve a week old page and its stale script URLs for
   days after a green deploy. Revalidating a small document is cheap.

---

## 9. The gates as CI

An audit finds what has already happened. Gates stop it recurring, and they
cost a second each.

| Gate | What it catches | Ships in this skill |
|---|---|---|
| Token gate | Raw colours, bare z-index, dashes outside the token files | `scripts/token-gate.mjs` |
| Contrast fixture | Text tokens that fail on a surface, borders invisible on a surface | `scripts/contrast-fixture.mjs` |
| Copy gate | Dashes and banned words in user facing strings, strings bypassing the translation function | The dash rule in `token-gate.mjs`, plus a project specific rule for the translation function |
| Regression greps | Whatever the last audit found | Write one per audit finding |

The regression grep is the highest value habit in this list and the least
glamorous. After every audit, add a test that greps for the defect class the
audit just found. Each class then gets discovered exactly once in the life of
the project.

---

## 10. How the loop itself fails

Four failure modes, all of them observed.

**The brief gets skipped because the answer seems obvious.** It usually is
obvious, and the twenty percent of the time it is not costs two days. Say it
anyway; it takes ninety seconds.

**The contract is written and then ignored.** A token file that components
bypass is worse than no token file, because it reports that the system is
healthy while the drift happens elsewhere. This is why the gate is mechanical.

**Breadth before the first finished slice.** Six routes at eighty percent look
like progress and are the most expensive state a project can be in, because
every unresolved decision now exists in six places.

**The audit runs, and then nothing is ranked.** An unranked list of forty
findings gets triaged by whoever picks it up, which means the contrast nits get
fixed and the broken booking flow ships. The rank phase is not formatting, it
is falsification plus prioritisation, and it is the part that makes the rest
worth running.
