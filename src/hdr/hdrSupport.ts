/**
 * Whether the sun and moon can glow past SDR white here: a screen that
 * reports high dynamic range, a WebGPU canvas that really takes `extended`
 * tone mapping (read back from `getConfiguration`, as the spec advises,
 * since a browser without it would quietly clamp to SDR), and the player
 * not having turned it off. Anything short of that and nothing extra is
 * made: no device, no canvas.
 */

export interface HdrGpu {
  device: GPUDevice;
  format: GPUTextureFormat;
}

type HdrListener = (gpu: HdrGpu | undefined) => void;

const STORAGE_KEY = 'dawnbreakers.hdrGlow';
const DISPLAY_QUERY = '(dynamic-range: high)';
const HDR_FORMAT: GPUTextureFormat = 'rgba16float';

const listeners = new Set<HdrListener>();
let enabled = readStoredPreference();
let probe: Promise<HdrGpu | undefined> | undefined;
let display: MediaQueryList | undefined;
let generation = 0;

function readStoredPreference(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== '0';
  } catch {
    return true;
  }
}

export function isHdrGlowEnabled(): boolean {
  return enabled;
}

export function setHdrGlowEnabled(value: boolean): void {
  enabled = value;
  try {
    localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
  } catch {
    // Private browsing: keep the in-memory choice only.
  }
  notify();
}

function hdrDisplay(): MediaQueryList | undefined {
  if (display || typeof window.matchMedia !== 'function') return display;
  display = window.matchMedia(DISPLAY_QUERY);
  // The window can be dragged between an HDR screen and an SDR one.
  display.addEventListener('change', () => notify());
  return display;
}

/** True once this screen and browser are known to show HDR from a WebGPU canvas. */
export async function hdrGlowSupported(): Promise<boolean> {
  if (!hdrDisplay()?.matches) return false;
  return (await probeHdrGpu()) !== undefined;
}

function probeHdrGpu(): Promise<HdrGpu | undefined> {
  probe ??= requestHdrGpu();
  return probe;
}

async function requestHdrGpu(): Promise<HdrGpu | undefined> {
  try {
    const adapter = await navigator.gpu?.requestAdapter({ powerPreference: 'high-performance' });
    if (!adapter) return undefined;
    const device = await adapter.requestDevice();
    if (!canvasTakesExtendedRange(device)) {
      device.destroy();
      return undefined;
    }
    void device.lost.then(() => {
      probe = undefined;
      notify();
    });
    return { device, format: HDR_FORMAT };
  } catch {
    return undefined;
  }
}

function canvasTakesExtendedRange(device: GPUDevice): boolean {
  const context = document.createElement('canvas').getContext('webgpu');
  if (!context || typeof context.getConfiguration !== 'function') return false;
  context.configure({ device, format: HDR_FORMAT, alphaMode: 'premultiplied', toneMapping: { mode: 'extended' } });
  const mode = context.getConfiguration()?.toneMapping?.mode;
  context.unconfigure();
  return mode === 'extended';
}

/**
 * Calls `listener` with the GPU whenever the glow can be shown, and with
 * `undefined` whenever it cannot, starting now. Returns the unsubscribe.
 */
export function watchHdrGlow(listener: HdrListener): () => void {
  listeners.add(listener);
  void resolveFor(listener, generation);
  return () => listeners.delete(listener);
}

function notify(): void {
  generation += 1;
  const current = generation;
  for (const listener of listeners) void resolveFor(listener, current);
}

async function resolveFor(listener: HdrListener, asOf: number): Promise<void> {
  const gpu = enabled && hdrDisplay()?.matches ? await probeHdrGpu() : undefined;
  // A later change has already answered; this one is stale.
  if (asOf !== generation || !listeners.has(listener)) return;
  listener(gpu);
}
