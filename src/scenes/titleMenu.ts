import Phaser from 'phaser';
import { localizedStyle, rtl, t } from '../i18n';
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
const BUTTON_FILL_COLOR = 0x1a120a;
const BUTTON_FILL_ALPHA = 0.8;
const GITHUB_TEXTURE = 'title-github-mark';
/** GitHub's mark (octicon `mark-github`), on a 16-unit square. */
const GITHUB_MARK = 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z';

/** A button in the menu: a text button, or a square icon button. */
export type MenuItem = Phaser.GameObjects.Text | Phaser.GameObjects.Container;

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
 * A square icon button that opens `href` in a new tab: GitHub's mark, tinted
 * like the menu's text. It opens on release, which every browser counts as
 * the tap that allows a new tab.
 */
export function addGitHubLink(scene: Phaser.Scene, href: string): Phaser.GameObjects.Container {
  if (!scene.textures.exists(GITHUB_TEXTURE)) {
    const px = 64;
    const texture = scene.textures.createCanvas(GITHUB_TEXTURE, px, px)!;
    texture.context.scale(px / 16, px / 16);
    texture.context.fillStyle = '#ffffff';
    texture.context.fill(new Path2D(GITHUB_MARK));
    texture.refresh();
  }
  const side = MIN_TOUCH_TARGET;
  const tint = (color: string) => Phaser.Display.Color.HexStringToColor(color).color;
  const icon = scene.add.image(0, 0, GITHUB_TEXTURE).setDisplaySize(22, 22).setTint(tint(MENU_COLORS.secondary.normal));
  const button = scene.add.container(0, 0, [
    scene.add.rectangle(0, 0, side, side, BUTTON_FILL_COLOR, BUTTON_FILL_ALPHA),
    icon,
  ]).setSize(side, side);
  button.setInteractive({ useHandCursor: true })
    .on('pointerover', () => icon.setTint(tint(MENU_COLORS.secondary.hover)))
    .on('pointerout', () => icon.setTint(tint(MENU_COLORS.secondary.normal)))
    .on('pointerup', () => window.open(href, '_blank', 'noopener'));
  return button;
}

/**
 * Lays out `rows` of buttons from the bottom of `safe` upward, each row
 * wrapped to the safe width and centred. Every text button in the secondary
 * rows takes the widest one's width, so a wrapped row lines up as a grid.
 * Returns the top of the menu.
 */
export function layoutMenu(rows: MenuItem[][], safe: SafeLayout): number {
  const secondary = rows.slice(1).flat().filter((item): item is Phaser.GameObjects.Text => item instanceof Phaser.GameObjects.Text);
  const cellWidth = Math.max(0, ...secondary.map(button => button.width));
  for (const button of secondary) button.setFixedSize(cellWidth, 0);
  for (const button of rows[0] ?? []) {
    if (button instanceof Phaser.GameObjects.Text) button.setFixedSize(Math.max(button.width, cellWidth), Math.max(button.height, MIN_TOUCH_TARGET));
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

/** A phone's menu: the start button and More, which opens the rest of the choices under them. */
export interface FoldedMenu {
  toggle: Phaser.GameObjects.Text;
  /** Opens or closes the rest of the menu. */
  flip(): void;
}

/**
 * Lays the menu out folded, as a phone shows it: `start` and a More button
 * side by side, and the other choices hidden until More is pressed, when
 * they open beneath (and the button reads Less). The buttons keep one size
 * either way, so nothing jumps but the rows.
 */
export function foldMenu(scene: Phaser.Scene, size: Size, start: Phaser.GameObjects.Text, rest: MenuItem[], safe: SafeLayout): FoldedMenu {
  const toggle = addMenuButton(scene, size, t('Less'), 'secondary');
  const lessWidth = toggle.width;
  toggle.setText(t('More'));
  toggle.setFixedSize(Math.max(lessWidth, toggle.width), 0);
  // Sized once with everything in, so open and closed share their widths.
  layoutMenu([[start, toggle], rest], safe);
  let open = true;
  const flip = () => {
    open = !open;
    for (const item of rest) item.setVisible(open);
    toggle.setText(t(open ? 'Less' : 'More'));
    layoutMenu(open ? [[start, toggle], rest] : [[start, toggle]], safe);
  };
  flip();
  return { toggle, flip };
}

function wrapRow(row: MenuItem[], maxWidth: number): MenuItem[][] {
  const lines: MenuItem[][] = [];
  let line: MenuItem[] = [];
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
function balance(lines: MenuItem[][]): MenuItem[][] {
  if (lines.length < 2) return lines;
  const all = lines.flat();
  const perLine = Math.ceil(all.length / lines.length);
  const balanced: MenuItem[][] = [];
  for (let i = 0; i < all.length; i += perLine) balanced.push(all.slice(i, i + perLine));
  return balanced;
}
