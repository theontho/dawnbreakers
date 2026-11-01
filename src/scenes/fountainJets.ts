import Phaser from 'phaser';

/**
 * A fountain's jet, live: the stream rising from its basin and wavering, the
 * water falling back in four arcs with drops running down them, and rings
 * spreading on the pool where they land. Drawn at the basin's mouth (`x`, `y`
 * in the world), at `depth`.
 */

const JET_HEIGHT = 25;
const ARCS = [-12, -7, 7, 12] as const;
const DROPS_PER_ARC = 4;
const RINGS = 3;
/** Seconds a ring takes to spread out and go. */
const RING_LIFE = 1.8;

export function animateFountainJet(scene: Phaser.Scene, x: number, y: number, depth: number): void {
  const g = scene.add.graphics().setDepth(depth);
  const draw = () => {
    const t = scene.game.loop.time / 1000;
    g.clear();
    const mouth = { x, y: y - 9 };
    const top = { x: x + Math.sin(t * 3.1) * 0.6, y: y - 9 - JET_HEIGHT - Math.sin(t * 5.3) * 1.5 - Math.sin(t * 1.7) * 1 };
    // The rings where the drops fall, under the falling water.
    for (let r = 0; r < RINGS; r += 1) {
      const age = ((t / RING_LIFE + r / RINGS) % 1);
      const radius = 7 + age * 11;
      g.lineStyle(1, 0xebf5fa, 0.5 * (1 - age));
      g.strokeEllipse(x, y - 1, radius * 2, radius * 0.9);
    }
    // The stream, a little brighter at its heart.
    g.lineStyle(2.2, 0xe6f2fa, 0.5);
    g.lineBetween(mouth.x, mouth.y, top.x, top.y);
    g.lineStyle(1, 0xffffff, 0.85);
    g.lineBetween(mouth.x, mouth.y, top.x, top.y);
    // The falling arcs and the drops running down them.
    for (const [a, dx] of ARCS.entries()) {
      const land = { x: x + dx, y: y - 4 + Math.abs(dx) * 0.2 };
      const control = { x: top.x + dx * 0.7, y: top.y - 4 };
      const at = (u: number) => {
        const v = 1 - u;
        return { x: v * v * top.x + 2 * v * u * control.x + u * u * land.x, y: v * v * top.y + 2 * v * u * control.y + u * u * land.y };
      };
      g.lineStyle(1, 0xe6f2fa, 0.3 + 0.1 * Math.sin(t * 4 + a));
      g.beginPath();
      g.moveTo(top.x, top.y);
      for (let s = 1; s <= 8; s += 1) {
        const p = at(s / 8);
        g.lineTo(p.x, p.y);
      }
      g.strokePath();
      for (let d = 0; d < DROPS_PER_ARC; d += 1) {
        // Falling faster as they go, as drops do.
        const u = ((t * 0.9 + d / DROPS_PER_ARC + a * 0.17) % 1) ** 1.4;
        const p = at(u);
        g.fillStyle(0xffffff, 0.75 * (1 - u * 0.4));
        g.fillCircle(p.x, p.y, 0.9);
      }
    }
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, draw);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.UPDATE, draw));
}
