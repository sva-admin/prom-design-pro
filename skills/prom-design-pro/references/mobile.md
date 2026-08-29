# The mobile web app deep pack

Read this whenever the register is **instrument**. A web app is not a shorter
marketing page. It is a different object, and the most common failure in this
whole discipline is building a landing page and calling it an app.

The governing complaint, in the words that produced this register: too much
negative empty space and too much scrolling, most people will be on mobile, and
they should not have to wade through sections to reach the thing they came for.

Everything below is a consequence of that one sentence.

## Contents

1. The density budget, with a number
2. The payload rule
3. Footer navigation, in full
4. The compaction passes
5. The coach overlay, and the spotlight cutout
6. The shadow gallery
7. The rest of the delight kit
8. Borrowing components without inheriting their skin
9. What not to bring from the cinematic register
10. The check before you show it

---

## 1. The density budget, with a number

Vague targets do not survive a deadline, so use a measured one.

The metric is **screens**: `document.body.scrollHeight` divided by the viewport
height, at 375px wide.

```js
// paste in the console, or read it from the free skill's shots.mjs report
(document.body.scrollHeight / window.innerHeight).toFixed(2)
```

The free prom-design skill's `scripts/shots.mjs` reports this per route
alongside status, overflow and console errors, which is the version worth
wiring into the review gate:

```bash
node scripts/shots.mjs --base http://127.0.0.1:8788 --routes / --widths 375
```

| screens at 375px | verdict |
|---|---|
| 1.0 to 2.0 | an app screen. Good. |
| 2.0 to 3.0 | acceptable for a browse or list screen |
| 3.0 to 4.5 | getting long. Justify every section out loud. |
| over 4.5 | this is a landing page wearing an app costume |

One home screen in this house was cut from **9.8 screens to 3.8**, and that
single change did more for how the product felt than any restyle in the same
week. Treat the number as a budget you spend, not a result you observe.

Two ways to use it well:

- **Record it per route in the review gate,** so a regression is visible before
  anyone has a taste opinion about it.
- **Set the budget in the brief,** not after the build. "This is a browse
  screen, budget 3.0" is a design decision. "This came out at 4.4" is a
  discovery.

---

## 2. The payload rule

**The payload goes above the fold.** On an app home screen the user sees the
thing they came for, the next booking, the available slots, the balance,
without scrolling at all. Everything else is below.

This is stricter than it sounds and it kills three things people reach for by
habit: the hero, the welcome message, and the search bar that nobody uses on a
screen with nine items.

The test is mechanical. Screenshot the route at 375 by 667, then ask: is the
one thing this screen exists for visible in that image. Not reachable. Visible.

---

## 3. Footer navigation, in full

A bottom tab bar is the single change that makes a web page feel like an app.
It is not decoration: it is a promise that the whole product is reachable from
anywhere in one tap.

```css
.tabbar{
  position:fixed; inset:auto 0 0 0; z-index:var(--z-bar);
  height:calc(var(--tabbar-h) + env(safe-area-inset-bottom));
  padding-bottom:env(safe-area-inset-bottom);
  display:grid; grid-auto-flow:column; grid-auto-columns:1fr;
  background:var(--paper); border-top:1px solid var(--line);
}
.tabbar a{
  display:grid; place-items:center; gap:3px;
  font-size:var(--t-micro); color:var(--ink-3);
  min-height:48px; text-decoration:none;
  touch-action:manipulation;
  -webkit-tap-highlight-color:transparent;
}
.tabbar a[aria-current="page"]{ color:var(--ink); font-weight:600 }

/* every scroll container must clear the bar, or the last row is unreachable */
main{ padding-bottom:calc(var(--tabbar-h) + env(safe-area-inset-bottom) + var(--s5)) }
```

Ten rules, each of which has failed somewhere:

1. **Three to five destinations. Never six.** If you need six, two of them
   belong inside a third.
2. **Icon plus label, always.** Icon only bars fail for everyone who does not
   already know the product, which on a launch is everyone.
3. **`env(safe-area-inset-bottom)`** or the bar sits under the home indicator
   on a modern phone and every tap lands on the wrong thing.
4. **`--tabbar-h` is a token,** and every scroll container, sticky element,
   sheet and modal references it. Without that, exactly one screen has content
   hidden behind the bar and nobody can work out which change did it.
5. **Mark the current tab with `aria-current="page"`,** not just a colour
   class. The state is then real for assistive technology and cannot drift out
   of sync with the style.
6. **The bar never changes between pages.** Inconsistent mobile navigation
   between pages is a named, remembered defect in this house.
7. **48px minimum touch height,** and `touch-action: manipulation` to remove
   the 300ms tap delay. The delay is what makes a web app feel like a web page.
8. **A sticky action bar may sit above the tab bar** on a detail screen, for
   the one action that screen commits, at `--actionbar-h`. Never two action
   bars.
9. **The bar sits below the scrim in the z ladder** so a sheet can cover it,
   and the header sits above the scrim so a close control is always reachable.
10. **Retire the hamburger.** On a phone it hides the product behind a mystery
    button. The tab bar shows it.

---

## 4. The compaction passes

Compaction is not shrinking type. It is showing the conclusion and hiding the
derivation.

Run these as passes over a screen that is over budget, in this order, because
the early ones remove whole sections and the later ones tune what remains.

### Pass 1: remove

**1. Kill the section that exists because the template had one.**
Testimonials, "our values", a second call to action, a features grid. In an app
they are all noise, and each one is between 0.4 and 1.2 screens.

**2. Merge the header into the payload.** An app does not need a hero. A strong
app home screen's entire hero is one line of live numbers and a button.

**3. One primary action per screen.** More than one is a decision the user did
not ask to make, and it usually comes with a second block of supporting copy.

### Pass 2: restructure

**4. Facets instead of scroll.** A filter row turns 40 items into 6. This is
the single biggest win available, and it is why a good browse screen leads with
its axes rather than its results.

**5. Segmented control instead of stacked sections.** Today, This week, All, in
one control, replaces three stacked blocks and their three headings.

**6. Horizontal rails for peers.** A row of dates or categories that scrolls
sideways costs one screen instead of six. Label the affordance in words.

**7. Sheets instead of pages.** A bottom sheet for detail keeps the user in
place and removes a whole navigation round trip, including the return journey
that people forget to count.

**8. Disclosure for the long tail.** "See all 17 dates" beats rendering 17.

### Pass 3: tune

**9. Cards carry facts, not paragraphs.** Category, availability, title, then
one metadata line. If a card needs a paragraph, the card is a page.

**10. Empty states do work.** An empty list offers the action that fills it
rather than apologising for being empty.

**11. Collapse chrome on scroll.** The header can shrink. The tab bar must not:
a navigation that disappears is a navigation people stop trusting.

**12. Tighten the rhythm to the register.** `--s5` and `--s6` between blocks,
`--s7` only between major regions. Reaching for `--s9` inside an app screen is
the negative space defect arriving in token form.

Measure after each pass. Compaction has diminishing returns, and a screen that
reaches 2.5 from 9.8 does not need passes 9 to 12 the same week.

---

## 5. The coach overlay, and the spotlight cutout

Delight is not decoration when it teaches, reassures, or removes a step. Each
pattern below is cheap and each does a job. Use several. Do not use all of them
on one screen.

### The first run coach overlay

A dimmed scrim, a card, a `1 of 3` counter, Skip and Next.

Six rules:

1. **Exactly three steps.** Three is the number people finish.
2. **Each step has a real reason to exist.** If a step points at a button, cut
   it: a button that needs explaining needs a better label, not a tour.
3. **The copy teaches trust, not mechanics.** The strongest version of this
   pattern explains why the numbers on screen can be believed. The line from
   the fictional Assembly build: "The dates and the places left are counted out
   of the database as the page is built, not written by hand. When a table
   fills, this number drops." That is the same move as a proof caption on a
   photograph, applied to onboarding.
4. **Add icons** so the gesture is legible without reading.
5. **Store the dismissal, and know where.** Local storage or a cookie, decided
   deliberately, because every screenshot run and every audit lens needs to
   skip it, and the skip has to be set in an init script that runs before page
   load rather than after.
6. **Never show it twice.** A returning user seeing the tour again reads as
   broken, and it is, because the storage key changed.

### The spotlight cutout

A step better than a flat scrim: punch a hole so the element being explained
stays lit.

```css
.spot{ position:fixed; inset:0; z-index:var(--z-scrim);
  background:rgba(20,26,24,.72);
  -webkit-mask:
    linear-gradient(#000,#000),
    radial-gradient(circle at var(--sx) var(--sy), transparent 0 var(--sr), #000 var(--sr));
  -webkit-mask-composite:destination-out; mask-composite:exclude;
}
```

Drive the three variables from the target's rectangle:

```js
function spotlight(el, overlay, pad = 12){
  const r = el.getBoundingClientRect()
  overlay.style.setProperty('--sx', `${r.left + r.width / 2}px`)
  overlay.style.setProperty('--sy', `${r.top + r.height / 2}px`)
  overlay.style.setProperty('--sr', `${Math.max(r.width, r.height) / 2 + pad}px`)
}
```

Recompute on resize and on scroll, or the hole drifts off the element it is
explaining, which is worse than no spotlight at all. If the target can scroll
out of view, scroll it into view first and wait for the scroll to settle.

---

## 6. The shadow gallery

A media rail where depth does the sorting: the active tile sits at `--lift-3`
and full scale, its neighbours at `--lift-1`, `scale(.94)` and slightly
desaturated. Scroll snap keeps it honest.

```css
.gal{ display:flex; gap:var(--s3); overflow-x:auto;
  scroll-snap-type:x mandatory; scroll-padding:var(--pad);
  -webkit-overflow-scrolling:touch; touch-action:pan-x }
.gal>*{ flex:0 0 78%; scroll-snap-align:center;
  border-radius:var(--r-media); box-shadow:var(--lift-1);
  transform:scale(.94); filter:saturate(.85);
  transition:transform .45s var(--ease), box-shadow .45s var(--ease), filter .45s var(--ease) }
.gal>*.is-active{ transform:scale(1); box-shadow:var(--lift-3); filter:none }
```

Drive `.is-active` with an IntersectionObserver at `threshold: 0.6`:

```js
const io = new IntersectionObserver((entries) => {
  for (const e of entries) e.target.classList.toggle('is-active', e.isIntersecting)
}, { root: gal, threshold: 0.6 })
for (const tile of gal.children) io.observe(tile)
```

Two details that separate this from a rail that merely works:

**Show the edge fade only while it actually overflows.**

```js
const overflows = () => gal.scrollWidth - gal.clientWidth > 4
gal.classList.toggle('has-fade', overflows())
new ResizeObserver(() => gal.classList.toggle('has-fade', overflows())).observe(gal)
```

A gallery of one item dressed up as a scrollable list is the "out of place"
defect, and it happens on exactly the pages where a category has one entry,
which is exactly the page a client will open.

**`flex: 0 0 78%` is not arbitrary.** The next tile has to be visibly
present at the right edge, because that peek is the affordance. A tile at 100%
looks like a static image and nobody swipes it.

---

## 7. The rest of the delight kit

**Number ticker** on a live count, so a changing number is felt rather than
merely correct. Cheap with `requestAnimationFrame` over 600ms, and it must
respect reduced motion:

```js
function tick(el, to, ms = 600){
  const from = Number(el.textContent) || 0
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = to; return }
  const t0 = performance.now()
  const step = (t) => {
    const p = Math.min(1, (t - t0) / ms)
    el.textContent = Math.round(from + (to - from) * (1 - (1 - p) ** 3))
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}
```

**Skeletons, not spinners.** A skeleton shaped like the content reads as fast.
A spinner reads as broken, because a spinner is the same picture whether the
request takes 200ms or has already failed.

**Optimistic state on tap,** with a quiet revert on failure. Loud failure
handling on an optimistic action teaches people not to trust the optimistic
part.

**Pull to refresh feel** via `overscroll-behavior: contain` plus a small rubber
band indicator. The `contain` also stops a scroll inside a sheet chaining to
the page behind it, which is worth the line on its own.

**Sticky commit bar** that slides in once a selection exists, and slides out
when it does not. It should never be present and disabled: a disabled bar
occupying `--actionbar-h` is a permanent tax on the density budget.

**A live dot.** A small pulsing dot next to a number that updates. Protect its
meaning: it may only mount on genuinely live data, never on hover, never on a
static count. One system enforced a hard rule of one halo per screen with a
lint rule, which is the right instinct: the second live dot on a screen makes
the first one mean nothing.

**Count up on reveal** for stat rows, once per session, not once per scroll.

**Micro haptic analogue:** a 60ms scale to `.97` on tap. It is the closest a
web app gets to feeling native and it costs one rule.

```css
.card:active, .tabbar a:active{ transform:scale(.97); transition:transform 60ms linear }
```

Everything in this section obeys the affordance law: **if it can be swiped,
dragged or scrubbed, say so in words or animate a hint on first view.** A
control that only reveals itself on hover does not exist on a phone.

---

## 8. Borrowing components without inheriting their skin

Component libraries and component MCP servers are the fastest way to get a well
built bottom sheet, command palette, carousel or animated counter without
inventing one. The behaviour and the accessibility work in those components is
genuinely worth taking. The appearance is not.

**The rebind procedure, five steps:**

1. **Take the mechanism, never the skin.** A borrowed component arrives with
   its own palette, radii, shadows and motion. Rip those out and rebind every
   value to your tokens. A component that keeps its own look is the "out of
   place" defect, and it is visible to a client in a second even though they
   cannot name it.
2. **Rebind radii by role,** not by size: `--r-control` for buttons and inputs,
   `--r-media` for imagery, `--r-sheet` for the drawer, `--r-commit` for the
   pill.
3. **Delete the variants you do not use.** Most of these components ship six
   sizes and four tones. Keeping them is how a design system dies: within a
   month somebody uses the ghost variant once and now it is part of the system.
4. **Check contrast after rebinding, from rendered pixels.** The component was
   contrast tested against its own palette and not against yours. Run the token
   fixture first, then sample the rendered result.
5. **Check the licence before shipping it into client work.** This takes two
   minutes and is the only step on this list that can cost real money.

Then run the token gate over the file. A borrowed component is the single most
likely place for a raw hex to enter a codebase that had none.

**A note on component MCP servers.** Several exist and they are useful. Two
cautions that generalise: an MCP that needs its own API key usually stores that
key in a plaintext config file on your machine, so treat it as exposed and
rotate it if the file is ever shared or synced; and prefer the access path that
is already authenticated over the one that needs a new key, because a component
source you cannot reach reliably is a component source you will work around at
the worst moment.

The same discipline applies to any source: shadcn/ui, Radix, Headless UI, a
snippet from a blog post. Borrow behaviour and accessibility, never appearance.

---

## 9. What not to bring from the cinematic register

- No full viewport hero. No `100svh` section on an app home screen.
- No display serif at `clamp(38px,5vw,72px)`. The instrument register runs one
  sans and gets its hierarchy from weight and size, not from a second face.
- No script accent. A booking screen with decorative type reads as unserious,
  and unserious is expensive when money is changing hands.
- No scroll scrubbed film, no slow image drift, no ambitious first load motion.
- No `clamp(56px,6.5vw,92px)` section rhythm.

The one thing that carries over completely is the **honesty system**. A "how
this page counts" note in an app is the same move as a "not an artist's
impression" caption on a render, and it is what makes a dense screen feel
trustworthy rather than merely busy.

Two more that carry over quietly: tabular numerals, because an app is mostly
numbers, and the affordance law, which matters more on a phone than anywhere
else.

---

## 10. The check before you show it

1. `screens` at 375px is inside the budget from section 1, per route.
2. The payload is visible with zero scrolling.
3. The tab bar is present, identical on every page, and nothing hides behind it
   at the bottom of any scroll container.
4. Exactly one primary action on the screen.
5. Every rail, sheet and scrubber announces itself in words.
6. No section survives that you could not name a reason for out loud.
7. Contrast measured from rendered pixels, including over any imagery.
8. Any borrowed component has been rebound to your tokens, and the token gate
   passes over its file.
9. The coach overlay is dismissible, stored, and skippable from an init script.
10. Every card carries facts. If any card carries a paragraph, it is a page.
