# Dawnbreakers Refactor Audit

A read-only sweep of the codebase as of 2026-05-30, focused on duplication,
oversized files, drift between systems, and small papercuts. Each item lists
**evidence**, **impact**, and a **proposed approach** so we can prioritize
without re-discovering the context later.

Sized in three buckets:

- **High** — meaningful duplication or correctness risk; pays back on every
  new chapter or scene.
- **Medium** — quality-of-life refactors and consistency wins.
- **Low** — cleanup / hygiene, do opportunistically.

## Status (2026-05-30)

- **Item 1 — done.** All 18 per-scene `make*Texture` helpers consolidated
  into `src/assets/textureGenerators/chapter01.ts`–`chapter10.ts` plus
  `shared.ts`, wired through `ensureMapAssetTexture` via
  `CUSTOM_TEXTURE_GENERATORS`. Removed `makePersonTexture`/`isoPrism`/
  `drawIsoPrism`/`wallInset` wrappers from `BaseMapScene` (581 → 558 LOC).
  Bespoke per-scene art is now actually rendered; previously it was silently
  shadowed by Boot's generic versions.
- **Item 5 — done.** `flags.ts` now exports a `createFlagStore({ storage })`
  factory with an in-memory `FlagStorage` for tests; default singleton
  binds to `localStorage`. `dialogues.ts` collapsed to a single barrel
  (no more `export *`). `DialogueNode.id` removed (208 lines deleted across
  11 files); the map key is the source of truth. `RUMOUR_FLAGS` const drives
  `rumourCount`. `CHAPTER_COMPLETION_FLAGS: Partial<Record<ChapterId,
  string>>` centralises completion flags. New `scripts/lint-dialogues.mjs`
  validates `startId` and every `next:` reference; wired as
  `npm run lint:dialogues`.
- **Item 2 — done.** `BaseMapScene` deleted. All 21 chapter/city/road
  subclasses replaced by a single concrete `src/scenes/MapScene.ts` that
  consumes `MapDefinition` records. Polymorphic NPC `interact` calls
  collapsed to a discriminated `NpcAction` union (`{kind:'dialogue'}` or
  `{kind:'bab'}`).
- **Item 3 — done.** Each scene's geometry now lives in
  `src/data/maps/<key>.ts` as a `MapDefinition` (size, spawn, exits,
  buildings, decor, npcs, plus an imperative `build(ctx)` for fills and
  paths). `BuildingSpec.blocks?: false` opts out of collision for walkable
  structures (Ch5 bridge span, Ch9 roof parapets). All 18 maps registered
  via `src/data/maps/index.ts` → `MAP_DEFINITIONS`; `main.ts` iterates the
  registry into Phaser's `scene` array. Headless smoke test confirms all
  18 scenes boot without errors.
- Items 4, 6–10 — pending.

---


## 1. Per-scene texture makers duplicate the shared asset pipeline (High)

**Evidence**

- 18 files under `src/scenes/Ch*Scene.ts` (plus `CityScene`, `HouseQuarterScene`,
  `RoadScene`) declare `private make…Texture()` helpers. 56 unique method names
  total, with many repeats across scenes:
  - `makeLamp` (3 scenes), `makeLampTexture` (2), `makeWatchLamp` (2),
    `makeRugTexture` (2), `makeRock` (2), `makeFortress` (2),
    `makeCrowd`/`makeCrowdShadow` (2 each), `makeClosedDoor` (2),
    `makeChainCoil` (2), `makeButton` (2).
- 17 of those scenes override `ensureTextures()` and call it from `create()`
  before `super.create()`.
- Meanwhile `BootScene.create()` already calls
  `ensureTileTextures(this)` and `ensureMapAssetTextures(this)` from
  `src/assets/mapAssetLibrary.ts`, and `MAP_OBJECTS` in
  `src/assets/mapAssetDefinitions.ts` already enumerates all chapter assets
  (`ch1-…` through `ch10-…`) with stable texture keys.

**Impact**

- Every new chapter scene has to re-implement texture generation that already
  exists centrally.
- Identically-named methods drift (e.g., the two `makeRock` implementations are
  not guaranteed to match).
- `ensureTextures()` runs on every scene start; the asset library is idempotent
  via `texture.exists`, but the per-scene paths are not consistent.

**Proposed approach**

1. Move every per-scene `make*Texture` body into `src/assets/mapAssetTextures.ts`
   (or split into `mapAssetTextures/ch01.ts`, `…/ch07.ts`, etc. if the file
   grows past ~500 LOC) keyed by the existing texture id from `MAP_OBJECTS`.
2. Delete the 17 `ensureTextures()` overrides; rely on `BootScene` doing it
   once.
3. Where a chapter currently uses an asset that is not yet in `MAP_OBJECTS`,
   add it there so it is also pickable from the editor. This is the test of
   "did we really consolidate?" — the editor palette should be the union.

**Risk**: low. The library is already the canonical site; this is just
finishing a migration that's ~80 % done.

---

## 2. `BaseMapScene` subclass boilerplate is copy-paste shaped (High)

**Evidence**

- `src/scenes/BaseMapScene.ts:1` is 581 LOC, despite already extracting
  `baseMapHud.ts`, `baseMapFlow.ts`, `baseMapMovement.ts`, `baseMapReveal.ts`,
  `baseMapWorld.ts`, `baseMapTypes.ts`.
- Each of the 18 chapter scenes declares the same shape:

  ```ts
  protected mapWidth = …;
  protected mapHeight = …;
  protected sceneTitle = '…';
  constructor() { super('SceneKey'); }
  override create() { this.ensureTextures(); super.create(); }
  override getDefaultSpawn() { … }
  override buildMap() { … }
  override placeBuildings() { … }
  override placeDecor() { … }
  override spawnNPCs() { … }
  override setupExits() { … }
  ```

- `mapWidth`/`mapHeight`/`sceneTitle` as `protected` fields is a class-level
  contract that is easy to forget; nothing forces a subclass to set them.

**Impact**

- `Ch7BadashtCampScene` (245 LOC), `CityScene` (241), `Ch9TabrizSquareScene`
  (230), `RoadScene` (223), `Ch10SiyahChalScene` (208) are mostly hand-painted
  data with thin behaviour around it.
- Adding a new chapter requires reproducing the whole shape correctly.

**Proposed approach (data-driven)**

Define a single `MapDefinition` type that takes data instead of overrides:

```ts
interface MapDefinition {
  key: string;
  titleKey: string;
  width: number;
  height: number;
  spawn: { tx: number; ty: number };
  tiles: TileMap;            // current paint instructions
  buildings: PlacedAsset[];
  decor: PlacedAsset[];
  npcs: NpcSpec[];
  exits: ExitSpec[];
}
```

Then `BaseMapScene` becomes a single concrete class that consumes a
`MapDefinition`, and `src/main.ts` registers scenes from a registry:

```ts
for (const def of CHAPTER_MAPS) game.scene.add(def.key, new MapScene(def));
```

The "interesting" hand-painted parts (`paintRect`, `paintPath`, etc.) become
helper functions that produce `TileMap` data, not scene methods.

**Migration**: do this *after* item 1 lands. Each chapter scene becomes a
data file in `src/data/maps/ch*.ts`. Behavior that is genuinely unique to a
scene (custom timers, cinematic cues) stays as optional `onCreate(scene)` /
`onUpdate(scene)` hooks on the definition.

---

## 3. `src/main.ts` hand-imports 22 scenes (Medium)

**Evidence**

- `src/main.ts` imports Boot/Title/Dialogue/Journal/Settings/ChapterSelect/
  ChapterEnd/MapEditor + 14 chapter map scenes individually and lists them in
  `scene: [...]`.

**Impact**

- Adding a chapter requires editing two files: the new scene + the import list.
- Easy to forget; nothing fails loudly if you do.

**Proposed approach**

Drive `scene: [...]` from the chapter registry (or `import.meta.glob` for
`Ch*Scene.ts`). Once item 2 ships, this becomes a one-line `CHAPTER_MAPS.map`.

---

## 4. Oversized files past the 500 LOC AGENTS.md guideline (Medium)

`AGENTS.md` says "if the code is longer than 500 loc, then you can probably
refactor and split". Current offenders:

| File | LOC | Notes |
|---|---|---|
| `src/scenes/BaseMapScene.ts` | 581 | Already split; further extract NPC registry, exits, spawn, into `baseMapNpcs.ts` and `baseMapExits.ts`. |
| `src/scenes/MapEditorScene.ts` | 477 | Just under, but tool-state logic (selection, paint, drag, undo) is a state machine begging to be lifted into `mapEditorTools.ts`. |
| `src/scenes/TitleScene.ts` | 379 | Mixes dawn-background animation, title book opening, and main-menu layout. Background controller could move to `titleBackground.ts` (peer of existing `titleBookOpening.ts`). |
| `src/scenes/mapEditorPaletteView.ts` | 358 | Within budget but watch it. |
| `src/scenes/titleBookOpening.ts` | 327 | Within budget. |

Treat 581 as the only must-fix; the rest are watch-list.

---

## 5. Dialogue + flag system has small but real footguns (Medium)

**Evidence**

- `src/dialogue/flags.ts` is a module-level mutable `flags` object loaded
  from `localStorage` at import time. No init function, no "scope to a
  session" hook. Tests that import anything that imports flags get the
  real disk state.
- `src/dialogue/types.ts`: `DialogueNode.id` duplicates the map key in
  `DialogueTree` — the registry already keys by id. One source of truth is
  enough; pick the map key and drop `id` from the node, or vice versa.
- `src/data/dialogues.ts` does **both** `...spread` merge **and** `export *`
  re-exports of every chapter file. One barrel pattern is enough.
- `src/data/dialogues_ch/chapter01_shiraz.ts` derives `rumourCount` by hand
  from a hard-coded list of flag names. Drift risk every time a rumour is
  added.
- `src/data/chapters.ts` has `isComplete` predicates that each spell
  completion-flag names as string literals (`f.roadComplete`,
  `f.meccaComplete`, …). Centralise as `CHAPTER_COMPLETION_FLAGS:
  Record<ChapterId, FlagName>` so the predicates and flag definitions can't
  drift.
- `console.warn` is the only signal for a missing dialogue node id. There is
  already `scripts/lint-localization.mjs`; an analogous
  `scripts/lint-dialogues.mjs` should validate that every `next` id resolves
  and every `requires` flag is produced by some `effects.set` somewhere.

**Proposed approach**

- Wrap flags in a `createFlagStore({ storage })` factory; default-export an
  instance bound to `localStorage`. Tests pass an in-memory storage.
- Collapse `dialogues.ts` to a single barrel pattern; remove the spread or
  the `export *`, not both.
- Add `lintDialogues` script; wire it into `npm run build` step or a
  `pretypecheck` hook.
- Replace the `f.roadComplete`-style strings in chapters with a typed map
  built from a `FlagName` union.

---

## 6. i18n loads every locale eagerly (Medium)

**Evidence**

- `src/i18n.ts:1-8` statically imports `fa`, `es`, `fr`, `he`, `zh`, `ja`,
  `ko` plus the default `en`.
- Each locale ends up in the initial bundle even though the user has selected
  one.

**Proposed approach**

- Convert to dynamic `import()` per `Locale`; cache the resolved catalog.
- Initial paint can keep the persisted-locale's catalog inline (it's already
  a known string at boot) and lazy-load others on switch.

This is bundle-size only, no behavioral change. Worth doing once content
volume grows; right now it's a few KB per locale.

---

## 7. `package.json` and `tsconfig.json` hygiene (Low)

**`package.json`**

- `"main": "index.js"` is dead — this is an ESM Vite app with no library
  entry. Remove.
- `"test"` is the placeholder default. Either add a runner (Vitest is the
  natural pick given Vite) or remove the script entry so it doesn't claim
  to do something it doesn't.
- `@types/node ^25.9.1` is bleeding-edge for a browser-only app that imports
  no node types in `src/`. Consider dropping it entirely or pinning to LTS.
- No ESLint / Prettier. Adding ESLint with `@typescript-eslint` would catch
  the kinds of drift items 1, 2, and 5 are about.

**`tsconfig.json`**

- `strict` is on. Good.
- `noUncheckedIndexedAccess` is off. Turning it on would catch
  `MAP_OBJECT_BY_ID.get(id)` style lookups that are not currently
  type-safe (`getMapObjectDefinition` only narrows because it throws).
- No `paths`. Deep relative imports like
  `../../assets/mapAssetTextures` are common; an `@/` alias would reduce
  churn when files move.

---

## 8. Layout magic numbers and resize strategy (Low)

**Evidence**

- `src/ui/responsive.ts` carries unnamed numbers (`760`, `1.05`, `0.025`).
- Most scenes use `restartSceneOnResize` — a hammer that re-runs `create()`.
- `DialogueScene.handleResize` is the better pattern: incremental relayout
  with no scene restart.

**Proposed approach**

- Hoist responsive constants to named exports (`MOBILE_BREAKPOINT_PX`,
  `HUD_SCALE`, `HUD_PADDING_RATIO`, …).
- Adopt `handleResize` style across HUD and map scenes once item 2 has
  centralised them.

---

## 9. Repo root has an unsorted asset and a script (Low)

**Evidence**

- `book-animation.svg` (150 KB) and `generate-book.js` live at the repo
  root, with no docs.
- `public/` already exists for static assets (currently
  `apple-touch-icon.png`, `dawnbreakers-icon.svg`, `favicon.svg`).

**Proposed approach**

- Move `book-animation.svg` into `public/` (or `src/assets/` if it is
  imported, not served).
- Move `generate-book.js` into `scripts/`. If it is one-shot, document it
  in `scripts/README.md`. Convert to TS or `.mjs` for consistency with
  `scripts/lint-localization.mjs`.
- README does not currently mention either; once moved, add a one-liner.

---

## 10. Story-content guardrails (Low / process)

`AGENTS.md` already states central figures (Bahá'u'lláh, the Báb) must not
appear as interactable characters and that em-dash structures are banned in
game text. Both are runtime/content rules that no script enforces today.

**Proposed approach**

- Extend `scripts/lint-localization.mjs` (or a sibling script) to fail on:
  - The em-dash character `—` in any in-game string catalog.
  - NPC ids matching a denylist of central figure names.

This is cheap insurance against drift as more chapters land.

---

## Suggested execution order

1. Item 1 — texture maker consolidation. Highest ratio of duplication
   removed to risk. Self-contained.
2. Item 5 — dialogue + flag papercuts and the new lint script. Cheap, and
   catches issues that items 2 and 6 will surface.
3. Item 2 — data-driven `MapDefinition`. Bigger lift; should be a deliberate
   PR after items 1 and 5 have stabilized the foundation.
4. Item 3 — auto-register scenes (falls out of item 2 nearly free).
5. Items 4, 6, 7, 8, 9, 10 — opportunistic.

## Out of scope for this audit

- Performance / asset memory profiling (no measurements taken).
- Gameplay design review of chapters.
- Localization completeness across the 8 locales.
- Save-game format design beyond the one localStorage key.

---

*Generated by a fresh audit pass; no code was modified. Numbers are from
`wc -l` and `grep` snapshots and may drift with new commits.*
