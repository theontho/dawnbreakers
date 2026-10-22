import Phaser from 'phaser';
import type { FlagState } from '../dialogue/types';
import type { NpcSpec } from '../data/maps/types';
import { figureScale } from './figureScale';
import { makeTextureGraphics } from './graphicsFactory';
import { TILE_H, type Interactable } from './baseMapTypes';

/**
 * NPC and story-object placement for a map. Each spec becomes an
 * `Interactable` with a sprite, a gentle idle sway, and a small speech mark
 * floating overhead until the player has heard what it has to say.
 *
 * Presence (`NpcSpec.present`) is re-evaluated after every dialogue, so
 * people can arrive or leave as the story moves without a scene restart.
 */

const MARKER_TEXTURE = 'fx-speech-mark';

/** Flag set the first time a dialogue tree is opened. */
export function talkedFlag(dialogueId: string): string {
  return `talked_${dialogueId}`;
}

/** The dialogue an NPC offers right now, honouring its gate. */
export function resolveNpcDialogue(spec: NpcSpec, flags: FlagState): string {
  if (spec.gate && !spec.gate.when(flags)) return spec.gate.lockedDialogue;
  return spec.dialogue;
}

interface PlacedNpc {
  spec: NpcSpec;
  interactable: Interactable;
  sprite: Phaser.GameObjects.Image;
  marker: Phaser.GameObjects.Image;
  sway: Phaser.Tweens.Tween;
  /** Faint copy drawn above scenery when the NPC stands behind it. */
  ghost?: Phaser.GameObjects.Image;
}

/** Above all world sprites, below the ambience wash and HUD. */
const GHOST_DEPTH = 9000;

export interface MapNpcs {
  /** Interactables currently on the map (absent NPCs are excluded). */
  readonly interactables: Interactable[];
  /** Re-check presence and speech marks against the latest flags. */
  refresh(flags: FlagState): void;
}

export function placeMapNpcs(
  scene: Phaser.Scene,
  specs: readonly NpcSpec[],
  blocked: boolean[][],
  gridToScreen: (gx: number, gy: number) => { sx: number; sy: number },
  onInteract: (spec: NpcSpec) => void,
  flags: FlagState,
  occluders: readonly Phaser.GameObjects.Image[],
): MapNpcs {
  ensureMarkerTexture(scene);
  const placed: PlacedNpc[] = specs.map(spec => {
    const pos = gridToScreen(spec.gridX, spec.gridY);
    const footY = pos.sy + TILE_H / 2;
    const sprite = scene.add.image(pos.sx, footY, spec.texture)
      .setOrigin(0.5, 1)
      .setScale(figureScale(spec.texture))
      .setDepth(pos.sy + 1);
    // The speech mark floats above scenery so a hidden speaker is still findable.
    const marker = scene.add.image(pos.sx, footY - sprite.displayHeight - 8, MARKER_TEXTURE)
      .setOrigin(0.5, 1)
      .setDepth(GHOST_DEPTH + 1);
    scene.tweens.add({
      targets: marker,
      y: marker.y - 4,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    const sway = scene.tweens.add({
      targets: sprite,
      scaleY: sprite.scaleY * 1.025,
      duration: Phaser.Math.Between(1500, 2100),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: Phaser.Math.Between(0, 1200),
    });
    return {
      spec,
      sprite,
      marker,
      sway,
      ghost: isOccluded(sprite, occluders) ? addGhost(scene, sprite) : undefined,
      interactable: {
        gridX: spec.gridX,
        gridY: spec.gridY,
        texture: spec.texture,
        prompt: spec.prompt,
        sprite,
        action: () => onInteract(spec),
      },
    };
  });

  const handle: MapNpcs = {
    interactables: [],
    refresh: (latest) => {
      handle.interactables.length = 0;
      // Several specs may share a cell (someone who leaves, someone who arrives):
      // the cell is blocked if anyone present stands on it.
      for (const npc of placed) blocked[npc.spec.gridY]![npc.spec.gridX] = false;
      for (const npc of placed) {
        const here = npc.spec.present ? npc.spec.present(latest) : true;
        npc.sprite.setVisible(here);
        npc.ghost?.setVisible(here);
        if (here) {
          blocked[npc.spec.gridY]![npc.spec.gridX] = true;
          handle.interactables.push(npc.interactable);
          npc.sway.resume();
        } else {
          npc.sway.pause();
        }
        const unheard = !latest[talkedFlag(resolveNpcDialogue(npc.spec, latest))];
        npc.marker.setVisible(here && unheard);
      }
    },
  };
  handle.refresh(flags);
  return handle;
}

/** True when a taller sprite in front covers a good part of this one. */
function isOccluded(sprite: Phaser.GameObjects.Image, occluders: readonly Phaser.GameObjects.Image[]): boolean {
  const body = sprite.getBounds();
  Phaser.Geom.Rectangle.Inflate(body, -body.width * 0.25, -body.height * 0.2);
  return occluders.some(o => o.depth > sprite.depth && Phaser.Geom.Rectangle.Overlaps(o.getBounds(), body));
}

/**
 * The classic isometric "x-ray": a faint golden silhouette above the scenery.
 * Far cheaper than masking every occluder, which costs an extra render pass
 * per masked sprite per frame.
 */
function addGhost(scene: Phaser.Scene, sprite: Phaser.GameObjects.Image): Phaser.GameObjects.Image {
  return scene.add.image(sprite.x, sprite.y, sprite.texture.key)
    .setOrigin(sprite.originX, sprite.originY)
    .setScale(sprite.scaleX, sprite.scaleY)
    .setDepth(GHOST_DEPTH)
    .setTint(0xf3d98a)
    .setAlpha(0.42);
}

function ensureMarkerTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(MARKER_TEXTURE)) return;
  const g = makeTextureGraphics(scene);
  g.fillStyle(0x1a120a, 0.9);
  g.fillRoundedRect(1, 1, 22, 14, 6);
  g.fillTriangle(8, 14, 14, 14, 9, 19);
  g.lineStyle(1.5, 0xf3d98a, 1);
  g.strokeRoundedRect(1, 1, 22, 14, 6);
  g.fillStyle(0xf3d98a, 1);
  for (const x of [7, 12, 17]) g.fillCircle(x, 8, 1.6);
  g.generateTexture(MARKER_TEXTURE, 24, 20);
  g.destroy();
}
