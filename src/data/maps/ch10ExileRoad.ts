import type { MapDefinition } from './types';

/**
 * The western gate of Ṭihrán at dawn, January 1853. The exiles' caravan for
 * Baghdád left before first light; only its tracks remain in the snow. The
 * city wall runs north to south with the gate in its middle; outside, the
 * road winds west past a caravanserai and a milestone toward the mountains.
 */
export const ch10ExileRoadMap: MapDefinition = {
  key: 'Ch10ExileRoad',
  title: 'The Road West, at Dawn',
  width: 26,
  height: 20,
  spawn: { x: 24, y: 10 },
  build: ({ paintRect, paintPath, setTile, block }) => {
    paintRect(0, 0, 26, 20, 'sand');
    // Inside the walls: the paved street up to the gate.
    paintRect(21, 0, 5, 20, 'stone');
    paintRect(21, 10, 5, 1, 'path');

    // The road west through the gate, bending south past the caravanserai.
    paintPath([
      [20, 10], [19, 10], [18, 10], [17, 10], [16, 10], [15, 10], [14, 10],
      [13, 10], [12, 10], [11, 10], [10, 10], [9, 10], [8, 10],
      [8, 11], [7, 11], [6, 11], [5, 11], [4, 11], [3, 11], [2, 11], [1, 11], [0, 11],
    ]);
    // The caravanserai yard, trampled hard.
    paintRect(8, 7, 6, 2, 'stone');

    // A frozen pond in the south-west hollow.
    for (const [x, y] of [[4, 15], [5, 15], [6, 15], [4, 16], [5, 16], [6, 16], [5, 17]] as const) {
      setTile(x, y, 'water');
      block(x, y);
    }
  },
  buildings: [
    // The city wall, broken by the gate towers.
    ...Array.from({ length: 9 }, (_, i) => ({ gridX: 20, gridY: i, w: 1, h: 1, texture: 'ch10-city-wall' })),
    { gridX: 20, gridY: 9, w: 1, h: 1, texture: 'gate' },
    { gridX: 20, gridY: 11, w: 1, h: 1, texture: 'gate' },
    ...Array.from({ length: 6 }, (_, i) => ({ gridX: 20, gridY: 12 + i, w: 1, h: 1, texture: 'ch10-city-wall' })),
    // Houses inside the gate.
    { gridX: 22, gridY: 2, w: 3, h: 2, texture: 'ch10-street-house' },
    { gridX: 22, gridY: 15, w: 2, h: 2, texture: 'house' },
    // The caravanserai where the mules were hired.
    { gridX: 9, gridY: 5, w: 3, h: 2, texture: 'ch2-caravanserai' },
  ],
  decor: [
    // The end of the wall, where it meets the frozen ditch.
    { gridX: 20, gridY: 18, texture: 'ch6-rock', blocks: true },
    { gridX: 20, gridY: 19, texture: 'ch6-rock', blocks: true },
    // Lamps either side of the gate, still lit at dawn.
    { gridX: 21, gridY: 9, texture: 'lamp', blocks: true },
    { gridX: 22, gridY: 12, texture: 'lamp', blocks: true },
    { gridX: 24, gridY: 6, texture: 'cypress', blocks: true },
    { gridX: 24, gridY: 13, texture: 'cypress', blocks: true },
    { gridX: 23, gridY: 8, texture: 'crates', blocks: true },
    // Drifts of old snow across the fields outside the wall.
    { gridX: 1, gridY: 4, texture: 'ch10-snow-drift' },
    { gridX: 3, gridY: 2, texture: 'ch10-snow-drift' },
    { gridX: 4, gridY: 6, texture: 'ch10-snow-drift' },
    { gridX: 6, gridY: 1, texture: 'ch10-snow-drift' },
    { gridX: 7, gridY: 4, texture: 'ch10-snow-drift' },
    { gridX: 9, gridY: 3, texture: 'ch10-snow-drift' },
    { gridX: 13, gridY: 2, texture: 'ch10-snow-drift' },
    { gridX: 15, gridY: 1, texture: 'ch10-snow-drift' },
    { gridX: 18, gridY: 4, texture: 'ch10-snow-drift' },
    { gridX: 17, gridY: 8, texture: 'ch10-snow-drift' },
    { gridX: 14, gridY: 8, texture: 'ch10-snow-drift' },
    { gridX: 3, gridY: 8, texture: 'ch10-snow-drift' },
    { gridX: 1, gridY: 8, texture: 'ch10-snow-drift' },
    { gridX: 5, gridY: 9, texture: 'ch10-snow-drift' },
    { gridX: 10, gridY: 12, texture: 'ch10-snow-drift' },
    { gridX: 13, gridY: 14, texture: 'ch10-snow-drift' },
    { gridX: 16, gridY: 16, texture: 'ch10-snow-drift' },
    { gridX: 18, gridY: 13, texture: 'ch10-snow-drift' },
    { gridX: 9, gridY: 15, texture: 'ch10-snow-drift' },
    { gridX: 11, gridY: 18, texture: 'ch10-snow-drift' },
    { gridX: 14, gridY: 18, texture: 'ch10-snow-drift' },
    { gridX: 2, gridY: 16, texture: 'ch10-snow-drift' },
    { gridX: 0, gridY: 18, texture: 'ch10-snow-drift' },
    { gridX: 6, gridY: 13, texture: 'ch10-snow-drift' },
    { gridX: 3, gridY: 13, texture: 'ch10-snow-drift' },
    { gridX: 18, gridY: 6, texture: 'ch10-snow-drift' },
    { gridX: 15, gridY: 6, texture: 'ch10-snow-drift' },
    { gridX: 12, gridY: 16, texture: 'ch10-snow-drift' },
    { gridX: 8, gridY: 18, texture: 'ch10-snow-drift' },
    { gridX: 17, gridY: 11, texture: 'ch10-snow-drift' },
    { gridX: 19, gridY: 14, texture: 'ch10-snow-drift' },
    // The tracks of the exiles' caravan, heading west.
    { gridX: 17, gridY: 10, texture: 'ch10-snow-tracks' },
    { gridX: 13, gridY: 10, texture: 'ch10-snow-tracks' },
    { gridX: 9, gridY: 10, texture: 'ch10-snow-tracks' },
    { gridX: 5, gridY: 11, texture: 'ch10-snow-tracks' },
    // The caravanserai yard: loads left behind, ropes, a cold brazier.
    { gridX: 8, gridY: 7, texture: 'crates', blocks: true },
    { gridX: 13, gridY: 7, texture: 'ch9-rope-coils', blocks: true },
    { gridX: 8, gridY: 8, texture: 'ch9-cloth-bundle', blocks: true },
    { gridX: 12, gridY: 5, texture: 'lamp', blocks: true },
    // The milestone at the edge of the city's land.
    { gridX: 2, gridY: 10, texture: 'ch2-milestone', blocks: true },
    // Snowbound scrub and the first rocks of the western hills.
    { gridX: 0, gridY: 1, texture: 'ch6-rock', blocks: true },
    { gridX: 1, gridY: 2, texture: 'ch6-rock', blocks: true },
    { gridX: 3, gridY: 0, texture: 'ch6-rock', blocks: true },
    { gridX: 2, gridY: 5, texture: 'ch6-snow-shrub', blocks: true },
    { gridX: 5, gridY: 3, texture: 'ch6-snow-shrub', blocks: true },
    { gridX: 6, gridY: 7, texture: 'ch6-snow-shrub', blocks: true },
    { gridX: 15, gridY: 4, texture: 'ch6-snow-shrub', blocks: true },
    { gridX: 17, gridY: 2, texture: 'ch6-snow-shrub', blocks: true },
    { gridX: 16, gridY: 7, texture: 'ch2-tamarisk', blocks: true },
    { gridX: 1, gridY: 14, texture: 'ch6-snow-shrub', blocks: true },
    { gridX: 3, gridY: 18, texture: 'ch6-rock', blocks: true },
    { gridX: 8, gridY: 14, texture: 'ch6-snow-shrub', blocks: true },
    { gridX: 10, gridY: 17, texture: 'ch2-tamarisk', blocks: true },
    { gridX: 14, gridY: 16, texture: 'ch6-snow-shrub', blocks: true },
    { gridX: 17, gridY: 14, texture: 'ch6-snow-shrub', blocks: true },
    { gridX: 18, gridY: 18, texture: 'ch6-snow-shrub', blocks: true },
    { gridX: 12, gridY: 13, texture: 'cypress', blocks: true },
    { gridX: 7, gridY: 17, texture: 'ch6-rock', blocks: true },
    { gridX: 11, gridY: 1, texture: 'cypress', blocks: true },
    { gridX: 8, gridY: 2, texture: 'ch6-rock', blocks: true },
  ],
  npcs: [
    { gridX: 19, gridY: 11, texture: 'ch10-guard',
      prompt: 'Speak with the guard at the gate  [E]',
      dialogue: 'ch10-gate-guard' },
    { gridX: 11, gridY: 8, texture: 'ch10-muleteer',
      prompt: 'Speak with the Muleteer  [E]',
      dialogue: 'ch10-muleteer' },
    { gridX: 15, gridY: 12, texture: 'ch10-waiting-sister',
      prompt: 'Speak with Zahrá  [E]',
      dialogue: 'ch10-sister-road' },
    { gridX: 16, gridY: 12, texture: 'ch10-young-prisoner',
      prompt: 'Speak with Riḍá  [E]',
      dialogue: 'ch10-rida-road' },
    { gridX: 2, gridY: 11, texture: 'ch10-snow-tracks',
      prompt: 'Look down the road west  [E]',
      dialogue: 'ch10-final',
      gate: { when: f => !!f.ch10HeardDeparture, lockedDialogue: 'ch10-final-waiting' } },
  ],
  exits: [
    { fromX: 25, fromY: 10, dx: 1, dy: 0,
      targetScene: 'Ch10TehranStreet', targetSpawnX: 1, targetSpawnY: 11,
      label: '→ Back into the city' },
  ],
  ambience: {
    wash: { color: 0xe0a888, alpha: 0.3 },
    particles: 'snow', music: 'hope',
    vignette: 0.5,
    lights: [
      { gridX: 22, gridY: 5, radius: 260, color: 0xffc890, intensity: 0.5 },
      { gridX: 20, gridY: 10, radius: 150, color: 0xffd8a0, intensity: 0.4 },
    ],
  },
};
