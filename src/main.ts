import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { ShirazScene } from './scenes/ShirazScene';
import { DialogueScene } from './scenes/DialogueScene';
import { TitleScene } from './scenes/TitleScene';
import { JournalScene } from './scenes/JournalScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0a0806',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },
  pixelArt: false,
  scene: [BootScene, TitleScene, ShirazScene, DialogueScene, JournalScene],
};

new Phaser.Game(config);
