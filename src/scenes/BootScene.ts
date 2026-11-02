import Phaser from 'phaser';
import { ensureTileTextures } from '../assets/mapAssetLibrary';
import { SPLASH_STAGE, splashProgress } from '../ui/splash';

/**
 * Paints the ground tiles, which every map shares. Map objects are painted
 * by each map as it opens (`ensureTexturesNamedIn`), so boot does not pay
 * for every chapter's art before the title shows.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    ensureTileTextures(this);
    splashProgress(SPLASH_STAGE.tiles);
    this.scene.start('Title');
  }
}
