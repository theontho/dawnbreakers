import Phaser from 'phaser';
import {
  ensureMapAssetTextures,
  ensureTileTextures,
  MAP_ASSET_CATEGORIES,
  MAP_OBJECT_BY_ID,
  MAP_OBJECTS,
} from '../assets/mapAssetLibrary';
import { localizedStyle, rtl, t, textOriginX } from '../i18n';
import { addLanguageDropdown } from '../ui/languageDropdown';
import { isNarrowLayout, responsiveFont, safeLayout } from '../ui/responsive';
import {
  assetPickerOffsetForAsset as getAssetPickerOffsetForAsset,
  assetPickerRows as buildAssetPickerRows,
  clampedAssetPickerScrollY as clampAssetPickerScrollY,
  firstAssetAfterScrollY as getFirstAssetAfterScrollY,
  firstCategorizedAsset as getFirstCategorizedAsset,
  totalCategorizedAssets as getTotalCategorizedAssets,
} from './mapEditorAssetPicker';
import { renderAssetPickerOverlay } from './mapEditorAssetPickerView';
import {
  editorGridToScreen,
  footprintInBounds as isFootprintInBounds,
  pointerToEditorGrid,
  tileDiamond as getTileDiamond,
} from './mapEditorGeometry';
import {
  createAssetPickerGeometry,
  createEditorLayout,
} from './mapEditorLayout';
import { applyEditorTool, resizeEditorMap } from './mapEditorOperations';
import { addEditorButton, renderEditorPalette, type EditorToolButton } from './mapEditorPaletteView';
import {
  editorObjectDefinitionForTool,
  editorObjectTool,
  editorStatusText,
  validateEditorObjectCatalog,
} from './mapEditorTools';
import { MapEditorInputController } from './mapEditorInput';
import {
  ASSET_PICKER_MAX_WHEEL_DELTA,
  ASSET_PICKER_WHEEL_SCALE,
  STORAGE_KEY,
  type AssetPickerRow,
  type EditorLayout,
  type EditorMap,
  type EditorObjectDefinition,
  type EditorObjectId,
  type EditorSceneData,
  type EditorTool,
} from './mapEditorTypes';
import {
  createDefaultEditorMap,
  encodeEditorMap,
  loadEditorMap,
  saveEditorMap,
} from './mapEditorStorage';
import { drawEditorFootprintOutline, renderEditorWorld } from './mapEditorWorld';

const EDITOR_OBJECTS = MAP_OBJECTS;
const OBJECT_BY_ID = MAP_OBJECT_BY_ID;

export class MapEditorScene extends Phaser.Scene {
  private editorMap!: EditorMap;
  private world?: Phaser.GameObjects.Container;
  private hover!: Phaser.GameObjects.Graphics;
  private ui!: Phaser.GameObjects.Container;
  private statusText!: Phaser.GameObjects.Text;
  private exportText!: Phaser.GameObjects.Text;
  private toolButtons: EditorToolButton[] = [];
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
  private inputController?: MapEditorInputController;

  constructor() {
    super('MapEditor');
  }

  init(data: EditorSceneData): void {
    this.returnScene = data.from ?? 'Title';
  }

  create(): void {
    validateEditorObjectCatalog(EDITOR_OBJECTS);
    this.ensureEditorObjectTextures();
    try {
      this.editorMap = loadEditorMap(localStorage, STORAGE_KEY, OBJECT_BY_ID) ?? createDefaultEditorMap(18, 12);
    } catch {
      this.editorMap = createDefaultEditorMap(18, 12);
    }
    this.rebuildLayout(true);
    this.setupInput();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    });
  }

  private handleResize(): void {
    if (!this.scene.isActive(this.scene.key)) return;
    this.inputController?.stopPanning();
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
    this.inputController = new MapEditorInputController(this, {
      isUIPointer: pointer => this.isUIPointer(pointer),
      isAssetPickerOpen: () => this.assetPickerOpen,
      isSuppressingPaint: () => this.suppressMapPaintUntilPointerUp,
      clearSuppressingPaint: () => { this.suppressMapPaintUntilPointerUp = false; },
      clearPaintStroke: () => { this.lastPainted = ''; },
      paintAtPointer: pointer => this.paintAtPointer(pointer),
      updateHover: pointer => this.updateHover(pointer),
      panMap: (dx, dy) => this.panMap(dx, dy),
      clearHover: () => this.hover.clear(),
      closeAssetPicker: () => this.closeAssetPicker(),
      saveMap: () => this.saveMap(),
      copyExport: () => void this.copyExport(),
      selectBlockTool: () => this.selectTool('block'),
      selectOpenTool: () => this.selectTool('open'),
      selectEraseTool: () => this.selectTool('erase-object'),
      goBack: () => this.goBack(),
      recenterMap: () => this.recenterMap(),
      handleAssetPickerWheel: dy => this.handleAssetPickerWheel(dy),
    });
    this.inputController.install();
  }

  private editorLayout(): EditorLayout {
    return createEditorLayout({ width: this.scale.width, height: this.scale.height });
  }

  private resetMapOrigin(): void {
    const layout = this.editorLayout();
    this.originX = layout.mapX + layout.mapW / 2;
    this.originY = layout.mapY + 26;
  }

  private buildUI(): void {
    const { width, height } = this.scale;
    const layout = this.editorLayout();
    const size = { width, height };
    this.assetPreviewContainer?.destroy(true);
    this.assetPreviewContainer = undefined;
    this.ui?.destroy(true);
    const palette = renderEditorPalette({
      scene: this,
      layout,
      size,
      activeTool: this.activeTool,
      assetPickerOpen: this.assetPickerOpen,
      activeObject: editorObjectDefinitionForTool(this.activeTool, OBJECT_BY_ID),
      objectCount: EDITOR_OBJECTS.length,
      mapSize: { width: this.editorMap.width, height: this.editorMap.height },
      resizeMap: (w, h) => this.resizeMap(w, h),
      saveMap: () => this.saveMap(),
      loadMap: () => this.loadMapIntoEditor(),
      copyExport: () => void this.copyExport(),
      resetMap: () => this.resetMap(),
      goBack: () => this.goBack(),
      selectTool: tool => this.selectTool(tool),
      openAssetPicker: () => this.openAssetPicker(),
    });
    this.ui = palette.ui;
    this.statusText = palette.statusText;
    this.exportText = palette.exportText;
    this.toolButtons = palette.toolButtons;
    this.updateToolButtons();
    this.updateStatus();
    if (this.assetPickerOpen) this.makeAssetPickerOverlay();
  }

  private makeAssetPickerOverlay(): void {
    const picker = createAssetPickerGeometry({ width: this.scale.width, height: this.scale.height });
    const pickerRows = this.assetPickerRows(picker.gridColumns);
    this.assetPickerScrollY = this.clampedAssetPickerScrollY(this.assetPickerScrollY, pickerRows, picker.contentH);
    renderAssetPickerOverlay({
      scene: this,
      ui: this.ui,
      picker,
      rows: pickerRows,
      scrollY: this.assetPickerScrollY,
      activeTool: this.activeTool,
      previewId: this.assetPickerPreviewId,
      totalAssets: this.totalCategorizedAssets(),
      categoryCount: MAP_ASSET_CATEGORIES.length,
      objectById: OBJECT_BY_ID,
      addButton: (x, y, w, h, label, onClick) => addEditorButton(this, this.ui, x, y, w, h, label, onClick),
      close: () => this.closeAssetPicker(),
      scrollPixels: deltaY => this.scrollAssetPickerPixels(deltaY),
      selectAsset: def => this.selectAssetFromPicker(def),
      setPreview: (id, container) => {
        this.assetPickerPreviewId = id;
        this.assetPreviewContainer = container;
      },
    });
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
    const picker = createAssetPickerGeometry({ width: this.scale.width, height: this.scale.height });
    const activeObject = editorObjectDefinitionForTool(this.activeTool, OBJECT_BY_ID);
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
    this.activeTool = editorObjectTool(def.id);
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
    const picker = createAssetPickerGeometry({ width: this.scale.width, height: this.scale.height });
    const rows = this.assetPickerRows(picker.gridColumns);
    const next = this.clampedAssetPickerScrollY(this.assetPickerScrollY + deltaY, rows, picker.contentH);
    if (next === this.assetPickerScrollY) return;
    this.assetPickerScrollY = next;
    this.assetPickerPreviewId = this.firstAssetAfterScrollY(rows, next)?.id;
    this.buildUI();
  }

  private clampedAssetPickerScrollY(scrollY: number, rows: AssetPickerRow[], contentH: number): number {
    return clampAssetPickerScrollY(scrollY, rows, contentH);
  }

  private assetPickerRows(gridColumns: number): AssetPickerRow[] {
    return buildAssetPickerRows(MAP_ASSET_CATEGORIES, OBJECT_BY_ID, gridColumns);
  }

  private assetPickerOffsetForAsset(rows: AssetPickerRow[], id: EditorObjectId): number {
    return getAssetPickerOffsetForAsset(rows, id);
  }

  private firstAssetAfterScrollY(rows: AssetPickerRow[], scrollY: number): EditorObjectDefinition | undefined {
    return getFirstAssetAfterScrollY(rows, scrollY);
  }

  private firstCategorizedAsset(): EditorObjectDefinition | undefined {
    return getFirstCategorizedAsset(MAP_ASSET_CATEGORIES, OBJECT_BY_ID);
  }

  private totalCategorizedAssets(): number {
    return getTotalCategorizedAssets(MAP_ASSET_CATEGORIES, OBJECT_BY_ID);
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

    const { changed, message } = applyEditorTool(this.editorMap, this.activeTool, cell.x, cell.y, OBJECT_BY_ID);
    if (changed) {
      this.renderWorld();
      this.updateStatus(message);
    } else if (message) {
      this.updateStatus(message);
    }
  }

  private updateHover(pointer: Phaser.Input.Pointer): void {
    this.hover.clear();
    if (this.isUIPointer(pointer)) return;
    const cell = this.gridFromPointer(pointer);
    if (!cell) return;

    const def = editorObjectDefinitionForTool(this.activeTool, OBJECT_BY_ID);
    if (def?.footprint) {
      const valid = isFootprintInBounds(cell.x, cell.y, def.footprint, this.editorMap.width, this.editorMap.height);
      this.hover.lineStyle(2, valid ? 0xf3d98a : 0xb83232, 0.95);
      drawEditorFootprintOutline(this.hover, this.originX, this.originY, this.editorMap, cell.x, cell.y, def.footprint);
      return;
    }

    const pos = editorGridToScreen(this.originX, this.originY, cell.x, cell.y);
    this.hover.lineStyle(2, this.activeTool === 'erase-object' ? 0xb83232 : 0xf3d98a, 0.9);
    this.hover.strokePoints(getTileDiamond(pos.sx, pos.sy), true);
  }

  private renderWorld(): void {
    this.world?.destroy(true);
    this.world = renderEditorWorld(this, this.editorMap, this.originX, this.originY, OBJECT_BY_ID);
  }

  private resizeMap(width: number, height: number): void {
    const next = resizeEditorMap(this.editorMap, width, height, OBJECT_BY_ID);
    if (!next) return;
    this.editorMap = next;
    this.renderWorld();
    this.updateStatus(t('Resized map.'));
  }

  private resetMap(): void {
    this.editorMap = createDefaultEditorMap(18, 12);
    this.renderWorld();
    this.updateStatus(t('Cleared to default map.'));
  }

  private saveMap(): void {
    try {
      saveEditorMap(localStorage, STORAGE_KEY, this.editorMap, OBJECT_BY_ID);
      this.updateStatus(t('Saved in this browser.'));
    } catch (error) {
      this.updateStatus(t('Save failed: {message}', { message: this.errorMessage(error) }));
    }
  }

  private loadMapIntoEditor(): void {
    let loaded: EditorMap | undefined;
    try {
      loaded = loadEditorMap(localStorage, STORAGE_KEY, OBJECT_BY_ID);
    } catch (error) {
      this.updateStatus(t('Load failed: {message}', { message: this.errorMessage(error) }));
      return;
    }
    if (!loaded) {
      this.updateStatus(t('No saved editor map found.'));
      return;
    }
    this.editorMap = loaded;
    this.renderWorld();
    this.updateStatus(t('Loaded saved editor map.'));
  }

  private async copyExport(): Promise<void> {
    const json = JSON.stringify(encodeEditorMap(this.editorMap, OBJECT_BY_ID), null, 2);
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
    return pointerToEditorGrid(pointer, this.originX, this.originY, this.editorMap.width, this.editorMap.height);
  }

  private isUIPointer(pointer: Phaser.Input.Pointer): boolean {
    if (this.assetPickerOpen) return true;
    const layout = this.editorLayout();
    return pointer.y < layout.mapY ||
      pointer.x < layout.mapX ||
      pointer.x >= layout.mapX + layout.mapW ||
      pointer.y >= layout.mapY + layout.mapH;
  }

  private updateStatus(message?: string): void {
    this.statusText?.setText(editorStatusText(this.editorMap, this.activeTool, OBJECT_BY_ID, message));
  }

  private goBack(): void {
    this.scene.start(this.returnScene);
  }

  private ensureEditorObjectTextures(): void {
    ensureTileTextures(this);
    ensureMapAssetTextures(this);
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
