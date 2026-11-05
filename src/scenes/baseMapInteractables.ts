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

interface RevealMaskCandidate {
  sprite: Phaser.GameObjects.Image;
  bounds: Phaser.Geom.Rectangle;
  create: () => RevealMaskState | undefined;
}

export interface RevealMaskHandle {
  states: RevealMaskState[];
  /** Occluders with no mask yet; promoted to `states` on first overlap. */
  candidates: RevealMaskCandidate[];
  /** Last player reveal target the masks were redrawn for. */
  lastPlayerReveal?: RevealTarget;
}

export function playerRevealTarget(player: Phaser.GameObjects.Image): RevealTarget {
  return revealTargetForSprite(player, 0.68, 38, 60);
}

/**
 * Soft see-through holes in scenery the player walks behind. Masks are
 * expensive (each one renders its sprite through an extra framebuffer), so a
 * mask is only built the first time the player passes behind that sprite,
 * and only applied while they are there. People hidden behind scenery are
 * handled without masks, by silhouettes (see `mapNpcs.ts`).
 */
export function setupPlayerRevealMasks(
  scene: Phaser.Scene,
  occludableSprites: Phaser.GameObjects.Image[],
  player: Phaser.GameObjects.Image,
  sceneKey: string,
): RevealMaskHandle {
  const handle: RevealMaskHandle = { states: [], candidates: [] };
  const soft = scene.game.renderer.type === Phaser.WEBGL;
  let textureIndex = 0;
  for (const sprite of occludableSprites) {
    const bounds = sprite.getBounds();
    handle.candidates.push({
      sprite,
      bounds,
      create: () => soft
        ? createSoftRevealMaskState(scene, sprite, bounds, `${sceneKey}-reveal-mask-${textureIndex++}`)
        : createHardRevealMaskState(scene, sprite, bounds),
    });
  }
  updatePlayerRevealMasks(handle, player, true);
  return handle;
}

export function updatePlayerRevealMasks(
  handle: RevealMaskHandle,
  player: Phaser.GameObjects.Image,
  force = false,
): void {
  if (handle.states.length === 0 && handle.candidates.length === 0) return;
  const playerReveal = playerRevealTarget(player);
  const last = handle.lastPlayerReveal;
  if (!force && last && revealTargetsClose(last, playerReveal)) {
    return;
  }

  for (let i = handle.candidates.length - 1; i >= 0; i--) {
    const candidate = handle.candidates[i]!;
    if (candidate.sprite.depth > playerReveal.depth
      && circleIntersectsRect(playerReveal.x, playerReveal.y, playerReveal.radius, candidate.bounds)) {
      handle.candidates.splice(i, 1);
      const state = candidate.create();
      if (state) handle.states.push(state);
    }
  }

  for (const state of handle.states) {
    const playerRevealsState = state.sprite.depth > playerReveal.depth
      && circleIntersectsRect(playerReveal.x, playerReveal.y, playerReveal.radius, state.bounds);

    if (playerRevealsState) {
      if (force || !state.dynamicReveal || !revealTargetsClose(state.dynamicReveal, playerReveal)) {
        redrawRevealMaskState(state, [playerReveal]);
        state.dynamicReveal = playerReveal;
      }
    } else if (force || state.dynamicReveal) {
      redrawRevealMaskState(state, []);
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

export function destroyPlayerRevealMasks(
  handle: RevealMaskHandle,
  scene: Phaser.Scene,
  occludableSprites: Phaser.GameObjects.Image[],
): void {
  for (const sprite of occludableSprites) sprite.clearMask(false);
  for (const state of handle.states) {
    state.mask?.destroy();
    state.maskObject?.destroy();
    state.maskShape?.destroy();
    if (state.textureKey && scene.textures.exists(state.textureKey)) scene.textures.remove(state.textureKey);
  }
  handle.states = [];
  handle.candidates = [];
  handle.lastPlayerReveal = undefined;
}

/** Above the ambience wash and particles so highlights stay legible at night. */
const HIGHLIGHT_DEPTH = 9700;

export interface InteractableHighlightHandle {
  /** One ring per interactable that can ever be on the map, and one per exit cell. */
  rings: Array<{ graphics: Phaser.GameObjects.Graphics; of?: Interactable }>;
  tween?: Phaser.Tweens.Tween;
  toggled: boolean;
  held: boolean;
  /** The interactables on the map now; a ring shows only for these. */
  present: ReadonlySet<Interactable>;
}

export function createInteractableHighlightHandle(): InteractableHighlightHandle {
  return { rings: [], toggled: false, held: false, present: new Set() };
}

/**
 * Where an interactable's ring goes: round its sprite, or, for a door or a
 * story object the scenery draws, round the doorway it is tapped at.
 */
function highlightTarget(interactable: Interactable): RevealTarget {
  if (interactable.sprite) return revealTargetForSprite(interactable.sprite, 0.62, 34, 54);
  const area = interactable.area;
  return {
    x: area.centerX,
    y: area.centerY,
    depth: 0,
    radius: Phaser.Math.Clamp(Math.max(area.width, area.height) * 0.62, 34, 54),
  };
}

/**
 * The press-H / hold-Tab rings: one round every person, story object and
 * door that can ever be on the map (`everyone`), shown only while it is
 * present, and one on every exit cell.
 */
export function setupInteractableHighlights(
  scene: Phaser.Scene,
  everyone: readonly Interactable[],
  exits: MapExit[],
  gridToScreen: (gx: number, gy: number) => { sx: number; sy: number },
  handle: InteractableHighlightHandle,
): void {
  for (const interactable of everyone) {
    const ring = highlightTarget(interactable);
    const highlight = scene.add.graphics().setDepth(HIGHLIGHT_DEPTH).setVisible(false);
    highlight.fillStyle(0xf3d98a, 0.12);
    highlight.fillCircle(ring.x, ring.y, ring.radius);
    highlight.lineStyle(3, 0xf3d98a, 0.85);
    highlight.strokeCircle(ring.x, ring.y, ring.radius);
    highlight.lineStyle(1, 0xffffff, 0.55);
    highlight.strokeCircle(ring.x, ring.y, ring.radius * 0.72);
    handle.rings.push({ graphics: highlight, of: interactable });
  }

  for (const exit of exits) {
    const pos = gridToScreen(exit.fromX, exit.fromY);
    const highlight = scene.add.graphics().setDepth(HIGHLIGHT_DEPTH).setVisible(false);
    highlight.fillStyle(0x66d9ff, 0.16);
    highlight.fillEllipse(pos.sx, pos.sy, 58, 28, 48);
    highlight.lineStyle(3, 0x66d9ff, 0.9);
    highlight.strokeEllipse(pos.sx, pos.sy, 58, 28, 48);
    highlight.lineStyle(1, 0xffffff, 0.55);
    highlight.strokeEllipse(pos.sx, pos.sy, 42, 20, 48);
    handle.rings.push({ graphics: highlight });
  }

  if (handle.rings.length > 0) {
    handle.tween = scene.tweens.add({
      targets: handle.rings.map(r => r.graphics),
      alpha: 0.52,
      duration: 720,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    handle.tween.pause();
  }
}

/** Shows the rings while H is toggled or Tab held; `present` updates who is on the map. */
export function applyInteractableHighlightVisibility(
  handle: InteractableHighlightHandle,
  present?: readonly Interactable[],
): void {
  if (present) handle.present = new Set(present);
  const visible = handle.toggled || handle.held;
  for (const { graphics, of } of handle.rings) {
    const show = visible && (!of || handle.present.has(of));
    if (graphics.visible !== show) graphics.setVisible(show);
  }
  if (visible) handle.tween?.resume();
  else handle.tween?.pause();
}
