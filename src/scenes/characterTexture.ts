import type Phaser from 'phaser';
import { paintTexture } from '../assets/art/canvasKit';
import { FIGURE_H, FIGURE_W, dim, type FigureSpec } from '../assets/art/figureKit';
import { paintFigure } from '../assets/art/figures';

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

const DEFAULT_HAIR = 0x2d1b10;
const DEFAULT_ACCENT = 0xc9a55c;

/**
 * Paints a standing figure (30x44, feet at the bottom centre) once per key.
 * Callers place it with origin (0.5, 1).
 */
export function makeCharacterTexture(
  scene: Phaser.Scene,
  key: string,
  options: CharacterTextureOptions,
): void {
  paintTexture(scene, key, FIGURE_W, FIGURE_H, ctx => paintFigure(ctx, resolveFigure(options)));
}

function resolveFigure(options: CharacterTextureOptions): FigureSpec {
  const clothing = options.clothing?.style ?? 'plain';
  const hat = options.hat?.style ?? 'none';
  const secondary = options.clothing?.secondary ?? dim(options.body, 0.25);
  const accent = options.clothing?.accent ?? DEFAULT_ACCENT;
  return {
    clothing,
    hat,
    skin: options.skin,
    body: options.body,
    secondary,
    accent,
    hatColor: options.hat?.color ?? secondary,
    hatAccent: options.hat?.accent ?? accent,
    hair: options.hair ?? DEFAULT_HAIR,
    beard: beardFor(clothing, hat),
    shadow: options.shadow ?? false,
  };
}

/**
 * Persian men of the 1840s were nearly all bearded; soldiers kept a
 * moustache. Scarves, hoods and chadors carry no beard.
 */
function beardFor(clothing: ClothingStyle, hat: HatStyle): FigureSpec['beard'] {
  if (hat === 'turban' || hat === 'cap' || hat === 'tallHat') return clothing === 'uniform' ? 'moustache' : 'full';
  return 'none';
}
