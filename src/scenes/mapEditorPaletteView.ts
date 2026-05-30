import Phaser from 'phaser';
import { TILE_OPTIONS } from '../assets/mapAssetLibrary';
import { localizedStyle, rtl, t } from '../i18n';
import { buttonFont, MIN_TOUCH_TARGET, responsiveFont, safeLayout } from '../ui/responsive';
import { panelControlX, panelGridButtonX, panelRowButtonX, panelTextX } from './mapEditorLayout';
import {
  PALETTE_BUTTON_GAP,
  type EditorLayout,
  type EditorObjectDefinition,
  type EditorTool,
  type SpecialToolIcon,
} from './mapEditorTypes';
import type { TileKind } from './baseMapTypes';

export interface EditorToolButton {
  tool: EditorTool;
  rect: Phaser.GameObjects.Rectangle;
}

interface PaletteRenderOptions {
  scene: Phaser.Scene;
  layout: EditorLayout;
  size: { width: number; height: number };
  activeTool: EditorTool;
  assetPickerOpen: boolean;
  activeObject?: EditorObjectDefinition;
  objectCount: number;
  resizeMap: (width: number, height: number) => void;
  mapSize: { width: number; height: number };
  saveMap: () => void;
  loadMap: () => void;
  copyExport: () => void;
  resetMap: () => void;
  goBack: () => void;
  selectTool: (tool: EditorTool) => void;
  openAssetPicker: () => void;
}

export interface PaletteRenderResult {
  ui: Phaser.GameObjects.Container;
  statusText: Phaser.GameObjects.Text;
  exportText: Phaser.GameObjects.Text;
  toolButtons: EditorToolButton[];
}

export function renderEditorPalette(options: PaletteRenderOptions): PaletteRenderResult {
  const { scene, layout, size } = options;
  const compact = layout.mode === 'bottom';
  const textX = panelTextX(layout);
  const textOrigin = rtl ? 1 : 0;
  const ui = scene.add.container(0, 0).setDepth(10000);
  const toolButtons: EditorToolButton[] = [];
  let tileTooltip: Phaser.GameObjects.Container | undefined;

  const hideTileTooltip = (): void => {
    tileTooltip?.destroy(true);
    tileTooltip = undefined;
  };
  const showTileTooltip = (x: number, y: number, label: string): void => {
    hideTileTooltip();
    const text = scene.add.text(x, y - 28, label, localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(12, scene.scale),
      color: '#f3e2b5',
    }));
    const bounds = text.getBounds();
    const bg = scene.add.rectangle(bounds.x - 5, bounds.y - 3, bounds.width + 10, bounds.height + 6, 0x0a0806, 0.96)
      .setOrigin(0)
      .setStrokeStyle(1, 0xf3d98a, 0.8);
    tileTooltip = scene.add.container(0, 0, [bg, text]).setDepth(10020);
    ui.add(tileTooltip);
  };

  ui.add(scene.add.rectangle(layout.panelX, layout.panelY, layout.panelW, layout.panelH, 0x120d08, 0.96).setOrigin(0));
  ui.add(scene.add.text(textX, layout.panelY + 14, t('Palette'), localizedStyle({
    fontFamily: 'Georgia, serif',
    fontSize: responsiveFont(24, size, 17),
    color: '#f3e2b5',
  })).setOrigin(textOrigin, 0));

  let y = layout.panelY + (compact ? 46 : 52);
  ui.add(scene.add.text(textX, y, t('Tiles'), localizedStyle({
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
    makeTileSwatchButton(
      scene,
      ui,
      toolButtons,
      panelGridButtonX(layout, i, tileColumns, paletteStep),
      y + Math.floor(i / tileColumns) * paletteStep,
      option.kind,
      t(option.label),
      option.color,
      options.selectTool,
      showTileTooltip,
      hideTileTooltip,
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
    makeSpecialToolButton(
      scene,
      ui,
      toolButtons,
      panelGridButtonX(layout, i, specialColumns, paletteStep),
      specialY + Math.floor(i / specialColumns) * paletteStep,
      option,
      options.selectTool,
      showTileTooltip,
      hideTileTooltip,
    );
  }

  y = specialY + Math.ceil(specialTools.length / specialColumns) * paletteStep + (compact ? 10 : 12);
  const assetButtonW = Math.min(254, layout.panelW - 36);
  ui.add(scene.add.text(textX, y, t('Objects'), localizedStyle({
    fontFamily: 'Georgia, serif',
    fontSize: responsiveFont(14, size),
    color: '#c9b07a',
  })).setOrigin(textOrigin, 0));
  y += 22;
  makeAssetBrowserButton(scene, ui, panelControlX(layout, assetButtonW), y, assetButtonW, options);

  y += compact ? 56 : 64;
  ui.add(scene.add.text(textX, y, t('Size'), localizedStyle({
    fontFamily: 'Georgia, serif',
    fontSize: responsiveFont(14, size),
    color: '#c9b07a',
  })).setOrigin(textOrigin, 0));
  y += 22;
  const sizeButtonW = compact ? Math.min(62, (layout.panelW - 56) / 4) : 62;
  const sizeGap = compact ? 6 : 8;
  addEditorButton(scene, ui, panelRowButtonX(layout, 0, sizeButtonW, sizeGap), y, sizeButtonW, MIN_TOUCH_TARGET, '- W', () => options.resizeMap(options.mapSize.width - 1, options.mapSize.height));
  addEditorButton(scene, ui, panelRowButtonX(layout, 1, sizeButtonW, sizeGap), y, sizeButtonW, MIN_TOUCH_TARGET, '+ W', () => options.resizeMap(options.mapSize.width + 1, options.mapSize.height));
  addEditorButton(scene, ui, panelRowButtonX(layout, 2, sizeButtonW, sizeGap), y, sizeButtonW, MIN_TOUCH_TARGET, '- H', () => options.resizeMap(options.mapSize.width, options.mapSize.height - 1));
  addEditorButton(scene, ui, panelRowButtonX(layout, 3, sizeButtonW, sizeGap), y, sizeButtonW, MIN_TOUCH_TARGET, '+ H', () => options.resizeMap(options.mapSize.width, options.mapSize.height + 1));

  y += compact ? 56 : 62;
  const actionButtonW = compact ? Math.min(62, (layout.panelW - 60) / 5) : 80;
  const actionGap = compact ? 6 : 8;
  addEditorButton(scene, ui, panelRowButtonX(layout, 0, actionButtonW, actionGap), y, actionButtonW, MIN_TOUCH_TARGET, t('Save'), options.saveMap);
  addEditorButton(scene, ui, panelRowButtonX(layout, 1, actionButtonW, actionGap), y, actionButtonW, MIN_TOUCH_TARGET, t('Load'), options.loadMap);
  addEditorButton(scene, ui, panelRowButtonX(layout, 2, actionButtonW, actionGap), y, actionButtonW, MIN_TOUCH_TARGET, t('Copy'), options.copyExport);
  if (compact) {
    addEditorButton(scene, ui, panelRowButtonX(layout, 3, actionButtonW, actionGap), y, actionButtonW, MIN_TOUCH_TARGET, t('Clear'), options.resetMap);
    addEditorButton(scene, ui, panelRowButtonX(layout, 4, actionButtonW, actionGap), y, actionButtonW, MIN_TOUCH_TARGET, t('Back'), options.goBack);
  } else {
    y += 54;
    addEditorButton(scene, ui, panelRowButtonX(layout, 0, 124, 8), y, 124, MIN_TOUCH_TARGET, t('Clear'), options.resetMap);
    addEditorButton(scene, ui, panelRowButtonX(layout, 1, 124, 8), y, 124, MIN_TOUCH_TARGET, t('Back'), options.goBack);
  }

  y += compact ? 54 : 58;
  const statusY = compact ? layout.panelY + layout.panelH - 34 : y;
  const statusText = scene.add.text(textX, statusY, '', localizedStyle({
    fontFamily: 'Georgia, serif',
    fontSize: responsiveFont(12, size),
    color: '#c9b07a',
    wordWrap: { width: layout.panelW - 36 },
  })).setOrigin(textOrigin, 0);
  ui.add(statusText);

  const exportText = scene.add.text(textX, compact ? layout.panelY + layout.panelH - 24 : safeLayout(size).bottom - 66, '', localizedStyle({
    fontFamily: 'Menlo, Consolas, monospace',
    fontSize: responsiveFont(10, size),
    color: '#8f8068',
    wordWrap: { width: layout.panelW - 36 },
  })).setOrigin(textOrigin, 0);
  exportText.setVisible(!compact);
  ui.add(exportText);
  return { ui, statusText, exportText, toolButtons };
}

export function addEditorButton(
  scene: Phaser.Scene,
  ui: Phaser.GameObjects.Container,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  onClick: () => void,
): void {
  const buttonW = Math.max(MIN_TOUCH_TARGET, Math.round(w));
  const buttonH = Math.max(MIN_TOUCH_TARGET, Math.round(h));
  const rect = scene.add.rectangle(x, y, buttonW, buttonH, 0x1a120a, 1)
    .setOrigin(0)
    .setStrokeStyle(1, 0x5a4428, 1)
    .setInteractive({ useHandCursor: true })
    .on('pointerover', () => rect.setStrokeStyle(1, 0xf3d98a, 1))
    .on('pointerout', () => rect.setStrokeStyle(1, 0x5a4428, 1))
    .on('pointerdown', onClick);
  const text = scene.add.text(x + buttonW / 2, y + buttonH / 2, label, localizedStyle({
    fontFamily: 'Georgia, serif',
    fontSize: buttonFont(13, scene.scale),
    color: '#f3d98a',
  }, 'center')).setOrigin(0.5);
  ui.add([rect, text]);
}

function makeTileSwatchButton(
  scene: Phaser.Scene,
  ui: Phaser.GameObjects.Container,
  toolButtons: EditorToolButton[],
  x: number,
  y: number,
  tool: TileKind,
  label: string,
  color: number,
  selectTool: (tool: EditorTool) => void,
  showTooltip: (x: number, y: number, label: string) => void,
  hideTooltip: () => void,
): void {
  const rect = scene.add.rectangle(x, y, MIN_TOUCH_TARGET, MIN_TOUCH_TARGET, 0x24170d, 1)
    .setOrigin(0)
    .setStrokeStyle(1, 0x4a3a22, 1)
    .setInteractive({ useHandCursor: true })
    .on('pointerover', () => showTooltip(x, y, label))
    .on('pointerout', hideTooltip)
    .on('pointerdown', () => selectTool(tool));
  const swatch = scene.add.rectangle(x + 10, y + 10, 24, 24, color, 1)
    .setOrigin(0)
    .setStrokeStyle(1, 0x0a0806, 0.7);
  ui.add([rect, swatch]);
  toolButtons.push({ tool, rect });
}

function makeSpecialToolButton(
  scene: Phaser.Scene,
  ui: Phaser.GameObjects.Container,
  toolButtons: EditorToolButton[],
  x: number,
  y: number,
  option: { tool: EditorTool; label: string; color: number; icon: SpecialToolIcon },
  selectTool: (tool: EditorTool) => void,
  showTooltip: (x: number, y: number, label: string) => void,
  hideTooltip: () => void,
): void {
  const rect = scene.add.rectangle(x, y, MIN_TOUCH_TARGET, MIN_TOUCH_TARGET, 0x24170d, 1)
    .setOrigin(0)
    .setStrokeStyle(1, 0x4a3a22, 1)
    .setInteractive({ useHandCursor: true })
    .on('pointerover', () => showTooltip(x, y, option.label))
    .on('pointerout', hideTooltip)
    .on('pointerdown', () => selectTool(option.tool));
  const glyph = scene.add.graphics();
  drawSpecialToolIcon(glyph, x + 9, y + 9, option.color, option.icon);
  ui.add([rect, glyph]);
  toolButtons.push({ tool: option.tool, rect });
}

function drawSpecialToolIcon(
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

function makeAssetBrowserButton(
  scene: Phaser.Scene,
  ui: Phaser.GameObjects.Container,
  x: number,
  y: number,
  width: number,
  options: PaletteRenderOptions,
): void {
  const activeObject = options.activeObject;
  const rect = scene.add.rectangle(x, y, width, MIN_TOUCH_TARGET, options.assetPickerOpen || activeObject ? 0x3a2814 : 0x24170d, 1)
    .setOrigin(0)
    .setStrokeStyle(options.assetPickerOpen || activeObject ? 2 : 1, options.assetPickerOpen ? 0xf3d98a : 0x4a3a22, 1)
    .setInteractive({ useHandCursor: true })
    .on('pointerover', () => rect.setStrokeStyle(2, 0xf3d98a, 1))
    .on('pointerout', () => rect.setStrokeStyle(options.assetPickerOpen || activeObject ? 2 : 1, options.assetPickerOpen ? 0xf3d98a : 0x4a3a22, 1))
    .on('pointerdown', options.openAssetPicker);
  const swatch = scene.add.rectangle(x + 10, y + 12, 20, 20, activeObject?.color ?? 0x6b5a44, 1).setOrigin(0);
  const label = activeObject
    ? t('Assets: {label}', { label: t(activeObject.label) })
    : t('Assets ({count})', { count: options.objectCount });
  const swatchX = rtl ? x + width - 30 : x + 10;
  swatch.setX(swatchX);
  const text = scene.add.text(rtl ? x + width - 38 : x + 38, y + 12, label, localizedStyle({
    fontFamily: 'Georgia, serif',
    fontSize: buttonFont(12, scene.scale),
    color: '#e8d9b0',
    wordWrap: { width: width - 64 },
  })).setOrigin(rtl ? 1 : 0, 0);
  const caret = scene.add.text(rtl ? x + 18 : x + width - 18, y + MIN_TOUCH_TARGET / 2, rtl ? '<' : '>', localizedStyle({
    fontFamily: 'Georgia, serif',
    fontSize: buttonFont(13, scene.scale),
    color: '#f3d98a',
  }, 'center')).setOrigin(0.5);
  ui.add([rect, swatch, text, caret]);
}
