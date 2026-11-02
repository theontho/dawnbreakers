import Phaser from 'phaser';
import { PHONE_ZOOM } from './tapZones';

/**
 * The map's two cameras. The main camera follows the player and zooms (mouse
 * wheel, pinch, or the + and - keys); a second, fixed camera draws the HUD,
 * the colour wash and the vignette at screen size, so zooming the world never
 * scales the interface. Objects are routed by scroll factor: anything pinned
 * to the screen (`scrollFactor 0`) belongs to the HUD camera.
 *
 * Every object added to the scene is queued as it arrives and routed just
 * before the next render, once its creator has had the chance to pin it.
 * (Counting the display list is not enough: rebuilding the ambience destroys
 * and creates the same number of objects, which would leave a fresh wash
 * unrouted and drawn by the zoomed world camera as a floating rectangle.)
 */

const MIN_ZOOM = 0.45;
const MAX_ZOOM = 1.6;
const STEP = 1.15;

export interface MapCameras {
  /** World position under a pointer, through the zoomed camera. */
  worldPoint(pointer: Phaser.Input.Pointer): Phaser.Math.Vector2;
}

const ZOOM_KEY = 'dawnbreakers.zoom';

export function setupMapCameras(scene: Phaser.Scene): MapCameras {
  const main = scene.cameras.main;
  const hud = scene.cameras.add(0, 0, scene.scale.width, scene.scale.height).setName('hud');
  let pending: Phaser.GameObjects.GameObject[] = [...scene.children.list];

  const queue = (object: Phaser.GameObjects.GameObject): void => {
    pending.push(object);
  };
  const route = (): void => {
    if (pending.length === 0) return;
    for (const object of pending) {
      if (!object.scene) continue;
      const pinned = (object as unknown as { scrollFactorX?: number }).scrollFactorX === 0;
      (pinned ? main : hud).ignore(object);
    }
    pending = [];
  };
  scene.events.on(Phaser.Scenes.Events.ADDED_TO_SCENE, queue);
  scene.events.on(Phaser.Scenes.Events.PRE_RENDER, route);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.events.off(Phaser.Scenes.Events.ADDED_TO_SCENE, queue);
    scene.events.off(Phaser.Scenes.Events.PRE_RENDER, route);
  });

  let zoom = readZoom() ?? defaultZoom(scene);
  const setZoom = (value: number): void => {
    zoom = Phaser.Math.Clamp(value, MIN_ZOOM, MAX_ZOOM);
    main.setZoom(zoom);
    try {
      localStorage.setItem(ZOOM_KEY, zoom.toFixed(3));
    } catch {
      // Zoom simply is not remembered.
    }
  };
  setZoom(zoom);

  scene.input.on(Phaser.Input.Events.POINTER_WHEEL, (_p: Phaser.Input.Pointer, _over: unknown, _dx: number, dy: number) => {
    setZoom(zoom * Math.exp(-dy * 0.0015));
  });
  // Two-finger pinch on touch screens.
  scene.input.addPointer(1);
  let pinchStart: { distance: number; zoom: number } | undefined;
  scene.input.on(Phaser.Input.Events.POINTER_MOVE, () => {
    const [a, b] = [scene.input.pointer1, scene.input.pointer2];
    if (!a.isDown || !b.isDown) {
      pinchStart = undefined;
      return;
    }
    const distance = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
    pinchStart ??= { distance, zoom };
    setZoom(pinchStart.zoom * (distance / Math.max(1, pinchStart.distance)));
  });
  // `=` shares the + key on most keyboards, and `_` the - key.
  scene.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
    if (e.key === '+' || e.key === '=') setZoom(zoom * STEP);
    else if (e.key === '-' || e.key === '_') setZoom(zoom / STEP);
  });

  return {
    worldPoint: pointer => main.getWorldPoint(pointer.x, pointer.y),
  };
}

/** Maps start a little zoomed out on roomy screens, so a square fits. */
function defaultZoom(scene: Phaser.Scene): number {
  return Math.min(scene.scale.width, scene.scale.height * 1.6) >= 1100 ? 0.85 : PHONE_ZOOM;
}

function readZoom(): number | undefined {
  try {
    const value = Number(localStorage.getItem(ZOOM_KEY));
    return Number.isFinite(value) && value > 0 ? value : undefined;
  } catch {
    return undefined;
  }
}
