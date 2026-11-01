import Phaser from 'phaser';

/**
 * Wind in the trees: plants lean from their foot a little one way and the
 * other, each on its own rhythm, while gusts come and go across the map from
 * the west, so a grove moves together without moving in step. The lean is
 * set in pixels at the crown, so a tall tree sways as far as a shrub, not
 * ten times farther. Indoors there is no wind.
 */

/** How far the top of a plant moves at most, in pixels. */
const CROWN_TRAVEL = 2.6;
/** The most a small plant leans, in radians. */
const MAX_LEAN = 0.03;

export function swayInTheWind(scene: Phaser.Scene, plants: readonly Phaser.GameObjects.Image[]): void {
  if (plants.length === 0) return;
  const swaying = plants.map(sprite => ({
    sprite,
    lean: Math.min(MAX_LEAN, CROWN_TRAVEL / Math.max(1, sprite.displayHeight)),
    // A rhythm of its own, and the gust reaching it a little after its western neighbours.
    rate: 0.9 + ((Math.imul(Math.round(sprite.x), 2654435761) >>> 0) % 1000) / 2500,
    delay: sprite.x * 0.0025,
  }));
  const sway = () => {
    const t = scene.game.loop.time / 1000;
    for (const { sprite, lean, rate, delay } of swaying) {
      const at = t - delay;
      const gust = 0.55 + 0.45 * Math.sin(at * 0.21) * Math.sin(at * 0.083 + 1.7);
      sprite.setRotation(lean * gust * (0.35 + Math.sin(at * rate * 1.6) * 0.65));
    }
  };
  scene.events.on(Phaser.Scenes.Events.PRE_UPDATE, sway);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.PRE_UPDATE, sway));
}
