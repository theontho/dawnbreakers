import Phaser from 'phaser';
import { ensureMapAssetTextures, ensureTileTextures } from '../assets/mapAssetLibrary';

/**
 * Generates procedural placeholder textures so the game runs without external
 * art assets. Real sprite work can replace these later.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    ensureTileTextures(this);
    ensureMapAssetTextures(this);
    this.scene.start('Title');
  }
}
