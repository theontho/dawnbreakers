import { css, paintTexture, rng, shade, variantKey, type Ctx } from '../art/canvasKit';
import { paintMazandaranCottage } from '../art/mazandaranCottage';
import { ALDER_VARIANTS, IRONWOOD_VARIANTS, OAK_VARIANTS, paintForestTree } from '../art/hyrcanianWoods';
import { endGrain, roundLog, SAWN } from '../art/timber';
import { boulder, contactShadow, crown, frond, moss } from '../art/woodland';
import type { MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Chapter 8 forest props: the Hyrcanian woods of Mázindarán in autumn.
 * Broad oaks, rust-gold ironwood, pale alders, ferns, box thickets, fallen
 * logs, mossy stones, and the woodcutter's clearing. Every texture is drawn
 * with its foot near the bottom centre so it sits on its cell.
 */

export const CH08_FOREST_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  // The forest at its real height: oaks, ironwood and alders of 15 to 24 m; see hyrcanianWoods.
  'ch8-oak': (scene, def) => OAK_VARIANTS.forEach((s, i) => paintForestTree(scene, variantKey(def.texture, i), s)),
  'ch8-ironwood': (scene, def) => IRONWOOD_VARIANTS.forEach((s, i) => paintForestTree(scene, variantKey(def.texture, i), s)),
  'ch8-alder': (scene, def) => ALDER_VARIANTS.forEach((s, i) => paintForestTree(scene, variantKey(def.texture, i), s)),

  'ch8-woodcutter-house': (scene, def) => paintMazandaranCottage(scene, def.texture, def.footprint?.w ?? 5, def.footprint?.h ?? 4),

  'ch8-fern': (scene, def) => paintTexture(scene, def.texture, 48, 34, ctx => {
    contactShadow(ctx, 24, 29, 16, 4, 0.2);
    const fronds: ReadonlyArray<readonly [number, number, number, number]> = [
      [4, 22, -3, 0x3f6a32], [44, 23, 3, 0x3f6a32], [9, 11, -4, 0x557f3c],
      [39, 12, 4, 0x4a7536], [24, 3, 2, 0x6a9a48], [15, 27, -2, 0x4a7536], [33, 27, 2, 0x557f3c],
    ];
    for (const [x, y, bend, color] of fronds) frond(ctx, 24, 29, x, y, bend, color);
    // A fiddlehead still uncurling.
    ctx.strokeStyle = css(0x7aa850);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(26, 29);
    ctx.quadraticCurveTo(28, 20, 30, 19);
    ctx.arc(29, 19.5, 1.2, 0, Math.PI * 1.6);
    ctx.stroke();
  }),

  // Box and bramble thicket, with the red of haws in it.
  'ch8-undergrowth': (scene, def) => paintTexture(scene, def.texture, 52, 46, ctx => {
    contactShadow(ctx, 27, 39, 23, 6);
    crown(ctx, 26, 28, 23, 14, { leaves: [0x223d22, 0x2c4a2a, 0x305229, 0x3a6131], seed: 41, masses: 9, berries: 0xa02a24 });
    ctx.strokeStyle = css(0x3a2a1a, 0.8);
    ctx.lineWidth = 0.8;
    for (const [x0, x1] of [[10, 6], [42, 47], [30, 34]] as const) {
      ctx.beginPath();
      ctx.moveTo(x0, 38);
      ctx.quadraticCurveTo((x0 + x1) / 2, 34, x1, 30);
      ctx.stroke();
    }
  }),

  'ch8-log': (scene, def) => paintTexture(scene, def.texture, 64, 42, ctx => {
    contactShadow(ctx, 33, 30, 26, 7, 0.24);
    roundLog(ctx, { x: 12, y: 15 }, { x: 52, y: 30 }, 6, { seed: 3, moss: true, ends: 'b' });
    // A snapped branch stub and a shelf fungus.
    ctx.fillStyle = css(0x4a3220);
    ctx.fillRect(22, 10, 3, 6);
    ctx.fillStyle = css(0xc8a870);
    ctx.beginPath();
    ctx.ellipse(38, 30, 4, 1.6, 0.3, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = css(0x8a6a40);
    ctx.fillRect(35, 30, 6, 0.8);
    frond(ctx, 16, 26, 6, 20, -2, 0x4a7536);
    frond(ctx, 16, 26, 14, 33, 2, 0x3f6a32);
  }),

  'ch8-mossy-rock': (scene, def) => paintTexture(scene, def.texture, 52, 42, ctx => {
    contactShadow(ctx, 28, 35, 22, 6);
    boulder(ctx, 25, 34, 20, 24, 0x6f6f68, 7);
    boulder(ctx, 41, 36, 8, 8, 0x7a7a70, 9);
    moss(ctx, 21, 15, 10, 4, 5);
    moss(ctx, 33, 19, 5, 3, 6, 0x5d8a46);
    moss(ctx, 12, 30, 5, 3, 8, 0x4a6d32);
    ctx.fillStyle = 'rgba(220,214,180,0.55)';
    for (const [x, y] of [[28, 26], [31, 28], [14, 22]] as const) {
      ctx.beginPath();
      ctx.arc(x, y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }),

  // The woodcutter's stump with his axe left in it.
  'ch8-stump': (scene, def) => paintTexture(scene, def.texture, 44, 38, ctx => {
    contactShadow(ctx, 23, 32, 16, 5);
    const g = ctx.createLinearGradient(10, 0, 34, 0);
    g.addColorStop(0, css(0x7a5434));
    g.addColorStop(0.4, css(0x5a3c22));
    g.addColorStop(1, css(0x2f1f12));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(8, 33);
    ctx.lineTo(11, 18);
    ctx.lineTo(33, 18);
    ctx.lineTo(36, 33);
    ctx.ellipse(22, 33, 14, 4, 0, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(20,10,4,0.5)';
    ctx.lineWidth = 0.7;
    for (const x of [14, 18, 25, 30]) {
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x + (x - 22) * 0.12, 34);
      ctx.stroke();
    }
    endGrain(ctx, 22, 18, 11.5, 5, 0);
    moss(ctx, 12, 30, 3, 3, 4);
    // Axe: haft and a grey iron head bitten into the wood.
    ctx.strokeStyle = css(0x8a6038);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(25, 17);
    ctx.lineTo(37, 4);
    ctx.stroke();
    ctx.fillStyle = css(0x8a9096);
    ctx.beginPath();
    ctx.moveTo(22, 16);
    ctx.lineTo(28, 12);
    ctx.lineTo(29, 19);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = css(0xd0d4d8);
    ctx.fillRect(22, 15.5, 2.5, 1);
  }),

  // Split firewood stacked between two stakes.
  'ch8-woodpile': (scene, def) => paintTexture(scene, def.texture, 56, 46, ctx => {
    contactShadow(ctx, 30, 39, 24, 6);
    const rows: ReadonlyArray<readonly [number, number]> = [[38, 5], [31, 4], [24, 3], [17, 2]];
    const rand = rng(17);
    rows.forEach(([y, count], row) => {
      for (let i = 0; i < count; i++) {
        const x = 12 + row * 4.5 + i * 9;
        roundLog(ctx, { x, y }, { x: x + 10, y: y - 5 }, 4.3, { ends: 'a', seed: row * 7 + i, bark: shade(0x5a3c22, 0.85 + rand() * 0.3) });
      }
    });
    ctx.fillStyle = css(0x3a2616);
    ctx.fillRect(7, 14, 2.5, 26);
    ctx.fillRect(50, 10, 2.5, 26);
    ctx.fillStyle = css(SAWN, 0.8);
    for (let i = 0; i < 6; i++) ctx.fillRect(14 + rand() * 30, 40 + rand() * 3, 2, 1);
  }),

  'ch8-campfire': (scene, def) => paintTexture(scene, def.texture, 48, 42, ctx => {
    contactShadow(ctx, 24, 33, 19, 6, 0.22);
    const glow = ctx.createRadialGradient(24, 30, 2, 24, 30, 22);
    glow.addColorStop(0, 'rgba(255,170,80,0.45)');
    glow.addColorStop(1, 'rgba(255,140,60,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 8, 48, 34);
    const stones: ReadonlyArray<readonly [number, number]> = [[12, 30], [17, 26], [26, 25], [34, 27], [37, 31], [31, 36], [21, 36], [13, 34]];
    const back = stones.filter(([, y]) => y < 30);
    const front = stones.filter(([, y]) => y >= 30);
    for (const [x, y] of back) boulder(ctx, x, y, 4.5, 3.5, 0x6f6a62, x + y);
    ctx.fillStyle = css(0x2a1a10);
    ctx.beginPath();
    ctx.ellipse(24, 31, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    roundLog(ctx, { x: 14, y: 33 }, { x: 32, y: 26 }, 2.2, { ends: 'a', seed: 2, bark: 0x3a2414 });
    roundLog(ctx, { x: 33, y: 33 }, { x: 16, y: 27 }, 2.2, { ends: 'a', seed: 4, bark: 0x3a2414 });
    flame(ctx, 24, 31, 9, 22);
    for (const [x, y] of front) boulder(ctx, x, y, 4.5, 3.5, 0x6f6a62, x * y);
    ctx.fillStyle = '#ffd27a';
    for (const [x, y] of [[20, 9], [27, 5], [30, 12]] as const) ctx.fillRect(x, y, 1, 1);
  }),
};

/** Layered flame: red outer tongue, orange body, white-gold heart. */
export function flame(ctx: Ctx, cx: number, base: number, halfW: number, height: number): void {
  const layers: ReadonlyArray<readonly [number, number, string]> = [
    [1, 1, '#c8401a'], [0.72, 0.78, '#f08a2a'], [0.45, 0.52, '#ffd36a'], [0.22, 0.28, '#fff4c8'],
  ];
  for (const [kw, kh, color] of layers) {
    const w = halfW * kw;
    const h = height * kh;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx - w, base);
    ctx.bezierCurveTo(cx - w, base - h * 0.5, cx - w * 0.2, base - h * 0.6, cx + w * 0.1, base - h);
    ctx.bezierCurveTo(cx + w * 0.2, base - h * 0.55, cx + w * 1.1, base - h * 0.45, cx + w, base);
    ctx.closePath();
    ctx.fill();
  }
}
