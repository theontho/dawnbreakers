import Phaser from 'phaser';
import { SHIP, toScreen } from './shipHullPlan';

/**
 * The ship's moving water, drawn live over the sea and under the hull: the
 * wake streaming away astern, each streak born at the transom, spreading and
 * fading as the sea carries it off, and the bow wave heaping under the
 * forefoot and peeling back along her side in a rhythm of its own. Drawn in
 * the ship's own screen frame, which is the map's from its origin.
 */

const D = SHIP.freeboard;
/** Cells a second the wake falls astern: the speed she makes through the water. */
const WAKE_SPEED = 0.55;
/** How far astern a streak runs before it is gone, in cells. */
const WAKE_REACH = 6;
const STREAKS = 16;
const BOW_STREAKS = 6;

/** A fixed random number for streak `i`'s property `k`, 0 to 1. */
function seeded(i: number, k: number): number {
  const h = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return h - Math.floor(h);
}

export function animateShipWake(scene: Phaser.Scene, origin: { x: number; y: number }): void {
  const graphics = scene.add.graphics().setPosition(origin.x, origin.y);
  // Under the hull, which sorts from the map's first row, and over the sea.
  graphics.setDepth(origin.y - 1);
  const draw = () => {
    const t = scene.game.loop.time / 1000;
    graphics.clear();
    drawWake(graphics, t);
    drawBowWave(graphics, t);
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, draw);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.UPDATE, draw));
}

/** Pale streaks fanning out astern, each carried off and fading, then born again at the transom. */
function drawWake(g: Phaser.GameObjects.Graphics, t: number): void {
  for (let i = 0; i < STREAKS; i += 1) {
    const side = i % 2 ? 1 : -1;
    const life = WAKE_REACH / WAKE_SPEED;
    const age = ((t + seeded(i, 0) * life) % life) / life;
    const back = age * WAKE_REACH;
    const spread = (0.3 + seeded(i, 1) * 1.6) * (0.35 + age);
    const length = 1.2 + seeded(i, 2) * 1.8;
    const from = toScreen(SHIP.sternWater - 0.3 - back, SHIP.axis + side * spread * 0.55, -D);
    const to = toScreen(SHIP.sternWater - 0.3 - back - length, SHIP.axis + side * spread, -D);
    const fade = Math.sin(Math.PI * Math.min(1, age * 1.25)) * (1 - age * 0.6);
    const alpha = (0.12 + seeded(i, 3) * 0.16) * fade;
    if (alpha < 0.01) continue;
    const bend = (seeded(i, 4) - 0.5) * 10 + Math.sin(t * 0.9 + i) * 2;
    g.lineStyle(0.8 + seeded(i, 5) * 1.4, 0xc8d7e1, alpha);
    g.beginPath();
    curve(g, from, { x: (from.x + to.x) / 2 + bend, y: (from.y + to.y) / 2 }, to);
    g.strokePath();
  }
}

/** White water piling under the forefoot and peeling away down the near side, breathing as she pitches. */
function drawBowWave(g: Phaser.GameObjects.Graphics, t: number): void {
  const fore = toScreen(SHIP.stemWater, SHIP.axis, -D);
  const pitch = 0.5 + 0.5 * Math.sin(t * 1.3);
  for (let k = 0; k < BOW_STREAKS; k += 1) {
    // Each peel runs back from the stem and is renewed, out of step with its neighbours.
    const phase = ((t * 0.45 + seeded(k, 6)) % 1);
    const back = (2.5 + seeded(k, 7) * 3.5) * (0.55 + 0.45 * phase);
    const out = 1.4 + seeded(k, 8) * 2.2 * (0.7 + 0.3 * pitch);
    const end = toScreen(SHIP.stemWater - back, SHIP.axis + out + 1.6, -D);
    const mid = toScreen(SHIP.stemWater - back * 0.4, SHIP.axis + 1.4, -D);
    const alpha = (0.18 + seeded(k, 9) * 0.25) * Math.sin(Math.PI * phase) * (0.75 + 0.25 * pitch);
    if (alpha < 0.01) continue;
    g.lineStyle(1 + seeded(k, 10) * 2, 0xe1ebf0, alpha);
    g.beginPath();
    curve(g, { x: fore.x + 2, y: fore.y }, { x: mid.x, y: mid.y + 2 }, end);
    g.strokePath();
  }
  g.fillStyle(0xe6eef2, 0.45 + 0.2 * pitch);
  g.fillEllipse(fore.x + 3, fore.y + 1, 18 + 4 * pitch, 6.4 + 1.2 * pitch);
}

/** A quadratic curve from `a` through control `c` to `b`, as line segments. */
function curve(g: Phaser.GameObjects.Graphics, a: { x: number; y: number }, c: { x: number; y: number }, b: { x: number; y: number }): void {
  const steps = 8;
  g.moveTo(a.x, a.y);
  for (let s = 1; s <= steps; s += 1) {
    const u = s / steps;
    const v = 1 - u;
    g.lineTo(v * v * a.x + 2 * v * u * c.x + u * u * b.x, v * v * a.y + 2 * v * u * c.y + u * u * b.y);
  }
}
