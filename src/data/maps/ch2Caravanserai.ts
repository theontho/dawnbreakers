import type { DecorSpec, MapDefinition } from './types';

/**
 * Inside the caravanserai beyond the Qur'án Gate, at dawn in summer 1844,
 * at true scale. A cut-away of the court: the arcade of lodging rooms runs
 * along the two back sides, one bay to a cell, a raised platform before
 * them, a stone pool in the middle, camels kneeling, a cameleer's fire.
 * Some rooms are still lamplit; one has been swept bare by a guest already
 * on the road. The gate is on the south side, back out to the yard.
 */

const W = 18;
const H = 15;
const SWEPT_X = 6;
const GATE_X = 10;

function arcade(): DecorSpec[] {
  const litBack = new Set([3, 10, 14]);
  const litSide = new Set([5, 10]);
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

export const ch2CaravanseraiMap: MapDefinition = {
  key: 'Ch2Caravanserai',
  title: 'The Caravanserai Court',
  width: W,
  height: H,
  spawn: { x: GATE_X, y: H - 2 },
  interior: true,
  trueScale: true,
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'sand');
    // The raised platform before the rooms.
    paintRect(1, 1, W - 1, 1, 'stone');
    paintRect(1, 1, 1, H - 1, 'stone');
    // Paving round the pool, and the trodden way in from the gate.
    paintRect(6, 5, 5, 5, 'stone');
    paintRect(GATE_X - 1, 10, 3, H - 10, 'path');
  },
  buildings: [
    { gridX: 7, gridY: 6, w: 3, h: 3, texture: 'fountain-pool' },
  ],
  decor: [
    ...arcade(),
    // Lamps in the arcade, still lit at dawn.
    { gridX: 2, gridY: 1, texture: 'lamp', blocks: true },
    { gridX: 1, gridY: 12, texture: 'lamp', blocks: true },
    // Lodgers' gear on the platform.
    { gridX: 4, gridY: 1, texture: 'ch2-bundles', blocks: true },
    { gridX: 12, gridY: 1, texture: 'ch2-bundles', blocks: true },
    { gridX: 13, gridY: 1, texture: 'rug' },
    { gridX: 1, gridY: 3, texture: 'ch1-sleeping-nephew', blocks: true },
    { gridX: 1, gridY: 8, texture: 'ch2-bundles', blocks: true },
    { gridX: 1, gridY: 13, texture: 'ch2-water-jars', blocks: true },
    { gridX: 15, gridY: 1, texture: 'ch2-tea-travellers', blocks: true },
    // The cameleer's fire, and the camels kneeling for loading.
    { gridX: 4, gridY: 10, texture: 'ch2-campfire', blocks: true },
    { gridX: 5, gridY: 11, texture: 'rug' },
    { gridX: 13, gridY: 10, texture: 'ch2-camel', blocks: true },
    { gridX: 15, gridY: 8, texture: 'ch2-camel', blocks: true },
    { gridX: 14, gridY: 12, texture: 'crates', blocks: true },
    { gridX: 12, gridY: 12, texture: 'ch2-bundles', blocks: true },
  ],
  npcs: [
    { gridX: SWEPT_X, gridY: 1, texture: 'ch2-swept-threshold',
      prompt: 'Look into the swept room  [E]',
      dialogue: 'ch2-swept-room' },
    { gridX: 11, gridY: 2, texture: 'ch2-serai-merchant',
      prompt: 'Speak with the Cloth Merchant  [E]',
      dialogue: 'ch2-serai-merchant' },
    { gridX: 5, gridY: 10, texture: 'ch2-serai-cameleer',
      prompt: 'Speak with the Old Cameleer  [E]',
      dialogue: 'ch2-serai-cameleer' },
  ],
  exits: [
    // Back out under the portal to the yard, in front of the caravanserai's gate (Road 26, 17).
    { fromX: GATE_X, fromY: H - 1, dx: 0, dy: 1,
      targetScene: 'Road', targetSpawnX: 26, targetSpawnY: 18,
      label: '↓ Out through the gate to the yard' },
  ],
  ambience: {
    wash: { color: 0xd89a70, alpha: 0.3 },
    particles: 'dust', music: 'road', sound: ['fire', 'birds'],
    vignette: 0.55,
    lights: [
      { gridX: 4, gridY: 10, radius: 150, color: 0xffa050, intensity: 0.55 },
      { gridX: 3, gridY: 1, radius: 90, color: 0xffc070, intensity: 0.35 },
      { gridX: 10, gridY: 1, radius: 90, color: 0xffc070, intensity: 0.35 },
      { gridX: 1, gridY: 10, radius: 90, color: 0xffc070, intensity: 0.3 },
    ],
  },
};
