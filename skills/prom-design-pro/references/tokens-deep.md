# The token systems, at depth

Read this when writing a design contract, before any component exists.

Both systems below were read from what actually shipped rather than what was
planned, and both are provided as runnable files:
`assets/tokens-cinematic.css` and `assets/tokens-instrument.css`. This document
is the reasoning. The files are the implementation. Read them together, because
a rule you understand survives contact with a new brand and a rule you copy
does not.

Example brands throughout: **AURA Heights**, a fictional beachfront residence
in the cinematic register, and **The Assembly**, a fictional members events app
in the instrument register.

## Contents

1. The rule that makes tokens work
2. What a contract must answer
3. System A, cinematic, with reasoning
4. System B, instrument, with reasoning
5. The seven semantic patterns worth stealing
6. The three layer architecture, for larger systems
7. Deriving a dark theme without inventing a second palette
8. The contrast budget, and what to do when the accent fails
9. Build gates
10. Font loading
11. Retrofitting tokens onto a codebase that has none

---

## 1. The rule that makes tokens work

**No raw hex, `rgb()`, `hsl()`, `oklch()`, or bare `z-index` may appear in a
component.** Tokens are not documentation, they are the only source of truth,
and the only version of that rule which survives a deadline is the one a
machine enforces. See section 9.

A token file that components ignore is worse than no token file, because it
reports that the system is healthy while the drift happens somewhere else.

---

## 2. What a contract must answer

Seven questions, in this order. Each answer is a token, and answering them in
this order matters because each one constrains the next.

1. **Ground and ink.** Never white, never black.
2. **The one accent, and its darker sibling for text.**
3. **The lines.** From the brand hue, at least two steps.
4. **The type roles, then the scale.**
5. **Spacing base and section rhythm.**
6. **Elevation family and the one easing curve.**
7. **App chrome heights,** if the product has any.

Anything not on this list is a component decision, not a contract decision, and
putting it in the token file is how token files grow to four hundred entries
that nobody can hold in their head.

---

## 3. System A, cinematic, with reasoning

```css
:root{
  /* ground and ink, never white, never black */
  --ivory:#F7F2E9;   /* page ground */
  --cream:#FDFAF3;   /* raised surface */
  --ink:#40301D;     /* body text, warm brown black */
  --brown:#603813;   /* brand, headings, current location fill */
  --soft:#7A6448;    /* secondary text */

  /* one accent, three weights */
  --gold:#C9A227;      /* the single next action */
  --gold-soft:#D9B351; /* hover, gradients */
  --gold-ink:#8A6A11;  /* gold text on light ground, for contrast */

  /* lines derived from the brand hue, never neutral grey */
  --line:rgba(96,56,19,.16);
  --line-soft:rgba(96,56,19,.09);

  /* three type roles */
  --serif:'Cormorant Garamond',Georgia,serif;   /* display only */
  --sans:'Tenor Sans',system-ui,sans-serif;     /* everything working */
  --script:'Sacramento',cursive;                /* one word, rarely */

  /* one curve for the entire site */
  --ease:cubic-bezier(.23,1,.32,1);
}
```

### Why the ground is tinted

Pure `#FFF` on pure `#000` is the default of something nobody decided, and the
eye reads a tint as intent even when it cannot name the colour. Tint every
neutral a little toward the brand hue.

The effect is larger than it sounds because it compounds: the ground, the
raised surface, the ink, the secondary text and the lines are all pulled the
same direction, so regions of the page with no colour in them still feel warm.
A page that tints only its background and keeps grey text gets none of this.

### Why the lines are the brand hue at low alpha

`rgba(96,56,19,.16)` is the brand brown at sixteen percent, not a grey. This is
most of why the page feels warm in areas that contain nothing but rules and
dividers, and a grey hairline on a warm ground is the single most common tell
that a palette was assembled rather than designed.

Two steps here, three in the instrument system. The number you need is
determined by how much of the interface is made of borders: a marketing page
needs two, a dense app needs three.

### Why `--gold-ink` exists

Measure it rather than believe it. Running the fixture on the shipped file:

```
  pass   --gold-ink  on --ivory   4.54:1
  pass   --soft      on --ivory   5.03:1
  pass   --brown     on --ivory   9.09:1
  pass   --ink       on --ivory  11.35:1

INFORMATIONAL, not enforced
         --gold                   2.17:1   below the text floor
         --gold-soft              1.79:1   below the text floor
```

The accent fails as text by a wide margin, which is normal: an accent is
selected to be seen, and being seen and being legible are different jobs.
`--gold-ink` is the same hue darkened until it clears 4.5:1 on the lighter of
the two grounds. **Budget for the darker sibling at contract time.** Discovering
it during a review means retrofitting a colour into every label that already
shipped.

Note how close 4.54:1 is to the floor. That is deliberate: it is the lightest
value that passes, which keeps it recognisably the accent. Tune to the floor,
then measure, then stop.

### Why one easing curve

`--ease:cubic-bezier(.23,1,.32,1)` on everything. Coherence for free, and it
removes an entire category of small decisions. Everything the visitor operates
settles under 0.7 seconds, content reveals may run to 1.1, and only ambient
motion runs longer.

### The type scale, and the deliberate empty middle

This is the single most transferable idea in the aesthetic, and it is not about
which fonts you pick.

**There are two type worlds and a deliberately empty middle.**

| Role | Value |
|---|---|
| Home h1 | `clamp(38px,5vw,72px)` |
| Home h1 script span | `clamp(50px,6.4vw,96px)` |
| Interior h1 | `clamp(31px,4.4vw,62px)` |
| Section h2 | `clamp(32px,4.4vw,60px)` |
| Lede | `clamp(17px,1.5vw,21px)` |
| Body | `15px` fixed |

The micro world, in the letterspaced sans, lives entirely at 7.5, 8, 8.5, 9,
9.5, 10, 10.5, 11, 11.5 and 12px.

Now notice the holes. **Nothing exists between 12px and 15px, and nothing
between 21px and 30px.** That absence is what produces the couture feel. A page
whose type sizes form a smooth continuum reads as a document. A page with two
separated worlds reads as designed. When you feel the need for a 13px label or
a 26px subhead, you are filling in the gap that makes it work.

Two constraints travel with the scale:

```css
h2      { max-width: 22ch }       /* display lines stay short */
.lede   { max-width: 58ch }
h2 .script { font-size: 1.28em }  /* scales with its host clamp, no own clamp */
```

The script span carrying `em` rather than its own `clamp()` is a small thing
that prevents a real bug: two independent clamps drift apart at intermediate
viewports, so the script word is proportionally correct at 390px and 1440px and
wrong at 900px.

### The letterspacing rule, counted

| Value | Uses | Where |
|---|---|---|
| `.02` to `.06em` | about 35 | Serif display, only ever this tight |
| `.2em` | 30 | Captions, legal |
| `.24em` | 33 | Nav links, pill labels |
| `.26em` and `.28em` | 44 | Waypoints, chips, tabs |
| `.3em` | 58 | Generic uppercase micro labels |
| `.34em` | 31 | Nav wordmark, form labels |
| `.42em` | 18 | Section eyebrows |
| `.5em` and `.52em` | 25 | Hero eyebrow, tracked wordmarks |

**Serif display gets 0.02 to 0.06em. Sans micro labels get 0.2 to 0.52em.
Nothing sits in between.** The same principle as the size scale: two worlds, no
blend. A 0.1em tracked label is the letterspacing equivalent of a 13px subhead.

One detail worth copying: a heavily tracked wordmark carries `text-indent`
equal to its tracking (`letter-spacing:.34em; text-indent:.34em`) so the
trailing letter space does not push the mark visually off centre. Without it
every centred wordmark in the system sits a few pixels left.

### Radii, shadows, motion, counted

**Radii.** 51 uses of `999px` (every pill, chip, badge, tag), 32 of `50%`
(dots, knobs, thumbs). Media frames sit at 26, 22, 20 or 18px depending on
size, and **phones drop one step**, so an 18px tile becomes 14px, because the
same radius reads heavier on a small screen.

**Shadows.** Two do almost all the work:

```css
/* a border pretending to be a shadow, so it can animate */
box-shadow: 0 1px 0 var(--line-soft);
/* the panel lift */
box-shadow: 0 26px 64px rgba(28,16,6,.18);
```

The family rule: **blur is 3 to 4 times the Y offset, alpha never above .35 on
light grounds, and the colour is the warm brown black, never `#000`.** A pure
black shadow on a warm ground renders as grey haze and is the second most
common palette tell after the grey hairline. Dark bands need a deeper drop,
around `rgba(20,12,4,.5)`.

Two structural uses worth stealing: a focus ring as `0 0 0 2px var(--gold-soft)`
so it follows the border radius for free, and a current page marker as
`inset 0 -1px 0 var(--gold-soft)` rather than a border, so it does not change
the element's box.

**Motion.** 0.25s for small buttons, 0.5s for nav and pills, 0.55s for a slide
over, 1.1s for content reveals. Image hover uses **inverted zoom**: rest at
`scale(1.04)` and relax to `1.00` over 1.2 to 1.4s. It feels like settling
rather than lunging, and it makes an edge gap structurally impossible.

---

## 4. System B, instrument, with reasoning

```css
:root{
  /* surfaces */
  --paper:#FFFFFF; --paper-2:#F3EEE3; --surface-2:#E9E2D2; --card:#FFFFFF;

  /* a three step line ramp, so borders can express hierarchy */
  --line:#E2DCCB; --line-mid:#C9C2AE; --line-strong:#8E897A;

  /* ink ramp, green tinted near black */
  --ink:#141A18; --ink-2:#4A5250; --ink-3:#63625A;

  /* action colour is called signal, not primary */
  --signal:#000000; --signal-hover:#1E241F;
  --signal-wash:#E7F2EF; --signal-ink:#E1FECC;

  /* state as tokens, this is the good bit */
  --few:#8F5500;    /* few places left */
  --full:#5B6360;   /* sold out */
  --error:#A81E14;

  /* elevation as ring plus shadow */
  --lift-1:0 0 0 1px rgba(20,26,24,.08),0 1px 2px rgba(20,26,24,.05);
  --lift-2:0 0 0 1px rgba(20,26,24,.05),0 6px 16px rgba(20,26,24,.10);
  --lift-3:0 12px 32px rgba(20,26,24,.16);

  /* radius by ROLE, not by size */
  --r-control:10px; --r-media:14px; --r-sheet:20px; --r-commit:999px;

  /* named z ladder, no raw z-index anywhere */
  --z-bar:45; --z-scrim:48; --z-header:50; --z-menu:52; --z-viewer:60;

  /* semantic type scale */
  --t-micro:.8125rem; --t-meta:.875rem; --t-body:1rem; --t-lede:1.125rem;
  --t-card:1rem; --t-sec:1.375rem; --t-h1:2rem;
  --t-hero:min(4.9vw + 1.5rem,4.25rem);

  /* spacing, 4px base */
  --s1:4px;  --s2:8px;  --s3:12px; --s4:16px; --s5:24px; --s6:32px;
  --s7:48px; --s8:64px; --s9:96px; --s10:144px; --s11:200px;

  /* layout */
  --pad:clamp(20px,4vw,32px); --shell:1240px; --measure:62ch;
  --band:clamp(32px,6vw,96px);

  /* app chrome, this is what makes it feel native */
  --header-h:52px; --tabbar-h:58px; --actionbar-h:68px;

  /* one face for Thai and Latin */
  --ui:'LINE Seed Sans TH',system-ui,-apple-system,'Segoe UI',Roboto,'Noto Sans Thai',sans-serif;
}
```

### Why white paper here and not in the cinematic register

A dense list of cards on a tinted ground turns muddy, because every card edge
now separates two warm surfaces instead of one warm surface and one white one.
So the tint moves into the **ink** instead: a green tinted near black carries
the brand through a screen that is mostly text. Same principle, opposite
implementation, decided by density.

### Why three line steps

An instrument is mostly borders. With one line token every division reads as
equally important and the screen flattens into a grid of boxes. Three steps let
a border say "these belong together" (`--line`), "these are separate things"
(`--line-mid`), and "this is the edge of a region" (`--line-strong`).

There is a trap here that the fixture finds. Running it on the shipped file:

```
LINE CHECK  a border within 1.08:1 of a surface is invisible on it
  note   --line on --surface-2 is 1.061:1. Do not pair them; use the next line step.
```

That is correct and it is exactly the bug class to design against. `--line` is
the inside-a-card border and cards are white, so the pair never occurs in
practice. But the moment somebody puts a card on the recessed band without
changing its border, the border vanishes and the failure looks like a rendering
bug rather than a token bug. **Keep every border value deliberately unequal to
every surface value, and check it mechanically**, because a token file cannot
show you this by being read.

### Why the action colour is called signal

"Primary" invites a "secondary", which invites a "tertiary", and within a month
there are four button colours and no hierarchy. "Signal" has no plural. There
is one signal on a screen and it is the thing to do next.

The triad around it: `--signal` for the fill, `--signal-wash` for the tinted
background behind a selected state, `--signal-ink` for text that sits on the
signal. Measured, `--signal-ink` on `--signal` is 19.25:1, and `--signal-ink`
on white is 1.09:1, which is the correct answer to a question nobody should
ask: that token only ever appears on the signal.

### Why state is a token

`--few` and `--full` are not colours. They are product facts that happen to
have a colour. Naming them this way means the scarcity rule lives in exactly
one place, and nobody can reach for "the orange" to decorate something that is
not scarcity.

The test for whether a token is named correctly: **can you change the hex
without changing the name?** `--few` survives a rebrand. `--orange` does not.

Every state token is a text colour, so every one has to clear 4.5:1 on every
surface it can land on, including the recessed band. That constraint is why the
system's success green is a step darker than the wellness category green: the
category value is tuned for its own pale wash, the state value has to survive
the darkest surface in the system.

### Category triads

```css
--cat-sailing:#0E63A8;  --cat-sailing-wash:#E7F0F8;  --cat-sailing-beacon:#5AB0EE;
--cat-dining:#B3341F;   --cat-dining-wash:#F9EBE7;   --cat-dining-beacon:#F4785C;
--cat-wellness:#0F7A62; --cat-wellness-wash:#E6F2EE; --cat-wellness-beacon:#3FC6A0;
--cat-sport:#3C3F96;    --cat-sport-wash:#EAEBF6;    --cat-sport-beacon:#8B92F0;
--cat-art:#6B3AA0;      --cat-art-wash:#F1EAF7;      --cat-art-beacon:#C089F0;
```

`base` for text and icons, `wash` for the chip background, `beacon` for the
bright dot or highlight that has to survive on a photograph. The beacon exists
because a category colour tuned for text on white disappears the moment it
lands on a dark image, and that problem is better solved once in the token
layer than five times in components.

Every category gets all three or none. Adding a category means adding three
tokens, and that friction is deliberate: it is what stops a taxonomy quietly
growing to nineteen entries.

Measured, every base clears 4.5:1 on its own wash, between 4.60:1 and 7.56:1.
The tightest is the wellness green, which is a useful thing to know before
somebody proposes a lighter wash.

---

## 5. The seven semantic patterns worth stealing

These generalise far beyond these two projects, and they are the real lesson of
the token files. Each is stated with the failure it prevents, because that is
the part that transfers.

**1. Radius by role, not size.** `--r-control` for buttons and inputs,
`--r-media` for images, `--r-sheet` for modals and drawers, `--r-commit` for
the pill that commits an action. When a designer asks "is this a `--r-md` or a
`--r-lg`?" the answer is a coin flip and the system drifts. When they ask "is
this a control or a sheet?" the answer is obvious and the system holds as it
grows.

**2. State as a token, named for the product fact.** Prevents the scarcity
colour being borrowed for a promotion badge, after which the scarcity signal
means nothing.

**3. Elevation as ring plus shadow.** `0 0 0 1px rgba(...)` combined with a
soft drop reads crisp on both light and dark surfaces, where a plain box shadow
goes muddy on dark. Three steps is enough. Prevents the dark theme looking
blurry for reasons nobody can name.

**4. Named z ladder.** Eight or fewer named levels, raw `z-index` forbidden in
components. This single rule eliminates the entire category of z-index bugs,
including the one where the fix works locally and breaks on one browser. Order
the ladder around the two facts that matter: the bar sits below the scrim so a
sheet can cover it, and the header sits above the scrim so the close control is
always reachable.

**5. App chrome as tokens.** `--header-h`, `--tabbar-h`, `--actionbar-h` let
every scroll container, sticky element and safe area calculation reference the
same numbers. Without these, exactly one screen ends up with content hidden
behind the bottom bar and nobody can work out which change did it.

**6. A line ramp, not a line.** So borders can express hierarchy instead of
merely existing. Prevents the flat grid of boxes.

**7. A measure token.** `--measure: 62ch` so text columns never need a magic
max width, and the reading measure can be tuned once for a language with a
different average word length.

---

## 6. The three layer architecture, for larger systems

When a product has more than one brand direction or theme, three cascading
layers keep it sane:

**scale** (raw, brand free) then **semantic** (roles) then **direction** (the
brand's answer).

Scale layer, proven shape:

- Space `--space-0..8` at 0, 4, 8, 12, 16, 24, 32, 48, 64.
- Radius `--r-sm` 4, `--r-md` 8, `--r-lg` 12, `--r-xl` 16, `--r-pill` 999, each
  multiplied by a `--r-unit` the direction layer supplies, so one variable
  resets the whole system's softness. This is the cheapest large lever in the
  system: a brand that needs to feel harder gets `--r-unit: .5`.
- A fluid type ramp with `clamp()` between 390px and 1440px, seven steps from
  11px to 48px. Keep the max at roughly 2.5 times the min or the jump becomes
  unreadable mid range.
- Line heights `--lh-tight` 1.2, `--lh-body` 1.5, `--lh-thai` 1.65. Putting
  Thai leading in the scale layer means every component inherits it for free
  the day the second language lands, rather than needing a Thai variant of
  every component.
- Motion `--t-micro` 150ms, `--t-state` 250ms, `--t-narrate` 400ms, scaled by a
  `--motion-unit`.

Two rules that keep multi theme systems alive:

**Themes ship byte identical token key sets, and the build fails if they
diverge.** Otherwise one theme quietly loses a token, one component renders
invisible, and the bug only appears for users who chose that theme.

**Keep border values deliberately unequal to any surface value.** Section 4
shows the fixture catching this, and it is worth a build gate rather than a
convention.

---

## 7. Deriving a dark theme without inventing a second palette

A dark theme invented independently drifts from the light one within two
sprints. Derive it instead, in this order.

1. **Invert the ground and ink roles, do not invert the values.** The dark
   ground is not `#000` minus the light ground. It is the brand hue at low
   lightness, chosen the same way the light ground was chosen: tinted, never
   pure.
2. **Keep the hue, move the lightness.** Every surface and ink token keeps its
   hue and shifts lightness. That is what makes the two themes recognisably one
   brand.
3. **Re derive the accent's text sibling.** `--gold-ink` was darkened to pass
   on a light ground. On a dark ground the accent usually passes as it is, and
   sometimes needs a lighter sibling instead. This is a new measurement, not a
   transformation.
4. **Deepen the shadows and keep the ring.** Elevation on dark relies on the
   `0 0 0 1px` ring far more than on the drop, because a drop shadow on a dark
   ground is nearly invisible.
5. **Re measure everything.** Run the fixture against the dark token file as a
   separate contract. A theme retuned late is where contrast failures cluster,
   and it is worth telling the audit's contrast lens which theme was retuned
   last.

---

## 8. The contrast budget, and what to do when the accent fails

Decide these at contract time, not in a review.

| Pair | Floor | Why |
|---|---|---|
| Body ink on every surface | 4.5:1 | The default text of the product |
| Secondary ink on every surface | 4.5:1 | It is still body text, just quieter |
| Tertiary ink on every surface | 4.5:1 | If it cannot pass, it is decoration, not text |
| Any state colour on every surface | 4.5:1 | State text lands wherever the state does |
| Text on the accent fill | 4.5:1 | The button label |
| Display type at 24px and above | 3:1 | The large text allowance, and only there |
| Disabled states | exempt, annotated | Exempt on purpose, and the annotation is the point |

**When the accent fails as text,** and it usually will, there are three honest
moves and one dishonest one:

1. Add a darker sibling and use it for type only. This is the house answer.
2. Use the accent as a fill and put contrast safe ink on top of it.
3. Change the accent. Rare, and correct when the brand has not committed yet.
4. Lower the floor. This is the dishonest one. Do not.

Run the fixture with your text and surface roles pinned once the contract
settles, because the name based inference is good enough to start and wrong
often enough to matter:

```bash
node scripts/contrast-fixture.mjs src/tokens.css \
  --text ink,ink-2,ink-3,few,full,error,ok \
  --surface paper,paper-2,surface-2,card \
  --pair signal-ink:signal --pair signal:paper
```

---

## 9. Build gates

Two small scripts do more for quality than any review, because they run on
every commit rather than on every good intention.

**Token gate.** Scan every source file outside the token directory for a raw
colour, a bare `z-index`, or a dash. Fail the build on a hit. A few hundred
files scan clean in well under a second. Genuine exceptions, a shader constant
for instance, carry an inline `prom-allow` comment that explains itself rather
than a globally silenced rule.

```bash
node scripts/token-gate.mjs --src src --src app --tokens tokens,theme
```

**Contrast fixture.** Render every text token on every surface token and fail
below 4.5:1, with disabled states exempted and annotated. This is the
mechanical version of "measure, do not estimate".

```bash
node scripts/contrast-fixture.mjs src/tokens.css --quiet
```

**Copy gate.** The dash rule above, plus a project specific rule that every
user facing string goes through the translation function. This is how the no
dashes rule stops being something a human has to remember, and remembering is
the part that fails.

Both scripts exit non zero on failure and take under a second, so they belong
in a pre commit hook as well as in CI.

---

## 10. Font loading

Self host `woff2` with `unicode-range` subsets and `font-display: swap`, and
preload only the two faces that appear above the fold. This is a large part of
why a page feels instant, and preloading more than two makes it slower rather
than faster.

One scar worth inheriting: **assert fonts with `document.fonts.load(spec)` per
typeface, not `document.fonts.ready`.** `ready` resolves prematurely against an
empty DOM, so a silent regression to a system fallback can ship without anyone
noticing, and it will look almost right in a screenshot.

Set `font-variant-numeric: tabular-nums` on body. Prices, counts, times and
floor numbers all align, and misaligned digits are one of those defects people
feel without being able to name.

For Thai and Latin, prefer one face carrying both scripts. It removes an entire
class of fallback problem: no mismatched x heights, no second `@font-face`
block, no screen where the Thai line is visibly a different typeface from the
English one beside it. Put the Thai line height in the token layer, and
remember that uppercase does not exist in Thai, so a letterspaced uppercase
eyebrow is a Latin only device that needs a different treatment rather than
tracking applied and hoped for.

---

## 11. Retrofitting tokens onto a codebase that has none

Five passes, in this order. Doing them out of order is what makes retrofits
stall halfway and leave the codebase in two systems at once, which is worse
than one bad system.

**Pass 1: inventory.** Run the token gate in report mode over the whole tree.
The output is your real palette: every literal colour, sorted by frequency. It
is always larger than anyone expects, and the long tail is where the
inconsistency lives.

**Pass 2: collapse.** Group the literals into intended roles. Eleven near
identical greys are one `--line` and one `--ink-3` that drifted. Write the
token file from the collapsed list, not from the design you wish existed.

**Pass 3: mechanical replace, one role at a time.** Colours first, because they
are the highest volume and the least ambiguous. Then z-index, which is small
and self contained. Then spacing, which is the most ambiguous and should be
last. One role per commit, so a regression is bisectable.

**Pass 4: turn the gate on, allowing what remains.** Add `prom-allow` comments
to the genuine exceptions and let the gate fail the build on everything else.
The comment must say why. A silenced rule with no reason is how the second
retrofit starts.

**Pass 5: measure.** Run the contrast fixture on the new token file. A
retrofit almost always surfaces two or three text colours that never passed,
because nobody had measured them either.
