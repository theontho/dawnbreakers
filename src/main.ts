import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MapScene } from './scenes/MapScene';
import { MAP_DEFINITIONS } from './data/maps';
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
    ...MAP_DEFINITIONS.map(def => new MapScene(def)),
    DialogueScene, JournalScene, SettingsScene, ChapterEndScene, MapEditorScene,
  ],
};

const game = new Phaser.Game(config);
if (import.meta.env.DEV) {
  // Dev-only escape hatch for headless smoke tests; not shipped.
  (window as unknown as { __game: Phaser.Game }).__game = game;
}
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
