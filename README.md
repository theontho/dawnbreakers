# The Dawn-Breakers

A 2.5D isometric web RPG inspired by Nabíl's *The Dawn-Breakers*. Built with
Phaser 3, TypeScript, and Vite. The current prototype is **non-combat** and
focuses on isometric exploration, reflective dialogue, chapter progression,
journals, and historical set pieces.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL.

Useful checks:

```bash
npm run typecheck
npm run lint:localization
npm run build
```

## Controls

- **Arrow keys / WASD** - walk
- **E** - speak with a nearby character or interactable story object
- **1-9** - pick a dialogue choice, or click/tap the choice
- **J** - open the journal
- **Esc** - open settings

## Project structure

```
src/
  main.ts                 # Phaser game config + scene list
  scenes/
    BaseMapScene.ts       # shared isometric scene behavior
    baseMapTypes.ts       # shared map, tile, geometry, and spawn types
    baseMapReveal.ts      # interactable reveal mask helpers
    isoGeometry.ts        # shared isometric projection/drawing helpers
    MapEditorScene.ts     # in-game map editor
    mapEditor*.ts         # editor storage, geometry, asset picker, and world helpers
    TitleScene.ts         # title card and chapter entry
    titleControls.ts      # title screen button/dropdown helpers
    DialogueScene.ts      # overlay UI that renders a DialogueTree
    JournalScene.ts       # readable entries and chapter notes
  dialogue/
    types.ts              # DialogueTree / DialogueNode / DialogueChoice
    flags.ts              # persisted story flags (localStorage)
  data/
    chapters.ts           # chapter registry and completion predicates
    dialogues.ts          # dialogue registry
    dialogues_ch/         # chapter-owned dialogue modules
  assets/
    mapAssetLibrary.ts    # public map asset exports
    mapAssetDefinitions.ts
    mapAssetTextures.ts
    mapAssetTypes.ts
  i18n/
    locales/              # current locale content
```

## Adding a new dialogue

1. Add a `DialogueTree` in `src/data/dialogues.ts`.
2. For chapter-owned content, prefer a module in `src/data/dialogues_ch/` and
   register it through the dialogue registry.
3. Register an NPC or story object in a `BaseMapScene` subclass that calls
   `this.startSimpleDialogue('dialogue-id')`.
4. Use `effect: { set: { someFlag: true } }` on choices to record outcomes;
   read them later with `getFlags()`.

## Adding a new scene / location

1. Create `src/scenes/MyScene.ts` extending `BaseMapScene` for explorable maps.
2. Register it in the `scene` array in `src/main.ts`.
3. Add chapter metadata in `src/data/chapters.ts` when it belongs to chapter
   progression.
4. Transition with `this.scene.start('MyScene')`.

Central figures can be spoken of and represented through setting, narration, or
threshold objects, but should not be implemented as ordinary interactable NPCs.

## Roadmap ideas

- Replace generated placeholder textures with real isometric art.
- More locations: Karbilá, Búshihr, the road to Mákú, Shaykh Ṭabarsí.
- Letters of the Living as recruitable companions whose presence unlocks
  dialogue choices via flags.
- A small inventory of letters / tablets the player can carry between scenes.
- A narrative-friendly localization/content pipeline is deferred for now. The
  current locale files remain in place.

## A note on history

The dialogue is a **dramatised paraphrase**, not a quotation of Nabíl's
narrative. Treat it as a starting point and refine with primary sources.
