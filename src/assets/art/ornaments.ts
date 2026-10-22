import {
  css,
  onLeftWall,
  onRightWall,
  onRoof,
  outlineBox,
  shade,
  type Ctx,
  type IsoBox,
} from './canvasKit';
import { earthRoof, planks, type Surface } from './materials';

/** Brightness of each face under the game's late-afternoon light from the left. */
export const LIGHT = { left: 1, right: 0.7, roof: 1.12 } as const;

type FacePainter = (ctx: Ctx, w: number, h: number, light: number) => void;

/** Paints both walls with the same material and outlines the box. Roof is left to the caller. */
export function walls(ctx: Ctx, box: IsoBox, paint: FacePainter, decorate?: { left?: FacePainter; right?: FacePainter }): void {
  onLeftWall(ctx, box, (w, h) => {
    clipped(ctx, w, h, () => paint(ctx, w, h, LIGHT.left));
    decorate?.left?.(ctx, w, h, LIGHT.left);
  });
  onRightWall(ctx, box, (w, h) => {
    clipped(ctx, w, h, () => paint(ctx, w, h, LIGHT.right));
    decorate?.right?.(ctx, w, h, LIGHT.right);
  });
}

/** Runs `paint` clipped to the face rectangle, so materials never spill past an edge. */
export function clipped(ctx: Ctx, w: number, h: number, paint: () => void): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.clip();
  paint();
  ctx.restore();
}

/** Flat roof sunk behind a low parapet, as on most Persian houses. */
export function parapetRoof(ctx: Ctx, box: IsoBox, rim: number, floor: Surface, inset = 4, depth = 5): void {
  onRoof(ctx, box, (w, d) => {
    ctx.fillStyle = css(shade(rim, LIGHT.roof));
    ctx.fillRect(0, 0, w, d);
    ctx.beginPath();
    ctx.rect(inset, inset, w - inset * 2, d - inset * 2);
    ctx.save();
    ctx.clip();
    // What shows of the inner parapet faces at the back.
    ctx.fillStyle = css(shade(rim, 0.62));
    ctx.fillRect(0, 0, w, d);
    // Screen-down by `depth` is (+depth, -depth) in roof space.
    ctx.translate(depth, -depth);
    ctx.beginPath();
    ctx.rect(inset, inset, w - inset * 2, d - inset * 2);
    ctx.clip();
    earthRoof(ctx, w, d, floor);
    ctx.restore();
    ctx.strokeStyle = css(shade(rim, 1.3), 0.55);
    ctx.lineWidth = 0.8;
    ctx.strokeRect(0.5, 0.5, w - 1, d - 1);
  });
}

/** Plain flat top for boxes that need no parapet. */
export function flatTop(ctx: Ctx, box: IsoBox, color: number): void {
  onRoof(ctx, box, (w, d) => {
    ctx.fillStyle = css(shade(color, LIGHT.roof));
    ctx.fillRect(0, 0, w, d);
    ctx.strokeStyle = css(shade(color, 1.35), 0.5);
    ctx.lineWidth = 0.8;
    ctx.strokeRect(0.5, 0.5, w - 1, d - 1);
  });
}

/** Crenellations rising above both front walls. */
export function merlons(ctx: Ctx, box: IsoBox, color: number, size = 4, gap = 4): void {
  const paint = (w: number, light: number) => {
    for (let u = gap / 2; u + size <= w; u += size + gap) {
      ctx.fillStyle = css(shade(color, light));
      ctx.beginPath();
      ctx.moveTo(u, 0);
      ctx.lineTo(u, -size);
      ctx.quadraticCurveTo(u + size / 2, -size - 2, u + size, -size);
      ctx.lineTo(u + size, 0);
      ctx.fill();
    }
  };
  onLeftWall(ctx, box, w => paint(w, LIGHT.left));
  onRightWall(ctx, box, w => paint(w, LIGHT.right));
}

/** Persian pointed arch path in face space. */
export function archPath(ctx: Ctx, x: number, base: number, width: number, height: number): void {
  const apex = base - height;
  const spring = Math.min(base, apex + width * 0.62);
  const cx = x + width / 2;
  ctx.beginPath();
  ctx.moveTo(x, base);
  ctx.lineTo(x, spring);
  ctx.bezierCurveTo(x, spring - width * 0.34, cx - width * 0.2, apex + width * 0.14, cx, apex);
  ctx.bezierCurveTo(cx + width * 0.2, apex + width * 0.14, x + width, spring - width * 0.34, x + width, spring);
  ctx.lineTo(x + width, base);
  ctx.closePath();
}

export interface DoorwayStyle {
  frame: number;
  door?: number;
  light: number;
  /** Open passage (dark) instead of a closed wooden door. */
  open?: boolean;
  /** Glazed tile panel framing the arch, as on a mosque iwan. */
  tile?: number;
  seed?: number;
}

/** Arched doorway with a brick surround and studded double doors. */
export function doorway(ctx: Ctx, x: number, base: number, width: number, height: number, style: DoorwayStyle): void {
  const l = style.light;
  if (style.tile !== undefined) {
    ctx.fillStyle = css(shade(style.tile, l));
    ctx.fillRect(x - 5, base - height - 6, width + 10, height + 6);
    ctx.strokeStyle = css(shade(0xe8d9a8, l), 0.8);
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 4.5, base - height - 5.5, width + 9, height + 5.5);
  }
  archPath(ctx, x - 2, base, width + 4, height + 2);
  ctx.fillStyle = css(shade(style.frame, l * 0.92));
  ctx.fill();
  archPath(ctx, x, base, width, height);
  ctx.fillStyle = css(0x140c06);
  ctx.fill();
  if (!style.open) {
    ctx.save();
    archPath(ctx, x + 1.2, base, width - 2.4, height - 1.5);
    ctx.clip();
    planks(ctx, width + x + 2, base + 1, { base: style.door ?? 0x5b3a20, light: l, seed: style.seed ?? 7 }, true, 3);
    ctx.strokeStyle = css(0x140c06, 0.9);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + width / 2, base);
    ctx.lineTo(x + width / 2, base - height);
    ctx.stroke();
    ctx.fillStyle = css(shade(0xd0a858, l), 0.9);
    for (let row = base - height * 0.82; row < base - 2; row += 5) {
      ctx.fillRect(x + 2.5, row, 1, 1);
      ctx.fillRect(x + width - 3.5, row, 1, 1);
    }
    ctx.strokeStyle = css(shade(0xd0a858, l), 0.95);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(x + width / 2 - 2.5, base - height * 0.45, 1.4, 0, Math.PI * 2);
    ctx.moveTo(x + width / 2 + 3.9, base - height * 0.45);
    ctx.arc(x + width / 2 + 2.5, base - height * 0.45, 1.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  // Worn stone sill.
  ctx.fillStyle = css(shade(0x9a8a70, l));
  ctx.fillRect(x - 3, base - 1.5, width + 6, 1.5);
}

export interface WindowStyle {
  frame: number;
  light: number;
  /** Warm lamplight behind the lattice instead of darkness. */
  lit?: boolean;
  arched?: boolean;
  shutters?: number;
}

/** A small window with a wooden lattice screen. */
export function latticeWindow(ctx: Ctx, x: number, y: number, w: number, h: number, style: WindowStyle): void {
  const l = style.light;
  ctx.fillStyle = css(shade(style.frame, l));
  if (style.arched) archPath(ctx, x - 1.5, y + h + 1.5, w + 3, h + 3);
  else {
    ctx.beginPath();
    ctx.rect(x - 1.5, y - 1.5, w + 3, h + 3);
  }
  ctx.fill();
  if (style.arched) archPath(ctx, x, y + h, w, h);
  else {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
  }
  ctx.save();
  ctx.clip();
  if (style.lit) {
    const glow = ctx.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, Math.max(w, h));
    glow.addColorStop(0, '#ffe2a0');
    glow.addColorStop(1, '#c47a2c');
    ctx.fillStyle = glow;
  } else {
    ctx.fillStyle = css(0x1a120c);
  }
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = css(shade(style.frame, l * 0.85), 0.95);
  ctx.lineWidth = 0.8;
  for (let k = -h; k < w + h; k += 3) {
    ctx.beginPath();
    ctx.moveTo(x + k, y);
    ctx.lineTo(x + k + h, y + h);
    ctx.moveTo(x + k + h, y);
    ctx.lineTo(x + k, y + h);
    ctx.stroke();
  }
  ctx.restore();
  if (style.shutters !== undefined) {
    ctx.fillStyle = css(shade(style.shutters, l));
    ctx.fillRect(x - 4, y - 1, 3, h + 2);
    ctx.fillRect(x + w + 1, y - 1, 3, h + 2);
  }
  ctx.fillStyle = css(shade(0x9a8a70, l));
  ctx.fillRect(x - 2.5, y + h + 1, w + 5, 1.5);
}

/** Protruding roof-beam ends with the stain they leave below. */
export function beamEnds(ctx: Ctx, w: number, y: number, light: number, spacing = 9): void {
  for (let u = spacing / 2; u < w - 2; u += spacing) {
    ctx.fillStyle = 'rgba(40,24,10,0.18)';
    ctx.fillRect(u, y + 3, 2.5, 7);
    ctx.fillStyle = css(shade(0x4a2e18, light));
    ctx.fillRect(u - 0.5, y, 3.5, 3);
    ctx.fillStyle = css(shade(0x8a6038, light), 0.8);
    ctx.fillRect(u - 0.5, y, 3.5, 0.8);
  }
}

/** A string course: a raised band of contrasting brick or plaster. */
export function band(ctx: Ctx, w: number, y: number, h: number, color: number, light: number): void {
  ctx.fillStyle = css(shade(color, light));
  ctx.fillRect(0, y, w, h);
  ctx.fillStyle = 'rgba(255,240,210,0.18)';
  ctx.fillRect(0, y, w, 0.8);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0, y + h, w, 1);
}

export interface DomeStyle {
  color: number;
  /** Height of the cylindrical drum under the dome. */
  drum?: number;
  drumColor?: number;
  /** Bulb factor: 1 is a plain dome, 1.3 a Persian onion. */
  bulb?: number;
  ribs?: boolean;
  /** Dots of glaze in rows, for tiled domes. */
  pattern?: number;
  finial?: boolean;
}

/** A dome on a drum, centred at `cx` with its base ellipse at `baseY`. */
export function dome(ctx: Ctx, cx: number, baseY: number, r: number, style: DomeStyle): void {
  const drum = style.drum ?? 0;
  if (drum > 0) {
    const dc = style.drumColor ?? style.color;
    const g = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
    g.addColorStop(0, css(shade(dc, 1.08)));
    g.addColorStop(0.45, css(dc));
    g.addColorStop(1, css(shade(dc, 0.55)));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(cx - r, baseY - drum);
    ctx.lineTo(cx - r, baseY);
    ctx.ellipse(cx, baseY, r, r * 0.42, 0, Math.PI, 0, true);
    ctx.lineTo(cx + r, baseY - drum);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(20,10,4,0.55)';
    for (let i = -2; i <= 2; i++) {
      const wx = cx + i * r * 0.36;
      ctx.beginPath();
      ctx.ellipse(wx, baseY - drum * 0.48, r * 0.07, drum * 0.24, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const y0 = baseY - drum;
  const bulb = style.bulb ?? 1;
  const top = y0 - r * (0.95 + bulb * 0.45);
  const shape = (): void => {
    ctx.beginPath();
    ctx.moveTo(cx - r, y0);
    ctx.bezierCurveTo(cx - r * bulb, y0 - r * 0.8, cx - r * 0.3, top + r * 0.3, cx, top);
    ctx.bezierCurveTo(cx + r * 0.3, top + r * 0.3, cx + r * bulb, y0 - r * 0.8, cx + r, y0);
    ctx.ellipse(cx, y0, r, r * 0.42, 0, 0, Math.PI, false);
    ctx.closePath();
  };
  const grad = ctx.createRadialGradient(cx - r * 0.4, y0 - r * 0.9, r * 0.1, cx, y0 - r * 0.4, r * 1.5);
  grad.addColorStop(0, css(shade(style.color, 1.45)));
  grad.addColorStop(0.45, css(style.color));
  grad.addColorStop(1, css(shade(style.color, 0.45)));
  shape();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.save();
  shape();
  ctx.clip();
  if (style.pattern !== undefined) {
    ctx.fillStyle = css(style.pattern, 0.7);
    for (let y = top + 4; y < y0; y += 4) {
      for (let x = cx - r; x < cx + r; x += 4) ctx.fillRect(x + ((y / 4) % 2) * 2, y, 1.2, 1.2);
    }
  }
  if (style.ribs) {
    ctx.strokeStyle = css(shade(style.color, 0.7), 0.6);
    ctx.lineWidth = 0.8;
    for (const t of [-0.72, -0.4, -0.12, 0.18, 0.48, 0.78]) {
      ctx.beginPath();
      ctx.moveTo(cx + t * r, y0 + r * 0.42 * Math.sqrt(1 - t * t));
      ctx.quadraticCurveTo(cx + t * r * bulb * 1.05, y0 - r * 0.9, cx, top);
      ctx.stroke();
    }
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(20,10,4,0.6)';
  ctx.lineWidth = 1;
  shape();
  ctx.stroke();
  if (style.finial) {
    ctx.strokeStyle = '#c9a24a';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx, top);
    ctx.lineTo(cx, top - 8);
    ctx.stroke();
    ctx.fillStyle = '#e8c96a';
    ctx.beginPath();
    ctx.arc(cx, top - 4, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Upright cylinder (minaret shaft, tower, column) with a lit top. */
export function cylinder(ctx: Ctx, cx: number, baseY: number, r: number, h: number, color: number, top = true): void {
  const g = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
  g.addColorStop(0, css(shade(color, 1.05)));
  g.addColorStop(0.35, css(shade(color, 1.12)));
  g.addColorStop(1, css(shade(color, 0.5)));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(cx - r, baseY - h);
  ctx.lineTo(cx - r, baseY);
  ctx.ellipse(cx, baseY, r, r * 0.45, 0, Math.PI, 0, true);
  ctx.lineTo(cx + r, baseY - h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,10,4,0.55)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  if (top) {
    ctx.fillStyle = css(shade(color, 1.2));
    ctx.beginPath();
    ctx.ellipse(cx, baseY - h, r, r * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

/** A curved band around a cylinder, e.g. a glazed ring on a minaret. */
export function cylinderBand(ctx: Ctx, cx: number, y: number, r: number, thickness: number, color: number): void {
  ctx.strokeStyle = css(color);
  ctx.lineWidth = thickness;
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.ellipse(cx, y, r, r * 0.45, 0, 0, Math.PI, false);
  ctx.stroke();
  ctx.lineCap = 'round';
}

/** Wind-catcher (bādgīr) tower: a slim box with tall vent slots. */
export function windcatcher(ctx: Ctx, box: IsoBox, color: number, seed: number, paint: (ctx: Ctx, w: number, h: number, s: Surface) => void): void {
  const slots = (w: number, h: number, light: number) => {
    const n = Math.max(2, Math.floor(w / 5));
    const step = w / n;
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = css(shade(0x1a100a, light + 0.2));
      ctx.fillRect(i * step + step * 0.3, 4, step * 0.42, h * 0.55);
    }
  };
  walls(ctx, box, (c, w, h, light) => paint(c, w, h, { base: color, light, seed }), {
    left: (_c, w, h, l) => slots(w, h, l),
    right: (_c, w, h, l) => slots(w, h, l),
  });
  flatTop(ctx, box, color);
  merlons(ctx, box, color, 2.5, 2.5);
  outlineBox(ctx, box);
}
