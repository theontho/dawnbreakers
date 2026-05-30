import Phaser from 'phaser';
import { rtl } from '../i18n';
import { clamp, isNarrowLayout, isPortraitLayout, MIN_TOUCH_TARGET, safeLayout } from '../ui/responsive';
import {
  EDITOR_TOP_BAR_H,
  PANEL_W,
  type AssetPickerGeometry,
  type EditorLayout,
} from './mapEditorTypes';

type ViewSize = { width: number; height: number };

export function createEditorLayout(size: ViewSize): EditorLayout {
  const { width, height } = size;
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

export function panelTextX(layout: EditorLayout, inset = 18): number {
  return rtl ? layout.panelX + layout.panelW - inset : layout.panelX + inset;
}

export function panelControlX(layout: EditorLayout, controlW: number, inset = 18): number {
  return rtl ? layout.panelX + layout.panelW - inset - controlW : layout.panelX + inset;
}

export function panelGridButtonX(
  layout: EditorLayout,
  index: number,
  columns: number,
  step: number,
  itemW = MIN_TOUCH_TARGET,
): number {
  const column = index % columns;
  return rtl ? panelControlX(layout, itemW) - column * step : panelControlX(layout, itemW) + column * step;
}

export function panelRowButtonX(layout: EditorLayout, index: number, buttonW: number, gap: number): number {
  return rtl ? panelControlX(layout, buttonW) - index * (buttonW + gap) : panelControlX(layout, buttonW) + index * (buttonW + gap);
}

export function createAssetPickerGeometry(size: ViewSize): AssetPickerGeometry {
  const safe = safeLayout(size);
  const narrow = isNarrowLayout(size);
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
