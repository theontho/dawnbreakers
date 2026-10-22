import type Phaser from 'phaser';
import { CELL, css, footprintBox, groundShadow, onRoof, outlineBox, paintTexture, shade, type Ctx, type IsoBox } from '../art/canvasKit';
import { brick } from '../art/materials';
import { archPath, band, beamEnds, doorway, latticeWindow, LIGHT, merlons, parapetRoof, walls } from '../art/ornaments';
import type { MapObjectDefinition, MapObjectId, TextureGenerator } from '../mapAssetTypes';
import { CH09_PROP_TEXTURE_GENERATORS } from './chapter09Props';

/**
 * Chapter 9: the barrack square of Tabríz and the rooftops above it, 9 July
 * 1850. This file holds the barrack buildings and the roof walls in the
 * buff fired brick of Tabríz; threshold objects and rooftop props live in
 * `chapter09Props.ts`.
 *
 * Each roof wall size is its own MapObjectId so the dimensions and texture
 * key stay paired.
 */

const BRICK = 0xb08458;
const COPING = 0xd8c8a4;
const DOOR = 0x4a2e1c;
const FRAME = 0x8a6440;

/** Brick parapet with a lime coping and a wooden rain spout every few cells. */
function drawParapet(ctx: Ctx, box: IsoBox, seed: number): void {
  groundShadow(ctx, box, 4, 0.2);
  const spouts = (c: Ctx, w: number, h: number, l: number) => {
    band(c, w, 0, 3, COPING, l);
    if (w > CELL * 3) beamEnds(c, w, h * 0.45, l, CELL * 5);
  };
  walls(ctx, box, (c, w, h, light) => brick(c, w, h, { base: BRICK, light, seed: seed + (light === 1 ? 0 : 1) }), { left: spouts, right: spouts });
  // The wall top: worn brick between lime-washed edges.
  onRoof(ctx, box, (w, d) => {
    brick(ctx, w, d, { base: shade(BRICK, 0.92), light: LIGHT.roof, seed: seed + 2 });
    ctx.strokeStyle = css(shade(COPING, LIGHT.roof), 0.9);
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, w - 2, d - 2);
  });
  outlineBox(ctx, box);
}

function makeRoofParapet(scene: Phaser.Scene, def: MapObjectDefinition, wallH: number): void {
  const { box, texW, texH } = footprintBox(def.footprint?.w ?? 1, def.footprint?.h ?? 1, wallH, 8);
  paintTexture(scene, def.texture, texW, texH, ctx => drawParapet(ctx, box, wallH));
}

interface BarrackStyle {
  seed: number;
  /** A grand arched gate in the middle of the left face. */
  gate?: boolean;
}

/**
 * Barrack rooms: two storeys of brick, an arched door per cell below and a
 * latticed window per cell above, under a crenellated parapet. The barrack
 * is laid down as several runs so that doors and the pillar in front of it
 * sort correctly in depth; every run shares heights so the facade reads as
 * one building.
 */
function drawBarrack(ctx: Ctx, box: IsoBox, style: BarrackStyle): void {
  const course = box.h * 0.46;
  groundShadow(ctx, box, 8);
  const bays = (c: Ctx, w: number, h: number, l: number, doors: boolean) => {
    band(c, w, 4, 3, COPING, l);
    band(c, w, h - course, 3, COPING, l);
    const cells = Math.max(1, Math.round(w / CELL));
    const bay = w / cells;
    for (let i = 0; i < cells; i++) {
      const u = i * bay + bay / 2;
      latticeWindow(c, u - 4, h - course - 24, 8, 13, { frame: FRAME, light: l, arched: true, shutters: 0x5a3a24 });
      if (doors) {
        // A recessed arch with the room's door set deep inside it.
        archPath(c, u - 11, h, 22, course - 8);
        c.fillStyle = css(shade(BRICK, l * 0.55));
        c.fill();
        doorway(c, u - 7, h, 14, course - 14, { frame: shade(BRICK, 0.7), door: DOOR, light: l * 0.8, seed: style.seed + i });
      }
    }
  };
  walls(ctx, box, (c, w, h, light) => brick(c, w, h, { base: BRICK, light, seed: style.seed + (light === 1 ? 0 : 5) }), {
    left: (c, w, h, l) => {
      bays(c, w, h, l, !style.gate);
      if (style.gate) gate(c, w, h, l, style.seed);
    },
    right: (c, w, h, l) => bays(c, w, h, l, false),
  });
  parapetRoof(ctx, box, COPING, { base: 0x9a8064, light: 1, seed: style.seed + 2 }, 4, 5);
  merlons(ctx, box, shade(BRICK, 1.05), 4, 4);
  outlineBox(ctx, box);
}

/** The barrack gate: a tall pointed arch in a brick frame with a lime border. */
function gate(c: Ctx, w: number, h: number, l: number, seed: number): void {
  const gw = 26;
  const x = w / 2 - gw / 2;
  c.fillStyle = css(shade(BRICK, l * 0.9));
  c.fillRect(x - 8, h - h * 0.78, gw + 16, h * 0.78);
  c.strokeStyle = css(shade(COPING, l));
  c.lineWidth = 1.5;
  c.strokeRect(x - 6, h - h * 0.76, gw + 12, h * 0.76);
  doorway(c, x, h, gw, h * 0.62, { frame: COPING, door: DOOR, light: l, seed });
}

function paintBarrack(scene: Phaser.Scene, def: MapObjectDefinition, wallH: number, style: BarrackStyle): void {
  const { box, texW, texH } = footprintBox(def.footprint?.w ?? 3, def.footprint?.h ?? 3, wallH, 16);
  paintTexture(scene, def.texture, texW, texH, ctx => drawBarrack(ctx, box, style));
}

export const CH09_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  ...CH09_PROP_TEXTURE_GENERATORS,

  'ch9-barrack-2': (scene, def) => paintBarrack(scene, def, 72, { seed: 2 }),
  'ch9-barrack-3': (scene, def) => paintBarrack(scene, def, 72, { seed: 3 }),
  'ch9-barrack-front': (scene, def) => paintBarrack(scene, def, 76, { seed: 9, gate: true }),

  'ch9-parapet-low': (scene, def) => {
    const { box, texW, texH } = footprintBox(1, 1, 14, 4);
    paintTexture(scene, def.texture, texW, texH, ctx => drawParapet(ctx, box, 14));
  },
  'ch9-roof-wall-north': (scene, def) => makeRoofParapet(scene, def, 26),
  'ch9-roof-wall-east': (scene, def) => makeRoofParapet(scene, def, 12),
  'ch9-roof-wall-south': (scene, def) => makeRoofParapet(scene, def, 10),
};

/** Placeable map objects owned by chapter 9. */
export const CH09_OBJECTS: MapObjectDefinition[] = [
  { id: 'ch9-barrack-front', label: 'Barrack Front', texture: 'ch9-barrack-front', kind: 'structure', category: 'buildings', color: 0x8c7f6a, blocks: true, footprint: { w: 3, h: 2 }, isometric: true },
  { id: 'ch9-barrack-2', label: 'Barrack Front', texture: 'ch9-barrack-2', kind: 'structure', category: 'buildings', color: 0x8c7f6a, blocks: true, footprint: { w: 2, h: 3 }, isometric: true },
  { id: 'ch9-barrack-3', label: 'Barrack Front', texture: 'ch9-barrack-3', kind: 'structure', category: 'buildings', color: 0x8c7f6a, blocks: true, footprint: { w: 3, h: 3 }, isometric: true },
  { id: 'ch9-cell-door', label: 'Closed Door', texture: 'ch9-cell-door', kind: 'prop', category: 'furnishings', color: 0x5b3320, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch9-cloth-bundle', label: 'Cloth Bundle', texture: 'ch9-cloth-bundle', kind: 'prop', category: 'market-supplies', color: 0xd0c1a0, blocks: true },
  { id: 'ch9-rope-coils', label: 'Rope Coils', texture: 'ch9-rope-coils', kind: 'prop', category: 'market-supplies', color: 0xb88742, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch9-empty-space', label: 'Empty Space', texture: 'ch9-empty-space', kind: 'prop', category: 'lighting-effects', color: 0x3f3a34, blocks: false },
  { id: 'ch9-pillar-ropes', label: 'Pillar', texture: 'ch9-pillar-ropes', kind: 'prop', category: 'barriers-prison', color: 0xb8a07a, blocks: true },
  { id: 'ch9-severed-ropes', label: 'Severed Ropes', texture: 'ch9-severed-ropes', kind: 'prop', category: 'barriers-prison', color: 0xbca06d, blocks: true },
  { id: 'ch9-open-door', label: 'Open Door', texture: 'ch9-open-door', kind: 'prop', category: 'furnishings', color: 0x0c0806, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch9-brick-dome', label: 'Brick Dome', texture: 'ch9-brick-dome', kind: 'prop', category: 'buildings', color: 0xb47e52, blocks: true },
  { id: 'ch9-washing-line', label: 'Washing Line', texture: 'ch9-washing-line', kind: 'prop', category: 'furnishings', color: 0x8a2f2a, blocks: true },
  { id: 'ch9-water-jar', label: 'Water Jar', texture: 'ch9-water-jar', kind: 'prop', category: 'market-supplies', color: 0xa86a3e, blocks: true },
  { id: 'ch9-parapet-low', label: 'Roof Parapet', texture: 'ch9-parapet-low', kind: 'structure', category: 'barriers-prison', color: 0x7a6e5e, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch9-roof-wall-north', label: 'Roof Parapet', texture: 'ch9-roof-wall-north', kind: 'structure', category: 'barriers-prison', color: 0x6b6258, blocks: true, footprint: { w: 24, h: 1 }, isometric: true },
  { id: 'ch9-roof-wall-east', label: 'Roof Parapet', texture: 'ch9-roof-wall-east', kind: 'structure', category: 'barriers-prison', color: 0x6b6258, blocks: true, footprint: { w: 1, h: 16 }, isometric: true },
  { id: 'ch9-roof-wall-south', label: 'Roof Parapet', texture: 'ch9-roof-wall-south', kind: 'structure', category: 'barriers-prison', color: 0x6b6258, blocks: true, footprint: { w: 24, h: 1 }, isometric: true },
  // People
  { id: 'ch9-witness', label: 'Witness', texture: 'ch9-witness', kind: 'character', category: 'characters', color: 0x6b5a44, blocks: true,
    character: { body: 0x4b3b34, skin: 0xd8c6a0, clothing: { style: 'vest', secondary: 0x7a5a3a, accent: 0xd8c7a0 }, hat: { style: 'cap', color: 0x7a5a3a }, shadow: true } },
  { id: 'ch9-soldier', label: 'Soldier', texture: 'ch9-soldier', kind: 'character', category: 'characters', color: 0x39404a, blocks: true,
    character: { body: 0x4c5360, skin: 0xd6c09a, clothing: { style: 'uniform', secondary: 0x2e3742, accent: 0xc9a55c }, hat: { style: 'tallHat', color: 0x2e3742 }, shadow: true } },
  { id: 'ch9-sam-khan', label: 'Sam Khan', texture: 'ch9-sam-khan', kind: 'character', category: 'characters', color: 0x59606a, blocks: true,
    character: { body: 0x59606a, skin: 0xd8c6a0, clothing: { style: 'uniform', secondary: 0x6f2222, accent: 0xc9a55c }, hat: { style: 'tallHat', color: 0x3b4048, accent: 0xc9a55c }, shadow: true } },
  { id: 'ch9-anis', label: 'Anis', texture: 'ch9-anis', kind: 'character', category: 'characters', color: 0xe8e2d0, blocks: true,
    character: { body: 0xd8d0b8, skin: 0xe6cfa4, clothing: { style: 'robe', secondary: 0x8a9aa0, accent: 0xc9a55c }, hat: { style: 'turban', color: 0xf2ead6, accent: 0x8a9aa0 }, shadow: true } },
  { id: 'ch9-amanuensis', label: 'Witness', texture: 'ch9-amanuensis', kind: 'character', category: 'characters', color: 0x2a2a30, blocks: true,
    character: { body: 0x2f2b2a, skin: 0xdcc49c, clothing: { style: 'robe', secondary: 0x4a4440, accent: 0xc9a55c }, hat: { style: 'turban', color: 0x1a1a1a }, shadow: true } },
  { id: 'ch9-farrash', label: 'Officer', texture: 'ch9-farrash', kind: 'character', category: 'characters', color: 0x8a2a24, blocks: true,
    character: { body: 0x8a2a24, skin: 0xcfb08a, clothing: { style: 'vest', secondary: 0x5a1a16, accent: 0xc9a55c }, hat: { style: 'tallHat', color: 0x1a1a1a }, hair: 0x1d1610, shadow: true } },
  { id: 'ch9-water-seller', label: 'Water-Carrier', texture: 'ch9-water-seller', kind: 'character', category: 'characters', color: 0x5a6a5a, blocks: true,
    character: { body: 0x5a6a5a, skin: 0xc49a6c, clothing: { style: 'apron', secondary: 0x8a6a44, accent: 0x3a4a5a }, hat: { style: 'cap', color: 0xd8cfb8 }, shadow: true } },
  { id: 'ch9-widow', label: 'Village Woman', texture: 'ch9-widow', kind: 'character', category: 'characters', color: 0x2a2a34, blocks: true,
    character: { body: 0x2a2a34, skin: 0xd6b48a, clothing: { style: 'wrap', secondary: 0x1a1a24, accent: 0x6a5a7a }, hat: { style: 'veil', color: 0x1f1f2a }, shadow: true } },
  { id: 'ch9-student', label: 'Mulla', texture: 'ch9-student', kind: 'character', category: 'characters', color: 0x4a4038, blocks: true,
    character: { body: 0x5a4a3a, skin: 0xe0c8a0, clothing: { style: 'cloak', secondary: 0x3a3028, accent: 0xd8cfb8 }, hat: { style: 'turban', color: 0xf2ead6 }, shadow: true } },
  { id: 'ch9-coppersmith', label: 'Townsman', texture: 'ch9-coppersmith', kind: 'character', category: 'characters', color: 0x7a4a2a, blocks: true,
    character: { body: 0x4a3a2e, skin: 0xc8a47a, clothing: { style: 'apron', secondary: 0xb8743a, accent: 0xd9a441 }, hat: { style: 'cap', color: 0x3a2a1a }, hair: 0xb8b0a0, shadow: true } },
];
