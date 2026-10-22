import { css, rng, type Ctx } from './canvasKit';
import { FIGURE_H, FIGURE_W, cloth, dim, fillShape, lit, mirrored, stroke, type FigureSpec } from './figureKit';

/**
 * Heads and headwear: a softly lit face with a hint of eyes, beards for the
 * men, and the turbans, felt caps, tall lambskin kulāhs, scarves, hoods and
 * chadors of the period.
 */

const HEAD_X = 15;
const HEAD_Y = 11.6;
const EYE = 0x1a0f08;

export function paintHead(ctx: Ctx, spec: FigureSpec): void {
  neck(ctx, spec.skin);
  face(ctx, spec.skin);
  if (spec.beard === 'full') beard(ctx, spec.hair);
  if (spec.beard === 'moustache') moustache(ctx, spec.hair);
  switch (spec.hat) {
    case 'none':
      hair(ctx, spec.hair);
      break;
    case 'turban':
      turban(ctx, spec.hatColor, spec.hatAccent);
      break;
    case 'cap':
      cap(ctx, spec.hatColor);
      break;
    case 'tallHat':
      kulah(ctx, spec.hatColor);
      break;
    case 'headscarf':
      headscarf(ctx, spec.hatColor);
      break;
    case 'hood':
      hood(ctx, spec.hatColor);
      break;
    case 'veil':
      chador(ctx, spec);
      break;
  }
}

function neck(ctx: Ctx, skin: number): void {
  ctx.fillStyle = css(dim(skin, 0.28));
  ctx.fillRect(13.4, 14.6, 3.2, 3);
}

function face(ctx: Ctx, skin: number): void {
  const g = ctx.createRadialGradient(13.4, 10, 0.5, HEAD_X, HEAD_Y, 6);
  g.addColorStop(0, css(lit(skin, 0.18)));
  g.addColorStop(0.55, css(skin));
  g.addColorStop(1, css(dim(skin, 0.3)));
  fillShape(ctx, g, () => ctx.ellipse(HEAD_X, HEAD_Y, 4.5, 4.9, 0, 0, Math.PI * 2));
  // Eyes on the lower half of the head, a shadowed nose between them.
  ctx.fillStyle = css(EYE, 0.85);
  ctx.fillRect(13, 11.4, 1, 1.2);
  ctx.fillRect(16, 11.4, 1, 1.2);
  ctx.fillStyle = css(dim(skin, 0.45), 0.6);
  ctx.fillRect(15.1, 12.4, 0.8, 1.2);
}

function beard(ctx: Ctx, color: number): void {
  fillShape(ctx, cloth(ctx, color), () => {
    ctx.moveTo(10.6, 12.4);
    ctx.quadraticCurveTo(10.8, 16.8, 15, 18.2);
    ctx.quadraticCurveTo(19.2, 16.8, 19.4, 12.4);
    ctx.quadraticCurveTo(18.6, 14.2, 17.4, 14.1);
    ctx.quadraticCurveTo(15, 13.1, 12.6, 14.1);
    ctx.quadraticCurveTo(11.4, 14.2, 10.6, 12.4);
  });
  stroke(ctx, dim(color, 0.6), 0.8, 0.7, [[14.1, 15.3], [15.9, 15.3]]);
  stroke(ctx, lit(color, 0.3), 0.5, 0.6, [[11.4, 14.2], [12.6, 16.4]]);
}

function moustache(ctx: Ctx, color: number): void {
  fillShape(ctx, css(color), () => {
    ctx.moveTo(12.4, 14.6);
    ctx.quadraticCurveTo(15, 12.9, 17.6, 14.6);
    ctx.quadraticCurveTo(15, 13.9, 12.4, 14.6);
  });
}

function hair(ctx: Ctx, color: number): void {
  fillShape(ctx, cloth(ctx, color), () => {
    ctx.moveTo(10.4, 12.6);
    ctx.bezierCurveTo(10, 7.6, 12.4, 6.3, 15, 6.3);
    ctx.bezierCurveTo(17.6, 6.3, 20, 7.6, 19.6, 12.6);
    ctx.quadraticCurveTo(19, 9.4, 17, 9.2);
    ctx.quadraticCurveTo(15, 8.2, 13, 9.2);
    ctx.quadraticCurveTo(11, 9.4, 10.4, 12.6);
  });
}

/** A cloth turban wound round a felt kulāh whose crown shows on top. */
function turban(ctx: Ctx, color: number, crown: number): void {
  fillShape(ctx, cloth(ctx, crown), () => ctx.ellipse(HEAD_X, 4.8, 3.1, 2.4, 0, 0, Math.PI * 2));
  fillShape(ctx, cloth(ctx, color), () => ctx.ellipse(HEAD_X, 7.4, 6.2, 2.9, 0, 0, Math.PI * 2));
  // Wound folds slanting across the roll, a lit edge along its crown.
  stroke(ctx, dim(color, 0.45), 0.65, 0.7, [[9.6, 8.6], [12.4, 6.4], [16, 5.3], [20.2, 6.4]]);
  stroke(ctx, dim(color, 0.45), 0.6, 0.7, [[10.6, 9.8], [14, 7.7], [18, 7.2], [21, 8.2]]);
  stroke(ctx, lit(color, 0.55), 0.7, 0.7, [[9.6, 6.8], [11.2, 5.2], [13, 4.8]]);
}

/** A rounded felt cap. */
function cap(ctx: Ctx, color: number): void {
  fillShape(ctx, cloth(ctx, color), () => {
    ctx.moveTo(10.1, 9.8);
    ctx.bezierCurveTo(10, 4.8, 12.6, 3.6, 15, 3.6);
    ctx.bezierCurveTo(17.4, 3.6, 20, 4.8, 19.9, 9.8);
    ctx.quadraticCurveTo(15, 8.6, 10.1, 9.8);
  });
  stroke(ctx, dim(color, 0.4), 0.9, 1.3, [[10.3, 9.1], [15, 8.1], [19.7, 9.1]]);
  stroke(ctx, lit(color, 0.45), 0.6, 0.7, [[11.2, 6.8], [13.2, 4.6]]);
}

/** The tall black lambskin kulāh of Qajar men and soldiers. */
function kulah(ctx: Ctx, color: number): void {
  fillShape(ctx, cloth(ctx, color), () => {
    ctx.moveTo(10.1, 9.9);
    ctx.lineTo(10.7, 2.2);
    ctx.quadraticCurveTo(15, 1.1, 19.3, 2);
    ctx.lineTo(19.9, 9.9);
    ctx.quadraticCurveTo(15, 8.9, 10.1, 9.9);
  });
  const random = rng(color);
  for (let i = 0; i < 14; i++) {
    const x = 11.2 + random() * 7.6;
    const y = 2.8 + random() * 6;
    ctx.fillStyle = css(lit(color, x < 15 ? 0.28 : 0.14), 0.7);
    ctx.fillRect(x, y, 0.8, 0.8);
  }
  stroke(ctx, lit(color, 0.35), 0.8, 0.7, [[10.9, 2.3], [15, 1.5], [18.6, 2]]);
}

/**
 * Cloth over the head and shoulders with an oval opening for the face:
 * the shape is painted under a clip that excludes the face.
 */
function aroundFace(ctx: Ctx, rx: number, ry: number, cy: number, paint: () => void): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, FIGURE_W, FIGURE_H);
  ctx.ellipse(HEAD_X, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.clip('evenodd');
  paint();
  ctx.restore();
}

function headscarf(ctx: Ctx, color: number): void {
  aroundFace(ctx, 3.7, 4.1, 12, () => {
    fillShape(ctx, cloth(ctx, color), () => {
      ctx.moveTo(8.8, 20.6);
      ctx.lineTo(9.3, 11);
      ctx.bezierCurveTo(9.3, 6, 12, 4.8, 15, 4.8);
      ctx.bezierCurveTo(18, 4.8, 20.7, 6, 20.7, 11);
      ctx.lineTo(21.2, 20.6);
      ctx.quadraticCurveTo(15, 22.2, 8.8, 20.6);
    });
  });
  stroke(ctx, dim(color, 0.45), 0.6, 0.7, [[10.6, 15], [10, 20.4]]);
  stroke(ctx, dim(color, 0.45), 0.6, 0.7, [[19.4, 15], [20, 20.4]]);
  stroke(ctx, lit(color, 0.45), 0.6, 0.7, [[10.2, 9.4], [12, 6.2]]);
}

/** A peaked hood that shades the face beneath it. */
function hood(ctx: Ctx, color: number): void {
  const g = ctx.createLinearGradient(0, 7, 0, 12);
  g.addColorStop(0, 'rgba(20,12,6,0.55)');
  g.addColorStop(1, 'rgba(20,12,6,0)');
  fillShape(ctx, g, () => ctx.ellipse(HEAD_X, 12.2, 3.8, 4.1, 0, 0, Math.PI * 2));
  aroundFace(ctx, 3.6, 3.9, 12.2, () => {
    fillShape(ctx, cloth(ctx, color), () => {
      ctx.moveTo(7.6, 21.4);
      ctx.lineTo(8.6, 11.6);
      ctx.bezierCurveTo(8.8, 6.4, 12, 4.2, 15, 3.6);
      ctx.bezierCurveTo(18, 4.2, 21.2, 6.4, 21.4, 11.6);
      ctx.lineTo(22.4, 21.4);
      ctx.quadraticCurveTo(15, 23, 7.6, 21.4);
    });
  });
  ctx.lineWidth = 1;
  ctx.strokeStyle = css(dim(color, 0.6), 0.8);
  ctx.beginPath();
  ctx.ellipse(HEAD_X, 12.2, 3.8, 4.1, 0, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();
  stroke(ctx, lit(color, 0.4), 0.6, 0.7, [[9.4, 10], [11.4, 5.8], [14, 4.2]]);
}

/**
 * The chador: one long cloth from the crown to the ground, held closed
 * under the chin so only a narrow line of the dress shows below.
 */
function chador(ctx: Ctx, spec: FigureSpec): void {
  const color = spec.hatColor;
  aroundFace(ctx, 3.6, 4.0, 12, () => {
    mirrored(flip => {
      fillShape(ctx, cloth(ctx, color), () => {
        ctx.moveTo(15.2, 4.2);
        ctx.bezierCurveTo(11.4, 4.2, 9.2, 6.4, 9, 11);
        ctx.bezierCurveTo(8.8, 15.6, 6.8, 17.6, 6.2, 22);
        ctx.lineTo(4.4, 40.4);
        ctx.quadraticCurveTo(9, 41.9, 13.2, 41.2);
        ctx.lineTo(14.2, 25);
        ctx.lineTo(15.2, 18);
      }, flip);
      stroke(ctx, dim(color, 0.5), 0.6, 0.8, [[8.8, 22], [7.6, 40.4]], flip);
      stroke(ctx, dim(color, 0.5), 0.5, 0.8, [[11.6, 25], [11, 41]], flip);
    });
  });
  stroke(ctx, lit(color, 0.45), 0.7, 0.8, [[9.6, 9], [11.2, 5.8], [13.4, 4.6]]);
  stroke(ctx, lit(color, 0.3), 0.5, 0.8, [[7.4, 19], [6, 30]]);
  stroke(ctx, dim(color, 0.6), 0.8, 0.7, [[14.4, 24.6], [13.4, 41]]);
  fillShape(ctx, cloth(ctx, spec.skin), () => ctx.ellipse(15.6, 20.8, 1.4, 1.3, 0, 0, Math.PI * 2));
}
