import type { DecorSpec, MapDefinition } from './types';

/**
 * Inside the caravanserai beyond the Qur'án Gate, at dawn in summer 1844.
 * A cut-away of the court: the arcade of lodging rooms runs along the two
 * back sides, a raised platform before them, a stone pool in the middle,
 * camels kneeling, a cameleer's fire. Some rooms are still lamplit; one has
 * been swept bare by a guest already on the road. The gate is on the east
 * side, back out to the yard.
 */

const W = 16;
const H = 14;
const SWEPT_X = 6;

function arcade(): DecorSpec[] {
  const litBack = new Set([3, 10, 13]);
  const litSide = new Set([5, 9]);
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
  spawn: { x: W - 2, y: 7 },
  interior: true,
  build: ({ paintRect, paintPath }) => {
    paintRect(0, 0, W, H, 'sand');
    // The raised platform before the rooms.
    paintRect(1, 1, W - 1, 1, 'stone');
    paintRect(1, 1, 1, H - 1, 'stone');
    // Paving round the pool, and the trodden way in from the gate.
    paintRect(7, 5, 3, 3, 'stone');
    paintPath([[15, 7], [14, 7], [13, 7], [12, 7], [11, 7], [10, 7]]);
  },
  buildings: [],
  decor: [
    ...arcade(),
    { gridX: 8, gridY: 6, texture: 'ch2-serai-pool', blocks: true },
    // Lamps in the arcade, still lit at dawn.
    { gridX: 2, gridY: 1, texture: 'lamp', blocks: true },
    { gridX: 1, gridY: 11, texture: 'lamp', blocks: true },
    // Lodgers' gear on the platform.
    { gridX: 4, gridY: 1, texture: 'ch2-bundles', blocks: true },
    { gridX: 11, gridY: 1, texture: 'ch2-bundles', blocks: true },
    { gridX: 12, gridY: 1, texture: 'rug' },
    { gridX: 1, gridY: 3, texture: 'ch1-sleeping-nephew', blocks: true },
    { gridX: 1, gridY: 8, texture: 'ch2-bundles', blocks: true },
    { gridX: 1, gridY: 12, texture: 'ch2-water-jars', blocks: true },
    { gridX: 14, gridY: 1, texture: 'ch2-tea-travellers', blocks: true },
    // The cameleer's fire, and the camels kneeling for loading.
    { gridX: 4, gridY: 9, texture: 'ch2-campfire', blocks: true },
    { gridX: 5, gridY: 10, texture: 'rug' },
    { gridX: 11, gridY: 11, texture: 'ch2-camel', blocks: true },
    { gridX: 13, gridY: 10, texture: 'ch2-camel', blocks: true },
    { gridX: 12, gridY: 12, texture: 'crates', blocks: true },
    { gridX: 9, gridY: 11, texture: 'ch2-bundles', blocks: true },
  ],
  npcs: [
    { gridX: SWEPT_X, gridY: 1, texture: 'ch2-swept-threshold',
      prompt: 'Look into the swept room  [E]',
      dialogue: 'ch2-swept-room' },
    { gridX: 10, gridY: 2, texture: 'ch2-serai-merchant',
      prompt: 'Speak with the Cloth Merchant  [E]',
      dialogue: 'ch2-serai-merchant' },
    { gridX: 5, gridY: 9, texture: 'ch2-serai-cameleer',
      prompt: 'Speak with the Old Cameleer  [E]',
      dialogue: 'ch2-serai-cameleer' },
  ],
  exits: [
    { fromX: W - 1, fromY: 7, dx: 1, dy: 0,
      targetScene: 'Road', targetSpawnX: 19, targetSpawnY: 12,
      label: '→ Out through the gate to the yard' },
  ],
  ambience: {
    wash: { color: 0xd89a70, alpha: 0.3 },
    particles: 'dust', music: 'road', sound: ['fire', 'birds'],
    vignette: 0.55,
    lights: [
      { gridX: 4, gridY: 9, radius: 110, color: 0xffa050, intensity: 0.55 },
      { gridX: 3, gridY: 1, radius: 70, color: 0xffc070, intensity: 0.35 },
      { gridX: 10, gridY: 1, radius: 70, color: 0xffc070, intensity: 0.35 },
      { gridX: 1, gridY: 9, radius: 70, color: 0xffc070, intensity: 0.3 },
    ],
  },
};
