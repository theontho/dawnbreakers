import Phaser from 'phaser';

export type ClothingStyle = 'plain' | 'robe' | 'cloak' | 'vest' | 'uniform' | 'sash' | 'apron' | 'wrap';
export type HatStyle = 'none' | 'turban' | 'cap' | 'veil' | 'headscarf' | 'hood' | 'tallHat';

export interface CharacterTextureOptions {
  skin: number;
  body: number;
  clothing?: {
    style?: ClothingStyle;
    secondary?: number;
    accent?: number;
  };
  hat?: {
    style?: HatStyle;
    color?: number;
    accent?: number;
  };
  hair?: number;
  shadow?: boolean;
}

const W = 30;
const H = 44;
const CX = W / 2;

function darker(color: number, amount: number): number {
  return Phaser.Display.Color.IntegerToColor(color).darken(amount).color;
}

export function makeCharacterTexture(
  scene: Phaser.Scene,
  key: string,
  options: CharacterTextureOptions,
): void {
  if (scene.textures.exists(key)) return;

  const g = scene.add.graphics();
  const clothing = options.clothing ?? {};
  const clothingStyle = clothing.style ?? 'plain';
  const secondary = clothing.secondary ?? darker(options.body, 25);
  const accent = clothing.accent ?? 0xc9a55c;

  if (options.shadow) {
    g.fillStyle(0x000000, 0.24);
    g.fillEllipse(CX, H - 4, 22, 6);
  }

  if (options.hat?.style === 'veil' || options.hat?.style === 'headscarf' || options.hat?.style === 'hood') {
    g.fillStyle(options.hat.color ?? secondary, 1);
    g.fillEllipse(CX, 14, 19, 22);
  } else if (options.hair !== undefined) {
    g.fillStyle(options.hair, 1);
    g.fillEllipse(CX, 10, 16, 13);
  }

  if (clothingStyle === 'cloak') {
    g.fillStyle(secondary, 1);
    g.fillTriangle(3, 41, CX, 14, 27, 41);
    g.fillStyle(options.body, 1);
    g.fillRoundedRect(10, 19, 10, 21, 3);
  } else {
    g.fillStyle(options.body, 1);
    g.fillRoundedRect(6, 17, 18, 24, 4);
  }

  switch (clothingStyle) {
    case 'vest':
      g.fillStyle(secondary, 1);
      g.fillRect(7, 20, 16, 10);
      g.lineStyle(1, accent, 1);
      g.lineBetween(CX, 20, CX, 40);
      break;
    case 'uniform':
      g.fillStyle(secondary, 1);
      g.fillRect(6, 19, 18, 8);
      g.lineStyle(2, accent, 1);
      g.lineBetween(7, 23, 23, 23);
      g.lineBetween(8, 35, 22, 35);
      break;
    case 'sash':
      g.lineStyle(4, secondary, 1);
      g.lineBetween(8, 20, 23, 37);
      g.lineStyle(1, accent, 1);
      g.lineBetween(9, 19, 24, 36);
      break;
    case 'apron':
      g.fillStyle(secondary, 1);
      g.fillRoundedRect(9, 23, 12, 16, 2);
      g.lineStyle(1, accent, 1);
      g.lineBetween(9, 23, 6, 19);
      g.lineBetween(21, 23, 24, 19);
      break;
    case 'wrap':
      g.lineStyle(3, secondary, 1);
      g.lineBetween(7, 22, 23, 28);
      g.lineBetween(8, 31, 22, 35);
      break;
    case 'cloak':
      g.lineStyle(2, accent, 1);
      g.lineBetween(8, 24, 22, 24);
      break;
    case 'robe':
      g.fillStyle(secondary, 0.7);
      g.fillRect(6, 17, 18, 5);
      g.lineStyle(1, accent, 0.9);
      g.lineBetween(8, 31, 22, 31);
      break;
    case 'plain':
      break;
  }

  g.fillStyle(options.skin, 1);
  g.fillCircle(CX, 11, 7);

  const hatStyle = options.hat?.style ?? 'none';
  const hatColor = options.hat?.color ?? secondary;
  const hatAccent = options.hat?.accent ?? accent;

  switch (hatStyle) {
    case 'turban':
      g.fillStyle(hatColor, 1);
      g.fillEllipse(CX, 6, 20, 8);
      g.fillStyle(hatAccent, 0.85);
      g.fillEllipse(CX - 3, 5, 11, 5);
      break;
    case 'cap':
      g.fillStyle(hatColor, 1);
      g.fillEllipse(CX, 6, 16, 7);
      g.fillRect(8, 6, 14, 4);
      break;
    case 'veil':
      g.fillStyle(hatColor, 0.82);
      g.fillRect(6, 8, 18, 14);
      break;
    case 'headscarf':
      g.fillStyle(hatColor, 0.92);
      g.fillPoints([{ x: 7, y: 9 }, { x: CX, y: 3 }, { x: 23, y: 9 }, { x: 21, y: 19 }, { x: 9, y: 19 }], true);
      break;
    case 'hood':
      g.lineStyle(3, hatColor, 1);
      g.strokeCircle(CX, 11, 8);
      break;
    case 'tallHat':
      g.fillStyle(hatColor, 1);
      g.fillRect(10, 1, 10, 10);
      g.fillEllipse(CX, 11, 16, 5);
      break;
    case 'none':
      break;
  }

  g.lineStyle(1, 0x111111, 0.58);
  if (clothingStyle === 'cloak') {
    g.strokeTriangle(3, 41, CX, 14, 27, 41);
  } else {
    g.strokeRoundedRect(6, 17, 18, 24, 4);
  }
  g.strokeCircle(CX, 11, 7);

  g.generateTexture(key, W, H);
  g.destroy();
}
