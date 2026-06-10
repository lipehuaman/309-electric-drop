# 309 Technology, The Electric Drop

A one page launch site for 309 Technology, the fictional apparel brand from the assessment. It introduces the brand's first release, "The Electric Drop", which is three limited tees and a hoodie, and it shows them off through an interface that boots up, assembles itself, and then waits for you to do something.

Live: https://lipehuaman.github.io/309-electric-drop/

It's built in plain HTML, CSS and JavaScript, with no framework and no build step.

## Why there's no framework

It's a single page with a few interactive pieces (a theme toggle, a product quick view, a small command terminal, a signup form), and none of that really calls for React. A framework would have meant adding a build pipeline and shipping more JavaScript than the page needs, whereas the interactions here are small enough that writing them by hand took less effort than configuring a library would have. The whole thing lands at around 1 MB with the three product videos included, and since there's no bundler in the way, the files you clone are the files that run.

The only thing the page pulls from anywhere else is the web font, Rajdhani and Lekton from Google Fonts. Everything else, including the animated particle field, the logo and the background texture, is canvas, inline SVG or CSS.

## Running it locally

There's nothing to install. Clone the repo and serve the folder with any static server. You can open `index.html` straight off disk and most of it works, but serving over HTTP avoids a few CORS complaints from the font and the videos.

```bash
# with Python
python3 -m http.server 8000

# or with Node
npx serve
```

Then open `http://localhost:8000`. No build, no config, nothing to drop in a `.env`.

## Deploy

Because it's static it'll run on any static host. I have it on GitHub Pages, served from the `main` branch at the repo root, so the live page is the same set of files that lives in the repository. Vercel, Netlify or Cloudflare Pages would work the same way with the same folder. The live link is at the top of this file.

## Project structure

```
index.html          all the markup, plus the inlined logo <symbol> and the modal shell
styleguide.html     a standalone design reference (the optional "source design" file)
DESIGN.md           the reasoning behind the design choices
css/
  tokens.css        design tokens: colour, type scale, spacing, motion, the two themes
  base.css          reset, typography, focus styles, the global background layer
  layout.css        the page sections and the access HUD panel
  components.css     nav, buttons, cards, terminal, forms, the quick view modal
  hero.css          the hero, the HUD frame, the boot preloader
  animations.css    keyframes and the reduced-motion fallbacks
js/
  products.js       the three editions as data; the cards and the modal read from it
  i18n.js           the English and Spanish dictionaries
  sphere.js         the canvas particle sphere and the brand-story mesh
  main.js           the rest: theme, i18n, modal, terminal, form, reveals
assets/             the traced SVG logo, the favicon, and the product videos with posters
```

## How I read the brand book

The book gives two treatments, positive and negative, and a small palette of electric green (`#58FF00`), black and white. I treated the two treatments as something to actually build with and turned them into a theme toggle, leaving the dark one as the default because that's where the brand feels most like itself, and I'm careful not to mix the two on the same screen.

Green is where it got interesting. It looks great on black, but on white it more or less disappears as text, at a contrast ratio of about 1.34 to 1, so in the light theme I only let the brand green sit there as a fill: on the primary button, a selected size, the small square mark. Any thin green lines or labels move to a darker green so they stay readable. I've noted that in the tokens because it's a deliberate adjustment for the light surface, and I didn't want it read as an oversight.

Since the logo in the book is a raster image, I traced it into a clean single-colour SVG and inline it once as a `<symbol>`, then reuse that across the nav, the footer, the preloader and the printed marks on the shirts. It takes on whatever colour its context needs through `currentColor`.

Rajdhani is the brand typeface, and it happens to include the accented Spanish glyphs, which is part of why I added an English and Spanish toggle rather than leaving the page in English only. Anywhere something should read like a terminal or a small readout, such as the command line, the HUD labels and the boot text in the signup, I used Lekton instead.

The book also keeps coming back to two ideas, modular parts that join into something larger and a brand that's "waiting for your command", and those ended up shaping the whole page. It works a little like a system coming online: a loader assembles the logo, the sections appear as you scroll, and a small terminal in the hero lets you type `drop`, `story` or `access` to move around.

## Design tokens and components

The look runs off custom properties in `tokens.css`, which hold the three brand colours, a fluid type scale built on `clamp()` so the hero headline resizes without breakpoints, an 8 point spacing scale, the motion easings and durations, and the radii and z-index layers. The two themes are two sets of semantic variables (`--bg`, `--fg`, `--accent`, and the glass and grid tokens) that swap when `[data-theme]` changes, so changing the look comes down to editing tokens instead of digging through selectors.

The components are the pieces you'd expect on a launch page. There's a sticky nav that frosts over on scroll and folds into a burger on mobile, a full-screen hero with the particle sphere behind it (along with the command terminal, the HUD frame and the boot preloader), a brand-story section with its own denser particle shape, the drop itself as a grid of three cards built from `products.js`, a product quick view that opens from any card, and the signup laid out like a HUD terminal. The cards, the terminal and the access panel use a light frosted-glass treatment so the background grid shows through them. The green square from the book turns up again as the eyebrow marker and the list bullets, and I gave it a slow pulse so it reads as a live indicator.

If you want the reasoning rather than the inventory, `DESIGN.md` is the short version and `styleguide.html` is a visual reference you can open in a browser.

## Accessibility

The page uses real landmarks (`header`, `main`, `nav`, `footer`), a skip link, and headings in order, and the theme and language controls are proper buttons with `aria-pressed`. The quick view behaves like a real dialog: it traps focus while it's open, closes on Escape or a click on the backdrop, locks the body scroll, and hands focus back to the card you opened it from when it closes. The signup and the cart feedback both announce through an ARIA live region.

I kept a visible focus style everywhere and gave it a green ring with an offset and a soft glow to match the brand. Each piece of motion (the sphere, the reveals, the scramble text, the pulsing square, the preloader) has a `prefers-reduced-motion` path that drops it to its finished state for anyone who has animations turned down. I went through the contrast on every text pairing, and the only one that comes up short is green text on white, which is the reason green stays a fill in the light theme.

## Performance

There's no framework and no runtime libraries, just six small stylesheets and four small scripts, all deferred. Most of the visuals are canvas and CSS rather than images, so there's no hero photo to download, and the canvases stop animating when they scroll out of view. The product videos are compressed to roughly 225 to 325 KB each, sit behind a poster frame, load with `preload="none"`, and only start playing once they're on screen. The animations stay on transform and opacity so they don't force layout.

For Lighthouse, run it against the live URL in a clean Chrome window (an incognito one, so extensions and the dev server don't drag the score). It's built to clear 95 on Performance and Accessibility. The heaviest thing on the page is the `backdrop-filter` on the glass panels where they sit over the moving hero sphere; it's fine on current hardware, and if an older phone struggles the blur is a single token to dial back (`--glass-blur`).

## Known limitations and what I'd do next

There's no backend, so the signup and the "add to bag" only run in the browser; the next step would be connecting the form to a real list and making the cart persist. The logo is traced from the raster brand book, and for production I'd swap in the brand owner's original vector. The product videos are placeholder renders I made for this mock drop rather than final photography. The i18n is deliberately small, a flat dictionary with two locales, and a larger site would move to per-page JSON with proper pluralisation. The very short logo variant from the book could also be its own optimised asset instead of the full mark scaled down.

## Credits

- Type: [Rajdhani](https://fonts.google.com/specimen/Rajdhani) and [Lekton](https://fonts.google.com/specimen/Lekton), from Google Fonts, under the SIL Open Font License.
- Brand and marks: the 309 Technology brand book provided with the assessment. The logo was traced to SVG for this build.
- Product videos: placeholder renders generated for the mock drop.
- Design and front-end build: mine, for the assessment.
