# The Dawn-Breakers

A 2.5D isometric web RPG inspired by Nabíl's *The Dawn-Breakers*. Built with
Phaser 3 + TypeScript + Vite. This first slice has **no combat** — just an
isometric map of Shíráz and a branching dialogue with the Báb on the night of
22–23 May 1844.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL.

## Controls

- **Arrow keys / WASD** — walk
- **E** — speak with a nearby character
- **1–9** — pick a dialogue choice (or click)

## Project structure

```
src/
  main.ts                 # Phaser game config + scene list
  scenes/
    BootScene.ts          # generates placeholder textures (no art assets yet)
    TitleScene.ts         # title card
    ShirazScene.ts        # isometric map + player movement + NPC interaction
    DialogueScene.ts      # overlay UI that renders a DialogueTree
  dialogue/
    types.ts              # DialogueTree / DialogueNode / DialogueChoice
    flags.ts              # persisted story flags (localStorage)
  data/
    dialogues.ts          # the Báb-declaration dialogue tree
```

## Adding a new dialogue

1. Add a `DialogueTree` in `src/data/dialogues.ts`.
2. Register an interactable in a scene (see `ShirazScene.spawnHouseAndNPC`)
   that calls `this.scene.launch('Dialogue', { tree, onComplete })`.
3. Use `effect: { set: { someFlag: true } }` on choices to record outcomes;
   read them later with `getFlags()`.

## Adding a new scene / location

1. Create `src/scenes/MyScene.ts` extending `Phaser.Scene`.
2. Register it in the `scene` array in `src/main.ts`.
3. Transition with `this.scene.start('MyScene')`.

## Roadmap ideas

- Replace generated placeholder textures with real isometric art.
- More locations: Karbilá, Búshihr, the road to Mákú, Shaykh Ṭabarsí.
- Letters of the Living as recruitable companions whose presence unlocks
  dialogue choices via flags.
- A small inventory of letters / tablets the player can carry between scenes.

## A note on history

The dialogue is a **dramatised paraphrase**, not a quotation of Nabíl's
narrative. Treat it as a starting point and refine with primary sources.
