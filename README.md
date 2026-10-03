# KRKL — landing hero

Plain HTML / CSS / JS. No build step. Open `index.html`, or serve the folder
(`python3 -m http.server`) for the most realistic video/autoplay behaviour.

```
index.html
css/style.css
js/script.js
assets/
  hero.mp4  hero.webm     <- PLACEHOLDER loop (slow zoom on a still) — replace with the real video
  hero-poster.jpg         <- first frame shown before the video loads / if it fails
  left-bg.jpg             <- left column art (as supplied)
  right-bg.jpg            <- right column art (supplied image, caption + border removed; caption is live text now)
  krkltech-logo-white.svg <- logo on the left card
  krkltech-dark-icn.svg   <- favicon
```

## Swapping in the real video
1. Export H.264 MP4 (and optionally WebM), muted, seamless loop, ~8–15 s.
2. Portrait-friendly framing: the card is ~3:4 at 1448×1086 and ~1:1 at 1920×1080; the video is `object-fit: cover`.
3. Save as `assets/hero.mp4` (+ `assets/hero.webm`), keep the same names. Delete `hero.webm` if you don't ship a WebM.
4. Replace `assets/hero-poster.jpg` with a frame from the real video (same aspect).

## How the "pixel perfect" part works
Everything is authored against a 1448 × 1086 reference frame using one CSS unit,
`--s` (= one reference pixel). At 1448×1086 the layout matches the mockup to ±1px;
at other sizes it scales proportionally. Columns are `1fr : 2.254fr : 1fr`, 9px gaps.

## Fonts (Google Fonts, loaded in <head>)
DM Sans (headline, labels, nav, caption) · Montserrat 600 (button).
