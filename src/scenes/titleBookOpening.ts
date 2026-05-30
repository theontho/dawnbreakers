import Phaser from 'phaser';

type Point = { x: number; y: number };

type TitleBookOpeningOptions = {
  width: number;
  height: number;
  content: Phaser.GameObjects.Container;
  onComplete: () => void;
};

export function playTitleBookOpening(
  scene: Phaser.Scene,
  { width, height, content, onComplete }: TitleBookOpeningOptions,
): void {
  const dimmer = scene.add.rectangle(0, 0, width, height, 0x05030a, 0.82)
    .setOrigin(0)
    .setDepth(998);
  const blocker = scene.add.rectangle(0, 0, width, height, 0x000000, 0)
    .setOrigin(0)
    .setDepth(1001)
    .setInteractive();
  const book = scene.add.graphics().setDepth(999);
  const state = { progress: 0 };

  content.setAlpha(0);

  const draw = () => {
    const p = smooth(state.progress);
    const centerX = width / 2;
    const tableY = height * 0.76;
    const bookW = Math.min(width - 28, 980);
    const bookH = Math.min(height - 56, 640);
    const zoom = Phaser.Math.Linear(0.64, 1.08, p);
    const spineW = bookW * Phaser.Math.Linear(0.22, 0.9, p) * zoom;
    const uprightH = bookH * Phaser.Math.Linear(0.78, 0.54, p) * zoom;
    const openDepth = bookH * Phaser.Math.Linear(0.06, 0.58, p) * zoom;
    const lift = bookH * Phaser.Math.Linear(0.72, 0.06, p) * zoom;
    const farY = tableY - lift;
    const nearY = tableY + openDepth * 0.34;
    const coverLean = Phaser.Math.Linear(0.08, 0.44, p) * spineW;

    content.setAlpha(Phaser.Math.Clamp((p - 0.38) / 0.48, 0, 1));
    dimmer.setAlpha(Phaser.Math.Linear(0.82, 0.08, p));

    book.clear();
    drawTable(book, width, height, tableY, p);
    drawBookShadow(book, centerX, tableY, spineW, openDepth, p);
    drawOpenInterior(book, centerX, tableY, spineW, farY, nearY, coverLean, p);
    drawTurningSheets(book, centerX, tableY, spineW, farY, nearY, p);
    drawUprightCover(book, centerX, tableY, spineW, uprightH, farY, coverLean, p);
    drawSpine(book, centerX, tableY, spineW, p);
  };

  draw();

  scene.tweens.add({
    targets: state,
    progress: 1,
    delay: 120,
    duration: 2300,
    ease: 'Sine.easeInOut',
    onUpdate: draw,
    onComplete: () => {
      content.setAlpha(1);
      scene.tweens.add({
        targets: [book, dimmer],
        alpha: 0,
        duration: 320,
        ease: 'Sine.easeOut',
        onComplete: () => {
          book.destroy();
          dimmer.destroy();
          blocker.destroy();
          onComplete();
        },
      });
    },
  });
}

function drawTable(
  g: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  tableY: number,
  progress: number,
): void {
  g.fillStyle(0x07040a, Phaser.Math.Linear(0.58, 0.18, progress));
  g.fillRect(0, tableY, width, height - tableY);
  g.lineStyle(2, 0x8a5c35, Phaser.Math.Linear(0.46, 0.12, progress));
  g.lineBetween(0, tableY, width, tableY);
}

function drawBookShadow(
  g: Phaser.GameObjects.Graphics,
  centerX: number,
  tableY: number,
  spineW: number,
  openDepth: number,
  progress: number,
): void {
  g.fillStyle(0x000000, Phaser.Math.Linear(0.5, 0.22, progress));
  g.fillEllipse(centerX, tableY + openDepth * 0.3 + 20, spineW * 1.1, 46 + openDepth * 0.18);
}

function drawOpenInterior(
  g: Phaser.GameObjects.Graphics,
  centerX: number,
  tableY: number,
  spineW: number,
  farY: number,
  nearY: number,
  coverLean: number,
  progress: number,
): void {
  const alpha = Phaser.Math.Clamp((progress - 0.08) / 0.74, 0, 1);
  if (alpha <= 0) return;

  const left: Point[] = [
    { x: centerX - spineW * 0.06, y: tableY - 4 },
    { x: centerX - spineW * 0.5 - coverLean * 0.12, y: farY },
    { x: centerX - spineW * 0.48 - coverLean, y: nearY },
    { x: centerX - spineW * 0.03, y: tableY + 8 },
  ];
  const right: Point[] = [
    { x: centerX + spineW * 0.06, y: tableY - 4 },
    { x: centerX + spineW * 0.5 + coverLean * 0.12, y: farY },
    { x: centerX + spineW * 0.48 + coverLean, y: nearY },
    { x: centerX + spineW * 0.03, y: tableY + 8 },
  ];

  g.fillStyle(0xf4dfad, 0.66 * alpha);
  g.fillPoints(left, true);
  g.fillStyle(0xe7ca8c, 0.62 * alpha);
  g.fillPoints(right, true);

  g.lineStyle(2, 0xf9eabd, 0.18 * alpha);
  g.strokePoints(insetPage(left, centerX, 0.08), true);
  g.strokePoints(insetPage(right, centerX, 0.08), true);
  g.lineStyle(3, 0x6b4529, 0.34 * alpha);
  g.lineBetween(centerX, tableY - 8, centerX, nearY + 2);
}

function drawTurningSheets(
  g: Phaser.GameObjects.Graphics,
  centerX: number,
  tableY: number,
  spineW: number,
  farY: number,
  nearY: number,
  progress: number,
): void {
  for (let i = 0; i < 6; i += 1) {
    const side = i % 2 === 0 ? 1 : -1;
    const local = Phaser.Math.Clamp((progress - 0.08 - i * 0.07) / 0.62, 0, 1);
    if (local <= 0 || local >= 1) continue;

    const turn = smooth(local);
    const rise = Phaser.Math.Linear(tableY - 16, farY + 18 + i * 4, turn);
    const outerX = centerX + side * spineW * Phaser.Math.Linear(0.08, 0.52 + i * 0.012, turn);
    const lowerX = centerX + side * spineW * Phaser.Math.Linear(0.04, 0.5, turn);
    const lowerY = Phaser.Math.Linear(tableY + 2, nearY - i * 4, turn);
    const alpha = Math.sin(local * Math.PI) * 0.36;

    g.fillStyle(0xf8e8c0, alpha);
    g.fillPoints([
      { x: centerX + side * 8, y: tableY - 8 },
      { x: outerX, y: rise },
      { x: lowerX, y: lowerY },
      { x: centerX + side * 5, y: tableY + 7 },
    ], true);
    g.lineStyle(1, 0x8a6840, alpha * 0.6);
    g.lineBetween(centerX + side * 8, tableY - 8, outerX, rise);
  }
}

function drawUprightCover(
  g: Phaser.GameObjects.Graphics,
  centerX: number,
  tableY: number,
  spineW: number,
  uprightH: number,
  farY: number,
  coverLean: number,
  progress: number,
): void {
  const alpha = Phaser.Math.Clamp(1 - progress * 1.08, 0, 1);
  if (alpha <= 0) return;

  const closedWidth = Phaser.Math.Linear(spineW * 0.5, spineW * 0.18, progress);
  const topY = Phaser.Math.Linear(tableY - uprightH, farY + 8, progress);
  const left: Point = { x: centerX - closedWidth * 0.5 - coverLean * 0.16, y: topY };
  const right: Point = { x: centerX + closedWidth * 0.5 + coverLean * 0.16, y: topY + 8 * progress };
  const bottomRight: Point = { x: centerX + spineW * 0.08, y: tableY };
  const bottomLeft: Point = { x: centerX - spineW * 0.08, y: tableY };

  g.fillStyle(0x21130d, 0.96 * alpha);
  g.fillPoints([left, right, bottomRight, bottomLeft], true);
  g.lineStyle(4, 0xb98342, 0.58 * alpha);
  g.strokePoints([left, right, bottomRight, bottomLeft], true);
  g.lineStyle(2, 0xf3d487, 0.38 * alpha);
  g.lineBetween(left.x + closedWidth * 0.18, topY + 26, right.x - closedWidth * 0.18, topY + 32);
}

function drawSpine(
  g: Phaser.GameObjects.Graphics,
  centerX: number,
  tableY: number,
  spineW: number,
  progress: number,
): void {
  const alpha = Phaser.Math.Linear(0.88, 0.28, progress);
  const thickness = Phaser.Math.Linear(18, 10, progress);

  g.fillStyle(0x3b2517, alpha);
  g.fillRoundedRect(centerX - spineW * 0.5, tableY - thickness * 0.5, spineW, thickness, 8);
  g.lineStyle(2, 0xc28a47, alpha * 0.54);
  g.strokeRoundedRect(centerX - spineW * 0.5, tableY - thickness * 0.5, spineW, thickness, 8);
}

function insetPage(points: Point[], centerX: number, amount: number): Point[] {
  return points.map((point) => ({
    x: Phaser.Math.Linear(point.x, centerX, amount),
    y: point.y + (point.y < points[0].y ? 8 : -8),
  }));
}

function smooth(value: number): number {
  const t = Phaser.Math.Clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}
