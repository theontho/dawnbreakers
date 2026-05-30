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
import { SettingsScene } from './scenes/SettingsScene';
import { ChapterSelectScene } from './scenes/ChapterSelectScene';
import { ChapterEndScene } from './scenes/ChapterEndScene';
import { MapEditorScene } from './scenes/MapEditorScene';
import { applyLocaleDocument } from './i18n';
import { measuredSafeAreaInsets } from './ui/responsive';

applyLocaleDocument();

const gameElement = document.getElementById('game');
syncGameViewportHeight(gameElement);
const initialWidth = gameElement?.clientWidth ?? window.innerWidth;
const initialHeight = gameElement?.clientHeight ?? window.innerHeight;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: gameElement ?? 'game',
  backgroundColor: '#0a0806',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.NO_CENTER,
    width: initialWidth,
    height: initialHeight,
    min: {
      width: 320,
      height: 480,
    },
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
    DialogueScene, JournalScene, SettingsScene, ChapterEndScene, MapEditorScene,
  ],
};

const game = new Phaser.Game(config);
const resizeGame = (): void => {
  syncGameViewportHeight(gameElement);
  if (!gameElement) return;
  game.scale.resize(gameElement.clientWidth, gameElement.clientHeight);
};

window.addEventListener('resize', resizeGame);
window.addEventListener('orientationchange', () => scheduleViewportSync([100, 300, 600]));
window.visualViewport?.addEventListener('resize', resizeGame);
window.visualViewport?.addEventListener('scroll', resizeGame);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) scheduleViewportSync([50, 200, 500]);
});
scheduleViewportSync([50, 150, 300, 500, 800, 1200]);

function syncGameViewportHeight(element: HTMLElement | null): void {
  if (!element) return;

  const insets = measuredSafeAreaInsets();
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  let height = viewportHeight + insets.bottom;
  let extraBottomInset = 0;

  if (isStandaloneDisplay() && isPortraitDisplay()) {
    const screenPortraitHeight = Math.max(window.screen.height, window.screen.width);
    if (screenPortraitHeight - height > 15) {
      extraBottomInset = screenPortraitHeight - height;
      height = screenPortraitHeight;
    }
  }

  document.documentElement.style.setProperty('--game-viewport-height', `${Math.ceil(height)}px`);
  document.documentElement.style.setProperty('--game-extra-safe-area-bottom', `${Math.ceil(extraBottomInset)}px`);
}

function scheduleViewportSync(delays: number[]): void {
  for (const delay of delays) {
    window.setTimeout(resizeGame, delay);
  }
}

function isPortraitDisplay(): boolean {
  return window.innerHeight > window.innerWidth;
}

function isStandaloneDisplay(): boolean {
  const standaloneNavigator = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    standaloneNavigator.standalone === true;
}
