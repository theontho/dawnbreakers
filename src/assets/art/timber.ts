import { css, rng, shade, type Ctx } from './canvasKit';

/**
 * Rough timber for the Māzandarān fort and the forest: round logs with bark
 * and sawn end grain, sharpened palisade stakes, rope lashings. Logs are
 * drawn in screen space between two points so they can lie along either iso
 * axis or anywhere in between.
 */

export interface Pt {
  x: number;
  y: number;
}

export const BARK = 0x5a3c22;
export const SAWN = 0xc9a46e;

export interface LogStyle {
  bark?: number;
  seed?: number;
  /** Show the sawn end at `a`, `b`, both or neither. */
  ends?: 'a' | 'b' | 'both' | 'none';
  /** Moss along the upper side. */
  moss?: boolean;
}

/** A round log lying from `a` to `b` with radius `r`, lit from above. */
export function roundLog(ctx: Ctx, a: Pt, b: Pt, r: number, style: LogStyle = {}): void {
  const bark = style.bark ?? BARK;
  const rand = rng(style.seed ?? 5);
  let from = a;
  let to = b;
  let ends = style.ends ?? 'b';
  if (b.x < a.x) {
    from = b;
    to = a;
    ends = ends === 'a' ? 'b' : ends === 'b' ? 'a' : ends;
  }
  const len = Math.hypot(to.x - from.x, to.y - from.y);
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  ctx.save();
  ctx.translate(from.x, from.y);
  ctx.rotate(angle);
  const body = ctx.createLinearGradient(0, -r, 0, r);
  body.addColorStop(0, css(shade(bark, 1.45)));
  body.addColorStop(0.35, css(shade(bark, 1.05)));
  body.addColorStop(1, css(shade(bark, 0.5)));
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.45, r, 0, Math.PI / 2, Math.PI * 1.5);
  ctx.lineTo(len, -r);
  ctx.ellipse(len, 0, r * 0.45, r, 0, -Math.PI / 2, Math.PI / 2);
  ctx.closePath();
  ctx.fill();
  // Bark furrows run along the log.
  ctx.lineWidth = 0.7;
  for (let i = 0; i < len / 3; i++) {
    const y = (rand() * 2 - 1) * r * 0.85;
    const x = rand() * len;
    ctx.strokeStyle = css(shade(bark, y < 0 ? 0.75 : 0.45), 0.6);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(Math.min(len, x + 3 + rand() * 6), y + (rand() - 0.5));
    ctx.stroke();
  }
  if (style.moss) {
    for (let i = 0; i < len / 2; i++) {
      ctx.fillStyle = css(rand() < 0.5 ? 0x4f7a3a : 0x6a9a48, 0.85);
      ctx.fillRect(rand() * len, -r + rand() * r * 0.5, 2, 1.2);
    }
  }
  ctx.strokeStyle = 'rgba(20,10,4,0.7)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(len, -r);
  ctx.moveTo(0, r);
  ctx.lineTo(len, r);
  ctx.stroke();
  if (ends === 'a' || ends === 'both') endGrain(ctx, 0, 0, r * 0.45, r, 0);
  if (ends === 'b' || ends === 'both') endGrain(ctx, len, 0, r * 0.45, r, 0);
  ctx.restore();
}

/** Sawn log end: pale wood, growth rings and a ring of bark. */
export function endGrain(ctx: Ctx, x: number, y: number, rx: number, ry: number, rotation: number, wood = SAWN): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = css(shade(BARK, 0.8));
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  const g = ctx.createRadialGradient(-rx * 0.3, -ry * 0.3, 0, 0, 0, Math.max(rx, ry));
  g.addColorStop(0, css(shade(wood, 1.15)));
  g.addColorStop(1, css(shade(wood, 0.8)));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx * 0.82, ry * 0.82, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = css(shade(wood, 0.62), 0.7);
  ctx.lineWidth = 0.5;
  for (const k of [0.55, 0.3]) {
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * k, ry * k, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(20,10,4,0.7)';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/**
 * A row of sharpened stakes in face space (u across, v down), tips rising
 * `tip` pixels above the face. Call from a `walls` decorator so the tips are
 * not clipped away.
 */
export function stakeRow(ctx: Ctx, w: number, h: number, light: number, seed: number, pitch = 5, tip = 6, wood = 0x6b4a2c): void {
  const rand = rng(seed);
  for (let u = 0; u < w - 1; u += pitch) {
    const sw = pitch - 0.6;
    const lift = rand() * 2.5;
    const top = -lift;
    const base = shade(wood, light * (0.85 + rand() * 0.3));
    const g = ctx.createLinearGradient(u, 0, u + sw, 0);
    g.addColorStop(0, css(shade(base, 1.3)));
    g.addColorStop(0.4, css(base));
    g.addColorStop(1, css(shade(base, 0.55)));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(u, h);
    ctx.lineTo(u, top);
    ctx.lineTo(u + sw / 2, top - tip);
    ctx.lineTo(u + sw, top);
    ctx.lineTo(u + sw, h);
    ctx.closePath();
    ctx.fill();
    // Fresh axe cut on the point.
    ctx.fillStyle = css(shade(SAWN, light), 0.8);
    ctx.beginPath();
    ctx.moveTo(u + sw / 2, top - tip);
    ctx.lineTo(u + sw, top);
    ctx.lineTo(u + sw * 0.6, top + 1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(20,10,4,0.55)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(u + sw, h);
    ctx.lineTo(u + sw, top);
    ctx.stroke();
  }
}

/** A rope lashing band across a face at height `v`. */
export function lashing(ctx: Ctx, w: number, v: number, light: number): void {
  ctx.fillStyle = css(shade(0x8a7048, light));
  ctx.fillRect(0, v, w, 2);
  ctx.strokeStyle = css(shade(0x4a3a24, light), 0.8);
  ctx.lineWidth = 0.6;
  for (let u = 1; u < w; u += 2.5) {
    ctx.beginPath();
    ctx.moveTo(u, v);
    ctx.lineTo(u + 1.2, v + 2);
    ctx.stroke();
  }
}

/** Horizontal round-log courses for a face (a log cabin wall). */
export function logCourses(ctx: Ctx, w: number, h: number, light: number, seed: number, course = 6, bark = BARK): void {
  const rand = rng(seed);
  ctx.fillStyle = css(shade(bark, light * 0.45));
  ctx.fillRect(0, 0, w, h);
  for (let v = h - course; v > -course; v -= course) {
    const base = shade(bark, light * (0.9 + rand() * 0.25));
    const g = ctx.createLinearGradient(0, v, 0, v + course);
    g.addColorStop(0, css(shade(base, 1.35)));
    g.addColorStop(0.45, css(base));
    g.addColorStop(1, css(shade(base, 0.5)));
    ctx.fillStyle = g;
    ctx.fillRect(0, v + 0.4, w, course - 0.8);
    ctx.strokeStyle = css(shade(base, 0.6), 0.5);
    ctx.lineWidth = 0.5;
    for (let i = 0; i < w / 8; i++) {
      const x = rand() * w;
      const y = v + 1 + rand() * (course - 2);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 3 + rand() * 5, y);
      ctx.stroke();
    }
  }
}
