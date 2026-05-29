import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { CityScene } from './scenes/CityScene';
import { HouseQuarterScene } from './scenes/HouseQuarterScene';
import { RoadScene } from './scenes/RoadScene';
import { DialogueScene } from './scenes/DialogueScene';
import { TitleScene } from './scenes/TitleScene';
import { JournalScene } from './scenes/JournalScene';
import { ChapterSelectScene } from './scenes/ChapterSelectScene';
import { ChapterEndScene } from './scenes/ChapterEndScene';

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
  scene: [
    BootScene, TitleScene, ChapterSelectScene,
    CityScene, HouseQuarterScene, RoadScene,
    DialogueScene, JournalScene, ChapterEndScene,
  ],
};

new Phaser.Game(config);
