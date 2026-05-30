import Phaser from 'phaser';
import { dialogues, babTreeFor } from '../data/dialogues';
import { getFlags } from '../dialogue/flags';
import type { DialogueTree } from '../dialogue/types';
import { isNarrowLayout, responsiveMargin, restartSceneOnResize } from '../ui/responsive';
import { gridToIsoScreen } from './isoGeometry';
import {
  circleIntersectsRect,
  createHardRevealMaskState,
  createSoftRevealMaskState,
  redrawRevealMaskState,
  revealTargetForSprite,
  type RevealMaskState,
  type RevealTarget,
} from './baseMapReveal';
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
import { getBaseMapWorldBounds, renderBaseMapWorld, WORLD_BACKDROP_COLOR } from './baseMapWorld';
import {
  endingBannerText as getEndingBannerText,
  handleBaseMapEnding,
  launchBaseMapDialogue,
  openBaseMapChapterEnd,
  showBaseMapBanner,
} from './baseMapFlow';
import {
  handleBaseMapMovement,
  nearestInteractable as getNearestInteractable,
  updateInteractionPrompt,
} from './baseMapMovement';
import type { MapDefinition, NpcAction, NpcSpec, TileCanvas } from '../data/maps/types';

/**
 * Concrete walkable map scene driven by a `MapDefinition` (data). One Phaser
 * scene instance per chapter location. Handles iso rendering, grid movement,
 * NPC interaction, dialogue/journal/restart HUD, and edge-of-map exits.
 *
 * To add a new map: add a `MapDefinition` under `src/data/maps/` and register
 * it in `src/data/maps/index.ts`. `main.ts` does the rest.
 */
export class MapScene extends Phaser.Scene {
  private readonly definition: MapDefinition;
  private readonly mapWidth: number;
  private readonly mapHeight: number;
  private readonly sceneTitle: string;

  private player!: Phaser.GameObjects.Image;
  private playerGrid = { x: 0, y: 0 };
  private map: TileKind[][] = [];
  private blocked: boolean[][] = [];
  private interactables: Interactable[] = [];
  private buildings: Building[] = [];
  private decor: Decor[] = [];
  private exits: MapExit[] = [];
  private occludableSprites: Phaser.GameObjects.Image[] = [];
  private revealMaskStates: RevealMaskState[] = [];
  private lastPlayerReveal?: RevealTarget;
  private interactableHighlightGraphics: Phaser.GameObjects.Graphics[] = [];
  private interactableHighlightsToggled = false;
  private interactableHighlightsHeld = false;

  private promptText!: Phaser.GameObjects.Text;
  private exitPromptText!: Phaser.GameObjects.Text;
  private banner!: Phaser.GameObjects.Text;
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

  private originX = 0;
  private originY = 90;

  constructor(definition: MapDefinition) {
    super(definition.key);
    this.definition = definition;
    this.mapWidth = definition.width;
    this.mapHeight = definition.height;
    this.sceneTitle = definition.title;
  }

  init(data: SceneSpawnData): void {
    const spawn = this.definition.spawn;
    this.playerGrid = { x: data.spawnX ?? spawn.x, y: data.spawnY ?? spawn.y };
    this.map = [];
    this.blocked = [];
    this.interactables = [];
    this.buildings = [];
    this.decor = [];
    this.exits = [];
    this.occludableSprites = [];
    this.revealMaskStates = [];
    this.lastPlayerReveal = undefined;
    this.interactableHighlightGraphics = [];
    this.interactableHighlightsToggled = false;
    this.interactableHighlightsHeld = false;
    this.endingShown = false;
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

    this.initEmptyMap();
    this.definition.build(this.tileCanvas());
    this.cameras.main.setBackgroundColor(WORLD_BACKDROP_COLOR);
    this.placeBuildings();
    this.placeDecor();
    this.installExits();
    this.drawWorld();
    this.spawnNPCs();
    this.spawnPlayer();
    this.setupInteractableRevealMask();
    this.setupInteractableHighlights();
    this.setupInput();
    this.setupHUD(width, height);
    this.setupCameraFollow(width, height);
    this.events.on(Phaser.Scenes.Events.RESUME, this.handleSceneResume, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off(Phaser.Scenes.Events.RESUME, this.handleSceneResume, this);
      this.destroyInteractableRevealMasks();
    });

    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  // ---------- map ----------

  private initEmptyMap(): void {
    for (let y = 0; y < this.mapHeight; y++) {
      const row: TileKind[] = [];
      const brow: boolean[] = [];
      for (let x = 0; x < this.mapWidth; x++) {
        row.push('grass');
        brow.push(false);
      }
      this.map.push(row);
      this.blocked.push(brow);
    }
  }

  /** Adapter exposed to `MapDefinition.build` for tile painting. */
  private tileCanvas(): TileCanvas {
    return {
      width: this.mapWidth,
      height: this.mapHeight,
      map: this.map,
      blocked: this.blocked,
      paintRect: (x, y, w, h, kind) => this.paintRect(x, y, w, h, kind),
      paintPath: cells => this.paintPath(cells),
      setTile: (x, y, kind) => { if (this.inBounds(x, y)) this.map[y][x] = kind; },
      block: (x, y) => this.blockTile(x, y),
      unblock: (x, y) => { if (this.inBounds(x, y)) this.blocked[y][x] = false; },
      inBounds: (x, y) => this.inBounds(x, y),
    };
  }

  private paintRect(x0: number, y0: number, w: number, h: number, kind: TileKind): void {
    for (let y = y0; y < y0 + h; y++)
      for (let x = x0; x < x0 + w; x++)
        if (this.inBounds(x, y)) this.map[y][x] = kind;
  }

  private paintPath(pts: ReadonlyArray<readonly [number, number]>): void {
    for (const [x, y] of pts) if (this.inBounds(x, y)) this.map[y][x] = 'path';
  }

  private blockFootprint(x: number, y: number, w: number, h: number): void {
    for (let dy = 0; dy < h; dy++)
      for (let dx = 0; dx < w; dx++)
        if (this.inBounds(x + dx, y + dy)) this.blocked[y + dy][x + dx] = true;
  }

  private blockTile(x: number, y: number): void {
    if (this.inBounds(x, y)) this.blocked[y][x] = true;
  }

  private inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.mapWidth && y < this.mapHeight;
  }

  // ---------- placements from definition ----------

  private placeBuildings(): void {
    for (const spec of this.definition.buildings) {
      this.buildings.push({
        gridX: spec.gridX,
        gridY: spec.gridY,
        w: spec.w,
        h: spec.h,
        texture: spec.texture,
      });
      if (spec.blocks !== false) {
        this.blockFootprint(spec.gridX, spec.gridY, spec.w, spec.h);
      }
    }
  }

  private placeDecor(): void {
    for (const spec of this.definition.decor) {
      this.decor.push({ ...spec });
      if (spec.blocks) this.blockTile(spec.gridX, spec.gridY);
    }
  }

  private installExits(): void {
    for (const exit of this.definition.exits) this.exits.push({ ...exit });
  }

  private spawnNPCs(): void {
    for (const npc of this.definition.npcs) this.addNPC(npc);
  }

  // ---------- drawing ----------

  private drawWorld(): void {
    this.occludableSprites = renderBaseMapWorld(this, this.worldState());
  }

  private gridToScreen(gx: number, gy: number): { sx: number; sy: number } {
    return gridToIsoScreen(this.originX, this.originY, gx, gy);
  }

  private setupCameraFollow(width: number, height: number): void {
    const bounds = getBaseMapWorldBounds(this, this.worldState(), this.player, this.interactables, width, height);
    this.cameras.main
      .setRoundPixels(true)
      .setBounds(bounds.x, bounds.y, bounds.width, bounds.height);

    this.cameras.main.startFollow(this.player, true, 0.18, 0.18);
    this.cameras.main.centerOn(this.player.x, this.player.y);
  }

  private worldState() {
    return {
      mapWidth: this.mapWidth,
      mapHeight: this.mapHeight,
      originX: this.originX,
      originY: this.originY,
      map: this.map,
      blocked: this.blocked,
      buildings: this.buildings,
      decor: this.decor,
      exits: this.exits,
    };
  }

  // ---------- NPCs ----------

  private addNPC(spec: NpcSpec): void {
    const pos = this.gridToScreen(spec.gridX, spec.gridY);
    const sprite = this.add.image(pos.sx, pos.sy + TILE_H / 2, spec.texture)
      .setOrigin(0.5, 1).setDepth(pos.sy + 1);
    this.blocked[spec.gridY][spec.gridX] = true;
    const action = this.resolveNpcAction(spec.action);
    this.interactables.push({
      gridX: spec.gridX,
      gridY: spec.gridY,
      texture: spec.texture,
      prompt: spec.prompt,
      sprite,
      action,
    });
  }

  private resolveNpcAction(action: NpcAction): () => void {
    switch (action.kind) {
      case 'dialogue': return () => this.startSimpleDialogue(action.id);
      case 'bab': return () => this.startBabDialogue();
    }
  }

  private setupInteractableRevealMask(): void {
    const revealTargets = this.interactableRevealTargets();
    if (this.occludableSprites.length === 0) return;

    for (const sprite of this.occludableSprites) {
      const bounds = sprite.getBounds();
      const staticReveals = revealTargets.filter((reveal) =>
        sprite.depth > reveal.depth && circleIntersectsRect(reveal.x, reveal.y, reveal.radius, bounds));

      if (this.game.renderer.type === Phaser.WEBGL) {
        this.createSoftRevealMask(sprite, bounds, staticReveals);
      } else {
        this.createHardRevealMask(sprite, bounds, staticReveals);
      }
    }
    this.updatePlayerRevealMasks(true);
  }

  private interactableRevealTargets(): RevealTarget[] {
    return this.interactables
      .map((interactable) => interactable.sprite)
      .filter((sprite): sprite is Phaser.GameObjects.Image => Boolean(sprite))
      .map((sprite) => revealTargetForSprite(sprite, 0.62, 34, 54));
  }

  private playerRevealTarget(): RevealTarget {
    return revealTargetForSprite(this.player, 0.68, 38, 60);
  }

  private createSoftRevealMask(
    sprite: Phaser.GameObjects.Image,
    bounds: Phaser.Geom.Rectangle,
    staticReveals: RevealTarget[],
  ): void {
    const textureKey = `${this.scene.key}-reveal-mask-${this.revealMaskStates.length}`;
    const state = createSoftRevealMaskState(this, sprite, bounds, staticReveals, textureKey);
    if (state) this.revealMaskStates.push(state);
  }

  private createHardRevealMask(
    sprite: Phaser.GameObjects.Image,
    bounds: Phaser.Geom.Rectangle,
    staticReveals: RevealTarget[],
  ): void {
    this.revealMaskStates.push(createHardRevealMaskState(this, sprite, bounds, staticReveals));
  }

  private updatePlayerRevealMasks(force = false): void {
    if (this.revealMaskStates.length === 0) return;

    const playerReveal = this.playerRevealTarget();
    if (!force && this.lastPlayerReveal
      && Math.abs(this.lastPlayerReveal.x - playerReveal.x) < 0.5
      && Math.abs(this.lastPlayerReveal.y - playerReveal.y) < 0.5
      && Math.abs(this.lastPlayerReveal.depth - playerReveal.depth) < 0.5) {
      return;
    }

    for (const state of this.revealMaskStates) {
      const reveals = [...state.staticReveals];
      if (state.sprite.depth > playerReveal.depth
        && circleIntersectsRect(playerReveal.x, playerReveal.y, playerReveal.radius, state.bounds)) {
        reveals.push(playerReveal);
      }
      redrawRevealMaskState(state, reveals);
    }
    this.lastPlayerReveal = playerReveal;
  }

  private destroyInteractableRevealMasks(): void {
    for (const sprite of this.occludableSprites) {
      sprite.clearMask(true);
    }
    for (const state of this.revealMaskStates) {
      state.maskObject?.destroy();
      state.maskShape?.destroy();
      if (state.textureKey && this.textures.exists(state.textureKey)) this.textures.remove(state.textureKey);
    }
    this.revealMaskStates = [];
    this.lastPlayerReveal = undefined;
  }

  private setupInteractableHighlights(): void {
    for (const reveal of this.interactableRevealTargets()) {
      const highlight = this.add.graphics()
        .setDepth(9000)
        .setVisible(false);
      highlight.fillStyle(0xf3d98a, 0.12);
      highlight.fillCircle(reveal.x, reveal.y, reveal.radius);
      highlight.lineStyle(3, 0xf3d98a, 0.85);
      highlight.strokeCircle(reveal.x, reveal.y, reveal.radius);
      highlight.lineStyle(1, 0xffffff, 0.55);
      highlight.strokeCircle(reveal.x, reveal.y, reveal.radius * 0.72);
      this.interactableHighlightGraphics.push(highlight);
    }

    for (const exit of this.exits) {
      const pos = this.gridToScreen(exit.fromX, exit.fromY);
      const highlight = this.add.graphics()
        .setDepth(pos.sy + 9000)
        .setVisible(false);
      highlight.fillStyle(0x66d9ff, 0.16);
      highlight.fillEllipse(pos.sx, pos.sy, 58, 28, 48);
      highlight.lineStyle(3, 0x66d9ff, 0.9);
      highlight.strokeEllipse(pos.sx, pos.sy, 58, 28, 48);
      highlight.lineStyle(1, 0xffffff, 0.55);
      highlight.strokeEllipse(pos.sx, pos.sy, 42, 20, 48);
      this.interactableHighlightGraphics.push(highlight);
    }

    if (this.interactableHighlightGraphics.length > 0) {
      this.tweens.add({
        targets: this.interactableHighlightGraphics,
        alpha: 0.52,
        duration: 720,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private toggleInteractableHighlights(): void {
    this.interactableHighlightsToggled = !this.interactableHighlightsToggled;
    this.applyInteractableHighlightVisibility();
  }

  private holdInteractableHighlights(held: boolean): void {
    this.interactableHighlightsHeld = held;
    this.applyInteractableHighlightVisibility();
  }

  private applyInteractableHighlightVisibility(): void {
    const visible = this.interactableHighlightsToggled || this.interactableHighlightsHeld;
    for (const highlight of this.interactableHighlightGraphics) {
      highlight.setVisible(visible);
    }
  }

  private spawnPlayer(): void {
    const pos = this.gridToScreen(this.playerGrid.x, this.playerGrid.y);
    this.player = this.add.image(pos.sx, pos.sy + TILE_H / 2, 'player')
      .setOrigin(0.5, 1).setDepth(pos.sy + 2);
  }

  // ---------- dialogue ----------

  private startSimpleDialogue(id: string): void {
    const tree = dialogues[id];
    if (tree) this.startDialogueTree(tree);
  }

  private startBabDialogue(): void {
    this.startDialogueTree(babTreeFor(getFlags()));
  }

  private startDialogueTree(tree: DialogueTree): void {
    launchBaseMapDialogue(
      this,
      tree,
      visible => this.setMobileControlsVisible(visible),
      () => this.handleEnding(),
    );
  }

  private handleEnding(): void {
    this.endingShown = handleBaseMapEnding(
      this,
      this.endingShown,
      (text, opts) => this.showBanner(text, opts),
      chapterId => this.openChapterEnd(chapterId),
    );
  }

  private openChapterEnd(chapterId: string): void {
    openBaseMapChapterEnd(this, chapterId, visible => this.setMobileControlsVisible(visible));
  }

  private showBanner(text: string, opts: { holdMs?: number; onComplete?: () => void } = {}): void {
    showBaseMapBanner(this, this.banner, text, opts);
  }

  // unused locally but kept for parity with previous helper API
  protected endingBannerText(ending: string): string {
    return getEndingBannerText(ending);
  }

  // ---------- HUD ----------

  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.journalKey  = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.highlightKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    this.tabHighlightKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TAB, true);
    this.settingsKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.wasdKeys = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  private setupHUD(width: number, height: number): void {
    const hud = createBaseMapHud(this, width, height, this.sceneTitle, {
      openSettings: () => this.openSettings(),
      openJournal: () => this.openJournal(),
      toggleInteractableHighlights: () => this.toggleInteractableHighlights(),
      triggerInteraction: () => this.triggerInteraction(),
      setMobileMoveDirection: direction => { this.mobileMoveDirection = direction; },
      getMobileMoveDirection: () => this.mobileMoveDirection,
    });
    this.promptText = hud.promptText;
    this.exitPromptText = hud.exitPromptText;
    this.banner = hud.banner;
    this.mobileControls = hud.mobileControls;
    this.mobileActionButton = hud.mobileActionButton;
    this.mobileActionLabel = hud.mobileActionLabel;
  }

  private setMobileControlsVisible(visible: boolean): void {
    this.mobileControls?.setVisible(visible);
    if (!visible) this.mobileMoveDirection = undefined;
  }

  private handleSceneResume(): void {
    this.setMobileControlsVisible(true);
  }

  private openJournal(): void {
    if (this.scene.isActive('Journal')) return;
    this.setMobileControlsVisible(false);
    this.scene.launch('Journal', { from: this.scene.key });
    this.scene.pause();
  }

  private openSettings(): void {
    if (this.scene.isActive('Settings')) return;
    this.setMobileControlsVisible(false);
    this.scene.launch('Settings', {
      from: this.scene.key,
      spawnX: this.playerGrid.x,
      spawnY: this.playerGrid.y,
    });
    this.scene.pause();
  }

  // ---------- update / movement ----------

  update(_time: number, delta: number): void {
    this.moveCooldown -= delta;
    this.handleMovement();
    this.updatePlayerRevealMasks();
    this.handleInteractionPrompt();
    if (Phaser.Input.Keyboard.JustDown(this.journalKey)) this.openJournal();
    if (Phaser.Input.Keyboard.JustDown(this.highlightKey)) this.toggleInteractableHighlights();
    if (Phaser.Input.Keyboard.JustDown(this.tabHighlightKey)) this.holdInteractableHighlights(true);
    if (Phaser.Input.Keyboard.JustUp(this.tabHighlightKey)) this.holdInteractableHighlights(false);
    if (Phaser.Input.Keyboard.JustDown(this.settingsKey)) this.openSettings();
  }

  private handleMovement(): void {
    this.moveCooldown = handleBaseMapMovement(this, {
      moveCooldown: this.moveCooldown,
      cursors: this.cursors,
      wasdKeys: this.wasdKeys,
      mobileMoveDirection: this.mobileMoveDirection,
      playerGrid: this.playerGrid,
      player: this.player,
      blocked: this.blocked,
      exits: this.exits,
      inBounds: (x, y) => this.inBounds(x, y),
      gridToScreen: (x, y) => this.gridToScreen(x, y),
      transitionTo: exit => this.transitionTo(exit),
      updatePlayerRevealMasks: force => this.updatePlayerRevealMasks(force),
    });
  }

  private transitionTo(exit: MapExit): void {
    this.moveCooldown = 600;
    this.cameras.main.fadeOut(280, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(exit.targetScene, {
        spawnX: exit.targetSpawnX,
        spawnY: exit.targetSpawnY,
      });
    });
  }

  private nearestInteractable(): Interactable | undefined {
    return getNearestInteractable(this.interactables, this.playerGrid);
  }

  private handleInteractionPrompt(): void {
    updateInteractionPrompt({
      interactables: this.interactables,
      playerGrid: this.playerGrid,
      exits: this.exits,
      promptText: this.promptText,
      exitPromptText: this.exitPromptText,
      mobileActionButton: this.mobileActionButton,
      mobileActionLabel: this.mobileActionLabel,
      interactKey: this.interactKey,
      triggerInteraction: () => this.triggerInteraction(),
    });
  }

  private triggerInteraction(): void {
    this.nearestInteractable()?.action();
  }
}
