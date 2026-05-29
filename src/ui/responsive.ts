import Phaser from 'phaser';

export interface LayoutSize {
  width: number;
  height: number;
}

export const MIN_TOUCH_TARGET = 44;
export const MIN_BODY_FONT_SIZE = 14;
export const MIN_BUTTON_FONT_SIZE = 16;

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
  return Math.round(clamp(Math.min(width, height) * 0.045, 14, 72));
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
