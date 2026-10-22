import Phaser from 'phaser';
import { localizedStyle, rtl, t, textOriginX } from '../i18n';
import { buttonFont, isNarrowLayout, MIN_TOUCH_TARGET, responsiveFont, safeLayout, touchSize } from '../ui/responsive';

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

export interface BaseMapHudHandles {
  titleText: Phaser.GameObjects.Text;
  promptText: Phaser.GameObjects.Text;
  exitPromptText: Phaser.GameObjects.Text;
  mobileControls?: Phaser.GameObjects.Container;
  mobileActionButton?: Phaser.GameObjects.Rectangle;
  mobileActionLabel?: Phaser.GameObjects.Text;
}

interface MobileDirection {
  dx: number;
  dy: number;
}

interface BaseMapHudActions {
  openSettings: () => void;
  openJournal: () => void;
  toggleInteractableHighlights: () => void;
  triggerInteraction: () => void;
  setMobileMoveDirection: (direction: MobileDirection | undefined) => void;
  getMobileMoveDirection: () => MobileDirection | undefined;
}

export function createBaseMapHud(
  scene: Phaser.Scene,
  width: number,
  height: number,
  sceneTitle: string,
  actions: BaseMapHudActions,
): BaseMapHudHandles {
  const UI_DEPTH = 10000;
  const size = { width, height };
  const safe = safeLayout(size);
  const narrow = isNarrowLayout(size);
  const buttonY = safe.y;
  const buttonSize = MIN_TOUCH_TARGET;
  const buttonGap = narrow ? 5 : 8;
  const buttonBlockW = buttonSize * 3 + buttonGap * 2;
  const titleW = narrow ? Math.max(72, safe.width - buttonBlockW - 12) : safe.width * 0.42;
  const mobileControlsEnabled = shouldShowMobileControls(size);
  const mobileControlSize = touchSize(width <= 380 ? 48 : 52);
  const mobileControlsTop = safe.bottom - mobileControlSize * 3 - 12;
  const promptY = mobileControlsEnabled ? Math.max(safe.y + 140, mobileControlsTop - 24) : safe.bottom - 22;
  const centerX = safe.x + safe.width / 2;
  let hudTooltip: Phaser.GameObjects.Container | undefined;

  const hideHudTooltip = (): void => {
    hudTooltip?.destroy(true);
    hudTooltip = undefined;
  };
  const showHudTooltip = (x: number, y: number, label: string): void => {
    hideHudTooltip();
    const text = scene.add.text(0, 0, label, localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(13, scene.scale),
      color: '#f3e2b5',
    })).setScrollFactor(0);
    const bounds = text.getBounds();
    const w = bounds.width + 18;
    const h = bounds.height + 10;
    const tooltipX = Phaser.Math.Clamp(x - w, safe.x, safe.right - w);
    const tooltipY = Phaser.Math.Clamp(y, safe.y, safe.bottom - h);
    text.setPosition(rtl ? tooltipX + w - 9 : tooltipX + 9, tooltipY + 5).setOrigin(textOriginX(0), 0);
    const bg = scene.add.rectangle(tooltipX, tooltipY, w, h, 0x0a0806, 0.96)
      .setOrigin(0)
      .setScrollFactor(0)
      .setStrokeStyle(1, 0xf3d98a, 0.8);
    hudTooltip = scene.add.container(0, 0, [bg, text]).setScrollFactor(0).setDepth(10020);
  };

  const titleX = rtl ? safe.right : safe.x;
  const titleText = scene.add.text(titleX, safe.y, t(sceneTitle), localizedStyle({
    fontFamily: 'Georgia, serif', fontSize: responsiveFont(narrow ? 16 : 18, size), color: '#e8d9b0',
    wordWrap: { width: titleW },
  })).setOrigin(textOriginX(0), 0).setScrollFactor(0).setDepth(UI_DEPTH);
  const buttonStart = rtl ? safe.x : safe.right - buttonSize;
  const buttonStep = rtl ? buttonSize + buttonGap : -(buttonSize + buttonGap);
  makeHudIconButton(scene, buttonStart, buttonY, buttonSize, '⚙︎', 'Esc', 'Settings', actions.openSettings, showHudTooltip, hideHudTooltip).setScrollFactor(0).setDepth(UI_DEPTH);
  makeHudIconButton(scene, buttonStart + buttonStep, buttonY, buttonSize, '◫', 'J', 'Journal', actions.openJournal, showHudTooltip, hideHudTooltip).setScrollFactor(0).setDepth(UI_DEPTH);
  makeHudIconButton(scene, buttonStart + buttonStep * 2, buttonY, buttonSize, '◎', 'H / Tab', 'Highlight', actions.toggleInteractableHighlights, showHudTooltip, hideHudTooltip).setScrollFactor(0).setDepth(UI_DEPTH);

  const promptText = scene.add.text(centerX, promptY, '', localizedStyle({
    fontFamily: 'Georgia, serif', fontSize: responsiveFont(18, size, 13), color: '#f3d98a',
    backgroundColor: '#00000099',
    padding: { x: 12, y: 7 },
    align: 'center',
    wordWrap: { width: safe.width },
  }, 'center')).setOrigin(0.5).setScrollFactor(0).setDepth(UI_DEPTH).setVisible(false);

  const exitPromptText = scene.add.text(centerX, promptY - 28, '', localizedStyle({
    fontFamily: 'Georgia, serif', fontSize: responsiveFont(15, size, 12), color: '#c9a55c', fontStyle: 'italic',
    backgroundColor: '#00000088',
    padding: { x: 10, y: 6 },
    align: 'center',
    wordWrap: { width: safe.width },
  }, 'center')).setOrigin(0.5).setScrollFactor(0).setDepth(UI_DEPTH).setVisible(false);

  return {
    titleText,
    promptText,
    exitPromptText,
    ...(mobileControlsEnabled ? createMobileControls(scene, width, height, UI_DEPTH + 5, actions) : {}),
  };
}

function makeHudIconButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  size: number,
  icon: string,
  hotkey: string,
  label: string,
  onClick: () => void,
  showTooltip: (x: number, y: number, label: string) => void,
  hideTooltip: () => void,
): Phaser.GameObjects.Container {
  const rect = scene.add.rectangle(x, y, size, size, 0x1a120a, 0.92)
    .setOrigin(0)
    .setScrollFactor(0)
    .setStrokeStyle(1, 0x5a4428, 1)
    .setInteractive({ useHandCursor: true })
    .on('pointerover', () => {
      rect.setStrokeStyle(1, 0xf3d98a, 1);
      text.setColor('#fff1c0');
      showTooltip(x + size, y + size + 6, `${hotkey}: ${t(label)}`);
    })
    .on('pointerout',  () => {
      rect.setStrokeStyle(1, 0x5a4428, 1);
      text.setColor('#f3d98a');
      hideTooltip();
    })
    .on('pointerdown', onClick);
  const text = scene.add.text(x + size / 2, y + size / 2 - 1, icon, localizedStyle({
    fontFamily: 'Georgia, serif',
    fontSize: buttonFont(Math.round(size * 0.62), scene.scale),
    color: '#f3d98a',
  }, 'center')).setOrigin(0.5).setScrollFactor(0);
  return scene.add.container(0, 0, [rect, text]).setScrollFactor(0);
}

function createMobileControls(
  scene: Phaser.Scene,
  width: number,
  height: number,
  depth: number,
  actions: BaseMapHudActions,
): Pick<BaseMapHudHandles, 'mobileControls' | 'mobileActionButton' | 'mobileActionLabel'> {
  const safe = safeLayout({ width, height });
  const size = touchSize(width <= 380 ? 48 : 52);
  const gap = 6;
  const top = safe.bottom - size * 3 - gap * 2;
  const left = rtl ? safe.right - (size * 3 + gap * 2) : safe.x;
  const centerY = top + size + gap;
  const mobileControls = scene.add.container(0, 0).setScrollFactor(0).setDepth(depth);

  const right = left + (size + gap) * 2;
  const bottom = top + (size + gap) * 2;
  makeMobileMoveButton(scene, mobileControls, right, top, size, 45, { dx: 0, dy: -1 }, depth + 1, actions);
  makeMobileMoveButton(scene, mobileControls, left, top, size, -45, { dx: -1, dy: 0 }, depth + 1, actions);
  makeMobileMoveButton(scene, mobileControls, right, bottom, size, 135, { dx: 1, dy: 0 }, depth + 1, actions);
  makeMobileMoveButton(scene, mobileControls, left, bottom, size, -135, { dx: 0, dy: 1 }, depth + 1, actions);

  const actionW = Math.max(MIN_TOUCH_TARGET, Math.round(size * 1.45));
  const actionH = Math.max(MIN_TOUCH_TARGET, size);
  const actionX = rtl ? safe.x : safe.right - actionW;
  const actionY = centerY;
  const mobileActionButton = scene.add.rectangle(actionX, actionY, actionW, actionH, 0x2a1c10, 0.92)
    .setOrigin(0)
    .setScrollFactor(0)
    .setStrokeStyle(1, 0x5a4428, 1)
    .setInteractive({ useHandCursor: true })
    .setDepth(depth + 1)
    .on('pointerover', () => {
      mobileActionButton.setStrokeStyle(2, 0xf3d98a, 1);
      mobileActionLabel.setColor('#fff1c0');
    })
    .on('pointerout', () => {
      mobileActionButton.setStrokeStyle(1, 0x5a4428, 1);
      mobileActionLabel.setColor('#f3d98a');
    })
    .on('pointerdown', actions.triggerInteraction);
  const mobileActionLabel = scene.add.text(actionX + actionW / 2, actionY + actionH / 2, t('ACT'), localizedStyle({
    fontFamily: 'Georgia, serif',
    fontSize: buttonFont(17, scene.scale),
    color: '#f3d98a',
  }, 'center')).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2);
  mobileControls.add([mobileActionButton, mobileActionLabel]);
  return { mobileControls, mobileActionButton, mobileActionLabel };
}

function makeMobileMoveButton(
  scene: Phaser.Scene,
  mobileControls: Phaser.GameObjects.Container,
  x: number,
  y: number,
  size: number,
  angle: number,
  direction: MobileDirection,
  depth: number,
  actions: BaseMapHudActions,
): void {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const button = scene.add.rectangle(x, y, size, size, 0x000000, 0)
    .setOrigin(0)
    .setScrollFactor(0)
    .setInteractive({ useHandCursor: true })
    .setDepth(depth)
    .on('pointerdown', () => {
      actions.setMobileMoveDirection(direction);
      ring.setFillStyle(0x2a1c10, 0.72);
      ring.setStrokeStyle(2, 0xf3d98a, 0.95);
      drawMobileMoveArrow(arrow, 0xfff1c0);
    })
    .on('pointerup', () => clearMobileMove(direction, button, ring, arrow, actions))
    .on('pointerout', () => clearMobileMove(direction, button, ring, arrow, actions))
    .on('pointerupoutside', () => clearMobileMove(direction, button, ring, arrow, actions));
  const ring = scene.add.circle(centerX, centerY, MIN_TOUCH_TARGET / 2, 0x1a120a, 0.48)
    .setScrollFactor(0)
    .setStrokeStyle(1.5, 0xc9a55c, 0.8)
    .setDepth(depth + 1);
  const arrow = scene.add.graphics({ x: centerX, y: centerY })
    .setAngle(angle)
    .setScrollFactor(0)
    .setDepth(depth + 2);
  drawMobileMoveArrow(arrow, 0xf3d98a);
  mobileControls.add([button, ring, arrow]);
}

function clearMobileMove(
  direction: MobileDirection,
  button: Phaser.GameObjects.Rectangle,
  ring: Phaser.GameObjects.Arc,
  arrow: Phaser.GameObjects.Graphics,
  actions: BaseMapHudActions,
): void {
  if (actions.getMobileMoveDirection() === direction) actions.setMobileMoveDirection(undefined);
  button.setFillStyle(0x000000, 0);
  ring.setFillStyle(0x1a120a, 0.48);
  ring.setStrokeStyle(1.5, 0xc9a55c, 0.8);
  drawMobileMoveArrow(arrow, 0xf3d98a);
}
