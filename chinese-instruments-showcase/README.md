# Chinese Traditional Instruments Showcase

English-language static site introducing nine Chinese traditional instruments: one photo tile per row, hover/focus reveals copy, click-to-play audio with polite screen-reader status updates.

## Live demo (GitHub Pages)

1. Push this `chinese-instruments-showcase/` folder to a GitHub repository (or make it the repo root).
2. In the repository **Settings → Pages**, set **Source** to **Deploy from a branch**, choose `main` (or `master`) and `/ (root)` if `index.html` sits at the repository root, or `/docs` if you prefer that layout.
3. After the workflow finishes, open the provided `https://<user>.github.io/<repo>/` URL.

If the site lives in a subfolder, set `<base href="...">` or move files to the Pages root so asset paths resolve.

## Local preview

```bash
# From this directory
npx --yes serve .
```

Then visit the URL printed in the terminal (often `http://localhost:3000`).

## Features (mapping to the proposal)

- **One instrument per row**, centered column with a large square photo tile (rounded corners).
- **Default state**: photograph + English / Chinese names on a bottom scrim.
- **Hover or keyboard focus**: introduction fades in on a readable panel while the photo softens into the background; the tile scales up slightly.
- **Click / Enter / Space** on the tile plays or stops the sample; only one clip plays at a time. Audio elements are visually hidden (no on-screen controls) but playback is announced via `aria-live`.
- **Real instrument photos** live in `images/` (`erhu.png`, `guzheng.jpg`, `guqin.jpg`, `pipa.jpg`, `dizi.jpg`, `yangqin.jpg`, `suona.jpg`, `sheng.png`, `bianzhong.jpg`); add attribution in `credits.html` if your sources require it.
- `prefers-reduced-motion` keeps copy readable without motion; `@media (hover: none)` keeps descriptions visible on touch-first devices.
- Semantic structure: `header`, `main`, `footer`, `article`, `button` tiles, `lang` on Chinese names.

## Audio assets

File names in `assets/audio/` should match the instrument slug (`erhu`, `guzheng`, `guqin`, `pipa`, `dizi`, `yangqin`, `suona`, `sheng`, `bianzhong`). In `index.html`, each `<audio>` block uses the correct `type` for the extension (e.g. `audio/mpeg` for `.mp3`, `audio/wav` for `.wav`, `audio/mp4` for `.m4a`).

Regenerate short synthetic **WAV** placeholders with:

```bash
node scripts/generate-placeholder-audio.mjs
```

## Time log (example template for your report)

| Date       | Task                                      | Hours |
| ---------- | ----------------------------------------- | ----- |
| Week 2     | Layout, typography, grid breakpoints      | 3.0   |
| Week 2     | Card interactions + reduced motion        | 1.5   |
| Week 2     | SVG artwork + content writing             | 2.5   |
| Week 3     | Accessibility pass + audio coordination   | 2.0   |
| Week 3     | Testing (keyboard, contrast, breakpoints) | 1.5   |
| Week 3     | README, GitHub Pages, presentation deck   | 2.0   |

Adjust numbers to reflect your actual effort (target **18–25 hours** solo).

## Presentation tips (3–4 minutes)

Focus on what is **unique**: custom SVG system, single-audio JavaScript policy, how hover respects reduced motion, one bug you chased (for example, overlapping audio or focus order), and where you would iterate next (real recordings, additional pages).

## Validation

Run HTML/CSS validators before submission:

- [W3C HTML Checker](https://validator.w3.org/nu/)
- [W3C CSS Validator](https://jigsaw.w3.org/css-validator/)

## License

Educational use. Replace audio with your own or properly licensed media before any public redistribution beyond coursework.
