# scripts/

Utility scripts. All are ESM (`.mjs`) and runnable with `node`.

| Script | Purpose | Wired into npm |
|---|---|---|
| `lint-localization.mjs` | Validate i18n keys exist for every literal field across scenes/data, and that catalogs are in sync. | `npm run lint:localization` |
| `lint-dialogues.mjs` | Validate every dialogue tree's `startId` and every `next:` reference resolves. | `npm run lint:dialogues` |
| `generate-book.mjs` | One-shot: regenerate `public/book-animation.svg` (the title screen book illustration). Run manually when the geometry/perspective math is tuned. | not wired |

Run any of them directly:

```sh
node scripts/lint-localization.mjs
node scripts/lint-dialogues.mjs
node scripts/generate-book.mjs
```
