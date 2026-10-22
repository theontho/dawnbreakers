import Phaser from 'phaser';
import { variantTexture } from '../assets/art';
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
import { handleBaseMapEnding, launchBaseMapDialogue, openBaseMapChapterEnd } from './baseMapFlow';
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
import { blockFootprintInto, emptyMap, inBounds, makeTileCanvas } from './baseMapTileCanvas';
import { connectWalls } from './mapWalls';
import { PERSON_SCALE } from './figureScale';
import { createMapAmbience, emitsFire, type AmbienceHandle } from './mapAmbience';
import { placeMapNpcs, resolveNpcDialogue, talkedFlag, type MapNpcs } from './mapNpcs';
import { createObjectiveHud, type ObjectiveHud } from './mapObjectiveHud';
import { findPath, screenToGrid, type GridPoint } from './mapPathing';
import type { MapDefinition, NpcSpec } from '../data/maps/types';
import type { FlagState } from '../dialogue/types';

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
  private npcs!: MapNpcs;
  private buildings: Building[] = [];
  private decor: Decor[] = [];
  private exits: MapExit[] = [];
  private occludableSprites: Phaser.GameObjects.Image[] = [];
  private conditionalDecor: RenderedWorld['conditionalDecor'] = [];
  private ambience?: AmbienceHandle;
  private restoreAudio: () => void = () => {};
  private revealMasks: RevealMaskHandle = { states: [], candidates: [] };
  private highlights: InteractableHighlightHandle = createInteractableHighlightHandle();
  private refreshExitGlows: () => void = () => {};
  private objectiveHud?: ObjectiveHud;

  private promptText!: Phaser.GameObjects.Text;
  private exitPromptText!: Phaser.GameObjects.Text;
  private mobileControls?: Phaser.GameObjects.Container;
  private endingShown = false;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private journalKey!: Phaser.Input.Keyboard.Key;
  private highlightKey!: Phaser.Input.Keyboard.Key;
  private tabHighlightKey!: Phaser.Input.Keyboard.Key;
  private settingsKey!: Phaser.Input.Keyboard.Key;
  private wasdKeys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private moveCooldown = 0;
  private mobileMoveDirection?: { dx: number; dy: number };
  private mobileActionButton?: Phaser.GameObjects.Rectangle;
  private mobileActionLabel?: Phaser.GameObjects.Text;
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
    this.cameras.main.setBackgroundColor(WORLD_BACKDROP_COLOR);
    const world = renderBaseMapWorld(this, this.worldState());
    this.occludableSprites = world.occludableSprites;
    this.conditionalDecor = world.conditionalDecor;
    this.refreshDecor(getFlags());
    this.refreshExitGlows = renderExitGlows(this, this.worldState());
    this.npcs = placeMapNpcs(
      this,
      this.definition.npcs,
      this.blocked,
      (gx, gy) => this.gridToScreen(gx, gy),
      spec => this.talkTo(spec),
      getFlags(),
      this.occludableSprites,
    );
    this.spawnPlayer();
    this.applyAmbience(getFlags());
    this.revealMasks = setupPlayerRevealMasks(this, this.occludableSprites, this.player, this.scene.key);
    setupInteractableHighlights(
      this, this.npcs.interactables, this.exits, (gx, gy) => this.gridToScreen(gx, gy), this.highlights,
    );
    this.setupInput();
    this.setupHUD(width, height);
    this.setupCameraFollow(width, height);
    this.events.on(Phaser.Scenes.Events.RESUME, this.handleSceneResume, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off(Phaser.Scenes.Events.RESUME, this.handleSceneResume, this);
      destroyPlayerRevealMasks(this.revealMasks, this, this.occludableSprites);
    });

    this.cameras.main.fadeIn(300, 0, 0, 0);
    this.bookmark();
  }

  private bookmark(): void {
    saveBookmark({ scene: this.scene.key, x: this.playerGrid.x, y: this.playerGrid.y });
  }

  // ---------- world ----------

  private buildWorldData(): void {
    const { width, height } = this.definition;
    const grids = emptyMap(width, height);
    this.map = grids.map;
    this.blocked = grids.blocked;
    this.definition.build(makeTileCanvas(width, height, this.map, this.blocked));

    for (const spec of this.definition.buildings) {
      this.buildings.push({ gridX: spec.gridX, gridY: spec.gridY, w: spec.w, h: spec.h, texture: variantTexture(spec.texture, spec.gridX, spec.gridY) });
      if (spec.blocks !== false) blockFootprintInto(this.blocked, width, height, spec.gridX, spec.gridY, spec.w, spec.h);
    }
    for (const spec of this.definition.decor) {
      this.decor.push({ ...spec, texture: variantTexture(spec.texture, spec.gridX, spec.gridY) });
      if (spec.blocks && !spec.present && inBounds(width, height, spec.gridX, spec.gridY)) {
        this.blocked[spec.gridY]![spec.gridX] = true;
      }
    }
    connectWalls(this, this.buildings, this.decor);
    this.exits = this.definition.exits.map(exit => ({ ...exit }));
  }

  /** Show or hide flag-dependent props, keeping their cells' blocking in step. */
  private refreshDecor(flags: FlagState): void {
    for (const { item, sprite } of this.conditionalDecor) {
      const here = item.present!(flags);
      sprite.setVisible(here);
      if (item.blocks) this.blocked[item.gridY]![item.gridX] = here;
    }
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
    this.player = this.add.image(pos.sx, pos.sy + TILE_H / 2, 'player')
      .setOrigin(0.5, 1).setScale(PERSON_SCALE).setDepth(pos.sy + 2);
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
      visible => this.setMobileControlsVisible(visible),
      () => this.afterDialogue(),
    );
  }

  /** Flags may have changed: refresh everything that reads them. */
  private afterDialogue(): void {
    this.bookmark();
    const flags = getFlags();
    this.refreshDecor(flags);
    this.npcs.refresh(flags);
    this.applyAmbience(flags);
    this.refreshExitGlows();
    this.objectiveHud?.update(flags);
    this.endingShown = handleBaseMapEnding(this, this.endingShown, chapterId => {
      openBaseMapChapterEnd(this, chapterId, visible => this.setMobileControlsVisible(visible));
    });
  }

  // ---------- input & HUD ----------

  private setupInput(): void {
    const keyboard = this.input.keyboard!;
    const { KeyCodes } = Phaser.Input.Keyboard;
    this.cursors = keyboard.createCursorKeys();
    this.interactKey = keyboard.addKey(KeyCodes.E);
    this.journalKey = keyboard.addKey(KeyCodes.J);
    this.highlightKey = keyboard.addKey(KeyCodes.H);
    this.tabHighlightKey = keyboard.addKey(KeyCodes.TAB, true);
    this.settingsKey = keyboard.addKey(KeyCodes.ESC);
    this.wasdKeys = {
      W: keyboard.addKey(KeyCodes.W),
      A: keyboard.addKey(KeyCodes.A),
      S: keyboard.addKey(KeyCodes.S),
      D: keyboard.addKey(KeyCodes.D),
    };
    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.handleWorldPointer, this);
  }

  /** Click or tap on the ground: walk there, and talk if it was a person. */
  private handleWorldPointer(pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]): void {
    if (over.length > 0) return; // a HUD button took it
    const target = screenToGrid(this.originX, this.originY, pointer.worldX, pointer.worldY);
    const npc = this.npcs.interactables.find(i => i.gridX === target.x && i.gridY === target.y);
    const exit = this.exits.find(e => e.fromX + e.dx === target.x && e.fromY + e.dy === target.y && exitIsOpen(e));
    const goal = exit ? { x: exit.fromX, y: exit.fromY } : target;
    const path = findPath(this.blocked, this.playerGrid, goal);
    if (!path) return;
    if (exit) path.push(target);
    this.walkPath = path;
    this.walkTarget = npc;
    if (npc && path.length === 0) this.triggerInteraction();
  }

  private setupHUD(width: number, height: number): void {
    const hud = createBaseMapHud(this, width, height, this.definition.title, {
      openSettings: () => this.openOverlay('Settings', { spawnX: this.playerGrid.x, spawnY: this.playerGrid.y }),
      openJournal: () => this.openOverlay('Journal', {}),
      toggleInteractableHighlights: () => this.toggleHighlights(),
      triggerInteraction: () => this.triggerInteraction(),
      setMobileMoveDirection: direction => { this.mobileMoveDirection = direction; },
      getMobileMoveDirection: () => this.mobileMoveDirection,
    });
    this.promptText = hud.promptText;
    this.exitPromptText = hud.exitPromptText;
    this.mobileControls = hud.mobileControls;
    this.mobileActionButton = hud.mobileActionButton;
    this.mobileActionLabel = hud.mobileActionLabel;
    this.objectiveHud = createObjectiveHud(this, this.chapter, hud.titleText.getBounds().bottom, UI_DEPTH);
    this.objectiveHud.update(getFlags());
  }

  private toggleHighlights(): void {
    this.highlights.toggled = !this.highlights.toggled;
    applyInteractableHighlightVisibility(this.highlights);
  }

  private setMobileControlsVisible(visible: boolean): void {
    this.mobileControls?.setVisible(visible);
    if (!visible) this.mobileMoveDirection = undefined;
  }

  private handleSceneResume(): void {
    this.setMobileControlsVisible(true);
    // An overlay (the chapter-end card) may have changed the score.
    this.restoreAudio();
  }

  private openOverlay(key: 'Journal' | 'Settings', data: object): void {
    if (this.scene.isActive(key)) return;
    this.setMobileControlsVisible(false);
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
      mobileActionButton: this.mobileActionButton,
      mobileActionLabel: this.mobileActionLabel,
      interactKey: this.interactKey,
      triggerInteraction: () => this.triggerInteraction(),
    });
    const { JustDown, JustUp } = Phaser.Input.Keyboard;
    if (JustDown(this.journalKey)) this.openOverlay('Journal', {});
    if (JustDown(this.highlightKey)) this.toggleHighlights();
    if (JustDown(this.tabHighlightKey)) this.holdHighlights(true);
    if (JustUp(this.tabHighlightKey)) this.holdHighlights(false);
    if (JustDown(this.settingsKey)) this.openOverlay('Settings', { spawnX: this.playerGrid.x, spawnY: this.playerGrid.y });
  }

  private holdHighlights(held: boolean): void {
    this.highlights.held = held;
    applyInteractableHighlightVisibility(this.highlights);
  }

  private handleMovement(): void {
    const wasWalking = this.walkPath.length > 0;
    this.moveCooldown = handleBaseMapMovement(this, {
      moveCooldown: this.moveCooldown,
      cursors: this.cursors,
      wasdKeys: this.wasdKeys,
      mobileMoveDirection: this.mobileMoveDirection,
      path: this.walkPath,
      playerGrid: this.playerGrid,
      player: this.player,
      blocked: this.blocked,
      exits: this.exits,
      inBounds: (x, y) => inBounds(this.definition.width, this.definition.height, x, y),
      gridToScreen: (x, y) => this.gridToScreen(x, y),
      transitionTo: exit => this.transitionTo(exit),
      onStep: (x, y) => playFootstep(this.map[y]![x]!),
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
          if (dx + dy === 1) target.action();
        });
      }
    }
  }

  private transitionTo(exit: MapExit): void {
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

  private triggerInteraction(): void {
    nearestInteractable(this.npcs.interactables, this.playerGrid)?.action();
  }
}
