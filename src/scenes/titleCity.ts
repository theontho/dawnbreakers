import Phaser from 'phaser';

export type TitleCity = {
  graphics: Phaser.GameObjects.Graphics;
  setLight: (amount: number) => void;
};

const nightPalette: ShirazCityPalette = {
  ground: 0x130e0d,
  foreground: 0x0c0908,
  foothills: 0x100c0b,
  wall: 0x17100e,
  wallShadow: 0x0e0a09,
  buildings: [0x17100e, 0x1e1411, 0x241713, 0x1a110f],
  roof: 0x0f0b0a,
  dome: 0x1d1310,
  highlight: 0x2a1b15,
  garden: 0x080806,
};

const dayPalette: ShirazCityPalette = {
  ground: 0x6f503b,
  foreground: 0x5f3f2e,
  foothills: 0x846143,
  wall: 0xa7784e,
  wallShadow: 0x5f3f2e,
  buildings: [0x856044, 0x9d7450, 0xb4895d, 0xc19563],
  roof: 0x71503a,
  dome: 0xb48255,
  highlight: 0xd1a368,
  garden: 0x20351f,
};

export function addTitleCity(
  scene: Phaser.Scene,
  width: number,
  height: number,
  baseY: number,
): TitleCity {
  const g = scene.add.graphics();
  const cityBase = Math.min(height - 40, baseY + height * 0.09);
  let lastLightAmount = Number.NaN;
  const setLight = (amount: number) => {
    const lightAmount = Phaser.Math.Clamp(amount, 0, 1);

    if (Math.abs(lightAmount - lastLightAmount) < 0.006) return;

    lastLightAmount = lightAmount;
    drawTitleCity(g, width, height, baseY, cityBase, mixPalette(nightPalette, dayPalette, lightAmount));
  };

  setLight(0);

  return { graphics: g, setLight };
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

type ShirazCityPalette = {
  ground: number;
  foreground: number;
  foothills: number;
  wall: number;
  wallShadow: number;
  buildings: number[];
  roof: number;
  dome: number;
  highlight: number;
  garden: number;
};

function drawTitleCity(
  g: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  baseY: number,
  cityBase: number,
  palette: ShirazCityPalette,
): void {
  g.clear();
  g.fillStyle(palette.ground, 1);
  g.fillRect(0, baseY, width, height - baseY);
  drawDistantPlain(g, width, height, baseY, palette);
  drawGardenCypresses(g, width, cityBase, palette);
  drawCourtyardQuarter(g, width, cityBase, palette);
  drawVakilBazaarLine(g, width, cityBase, palette);
  drawMosqueAndMadrasaDomes(g, width, cityBase, palette);
  drawCityWallAndGate(g, width, cityBase, palette);
  drawForegroundRoofs(g, width, height, cityBase, palette);
  g.fillStyle(palette.foreground, 1);
  g.fillEllipse(width / 2, height + height * 0.08, width * 1.5, height * 0.44);
}

function drawDistantPlain(
  g: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  baseY: number,
  palette: ShirazCityPalette,
): void {
  const plainTop = baseY - height * 0.035;

  g.fillStyle(palette.foothills, 1);
  g.beginPath();
  g.moveTo(0, baseY + height * 0.01);
  g.lineTo(0, plainTop + 5);
  g.lineTo(width * 0.18, plainTop + 1);
  g.lineTo(width * 0.46, plainTop + 4);
  g.lineTo(width * 0.72, plainTop);
  g.lineTo(width, plainTop + 3);
  g.lineTo(width, baseY + height * 0.02);
  g.closePath();
  g.fillPath();
}

function drawGardenCypresses(
  g: Phaser.GameObjects.Graphics,
  width: number,
  cityBase: number,
  palette: ShirazCityPalette,
): void {
  const treeBase = cityBase - 18;
  const positions = [
    width * 0.08,
    width * 0.14,
    width * 0.76,
    width * 0.82,
    width * 0.9,
  ];

  g.fillStyle(palette.garden, 1);
  positions.forEach((x, index) => {
    const h = 48 + (index % 3) * 13;
    const w = 17 + (index % 2) * 5;

    g.fillTriangle(x, treeBase - h, x - w, treeBase, x + w, treeBase);
    g.fillRect(x - 2, treeBase - h * 0.1, 4, h * 0.1);
  });

  g.fillStyle(palette.highlight, 1);
  positions.forEach((x, index) => {
    const h = 48 + (index % 3) * 13;
    g.fillTriangle(x - 3, treeBase - h * 0.85, x - 12, treeBase - 8, x - 1, treeBase - 8);
  });
}

function drawCourtyardQuarter(
  g: Phaser.GameObjects.Graphics,
  width: number,
  cityBase: number,
  palette: ShirazCityPalette,
): void {
  const blockWidth = 62;
  const count = Math.ceil(width / blockWidth) + 2;

  for (let i = -1; i < count; i += 1) {
    const x = i * blockWidth + (i % 2 === 0 ? 4 : -9);
    const w = 46 + (Math.abs(i) % 3) * 11;
    const h = 38 + (Math.abs(i + 1) % 4) * 12;
    const roofY = cityBase - h - 16 - (Math.abs(i) % 2) * 6;

    g.fillStyle(palette.buildings[Math.abs(i) % palette.buildings.length]!, 1);
    g.fillRect(x, roofY, w, h);
    drawRoofParapet(g, x, roofY, w, palette);

    if (Math.abs(i) % 4 === 1) {
      drawBadgir(g, x + w * 0.62, roofY, palette);
    }

    g.fillStyle(palette.highlight, 1);
    g.fillRect(x + w * 0.14, roofY + 7, 4, h - 11);
    g.fillStyle(palette.wallShadow, 1);
    g.fillRect(x + w - 8, roofY + 5, 6, h - 8);
  }
}

function drawVakilBazaarLine(
  g: Phaser.GameObjects.Graphics,
  width: number,
  cityBase: number,
  palette: ShirazCityPalette,
): void {
  const y = cityBase - 46;
  const vaultWidth = 42;
  const startX = width * 0.18;
  const endX = width * 0.82;

  for (let x = startX; x < endX; x += vaultWidth * 0.78) {
    g.fillStyle(palette.buildings[1]!, 1);
    g.fillRect(x, y + 12, vaultWidth, 34);
    g.fillCircle(x + vaultWidth / 2, y + 12, vaultWidth / 2);

    g.fillStyle(palette.wallShadow, 1);
    g.fillRect(x + vaultWidth * 0.28, y + 24, vaultWidth * 0.44, 22);

    g.fillStyle(palette.highlight, 1);
    g.fillCircle(x + vaultWidth / 2 - 4, y + 8, vaultWidth * 0.22);
  }
}

function drawMosqueAndMadrasaDomes(
  g: Phaser.GameObjects.Graphics,
  width: number,
  cityBase: number,
  palette: ShirazCityPalette,
): void {
  drawDomedComplex(g, width * 0.36, cityBase - 26, 72, 74, palette);
  drawDomedComplex(g, width * 0.62, cityBase - 32, 86, 88, palette);
  drawMinaret(g, width * 0.29, cityBase - 112, 12, 112, palette);
  drawMinaret(g, width * 0.69, cityBase - 122, 13, 124, palette);
}

function drawDomedComplex(
  g: Phaser.GameObjects.Graphics,
  centerX: number,
  baseY: number,
  width: number,
  height: number,
  palette: ShirazCityPalette,
): void {
  const bodyX = centerX - width / 2;
  const bodyY = baseY - height * 0.5;

  g.fillStyle(palette.buildings[2]!, 1);
  g.fillRect(bodyX, bodyY, width, height * 0.5);
  drawRoofParapet(g, bodyX, bodyY, width, palette);

  g.fillStyle(palette.dome, 1);
  g.fillEllipse(centerX, bodyY, width * 0.74, height * 0.5);
  g.fillRect(centerX - width * 0.27, bodyY, width * 0.54, height * 0.1);

  g.fillStyle(palette.wallShadow, 1);
  g.fillRect(centerX - width * 0.12, bodyY + height * 0.22, width * 0.24, height * 0.28);

  g.fillStyle(palette.highlight, 1);
  g.fillEllipse(centerX - width * 0.12, bodyY - 2, width * 0.28, height * 0.22);
}

function drawMinaret(
  g: Phaser.GameObjects.Graphics,
  x: number,
  topY: number,
  width: number,
  height: number,
  palette: ShirazCityPalette,
): void {
  g.fillStyle(palette.wall, 1);
  g.fillRect(x - width / 2, topY, width, height);
  g.fillCircle(x, topY - width * 0.25, width * 0.72);
  g.fillRect(x - width * 0.7, topY + height * 0.2, width * 1.4, 5);

  g.fillStyle(palette.wallShadow, 1);
  g.fillRect(x + width * 0.15, topY + 8, width * 0.28, height - 10);

  g.fillStyle(palette.highlight, 1);
  g.fillRect(x - width * 0.28, topY + 8, width * 0.18, height - 18);
}

function drawCityWallAndGate(
  g: Phaser.GameObjects.Graphics,
  width: number,
  cityBase: number,
  palette: ShirazCityPalette,
): void {
  const wallTop = cityBase - 36;
  const wallHeight = 42;
  const towerWidth = 22;
  const gateX = width * 0.5;
  const gateWidth = 86;

  g.fillStyle(palette.wall, 1);
  g.fillRect(0, wallTop, width, wallHeight);

  for (let x = -towerWidth; x < width + towerWidth; x += 96) {
    g.fillRect(x, wallTop - 14, towerWidth, wallHeight + 14);
    drawCrenellations(g, x - 2, wallTop - 20, towerWidth + 4, palette);
  }

  drawCrenellations(g, 0, wallTop - 6, width, palette);

  g.fillStyle(palette.wallShadow, 1);
  g.fillRect(gateX - gateWidth / 2, wallTop - 10, gateWidth, wallHeight + 10);
  g.fillStyle(palette.wall, 1);
  g.fillRect(gateX - gateWidth * 0.38, wallTop - 22, gateWidth * 0.76, 26);
  g.fillCircle(gateX, wallTop - 22, gateWidth * 0.38);
  g.fillStyle(palette.wallShadow, 1);
  g.fillRect(gateX - gateWidth * 0.18, wallTop + 8, gateWidth * 0.36, wallHeight - 8);
  g.fillCircle(gateX, wallTop + 8, gateWidth * 0.18);

  g.fillStyle(palette.highlight, 1);
  g.fillRect(0, wallTop + 4, width, 4);
  g.fillRect(gateX - gateWidth * 0.32, wallTop - 18, gateWidth * 0.18, wallHeight + 8);
}

function drawForegroundRoofs(
  g: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  cityBase: number,
  palette: ShirazCityPalette,
): void {
  const rows = [
    { yOffset: 114, blockWidth: 56, xShift: -18, baseWidth: 38, widthStep: 8, baseHeight: 25, heightStep: 7, colorOffset: 1 },
    { yOffset: 82, blockWidth: 68, xShift: 22, baseWidth: 48, widthStep: 9, baseHeight: 28, heightStep: 8, colorOffset: 3 },
    { yOffset: 48, blockWidth: 78, xShift: -6, baseWidth: 54, widthStep: 11, baseHeight: 31, heightStep: 9, colorOffset: 0 },
    { yOffset: 0, blockWidth: 92, xShift: 7, baseWidth: 68, widthStep: 14, baseHeight: 34, heightStep: 11, colorOffset: 2 },
  ];

  rows.forEach((row) => drawForegroundRoofRow(g, width, height, cityBase, palette, row));
}

type ForegroundRoofRow = {
  yOffset: number;
  blockWidth: number;
  xShift: number;
  baseWidth: number;
  widthStep: number;
  baseHeight: number;
  heightStep: number;
  colorOffset: number;
};

function drawForegroundRoofRow(
  g: Phaser.GameObjects.Graphics,
  width: number,
  height: number,
  cityBase: number,
  palette: ShirazCityPalette,
  row: ForegroundRoofRow,
): void {
  const count = Math.ceil(width / row.blockWidth) + 3;

  for (let i = -2; i < count; i += 1) {
    const x = i * row.blockWidth + row.xShift + (i % 2 === 0 ? 0 : -10);
    const w = row.baseWidth + (Math.abs(i) % 3) * row.widthStep;
    const h = row.baseHeight + (Math.abs(i + 2) % 3) * row.heightStep;
    const y = cityBase - h + row.yOffset + (Math.abs(i) % 2) * 5;
    const curveTopY = foregroundCurveTopY(x + w / 2, width, height);

    if (y >= curveTopY - 7) continue;

    g.fillStyle(palette.buildings[Math.abs(i + row.colorOffset) % palette.buildings.length]!, 1);
    g.fillRect(x, y, w, h);
    drawRoofParapet(g, x, y, w, palette);

    g.fillStyle(palette.wallShadow, 1);
    g.fillRect(x + w * 0.38, y + h * 0.35, w * 0.24, h * 0.65);

    g.fillStyle(palette.highlight, 1);
    g.fillRect(x + 8, y + 7, w * 0.18, h - 12);
  }
}

function foregroundCurveTopY(x: number, width: number, height: number): number {
  const radiusX = width * 0.75;
  const radiusY = height * 0.22;
  const centerX = width / 2;
  const centerY = height + height * 0.08;
  const normalizedX = Phaser.Math.Clamp((x - centerX) / radiusX, -1, 1);

  return centerY - radiusY * Math.sqrt(1 - normalizedX * normalizedX);
}

function drawRoofParapet(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  palette: ShirazCityPalette,
): void {
  g.fillStyle(palette.roof, 1);
  g.fillRect(x, y - 5, width, 5);

  for (let merlonX = x + 4; merlonX < x + width - 2; merlonX += 14) {
    g.fillRect(merlonX, y - 10, 7, 6);
  }
}

function drawBadgir(
  g: Phaser.GameObjects.Graphics,
  x: number,
  roofY: number,
  palette: ShirazCityPalette,
): void {
  const width = 15;
  const height = 33;

  g.fillStyle(palette.wall, 1);
  g.fillRect(x - width / 2, roofY - height, width, height);
  g.fillStyle(palette.wallShadow, 1);
  g.fillRect(x - width / 2 + 3, roofY - height + 4, 3, height - 8);
  g.fillRect(x + width / 2 - 6, roofY - height + 4, 3, height - 8);
  drawRoofParapet(g, x - width / 2 - 2, roofY - height, width + 4, palette);

  g.fillStyle(palette.highlight, 1);
  g.fillRect(x - width / 2 + 1, roofY - height + 5, 2, height - 10);
}

function drawCrenellations(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  palette: ShirazCityPalette,
): void {
  g.fillStyle(palette.wall, 1);

  for (let merlonX = x; merlonX < x + width; merlonX += 18) {
    g.fillRect(merlonX, y, 10, 8);
  }
}

function mixPalette(from: ShirazCityPalette, to: ShirazCityPalette, amount: number): ShirazCityPalette {
  return {
    ground: mixColor(from.ground, to.ground, amount),
    foreground: mixColor(from.foreground, to.foreground, amount),
    foothills: mixColor(from.foothills, to.foothills, amount),
    wall: mixColor(from.wall, to.wall, amount),
    wallShadow: mixColor(from.wallShadow, to.wallShadow, amount),
    buildings: from.buildings.map((color, index) => mixColor(color, to.buildings[index] ?? color, amount)),
    roof: mixColor(from.roof, to.roof, amount),
    dome: mixColor(from.dome, to.dome, amount),
    highlight: mixColor(from.highlight, to.highlight, amount),
    garden: mixColor(from.garden, to.garden, amount),
  };
}

function mixColor(from: number, to: number, amount: number): number {
  const fromRgb = Phaser.Display.Color.IntegerToRGB(from);
  const toRgb = Phaser.Display.Color.IntegerToRGB(to);

  return Phaser.Display.Color.GetColor(
    Math.round(Phaser.Math.Linear(fromRgb.r, toRgb.r, amount)),
    Math.round(Phaser.Math.Linear(fromRgb.g, toRgb.g, amount)),
    Math.round(Phaser.Math.Linear(fromRgb.b, toRgb.b, amount)),
  );
}
