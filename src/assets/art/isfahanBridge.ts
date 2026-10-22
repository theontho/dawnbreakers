import type Phaser from 'phaser';
import { css, footprintBox, paintTexture, polygon, roofPoint, shade, type Ctx, type IsoBox } from './canvasKit';
import { brick } from './materials';
import { archPath, band, dome, LIGHT } from './ornaments';
import { liftedPoint, onPlane, subBox } from './structureParts';
import { joinedMass, SIDE_N, SIDE_S, type MassPart } from './town/joinedMass';
import { tilePanel } from './town/monumentKit';
import { CREAM, TURQUOISE } from './town/townKit';

/**
 * The Sí-o-Se-Pol, the bridge of thirty-three arches over the Zāyandih-Rúd,
 * at true scale (one cell is 1.4 m, a person 40 px). The bridge runs along
 * grid y and the roadway on its deck is ordinary ground, so people walk it
 * like a street; the river lies one drop below. `ch5-bridge-span` is a
 * length of its east (camera-side) flank: the covered gallery whose arcade
 * opens on the river, a pavilion at the span's north end, and below the
 * deck the river arches on their piers, hanging over the water cells east
 * of the deck. The west flank, seen from the roadway, is the connected
 * `ch5-bridge-gallery` wall, painted with the same arcade.
 *
 * Span footprint (p east, q north): the gallery on p 0..64 (two cells of
 * deck), the river face hanging from p = 64 over three cells of water.
 */

const BRICK = 0xc9a46a;
const RIVER = 0x2c4a6b;
/** The deck stands this far above the water. */
const DROP = 44;
/** The gallery's width on the deck, and its height above it. */
const GALLERY = { p: 64, h: 76 } as const;
/** The gallery's height above the deck, shared with the connected west gallery. */
export const BRIDGE_GALLERY_H = GALLERY.h;
/** The pavilion at the span's north end: its length along the bridge and its height. */
const PAVILION = { q: 64, h: 128 } as const;
/** Gallery arches: one to a cell, so the arcade runs on unbroken from piece to piece. */
const BAY = 32;

/** The gallery's arcade on one face: an arched opening to each cell, a tile band, a brick cornice. */
export function bridgeGalleryFace(c: Ctx, w: number, h: number, l: number, offset = 0): void {
  brick(c, w, h, { base: BRICK, light: l, seed: 5101 }, 4, 8);
  for (let u = BAY / 2 - offset; u - 10 < w; u += BAY) {
    if (u + 10 < 0) continue;
    // A pale brick ring, then the shadowed walk inside with the far opening's light.
    archPath(c, u - 10, h - 6, 20, 52);
    c.fillStyle = css(shade(0xe2cc98, l * 0.95));
    c.fill();
    archPath(c, u - 8, h - 6, 16, 49);
    const g = c.createLinearGradient(0, h - 55, 0, h - 6);
    g.addColorStop(0, css(shade(0x24160c, l + 0.1)));
    g.addColorStop(1, css(shade(0x5a4430, l + 0.1)));
    c.fillStyle = g;
    c.fill();
    c.fillStyle = 'rgba(240,220,170,0.28)';
    c.fillRect(u - 2, h - 34, 4, 26);
    // Small blind niche over each pier.
    archPath(c, u + 13, h - 46, 6, 10);
    c.fillStyle = css(shade(BRICK, l * 0.72));
    c.fill();
  }
  // The sill of the walk, the tile band and the cornice under the parapet.
  c.fillStyle = css(shade(0xb8a684, l));
  c.fillRect(0, h - 6, w, 6);
  band(c, w, 10, 4, TURQUOISE, l);
  band(c, w, 0, 4, shade(BRICK, 1.08), l);
}

/**
 * One span. `mask` names the ends another span continues (see
 * joinedBuildings): north, where this span's pavilion meets the next
 * span's gallery, and south, where its gallery runs into the next span's
 * pavilion. Gallery and pavilion are one mass, so they meet without seams.
 */
export function paintBridgeSpan(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number, mask = 0): void {
  const { box: fp, texW, texH } = footprintBox(cellsW, cellsD, PAVILION.h + 26, 6);
  paintTexture(scene, key, texW, texH, ctx => {
    const pavQ = fp.d - PAVILION.q;
    riverFace(ctx, fp, pavQ);
    // Cutwaters on the piers between the arches and under the pavilion.
    const bay = pavQ / 3;
    for (const q of [bay, bay * 2, pavQ + PAVILION.q / 2]) cutwater(ctx, fp, q);
    ripples(ctx, fp, pavQ);
    const pav = pavilionPart(pavQ, fp.d);
    const gal = galleryPart(0, pavQ);
    const beyond: MassPart[] = [];
    if (mask & SIDE_N) beyond.push(galleryPart(fp.d, fp.d + pavQ));
    if (mask & SIDE_S) beyond.push(pavilionPart(-PAVILION.q, 0));
    joinedMass(ctx, fp, [pav], [gal, ...beyond]);
    const p = subBox(fp, 0, GALLERY.p, pavQ, fp.d, PAVILION.h);
    const top = roofPoint(p, p.w / 2, p.d / 2);
    dome(ctx, top.x, top.y + 10, 15, { color: TURQUOISE, drum: 8, drumColor: shade(BRICK, 1.05), bulb: 1.1, pattern: 0x1c5a6a, finial: true });
    joinedMass(ctx, fp, [gal], [pav, ...beyond]);
  });
}

/** Paints in the plane of the river face, which hangs from the deck edge (p = 64) to the water. */
function onRiverFace(ctx: Ctx, fp: IsoBox, paint: (w: number, h: number) => void): void {
  const o = liftedPoint(fp, GALLERY.p, 0, 0);
  const a = liftedPoint(fp, GALLERY.p, fp.d, 0);
  const b = liftedPoint(fp, GALLERY.p, 0, -DROP);
  onPlane(ctx, o, a, b, fp.d, DROP, paint);
}

/** Three broad river arches on their piers, and under the pavilion a solid pier with a low passage. */
function riverFace(ctx: Ctx, fp: IsoBox, pavQ: number): void {
  onRiverFace(ctx, fp, (w, h) => {
    const l = LIGHT.right;
    brick(ctx, w, h, { base: shade(BRICK, 0.95), light: l, seed: 5103 }, 4, 8);
    // Damp courses at the waterline.
    const damp = ctx.createLinearGradient(0, h - 14, 0, h);
    damp.addColorStop(0, 'rgba(40,46,40,0)');
    damp.addColorStop(1, 'rgba(40,46,40,0.45)');
    ctx.fillStyle = damp;
    ctx.fillRect(0, h - 14, w, 14);
    const bay = pavQ / 3;
    for (let i = 0; i < 3; i++) riverArch(ctx, bay * (i + 0.5), 62, h, l);
    // The pier under the pavilion, with the low vaulted passage that runs through the piers.
    archPath(ctx, pavQ + PAVILION.q / 2 - 8, h - 8, 16, 22);
    ctx.fillStyle = css(0x140c06);
    ctx.fill();
    ctx.fillStyle = css(shade(0xb8a684, l));
    ctx.fillRect(pavQ + PAVILION.q / 2 - 12, h - 8, 24, 3);
    band(ctx, w, 0, 4, shade(BRICK, 1.06), l);
    ctx.fillStyle = 'rgba(28,18,10,0.6)';
    ctx.fillRect(0, h - 1, w, 1);
  });
}

function riverArch(ctx: Ctx, cx: number, aw: number, h: number, l: number): void {
  archPath(ctx, cx - aw / 2 - 3, h, aw + 6, h - 4);
  ctx.fillStyle = css(shade(0xe0c890, l * 0.9));
  ctx.fill();
  archPath(ctx, cx - aw / 2, h, aw, h - 8);
  const g = ctx.createLinearGradient(0, 8, 0, h);
  g.addColorStop(0, css(0x120c08));
  g.addColorStop(0.7, css(0x1c1a18));
  g.addColorStop(1, css(shade(RIVER, 0.9)));
  ctx.fillStyle = g;
  ctx.fill();
  // Daylight on the far side of the arch, and its glint on the water.
  ctx.save();
  archPath(ctx, cx - aw / 2, h, aw, h - 8);
  ctx.clip();
  ctx.fillStyle = 'rgba(200,215,210,0.22)';
  ctx.fillRect(cx - aw * 0.18, h - 18, aw * 0.36, 18);
  ctx.fillStyle = 'rgba(210,232,240,0.55)';
  ctx.fillRect(cx - aw * 0.3, h - 3, aw * 0.6, 1);
  ctx.restore();
}

/** A pointed cutwater against a pier at `q`, splitting the current as it comes down from the west. */
function cutwater(ctx: Ctx, fp: IsoBox, q: number): void {
  const half = 11;
  const out = 16;
  const h = DROP - 20;
  const face = GALLERY.p;
  const at = (p: number, qq: number, lift: number) => liftedPoint(fp, p, qq, lift - DROP);
  const lit = [at(face, q - half, 0), at(face + out, q, 0), at(face + out, q, h), at(face, q - half, h)];
  const dark = [at(face + out, q, 0), at(face, q + half, 0), at(face, q + half, h), at(face + out, q, h)];
  polygon(ctx, lit);
  ctx.fillStyle = css(shade(BRICK, LIGHT.left * 0.72));
  ctx.fill();
  polygon(ctx, dark);
  ctx.fillStyle = css(shade(BRICK, LIGHT.right * 0.7));
  ctx.fill();
  const top = at(face, q, h + 6);
  polygon(ctx, [at(face, q - half, h), at(face + out, q, h), top]);
  ctx.fillStyle = css(shade(0x9a8a6a, LIGHT.left * 0.85));
  ctx.fill();
  polygon(ctx, [at(face + out, q, h), at(face, q + half, h), top]);
  ctx.fillStyle = css(shade(0x8a7a5a, LIGHT.right * 0.85));
  ctx.fill();
  ctx.strokeStyle = 'rgba(28,18,10,0.7)';
  ctx.lineWidth = 0.8;
  polygon(ctx, [lit[0]!, lit[1]!, dark[1]!, dark[2]!, top, lit[3]!]);
  ctx.stroke();
  const foot = at(face + out, q, 0);
  ctx.fillStyle = 'rgba(235,245,250,0.6)';
  ctx.beginPath();
  ctx.ellipse(foot.x + 2, foot.y, 7, 2, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Ripples along the foot of the river face, and the wake below each pier. */
function ripples(ctx: Ctx, fp: IsoBox, pavQ: number): void {
  ctx.strokeStyle = 'rgba(210,230,240,0.4)';
  ctx.lineWidth = 0.8;
  for (let q = 6; q < fp.d - 6; q += 13) {
    const a = liftedPoint(fp, GALLERY.p + 4, q, -DROP);
    const b = liftedPoint(fp, GALLERY.p + 4, q + 7, -DROP);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(230,240,245,0.32)';
  for (const q of [pavQ / 3, (pavQ * 2) / 3]) {
    for (let k = 1; k <= 3; k++) {
      const a = liftedPoint(fp, GALLERY.p + 20 + k * 6, q - 4 - k * 3, -DROP);
      const b = liftedPoint(fp, GALLERY.p + 20 + k * 6, q + 4 + k * 3, -DROP);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }
}

/** The covered gallery along the deck edge: its arcade on the river, a walk on its roof. */
function galleryPart(q0: number, q1: number): MassPart {
  return {
    p0: 0, p1: GALLERY.p, q0, q1, h: GALLERY.h,
    spec: {
      wall: BRICK, seed: 5105, material: 'brick', plinth: false, shadow: false,
      left: (c, w, h, l) => bridgeGalleryFace(c, w, h, l, (w % BAY) / 2),
      right: (c, w, h, l) => bridgeGalleryFace(c, w, h, l),
    },
  };
}

/** A two-storey pavilion over a pier: tall arched openings on its faces, a little tiled cupola. */
function pavilionPart(q0: number, q1: number): MassPart {
  const face = (c: Ctx, w: number, h: number, l: number): void => {
    brick(c, w, h, { base: shade(BRICK, 1.03), light: l, seed: 5107 }, 4, 8);
    const cx = w / 2;
    tilePanel(c, cx - 22, h - 104, 44, 98, TURQUOISE, l, 5108, 5);
    archPath(c, cx - 15, h - 6, 30, 92);
    c.fillStyle = css(shade(CREAM, l));
    c.fill();
    archPath(c, cx - 12, h - 6, 24, 88);
    const g = c.createLinearGradient(0, h - 94, 0, h);
    g.addColorStop(0, css(shade(0x24160c, l + 0.1)));
    g.addColorStop(1, css(shade(0x6a5236, l + 0.1)));
    c.fillStyle = g;
    c.fill();
    // The balcony rail across the upper storey, and the floor between.
    c.fillStyle = css(shade(0x6a4a2c, l));
    c.fillRect(cx - 12, h - 52, 24, 3);
    for (let u = cx - 10; u < cx + 11; u += 4) c.fillRect(u, h - 64, 1.2, 12);
    c.fillRect(cx - 12, h - 65, 24, 1.5);
    c.fillStyle = css(shade(0xb8a684, l));
    c.fillRect(cx - 16, h - 6, 32, 6);
    band(c, w, 0, 5, shade(BRICK, 1.1), l);
  };
  return {
    p0: 0, p1: GALLERY.p, q0, q1, h: PAVILION.h,
    spec: { wall: shade(BRICK, 1.03), seed: 5107, material: 'brick', plinth: false, shadow: false, left: face, right: face },
  };
}
