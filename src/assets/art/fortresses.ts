import type Phaser from 'phaser';
import { css, footprintBox, groundPoint, groundShadow, onLeftWall, onRightWall, onRoof, outlineBox, paintTexture, polygon, rng, shade, type Ctx, type IsoBox } from './canvasKit';
import { planks, stone } from './materials';
import { archPath, cylinder, doorway, LIGHT, merlons, walls } from './ornaments';
import { liftedPoint, post, snowEdge, subBox, type Pt } from './structureParts';

/**
 * Parts for the mountain prisons of Ādharbāyjān: rubble stone, battered
 * footings, round bastions and square towers, the inner keep, the gatehouse
 * with its small iron-bound door, and the barred windows set high in the
 * walls. `mountainFortress.ts` assembles them into Mākū and Chihrīq.
 */

const EDGE = 0x14181c;

export function fortressStone(ctx: Ctx, w: number, h: number, color: number, light: number, seed: number): void {
  stone(ctx, w, h, { base: color, light, seed }, 8);
  // Battered talus: the lower courses are larger and darker.
  ctx.fillStyle = 'rgba(20,24,30,0.22)';
  ctx.fillRect(0, h - 12, w, 12);
  ctx.fillStyle = 'rgba(230,235,240,0.18)';
  ctx.fillRect(0, h - 12, w, 1);
}

/** An arrow slit: a narrow vertical gap with a short cross for a crossbow's sweep. */
export function slit(ctx: Ctx, u: number, v: number, light: number, len = 8): void {
  ctx.fillStyle = css(shade(0x0e1014, light + 0.2));
  ctx.fillRect(u - 0.9, v, 1.8, len);
  ctx.fillRect(u - 2.2, v + len * 0.4, 4.4, 1.3);
}

/** A small deep-set window crossed with iron bars, dark or lamp-lit within. */
export function barredWindow(ctx: Ctx, x: number, y: number, w: number, h: number, light: number, lit: boolean): void {
  ctx.fillStyle = css(shade(0xb8b4ac, light));
  ctx.fillRect(x - 1.5, y - 1.5, w + 3, h + 3);
  if (lit) {
    const g = ctx.createRadialGradient(x + w / 2, y + h * 0.6, 0.5, x + w / 2, y + h / 2, w);
    g.addColorStop(0, '#ffd890');
    g.addColorStop(1, '#6a3a18');
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = css(0x0e1014);
  }
  ctx.fillRect(x, y, w, h);
  // The reveal: the thickness of the wall shows on the sunlit side.
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(x, y, 1.5, h);
  ctx.fillRect(x, y, w, 1.2);
  ctx.strokeStyle = css(shade(0x9aa4ac, light));
  ctx.lineWidth = 0.9;
  for (let u = x + 2; u < x + w - 0.5; u += 2.2) {
    ctx.beginPath();
    ctx.moveTo(u, y);
    ctx.lineTo(u, y + h);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.45);
  ctx.lineTo(x + w, y + h * 0.45);
  ctx.stroke();
  ctx.fillStyle = 'rgba(240,245,250,0.85)';
  ctx.fillRect(x - 1.5, y + h + 0.5, w + 3, 1.5);
}

/** Crenellations with a cap of snow on every merlon. */
export function snowyMerlons(ctx: Ctx, box: IsoBox, color: number, size: number, gap: number): void {
  merlons(ctx, box, color, size, gap);
  const caps = (w: number) => {
    ctx.fillStyle = css(0xf0f4f7, 0.95);
    for (let u = gap / 2; u + size <= w; u += size + gap) {
      ctx.beginPath();
      ctx.ellipse(u + size / 2, -size - 0.6, size / 2 + 0.5, 1.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  onLeftWall(ctx, box, caps);
  onRightWall(ctx, box, caps);
}

function snowRoof(ctx: Ctx, box: IsoBox): void {
  onRoof(ctx, box, (w, d) => {
    ctx.fillStyle = css(0xe8eef2);
    ctx.fillRect(0, 0, w, d);
  });
}

/**
 * A sloped stone footing that steps out from the wall above it: `outer`
 * pixels in from the footprint edge at the ground, `inner` at its crest.
 * Only the two faces toward the viewer are drawn.
 */
export function batteredFooting(ctx: Ctx, box: IsoBox, outer: number, inner: number, h: number, color: number, seed: number): void {
  const { w, d } = box;
  const at = (p: number, q: number, z: number) => liftedPoint(box, p, q, z);
  const base = subBox(box, outer, w - outer, outer, d - outer, h);
  const faces: Array<[Pt[], 'left' | 'right']> = [
    [[at(outer, outer, 0), at(w - outer, outer, 0), at(w - inner, inner, h), at(inner, inner, h)], 'left'],
    [[at(w - outer, outer, 0), at(w - outer, d - outer, 0), at(w - inner, d - inner, h), at(w - inner, inner, h)], 'right'],
  ];
  for (const [pts, side] of faces) {
    ctx.save();
    polygon(ctx, pts);
    ctx.clip();
    // The slope catches more sky than the upright wall above it.
    const light = (side === 'left' ? LIGHT.left : LIGHT.right) * 1.08;
    (side === 'left' ? onLeftWall : onRightWall)(ctx, base, (fw, fh) => stone(ctx, fw, fh, { base: shade(color, 0.92), light, seed }, 6));
    ctx.restore();
    ctx.strokeStyle = css(EDGE, 0.7);
    ctx.lineWidth = 1;
    polygon(ctx, pts);
    ctx.stroke();
  }
  // Snow lodged on the crest of the slope.
  ctx.strokeStyle = 'rgba(236,241,245,0.9)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  const crest = [at(inner, inner, h), at(w - inner, inner, h), at(w - inner, d - inner, h)];
  crest.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y + 0.5) : ctx.moveTo(p.x, p.y + 0.5)));
  ctx.stroke();
}

/** A round bastion standing on a flared footing, crowned with snowy merlons. */
export function roundTower(ctx: Ctx, foot: Pt, r: number, h: number, color: number, seed: number): void {
  const rand = rng(seed);
  cylinder(ctx, foot.x, foot.y + 1, r + 3, 14, shade(color, 0.9), false);
  ctx.fillStyle = 'rgba(236,241,245,0.8)';
  ctx.beginPath();
  ctx.ellipse(foot.x, foot.y - 13, r + 2, (r + 2) * 0.42, 0, 0.1, Math.PI - 0.1);
  ctx.fill();
  cylinder(ctx, foot.x, foot.y - 12, r, h - 12, color, false);
  ctx.save();
  ctx.beginPath();
  ctx.rect(foot.x - r, foot.y - h, r * 2, h - 12 + r * 0.45);
  ctx.clip();
  // Coursed stone: curved joints following the drum.
  ctx.strokeStyle = 'rgba(20,22,26,0.32)';
  ctx.lineWidth = 0.7;
  for (let k = 18; k < h; k += 6) {
    ctx.beginPath();
    ctx.ellipse(foot.x, foot.y - k, r, r * 0.45, 0, 0, Math.PI);
    ctx.stroke();
  }
  for (let i = 0; i < h / 3; i++) {
    const a = rand() * Math.PI;
    const y = foot.y - 12 - rand() * (h - 12);
    ctx.fillStyle = rand() < 0.5 ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)';
    ctx.fillRect(foot.x - Math.cos(a) * r * 0.9, y, 3, 1.5);
  }
  ctx.restore();
  // Two slits staggered up the drum, both well above head height.
  slit(ctx, foot.x - r * 0.35, foot.y - h * 0.55, 1);
  slit(ctx, foot.x + r * 0.3, foot.y - h * 0.8, 0.7, 6);
  const crownY = foot.y - h;
  // A corbelled ring under the crown.
  ctx.fillStyle = css(shade(color, 0.6));
  for (let a = 0.1; a < Math.PI; a += 0.32) ctx.fillRect(foot.x + Math.cos(a) * (r + 0.5) - 1, crownY + Math.sin(a) * r * 0.45 + 2, 2, 3);
  ctx.fillStyle = css(shade(color, 1.18));
  ctx.beginPath();
  ctx.ellipse(foot.x, crownY, r + 1.5, (r + 1.5) * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(0xe8eef2);
  ctx.beginPath();
  ctx.ellipse(foot.x, crownY, r - 1, r * 0.45 - 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let a = -1.25; a <= 1.25; a += 0.42) {
    const mx = foot.x + Math.sin(a) * r * 0.95;
    const my = crownY + Math.cos(a) * r * 0.42;
    ctx.fillStyle = css(shade(color, 1.15 - a * 0.28));
    ctx.fillRect(mx - 1.8, my - 5, 3.6, 5);
    ctx.fillStyle = css(0xf0f4f7);
    ctx.beginPath();
    ctx.ellipse(mx, my - 5, 2.3, 1.1, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** A square tower astride a corner of `box`, `size` pixels a side. */
export function squareTower(ctx: Ctx, box: IsoBox, p: number, q: number, size: number, h: number, color: number, seed: number): void {
  const t = subBox(box, p - size / 2, p + size / 2, q - size / 2, q + size / 2, h);
  const footing = subBox(box, p - size / 2 - 2, p + size / 2 + 2, q - size / 2 - 2, q + size / 2 + 2, 12);
  walls(ctx, footing, (c, w, fh, light) => stone(c, w, fh, { base: shade(color, 0.85), light, seed: seed + 5 }, 6));
  outlineBox(ctx, footing, EDGE);
  walls(ctx, t, (c, w, th, light) => fortressStone(c, w, th, shade(color, 0.95), light, seed), {
    left: (c, w, th, l) => {
      slit(c, w / 2, th * 0.35, l);
      barredWindow(c, w / 2 - 3, 12, 6, 7, l, false);
      snowEdge(c, w, 3, seed + 1, l);
    },
    right: (c, w, th, l) => {
      slit(c, w / 2, th * 0.5, l);
      slit(c, w / 2, 14, l, 6);
      snowEdge(c, w, 3, seed + 2, l);
    },
  });
  snowRoof(ctx, t);
  snowyMerlons(ctx, t, shade(color, 1.05), 4, 3);
  outlineBox(ctx, t, EDGE);
}

/** The inner keep, its foot hidden in the courtyard, rising above the curtain wall. */
export function keep(ctx: Ctx, k: IsoBox, color: number, seed: number): void {
  walls(ctx, k, (c, w, h, light) => stone(c, w, h, { base: shade(color, 0.95), light, seed }, 7), {
    left: (c, w, _h, l) => {
      barredWindow(c, w * 0.35 - 3, 10, 6, 8, l, true);
      slit(c, w * 0.72, 12, l);
      snowEdge(c, w, 3, seed + 1, l);
    },
    right: (c, w, _h, l) => {
      slit(c, w / 2, 10, l);
      snowEdge(c, w, 3, seed + 2, l);
    },
  });
  snowRoof(ctx, k);
  snowyMerlons(ctx, k, shade(color, 1.05), 4, 3);
  outlineBox(ctx, k, EDGE);
}

/**
 * The gatehouse: a tower block pushed forward from the left curtain wall.
 * The portal is a tall pointed recess; the door inside it is only big
 * enough for one person at a time.
 */
export function gatehouse(ctx: Ctx, g: IsoBox, color: number, seed: number): void {
  walls(ctx, g, (c, w, h, light) => fortressStone(c, w, h, shade(color, 1.02), light, seed), {
    left: (c, w, h, l) => {
      const mid = w / 2;
      const recessW = 22;
      const recessH = 52;
      archPath(c, mid - recessW / 2 - 2, h, recessW + 4, recessH + 3);
      c.fillStyle = css(shade(color, l * 1.2));
      c.fill();
      archPath(c, mid - recessW / 2, h, recessW, recessH);
      const deep = c.createLinearGradient(mid - recessW / 2, 0, mid + recessW / 2, 0);
      deep.addColorStop(0, css(shade(color, l * 0.32)));
      deep.addColorStop(1, css(shade(color, l * 0.55)));
      c.fillStyle = deep;
      c.fill();
      doorway(c, mid - 7, h, 14, 35, { frame: shade(color, 0.8), door: 0x3a2a1c, light: l * 0.85, seed });
      c.fillStyle = css(0x1a1a1e, 0.85);
      for (const v of [h - 8, h - 18, h - 28]) c.fillRect(mid - 6, v, 12, 1.1);
      // A grille in the tympanum and a hood of corbels for dropping stones.
      barredWindow(c, mid - 3, h - 47, 6, 6, l * 0.8, false);
      c.fillStyle = css(shade(color, l * 0.55));
      c.fillRect(mid - 12, 12, 24, 5);
      c.fillStyle = css(shade(color, l * 1.1));
      c.fillRect(mid - 13, 10, 26, 2.5);
      for (let u = mid - 11; u < mid + 11; u += 4.5) {
        c.fillStyle = css(shade(color, l * 0.8));
        c.fillRect(u, 17, 2.4, 3);
      }
      slit(c, mid, 24, l, 7);
      snowEdge(c, w, 3, seed + 1, l);
      c.fillStyle = 'rgba(236,241,245,0.9)';
      c.fillRect(mid - 13, 9, 26, 1.6);
    },
    right: (c, w, h, l) => {
      slit(c, w / 2, h * 0.4, l);
      snowEdge(c, w, 3, seed + 2, l);
    },
  });
  snowRoof(ctx, g);
  snowyMerlons(ctx, g, shade(color, 1.05), 4, 3);
  outlineBox(ctx, g, EDGE);
}

/** A stone pier pierced by a barred window, a lamp still burning within. */
export function paintBarredMarker(scene: Phaser.Scene, key: string): void {
  const { box, texW, texH } = footprintBox(1, 1, 52, 10);
  paintTexture(scene, key, texW, texH, ctx => {
    const pier = subBox(box, 4, box.w - 4, 4, box.d - 4, 52);
    batteredFooting(ctx, box, 1, 4, 8, 0x4e555e, 150);
    groundShadow(ctx, pier, 4, 0.3);
    walls(ctx, pier, (c, w, h, light) => fortressStone(c, w, h, 0x4e555e, light, 151), {
      left: (c, w, h, l) => {
        barredWindow(c, w / 2 - 4, h * 0.3, 8, 11, l, true);
        snowEdge(c, w, 3, 152, l);
      },
      right: (c, w, h, l) => {
        barredWindow(c, w / 2 - 3.5, h * 0.32, 7, 10, l, false);
        snowEdge(c, w, 3, 153, l);
      },
    });
    onRoof(ctx, pier, (w, d) => {
      ctx.fillStyle = css(shade(0xe2e9ee, LIGHT.roof));
      ctx.fillRect(0, 0, w, d);
    });
    outlineBox(ctx, pier, 0x101418);
    // Lamplight spilling onto the snow below the window.
    const sill = groundPoint(pier, pier.w / 2, -2);
    const g = ctx.createRadialGradient(sill.x, sill.y + 2, 0, sill.x, sill.y + 2, 12);
    g.addColorStop(0, 'rgba(255,200,120,0.3)');
    g.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = g;
    ctx.fillRect(sill.x - 12, sill.y - 10, 24, 16);
  });
}

/** A plank footbridge over one water cell with rope rails; kept low so it can be walked. */
export function paintFootbridge(scene: Phaser.Scene, key: string): void {
  const { box, texW, texH } = footprintBox(1, 1, 5, 14);
  paintTexture(scene, key, texW, texH, ctx => {
    groundShadow(ctx, box, 3, 0.25);
    walls(ctx, box, (c, w, h, light) => {
      c.fillStyle = css(shade(0x3a2a1a, light));
      c.fillRect(0, 0, w, h);
      c.fillStyle = css(shade(0x5a4028, light));
      c.fillRect(0, 0, w, 2);
    });
    onRoof(ctx, box, (w, d) => planks(ctx, w, d, { base: 0x8a6a44, light: LIGHT.roof, seed: 161 }, true, 5));
    outlineBox(ctx, box, 0x24180e);
    // Posts on the four corners and rope rails along the two banks' edges.
    const at = (p: number, q: number) => liftedPoint(box, p, q, box.h);
    const corners = [at(0, 0), at(0, box.d), at(box.w, 0), at(box.w, box.d)];
    const railH = 14;
    ctx.strokeStyle = css(0xc9b088, 0.95);
    ctx.lineWidth = 1;
    for (const [a, b] of [[corners[1]!, corners[3]!], [corners[0]!, corners[2]!]] as const) {
      post(ctx, a.x, a.y, railH, 2, 0x4a3018);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y - railH + 1);
      ctx.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 - railH + 4, b.x, b.y - railH + 1);
      ctx.stroke();
      post(ctx, b.x, b.y, railH, 2, 0x4a3018);
    }
  });
}
