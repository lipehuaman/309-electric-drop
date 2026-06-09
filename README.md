# 309 Technology, The Electric Drop

A single, responsive marketing landing page for the fictional brand **309 Technology**, built in **vanilla HTML, CSS and JavaScript** (no framework, no build step). The page interprets the brand book through one idea: the brand is a system that **boots, assembles and awaits your command**.

**Live demo:** _add your deployed URL here_
**Repo:** _add your repo URL here_

---

## Overview & stack justification

The brief weighs raw front-end judgement (CSS architecture, semantics, motion, accessibility) over framework familiarity, so the stack is deliberately dependency-free:

- **Vanilla HTML/CSS/JS.** Nothing to compile, nothing to audit, nothing between the source and the browser. The CSS judgement being assessed is visible directly in the files.
- **Zero dependencies.** No runtime libraries means the smallest possible payload and the best Lighthouse ceiling. The only external request is the Rajdhani web font.
- **Progressive enhancement.** The page is fully readable and navigable with JavaScript disabled; the JS layer adds the boot sequence, data-driven cards, the command terminal, scroll reveals, the theme/language toggles and form UX on top.

### Run it locally

No build step. Either open `index.html` directly, or serve the folder (recommended, so the inline-SVG `<use>` and module scripts resolve cleanly):

```bash
# Python
python3 -m http.server 8000
# or Node
npx serve .
```

Then visit `http://localhost:8000`.

### Deploy

Static files only, drop the folder on **GitHub Pages**, **Netlify** or **Vercel**. Paths are relative, so it works from a project subpath (e.g. `user.github.io/repo/`) without changes.

---

## How the brand book was interpreted

| Brand book | Decision in the build |
|---|---|
| Palette: black `#000`, white `#fff`, electric green `#58FF00` only | Strict three-colour system. Every other surface is alpha of those three. Green never used as informative text on white (1.34:1, fails AA), only as accent fills, borders and text on dark/green grounds. |
| Positive (black-on-white) and Negative (white-on-black) treatments | Shipped as a live **theme toggle**, dark-first by default (the brand's primary surface). |
| Logo built from a single modular shape, connected like circuits; "waiting for your command" | The hero **assembles the 309 mark on load**, and the Brand Story section animates **modules connecting into one core** on scroll. The hero **command terminal** realises "waiting for your command". |
| Condensed / very-short logo for use under 60px | Footer and nav use the compact 309 mark; clear-space preserved via padding tokens. |
| Rajdhani (Regular to Bold), including Spanish accented glyphs | Rajdhani for everything via Google Fonts, with **Lekton** (mono) reserved for terminal, HUD and data-label elements. The Spanish glyph set is why the page ships an **EN/ES toggle**. |
| Merch: Black-Edition tee, Electric-Green tee, Black-Edition hoodie (sizes S/M/L) | The three products, data-driven from `js/products.js`. Garments are flat **SVG/CSS mockups** (no stock imagery), coloured strictly within palette. |

The 309 wordmark is **traced to a single-colour SVG from the supplied brand book** (`assets/logo-309.svg`) and inlined once as a `<symbol>`, so it inherits `currentColor` and recolours instantly across both themes and on each garment.

---

## Design tokens (`css/tokens.css`)

One source of truth. Restyle the whole site from here.

- **Colour:** `--brand-black/white/green` (immutable) → themed semantic vars (`--bg`, `--fg`, `--accent`, `--line`, `--surface`, `--on-accent`, `--glow`) that swap per `[data-theme]`.
- **Type:** Rajdhani; fluid `clamp()` scale (`--fs-hero` → `--fs-micro`); weight, line-height and tracking tokens.
- **Space:** 8pt-based scale (`--space-4` → `--space-128`) plus a fluid `--space-section`.
- **Layout:** `--container`, `--container-tight`, fluid `--gutter`.
- **Motion:** easing curves, durations (`--dur-fast` → `--dur-boot`), `--stagger`.
- **Radius / z-index:** rounded-square geometry that echoes the logo; named z-layers.

## Components (`css/components.css`)

Reusable, BEM-named, flat-specificity blocks:

- **Button** (`.btn` + `--primary` / `--ghost`) with an electric-current sweep on hover/focus and an `aria-disabled` state.
- **Nav** (`.nav`), fixed, blurs on scroll, mobile burger with proper `aria-expanded`, active-link tracking.
- **ProductCard** (`.card`), generated from data; size selector (`aria-pressed`), available / sold-out states, hover scanline.
- **Product detail** (`.pdp`): a skylrk-style two-column modal opened from each card: looping video, edition, price, fabric/features, colourway swatches, size selector and add-to-bag. Accessible dialog (focus trap, Escape, restore focus, scroll lock).
- **Hero**: full-viewport, centered, with a vanilla-canvas particle sphere background, a boot preloader and a text-scramble decode effect on secondary copy.
- **Form / Field** (`.field`, `.form__status`), labelled input, focus-within accent, invalid state, status line.
- **Terminal**, **chip**, **toggle**, **toast**, supporting units.

---

## Accessibility notes

- Semantic landmarks: `header > nav`, `main`, `section[aria-labelledby]`, `footer`. Single `h1`, ordered `h2`/`h3`.
- Real `<button>` / `<a>` / `<input>` elements; every control is keyboard operable.
- Custom `:focus-visible` (green outline, offset) on every interactive element; skip link to `#main`.
- Form: visible `<label>`, `aria-invalid`, `aria-describedby`, and an `aria-live="polite"` status. Cart/notify actions announce via a visually-hidden live region **and** a toast.
- Colour contrast meets **WCAG AA**: white-on-black 21:1, green-on-black 15.7:1, black-on-green 15.7:1. Green is structurally prevented from being informative text on white.
- `prefers-reduced-motion` is honoured globally: the boot sequence, reveals, scanlines and caret all collapse to their end state, and programmatic scrolling switches to instant.
- `lang` attribute updates live with the EN/ES toggle.

## Performance notes

- No framework, no runtime libraries. Five small CSS files + three small JS files, all deferred.
- Visuals are inline SVG and CSS (circuit grid, garment mockups, module graphic), no hero image to download.
- Animations use **transform/opacity only** (no layout thrash); reveals are `IntersectionObserver`-driven and unobserve after firing.
- Font loads with `display=swap` and `preconnect`. `localStorage` access is wrapped in try/catch so it never throws (and never logs an error) in any sandbox.

---

## Known limitations & next steps

- **No backend.** The signup and "add to bag" are client-side only; wiring to a real endpoint (and a cart) is the obvious next step.
- **Product media** uses optimised looping videos (compressed to ~250-320 KB each, with poster frames, played only while in view). The **hoodie video is pending**, so that card falls back to the coded SVG mockup until it lands.
- **Logo is traced** from the brand book raster-to-vector; for production the original vector from the brand owner should replace `assets/logo-309.svg`.
- **i18n is intentionally lightweight** (a flat dictionary, two locales). A larger site would move to per-page JSON and pluralisation rules.
- The condensed "very-short" logo variant could be a separate optimised asset rather than the same mark scaled down.

## Credits

- **Typefaces:** [Rajdhani](https://fonts.google.com/specimen/Rajdhani) and [Lekton](https://fonts.google.com/specimen/Lekton), via Google Fonts (SIL Open Font License).
- **Brand & marks:** 309 Technology brand book (provided). Logo traced to SVG for this build.
- **Design & front-end build:** assessment submission.
