import type { Occluder } from './glowMath';

/**
 * What stands in front of one glow, painted at the glow canvas's own size:
 * each word from the canvas it was drawn on and each panel as a filled
 * rectangle, by their opacity. The shader reads its alpha to cut the sun
 * out letter by letter. Painted and uploaded only when what it shows changes.
 */
export class GlowCover {
  readonly texture: GPUTexture;
  private readonly canvas = document.createElement('canvas');
  private readonly context: CanvasRenderingContext2D;
  private key = '';
  private readonly ids = new WeakMap<object, number>();
  private nextId = 1;

  constructor(private readonly device: GPUDevice, readonly pixels: number) {
    this.canvas.width = this.canvas.height = pixels;
    const context = this.canvas.getContext('2d');
    if (!context) throw new Error('HDR glow: no 2D context for the cover');
    this.context = context;
    this.texture = device.createTexture({
      size: [pixels, pixels],
      format: 'rgba8unorm',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    });
  }

  /**
   * Paints `occluders` (game pixels) for a canvas whose corner sits at
   * `origin` with `ratio` device pixels to a game pixel. True when the
   * cover changed and the glow must be drawn again.
   */
  update(occluders: readonly Occluder[], origin: { x: number; y: number }, ratio: number): boolean {
    const key = occluders.map(o => [
      Math.round((o.x - origin.x) * ratio), Math.round((o.y - origin.y) * ratio),
      Math.round(o.width * ratio), Math.round(o.height * ratio),
      o.opacity.toFixed(3), o.image ? this.id(o.image) : 0, o.version ?? '',
    ].join(',')).join(';');
    if (key === this.key) return false;
    this.key = key;
    const ctx = this.context;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.pixels, this.pixels);
    ctx.setTransform(ratio, 0, 0, ratio, -origin.x * ratio, -origin.y * ratio);
    ctx.fillStyle = '#000';
    for (const o of occluders) {
      ctx.globalAlpha = Math.min(1, Math.max(0, o.opacity));
      if (o.image) ctx.drawImage(o.image, o.x, o.y, o.width, o.height);
      else ctx.fillRect(o.x, o.y, o.width, o.height);
    }
    ctx.globalAlpha = 1;
    this.device.queue.copyExternalImageToTexture({ source: this.canvas }, { texture: this.texture }, [this.pixels, this.pixels]);
    return true;
  }

  destroy(): void {
    this.texture.destroy();
  }

  private id(image: object): number {
    let id = this.ids.get(image);
    if (id === undefined) {
      id = this.nextId++;
      this.ids.set(image, id);
    }
    return id;
  }
}
