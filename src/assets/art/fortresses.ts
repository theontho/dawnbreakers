import { css, onLeftWall, onRightWall, onRoof, outlineBox, polygon, rng, shade, type Ctx, type IsoBox } from './canvasKit';
import { stone } from './materials';
import { archPath, cylinder, LIGHT, walls } from './ornaments';
import { liftedPoint, snowEdge, subBox, type Pt } from './structureParts';
import { TOWN_DOOR } from './town/townKit';

/**
 * Parts for the mountain prisons of Ādharbāyjān at true scale (a metre is
 * about 23 px, a storey 80): rubble stone, battered footings, round bastions
 * and square towers, the inner keep, the iron-bound door, and the barred
 * windows set high in the walls, their sills well above a man's reach.
 * `mountainFortress.ts` assembles them into Mākū and Chihrīq.
 */

export const EDGE = 0x14181c;
/** Merlons a little under a metre square, with a gap between. */
const MERLON = { size: 14, gap: 10, rise: 18 } as const;

export function fortressStone(ctx: Ctx, w: number, h: number, color: number, light: number, seed: number): void {
  stone(ctx, w, h, { base: color, light, seed }, 10);
  // Battered talus: the lower courses are larger and darker.
  ctx.fillStyle = 'rgba(20,24,30,0.22)';
  ctx.fillRect(0, h - 22, w, 22);
  ctx.fillStyle = 'rgba(230,235,240,0.18)';
  ctx.fillRect(0, h - 22, w, 1);
}

/** An arrow slit about a metre tall, with a short cross for a crossbow's sweep. */
export function slit(ctx: Ctx, u: number, v: number, light: number, len = 22): void {
  ctx.fillStyle = css(shade(0x0e1014, light + 0.2));
  ctx.fillRect(u - 1.5, v, 3, len);
  ctx.fillRect(u - 4.5, v + len * 0.4, 9, 2);
  ctx.fillStyle = 'rgba(230,235,240,0.25)';
  ctx.fillRect(u + 1.5, v, 0.8, len);
}

/** A small deep-set window crossed with iron bars, dark or lamp-lit within. */
export function barredWindow(ctx: Ctx, x: number, y: number, w: number, h: number, light: number, lit: boolean): void {
  ctx.fillStyle = css(shade(0xb8b4ac, light));
  ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
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
  ctx.fillRect(x, y, 2.5, h);
  ctx.fillRect(x, y, w, 2);
  ctx.strokeStyle = css(shade(0x9aa4ac, light));
  ctx.lineWidth = 1.3;
  for (let u = x + 3.5; u < x + w - 1; u += 3.5) {
    ctx.beginPath();
    ctx.moveTo(u, y);
    ctx.lineTo(u, y + h);
    ctx.stroke();
  }
  for (const t of [0.33, 0.66]) {
    ctx.beginPath();
    ctx.moveTo(x, y + h * t);
    ctx.lineTo(x + w, y + h * t);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(240,245,250,0.85)';
  ctx.fillRect(x - 3, y + h + 1, w + 6, 2.5);
}

/** Square merlons along both front faces of `box`, each carrying a cap of snow. */
export function snowyMerlons(ctx: Ctx, box: IsoBox, color: number, size: number = MERLON.size, gap: number = MERLON.gap, rise: number = MERLON.rise): void {
  const paint = (w: number, light: number): void => {
    for (let u = gap / 2; u + size <= w; u += size + gap) {
      ctx.fillStyle = css(shade(color, light));
      ctx.fillRect(u, -rise, size, rise);
      ctx.strokeStyle = css(EDGE, 0.55);
      ctx.lineWidth = 0.8;
      ctx.strokeRect(u, -rise, size, rise);
      ctx.fillStyle = css(0xf0f4f7, 0.95);
      ctx.beginPath();
      ctx.ellipse(u + size / 2, -rise, size / 2 + 1, 2.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  onLeftWall(ctx, box, w => paint(w, LIGHT.left));
  onRightWall(ctx, box, w => paint(w, LIGHT.right));
}

/** A walled roof under snow, the wall-walk trodden grey along the parapet. */
export function snowRoof(ctx: Ctx, box: IsoBox, walk = 0): void {
  onRoof(ctx, box, (w, d) => {
    ctx.fillStyle = css(0xe8eef2);
    ctx.fillRect(0, 0, w, d);
    if (walk > 0) {
      ctx.fillStyle = 'rgba(110,118,128,0.35)';
      ctx.fillRect(w - walk, 0, walk * 0.7, d);
      ctx.fillRect(0, 2, w, walk * 0.7);
    }
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
    (side === 'left' ? onLeftWall : onRightWall)(ctx, base, (fw, fh) => stone(ctx, fw, fh, { base: shade(color, 0.92), light, seed }, 12));
    ctx.restore();
    ctx.strokeStyle = css(EDGE, 0.7);
    ctx.lineWidth = 1;
    polygon(ctx, pts);
    ctx.stroke();
  }
  // Snow lodged on the crest of the slope.
  ctx.strokeStyle = 'rgba(236,241,245,0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  const crest = [at(inner, inner, h), at(w - inner, inner, h), at(w - inner, d - inner, h)];
  crest.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y + 1) : ctx.moveTo(p.x, p.y + 1)));
  ctx.stroke();
}

/** A round bastion standing on a flared footing, crowned with snowy merlons. */
export function roundTower(ctx: Ctx, foot: Pt, r: number, h: number, color: number, seed: number): void {
  const rand = rng(seed);
  const footing = 30;
  cylinder(ctx, foot.x, foot.y + 2, r + 6, footing, shade(color, 0.9), false);
  ctx.fillStyle = 'rgba(236,241,245,0.8)';
  ctx.beginPath();
  ctx.ellipse(foot.x, foot.y - footing + 2, r + 5, (r + 5) * 0.42, 0, 0.1, Math.PI - 0.1);
  ctx.fill();
  cylinder(ctx, foot.x, foot.y - footing + 2, r, h - footing, color, false);
  ctx.save();
  ctx.beginPath();
  ctx.rect(foot.x - r, foot.y - h, r * 2, h - footing + r * 0.45);
  ctx.clip();
  // Coursed stone: curved joints following the drum.
  ctx.strokeStyle = 'rgba(20,22,26,0.32)';
  ctx.lineWidth = 0.8;
  for (let k = footing + 8; k < h; k += 10) {
    ctx.beginPath();
    ctx.ellipse(foot.x, foot.y - k, r, r * 0.45, 0, 0, Math.PI);
    ctx.stroke();
  }
  for (let i = 0; i < h / 2; i++) {
    const a = rand() * Math.PI;
    const y = foot.y - footing - rand() * (h - footing);
    ctx.fillStyle = rand() < 0.5 ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)';
    ctx.fillRect(foot.x - Math.cos(a) * r * 0.9, y, 4, 2);
  }
  ctx.restore();
  // Slits staggered up the drum, all well above head height.
  slit(ctx, foot.x - r * 0.35, foot.y - h * 0.5, 1);
  slit(ctx, foot.x + r * 0.3, foot.y - h * 0.78, 0.7, 18);
  const crownY = foot.y - h;
  // A corbelled ring under the crown.
  ctx.fillStyle = css(shade(color, 0.6));
  for (let a = 0.1; a < Math.PI; a += 0.26) ctx.fillRect(foot.x + Math.cos(a) * (r + 1) - 2, crownY + Math.sin(a) * r * 0.45 + 3, 4, 6);
  ctx.fillStyle = css(shade(color, 1.18));
  ctx.beginPath();
  ctx.ellipse(foot.x, crownY, r + 3, (r + 3) * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(0xe8eef2);
  ctx.beginPath();
  ctx.ellipse(foot.x, crownY, r - 2, r * 0.45 - 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let a = -1.25; a <= 1.26; a += 0.5) {
    const mx = foot.x + Math.sin(a) * r * 0.95;
    const my = crownY + Math.cos(a) * r * 0.42;
    ctx.fillStyle = css(shade(color, 1.15 - a * 0.28));
    ctx.fillRect(mx - 5, my - 14, 10, 14);
    ctx.fillStyle = css(0xf0f4f7);
    ctx.beginPath();
    ctx.ellipse(mx, my - 14, 6, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** A square tower astride a corner of `box`, `size` pixels a side. */
export function squareTower(ctx: Ctx, box: IsoBox, p: number, q: number, size: number, h: number, color: number, seed: number): void {
  const t = subBox(box, p - size / 2, p + size / 2, q - size / 2, q + size / 2, h);
  const footing = subBox(box, p - size / 2 - 5, p + size / 2 + 5, q - size / 2 - 5, q + size / 2 + 5, 26);
  walls(ctx, footing, (c, w, fh, light) => stone(c, w, fh, { base: shade(color, 0.85), light, seed: seed + 5 }, 12));
  outlineBox(ctx, footing, EDGE);
  walls(ctx, t, (c, w, th, light) => fortressStone(c, w, th, shade(color, 0.95), light, seed), {
    left: (c, w, th, l) => {
      slit(c, w / 2, th * 0.45, l);
      barredWindow(c, w / 2 - 6, 30, 12, 16, l, false);
      snowEdge(c, w, 5, seed + 1, l);
    },
    right: (c, w, th, l) => {
      slit(c, w / 2, th * 0.55, l);
      slit(c, w / 2, 34, l, 18);
      snowEdge(c, w, 5, seed + 2, l);
    },
  });
  snowRoof(ctx, t);
  snowyMerlons(ctx, t, shade(color, 1.05), 10, 8, 14);
  outlineBox(ctx, t, EDGE);
}

/** The inner keep, its foot hidden in the courtyard, rising well above the curtain wall. */
export function keep(ctx: Ctx, k: IsoBox, color: number, seed: number): void {
  walls(ctx, k, (c, w, h, light) => stone(c, w, h, { base: shade(color, 0.95), light, seed }, 11), {
    left: (c, w, _h, l) => {
      barredWindow(c, w * 0.35 - 7, 26, 14, 18, l, true);
      slit(c, w * 0.72, 30, l);
      snowEdge(c, w, 5, seed + 1, l);
    },
    right: (c, w, _h, l) => {
      slit(c, w / 2, 28, l);
      barredWindow(c, w * 0.25 - 6, 60, 12, 16, l, false);
      snowEdge(c, w, 5, seed + 2, l);
    },
  });
  snowRoof(ctx, k);
  snowyMerlons(ctx, k, shade(color, 1.05), 12, 9, 16);
  outlineBox(ctx, k, EDGE);
}

/**
 * The castle's own door in face space: a tall pointed recess with a hood of
 * corbels above it for dropping stones; the iron-bound door inside it is
 * only big enough for one person at a time.
 */
export function ironDoor(c: Ctx, mid: number, h: number, color: number, l: number): void {
  const recessW = 50;
  const recessH = 96;
  archPath(c, mid - recessW / 2 - 4, h, recessW + 8, recessH + 5);
  c.fillStyle = css(shade(color, l * 1.2));
  c.fill();
  archPath(c, mid - recessW / 2, h, recessW, recessH);
  const deep = c.createLinearGradient(mid - recessW / 2, 0, mid + recessW / 2, 0);
  deep.addColorStop(0, css(shade(color, l * 0.32)));
  deep.addColorStop(1, css(shade(color, l * 0.55)));
  c.fillStyle = deep;
  c.fill();
  const dw = TOWN_DOOR.w + 3;
  const dh = TOWN_DOOR.h + 4;
  archPath(c, mid - dw / 2, h, dw, dh);
  c.fillStyle = css(shade(0x3a2a1c, l * 0.85));
  c.fill();
  // Iron straps and studs.
  c.fillStyle = css(0x1a1a1e, 0.85);
  for (const v of [h - 10, h - 24, h - 38]) c.fillRect(mid - dw / 2 + 1, v, dw - 2, 1.6);
  c.fillStyle = 'rgba(200,200,190,0.45)';
  for (const v of [h - 10, h - 24, h - 38]) for (let u = mid - dw / 2 + 3; u < mid + dw / 2 - 2; u += 5) c.fillRect(u, v - 0.5, 1.2, 1.2);
  // A grille in the tympanum and the machicolation hood.
  barredWindow(c, mid - 6, h - recessH + 16, 12, 12, l * 0.8, false);
  const hoodY = h - recessH - 30;
  c.fillStyle = css(shade(color, l * 0.55));
  c.fillRect(mid - 30, hoodY, 60, 12);
  c.fillStyle = css(shade(color, l * 1.1));
  c.fillRect(mid - 32, hoodY - 4, 64, 5);
  for (let u = mid - 27; u < mid + 27; u += 9) {
    c.fillStyle = css(shade(color, l * 0.8));
    c.fillRect(u, hoodY + 12, 5, 7);
    c.fillStyle = 'rgba(10,10,14,0.6)';
    c.fillRect(u + 5, hoodY + 12, 4, 5);
  }
  c.fillStyle = 'rgba(236,241,245,0.9)';
  c.fillRect(mid - 32, hoodY - 6, 64, 3);
}
