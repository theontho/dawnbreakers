import type Phaser from 'phaser';

export const GLOW_TEXTURE = 'journey-glow';

/** A soft white radial falloff, tinted and stretched for twilight, moon halo and lantern light. */
export function ensureGlowTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(GLOW_TEXTURE)) return;
  const size = 128;
  const texture = scene.textures.createCanvas(GLOW_TEXTURE, size, size);
  const ctx = texture?.getContext();
  if (!texture || !ctx) return;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  gradient.addColorStop(0.6, 'rgba(255,255,255,0.14)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  texture.refresh();
}
