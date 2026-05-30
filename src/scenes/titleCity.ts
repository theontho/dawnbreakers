import Phaser from 'phaser';

export function addTitleCitySilhouette(
  scene: Phaser.Scene,
  width: number,
  height: number,
  baseY: number,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  const buildingBase = Math.min(height - 40, baseY + height * 0.09);
  const palette = [0x17100e, 0x1e1411, 0x241713];

  g.fillStyle(0x130e0d, 1);
  g.fillRect(0, baseY, width, height - baseY);
  drawCityBuildings(g, width, buildingBase, palette, 1);

  g.fillStyle(0x0c0908, 1);
  g.fillEllipse(width / 2, height + height * 0.08, width * 1.5, height * 0.44);

  return g;
}

export function addTitleCityDaylight(
  scene: Phaser.Scene,
  width: number,
  height: number,
  baseY: number,
): Phaser.GameObjects.Container {
  const city = scene.add.container(0, 0);
  const g = scene.add.graphics();
  const buildingBase = Math.min(height - 40, baseY + height * 0.09);
  const palette = [0x856044, 0x9d7450, 0xb4895d];

  g.fillStyle(0x6f503b, 1);
  g.fillRect(0, baseY, width, height - baseY);
  drawCityBuildings(g, width, buildingBase, palette, 0.72, true);

  g.fillStyle(0xffcf86, 0.18);
  g.fillEllipse(width / 2, baseY + height * 0.03, width * 0.9, height * 0.11);
  city.add(g);

  return city;
}

export function addTitleCloud(
  scene: Phaser.Scene,
  x: number,
  y: number,
  scale: number,
  alpha: number,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();

  g.fillStyle(0xf5cf9f, alpha);
  g.fillEllipse(x - 48 * scale, y + 8 * scale, 90 * scale, 26 * scale);
  g.fillEllipse(x, y, 126 * scale, 34 * scale);
  g.fillEllipse(x + 58 * scale, y + 10 * scale, 84 * scale, 24 * scale);

  return g;
}

function drawCityBuildings(
  g: Phaser.GameObjects.Graphics,
  width: number,
  buildingBase: number,
  palette: number[],
  alpha: number,
  addHighlights = false,
): void {
  for (let i = -1; i < Math.ceil(width / 86) + 1; i += 1) {
    const x = i * 86 + (i % 2 === 0 ? 8 : -6);
    const w = 54 + (i % 3) * 12;
    const h = 54 + (i % 4) * 14;
    const roofY = buildingBase - h;

    g.fillStyle(palette[Math.abs(i) % palette.length], alpha);
    g.fillRect(x, roofY, w, h);

    if (addHighlights) {
      g.fillStyle(0xffd58a, 0.34);
      g.fillRect(x + w * 0.12, roofY + 6, w * 0.12, h - 8);
    }

    if (i % 4 === 0) {
      g.fillCircle(x + w / 2, roofY, w * 0.36);
      g.fillRect(x + w * 0.14, roofY, w * 0.72, w * 0.18);
    } else if (i % 5 === 0) {
      g.fillTriangle(x, roofY, x + w / 2, roofY - 24, x + w, roofY);
    }

    if (i % 6 === 0) {
      const minaretX = x + w + 10;
      g.fillRect(minaretX, roofY - 34, 8, h + 34);
      g.fillCircle(minaretX + 4, roofY - 36, 8);
    }
  }
}
