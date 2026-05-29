import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { CityScene } from './scenes/CityScene';
import { HouseQuarterScene } from './scenes/HouseQuarterScene';
import { RoadScene } from './scenes/RoadScene';
import { Ch3ShipScene } from './scenes/Ch3ShipScene';
import { Ch3MeccaScene } from './scenes/Ch3MeccaScene';
import { Ch4ShirazReturnScene } from './scenes/Ch4ShirazReturnScene';
import { Ch4VakilMosqueScene } from './scenes/Ch4VakilMosqueScene';
import { Ch5IsfahanBridgeScene } from './scenes/Ch5IsfahanBridgeScene';
import { Ch5MutamidPalaceScene } from './scenes/Ch5MutamidPalaceScene';
import { Ch6MakuScene } from './scenes/Ch6MakuScene';
import { Ch6ChihriqScene } from './scenes/Ch6ChihriqScene';
import { Ch7BadashtCampScene } from './scenes/Ch7BadashtCampScene';
import { Ch8ForestRoadScene } from './scenes/Ch8ForestRoadScene';
import { Ch8TabarsiFortScene } from './scenes/Ch8TabarsiFortScene';
import { Ch9TabrizSquareScene } from './scenes/Ch9TabrizSquareScene';
import { Ch9BarrackRoofScene } from './scenes/Ch9BarrackRoofScene';
import { Ch10TehranStreetScene } from './scenes/Ch10TehranStreetScene';
import { Ch10SiyahChalScene } from './scenes/Ch10SiyahChalScene';
import { DialogueScene } from './scenes/DialogueScene';
import { TitleScene } from './scenes/TitleScene';
import { JournalScene } from './scenes/JournalScene';
import { ChapterSelectScene } from './scenes/ChapterSelectScene';
import { ChapterEndScene } from './scenes/ChapterEndScene';
import { MapEditorScene } from './scenes/MapEditorScene';

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
    Ch3ShipScene, Ch3MeccaScene,
    Ch4ShirazReturnScene, Ch4VakilMosqueScene,
    Ch5IsfahanBridgeScene, Ch5MutamidPalaceScene,
    Ch6MakuScene, Ch6ChihriqScene,
    Ch7BadashtCampScene,
    Ch8ForestRoadScene, Ch8TabarsiFortScene,
    Ch9TabrizSquareScene, Ch9BarrackRoofScene,
    Ch10TehranStreetScene, Ch10SiyahChalScene,
    DialogueScene, JournalScene, ChapterEndScene, MapEditorScene,
  ],
};

new Phaser.Game(config);
