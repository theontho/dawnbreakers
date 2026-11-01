import Phaser from 'phaser';
import { prepareGlowPipeline } from './hdr/hdrGlowLayer';
import { hdrGlowSupported, hdrGpu } from './hdr/hdrSupport';
import { BootScene } from './scenes/BootScene';
import { MapScene } from './scenes/MapScene';
import { MAP_DEFINITIONS } from './data/maps';
import { DialogueScene } from './scenes/DialogueScene';
import { TitleScene } from './scenes/TitleScene';
import { JournalScene } from './scenes/JournalScene';
import { SettingsScene } from './scenes/SettingsScene';
import { ChapterSelectScene } from './scenes/ChapterSelectScene';
import { ChapterEndScene } from './scenes/ChapterEndScene';
import { JourneyScene } from './scenes/JourneyScene';
import { MapEditorScene } from './scenes/MapEditorScene';
import { miniGameScenes } from './scenes/minigames';
import { MiniGamePickerScene } from './scenes/MiniGamePickerScene';
import { activeLocale, applyLocaleDocument, loadLocale } from './i18n';
import { attachConsolePanel } from './ui/consolePanel';
import { measuredSafeAreaInsets, MIN_GAME_HEIGHT, MIN_GAME_WIDTH } from './ui/responsive';
import { attachFpsLabel, installDebugOverlayHotkey } from './ui/debugOverlay';
import { installAudioUnlock, playSfx } from './audio';

applyLocaleDocument();

const gameElement = document.getElementById('game');
syncGameViewportHeight(gameElement);

// Block boot on the active locale's catalog so the first paint isn't english
// fallback. Other locales lazy-load when the player switches via Settings.
await loadLocale(activeLocale);

attachConsolePanel();
installDebugOverlayHotkey();
const initialWidth = gameElement?.clientWidth ?? window.innerWidth;
const initialHeight = gameElement?.clientHeight ?? window.innerHeight;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: gameElement ?? 'game',
  backgroundColor: '#0a0806',
  transparent: false,
  powerPreference: 'high-performance',
  disablePreFX: true,
  disablePostFX: true,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.NO_CENTER,
    autoRound: true,
    width: initialWidth,
    height: initialHeight,
    min: {
      width: MIN_GAME_WIDTH,
      height: MIN_GAME_HEIGHT,
    },
  },
  pixelArt: false,
  scene: [
    BootScene, TitleScene, ChapterSelectScene,
    ...MAP_DEFINITIONS.map(def => new MapScene(def)),
    DialogueScene, MiniGamePickerScene, ...miniGameScenes(), JournalScene, SettingsScene, ChapterEndScene, JourneyScene, MapEditorScene,
  ],
};

// Find out now, while the loading screen shows, whether the sun can glow in
// HDR: the GPU takes a moment to set up, and doing it as the title opens stutters.
void hdrGlowSupported().then(async supported => {
  const gpu = supported ? await hdrGpu() : undefined;
  if (gpu) await prepareGlowPipeline(gpu);
});
const game = new Phaser.Game(config);
attachFpsLabel(game);
installAudioUnlock();
installUiClickSound(game);
if (import.meta.env.DEV) {
  // Dev-only escape hatch for headless smoke tests; not shipped.
  (window as unknown as { __game: Phaser.Game }).__game = game;
}
let resizeFrame: number | undefined;

const resizeGameNow = (): void => {
  resizeFrame = undefined;
  syncGameViewportHeight(gameElement);
  if (!gameElement) return;
  const width = Math.round(gameElement.clientWidth);
  const height = Math.round(gameElement.clientHeight);
  // Against the game's own size, not the last one set here: Phaser resizes
  // too on a window resize, from the page as it stood before the height
  // above was applied, and a rotation would otherwise leave it there.
  if (width === game.scale.width && height === game.scale.height) return;
  game.scale.resize(width, height);
};

const resizeGame = (): void => {
  if (resizeFrame !== undefined) return;
  resizeFrame = window.requestAnimationFrame(resizeGameNow);
};

window.addEventListener('resize', resizeGame);
window.addEventListener('orientationchange', () => scheduleViewportSync([100, 300, 600]));
window.visualViewport?.addEventListener('resize', resizeGame);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) scheduleViewportSync([50, 200, 500]);
});
scheduleViewportSync([50, 150, 300, 500, 800, 1200]);

/** How far past the reported top inset the status bar's blur reaches, as a share of that inset. */
const STATUS_BAR_BLUR_REACH = 0.45;

function syncGameViewportHeight(element: HTMLElement | null): void {
  if (!element) return;

  const insets = measuredSafeAreaInsets();
  // The layout viewport, not the visual one: if the page has been left zoomed
  // (iOS can after a rotation) the visual viewport shrinks, and sizing the
  // game to it would keep it zoomed in for good.
  const visual = window.visualViewport;
  const viewportHeight = visual ? visual.height * visual.scale : window.innerHeight;
  let height = viewportHeight + insets.bottom;
  let extraBottomInset = 0;

  if (isStandaloneDisplay() && isPortraitDisplay()) {
    const screenPortraitHeight = Math.max(window.screen.height, window.screen.width);
    if (screenPortraitHeight - height > 15) {
      extraBottomInset = screenPortraitHeight - height;
      height = screenPortraitHeight;
    }
  }

  // Added to the home screen, iOS draws the page under a translucent status
  // bar and blurs a band a little deeper than the safe area it reports; keep
  // the first line of the interface clear of that band.
  const extraTopInset = isStandaloneDisplay() && insets.top > 0 ? Math.round(insets.top * STATUS_BAR_BLUR_REACH) : 0;
  document.documentElement.style.setProperty('--game-extra-safe-area-top', `${extraTopInset}px`);
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

/**
 * A soft click for every interactive HUD and menu element. Dialogue choices
 * have their own sounds, so that scene is left out.
 */
function installUiClickSound(phaserGame: Phaser.Game): void {
  const click = (): void => playSfx('uiClick');
  phaserGame.events.once(Phaser.Core.Events.READY, () => {
    for (const scene of phaserGame.scene.scenes) {
      if (scene.scene.key === 'Dialogue') continue;
      scene.events.on(Phaser.Scenes.Events.CREATE, () => {
        scene.input.off('gameobjectdown', click);
        scene.input.on('gameobjectdown', click);
      });
    }
  });
}
