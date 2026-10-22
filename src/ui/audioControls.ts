import type Phaser from 'phaser';
import { getAudioSettings, playSfx, setAudioSettings, type AudioSettings } from '../audio';
import { formatNumber, localizedStyle, rtl, t } from '../i18n';
import { buttonFont, MIN_TOUCH_TARGET, responsiveFont } from './responsive';

/**
 * Music and sound-effect volume steppers for the settings panel. Each row
 * is a label and a "− 70% +" control; changes apply and persist at once.
 */

const STEP = 0.1;
const ROW_GAP = 6;

/** Adds the controls at `(x, y)` within `width`; returns the height used. */
export function addAudioControls(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  size: { width: number; height: number },
): number {
  const rows: Array<{ key: keyof Pick<AudioSettings, 'music' | 'sfx'>; label: string }> = [
    { key: 'music', label: t('Music') },
    { key: 'sfx', label: t('Sound effects') },
  ];
  rows.forEach((row, i) => addRow(scene, x, y + i * (MIN_TOUCH_TARGET + ROW_GAP), width, size, row.key, row.label));
  return rows.length * (MIN_TOUCH_TARGET + ROW_GAP) - ROW_GAP;
}

function addRow(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  size: { width: number; height: number },
  key: 'music' | 'sfx',
  label: string,
): void {
  const midY = y + MIN_TOUCH_TARGET / 2;
  const valueW = 56;
  const controlW = MIN_TOUCH_TARGET * 2 + valueW;
  const labelX = rtl ? x + width : x;
  const controlX = rtl ? x : x + width - controlW;
  scene.add.text(labelX, midY, label, localizedStyle({
    fontFamily: 'Georgia, serif',
    fontSize: responsiveFont(16, size, 13),
    color: '#e8d9b0',
  })).setOrigin(rtl ? 1 : 0, 0.5);

  const percent = () => `${formatNumber(Math.round(getAudioSettings()[key] * 100))}%`;
  const value = scene.add.text(controlX + MIN_TOUCH_TARGET + valueW / 2, midY, percent(), localizedStyle({
    fontFamily: 'Georgia, serif',
    fontSize: buttonFont(15, size),
    color: '#f3d98a',
    align: 'center',
  }, 'center')).setOrigin(0.5);

  const change = (delta: number) => {
    const next = Math.round((getAudioSettings()[key] + delta) / STEP) * STEP;
    setAudioSettings({ [key]: next, muted: false });
    value.setText(percent());
    // Let the player hear the new effects level straight away.
    if (key === 'sfx') playSfx('choice');
  };
  // In right-to-left layouts "+" sits on the left, matching reading order.
  const minusX = rtl ? controlX + MIN_TOUCH_TARGET + valueW : controlX;
  const plusX = rtl ? controlX : controlX + MIN_TOUCH_TARGET + valueW;
  stepButton(scene, minusX, y, '−', () => change(-STEP), size);
  stepButton(scene, plusX, y, '+', () => change(STEP), size);
}

function stepButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  glyph: string,
  onClick: () => void,
  size: { width: number; height: number },
): void {
  const bg = scene.add.rectangle(x, y, MIN_TOUCH_TARGET, MIN_TOUCH_TARGET, 0x2a1c10, 0.86)
    .setOrigin(0)
    .setStrokeStyle(1, 0x5a4428, 1)
    .setInteractive({ useHandCursor: true });
  scene.add.text(x + MIN_TOUCH_TARGET / 2, y + MIN_TOUCH_TARGET / 2, glyph, {
    fontFamily: 'Georgia, serif',
    fontSize: buttonFont(20, size),
    color: '#c9b07a',
  }).setOrigin(0.5);
  bg.on('pointerover', () => bg.setStrokeStyle(1, 0xf3d98a, 1))
    .on('pointerout', () => bg.setStrokeStyle(1, 0x5a4428, 1))
    .on('pointerdown', onClick);
}
