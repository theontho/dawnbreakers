import Phaser from 'phaser';
import { dialogues, babTreeFor } from '../data/dialogues';
import { getFlags, resetFlags } from '../dialogue/flags';
import type { DialogueLaunch } from './DialogueScene';

const TILE_W = 64;
const TILE_H = 32;
const MAP_W = 18;
const MAP_H = 18;

type TileKind = 'grass' | 'path' | 'stone' | 'water' | 'sand';

interface Building {
  // Top-left grid corner of footprint
  gridX: number;
  gridY: number;
  // Size of footprint in tiles
  w: number;
  h: number;
  texture: string;
}

interface Interactable {
  gridX: number;
  gridY: number;
  prompt: string;
  texture: string;
  action: () => void;
  sprite?: Phaser.GameObjects.Image;
}

export class ShirazScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Image;
  private playerGrid = { x: 16, y: 16 };
  private map: TileKind[][] = [];
  private blocked: boolean[][] = [];
  private interactables: Interactable[] = [];
  private buildings: Building[] = [];

  private promptText!: Phaser.GameObjects.Text;
  private banner!: Phaser.GameObjects.Text;
  private endingShown = false;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private journalKey!: Phaser.Input.Keyboard.Key;
  private moveCooldown = 0;

  private originX = 0;
  private originY = 0;

  constructor() {
    super('Shiraz');
  }

  create(): void {
    const { width, height } = this.scale;
    this.originX = width / 2;
    this.originY = 90;
    this.endingShown = false;

    this.buildMap();
    this.placeBuildings();
    this.drawWorld();
    this.spawnNPCs();
    this.spawnPlayer();

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.journalKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.J);

    // HUD
    this.add.text(20, 14, 'Shíráz — 22 May 1844', {
      fontFamily: 'Georgia, serif', fontSize: '18px', color: '#e8d9b0',
    });
    this.add.text(20, 38, 'Arrows / WASD walk  •  E speak  •  J journal', {
      fontFamily: 'Georgia, serif', fontSize: '13px', color: '#9c8458',
    });

    this.makeHudButton(width - 20, 16, 'Restart', () => this.restart()).setOrigin(1, 0);
    this.makeHudButton(width - 110, 16, 'Journal', () => this.openJournal()).setOrigin(1, 0);

    this.promptText = this.add.text(width / 2, height - 36, '', {
      fontFamily: 'Georgia, serif', fontSize: '18px', color: '#f3d98a',
    }).setOrigin(0.5);

    this.banner = this.add.text(width / 2, 72, '', {
      fontFamily: 'Georgia, serif', fontSize: '22px', color: '#f3e2b5',
      fontStyle: 'italic', backgroundColor: '#00000088', padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setAlpha(0);

    // If the player has already finished, show the banner immediately on revisit.
    const e = getFlags().ending as string | undefined;
    if (e) {
      this.endingShown = true;
      this.banner.setText(e === 'firstLetter'
        ? '— The First Letter of the Living —'
        : '— You walked on into the night —').setAlpha(1);
    }
  }

  // ---------- map ----------

  private buildMap(): void {
    for (let y = 0; y < MAP_H; y++) {
      const row: TileKind[] = [];
      const brow: boolean[] = [];
      for (let x = 0; x < MAP_W; x++) {
        row.push('grass');
        brow.push(false);
      }
      this.map.push(row);
      this.blocked.push(brow);
    }

    // North–south thoroughfare connecting gate (south) → bazaar → mosque → Báb's house (north)
    const path: [number, number][] = [];
    // From gate area up to bazaar
    for (let y = 16; y >= 13; y--) path.push([13, y]);
    // West toward mosque
    for (let x = 12; x >= 8; x--) path.push([x, 13]);
    for (let y = 12; y >= 11; y--) path.push([8, y]);
    // Up past mosque to Báb's quarter
    for (let y = 10; y >= 6; y--) path.push([8, y]);
    for (let x = 8; x <= 9; x++) path.push([x, 5]);
    path.forEach(([x, y]) => { this.map[y][x] = 'path'; });

    // Stone plaza around Báb's house
    for (let y = 2; y <= 4; y++)
      for (let x = 7; x <= 10; x++)
        if (this.inBounds(x, y)) this.map[y][x] = 'stone';

    // Stone court around mosque
    for (let y = 9; y <= 11; y++)
      for (let x = 5; x <= 9; x++)
        if (this.inBounds(x, y)) this.map[y][x] = 'stone';

    // Fountain west of mosque
    this.map[10][4] = 'water';
    this.map[11][4] = 'water';
    this.blocked[10][4] = true;
    this.blocked[11][4] = true;

    // Bazaar — sandy plaza
    for (let y = 13; y <= 15; y++)
      for (let x = 11; x <= 15; x++)
        if (this.inBounds(x, y)) this.map[y][x] = 'sand';

    // Sand around the gate
    for (let y = 16; y <= 17; y++)
      for (let x = 12; x <= 15; x++)
        if (this.inBounds(x, y)) this.map[y][x] = 'sand';
  }

  // ---------- buildings ----------

  private placeBuildings(): void {
    // Báb's house — 2×2 footprint at (8,3)
    this.buildings.push({ gridX: 8, gridY: 3, w: 2, h: 2, texture: 'house' });
    this.blockFootprint(8, 3, 2, 2);

    // Mosque — 2×2 footprint at (6,9) (square so the iso texture aligns)
    this.buildings.push({ gridX: 6, gridY: 9, w: 2, h: 2, texture: 'mosque' });
    this.blockFootprint(6, 9, 2, 2);

    // Bazaar stalls — single tiles
    this.buildings.push({ gridX: 11, gridY: 14, w: 1, h: 1, texture: 'stall' });
    this.buildings.push({ gridX: 15, gridY: 14, w: 1, h: 1, texture: 'stall' });
    this.blockFootprint(11, 14, 1, 1);
    this.blockFootprint(15, 14, 1, 1);

    // City gate — single tile
    this.buildings.push({ gridX: 14, gridY: 17, w: 1, h: 1, texture: 'gate' });
    this.blockFootprint(14, 17, 1, 1);
  }

  private blockFootprint(x: number, y: number, w: number, h: number): void {
    for (let dy = 0; dy < h; dy++)
      for (let dx = 0; dx < w; dx++)
        if (this.inBounds(x + dx, y + dy)) this.blocked[y + dy][x + dx] = true;
  }

  private inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < MAP_W && y < MAP_H;
  }

  // ---------- drawing ----------

  private drawWorld(): void {
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const { sx, sy } = this.gridToScreen(x, y);
        this.add.image(sx, sy, 'tile-' + this.map[y][x])
          .setOrigin(0.5, 0.5).setDepth(sy);
      }
    }

    for (const b of this.buildings) {
      // Iso building textures are sized so their bottom-center vertex matches
      // the front-most tile's bottom vertex. Anchor with origin (0.5, 1)
      // at that tile's bottom-of-diamond.
      const frontX = b.gridX + b.w - 1;
      const frontY = b.gridY + b.h - 1;
      const front = this.gridToScreen(frontX, frontY);
      this.add.image(front.sx, front.sy + TILE_H / 2, b.texture)
        .setOrigin(0.5, 1)
        .setDepth(front.sy + 1);
    }
  }

  private gridToScreen(gx: number, gy: number): { sx: number; sy: number } {
    const sx = this.originX + (gx - gy) * (TILE_W / 2);
    const sy = this.originY + (gx + gy) * (TILE_H / 2);
    return { sx, sy };
  }

  // ---------- NPCs ----------

  private spawnNPCs(): void {
    // The Báb — outside His door
    this.addNPC(8, 5, 'npc-bab',
      () => 'Speak with the Young Host  [E]',
      () => this.startBabDialogue());

    // Traveller — near the city gate
    this.addNPC(14, 16, 'npc-traveller',
      () => 'Speak with the Weary Traveller  [E]',
      () => this.startSimpleDialogue('rumour-traveller'));

    // Merchant — in the bazaar
    this.addNPC(12, 14, 'npc-merchant',
      () => 'Speak with the Cloth Merchant  [E]',
      () => this.startSimpleDialogue('rumour-merchant'));

    // Mullá — at the mosque entrance
    this.addNPC(7, 11, 'npc-mulla',
      () => 'Speak with the Stern Mullá  [E]',
      () => this.startSimpleDialogue('rumour-mulla'));
  }

  private addNPC(gx: number, gy: number, texture: string,
                 promptFn: () => string, action: () => void): void {
    const pos = this.gridToScreen(gx, gy);
    const sprite = this.add.image(pos.sx, pos.sy + TILE_H / 2, texture)
      .setOrigin(0.5, 1).setDepth(pos.sy + 1);
    this.blocked[gy][gx] = true;
    this.interactables.push({
      gridX: gx, gridY: gy, texture,
      prompt: promptFn(), sprite, action,
    });
    // Keep prompt fresh (in case flags change)
    (sprite as unknown as { _promptFn: () => string })._promptFn = promptFn;
  }

  private spawnPlayer(): void {
    const pos = this.gridToScreen(this.playerGrid.x, this.playerGrid.y);
    this.player = this.add.image(pos.sx, pos.sy + TILE_H / 2, 'player')
      .setOrigin(0.5, 1).setDepth(pos.sy + 2);
  }

  // ---------- dialogue ----------

  private startSimpleDialogue(id: string): void {
    const tree = dialogues[id];
    if (!tree) return;
    this.scene.launch('Dialogue', { tree, onComplete: () => this.scene.resume() } as DialogueLaunch);
    this.scene.pause();
  }

  private startBabDialogue(): void {
    const tree = babTreeFor(getFlags());
    this.scene.launch('Dialogue', {
      tree,
      onComplete: () => { this.scene.resume(); this.handleEnding(); },
    } as DialogueLaunch);
    this.scene.pause();
  }

  private handleEnding(): void {
    const ending = getFlags().ending as string | undefined;
    if (!ending || this.endingShown) return;
    this.endingShown = true;
    const msg = ending === 'firstLetter'
      ? '— The First Letter of the Living —'
      : '— You walk on into the night —';
    this.banner.setText(msg).setAlpha(0);
    this.tweens.add({ targets: this.banner, alpha: 1, duration: 800 });
  }

  // ---------- HUD ----------

  private makeHudButton(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Text {
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

  private openJournal(): void {
    if (this.scene.isActive('Journal')) return;
    this.scene.launch('Journal');
    this.scene.pause();
  }

  private restart(): void {
    resetFlags();
    this.scene.stop('Dialogue');
    this.scene.stop('Journal');
    this.scene.start('Title');
  }

  // ---------- update ----------

  update(_time: number, delta: number): void {
    this.moveCooldown -= delta;
    this.handleMovement();
    this.handleInteractionPrompt();
    if (Phaser.Input.Keyboard.JustDown(this.journalKey)) this.openJournal();
  }

  private handleMovement(): void {
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
    if (!this.inBounds(nx, ny) || this.blocked[ny][nx]) return;

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

  private nearestInteractable(): Interactable | undefined {
    return this.interactables.find(i => {
      const dx = Math.abs(i.gridX - this.playerGrid.x);
      const dy = Math.abs(i.gridY - this.playerGrid.y);
      return dx + dy === 1;
    });
  }

  private handleInteractionPrompt(): void {
    const near = this.nearestInteractable();
    if (near) {
      this.promptText.setText(near.prompt);
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) near.action();
    } else {
      this.promptText.setText('');
    }
  }
}
