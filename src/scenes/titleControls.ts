import Phaser from 'phaser';
import { rtl } from '../i18n';
import { addLanguageDropdown } from '../ui/languageDropdown';
import { safeLayout } from '../ui/responsive';

type Size = { width: number; height: number };

export function activateTitleTextButton(
  _scene: Phaser.Scene,
  button: Phaser.GameObjects.Text,
  normalColor: string,
  hoverColor: string,
  onClick: () => void,
): void {
  button.setInteractive({ useHandCursor: true })
    .on('pointerover', () => button.setColor(hoverColor))
    .on('pointerout', () => button.setColor(normalColor))
    .on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, ev: { stopPropagation: () => void }) => {
      ev.stopPropagation();
      onClick();
    });
}

export function addTitleLanguageButton(
  scene: Phaser.Scene,
  size: Size,
  onChange: () => void,
): void {
  const safe = safeLayout(size);
  const buttonW = 88;
  const x = rtl ? safe.x : safe.right - buttonW;
  const y = safe.y;
  addLanguageDropdown(scene, {
    x,
    y,
    buttonWidth: buttonW,
    menuWidth: 132,
    size,
    onChange,
  });
}
