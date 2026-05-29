import Phaser from 'phaser';
import { dialogues, babTreeFor } from '../data/dialogues';
import { getFlags, resetFlags, applyEffect } from '../dialogue/flags';
import { chapterByScene } from '../data/chapters';
import type { DialogueLaunch } from './DialogueScene';
import type { DialogueTree } from '../dialogue/types';
import { makeCharacterTexture, type CharacterTextureOptions } from './characterTexture';

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

  protected promptText!: Phaser.GameObjects.Text;
  protected exitPromptText!: Phaser.GameObjects.Text;
  protected banner!: Phaser.GameObjects.Text;
  protected endingShown = false;

  protected cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  protected interactKey!: Phaser.Input.Keyboard.Key;
  protected journalKey!: Phaser.Input.Keyboard.Key;
  protected moveCooldown = 0;

  protected originX = 0;
  protected originY = 90;

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
    this.endingShown = false;
  }

  create(): void {
    const { width, height } = this.scale;
    this.originX = width / 2;

    this.initEmptyMap();
    this.buildMap();
    this.placeBuildings();
    this.placeDecor();
    this.setupExits();
    this.drawWorld();
    this.spawnNPCs();
    this.spawnPlayer();
    this.setupInput();
    this.setupHUD(width, height);

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
      this.add.image(front.sx, front.sy + TILE_H / 2, b.texture)
        .setOrigin(0.5, 1)
        .setDepth(front.sy + 1);
    }

    for (const d of this.decor) {
      const pos = this.gridToScreen(d.gridX, d.gridY);
      this.add.image(pos.sx, pos.sy + TILE_H / 2, d.texture)
        .setOrigin(0.5, 1)
        .setDepth(pos.sy + 1);
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
    this.scene.launch('Dialogue', {
      tree,
      onComplete: () => { this.scene.resume(); this.handleEnding(); },
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
  }

  protected setupHUD(width: number, height: number): void {
    const UI_DEPTH = 10000;

    this.add.text(20, 14, this.sceneTitle, {
      fontFamily: 'Georgia, serif', fontSize: '18px', color: '#e8d9b0',
    }).setDepth(UI_DEPTH);
    this.add.text(20, 38, 'Arrows / WASD walk  •  E speak  •  J journal', {
      fontFamily: 'Georgia, serif', fontSize: '13px', color: '#9c8458',
    }).setDepth(UI_DEPTH);

    this.makeHudButton(width - 20, 16, 'Restart', () => this.restart())
      .setOrigin(1, 0).setDepth(UI_DEPTH);
    this.makeHudButton(width - 110, 16, 'Journal', () => this.openJournal())
      .setOrigin(1, 0).setDepth(UI_DEPTH);
    this.makeHudButton(width - 210, 16, 'Chapters', () => this.openChapterSelect())
      .setOrigin(1, 0).setDepth(UI_DEPTH);
    this.makeHudButton(width - 320, 16, 'Editor', () => this.openMapEditor())
      .setOrigin(1, 0).setDepth(UI_DEPTH);

    this.promptText = this.add.text(width / 2, height - 36, '', {
      fontFamily: 'Georgia, serif', fontSize: '18px', color: '#f3d98a',
    }).setOrigin(0.5).setDepth(UI_DEPTH);

    this.exitPromptText = this.add.text(width / 2, height - 64, '', {
      fontFamily: 'Georgia, serif', fontSize: '15px', color: '#c9a55c', fontStyle: 'italic',
    }).setOrigin(0.5).setDepth(UI_DEPTH);

    this.banner = this.add.text(width / 2, 72, '', {
      fontFamily: 'Georgia, serif', fontSize: '22px', color: '#f3e2b5',
      fontStyle: 'italic', backgroundColor: '#00000088', padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setDepth(UI_DEPTH).setAlpha(0);
  }

  protected makeHudButton(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Text {
    const t = this.add.text(x, y, label, {
      fontFamily: 'Georgia, serif', fontSize: '16px', color: '#f3d98a',
      backgroundColor: '#1a120acc', padding: { x: 10, y: 6 },
    })
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => t.setColor('#fff1c0'))
      .on('pointerout',  () => t.setColor('#f3d98a'))
      .on('pointerdown', onClick);
    return t;
  }

  protected openJournal(): void {
    if (this.scene.isActive('Journal')) return;
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

  protected openMapEditor(): void {
    this.scene.stop('Dialogue');
    this.scene.stop('Journal');
    this.scene.start('MapEditor', { from: this.scene.key });
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
    this.handleInteractionPrompt();
    if (Phaser.Input.Keyboard.JustDown(this.journalKey)) this.openJournal();
  }

  protected handleMovement(): void {
    if (this.moveCooldown > 0) return;
    const k = this.cursors;
    const kb = this.input.keyboard!;
    const W = kb.addKey('W'), A = kb.addKey('A'), S = kb.addKey('S'), D = kb.addKey('D');

    let dx = 0, dy = 0;
    if (k.left?.isDown || A.isDown)  dx = -1;
    else if (k.right?.isDown || D.isDown) dx = 1;
    else if (k.up?.isDown || W.isDown)    dy = -1;
    else if (k.down?.isDown || S.isDown)  dy = 1;

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
      onUpdate: () => { this.player.setDepth(this.player.y + 2); },
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
      this.promptText.setText(near.prompt);
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) near.action();
    } else {
      this.promptText.setText('');
    }
    // Exit-tile prompt
    const onExit = this.exits.find(e =>
      e.fromX === this.playerGrid.x && e.fromY === this.playerGrid.y);
    this.exitPromptText.setText(onExit ? onExit.label : '');
  }
}
