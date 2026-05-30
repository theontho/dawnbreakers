/**
 * Reveal-mask + highlight setup for interactables on a `MapScene`.
 *
 * Pulled out of `MapScene.ts` to keep that file under the AGENTS.md
 * 500 LOC guideline. The masks reveal occluding sprites when the
 * player or an NPC is behind them; the highlights are the press-`H`
 * /`Tab` ring that points players at interactable cells.
 */
import Phaser from 'phaser';
import {
  circleIntersectsRect,
  createHardRevealMaskState,
  createSoftRevealMaskState,
  redrawRevealMaskState,
  revealTargetForSprite,
  type RevealMaskState,
  type RevealTarget,
} from './baseMapReveal';
import type { Interactable, MapExit } from './baseMapTypes';

export interface RevealMaskHandle {
  states: RevealMaskState[];
  /** Last player reveal target the masks were redrawn for. */
  lastPlayerReveal?: RevealTarget;
}

export function interactableRevealTargets(interactables: Interactable[]): RevealTarget[] {
  return interactables
    .map((interactable) => interactable.sprite)
    .filter((sprite): sprite is Phaser.GameObjects.Image => Boolean(sprite))
    .map((sprite) => revealTargetForSprite(sprite, 0.62, 34, 54));
}

export function playerRevealTarget(player: Phaser.GameObjects.Image): RevealTarget {
  return revealTargetForSprite(player, 0.68, 38, 60);
}

export function setupInteractableRevealMasks(
  scene: Phaser.Scene,
  occludableSprites: Phaser.GameObjects.Image[],
  interactables: Interactable[],
  player: Phaser.GameObjects.Image,
  sceneKey: string,
): RevealMaskHandle {
  const handle: RevealMaskHandle = { states: [] };
  if (occludableSprites.length === 0) return handle;

  const reveals = interactableRevealTargets(interactables);
  for (const sprite of occludableSprites) {
    const bounds = sprite.getBounds();
    const staticReveals = reveals.filter((reveal) =>
      sprite.depth > reveal.depth && circleIntersectsRect(reveal.x, reveal.y, reveal.radius, bounds));

    if (scene.game.renderer.type === Phaser.WEBGL) {
      const textureKey = `${sceneKey}-reveal-mask-${handle.states.length}`;
      const state = createSoftRevealMaskState(scene, sprite, bounds, staticReveals, textureKey);
      if (state) handle.states.push(state);
    } else {
      handle.states.push(createHardRevealMaskState(scene, sprite, bounds, staticReveals));
    }
  }
  updatePlayerRevealMasks(handle, player, true);
  return handle;
}

export function updatePlayerRevealMasks(
  handle: RevealMaskHandle,
  player: Phaser.GameObjects.Image,
  force = false,
): void {
  if (handle.states.length === 0) return;
  const playerReveal = playerRevealTarget(player);
  const last = handle.lastPlayerReveal;
  if (!force && last && revealTargetsClose(last, playerReveal)) {
    return;
  }

  for (const state of handle.states) {
    const playerRevealsState = state.sprite.depth > playerReveal.depth
      && circleIntersectsRect(playerReveal.x, playerReveal.y, playerReveal.radius, state.bounds);

    if (playerRevealsState) {
      if (force || !state.dynamicReveal || !revealTargetsClose(state.dynamicReveal, playerReveal)) {
        redrawRevealMaskState(state, [...state.staticReveals, playerReveal]);
        state.dynamicReveal = playerReveal;
      }
    } else if (force || state.dynamicReveal) {
      redrawRevealMaskState(state, state.staticReveals);
      state.dynamicReveal = undefined;
    }
  }
  handle.lastPlayerReveal = playerReveal;
}

function revealTargetsClose(a: RevealTarget, b: RevealTarget): boolean {
  return Math.abs(a.x - b.x) < 0.5
    && Math.abs(a.y - b.y) < 0.5
    && Math.abs(a.depth - b.depth) < 0.5
    && Math.abs(a.radius - b.radius) < 0.5;
}

export function destroyInteractableRevealMasks(
  handle: RevealMaskHandle,
  scene: Phaser.Scene,
  occludableSprites: Phaser.GameObjects.Image[],
): void {
  for (const sprite of occludableSprites) sprite.clearMask(true);
  for (const state of handle.states) {
    state.maskObject?.destroy();
    state.maskShape?.destroy();
    if (state.textureKey && scene.textures.exists(state.textureKey)) scene.textures.remove(state.textureKey);
  }
  handle.states = [];
  handle.lastPlayerReveal = undefined;
}

export interface InteractableHighlightHandle {
  graphics: Phaser.GameObjects.Graphics[];
  tween?: Phaser.Tweens.Tween;
  toggled: boolean;
  held: boolean;
}

export function createInteractableHighlightHandle(): InteractableHighlightHandle {
  return { graphics: [], toggled: false, held: false };
}

export function setupInteractableHighlights(
  scene: Phaser.Scene,
  interactables: Interactable[],
  exits: MapExit[],
  gridToScreen: (gx: number, gy: number) => { sx: number; sy: number },
  handle: InteractableHighlightHandle,
): void {
  for (const reveal of interactableRevealTargets(interactables)) {
    const highlight = scene.add.graphics().setDepth(9000).setVisible(false);
    highlight.fillStyle(0xf3d98a, 0.12);
    highlight.fillCircle(reveal.x, reveal.y, reveal.radius);
    highlight.lineStyle(3, 0xf3d98a, 0.85);
    highlight.strokeCircle(reveal.x, reveal.y, reveal.radius);
    highlight.lineStyle(1, 0xffffff, 0.55);
    highlight.strokeCircle(reveal.x, reveal.y, reveal.radius * 0.72);
    handle.graphics.push(highlight);
  }

  for (const exit of exits) {
    const pos = gridToScreen(exit.fromX, exit.fromY);
    const highlight = scene.add.graphics().setDepth(pos.sy + 9000).setVisible(false);
    highlight.fillStyle(0x66d9ff, 0.16);
    highlight.fillEllipse(pos.sx, pos.sy, 58, 28, 48);
    highlight.lineStyle(3, 0x66d9ff, 0.9);
    highlight.strokeEllipse(pos.sx, pos.sy, 58, 28, 48);
    highlight.lineStyle(1, 0xffffff, 0.55);
    highlight.strokeEllipse(pos.sx, pos.sy, 42, 20, 48);
    handle.graphics.push(highlight);
  }

  if (handle.graphics.length > 0) {
    handle.tween = scene.tweens.add({
      targets: handle.graphics,
      alpha: 0.52,
      duration: 720,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    handle.tween.pause();
  }
}

export function applyInteractableHighlightVisibility(handle: InteractableHighlightHandle): void {
  const visible = handle.toggled || handle.held;
  for (const highlight of handle.graphics) {
    if (highlight.visible !== visible) highlight.setVisible(visible);
  }
  if (visible) handle.tween?.resume();
  else handle.tween?.pause();
}
