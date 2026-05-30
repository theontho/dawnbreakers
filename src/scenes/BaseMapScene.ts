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

/**
 * Shared logic for any walkable map scene: iso rendering, grid movement,
 * NPC interaction, dialogue/journal/restart HUD, and edge-of-map exits.
 *
 * Subclasses configure `mapWidth`, `mapHeight`, `sceneTitle`, and override
 * `getDefaultSpawn`, `buildMap`, `placeBuildings`, `placeDecor`,
 * `spawnNPCs`, and `setupExits`.
 */
export abstract class BaseMapScene extends Phaser.Scene {
  protected abstract mapWidth: number;
  protected abstract mapHeight: number;
  protected abstract sceneTitle: string;

  protected player!: Phaser.GameObjects.Image;
  protected playerGrid = { x: 0, y: 0 };
  protected map: TileKind[][] = [];
  protected blocked: boolean[][] = [];
  protected interactables: Interactable[] = [];
  protected buildings: Building[] = [];
  protected decor: Decor[] = [];
  protected exits: MapExit[] = [];
  private occludableSprites: Phaser.GameObjects.Image[] = [];
  private revealMaskStates: RevealMaskState[] = [];
  private lastPlayerReveal?: RevealTarget;
  private interactableHighlightGraphics: Phaser.GameObjects.Graphics[] = [];
  private interactableHighlightsToggled = false;
  private interactableHighlightsHeld = false;

  protected promptText!: Phaser.GameObjects.Text;
  protected exitPromptText!: Phaser.GameObjects.Text;
  protected banner!: Phaser.GameObjects.Text;
  private mobileControls?: Phaser.GameObjects.Container;
  protected endingShown = false;

  protected cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  protected interactKey!: Phaser.Input.Keyboard.Key;
  protected journalKey!: Phaser.Input.Keyboard.Key;
  protected highlightKey!: Phaser.Input.Keyboard.Key;
  protected tabHighlightKey!: Phaser.Input.Keyboard.Key;
  protected settingsKey!: Phaser.Input.Keyboard.Key;
  protected wasdKeys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  protected moveCooldown = 0;
  private mobileMoveDirection?: { dx: number; dy: number };
  private mobileActionButton?: Phaser.GameObjects.Rectangle;
  private mobileActionLabel?: Phaser.GameObjects.Text;

  protected originX = 0;
  protected originY = 90;
  protected cameraFollowsPlayer = true;

  protected abstract getDefaultSpawn(): { x: number; y: number };
  protected abstract buildMap(): void;
  protected abstract placeBuildings(): void;
  protected abstract placeDecor(): void;
  protected abstract spawnNPCs(): void;
  protected abstract setupExits(): void;

  init(data: SceneSpawnData): void {
    const spawn = this.getDefaultSpawn();
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
    this.buildMap();
    this.cameras.main.setBackgroundColor(WORLD_BACKDROP_COLOR);
    this.placeBuildings();
    this.placeDecor();
    this.setupExits();
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

    // Camera fade-in on scene entry
    this.cameras.main.fadeIn(300, 0, 0, 0);

  }

  // ---------- map ----------

  protected initEmptyMap(): void {
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

  protected paintRect(x0: number, y0: number, w: number, h: number, kind: TileKind): void {
    for (let y = y0; y < y0 + h; y++)
      for (let x = x0; x < x0 + w; x++)
        if (this.inBounds(x, y)) this.map[y][x] = kind;
  }

  protected paintPath(pts: [number, number][]): void {
    for (const [x, y] of pts) if (this.inBounds(x, y)) this.map[y][x] = 'path';
  }

  protected blockFootprint(x: number, y: number, w: number, h: number): void {
    for (let dy = 0; dy < h; dy++)
      for (let dx = 0; dx < w; dx++)
        if (this.inBounds(x + dx, y + dy)) this.blocked[y + dy][x + dx] = true;
  }

  protected blockTile(x: number, y: number): void {
    if (this.inBounds(x, y)) this.blocked[y][x] = true;
  }

  protected inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.mapWidth && y < this.mapHeight;
  }

  // ---------- drawing ----------

  protected drawWorld(): void {
    this.occludableSprites = renderBaseMapWorld(this, this.worldState());
  }

  protected gridToScreen(gx: number, gy: number): { sx: number; sy: number } {
    return gridToIsoScreen(this.originX, this.originY, gx, gy);
  }

  protected setupCameraFollow(width: number, height: number): void {
    const bounds = getBaseMapWorldBounds(this, this.worldState(), this.player, this.interactables, width, height);
    this.cameras.main
      .setRoundPixels(true)
      .setBounds(bounds.x, bounds.y, bounds.width, bounds.height);

    if (!this.cameraFollowsPlayer) return;

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

  protected addNPC(gx: number, gy: number, texture: string,
                   promptFn: () => string, action: () => void): void {
    const pos = this.gridToScreen(gx, gy);
    const sprite = this.add.image(pos.sx, pos.sy + TILE_H / 2, texture)
      .setOrigin(0.5, 1).setDepth(pos.sy + 1);
    this.blocked[gy][gx] = true;
    this.interactables.push({
      gridX: gx, gridY: gy, texture, prompt: promptFn(), sprite, action,
    });
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
      this.redrawRevealMask(state, reveals);
    }
    this.lastPlayerReveal = playerReveal;
  }

  private redrawRevealMask(state: RevealMaskState, reveals: RevealTarget[]): void {
    redrawRevealMaskState(state, reveals);
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

  protected spawnPlayer(): void {
    const pos = this.gridToScreen(this.playerGrid.x, this.playerGrid.y);
    this.player = this.add.image(pos.sx, pos.sy + TILE_H / 2, 'player')
      .setOrigin(0.5, 1).setDepth(pos.sy + 2);
  }

  // ---------- dialogue ----------

  protected startSimpleDialogue(id: string): void {
    const tree = dialogues[id];
    if (tree) this.startDialogueTree(tree);
  }

  protected startBabDialogue(): void {
    this.startDialogueTree(babTreeFor(getFlags()));
  }

  protected startDialogueTree(tree: DialogueTree): void {
    launchBaseMapDialogue(
      this,
      tree,
      visible => this.setMobileControlsVisible(visible),
      () => this.handleEnding(),
    );
  }

  protected handleEnding(): void {
    this.endingShown = handleBaseMapEnding(
      this,
      this.endingShown,
      (text, opts) => this.showBanner(text, opts),
      chapterId => this.openChapterEnd(chapterId),
    );
  }

  protected openChapterEnd(chapterId: string): void {
    openBaseMapChapterEnd(this, chapterId, visible => this.setMobileControlsVisible(visible));
  }

  protected showBanner(text: string, opts: { holdMs?: number; onComplete?: () => void } = {}): void {
    showBaseMapBanner(this, this.banner, text, opts);
  }

  protected endingBannerText(ending: string): string {
    return getEndingBannerText(ending);
  }

  // ---------- HUD ----------

  protected setupInput(): void {
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

  protected setupHUD(width: number, height: number): void {
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

  protected openJournal(): void {
    if (this.scene.isActive('Journal')) return;
    this.setMobileControlsVisible(false);
    this.scene.launch('Journal', { from: this.scene.key });
    this.scene.pause();
  }

  protected openSettings(): void {
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

  protected handleMovement(): void {
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

  protected transitionTo(exit: MapExit): void {
    this.moveCooldown = 600;
    this.cameras.main.fadeOut(280, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(exit.targetScene, {
        spawnX: exit.targetSpawnX,
        spawnY: exit.targetSpawnY,
      });
    });
  }

  protected nearestInteractable(): Interactable | undefined {
    return getNearestInteractable(this.interactables, this.playerGrid);
  }

  protected handleInteractionPrompt(): void {
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
