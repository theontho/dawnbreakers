import { css, footprintBox, groundShadow, outlineBox, paintTexture, shade, type Ctx, type IsoBox } from '../art/canvasKit';
import { paintHouse } from '../art/houses';
import { brick, planks, plaster } from '../art/materials';
import { archPath, band, beamEnds, latticeWindow, parapetRoof, walls } from '../art/ornaments';
import type { MapObjectId, TextureGenerator, MapObjectDefinition } from '../mapAssetTypes';
import { CH10_PRISON_TEXTURE_GENERATORS } from './chapter10Prison';
import { CH10_ROAD_TEXTURE_GENERATORS } from './chapter10Road';

/**
 * Chapter 10: the Ṭihrán prison quarter, the Síyáh-Chál pit, and the snowy
 * western gate where the road to Baghdád begins. This file holds the street
 * facades and shuttered shops; the prison architecture, chains, straw and
 * the shaft of light live in `chapter10Prison.ts`, the city wall and the
 * snow in `chapter10Road.ts`.
 *
 * Note: `closed-door`, `lamp`, and `crowd-shadow` are intentionally not
 * redefined here. The shared registry owns them.
 */

const MUD = 0x9c8466;
const BRICK = 0x9a7656;

/** A vaulted passage (sābāṭ) carrying rooms over the street. */
function drawStreetArch(ctx: Ctx, box: IsoBox): void {
  groundShadow(ctx, box, 8);
  walls(ctx, box, (c, w, h, light) => plaster(c, w, h, { base: MUD, light, seed: light === 1 ? 71 : 72 }), {
    left: (c, w, h, l) => {
      beamEnds(c, w, 5, l, 11);
      band(c, w, h * 0.42, 2, shade(MUD, 0.8), l);
      // Blind arcade along the street front.
      const bays = 3;
      for (let i = 0; i < bays; i++) {
        const u = (w / bays) * (i + 0.5);
        archPath(c, u - 13, h, 26, h * 0.5);
        c.fillStyle = css(shade(BRICK, l));
        c.fill();
        archPath(c, u - 10, h, 20, h * 0.45);
        c.fillStyle = css(shade(MUD, l * 0.7));
        c.fill();
        latticeWindow(c, u - 4, h * 0.16, 8, 10, { frame: 0x6a5038, light: l, arched: true });
      }
    },
    right: (c, w, h, l) => {
      beamEnds(c, w, 5, l, 11);
      // The passage itself: a brick arch opening onto a dim vault and the
      // daylight of the street beyond.
      const aw = w * 0.62;
      const x = w / 2 - aw / 2;
      archPath(c, x - 4, h, aw + 8, h * 0.78 + 4);
      c.save();
      c.clip();
      brick(c, w, h, { base: BRICK, light: l, seed: 73 }, 3.5, 8);
      c.restore();
      archPath(c, x, h, aw, h * 0.78);
      const dark = c.createLinearGradient(0, h * 0.2, 0, h);
      dark.addColorStop(0, '#0c0806');
      dark.addColorStop(1, '#2a1e14');
      c.fillStyle = dark;
      c.fill();
      archPath(c, w / 2 - aw * 0.18, h - 2, aw * 0.36, h * 0.38);
      c.fillStyle = css(shade(0xc8b08a, l), 0.55);
      c.fill();
    },
  });
  parapetRoof(ctx, box, shade(MUD, 0.95), { base: shade(MUD, 0.78), light: 1, seed: 74 }, 4, 5);
  outlineBox(ctx, box);
}

/** A bazaar shop front: brick arch, plank shutters barred and padlocked. */
function drawShuttered(ctx: Ctx, box: IsoBox): void {
  groundShadow(ctx, box, 5);
  walls(ctx, box, (c, w, h, light) => plaster(c, w, h, { base: MUD, light, seed: light === 1 ? 81 : 82 }), {
    left: (c, w, h, l) => {
      archPath(c, w / 2 - 6, h * 0.7, 12, 18);
      c.fillStyle = css(shade(MUD, l * 0.62));
      c.fill();
    },
    right: (c, w, h, l) => {
      beamEnds(c, w, 3, l, 8);
      const x = 3;
      const aw = w - 6;
      archPath(c, x - 1, h, aw + 2, h * 0.82 + 1);
      c.save();
      c.clip();
      brick(c, w, h, { base: BRICK, light: l, seed: 83 }, 3.5, 8);
      c.restore();
      archPath(c, x + 2, h - 2, aw - 4, h * 0.76);
      c.save();
      c.clip();
      planks(c, w, h, { base: 0x5a3c26, light: l, seed: 84 }, true, 4);
      c.fillStyle = 'rgba(20,12,6,0.35)';
      c.fillRect(0, h * 0.35, w, 1);
      c.restore();
      // Iron bar and padlock across the shutters.
      c.fillStyle = css(shade(0x2a2a2a, l));
      c.fillRect(x, h * 0.55, aw, 2.2);
      c.fillStyle = css(shade(0x8a867d, l));
      c.fillRect(w / 2 - 2, h * 0.55 + 1, 4, 5);
      c.strokeStyle = css(shade(0x8a867d, l));
      c.lineWidth = 0.9;
      c.beginPath();
      c.arc(w / 2, h * 0.55 + 1, 1.6, Math.PI, 0);
      c.stroke();
      // A worn stone step.
      c.fillStyle = css(shade(0x8a8070, l));
      c.fillRect(0, h - 2, w, 2);
    },
  });
  parapetRoof(ctx, box, shade(MUD, 0.95), { base: shade(MUD, 0.78), light: 1, seed: 85 }, 3, 3);
  outlineBox(ctx, box);
}

export const CH10_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  ...CH10_PRISON_TEXTURE_GENERATORS,
  ...CH10_ROAD_TEXTURE_GENERATORS,

  // A shut, plundered-looking house of the quarter: mud plaster, the door
  // barred, the shutters closed.
  'ch10-street-house': (scene, def) => paintHouse(scene, def.texture, {
    cellsW: def.footprint?.w ?? 3, cellsD: def.footprint?.h ?? 2,
    wallH: 62, wall: MUD, door: 0x3a2a1c, frame: 0x6a5038, roof: 'stair', seed: 53, beams: true, shutters: 0x4a4038,
  }),

  'ch10-street-arch': (scene, def) => {
    const { box, texW, texH } = footprintBox(def.footprint?.w ?? 4, def.footprint?.h ?? 2, 72, 14);
    paintTexture(scene, def.texture, texW, texH, ctx => drawStreetArch(ctx, box));
  },

  'ch10-shuttered-shop': (scene, def) => {
    const { box, texW, texH } = footprintBox(1, 1, 44, 14);
    paintTexture(scene, def.texture, texW, texH, ctx => drawShuttered(ctx, box));
  },
};

/** Placeable map objects owned by chapter 10. */
export const CH10_OBJECTS: MapObjectDefinition[] = [
  { id: 'ch10-street-house', label: 'Tehran House', texture: 'ch10-street-house', kind: 'structure', category: 'buildings', color: 0x8a5a2a, blocks: true, footprint: { w: 3, h: 2 }, isometric: true },
  { id: 'ch10-street-arch', label: 'Street Arch', texture: 'ch10-street-arch', kind: 'structure', category: 'buildings', color: 0x6b6258, blocks: true, footprint: { w: 4, h: 2 }, isometric: true },
  { id: 'ch10-low-arch', label: 'Low Arch', texture: 'ch10-low-arch', kind: 'structure', category: 'barriers-prison', color: 0x6b6258, blocks: true, footprint: { w: 4, h: 1 }, isometric: true },
  { id: 'ch10-stone-pillar', label: 'Stone Pillar', texture: 'ch10-stone-pillar', kind: 'structure', category: 'barriers-prison', color: 0x8f897c, blocks: true, footprint: { w: 2, h: 2 }, isometric: true },
  { id: 'ch10-chain-pillar', label: 'Chain Pillar', texture: 'ch10-chain-pillar', kind: 'prop', category: 'barriers-prison', color: 0x6b6258, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch10-chain-post', label: 'Chain Post', texture: 'ch10-chain-post', kind: 'prop', category: 'barriers-prison', color: 0x6b6258, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch10-chain-coil', label: 'Chain Coil', texture: 'ch10-chain-coil', kind: 'prop', category: 'barriers-prison', color: 0x3f4650, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch10-light-shaft', label: 'Light Shaft', texture: 'ch10-light-shaft', kind: 'prop', category: 'lighting-effects', color: 0xf3d98a, blocks: false },
  { id: 'ch10-guard', label: 'Tehran Guard', texture: 'ch10-guard', kind: 'character', category: 'characters', color: 0x39404a, blocks: true,
    character: { body: 0x39404a, skin: 0xc8b48d, clothing: { style: 'uniform', secondary: 0x6f2222, accent: 0xc9a55c }, hat: { style: 'tallHat', color: 0x242932 }, shadow: true } },
  { id: 'ch10-prisoner', label: 'Prisoner', texture: 'ch10-prisoner', kind: 'character', category: 'characters', color: 0x6b6258, blocks: true,
    character: { body: 0x3a3836, skin: 0xbda982, clothing: { style: 'robe', secondary: 0x5b554e, accent: 0x8a867d }, hat: { style: 'none' }, hair: 0x1f1b18, shadow: true } },
  { id: 'ch10-shuttered-shop', label: 'Market Stall', texture: 'ch10-shuttered-shop', kind: 'structure', category: 'buildings', color: 0x6e5a44, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch10-straw', label: 'Rug', texture: 'ch10-straw', kind: 'prop', category: 'furnishings', color: 0x6f6040, blocks: false },
  { id: 'ch10-city-wall', label: 'City Wall', texture: 'ch10-city-wall', kind: 'structure', category: 'barriers-prison', color: 0x9a7a56, blocks: true, footprint: { w: 1, h: 3 }, isometric: true },
  { id: 'ch10-vault-wall', label: 'Stone Pillar', texture: 'ch10-vault-wall', kind: 'structure', category: 'barriers-prison', color: 0x2e2c2a, blocks: true, footprint: { w: 1, h: 4 }, isometric: true },
  { id: 'ch10-snow-drift', label: 'Snow Drift', texture: 'ch10-snow-drift', kind: 'prop', category: 'lighting-effects', color: 0xe8ecf0, blocks: false },
  { id: 'ch10-snow-tracks', label: 'Snow Tracks', texture: 'ch10-snow-tracks', kind: 'prop', category: 'lighting-effects', color: 0xf2f0ea, blocks: false },
  { id: 'ch10-shopkeeper', label: 'Merchant', texture: 'ch10-shopkeeper', kind: 'character', category: 'characters', color: 0x7a5a3a, blocks: true,
    character: { body: 0x7a5a3a, skin: 0xc8a882, clothing: { style: 'vest', secondary: 0x4a3a2a, accent: 0xb08a4a }, hat: { style: 'cap', color: 0x3a2a1e }, hair: 0x2a2018, shadow: true } },
  { id: 'ch10-water-seller', label: 'Water-Carrier', texture: 'ch10-water-seller', kind: 'character', category: 'characters', color: 0x5d6a72, blocks: true,
    character: { body: 0x5d6a72, skin: 0xb89870, clothing: { style: 'apron', secondary: 0x8a7a5a, accent: 0x3f5a6a }, hat: { style: 'turban', color: 0xd8cfb8 }, hair: 0xb8b0a0, shadow: true } },
  { id: 'ch10-waiting-sister', label: 'Witness', texture: 'ch10-waiting-sister', kind: 'character', category: 'characters', color: 0x2a2c3a, blocks: true,
    character: { body: 0x2a2c3a, skin: 0xd0b08a, clothing: { style: 'wrap', secondary: 0x3a3c4e, accent: 0x8a6a8a }, hat: { style: 'veil', color: 0x1e2030 }, shadow: true } },
  { id: 'ch10-jailer', label: 'Warden', texture: 'ch10-jailer', kind: 'character', category: 'characters', color: 0x3a3028, blocks: true,
    character: { body: 0x3a3028, skin: 0xb8a07a, clothing: { style: 'sash', secondary: 0x5a2a1a, accent: 0x8a867d }, hat: { style: 'tallHat', color: 0x1e1a16 }, hair: 0x1a1612, shadow: true } },
  { id: 'ch10-ruined-believer', label: 'Prisoner', texture: 'ch10-ruined-believer', kind: 'character', category: 'characters', color: 0x4a4038, blocks: true,
    character: { body: 0x4a4038, skin: 0xc0a47e, clothing: { style: 'robe', secondary: 0x3a322c, accent: 0x6a5a40 }, hat: { style: 'turban', color: 0x6a6258 }, hair: 0xa8a098, shadow: true } },
  { id: 'ch10-young-prisoner', label: 'Prisoner', texture: 'ch10-young-prisoner', kind: 'character', category: 'characters', color: 0x50463c, blocks: true,
    character: { body: 0x50463c, skin: 0xccb08a, clothing: { style: 'vest', secondary: 0x3a3430, accent: 0x6a5a48 }, hat: { style: 'none' }, hair: 0x241c16, shadow: true } },
  { id: 'ch10-muleteer', label: 'Traveller', texture: 'ch10-muleteer', kind: 'character', category: 'characters', color: 0x6a4a30, blocks: true,
    character: { body: 0x6a4a30, skin: 0xb8936a, clothing: { style: 'cloak', secondary: 0x4a3420, accent: 0xa8783a }, hat: { style: 'hood', color: 0x5a3e28 }, hair: 0x2a2018, shadow: true } },
];
