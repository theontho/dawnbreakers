import { css, mix, rng, shade, type Ctx } from './canvasKit';
import {
  CAP, CHUNAM, DARK_TEAK, DECK, RING_LEN, TEAK, faceLight, fillQuad, grain, hullAt, inboard, lineAlong, outerBand, polyline, runs,
} from './shipHullKit';
import { LADDER, SHIP, sheer, toScreen, type Pt } from './shipHullPlan';

/**
 * The lower layer of the baghla, sorted under everything aboard: the sea
 * around her (shadow, wake, the curl of foam at the waterline), the rudder,
 * the curved topsides of teak above a white chunam bottom, the deck of
 * fore-and-aft planks inside its covering board, and the far bulwarks seen
 * from inboard. The near bulwark, which people pass behind, is in
 * `shipBulwark.ts`.
 */

const D = SHIP.freeboard;
const DECK_TEAK = 0x8a7458;
const TOPSIDE = 0x5e3a1e;
/** Top of the chunam boot-top, and the strakes of teak between it and the wale. */
const BOOT = -D + 11;
const STRAKES = 7;
const strakeH = (s: number): number => -6 + ((BOOT + 6) * s) / STRAKES;

export function drawHullLayer(ctx: Ctx): void {
  seaAround(ctx);
  rudder(ctx);
  topsides(ctx);
  deck(ctx);
  farBulwark(ctx);
}

const nearRuns = (): number[][] => runs(p => p.near);

/** The hull's shadow on the water, the wake astern, and the swell slapping along her. */
function seaAround(ctx: Ctx): void {
  const water = Array.from({ length: RING_LEN }, (_, i) => hullAt(i, -D));
  ctx.save();
  ctx.filter = 'blur(6px)';
  ctx.fillStyle = 'rgba(4,10,18,0.55)';
  ctx.beginPath();
  water.forEach((p, i) => (i ? ctx.lineTo(p.x + 4, p.y + 7) : ctx.moveTo(p.x + 4, p.y + 7)));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // The wake: pale streaks fanning out astern.
  const rand = rng(31);
  for (let k = 0; k < 14; k++) {
    const side = k % 2 ? 1 : -1;
    const spread = 0.4 + rand() * 2.6;
    const from = toScreen(SHIP.sternWater - 0.3, SHIP.axis + side * spread * 0.4, -D);
    const to = toScreen(SHIP.sternWater - 2.6 - rand() * 2, SHIP.axis + side * spread, -D);
    ctx.strokeStyle = `rgba(200,215,225,${0.12 + rand() * 0.14})`;
    ctx.lineWidth = 0.8 + rand() * 1.4;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.quadraticCurveTo((from.x + to.x) / 2 + (rand() - 0.5) * 10, (from.y + to.y) / 2, to.x, to.y);
    ctx.stroke();
  }
  bowWave(ctx);
}

/** The great rudder hung on the sternpost, its head and tiller above the transom. */
function rudder(ctx: Ctx): void {
  const post = (h: number): Pt => {
    const t = (sheer(SHIP.stern) - h) / (sheer(SHIP.stern) + D + 12);
    return toScreen(SHIP.stern - 0.25 + (SHIP.sternWater - SHIP.stern + 0.2) * t, SHIP.axis, h);
  };
  const blade: Pt[] = [post(4), post(-D - 12), toScreen(SHIP.sternWater - 1.2, SHIP.axis, -D - 10), toScreen(SHIP.stern - 1.15, SHIP.axis, -6)];
  fillQuad(ctx, blade, css(shade(TEAK, 0.7)));
  polyline(ctx, [blade[0]!, blade[3]!, blade[2]!], css(DARK_TEAK, 0.9), 1.2);
  for (let k = 1; k < 5; k++) {
    const a = post(-k * 9);
    ctx.fillStyle = css(0x2a2a2a);
    ctx.fillRect(a.x - 9, a.y - 1, 10, 2);
  }
  // Underwater, the blade fades into the sea.
  const sea = toScreen(SHIP.sternWater - 0.5, SHIP.axis, -D);
  const g = ctx.createLinearGradient(0, sea.y - 2, 0, sea.y + 20);
  g.addColorStop(0, 'rgba(18,34,52,0)');
  g.addColorStop(1, 'rgba(18,34,52,0.85)');
  ctx.fillStyle = g;
  ctx.fillRect(sea.x - 60, sea.y - 2, 80, 26);
  const head = post(sheer(SHIP.stern) + 14);
  polyline(ctx, [post(-2), head], css(DARK_TEAK), 5);
}

/** The near topsides: teak strakes over a wale, chunam below the waterline, foam where the sea meets her. */
function topsides(ctx: Ctx): void {
  for (const run of nearRuns()) {
    // Below the water: the chunam bottom seen through the sea.
    outerBand(ctx, run, () => -D, () => -D - 16, () => CHUNAM);
    // Strakes of oiled teak, each a little different, from the boot-top up to the deck.
    for (let s = 0; s < STRAKES; s++) {
      const top = strakeH(s);
      const bottom = strakeH(s + 1);
      outerBand(ctx, run, () => top, () => bottom, i => shade(TOPSIDE, 0.88 + 0.2 * grain(Math.floor(i / 9) + s * 31, s)));
    }
    // The boot-top: chunam, lime beaten with fat, laid on above the water as the Gulf shipwrights did.
    outerBand(ctx, run, () => BOOT, () => -D, () => CHUNAM);
    polyline(ctx, lineAlong(run, () => BOOT), 'rgba(30,18,8,0.6)', 0.9);
    // Plank seams, caulked dark, with a glint on each lower edge.
    for (let s = 1; s < STRAKES; s++) {
      const h = strakeH(s);
      polyline(ctx, lineAlong(run, () => h), 'rgba(24,14,6,0.55)', 0.8);
      polyline(ctx, lineAlong(run, () => h - 1), 'rgba(255,230,190,0.08)', 0.7);
    }
    // Butt ends of the planks.
    ctx.strokeStyle = 'rgba(24,14,6,0.4)';
    ctx.lineWidth = 0.7;
    for (let k = 0; k < run.length; k += 3) {
      const i = run[k]!;
      const s = Math.floor(grain(i, 7) * STRAKES);
      if (grain(i, 3) > 0.55) continue;
      const a = hullAt(i, strakeH(s));
      const b = hullAt(i, strakeH(s + 1));
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    // The wale: a heavy dark timber along the deck line, and a carved, painted band under it aft.
    outerBand(ctx, run, () => 0, () => -6, () => DARK_TEAK);
    polyline(ctx, lineAlong(run, () => -1), 'rgba(255,225,170,0.3)', 0.9);
    polyline(ctx, lineAlong(run, () => -6.5), 'rgba(10,6,2,0.6)', 1);
    sternPorts(ctx, run);
    // Weed, wet and grime darkening the lower strakes.
    const grime = lineAlong(run, () => -D);
    const upper = lineAlong(run, () => BOOT + 3).reverse();
    ctx.save();
    ctx.beginPath();
    [...grime, ...upper].forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
    ctx.fillStyle = 'rgba(60,70,50,0.25)';
    ctx.fill();
    ctx.restore();
    // The sea over her bottom, then foam along the waterline.
    seaOverBottom(ctx, run);
    foam(ctx, run);
  }
}

/** Lit ports of the great cabin, low in the quarter. */
function sternPorts(ctx: Ctx, run: readonly number[]): void {
  for (const i of run) {
    const p = DECK[i]!;
    if (p.fx > 8.4 || p.fx < 4.6) continue;
    const k = Math.round((p.fx - 4.6) / 0.95);
    if (Math.abs(p.fx - (4.6 + k * 0.95)) > 0.03) continue;
    const c = hullAt(i, -16);
    ctx.fillStyle = css(DARK_TEAK);
    ctx.fillRect(c.x - 5, c.y - 5, 10, 9);
    const glow = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 9);
    glow.addColorStop(0, 'rgba(255,200,120,0.35)');
    glow.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(c.x - 10, c.y - 10, 20, 20);
    ctx.fillStyle = '#e8a85a';
    ctx.fillRect(c.x - 3, c.y - 3.5, 6, 6);
    ctx.fillStyle = css(0x2a1a0a);
    ctx.fillRect(c.x - 0.5, c.y - 3.5, 1, 6);
  }
}

function seaOverBottom(ctx: Ctx, run: readonly number[]): void {
  const water = lineAlong(run, () => -D);
  const deep = lineAlong(run, () => -D - 17).reverse();
  ctx.save();
  ctx.beginPath();
  [...water, ...deep].forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.closePath();
  ctx.clip();
  const top = Math.min(...water.map(p => p.y));
  const g = ctx.createLinearGradient(0, top, 0, top + 70);
  g.addColorStop(0, 'rgba(22,44,62,0.55)');
  g.addColorStop(1, 'rgba(14,28,42,0.95)');
  ctx.fillStyle = g;
  ctx.fillRect(-2000, top - 40, 4000, 200);
  ctx.restore();
}

function foam(ctx: Ctx, run: readonly number[]): void {
  const rand = rng(run.length * 7);
  const wavy = (h: number, amp: number): Pt[] => run.map((i, k) => {
    const p = hullAt(i, h);
    return { x: p.x, y: p.y + Math.sin(k * 0.9 + rand() * 0.6) * amp };
  });
  polyline(ctx, wavy(-D - 1, 1.2), 'rgba(225,235,240,0.7)', 2.6);
  polyline(ctx, wavy(-D - 5, 1.8).map(p => ({ x: p.x - 3, y: p.y + 2 })), 'rgba(210,225,235,0.35)', 1.6);
  polyline(ctx, wavy(-D - 10, 2.4).map(p => ({ x: p.x - 6, y: p.y + 4 })), 'rgba(210,225,235,0.16)', 1.2);
}

/**
 * White water piling under the forefoot and peeling away down the near side.
 * The far side's wave is hidden by the hull: streaks drawn there would only
 * show as pale sticks rising from behind the bow, like a loose rope's end.
 */
function bowWave(ctx: Ctx): void {
  const fore = toScreen(SHIP.stemWater, SHIP.axis, -D);
  const rand = rng(77);
  for (let k = 0; k < 6; k++) {
    const back = 2.5 + rand() * 3.5;
    const out = 1.4 + rand() * 2.2;
    const end = toScreen(SHIP.stemWater - back, SHIP.axis + out + 1.6, -D);
    const mid = toScreen(SHIP.stemWater - back * 0.4, SHIP.axis + 1.4, -D);
    ctx.strokeStyle = `rgba(225,235,240,${0.18 + rand() * 0.25})`;
    ctx.lineWidth = 1 + rand() * 2;
    ctx.beginPath();
    ctx.moveTo(fore.x + 2, fore.y);
    ctx.quadraticCurveTo(mid.x, mid.y + 2, end.x, end.y);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(230,238,242,0.6)';
  ctx.beginPath();
  ctx.ellipse(fore.x + 3, fore.y + 1, 9, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** The deck inside the bulwarks: fore-and-aft planks, a covering board following the curve, a wet sheen. */
function deck(ctx: Ctx): void {
  const inner = DECK.map(p => {
    const q = inboard(p, SHIP.bulwark);
    return toScreen(q.fx, q.fy);
  });
  ctx.save();
  ctx.beginPath();
  inner.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.closePath();
  ctx.fillStyle = css(DECK_TEAK);
  ctx.fill();
  ctx.clip();
  // Planks about 20 cm wide, laid fore and aft, each its own weathered tone, with staggered butts.
  const rand = rng(5);
  const width = 0.15;
  for (let fy = SHIP.axis - SHIP.beam; fy < SHIP.axis + SHIP.beam; fy += width) {
    let fx = SHIP.stern - 1 + rand() * 3;
    let start = SHIP.stern - 1;
    while (start < SHIP.stem + 1) {
      const tone = mix(DECK_TEAK, rand() < 0.5 ? 0x6a5a48 : 0xa08868, rand() * 0.45);
      const a = toScreen(start, fy);
      const b = toScreen(fx, fy);
      const c = toScreen(fx, fy + width);
      const d = toScreen(start, fy + width);
      fillQuad(ctx, [a, b, c, d], css(tone));
      polyline(ctx, [a, d], 'rgba(30,20,10,0.5)', 0.6);
      start = fx;
      fx += 2.5 + rand() * 3.5;
    }
    polyline(ctx, [toScreen(SHIP.stern - 1, fy), toScreen(SHIP.stem + 1, fy)], 'rgba(28,18,8,0.55)', 0.7);
  }
  // Iron fastenings in rows across the beams.
  ctx.fillStyle = 'rgba(30,24,20,0.5)';
  for (let fx = SHIP.stern + 0.6; fx < SHIP.stem; fx += 0.85) {
    for (let fy = SHIP.axis - SHIP.beam + 0.07; fy < SHIP.axis + SHIP.beam; fy += width) {
      const p = toScreen(fx, fy);
      ctx.fillRect(p.x - 0.6, p.y - 0.3, 1.2, 0.7);
    }
  }
  // Spray standing on the boards: a cold sheen to windward.
  const sheen = ctx.createLinearGradient(toScreen(10, 5).x, toScreen(10, 5).y, toScreen(14, 12).x, toScreen(14, 12).y);
  sheen.addColorStop(0, 'rgba(170,190,210,0.16)');
  sheen.addColorStop(0.6, 'rgba(170,190,210,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(-2000, -500, 4000, 2000);
  ctx.restore();
  // The covering board round the edge of the deck, and the dark waterway inside it.
  const board = DECK.map(p => {
    const q = inboard(p, SHIP.bulwark + 0.12);
    return toScreen(q.fx, q.fy);
  });
  polyline(ctx, [...board, board[0]!], css(shade(DECK_TEAK, 0.82)), 4.5);
  polyline(ctx, [...inner, inner[0]!], 'rgba(20,12,6,0.7)', 1.2);
}

/** The far bulwarks seen from inboard: ceiling planks between frames, under a broad cap rail. */
function farBulwark(ctx: Ctx): void {
  const far = runs(p => !p.near);
  const ins = (i: number, h: number): Pt => {
    const q = inboard(DECK[i]!, SHIP.bulwark);
    return toScreen(q.fx, q.fy, h);
  };
  for (const run of far) {
    const segs = run.slice(0, -1).map((i, k) => [i, run[k + 1]!] as const);
    // Farthest first: the transom's inner face, then the port side coming toward the camera.
    segs.sort((a, b) => DECK[a[0]]!.fx + DECK[a[0]]!.fy - (DECK[b[0]]!.fx + DECK[b[0]]!.fy));
    for (const [a, b] of segs) {
      const p = DECK[a]!;
      const light = faceLight(-p.nx, -p.ny);
      const top = (i: number) => sheer(DECK[i]!.fx);
      fillQuad(ctx, [ins(a, 0), ins(b, 0), ins(b, top(b)), ins(a, top(a))], css(shade(0x7e5a38, light)));
    }
    for (const f of [0.33, 0.66]) {
      polyline(ctx, run.map(i => ins(i, sheer(DECK[i]!.fx) * f)), 'rgba(30,18,8,0.45)', 0.7);
    }
    // Frames (top timbers) standing up inside the planking.
    for (let k = 0; k < run.length; k++) {
      const i = run[k]!;
      if (k % 3 !== 0) continue;
      const p = DECK[i]!;
      const a = ins(i, 0);
      const b = ins(i, sheer(p.fx) + 3);
      polyline(ctx, [a, b], css(shade(0x5a3a20, faceLight(-p.nx, -p.ny))), 3.2);
      polyline(ctx, [{ x: a.x - 1.2, y: a.y }, { x: b.x - 1.2, y: b.y }], 'rgba(255,220,170,0.12)', 0.8);
    }
    // A scupper's rust stain here and there.
    for (const i of run) {
      if (grain(i, 11) > 0.08) continue;
      const a = ins(i, 1);
      ctx.fillStyle = 'rgba(70,40,20,0.35)';
      ctx.fillRect(a.x - 2, a.y - 4, 4, 5);
    }
    capRail(ctx, run);
  }
  transomCrest(ctx);
}

/** The cap rail along a run: a broad flat timber over the bulwark. */
export function capRail(ctx: Ctx, run: readonly number[]): void {
  for (let k = 0; k < run.length - 1; k++) {
    const a = DECK[run[k]!]!;
    const b = DECK[run[k + 1]!]!;
    const out = (p: typeof a) => toScreen(p.fx + p.nx * 0.04, p.fy + p.ny * 0.04, sheer(p.fx));
    const inn = (p: typeof a) => {
      const q = inboard(p, SHIP.bulwark + 0.04);
      return toScreen(q.fx, q.fy, sheer(p.fx));
    };
    fillQuad(ctx, [out(a), out(b), inn(b), inn(a)], css(shade(CAP, 1.05)));
  }
  polyline(ctx, run.map(i => {
    const p = DECK[i]!;
    return toScreen(p.fx + p.nx * 0.04, p.fy + p.ny * 0.04, sheer(p.fx));
  }), 'rgba(30,18,8,0.7)', 0.8);
}

/** The carved crest of the transom rising over the poop, seen from inboard behind the deckhouse. */
function transomCrest(ctx: Ctx): void {
  const h = sheer(SHIP.stern);
  const at = (k: number, up: number): Pt => toScreen(SHIP.stern + 0.12, SHIP.axis + k * (SHIP.transom - 0.2), h + up);
  ctx.beginPath();
  const left = at(-1, 0);
  ctx.moveTo(left.x, left.y);
  for (let k = -1; k <= 1.001; k += 0.1) {
    const p = at(k, 6 + 10 * Math.cos((k * Math.PI) / 2) ** 2);
    ctx.lineTo(p.x, p.y);
  }
  const right = at(1, 0);
  ctx.lineTo(right.x, right.y);
  ctx.closePath();
  ctx.fillStyle = css(shade(0x7e5a38, 0.85));
  ctx.fill();
  ctx.strokeStyle = css(DARK_TEAK);
  ctx.lineWidth = 1;
  ctx.stroke();
  // Pierced roundels along the crest.
  for (let k = -0.6; k <= 0.61; k += 0.3) {
    const p = at(k, 6);
    ctx.fillStyle = css(0x1a0e06);
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 2.2, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** A rope ladder hanging from the gangway down to the boat. */
export function drawLadder(ctx: Ctx): void {
  const { tops, drop, drift } = LADDER;
  const foot = (p: Pt): Pt => ({ x: p.x - drift, y: p.y + drop });
  for (const p of tops) polyline(ctx, [p, { x: p.x - drift / 2, y: p.y + drop / 2 }, foot(p)], css(0xb89a68), 1.4);
  for (let k = 1; k <= 6; k++) {
    const t = k / 7;
    const a = { x: tops[0].x - drift * t, y: tops[0].y + drop * t };
    const b = { x: tops[1].x - drift * t, y: tops[1].y + drop * t };
    polyline(ctx, [a, b], css(0x8a6038), 2.2);
  }
}
