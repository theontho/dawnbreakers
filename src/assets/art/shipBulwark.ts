import { css, shade, type Ctx } from './canvasKit';
import { drawHullLayer, capRail } from './shipHull';
import { CAP, CHUNAM, DARK_TEAK, DECK, TEAK, grain, hullAt, lineAlong, outerBand, polyline, runs } from './shipHullKit';
import { SHIP, SHIP_SPRITES, STEM_HEAD, inGangway, sheer, stemAt, toScreen, type Pt, type ShipSprite } from './shipHullPlan';

/**
 * The near bulwark of the baghla, the side people on deck stand behind:
 * planked outside under its cap rail, rising aft to the carved quarter
 * gallery of the poop and forward to the long raked stem. It is painted
 * whole, once, then cut into the depth-sorted slices of `SHIP_SPRITES`.
 */

const near = (): number[][] => runs((p, i) => p.near && !inGangway(DECK[i]!));

export function drawNearLayer(ctx: Ctx): void {
  for (const run of near()) {
    const top = (i: number) => sheer(DECK[i]!.fx);
    outerBand(ctx, run, top, () => 0, i => shade(TEAK, 1.12 + 0.1 * grain(Math.floor(i / 8), 4)));
    // Strakes of the bulwark, and a painted rubbing band below the cap.
    for (const f of [0.36, 0.68]) polyline(ctx, lineAlong(run, i => top(i) * f), 'rgba(24,14,6,0.5)', 0.8);
    outerBand(ctx, run, i => top(i) - 2, i => top(i) - 6, () => 0x2a3a40);
    polyline(ctx, lineAlong(run, i => top(i) - 4), 'rgba(200,170,90,0.55)', 0.8);
    quarterGallery(ctx, run);
    // Wash ports along the waist to clear green water off the deck.
    for (const i of run) {
      const p = DECK[i]!;
      if (p.fx < 12 || p.fx > 24 || Math.abs(((p.fx - 12) % 2.4) - 1.2) > 0.05) continue;
      const a = hullAt(i, 1.5);
      ctx.fillStyle = css(0x140c06);
      ctx.fillRect(a.x - 4, a.y - 4, 8, 3.5);
    }
    capRail(ctx, run);
    gangwayPosts(ctx, run);
  }
  stemPost(ctx);
}

/** The carved quarter gallery aft: arched lights with turned colonnettes under a fretted rail. */
function quarterGallery(ctx: Ctx, run: readonly number[]): void {
  const lights = run.filter(i => {
    const fx = DECK[i]!.fx;
    return fx > 4.3 && fx < 8.6;
  });
  if (lights.length < 2) return;
  const top = (i: number) => sheer(DECK[i]!.fx);
  // A panel of darker carved teak to frame them.
  outerBand(ctx, lights, i => top(i) - 7, () => 6, () => shade(DARK_TEAK, 1.3));
  polyline(ctx, lineAlong(lights, i => top(i) - 7), 'rgba(210,170,90,0.6)', 1);
  polyline(ctx, lineAlong(lights, () => 6), 'rgba(210,170,90,0.6)', 1);
  const step = Math.max(1, Math.floor(lights.length / 5));
  for (let k = step / 2; k < lights.length - 1; k += step) {
    const i = lights[Math.floor(k)]!;
    const base = hullAt(i, 10);
    const head = hullAt(i, top(i) - 11);
    const w = 4.2;
    const glow = ctx.createRadialGradient(base.x, (base.y + head.y) / 2, 1, base.x, (base.y + head.y) / 2, 14);
    glow.addColorStop(0, 'rgba(255,190,110,0.3)');
    glow.addColorStop(1, 'rgba(255,190,110,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(base.x - 14, head.y - 10, 28, base.y - head.y + 20);
    ctx.beginPath();
    ctx.moveTo(base.x - w, base.y);
    ctx.lineTo(base.x - w, head.y + 4);
    ctx.quadraticCurveTo(base.x - w, head.y - 1, base.x, head.y - 3);
    ctx.quadraticCurveTo(base.x + w, head.y - 1, base.x + w, head.y + 4);
    ctx.lineTo(base.x + w, base.y);
    ctx.closePath();
    ctx.fillStyle = '#d9934a';
    ctx.fill();
    ctx.strokeStyle = css(0xc9a55c, 0.9);
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.fillStyle = css(0x2a1a0a, 0.8);
    ctx.fillRect(base.x - 0.5, head.y, 1, base.y - head.y);
  }
  // Little carved bosses between the lights.
  for (let k = 0; k < lights.length; k += step) {
    const p = hullAt(lights[k]!, top(lights[k]!) - 9);
    ctx.fillStyle = css(0xc9a55c, 0.75);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Stout posts either side of the gangway, a rope man-rope slung between. */
function gangwayPosts(ctx: Ctx, run: readonly number[]): void {
  for (const end of [run[0]!, run[run.length - 1]!]) {
    const p = DECK[end]!;
    if (Math.abs(p.fx - SHIP.gangway.fx) > SHIP.gangway.half + 0.2 || p.fy < SHIP.axis) continue;
    const a = hullAt(end, 0);
    const b = hullAt(end, sheer(p.fx) + 9);
    polyline(ctx, [a, b], css(shade(CAP, 0.8)), 4.5);
    polyline(ctx, [{ x: a.x - 1.2, y: a.y }, { x: b.x - 1.2, y: b.y }], 'rgba(255,230,190,0.3)', 1);
    ctx.fillStyle = css(DARK_TEAK);
    ctx.fillRect(b.x - 3, b.y - 2, 6, 3);
  }
}

/**
 * The long stem: from the forefoot under the water it sweeps up and
 * forward past the deck to a squared head well above the rail, lashed with
 * a fender of old rope where the anchor cable rubs.
 */
function stemPost(ctx: Ctx): void {
  const pts: Pt[] = [];
  for (let k = 0; k <= 30; k++) {
    const h = -SHIP.freeboard - 4 + (k / 30) * (STEM_HEAD.h + SHIP.freeboard + 4);
    pts.push(toScreen(stemAt(h) + 0.06, SHIP.axis, h));
  }
  polyline(ctx, pts, css(DARK_TEAK), 7);
  polyline(ctx, pts.map(p => ({ x: p.x - 1.6, y: p.y })), css(shade(TEAK, 1.2)), 2.4);
  // The cutwater sheathed in chunam where it meets the sea.
  polyline(ctx, pts.slice(0, 4), css(CHUNAM), 7);
  const head = pts[pts.length - 1]!;
  ctx.fillStyle = css(DARK_TEAK);
  ctx.fillRect(head.x - 5, head.y - 4, 10, 6);
  ctx.fillStyle = css(shade(CAP, 1.1));
  ctx.fillRect(head.x - 5, head.y - 6, 10, 2.5);
  // The rope fender, a few turns round the stem where the cable rubs.
  const at = pts[19]!;
  ctx.fillStyle = css(0xa88a5a);
  for (let k = 0; k < 4; k++) ctx.fillRect(at.x - 4.5 + k * 0.6, at.y - 6 + k * 3.2, 8, 2.2);
}

// Slicing --------------------------------------------------------------------

interface Layer {
  canvas: HTMLCanvasElement;
  left: number;
  top: number;
}

const layers = new Map<string, Layer>();

/** Paints one whole layer (the hull, or the near bulwark) once, over the area of every ship sprite. */
function layer(name: 'hull' | 'near'): Layer {
  const cached = layers.get(name);
  if (cached) return cached;
  const left = Math.min(...SHIP_SPRITES.map(s => s.left));
  const top = Math.min(...SHIP_SPRITES.map(s => s.top));
  const right = Math.max(...SHIP_SPRITES.map(s => s.left + s.width));
  const bottom = Math.max(...SHIP_SPRITES.map(s => s.top + s.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(right - left);
  canvas.height = Math.ceil(bottom - top);
  const ctx = canvas.getContext('2d')!;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.translate(-left, -top);
  if (name === 'hull') drawHullLayer(ctx);
  else drawNearLayer(ctx);
  const made = { canvas, left, top };
  layers.set(name, made);
  return made;
}

/** Paints one ship sprite: its columns of the hull layer or of the near bulwark. */
export function paintShipSprite(ctx: Ctx, sprite: ShipSprite): void {
  const src = layer(sprite.texture.startsWith('ch3-ship-hull') ? 'hull' : 'near');
  const x0 = sprite.clipLeft - src.left;
  const y0 = sprite.top - src.top;
  const w = sprite.clipRight - sprite.clipLeft;
  ctx.drawImage(src.canvas, x0, y0, w, sprite.height, sprite.clipLeft - sprite.left, 0, w, sprite.height);
}
