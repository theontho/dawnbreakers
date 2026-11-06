import Phaser from 'phaser';
import { ensureTexturesNamedIn, reportMissingTextures } from '../assets/mapAssetLibrary';
import { applyMapAudio, playFootstep, playSfx } from '../audio';
import { chapterByScene, type Chapter } from '../data/chapters';
import { dialogues } from '../data/dialogues';
import { applyEffect, getFlags } from '../dialogue/flags';
import { saveBookmark } from '../dialogue/progress';
import { isNarrowLayout, responsiveMargin, restartSceneOnResize } from '../ui/responsive';
import { gridToIsoScreen } from './isoGeometry';
import {
  TILE_H,
  type Building,
  type Decor,
  type Interactable,
  type MapExit,
  type SceneSpawnData,
  type TileKind,
} from './baseMapTypes';
import { createBaseMapHud } from './baseMapHud';
import { getBaseMapWorldBounds, renderBaseMapWorld, renderExitGlows, WORLD_BACKDROP_COLOR, type RenderedWorld } from './baseMapWorld';
import { handleBaseMapEnding, launchBaseMapDialogue, openBaseMapChapterEnd, playerTexture, scheduleOpening } from './baseMapFlow';
import {
  exitIsOpen,
  handleBaseMapMovement,
  nearestInteractable,
  updateInteractionPrompt,
} from './baseMapMovement';
import {
  applyInteractableHighlightVisibility,
  createInteractableHighlightHandle,
  destroyPlayerRevealMasks,
  setupInteractableHighlights,
  setupPlayerRevealMasks,
  updatePlayerRevealMasks,
  type InteractableHighlightHandle,
  type RevealMaskHandle,
} from './baseMapInteractables';
import { inBounds } from './baseMapTileCanvas';
import { nearestFreeCell } from './mapExits';
import { placeMapDoors, type MapDoors } from './mapDoors';
import { setupMapRemarks, type MapRemarks } from './mapRemarks';
import { buildWorldData, refreshBlocking } from './mapWorldData';
import { setupMapCameras, type MapCameras } from './mapCamera';
import { createMapAmbience, emitsFire, type AmbienceHandle } from './mapAmbience';
import { placeMapNpcs, resolveNpcDialogue, talkedFlag, type MapNpcs } from './mapNpcs';
import { createMapKeys, pollMapKeys, type MapKeys } from './mapKeys';
import { createObjectiveHud, type ObjectiveHud } from './mapObjectiveHud';
import { findPath, screenToGrid, type GridPoint } from './mapPathing';
import { streetFronts } from './streetFronts';
import { PHONE_ZOOM, tapTarget, tapZone } from './tapZones';
import type { DoorSpec, MapDefinition, NpcSpec } from '../data/maps/types';
import type { DialogueTravel, FlagState } from '../dialogue/types';

const UI_DEPTH = 10000;

/**
 * Concrete walkable map scene driven by a `MapDefinition` (data). One Phaser
 * scene instance per chapter location. Handles iso rendering, grid and
 * click-to-walk movement, NPC interaction, the HUD, and edge-of-map exits.
 *
 * To add a new map: add a `MapDefinition` under `src/data/maps/` and register
 * it in `src/data/maps/index.ts`. `main.ts` does the rest.
 */
export class MapScene extends Phaser.Scene {
  private readonly definition: MapDefinition;
  private readonly chapter: Chapter | undefined;

  private player!: Phaser.GameObjects.Image;
  private playerGrid = { x: 0, y: 0 };
  private map: TileKind[][] = [];
  private blocked: boolean[][] = [];
  /** Blocking from the ground, buildings and fixed props, before anything flag-dependent. */
  private staticBlocked: boolean[][] = [];
  private npcs!: MapNpcs;
  private buildings: Building[] = [];
  private decor: Decor[] = [];
  private exits: MapExit[] = [];
  private occludableSprites: Phaser.GameObjects.Image[] = [];
  private conditionalDecor: RenderedWorld['conditionalDecor'] = [];
  private ambience?: AmbienceHandle;
  private doors!: MapDoors;
  private mapCameras!: MapCameras;
  private restoreAudio: () => void = () => {};
  private revealMasks: RevealMaskHandle = { states: [], candidates: [] };
  /** Started from chapter select: play the opening narration again. */
  private replayOpening = false;
  private highlights: InteractableHighlightHandle = createInteractableHighlightHandle();
  private refreshExitGlows: () => void = () => {};
  private objectiveHud?: ObjectiveHud;

  private promptText!: Phaser.GameObjects.Text;
  private exitPromptText!: Phaser.GameObjects.Text;
  private remarks!: MapRemarks;
  private endingShown = false;

  private keys!: MapKeys;
  private moveCooldown = 0;
  private walkPath: GridPoint[] = [];
  /** NPC the player clicked; interact once the walk ends beside it. */
  private walkTarget?: Interactable;

  private originX = 0;
  private originY = 90;

  constructor(definition: MapDefinition) {
    super(definition.key);
    this.definition = definition;
    this.chapter = chapterByScene(definition.key);
  }

  init(data: SceneSpawnData): void {
    const spawn = this.definition.spawn;
    this.replayOpening = data.replayOpening === true;
    this.playerGrid = { x: data.spawnX ?? spawn.x, y: data.spawnY ?? spawn.y };
    this.map = [];
    this.blocked = [];
    this.buildings = [];
    this.decor = [];
    this.exits = [];
    this.occludableSprites = [];
    this.conditionalDecor = [];
    this.ambience = undefined;
    this.revealMasks = { states: [], candidates: [] };
    this.highlights = createInteractableHighlightHandle();
    this.objectiveHud = undefined;
    this.endingShown = false;
    this.walkPath = [];
    this.walkTarget = undefined;
    this.moveCooldown = 0;
  }

  create(): void {
    restartSceneOnResize(this, () => ({
      spawnX: this.playerGrid.x,
      spawnY: this.playerGrid.y,
    }));

    const { width, height } = this.scale;
    const size = { width, height };
    this.originX = width / 2;
    this.originY = responsiveMargin(size) + (isNarrowLayout(size) ? 62 : 58);

    this.buildWorldData();
    ensureTexturesNamedIn(this, {
      buildings: this.buildings,
      decor: this.decor,
      npcs: this.definition.npcs,
      doors: this.definition.doors,
      player: playerTexture(this.definition, this.chapter),
    });
    this.cameras.main.setBackgroundColor(WORLD_BACKDROP_COLOR);
    const world = renderBaseMapWorld(this, this.worldState());
    this.definition.animate?.(this, { x: this.originX, y: this.originY });
    this.occludableSprites = world.occludableSprites;
    this.conditionalDecor = world.conditionalDecor;
    this.refreshDecor(getFlags());
    this.refreshExitGlows = renderExitGlows(this, this.worldState());
    this.doors = placeMapDoors(
      this,
      this.definition.doors ?? [],
      (gx, gy) => this.gridToScreen(gx, gy),
      door => this.enterDoor(door),
      () => playSfx('locked'),
      getFlags(),
    );
    const fronts = streetFronts(this.definition.buildings);
    this.npcs = placeMapNpcs(
      this,
      this.definition.npcs,
      this.blocked,
      (gx, gy) => this.gridToScreen(gx, gy),
      spec => this.talkTo(spec),
      getFlags(),
      this.occludableSprites,
      this.doors.interactables,
      (gx, gy) => fronts.find(f => f.door?.x === gx && f.door.y === gy)?.door?.foot,
    );
    // Arrivals across a widened exit can land on a blocked cell: step aside.
    this.playerGrid = nearestFreeCell(this.blocked, this.playerGrid.x, this.playerGrid.y);
    this.spawnPlayer();
    this.applyAmbience(getFlags());
    this.revealMasks = setupPlayerRevealMasks(this, this.occludableSprites, this.player, this.scene.key);
    setupInteractableHighlights(
      this, this.npcs.everyone, this.exits, (gx, gy) => this.gridToScreen(gx, gy), this.highlights,
    );
    applyInteractableHighlightVisibility(this.highlights, this.npcs.interactables);
    this.setupInput();
    this.setupHUD(width, height);
    this.remarks = setupMapRemarks(
      this, this.scene.key, this.definition.remarks ?? [], this.definition.companion, this.playerGrid,
      (gx, gy) => this.gridToScreen(gx, gy), () => this.exitPromptText.y - 24,
    );
    this.setupCameraFollow(width, height);
    this.mapCameras = setupMapCameras(this);
    this.events.on(Phaser.Scenes.Events.RESUME, this.handleSceneResume, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off(Phaser.Scenes.Events.RESUME, this.handleSceneResume, this);
      destroyPlayerRevealMasks(this.revealMasks, this, this.occludableSprites);
    });

    if (import.meta.env.DEV) reportMissingTextures(this);
    this.cameras.main.fadeIn(300, 0, 0, 0);
    this.bookmark();
    scheduleOpening(this, this.definition, this.chapter, tree =>
      launchBaseMapDialogue(this, tree, travel => this.afterDialogue(travel)),
    this.replayOpening);
  }

  private bookmark(): void {
    saveBookmark({ scene: this.scene.key, x: this.playerGrid.x, y: this.playerGrid.y });
  }

  // ---------- world ----------

  private buildWorldData(): void {
    const world = buildWorldData(this, this.definition);
    ({ map: this.map, blocked: this.blocked, staticBlocked: this.staticBlocked, buildings: this.buildings, decor: this.decor, exits: this.exits } = world);
  }

  /** Brings blocking and flag-dependent props in step with the story; see refreshBlocking. */
  private refreshDecor(flags: FlagState): void {
    refreshBlocking({ blocked: this.blocked, staticBlocked: this.staticBlocked }, this.definition, this.conditionalDecor, flags);
  }

  private applyAmbience(flags: FlagState): void {
    const { ambience } = this.definition;
    if (this.ambience && typeof ambience !== 'function') return;
    this.ambience?.destroy();
    const resolved = typeof ambience === 'function' ? ambience(flags) : ambience;
    const decor = this.decor.filter(item => !item.present || item.present(flags));
    this.ambience = createMapAmbience(this, resolved, decor, this.definition, (gx, gy) => this.gridToScreen(gx, gy));
    const fire = decor.some(item => emitsFire(item.texture));
    this.restoreAudio = () => applyMapAudio(resolved, fire);
    this.restoreAudio();
  }

  private gridToScreen(gx: number, gy: number): { sx: number; sy: number } {
    return gridToIsoScreen(this.originX, this.originY, gx, gy);
  }

  private worldState() {
    return {
      mapWidth: this.definition.width,
      mapHeight: this.definition.height,
      originX: this.originX,
      originY: this.originY,
      map: this.map,
      interior: this.definition.interior,
      water: this.definition.water,
      blocked: this.blocked,
      buildings: this.buildings,
      decor: this.decor,
      exits: this.exits,
    };
  }

  private setupCameraFollow(width: number, height: number): void {
    const bounds = getBaseMapWorldBounds(this, this.worldState(), this.player, this.npcs.interactables, width, height);
    this.cameras.main
      .setRoundPixels(true)
      .setBounds(bounds.x, bounds.y, bounds.width, bounds.height);

    this.cameras.main.startFollow(this.player, true, 0.18, 0.18);
    this.cameras.main.centerOn(this.player.x, this.player.y);
  }

  private spawnPlayer(): void {
    const pos = this.gridToScreen(this.playerGrid.x, this.playerGrid.y);
    this.player = this.add.image(pos.sx, pos.sy + TILE_H / 2, playerTexture(this.definition, this.chapter))
      .setOrigin(0.5, 1).setDepth(pos.sy + 2);
  }

  // ---------- dialogue ----------

  private talkTo(spec: NpcSpec): void {
    const id = resolveNpcDialogue(spec, getFlags());
    const tree = dialogues[id];
    if (!tree) {
      console.warn(`Unknown dialogue "${id}" on ${this.scene.key}`);
      return;
    }
    applyEffect({ set: { [talkedFlag(id)]: true } });
    this.walkPath.length = 0;
    this.walkTarget = undefined;
    launchBaseMapDialogue(
      this,
      tree,
      travel => this.afterDialogue(travel),
    );
  }

  /** Flags may have changed: refresh everything that reads them, or go where the dialogue sent the player. */
  private afterDialogue(travel?: DialogueTravel): void {
    if (travel) {
      this.transitionTo({ targetScene: travel.scene, targetSpawnX: travel.spawnX, targetSpawnY: travel.spawnY });
      return;
    }
    this.bookmark();
    const flags = getFlags();
    this.refreshDecor(flags);
    this.doors.refresh(flags);
    this.npcs.refresh(flags);
    applyInteractableHighlightVisibility(this.highlights, this.npcs.interactables);
    this.remarks.refresh(flags);
    this.applyAmbience(flags);
    this.refreshExitGlows();
    this.objectiveHud?.update(flags);
    this.endingShown = handleBaseMapEnding(this, this.endingShown, chapterId => {
      openBaseMapChapterEnd(this, chapterId);
    });
  }

  // ---------- input & HUD ----------

  private setupInput(): void {
    this.keys = createMapKeys(this);
    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.handleWorldPointer, this);
  }

  /** Click or tap on the ground: walk there, and talk if it was a person. */
  private handleWorldPointer(pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]): void {
    if (over.length > 0) return; // a HUD button took it
    const at = this.mapCameras.worldPoint(pointer);
    const target = screenToGrid(this.originX, this.originY, at.x, at.y);
    // A person, story object or door takes the tap anywhere in its zone, a fingertip across at least.
    const npc = tapTarget(this.npcs.interactables, at.x, at.y, this.cameras.main.zoom);
    if (npc) {
      const path = findPath(this.blocked, this.playerGrid, { x: npc.gridX, y: npc.gridY });
      if (!path) return;
      this.walkPath = path;
      this.walkTarget = npc;
      if (path.length === 0) npc.action();
      return;
    }
    // Clicking an open exit's glowing cell, or just beyond it, goes through.
    const exit = this.exits.find(e => exitIsOpen(e) &&
      ((e.fromX === target.x && e.fromY === target.y) || (e.fromX + e.dx === target.x && e.fromY + e.dy === target.y)));
    const goal = exit ? { x: exit.fromX, y: exit.fromY } : target;
    const path = findPath(this.blocked, this.playerGrid, goal);
    if (!path) return;
    if (exit) path.push({ x: exit.fromX + exit.dx, y: exit.fromY + exit.dy });
    this.walkPath = path;
    this.walkTarget = undefined;
  }

  private setupHUD(width: number, height: number): void {
    const hud = createBaseMapHud(this, width, height, this.definition.title, {
      openSettings: () => this.openOverlay('Settings', { spawnX: this.playerGrid.x, spawnY: this.playerGrid.y }),
      openJournal: () => this.openOverlay('Journal', {}),
      toggleInteractableHighlights: () => this.toggleHighlights(),
      triggerInteraction: () => this.triggerInteraction(),
    });
    this.promptText = hud.promptText;
    this.exitPromptText = hud.exitPromptText;
    this.objectiveHud = createObjectiveHud(this, this.chapter, hud.titleText.getBounds().bottom, UI_DEPTH);
    this.objectiveHud.update(getFlags());
  }

  private toggleHighlights(): void {
    this.highlights.toggled = !this.highlights.toggled;
    applyInteractableHighlightVisibility(this.highlights);
  }


  private handleSceneResume(): void {
    // An overlay (the chapter-end card) may have changed the score.
    this.restoreAudio();
  }

  private openOverlay(key: 'Journal' | 'Settings', data: object): void {
    if (this.scene.isActive(key)) return;
    this.walkPath.length = 0;
    this.scene.launch(key, { from: this.scene.key, ...data });
    this.scene.pause();
  }

  // ---------- update / movement ----------

  update(_time: number, delta: number): void {
    this.moveCooldown -= delta;
    this.handleMovement();
    updatePlayerRevealMasks(this.revealMasks, this.player);
    updateInteractionPrompt({
      interactables: this.npcs.interactables,
      playerGrid: this.playerGrid,
      exits: this.exits,
      promptText: this.promptText,
      exitPromptText: this.exitPromptText,
      interactKey: this.keys.interact,
      triggerInteraction: () => this.triggerInteraction(),
    });
    pollMapKeys(this.keys, {
      openJournal: () => this.openOverlay('Journal', {}),
      toggleHighlights: () => this.toggleHighlights(),
      holdHighlights: held => this.holdHighlights(held),
      openSettings: () => this.openOverlay('Settings', { spawnX: this.playerGrid.x, spawnY: this.playerGrid.y }),
    });
  }

  private holdHighlights(held: boolean): void {
    this.highlights.held = held;
    applyInteractableHighlightVisibility(this.highlights);
  }

  private handleMovement(): void {
    const wasWalking = this.walkPath.length > 0;
    this.moveCooldown = handleBaseMapMovement(this, {
      moveCooldown: this.moveCooldown,
      cursors: this.keys.cursors,
      wasdKeys: this.keys.wasd,
      path: this.walkPath,
      playerGrid: this.playerGrid,
      player: this.player,
      blocked: this.blocked,
      exits: this.exits,
      inBounds: (x, y) => inBounds(this.definition.width, this.definition.height, x, y),
      gridToScreen: (x, y) => this.gridToScreen(x, y),
      transitionTo: exit => this.transitionTo(exit),
      onStep: (x, y) => {
        playFootstep(this.map[y]![x]!);
        this.remarks.step(x, y);
      },
      // True-scale cells are smaller relative to a stride, so steps come quicker.
      stepMs: 105,
      onLockedExit: () => playSfx('locked'),
      updatePlayerRevealMasks: force => updatePlayerRevealMasks(this.revealMasks, this.player, force),
    });
    if (wasWalking && this.walkPath.length === 0) {
      const target = this.walkTarget;
      this.walkTarget = undefined;
      // Wait for the last step's tween to land before opening the dialogue.
      if (target) {
        this.time.delayedCall(Math.max(0, this.moveCooldown), () => {
          const dx = Math.abs(target.gridX - this.playerGrid.x);
          const dy = Math.abs(target.gridY - this.playerGrid.y);
          if (dx + dy <= 1) target.action();
        });
      }
    }
  }

  private enterDoor(door: DoorSpec): void {
    this.transitionTo({ targetScene: door.targetScene, targetSpawnX: door.targetSpawnX, targetSpawnY: door.targetSpawnY });
  }

  private transitionTo(exit: Pick<MapExit, 'targetScene' | 'targetSpawnX' | 'targetSpawnY'>): void {
    this.moveCooldown = 600;
    this.walkPath.length = 0;
    playSfx('exit');
    this.cameras.main.fadeOut(280, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(exit.targetScene, {
        spawnX: exit.targetSpawnX,
        spawnY: exit.targetSpawnY,
      });
    });
  }

  /** For the smoke test's tap-zone check: the zoom phones open at, and an item's zone there. */
  readonly phoneZoom = PHONE_ZOOM;
  tapZoneOf(item: Interactable): Phaser.Geom.Rectangle {
    return tapZone(item.area, PHONE_ZOOM);
  }

  private triggerInteraction(): void {
    nearestInteractable(this.npcs.interactables, this.playerGrid)?.action();
  }
}
