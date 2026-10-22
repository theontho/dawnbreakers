import type { FlagState } from '../../dialogue/types';
import { SERAI_DOOR } from './martyrsCity';
import { martyrsArrests, prisonVisits } from './martyrsPhases';
import type { DecorSpec, MapDefinition } from './types';

/**
 * A merchants' caravanserai by the bazaar of Ṭihrán, February 1850, drawn
 * cut away like the road serai of chapter 2: the arcade of lodging rooms
 * along the two back sides, one bay to a room, a raised platform before
 * them, a pool in the middle of the court, bales from Shíráz and Kirmán
 * under sacking, a few camels kneeling out of the wind. The merchants of
 * Shíráz keep a brazier going by the pool while they raise the uncle's
 * ransom; a young man of Zarand waits on the platform with a package.
 *
 * Layout: arcade on y = 0 and x = 0; the platform y = 1 and x = 1; the pool
 * at x 9..11, y 6..8; the merchants' brazier at (13, 8) with the merchant
 * at (14, 9); the young man at (5, 1); the gate out at (11, 15).
 */

const W = 22;
const H = 16;
const GATE_X = 11;
const MERCHANT = { x: 14, y: 9 } as const;

function arcade(): DecorSpec[] {
  const litBack = new Set([4, 9, 16]);
  const litSide = new Set([6, 11]);
  const out: DecorSpec[] = [];
  for (let x = 0; x < W; x++) {
    const texture = x === 0 ? 'ch2-serai-window' : litBack.has(x) ? 'ch2-serai-bay-lit' : 'ch2-serai-bay';
    out.push({ gridX: x, gridY: 0, texture, blocks: true });
  }
  for (let y = 1; y < H; y++) {
    out.push({ gridX: 0, gridY: y, texture: litSide.has(y) ? 'ch2-serai-bay-lit' : 'ch2-serai-bay', blocks: true });
  }
  return out;
}

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true }));

const GOODS: DecorSpec[] = [
  // Bales and chests of the merchants of Shíráz and Kirmán, on the platform and by the rooms.
  ...block('ch9-cloth-bundle', [[12, 1], [13, 1], [1, 4]]),
  ...block('crates', [[18, 1], [1, 13]]),
  ...block('ch2-bundles', [[8, 1], [1, 8], [19, 3]]),
  ...block('ch2-water-jars', [[20, 1]]),
  { gridX: 15, gridY: 1, texture: 'rug' },
  // Lamps in the arcade on a dark winter day.
  ...block('lamp', [[2, 1], [1, 11], [16, 2]]),
  // The merchants' brazier, and their fellows round it.
  ...block('ch6-brazier', [[13, 8]]),
  ...block('ch2-tea-travellers', [[15, 6]]),
  // Camels kneeling out of the wind in the far corner, and their keeper's fire.
  ...block('ch2-camel', [[18, 11], [19, 7]]),
  ...block('ch10-snow-drift', [[20, 13]]),
];

const answerReady = (f: FlagState) => !!f.martyrsSatWithKhal && prisonVisits(f) >= 3;

export const martyrsSeraiMap: MapDefinition = {
  key: 'MartyrsSerai',
  title: 'Ṭihrán, a Caravanserai by the Bazaar',
  width: W,
  height: H,
  spawn: { x: GATE_X, y: H - 2 },
  interior: true,
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'sand');
    // The raised platform before the rooms.
    paintRect(1, 1, W - 1, 1, 'stone');
    paintRect(1, 1, 1, H - 1, 'stone');
    // Paving round the pool, and the trodden way in from the gate.
    paintRect(8, 5, 5, 5, 'stone');
    paintRect(GATE_X - 1, 10, 3, H - 10, 'path');
  },
  buildings: [
    { gridX: 9, gridY: 6, w: 3, h: 3, texture: 'fountain-pool' },
  ],
  decor: [...arcade(), ...GOODS],
  npcs: [
    { gridX: MERCHANT.x, gridY: MERCHANT.y, texture: 'martyrs-merchant',
      prompt: 'Speak with the Merchant of Shíráz  [E]',
      dialogue: 'martyrs-merchant',
      present: f => !f.martyrsMerchantAsked },
    { gridX: MERCHANT.x, gridY: MERCHANT.y, texture: 'martyrs-merchant',
      prompt: 'Speak with the Merchant of Shíráz  [E]',
      dialogue: 'martyrs-merchant-answer',
      present: f => !!f.martyrsMerchantAsked && martyrsArrests(f),
      gate: { when: answerReady, lockedDialogue: 'martyrs-merchant-waiting' } },
    { gridX: 5, gridY: 1, texture: 'martyrs-young-man',
      prompt: 'Speak with the Young Man of Zarand  [E]',
      dialogue: 'martyrs-young-man',
      present: martyrsArrests },
  ],
  exits: [
    { fromX: GATE_X, fromY: H - 1, dx: 0, dy: 1,
      targetScene: 'MartyrsCity', targetSpawnX: SERAI_DOOR.x, targetSpawnY: SERAI_DOOR.y + 1,
      label: '↓ Out through the gate to the street' },
  ],
  // A grey winter day; by the time the answer comes back, dusk.
  ambience: f => answerReady(f)
    ? { wash: { color: 0x6a6070, alpha: 0.42 }, particles: 'motes', vignette: 0.64, music: 'sorrow', sound: ['wind'],
        lights: [{ gridX: 13, gridY: 8, radius: 130, color: 0xff9a40, intensity: 0.42 }] }
    : { wash: { color: 0xb0b4c0, alpha: 0.26 }, particles: 'dust', vignette: 0.55, music: 'city', sound: ['wind'],
        lights: [{ gridX: 13, gridY: 8, radius: 110, color: 0xff9a40, intensity: 0.3 }] },
};
