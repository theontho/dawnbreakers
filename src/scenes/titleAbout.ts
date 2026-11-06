import Phaser from 'phaser';
import { localizedStyle, rtl, t, textOriginX } from '../i18n';
import { buttonFont, isNarrowLayout, MIN_TOUCH_TARGET, responsiveFont, safeLayout } from '../ui/responsive';

/**
 * The title's About panel: what this game is and, as plainly, what it is
 * not. A hobby made for fun, much of it written with AI, so not accurate,
 * not official, and not to be taken as history or as a statement of the
 * Faith. It opens over the sunrise and closes with its button, a tap
 * outside it, or Escape. It answers the press rather than the release, as
 * the menu's buttons do, so the release of the press that opened it does
 * not close it again.
 */

type Size = { width: number; height: number };

const DEPTH = 30000;
const PAD = 28;

function aboutParagraphs(): string[] {
  return [
    t('The Dawn-Breakers is a hobby game, made for fun. It is inspired by Nabíl\'s narrative of the early days of the Bábí and Bahá\'í Faiths, but it is not that book, and it is not an official or authoritative work of any kind.'),
    t('Much of it was made with AI: the code, the art, the music, the writing and the translations. It will have mistakes in names, dates, places, people and events, and in how they are told.'),
    t('So please don\'t take it seriously, as history or as a statement of anyone\'s belief. For the true story, read The Dawn-Breakers itself.'),
  ];
}

export function openTitleAbout(scene: Phaser.Scene, size: Size): void {
  const { width, height } = size;
  const safe = safeLayout(size);
  const narrow = isNarrowLayout(size);
  const panelW = Math.min(safe.width, 620);
  const textW = panelW - PAD * 2;
  const centerX = safe.x + safe.width / 2;

  const layer = scene.add.container(0, 0).setDepth(DEPTH);
  const backdrop = scene.add.rectangle(0, 0, width, height, 0x000000, 0.62).setOrigin(0).setInteractive();
  const heading = scene.add.text(centerX, 0, t('About'), localizedStyle({
    fontFamily: 'Georgia, serif',
    fontSize: responsiveFont(30, size, 22),
    color: '#f3d98a',
    align: 'center',
  }, 'center')).setOrigin(0.5, 0);
  const body = scene.add.text(rtl ? centerX + textW / 2 : centerX - textW / 2, 0, aboutParagraphs().join('\n\n'), localizedStyle({
    fontFamily: 'Georgia, serif',
    fontSize: responsiveFont(narrow ? 15 : 17, size, 13),
    color: '#e8d9b0',
    lineSpacing: 4,
    wordWrap: { width: textW },
  })).setOrigin(textOriginX(0), 0);
  const close = scene.add.text(centerX, 0, t('Close'), localizedStyle({
    fontFamily: 'Georgia, serif',
    fontSize: buttonFont(17, size),
    color: '#c9b07a',
    backgroundColor: '#2a1d10',
    padding: { x: 22, y: 12 },
    align: 'center',
  }, 'center')).setOrigin(0.5, 0);
  close.setFixedSize(Math.max(close.width, 120), Math.max(close.height, MIN_TOUCH_TARGET));

  const gap = narrow ? 14 : 20;
  const panelH = Math.min(safe.height, PAD + heading.height + gap + body.height + gap + close.height + PAD);
  const panelY = safe.y + (safe.height - panelH) / 2;
  const panel = scene.add.rectangle(centerX - panelW / 2, panelY, panelW, panelH, 0x1a120a, 0.97)
    .setOrigin(0)
    .setStrokeStyle(2, 0xc9a55c, 1)
    .setInteractive();
  heading.setY(panelY + PAD);
  body.setY(heading.y + heading.height + gap);
  close.setY(panelY + panelH - PAD - close.height);
  layer.add([backdrop, panel, heading, body, close]);

  const escape = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  const dismiss = () => {
    escape?.off('down', dismiss);
    layer.destroy();
  };
  escape?.on('down', dismiss);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => escape?.off('down', dismiss));
  backdrop.on('pointerdown', dismiss);
  close.setInteractive({ useHandCursor: true })
    .on('pointerover', () => close.setColor('#fff1c0'))
    .on('pointerout', () => close.setColor('#c9b07a'))
    .on('pointerdown', dismiss);
}
