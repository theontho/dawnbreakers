import Phaser from 'phaser';

/**
 * The map's two cameras. The main camera follows the player and zooms (mouse
 * wheel, pinch, or the + and - keys); a second, fixed camera draws the HUD,
 * the colour wash and the vignette at screen size, so zooming the world never
 * scales the interface. Objects are routed by scroll factor: anything pinned
 * to the screen (`scrollFactor 0`) belongs to the HUD camera.
 */

const MIN_ZOOM = 0.45;
const MAX_ZOOM = 1.6;
const STEP = 1.15;

export interface MapCameras {
  /** World position under a pointer, through the zoomed camera. */
  worldPoint(pointer: Phaser.Input.Pointer): Phaser.Math.Vector2;
  /** Route objects created since the last call to the right camera. */
  update(): void;
}

export function setupMapCameras(scene: Phaser.Scene, trueScale: boolean): MapCameras {
  const main = scene.cameras.main;
  const hud = scene.cameras.add(0, 0, scene.scale.width, scene.scale.height).setName('hud');
  const storageKey = `dawnbreakers.zoom.${trueScale ? 'true' : 'small'}`;
  const routed = new WeakSet<Phaser.GameObjects.GameObject>();
  let lastCount = -1;

  const route = (): void => {
    const list = scene.children.list;
    if (list.length === lastCount) return;
    lastCount = list.length;
    for (const object of list) {
      if (routed.has(object)) continue;
      routed.add(object);
      const pinned = (object as unknown as { scrollFactorX?: number }).scrollFactorX === 0;
      (pinned ? main : hud).ignore(object);
    }
  };

  let zoom = readZoom(storageKey) ?? defaultZoom(scene, trueScale);
  const setZoom = (value: number): void => {
    zoom = Phaser.Math.Clamp(value, MIN_ZOOM, MAX_ZOOM);
    main.setZoom(zoom);
    try {
      localStorage.setItem(storageKey, zoom.toFixed(3));
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

  route();
  return {
    worldPoint: pointer => main.getWorldPoint(pointer.x, pointer.y),
    update: route,
  };
}

/** True-scale maps start a little zoomed out on roomy screens, so a square fits. */
function defaultZoom(scene: Phaser.Scene, trueScale: boolean): number {
  if (!trueScale) return 1;
  return Math.min(scene.scale.width, scene.scale.height * 1.6) >= 1100 ? 0.85 : 0.7;
}

function readZoom(key: string): number | undefined {
  try {
    const value = Number(localStorage.getItem(key));
    return Number.isFinite(value) && value > 0 ? value : undefined;
  } catch {
    return undefined;
  }
}
