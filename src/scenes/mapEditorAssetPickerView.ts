import Phaser from 'phaser';
import { localizedStyle, rtl, t } from '../i18n';
import { MIN_TOUCH_TARGET, responsiveFont } from '../ui/responsive';
import { TILE_H, TILE_W } from './baseMapTypes';
import { assetPickerRowHeight } from './mapEditorAssetPicker';
import { editorKindLabel, editorObjectTool } from './mapEditorTools';
import type {
  AssetPickerGeometry,
  AssetPickerRow,
  EditorObjectDefinition,
  EditorObjectId,
  EditorTool,
} from './mapEditorTypes';

interface AssetPickerOverlayOptions {
  scene: Phaser.Scene;
  ui: Phaser.GameObjects.Container;
  picker: AssetPickerGeometry;
  rows: AssetPickerRow[];
  scrollY: number;
  activeTool: EditorTool;
  previewId?: EditorObjectId;
  totalAssets: number;
  categoryCount: number;
  objectById: ReadonlyMap<EditorObjectId, EditorObjectDefinition>;
  addButton: (x: number, y: number, w: number, h: number, label: string, onClick: () => void) => void;
  close: () => void;
  scrollPixels: (deltaY: number) => void;
  selectAsset: (def: EditorObjectDefinition) => void;
  setPreview: (id: EditorObjectId | undefined, container: Phaser.GameObjects.Container | undefined) => void;
}

export function renderAssetPickerOverlay(options: AssetPickerOverlayOptions): void {
  const { scene, ui, picker } = options;
  const { width, height } = scene.scale;
  const dimmer = scene.add.rectangle(0, 0, width, height, 0x000000, 0.28)
    .setOrigin(0)
    .setInteractive();
  const panel = scene.add.rectangle(picker.overlayX, picker.overlayY, picker.overlayW, picker.overlayH, 0x160f08, 0.98)
    .setOrigin(0)
    .setStrokeStyle(2, 0xf3d98a, 0.9)
    .setInteractive();
  const overlayTextX = rtl ? picker.overlayX + picker.overlayW - 18 : picker.overlayX + 18;
  const overlayTextOrigin = rtl ? 1 : 0;
  const title = scene.add.text(overlayTextX, picker.overlayY + 16, t('Assets'), localizedStyle({
    fontFamily: 'Georgia, serif',
    fontSize: responsiveFont(21, { width, height }, 16),
    color: '#f3d98a',
  })).setOrigin(overlayTextOrigin, 0);
  const description = scene.add.text(overlayTextX, picker.overlayY + 46, t('All placeable assets are grouped by category. Scroll the grid and hover an asset for the detail preview.'), localizedStyle({
    fontFamily: 'Georgia, serif',
    fontSize: responsiveFont(13, { width, height }),
    color: '#bda676',
    wordWrap: { width: picker.overlayW - 124 },
  })).setOrigin(overlayTextOrigin, 0);

  ui.add([dimmer, panel, title, description]);
  options.addButton(rtl ? picker.overlayX + 22 : picker.overlayX + picker.overlayW - 104, picker.overlayY + 12, 82, MIN_TOUCH_TARGET, t('Close'), options.close);

  const gridHeaderH = 52;
  const gridBg = scene.add.rectangle(picker.gridX, picker.gridY, picker.gridW, picker.contentH + gridHeaderH, 0x0e0905, 0.88)
    .setOrigin(0)
    .setStrokeStyle(1, 0x4a3a22, 1)
    .setInteractive();
  ui.add(gridBg);

  const rangeText = scene.add.text(rtl ? picker.gridX + picker.gridW - 12 : picker.gridX + 12, picker.gridY + 17, t('{assetCount} assets | {categoryCount} categories', {
    assetCount: options.totalAssets,
    categoryCount: options.categoryCount,
  }), localizedStyle({
    fontFamily: 'Georgia, serif',
    fontSize: responsiveFont(11, { width, height }),
    color: '#8f8068',
  })).setOrigin(rtl ? 1 : 0, 0);
  ui.add(rangeText);
  const scrollButtonStart = rtl ? picker.gridX + 4 : picker.gridX + picker.gridW - 96;
  options.addButton(scrollButtonStart, picker.gridY + 4, MIN_TOUCH_TARGET, MIN_TOUCH_TARGET, '^', () => options.scrollPixels(-picker.gridCellH));
  options.addButton(scrollButtonStart + 48, picker.gridY + 4, MIN_TOUCH_TARGET, MIN_TOUCH_TARGET, 'v', () => options.scrollPixels(picker.gridCellH));

  const maskShape = scene.add.graphics();
  maskShape.fillStyle(0xffffff, 1);
  maskShape.fillRect(picker.gridX + 10, picker.gridY + gridHeaderH, picker.gridW - 20, picker.contentH);
  maskShape.setVisible(false);
  const gridContent = scene.add.container(0, 0).setMask(maskShape.createGeometryMask());
  ui.add([maskShape, gridContent]);

  let previewContainer: Phaser.GameObjects.Container | undefined;
  const showPreview = (def: EditorObjectDefinition): void => {
    previewContainer?.destroy(true);
    previewContainer = createAssetPreview(scene, ui, def, picker.previewX, picker.previewY, picker.previewW, picker.previewH);
    options.setPreview(def.id, previewContainer);
  };

  const visibleAssets = drawAssetPickerRows(options, gridContent, showPreview);
  const fallbackPreview = visibleAssets[0] ?? firstAssetFromRows(options.rows);
  let preview = options.previewId ? options.objectById.get(options.previewId) : undefined;
  if (preview) {
    const previewId = preview.id;
    if (!visibleAssets.some(def => def.id === previewId)) preview = fallbackPreview;
  }
  preview ??= fallbackPreview;
  options.setPreview(preview?.id, previewContainer);
  if (preview) showPreview(preview);
}

function drawAssetPickerRows(
  options: AssetPickerOverlayOptions,
  gridContent: Phaser.GameObjects.Container,
  showPreview: (def: EditorObjectDefinition) => void,
): EditorObjectDefinition[] {
  const { scene, picker } = options;
  const visibleAssets: EditorObjectDefinition[] = [];
  let rowOffsetY = 0;
  const x = picker.gridX + 10;
  const y = picker.gridY + 52;
  const width = picker.gridW - 20;
  const bottomY = y + picker.contentH;

  for (const row of options.rows) {
    const rowH = assetPickerRowHeight(row);
    const rowTopY = rowOffsetY;
    const rowBottomY = rowOffsetY + rowH;
    rowOffsetY = rowBottomY;
    if (rowBottomY < options.scrollY) continue;

    const cursorY = y + rowTopY - options.scrollY;
    if (cursorY > bottomY) break;
    if (row.kind === 'header') {
      const bg = scene.add.rectangle(x, cursorY + 2, width, 34, 0x1f160d, 1)
        .setOrigin(0)
        .setStrokeStyle(1, 0x5a4428, 0.8);
      const title = scene.add.text(rtl ? x + width - 10 : x + 10, cursorY + 10, t(row.category.label), localizedStyle({
        fontFamily: 'Georgia, serif',
        fontSize: responsiveFont(13, scene.scale),
        color: '#f3d98a',
      })).setOrigin(rtl ? 1 : 0, 0);
      const count = scene.add.text(rtl ? x + 10 : x + width - 10, cursorY + 10, t('{count} assets', { count: row.count }), localizedStyle({
        fontFamily: 'Georgia, serif',
        fontSize: responsiveFont(11, scene.scale),
        color: '#8f8068',
      })).setOrigin(rtl ? 0 : 1, 0);
      gridContent.add([bg, title, count]);
      continue;
    }

    for (let i = 0; i < row.assets.length; i++) {
      const option = row.assets[i];
      const optionX = x + i * (picker.gridCellW + picker.gridGap);
      const selected = options.activeTool === editorObjectTool(option.id);
      const isPreview = option.id === options.previewId;
      const rect = scene.add.rectangle(optionX, cursorY, picker.gridCellW, picker.gridCellH - 8, selected || isPreview ? 0x3a2814 : 0x24170d, 1)
        .setOrigin(0)
        .setStrokeStyle(selected || isPreview ? 2 : 1, selected ? 0xf3d98a : 0x4a3a22, 1)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => showPreview(option))
        .on('pointerdown', () => options.selectAsset(option));
      const thumbnail = scene.add.image(optionX + picker.gridCellW / 2, cursorY + 70, option.texture)
        .setOrigin(0.5, 1);
      thumbnail.setScale(Math.min((picker.gridCellW - 20) / thumbnail.width, 66 / thumbnail.height, 1.4));
      const swatch = scene.add.rectangle(rtl ? optionX + picker.gridCellW - 24 : optionX + 8, cursorY + 8, 16, 16, option.color, 1).setOrigin(0);
      const label = scene.add.text(optionX + picker.gridCellW / 2, cursorY + 80, t(option.label), localizedStyle({
        fontFamily: 'Georgia, serif',
        fontSize: responsiveFont(11, scene.scale),
        color: '#e8d9b0',
        align: 'center',
        wordWrap: { width: picker.gridCellW - 16 },
      }, 'center')).setOrigin(0.5, 0);
      const meta = scene.add.text(rtl ? optionX + 8 : optionX + picker.gridCellW - 8, cursorY + 8, editorKindLabel(option.kind), localizedStyle({
        fontFamily: 'Georgia, serif',
        fontSize: responsiveFont(10, scene.scale),
        color: '#8f8068',
      })).setOrigin(rtl ? 0 : 1, 0);
      gridContent.add([rect, thumbnail, swatch, label, meta]);
      visibleAssets.push(option);
    }
  }
  return visibleAssets;
}

function createAssetPreview(
  scene: Phaser.Scene,
  ui: Phaser.GameObjects.Container,
  def: EditorObjectDefinition,
  x: number,
  y: number,
  w: number,
  h: number,
): Phaser.GameObjects.Container | undefined {
  if (w < 120 || h < 90) return undefined;
  const previewPanel = scene.add.rectangle(x, y, w, h, 0x0e0905, 0.88)
    .setOrigin(0)
    .setStrokeStyle(1, 0x4a3a22, 1);
  const textX = rtl ? x + w - 18 : x + 18;
  const textOrigin = rtl ? 1 : 0;
  const title = scene.add.text(textX, y + 16, t(def.label), localizedStyle({
    fontFamily: 'Georgia, serif',
    fontSize: responsiveFont(20, scene.scale),
    color: '#f3d98a',
  })).setOrigin(textOrigin, 0);
  const details = [
    editorKindLabel(def.kind),
    def.footprint ? t('{w}x{h} footprint', { w: def.footprint.w, h: def.footprint.h }) : t('single tile'),
    def.isometric ? t('isometric safe') : undefined,
  ].filter(Boolean).join(' | ');
  const meta = scene.add.text(textX, y + 46, details, localizedStyle({
    fontFamily: 'Georgia, serif',
    fontSize: responsiveFont(12, scene.scale),
    color: '#8f8068',
  })).setOrigin(textOrigin, 0);

  const floor = scene.add.graphics();
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

  const image = scene.add.image(cx, groundY, def.texture).setOrigin(0.5, 1);
  const maxSpriteW = Math.max(80, w - 120);
  const maxSpriteH = Math.max(48, h - 92);
  const scale = Math.min(maxSpriteW / image.width, maxSpriteH / image.height, 3);
  image.setScale(scale);

  const help = h >= 160 ? scene.add.text(textX, y + h - 42, t('Click an asset tile to select it, then click the map to place it.'), localizedStyle({
    fontFamily: 'Georgia, serif',
    fontSize: responsiveFont(12, scene.scale),
    color: '#bda676',
    wordWrap: { width: w - 36 },
  })).setOrigin(textOrigin, 0) : undefined;
  const container = scene.add.container(0, 0, [previewPanel, floor, image, title, meta, ...(help ? [help] : [])]).setDepth(10010);
  ui.add(container);
  return container;
}

function firstAssetFromRows(rows: AssetPickerRow[]): EditorObjectDefinition | undefined {
  for (const row of rows) {
    if (row.kind === 'assets' && row.assets[0]) return row.assets[0];
  }
  return undefined;
}
