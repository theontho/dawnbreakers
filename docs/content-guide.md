# Content Guide

How to write chapters, maps, and dialogue for *The Dawn-Breakers*. Read
`AGENTS.md` first; its story rules override everything here.

## Non-negotiable story rules

- **Central figures are never characters.** The Báb and Bahá'u'lláh never
  appear as map NPCs, never have a `speaker:` line, and are never addressed
  by the player as present interlocutors. The story may *speak of* them:
  through narration (`speaker: 'Narrator'`), through other characters'
  testimony and recollection, through threshold objects (a closed door, a
  lamp, a writing desk, an empty space). `npm run lint:content` enforces the
  speaker rule.
- **No em-dashes** (`—`) in any player-facing text. Rewrite the sentence
  with commas, colons, full stops, or parentheses. Lint enforces this too.
- **History first.** Ground scenes in Nabíl's narrative. Dialogue is a
  dramatised paraphrase, not quotation; do not invent miracles, battles, or
  doctrine. When unsure of a detail, stay impressionistic rather than wrong.
- **Reverent, literary, concrete.** Prefer sensory detail (jasmine, lamp oil,
  river cold, snow on a parapet) over abstraction. Let ordinary people be
  specific: their trade, their fear, their small kindness. Opponents are
  human too; avoid caricature.

## The player

The player is a fictional seeker, a fellow student of Siyyid Káẓim who
travelled to Shíráz with Mullá Ḥusayn. In chapter 1 they keep vigil outside
the Báb's door on the night of 22 May 1844 and hear Mullá Ḥusayn's testimony
at dawn. Across later chapters they are a witness and messenger moving
through the events Nabíl records; they are never a famous historical figure.

Flags carried forward:

- `recognised === true`: the player believed at dawn in chapter 1;
  `false`: they asked for time. Later dialogue may branch on this with
  `requires: f => f.recognised === true`.
- Each chapter's completion flag (see `CHAPTER_COMPLETION_FLAGS` in
  `src/data/chapters.ts`).

## Where a chapter lives

| What | File |
| --- | --- |
| Dialogue trees | `src/data/dialogues_ch/chapterNN_<name>.ts` (exports `chapterNNDialogues`) |
| Maps | `src/data/maps/<sceneKey>.ts`, registered in `src/data/maps/index.ts` and the chapter's `scenes` in `src/data/chapters.ts` |
| Objectives and journal | `src/data/story/chapterNN.ts` |
| Placeable objects and bespoke textures | `src/assets/chapters/chapterNN.ts` (`CHNN_OBJECTS`, `CHNN_TEXTURE_GENERATORS`) |

## Maps (`MapDefinition`)

- Size: aim for roughly 20 to 32 cells per side. Small maps feel like stages;
  very large ones feel empty. Fill space with purpose: paths that lead
  somewhere, clusters of props that tell a story, quiet corners.
- `build(canvas)` paints tiles (`grass`, `path`, `stone`, `water`, `sand`)
  and can `block` cells (water is not blocked automatically).
- `buildings` occupy footprints and block by default. `decor` is one cell,
  blocking only with `blocks: true`, and can take `present: f => ...` to
  come and go with the story (a crowd that disperses, a flag that is struck).
  Keep paths walkable.
- `npcs`: people and story objects. Each has `dialogue: '<tree id>'`.
  - `gate: { when: f => ..., lockedDialogue: '<id>' }` swaps in another
    tree until a condition holds (for example, a door that only opens once
    the player has learned enough).
  - `present: f => ...` makes someone arrive or leave as flags change. It is
    re-evaluated after every dialogue.
- `exits`: stepping off the map edge from `fromX/fromY` in direction
  `dx/dy`. Optional `requires: f => ...` and `lockedLabel` keep an exit shut
  until the story allows. Pair every exit with a matching return exit on the
  target map. Make sure the target spawn cell is walkable.
- `ambience` sets the mood. It can be a function of flags
  (`ambience: f => f.stormBroke ? {...} : {...}`) and is re-applied after
  every dialogue:
  - `wash: { color, alpha }` is a multiply colour over the world. Night:
    `0x2a3560` at 0.5 to 0.6. Dusk: `0xd08850` at 0.3. Prison gloom:
    `0x2a2a30` at 0.6. Leave it out for full daylight.
  - `lights: [{ gridX, gridY, radius, color, intensity }]`: extra light
    pools. `lamp` decor glows by itself.
  - `particles`: `dust`, `motes`, `fireflies`, `snow`, `embers`, `spray`,
    `leaves`, or `rain`.
  - `vignette`: 0..1 or `false`.
  - `music`: the score's mood: `title`, `dusk`, `night`, `road`, `sea`,
    `pilgrimage`, `city`, `court`, `mountain`, `garden`, `forest`,
    `siege`, `sorrow`, `prison`, or `hope`. It crossfades when a flag
    change picks a different mood.
  - `sound`: ambient layers (`wind`, `breeze`, `rain`, `sea`, `river`,
    `fire`, `crickets`, `birds`). Leave it out and the bed follows the
    particles; campfires and braziers add a crackle by themselves.

## Dialogue (`DialogueTree`)

- `speaker` is a role or name: `'A Water-Carrier'`, `'Quddús'`,
  `'Narrator'`. Every distinct speaker string needs translating, so reuse
  them within a chapter.
- Nodes without `choices` show a single Continue. Choices without `next`
  end the conversation.
- Set flags with `onEnter: { set: {...} }` on a node or `effect` on a choice.
  The chapter-complete flag is usually set on the final narrator node.
- `requires: f => ...` hides a choice until a condition holds. Never leave a
  node where every choice can be hidden.
- People hidden behind tall scenery are drawn as a faint golden silhouette
  above it, and their speech mark always floats on top, so they stay
  findable. Still, prefer placing people where they can be seen.
- Keep lines short enough to read comfortably: one to three sentences per
  node, rarely more than 60 words.
- Every NPC conversation should leave the player with something: a fact, a
  flag, a feeling, a direction.

## Objectives and journal (`ChapterStory`)

- `objectives` is an ordered list. The HUD shows the first one not yet
  `done`. Three to five per chapter, phrased as gentle imperatives ("Find
  Quddús among the tents"). Use `progress` for counts.
- `journal` entries appear when their `flag` is set (or equals a value with
  `equals`). Write them in the second person past tense, as the player's
  notes: one or two sentences, a title of a few words.

## Art

Textures are painted at boot with the canvas kit in `src/assets/art/`:
`canvasKit.ts` gives each face of an isometric box a flat "face space" to
draw in, `materials.ts` has plaster, brick, stone, planks and glazed tile,
and `ornaments.ts` has arches, doors, lattice windows, domes, parapets and
wind-catchers. Light comes from the upper left. `house`, `tree`, `cypress`
and `stall` have variants that maps pick per placement automatically.
Check new art with `npm run gallery -- --filter <id>`.

Prefer existing objects (see `src/assets/mapAssetDefinitions.ts` and each
`src/assets/chapters/chapterNN.ts`). New characters are cheap: add an entry
to `CHNN_OBJECTS` with `kind: 'character'`, `category: 'characters'`, and a
`character` look (`body`, `skin`, `clothing.style` of `robe | cloak | vest |
uniform | sash | wrap | apron`, `hat.style` of `none | turban | cap | veil |
headscarf | hood | tallHat`). Bespoke props go in `CHNN_TEXTURE_GENERATORS`
keyed by object id. Object `label`s are shown in the map editor and must be
translated, so reuse an existing label where one fits.

## Translation

Every player-facing string (`text`, `speaker`, `prompt`, `label`, `title`,
`body`, `description`, objective `text`) is a key in each locale file under
`src/i18n/locales/`. `npm run lint:localization` lists the missing ones.

## Checks

```bash
npm run typecheck
npm run lint            # eslint, localization, dialogue references, content rules
npm run smoke           # boots every map, opens every NPC dialogue
npm run smoke -- --scenes City,Road --shots out/shots   # screenshots to inspect
```
