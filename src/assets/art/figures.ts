import { css, type Ctx } from './canvasKit';
import { FIGURE_H, FIGURE_W, INK, cloth, dim, fillShape, lit, mirrored, stroke, type FigureSpec } from './figureKit';
import { paintHead } from './figureHeads';

/**
 * Standing figures in 1840s Persian dress, painted on the canvas: a long
 * qabā robe, ʿabā cloaks, sashes, vests and the soldier's short jacket.
 * Light falls from the upper left like the buildings, so every garment is
 * brighter on its left edge; the whole figure gets one crisp ink outline
 * and a soft contact shadow at the feet (the texture origin).
 */

/** Paints a complete figure: shadow, garments, head and hat, then the outline. */
export function paintFigure(ctx: Ctx, spec: FigureSpec): void {
  if (spec.shadow) groundShadow(ctx);
  const layer = offscreen();
  const f = layer.getContext('2d')!;
  f.lineJoin = 'round';
  f.lineCap = 'round';
  paintGarments(f, spec);
  paintHead(f, spec);

  // Silhouette outline: the figure's alpha, inked and nudged one pixel each way.
  const ink = offscreen();
  const i = ink.getContext('2d')!;
  i.drawImage(layer, 0, 0);
  i.globalCompositeOperation = 'source-in';
  i.fillStyle = css(INK);
  i.fillRect(0, 0, ink.width, ink.height);
  ctx.save();
  ctx.globalAlpha = 0.9;
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) ctx.drawImage(ink, dx, dy);
  ctx.restore();
  ctx.drawImage(layer, 0, 0);
}

function offscreen(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = FIGURE_W;
  canvas.height = FIGURE_H;
  return canvas;
}

function groundShadow(ctx: Ctx): void {
  ctx.save();
  ctx.filter = 'blur(1.2px)';
  ctx.fillStyle = 'rgba(12,7,3,0.34)';
  ctx.beginPath();
  ctx.ellipse(15.8, 41.4, 9.4, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Garments -------------------------------------------------------------------

function paintGarments(ctx: Ctx, spec: FigureSpec): void {
  const veiled = spec.hat === 'veil';
  const arms = !veiled;
  switch (spec.clothing) {
    case 'plain':
      shoes(ctx);
      robe(ctx, spec.body);
      crossover(ctx, spec.body);
      band(ctx, dim(spec.body, 0.45), 26.2, 1.6);
      if (arms) sleeves(ctx, spec.body, spec.skin);
      break;
    case 'robe':
      shoes(ctx);
      robe(ctx, spec.body);
      fillShape(ctx, cloth(ctx, spec.secondary), () => {
        ctx.moveTo(12.8, 17.1);
        ctx.lineTo(17.2, 17.1);
        ctx.lineTo(15, 21.8);
      });
      crossover(ctx, spec.body);
      waistSash(ctx, spec.secondary, spec.accent);
      if (arms) sleeves(ctx, spec.body, spec.skin);
      break;
    case 'cloak':
      shoes(ctx);
      robe(ctx, spec.body, 7.4);
      band(ctx, spec.secondary, 26.2, 1.6);
      aba(ctx, spec, arms);
      break;
    case 'vest':
      legs(ctx, dim(spec.body, 0.5), dim(spec.body, 0.75), 33);
      robe(ctx, spec.body, 7.2, 34);
      if (arms) sleeves(ctx, lit(spec.body, 0.06), spec.skin);
      vest(ctx, spec.secondary, spec.accent);
      break;
    case 'uniform':
      uniform(ctx, spec, arms);
      break;
    case 'sash':
      shoes(ctx);
      robe(ctx, spec.body);
      band(ctx, dim(spec.secondary, 0.15), 26.2, 1.8);
      if (arms) sleeves(ctx, spec.body, spec.skin);
      baldric(ctx, spec.secondary, spec.accent);
      break;
    case 'apron':
      shoes(ctx);
      robe(ctx, spec.body, 7.8);
      apron(ctx, spec.secondary, spec.accent);
      if (arms) sleeves(ctx, spec.body, spec.skin, 25);
      break;
    case 'wrap':
      shoes(ctx);
      robe(ctx, spec.body, 8.6);
      if (arms) sleeves(ctx, spec.body, spec.skin);
      shawl(ctx, spec.secondary, spec.accent);
      break;
  }
}

function shoes(ctx: Ctx): void {
  ctx.fillStyle = css(0x2a1c12);
  for (const x of [12.4, 17.8]) {
    ctx.beginPath();
    ctx.ellipse(x, 41.3, 2.2, 1.1, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Trousered legs from `top` down, ending in dark shoes or boots. */
function legs(ctx: Ctx, cloth1: number, boot: number, top: number, bootTop = 39.4): void {
  for (const [x0, x1] of [[10.6, 14.6], [15.4, 19.4]] as const) {
    ctx.fillStyle = cloth(ctx, cloth1);
    ctx.fillRect(x0, top, x1 - x0, bootTop - top + 0.5);
    ctx.fillStyle = cloth(ctx, boot);
    ctx.beginPath();
    ctx.moveTo(x0 - 0.2, bootTop);
    ctx.lineTo(x1 + 0.2, bootTop);
    ctx.lineTo(x1 + 0.6, 42);
    ctx.lineTo(x0 - 0.6, 42);
    ctx.fill();
  }
  stroke(ctx, dim(cloth1, 0.6), 0.7, 0.8, [[15, top], [15, bootTop]]);
}

/** The qabā: shoulders, a slight waist, a flared hem. `half` is half the hem width. */
function robe(ctx: Ctx, color: number, half = 8.2, hem = 40.2): void {
  fillShape(ctx, cloth(ctx, color), () => {
    ctx.moveTo(12.4, 16.9);
    ctx.bezierCurveTo(10, 17.1, 8, 17.8, 7.7, 20.6);
    ctx.lineTo(8.7, 27);
    ctx.lineTo(15 - half, hem);
    ctx.quadraticCurveTo(15, hem + 1.6, 15 + half, hem);
    ctx.lineTo(21.3, 27);
    ctx.lineTo(22.3, 20.6);
    ctx.bezierCurveTo(22, 17.8, 20, 17.1, 17.6, 16.9);
  });
  if (hem < 38) return;
  // Long folds falling from the waist; a lit crease on the sunny side.
  stroke(ctx, dim(color, 0.5), 0.55, 0.8, [[12.2, 29], [11.4, hem - 0.4]]);
  stroke(ctx, dim(color, 0.5), 0.55, 0.8, [[17.8, 29], [18.8, hem - 0.4]]);
  stroke(ctx, lit(color, 0.35), 0.45, 0.7, [[10.4, 30], [9.4, hem - 1]]);
}

/** The qabā closes across the chest to the right. */
function crossover(ctx: Ctx, color: number): void {
  stroke(ctx, dim(color, 0.55), 0.7, 0.8, [[13.2, 17.4], [16.2, 22.5], [18.4, 26.4]]);
}

function band(ctx: Ctx, color: number, y: number, h: number): void {
  fillShape(ctx, cloth(ctx, color), () => {
    ctx.moveTo(8.6, y);
    ctx.quadraticCurveTo(15, y + 0.8, 21.4, y);
    ctx.lineTo(21.4, y + h);
    ctx.quadraticCurveTo(15, y + h + 0.8, 8.6, y + h);
  });
}

/** A cloth shāl wound at the waist, its tucked end showing at the front. */
function waistSash(ctx: Ctx, color: number, accent: number): void {
  band(ctx, color, 25.6, 2.6);
  stroke(ctx, accent, 0.8, 0.6, [[8.8, 27], [15, 27.8], [21.2, 27]]);
  stroke(ctx, dim(color, 0.5), 0.7, 0.7, [[16.6, 25.9], [17.4, 28.4]]);
}

/** Hanging arms in sleeves; `bare` is the y where a rolled sleeve ends and the forearm shows. */
function sleeves(ctx: Ctx, color: number, skin: number, bare?: number): void {
  mirrored(flip => {
    const arm = () => {
      ctx.moveTo(8.4, 18.4);
      ctx.bezierCurveTo(6.6, 19.2, 6.1, 21, 6.0, 23);
      ctx.lineTo(5.8, 29.8);
      ctx.lineTo(8.8, 30.2);
      ctx.lineTo(9.6, 22.4);
    };
    fillShape(ctx, cloth(ctx, color), arm, flip);
    if (bare !== undefined) {
      fillShape(ctx, cloth(ctx, skin), () => {
        ctx.moveTo(6.0, bare);
        ctx.lineTo(9.3, bare);
        ctx.lineTo(8.8, 30.2);
        ctx.lineTo(5.8, 29.8);
      }, flip);
      stroke(ctx, dim(color, 0.3), 1, 1.2, [[6, bare], [9.3, bare]], flip);
    } else {
      stroke(ctx, dim(color, 0.4), 0.8, 0.9, [[5.9, 29.6], [8.8, 30]], flip);
    }
    stroke(ctx, dim(color, 0.6), 0.7, 0.8, [[9.6, 22.4], [8.8, 30.1]], flip);
    hand(ctx, skin, 7.3, 31, flip);
  });
}

function hand(ctx: Ctx, skin: number, x: number, y: number, flip = false): void {
  fillShape(ctx, cloth(ctx, skin), () => ctx.ellipse(x, y, 1.5, 1.6, 0, 0, Math.PI * 2), flip);
}

/** The ʿabā: a wide sleeveless cloak hanging open from the shoulders over the robe. */
function aba(ctx: Ctx, spec: FigureSpec, hands: boolean): void {
  const color = spec.secondary;
  mirrored(flip => {
    fillShape(ctx, cloth(ctx, color), () => {
      ctx.moveTo(13.4, 16.9);
      ctx.bezierCurveTo(10.4, 16.9, 7, 17.5, 6.1, 20.6);
      ctx.lineTo(4.4, 40.3);
      ctx.quadraticCurveTo(8.2, 41.6, 12.3, 41);
      ctx.lineTo(12.9, 30);
      ctx.lineTo(13.7, 19.6);
    }, flip);
    stroke(ctx, dim(color, 0.5), 0.6, 0.8, [[8.4, 24], [7.2, 40.2]], flip);
    stroke(ctx, dim(color, 0.5), 0.5, 0.8, [[10.6, 27], [10.2, 40.8]], flip);
    stroke(ctx, spec.accent, 0.85, 0.7, [[13.6, 18.4], [12.9, 30], [12.3, 40.8]], flip);
    if (hands) hand(ctx, spec.skin, 13.7, 29.4, flip);
  });
  stroke(ctx, lit(color, 0.4), 0.55, 0.8, [[7.2, 20], [9.4, 18]]);
}

/** A short sleeveless vest open over the tunic, with a belt. */
function vest(ctx: Ctx, color: number, accent: number): void {
  mirrored(flip => {
    fillShape(ctx, cloth(ctx, color), () => {
      ctx.moveTo(13.3, 17.1);
      ctx.bezierCurveTo(11.2, 17.2, 9.6, 17.6, 9.5, 19.4);
      ctx.lineTo(9.2, 25);
      ctx.lineTo(8.6, 30.6);
      ctx.lineTo(13.4, 31.2);
      ctx.lineTo(13.8, 20.4);
    }, flip);
    stroke(ctx, accent, 0.9, 0.8, [[13.4, 17.3], [13.8, 20.4], [13.4, 31.1], [8.7, 30.5]], flip);
  });
  band(ctx, dim(color, 0.55), 27.4, 1.4);
}

/** Qajar sarbāz: a short dark jacket, crossbelt, trousers and boots. */
function uniform(ctx: Ctx, spec: FigureSpec, arms: boolean): void {
  const jacket = spec.secondary;
  legs(ctx, spec.body, 0x1e1712, 31, 36.5);
  robe(ctx, jacket, 6.8, 32.4);
  stroke(ctx, dim(jacket, 0.6), 0.8, 0.8, [[15, 17.6], [15, 32.6]]);
  for (const y of [20, 22.6, 30.4]) {
    ctx.fillStyle = css(spec.accent);
    ctx.fillRect(15.6, y, 1, 1);
  }
  band(ctx, spec.accent, 25.8, 1.6);
  stroke(ctx, 0xe8e0c8, 0.9, 1.3, [[10, 18.4], [20.2, 30.6]]);
  if (arms) {
    sleeves(ctx, jacket, spec.skin);
    mirrored(flip => {
      stroke(ctx, spec.accent, 0.9, 1, [[6, 28.6], [9.1, 29]], flip);
      fillShape(ctx, css(spec.accent), () => ctx.ellipse(8.6, 18.6, 1.8, 0.9, -0.4, 0, Math.PI * 2), flip);
    });
  }
}

/** A cloth band slung from the left shoulder to the right hip. */
function baldric(ctx: Ctx, color: number, accent: number): void {
  fillShape(ctx, cloth(ctx, color), () => {
    ctx.moveTo(9.4, 18.2);
    ctx.lineTo(12, 17.4);
    ctx.lineTo(21.6, 28.2);
    ctx.lineTo(21.2, 31.2);
  });
  stroke(ctx, accent, 0.9, 0.6, [[11.6, 17.6], [21.4, 28.6]]);
  stroke(ctx, dim(color, 0.5), 0.6, 0.6, [[9.6, 18.6], [21.1, 30.9]]);
}

function apron(ctx: Ctx, color: number, accent: number): void {
  fillShape(ctx, cloth(ctx, color), () => {
    ctx.moveTo(10.2, 25.2);
    ctx.lineTo(19.8, 25.2);
    ctx.lineTo(20.6, 37.4);
    ctx.quadraticCurveTo(20.6, 38.8, 19.2, 38.8);
    ctx.lineTo(10.8, 38.8);
    ctx.quadraticCurveTo(9.4, 38.8, 9.4, 37.4);
  });
  stroke(ctx, accent, 0.95, 1, [[8.7, 25.4], [21.3, 25.4]]);
  stroke(ctx, dim(color, 0.4), 0.5, 0.7, [[13, 27], [12.6, 38.4]]);
  stroke(ctx, dim(color, 0.4), 0.5, 0.7, [[17.2, 27], [17.6, 38.4]]);
  stroke(ctx, dim(color, 0.5), 0.7, 0.8, [[10.8, 32.2], [12.6, 32.2]]);
}

/** A shawl round the shoulders, crossed over the chest and tucked at the left hip. */
function shawl(ctx: Ctx, color: number, accent: number): void {
  fillShape(ctx, cloth(ctx, color), () => {
    ctx.moveTo(12, 16.8);
    ctx.bezierCurveTo(8.8, 17, 6.4, 18, 6.1, 21.6);
    ctx.quadraticCurveTo(8, 24.4, 10.4, 24);
    ctx.lineTo(9.8, 33.6);
    ctx.lineTo(12, 32.8);
    ctx.lineTo(13.2, 28);
    ctx.lineTo(23.2, 22.4);
    ctx.bezierCurveTo(23.6, 18.4, 21, 17, 18, 16.8);
    ctx.quadraticCurveTo(15, 18.4, 12, 16.8);
  });
  stroke(ctx, dim(color, 0.5), 0.6, 0.8, [[11.4, 22], [22.4, 21.6]]);
  stroke(ctx, dim(color, 0.5), 0.5, 0.7, [[11.2, 25.4], [11, 32.8]]);
  stroke(ctx, lit(color, 0.4), 0.55, 0.8, [[7, 20.4], [11, 18]]);
  for (const [x, y] of [[10, 34], [11.2, 33.6], [6.6, 22.4], [8, 23.4]] as const) {
    ctx.fillStyle = css(accent, 0.9);
    ctx.fillRect(x - 0.4, y - 0.2, 0.8, 0.9);
  }
}
