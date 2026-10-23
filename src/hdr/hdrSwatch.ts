import type { HdrGpu } from './hdrSupport';

/** How much brighter than SDR white the right half asks to be. */
export const SWATCH_GAIN = 4;

const SWATCH_SHADER = /* wgsl */ `
struct Out {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
};

@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> Out {
  let corner = vec2f(f32((index << 1u) & 2u), f32(index & 2u));
  var out: Out;
  out.position = vec4f(corner * 2.0 - 1.0, 0.0, 1.0);
  out.uv = corner;
  return out;
}

@fragment
fn fragmentMain(in: Out) -> @location(0) vec4f {
  let level = select(1.0, ${SWATCH_GAIN.toFixed(1)}, in.uv.x >= 0.5);
  return vec4f(level, level, level, 1.0);
}
`;

/**
 * A test patch laid over the game at `rect` (game pixels): SDR white on
 * the left, four times brighter on the right. On a screen and browser that
 * show HDR the right half is plainly brighter; elsewhere the two match.
 * Returns a function that removes it.
 */
export function showHdrSwatch(
  gpu: HdrGpu,
  gameCanvas: HTMLCanvasElement,
  rect: { x: number; y: number; width: number; height: number },
): () => void {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.width = Math.max(2, Math.round(rect.width));
  canvas.height = Math.max(1, Math.round(rect.height));
  Object.assign(canvas.style, {
    position: 'absolute',
    left: `${gameCanvas.offsetLeft + rect.x}px`,
    top: `${gameCanvas.offsetTop + rect.y}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    pointerEvents: 'none',
  });
  gameCanvas.insertAdjacentElement('afterend', canvas);
  const context = canvas.getContext('webgpu');
  if (!context) {
    canvas.remove();
    return () => {};
  }
  const { device, format } = gpu;
  context.configure({ device, format, alphaMode: 'premultiplied', toneMapping: { mode: 'extended' } });
  const module = device.createShaderModule({ code: SWATCH_SHADER });
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module, entryPoint: 'vertexMain' },
    fragment: { module, entryPoint: 'fragmentMain', targets: [{ format }] },
    primitive: { topology: 'triangle-list' },
  });
  const encoder = device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [{
      view: context.getCurrentTexture().createView(),
      clearValue: { r: 0, g: 0, b: 0, a: 0 },
      loadOp: 'clear',
      storeOp: 'store',
    }],
  });
  pass.setPipeline(pipeline);
  pass.draw(3);
  pass.end();
  device.queue.submit([encoder.finish()]);
  return () => {
    context.unconfigure();
    canvas.remove();
  };
}
