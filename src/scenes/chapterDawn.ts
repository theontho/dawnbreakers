import Phaser from 'phaser';
import { vistaFor } from '../assets/art/vista';
import { seasonOf, type VistaFrame } from '../assets/art/vista/types';
import type { ChapterId } from '../data/chapters';
import { openingEvening, TITLE_OPENINGS } from '../data/titleOpenings';
import { paintBackstop } from './titleCity';

/**
 * A small painting of a chapter's title dawn, for its card in the chapter
 * list: the place in its morning colours under a dawn sky, the sun just up
 * behind it and its first light along the edges. The vista is painted at
 * the scale the title paints it, on a screen as wide as the picture needs,
 * and only the band around the horizon is kept.
 */

/** The height of the band kept, in title pixels at the scale of an 800-pixel-tall screen. */
const BAND = 440;
const SCREEN_H = 800;
/** Where the title puts the foot of the city on that screen. */
const CITY_BASE = SCREEN_H * 0.72;
const BAND_TOP = CITY_BASE - BAND * 0.78;

/** The texture key of `chapter`'s dawn at this size, painting it the first time it is asked for. */
export function chapterDawnTexture(scene: Phaser.Scene, chapter: ChapterId, width: number, height: number): string {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const key = `chapter-dawn-${chapter}-${w}x${h}`;
  if (scene.textures.exists(key)) return key;
  const opening = TITLE_OPENINGS[chapter];
  const vista = vistaFor(opening.vista);
  const scale = h / BAND;
  const frame: VistaFrame = { width: Math.max(SCREEN_H, w / scale), height: SCREEN_H, horizonY: CITY_BASE, k: 1, season: seasonOf(openingEvening(opening)) };
  const texture = scene.textures.createCanvas(key, w, h)!;
  const ctx = texture.getContext();
  const place = (c: CanvasRenderingContext2D) => {
    c.setTransform(scale, 0, 0, scale, (w - frame.width * scale) / 2, -BAND_TOP * scale);
  };

  ctx.save();
  place(ctx);
  paintSky(ctx, frame);
  paintBackstop(ctx, 'day', frame, vista.land);
  vista.paint(ctx, 'day', frame);
  ctx.restore();

  // The first light along the edges, painted apart and laid on brightening.
  const rim = document.createElement('canvas');
  rim.width = w;
  rim.height = h;
  const rimCtx = rim.getContext('2d')!;
  place(rimCtx);
  paintBackstop(rimCtx, 'rim', frame, vista.land);
  vista.paint(rimCtx, 'rim', frame);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.55;
  ctx.drawImage(rim, 0, 0);
  ctx.restore();

  // A warm wash of the low sun over everything.
  const wash = ctx.createLinearGradient(0, 0, 0, h);
  wash.addColorStop(0, 'rgba(255,170,110,0)');
  wash.addColorStop(0.7, 'rgba(255,170,110,0.16)');
  wash.addColorStop(1, 'rgba(120,70,50,0.18)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
  texture.refresh();
  return key;
}

/** A sky at sunrise, deep blue overhead to gold at the horizon, and the sun just clear of the land. */
function paintSky(ctx: CanvasRenderingContext2D, frame: VistaFrame): void {
  const { width, horizonY } = frame;
  const sky = ctx.createLinearGradient(0, BAND_TOP, 0, horizonY);
  sky.addColorStop(0, '#3d5d8f');
  sky.addColorStop(0.45, '#9db6d4');
  sky.addColorStop(0.8, '#f3c792');
  sky.addColorStop(1, '#f7a868');
  ctx.fillStyle = sky;
  ctx.fillRect(0, BAND_TOP, width, horizonY - BAND_TOP + 4);
  const sunY = horizonY - 120;
  const glow = ctx.createRadialGradient(width / 2, sunY, 0, width / 2, sunY, 260);
  glow.addColorStop(0, 'rgba(255,236,190,0.9)');
  glow.addColorStop(0.25, 'rgba(255,210,150,0.45)');
  glow.addColorStop(1, 'rgba(255,190,130,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, BAND_TOP, width, horizonY - BAND_TOP);
  ctx.fillStyle = '#fff6dc';
  ctx.beginPath();
  ctx.arc(width / 2, sunY, 34, 0, Math.PI * 2);
  ctx.fill();
}
