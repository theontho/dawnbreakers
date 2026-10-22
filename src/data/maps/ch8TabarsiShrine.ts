import type { FlagState } from '../../dialogue/types';
import type { DecorSpec, MapAmbience, MapDefinition } from './types';

/**
 * Inside the shrine of Shaykh Ṭabarsí, autumn 1848 to spring 1849, at true
 * scale: a chamber about 6 m square and 4.5 m to the springing of the plain
 * dome, seen cut away. The old scholar's tomb stands in the middle,
 * limewashed walls with lamp niches along the back, the companions'
 * bedrolls by the west and north walls. It follows the fort's three phases
 * by flag: building (until `ch8QuddusArrived`), winter (until
 * `ch8MullaHusaynFell`), and hunger, when the oil runs out.
 *
 * Layout: walls along y = 0 and x = 0, niches at (2, 0), (5, 0), (0, 3);
 * the tomb at (3, 3); the doorway out at (3, 6).
 */

const W = 7;
const H = 7;
const DOOR_X = 3;
const TOMB = { x: 3, y: 3 };
const NICHES = new Set(['2,0', '5,0', '0,3']);

const building = (f: FlagState) => !f.ch8QuddusArrived;
const winter = (f: FlagState) => !!f.ch8QuddusArrived && !f.ch8MullaHusaynFell;
const hunger = (f: FlagState) => !!f.ch8MullaHusaynFell;

/** Walls along the back edges; the niche lamps go dark when the oil runs out. */
function chamberWalls(): DecorSpec[] {
  const out: DecorSpec[] = [];
  const add = (x: number, y: number) => {
    if (!NICHES.has(`${x},${y}`)) {
      out.push({ gridX: x, gridY: y, texture: 'ch8-shrine-wall', blocks: true });
      return;
    }
    out.push({ gridX: x, gridY: y, texture: 'ch8-shrine-niche', blocks: true, present: f => !hunger(f) });
    out.push({ gridX: x, gridY: y, texture: 'ch8-shrine-wall', blocks: true, present: hunger });
  };
  for (let x = 0; x < W; x++) add(x, 0);
  for (let y = 1; y < H; y++) add(0, y);
  return out;
}

export const ch8TabarsiShrineMap: MapDefinition = {
  key: 'Ch8TabarsiShrine',
  title: 'The Shrine of Shaykh Ṭabarsí',
  width: W,
  height: H,
  spawn: { x: DOOR_X, y: H - 2 },
  interior: true,
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'stone');
  },
  buildings: [],
  decor: [
    ...chamberWalls(),
    // Under the dome: lamps at the tomb's head and foot, a Qur'án stand on its mat.
    { gridX: TOMB.x - 1, gridY: TOMB.y, texture: 'ch8-oil-lamp', blocks: true },
    { gridX: TOMB.x + 1, gridY: TOMB.y, texture: 'ch8-oil-lamp', blocks: true, present: f => !hunger(f) },
    { gridX: 5, gridY: 4, texture: 'ch8-rahl', blocks: true },
    { gridX: 2, gridY: 5, texture: 'ch8-kneeling-companions', blocks: true },
    { gridX: 5, gridY: 3, texture: 'ch8-kneeling-companions', blocks: true, present: f => !hunger(f) },
    // The companions' sleeping places along the west and north walls.
    { gridX: 1, gridY: 2, texture: 'ch8-bedroll', blocks: true },
    { gridX: 1, gridY: 3, texture: 'ch8-bedroll-dark', blocks: true },
    { gridX: 1, gridY: 4, texture: 'ch8-bedroll', blocks: true, present: f => !hunger(f) },
    { gridX: 1, gridY: 5, texture: 'ch8-bedroll-dark', blocks: true },
    { gridX: 4, gridY: 1, texture: 'ch8-bedroll', blocks: true },
    { gridX: 5, gridY: 1, texture: 'ch8-bedroll-dark', blocks: true },
    { gridX: 6, gridY: 1, texture: 'ch8-bedroll', blocks: true },
    { gridX: 5, gridY: 2, texture: 'ch1-sleeping-nephew', blocks: true },
    { gridX: 1, gridY: 1, texture: 'ch9-water-jar', blocks: true },
    { gridX: 2, gridY: 1, texture: 'ch2-bundles', blocks: true, present: f => !hunger(f) },
    { gridX: 6, gridY: 3, texture: 'ch9-cloth-bundle', blocks: true },
  ],
  npcs: [
    { gridX: TOMB.x, gridY: TOMB.y, texture: 'ch8-tomb',
      prompt: 'Rest your hand on the tomb  [E]',
      dialogue: 'ch8-shrine' },

    // The keeper, through every season.
    ...([['ch8-keeper-autumn', building], ['ch8-keeper-winter', winter], ['ch8-keeper-hunger', hunger]] as const)
      .map(([dialogue, present]) => ({
        gridX: 4, gridY: 5, texture: 'ch8-shrine-keeper',
        prompt: 'Speak with the Keeper of the Shrine  [E]',
        dialogue, present,
      })),

    // The old man from Qazvín coughs by the west wall until the spring.
    { gridX: 2, gridY: 4, texture: 'ch8-qazvini-elder',
      prompt: 'Speak with the Old Man of Qazvín  [E]',
      dialogue: 'ch8-qazvini-elder',
      present: f => !hunger(f) },
    { gridX: 1, gridY: 4, texture: 'ch8-bedroll',
      prompt: 'Look at the empty bedroll  [E]',
      dialogue: 'ch8-empty-bedroll',
      present: hunger },
  ],
  exits: [
    { fromX: DOOR_X, fromY: H - 1, dx: 0, dy: 1,
      targetScene: 'Ch8TabarsiFort', targetSpawnX: 21, targetSpawnY: 19,
      label: '↓ Out to the shrine court' },
  ],
  ambience: f => shrineAmbience(f),
};

/** Lamplit in autumn, cold in winter, and in the hungry months a single wick at the tomb. */
function shrineAmbience(f: FlagState): MapAmbience {
  const tomb = { gridX: TOMB.x, gridY: TOMB.y, radius: 150, color: 0xffd8a0, intensity: 0.32 };
  const lamp = (gridX: number, gridY: number, radius: number, intensity: number) =>
    ({ gridX, gridY, radius, color: 0xffb860, intensity });
  if (hunger(f)) {
    return {
      wash: { color: 0x2a2c38, alpha: 0.55 },
      lights: [{ ...tomb, radius: 90, intensity: 0.4 }, lamp(TOMB.x - 1, TOMB.y, 60, 0.4)],
      particles: 'dust', music: 'sorrow', sound: ['rain'], vignette: 0.75,
    };
  }
  return {
    wash: winter(f) ? { color: 0x5a5c70, alpha: 0.45 } : { color: 0x8a6a50, alpha: 0.38 },
    lights: [
      tomb,
      lamp(TOMB.x - 1, TOMB.y, 80, 0.5),
      lamp(TOMB.x + 1, TOMB.y, 80, 0.5),
      lamp(2, 1, 70, 0.35),
      lamp(5, 1, 70, 0.35),
      lamp(1, 3, 70, 0.35),
    ],
    particles: 'motes', music: winter(f) ? 'night' : 'pilgrimage', sound: [winter(f) ? 'wind' : 'rain'],
    vignette: 0.65,
  };
}
