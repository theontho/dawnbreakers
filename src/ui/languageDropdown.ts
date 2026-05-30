import Phaser from 'phaser';
import {
  activeLocale,
  LOCALE_CONFIGS,
  type Locale,
  setLocale,
  SUPPORTED_LOCALES,
} from '../i18n';
import { buttonFont, type LayoutSize, MIN_TOUCH_TARGET, safeLayout } from './responsive';

interface LanguageDropdownOptions {
  x: number;
  y: number;
  buttonWidth?: number;
  menuWidth?: number;
  size: LayoutSize;
  depth?: number;
  direction?: 'down' | 'up';
  onChange: () => void;
}

export function addLanguageDropdown(
  scene: Phaser.Scene,
  {
    x,
    y,
    buttonWidth = 88,
    menuWidth = 132,
    size,
    depth = 20000,
    direction = 'down',
    onChange,
  }: LanguageDropdownOptions,
): Phaser.GameObjects.Container {
  const buttonH = MIN_TOUCH_TARGET;
  const container = scene.add.container(x, y).setDepth(depth);
  let menu: Phaser.GameObjects.Container | undefined;
  let backdrop: Phaser.GameObjects.Zone | undefined;

  const closeMenu = (): void => {
    menu?.destroy();
    backdrop?.destroy();
    menu = undefined;
    backdrop = undefined;
  };

  const buttonBg = scene.add.rectangle(0, 0, buttonWidth, buttonH, 0x1a120a, 0.92)
    .setOrigin(0)
    .setStrokeStyle(1, 0x5a4428, 1)
    .setInteractive({ useHandCursor: true });
  const buttonText = scene.add.text(buttonWidth / 2, buttonH / 2, buttonLabel(), {
    fontFamily: LOCALE_CONFIGS[activeLocale].fontStack ?? 'Georgia, serif',
    fontSize: buttonFont(14, size, 14),
    color: '#f3d98a',
    align: 'center',
    rtl: LOCALE_CONFIGS[activeLocale].direction === 'rtl',
  }).setOrigin(0.5);

  buttonBg
    .on('pointerover', () => {
      buttonBg.setStrokeStyle(1, 0xf3d98a, 1);
      buttonText.setColor('#fff1c0');
    })
    .on('pointerout', () => {
      buttonBg.setStrokeStyle(1, 0x5a4428, 1);
      buttonText.setColor('#f3d98a');
    })
    .on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, ev: { stopPropagation: () => void }) => {
      ev.stopPropagation();
      if (menu) {
        closeMenu();
      } else {
        openMenu();
      }
    });

  container.add([buttonBg, buttonText]);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, closeMenu);
  container.once(Phaser.GameObjects.Events.DESTROY, () => {
    closeMenu();
    scene.events.off(Phaser.Scenes.Events.SHUTDOWN, closeMenu);
  });
  return container;

  function buttonLabel(): string {
    return `${LOCALE_CONFIGS[activeLocale].shortName} v`;
  }

  function openMenu(): void {
    closeMenu();
    backdrop = scene.add.zone(0, 0, scene.scale.width, scene.scale.height)
      .setOrigin(0)
      .setDepth(depth + 1)
      .setInteractive()
      .on('pointerdown', closeMenu);

    const menuH = SUPPORTED_LOCALES.length * buttonH;
    const safe = safeLayout(size);
    const minMenuX = safe.x;
    const maxMenuX = Math.max(safe.x, safe.right - menuWidth);
    const menuX = Math.min(Math.max(minMenuX, x + buttonWidth - menuWidth), maxMenuX);
    const rawMenuY = direction === 'up' ? y - menuH - 4 : y + buttonH + 4;
    const minMenuY = safe.y;
    const maxMenuY = Math.max(safe.y, safe.bottom - menuH);
    const menuY = Math.min(Math.max(minMenuY, rawMenuY), maxMenuY);
    menu = scene.add.container(menuX, menuY).setDepth(depth + 2);

    SUPPORTED_LOCALES.forEach((locale, index) => {
      menu!.add(makeOption(locale, index));
    });
  }

  function makeOption(locale: Locale, index: number): Phaser.GameObjects.GameObject[] {
    const config = LOCALE_CONFIGS[locale];
    const rowY = index * buttonH;
    const selected = locale === activeLocale;
    const bg = scene.add.rectangle(0, rowY, menuWidth, buttonH, selected ? 0x3a2814 : 0x1a120a, 0.96)
      .setOrigin(0)
      .setStrokeStyle(1, selected ? 0xf3d98a : 0x5a4428, selected ? 1 : 0.9)
      .setInteractive({ useHandCursor: true });
    const label = scene.add.text(menuWidth / 2, rowY + buttonH / 2, config.name, {
      fontFamily: config.fontStack ?? 'Georgia, serif',
      fontSize: buttonFont(14, size, 14),
      color: selected ? '#fff1c0' : '#f3d98a',
      align: 'center',
      rtl: config.direction === 'rtl',
      fixedWidth: menuWidth - 12,
    }).setOrigin(0.5);

    bg
      .on('pointerover', () => {
        bg.setStrokeStyle(1, 0xf3d98a, 1);
        label.setColor('#fff1c0');
      })
      .on('pointerout', () => {
        bg.setStrokeStyle(1, selected ? 0xf3d98a : 0x5a4428, selected ? 1 : 0.9);
        label.setColor(selected ? '#fff1c0' : '#f3d98a');
      })
      .on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, ev: { stopPropagation: () => void }) => {
        ev.stopPropagation();
        closeMenu();
        if (locale === activeLocale) return;
        setLocale(locale);
        onChange();
      });

    return [bg, label];
  }
}
