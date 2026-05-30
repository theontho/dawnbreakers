import Phaser from 'phaser';

export interface LayoutSize {
  width: number;
  height: number;
}

export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface SafeLayout extends LayoutSize {
  x: number;
  y: number;
  right: number;
  bottom: number;
  margin: number;
  insets: SafeAreaInsets;
}

export const MIN_TOUCH_TARGET = 44;
export const MIN_BODY_FONT_SIZE = 14;
export const MIN_BUTTON_FONT_SIZE = 16;

let safeAreaProbe: HTMLDivElement | undefined;

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function isPortraitLayout({ width, height }: LayoutSize): boolean {
  return height > width * 1.05;
}

export function isNarrowLayout({ width }: LayoutSize): boolean {
  return width < 760;
}

export function responsiveFont(size: number, { width, height }: LayoutSize, min = MIN_BODY_FONT_SIZE): string {
  const scale = clamp(Math.min(width / 1280, height / 720), 0.68, 1);
  return `${Math.round(Math.max(MIN_BODY_FONT_SIZE, min, size * scale))}px`;
}

export function buttonFont(size: number, layout: LayoutSize, min = MIN_BUTTON_FONT_SIZE): string {
  return responsiveFont(size, layout, min);
}

export function touchSize(size: number): number {
  return Math.max(MIN_TOUCH_TARGET, Math.round(size));
}

export function responsiveMargin({ width, height }: LayoutSize): number {
  if (width <= 760) {
    return Math.round(clamp(Math.min(width, height) * 0.025, 8, 16));
  }

  return Math.round(clamp(Math.min(width, height) * 0.045, 14, 72));
}

export function safeAreaInsets(): SafeAreaInsets {
  const insets = measuredSafeAreaInsets();
  if (typeof document === 'undefined') return insets;

  const rootStyle = getComputedStyle(document.documentElement);
  return {
    ...insets,
    bottom: insets.bottom + cssPx(rootStyle.getPropertyValue('--game-extra-safe-area-bottom')),
  };
}

export function measuredSafeAreaInsets(): SafeAreaInsets {
  if (typeof document === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const style = getComputedStyle(safeAreaProbeElement());
  return {
    top: cssPx(style.paddingTop),
    right: cssPx(style.paddingRight),
    bottom: cssPx(style.paddingBottom),
    left: cssPx(style.paddingLeft),
  };
}

export function safeLayout(size: LayoutSize): SafeLayout {
  const margin = responsiveMargin(size);
  const insets = safeAreaInsets();
  const x = insets.left + margin;
  const y = insets.top + margin;
  const right = size.width - insets.right - margin;
  const bottom = size.height - insets.bottom - margin - bottomEdgeGutter(size);

  return {
    x,
    y,
    right,
    bottom,
    width: Math.max(1, right - x),
    height: Math.max(1, bottom - y),
    margin,
    insets,
  };
}

function bottomEdgeGutter({ width, height }: LayoutSize): number {
  const shortSide = Math.min(width, height);
  if (width <= 760) return Math.round(clamp(shortSide * 0.075, 28, 44));
  return Math.round(clamp(shortSide * 0.025, 14, 24));
}

function cssPx(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function safeAreaProbeElement(): HTMLDivElement {
  if (safeAreaProbe?.isConnected) return safeAreaProbe;

  safeAreaProbe = document.createElement('div');
  safeAreaProbe.style.position = 'fixed';
  safeAreaProbe.style.visibility = 'hidden';
  safeAreaProbe.style.pointerEvents = 'none';
  safeAreaProbe.style.top = '0';
  safeAreaProbe.style.left = '0';
  safeAreaProbe.style.width = '0';
  safeAreaProbe.style.height = '0';
  safeAreaProbe.style.paddingTop = 'env(safe-area-inset-top, 0px)';
  safeAreaProbe.style.paddingRight = 'env(safe-area-inset-right, 0px)';
  safeAreaProbe.style.paddingBottom = 'env(safe-area-inset-bottom, 0px)';
  safeAreaProbe.style.paddingLeft = 'env(safe-area-inset-left, 0px)';
  document.body.appendChild(safeAreaProbe);
  return safeAreaProbe;
}

export function restartSceneOnResize(
  scene: Phaser.Scene,
  getData?: () => Record<string, unknown>,
): void {
  const handleResize = (): void => {
    if (!scene.scene.isActive(scene.scene.key)) return;
    scene.scene.restart(getData?.());
  };

  scene.scale.on(Phaser.Scale.Events.RESIZE, handleResize);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.scale.off(Phaser.Scale.Events.RESIZE, handleResize);
  });
}
