import Phaser from 'phaser';
import { glowBounds } from '../hdr/glowMath';
import { SceneGlows, sceneOccluders, type GlowBody } from '../hdr/sceneGlows';
import { calculateTitleDaylight } from './titleDaylight';
import type { SunriseBackground } from './titleSunrise';

/** At full height the title sun's core is this many times SDR white, as far as the screen allows. */
const SUN_GAIN = 3.2;

/**
 * On an HDR screen, the title sun burns past paper white as it clears the
 * haze: nothing while it is red on the skyline, full strength once its rays
 * are out. Cut along the roofs and minarets it rises behind, and let go
 * while the title and the buttons pass in front of it.
 */
export function glowTitleSun(scene: Phaser.Scene, sunrise: SunriseBackground): void {
  const glows = new SceneGlows(scene);
  const update = () => {
    if (!glows.active) return;
    const x = sunrise.sunCenterX + sunrise.sun.x;
    const y = sunrise.sunCenterY + sunrise.sun.y;
    const daylight = calculateTitleDaylight(y, sunrise.horizonY);
    const sun: GlowBody = {
      x,
      y,
      radius: sunrise.sunRadius,
      color: daylight.sunTint,
      gain: 1 + (SUN_GAIN - 1) * daylight.sunEffectsAlpha,
      bloom: daylight.sunEffectsAlpha,
      lit: 1,
      sunward: 0,
      skyline: sunrise.city.skylineAt,
    };
    glows.update([sun], sceneOccluders(scene, glowBounds(sun)));
  };
  scene.events.on(Phaser.Scenes.Events.POST_UPDATE, update);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.POST_UPDATE, update));
}
