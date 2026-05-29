import Phaser from 'phaser';
import { dialogues, babTreeFor } from '../data/dialogues';
import { getFlags, resetFlags, applyEffect } from '../dialogue/flags';
import { chapterByScene } from '../data/chapters';
import type { DialogueLaunch } from './DialogueScene';
import type { DialogueTree } from '../dialogue/types';
import { makeCharacterTexture, type CharacterTextureOptions } from './characterTexture';
import { buttonFont, isNarrowLayout, MIN_TOUCH_TARGET, responsiveFont, responsiveMargin, restartSceneOnResize, touchSize } from '../ui/responsive';

export const TILE_W = 64;
export const TILE_H = 32;

export type TileKind = 'grass' | 'path' | 'stone' | 'water' | 'sand';

export interface IsoPoint {
  x: number;
  y: number;
}

export interface IsoPrism {
  texW: number;
  texH: number;
  top: IsoPoint;
  right: IsoPoint;
  bottom: IsoPoint;
  left: IsoPoint;
  topR: IsoPoint;
  rightR: IsoPoint;
  bottomR: IsoPoint;
  leftR: IsoPoint;
}

export interface Building {
  gridX: number;
  gridY: number;
  w: number;
  h: number;
  texture: string;
}

export interface Decor {
  gridX: number;
  gridY: number;
  texture: string;
  blocks?: boolean;
}

export interface Interactable {
  gridX: number;
  gridY: number;
  prompt: string;
  texture: string;
  action: () => void;
  sprite?: Phaser.GameObjects.Image;
}

export interface MapExit {
  fromX: number;
  fromY: number;
  dx: number;       // direction of departure (-1, 0, 1)
  dy: number;
  targetScene: string;
  targetSpawnX: number;
  targetSpawnY: number;
  label: string;    // e.g. "→ The Quiet Quarter"
}

export interface SceneSpawnData {
  spawnX?: number;
  spawnY?: number;
}

interface RevealTarget {
  x: number;
  y: number;
  depth: number;
  radius: number;
}

interface RevealMaskState {
  sprite: Phaser.GameObjects.Image;
  bounds: Phaser.Geom.Rectangle;
  staticReveals: RevealTarget[];
  textureKey?: string;
  texture?: Phaser.Textures.CanvasTexture;
  context?: CanvasRenderingContext2D;
  maskObject?: Phaser.GameObjects.Image;
  maskShape?: Phaser.GameObjects.Graphics;
}

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
  private hudTooltip?: Phaser.GameObjects.Container;
  private mobileControls?: Phaser.GameObjects.Container;
  protected endingShown = false;

  protected cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  protected interactKey!: Phaser.Input.Keyboard.Key;
  protected journalKey!: Phaser.Input.Keyboard.Key;
  protected chapterKey!: Phaser.Input.Keyboard.Key;
  protected highlightKey!: Phaser.Input.Keyboard.Key;
  protected tabHighlightKey!: Phaser.Input.Keyboard.Key;
  protected restartKey!: Phaser.Input.Keyboard.Key;
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
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const { sx, sy } = this.gridToScreen(x, y);
        this.add.image(sx, sy, 'tile-' + this.map[y][x])
          .setOrigin(0.5, 0.5).setDepth(sy);
      }
    }

    for (const b of this.buildings) {
      const frontX = b.gridX + b.w - 1;
      const frontY = b.gridY + b.h - 1;
      const front = this.gridToScreen(frontX, frontY);
      const sprite = this.add.image(front.sx, front.sy + TILE_H / 2, b.texture)
        .setOrigin(0.5, 1)
        .setDepth(front.sy + 1);
      this.occludableSprites.push(sprite);
    }

    for (const d of this.decor) {
      const pos = this.gridToScreen(d.gridX, d.gridY);
      const sprite = this.add.image(pos.sx, pos.sy + TILE_H / 2, d.texture)
        .setOrigin(0.5, 1)
        .setDepth(pos.sy + 1);
      this.occludableSprites.push(sprite);
      if (d.blocks) this.blockTile(d.gridX, d.gridY);
    }

    // Visualise exit tiles with a soft glow
    for (const e of this.exits) {
      const pos = this.gridToScreen(e.fromX, e.fromY);
      const glow = this.add.ellipse(pos.sx, pos.sy, 40, 18, 0xc9a55c, 0.35)
        .setDepth(pos.sy + 0.5);
      this.tweens.add({ targets: glow, alpha: 0.7, duration: 900, yoyo: true, repeat: -1 });
    }
  }

  protected gridToScreen(gx: number, gy: number): { sx: number; sy: number } {
    const sx = this.originX + (gx - gy) * (TILE_W / 2);
    const sy = this.originY + (gx + gy) * (TILE_H / 2);
    return { sx, sy };
  }

  protected setupCameraFollow(width: number, height: number): void {
    const bounds = this.getMapWorldBounds(width, height);
    this.cameras.main
      .setRoundPixels(true)
      .setBounds(bounds.x, bounds.y, bounds.width, bounds.height);

    if (!this.cameraFollowsPlayer) return;

    this.cameras.main.startFollow(this.player, true, 0.18, 0.18);
    this.cameras.main.centerOn(this.player.x, this.player.y);
  }

  private getMapWorldBounds(width: number, height: number): Phaser.Geom.Rectangle {
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    const includeBounds = (x: number, y: number, w: number, h: number): void => {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    };

    const includeTexture = (
      texture: string,
      x: number,
      y: number,
      originX: number,
      originY: number,
    ): void => {
      const frame = this.textures.getFrame(texture);
      if (!frame) return;
      includeBounds(x - frame.width * originX, y - frame.height * originY, frame.width, frame.height);
    };

    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const pos = this.gridToScreen(x, y);
        includeBounds(pos.sx - TILE_W / 2, pos.sy - TILE_H / 2, TILE_W, TILE_H);
      }
    }

    for (const building of this.buildings) {
      const front = this.gridToScreen(building.gridX + building.w - 1, building.gridY + building.h - 1);
      includeTexture(building.texture, front.sx, front.sy + TILE_H / 2, 0.5, 1);
    }

    for (const item of this.decor) {
      const pos = this.gridToScreen(item.gridX, item.gridY);
      includeTexture(item.texture, pos.sx, pos.sy + TILE_H / 2, 0.5, 1);
    }

    for (const interactable of this.interactables) {
      if (interactable.sprite) {
        const bounds = interactable.sprite.getBounds();
        includeBounds(bounds.x, bounds.y, bounds.width, bounds.height);
      }
    }

    const playerBounds = this.player.getBounds();
    includeBounds(playerBounds.x, playerBounds.y, playerBounds.width, playerBounds.height);

    const padX = Math.max(width / 2, TILE_W * 2);
    const padY = Math.max(height / 2, TILE_H * 4);
    return new Phaser.Geom.Rectangle(
      minX - padX,
      minY - padY,
      maxX - minX + padX * 2,
      maxY - minY + padY * 2,
    );
  }

  protected isoPrism(widthCells: number, heightCells: number, wallH: number, topPad = 0): IsoPrism {
    const leftExtent = widthCells * TILE_W / 2;
    const rightExtent = heightCells * TILE_W / 2;
    const halfW = Math.max(leftExtent, rightExtent);
    const baseH = (widthCells + heightCells) * TILE_H / 2;
    const texH = baseH + wallH + topPad;
    const bottom = { x: halfW, y: texH };
    const top = {
      x: halfW + (heightCells - widthCells) * TILE_W / 2,
      y: texH - baseH,
    };
    const right = {
      x: halfW + rightExtent,
      y: texH - heightCells * TILE_H / 2,
    };
    const left = {
      x: halfW - leftExtent,
      y: texH - widthCells * TILE_H / 2,
    };
    const raise = (p: IsoPoint) => ({ x: p.x, y: p.y - wallH });

    return {
      texW: halfW * 2,
      texH,
      top,
      right,
      bottom,
      left,
      topR: raise(top),
      rightR: raise(right),
      bottomR: raise(bottom),
      leftR: raise(left),
    };
  }

  protected wallInset(start: IsoPoint, end: IsoPoint, from: number, to: number, height: number): IsoPoint[] {
    const along = (t: number) => ({
      x: start.x + (end.x - start.x) * t,
      y: start.y + (end.y - start.y) * t,
    });
    const a = along(from);
    const b = along(to);

    return [a, b, { x: b.x, y: b.y - height }, { x: a.x, y: a.y - height }];
  }

  protected drawIsoPrism(
    g: Phaser.GameObjects.Graphics,
    geo: IsoPrism,
    colors: { right: number; left: number; top: number; edge?: number; alpha?: number },
  ): void {
    const edge = colors.edge ?? 0x2a1a0a;
    const alpha = colors.alpha ?? 1;

    g.lineStyle(2, edge, alpha);
    g.fillStyle(colors.right, 1);
    g.fillPoints([geo.right, geo.bottom, geo.bottomR, geo.rightR], true);
    g.strokePoints([geo.right, geo.bottom, geo.bottomR, geo.rightR], true);

    g.fillStyle(colors.left, 1);
    g.fillPoints([geo.left, geo.bottom, geo.bottomR, geo.leftR], true);
    g.strokePoints([geo.left, geo.bottom, geo.bottomR, geo.leftR], true);

    g.fillStyle(colors.top, 1);
    g.fillPoints([geo.topR, geo.rightR, geo.bottomR, geo.leftR], true);
    g.strokePoints([geo.topR, geo.rightR, geo.bottomR, geo.leftR], true);
  }

  protected makePersonTexture(key: string, options: CharacterTextureOptions): void {
    makeCharacterTexture(this, key, options);
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
        sprite.depth > reveal.depth && this.circleIntersectsRect(reveal.x, reveal.y, reveal.radius, bounds));

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
      .map((sprite) => {
        const bounds = sprite.getBounds();
        return {
          x: bounds.centerX,
          y: bounds.centerY,
          depth: sprite.depth,
          radius: Phaser.Math.Clamp(Math.max(bounds.width, bounds.height) * 0.62, 34, 54),
        };
      });
  }

  private playerRevealTarget(): RevealTarget {
    const bounds = this.player.getBounds();
    return {
      x: bounds.centerX,
      y: bounds.centerY,
      depth: this.player.depth,
      radius: Phaser.Math.Clamp(Math.max(bounds.width, bounds.height) * 0.68, 38, 60),
    };
  }

  private createSoftRevealMask(
    sprite: Phaser.GameObjects.Image,
    bounds: Phaser.Geom.Rectangle,
    staticReveals: RevealTarget[],
  ): void {
    const width = Math.max(1, Math.ceil(bounds.width));
    const height = Math.max(1, Math.ceil(bounds.height));
    const textureKey = `${this.scene.key}-reveal-mask-${this.revealMaskStates.length}`;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('Could not create interactable reveal mask canvas context');
      return;
    }

    const texture = this.textures.addCanvas(textureKey, canvas);
    if (!texture) {
      console.warn(`Could not create interactable reveal mask texture: ${textureKey}`);
      return;
    }

    const maskObject = this.make.image({
      x: bounds.centerX,
      y: bounds.centerY,
      key: textureKey,
      add: false,
    }).setOrigin(0.5);

    const mask = maskObject.createBitmapMask();
    mask.invertAlpha = true;
    sprite.setMask(mask);
    this.revealMaskStates.push({
      sprite,
      bounds,
      staticReveals,
      textureKey,
      texture,
      context: ctx,
      maskObject,
    });
  }

  private createHardRevealMask(
    sprite: Phaser.GameObjects.Image,
    bounds: Phaser.Geom.Rectangle,
    staticReveals: RevealTarget[],
  ): void {
    const maskShape = this.add.graphics().setVisible(false);
    const mask = maskShape.createGeometryMask();
    mask.setInvertAlpha(true);
    sprite.setMask(mask);
    this.revealMaskStates.push({
      sprite,
      bounds,
      staticReveals,
      maskShape,
    });
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
        && this.circleIntersectsRect(playerReveal.x, playerReveal.y, playerReveal.radius, state.bounds)) {
        reveals.push(playerReveal);
      }
      this.redrawRevealMask(state, reveals);
    }
    this.lastPlayerReveal = playerReveal;
  }

  private redrawRevealMask(state: RevealMaskState, reveals: RevealTarget[]): void {
    if (state.context && state.texture) {
      state.context.clearRect(0, 0, state.context.canvas.width, state.context.canvas.height);
      for (const reveal of reveals) {
        this.drawSoftRevealCircle(state.context, state.bounds, reveal);
      }
      state.texture.refresh();
      return;
    }

    state.maskShape?.clear();
    state.maskShape?.fillStyle(0xffffff, 1);
    for (const reveal of reveals) {
      state.maskShape?.fillCircle(reveal.x, reveal.y, reveal.radius);
    }
  }

  private drawSoftRevealCircle(
    ctx: CanvasRenderingContext2D,
    bounds: Phaser.Geom.Rectangle,
    reveal: RevealTarget,
  ): void {
    const localX = reveal.x - bounds.left;
    const localY = reveal.y - bounds.top;
    const gradient = ctx.createRadialGradient(localX, localY, 0, localX, localY, reveal.radius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
    gradient.addColorStop(0.52, 'rgba(255, 255, 255, 0.82)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(
      Math.floor(localX - reveal.radius),
      Math.floor(localY - reveal.radius),
      Math.ceil(reveal.radius * 2),
      Math.ceil(reveal.radius * 2),
    );
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

  private circleIntersectsRect(
    circleX: number,
    circleY: number,
    radius: number,
    rect: Phaser.Geom.Rectangle,
  ): boolean {
    const nearestX = Phaser.Math.Clamp(circleX, rect.left, rect.right);
    const nearestY = Phaser.Math.Clamp(circleY, rect.top, rect.bottom);
    const dx = circleX - nearestX;
    const dy = circleY - nearestY;
    return dx * dx + dy * dy <= radius * radius;
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
    this.setMobileControlsVisible(false);
    this.scene.launch('Dialogue', {
      tree,
      onComplete: () => {
        this.scene.resume();
        this.setMobileControlsVisible(true);
        this.handleEnding();
      },
    } as DialogueLaunch);
    this.scene.pause();
  }

  protected handleEnding(): void {
    const flags = getFlags();
    const chapter = chapterByScene(this.scene.key);
    const chapterFreshlyDone = !!chapter && chapter.isComplete(flags)
      && !flags[`shown_${chapter.id}`];

    const ending = flags.ending as string | undefined;
    const shouldShowFirstLetterBanner = chapter?.id === 'shiraz'
      && !!ending
      && !this.endingShown
      && !flags[`shown_${chapter.id}`];

    if (shouldShowFirstLetterBanner) {
      this.endingShown = true;
      this.showBanner(this.endingBannerText(ending), {
        onComplete: chapterFreshlyDone ? () => this.openChapterEnd(chapter!.id) : undefined,
      });
      if (chapterFreshlyDone) {
        applyEffect({ set: { [`shown_${chapter!.id}`]: true } });
      }
      return;
    }

    if (chapterFreshlyDone) {
      applyEffect({ set: { [`shown_${chapter!.id}`]: true } });
      this.openChapterEnd(chapter!.id);
    }
  }

  protected openChapterEnd(chapterId: string): void {
    if (this.scene.isActive('ChapterEnd')) return;
    this.setMobileControlsVisible(false);
    this.scene.launch('ChapterEnd', { chapterId, from: this.scene.key });
    this.scene.pause();
  }

  /**
   * Fade the banner in, hold it for a few seconds, then fade out.
   * Cancels any previous banner tweens so re-triggers behave sanely.
   */
  protected showBanner(text: string, opts: { holdMs?: number; onComplete?: () => void } = {}): void {
    const holdMs = opts.holdMs ?? 1800;
    this.tweens.killTweensOf(this.banner);
    this.banner.setText(text).setAlpha(0);
    this.tweens.add({
      targets: this.banner,
      alpha: 1,
      duration: 300,
      onComplete: () => {
        this.tweens.add({
          targets: this.banner,
          alpha: 0,
          delay: holdMs,
          duration: 500,
          onComplete: opts.onComplete,
        });
      },
    });
  }

  protected endingBannerText(ending: string): string {
    return ending === 'firstLetter'
      ? '— The First Letter of the Living —'
      : '— You walk on into the night —';
  }

  // ---------- HUD ----------

  protected setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.journalKey  = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.chapterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.highlightKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    this.tabHighlightKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TAB, true);
    this.restartKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.wasdKeys = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  protected setupHUD(width: number, height: number): void {
    const UI_DEPTH = 10000;
    const size = { width, height };
    const margin = responsiveMargin(size);
    const narrow = isNarrowLayout(size);
    const buttonY = narrow ? 10 : 14;
    const buttonSize = MIN_TOUCH_TARGET;
    const buttonGap = narrow ? 5 : 8;
    const buttonBlockW = buttonSize * 4 + buttonGap * 3;
    const titleW = narrow ? Math.max(72, width - margin * 2 - buttonBlockW - 12) : width * 0.42;
    const mobileControls = this.shouldShowMobileControls(size);
    const mobileControlSize = touchSize(width <= 380 ? 48 : 52);
    const mobileControlsTop = height - margin - mobileControlSize * 3 - 12;
    const promptY = mobileControls ? Math.max(150, mobileControlsTop - 24) : height - 36;

    this.add.text(margin, narrow ? 10 : 14, this.sceneTitle, {
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(narrow ? 16 : 18, size), color: '#e8d9b0',
      wordWrap: { width: titleW },
    }).setScrollFactor(0).setDepth(UI_DEPTH);
    this.add.text(margin, narrow ? 31 : 38, narrow ? 'WASD/Arrows • E Speak • Tab Highlight' : 'Arrows / WASD walk  •  E speak  •  H toggle / Tab hold highlight  •  J journal', {
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(13, size), color: '#9c8458',
      wordWrap: { width: titleW },
    }).setScrollFactor(0).setDepth(UI_DEPTH);

    const right = width - margin;
    this.makeHudIconButton(right - buttonSize, buttonY, buttonSize, '⟲', 'R', 'Restart', () => this.restart()).setScrollFactor(0).setDepth(UI_DEPTH);
    this.makeHudIconButton(right - (buttonSize + buttonGap) * 2 + buttonGap, buttonY, buttonSize, '◫', 'J', 'Journal', () => this.openJournal()).setScrollFactor(0).setDepth(UI_DEPTH);
    this.makeHudIconButton(right - (buttonSize + buttonGap) * 3 + buttonGap, buttonY, buttonSize, '☰', 'C', 'Chapters', () => this.openChapterSelect()).setScrollFactor(0).setDepth(UI_DEPTH);
    this.makeHudIconButton(right - (buttonSize + buttonGap) * 4 + buttonGap, buttonY, buttonSize, '◎', 'H / Tab', 'Highlight', () => this.toggleInteractableHighlights()).setScrollFactor(0).setDepth(UI_DEPTH);

    this.promptText = this.add.text(width / 2, promptY, '', {
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(18, size, 13), color: '#f3d98a',
      backgroundColor: '#00000099',
      padding: { x: 12, y: 7 },
      align: 'center',
      wordWrap: { width: width - margin * 2 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(UI_DEPTH).setVisible(false);

    this.exitPromptText = this.add.text(width / 2, promptY - 28, '', {
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(15, size, 12), color: '#c9a55c', fontStyle: 'italic',
      backgroundColor: '#00000088',
      padding: { x: 10, y: 6 },
      align: 'center',
      wordWrap: { width: width - margin * 2 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(UI_DEPTH).setVisible(false);

    this.banner = this.add.text(width / 2, narrow ? 104 : 72, '', {
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(22, size, 15), color: '#f3e2b5',
      fontStyle: 'italic', backgroundColor: '#00000088', padding: { x: 12, y: 6 },
      align: 'center',
      wordWrap: { width: width - margin * 2 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(UI_DEPTH).setAlpha(0);

    if (mobileControls) this.setupMobileControls(width, height, UI_DEPTH + 5);
  }

  private shouldShowMobileControls({ width, height }: { width: number; height: number }): boolean {
    return width <= 640 || (width <= 760 && height <= 520);
  }

  protected makeHudIconButton(
    x: number,
    y: number,
    size: number,
    icon: string,
    hotkey: string,
    label: string,
    onClick: () => void,
  ): Phaser.GameObjects.Container {
    const rect = this.add.rectangle(x, y, size, size, 0x1a120a, 0.92)
      .setOrigin(0)
      .setScrollFactor(0)
      .setStrokeStyle(1, 0x5a4428, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        rect.setStrokeStyle(1, 0xf3d98a, 1);
        text.setColor('#fff1c0');
        this.showHudTooltip(x + size, y + size + 6, `${hotkey}: ${label}`);
      })
      .on('pointerout',  () => {
        rect.setStrokeStyle(1, 0x5a4428, 1);
        text.setColor('#f3d98a');
        this.hideHudTooltip();
      })
      .on('pointerdown', onClick);
    const text = this.add.text(x + size / 2, y + size / 2 - 1, icon, {
      fontFamily: 'Georgia, serif',
      fontSize: buttonFont(Math.round(size * 0.62), this.scale),
      color: '#f3d98a',
    }).setOrigin(0.5).setScrollFactor(0);
    return this.add.container(0, 0, [rect, text]).setScrollFactor(0);
  }

  private showHudTooltip(x: number, y: number, label: string): void {
    this.hideHudTooltip();
    const margin = responsiveMargin(this.scale);
    const text = this.add.text(0, 0, label, {
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(13, this.scale),
      color: '#f3e2b5',
    }).setScrollFactor(0);
    const bounds = text.getBounds();
    const w = bounds.width + 18;
    const h = bounds.height + 10;
    const tooltipX = Phaser.Math.Clamp(x - w, margin, this.scale.width - margin - w);
    const tooltipY = Phaser.Math.Clamp(y, margin, this.scale.height - margin - h);
    text.setPosition(tooltipX + 9, tooltipY + 5);
    const bg = this.add.rectangle(tooltipX, tooltipY, w, h, 0x0a0806, 0.96)
      .setOrigin(0)
      .setScrollFactor(0)
      .setStrokeStyle(1, 0xf3d98a, 0.8);
    this.hudTooltip = this.add.container(0, 0, [bg, text]).setScrollFactor(0).setDepth(10020);
  }

  private hideHudTooltip(): void {
    this.hudTooltip?.destroy(true);
    this.hudTooltip = undefined;
  }

  private setupMobileControls(width: number, height: number, depth: number): void {
    const margin = responsiveMargin(this.scale);
    const size = touchSize(width <= 380 ? 48 : 52);
    const gap = 6;
    const top = height - margin - size * 3 - gap * 2;
    const left = margin;
    const centerX = left + size + gap;
    const centerY = top + size + gap;

    const bg = this.add.rectangle(left - 6, top - 6, size * 3 + gap * 2 + 12, size * 3 + gap * 2 + 12, 0x0a0806, 0.32)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(depth);
    bg.setStrokeStyle(1, 0x5a4428, 0.5);
    this.mobileControls = this.add.container(0, 0, [bg]).setScrollFactor(0).setDepth(depth);

    this.makeMobileMoveButton(centerX, top, size, '▲', { dx: 0, dy: -1 }, depth + 1);
    this.makeMobileMoveButton(left, centerY, size, '◀', { dx: -1, dy: 0 }, depth + 1);
    this.makeMobileMoveButton(left + (size + gap) * 2, centerY, size, '▶', { dx: 1, dy: 0 }, depth + 1);
    this.makeMobileMoveButton(centerX, top + (size + gap) * 2, size, '▼', { dx: 0, dy: 1 }, depth + 1);

    const actionW = Math.max(MIN_TOUCH_TARGET, Math.round(size * 1.45));
    const actionH = Math.max(MIN_TOUCH_TARGET, size);
    const actionX = width - margin - actionW;
    const actionY = centerY;
    this.mobileActionButton = this.add.rectangle(actionX, actionY, actionW, actionH, 0x2a1c10, 0.92)
      .setOrigin(0)
      .setScrollFactor(0)
      .setStrokeStyle(1, 0x5a4428, 1)
      .setInteractive({ useHandCursor: true })
      .setDepth(depth + 1)
      .on('pointerover', () => {
        this.mobileActionButton?.setStrokeStyle(2, 0xf3d98a, 1);
        this.mobileActionLabel?.setColor('#fff1c0');
      })
      .on('pointerout', () => {
        this.mobileActionButton?.setStrokeStyle(1, 0x5a4428, 1);
        this.mobileActionLabel?.setColor('#f3d98a');
      })
      .on('pointerdown', () => this.triggerInteraction());
    this.mobileActionLabel = this.add.text(actionX + actionW / 2, actionY + actionH / 2, 'ACT', {
      fontFamily: 'Georgia, serif',
      fontSize: buttonFont(17, this.scale),
      color: '#f3d98a',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2);
    this.mobileControls.add([this.mobileActionButton, this.mobileActionLabel]);
  }

  private makeMobileMoveButton(
    x: number,
    y: number,
    size: number,
    icon: string,
    direction: { dx: number; dy: number },
    depth: number,
  ): void {
    const button = this.add.rectangle(x, y, size, size, 0x1a120a, 0.9)
      .setOrigin(0)
      .setScrollFactor(0)
      .setStrokeStyle(1, 0x5a4428, 1)
      .setInteractive({ useHandCursor: true })
      .setDepth(depth)
      .on('pointerdown', () => {
        this.mobileMoveDirection = direction;
        button.setStrokeStyle(2, 0xf3d98a, 1);
        text.setColor('#fff1c0');
      })
      .on('pointerup', () => this.clearMobileMove(direction, button, text))
      .on('pointerout', () => this.clearMobileMove(direction, button, text))
      .on('pointerupoutside', () => this.clearMobileMove(direction, button, text));
    const text = this.add.text(x + size / 2, y + size / 2 - 1, icon, {
      fontFamily: 'Georgia, serif',
      fontSize: buttonFont(Math.round(size * 0.52), this.scale),
      color: '#f3d98a',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1);
    if (this.mobileControls) this.mobileControls.add([button, text]);
  }

  private clearMobileMove(
    direction: { dx: number; dy: number },
    button: Phaser.GameObjects.Rectangle,
    text: Phaser.GameObjects.Text,
  ): void {
    if (this.mobileMoveDirection === direction) this.mobileMoveDirection = undefined;
    button.setStrokeStyle(1, 0x5a4428, 1);
    text.setColor('#f3d98a');
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

  protected openChapterSelect(): void {
    this.cameras.main.fadeOut(280, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.stop('Dialogue');
      this.scene.stop('Journal');
      this.scene.start('ChapterSelect');
    });
  }

  protected restart(): void {
    resetFlags();
    this.scene.stop('Dialogue');
    this.scene.stop('Journal');
    this.scene.start('Title');
  }

  // ---------- update / movement ----------

  update(_time: number, delta: number): void {
    this.moveCooldown -= delta;
    this.handleMovement();
    this.updatePlayerRevealMasks();
    this.handleInteractionPrompt();
    if (Phaser.Input.Keyboard.JustDown(this.journalKey)) this.openJournal();
    if (Phaser.Input.Keyboard.JustDown(this.chapterKey)) this.openChapterSelect();
    if (Phaser.Input.Keyboard.JustDown(this.highlightKey)) this.toggleInteractableHighlights();
    if (Phaser.Input.Keyboard.JustDown(this.tabHighlightKey)) this.holdInteractableHighlights(true);
    if (Phaser.Input.Keyboard.JustUp(this.tabHighlightKey)) this.holdInteractableHighlights(false);
    if (Phaser.Input.Keyboard.JustDown(this.restartKey)) this.restart();
  }

  protected handleMovement(): void {
    if (this.moveCooldown > 0) return;
    const k = this.cursors;
    const { W, A, S, D } = this.wasdKeys;

    let dx = 0, dy = 0;
    if (k.left?.isDown || A.isDown)  dx = -1;
    else if (k.right?.isDown || D.isDown) dx = 1;
    else if (k.up?.isDown || W.isDown)    dy = -1;
    else if (k.down?.isDown || S.isDown)  dy = 1;
    else if (this.mobileMoveDirection) {
      dx = this.mobileMoveDirection.dx;
      dy = this.mobileMoveDirection.dy;
    }

    if (dx === 0 && dy === 0) return;

    const nx = this.playerGrid.x + dx;
    const ny = this.playerGrid.y + dy;

    // Edge exit?
    if (!this.inBounds(nx, ny)) {
      const exit = this.exits.find(e =>
        e.fromX === this.playerGrid.x && e.fromY === this.playerGrid.y &&
        e.dx === dx && e.dy === dy);
      if (exit) this.transitionTo(exit);
      return;
    }

    if (this.blocked[ny][nx]) return;

    this.playerGrid.x = nx;
    this.playerGrid.y = ny;
    const pos = this.gridToScreen(nx, ny);
    this.tweens.add({
      targets: this.player,
      x: pos.sx, y: pos.sy + TILE_H / 2,
      duration: 140, ease: 'Sine.easeInOut',
      onUpdate: () => {
        this.player.setDepth(this.player.y + 2);
        this.updatePlayerRevealMasks();
      },
      onComplete: () => this.updatePlayerRevealMasks(true),
    });
    this.moveCooldown = 150;
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
    return this.interactables.find(i => {
      const dx = Math.abs(i.gridX - this.playerGrid.x);
      const dy = Math.abs(i.gridY - this.playerGrid.y);
      return dx + dy === 1;
    });
  }

  protected handleInteractionPrompt(): void {
    const near = this.nearestInteractable();
    if (near) {
      this.promptText.setText(near.prompt).setVisible(true);
      this.mobileActionButton?.setAlpha(1);
      this.mobileActionLabel?.setAlpha(1);
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) this.triggerInteraction();
    } else {
      this.promptText.setText('').setVisible(false);
      this.mobileActionButton?.setAlpha(0.62);
      this.mobileActionLabel?.setAlpha(0.62);
    }
    // Exit-tile prompt
    const onExit = this.exits.find(e =>
      e.fromX === this.playerGrid.x && e.fromY === this.playerGrid.y);
    this.exitPromptText.setText(onExit ? onExit.label : '').setVisible(Boolean(onExit));
  }

  private triggerInteraction(): void {
    this.nearestInteractable()?.action();
  }
}
