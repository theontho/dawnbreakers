import Phaser from 'phaser';
import {
  CODE_TILE,
  ensureMapAssetTextures,
  ensureTileTextures,
  MAP_ASSET_CATEGORIES,
  type MapAssetCategory,
  MAP_OBJECT_BY_ID,
  MAP_OBJECTS,
  TILE_CODE,
  TILE_OPTIONS,
  type MapObjectDefinition,
  type MapObjectFootprint,
  type MapObjectId,
  type MapObjectKind,
} from '../assets/mapAssetLibrary';
import { TILE_H, TILE_W, type TileKind } from './baseMapTypes';
import { localizedStyle, rtl, t, textOriginX } from '../i18n';
import { addLanguageDropdown } from '../ui/languageDropdown';
import { buttonFont, clamp, isNarrowLayout, isPortraitLayout, MIN_TOUCH_TARGET, responsiveFont, safeLayout } from '../ui/responsive';

type EditorObjectKind = MapObjectKind;
type EditorObjectId = MapObjectId;
type ObjectTool = `object:${EditorObjectId}`;
type EditorTool = TileKind | 'block' | 'open' | 'erase-object' | ObjectTool;
type ObjectFootprint = MapObjectFootprint;
type EditorObjectDefinition = MapObjectDefinition;

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

interface EditorLayout {
  mode: 'side' | 'bottom';
  panelX: number;
  panelY: number;
  panelW: number;
  panelH: number;
  mapX: number;
  mapY: number;
  mapW: number;
  mapH: number;
}

interface AssetPickerGeometry {
  overlayX: number;
  overlayY: number;
  overlayW: number;
  overlayH: number;
  gridX: number;
  gridY: number;
  gridW: number;
  contentH: number;
  previewX: number;
  previewY: number;
  previewW: number;
  previewH: number;
  gridCellW: number;
  gridCellH: number;
  gridGap: number;
  gridColumns: number;
}

interface EditorSceneData {
  from?: string;
}

type AssetPickerRow =
  | { kind: 'header'; category: MapAssetCategory; count: number }
  | { kind: 'assets'; category: MapAssetCategory; assets: EditorObjectDefinition[] };
type SpecialToolIcon = 'block' | 'open' | 'erase';

const STORAGE_KEY = 'dawnbreakers.mapEditor.v1';
const PANEL_W = 300;
const EDITOR_TOP_BAR_H = 72;
const MIN_W = 6;
const MAX_W = 30;
const MIN_H = 6;
const MAX_H = 20;
const ASSET_PICKER_WHEEL_SCALE = 0.65;
const ASSET_PICKER_MAX_WHEEL_DELTA = 90;
const PALETTE_BUTTON_GAP = 6;
const EDITOR_OBJECTS = MAP_OBJECTS;
const OBJECT_BY_ID = MAP_OBJECT_BY_ID;

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
  private assetPickerOpen = false;
  private assetPickerScrollY = 0;
  private assetPickerPreviewId?: EditorObjectId;
  private assetPreviewContainer?: Phaser.GameObjects.Container;
  private suppressMapPaintUntilPointerUp = false;
  private isPanning = false;
  private panPointerId?: number;
  private lastPanX = 0;
  private lastPanY = 0;
  private tileTooltip?: Phaser.GameObjects.Container;

  constructor() {
    super('MapEditor');
  }

  init(data: EditorSceneData): void {
    this.returnScene = data.from ?? 'Title';
  }

  create(): void {
    this.validateObjectCatalog();
    this.ensureEditorObjectTextures();
    this.editorMap = this.loadStoredMap() ?? this.createDefaultMap(18, 12);
    this.rebuildLayout(true);
    this.setupInput();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    });
  }

  private handleResize(): void {
    if (!this.scene.isActive(this.scene.key)) return;
    this.stopPanning();
    this.rebuildLayout(true);
  }

  private rebuildLayout(resetOrigin: boolean): void {
    const { width, height } = this.scale;
    const layout = this.editorLayout();
    const safe = safeLayout({ width, height });
    const narrow = isNarrowLayout({ width, height });

    if (resetOrigin) this.resetMapOrigin();
    this.children.removeAll(true);
    this.world = undefined;
    this.assetPreviewContainer = undefined;
    this.tileTooltip = undefined;

    this.add.rectangle(0, 0, width, height, 0x0a0806).setOrigin(0);
    const headerX = rtl ? safe.right : safe.x;
    const langButtonW = 88;
    const langButtonX = rtl ? safe.x : safe.right - langButtonW;
    const langButtonY = safe.y;
    addLanguageDropdown(this, {
      x: langButtonX,
      y: langButtonY,
      buttonWidth: langButtonW,
      menuWidth: 132,
      size: { width, height },
      onChange: () => this.rebuildLayout(false),
    });
    const footerY = layout.mode === 'bottom' ? layout.panelY - 26 : safe.bottom - 20;
    this.add.text(headerX, footerY, narrow ? t('Esc: back | S: save | arrows / drag: pan | R: recenter') : t('Esc: back  |  S: save  |  C: copy JSON  |  Right/middle drag or arrows: pan  |  R: recenter'), localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(13, { width, height }, 10),
      color: '#6f6048',
      wordWrap: { width: Math.max(240, layout.mapW - 48) },
    })).setOrigin(textOriginX(0), 0);

    this.hover = this.add.graphics().setDepth(9000);
    this.buildUI();
    this.renderWorld();
    this.updateStatus();
  }

  private setupInput(): void {
    this.input.mouse?.disableContextMenu();

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.suppressMapPaintUntilPointerUp) return;
      if (this.isUIPointer(pointer)) return;
      if (this.isPanPointer(pointer)) {
        this.startPanning(pointer);
        return;
      }
      this.lastPainted = '';
      this.paintAtPointer(pointer);
    });
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isPanning && pointer.id === this.panPointerId) {
        this.panMap(pointer.x - this.lastPanX, pointer.y - this.lastPanY);
        this.lastPanX = pointer.x;
        this.lastPanY = pointer.y;
        return;
      }
      this.updateHover(pointer);
      if (pointer.leftButtonDown() && !this.suppressMapPaintUntilPointerUp) this.paintAtPointer(pointer);
    });
    this.input.on('pointerup', () => {
      this.lastPainted = '';
      this.suppressMapPaintUntilPointerUp = false;
      this.stopPanning();
    });
    this.input.on('pointerupoutside', () => {
      this.lastPainted = '';
      this.suppressMapPaintUntilPointerUp = false;
      this.stopPanning();
    });
    this.input.on('wheel', (pointer: Phaser.Input.Pointer, _gameObjects: unknown, deltaX: number, deltaY: number) => {
      if (this.assetPickerOpen) {
        this.handleAssetPickerWheel(deltaY);
        return;
      }
      if (this.isUIPointer(pointer)) {
        return;
      }
      this.panMap(
        Phaser.Math.Clamp(-deltaX, -100, 100),
        Phaser.Math.Clamp(-deltaY, -100, 100),
      );
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.assetPickerOpen) this.closeAssetPicker();
      else this.goBack();
    });
    this.input.keyboard?.on('keydown-S', () => this.saveMap());
    this.input.keyboard?.on('keydown-C', () => void this.copyExport());
    this.input.keyboard?.on('keydown-B', () => this.selectTool('block'));
    this.input.keyboard?.on('keydown-O', () => this.selectTool('open'));
    this.input.keyboard?.on('keydown-E', () => this.selectTool('erase-object'));
    this.input.keyboard?.on('keydown-LEFT', () => this.panMap(-48, 0));
    this.input.keyboard?.on('keydown-RIGHT', () => this.panMap(48, 0));
    this.input.keyboard?.on('keydown-UP', () => this.panMap(0, -32));
    this.input.keyboard?.on('keydown-DOWN', () => this.panMap(0, 32));
    this.input.keyboard?.on('keydown-R', () => this.recenterMap());
  }

  private editorLayout(): EditorLayout {
    const { width, height } = this.scale;
    const size = { width, height };
    const safe = safeLayout(size);
    const useBottomPanel = isPortraitLayout(size) || width < 860;
    if (!useBottomPanel) {
      const panelX = rtl ? safe.right - PANEL_W : safe.x;
      const mapX = rtl ? 0 : panelX + PANEL_W;
      const mapY = safe.y + EDITOR_TOP_BAR_H;
      return {
        mode: 'side',
        panelX,
        panelY: safe.y,
        panelW: PANEL_W,
        panelH: safe.height,
        mapX,
        mapY,
        mapW: rtl ? panelX : width - mapX,
        mapH: Math.max(1, height - mapY),
      };
    }

    const maxPanelH = Math.max(220, Math.min(390, safe.height - 130));
    const panelH = Math.round(clamp(safe.height * 0.5, Math.min(300, maxPanelH), maxPanelH));
    const panelY = safe.bottom - panelH;
    const mapY = safe.y + EDITOR_TOP_BAR_H;
    return {
      mode: 'bottom',
      panelX: safe.x,
      panelY,
      panelW: safe.width,
      panelH,
      mapX: 0,
      mapY,
      mapW: width,
      mapH: Math.max(1, panelY - mapY),
    };
  }

  private panelTextX(layout: EditorLayout, inset = 18): number {
    return rtl ? layout.panelX + layout.panelW - inset : layout.panelX + inset;
  }

  private panelControlX(layout: EditorLayout, controlW: number, inset = 18): number {
    return rtl ? layout.panelX + layout.panelW - inset - controlW : layout.panelX + inset;
  }

  private panelGridButtonX(layout: EditorLayout, index: number, columns: number, step: number, itemW = MIN_TOUCH_TARGET): number {
    const column = index % columns;
    return rtl ? this.panelControlX(layout, itemW) - column * step : this.panelControlX(layout, itemW) + column * step;
  }

  private panelRowButtonX(layout: EditorLayout, index: number, buttonW: number, gap: number): number {
    return rtl ? this.panelControlX(layout, buttonW) - index * (buttonW + gap) : this.panelControlX(layout, buttonW) + index * (buttonW + gap);
  }

  private resetMapOrigin(): void {
    const layout = this.editorLayout();
    this.originX = layout.mapX + layout.mapW / 2;
    this.originY = layout.mapY + 26;
  }

  private buildUI(): void {
    const { width, height } = this.scale;
    const layout = this.editorLayout();
    const compact = layout.mode === 'bottom';
    const textX = this.panelTextX(layout);
    const textOrigin = rtl ? 1 : 0;
    const size = { width, height };
    this.hideTileTooltip();
    this.assetPreviewContainer?.destroy(true);
    this.assetPreviewContainer = undefined;
    this.ui?.destroy(true);
    this.ui = this.add.container(0, 0).setDepth(10000);
    this.toolButtons = [];

    this.ui.add(this.add.rectangle(layout.panelX, layout.panelY, layout.panelW, layout.panelH, 0x120d08, 0.96).setOrigin(0));
    this.ui.add(this.add.text(textX, layout.panelY + 14, t('Palette'), localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(24, size, 17),
      color: '#f3e2b5',
    })).setOrigin(textOrigin, 0));

    let y = layout.panelY + (compact ? 46 : 52);
    this.ui.add(this.add.text(textX, y, t('Tiles'), localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(14, size),
      color: '#c9b07a',
    })).setOrigin(textOrigin, 0));
    y += 22;
    const paletteW = layout.panelW - 36;
    const paletteStep = MIN_TOUCH_TARGET + PALETTE_BUTTON_GAP;
    const tileColumns = Math.max(1, Math.floor((paletteW + PALETTE_BUTTON_GAP) / paletteStep));
    for (let i = 0; i < TILE_OPTIONS.length; i++) {
      const option = TILE_OPTIONS[i];
      this.makeTileSwatchButton(
        this.panelGridButtonX(layout, i, tileColumns, paletteStep),
        y + Math.floor(i / tileColumns) * paletteStep,
        option.kind,
        t(option.label),
        option.color,
      );
    }
    const tileRows = Math.ceil(TILE_OPTIONS.length / tileColumns);
    const specialTools: Array<{ tool: EditorTool; label: string; color: number; icon: SpecialToolIcon }> = [
      { tool: 'block', label: t('Block'), color: 0x7a1f1f, icon: 'block' },
      { tool: 'open', label: t('Open'), color: 0x3f6f45, icon: 'open' },
      { tool: 'erase-object', label: t('Erase Object'), color: 0x4a1f1f, icon: 'erase' },
    ];
    const specialColumns = Math.max(1, Math.min(specialTools.length, Math.floor((paletteW + PALETTE_BUTTON_GAP) / paletteStep)));
    const specialY = y + tileRows * paletteStep;
    for (let i = 0; i < specialTools.length; i++) {
      const option = specialTools[i];
      this.makeSpecialToolButton(
        this.panelGridButtonX(layout, i, specialColumns, paletteStep),
        specialY + Math.floor(i / specialColumns) * paletteStep,
        option.tool,
        option.label,
        option.color,
        option.icon,
      );
    }

    y = specialY + Math.ceil(specialTools.length / specialColumns) * paletteStep + (compact ? 10 : 12);
    const assetButtonW = Math.min(254, layout.panelW - 36);
    this.ui.add(this.add.text(textX, y, t('Objects'), localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(14, size),
      color: '#c9b07a',
    })).setOrigin(textOrigin, 0));
    y += 22;
    this.makeAssetBrowserButton(this.panelControlX(layout, assetButtonW), y, assetButtonW);

    y += compact ? 56 : 64;
    this.ui.add(this.add.text(textX, y, t('Size'), localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(14, size),
      color: '#c9b07a',
    })).setOrigin(textOrigin, 0));
    y += 22;
    const sizeButtonW = compact ? Math.min(62, (layout.panelW - 56) / 4) : 62;
    const sizeGap = compact ? 6 : 8;
    this.makeButton(this.panelRowButtonX(layout, 0, sizeButtonW, sizeGap), y, sizeButtonW, MIN_TOUCH_TARGET, '- W', () => this.resizeMap(this.editorMap.width - 1, this.editorMap.height));
    this.makeButton(this.panelRowButtonX(layout, 1, sizeButtonW, sizeGap), y, sizeButtonW, MIN_TOUCH_TARGET, '+ W', () => this.resizeMap(this.editorMap.width + 1, this.editorMap.height));
    this.makeButton(this.panelRowButtonX(layout, 2, sizeButtonW, sizeGap), y, sizeButtonW, MIN_TOUCH_TARGET, '- H', () => this.resizeMap(this.editorMap.width, this.editorMap.height - 1));
    this.makeButton(this.panelRowButtonX(layout, 3, sizeButtonW, sizeGap), y, sizeButtonW, MIN_TOUCH_TARGET, '+ H', () => this.resizeMap(this.editorMap.width, this.editorMap.height + 1));

    y += compact ? 56 : 62;
    const actionButtonW = compact ? Math.min(62, (layout.panelW - 60) / 5) : 80;
    const actionGap = compact ? 6 : 8;
    this.makeButton(this.panelRowButtonX(layout, 0, actionButtonW, actionGap), y, actionButtonW, MIN_TOUCH_TARGET, t('Save'), () => this.saveMap());
    this.makeButton(this.panelRowButtonX(layout, 1, actionButtonW, actionGap), y, actionButtonW, MIN_TOUCH_TARGET, t('Load'), () => this.loadMapIntoEditor());
    this.makeButton(this.panelRowButtonX(layout, 2, actionButtonW, actionGap), y, actionButtonW, MIN_TOUCH_TARGET, t('Copy'), () => void this.copyExport());
    if (compact) {
      this.makeButton(this.panelRowButtonX(layout, 3, actionButtonW, actionGap), y, actionButtonW, MIN_TOUCH_TARGET, t('Clear'), () => this.resetMap());
      this.makeButton(this.panelRowButtonX(layout, 4, actionButtonW, actionGap), y, actionButtonW, MIN_TOUCH_TARGET, t('Back'), () => this.goBack());
    } else {
      y += 54;
      this.makeButton(this.panelRowButtonX(layout, 0, 124, 8), y, 124, MIN_TOUCH_TARGET, t('Clear'), () => this.resetMap());
      this.makeButton(this.panelRowButtonX(layout, 1, 124, 8), y, 124, MIN_TOUCH_TARGET, t('Back'), () => this.goBack());
    }

    y += compact ? 54 : 58;
    const statusY = compact ? layout.panelY + layout.panelH - 34 : y;
    this.statusText = this.add.text(textX, statusY, '', localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(12, size),
      color: '#c9b07a',
      wordWrap: { width: layout.panelW - 36 },
    })).setOrigin(textOrigin, 0);
    this.ui.add(this.statusText);

    this.exportText = this.add.text(textX, compact ? layout.panelY + layout.panelH - 24 : safeLayout({ width, height }).bottom - 66, '', localizedStyle({
      fontFamily: 'Menlo, Consolas, monospace',
      fontSize: responsiveFont(10, size),
      color: '#8f8068',
      wordWrap: { width: layout.panelW - 36 },
    })).setOrigin(textOrigin, 0);
    this.exportText.setVisible(!compact);
    this.ui.add(this.exportText);
    this.updateToolButtons();
    this.updateStatus();
    if (this.assetPickerOpen) this.makeAssetPickerOverlay();
  }

  private makeTileSwatchButton(
    x: number,
    y: number,
    tool: TileKind,
    label: string,
    color: number,
  ): void {
    const rect = this.add.rectangle(x, y, MIN_TOUCH_TARGET, MIN_TOUCH_TARGET, 0x24170d, 1)
      .setOrigin(0)
      .setStrokeStyle(1, 0x4a3a22, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.showTileTooltip(x, y, label))
      .on('pointerout', () => this.hideTileTooltip())
      .on('pointerdown', () => this.selectTool(tool));
    const swatch = this.add.rectangle(x + 10, y + 10, 24, 24, color, 1)
      .setOrigin(0)
      .setStrokeStyle(1, 0x0a0806, 0.7);

    this.ui.add([rect, swatch]);
    this.toolButtons.push({ tool, rect });
  }

  private showTileTooltip(x: number, y: number, label: string): void {
    this.hideTileTooltip();
    const text = this.add.text(x, y - 28, label, localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(12, this.scale),
      color: '#f3e2b5',
    }));
    const bounds = text.getBounds();
    const bg = this.add.rectangle(bounds.x - 5, bounds.y - 3, bounds.width + 10, bounds.height + 6, 0x0a0806, 0.96)
      .setOrigin(0)
      .setStrokeStyle(1, 0xf3d98a, 0.8);
    this.tileTooltip = this.add.container(0, 0, [bg, text]).setDepth(10020);
    this.ui.add(this.tileTooltip);
  }

  private hideTileTooltip(): void {
    this.tileTooltip?.destroy(true);
    this.tileTooltip = undefined;
  }

  private makeSpecialToolButton(
    x: number,
    y: number,
    tool: EditorTool,
    label: string,
    color: number,
    icon: SpecialToolIcon,
  ): void {
    const rect = this.add.rectangle(x, y, MIN_TOUCH_TARGET, MIN_TOUCH_TARGET, 0x24170d, 1)
      .setOrigin(0)
      .setStrokeStyle(1, 0x4a3a22, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.showTileTooltip(x, y, label))
      .on('pointerout', () => this.hideTileTooltip())
      .on('pointerdown', () => this.selectTool(tool));
    const glyph = this.add.graphics();
    this.drawSpecialToolIcon(glyph, x + 9, y + 9, color, icon);

    this.ui.add([rect, glyph]);
    this.toolButtons.push({ tool, rect });
  }

  private drawSpecialToolIcon(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    color: number,
    icon: SpecialToolIcon,
  ): void {
    const cx = x + 13;
    const cy = y + 13;

    graphics.fillStyle(color, 0.95);
    graphics.lineStyle(1, 0x0a0806, 0.8);
    graphics.beginPath();
    graphics.moveTo(cx, y + 5);
    graphics.lineTo(x + 21, cy);
    graphics.lineTo(cx, y + 21);
    graphics.lineTo(x + 5, cy);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();

    if (icon === 'block') {
      graphics.lineStyle(2, 0xf3e2b5, 1);
      graphics.beginPath();
      graphics.moveTo(x + 9, y + 9);
      graphics.lineTo(x + 17, y + 17);
      graphics.moveTo(x + 17, y + 9);
      graphics.lineTo(x + 9, y + 17);
      graphics.strokePath();
      return;
    }

    if (icon === 'open') {
      graphics.lineStyle(2, 0xf3e2b5, 1);
      graphics.beginPath();
      graphics.moveTo(x + 8, y + 13);
      graphics.lineTo(x + 12, y + 17);
      graphics.lineTo(x + 19, y + 9);
      graphics.strokePath();
      return;
    }

    graphics.fillStyle(0xf3e2b5, 1);
    graphics.lineStyle(1, 0x0a0806, 0.8);
    graphics.beginPath();
    graphics.moveTo(x + 8, y + 16);
    graphics.lineTo(x + 15, y + 9);
    graphics.lineTo(x + 19, y + 13);
    graphics.lineTo(x + 12, y + 20);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
    graphics.fillStyle(0xc98282, 1);
    graphics.fillRect(x + 14, y + 10, 4, 4);
  }

  private makeButton(x: number, y: number, w: number, h: number, label: string, onClick: () => void): void {
    const buttonW = Math.max(MIN_TOUCH_TARGET, Math.round(w));
    const buttonH = Math.max(MIN_TOUCH_TARGET, Math.round(h));
    const rect = this.add.rectangle(x, y, buttonW, buttonH, 0x1a120a, 1)
      .setOrigin(0)
      .setStrokeStyle(1, 0x5a4428, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => rect.setStrokeStyle(1, 0xf3d98a, 1))
      .on('pointerout', () => rect.setStrokeStyle(1, 0x5a4428, 1))
      .on('pointerdown', onClick);
    const text = this.add.text(x + buttonW / 2, y + buttonH / 2, label, localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: buttonFont(13, this.scale),
      color: '#f3d98a',
    }, 'center')).setOrigin(0.5);
    this.ui.add([rect, text]);
  }

  private makeAssetBrowserButton(x: number, y: number, width: number): void {
    const activeObject = this.objectDefinitionForTool(this.activeTool);
    const rect = this.add.rectangle(x, y, width, MIN_TOUCH_TARGET, this.assetPickerOpen || activeObject ? 0x3a2814 : 0x24170d, 1)
      .setOrigin(0)
      .setStrokeStyle(this.assetPickerOpen || activeObject ? 2 : 1, this.assetPickerOpen ? 0xf3d98a : 0x4a3a22, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => rect.setStrokeStyle(2, 0xf3d98a, 1))
      .on('pointerout', () => rect.setStrokeStyle(this.assetPickerOpen || activeObject ? 2 : 1, this.assetPickerOpen ? 0xf3d98a : 0x4a3a22, 1))
      .on('pointerdown', () => this.openAssetPicker());
    const swatch = this.add.rectangle(x + 10, y + 12, 20, 20, activeObject?.color ?? 0x6b5a44, 1).setOrigin(0);
    const label = activeObject
      ? t('Assets: {label}', { label: t(activeObject.label) })
      : t('Assets ({count})', { count: EDITOR_OBJECTS.length });
    const swatchX = rtl ? x + width - 30 : x + 10;
    swatch.setX(swatchX);
    const text = this.add.text(rtl ? x + width - 38 : x + 38, y + 12, label, localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: buttonFont(12, this.scale),
      color: '#e8d9b0',
      wordWrap: { width: width - 64 },
    })).setOrigin(rtl ? 1 : 0, 0);
    const caret = this.add.text(rtl ? x + 18 : x + width - 18, y + MIN_TOUCH_TARGET / 2, rtl ? '<' : '>', localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: buttonFont(13, this.scale),
      color: '#f3d98a',
    }, 'center')).setOrigin(0.5);

    this.ui.add([rect, swatch, text, caret]);
  }

  private assetPickerGeometry(): AssetPickerGeometry {
    const { width, height } = this.scale;
    const safe = safeLayout({ width, height });
    const narrow = isNarrowLayout({ width, height });
    const overlayX = safe.x;
    const overlayY = safe.y;
    const overlayW = safe.width;
    const overlayH = safe.height;
    const gridGap = 10;
    const gridCellH = 126;

    if (narrow) {
      const previewX = overlayX + 18;
      const previewY = overlayY + 82;
      const previewW = overlayW - 36;
      const previewH = 120;
      const gridX = overlayX + 18;
      const gridY = previewY + previewH + 12;
      const gridW = overlayW - 36;
      const contentH = Math.max(120, overlayY + overlayH - gridY - 58);
      const gridColumns = Phaser.Math.Clamp(Math.floor((gridW - 20 + gridGap) / (92 + gridGap)), 2, 4);
      const gridCellW = (gridW - 20 - gridGap * (gridColumns - 1)) / gridColumns;
      return { overlayX, overlayY, overlayW, overlayH, gridX, gridY, gridW, contentH, previewX, previewY, previewW, previewH, gridCellW, gridCellH, gridGap, gridColumns };
    }

    let gridW = Math.min(760, Math.max(420, overlayW * 0.64));
    let previewW = overlayW - gridW - 52;
    if (previewW < 260) {
      gridW = Math.max(300, overlayW - 312);
      previewW = overlayW - gridW - 52;
    }
    const gridX = overlayX + 18;
    const gridY = overlayY + 84;
    const previewX = overlayX + gridW + 28;
    const previewY = overlayY + 84;
    const previewH = overlayH - 116;
    const contentH = overlayH - 126;
    const gridColumns = Phaser.Math.Clamp(Math.floor((gridW - 20 + gridGap) / (112 + gridGap)), 2, 5);
    const gridCellW = (gridW - 20 - gridGap * (gridColumns - 1)) / gridColumns;
    return { overlayX, overlayY, overlayW, overlayH, gridX, gridY, gridW, contentH, previewX, previewY, previewW, previewH, gridCellW, gridCellH, gridGap, gridColumns };
  }

  private makeAssetPickerOverlay(): void {
    const { width, height } = this.scale;
    const picker = this.assetPickerGeometry();
    const pickerRows = this.assetPickerRows(picker.gridColumns);
    this.assetPickerScrollY = this.clampedAssetPickerScrollY(this.assetPickerScrollY, pickerRows, picker.contentH);

    const dimmer = this.add.rectangle(0, 0, width, height, 0x000000, 0.28)
      .setOrigin(0)
      .setInteractive();
    const panel = this.add.rectangle(picker.overlayX, picker.overlayY, picker.overlayW, picker.overlayH, 0x160f08, 0.98)
      .setOrigin(0)
      .setStrokeStyle(2, 0xf3d98a, 0.9)
      .setInteractive();
    const overlayTextX = rtl ? picker.overlayX + picker.overlayW - 18 : picker.overlayX + 18;
    const overlayTextOrigin = rtl ? 1 : 0;
    const title = this.add.text(overlayTextX, picker.overlayY + 16, t('Assets'), localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(21, { width, height }, 16),
      color: '#f3d98a',
    })).setOrigin(overlayTextOrigin, 0);
    const description = this.add.text(overlayTextX, picker.overlayY + 46, t('All placeable assets are grouped by category. Scroll the grid and hover an asset for the detail preview.'), localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(13, { width, height }),
      color: '#bda676',
      wordWrap: { width: picker.overlayW - 124 },
    })).setOrigin(overlayTextOrigin, 0);

    this.ui.add([dimmer, panel, title, description]);
    this.makeButton(rtl ? picker.overlayX + 22 : picker.overlayX + picker.overlayW - 104, picker.overlayY + 12, 82, MIN_TOUCH_TARGET, t('Close'), () => this.closeAssetPicker());

    const gridHeaderH = 52;
    const gridBg = this.add.rectangle(picker.gridX, picker.gridY, picker.gridW, picker.contentH + gridHeaderH, 0x0e0905, 0.88)
      .setOrigin(0)
      .setStrokeStyle(1, 0x4a3a22, 1)
      .setInteractive();
    this.ui.add(gridBg);

    const totalAssets = this.totalCategorizedAssets();
    const rangeText = this.add.text(rtl ? picker.gridX + picker.gridW - 12 : picker.gridX + 12, picker.gridY + 17, t('{assetCount} assets | {categoryCount} categories', {
      assetCount: totalAssets,
      categoryCount: MAP_ASSET_CATEGORIES.length,
    }), localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(11, { width, height }),
      color: '#8f8068',
    })).setOrigin(rtl ? 1 : 0, 0);
    this.ui.add(rangeText);
    const scrollButtonStart = rtl ? picker.gridX + 4 : picker.gridX + picker.gridW - 96;
    this.makeButton(scrollButtonStart, picker.gridY + 4, MIN_TOUCH_TARGET, MIN_TOUCH_TARGET, '^', () => this.scrollAssetPickerPixels(-picker.gridCellH));
    this.makeButton(scrollButtonStart + 48, picker.gridY + 4, MIN_TOUCH_TARGET, MIN_TOUCH_TARGET, 'v', () => this.scrollAssetPickerPixels(picker.gridCellH));

    const maskShape = this.add.graphics();
    maskShape.fillStyle(0xffffff, 1);
    maskShape.fillRect(picker.gridX + 10, picker.gridY + gridHeaderH, picker.gridW - 20, picker.contentH);
    maskShape.setVisible(false);
    const gridContent = this.add.container(0, 0).setMask(maskShape.createGeometryMask());
    this.ui.add([maskShape, gridContent]);

    const visibleAssets = this.drawAssetPickerRows(
      pickerRows,
      this.assetPickerScrollY,
      picker.gridX + 10,
      picker.gridY + gridHeaderH,
      picker.gridW - 20,
      picker.contentH,
      picker.gridCellW,
      picker.gridGap,
      picker.gridCellH,
      picker.previewX,
      picker.previewY,
      picker.previewW,
      picker.previewH,
      gridContent,
    );
    const fallbackPreview = visibleAssets[0] ?? this.firstCategorizedAsset();
    let preview = this.assetPickerPreviewId ? OBJECT_BY_ID.get(this.assetPickerPreviewId) : undefined;
    if (preview) {
      const previewId = preview.id;
      if (!visibleAssets.some(def => def.id === previewId)) preview = fallbackPreview;
    }
    preview ??= fallbackPreview;
    this.assetPickerPreviewId = preview?.id;
    if (preview) this.previewAsset(preview, picker.previewX, picker.previewY, picker.previewW, picker.previewH);
  }

  private selectTool(tool: EditorTool): void {
    this.activeTool = tool;
    if (this.assetPickerOpen) {
      this.closeAssetPicker();
      return;
    }
    this.updateToolButtons();
    this.updateStatus();
  }

  private openAssetPicker(): void {
    this.assetPickerOpen = true;
    const picker = this.assetPickerGeometry();
    const activeObject = this.objectDefinitionForTool(this.activeTool);
    const rows = this.assetPickerRows(picker.gridColumns);
    const activeScrollY = activeObject ? this.assetPickerOffsetForAsset(rows, activeObject.id) : 0;
    this.assetPickerPreviewId = activeObject?.id ?? this.firstCategorizedAsset()?.id;
    this.assetPickerScrollY = this.clampedAssetPickerScrollY(activeScrollY, rows, picker.contentH);
    this.buildUI();
  }

  private closeAssetPicker(): void {
    if (!this.assetPickerOpen) return;
    this.assetPickerOpen = false;
    this.assetPickerScrollY = 0;
    this.assetPickerPreviewId = undefined;
    this.assetPreviewContainer?.destroy(true);
    this.assetPreviewContainer = undefined;
    this.buildUI();
  }

  private selectAssetFromPicker(def: EditorObjectDefinition): void {
    this.suppressMapPaintUntilPointerUp = true;
    this.activeTool = this.objectTool(def.id);
    this.closeAssetPicker();
  }

  private handleAssetPickerWheel(deltaY: number): void {
    if (deltaY === 0) return;
    this.scrollAssetPickerPixels(
      Phaser.Math.Clamp(deltaY * ASSET_PICKER_WHEEL_SCALE, -ASSET_PICKER_MAX_WHEEL_DELTA, ASSET_PICKER_MAX_WHEEL_DELTA),
    );
  }

  private scrollAssetPickerPixels(deltaY: number): void {
    if (!this.assetPickerOpen) return;
    const picker = this.assetPickerGeometry();
    const rows = this.assetPickerRows(picker.gridColumns);
    const next = this.clampedAssetPickerScrollY(this.assetPickerScrollY + deltaY, rows, picker.contentH);
    if (next === this.assetPickerScrollY) return;
    this.assetPickerScrollY = next;
    this.assetPickerPreviewId = this.firstAssetAfterScrollY(rows, next)?.id;
    this.buildUI();
  }

  private clampedAssetPickerScrollY(scrollY: number, rows: AssetPickerRow[], contentH: number): number {
    return Phaser.Math.Clamp(scrollY, 0, Math.max(0, this.totalAssetPickerContentHeight(rows) - contentH));
  }

  private assetPickerRows(gridColumns: number): AssetPickerRow[] {
    const rows: AssetPickerRow[] = [];
    for (const category of MAP_ASSET_CATEGORIES) {
      const assets = this.assetsForCategory(category);
      if (assets.length === 0) continue;
      rows.push({ kind: 'header', category, count: assets.length });
      for (let i = 0; i < assets.length; i += gridColumns) {
        rows.push({ kind: 'assets', category, assets: assets.slice(i, i + gridColumns) });
      }
    }
    return rows;
  }

  private drawAssetPickerRows(
    rows: AssetPickerRow[],
    scrollY: number,
    x: number,
    y: number,
    width: number,
    contentH: number,
    gridCellW: number,
    gridGap: number,
    gridCellH: number,
    previewX: number,
    previewY: number,
    previewW: number,
    previewH: number,
    gridContent: Phaser.GameObjects.Container,
  ): EditorObjectDefinition[] {
    const visibleAssets: EditorObjectDefinition[] = [];
    let rowOffsetY = 0;
    const bottomY = y + contentH;
    for (const row of rows) {
      const rowH = this.assetPickerRowHeight(row);
      const rowTopY = rowOffsetY;
      const rowBottomY = rowOffsetY + rowH;
      rowOffsetY = rowBottomY;
      if (rowBottomY < scrollY) continue;

      const cursorY = y + rowTopY - scrollY;
      if (cursorY > bottomY) break;
      if (row.kind === 'header') {
        const bg = this.add.rectangle(x, cursorY + 2, width, 34, 0x1f160d, 1)
          .setOrigin(0)
          .setStrokeStyle(1, 0x5a4428, 0.8);
        const title = this.add.text(rtl ? x + width - 10 : x + 10, cursorY + 10, t(row.category.label), localizedStyle({
          fontFamily: 'Georgia, serif',
          fontSize: responsiveFont(13, this.scale),
          color: '#f3d98a',
        })).setOrigin(rtl ? 1 : 0, 0);
        const count = this.add.text(rtl ? x + 10 : x + width - 10, cursorY + 10, t('{count} assets', { count: row.count }), localizedStyle({
          fontFamily: 'Georgia, serif',
          fontSize: responsiveFont(11, this.scale),
          color: '#8f8068',
        })).setOrigin(rtl ? 0 : 1, 0);
        gridContent.add([bg, title, count]);
        continue;
      }

      for (let i = 0; i < row.assets.length; i++) {
        const option = row.assets[i];
        const optionX = x + i * (gridCellW + gridGap);
        const selected = this.activeTool === this.objectTool(option.id);
        const isPreview = option.id === this.assetPickerPreviewId;
        const rect = this.add.rectangle(optionX, cursorY, gridCellW, gridCellH - 8, selected || isPreview ? 0x3a2814 : 0x24170d, 1)
          .setOrigin(0)
          .setStrokeStyle(selected || isPreview ? 2 : 1, selected ? 0xf3d98a : 0x4a3a22, 1)
          .setInteractive({ useHandCursor: true })
          .on('pointerover', () => this.previewAsset(option, previewX, previewY, previewW, previewH))
          .on('pointerdown', () => this.selectAssetFromPicker(option));
        const thumbnail = this.add.image(optionX + gridCellW / 2, cursorY + 70, option.texture)
          .setOrigin(0.5, 1);
        thumbnail.setScale(Math.min((gridCellW - 20) / thumbnail.width, 66 / thumbnail.height, 1.4));
        const swatch = this.add.rectangle(rtl ? optionX + gridCellW - 24 : optionX + 8, cursorY + 8, 16, 16, option.color, 1).setOrigin(0);
        const label = this.add.text(optionX + gridCellW / 2, cursorY + 80, t(option.label), localizedStyle({
          fontFamily: 'Georgia, serif',
          fontSize: responsiveFont(11, this.scale),
          color: '#e8d9b0',
          align: 'center',
          wordWrap: { width: gridCellW - 16 },
        }, 'center')).setOrigin(0.5, 0);
        const meta = this.add.text(rtl ? optionX + 8 : optionX + gridCellW - 8, cursorY + 8, this.kindLabel(option.kind), localizedStyle({
          fontFamily: 'Georgia, serif',
          fontSize: responsiveFont(10, this.scale),
          color: '#8f8068',
        })).setOrigin(rtl ? 0 : 1, 0);
        gridContent.add([rect, thumbnail, swatch, label, meta]);
        visibleAssets.push(option);
      }
    }
    return visibleAssets;
  }

  private assetPickerRowHeight(row: AssetPickerRow): number {
    return row.kind === 'header' ? 42 : 126;
  }

  private totalAssetPickerContentHeight(rows: AssetPickerRow[]): number {
    return rows.reduce((sum, row) => sum + this.assetPickerRowHeight(row), 0);
  }

  private assetPickerOffsetForAsset(rows: AssetPickerRow[], id: EditorObjectId): number {
    let offsetY = 0;
    for (const row of rows) {
      if (row.kind === 'assets' && row.assets.some(asset => asset.id === id)) return offsetY;
      offsetY += this.assetPickerRowHeight(row);
    }
    return 0;
  }

  private firstAssetAfterScrollY(rows: AssetPickerRow[], scrollY: number): EditorObjectDefinition | undefined {
    let offsetY = 0;
    for (const row of rows) {
      offsetY += this.assetPickerRowHeight(row);
      if (offsetY < scrollY || row.kind !== 'assets') continue;
      return row.assets[0];
    }
    return undefined;
  }

  private firstCategorizedAsset(): EditorObjectDefinition | undefined {
    for (const category of MAP_ASSET_CATEGORIES) {
      const asset = this.assetsForCategory(category)[0];
      if (asset) return asset;
    }
    return undefined;
  }

  private totalCategorizedAssets(): number {
    return MAP_ASSET_CATEGORIES.reduce((sum, category) => sum + this.assetsForCategory(category).length, 0);
  }

  private assetsForCategory(category: MapAssetCategory): EditorObjectDefinition[] {
    return category.objectIds
      .map(id => OBJECT_BY_ID.get(id))
      .filter((def): def is EditorObjectDefinition => def !== undefined);
  }

  private previewAsset(def: EditorObjectDefinition, x: number, y: number, w: number, h: number): void {
    if (w < 120 || h < 90) return;
    this.assetPickerPreviewId = def.id;
    this.assetPreviewContainer?.destroy(true);
    const previewPanel = this.add.rectangle(x, y, w, h, 0x0e0905, 0.88)
      .setOrigin(0)
      .setStrokeStyle(1, 0x4a3a22, 1);
    const textX = rtl ? x + w - 18 : x + 18;
    const textOrigin = rtl ? 1 : 0;
    const title = this.add.text(textX, y + 16, t(def.label), localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(20, this.scale),
      color: '#f3d98a',
    })).setOrigin(textOrigin, 0);
    const details = [
      this.kindLabel(def.kind),
      def.footprint ? t('{w}x{h} footprint', { w: def.footprint.w, h: def.footprint.h }) : t('single tile'),
      def.isometric ? t('isometric safe') : undefined,
    ].filter(Boolean).join(' | ');
    const meta = this.add.text(textX, y + 46, details, localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(12, this.scale),
      color: '#8f8068',
    })).setOrigin(textOrigin, 0);

    const floor = this.add.graphics();
    floor.fillStyle(0x3a2814, 0.55);
    floor.lineStyle(1, 0xf3d98a, 0.3);
    const cx = x + w / 2;
    const groundY = y + h - (h < 160 ? 26 : 76);
    floor.beginPath();
    floor.moveTo(cx, groundY - TILE_H / 2);
    floor.lineTo(cx + TILE_W, groundY);
    floor.lineTo(cx, groundY + TILE_H / 2);
    floor.lineTo(cx - TILE_W, groundY);
    floor.closePath();
    floor.fillPath();
    floor.strokePath();

    const image = this.add.image(cx, groundY, def.texture).setOrigin(0.5, 1);
    const maxSpriteW = Math.max(80, w - 120);
    const maxSpriteH = Math.max(48, h - 92);
    const scale = Math.min(maxSpriteW / image.width, maxSpriteH / image.height, 3);
    image.setScale(scale);

    const help = h >= 160 ? this.add.text(textX, y + h - 42, t('Click an asset tile to select it, then click the map to place it.'), localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(12, this.scale),
      color: '#bda676',
      wordWrap: { width: w - 36 },
    })).setOrigin(textOrigin, 0) : undefined;
    this.assetPreviewContainer = this.add.container(0, 0, [previewPanel, floor, image, title, meta, ...(help ? [help] : [])]).setDepth(10010);
    this.ui.add(this.assetPreviewContainer);
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
      this.updateStatus(t('Unknown object: {id}', { id }));
      return false;
    }
    if ((def.kind === 'structure' || def.isometric) && (!def.isometric || !def.footprint)) {
      this.updateStatus(t('Asset rejected: iso-locked assets must use an isometric footprint.'));
      return false;
    }
    if (!this.footprintInBounds(x, y, def.footprint)) {
      this.updateStatus(t('{label} does not fit on the map.', { label: t(def.label) }));
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
    this.updateStatus(t('Resized map.'));
  }

  private resetMap(): void {
    this.editorMap = this.createDefaultMap(18, 12);
    this.renderWorld();
    this.updateStatus(t('Cleared to default map.'));
  }

  private saveMap(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.encodeMap()));
      this.updateStatus(t('Saved in this browser.'));
    } catch (error) {
      this.updateStatus(t('Save failed: {message}', { message: this.errorMessage(error) }));
    }
  }

  private loadMapIntoEditor(): void {
    const loaded = this.loadStoredMap();
    if (!loaded) {
      this.updateStatus(t('No saved editor map found.'));
      return;
    }
    this.editorMap = loaded;
    this.renderWorld();
    this.updateStatus(t('Loaded saved editor map.'));
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
      this.updateStatus(t('Clipboard unavailable. JSON preview shown below.'));
      return;
    }

    try {
      await navigator.clipboard.writeText(json);
      this.updateStatus(t('Copied JSON to clipboard.'));
    } catch (error) {
      this.updateStatus(t('Copy failed: {message}', { message: this.errorMessage(error) }));
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

  private startPanning(pointer: Phaser.Input.Pointer): void {
    this.isPanning = true;
    this.panPointerId = pointer.id;
    this.lastPanX = pointer.x;
    this.lastPanY = pointer.y;
    this.hover.clear();
  }

  private stopPanning(): void {
    this.isPanning = false;
    this.panPointerId = undefined;
  }

  private panMap(dx: number, dy: number): void {
    if (dx === 0 && dy === 0) return;
    this.originX += dx;
    this.originY += dy;
    this.hover.clear();
    this.renderWorld();
  }

  private recenterMap(): void {
    this.resetMapOrigin();
    this.hover.clear();
    this.renderWorld();
    this.updateStatus(t('Recentered map.'));
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
    if (this.assetPickerOpen) return true;
    const layout = this.editorLayout();
    return pointer.y < layout.mapY ||
      pointer.x < layout.mapX ||
      pointer.x >= layout.mapX + layout.mapW ||
      pointer.y >= layout.mapY + layout.mapH;
  }

  private isPanPointer(pointer: Phaser.Input.Pointer): boolean {
    return pointer.rightButtonDown() ||
      pointer.middleButtonDown() ||
      (pointer.event instanceof MouseEvent && pointer.event.shiftKey);
  }

  private activeObjectDefinition(): EditorObjectDefinition | undefined {
    return this.objectDefinitionForTool(this.activeTool);
  }

  private objectDefinitionForTool(tool: EditorTool): EditorObjectDefinition | undefined {
    if (!this.isObjectTool(tool)) return undefined;
    return OBJECT_BY_ID.get(tool.slice('object:'.length) as EditorObjectId);
  }

  private isObjectTool(tool: EditorTool): tool is ObjectTool {
    return tool.startsWith('object:');
  }

  private objectTool(id: EditorObjectId): ObjectTool {
    return `object:${id}`;
  }

  private updateStatus(message?: string): void {
    const toolLabel = this.toolLabel(this.activeTool);
    const blockedCount = this.editorMap.blocked.flat().filter(Boolean).length;
    const isoCount = this.editorMap.objects.filter(obj => OBJECT_BY_ID.get(obj.id)?.isometric).length;
    const base = t('{width}x{height} | Tool: {tool} | Blocked: {blocked} | Objects: {objects} | Iso structures: {iso}', {
      width: this.editorMap.width,
      height: this.editorMap.height,
      tool: toolLabel,
      blocked: blockedCount,
      objects: this.editorMap.objects.length,
      iso: isoCount,
    });
    this.statusText?.setText(message ? `${message}\n${base}` : `${base}\n${t('Iso lock: structures require diamond footprints and generated isometric sprites.')}`);
  }

  private toolLabel(tool: EditorTool): string {
    const objectDef = this.objectDefinitionForTool(tool);
    if (objectDef) return t(objectDef.label);
    if (tool === 'block') return t('Block');
    if (tool === 'open') return t('Open');
    if (tool === 'erase-object') return t('Erase Object');
    return t(tool[0].toUpperCase() + tool.slice(1));
  }

  private kindLabel(kind: EditorObjectDefinition['kind']): string {
    return t(kind[0].toUpperCase() + kind.slice(1));
  }

  private goBack(): void {
    this.scene.start(this.returnScene);
  }

  private ensureEditorObjectTextures(): void {
    ensureTileTextures(this);
    ensureMapAssetTextures(this);
  }

  private validateObjectCatalog(): void {
    const invalid = EDITOR_OBJECTS.find(def =>
      (def.kind === 'structure' || def.isometric) && (!def.isometric || !def.footprint),
    );
    if (invalid) {
      throw new Error(`Map editor asset "${invalid.id}" must be isometric and declare a footprint.`);
    }
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
