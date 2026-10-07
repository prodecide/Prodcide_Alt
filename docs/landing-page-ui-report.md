# Prodecide landing page: UI review and work plan

Reviewed on 7 Oct 2026 at 1440px desktop (mobile items in Phase 5 are from earlier checks and still need re-verifying at 375px), local build of `main` (commit `4ed2ab6`).
Each item is sized so we can do it on its own, in order. Tick them off as we go.

**Who it's for:** students and early-to-mid-career professionals in India deciding on a career move, who want a trustworthy human expert. **Primary job of the page:** get a visitor to start Discovery (the AI chat), with "browse consultants" as the second path.

---

## What already works (keep)
- The two-column hero with the holographic bust is the one memorable element. Keep it as the page's signature.
- The navbar now sits on the same grid as the hero (73px to 1353px at 1440px).
- Scroll progress along the navbar edge, and the dark theme running through every section.

## The honest summary
The page looks competent but generic. Near-black background, cyan/blue gradients, glass cards, glowing badges on every section: this is the default "AI SaaS" look, and the bust is the only thing that says *Prodecide*. The copy is abstract, and a few trust signals (stats, expert profiles) are unverified. The fastest wins are not visual; they are broken or heavy assets.

---

## Phase 1: Fix what is broken or costly (do first)

| # | Item | Why it matters | Effort |
|---|------|----------------|--------|
| ✅ 1 | **Remove the missing background video.** `Home.jsx` requests `/Video.mp4`, which does not exist in `public/`. | Every visit makes a failing request for a hidden, 25%-opacity element. | 5 min |
| ✅ 2 | **Stop shipping `public/Space/` (6.7 MB) and `public/Space.zip` (4.3 MB).** Move them out of `public/` unless something uses them. | They are deployed publicly, slow every build, and are downloadable by anyone. Check nothing references them first. | 10 min |
| ✅ 3 | **Fix the social share image.** `og:image` points to `favicon.svg`, which most platforms ignore. Make a 1200x630 PNG. Add `twitter:card`. | Links shared on WhatsApp/LinkedIn show no image. | 30 min |
| ✅ 4 | **Fix the first-paint blank.** On load the hero is empty until the lazy chunk and fonts arrive; text fades in over a dark void. Preload the two fonts, drop `display=swap` flashes with `size-adjust` fallbacks, and render the headline without waiting on animation. | The first second decides whether people stay. | 1 hr |
| ✅ 5 | **Respect reduced motion.** There is no `prefers-reduced-motion` handling for the hologram, scan band, orbit rings, floating badges or scroll transforms. | Accessibility, and battery on phones. | 1 hr |
| 6 | **Dead links.** Footer Privacy, Terms, Contact and About use `href="#"`. | Looks unfinished; Privacy and Terms are also needed for payments and Google sign-in. | needs your content |

## Phase 2: Hero (highest visual payoff)

| # | Item | Detail | Effort |
|---|------|--------|--------|
| ✅ 7 | **Rewrite the headline and subhead in plain language.** "The Architecture of Definitive Choice" does not say what Prodecide does. Draft: *"Choose your next career move with an expert, not a guess."* Sub: *"Answer a few questions, get a match from our AI, then book a session with a vetted consultant."* | Visitors should know the offer in 5 seconds. Remove "100% confidence": it is an unprovable claim. | 30 min, needs your approval of wording |
| ✅ 8 | **One primary action, one quiet secondary.** "Start Your Discovery" stays. "The Methodology" becomes a text link ("How it works"). | Two equal pills split attention. | 15 min |
| ✅ 9 | **Reduce the hologram's clutter.** It has four callout lines, four badges, a readout card, a status chip, two rings and corner brackets. Keep the bust, the scan band and the brain network; cut rings and two badges. | One bold thing, quiet surroundings. Also lowers GPU load on phones. | 1 hr |
| ✅ 10 | **Make the "98.4% path match" card honest.** It is a fixed number. Either animate it to a plausible sample result with a "Sample result" label, or remove it. | Fake precision hurts trust. | 20 min |
| ✅ 11 | **Stats row: verify or replace.** "500+ Verified Executives, 98% Decision Satisfaction, 20k+ Paths Mapped" must be true. The database is brand new, so they are not. Replace with real, smaller numbers, or with a line like "Hand-vetted by our team". | Trust and legal exposure. | needs your real numbers |

## Phase 3: Sections

| # | Item | Detail | Effort |
|---|------|--------|--------|
| ✅ 12 | **Methodology: make it a real sequence.** It is a true 4-step process, so numbering is justified. But each card shows the same icon twice, the section leaves ~200px of dead space under the cards, and the beam is a thick bar. Use one icon per card, tighten spacing, and draw a thin connecting line that fills on scroll. Add one sentence per step on what the visitor *does*. | | 2 hr |
| ✅ 13 | **Experts: show real consultants, not stock people.** The three cards are hard-coded names ("Sarah Chen", "Marcus Thorne") with images hot-linked from Google. Load approved consultants from `/api/consultants`; until there are some, show an honest empty state ("Our first experts are joining. Apply to be one.") rather than placeholders. | Fake profiles on a platform that sells expert trust is the biggest credibility risk on the page. | 2 hr (needs approved consultants in Supabase) |
| 14 | **"Why Prodecide" quote: give it a face.** An unsigned quote reads as filler. Replace with a founder note (name, photo, one paragraph) or a real user quote. | | needs your content |
| ✅ 15 | **Add a closing call to action** before the footer: one sentence and the Start Discovery button. The page currently ends on a quote, then links. | | 30 min |
| ✅ 16 | **Footer: make it useful.** Working legal links, contact email, "Apply as a consultant", social links. | | 1 hr |

## Phase 4: Design system (do after content is settled)

| # | Item | Detail |
|---|------|--------|
| 17 | **Pick a type pairing with character.** Manrope and Inter are the common defaults. A distinct headline face (for example a refined serif or a condensed grotesque for display) with Inter for body would separate Prodecide from other AI sites. Needs your taste; I can mock two options. |
| 18 | **Cut the accent color to one.** Cyan, electric blue, indigo, emerald and violet all appear. Keep cyan for "AI" moments (the bust, scan) and one blue for actions. |
| 19 | **Vary the card treatments.** Every section uses the same rounded dark glass card with the same glow. Let Methodology be a line, Experts be photographic, and keep glass for the hologram only. |
| 20 | **Contrast check.** `text-slate-400` on `#050a18` for small labels is borderline. Raise secondary text and the "Stage" / role labels to meet WCAG AA. |

## Phase 5: Mobile and performance

| # | Item | Detail |
|---|------|--------|
| 21 | **Mobile hero order.** Hologram sits below the stats; lead with headline, button, then the bust. Verify the 4 floating badges do not overflow at 375px (not yet re-tested on the new navbar). |
| 22 | **Navbar on mobile.** Earlier test showed "Start Discovery" wrapping to two lines next to the menu icon; re-check on the new navbar, and shorten to "Start" or hide the bell if it still wraps. |
| 23 | **Bundle.** `Navbar` chunk is 140 KB because it pulls in framer-motion; main bundle 187 KB. Lazy-load the hologram below the fold and use `LazyMotion` to cut ~50 KB. |
| 24 | **Host the expert photos yourself** (compressed WebP, correct sizes) instead of hot-linking Google image URLs that can break. |

---

## Suggested order
1. Phase 1 items 1, 2, 3, 5 (one session, no design decisions).
2. Item 7 and 8 (wording sign-off) then 9, 10.
3. Items 11, 13 as soon as you have real numbers and approved consultants.
4. Phase 3, then Phase 4, then Phase 5.

## Decisions I need from you
- Approve or edit the new headline and subhead (item 7).
- Real numbers for the stats, or remove them (item 11).
- Founder note or user quote content (item 14).
- Whether to explore a new type pairing (item 17).
- Whether the files in `public/Space/` are used anywhere (item 2).


## Status (7 Oct 2026)
Phases 1-3 implemented locally, not deployed. Not done: item 6 (needs Privacy/Terms content), item 14 (needs founder note or user quote). Phases 4-5 not started.
