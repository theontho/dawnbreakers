import { css, footprintBox, groundPoint, groundShadow, outlineBox, paintTexture, polygon, roofPoint, shade, type Ctx, type IsoBox } from '../art/canvasKit';
import { foliageClump } from '../art/fieldKit';
import { brick, plaster } from '../art/materials';
import { DOOR, highWindow, plinth, recessedDoor } from '../art/facade';
import { archPath, band, flatTop, merlons, walls } from '../art/ornaments';
import { sakku, steps } from '../art/streetLife';
import { subBox } from '../art/structureParts';
import type { MapObjectId, TextureGenerator, MapObjectDefinition } from '../mapAssetTypes';

/**
 * Chapter 1: Shíráz. Adds the city birds, the threshold of the Báb's house,
 * and the Quiet Quarter planter.
 *
 * The threshold acts as the lamplit cue that opens the Báb's dialogue
 * without requiring an interactable Báb sprite on the map: a door left
 * ajar, a lamp lit within, and the stone step before it.
 */
export const CH01_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  /** Swifts wheeling over the roofs at dusk. */
  'ch1-birds': (scene, def) => {
    paintTexture(scene, def.texture, 40, 24, ctx => {
      bird(ctx, 9, 13, 5.5, 0.15);
      bird(ctx, 24, 8, 4.5, -0.2);
      bird(ctx, 33, 16, 3.5, 0.3);
    });
  },

  'ch1-house-threshold': (scene, def) => {
    const { box, texW, texH } = footprintBox(1, 1, 66, 12);
    paintTexture(scene, def.texture, texW, texH, ctx => paintThreshold(ctx, box));
  },

  /** A raised brick garden bed with a tiled rim, planted with jasmine and Damask roses. */
  'ch1-planter': (scene, def) => {
    const { box, texW, texH } = footprintBox(1, 1, 10, 26);
    paintTexture(scene, def.texture, texW, texH, ctx => {
      const bed: IsoBox = { ...box, y: box.y - 3, w: box.w - 6, d: box.d - 6 };
      groundShadow(ctx, bed, 5, 0.24);
      walls(ctx, bed, (c, w, h, light) => brick(c, w, h, { base: 0xa8683e, light, seed: 13 }, 3, 7), {
        left: (c, w, _h, l) => band(c, w, 0, 2.5, 0x2e8c96, l),
        right: (c, w, _h, l) => band(c, w, 0, 2.5, 0x2e8c96, l),
      });
      const at = (p: number, q: number) => roofPoint(bed, p, q);
      polygon(ctx, [at(0, 0), at(bed.w, 0), at(bed.w, bed.d), at(0, bed.d)]);
      ctx.fillStyle = css(0x4a3424);
      ctx.fill();
      outlineBox(ctx, bed);
      const mid = at(bed.w / 2, bed.d / 2);
      foliageClump(ctx, mid.x - 7, mid.y - 6, 9, { leaf: 0x3f6a3a, seed: 5, bloom: 0xf2ead6, masses: 6 });
      foliageClump(ctx, mid.x + 6, mid.y - 9, 10, { leaf: 0x4a7a40, seed: 9, bloom: 0xc83a4a, masses: 7 });
      foliageClump(ctx, mid.x, mid.y - 2, 7, { leaf: 0x436f3c, seed: 17, bloom: 0xd85a6a, masses: 5 });
    });
  },

  /** Mullá Ḥusayn's nephew, asleep on the travel bundles under his cloak. */
  'ch1-sleeping-nephew': (scene, def) => paintTexture(scene, def.texture, 48, 28, ctx => drawSleeper(ctx)),
};

/** A swift in flight: two scythe wings and a forked tail. */
function bird(ctx: Ctx, x: number, y: number, span: number, tilt: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.fillStyle = css(0x1f1a14, 0.9);
  ctx.beginPath();
  ctx.moveTo(-span, -span * 0.25);
  ctx.quadraticCurveTo(-span * 0.45, -span * 0.55, 0, 0);
  ctx.quadraticCurveTo(span * 0.45, -span * 0.55, span, -span * 0.25);
  ctx.quadraticCurveTo(span * 0.45, -span * 0.2, 0, span * 0.22);
  ctx.quadraticCurveTo(-span * 0.45, -span * 0.2, -span, -span * 0.25);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, span * 0.05, span * 0.13, span * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * The Báb's house in the Quiet Quarter: a tall plastered entrance front
 * with stone benches either side, a tile panel over the recessed door, and
 * lamplight spilling from the door left ajar onto a worn step.
 */
function paintThreshold(ctx: Ctx, box: IsoBox): void {
  const wall = 0xcdb894;
  const front = subBox(box, 0, box.w - 6, 0, box.d, 66);
  groundShadow(ctx, front, 5);
  walls(ctx, front, (c, w, h, light) => plaster(c, w, h, { base: wall, light, seed: light === 1 ? 31 : 32 }), {
    left: (c, w, h, l) => {
      band(c, w, 6, 2, shade(wall, 0.84), l);
      plinth(c, w, h, 6, 0x9a8a70, l, 34);
      highWindow(c, w / 2 - 3.5, h, 42, { frame: 0x8a6440, light: l, arched: true, lit: true });
    },
    right: (c, w, h, l) => {
      band(c, w, 6, 2, shade(wall, 0.84), l);
      plinth(c, w, h, 6, 0x9a8a70, l, 35);
      recessedDoor(c, w / 2, h, { frame: 0x8a6440, light: l, open: true, surround: shade(wall, 1.08), panel: 0x24477a, seed: 35 });
      // The door ajar: lamplight within, one leaf swung inward.
      const dx = w / 2 - DOOR.w / 2;
      archPath(c, dx, h, DOOR.w, DOOR.h);
      const glow = c.createLinearGradient(dx, 0, dx + DOOR.w, 0);
      glow.addColorStop(0, '#ffe2a0');
      glow.addColorStop(1, '#c47a2c');
      c.fillStyle = glow;
      c.fill();
      c.fillStyle = css(shade(0x4a2c18, l));
      c.fillRect(dx + DOOR.w * 0.6, h - DOOR.h * 0.8, DOOR.w * 0.4, DOOR.h * 0.8 - 1.5);
      c.fillStyle = css(0x2a1a0c, 0.6);
      c.fillRect(dx + DOOR.w * 0.6, h - DOOR.h * 0.8, 0.8, DOOR.h * 0.8 - 1.5);
    },
  });
  flatTop(ctx, front, shade(wall, 0.95));
  merlons(ctx, front, wall, 3, 3);
  outlineBox(ctx, front);
  // Lamplight pooling on the ground before the door, then the benches either side.
  const pool = groundPoint(box, box.w - 1, box.d / 2);
  const g = ctx.createRadialGradient(pool.x, pool.y, 1, pool.x, pool.y, 12);
  g.addColorStop(0, 'rgba(255,214,140,0.55)');
  g.addColorStop(1, 'rgba(255,214,140,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(pool.x, pool.y, 12, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  sakku(ctx, box, box.w - 6, box.w - 1, box.d - 8, box.d - 1, 0xa89878, 36, 7);
  steps(ctx, box, box.w - 6, box.w - 1, box.d / 2 - 9, box.d / 2 + 9, 1, 'p');
  sakku(ctx, box, box.w - 6, box.w - 1, 1, 8, 0xa89878, 37, 7);
}

/** Placeable map objects owned by chapter 1. */
export const CH01_OBJECTS: MapObjectDefinition[] = [
  { id: 'ch1-brother', label: 'Traveller', texture: 'ch1-brother', kind: 'character', category: 'characters', color: 0x4a3a2a, blocks: true,
    character: { body: 0x4a4032, skin: 0xdcc596, clothing: { style: 'robe', secondary: 0xc9bc9a, accent: 0x6f5636 }, hat: { style: 'turban', color: 0xd8cfb8, accent: 0x4a4032 }, shadow: true } },
  { id: 'ch1-watchman', label: 'Guard', texture: 'ch1-watchman', kind: 'character', category: 'characters', color: 0x39404a, blocks: true,
    character: { body: 0x3a3f4a, skin: 0xd1b37c, clothing: { style: 'cloak', secondary: 0x2a2e36, accent: 0xc9a55c }, hat: { style: 'cap', color: 0x2a2e36 }, shadow: true } },
  { id: 'ch1-mulla-husayn', label: 'Mulla Husayn', texture: 'ch1-mulla-husayn', kind: 'character', category: 'characters', color: 0x2f4a5f, blocks: true,
    character: { body: 0x3a3226, skin: 0xe2d1aa, clothing: { style: 'robe', secondary: 0xd8cfb8, accent: 0x8a7450 }, hat: { style: 'turban', color: 0xe8e5dc, accent: 0x3a3226 }, shadow: true } },
  { id: 'ch1-birds', label: 'Birds', texture: 'ch1-birds', kind: 'prop', category: 'lighting-effects', color: 0x1f1a14, blocks: false },
  { id: 'ch1-house-threshold', label: 'House Threshold', texture: 'ch1-house-threshold', kind: 'prop', category: 'furnishings', color: 0xc9a55c, blocks: false },
  { id: 'ch1-planter', label: 'Planter', texture: 'ch1-planter', kind: 'prop', category: 'plants', color: 0x4d7a3a, blocks: true },
  { id: 'ch1-npc-water-carrier', label: 'Water-Carrier', texture: 'ch1-npc-water-carrier', kind: 'character', category: 'characters', color: 0x2d5f73, blocks: true,
    character: { body: 0x2d5f73, skin: 0xd9c79a, clothing: { style: 'wrap', secondary: 0xd8c7a0, accent: 0x9fb8c4 }, hat: { style: 'headscarf', color: 0xbfc5aa }, shadow: true } },
  { id: 'ch1-npc-guard', label: 'Gate Guard', texture: 'ch1-npc-guard', kind: 'character', category: 'characters', color: 0x5a4630, blocks: true,
    character: { body: 0x5a4630, skin: 0xe0c08a, clothing: { style: 'uniform', secondary: 0x2f3f48, accent: 0xc9a55c }, hat: { style: 'tallHat', color: 0x2f2a22 }, shadow: true } },
  { id: 'ch1-npc-calligrapher', label: 'Calligrapher', texture: 'ch1-npc-calligrapher', kind: 'character', category: 'characters', color: 0x46345f, blocks: true,
    character: { body: 0x46345f, skin: 0xe6c89a, clothing: { style: 'vest', secondary: 0xe8d8b0, accent: 0x6f5636 }, hat: { style: 'cap', color: 0x5f4a72 }, shadow: true } },
  { id: 'ch1-npc-beggar', label: 'Mosque Orphan', texture: 'ch1-npc-beggar', kind: 'character', category: 'characters', color: 0x6b5a44, blocks: true,
    character: { body: 0x6b5a44, skin: 0xcaa978, clothing: { style: 'cloak', secondary: 0x4a3a2a, accent: 0x8a7450 }, hat: { style: 'hood', color: 0x4a3a2a }, shadow: true } },
  { id: 'ch1-sleeping-nephew', label: 'Sleeping Traveller', texture: 'ch1-sleeping-nephew', kind: 'prop', category: 'people-crowds', color: 0x4a4032, blocks: true },
  { id: 'ch1-ilkhani-attendant', label: 'Mosque Attendant', texture: 'ch1-ilkhani-attendant', kind: 'character', category: 'characters', color: 0x5a4a3a, blocks: true,
    character: { body: 0x5a4a3a, skin: 0xcfae80, clothing: { style: 'apron', secondary: 0xd8cfb8, accent: 0x8a7450 }, hat: { style: 'cap', color: 0x3a3226 }, shadow: true } },
  { id: 'ch1-ilkhani-student', label: 'Student', texture: 'ch1-ilkhani-student', kind: 'character', category: 'characters', color: 0x3a4a5a, blocks: true,
    character: { body: 0x3a4a5a, skin: 0xe2c89c, clothing: { style: 'robe', secondary: 0xd8cfb8, accent: 0x6f5636 }, hat: { style: 'turban', color: 0xe8e5dc, accent: 0x3a4a5a }, shadow: true } },
  { id: 'ch1-npc-servant', label: 'House Servant', texture: 'ch1-npc-servant', kind: 'character', category: 'characters', color: 0x7a5a3a, blocks: true,
    // Mubárak, the household servant, was Ethiopian; matches his look in chapters 2 to 4.
    character: { body: 0x3f4a5a, skin: 0x6b4a32, clothing: { style: 'robe', secondary: 0xd8cfb8, accent: 0xc9a55c }, hat: { style: 'turban', color: 0xf2ead6, accent: 0x3f4a5a }, shadow: true } },
];

function drawSleeper(ctx: Ctx): void {
  ctx.fillStyle = 'rgba(10,6,3,0.28)';
  ctx.beginPath();
  ctx.ellipse(25, 22, 20, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // The bundles he sleeps on.
  for (const [x, y, rx, color] of [[16, 19, 9, 0x8a6a48], [30, 20, 10, 0x6a5a40]] as const) {
    ctx.fillStyle = css(color);
    ctx.beginPath();
    ctx.ellipse(x, y, rx, 4.5, -0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  // A body under a cloak, knees drawn up, turban for a pillow.
  ctx.fillStyle = css(0x4a4032);
  ctx.beginPath();
  ctx.moveTo(10, 15);
  ctx.quadraticCurveTo(20, 6, 34, 11);
  ctx.quadraticCurveTo(40, 13, 38, 17);
  ctx.quadraticCurveTo(24, 20, 10, 17);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = css(shade(0x4a4032, 1.35));
  ctx.beginPath();
  ctx.moveTo(13, 13);
  ctx.quadraticCurveTo(22, 8, 32, 10);
  ctx.lineTo(31, 12);
  ctx.quadraticCurveTo(22, 10, 14, 15);
  ctx.fill();
  ctx.fillStyle = css(0xe8e2d0);
  ctx.beginPath();
  ctx.ellipse(8, 15, 4.5, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(0xd9c79a);
  ctx.beginPath();
  ctx.arc(11, 13.5, 2.4, 0, Math.PI * 2);
  ctx.fill();
}
