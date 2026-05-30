import Phaser from 'phaser';

type RayBand = {
  targetX: number;
  targetY: number;
  width: number;
  length: number;
  alpha: number;
};

const RAY_BANDS: RayBand[] = [
  { targetX: 0.08, targetY: -0.12, width: 0.28, length: 1.9, alpha: 0.044 },
  { targetX: 0.31, targetY: -0.08, width: 0.22, length: 1.75, alpha: 0.052 },
  { targetX: 0.66, targetY: -0.1, width: 0.26, length: 1.85, alpha: 0.048 },
  { targetX: 0.93, targetY: -0.04, width: 0.22, length: 1.8, alpha: 0.038 },
  { targetX: 0.17, targetY: 0.45, width: 0.18, length: 1.55, alpha: 0.03 },
  { targetX: 0.48, targetY: 0.56, width: 0.24, length: 1.6, alpha: 0.034 },
  { targetX: 0.83, targetY: 0.48, width: 0.2, length: 1.55, alpha: 0.028 },
  { targetX: 0.28, targetY: 1.16, width: 0.2, length: 1.45, alpha: 0.026 },
  { targetX: 0.72, targetY: 1.14, width: 0.22, length: 1.48, alpha: 0.024 },
];

export function drawTitleSunRays(
  rays: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  sunX: number,
  sunY: number,
  color: number,
  alpha: number,
): void {
  rays.clear();
  if (alpha <= 0) return;

  const maxDistance = Math.hypot(width, height) * 1.3;
  for (const ray of RAY_BANDS) {
    drawRayBand(rays, width, height, sunX, sunY, maxDistance * ray.length, ray, color, alpha);
  }

  rays.fillStyle(color, alpha * 0.08);
  rays.fillCircle(sunX, sunY, Math.min(width, height) * 0.46);
}

function drawRayBand(
  rays: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  sunX: number,
  sunY: number,
  distance: number,
  ray: RayBand,
  color: number,
  alpha: number,
): void {
  const target = new Phaser.Math.Vector2(ray.targetX * width, ray.targetY * height);
  const direction = target.clone().subtract(new Phaser.Math.Vector2(sunX, sunY)).normalize();
  const perpendicular = new Phaser.Math.Vector2(-direction.y, direction.x);
  const center = pointOnRay(sunX, sunY, direction, distance);
  const halfWidth = Math.min(width, height) * ray.width;
  const left = center.clone().add(perpendicular.clone().scale(halfWidth));
  const right = center.clone().subtract(perpendicular.clone().scale(halfWidth));

  rays.fillStyle(color, alpha * ray.alpha);
  rays.beginPath();
  rays.moveTo(sunX, sunY);
  rays.lineTo(left.x, left.y);
  rays.lineTo(right.x, right.y);
  rays.closePath();
  rays.fillPath();
}

function pointOnRay(
  x: number,
  y: number,
  direction: Phaser.Math.Vector2,
  distance: number,
): Phaser.Math.Vector2 {
  return new Phaser.Math.Vector2(
    x + direction.x * distance,
    y + direction.y * distance,
  );
}
