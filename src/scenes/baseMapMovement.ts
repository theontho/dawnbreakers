import Phaser from 'phaser';
import { t } from '../i18n';
import { getFlags } from '../dialogue/flags';
import { TILE_H, type Interactable, type MapExit } from './baseMapTypes';
import type { GridPoint as PathPoint } from './mapPathing';

interface GridPoint {
  x: number;
  y: number;
}

interface MoveDirection {
  dx: number;
  dy: number;
}

interface MovementState {
  moveCooldown: number;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  wasdKeys: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  mobileMoveDirection?: MoveDirection;
  /** Queued click-to-walk steps; consumed one per move, cleared by manual input. */
  path: PathPoint[];
  playerGrid: GridPoint;
  player: Phaser.GameObjects.Image;
  blocked: boolean[][];
  exits: MapExit[];
  inBounds: (x: number, y: number) => boolean;
  gridToScreen: (x: number, y: number) => { sx: number; sy: number };
  transitionTo: (exit: MapExit) => void;
  /** Called as the player steps onto a cell (footsteps). */
  onStep: (x: number, y: number) => void;
  /** Called when the player walks into an exit the story has not opened yet. */
  onLockedExit: () => void;
  updatePlayerRevealMasks: (force?: boolean) => void;
}

interface InteractionPromptState {
  interactables: Interactable[];
  playerGrid: GridPoint;
  exits: MapExit[];
  promptText: Phaser.GameObjects.Text;
  exitPromptText: Phaser.GameObjects.Text;
  mobileActionButton?: Phaser.GameObjects.Rectangle;
  mobileActionLabel?: Phaser.GameObjects.Text;
  interactKey: Phaser.Input.Keyboard.Key;
  triggerInteraction: () => void;
}

interface VisibleGameObject {
  visible: boolean;
  setVisible(visible: boolean): unknown;
}

interface AlphaGameObject {
  alpha: number;
  setAlpha(alpha: number): unknown;
}

export function handleBaseMapMovement(scene: Phaser.Scene, state: MovementState): number {
  if (state.moveCooldown > 0) return state.moveCooldown;
  const { W, A, S, D } = state.wasdKeys;

  let dx = 0;
  let dy = 0;
  if (state.cursors.left?.isDown || A.isDown) dx = -1;
  else if (state.cursors.right?.isDown || D.isDown) dx = 1;
  else if (state.cursors.up?.isDown || W.isDown) dy = -1;
  else if (state.cursors.down?.isDown || S.isDown) dy = 1;
  else if (state.mobileMoveDirection) {
    dx = state.mobileMoveDirection.dx;
    dy = state.mobileMoveDirection.dy;
  }

  if (dx !== 0 || dy !== 0) {
    state.path.length = 0;
  } else if (state.path.length > 0) {
    const next = state.path.shift()!;
    dx = Math.sign(next.x - state.playerGrid.x);
    dy = Math.sign(next.y - state.playerGrid.y);
  }

  if (dx === 0 && dy === 0) return state.moveCooldown;

  const nx = state.playerGrid.x + dx;
  const ny = state.playerGrid.y + dy;

  if (!state.inBounds(nx, ny)) {
    const exit = state.exits.find(e =>
      e.fromX === state.playerGrid.x && e.fromY === state.playerGrid.y &&
      e.dx === dx && e.dy === dy);
    if (exit && exitIsOpen(exit)) {
      state.transitionTo(exit);
      return 600;
    }
    if (exit) {
      state.onLockedExit();
      return 400;
    }
    return state.moveCooldown;
  }

  if (state.blocked[ny]![nx]) {
    state.path.length = 0;
    return state.moveCooldown;
  }

  state.playerGrid.x = nx;
  state.playerGrid.y = ny;
  state.onStep(nx, ny);
  const pos = state.gridToScreen(nx, ny);
  scene.tweens.add({
    targets: state.player,
    x: pos.sx, y: pos.sy + TILE_H / 2,
    duration: 140, ease: 'Sine.easeInOut',
    onUpdate: () => {
      state.player.setDepth(state.player.y + 2);
    },
    onComplete: () => state.updatePlayerRevealMasks(true),
  });
  return 150;
}

export function nearestInteractable(
  interactables: readonly Interactable[],
  playerGrid: GridPoint,
): Interactable | undefined {
  return interactables.find(i => {
    const dx = Math.abs(i.gridX - playerGrid.x);
    const dy = Math.abs(i.gridY - playerGrid.y);
    return dx + dy === 1;
  });
}

export function updateInteractionPrompt(state: InteractionPromptState): void {
  const near = nearestInteractable(state.interactables, state.playerGrid);
  if (near) {
    setTextIfChanged(state.promptText, t(near.prompt));
    setVisibleIfChanged(state.promptText, true);
    setAlphaIfChanged(state.mobileActionButton, 1);
    setAlphaIfChanged(state.mobileActionLabel, 1);
    if (Phaser.Input.Keyboard.JustDown(state.interactKey)) state.triggerInteraction();
  } else {
    setTextIfChanged(state.promptText, '');
    setVisibleIfChanged(state.promptText, false);
    setAlphaIfChanged(state.mobileActionButton, 0.62);
    setAlphaIfChanged(state.mobileActionLabel, 0.62);
  }

  const onExit = state.exits.find(e =>
    e.fromX === state.playerGrid.x && e.fromY === state.playerGrid.y);
  const exitText = onExit ? t(exitIsOpen(onExit) ? onExit.label : onExit.lockedLabel ?? onExit.label) : '';
  setTextIfChanged(state.exitPromptText, exitText);
  setVisibleIfChanged(state.exitPromptText, Boolean(onExit));
}

export function exitIsOpen(exit: MapExit): boolean {
  return !exit.requires || exit.requires(getFlags());
}

function setTextIfChanged(text: Phaser.GameObjects.Text, value: string): void {
  if (text.text !== value) text.setText(value);
}

function setVisibleIfChanged(object: VisibleGameObject, visible: boolean): void {
  if (object.visible !== visible) object.setVisible(visible);
}

function setAlphaIfChanged(
  object: AlphaGameObject | undefined,
  alpha: number,
): void {
  if (object && object.alpha !== alpha) object.setAlpha(alpha);
}
