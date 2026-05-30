import Phaser from 'phaser';

export interface RevealTarget {
  x: number;
  y: number;
  depth: number;
  radius: number;
}

export interface RevealMaskState {
  sprite: Phaser.GameObjects.Image;
  bounds: Phaser.Geom.Rectangle;
  staticReveals: RevealTarget[];
  textureKey?: string;
  texture?: Phaser.Textures.CanvasTexture;
  context?: CanvasRenderingContext2D;
  maskObject?: Phaser.GameObjects.Image;
  maskShape?: Phaser.GameObjects.Graphics;
  dynamicReveal?: RevealTarget;
}

export function revealTargetForSprite(
  sprite: Phaser.GameObjects.Image,
  radiusScale: number,
  minRadius: number,
  maxRadius: number,
): RevealTarget {
  const bounds = sprite.getBounds();
  return {
    x: bounds.centerX,
    y: bounds.centerY,
    depth: sprite.depth,
    radius: Phaser.Math.Clamp(Math.max(bounds.width, bounds.height) * radiusScale, minRadius, maxRadius),
  };
}

export function createSoftRevealMaskState(
  scene: Phaser.Scene,
  sprite: Phaser.GameObjects.Image,
  bounds: Phaser.Geom.Rectangle,
  staticReveals: RevealTarget[],
  textureKey: string,
): RevealMaskState | undefined {
  const width = Math.max(1, Math.ceil(bounds.width));
  const height = Math.max(1, Math.ceil(bounds.height));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    console.warn('Could not create interactable reveal mask canvas context');
    return undefined;
  }

  const texture = scene.textures.addCanvas(textureKey, canvas);
  if (!texture) {
    console.warn(`Could not create interactable reveal mask texture: ${textureKey}`);
    return undefined;
  }

  const maskObject = scene.make.image({
    x: bounds.centerX,
    y: bounds.centerY,
    key: textureKey,
    add: false,
  }).setOrigin(0.5);

  const mask = maskObject.createBitmapMask();
  mask.invertAlpha = true;
  sprite.setMask(mask);

  return { sprite, bounds, staticReveals, textureKey, texture, context, maskObject };
}

export function createHardRevealMaskState(
  scene: Phaser.Scene,
  sprite: Phaser.GameObjects.Image,
  bounds: Phaser.Geom.Rectangle,
  staticReveals: RevealTarget[],
): RevealMaskState {
  const maskShape = scene.add.graphics().setVisible(false);
  const mask = maskShape.createGeometryMask();
  mask.setInvertAlpha(true);
  sprite.setMask(mask);
  return { sprite, bounds, staticReveals, maskShape };
}

export function redrawRevealMaskState(state: RevealMaskState, reveals: RevealTarget[]): void {
  if (state.context && state.texture) {
    state.context.clearRect(0, 0, state.context.canvas.width, state.context.canvas.height);
    for (const reveal of reveals) {
      drawSoftRevealCircle(state.context, state.bounds, reveal);
    }
    state.texture.refresh();
    return;
  }

  state.maskShape?.clear();
  state.maskShape?.fillStyle(0xffffff, 1);
  for (const reveal of reveals) {
    state.maskShape?.fillCircle(reveal.x, reveal.y, reveal.radius);
  }
}

export function circleIntersectsRect(
  circleX: number,
  circleY: number,
  radius: number,
  rect: Phaser.Geom.Rectangle,
): boolean {
  const nearestX = Phaser.Math.Clamp(circleX, rect.left, rect.right);
  const nearestY = Phaser.Math.Clamp(circleY, rect.top, rect.bottom);
  const dx = circleX - nearestX;
  const dy = circleY - nearestY;
  return dx * dx + dy * dy <= radius * radius;
}

function drawSoftRevealCircle(
  context: CanvasRenderingContext2D,
  bounds: Phaser.Geom.Rectangle,
  reveal: RevealTarget,
): void {
  const localX = reveal.x - bounds.left;
  const localY = reveal.y - bounds.top;
  const gradient = context.createRadialGradient(localX, localY, 0, localX, localY, reveal.radius);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
  gradient.addColorStop(0.52, 'rgba(255, 255, 255, 0.82)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  context.fillStyle = gradient;
  context.fillRect(
    Math.floor(localX - reveal.radius),
    Math.floor(localY - reveal.radius),
    Math.ceil(reveal.radius * 2),
    Math.ceil(reveal.radius * 2),
  );
}
