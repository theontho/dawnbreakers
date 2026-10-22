import type Phaser from 'phaser';
import { css, mix, paintTexture, rng, shade } from './canvasKit';

/** The Persian cypress, shared by the town's tall cypresses. */

export interface CypressStyle {
  height: number;
  width: number;
  leaf: number;
  seed: number;
  /** Lean of the tip in pixels, as wind-bent cypresses have. */
  lean?: number;
  /** Distance from the trunk's foot to the bottom of the texture (16 puts it on the cell centre). */
  foot?: number;
}

/** The Persian cypress (sarv): a dense flame of dark green. */
export function paintCypress(scene: Phaser.Scene, key: string, style: CypressStyle): void {
  const foot = style.foot ?? 4;
  const w = style.width + 16;
  const h = style.height + 4 + foot;
  // Big trees get proportionally bigger tufts; the small-world ones keep theirs.
  const tuft = Math.max(1, style.width / 24);
  paintTexture(scene, key, w, h, ctx => {
    const rand = rng(style.seed);
    const cx = w / 2;
    const ground = h - foot;
    const top = ground - style.height;
    const lean = style.lean ?? 0;
    const half = style.width / 2;
    ctx.fillStyle = 'rgba(10,6,3,0.28)';
    ctx.beginPath();
    ctx.ellipse(cx + 3, ground, half + 3, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = css(0x4a2e18);
    ctx.fillRect(cx - 1.5, ground - 10, 3, 10);
    const shape = (): void => {
      ctx.beginPath();
      ctx.moveTo(cx, ground - 6);
      ctx.bezierCurveTo(cx - half * 1.15, ground - 12, cx - half * 1.05, top + style.height * 0.45, cx + lean, top);
      ctx.bezierCurveTo(cx + half * 1.0 + lean * 0.3, top + style.height * 0.45, cx + half * 1.1, ground - 12, cx, ground - 6);
      ctx.closePath();
    };
    const g = ctx.createLinearGradient(cx - half, 0, cx + half, 0);
    g.addColorStop(0, css(shade(style.leaf, 1.3)));
    g.addColorStop(0.5, css(style.leaf));
    g.addColorStop(1, css(shade(style.leaf, 0.55)));
    shape();
    ctx.fillStyle = g;
    ctx.fill();
    ctx.save();
    shape();
    ctx.clip();
    // Scalloped tufts, brighter on the sunlit side.
    for (let y = top + 4; y < ground - 4; y += 3 * tuft) {
      for (let k = 0; k < 3 * tuft; k++) {
        const x = cx - half + rand() * style.width;
        const lit = x < cx;
        ctx.strokeStyle = css(lit ? shade(style.leaf, 1.5) : shade(style.leaf, 0.5), 0.55);
        ctx.lineWidth = tuft;
        ctx.beginPath();
        ctx.arc(x, y, (2.2 + rand() * 1.5) * tuft, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();
      }
    }
    ctx.restore();
    ctx.strokeStyle = css(mix(style.leaf, 0x000000, 0.55), 0.7);
    ctx.lineWidth = 0.8;
    shape();
    ctx.stroke();
  });
}
