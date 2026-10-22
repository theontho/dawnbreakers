import { pitCompanyCount } from '../dialogues_ch/chapter10_siyah_chal';
import type { MapDefinition } from './types';

/**
 * The Síyáh-Chál, the Black Pit: a disused reservoir three flights below
 * Ṭihrán. The stair comes down at the north; the prisoners sit in two
 * chained rows facing each other across an aisle; in the far south-east a
 * crack in the vault lets a thread of light fall beside the pillar where
 * Bahá'u'lláh is chained. He is never on the map: only the light, the
 * chain Qará-Guhar, and the testimony of the men around Him.
 */
export const ch10SiyahChalMap: MapDefinition = {
  key: 'Ch10SiyahChal',
  title: 'The Síyáh-Chál',
  width: 22,
  height: 18,
  spawn: { x: 11, y: 1 },
  build: ({ width, height, paintRect, paintPath, setTile, block }) => {
    paintRect(0, 0, width, height, 'stone');
    // The worn landing at the foot of the stair.
    paintPath([[11, 0], [11, 1], [11, 2], [11, 3]]);
    // Damp sand silted along the old reservoir floor of the aisle.
    paintRect(2, 7, 18, 4, 'sand');
    // Seep water pooled in the low south-west corner.
    setTile(1, 16, 'water'); block(1, 16);
    setTile(2, 16, 'water'); block(2, 16);
    setTile(1, 15, 'water'); block(1, 15);

    // Outer walls: everything on the rim is solid except the stair.
    for (let x = 0; x < width; x++) {
      if (x !== 11) block(x, 0);
      block(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
      block(0, y);
      block(width - 1, y);
    }
  },
  buildings: [
    // The north wall of low arches, broken by the stair.
    { gridX: 3, gridY: 0, w: 4, h: 1, texture: 'ch10-low-arch' },
    { gridX: 7, gridY: 0, w: 4, h: 1, texture: 'ch10-low-arch' },
    { gridX: 12, gridY: 0, w: 4, h: 1, texture: 'ch10-low-arch' },
    { gridX: 16, gridY: 0, w: 4, h: 1, texture: 'ch10-low-arch' },
    // The west wall of the old reservoir.
    ...Array.from({ length: 16 }, (_, i) => ({ gridX: 0, gridY: 1 + i, w: 1, h: 1, texture: 'ch10-vault-wall' })),
    // Pillars holding up the vault.
    { gridX: 3, gridY: 2, w: 2, h: 2, texture: 'ch10-stone-pillar' },
    { gridX: 16, gridY: 2, w: 2, h: 2, texture: 'ch10-stone-pillar' },
  ],
  decor: [
    // The jailer's lamp at the foot of the stair.
    { gridX: 10, gridY: 1, texture: 'lamp', blocks: true },
    { gridX: 1, gridY: 0, texture: 'ch6-rock', blocks: true },
    { gridX: 20, gridY: 0, texture: 'ch6-rock', blocks: true },

    // The first row, chained neck to neck, facing the aisle.
    { gridX: 3, gridY: 6, texture: 'ch10-prisoner', blocks: true },
    { gridX: 5, gridY: 6, texture: 'ch10-chain-pillar', blocks: true },
    { gridX: 8, gridY: 6, texture: 'ch10-prisoner', blocks: true },
    { gridX: 10, gridY: 6, texture: 'ch10-prisoner', blocks: true },
    { gridX: 12, gridY: 6, texture: 'ch10-chain-pillar', blocks: true },
    { gridX: 14, gridY: 6, texture: 'ch10-prisoner', blocks: true },
    { gridX: 15, gridY: 6, texture: 'ch10-prisoner', blocks: true },
    { gridX: 17, gridY: 6, texture: 'ch10-chain-pillar', blocks: true },
    { gridX: 19, gridY: 6, texture: 'ch10-prisoner', blocks: true },
    // The second row, across the aisle.
    { gridX: 4, gridY: 11, texture: 'ch10-prisoner', blocks: true },
    { gridX: 6, gridY: 11, texture: 'ch10-prisoner', blocks: true },
    { gridX: 8, gridY: 11, texture: 'ch10-chain-pillar', blocks: true },
    { gridX: 10, gridY: 11, texture: 'ch10-prisoner', blocks: true },
    { gridX: 15, gridY: 11, texture: 'ch10-chain-pillar', blocks: true },
    { gridX: 18, gridY: 11, texture: 'ch10-prisoner', blocks: true },
    // Straw pallets and the chain that runs along each row.
    { gridX: 4, gridY: 7, texture: 'ch10-straw' },
    { gridX: 9, gridY: 7, texture: 'ch10-straw' },
    { gridX: 14, gridY: 7, texture: 'ch10-straw' },
    { gridX: 6, gridY: 10, texture: 'ch10-straw' },
    { gridX: 11, gridY: 10, texture: 'ch10-straw' },
    { gridX: 17, gridY: 10, texture: 'ch10-straw' },
    { gridX: 6, gridY: 7, texture: 'ch10-chain-coil' },
    { gridX: 16, gridY: 10, texture: 'ch10-chain-coil' },

    // The north landing: stocks, a coil of spare chain, sleepers by the wall.
    { gridX: 6, gridY: 2, texture: 'ch10-chain-coil', blocks: true },
    { gridX: 14, gridY: 3, texture: 'ch6-barred-marker', blocks: true },
    { gridX: 7, gridY: 3, texture: 'ch10-straw' },
    { gridX: 19, gridY: 2, texture: 'ch10-prisoner', blocks: true },
    { gridX: 2, gridY: 4, texture: 'ch10-straw' },
    // The south: men too weak to sit in the rows, lying on straw.
    { gridX: 7, gridY: 15, texture: 'ch10-straw' },
    { gridX: 8, gridY: 15, texture: 'ch10-prisoner', blocks: true },
    { gridX: 13, gridY: 15, texture: 'ch10-straw' },
    { gridX: 14, gridY: 15, texture: 'ch10-prisoner', blocks: true },
    { gridX: 2, gridY: 13, texture: 'ch10-chain-coil', blocks: true },
    { gridX: 15, gridY: 13, texture: 'ch10-chain-coil', blocks: true },
    // Slender pillars of the southern vault.
    { gridX: 4, gridY: 13, texture: 'ch10-chain-pillar', blocks: true },
    { gridX: 10, gridY: 14, texture: 'ch10-chain-pillar', blocks: true },
    // The place by the far pillar, where the light falls.
    { gridX: 18, gridY: 14, texture: 'ch10-chain-pillar', blocks: true },
    { gridX: 17, gridY: 15, texture: 'ch10-straw' },
    { gridX: 16, gridY: 14, texture: 'ch10-straw' },
    { gridX: 20, gridY: 13, texture: 'ch10-chain-coil', blocks: true },
  ],
  npcs: [
    { gridX: 12, gridY: 2, texture: 'ch10-jailer',
      prompt: 'Speak with the Jailer  [E]',
      dialogue: 'ch10-jailer-release',
      gate: { when: f => !!f.ch10WitnessedDawn, lockedDialogue: 'ch10-jailer' } },
    { gridX: 7, gridY: 6, texture: 'ch10-prisoner',
      prompt: 'Listen to the chained rows  [E]',
      dialogue: 'ch10-chant' },
    { gridX: 16, gridY: 11, texture: 'ch10-prisoner',
      prompt: 'Speak with the Fellow Prisoner  [E]',
      dialogue: 'ch10-prisoner' },
    { gridX: 12, gridY: 11, texture: 'ch10-young-prisoner',
      prompt: 'Speak with the young prisoner  [E]',
      dialogue: 'ch10-young-prisoner' },
    { gridX: 13, gridY: 11, texture: 'ch10-ruined-believer',
      prompt: 'Speak with the old merchant  [E]',
      dialogue: 'ch10-ruined-believer' },
    { gridX: 18, gridY: 13, texture: 'ch10-chain-post',
      prompt: 'Look at the heavy chain  [E]',
      dialogue: 'ch10-chain' },
    { gridX: 17, gridY: 14, texture: 'ch10-light-shaft',
      prompt: 'Keep watch where the light falls  [E]',
      dialogue: 'ch10-vision',
      gate: { when: f => pitCompanyCount(f) >= 3, lockedDialogue: 'ch10-vision-waiting' } },
  ],
  exits: [
    { fromX: 11, fromY: 0, dx: 0, dy: -1,
      targetScene: 'Ch10TehranStreet', targetSpawnX: 22, targetSpawnY: 20,
      label: '↑ Climb the stair into the light',
      requires: f => !!f.ch10Released,
      lockedLabel: 'The stair is barred above you' },
  ],
  ambience: {
    wash: { color: 0x2a2a30, alpha: 0.62 },
    particles: 'dust', music: 'prison',
    vignette: 0.85,
    lights: [
      { gridX: 17, gridY: 14, radius: 150, color: 0xcfd8f0, intensity: 0.6 },
      { gridX: 11, gridY: 0, radius: 90, color: 0xe8dcc0, intensity: 0.3 },
    ],
  },
};
