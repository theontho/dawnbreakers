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

/**
 * Why the glow is or is not showing, for the Settings line and the HDR
 * check on the mini-game screen: on; turned off; or the first thing missing.
 */
export type HdrDiagnosis = 'on' | 'off' | 'no-webgpu' | 'no-adapter' | 'no-extended' | 'sdr-screen';

const STORAGE_KEY = 'dawnbreakers.hdrGlow';
const DISPLAY_QUERY = '(dynamic-range: high)';
const HDR_FORMAT: GPUTextureFormat = 'rgba16float';

const listeners = new Set<HdrListener>();
let enabled = readStoredPreference();
let probe: Promise<HdrGpu | undefined> | undefined;
let display: MediaQueryList | undefined;
let generation = 0;
/** Why the last probe found no HDR GPU. */
let probeFailure: HdrDiagnosis | undefined;

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

/** Whether the screen the window is on reports high dynamic range. */
export function hdrScreen(): boolean {
  return hdrDisplay()?.matches ?? false;
}

/**
 * The diagnosis without waking the GPU on a screen that reports standard
 * range (Settings opens often; the mini-game check probes regardless).
 */
export async function hdrGlowDiagnosisForScreen(): Promise<HdrDiagnosis> {
  return hdrScreen() ? hdrGlowDiagnosis() : 'sdr-screen';
}

/** Safari, which may lack WebGPU or extended tone mapping where Chrome has them. */
export function isSafari(): boolean {
  const ua = navigator.userAgent;
  return /Safari\//.test(ua) && !/Chrome\/|Chromium\/|Edg\//.test(ua);
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
    // WebGPU is only offered to secure pages: https, or localhost.
    if (!navigator.gpu) return failed('no-webgpu');
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
    if (!adapter) return failed('no-adapter');
    const device = await adapter.requestDevice();
    if (!canvasTakesExtendedRange(device)) {
      device.destroy();
      return failed('no-extended');
    }
    probeFailure = undefined;
    console.info('[hdr] WebGPU canvas takes extended tone mapping: the sun and moon can glow past white.');
    void device.lost.then(() => {
      probe = undefined;
      notify();
    });
    return { device, format: HDR_FORMAT };
  } catch (error) {
    console.info('[hdr] WebGPU failed while probing:', error);
    return failed('no-adapter');
  }
}

function failed(reason: HdrDiagnosis): undefined {
  probeFailure = reason;
  console.info(`[hdr] no HDR glow: ${reason}`);
  return undefined;
}

/** Why the glow is or is not showing here, probing the GPU if it has not been yet. */
export async function hdrGlowDiagnosis(): Promise<HdrDiagnosis> {
  if (!(await probeHdrGpu())) return probeFailure ?? 'no-adapter';
  if (!hdrDisplay()?.matches) return 'sdr-screen';
  return enabled ? 'on' : 'off';
}

/**
 * The GPU for drawing HDR whatever the screen says and whether or not the
 * player has the glow on, for the HDR check; undefined where there is none.
 */
export function hdrGpu(): Promise<HdrGpu | undefined> {
  return probeHdrGpu();
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
