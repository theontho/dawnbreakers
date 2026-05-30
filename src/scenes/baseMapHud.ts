import Phaser from 'phaser';

export function shouldShowMobileControls({ width, height }: { width: number; height: number }): boolean {
  return width <= 640 || (width <= 760 && height <= 520);
}

export function drawMobileMoveArrow(arrow: Phaser.GameObjects.Graphics, color: number): void {
  arrow.clear();
  arrow.fillStyle(color, 1);
  arrow.beginPath();
  arrow.moveTo(0, -11);
  arrow.lineTo(9, 9);
  arrow.lineTo(0, 5);
  arrow.lineTo(-9, 9);
  arrow.closePath();
  arrow.fillPath();
}
