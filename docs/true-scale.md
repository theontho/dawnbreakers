# True scale

Every map is built at true scale: people at their real size among
buildings of real proportions. This is the contract every map and
structure follows.

## The scale

- One cell runs 32 px along a wall face: about **1.4 m**.
- A person is painted and drawn **40 px** tall (1.75 m), so **1 m is about 23 px**.
- A storey is about **80 px** (3.5 m). Doors are about **23 x 48 px**
  (never shorter than 44 px: 1.1x a person), in a framed recess with a step.
  Windows about 12 x 18 px, sills 30 px or more above the ground.
- Real footprints: a small house 5x4 cells, a town house 6x5, a courtyard
  house 8x7, a neighbourhood mosque 8x7, a congregational mosque 12x10 or
  more, a caravanserai about 20x16, a tent 3x3 to 5x4. Trees at their
  heights, by age (see "Trees" below).
- Keep any single texture under about 600 px tall and 1024 px wide.

## Trees

Trees come in ages as well as species, so a stand mixes saplings, trees
in their prime and a few old giants. Each texture has several variants.

| Tree | Texture | Height | px |
| --- | --- | --- | --- |
| Oak (chestnut-leaved) | `oak-young` / `oak-mature` / `oak-old` | 8 to 12 / 15 to 19 / 21 to 25 m | 190 to 270 / 350 to 430 / 490 to 575 |
| Oriental beech | `beech-young` / `-mature` / `-old` | 9 to 12 / 16 to 19 / 22 to 25 m | 200 to 275 / 360 to 435 / 500 to 580 |
| Persian ironwood | `ironwood-young` / `-mature` / `-old` | 5 to 7 / 8 to 10 / 11 to 13 m | 120 to 160 / 190 to 230 / 255 to 300 |
| Caucasian alder | `alder-young` / `-mature` / `-old` | 6 to 9 / 11 to 14 / 16 to 20 m | 140 to 205 / 255 to 320 / 370 to 455 |
| Walnut | `walnut` | 10 to 18 m, broad | 230 to 410 |
| Mulberry | `mulberry` | 5 to 8 m | 120 to 180 |
| Apple, quince, pomegranate (variant 2) | `fruit-tree` | 3.5 to 5.5 m | 84 to 128 |
| Apricot (summer, in fruit) | `apricot-tree` | 4 to 5.5 m | 95 to 130 |
| Pollard (cut for fodder) | `pollard` | 3.3 to 5 m | 76 to 115 |
| Plane (chinár) | `plane-tree` | 9 to 16 m | 205 to 360 |
| Old plane | `plane-tree-old` | 24 to 25 m | 560 to 575 |
| Cypress | `cypress` | 6.5 to 16.5 m | 150 to 380 |
| Bitter orange (Shíráz, Iṣfahán) | `orange-tree` | 3.5 to 4 m | 82 to 90 |

Young trees are slight, the crown narrow and low; old ones stand on a tall
clean bole under a broad crown. Woods scattered with `scatterWoodland`
(`src/data/maps/woodland.ts`) are graded by depth from paths, clearings and
fields: young at the edges, older further in, giants in the depths with a
few near the open as landmarks; cells near the `village` cells it is given
grow orchard, mulberry, walnut and pollards instead. The bitter orange
belongs to the warm south and the Caspian shore; in the cold towns of the
north a court grows pomegranates (`fruit-tree`, variant 2).

## Building a map

1. Size the map for the place: city maps run roughly 50 to 60 cells a
   side, small scenes 30 to 40.
2. Give the place room for everything it holds. Lanes are 2 to 3
   cells wide, squares larger.
3. Record the narrative geography in the file's header comment. When an
   exit moves, update the spawn cells of the exits on other maps that lead
   here.
4. Use the shared true-scale town buildings (`src/assets/townObjects.ts`,
   art in `src/assets/art/town/`) where they fit: `town-house-small`,
   `town-house`, `town-house-large`, `mosque-great`, `mosque-local`,
   `bazaar-row`, `market-stall`, `city-gate`, `town-wall`,
   `compound-wall`, `fountain-pool`, `plane-tree`, `cypress`,
   `orange-tree`. `src/data/maps/wallRuns.ts` lays straight wall runs.
5. A chapter's own structures live in its `CHxx_OBJECTS` with art in
   `src/assets/art/`; when one changes, repaint it in place (same object id
   and texture key) rather than adding a second copy.
6. Walls on a map's south and east edges (`y = height - 1`, `x = width - 1`)
   are drawn cut away so they frame the scene; tall things placed just
   inside those edges still hide what is behind them, so keep people and
   doors at least a few cells in from those edges.
7. People must be reachable, door approach cells walkable, exits reachable.
   Interaction points must be visible: smoke fails anything more than 60%
   hidden behind trees, walls or buildings. Place people on the camera side
   of tall buildings and trees.

## Checks

- `npx tsc --noEmit`, `npm run lint:eslint`, `node scripts/lint-dialogues.mjs`,
  `npm run lint:content`.
- `npm run smoke -- --scenes <your scenes>`.
- `npm run look -- <Scene>:<x>:<y>` (one spot per command on big maps) and
  `npm run gallery -- --filter <ids> --scale 1 --out out/gallery-<name>`;
  compare against the 40 px `player` texture.
- New player-facing strings (object labels, prompts) are translated later
  in one batch: list them in your report; `lint:localization` will flag
  them until then.
