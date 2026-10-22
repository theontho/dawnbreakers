import type Phaser from 'phaser';
import { css, footprintBox, groundPoint, paintTexture, rng, shade, type Ctx } from './canvasKit';
import { ellipseShadow, foliageClump, rope } from './fieldKit';
import { cylinder } from './ornaments';
import { boulder, contactShadow } from './woodland';

/**
 * Nayríz, 1850: the quarter of Chinár-Súkhtih, "the burnt plane tree", and
 * the old fort of Khájih on the rise beyond it. Three pieces at true scale:
 * an ancient chenar burnt hollow and still in leaf, a round corner tower of
 * rammed earth (2 x 2 cells, about 7.5 m), and the cistern the companions
 * dug in the fort's court when the governor cut off their water.
 */

const FOOT = 16;

/** A tapering limb from (x0, y0) to (x1, y1), lit on its left. */
function bough(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, w0: number, w1: number, bark: number): void {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const nx = (y1 - y0) / len;
  const ny = -(x1 - x0) / len;
  ctx.beginPath();
  ctx.moveTo(x0 - nx * w0 / 2, y0 - ny * w0 / 2);
  ctx.lineTo(x1 - nx * w1 / 2, y1 - ny * w1 / 2);
  ctx.lineTo(x1 + nx * w1 / 2, y1 + ny * w1 / 2);
  ctx.lineTo(x0 + nx * w0 / 2, y0 + ny * w0 / 2);
  ctx.closePath();
  const g = ctx.createLinearGradient(Math.min(x0, x1) - w0, 0, Math.max(x0, x1) + w0, 0);
  g.addColorStop(0, css(shade(bark, 1.25)));
  g.addColorStop(0.5, css(bark));
  g.addColorStop(1, css(shade(bark, 0.55)));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,12,6,0.55)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

/**
 * The chenar that names the quarter: a vast trunk split and burnt hollow at
 * its foot, one great limb dead and black, the others still carrying a
 * broken crown of leaves. About 9 m high.
 */
export function paintBurntPlane(scene: Phaser.Scene, key: string): void {
  const height = 205;
  const spread = 88;
  const w = spread * 2 + 20;
  const h = height + FOOT + 6;
  paintTexture(scene, key, w, h, ctx => {
    const cx = w / 2;
    const ground = h - FOOT;
    const bark = 0x948a70;
    const char = 0x2a221c;
    ellipseShadow(ctx, cx + spread * 0.2, ground + 2, spread * 0.8, spread * 0.3, 0.3);
    // Root flare.
    ctx.fillStyle = css(shade(bark, 0.75));
    ctx.beginPath();
    ctx.ellipse(cx, ground, 22, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    const fork = ground - height * 0.32;
    bough(ctx, cx - 2, ground + 2, cx + 1, fork, 38, 26, bark);
    // Flaking bark on the living side.
    const rand = rng(4217);
    for (let i = 0; i < 70; i++) {
      const px = cx - 16 + rand() * 32;
      const py = fork + rand() * (ground - fork);
      ctx.fillStyle = rand() < 0.5 ? css(px < cx ? 0xe8dcc0 : 0xa89a80, 0.5) : css(0x6a6a48, 0.4);
      ctx.beginPath();
      ctx.ellipse(px, py, 1.5 + rand() * 2.5, 1 + rand() * 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // The burnt hollow: a tall split in the trunk, charred black at its lips.
    ctx.fillStyle = css(char);
    ctx.beginPath();
    ctx.moveTo(cx - 9, ground + 1);
    ctx.quadraticCurveTo(cx - 12, ground - 30, cx - 4, ground - 52);
    ctx.quadraticCurveTo(cx + 3, ground - 30, cx + 6, ground + 1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = css(0x0e0a08);
    ctx.beginPath();
    ctx.moveTo(cx - 5, ground);
    ctx.quadraticCurveTo(cx - 7, ground - 24, cx - 3, ground - 40);
    ctx.quadraticCurveTo(cx + 1, ground - 24, cx + 2, ground);
    ctx.closePath();
    ctx.fill();
    // Scorch running up the bark above the split.
    const scorch = ctx.createLinearGradient(0, ground - 80, 0, ground - 40);
    scorch.addColorStop(0, css(char, 0));
    scorch.addColorStop(1, css(char, 0.7));
    ctx.fillStyle = scorch;
    ctx.fillRect(cx - 12, ground - 80, 18, 40);
    const crownY = ground - height * 0.64;
    // The dead limb, bare and black, reaching left.
    bough(ctx, cx - 4, fork + 4, cx - spread * 0.8, crownY - 30, 13, 3, char);
    const deadWood = 0x3e352c;
    bough(ctx, cx - spread * 0.45, crownY - 8, cx - spread * 0.6, crownY - 46, 5, 1.5, deadWood);
    bough(ctx, cx - spread * 0.62, crownY - 22, cx - spread * 0.95, crownY - 34, 4, 1.2, deadWood);
    bough(ctx, cx - spread * 0.3, crownY + 4, cx - spread * 0.42, crownY - 22, 4, 1.2, deadWood);
    bough(ctx, cx - spread * 0.75, crownY - 27, cx - spread * 0.82, crownY - 52, 3, 1, deadWood);
    // Living limbs to the right.
    for (const [t, lift] of [[0.15, 0.9], [0.5, 0.8], [0.8, 1]] as const) {
      bough(ctx, cx + t * 6, fork + 4, cx + t * spread * 0.7, crownY + height * 0.08 * (1 - lift), 12, 4, bark);
    }
    // A broken crown: clumps on the living side only, thinner than a whole tree's.
    const crand = rng(4219);
    const clumps = Array.from({ length: 16 }, () => {
      const a = crand() * Math.PI * 2;
      const d = Math.sqrt(crand()) * 0.75;
      return { x: cx + spread * 0.25 + Math.cos(a) * spread * 0.62 * d, y: crownY + Math.sin(a) * height * 0.26 * d, r: 16 + crand() * 9 };
    }).sort((a, b) => a.y - b.y);
    clumps.forEach((k, i) => {
      const lit = 1 - Math.max(0, (k.x - cx) / spread) * 0.2;
      foliageClump(ctx, k.x, k.y, k.r, { leaf: shade(0x557a3a, lit), seed: 4300 + i * 7, masses: 6, squash: 0.8 });
    });
  });
}

/**
 * A round corner tower of the old fort (2 x 2 cells): rammed earth in lifts
 * on a stone footing, slightly battered, with loopholes, putlog holes, rain
 * gullies, and a crown of worn merlons. About 7.5 m high.
 */
export function paintRoundTower(scene: Phaser.Scene, key: string): void {
  const towerH = 172;
  const { box, texW, texH } = footprintBox(2, 2, towerH, 18);
  paintTexture(scene, key, texW, texH, ctx => {
    const c = groundPoint(box, box.w / 2, box.d / 2);
    const r = 44;
    const earth = 0xa88660;
    ellipseShadow(ctx, c.x + 10, c.y + 4, r + 14, r * 0.45 + 5, 0.3);
    // The stone footing, then the earthen drum, a little narrower above.
    cylinder(ctx, c.x, c.y, r + 2, 22, 0x8f8068, false);
    cylinder(ctx, c.x, c.y - 20, r, towerH - 20, earth, true);
    // Formwork lifts, curving round the drum.
    ctx.lineWidth = 1.1;
    for (let v = 36; v < towerH - 10; v += 18) {
      ctx.strokeStyle = 'rgba(40,24,10,0.25)';
      ctx.beginPath();
      ctx.ellipse(c.x, c.y - v, r, r * 0.45, 0, 0.05, Math.PI - 0.05, false);
      ctx.stroke();
    }
    // Putlog holes and loopholes on the lit front.
    const rand = rng(5101);
    for (let v = 48; v < towerH - 30; v += 34) {
      for (let a = 0.35; a < Math.PI - 0.3; a += 0.42) {
        const x = c.x + Math.cos(a) * r * 0.96;
        const y = c.y - v + Math.sin(a) * r * 0.43;
        ctx.fillStyle = css(0x1c1006, 0.55);
        ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
      }
    }
    for (const a of [0.9, 1.9, 2.5]) {
      const x = c.x + Math.cos(a) * r * 0.9;
      const y = c.y - towerH + 30 + Math.sin(a) * r * 0.42;
      ctx.fillStyle = css(0x100a04, 0.9);
      ctx.fillRect(x - 1.5, y, 3, 14);
    }
    // Rain gullies down from the crown.
    for (let i = 0; i < 6; i++) {
      const a = 0.4 + rand() * (Math.PI - 0.8);
      const x = c.x + Math.cos(a) * r * 0.95;
      const top = c.y - towerH + Math.sin(a) * r * 0.43;
      const g = ctx.createLinearGradient(0, top, 0, top + 46);
      g.addColorStop(0, css(shade(earth, 0.65), 0.5));
      g.addColorStop(1, css(shade(earth, 0.65), 0));
      ctx.fillStyle = g;
      ctx.fillRect(x - 1.5, top, 3, 46);
    }
    // Merlons round the rim, back ones first.
    const rimY = c.y - towerH;
    const merlons = Array.from({ length: 14 }, (_, i) => (i / 14) * Math.PI * 2).sort((a, b) => Math.sin(a) - Math.sin(b));
    for (const a of merlons) {
      const x = c.x + Math.cos(a) * (r - 3);
      const y = rimY + Math.sin(a) * (r - 3) * 0.45;
      const lit = Math.cos(a) < 0.2 ? 1.08 : 0.72;
      ctx.fillStyle = css(shade(earth, lit));
      ctx.fillRect(x - 3.5, y - 9, 7, 9);
      ctx.strokeStyle = 'rgba(30,18,8,0.5)';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(x - 3.5, y - 9, 7, 9);
    }
    // Earth fallen at the foot.
    boulder(ctx, c.x - r + 6, c.y + 8, 6, 5, 0x9a7a56, 3);
    boulder(ctx, c.x + 18, c.y + 18, 5, 4, 0x8a6a4a, 7);
  });
}

/**
 * The cistern the companions dug when the water was cut: a raw pit lined
 * with stones, its spoil heaped beside it, a spade, and a rope and leather
 * bucket hanging from a tripod of poles.
 */
export function drawCistern(ctx: Ctx, texH: number): void {
  const cx = 32;
  const cy = texH - 16;
  contactShadow(ctx, cx + 2, cy + 2, 30, 11, 0.22);
  // The spoil heap behind.
  boulder(ctx, cx + 14, cy - 6, 14, 10, 0x9a7a56, 11);
  boulder(ctx, cx + 4, cy - 10, 10, 7, 0x8a6a4a, 13);
  // The pit: a dark ellipse with a lit rim of stones.
  ctx.fillStyle = css(0x6a5038);
  ctx.beginPath();
  ctx.ellipse(cx - 2, cy + 2, 19, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  const g = ctx.createRadialGradient(cx - 2, cy + 4, 2, cx - 2, cy + 3, 16);
  g.addColorStop(0, css(0x0c0806));
  g.addColorStop(1, css(0x2a1e14));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(cx - 2, cy + 3, 15, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();
  const rand = rng(6301);
  for (let a = 0; a < Math.PI * 2; a += 0.45) {
    const x = cx - 2 + Math.cos(a) * 17;
    const y = cy + 2 + Math.sin(a) * 8;
    ctx.fillStyle = css(shade(0x9a8a72, Math.sin(a) > 0 ? 1.1 : 0.8));
    ctx.beginPath();
    ctx.ellipse(x, y, 3 + rand(), 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // The tripod, the rope and the bucket.
  const apex = { x: cx - 2, y: cy - 44 };
  ctx.strokeStyle = css(0x5a3e24);
  ctx.lineWidth = 2;
  for (const [x, y] of [[cx - 20, cy + 4], [cx + 14, cy + 6], [cx - 2, cy - 6]] as const) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(apex.x, apex.y);
    ctx.stroke();
  }
  rope(ctx, [apex, { x: apex.x, y: cy - 6 }], 0xb8a070, 1.2);
  ctx.fillStyle = css(0x4a2e18);
  ctx.beginPath();
  ctx.moveTo(apex.x - 4, cy - 8);
  ctx.lineTo(apex.x + 4, cy - 8);
  ctx.lineTo(apex.x + 3, cy - 1);
  ctx.lineTo(apex.x - 3, cy - 1);
  ctx.closePath();
  ctx.fill();
  // A spade leaning on the heap.
  ctx.strokeStyle = css(0x6a4a2a);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(cx + 22, cy - 2);
  ctx.lineTo(cx + 12, cy - 28);
  ctx.stroke();
  ctx.fillStyle = css(0x6a6a66);
  ctx.beginPath();
  ctx.moveTo(cx + 20, cy - 4);
  ctx.lineTo(cx + 26, cy - 6);
  ctx.lineTo(cx + 26, cy + 2);
  ctx.lineTo(cx + 21, cy + 4);
  ctx.closePath();
  ctx.fill();
}
