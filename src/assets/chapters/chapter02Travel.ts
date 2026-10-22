import { css, mix, paintTexture, rng, shade, type Ctx } from '../art/canvasKit';
import { ellipseShadow, foliageClump, litGradient, pebble, rope } from '../art/fieldKit';
import type { MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Chapter 2 travelling gear and roadside nature: kneeling camels, a
 * dawn campfire, saddle bundles, boulders of the pass, the dry stream bed,
 * and tamarisk scrub.
 */

const CAMEL = 0xb08850;
const CAMEL_SCALE = 1.3;

export const CH02_TRAVEL_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  /**
   * A dromedary couched on folded legs, a kilim saddle cloth over the hump.
   * Drawn at 1.3x its sketch so that, beside a 40 px person, it is a camel's
   * true size: about 1.4 m at the hump and 2.6 m long.
   */
  'ch2-camel': (scene, def) => paintTexture(scene, def.texture, 64 * CAMEL_SCALE, 52 * CAMEL_SCALE, ctx => {
    ctx.scale(CAMEL_SCALE, CAMEL_SCALE);
    drawCamel(ctx);
  }),

  /** Ring of stones, crossed sticks, and a low flame under a blackened kettle. */
  'ch2-campfire': (scene, def) => {
    paintTexture(scene, def.texture, 44, 46, ctx => {
      const cx = 22;
      const cy = 36;
      const glow = ctx.createRadialGradient(cx, cy - 4, 2, cx, cy - 4, 22);
      glow.addColorStop(0, 'rgba(255,170,80,0.35)');
      glow.addColorStop(1, 'rgba(255,170,80,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 44, 46);
      ellipseShadow(ctx, cx, cy + 1, 15, 5, 0.3);
      ctx.fillStyle = css(0x2a1a10);
      ctx.beginPath();
      ctx.ellipse(cx, cy, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Back stones, then the fire, then the near stones.
      const ring = Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return { x: cx + Math.cos(a) * 12, y: cy + Math.sin(a) * 4.8, i };
      });
      for (const s of ring.filter(s => s.y <= cy)) pebble(ctx, s.x, s.y, 3.6, 2.6, 0x7a6a58, 30 + s.i);
      for (const [x0, y0, x1, y1] of [[13, 38, 30, 31], [13, 31, 31, 38]] as const) {
        ctx.strokeStyle = css(0x4a2e18);
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.fillStyle = css(0xe0702a);
        ctx.beginPath();
        ctx.arc(x1 - (x1 - x0) * 0.45, y1 - (y1 - y0) * 0.45, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      flame(ctx, cx, cy - 1, 8, 20);
      // Copper kettle blackened by many fires, set on the stones.
      const k = { x: 31, y: 27 };
      ctx.fillStyle = litGradient(ctx, k.x, k.y, 5, 0x3a2e26);
      ctx.beginPath();
      ctx.ellipse(k.x, k.y, 5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = css(0x1a1410);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(k.x, k.y - 3, 3.4, Math.PI, 0);
      ctx.moveTo(k.x + 4.5, k.y - 1);
      ctx.lineTo(k.x + 8, k.y - 3.5);
      ctx.stroke();
      for (const s of ring.filter(s => s.y > cy)) pebble(ctx, s.x, s.y, 3.8, 2.8, 0x8a7a64, 30 + s.i);
      // A thread of smoke rising into the dawn.
      ctx.strokeStyle = 'rgba(200,190,175,0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 20);
      ctx.bezierCurveTo(cx - 4, cy - 26, cx + 4, cy - 30, cx - 1, cy - 36);
      ctx.stroke();
    });
  },

  /** Kilim saddlebags (khurjín) and a rolled carpet waiting to be loaded. */
  'ch2-bundles': (scene, def) => {
    paintTexture(scene, def.texture, 48, 42, ctx => {
      ellipseShadow(ctx, 25, 36, 20, 5);
      saddlebag(ctx, 15, 35, 9, 11, 0x7a2f26, 0xc9a55c, 1);
      saddlebag(ctx, 31, 36, 9, 10, 0x3f5a6a, 0xd8c7a0, 2);
      // Rolled carpet across the top, its end spiral showing.
      ctx.save();
      ctx.translate(24, 17);
      ctx.rotate(-0.12);
      const roll = ctx.createLinearGradient(0, -5, 0, 5);
      roll.addColorStop(0, css(shade(0x9a4a3a, 1.3)));
      roll.addColorStop(0.5, css(0x9a4a3a));
      roll.addColorStop(1, css(shade(0x9a4a3a, 0.55)));
      ctx.fillStyle = roll;
      ctx.fillRect(-15, -4.5, 28, 9);
      ctx.fillStyle = css(0x1f2f5a, 0.8);
      for (let x = -12; x < 12; x += 5) ctx.fillRect(x, -4.5, 1.6, 9);
      ctx.fillStyle = css(0x8a3a2a);
      ctx.beginPath();
      ctx.ellipse(13, 0, 2.8, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = css(0xd8b870, 0.9);
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.ellipse(13, 0, 1.6, 2.8, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      rope(ctx, [{ x: 18, y: 12 }, { x: 18, y: 22 }], 0xc8b088, 1.4);
      rope(ctx, [{ x: 30, y: 10 }, { x: 31, y: 20 }], 0xc8b088, 1.4);
    });
  },

  /** Weathered boulders from the pass north of the city. */
  'ch2-rock': (scene, def) => {
    paintTexture(scene, def.texture, 58, 48, ctx => {
      ellipseShadow(ctx, 30, 42, 25, 6);
      boulder(ctx, [[6, 42], [9, 24], [22, 11], [36, 15], [42, 30], [40, 42]], 0x7a6a58, 3);
      boulder(ctx, [[32, 43], [36, 31], [46, 27], [54, 33], [54, 43]], 0x6a5c4c, 5);
      pebble(ctx, 14, 44, 3, 2, 0x7a6a58, 7);
      pebble(ctx, 50, 45, 2.5, 1.6, 0x8a7a64, 8);
    });
  },

  /** A dry stream bed: pale sand and rounded cobbles between cracked banks. */
  'ch2-dry-stream': (scene, def) => {
    paintTexture(scene, def.texture, 72, 30, ctx => {
      const rand = rng(77);
      ctx.save();
      ctx.filter = 'blur(1.5px)';
      ctx.fillStyle = 'rgba(70,56,38,0.45)';
      ctx.beginPath();
      ctx.ellipse(36, 18, 33, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = css(0xc4a878);
      ctx.beginPath();
      ctx.moveTo(6, 18);
      ctx.bezierCurveTo(20, 11, 30, 23, 44, 15);
      ctx.bezierCurveTo(54, 10, 62, 17, 67, 16);
      ctx.bezierCurveTo(60, 23, 50, 18, 42, 22);
      ctx.bezierCurveTo(28, 28, 18, 19, 6, 18);
      ctx.fill();
      // Cracked mud along the banks.
      ctx.strokeStyle = css(0x5a4a34, 0.55);
      ctx.lineWidth = 0.6;
      for (let i = 0; i < 14; i++) {
        const x = 8 + rand() * 56;
        const y = rand() < 0.5 ? 10 + rand() * 4 : 22 + rand() * 4;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (rand() - 0.5) * 6, y + (rand() - 0.5) * 3);
        ctx.lineTo(x + (rand() - 0.5) * 8, y + (rand() - 0.5) * 4);
        ctx.stroke();
      }
      for (let i = 0; i < 9; i++) {
        const t = i / 8;
        pebble(ctx, 10 + t * 54 + (rand() - 0.5) * 4, 18 + Math.sin(t * 6) * 3, 2 + rand() * 2.4, 1.4 + rand() * 1.2,
          mix(0x8a7a64, 0xb8a888, rand()), 60 + i);
      }
    });
  },

  /** Tamarisk (gaz): wiry stems, feathery grey-green sprays and pink plumes. */
  'ch2-tamarisk': (scene, def) => {
    paintTexture(scene, def.texture, 50, 68, ctx => {
      const base = { x: 25, y: 62 };
      ellipseShadow(ctx, base.x + 3, base.y, 16, 4.5);
      const rand = rng(19);
      const tips: Array<{ x: number; y: number }> = [];
      ctx.strokeStyle = css(0x5a3a24);
      for (let i = 0; i < 7; i++) {
        const spread = (i - 3) / 3;
        const tx = base.x + spread * 17 + (rand() - 0.5) * 4;
        const ty = base.y - 22 - (1 - Math.abs(spread)) * 20 - rand() * 6;
        ctx.lineWidth = 1.4 - Math.abs(spread) * 0.4;
        ctx.beginPath();
        ctx.moveTo(base.x + spread * 3, base.y);
        ctx.quadraticCurveTo(base.x + spread * 6, base.y - 16, tx, ty);
        ctx.stroke();
        tips.push({ x: tx, y: ty });
      }
      for (const [i, t] of tips.entries()) {
        foliageClump(ctx, t.x, t.y + 3, 5 + rand() * 2, { leaf: 0x6f855a, seed: 40 + i, masses: 4, squash: 1.1 });
      }
      // Feathery drooping sprays, and the pink flower plumes of late spring at the tips.
      for (let i = 0; i < 160; i++) {
        const t = tips[i % tips.length]!;
        const x = t.x + (rand() - 0.5) * 14;
        const y = t.y + (rand() - 0.3) * 16;
        const plume = rand() < 0.22 && y < t.y + 2;
        ctx.strokeStyle = css(plume ? 0xe0a0b4 : shade(0x8ba36b, 0.75 + rand() * 0.6), 0.85);
        ctx.lineWidth = plume ? 1.3 : 0.7;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + (x < t.x ? -2 : 2), y - 1, x + (x < t.x ? -3 : 3), y + 2 + rand() * 2);
        ctx.stroke();
      }
    });
  },
};

function drawCamel(ctx: Ctx): void {
  ellipseShadow(ctx, 32, 45, 27, 5.5);
  // Folded forelegs and haunch, tucked under the body.
  ctx.fillStyle = css(shade(CAMEL, 0.62));
  ctx.beginPath();
  ctx.ellipse(16, 43, 8, 3.2, 0, 0, Math.PI * 2);
  ctx.ellipse(41, 44, 9, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body with the hump, lit from the upper left.
  ctx.beginPath();
  ctx.moveTo(8, 40);
  ctx.bezierCurveTo(5, 32, 10, 26, 16, 25);
  ctx.bezierCurveTo(20, 12, 34, 12, 38, 24);
  ctx.bezierCurveTo(45, 25, 49, 31, 48, 40);
  ctx.quadraticCurveTo(28, 45, 8, 40);
  ctx.closePath();
  ctx.fillStyle = litGradient(ctx, 26, 30, 22, CAMEL, 0.9);
  ctx.fill();
  ctx.strokeStyle = css(shade(CAMEL, 0.4), 0.9);
  ctx.lineWidth = 0.9;
  ctx.stroke();
  // Neck curving forward and up to the head.
  ctx.beginPath();
  ctx.moveTo(42, 34);
  ctx.bezierCurveTo(50, 32, 50, 22, 52, 14);
  ctx.lineTo(58, 15);
  ctx.bezierCurveTo(56, 24, 56, 34, 47, 39);
  ctx.closePath();
  ctx.fillStyle = litGradient(ctx, 50, 24, 12, shade(CAMEL, 0.96), 0.8);
  ctx.fill();
  ctx.stroke();
  // Head: a long drooping muzzle, heavy-lidded eye, small ear.
  ctx.beginPath();
  ctx.moveTo(51, 15);
  ctx.bezierCurveTo(50, 9, 53, 6, 57, 6.5);
  ctx.bezierCurveTo(60, 7, 62, 9, 63, 12);
  ctx.quadraticCurveTo(63.5, 15, 60.5, 15.5);
  ctx.quadraticCurveTo(56, 15, 52.5, 17);
  ctx.closePath();
  ctx.fillStyle = litGradient(ctx, 56, 10, 7, shade(CAMEL, 0.95));
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = css(shade(CAMEL, 0.7));
  ctx.beginPath();
  ctx.moveTo(52.5, 8);
  ctx.lineTo(52, 4.5);
  ctx.lineTo(54.5, 7);
  ctx.fill();
  ctx.fillStyle = css(0x1a1008);
  ctx.fillRect(56, 9, 1.5, 1.1);
  ctx.fillRect(61.6, 11.2, 0.9, 0.9);
  ctx.strokeStyle = css(shade(CAMEL, 0.45), 0.8);
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(59, 14);
  ctx.lineTo(62.5, 13.8);
  ctx.stroke();
  // Halter rope trailing to the ground.
  rope(ctx, [{ x: 61, y: 14 }, { x: 62, y: 24 }, { x: 59, y: 36 }, { x: 54, y: 43 }], 0x8a6a42, 1);
  // Saddle cloth and pack frame over the hump.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(15, 24);
  ctx.bezierCurveTo(20, 14, 33, 14, 38, 23);
  ctx.lineTo(37, 33);
  ctx.quadraticCurveTo(27, 37, 16, 33);
  ctx.closePath();
  ctx.fillStyle = litGradient(ctx, 24, 22, 14, 0x8a2f2a, 0.8);
  ctx.fill();
  ctx.clip();
  ctx.fillStyle = css(0xc9a55c, 0.95);
  for (const y of [22, 28]) ctx.fillRect(10, y, 32, 1.8);
  ctx.fillStyle = css(0x1f2f5a, 0.9);
  for (let x = 17; x < 38; x += 5) {
    ctx.beginPath();
    ctx.moveTo(x, 25.5);
    ctx.lineTo(x + 1.8, 24);
    ctx.lineTo(x + 3.6, 25.5);
    ctx.lineTo(x + 1.8, 27);
    ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = css(0xe8dcc0);
  for (let x = 17; x <= 36; x += 3.8) ctx.fillRect(x, 33 + Math.sin(((x - 16) / 21) * Math.PI) * 2.5, 1, 2.6);
  ctx.strokeStyle = css(0x4a2e18);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(19, 18);
  ctx.lineTo(23, 13);
  ctx.moveTo(33, 18);
  ctx.lineTo(29, 13);
  ctx.stroke();
}

/** Upright flame tongues with a hot core. */
function flame(ctx: Ctx, x: number, base: number, halfW: number, h: number): void {
  const layers: Array<[number, number, string]> = [[1, 1, '#d8501e'], [0.7, 0.78, '#f09030'], [0.4, 0.5, '#ffe090']];
  for (const [kw, kh, color] of layers) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - halfW * kw, base);
    ctx.quadraticCurveTo(x - halfW * kw * 1.1, base - h * kh * 0.5, x - halfW * kw * 0.2, base - h * kh * 0.75);
    ctx.quadraticCurveTo(x - 1, base - h * kh * 0.6, x + 1, base - h * kh);
    ctx.quadraticCurveTo(x + halfW * kw * 0.5, base - h * kh * 0.55, x + halfW * kw * 0.5, base - h * kh * 0.7);
    ctx.quadraticCurveTo(x + halfW * kw * 1.15, base - h * kh * 0.4, x + halfW * kw, base);
    ctx.closePath();
    ctx.fill();
  }
}

/** A woven saddlebag: a soft pocket with stepped kilim bands and a tasselled flap. */
function saddlebag(ctx: Ctx, cx: number, ground: number, halfW: number, h: number, color: number, motif: number, seed: number): void {
  ctx.beginPath();
  ctx.moveTo(cx - halfW, ground - h);
  ctx.quadraticCurveTo(cx - halfW - 2, ground - h * 0.3, cx - halfW + 1, ground);
  ctx.lineTo(cx + halfW - 1, ground);
  ctx.quadraticCurveTo(cx + halfW + 2, ground - h * 0.3, cx + halfW, ground - h);
  ctx.quadraticCurveTo(cx, ground - h - 2, cx - halfW, ground - h);
  ctx.fillStyle = litGradient(ctx, cx, ground - h / 2, halfW * 1.3, color, 0.8);
  ctx.fill();
  ctx.strokeStyle = css(shade(color, 0.45));
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.save();
  ctx.clip();
  const rand = rng(seed);
  ctx.fillStyle = css(motif, 0.9);
  for (let y = ground - h + 3; y < ground - 1; y += 4) {
    for (let x = cx - halfW + 1 + (rand() < 0.5 ? 0 : 2); x < cx + halfW; x += 4) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 1.3, y - 1.3);
      ctx.lineTo(x + 2.6, y);
      ctx.lineTo(x + 1.3, y + 1.3);
      ctx.fill();
    }
  }
  ctx.restore();
  ctx.fillStyle = css(shade(color, 0.7));
  ctx.fillRect(cx - halfW, ground - h - 1, halfW * 2, 3);
  ctx.fillStyle = css(motif);
  for (const dx of [-halfW + 2, 0, halfW - 2]) ctx.fillRect(cx + dx - 0.5, ground - h + 2, 1, 3);
}

/** A faceted boulder: a lit top plane, a shaded flank, cracks and lichen. */
function boulder(ctx: Ctx, outline: ReadonlyArray<readonly [number, number]>, color: number, seed: number): void {
  const rand = rng(seed);
  const path = (): void => {
    ctx.beginPath();
    outline.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.closePath();
  };
  const xs = outline.map(p => p[0]);
  const ys = outline.map(p => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const r = (Math.max(...xs) - Math.min(...xs)) / 2;
  path();
  ctx.fillStyle = css(shade(color, 0.62));
  ctx.fill();
  ctx.save();
  path();
  ctx.clip();
  // Sunlit upper-left facet.
  ctx.fillStyle = litGradient(ctx, cx - r * 0.3, cy - r * 0.3, r * 0.9, shade(color, 1.1), 0.8);
  ctx.beginPath();
  ctx.moveTo(cx - r * 1.4, cy + r * 0.4);
  ctx.lineTo(cx - r * 0.2, cy - r * 1.4);
  ctx.lineTo(cx + r * 0.5, cy - r * 0.2);
  ctx.lineTo(cx - r * 0.1, cy + r * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = css(shade(color, 0.42), 0.7);
  ctx.lineWidth = 0.7;
  for (let i = 0; i < 3; i++) {
    const x = cx - r * 0.5 + rand() * r;
    const y = cy - r * 0.3 + rand() * r * 0.6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rand() - 0.5) * 6, y + 3 + rand() * 4);
    ctx.stroke();
  }
  for (let i = 0; i < r * 1.6; i++) {
    ctx.fillStyle = css(rand() < 0.6 ? 0x9a9a6a : 0xc8b890, 0.6);
    ctx.fillRect(cx - r + rand() * r * 2, cy - r + rand() * r * 2, 1.4, 1);
  }
  ctx.restore();
  path();
  ctx.strokeStyle = css(shade(color, 0.38), 0.95);
  ctx.lineWidth = 0.9;
  ctx.stroke();
}
