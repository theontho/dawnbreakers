import type Phaser from 'phaser';
import { measuredSafeAreaInsets } from './responsive';

/**
 * Developer overlay (game console + FPS counter). Hidden by default so it
 * never covers the HUD; toggled with the backtick key or from Settings, and
 * remembered per browser.
 */

const STORAGE_KEY = 'dawnbreakers.debugOverlay';
const elements = new Set<HTMLElement>();
let visible = readStoredVisibility();

function readStoredVisibility(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function isDebugOverlayVisible(): boolean {
  return visible;
}

export function setDebugOverlayVisible(value: boolean): void {
  visible = value;
  try {
    localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
  } catch {
    // Private browsing: keep the in-memory choice only.
  }
  for (const element of elements) element.style.display = value ? '' : 'none';
}

/** Register a DOM element whose visibility follows the overlay toggle. */
export function registerDebugElement(element: HTMLElement): void {
  elements.add(element);
  element.style.display = visible ? '' : 'none';
}

export function installDebugOverlayHotkey(): void {
  window.addEventListener('keydown', event => {
    if (event.key === '`' && !event.repeat) setDebugOverlayVisible(!visible);
  });
}

export function attachFpsLabel(game: Phaser.Game): void {
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
  registerDebugElement(label);
  const position = (): void => positionFpsLabel(label);
  position();
  window.addEventListener('resize', position);
  window.addEventListener('orientationchange', () => {
    window.setTimeout(position, 100);
    window.setTimeout(position, 300);
  });
  window.visualViewport?.addEventListener('resize', position);

  window.setInterval(() => {
    if (visible) label.textContent = `FPS ${Math.round(game.loop.actualFps)}`;
  }, 250);
}

function positionFpsLabel(label: HTMLElement): void {
  const insets = measuredSafeAreaInsets();
  const portrait = window.innerHeight > window.innerWidth;
  const topInset = portrait ? insets.top : 0;
  const unsafeTopOffset = topInset > 0 ? Math.round(Math.min(16, Math.max(4, topInset * 0.18))) : 2;
  label.style.top = `${unsafeTopOffset}px`;
  label.style.right = `${Math.max(6, insets.right + 6)}px`;
}
