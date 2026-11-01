import Phaser from 'phaser';
import { localizedStyle, rtl } from '../i18n';
import { buttonFont, MIN_TOUCH_TARGET, type SafeLayout } from '../ui/responsive';

/**
 * The title's menu, set along the bottom of the screen so the sky above the
 * city stays open for the sunrise: the start button on its own row, and the
 * other choices beneath it in buttons of one width, wrapping into as many
 * rows as the screen needs. A right-to-left language reads each row from the
 * right.
 */

type Size = { width: number; height: number };

/** The space between buttons, across and between rows. */
export const MENU_GAP = 12;

const BUTTON_FILL = '#1a120acc';

export type MenuTone = 'primary' | 'secondary' | 'quiet';

export const MENU_COLORS: Record<MenuTone, { normal: string; hover: string }> = {
  primary: { normal: '#e8d9b0', hover: '#fff1c0' },
  secondary: { normal: '#c9b07a', hover: '#fff1c0' },
  quiet: { normal: '#9c8458', hover: '#f3d98a' },
};

export function addMenuButton(scene: Phaser.Scene, size: Size, label: string, tone: MenuTone): Phaser.GameObjects.Text {
  const primary = tone === 'primary';
  return scene.add.text(0, 0, label, localizedStyle({
    fontFamily: 'Georgia, serif',
    fontSize: buttonFont(primary ? 22 : 17, size),
    color: MENU_COLORS[tone].normal,
    backgroundColor: BUTTON_FILL,
    padding: primary ? { x: 32, y: 14 } : { x: 14, y: 12 },
    align: 'center',
  }, 'center')).setOrigin(0.5);
}

/**
 * Lays out `rows` of buttons from the bottom of `safe` upward, each row
 * wrapped to the safe width and centred. Every button in the secondary rows
 * takes the widest one's width, so a wrapped row lines up as a grid. Returns
 * the top of the menu.
 */
export function layoutMenu(rows: Phaser.GameObjects.Text[][], safe: SafeLayout): number {
  const secondary = rows.slice(1).flat();
  const cellWidth = Math.max(0, ...secondary.map(button => button.width));
  for (const button of secondary) button.setFixedSize(cellWidth, 0);
  for (const button of rows[0] ?? []) {
    button.setFixedSize(Math.max(button.width, cellWidth), Math.max(button.height, MIN_TOUCH_TARGET));
  }

  const lines = rows.flatMap(row => wrapRow(row, safe.width));
  const centerX = safe.x + safe.width / 2;
  let bottom = safe.bottom;
  for (const line of [...lines].reverse()) {
    const lineHeight = Math.max(...line.map(button => button.height));
    const lineWidth = line.reduce((sum, button) => sum + button.width, 0) + MENU_GAP * (line.length - 1);
    let x = centerX - lineWidth / 2;
    for (const button of rtl ? [...line].reverse() : line) {
      button.setPosition(x + button.width / 2, bottom - lineHeight / 2);
      x += button.width + MENU_GAP;
    }
    bottom -= lineHeight + MENU_GAP;
  }
  return bottom + MENU_GAP;
}

function wrapRow(row: Phaser.GameObjects.Text[], maxWidth: number): Phaser.GameObjects.Text[][] {
  const lines: Phaser.GameObjects.Text[][] = [];
  let line: Phaser.GameObjects.Text[] = [];
  let width = 0;
  for (const button of row) {
    const next = line.length === 0 ? button.width : width + MENU_GAP + button.width;
    if (line.length > 0 && next > maxWidth) {
      lines.push(line);
      line = [button];
      width = button.width;
    } else {
      line.push(button);
      width = next;
    }
  }
  if (line.length > 0) lines.push(line);
  return balance(lines);
}

/** Evens out a wrapped row so the last line is not left with a single orphan. */
function balance(lines: Phaser.GameObjects.Text[][]): Phaser.GameObjects.Text[][] {
  if (lines.length < 2) return lines;
  const all = lines.flat();
  const perLine = Math.ceil(all.length / lines.length);
  const balanced: Phaser.GameObjects.Text[][] = [];
  for (let i = 0; i < all.length; i += perLine) balanced.push(all.slice(i, i + perLine));
  return balanced;
}
