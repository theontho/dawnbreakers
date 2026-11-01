# scripts/

Utility scripts. All are ESM (`.mjs`) and runnable with `node`.

| Script | Purpose | Wired into npm |
|---|---|---|
| `lint-localization.mjs` | Validate i18n keys exist for every literal field across scenes/data, and that catalogs are in sync. | `npm run lint:localization` |
| `lint-dialogues.mjs` | Validate every dialogue tree's `startId` and every `next:` reference resolves. | `npm run lint:dialogues` |
| `generate-hipparcos-catalog.mjs` | Download/cache CDS `hip_main.dat` in `tmp/` and regenerate the checked-in `data/sky/hipparcos.csv`, read by the native Sky Rewind and packed into the journey skies. Use `--refresh` to redownload the raw source. | `npm run skyrewind:catalog` |
| `generate-travel-stars.mjs` | Pack the naked-eye Hipparcos stars (magnitude 6 and brighter) from `data/sky/hipparcos.csv` into `src/data/travelStars.ts` for the journey skies. | `npm run journeys:stars` |
| `journeys.mjs` | Play every journey between chapters headlessly, screenshot each to `out/journeys/`, and check that a passage carries on into the next chapter. `--only`, `--rate`, `--trails`, `--viewport`, `--wait`. | `npm run journeys` |
| `social-preview.mjs` | Render the 1200x630 link preview (`public/social-preview.png`, used by the Open Graph tags in `index.html`) from the title screen at sunrise, menu hidden. `--at <seconds>`, `--out`. Rerun after changing the title screen. | `npm run social-preview` |
| `generate-book.mjs` | One-shot: regenerate `public/book-animation.svg` (the title screen book illustration). Run manually when the geometry/perspective math is tuned. | not wired |

Run any of them directly:

```sh
node scripts/lint-localization.mjs
node scripts/lint-dialogues.mjs
node scripts/generate-hipparcos-catalog.mjs
node scripts/generate-book.mjs
```
