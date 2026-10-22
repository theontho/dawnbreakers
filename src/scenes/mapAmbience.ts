import Phaser from 'phaser';
import type { Decor } from './baseMapTypes';
import { TILE_H } from './baseMapTypes';
import type { MapAmbience, MapLight, ParticleKind } from '../data/maps/types';

/**
 * Atmosphere for a map: a multiply colour wash over the world (dusk, night,
 * prison gloom), additive light pools that shine through it, a vignette, and
 * a light screen-space particle layer (dust, snow, fireflies...).
 *
 * Everything here is cheap by construction: textures are generated once and
 * shared, the wash and vignette are two screen-sized quads, and particle
 * counts are capped low.
 */

const WASH_DEPTH = 9400;
const LIGHT_DEPTH = 9450;
const PARTICLE_DEPTH = 9500;
const VIGNETTE_DEPTH = 9550;

const FIRE_LIGHT = { radius: 110, color: 0xff9440, intensity: 0.6 };

/** Decor textures that cast a warm light pool automatically. */
const LIGHT_EMITTING_TEXTURES: Readonly<Record<string, Omit<MapLight, 'gridX' | 'gridY'>>> = {
  lamp: { radius: 96, color: 0xffb860, intensity: 0.55 },
  'ch10-light-shaft': { radius: 80, color: 0xf3e2b5, intensity: 0.45 },
  'ch2-campfire': FIRE_LIGHT,
  'ch3-brazier': FIRE_LIGHT,
  'ch6-brazier': FIRE_LIGHT,
  'ch7-cookfire': FIRE_LIGHT,
  'ch8-campfire': FIRE_LIGHT,
};

/** True for decor that burns (campfires, braziers), so the soundscape can crackle. */
export function emitsFire(texture: string): boolean {
  return LIGHT_EMITTING_TEXTURES[texture] === FIRE_LIGHT;
}

export interface AmbienceHandle {
  destroy(): void;
}

export function createMapAmbience(
  scene: Phaser.Scene,
  ambience: MapAmbience | undefined,
  decor: readonly Decor[],
  mapSize: { width: number; height: number },
  gridToScreen: (gx: number, gy: number) => { sx: number; sy: number },
): AmbienceHandle {
  ensureAmbienceTextures(scene);
  const { width, height } = scene.scale;
  const objects: Phaser.GameObjects.GameObject[] = [];

  if (ambience?.wash) {
    objects.push(scene.add.rectangle(0, 0, width, height, ambience.wash.color, ambience.wash.alpha)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(WASH_DEPTH)
      .setBlendMode(Phaser.BlendModes.MULTIPLY));
  }

  const lights: MapLight[] = [...(ambience?.lights ?? [])];
  for (const item of decor) {
    const light = LIGHT_EMITTING_TEXTURES[item.texture];
    if (light) lights.push({ gridX: item.gridX, gridY: item.gridY, ...light });
  }
  const lightStrength = ambience?.wash ? 1 : 0.45;
  for (const light of lights) {
    const pos = gridToScreen(light.gridX, light.gridY);
    const glow = scene.add.image(pos.sx, pos.sy - TILE_H * 0.4, 'fx-light')
      .setDisplaySize(light.radius * 2, light.radius * 1.4)
      .setTint(light.color)
      .setAlpha(light.intensity * lightStrength)
      .setDepth(LIGHT_DEPTH)
      .setBlendMode(Phaser.BlendModes.ADD);
    scene.tweens.add({
      targets: glow,
      alpha: light.intensity * lightStrength * 0.78,
      duration: Phaser.Math.Between(900, 1500),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: Phaser.Math.Between(0, 800),
    });
    objects.push(glow);
  }

  if (ambience?.particles) objects.push(createParticles(scene, ambience.particles, mapSize, gridToScreen));

  if (ambience?.vignette !== false) {
    objects.push(scene.add.image(width / 2, height / 2, 'fx-vignette')
      .setDisplaySize(width, height)
      .setScrollFactor(0)
      .setAlpha(ambience?.vignette ?? 0.55)
      .setDepth(VIGNETTE_DEPTH));
  }

  return {
    destroy: () => {
      scene.tweens.killTweensOf(objects);
      objects.forEach(o => o.destroy());
    },
  };
}

interface ParticleRecipe {
  texture: string;
  tint: number[];
  quantity: number;
  frequency: number;
  lifespan: number;
  speedX: [number, number];
  speedY: [number, number];
  scale: [number, number];
  alpha: [number, number];
  blend: Phaser.BlendModes;
  /** Spawn just above the ground instead of high in the air (for floaters, not fallers). */
  anywhere?: boolean;
}

const PARTICLES: Record<ParticleKind, ParticleRecipe> = {
  dust: { texture: 'fx-dot', tint: [0xf3e2b5, 0xd8c08a], quantity: 1, frequency: 260, lifespan: 9000,
    speedX: [6, 18], speedY: [-4, 4], scale: [0.25, 0.6], alpha: [0.35, 0], blend: Phaser.BlendModes.ADD, anywhere: true },
  motes: { texture: 'fx-dot', tint: [0xfff1c0], quantity: 1, frequency: 420, lifespan: 7000,
    speedX: [-4, 4], speedY: [-8, -2], scale: [0.2, 0.45], alpha: [0.5, 0], blend: Phaser.BlendModes.ADD, anywhere: true },
  fireflies: { texture: 'fx-dot', tint: [0xd9f27a, 0xf3d98a], quantity: 1, frequency: 380, lifespan: 5200,
    speedX: [-10, 10], speedY: [-10, 6], scale: [0.35, 0.7], alpha: [0.9, 0], blend: Phaser.BlendModes.ADD, anywhere: true },
  snow: { texture: 'fx-flake', tint: [0xffffff, 0xdde8f0], quantity: 2, frequency: 120, lifespan: 9000,
    speedX: [-12, 6], speedY: [26, 52], scale: [0.4, 0.9], alpha: [0.85, 0.2], blend: Phaser.BlendModes.NORMAL },
  embers: { texture: 'fx-dot', tint: [0xffa040, 0xff6a2a], quantity: 1, frequency: 300, lifespan: 4200,
    speedX: [-8, 8], speedY: [-30, -12], scale: [0.25, 0.5], alpha: [0.9, 0], blend: Phaser.BlendModes.ADD, anywhere: true },
  spray: { texture: 'fx-dot', tint: [0xe8f4ff], quantity: 1, frequency: 200, lifespan: 2600,
    speedX: [-30, -10], speedY: [-6, 10], scale: [0.2, 0.45], alpha: [0.6, 0], blend: Phaser.BlendModes.ADD, anywhere: true },
  leaves: { texture: 'fx-leaf', tint: [0x6f8a45, 0xa8803a, 0x8a5a2a], quantity: 1, frequency: 700, lifespan: 9000,
    speedX: [10, 30], speedY: [14, 28], scale: [0.6, 1], alpha: [0.9, 0.3], blend: Phaser.BlendModes.NORMAL },
  rain: { texture: 'fx-streak', tint: [0xb8c8d8], quantity: 3, frequency: 60, lifespan: 1400,
    speedX: [-60, -40], speedY: [380, 460], scale: [0.6, 1], alpha: [0.5, 0.2], blend: Phaser.BlendModes.NORMAL },
};

/**
 * Particles live in world space and spawn over the map's own ground, so they
 * never drift across the empty backdrop around the diorama. Falling weather
 * starts high above a random cell and lands roughly on it.
 */
function createParticles(
  scene: Phaser.Scene,
  kind: ParticleKind,
  mapSize: { width: number; height: number },
  gridToScreen: (gx: number, gy: number) => { sx: number; sy: number },
): Phaser.GameObjects.GameObject {
  const r = PARTICLES[kind];
  const fallHeight = r.anywhere ? 0 : (r.speedY[0] + r.speedY[1]) / 2 * r.lifespan / 1000 * 0.75;
  const source = {
    getRandomPoint: (point: Phaser.Types.Math.Vector2Like) => {
      const pos = gridToScreen(Math.random() * mapSize.width - 0.5, Math.random() * mapSize.height - 0.5);
      point.x = pos.sx;
      point.y = pos.sy - (r.anywhere ? Math.random() * 60 : fallHeight);
      return point;
    },
  };
  const area = mapSize.width * mapSize.height;
  const emitter = scene.add.particles(0, 0, r.texture, {
    emitZone: { type: 'random', source } as Phaser.Types.GameObjects.Particles.EmitZoneData,
    quantity: r.quantity,
    frequency: r.frequency * Phaser.Math.Clamp(400 / area, 0.5, 2),
    lifespan: r.lifespan,
    speedX: { min: r.speedX[0], max: r.speedX[1] },
    speedY: { min: r.speedY[0], max: r.speedY[1] },
    scale: { min: r.scale[0], max: r.scale[1] },
    alpha: { start: r.alpha[0], end: r.alpha[1] },
    tint: r.tint,
    blendMode: r.blend,
    maxAliveParticles: 140,
  }).setDepth(PARTICLE_DEPTH);
  // Pre-warm so the map is not empty for the first seconds.
  emitter.fastForward(r.lifespan * 0.8);
  return emitter;
}

function ensureAmbienceTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists('fx-vignette')) return;

  radialTexture(scene, 'fx-light', 128, [[0, 'rgba(255,255,255,1)'], [0.35, 'rgba(255,255,255,0.45)'], [1, 'rgba(255,255,255,0)']]);
  radialTexture(scene, 'fx-dot', 16, [[0, 'rgba(255,255,255,1)'], [0.4, 'rgba(255,255,255,0.7)'], [1, 'rgba(255,255,255,0)']]);

  const vignette = scene.textures.createCanvas('fx-vignette', 256, 256)!;
  const ctx = vignette.context;
  const gradient = ctx.createRadialGradient(128, 128, 70, 128, 128, 182);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.85)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  vignette.refresh();

  const flake = scene.textures.createCanvas('fx-flake', 8, 8)!;
  flake.context.fillStyle = '#ffffff';
  flake.context.beginPath();
  flake.context.arc(4, 4, 2.6, 0, Math.PI * 2);
  flake.context.fill();
  flake.refresh();

  const leaf = scene.textures.createCanvas('fx-leaf', 10, 6)!;
  leaf.context.fillStyle = '#ffffff';
  leaf.context.beginPath();
  leaf.context.ellipse(5, 3, 4.5, 2, 0.5, 0, Math.PI * 2);
  leaf.context.fill();
  leaf.refresh();

  const streak = scene.textures.createCanvas('fx-streak', 2, 14)!;
  streak.context.fillStyle = '#ffffff';
  streak.context.fillRect(0, 0, 2, 14);
  streak.refresh();
}

function radialTexture(scene: Phaser.Scene, key: string, size: number, stops: Array<[number, string]>): void {
  const tex = scene.textures.createCanvas(key, size, size)!;
  const ctx = tex.context;
  const half = size / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  for (const [at, color] of stops) gradient.addColorStop(at, color);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  tex.refresh();
}
