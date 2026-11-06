import Phaser from 'phaser';
import { localizedStyle, rtl, t, textOriginX } from '../i18n';
import { isNarrowLayout, MIN_TOUCH_TARGET, responsiveFont, safeLayout } from '../ui/responsive';
import { drawHudIcon, type HudIcon } from './hudIcons';

export interface BaseMapHudHandles {
  titleText: Phaser.GameObjects.Text;
  promptText: Phaser.GameObjects.Text;
  exitPromptText: Phaser.GameObjects.Text;
}

interface BaseMapHudActions {
  openSettings: () => void;
  openJournal: () => void;
  toggleInteractableHighlights: () => void;
  triggerInteraction: () => void;
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
  const promptY = safe.bottom - 22;
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
  makeHudIconButton(scene, buttonStart, buttonY, buttonSize, 'settings', 'Esc', 'Settings', actions.openSettings, showHudTooltip, hideHudTooltip).setScrollFactor(0).setDepth(UI_DEPTH);
  makeHudIconButton(scene, buttonStart + buttonStep, buttonY, buttonSize, 'journal', 'J', 'Journal', actions.openJournal, showHudTooltip, hideHudTooltip).setScrollFactor(0).setDepth(UI_DEPTH);
  makeHudIconButton(scene, buttonStart + buttonStep * 2, buttonY, buttonSize, 'highlight', 'H / Tab', 'Highlight', actions.toggleInteractableHighlights, showHudTooltip, hideHudTooltip).setScrollFactor(0).setDepth(UI_DEPTH);

  // A tap on the prompt does what it says, as E does: speak, look, go in.
  const promptText = scene.add.text(centerX, promptY, '', localizedStyle({
    fontFamily: 'Georgia, serif', fontSize: responsiveFont(18, size, 13), color: '#f3d98a',
    backgroundColor: '#00000099',
    padding: { x: 12, y: 7 },
    align: 'center',
    wordWrap: { width: safe.width },
  }, 'center')).setOrigin(0.5).setScrollFactor(0).setDepth(UI_DEPTH).setVisible(false)
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', actions.triggerInteraction);

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
  };
}

function makeHudIconButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  size: number,
  icon: HudIcon,
  hotkey: string,
  label: string,
  onClick: () => void,
  showTooltip: (x: number, y: number, label: string) => void,
  hideTooltip: () => void,
): Phaser.GameObjects.Container {
  const back = 0x1a120a;
  const picture = scene.add.graphics({ x: x + size / 2, y: y + size / 2 }).setScrollFactor(0);
  const paint = (color: number) => drawHudIcon(picture, icon, size, color, back);
  const rect = scene.add.rectangle(x, y, size, size, back, 0.92)
    .setOrigin(0)
    .setScrollFactor(0)
    .setStrokeStyle(1, 0x5a4428, 1)
    .setInteractive({ useHandCursor: true })
    .on('pointerover', () => {
      rect.setStrokeStyle(1, 0xf3d98a, 1);
      paint(0xfff1c0);
      showTooltip(x + size, y + size + 6, `${hotkey}: ${t(label)}`);
    })
    .on('pointerout',  () => {
      rect.setStrokeStyle(1, 0x5a4428, 1);
      paint(0xf3d98a);
      hideTooltip();
    })
    .on('pointerdown', onClick);
  paint(0xf3d98a);
  return scene.add.container(0, 0, [rect, picture]).setScrollFactor(0);
}
