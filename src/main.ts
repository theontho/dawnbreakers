import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { CityScene } from './scenes/CityScene';
import { HouseQuarterScene } from './scenes/HouseQuarterScene';
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
  scene: [BootScene, TitleScene, CityScene, HouseQuarterScene, DialogueScene, JournalScene],
};

new Phaser.Game(config);
