import { GlowCover } from './glowCover';
import { GLOW_SHADER } from './glowShader';
import { GLOW_UNIFORM_FLOATS, SKYLINE_CHANNELS, glowBounds, glowIsDark, packGlowUniforms, sampleSkyline, type GlowSpec } from './glowMath';
import type { HdrGpu } from './hdrSupport';

/** The game draws at one canvas pixel per CSS pixel, and the glow is soft; more would only cost fill. */
const MAX_PIXEL_RATIO = 1;

interface GlowCanvas {
  canvas: HTMLCanvasElement;
  context: GPUCanvasContext;
  uniforms: GPUBuffer;
  /** The skyline under the canvas, one texel per column (land and haze), and the bind group that holds it with the uniforms. */
  skyline: GPUTexture | undefined;
  /** The words and panels in front, by their alpha. */
  cover: GlowCover | undefined;
  bindGroup: GPUBindGroup | undefined;
  packed: Float32Array<ArrayBuffer>;
  columns: Float32Array<ArrayBuffer>;
  /** What was last presented, so a still sky costs nothing. */
  last: Float32Array;
  lastColumns: Float32Array;
  key: string;
  shown: boolean;
}

const pipelines = new WeakMap<GPUDevice, GPURenderPipeline>();

function glowPipeline(gpu: HdrGpu): GPURenderPipeline {
  let pipeline = pipelines.get(gpu.device);
  if (!pipeline) {
    const module = gpu.device.createShaderModule({ code: GLOW_SHADER });
    pipeline = gpu.device.createRenderPipeline({
      layout: 'auto',
      vertex: { module, entryPoint: 'vertexMain' },
      fragment: { module, entryPoint: 'fragmentMain', targets: [{ format: gpu.format }] },
      primitive: { topology: 'triangle-list' },
    });
    pipelines.set(gpu.device, pipeline);
  }
  return pipeline;
}

/**
 * Compiles the glow's pipeline off the main thread ahead of time (while the
 * loading screen shows), so the first glow does not stall a frame to build it.
 */
export async function prepareGlowPipeline(gpu: HdrGpu): Promise<void> {
  if (pipelines.has(gpu.device)) return;
  const module = gpu.device.createShaderModule({ code: GLOW_SHADER });
  const pipeline = await gpu.device.createRenderPipelineAsync({
    layout: 'auto',
    vertex: { module, entryPoint: 'vertexMain' },
    fragment: { module, entryPoint: 'fragmentMain', targets: [{ format: gpu.format }] },
    primitive: { topology: 'triangle-list' },
  });
  if (!pipelines.has(gpu.device)) pipelines.set(gpu.device, pipeline);
}

/**
 * Small HDR canvases laid over the game, one per sun or moon, each just
 * big enough for its glow and moved with a CSS transform as the body
 * crosses the sky. They take no pointer input and are only redrawn when
 * what they show changes.
 */
export class HdrGlowLayer {
  private readonly pipeline: GPURenderPipeline;
  private readonly glows: GlowCanvas[] = [];

  constructor(private readonly gpu: HdrGpu, private readonly gameCanvas: HTMLCanvasElement) {
    this.pipeline = glowPipeline(gpu);
  }

  /** Where the game canvas shows on the page: offset within its parent and CSS pixels per game pixel. */
  private placement = { x: 0, y: 0, scaleX: 1, scaleY: 1 };

  /**
   * Measures where the game canvas actually is, rather than assuming one
   * game pixel per CSS pixel at its offset: on a phone's home-screen app the
   * page can show the canvas shifted or scaled, and a glow placed by the
   * assumption lands off the sun, its cut along the skyline showing as a
   * ghost of the city.
   */
  private measure(): void {
    const canvas = this.gameCanvas;
    const rect = canvas.getBoundingClientRect();
    const parent = (canvas.parentElement ?? document.body).getBoundingClientRect();
    this.placement = {
      x: rect.left - parent.left,
      y: rect.top - parent.top,
      scaleX: canvas.width > 0 ? rect.width / canvas.width : 1,
      scaleY: canvas.height > 0 ? rect.height / canvas.height : 1,
    };
  }

  /** Shows these glows, in game pixels, and hides any others. */
  update(specs: readonly GlowSpec[]): void {
    this.measure();
    const live = specs.filter(spec => !glowIsDark(spec) && this.onScreen(spec));
    live.forEach((spec, i) => this.draw(this.glows[i] ?? this.addGlow(), spec));
    for (let i = live.length; i < this.glows.length; i += 1) this.hide(this.glows[i]!);
  }

  private onScreen(spec: GlowSpec): boolean {
    const box = glowBounds(spec);
    const { width, height } = this.gameCanvas;
    return box.x < width && box.y < height && box.x + box.width > 0 && box.y + box.height > 0;
  }

  destroy(): void {
    for (const glow of this.glows) {
      glow.context.unconfigure();
      glow.uniforms.destroy();
      glow.skyline?.destroy();
      glow.cover?.destroy();
      glow.canvas.remove();
    }
    this.glows.length = 0;
  }

  private addGlow(): GlowCanvas {
    const { device, format } = this.gpu;
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
      position: 'absolute',
      left: '0',
      top: '0',
      pointerEvents: 'none',
      imageRendering: 'auto',
      willChange: 'transform',
      display: 'none',
    });
    this.gameCanvas.insertAdjacentElement('afterend', canvas);
    const context = canvas.getContext('webgpu');
    if (!context) throw new Error('HDR glow: no WebGPU context on a fresh canvas');
    context.configure({ device, format, alphaMode: 'premultiplied', toneMapping: { mode: 'extended' } });
    const uniforms = device.createBuffer({ size: GLOW_UNIFORM_FLOATS * 4, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    const glow: GlowCanvas = {
      canvas, context, uniforms,
      skyline: undefined,
      cover: undefined,
      bindGroup: undefined,
      packed: new Float32Array(GLOW_UNIFORM_FLOATS),
      columns: new Float32Array(0),
      last: new Float32Array(GLOW_UNIFORM_FLOATS),
      lastColumns: new Float32Array(0),
      key: '',
      shown: false,
    };
    this.glows.push(glow);
    return glow;
  }

  private draw(glow: GlowCanvas, spec: GlowSpec): void {
    const ratio = Math.min(MAX_PIXEL_RATIO, window.devicePixelRatio || 1);
    const box = glowBounds(spec);
    // Whole game pixels for the corner, so the disc does not shimmer as it moves.
    const left = Math.floor(box.x);
    const top = Math.floor(box.y);
    const size = Math.ceil(box.width) + 1;
    const pixels = Math.max(1, Math.round(size * ratio));
    const { canvas } = glow;
    const style = canvas.style;
    // A fresh or resized canvas starts out empty, so it must be drawn whatever the uniforms say.
    let dirty = !glow.shown;
    const at = this.placement;
    const key = `${left},${top},${size},${pixels},${at.x},${at.y},${at.scaleX},${at.scaleY}`;
    if (key !== glow.key) {
      glow.key = key;
      if (canvas.width !== pixels || !glow.bindGroup) {
        canvas.width = canvas.height = pixels;
        this.resizeSkyline(glow, pixels);
        dirty = true;
      }
      style.width = `${size * at.scaleX}px`;
      style.height = `${size * at.scaleY}px`;
      style.transform = `translate(${at.x + left * at.scaleX}px, ${at.y + top * at.scaleY}px)`;
    }
    packGlowUniforms(spec, { x: left, y: top }, pixels / size, glow.packed);
    sampleSkyline(spec, { x: left, y: top }, pixels / size, glow.columns);
    if (glow.cover?.update(spec.occluders, { x: left, y: top }, pixels / size)) dirty = true;
    if (!dirty && sameValues(glow.packed, glow.last) && sameValues(glow.columns, glow.lastColumns)) return;
    if (!glow.shown) {
      style.display = 'block';
      glow.shown = true;
    }
    glow.last.set(glow.packed);
    glow.lastColumns.set(glow.columns);
    this.render(glow);
  }

  private resizeSkyline(glow: GlowCanvas, columns: number): void {
    const { device } = this.gpu;
    glow.skyline?.destroy();
    glow.cover?.destroy();
    glow.cover = new GlowCover(device, columns);
    glow.skyline = device.createTexture({ size: [columns, 1], format: 'rg32float', usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST });
    glow.columns = new Float32Array(columns * SKYLINE_CHANNELS);
    glow.lastColumns = new Float32Array(columns * SKYLINE_CHANNELS);
    glow.bindGroup = device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: glow.uniforms } },
        { binding: 1, resource: glow.skyline.createView() },
        { binding: 2, resource: glow.cover.texture.createView() },
      ],
    });
  }

  private render(glow: GlowCanvas): void {
    const { device } = this.gpu;
    if (!glow.skyline || !glow.bindGroup) return;
    device.queue.writeBuffer(glow.uniforms, 0, glow.packed);
    const columns = glow.columns.length / SKYLINE_CHANNELS;
    device.queue.writeTexture({ texture: glow.skyline }, glow.columns, { bytesPerRow: columns * SKYLINE_CHANNELS * 4 }, [columns, 1]);
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: glow.context.getCurrentTexture().createView(),
        clearValue: { r: 0, g: 0, b: 0, a: 0 },
        loadOp: 'clear',
        storeOp: 'store',
      }],
    });
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, glow.bindGroup);
    pass.draw(3);
    pass.end();
    device.queue.submit([encoder.finish()]);
  }

  private hide(glow: GlowCanvas): void {
    if (!glow.shown) return;
    glow.shown = false;
    glow.canvas.style.display = 'none';
  }
}

function sameValues(a: Float32Array, b: Float32Array): boolean {
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return false;
  return true;
}
