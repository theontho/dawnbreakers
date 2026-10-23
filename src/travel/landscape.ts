import Phaser from 'phaser';
import { hashString, mix } from '../assets/art/canvasKit';
import type { SkyCamera } from './skyCamera';
import type { SkyLight } from './skyLight';
import { drawProp } from './landscapeProps';
import { TERRAIN_STYLES, type LandLayer, type PropChance, type TerrainStyle } from './landscapeStyles';
import { lattice, skyline } from './landNoise';
import { paintWater } from './waterPainter';
import type { JourneyTerrain } from '../data/journeys';

/** Where the road and the walkers sit on screen. */
export interface GroundLayout {
  horizonY: number;
  groundHeight: number;
  /** The walkers' feet. */
  roadY: number;
  /** A standing person's height in pixels. */
  figure: number;
}

const OUTLINE_STEP = 6;
const VERGE_PARALLAX = 1.35;
const MOON_LIGHT = 0x6a7aa8;

export function groundLayout(width: number, height: number, horizonY: number): GroundLayout {
  const groundHeight = height - horizonY;
  return {
    horizonY,
    groundHeight,
    // Low on the ground, so heads and shoulders stand against the sky.
    roadY: horizonY + groundHeight * 0.36,
    figure: Math.min(height * 0.12, groundHeight * 0.5, width * 0.15, 120),
  };
}

/**
 * The land the party walks through, as bands of silhouette sliding past at
 * their own parallax: a far range hazed toward the sky, nearer hills with
 * trees, serais and villages on them, the road, and a verge of stones and
 * grass that passes in front of the walkers. Colour follows the light: deep
 * blue silhouettes under the stars, lifted by the moon, warming at dawn.
 */
export class Landscape {
  private readonly back: Phaser.GameObjects.Graphics;
  private readonly front: Phaser.GameObjects.Graphics;
  private readonly style: TerrainStyle;
  private readonly seed: number;
  private readonly flakes: { x: number; y: number; drift: number; size: number }[] = [];
  private lastMs: number | undefined;

  constructor(
    scene: Phaser.Scene,
    private readonly camera: SkyCamera,
    private readonly ground: GroundLayout,
    terrain: Exclude<JourneyTerrain, 'sea'>,
    id: string,
  ) {
    this.style = TERRAIN_STYLES[terrain];
    this.seed = hashString(id);
    this.back = scene.add.graphics();
    this.front = scene.add.graphics().setDepth(20);
    if (this.style.snowfall) {
      for (let i = 0; i < 90; i += 1) {
        this.flakes.push({ x: lattice(this.seed, i) * camera.width, y: lattice(this.seed, i + 500) * camera.height, drift: lattice(this.seed, i + 900), size: 0.8 + lattice(this.seed, i + 1300) * 1.8 });
      }
    }
  }

  /** `scroll` is how far the party has walked, in pixels at the road. */
  draw(scroll: number, light: SkyLight, realMs: number): void {
    this.back.clear();
    this.front.clear();
    const lamp = 1 - light.daylight;
    const far = this.style.layers.length - 1;
    this.style.layers.forEach((layer, index) => {
      const haze = (1 - index / Math.max(1, far)) * 0.4;
      const color = mix(this.lit(layer.night, layer.day, light), light.horizon, haze * (1 - light.daylight * 0.5));
      if (layer.water) {
        const top = this.ground.horizonY + layer.base * this.ground.groundHeight;
        const next = this.style.layers[index + 1];
        const bottom = this.ground.horizonY + (next?.base ?? 1) * this.ground.groundHeight;
        paintWater(this.back, this.camera, light, top, bottom + 8, scroll * layer.parallax, realMs);
      } else {
        this.paintLayer(layer, index, color, scroll, lamp);
      }
    });
    this.paintRoad(scroll, light);
    this.paintVerge(scroll, light, lamp);
    this.paintSnow(realMs);
  }

  private lit(night: number, day: number, light: SkyLight): number {
    return mix(mix(night, MOON_LIGHT, light.moonlight * 0.4), day, Math.pow(light.daylight, 1.3));
  }

  /** The nearest band's colour, which the road's banks and the verge share. */
  private nearColor(light: SkyLight): number {
    const near = this.style.layers[this.style.layers.length - 1]!;
    return this.lit(near.night, near.day, light);
  }

  private outlineY(layer: LandLayer, index: number, screenX: number, scroll: number): number {
    const { horizonY, groundHeight } = this.ground;
    const wavelength = layer.wavelength * this.camera.height;
    const n = skyline(this.seed + index * 7919, (screenX + scroll * layer.parallax) / wavelength, layer.ridged);
    return horizonY + layer.base * groundHeight - layer.rise * groundHeight * n;
  }

  private paintLayer(layer: LandLayer, index: number, color: number, scroll: number, lamp: number): void {
    const { width, height } = this.camera;
    const points: { x: number; y: number }[] = [{ x: -OUTLINE_STEP, y: height }];
    for (let x = -OUTLINE_STEP; x <= width + OUTLINE_STEP; x += OUTLINE_STEP) {
      points.push({ x, y: this.outlineY(layer, index, x, scroll) });
    }
    points.push({ x: width + OUTLINE_STEP, y: height });
    this.back.fillStyle(color, 1);
    this.back.fillPoints(points, true);

    if (!layer.props || !layer.propSpacing) return;
    const spacing = layer.propSpacing * height;
    const size = (layer.propScale ?? 0.5) * this.ground.groundHeight;
    const shift = scroll * layer.parallax;
    const first = Math.floor((shift - size * 2) / spacing);
    const last = Math.ceil((shift + width + size * 2) / spacing);
    for (let cell = first; cell <= last; cell += 1) {
      const seed = this.seed + index * 131 + 17;
      if (lattice(seed, cell) < 0.3) continue;
      const x = cell * spacing + lattice(seed + 1, cell) * spacing - shift;
      const kind = pickProp(layer.props, lattice(seed + 2, cell));
      const foot = this.outlineY(layer, index, x, scroll) + size * 0.03;
      drawProp(this.back, kind, x, foot, size, color, lattice(seed + 3, cell), lamp);
    }
  }

  private paintRoad(scroll: number, light: SkyLight): void {
    const { width, height } = this.camera;
    const { roadY, groundHeight } = this.ground;
    const near = this.nearColor(light);
    const top = roadY - groundHeight * 0.1;
    this.back.fillStyle(mix(near, 0x000000, 0.2), 1);
    this.back.fillRect(0, top, width, height - top);
    const dust = this.lit(this.style.road.night, this.style.road.day, light);
    const roadTop = roadY - groundHeight * 0.06;
    const roadBottom = roadY + groundHeight * 0.07;
    this.back.fillGradientStyle(mix(dust, near, 0.5), mix(dust, near, 0.5), dust, dust, 1);
    this.back.fillRect(0, roadTop, width, roadBottom - roadTop);
    // Ruts and stones in the dust, sliding past at the walkers' pace.
    const step = groundHeight * 0.18;
    for (let k = Math.floor(scroll / step) - 1; k <= Math.ceil((scroll + width) / step) + 1; k += 1) {
      const x = k * step + lattice(this.seed + 41, k) * step - scroll;
      const y = roadTop + lattice(this.seed + 43, k) * (roadBottom - roadTop);
      this.back.fillStyle(mix(dust, 0x000000, 0.35), 0.8);
      this.back.fillEllipse(x, y, groundHeight * (0.02 + lattice(this.seed + 47, k) * 0.03), groundHeight * 0.008);
    }
  }

  private paintVerge(scroll: number, light: SkyLight, lamp: number): void {
    const { width, height } = this.camera;
    const { roadY, groundHeight } = this.ground;
    const color = mix(this.nearColor(light), 0x000000, 0.45);
    const foot = roadY + groundHeight * 0.3;
    this.front.fillStyle(color, 1);
    this.front.fillRect(0, foot, width, height - foot);
    const spacing = groundHeight * 0.6;
    const shift = scroll * VERGE_PARALLAX;
    for (let cell = Math.floor(shift / spacing) - 2; cell <= Math.ceil((shift + width) / spacing) + 2; cell += 1) {
      if (lattice(this.seed + 61, cell) < 0.35) continue;
      const x = cell * spacing + lattice(this.seed + 62, cell) * spacing - shift;
      const kind = pickProp(this.style.verge, lattice(this.seed + 63, cell));
      drawProp(this.front, kind, x, foot + groundHeight * 0.02, groundHeight * 0.55, color, lattice(this.seed + 64, cell), lamp);
    }
  }

  private paintSnow(realMs: number): void {
    if (this.flakes.length === 0) return;
    const delta = Math.min(0.1, ((realMs - (this.lastMs ?? realMs)) / 1000));
    this.lastMs = realMs;
    const { width, height } = this.camera;
    this.front.fillStyle(0xe8eeff, 0.7);
    for (const flake of this.flakes) {
      flake.y += (18 + flake.size * 14) * delta;
      flake.x += (Math.sin(realMs * 0.0007 + flake.drift * 9) * 12 - 22) * delta;
      if (flake.y > height) flake.y -= height + 10;
      if (flake.x < -10) flake.x += width + 20;
      this.front.fillCircle(flake.x, flake.y, flake.size);
    }
  }
}

function pickProp(props: readonly PropChance[], roll: number): PropChance['kind'] {
  const total = props.reduce((sum, p) => sum + p.weight, 0);
  let at = roll * total;
  for (const prop of props) {
    at -= prop.weight;
    if (at <= 0) return prop.kind;
  }
  return props[props.length - 1]!.kind;
}
