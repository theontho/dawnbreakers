import Phaser from 'phaser';
import { localizedStyle, rtl, t, textOriginX } from '../i18n';
import { addLanguageDropdown } from '../ui/languageDropdown';
import { buttonFont, safeLayout } from '../ui/responsive';

type Size = { width: number; height: number };

export function addFastSunriseButton(
  scene: Phaser.Scene,
  size: Size,
  speedUpSunrise: () => void,
): () => void {
  const safe = safeLayout(size);
  const fast = scene.add.text(rtl ? safe.right : safe.x, safe.bottom, t('Fast'), localizedStyle({
    fontFamily: 'Georgia, serif', fontSize: buttonFont(14, size), color: '#9c8458',
    backgroundColor: '#1a120acc', padding: { x: 12, y: 14 },
  })).setOrigin(textOriginX(0), 1);
  let mode: 'fast' | 'accelerating' | 'restart' = 'fast';

  activateTitleTextButton(scene, fast, '#9c8458', '#f3d98a', () => {
    if (mode === 'restart') {
      scene.scene.restart();
      return;
    }

    if (mode === 'accelerating') return;

    mode = 'accelerating';
    speedUpSunrise();
    fast.setText(t('Fast ✓'));
    fast.setAlpha(0.7);
  });

  return () => {
    mode = 'restart';
    fast.setText(t('Restart opening'));
    fast.setAlpha(1);
  };
}

export function addSkyRewindPrototypeButton(scene: Phaser.Scene, size: Size): void {
  const safe = safeLayout(size);
  const fastButtonGap = 76;
  const x = rtl ? safe.right - fastButtonGap : safe.x + fastButtonGap;
  const skyRewind = scene.add.text(x, safe.bottom, t('Sky Rewind'), localizedStyle({
    fontFamily: 'Georgia, serif', fontSize: buttonFont(14, size), color: '#9c8458',
    backgroundColor: '#1a120acc', padding: { x: 12, y: 14 },
  })).setOrigin(textOriginX(0), 1);

  activateTitleTextButton(scene, skyRewind, '#9c8458', '#f3d98a', () => {
    window.location.assign('./skyrewind.html');
  });
}

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
