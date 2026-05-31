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
import { activeLocale, applyLocaleDocument, loadLocale } from './i18n';
import { attachConsolePanel } from './ui/consolePanel';
import { measuredSafeAreaInsets } from './ui/responsive';

applyLocaleDocument();

const gameElement = document.getElementById('game');
syncGameViewportHeight(gameElement);

// Block boot on the active locale's catalog so the first paint isn't english
// fallback. Other locales lazy-load when the player switches via Settings.
await loadLocale(activeLocale);

attachConsolePanel();
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
attachFpsLabel(game);
if (import.meta.env.DEV) {
  // Dev-only escape hatch for headless smoke tests; not shipped.
  (window as unknown as { __game: Phaser.Game }).__game = game;
}
let resizeFrame: number | undefined;
let lastGameWidth = initialWidth;
let lastGameHeight = initialHeight;

const resizeGameNow = (): void => {
  resizeFrame = undefined;
  syncGameViewportHeight(gameElement);
  if (!gameElement) return;
  const width = Math.round(gameElement.clientWidth);
  const height = Math.round(gameElement.clientHeight);
  if (width === lastGameWidth && height === lastGameHeight) return;

  lastGameWidth = width;
  lastGameHeight = height;
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

function attachFpsLabel(game: Phaser.Game): void {
  const label = document.createElement('div');
  label.setAttribute('aria-hidden', 'true');
  label.textContent = 'FPS --';
  Object.assign(label.style, {
    position: 'fixed',
    top: '2px',
    right: '6px',
    zIndex: '2147483647',
    pointerEvents: 'none',
    userSelect: 'none',
    padding: '2px 5px',
    borderRadius: '5px',
    background: 'rgba(5, 4, 3, 0.58)',
    color: '#f3d98a',
    font: '11px/1.25 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    letterSpacing: '0.02em',
    textShadow: '0 1px 2px #000',
  });
  document.body.appendChild(label);
  positionFpsLabel(label);
  window.addEventListener('resize', () => positionFpsLabel(label));
  window.addEventListener('orientationchange', () => {
    window.setTimeout(() => positionFpsLabel(label), 100);
    window.setTimeout(() => positionFpsLabel(label), 300);
  });
  window.visualViewport?.addEventListener('resize', () => positionFpsLabel(label));

  window.setInterval(() => {
    label.textContent = `FPS ${Math.round(game.loop.actualFps)}`;
  }, 250);
}

function positionFpsLabel(label: HTMLElement): void {
  const insets = measuredSafeAreaInsets();
  const topInset = isPortraitDisplay() ? insets.top : 0;
  const unsafeTopOffset = topInset > 0 ? Math.round(Math.min(16, Math.max(4, topInset * 0.18))) : 2;
  label.style.top = `${unsafeTopOffset}px`;
  label.style.right = `${Math.max(6, insets.right + 6)}px`;
}
