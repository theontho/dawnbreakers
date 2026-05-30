import Phaser from 'phaser';

export type TitleDaylightState = {
  colorTemperatureK: number;
  daySkyAlpha: number;
  dawnGlowAlpha: number;
  sunEffectsAlpha: number;
  starAlpha: number;
  cityDayAlpha: number;
  cloudAlpha: number;
  nightWashAlpha: number;
  skyTint: number;
  sunTint: number;
};

export function calculateTitleDaylight(sunCenterY: number, horizonY: number): TitleDaylightState {
  const solarElevationDeg = Phaser.Math.Clamp(((horizonY - sunCenterY) / horizonY) * 90, -18, 90);
  const twilightIntensity = Math.pow(smoothstep(-18, -4, solarElevationDeg), 2.2);
  const directSunIntensity = solarElevationDeg <= 0
    ? 0
    : Math.pow(Math.sin(Phaser.Math.DegToRad(solarElevationDeg)), 0.42);
  const lightIntensity = Phaser.Math.Clamp(twilightIntensity * 0.35 + directSunIntensity * 0.65, 0, 1);
  const colorTemperatureK = 4000
    + smoothstep(0, 30, solarElevationDeg) * 2500
    + smoothstep(30, 70, solarElevationDeg) * 500;
  const daylightColor = cieDaylightColor(colorTemperatureK);
  const colorShift = smoothstep(-6, 16, solarElevationDeg);

  return {
    colorTemperatureK,
    daySkyAlpha: Phaser.Math.Clamp(lightIntensity * 1.12, 0, 1),
    dawnGlowAlpha: Phaser.Math.Clamp(twilightIntensity * (1 - smoothstep(8, 34, solarElevationDeg)), 0, 1),
    sunEffectsAlpha: smoothstep(-3, 14, solarElevationDeg),
    starAlpha: 1 - smoothstep(0.08, 0.32, lightIntensity),
    cityDayAlpha: Phaser.Math.Clamp(lightIntensity * 1.08, 0, 1),
    cloudAlpha: smoothstep(-5, 22, solarElevationDeg),
    nightWashAlpha: 0.12 * (1 - lightIntensity),
    skyTint: mixColor(0xffb06a, daylightColor, colorShift),
    sunTint: mixColor(0xffa65b, daylightColor, smoothstep(2, 28, solarElevationDeg)),
  };
}

function cieDaylightColor(colorTemperatureK: number): number {
  const temperature = Phaser.Math.Clamp(colorTemperatureK, 4000, 25000);
  const x = temperature <= 7000
    ? (-4.607e9 / temperature ** 3) + (2.9678e6 / temperature ** 2) + (0.09911e3 / temperature) + 0.244063
    : (-2.0064e9 / temperature ** 3) + (1.9018e6 / temperature ** 2) + (0.24748e3 / temperature) + 0.23704;
  const y = -3 * x ** 2 + 2.87 * x - 0.275;
  const xyz = xyToXyz(x, y);
  const linear = xyzToLinearSrgb(xyz);
  const normalized = normalizeRgb(linear);

  return rgbToColor(
    gammaCorrect(normalized.r),
    gammaCorrect(normalized.g),
    gammaCorrect(normalized.b),
  );
}

function xyToXyz(x: number, y: number): { x: number; y: number; z: number } {
  return {
    x: x / y,
    y: 1,
    z: (1 - x - y) / y,
  };
}

function xyzToLinearSrgb(xyz: { x: number; y: number; z: number }): { r: number; g: number; b: number } {
  return {
    r: 3.2406 * xyz.x - 1.5372 * xyz.y - 0.4986 * xyz.z,
    g: -0.9689 * xyz.x + 1.8758 * xyz.y + 0.0415 * xyz.z,
    b: 0.0557 * xyz.x - 0.2040 * xyz.y + 1.0570 * xyz.z,
  };
}

function normalizeRgb(rgb: { r: number; g: number; b: number }): { r: number; g: number; b: number } {
  const max = Math.max(rgb.r, rgb.g, rgb.b, 1);

  return {
    r: Phaser.Math.Clamp(rgb.r / max, 0, 1),
    g: Phaser.Math.Clamp(rgb.g / max, 0, 1),
    b: Phaser.Math.Clamp(rgb.b / max, 0, 1),
  };
}

function gammaCorrect(linear: number): number {
  return linear <= 0.0031308
    ? linear * 12.92
    : 1.055 * linear ** (1 / 2.4) - 0.055;
}

function mixColor(from: number, to: number, amount: number): number {
  const clamped = Phaser.Math.Clamp(amount, 0, 1);
  const fromRgb = Phaser.Display.Color.IntegerToRGB(from);
  const toRgb = Phaser.Display.Color.IntegerToRGB(to);

  return rgbToColor(
    Phaser.Math.Linear(fromRgb.r / 255, toRgb.r / 255, clamped),
    Phaser.Math.Linear(fromRgb.g / 255, toRgb.g / 255, clamped),
    Phaser.Math.Linear(fromRgb.b / 255, toRgb.b / 255, clamped),
  );
}

function rgbToColor(r: number, g: number, b: number): number {
  return Phaser.Display.Color.GetColor(
    Math.round(Phaser.Math.Clamp(r, 0, 1) * 255),
    Math.round(Phaser.Math.Clamp(g, 0, 1) * 255),
    Math.round(Phaser.Math.Clamp(b, 0, 1) * 255),
  );
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const x = Phaser.Math.Clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return x * x * (3 - 2 * x);
}
