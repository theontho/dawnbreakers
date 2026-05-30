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

/** Width below which we treat the layout as "narrow" (phone-portrait-ish). */
export const NARROW_BREAKPOINT_PX = 760;
/** Aspect ratio above which we treat the layout as portrait. */
export const PORTRAIT_ASPECT_RATIO = 1.05;
/** Margin scaling: percent of the short side for narrow / wide layouts. */
export const NARROW_MARGIN_RATIO = 0.025;
export const WIDE_MARGIN_RATIO = 0.045;
export const NARROW_MARGIN_MIN_PX = 8;
export const NARROW_MARGIN_MAX_PX = 16;
export const WIDE_MARGIN_MIN_PX = 14;
export const WIDE_MARGIN_MAX_PX = 72;
/** Bottom-edge gutter (room for the on-screen action button) by layout. */
export const NARROW_BOTTOM_GUTTER_RATIO = 0.075;
export const NARROW_BOTTOM_GUTTER_MIN_PX = 28;
export const NARROW_BOTTOM_GUTTER_MAX_PX = 44;
export const WIDE_BOTTOM_GUTTER_RATIO = 0.025;
export const WIDE_BOTTOM_GUTTER_MIN_PX = 14;
export const WIDE_BOTTOM_GUTTER_MAX_PX = 24;
/** Reference resolution for `responsiveFont` scaling. */
export const REFERENCE_WIDTH_PX = 1280;
export const REFERENCE_HEIGHT_PX = 720;
export const FONT_SCALE_MIN = 0.68;
export const FONT_SCALE_MAX = 1;

let safeAreaProbe: HTMLDivElement | undefined;

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function isPortraitLayout({ width, height }: LayoutSize): boolean {
  return height > width * PORTRAIT_ASPECT_RATIO;
}

export function isNarrowLayout({ width }: LayoutSize): boolean {
  return width < NARROW_BREAKPOINT_PX;
}

export function responsiveFont(size: number, { width, height }: LayoutSize, min = MIN_BODY_FONT_SIZE): string {
  const scale = clamp(
    Math.min(width / REFERENCE_WIDTH_PX, height / REFERENCE_HEIGHT_PX),
    FONT_SCALE_MIN,
    FONT_SCALE_MAX,
  );
  return `${Math.round(Math.max(MIN_BODY_FONT_SIZE, min, size * scale))}px`;
}

export function buttonFont(size: number, layout: LayoutSize, min = MIN_BUTTON_FONT_SIZE): string {
  return responsiveFont(size, layout, min);
}

export function touchSize(size: number): number {
  return Math.max(MIN_TOUCH_TARGET, Math.round(size));
}

export function responsiveMargin({ width, height }: LayoutSize): number {
  const shortSide = Math.min(width, height);
  if (width <= NARROW_BREAKPOINT_PX) {
    return Math.round(clamp(shortSide * NARROW_MARGIN_RATIO, NARROW_MARGIN_MIN_PX, NARROW_MARGIN_MAX_PX));
  }

  return Math.round(clamp(shortSide * WIDE_MARGIN_RATIO, WIDE_MARGIN_MIN_PX, WIDE_MARGIN_MAX_PX));
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
  if (width <= NARROW_BREAKPOINT_PX) {
    return Math.round(
      clamp(shortSide * NARROW_BOTTOM_GUTTER_RATIO, NARROW_BOTTOM_GUTTER_MIN_PX, NARROW_BOTTOM_GUTTER_MAX_PX),
    );
  }
  return Math.round(
    clamp(shortSide * WIDE_BOTTOM_GUTTER_RATIO, WIDE_BOTTOM_GUTTER_MIN_PX, WIDE_BOTTOM_GUTTER_MAX_PX),
  );
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
