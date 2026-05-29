import Phaser from 'phaser';
import { TILE_H, TILE_W, type IsoPoint, type TileKind } from './BaseMapScene';
import { makeCharacterTexture } from './characterTexture';

type EditorObjectKind = 'structure' | 'prop' | 'character';
type EditorObjectId =
  | 'house'
  | 'marketStall'
  | 'bridge'
  | 'cypress'
  | 'crateStack'
  | 'lamp'
  | 'rug'
  | 'well'
  | 'traveller'
  | 'merchant'
  | 'guard'
  | 'pilgrim';
type ObjectTool = `object:${EditorObjectId}`;
type EditorTool = TileKind | 'block' | 'open' | 'erase-object' | ObjectTool;

interface ObjectFootprint {
  w: number;
  h: number;
}

interface EditorObjectDefinition {
  id: EditorObjectId;
  label: string;
  texture: string;
  kind: EditorObjectKind;
  color: number;
  blocks: boolean;
  footprint?: ObjectFootprint;
  isometric?: true;
}

interface EditorPlacedObject {
  id: EditorObjectId;
  x: number;
  y: number;
}

interface EditorMap {
  width: number;
  height: number;
  tiles: TileKind[][];
  blocked: boolean[][];
  objects: EditorPlacedObject[];
}

interface StoredEditorObject extends EditorPlacedObject {
  texture?: string;
  kind?: EditorObjectKind;
  blocks?: boolean;
  footprint?: ObjectFootprint;
  isometric?: true;
}

interface StoredEditorMap {
  width: number;
  height: number;
  tiles: string[];
  blocked: string[];
  objects?: StoredEditorObject[];
}

interface EditorSceneData {
  from?: string;
}

interface EditorIsoPrism {
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

const STORAGE_KEY = 'dawnbreakers.mapEditor.v1';
const PANEL_W = 300;
const MIN_W = 6;
const MAX_W = 30;
const MIN_H = 6;
const MAX_H = 20;

const TILE_OPTIONS: Array<{ kind: TileKind; label: string; color: number }> = [
  { kind: 'grass', label: 'Grass', color: 0x4a6b3a },
  { kind: 'path', label: 'Path', color: 0x9c8458 },
  { kind: 'stone', label: 'Stone', color: 0x6b5a44 },
  { kind: 'water', label: 'Water', color: 0x2c4a6b },
  { kind: 'sand', label: 'Sand', color: 0xb89968 },
];

const EDITOR_OBJECTS: EditorObjectDefinition[] = [
  {
    id: 'house',
    label: 'Iso House',
    texture: 'editor-iso-house',
    kind: 'structure',
    color: 0x9b7048,
    blocks: true,
    footprint: { w: 2, h: 2 },
    isometric: true,
  },
  {
    id: 'marketStall',
    label: 'Iso Stall',
    texture: 'editor-iso-stall',
    kind: 'structure',
    color: 0xb88742,
    blocks: true,
    footprint: { w: 2, h: 1 },
    isometric: true,
  },
  {
    id: 'bridge',
    label: 'Iso Bridge',
    texture: 'editor-iso-bridge',
    kind: 'structure',
    color: 0x7b6142,
    blocks: false,
    footprint: { w: 3, h: 1 },
    isometric: true,
  },
  { id: 'cypress', label: 'Cypress', texture: 'editor-cypress', kind: 'prop', color: 0x234c2f, blocks: true },
  { id: 'crateStack', label: 'Crates', texture: 'editor-crates', kind: 'prop', color: 0x8a5a2a, blocks: true },
  { id: 'lamp', label: 'Lamp', texture: 'editor-lamp', kind: 'prop', color: 0xd8a23a, blocks: true },
  { id: 'rug', label: 'Rug', texture: 'editor-rug', kind: 'prop', color: 0x7a1f1f, blocks: false },
  { id: 'well', label: 'Well', texture: 'editor-well', kind: 'prop', color: 0x8f8068, blocks: true },
  { id: 'traveller', label: 'Traveller', texture: 'editor-char-traveller', kind: 'character', color: 0x4a3a2a, blocks: true },
  { id: 'merchant', label: 'Merchant', texture: 'editor-char-merchant', kind: 'character', color: 0x8a5a2a, blocks: true },
  { id: 'guard', label: 'Guard', texture: 'editor-char-guard', kind: 'character', color: 0x39404a, blocks: true },
  { id: 'pilgrim', label: 'Pilgrim', texture: 'editor-char-pilgrim', kind: 'character', color: 0xf2ead6, blocks: true },
];

const OBJECT_BY_ID: ReadonlyMap<EditorObjectId, EditorObjectDefinition> =
  new Map(EDITOR_OBJECTS.map(def => [def.id, def]));

const TILE_CODE: Record<TileKind, string> = {
  grass: 'g',
  path: 'p',
  stone: 's',
  water: 'w',
  sand: 'a',
};

const CODE_TILE: Record<string, TileKind> = {
  g: 'grass',
  p: 'path',
  s: 'stone',
  w: 'water',
  a: 'sand',
};

export class MapEditorScene extends Phaser.Scene {
  private editorMap!: EditorMap;
  private world?: Phaser.GameObjects.Container;
  private hover!: Phaser.GameObjects.Graphics;
  private ui!: Phaser.GameObjects.Container;
  private statusText!: Phaser.GameObjects.Text;
  private exportText!: Phaser.GameObjects.Text;
  private toolButtons: Array<{ tool: EditorTool; rect: Phaser.GameObjects.Rectangle }> = [];
  private activeTool: EditorTool = 'path';
  private originX = 0;
  private originY = 118;
  private lastPainted = '';
  private returnScene = 'Title';

  constructor() {
    super('MapEditor');
  }

  init(data: EditorSceneData): void {
    this.returnScene = data.from ?? 'Title';
  }

  create(): void {
    const { width, height } = this.scale;
    this.originX = (width - PANEL_W) / 2;
    this.validateObjectCatalog();
    this.ensureEditorObjectTextures();
    this.editorMap = this.loadStoredMap() ?? this.createDefaultMap(18, 12);

    this.add.rectangle(0, 0, width, height, 0x0a0806).setOrigin(0);
    this.add.text(24, 18, 'Map Editor', {
      fontFamily: 'Georgia, serif',
      fontSize: '34px',
      color: '#f3e2b5',
    });
    this.add.text(26, 58, 'Paint tiles, mark collision, place props/characters, and use iso-locked buildings.', {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#9c8458',
    });
    this.add.text(24, height - 34, 'Esc: back  |  S: save  |  C: copy JSON  |  B: block  |  O: open  |  E: erase object', {
      fontFamily: 'Georgia, serif',
      fontSize: '13px',
      color: '#6f6048',
    });

    this.hover = this.add.graphics().setDepth(9000);
    this.buildUI();
    this.renderWorld();
    this.updateStatus();
    this.setupInput();
  }

  private setupInput(): void {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.lastPainted = '';
      this.paintAtPointer(pointer);
    });
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.updateHover(pointer);
      if (pointer.leftButtonDown()) this.paintAtPointer(pointer);
    });
    this.input.on('pointerup', () => {
      this.lastPainted = '';
    });

    this.input.keyboard?.on('keydown-ESC', () => this.goBack());
    this.input.keyboard?.on('keydown-S', () => this.saveMap());
    this.input.keyboard?.on('keydown-C', () => void this.copyExport());
    this.input.keyboard?.on('keydown-B', () => this.selectTool('block'));
    this.input.keyboard?.on('keydown-O', () => this.selectTool('open'));
    this.input.keyboard?.on('keydown-E', () => this.selectTool('erase-object'));
  }

  private buildUI(): void {
    const { width, height } = this.scale;
    const x = width - PANEL_W + 18;
    this.ui?.destroy(true);
    this.ui = this.add.container(0, 0).setDepth(10000);
    this.toolButtons = [];

    this.ui.add(this.add.rectangle(width - PANEL_W, 0, PANEL_W, height, 0x120d08, 0.96).setOrigin(0));
    this.ui.add(this.add.text(x, 16, 'Palette', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#f3e2b5',
    }));

    let y = 52;
    this.ui.add(this.add.text(x, y, 'Tiles', {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#c9b07a',
    }));
    y += 24;
    for (let i = 0; i < TILE_OPTIONS.length; i++) {
      const option = TILE_OPTIONS[i];
      this.makeToolButton(x + (i % 2) * 132, y + Math.floor(i / 2) * 34, 122, option.label, option.kind, option.color);
    }

    y += 106;
    this.makeToolButton(x, y, 122, 'Block', 'block', 0x7a1f1f);
    this.makeToolButton(x + 132, y, 122, 'Open', 'open', 0x3f6f45);
    y += 42;

    this.ui.add(this.add.text(x, y, 'Props, characters, structures', {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#c9b07a',
    }));
    y += 24;
    const objectCols = 3;
    const objectButtonW = 84;
    for (let i = 0; i < EDITOR_OBJECTS.length; i++) {
      const option = EDITOR_OBJECTS[i];
      this.makeToolButton(
        x + (i % objectCols) * 86,
        y + Math.floor(i / objectCols) * 34,
        objectButtonW,
        option.label,
        this.objectTool(option.id),
        option.color,
      );
    }

    y += Math.ceil(EDITOR_OBJECTS.length / objectCols) * 34 + 8;
    this.makeToolButton(x, y, 254, 'Erase Object', 'erase-object', 0x4a1f1f);

    y += 46;
    this.ui.add(this.add.text(x, y, 'Size', {
      fontFamily: 'Georgia, serif',
      fontSize: '14px',
      color: '#c9b07a',
    }));
    y += 24;
    this.makeButton(x, y, 58, 28, '- W', () => this.resizeMap(this.editorMap.width - 1, this.editorMap.height));
    this.makeButton(x + 66, y, 58, 28, '+ W', () => this.resizeMap(this.editorMap.width + 1, this.editorMap.height));
    this.makeButton(x + 132, y, 58, 28, '- H', () => this.resizeMap(this.editorMap.width, this.editorMap.height - 1));
    this.makeButton(x + 198, y, 58, 28, '+ H', () => this.resizeMap(this.editorMap.width, this.editorMap.height + 1));

    y += 42;
    this.makeButton(x, y, 80, 30, 'Save', () => this.saveMap());
    this.makeButton(x + 88, y, 80, 30, 'Load', () => this.loadMapIntoEditor());
    this.makeButton(x + 176, y, 80, 30, 'Copy', () => void this.copyExport());
    y += 38;
    this.makeButton(x, y, 124, 30, 'Clear', () => this.resetMap());
    this.makeButton(x + 132, y, 124, 30, 'Back', () => this.goBack());

    y += 44;
    this.statusText = this.add.text(x, y, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      color: '#c9b07a',
      wordWrap: { width: PANEL_W - 36 },
    });
    this.ui.add(this.statusText);

    this.exportText = this.add.text(x, height - 80, '', {
      fontFamily: 'Menlo, Consolas, monospace',
      fontSize: '10px',
      color: '#8f8068',
      wordWrap: { width: PANEL_W - 36 },
    });
    this.ui.add(this.exportText);
    this.updateToolButtons();
  }

  private makeToolButton(
    x: number,
    y: number,
    width: number,
    label: string,
    tool: EditorTool,
    color: number,
  ): void {
    const rect = this.add.rectangle(x, y, width, 28, 0x24170d, 1)
      .setOrigin(0)
      .setStrokeStyle(1, 0x4a3a22, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.selectTool(tool));
    const swatch = this.add.rectangle(x + 8, y + 7, 16, 14, color, 1).setOrigin(0);
    const text = this.add.text(x + 30, y + 7, label, {
      fontFamily: 'Georgia, serif',
      fontSize: width < 100 ? '10px' : '12px',
      color: '#e8d9b0',
    });

    this.ui.add([rect, swatch, text]);
    this.toolButtons.push({ tool, rect });
  }

  private makeButton(x: number, y: number, w: number, h: number, label: string, onClick: () => void): void {
    const rect = this.add.rectangle(x, y, w, h, 0x1a120a, 1)
      .setOrigin(0)
      .setStrokeStyle(1, 0x5a4428, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => rect.setStrokeStyle(1, 0xf3d98a, 1))
      .on('pointerout', () => rect.setStrokeStyle(1, 0x5a4428, 1))
      .on('pointerdown', onClick);
    const text = this.add.text(x + w / 2, y + h / 2, label, {
      fontFamily: 'Georgia, serif',
      fontSize: '13px',
      color: '#f3d98a',
    }).setOrigin(0.5);
    this.ui.add([rect, text]);
  }

  private selectTool(tool: EditorTool): void {
    this.activeTool = tool;
    this.updateToolButtons();
    this.updateStatus();
  }

  private updateToolButtons(): void {
    for (const button of this.toolButtons) {
      button.rect.setStrokeStyle(
        button.tool === this.activeTool ? 2 : 1,
        button.tool === this.activeTool ? 0xf3d98a : 0x4a3a22,
        1,
      );
    }
  }

  private paintAtPointer(pointer: Phaser.Input.Pointer): void {
    if (this.isUIPointer(pointer)) return;
    const cell = this.gridFromPointer(pointer);
    if (!cell) return;

    const key = `${cell.x},${cell.y},${this.activeTool}`;
    if (key === this.lastPainted) return;
    this.lastPainted = key;

    const changed = this.applyTool(cell.x, cell.y);
    if (changed) {
      this.renderWorld();
      this.updateStatus();
    }
  }

  private applyTool(x: number, y: number): boolean {
    if (this.activeTool === 'block') {
      if (this.editorMap.blocked[y][x]) return false;
      this.editorMap.blocked[y][x] = true;
      return true;
    }
    if (this.activeTool === 'open') {
      if (!this.editorMap.blocked[y][x]) return false;
      this.editorMap.blocked[y][x] = false;
      return true;
    }
    if (this.activeTool === 'erase-object') {
      return this.eraseObjectAt(x, y);
    }
    if (this.isObjectTool(this.activeTool)) {
      return this.placeObject(this.activeTool.slice('object:'.length) as EditorObjectId, x, y);
    }
    if (this.editorMap.tiles[y][x] === this.activeTool) return false;
    this.editorMap.tiles[y][x] = this.activeTool;
    return true;
  }

  private placeObject(id: EditorObjectId, x: number, y: number): boolean {
    const def = OBJECT_BY_ID.get(id);
    if (!def) {
      this.updateStatus(`Unknown object: ${id}`);
      return false;
    }
    if (def.kind === 'structure' && (!def.isometric || !def.footprint)) {
      this.updateStatus('Structure rejected: buildings and bridges must use an isometric footprint.');
      return false;
    }
    if (!this.footprintInBounds(x, y, def.footprint)) {
      this.updateStatus(`${def.label} does not fit on the map.`);
      return false;
    }

    const cells = this.footprintCells(x, y, def.footprint);
    this.editorMap.objects = this.editorMap.objects.filter(obj =>
      !cells.some(cell => this.objectTouchesCell(obj, cell.x, cell.y)),
    );
    this.editorMap.objects.push({ id, x, y });
    return true;
  }

  private eraseObjectAt(x: number, y: number): boolean {
    for (let index = this.editorMap.objects.length - 1; index >= 0; index--) {
      if (!this.objectTouchesCell(this.editorMap.objects[index], x, y)) continue;
      this.editorMap.objects.splice(index, 1);
      return true;
    }
    return false;
  }

  private updateHover(pointer: Phaser.Input.Pointer): void {
    this.hover.clear();
    if (this.isUIPointer(pointer)) return;
    const cell = this.gridFromPointer(pointer);
    if (!cell) return;

    const def = this.activeObjectDefinition();
    if (def?.footprint) {
      const valid = this.footprintInBounds(cell.x, cell.y, def.footprint);
      this.hover.lineStyle(2, valid ? 0xf3d98a : 0xb83232, 0.95);
      this.drawFootprintOutline(this.hover, cell.x, cell.y, def.footprint);
      return;
    }

    const pos = this.gridToScreen(cell.x, cell.y);
    this.hover.lineStyle(2, this.activeTool === 'erase-object' ? 0xb83232 : 0xf3d98a, 0.9);
    this.hover.strokePoints(this.tileDiamond(pos.sx, pos.sy), true);
  }

  private renderWorld(): void {
    this.world?.destroy(true);
    this.world = this.add.container(0, 0).setDepth(1);

    for (let y = 0; y < this.editorMap.height; y++) {
      for (let x = 0; x < this.editorMap.width; x++) {
        const pos = this.gridToScreen(x, y);
        const tile = this.add.image(pos.sx, pos.sy, 'tile-' + this.editorMap.tiles[y][x])
          .setOrigin(0.5, 0.5);
        this.world.add(tile);
      }
    }

    const overlay = this.add.graphics();
    for (let y = 0; y < this.editorMap.height; y++) {
      for (let x = 0; x < this.editorMap.width; x++) {
        if (!this.editorMap.blocked[y][x]) continue;
        const pos = this.gridToScreen(x, y);
        const diamond = this.tileDiamond(pos.sx, pos.sy);
        overlay.fillStyle(0x7a1f1f, 0.38);
        overlay.fillPoints(diamond, true);
        overlay.lineStyle(2, 0x220909, 0.85);
        overlay.lineBetween(pos.sx - 14, pos.sy - 7, pos.sx + 14, pos.sy + 7);
        overlay.lineBetween(pos.sx + 14, pos.sy - 7, pos.sx - 14, pos.sy + 7);
      }
    }
    this.world.add(overlay);

    const objectOverlay = this.add.graphics();
    const sortedObjects = [...this.editorMap.objects].sort((a, b) => {
      const af = this.objectFrontCell(a);
      const bf = this.objectFrontCell(b);
      return (af.x + af.y) - (bf.x + bf.y);
    });
    for (const obj of sortedObjects) {
      const def = OBJECT_BY_ID.get(obj.id);
      if (!def) continue;

      if (def.footprint) {
        objectOverlay.lineStyle(1, def.isometric ? 0x76a56d : 0xb83232, 0.8);
        this.drawFootprintOutline(objectOverlay, obj.x, obj.y, def.footprint);
      }

      const front = this.objectFrontCell(obj);
      const pos = this.gridToScreen(front.x, front.y);
      const sprite = this.add.image(pos.sx, pos.sy + TILE_H / 2, def.texture)
        .setOrigin(0.5, 1)
        .setDepth(pos.sy + 1);
      this.world.add(sprite);
    }
    this.world.add(objectOverlay);
  }

  private resizeMap(width: number, height: number): void {
    const nextW = Phaser.Math.Clamp(width, MIN_W, MAX_W);
    const nextH = Phaser.Math.Clamp(height, MIN_H, MAX_H);
    if (nextW === this.editorMap.width && nextH === this.editorMap.height) return;

    const next = this.createEmptyMap(nextW, nextH, 'grass');
    for (let y = 0; y < Math.min(nextH, this.editorMap.height); y++) {
      for (let x = 0; x < Math.min(nextW, this.editorMap.width); x++) {
        next.tiles[y][x] = this.editorMap.tiles[y][x];
        next.blocked[y][x] = this.editorMap.blocked[y][x];
      }
    }
    next.objects = this.editorMap.objects.filter(obj => {
      const def = OBJECT_BY_ID.get(obj.id);
      return def !== undefined && this.footprintInBounds(obj.x, obj.y, def.footprint, nextW, nextH);
    });
    this.editorMap = next;
    this.renderWorld();
    this.updateStatus('Resized map.');
  }

  private resetMap(): void {
    this.editorMap = this.createDefaultMap(18, 12);
    this.renderWorld();
    this.updateStatus('Cleared to default map.');
  }

  private saveMap(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.encodeMap()));
      this.updateStatus('Saved in this browser.');
    } catch (error) {
      this.updateStatus(`Save failed: ${this.errorMessage(error)}`);
    }
  }

  private loadMapIntoEditor(): void {
    const loaded = this.loadStoredMap();
    if (!loaded) {
      this.updateStatus('No saved editor map found.');
      return;
    }
    this.editorMap = loaded;
    this.renderWorld();
    this.updateStatus('Loaded saved editor map.');
  }

  private loadStoredMap(): EditorMap | undefined {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!this.isStoredMap(parsed)) return undefined;
      return this.decodeMap(parsed);
    } catch {
      return undefined;
    }
  }

  private async copyExport(): Promise<void> {
    const json = JSON.stringify(this.encodeMap(), null, 2);
    this.exportText.setText(json.length > 420 ? json.slice(0, 420) + '\n...' : json);

    if (!navigator.clipboard) {
      this.updateStatus('Clipboard unavailable. JSON preview shown below.');
      return;
    }

    try {
      await navigator.clipboard.writeText(json);
      this.updateStatus('Copied JSON to clipboard.');
    } catch (error) {
      this.updateStatus(`Copy failed: ${this.errorMessage(error)}`);
    }
  }

  private encodeMap(): StoredEditorMap {
    return {
      width: this.editorMap.width,
      height: this.editorMap.height,
      tiles: this.editorMap.tiles.map(row => row.map(tile => TILE_CODE[tile]).join('')),
      blocked: this.editorMap.blocked.map(row => row.map(blocked => blocked ? '#' : '.').join('')),
      objects: this.editorMap.objects.map(obj => {
        const def = OBJECT_BY_ID.get(obj.id);
        return {
          ...obj,
          texture: def?.texture,
          kind: def?.kind,
          blocks: def?.blocks,
          footprint: def?.footprint,
          isometric: def?.isometric,
        };
      }),
    };
  }

  private decodeMap(stored: StoredEditorMap): EditorMap {
    const decoded = this.createEmptyMap(stored.width, stored.height, 'grass');
    for (let y = 0; y < stored.height; y++) {
      for (let x = 0; x < stored.width; x++) {
        decoded.tiles[y][x] = CODE_TILE[stored.tiles[y][x]];
        decoded.blocked[y][x] = stored.blocked[y][x] === '#';
      }
    }
    decoded.objects = (stored.objects ?? [])
      .filter(obj => OBJECT_BY_ID.has(obj.id))
      .map(obj => ({ id: obj.id, x: obj.x, y: obj.y }));
    return decoded;
  }

  private isStoredMap(value: unknown): value is StoredEditorMap {
    if (!value || typeof value !== 'object') return false;
    const record = value as Record<string, unknown>;
    if (!Number.isInteger(record.width) || !Number.isInteger(record.height)) return false;
    if (!Array.isArray(record.tiles) || !Array.isArray(record.blocked)) return false;

    const width = record.width as number;
    const height = record.height as number;
    if (width < MIN_W || width > MAX_W || height < MIN_H || height > MAX_H) return false;
    if (record.tiles.length !== height || record.blocked.length !== height) return false;

    const validTiles = record.tiles.every(row =>
      typeof row === 'string' &&
      row.length === width &&
      [...row].every(code => CODE_TILE[code] !== undefined),
    );
    const validBlocked = record.blocked.every(row =>
      typeof row === 'string' &&
      row.length === width &&
      [...row].every(code => code === '#' || code === '.'),
    );
    if (!validTiles || !validBlocked) return false;

    if (record.objects === undefined) return true;
    if (!Array.isArray(record.objects)) return false;
    return record.objects.every(obj => {
      if (!obj || typeof obj !== 'object') return false;
      const candidate = obj as Record<string, unknown>;
      if (typeof candidate.id !== 'string' || !OBJECT_BY_ID.has(candidate.id as EditorObjectId)) return false;
      if (!Number.isInteger(candidate.x) || !Number.isInteger(candidate.y)) return false;
      const def = OBJECT_BY_ID.get(candidate.id as EditorObjectId);
      return def !== undefined && this.footprintInBounds(
        candidate.x as number,
        candidate.y as number,
        def.footprint,
        width,
        height,
      );
    });
  }

  private createDefaultMap(width: number, height: number): EditorMap {
    const map = this.createEmptyMap(width, height, 'grass');
    const midY = Math.floor(height / 2);
    const midX = Math.floor(width / 2);
    for (let x = 0; x < width; x++) map.tiles[midY][x] = 'path';
    for (let y = 0; y < height; y++) map.tiles[y][midX] = 'path';
    for (let x = 0; x < width; x++) {
      map.tiles[0][x] = 'sand';
      map.tiles[height - 1][x] = 'sand';
    }
    for (let y = 0; y < height; y++) {
      map.tiles[y][0] = 'sand';
      map.tiles[y][width - 1] = 'sand';
    }
    map.objects.push({ id: 'house', x: 3, y: 3 });
    map.objects.push({ id: 'cypress', x: width - 4, y: 3 });
    map.objects.push({ id: 'traveller', x: midX + 2, y: midY });
    return map;
  }

  private createEmptyMap(width: number, height: number, fill: TileKind): EditorMap {
    const tiles: TileKind[][] = [];
    const blocked: boolean[][] = [];
    for (let y = 0; y < height; y++) {
      tiles.push(Array.from({ length: width }, () => fill));
      blocked.push(Array.from({ length: width }, () => false));
    }
    return { width, height, tiles, blocked, objects: [] };
  }

  private gridFromPointer(pointer: Phaser.Input.Pointer): { x: number; y: number } | undefined {
    const a = (pointer.x - this.originX) / (TILE_W / 2);
    const b = (pointer.y - this.originY) / (TILE_H / 2);
    const x = Math.round((a + b) / 2);
    const y = Math.round((b - a) / 2);
    return this.inBounds(x, y) ? { x, y } : undefined;
  }

  private gridToScreen(gx: number, gy: number): { sx: number; sy: number } {
    return {
      sx: this.originX + (gx - gy) * (TILE_W / 2),
      sy: this.originY + (gx + gy) * (TILE_H / 2),
    };
  }

  private tileDiamond(sx: number, sy: number): Phaser.Types.Math.Vector2Like[] {
    return [
      { x: sx, y: sy - TILE_H / 2 },
      { x: sx + TILE_W / 2, y: sy },
      { x: sx, y: sy + TILE_H / 2 },
      { x: sx - TILE_W / 2, y: sy },
    ];
  }

  private drawFootprintOutline(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    footprint: ObjectFootprint = { w: 1, h: 1 },
  ): void {
    for (let dy = 0; dy < footprint.h; dy++) {
      for (let dx = 0; dx < footprint.w; dx++) {
        if (!this.inBounds(x + dx, y + dy)) continue;
        const pos = this.gridToScreen(x + dx, y + dy);
        g.strokePoints(this.tileDiamond(pos.sx, pos.sy), true);
      }
    }
  }

  private objectFrontCell(obj: EditorPlacedObject): { x: number; y: number } {
    const def = OBJECT_BY_ID.get(obj.id);
    const footprint = def?.footprint ?? { w: 1, h: 1 };
    return {
      x: obj.x + footprint.w - 1,
      y: obj.y + footprint.h - 1,
    };
  }

  private objectTouchesCell(obj: EditorPlacedObject, x: number, y: number): boolean {
    const def = OBJECT_BY_ID.get(obj.id);
    const footprint = def?.footprint ?? { w: 1, h: 1 };
    return x >= obj.x && y >= obj.y && x < obj.x + footprint.w && y < obj.y + footprint.h;
  }

  private footprintCells(x: number, y: number, footprint: ObjectFootprint = { w: 1, h: 1 }): Array<{ x: number; y: number }> {
    const cells: Array<{ x: number; y: number }> = [];
    for (let dy = 0; dy < footprint.h; dy++) {
      for (let dx = 0; dx < footprint.w; dx++) {
        cells.push({ x: x + dx, y: y + dy });
      }
    }
    return cells;
  }

  private footprintInBounds(
    x: number,
    y: number,
    footprint: ObjectFootprint = { w: 1, h: 1 },
    width = this.editorMap?.width,
    height = this.editorMap?.height,
  ): boolean {
    return width !== undefined &&
      height !== undefined &&
      x >= 0 &&
      y >= 0 &&
      x + footprint.w <= width &&
      y + footprint.h <= height;
  }

  private inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.editorMap.width && y < this.editorMap.height;
  }

  private isUIPointer(pointer: Phaser.Input.Pointer): boolean {
    return pointer.x >= this.scale.width - PANEL_W || pointer.y < 92;
  }

  private activeObjectDefinition(): EditorObjectDefinition | undefined {
    if (!this.isObjectTool(this.activeTool)) return undefined;
    return OBJECT_BY_ID.get(this.activeTool.slice('object:'.length) as EditorObjectId);
  }

  private isObjectTool(tool: EditorTool): tool is ObjectTool {
    return tool.startsWith('object:');
  }

  private objectTool(id: EditorObjectId): ObjectTool {
    return `object:${id}`;
  }

  private updateStatus(message?: string): void {
    const objectDef = this.activeObjectDefinition();
    const toolLabel = objectDef
      ? objectDef.label
      : this.activeTool === 'block'
        ? 'Block'
        : this.activeTool === 'open'
          ? 'Open'
          : this.activeTool === 'erase-object'
            ? 'Erase Object'
            : this.activeTool[0].toUpperCase() + this.activeTool.slice(1);
    const blockedCount = this.editorMap.blocked.flat().filter(Boolean).length;
    const isoCount = this.editorMap.objects.filter(obj => OBJECT_BY_ID.get(obj.id)?.isometric).length;
    const base = `${this.editorMap.width}x${this.editorMap.height} | Tool: ${toolLabel} | Blocked: ${blockedCount} | Objects: ${this.editorMap.objects.length} | Iso structures: ${isoCount}`;
    this.statusText?.setText(message ? `${message}\n${base}` : `${base}\nIso lock: structures require diamond footprints and generated isometric sprites.`);
  }

  private goBack(): void {
    this.scene.start(this.returnScene);
  }

  private ensureEditorObjectTextures(): void {
    this.makeIsoHouseTexture();
    this.makeIsoStallTexture();
    this.makeIsoBridgeTexture();
    this.makeCypressTexture();
    this.makeCratesTexture();
    this.makeLampTexture();
    this.makeRugTexture();
    this.makeWellTexture();

    makeCharacterTexture(this, 'editor-char-traveller', {
      body: 0x4a3a2a,
      skin: 0xd9c79a,
      clothing: { style: 'sash', secondary: 0x6b8a9a, accent: 0xd8c7a0 },
      hat: { style: 'headscarf', color: 0x8a7450 },
      shadow: true,
    });
    makeCharacterTexture(this, 'editor-char-merchant', {
      body: 0x8a5a2a,
      skin: 0xe6c89a,
      clothing: { style: 'vest', secondary: 0x3f5f73, accent: 0xc9a55c },
      hat: { style: 'cap', color: 0xb88742 },
      shadow: true,
    });
    makeCharacterTexture(this, 'editor-char-guard', {
      body: 0x39404a,
      skin: 0xc8b48d,
      clothing: { style: 'uniform', secondary: 0x6f2222, accent: 0xc9a55c },
      hat: { style: 'tallHat', color: 0x242932 },
      shadow: true,
    });
    makeCharacterTexture(this, 'editor-char-pilgrim', {
      body: 0x6b5a44,
      skin: 0xe2c997,
      clothing: { style: 'wrap', secondary: 0xf2ead6, accent: 0x9c8458 },
      hat: { style: 'veil', color: 0xf2ead6 },
      shadow: true,
    });
  }

  private makeIsoHouseTexture(): void {
    if (this.textures.exists('editor-iso-house')) return;
    const geo = this.isoPrism(2, 2, 42, 12);
    const g = this.add.graphics();
    this.drawIsoPrism(g, geo, { right: 0x8a5d38, left: 0x9d7045, top: 0xc98f52 });
    g.fillStyle(0x5b3320, 1);
    g.fillPoints(this.wallInset(geo.left, geo.bottom, 0.48, 0.68, 18), true);
    g.fillStyle(0xf3d98a, 1);
    g.fillPoints(this.wallInset(geo.right, geo.bottom, 0.28, 0.42, 10), true);
    g.generateTexture('editor-iso-house', geo.texW, geo.texH);
    g.destroy();
  }

  private makeIsoStallTexture(): void {
    if (this.textures.exists('editor-iso-stall')) return;
    const geo = this.isoPrism(2, 1, 22, 10);
    const g = this.add.graphics();
    this.drawIsoPrism(g, geo, { right: 0x7a5635, left: 0x8f6742, top: 0xb88742 });
    g.lineStyle(4, 0x7a1f1f, 1);
    g.lineBetween(geo.leftR.x + 6, geo.leftR.y + 4, geo.rightR.x - 6, geo.rightR.y + 4);
    g.lineStyle(4, 0xf2ead6, 1);
    g.lineBetween(geo.topR.x + 3, geo.topR.y + 4, geo.bottomR.x - 3, geo.bottomR.y + 4);
    g.generateTexture('editor-iso-stall', geo.texW, geo.texH);
    g.destroy();
  }

  private makeIsoBridgeTexture(): void {
    if (this.textures.exists('editor-iso-bridge')) return;
    const geo = this.isoPrism(3, 1, 12, 6);
    const g = this.add.graphics();
    this.drawIsoPrism(g, geo, { right: 0x6b5136, left: 0x7b6142, top: 0xa98a62 });
    g.lineStyle(3, 0x3f2b1a, 1);
    g.lineBetween(geo.leftR.x + 8, geo.leftR.y - 8, geo.bottomR.x - 6, geo.bottomR.y - 8);
    g.lineBetween(geo.topR.x + 6, geo.topR.y - 8, geo.rightR.x - 8, geo.rightR.y - 8);
    g.generateTexture('editor-iso-bridge', geo.texW, geo.texH);
    g.destroy();
  }

  private makeCypressTexture(): void {
    if (this.textures.exists('editor-cypress')) return;
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.22);
    g.fillEllipse(18, 55, 24, 7);
    g.fillStyle(0x5b3a24, 1);
    g.fillRect(15, 34, 6, 20);
    g.fillStyle(0x234c2f, 1);
    g.fillTriangle(18, 2, 5, 42, 31, 42);
    g.fillStyle(0x2f6f45, 1);
    g.fillTriangle(18, 12, 7, 51, 29, 51);
    g.lineStyle(1, 0x102416, 0.75);
    g.strokeTriangle(18, 2, 5, 42, 31, 42);
    g.generateTexture('editor-cypress', 36, 58);
    g.destroy();
  }

  private makeCratesTexture(): void {
    if (this.textures.exists('editor-crates')) return;
    const g = this.add.graphics();
    const drawCrate = (x: number, y: number) => {
      g.fillStyle(0x8a5a2a, 1);
      g.fillPoints([{ x, y: y + 8 }, { x: x + 12, y }, { x: x + 24, y: y + 8 }, { x: x + 12, y: y + 16 }], true);
      g.fillStyle(0x6f4424, 1);
      g.fillPoints([{ x, y: y + 8 }, { x: x + 12, y: y + 16 }, { x: x + 12, y: y + 30 }, { x, y: y + 22 }], true);
      g.fillStyle(0x7b4d29, 1);
      g.fillPoints([{ x: x + 24, y: y + 8 }, { x: x + 12, y: y + 16 }, { x: x + 12, y: y + 30 }, { x: x + 24, y: y + 22 }], true);
      g.lineStyle(1, 0x2d1b10, 0.7);
      g.strokePoints([{ x, y: y + 8 }, { x: x + 12, y }, { x: x + 24, y: y + 8 }, { x: x + 24, y: y + 22 }, { x: x + 12, y: y + 30 }, { x, y: y + 22 }], true);
    };
    drawCrate(4, 12);
    drawCrate(18, 18);
    drawCrate(11, 0);
    g.generateTexture('editor-crates', 46, 48);
    g.destroy();
  }

  private makeLampTexture(): void {
    if (this.textures.exists('editor-lamp')) return;
    const g = this.add.graphics();
    g.lineStyle(3, 0x3a2a16, 1);
    g.lineBetween(16, 12, 16, 45);
    g.lineBetween(10, 45, 22, 45);
    g.fillStyle(0xf3c45b, 1);
    g.fillEllipse(16, 12, 14, 18);
    g.lineStyle(1, 0x6f4a1f, 1);
    g.strokeEllipse(16, 12, 14, 18);
    g.generateTexture('editor-lamp', 32, 48);
    g.destroy();
  }

  private makeRugTexture(): void {
    if (this.textures.exists('editor-rug')) return;
    const g = this.add.graphics();
    const points = [{ x: 24, y: 0 }, { x: 48, y: 12 }, { x: 24, y: 24 }, { x: 0, y: 12 }];
    g.fillStyle(0x7a1f1f, 1);
    g.fillPoints(points, true);
    g.lineStyle(2, 0xd8c07a, 1);
    g.strokePoints(points, true);
    g.lineStyle(1, 0xf2d18a, 1);
    g.lineBetween(12, 12, 24, 6);
    g.lineBetween(24, 6, 36, 12);
    g.lineBetween(12, 12, 24, 18);
    g.lineBetween(24, 18, 36, 12);
    g.generateTexture('editor-rug', 48, 26);
    g.destroy();
  }

  private makeWellTexture(): void {
    if (this.textures.exists('editor-well')) return;
    const g = this.add.graphics();
    g.fillStyle(0x7f7664, 1);
    g.fillEllipse(24, 28, 38, 18);
    g.fillStyle(0x2c4a6b, 1);
    g.fillEllipse(24, 25, 25, 10);
    g.lineStyle(3, 0x4a4033, 1);
    g.strokeEllipse(24, 28, 38, 18);
    g.lineStyle(2, 0x5b3a24, 1);
    g.lineBetween(10, 24, 10, 8);
    g.lineBetween(38, 24, 38, 8);
    g.lineBetween(10, 8, 38, 8);
    g.generateTexture('editor-well', 48, 42);
    g.destroy();
  }

  private isoPrism(widthCells: number, heightCells: number, wallH: number, topPad = 0): EditorIsoPrism {
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

  private wallInset(start: IsoPoint, end: IsoPoint, from: number, to: number, height: number): IsoPoint[] {
    const along = (t: number) => ({
      x: start.x + (end.x - start.x) * t,
      y: start.y + (end.y - start.y) * t,
    });
    const a = along(from);
    const b = along(to);

    return [a, b, { x: b.x, y: b.y - height }, { x: a.x, y: a.y - height }];
  }

  private drawIsoPrism(
    g: Phaser.GameObjects.Graphics,
    geo: EditorIsoPrism,
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

  private validateObjectCatalog(): void {
    const invalid = EDITOR_OBJECTS.find(def => def.kind === 'structure' && (!def.isometric || !def.footprint));
    if (invalid) {
      throw new Error(`Map editor structure "${invalid.id}" must be isometric and declare a footprint.`);
    }
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
