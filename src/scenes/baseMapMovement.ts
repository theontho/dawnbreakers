import Phaser from 'phaser';
import { t } from '../i18n';
import { TILE_H, type Interactable, type MapExit } from './baseMapTypes';

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
  playerGrid: GridPoint;
  player: Phaser.GameObjects.Image;
  blocked: boolean[][];
  exits: MapExit[];
  inBounds: (x: number, y: number) => boolean;
  gridToScreen: (x: number, y: number) => { sx: number; sy: number };
  transitionTo: (exit: MapExit) => void;
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

  if (dx === 0 && dy === 0) return state.moveCooldown;

  const nx = state.playerGrid.x + dx;
  const ny = state.playerGrid.y + dy;

  if (!state.inBounds(nx, ny)) {
    const exit = state.exits.find(e =>
      e.fromX === state.playerGrid.x && e.fromY === state.playerGrid.y &&
      e.dx === dx && e.dy === dy);
    if (exit) {
      state.transitionTo(exit);
      return 600;
    }
    return state.moveCooldown;
  }

  if (state.blocked[ny]![nx]) return state.moveCooldown;

  state.playerGrid.x = nx;
  state.playerGrid.y = ny;
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
  const exitText = onExit ? t(onExit.label) : '';
  setTextIfChanged(state.exitPromptText, exitText);
  setVisibleIfChanged(state.exitPromptText, Boolean(onExit));
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
