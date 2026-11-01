import { paintTexture, type Ctx } from '../art/canvasKit';
import { figure, type FigureStyle } from '../art/crowds';
import { ellipseShadow } from '../art/fieldKit';
import { paintBaghdadHouse, paintBaghdadSerai } from '../art/baghdadHouses';
import { paintDatePalm, paintGuffa, paintPontoon } from '../art/baghdadRiver';
import type { MapObjectDefinition, MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * The Trial at Baghdád, January 1845: the river quay below the governor's
 * serai, the tribunal hall, and the prison under it. New here: the city's
 * brick houses with their shanashil oriels, the coffee-house, the serai,
 * the date palms, the guffas and the boats of the bridge, the divines of
 * the two benches seated in the hall, and the people of the river. Mullá
 * ʿAlíy-i-Basṭámí keeps the look he had at the Qur'án Gate (`ch2-mulla-ali`).
 */

/** Two divines seated cross-legged side by side on a long cushion. */
function seatedPair(ctx: Ctx, w: number, h: number, a: FigureStyle, b: FigureStyle): void {
  const ground = h - 14;
  ellipseShadow(ctx, w / 2 + 3, ground + 2, 30, 6, 0.25);
  ctx.fillStyle = '#6a2a24';
  ctx.beginPath();
  ctx.ellipse(w / 2, ground, 28, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  figure(ctx, w / 2 - 12, ground, { ...a, seated: true, height: 40 });
  figure(ctx, w / 2 + 12, ground + 3, { ...b, seated: true, height: 40 });
}

const SUNNI_A: FigureStyle = { robe: 0x2a3a4a, trim: 0xd8d0b8, head: 'turban', headColor: 0xf2ece0, skin: 0xd2b08a, beard: 0x8a8278 };
const SUNNI_B: FigureStyle = { robe: 0x4a3a2a, trim: 0x2a6a5a, head: 'turban', headColor: 0xf6f0e2, skin: 0xcaa880, beard: 0x2a1c12 };
const SHII_A: FigureStyle = { robe: 0x3a3428, trim: 0x1e1a16, head: 'turban', headColor: 0x1e1c1c, skin: 0xd6b88c, beard: 0x3a2a1c };
const SHII_B: FigureStyle = { robe: 0x5a4a36, trim: 0x2a2620, head: 'turban', headColor: 0xf0e8d4, skin: 0xd0ac80, beard: 0xb8b0a4 };

export const BAGHDAD_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'bg-river-house': (scene, def) => paintBaghdadHouse(scene, def.texture, def.footprint?.w ?? 5, def.footprint?.h ?? 4),
  'bg-coffee-house': (scene, def) => paintBaghdadHouse(scene, def.texture, def.footprint?.w ?? 5, def.footprint?.h ?? 4, true),
  'bg-serai': (scene, def) => paintBaghdadSerai(scene, def.texture, def.footprint?.w ?? 10, def.footprint?.h ?? 6),
  'bg-date-palm': (scene, def) => paintDatePalm(scene, def.texture, 200, 7301),
  'bg-date-palm-young': (scene, def) => paintDatePalm(scene, def.texture, 120, 7307),
  'bg-guffa': (scene, def) => paintGuffa(scene, def.texture),
  'bg-pontoon': (scene, def) => paintPontoon(scene, def.texture),
  'bg-divines-sunni': (scene, def) => paintTexture(scene, def.texture, 72, 64, ctx => seatedPair(ctx, 72, 64, SUNNI_A, SUNNI_B)),
  'bg-divines-shii': (scene, def) => paintTexture(scene, def.texture, 72, 64, ctx => seatedPair(ctx, 72, 64, SHII_A, SHII_B)),
  // Najíb Páshá on his divan: a fez and the dark frock-coat of the Sultan's new officials.
  'bg-pasha-seated': (scene, def) => paintTexture(scene, def.texture, 64, 64, ctx => {
    ellipseShadow(ctx, 35, 52, 24, 6, 0.25);
    ctx.fillStyle = '#2a4a6a';
    ctx.fillRect(10, 40, 44, 12);
    ctx.fillStyle = '#c9a55c';
    ctx.fillRect(10, 40, 44, 2);
    figure(ctx, 32, 48, { robe: 0x1e1e26, trim: 0xc9a55c, head: 'kolah', headColor: 0x9a1e1e, skin: 0xd8b890, beard: 0x3a2a1c, seated: true, height: 42 });
  }),
};

const person = (id: string, label: string, look: NonNullable<MapObjectDefinition['character']>): MapObjectDefinition =>
  ({ id, label, texture: id, kind: 'character', category: 'characters', color: look.body, blocks: true, character: { shadow: true, ...look } });

export const BAGHDAD_OBJECTS: MapObjectDefinition[] = [
  { id: 'bg-river-house', label: 'House', texture: 'bg-river-house', kind: 'structure', category: 'buildings', color: 0xc9a874, blocks: true, footprint: { w: 5, h: 4 }, isometric: true },
  { id: 'bg-coffee-house', label: 'Coffee-house', texture: 'bg-coffee-house', kind: 'structure', category: 'buildings', color: 0xc9a874, blocks: true, footprint: { w: 5, h: 4 }, isometric: true },
  { id: 'bg-serai', label: 'Serai', texture: 'bg-serai', kind: 'structure', category: 'buildings', color: 0xc9a874, blocks: true, footprint: { w: 10, h: 6 }, isometric: true },
  { id: 'bg-date-palm', label: 'Date Palm', texture: 'bg-date-palm', kind: 'prop', category: 'plants', color: 0x5f7a4a, blocks: true },
  { id: 'bg-date-palm-young', label: 'Date Palm', texture: 'bg-date-palm-young', kind: 'prop', category: 'plants', color: 0x5f7a4a, blocks: true },
  { id: 'bg-guffa', label: 'Guffa', texture: 'bg-guffa', kind: 'prop', category: 'bridges-water', color: 0x2c241c, blocks: true },
  { id: 'bg-pontoon', label: 'Bridge of Boats', texture: 'bg-pontoon', kind: 'prop', category: 'bridges-water', color: 0x5a4430, blocks: true },
  { id: 'bg-divines-sunni', label: 'Divines', texture: 'bg-divines-sunni', kind: 'prop', category: 'people-crowds', color: 0x2a3a4a, blocks: true },
  { id: 'bg-divines-shii', label: 'Divines', texture: 'bg-divines-shii', kind: 'prop', category: 'people-crowds', color: 0x3a3428, blocks: true },
  { id: 'bg-pasha-seated', label: 'Governor', texture: 'bg-pasha-seated', kind: 'prop', category: 'people-crowds', color: 0x1e1e26, blocks: true },
  // The chapter's witness: a boatman's son of Karkh, apprenticed to the scribes, in a striped kaftan and a felt cap, ink on his fingers.
  person('bg-witness', 'Player', { body: 0x5a6a7a, skin: 0xc8a07a, clothing: { style: 'sash', secondary: 0x3a4652, accent: 0xc9a55c }, hat: { style: 'cap', color: 0x6a2a24 }, hair: 0x1c120a, beard: 'none' }),
  // The quay.
  person('bg-boatman', 'Boatman', { body: 0x6a5a44, skin: 0xb88a5c, clothing: { style: 'wrap', secondary: 0x4a3e30, accent: 0xd8c8a0 }, hat: { style: 'headscarf', color: 0xd8d0bc, accent: 0x2a2620 }, hair: 0x2a1c12, beard: 'full' }),
  person('bg-bookseller', 'Bookseller', { body: 0x4a4a3a, skin: 0xd0ac80, clothing: { style: 'robe', secondary: 0x2e2e24, accent: 0xb8a070 }, hat: { style: 'turban', color: 0xe8e0cc, accent: 0x4a4a3a }, hair: 0x8a8278, beard: 'full' }),
  person('bg-shirazi-merchant', 'Merchant', { body: 0x5a3a2a, skin: 0xd2b088, clothing: { style: 'cloak', secondary: 0x3a2a1e, accent: 0xc9a55c }, hat: { style: 'tallHat', color: 0x2a2420 }, hair: 0x2a1a10, beard: 'full' }),
  person('bg-coffee-keeper', 'Townsman', { body: 0x7a5a3a, skin: 0xc49a6c, clothing: { style: 'apron', secondary: 0x2a5a5a, accent: 0xe8dcc0 }, hat: { style: 'headscarf', color: 0xe8e0cc, accent: 0x8a2a22 }, hair: 0x1c120a, beard: 'moustache' }),
  // The serai.
  person('bg-head-scribe', 'Calligrapher', { body: 0x3a3a44, skin: 0xdcc098, clothing: { style: 'robe', secondary: 0x22222a, accent: 0xd8c7a0 }, hat: { style: 'turban', color: 0xf0e8d4, accent: 0x9a1e1e }, hair: 0xb8b0a4, beard: 'full' }),
  person('bg-mufti-clerk', 'Mulla', { body: 0x2a4a4a, skin: 0xd2b08a, clothing: { style: 'cloak', secondary: 0x1a2a2a, accent: 0xe8e0cc }, hat: { style: 'turban', color: 0xf6f0e2, accent: 0x2a4a4a }, hair: 0x2a1c12, beard: 'full' }),
  person('bg-shii-student', 'Student', { body: 0x4a3e30, skin: 0xd6b88c, clothing: { style: 'cloak', secondary: 0x2a241c, accent: 0xd8cfb8 }, hat: { style: 'turban', color: 0xece4d0, accent: 0x4a3e30 }, hair: 0x1c120a, beard: 'full' }),
  person('bg-guard', 'Soldier', { body: 0x2a3446, skin: 0xcaa880, clothing: { style: 'uniform', secondary: 0x1a2232, accent: 0xc9a55c }, hat: { style: 'cap', color: 0x9a1e1e }, hair: 0x1d1610, beard: 'moustache' }),
  // The prison.
  person('bg-jailer', 'Jailer', { body: 0x4a3a2e, skin: 0xbc9268, clothing: { style: 'vest', secondary: 0x2e241c, accent: 0x8a7a5a }, hat: { style: 'headscarf', color: 0x8a7a62, accent: 0x2a2018 }, hair: 0x3a2a1c, beard: 'full' }),
  person('bg-prisoner', 'Prisoner', { body: 0x6a6252, skin: 0xb48c64, clothing: { style: 'wrap', secondary: 0x4a4436, accent: 0x8a826e }, hat: { style: 'none' }, hair: 0x1c120a, beard: 'full' }),
];
