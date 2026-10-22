import { gardensVisited } from '../dialogues_ch/chapter07_gardens';
import type { DecorSpec, MapDefinition } from './types';

/**
 * Badasht, summer 1848: the three gardens.
 *
 * Bahá'u'lláh rented three gardens for the conference: one for Quddús
 * (west), one for Ṭáhirih (east), one for Himself (north, astride the
 * stream). The meadow between them is where the eighty-one guests walk and
 * argue. The lane from the hamlet (`Ch7BadashtHamlet`) comes in at the south.
 *
 * Bahá'u'lláh is never on the map. His garden holds a lamplit tent whose
 * threshold the player may approach; His actions are told by the Narrator
 * and carried by a messenger.
 */

const W = 30;
const H = 26;
const STREAM_X = [15, 16] as const;

interface Walled { x0: number; y0: number; x1: number; y1: number; gates: ReadonlyArray<readonly [number, number]> }

const QUDDUS: Walled = { x0: 1, y0: 11, x1: 10, y1: 21, gates: [[10, 16]] };
const TAHIRIH: Walled = { x0: 20, y0: 11, x1: 28, y1: 21, gates: [[20, 16]] };
const HOST: Walled = { x0: 6, y0: 1, x1: 25, y1: 9, gates: [[13, 9]] };

function gardenWall(g: Walled): DecorSpec[] {
  const out: DecorSpec[] = [];
  const isGap = (x: number, y: number): boolean =>
    g.gates.some(([gx, gy]) => gx === x && gy === y) || (STREAM_X as readonly number[]).includes(x);
  const add = (x: number, y: number): void => {
    if (!isGap(x, y)) out.push({ gridX: x, gridY: y, texture: 'ch7-garden-wall', blocks: true });
  };
  for (let x = g.x0; x <= g.x1; x += 1) { add(x, g.y0); add(x, g.y1); }
  for (let y = g.y0 + 1; y < g.y1; y += 1) { add(g.x0, y); add(g.x1, y); }
  return out;
}

const blocking = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture }));

export const ch7BadashtCampMap: MapDefinition = {
  key: 'Ch7BadashtCamp',
  title: 'Badasht, the Three Gardens',
  width: W,
  height: H,
  spawn: { x: 13, y: 24 },
  build: ({ paintRect, paintPath, setTile, block }) => {
    // The paved court in the Host's garden where the friends assemble.
    paintRect(8, 3, 5, 5, 'stone');
    // Gravel walks in each garden.
    paintPath([[13, 8], [13, 7], [13, 6], [13, 5], [14, 5], [17, 5], [18, 5], [19, 5], [20, 5], [21, 5], [12, 5]]);
    paintPath([[9, 16], [8, 16], [7, 16], [7, 15], [7, 17]]);
    paintPath([[21, 16], [22, 16], [23, 16], [24, 16], [24, 17]]);
    // Central lane north from the hamlet, and the cross-walk between the side gardens.
    for (let y = 10; y < H; y += 1) setTile(13, y, 'path');
    paintPath([[11, 16], [12, 16], [14, 16], [17, 16], [18, 16], [19, 16], [20, 16], [10, 16]]);
    paintPath([[13, 9]]);

    // The stream runs north to south through the Host's garden and the meadow.
    for (let y = 0; y < H; y += 1) {
      for (const x of STREAM_X) {
        setTile(x, y, 'water');
        if (y !== 5 && y !== 16) block(x, y);
      }
    }
    // Small pools in the side gardens.
    for (const [x, y] of [[3, 18], [4, 18], [3, 19], [4, 19], [25, 18], [26, 18], [25, 19], [26, 19]] as const) {
      setTile(x, y, 'water');
      block(x, y);
    }
    // A sandy meadow edge where the guests' path comes in.
    paintRect(11, 22, 7, 4, 'sand');
    for (let y = 22; y < H; y += 1) setTile(13, y, 'path');
    for (let y = 22; y < H; y += 1) for (const x of STREAM_X) setTile(x, y, 'water');
  },
  buildings: [
    { gridX: 3, gridY: 13, w: 3, h: 2, texture: 'ch7-tent-quddus' },
    { gridX: 23, gridY: 13, w: 3, h: 2, texture: 'ch7-garden-canopy' },
    { gridX: 19, gridY: 2, w: 3, h: 2, texture: 'ch7-tent-reconciliation' },
  ],
  decor: [
    ...gardenWall(QUDDUS),
    ...gardenWall(TAHIRIH),
    ...gardenWall(HOST),
    // Footbridges where the walks cross the stream.
    ...loose('ch6-footbridge', [[15, 5], [16, 5], [15, 16], [16, 16]]),

    // The Host's garden: cypress along the water, lamps, the assembly's carpets.
    ...blocking('cypress', [[14, 2], [17, 2], [14, 8], [17, 8], [7, 2], [24, 8]]),
    ...blocking('ch7-rosebush', [[24, 2], [7, 8], [11, 8], [22, 7], [18, 7]]),
    ...blocking('lamp', [[8, 2], [12, 2], [23, 4]]),
    ...blocking('crowd', [[8, 4], [12, 4]]),
    ...loose('rug', [[9, 6], [11, 6], [9, 3], [11, 3], [19, 4]]),

    // Quddús's garden: his tent, a pool, roses.
    ...blocking('cypress', [[2, 12], [9, 12], [2, 20], [9, 20]]),
    ...blocking('ch7-rosebush', [[8, 13], [8, 19], [2, 16]]),
    ...blocking('lamp', [[6, 13]]),
    ...loose('rug', [[6, 17], [5, 16]]),

    // Ṭáhirih's garden: her pavilion, a pool, roses.
    ...blocking('cypress', [[21, 12], [27, 12], [21, 20], [27, 15]]),
    ...blocking('ch7-rosebush', [[22, 13], [27, 17], [23, 20], [22, 18]]),
    ...blocking('lamp', [[26, 16]]),
    ...loose('rug', [[24, 16], [23, 17]]),

    // The meadow: orchard trees, the names-keeper's desk, saddle bundles.
    ...blocking('tree', [
      [0, 0], [3, 0], [0, 4], [0, 8], [3, 23], [0, 23], [6, 24], [8, 22], [27, 0], [29, 3], [29, 8],
      [29, 24], [26, 23], [22, 24], [25, 22], [3, 9], [27, 9], [11, 20], [18, 19],
    ]),
    ...blocking('cypress', [[12, 12], [14, 12], [12, 19], [14, 19], [17, 12], [19, 12]]),
    ...blocking('ch5-river-reeds', [[17, 21], [14, 23], [17, 10]]),
    ...blocking('writing-desk', [[10, 23]]),
    ...blocking('lamp', [[12, 22], [14, 10], [18, 16]]),
    ...blocking('ch9-cloth-bundle', [[19, 23], [17, 24]]),
    ...loose('rug', [[11, 24], [18, 23]]),
  ],
  npcs: [
    // The Host's garden.
    { gridX: 20, gridY: 4, texture: 'lamp',
      prompt: 'Approach the lamplit tent  [E]',
      dialogue: 'ch7-host-tent' },
    { gridX: 10, gridY: 5, texture: 'crowd',
      prompt: 'Join the assembly in the garden  [E]',
      dialogue: 'ch7-assembly',
      gate: { when: f => gardensVisited(f) >= 3, lockedDialogue: 'ch7-assembly-waiting' },
      present: f => !f.ch7WitnessedUnveiling },
    { gridX: 10, gridY: 6, texture: 'ch7-npc-tahirih',
      prompt: 'Speak with Ṭáhirih  [E]',
      dialogue: 'ch7-unveiling',
      present: f => !!f.ch7WitnessedUnveiling },
    { gridX: 22, gridY: 5, texture: 'ch7-npc-messenger',
      prompt: 'Speak with the Messenger at the Tent  [E]',
      dialogue: 'ch7-bahaullah-reconcile',
      gate: { when: f => !!f.ch7HeardTahirih && !!f.ch7QuddusAfter, lockedDialogue: 'ch7-messenger-wait' },
      present: f => !!f.ch7WitnessedUnveiling },
    // Quddús's garden.
    { gridX: 6, gridY: 16, texture: 'ch7-npc-quddus',
      prompt: 'Speak with Quddús  [E]',
      dialogue: 'ch7-quddus-tension',
      gate: { when: f => !!f.ch7WitnessedUnveiling, lockedDialogue: 'ch7-quddus-garden' } },
    // Ṭáhirih's garden: before the proclamation she speaks from behind a curtain.
    { gridX: 24, gridY: 15, texture: 'ch7-curtain',
      prompt: 'Listen at the curtain  [E]',
      dialogue: 'ch7-tahirih-curtain',
      present: f => !f.ch7WitnessedUnveiling },
    // The meadow.
    { gridX: 11, gridY: 23, texture: 'ch1-npc-calligrapher',
      prompt: 'Speak with the Keeper of Names  [E]',
      dialogue: 'ch7-names' },
    { gridX: 12, gridY: 14, texture: 'ch7-npc-believer',
      prompt: 'Speak with a shaken believer  [E]',
      dialogue: 'ch7-shaken-believer',
      present: f => !!f.ch7WitnessedUnveiling },
    { gridX: 18, gridY: 24, texture: 'ch7-npc-leaver',
      prompt: 'Speak with the Departing Believer  [E]',
      dialogue: 'ch7-leaver',
      present: f => !!f.ch7WitnessedUnveiling },
  ],
  exits: [
    { fromX: 13, fromY: 25, dx: 0, dy: 1,
      targetScene: 'Ch7BadashtHamlet', targetSpawnX: 20, targetSpawnY: 1,
      label: '↓ Back to the hamlet and the camp' },
  ],
  ambience: {
    wash: { color: 0x2a3560, alpha: 0.5 },
    lights: [
      { gridX: 20, gridY: 4, radius: 120, color: 0xffc070, intensity: 0.75 },
      { gridX: 24, gridY: 15, radius: 80, color: 0xf0c0a0, intensity: 0.45 },
      { gridX: 10, gridY: 5, radius: 110, color: 0xffb860, intensity: 0.45 },
    ],
    particles: 'fireflies', music: 'night',
    vignette: 0.55,
  },
};

