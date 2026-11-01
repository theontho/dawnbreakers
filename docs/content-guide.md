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
travelled to Shíráz with Mullá Ḥusayn. In the first chapter they sit in
Siyyid Káẓim's circle at Karbilá in his last winter and keep the forty days
at Kúfih; in the second they keep vigil outside the Báb's door on the night
of 22 May 1844 and hear Mullá Ḥusayn's testimony at dawn. Across later chapters they are a witness and messenger moving
through the events Nabíl records; they are never a famous historical figure.

Where the pilgrim cannot have been present (Ṭihrán and Núr while they sail
for Mecca; Baghdád while they are at Mecca; Karbilá and Qazvín while they are in Shíráz, Iṣfahán and the
mountain prisons; Nayríz days before Tabríz), the chapter has its own
witness: a student of the Ṭihrán madrasa, a young woman of Qazvín, a youth
of Chinár-Súkhtih. Such a chapter says so in its `description`, in an
`opening` narration (a dialogue id on the chapter in `src/data/chapters.ts`,
played once on first arrival in its start scene, setting a flag that reveals
a first journal entry), and gives the witness a `player` figure. Its
dialogue never recognises the player from other chapters or gates on their
flags.

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

## Journeys between chapters

`src/data/journeys.ts` holds the road from each chapter to the next: a
title, `subtitle` (where and when) and `description`, the place and local
time of the first night, how many `days` the road takes at a caravan's
pace, the bearing the view faces, the `terrain`
(`desert`, `mountains`, `forest`, `snow`, `lakeside` or `sea`), and the
`party` drawn walking (`walker`, `staff`, `lantern`, `mule`, `packMule`,
`rider`, `standard`, `camel`, `litter`). The sky is the true one for that
night: real Hipparcos stars, the moon in its phase, and twilight from the
sun. When the player continues from the chapter-end card, `JourneyScene`
plays the whole road without a cut: the first night watched, the days
between rolling by faster the more of them there are (so the moon's phase
shows the weeks going by), and the last night slowing into dawn. The
title's **Journeys** menu plays
each road the same way and goes on to the next, until the player takes the
clock with the controls for the rate and direction of time, comet-tail or
long-exposure star trails, and the facing.

- The party is the chapter's witness and companions. Never draw the central
  figures among them; speak of them in the `description`.
- Face the view where the sky is worth seeing: north for trails circling
  the pole, toward the moon when it is up (`npm run journeys` screenshots
  every journey into `out/journeys/`).

## Maps (`MapDefinition`)

- Size: aim for roughly 20 to 32 cells per side. Small maps feel like stages;
  very large ones feel empty. Fill space with purpose: paths that lead
  somewhere, clusters of props that tell a story, quiet corners.
- `build(canvas)` paints tiles (`grass`, `path`, `stone`, `water`, `sand`)
  and can `block` cells (water is not blocked automatically). Water moves
  by itself: ripples, glints and foam at the banks drift with a current
  that runs along a river's length (still for a pond). `water: { flow }`
  sets the current; `water: { openSea: true, roll: true }` draws open sea
  under the whole view, out past the map's edges, with the deck rolling
  (the pilgrim ship). Plants outdoors sway in the wind on their own, and a
  fountain's jet plays. Scenery of a map's own that moves (the ship's wake)
  goes in `animate` on its definition.
- A floor laid with a few big carpets reads better than a chequer of small
  rugs: `carpet(x, y, w, h, 'crimson' | 'indigo' | 'madder')` from
  `src/assets/carpetObjects.ts` covers several cells and lies under everyone
  standing on it (single prayer rugs in rows stay `rug`).
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
- **Placing people and story objects.** Interaction points must be
  visible: smoke fails anything more than 60% hidden behind trees, walls or
  buildings, and notes anything more than 35% covered. Things lower on the
  screen (higher `x + y`) draw in front, so a tall tree or building south
  or east of a person, in the same screen column (similar `x - y`), hides
  them: a house a few cells away, an old oak (575 px) up to about 36.
  Woodland scattered with `scatterWoodland` keeps each tree off the
  `watched` cells it is given by that tree's own height and crown, growing
  a younger tree where an old one would cover someone. Stand people on the camera side of tall things, in
  clearings and on open ground, and keep their cell and a door's approach
  cell clear of trees in front. A partly covered thing is fine (a wide
  road half under a wall, a person whose feet are behind a crate); an exit
  fails only when fewer than half of its cells can be seen. Doors painted
  on a building's face are measured as a doorway on that face.
- `exits`: stepping off the map edge from `fromX/fromY` in direction
  `dx/dy`. Optional `requires: f => ...` and `lockedLabel` keep an exit shut
  until the story allows. Pair every exit with a matching return exit on the
  target map. Make sure the target spawn cell is walkable.
- Exit directions are read on the **screen**: up is north, right is east.
  The grid is drawn as a diamond, so its edges face the screen's
  diagonals: `y = 0` (`dy: -1`) is the upper-right edge, north-east;
  `x = max` (`dx: 1`) the lower-right, south-east; `y = max` (`dy: 1`) the
  lower-left, south-west; `x = 0` (`dx: -1`) the upper-left, north-west.
  An arrow or compass word in an exit's `label` or `lockedLabel` says
  where it leads from here, and must match the edge: a cardinal (`↑`,
  "north", "the road west") fits either edge within 45° of it (north is the
  upper-right or upper-left edge), a diagonal (`↗`, "south-east") only its
  own edge. Capitalised compass words inside a label are names ("the North
  Gate") and "from the north" says where a road comes from; both are
  ignored. `checkExitBearings` (`src/scenes/mapExitBearings.ts`) runs at
  map load in development, so `npm run smoke` fails on a mismatch and
  names the edges that would fit.
- When it fails, put the exit where the story's geography says the place
  lies (Núr and Mázindarán are north of Ṭihrán, Búshihr south of Shíráz,
  Tabríz north-west of Ṭihrán): move the exit cell to that edge and paint
  its road through to it, or, if the place does not care, correct the
  label. Keep the pairs symmetric: leaving by a north-ish edge should bring
  the player in at a south-ish edge of the next map, and the return exit
  back at the edge they left by. Dialogue, objectives and journal text that
  give directions ("take the road north", "the west gate") must agree.
- `doors`: a way into another map, usually a building's interior. Put it on
  the building cell where the door is painted (`gridX/gridY`); the player
  stands in front and presses E or clicks it. `requires` and `lockedLabel`
  keep it shut until the story allows, and a small golden arch marks it.
  Make sure the cell in front is walkable, and give the interior an exit
  that returns the player there.
- Interiors are ordinary maps with `interior: true` (masonry slab edges).
  Floor them with `floor` (fired tile) or `wood`, run `interior-wall` pieces
  (or another connected interior wall style) along the back edges, `y = 0`
  and `x = 0`, and leave the front open as a cut-away. `interior-mihrab` is
  a prayer niche that sits flush in an interior wall. See
  `src/data/maps/ch1IlkhaniMosque.ts`.
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
  findable. That is a fallback, not a placement: see "Placing people and
  story objects" under Maps.
- Keep lines short enough to read comfortably: one to three sentences per
  node, rarely more than 60 words.
- Every NPC conversation should leave the player with something: a fact, a
  flag, a feeling, a direction.

### Mini-games

A choice with `play: 'LampGame'` (any `MiniGameId`) hides the dialogue and
plays that chapter's mini-game over the map, then goes on to the choice's
`next`. The games live in `src/scenes/minigames/`, one scene each on
`MiniGameScene`. Each writes its result into the flags, and the node after it
branches on that with `requires`, so the same moment reads differently
depending on how it went.

| Game | Chapter | Where | Result flag |
| --- | --- | --- | --- |
| `LampGame` | Mecca | the storm at the cabin door | `ch3LanternOuts` |
| `InkGame` | Mountain prisons | Siyyid Ḥusayn's room at Mákú | `ch6CopiedLine` |
| `CoffeeGame` | Trial at Tabríz | the foot of the hall steps | `trialOverheard` |
| `RationGame` | Ṭabarsí | the young companion at the cauldron | `ch8RationFavoured` |
| `CurtainGame` | Ṭáhirih | the curtain at Karbilá | `qzListened` |
| `LanesGame` | Ṭihrán and Núr | after the scroll is given | `nurLanesNoticed` |

Rules for them:
- Nothing can be lost. However a game goes, the story goes on, and how it
  went only changes what is said about it. Each one can be skipped (Skip, or
  Escape), which records a middling result.
- A game is one verb that belongs to its chapter: shielding a flame,
  copying a line, listening at a door. No combat, no score on screen, and
  the central figures are never seen or heard in one. At the trial, only
  the questions carry through the doors, never the answers.
- Play with the pointer and with the keyboard, and fit a phone's screen.
  Keep time with `elapsed` and `dt`, which follow the wall clock.
- `npm run minigames` plays each one start to finish with a bot and saves a
  screenshot of each (`--quick` skips after the screenshot).
- The title's Mini-games screen plays any of them as practice
  (`practice: true` in the launch): the result is shown, not written to the
  flags. Add a new game there too. The same screen checks for HDR: it says
  why the sun and moon glow is or is not on, and draws a patch of white
  beside 4× white.

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
wind-catchers. `facade.ts` has person-scaled openings (a door in a framed
recess, an iwan, high windows, worn plaster) and `streetLife.ts` the things
at a building's foot (benches, water jars, potted plants, steps, dust).
Light comes from the upper left. The town buildings, trees and stalls have
variants that maps pick per placement automatically.
Check new art with `npm run gallery -- --filter <id>`.

### Scale and proportion

Everything is measured against a person, painted and drawn 40 px tall
(1.75 m): a metre is about 23 px, and one cell (32 px along a wall face)
is about 1.4 m. Crowds, pilgrim clusters and animals use the same scale.
**Every door must be at least 1.1 times a person's height: 44 px of clear
opening.** `docs/true-scale.md` has the full contract, including real
footprints for each kind of building.

| Element | Size |
| --- | --- |
| Storey | About 80 px (3.5 m) |
| Courtyard or garden wall | About 80 px (3.5 m, above head height) |
| House door | About 23 px wide, 48 px tall (never under 44), set in a recess with a frame |
| Monumental portal (mosque, caravanserai, gate) | Taller than wide, about 1:2; the door inside it still person-sized |
| Window | About 12 px wide, 18 px tall, sill at least 30 px above the ground |
| Beam ends, parapets, steps | Small: 3 to 7 px |

Doors and windows read as small openings in a big plain wall; that is
what makes Persian buildings look massive and private.

Buildings should not look like boxes stamped on the grid. Inset the main
block from some footprint edges (3 to 8 px), add a lower wing, porch, steps
or courtyard wall, vary roof heights, and let something sit at the foot
(a bench, plants, a water jar, dust). Walls that run for several cells are
placed one cell at a time and join automatically; the styles are in
`src/assets/art/wallStyles.ts`, the joining painter in `wallPainter.ts`.

### Walls and doors

A door or gate in a wall is a piece of that wall, never a block set in a
gap. Every wall style tall enough for a person-sized door gets two pieces
derived from it (`src/assets/art/wallDoors.ts`): `<style>-door`, shut, and
`<style>-doorway`, open and walkable; a style gives its doorway character
with a `door` look (a timber lintel and tile panel on a courtyard wall, a
stone lintel on a city wall) or opts out with `door: false`. Place them with
the run:

```ts
...wallRun('compound-wall', 9, 8, 23, 8, { doors: [[16, 8]] }),
...wallRun('town-wall', 0, 26, 39, 26, { doors: [{ at: [7, 26], open: f => !!f.night }] }),
```

`gaps` leaves cells open (a lane mouth, a gatehouse's place). A story
object at a door piece (a shut door to knock at) is an NPC with no
`texture`: the wall draws it. A gatehouse, tower or house a wall should run
into goes in that style's `joins`. `checkWallSeams` (`src/scenes/mapSeams.ts`)
runs at map load in development, so `npm run smoke` fails a map that pastes
a block into a wall's gap, puts anything but the wall on a wall cell, or
sets a door, gate or tower against a run's end without joining it, and its
message says which fix applies.

**Street fronts.** Some buildings are their own street wall: their art
paints the way in on a face, a gateway, a portal or a row of shop bays. A
courtyard house (`town-house-large`) is "a long plain wall and a gateway"
from the lane; so are the court-glimpse town house (`town-house~2`,
`zanjan-hujjat-house`), the mosques' portals, the bazaar row, the
caravanserai, the palace portico and the residence and serai gates. The art
declares that face next to itself (`front: { side, door }` on a house
variant, a `*_FRONT` constant otherwise), gathered in
`src/assets/art/buildingFronts.ts`. No wall may run along a declared front
within two cells of it (except on the cut-away south and east edges): the
gateway would stand right behind the wall, pasted onto it, with two doors
where there should be one. Do not put a courtyard wall and a door piece in
front of such a house; let its own gateway be the door, and run the garden
walls back from its front corners (walls join town houses):

```ts
{ gridX: 12, gridY: 0, w: 8, h: 7, texture: 'town-house-large' },
...wallRun('compound-wall', 9, 6, 11, 6),   // up to the house's west corner
...wallRun('compound-wall', 20, 6, 23, 6),  // and from its east corner
```

A door interaction at the house's gateway is an NPC with no `texture` (or a
`DoorSpec`) on the front's door cell, the footprint cell on that face under
the door (for an 8 x 7 courtyard house at `(gx, gy)`, `(gx + 5, gy + 6)`);
the seam check names that cell, the speech mark floats at door height on the
face, and smoke measures it as a doorway on the building. If the story needs
a yard wall in front, give the building two clear cells of yard or use a
variant with no street front (`variant: 0` or `1` of `town-house`).

Prefer existing objects (see `src/assets/mapAssetDefinitions.ts` and each
`src/assets/chapters/chapterNN.ts`). New characters are cheap: add an entry
to `CHNN_OBJECTS` with `kind: 'character'`, `category: 'characters'`, and a
`character` look (`body`, `skin`, `clothing.style` of `robe | cloak | vest |
uniform | sash | wrap | apron`, `hat.style` of `none | turban | cap | veil |
headscarf | hood | tallHat`). Bespoke props go in `CHNN_TEXTURE_GENERATORS`
keyed by object id. Object `label`s are shown in the map editor and must be
translated, so reuse an existing label where one fits.

## Translation

The game ships in English, Farsi (right-to-left, Persian digits) and
Simplified Chinese (CJK, no word spaces): three scripts that exercise the
interface's hard cases. Every player-facing string (`text`, `speaker`,
`prompt`, `label`, `title`, `body`, `description`, objective `text`) is a
key in `src/i18n/locales/fa.ts` and `zh.ts`; `npm run lint:localization`
lists the missing ones.

Translate in batches, not string by string: the fixed cost of a translation
pass (context, terminology, lints) is far larger than the words. Hand the
batch to the `translator` subagent (`.claude/agents/translator.md`, runs on
a smaller model). It works from `docs/translation-glossary.md`, generated by
`npm run i18n:glossary` from the catalogs (names, titles, labels, and the
core terms curated in `scripts/i18n-glossary.mjs`), instead of reading the
large catalogs, and regenerates it after importing.

## Checks

```bash
npm run typecheck
npm run lint            # eslint, localization, dialogue references, content rules
npm run smoke           # boots every map, opens every NPC dialogue
npm run minigames       # plays every chapter's mini-game with a bot
npm run smoke -- --scenes City,Road --shots out/shots   # screenshots to inspect
npm run look -- City:8:13                                # one spot, up close
```
