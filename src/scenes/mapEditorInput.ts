import Phaser from 'phaser';

interface MapEditorInputCallbacks {
  isUIPointer: (pointer: Phaser.Input.Pointer) => boolean;
  isAssetPickerOpen: () => boolean;
  isSuppressingPaint: () => boolean;
  clearSuppressingPaint: () => void;
  clearPaintStroke: () => void;
  paintAtPointer: (pointer: Phaser.Input.Pointer) => void;
  updateHover: (pointer: Phaser.Input.Pointer) => void;
  panMap: (dx: number, dy: number) => void;
  clearHover: () => void;
  closeAssetPicker: () => void;
  saveMap: () => void;
  copyExport: () => void;
  selectBlockTool: () => void;
  selectOpenTool: () => void;
  selectEraseTool: () => void;
  goBack: () => void;
  recenterMap: () => void;
  handleAssetPickerWheel: (deltaY: number) => void;
}

export class MapEditorInputController {
  private isPanning = false;
  private panPointerId?: number;
  private lastPanX = 0;
  private lastPanY = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly callbacks: MapEditorInputCallbacks,
  ) {}

  install(): void {
    this.scene.input.mouse?.disableContextMenu();

    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.callbacks.isSuppressingPaint()) return;
      if (this.callbacks.isUIPointer(pointer)) return;
      if (isPanPointer(pointer)) {
        this.startPanning(pointer);
        return;
      }
      this.callbacks.clearPaintStroke();
      this.callbacks.paintAtPointer(pointer);
    });
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isPanning && pointer.id === this.panPointerId) {
        this.callbacks.panMap(pointer.x - this.lastPanX, pointer.y - this.lastPanY);
        this.lastPanX = pointer.x;
        this.lastPanY = pointer.y;
        return;
      }
      this.callbacks.updateHover(pointer);
      if (pointer.leftButtonDown() && !this.callbacks.isSuppressingPaint()) this.callbacks.paintAtPointer(pointer);
    });
    const endPointerAction = (): void => {
      this.callbacks.clearPaintStroke();
      this.callbacks.clearSuppressingPaint();
      this.stopPanning();
    };
    this.scene.input.on('pointerup', endPointerAction);
    this.scene.input.on('pointerupoutside', endPointerAction);
    this.scene.input.on('wheel', (pointer: Phaser.Input.Pointer, _gameObjects: unknown, deltaX: number, deltaY: number) => {
      if (this.callbacks.isAssetPickerOpen()) {
        this.callbacks.handleAssetPickerWheel(deltaY);
        return;
      }
      if (this.callbacks.isUIPointer(pointer)) return;
      this.callbacks.panMap(
        Phaser.Math.Clamp(-deltaX, -100, 100),
        Phaser.Math.Clamp(-deltaY, -100, 100),
      );
    });

    const keyboard = this.scene.input.keyboard;
    keyboard?.on('keydown-ESC', () => {
      if (this.callbacks.isAssetPickerOpen()) {
        this.callbacks.closeAssetPicker();
        return;
      }
      this.callbacks.goBack();
    });
    keyboard?.on('keydown-S', () => this.callbacks.saveMap());
    keyboard?.on('keydown-C', () => void this.callbacks.copyExport());
    keyboard?.on('keydown-B', () => this.callbacks.selectBlockTool());
    keyboard?.on('keydown-O', () => this.callbacks.selectOpenTool());
    keyboard?.on('keydown-E', () => this.callbacks.selectEraseTool());
    keyboard?.on('keydown-R', () => this.callbacks.recenterMap());
    keyboard?.on('keydown-LEFT', () => this.callbacks.panMap(-48, 0));
    keyboard?.on('keydown-RIGHT', () => this.callbacks.panMap(48, 0));
    keyboard?.on('keydown-UP', () => this.callbacks.panMap(0, -32));
    keyboard?.on('keydown-DOWN', () => this.callbacks.panMap(0, 32));
  }

  stopPanning(): void {
    this.isPanning = false;
    this.panPointerId = undefined;
  }

  private startPanning(pointer: Phaser.Input.Pointer): void {
    this.isPanning = true;
    this.panPointerId = pointer.id;
    this.lastPanX = pointer.x;
    this.lastPanY = pointer.y;
    this.callbacks.clearHover();
  }
}

function isPanPointer(pointer: Phaser.Input.Pointer): boolean {
  return pointer.rightButtonDown() ||
    pointer.middleButtonDown() ||
    (pointer.event instanceof MouseEvent && pointer.event.shiftKey);
}
