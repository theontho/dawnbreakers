import { css, mix, rng, shade, type Ctx } from './canvasKit';

/**
 * Surface painters. Each fills a face-space rectangle `[0, w] x [0, h]`
 * (call them inside `onLeftWall` / `onRightWall` / `onRoof`). `light` is the
 * face's brightness factor so the same material reads correctly on the
 * sunlit and the shaded side.
 */

export interface Surface {
  base: number;
  light: number;
  seed: number;
}

/** Lime or mud plaster: mottled, speckled, darker where it meets the ground. */
export function plaster(ctx: Ctx, w: number, h: number, s: Surface): void {
  const rand = rng(s.seed);
  const base = shade(s.base, s.light);
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, css(shade(base, 1.06)));
  grad.addColorStop(0.75, css(base));
  grad.addColorStop(1, css(shade(base, 0.72)));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  // Broad mottling where the plaster has been patched over the years.
  for (let i = 0; i < Math.max(3, (w * h) / 500); i++) {
    ctx.fillStyle = css(shade(base, 0.86 + rand() * 0.24), 0.22);
    ctx.beginPath();
    ctx.ellipse(rand() * w, rand() * h, 4 + rand() * 10, 2 + rand() * 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  speckle(ctx, w, h, base, rand, 0.9);
  // A hairline crack or two.
  ctx.strokeStyle = css(shade(base, 0.6), 0.45);
  ctx.lineWidth = 0.7;
  for (let i = 0; i < Math.floor(w / 40); i++) {
    let x = rand() * w;
    let y = h * (0.15 + rand() * 0.4);
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let k = 0; k < 4; k++) {
      x += (rand() - 0.5) * 6;
      y += 2 + rand() * 4;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // Rising damp and dust at the foot of the wall.
  const foot = ctx.createLinearGradient(0, h - 8, 0, h);
  foot.addColorStop(0, 'rgba(40,25,12,0)');
  foot.addColorStop(1, 'rgba(40,25,12,0.35)');
  ctx.fillStyle = foot;
  ctx.fillRect(0, h - 8, w, 8);
}

/** Fired brick in running bond. */
export function brick(ctx: Ctx, w: number, h: number, s: Surface, course = 4, length = 9): void {
  const rand = rng(s.seed);
  const base = shade(s.base, s.light);
  ctx.fillStyle = css(shade(base, 0.62));
  ctx.fillRect(0, 0, w, h);
  for (let row = 0, y = 0; y < h; row++, y += course) {
    const offset = row % 2 ? length / 2 : 0;
    for (let x = -offset; x < w; x += length) {
      ctx.fillStyle = css(shade(base, 0.85 + rand() * 0.3));
      ctx.fillRect(x + 0.5, y + 0.5, length - 1, course - 1);
    }
  }
  shadeVertical(ctx, w, h);
}

/** Dressed or rubble stone blocks of varying width. */
export function stone(ctx: Ctx, w: number, h: number, s: Surface, course = 9): void {
  const rand = rng(s.seed);
  const base = shade(s.base, s.light);
  ctx.fillStyle = css(shade(base, 0.55));
  ctx.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += course) {
    let x = -rand() * 10;
    while (x < w) {
      const len = 10 + rand() * 14;
      ctx.fillStyle = css(shade(base, 0.82 + rand() * 0.32));
      ctx.fillRect(x + 0.6, y + 0.6, len - 1.2, course - 1.2);
      ctx.fillStyle = css(0xffffff, 0.08);
      ctx.fillRect(x + 0.6, y + 0.6, len - 1.2, 1);
      x += len;
    }
  }
  speckle(ctx, w, h, base, rand, 0.4);
  shadeVertical(ctx, w, h);
}

/** Wooden boards; vertical boards for doors and palisades. */
export function planks(ctx: Ctx, w: number, h: number, s: Surface, vertical = false, width = 5): void {
  const rand = rng(s.seed);
  const base = shade(s.base, s.light);
  ctx.fillStyle = css(shade(base, 0.6));
  ctx.fillRect(0, 0, w, h);
  const span = vertical ? w : h;
  for (let a = 0; a < span; a += width) {
    ctx.fillStyle = css(shade(base, 0.82 + rand() * 0.3));
    if (vertical) ctx.fillRect(a + 0.5, 0, width - 1, h);
    else ctx.fillRect(0, a + 0.5, w, width - 1);
  }
  // Grain.
  ctx.strokeStyle = css(shade(base, 0.6), 0.35);
  ctx.lineWidth = 0.5;
  for (let i = 0; i < (w * h) / 60; i++) {
    const x = rand() * w;
    const y = rand() * h;
    ctx.beginPath();
    if (vertical) {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 3 + rand() * 6);
    } else {
      ctx.moveTo(x, y);
      ctx.lineTo(x + 3 + rand() * 6, y);
    }
    ctx.stroke();
  }
}

/** Glazed tile field: turquoise and lapis with a small star lattice. */
export function glazedTiles(ctx: Ctx, w: number, h: number, s: Surface, cell = 6): void {
  const base = shade(s.base, s.light);
  ctx.fillStyle = css(base);
  ctx.fillRect(0, 0, w, h);
  const dark = shade(mix(base, 0x10204a, 0.55), 1);
  const pale = shade(mix(base, 0xf2ead6, 0.6), 1);
  for (let y = 0; y < h + cell; y += cell) {
    for (let x = (y / cell) % 2 ? cell / 2 : 0; x < w + cell; x += cell) {
      ctx.fillStyle = css(dark, 0.8);
      ctx.beginPath();
      ctx.moveTo(x, y - cell * 0.42);
      ctx.lineTo(x + cell * 0.42, y);
      ctx.lineTo(x, y + cell * 0.42);
      ctx.lineTo(x - cell * 0.42, y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = css(pale, 0.85);
      ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
    }
  }
  const sheen = ctx.createLinearGradient(0, 0, w, h);
  sheen.addColorStop(0, 'rgba(255,255,255,0.12)');
  sheen.addColorStop(1, 'rgba(0,0,0,0.12)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, w, h);
}

/** Packed earth or thatch roof surface. */
export function earthRoof(ctx: Ctx, w: number, d: number, s: Surface): void {
  const rand = rng(s.seed);
  const base = shade(s.base, s.light);
  ctx.fillStyle = css(base);
  ctx.fillRect(0, 0, w, d);
  speckle(ctx, w, d, base, rand, 1.2);
  ctx.strokeStyle = css(shade(base, 0.82), 0.4);
  ctx.lineWidth = 0.6;
  for (let i = 0; i < (w * d) / 300; i++) {
    const x = rand() * w;
    const y = rand() * d;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rand() - 0.5) * 8, y + (rand() - 0.5) * 8);
    ctx.stroke();
  }
}

function speckle(ctx: Ctx, w: number, h: number, base: number, rand: () => number, density: number): void {
  const count = Math.floor((w * h) / 18 * density);
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = css(rand() < 0.5 ? shade(base, 0.75) : shade(base, 1.2), 0.35);
    ctx.fillRect(Math.floor(rand() * w), Math.floor(rand() * h), 1, 1);
  }
}

function shadeVertical(ctx: Ctx, w: number, h: number): void {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(255,240,210,0.08)');
  grad.addColorStop(0.7, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(30,18,8,0.3)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}
