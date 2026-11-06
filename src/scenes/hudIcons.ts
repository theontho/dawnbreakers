import type Phaser from 'phaser';

/**
 * The map's corner buttons drawn as small line pictures in the HUD's gold:
 * a gear for the settings, an open journal with its ribbon, and a lantern
 * for showing who and what can be spoken to. Each is drawn about (0, 0)
 * to fit a box `size` across.
 */

export type HudIcon = 'settings' | 'journal' | 'highlight';

type G = Phaser.GameObjects.Graphics;

export function drawHudIcon(g: G, icon: HudIcon, size: number, color: number, back: number): void {
  g.clear();
  const s = size / 44;
  if (icon === 'settings') gear(g, s, color, back);
  else if (icon === 'journal') journal(g, s, color, back);
  else lantern(g, s, color, back);
}

/** A gear of eight square-cut teeth round a ring, the hub open. */
function gear(g: G, s: number, color: number, back: number): void {
  const teeth = 8;
  const outer = 13 * s;
  const inner = 10 * s;
  const points: Phaser.Types.Math.Vector2Like[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    const half = (Math.PI / teeth) * 0.42;
    const step = (Math.PI * 2) / teeth;
    points.push(at(inner, a - half * 1.25), at(outer, a - half), at(outer, a + half), at(inner, a + half * 1.25), at(inner, a + step / 2));
  }
  g.fillStyle(color, 1).fillPoints(points, true);
  g.fillStyle(back, 1).fillCircle(0, 0, 5.2 * s);
  g.lineStyle(1.6 * s, color, 1).strokeCircle(0, 0, 2.2 * s);
}

/** A journal lying open: two pages bowed at the spine, lines of writing, a ribbon hanging from the foot. */
function journal(g: G, s: number, color: number, back: number): void {
  const w = 14 * s;
  const top = -9 * s;
  const foot = 9 * s;
  const page = (side: -1 | 1) => [
    { x: 0, y: top + 2 * s },
    { x: side * w * 0.5, y: top - 1 * s },
    { x: side * w, y: top + 0.5 * s },
    { x: side * w, y: foot },
    { x: side * w * 0.5, y: foot - 1.5 * s },
    { x: 0, y: foot + 1.5 * s },
  ];
  g.fillStyle(color, 1).fillPoints(page(-1), true).fillPoints(page(1), true);
  // The writing, in the button's colour, and the gutter between the pages.
  g.lineStyle(1.3 * s, back, 1);
  for (const side of [-1, 1] as const) {
    for (let i = 0; i < 4; i++) {
      const y = top + (4 + i * 3.6) * s;
      const x0 = side * 3 * s;
      const x1 = side * (w - 3 * s) * (i === 3 ? 0.6 : 1);
      g.lineBetween(x0, y, x1, y);
    }
  }
  g.lineStyle(1.4 * s, back, 1).lineBetween(0, top + 2 * s, 0, foot + 1.5 * s);
  // The ribbon.
  g.fillStyle(color, 1).fillPoints([
    { x: 3 * s, y: foot - 1 * s },
    { x: 6 * s, y: foot - 1 * s },
    { x: 6 * s, y: foot + 6 * s },
    { x: 4.5 * s, y: foot + 4.5 * s },
    { x: 3 * s, y: foot + 6 * s },
  ], true);
}

/** A lantern with its ring and cap, glass panes either side of the flame, and the light round it. */
function lantern(g: G, s: number, color: number, back: number): void {
  g.lineStyle(1.6 * s, color, 1).strokeCircle(0, -13 * s, 2.4 * s);
  // Cap and base.
  g.fillStyle(color, 1)
    .fillPoints([{ x: -6 * s, y: -7 * s }, { x: 0, y: -11 * s }, { x: 6 * s, y: -7 * s }], true)
    .fillRect(-6.5 * s, -7.5 * s, 13 * s, 2 * s)
    .fillRect(-6.5 * s, 7 * s, 13 * s, 2.4 * s)
    .fillRect(-4.5 * s, 9.4 * s, 9 * s, 1.6 * s);
  // The cage: its frame, the glass dark, a single flame burning inside.
  g.fillRect(-6 * s, -5.5 * s, 12 * s, 12.5 * s);
  g.fillStyle(back, 1).fillRect(-4.2 * s, -3.8 * s, 8.4 * s, 9.2 * s);
  g.fillStyle(color, 1)
    .fillEllipse(0, 2.2 * s, 4.4 * s, 5 * s)
    .fillTriangle(-1.9 * s, 1.2 * s, 1.9 * s, 1.2 * s, 0, -3.2 * s);
  // Rays of its light.
  g.lineStyle(1.6 * s, color, 1);
  for (const a of [-0.35, 0, 0.35]) {
    for (const side of [-1, 1]) {
      const angle = side < 0 ? Math.PI + a : a;
      g.lineBetween(Math.cos(angle) * 10 * s, Math.sin(angle) * 10 * s + 0.5 * s, Math.cos(angle) * 14 * s, Math.sin(angle) * 14 * s + 0.5 * s);
    }
  }
}

function at(r: number, a: number): Phaser.Types.Math.Vector2Like {
  return { x: Math.cos(a) * r, y: Math.sin(a) * r };
}
