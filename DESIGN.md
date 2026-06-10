# Design notes

A walk through the main decisions behind the page, including a couple I changed my mind about along the way.

## Where it started

The brand book kept circling two ideas: parts that connect into something bigger, and a brand that's "waiting for your command." Instead of quoting those on a hero and moving on, I tried to make the page itself behave that way. It opens with a loader that assembles the 309 mark, the sections come online one after another as you scroll, the signup is framed as a channel opening up, and there's a small terminal in the hero that actually does something (you can type `drop`, `story` or `access` to jump around). That terminal started as a small visual joke, but it carried the concept better than anything else I tried, so I leaned into it and built the rest of the page to match.

I went with a cyberpunk HUD direction because the brand is loud and green-on-black and reads like something that belongs on a screen, and because a clothing drop needs to feel like an event for the page to do its job. I sketched a calmer, more editorial version early on and dropped it, since it ended up underselling how aggressive the brand wants to be.

## The two themes

Because the brand book ships a positive and a negative treatment, building the theme toggle felt like part of the actual job, and it turned into one of the more meaningful interactions on the page. I default to the dark one because the brand looks most like itself there. The light theme is where I spent the time, since `#58FF00` is unreadable as text on white. What I settled on is a simple working rule: on white, green only ever appears as a fill, and for the handful of green details that have to be lines or labels (the particle field, the HUD frame, the boot text) I drop to a deeper green so they survive. It's the one place I step outside the strict palette, and I did it on purpose so the light theme stays legible.

## Type and colour

There are two typefaces doing two jobs. Rajdhani runs the whole site, and Lekton only appears where something should read like a terminal or a data label, so the monospace never bleeds into the body copy. I held the palette to the three colours from the book and resisted adding greys or extra tints beyond what the themes already need. The green square from the book became a recurring module: it's the bullet on the eyebrows and the marker in the lists, and I gave it a slow pulse so the whole interface feels powered on, which also picks up the brand's line about one shape repeating and connecting.

## Motion

The hero sphere and the brand-story shape are the same small canvas engine running with different parameters, which lets them feel related without looking identical; the story one is denser and spikier, and it floats inside its box rather than filling it. Both of them follow the cursor. Secondary labels decode in with a scramble effect, and I kept that effect away from the headlines so it never gets in the way of something you're trying to read. All of the motion has a reduced-motion path that jumps straight to the finished state, because anyone who has asked their system to calm animations down shouldn't have to sit through mine.

The frosted-glass surfaces came in fairly late. The page already had a faint interface grid sitting behind everything, and once I frosted the panels over it they started to feel like they were floating on a screen rather than resting on a flat background. I kept the blur low enough that it doesn't punish the GPU on a phone.

## Copy

My first pass at the writing leaned hard into the machine voice, with things like `boot_sequence` and `awaiting transmission`. It read nicely as set dressing, but it wasn't helping anyone decide whether to buy a shirt, so I rewrote the real sentences to talk to that person, leaning on early access and the fact that the runs are limited, and I left the terminal language only in the decorative HUD bits where it reads as flavour.

## Things I'd revisit

The quick view is a modal, and on a real store I'd think harder about giving products their own pages so links are shareable. The cart and the signup run only in the browser here, which was a conscious scope choice, and both are a backend away from being real. I'd also want the brand's actual logo vector and proper product photography in place of the traced mark and the placeholder renders I'm using for now.
