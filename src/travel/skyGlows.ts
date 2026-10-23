import type Phaser from 'phaser';
import { glowBounds, smoothstep, type Rect } from '../hdr/glowMath';
import { SceneGlows, sceneOccluders, type GlowBody } from '../hdr/sceneGlows';
import type { JourneyHud } from './journeyHud';
import type { Party } from './party';
import { SUN_COLOR, type SkyPainter } from './skyPainter';
import type { SkyLight } from './skyLight';

/** The sun high up and a full moon at night, in multiples of SDR white, as far as the screen allows. */
const SUN_GAIN = 3.2;
const MOON_GAIN = 3;

/** Anything that stands up from the horizon: the hills, or the sea and its ship. */
interface Skyline {
  skylineAt(x: number): number;
}

/**
 * On an HDR screen, the journey's sun and moon shine past paper white: the
 * sun reddened and dim on the horizon and full once it is up, the moon by
 * its phase and only by night. Each is cut along the hills, the ship or the
 * party it sinks behind, dimmed under the shade of the words at the top,
 * and let go while a button passes over it.
 */
export class SkyGlows {
  private readonly glows: SceneGlows;
  private partyBounds: { left: number; right: number; top: number } | undefined;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly sky: SkyPainter,
    private readonly land: Skyline,
    private readonly party: Party | undefined,
    private readonly hud: JourneyHud,
  ) {
    this.glows = new SceneGlows(scene);
  }

  update(light: SkyLight, timeBlur: number): void {
    if (!this.glows.active) return;
    this.partyBounds = this.party?.bounds();
    const bodies: GlowBody[] = [];
    const { sunDisc, moonDisc } = this.sky;
    if (sunDisc) {
      const up = smoothstep(-1, 8, light.sunAltitude);
      bodies.push(this.body({ ...sunDisc, color: SUN_COLOR, gain: 1 + (SUN_GAIN - 1) * up, bloom: up, lit: 1, sunward: 0 }, 1 - timeBlur));
    }
    if (moonDisc) {
      const night = 1 - light.daylight;
      const strength = night * smoothstep(-1, 4, light.moonAltitude);
      bodies.push(this.body({
        ...moonDisc,
        gain: 1 + (MOON_GAIN - 1) * strength,
        bloom: moonDisc.lit * strength,
      }, moonDisc.alpha * (1 - timeBlur)));
    }
    const boxes = bodies.map(glowBounds);
    const area = boxes.length > 0 ? boxes.reduce(union) : undefined;
    this.glows.update(bodies, area ? sceneOccluders(this.scene, area) : []);
  }

  private body(disc: Omit<GlowBody, 'skyline' | 'fade'>, fade: number): GlowBody {
    return { ...disc, skyline: this.skyline, fade: fade * (1 - this.hud.shadeAt(disc.y)) };
  }

  /** The land at column x, or the heads of the party where they walk. */
  private readonly skyline = (x: number): number => {
    const land = this.land.skylineAt(x);
    const party = this.partyBounds;
    return party && x > party.left && x < party.right ? Math.min(land, party.top) : land;
  };
}

function union(a: Rect, b: Rect): Rect {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return { x, y, width: Math.max(a.x + a.width, b.x + b.width) - x, height: Math.max(a.y + a.height, b.y + b.height) - y };
}
