import { locationFromDegrees } from './astronomy';
import { loadStarCatalog } from './catalog';
import { clamp, dateFromDecimalYear, decimalYear, formatSignedYear } from './math';
import { SkyRewindRenderer } from './SkyRewindRenderer';
import { TimeController, type TimeCurveSettings } from './timeController';
import type { GeographicLocation } from './types';

export async function mountSkyRewindApp(host: HTMLElement): Promise<void> {
  host.replaceChildren();
  host.classList.add('sky-rewind-host');
  installSkyRewindStyles();

  const shell = document.createElement('section');
  shell.className = 'sky-rewind';
  shell.innerHTML = `
    <canvas class="sky-rewind__canvas" aria-label="3D sky rewind simulator"></canvas>
    <output class="sky-rewind__fps" aria-label="Frames per second">FPS --</output>
    <form class="sky-rewind__panel">
      <div class="sky-rewind__header">
        <div>
          <p class="sky-rewind__eyebrow">Astronomy prototype</p>
          <h1>Sky Rewind</h1>
        </div>
        <div class="sky-rewind__quick-actions">
          <button name="togglePlay" type="button" aria-label="Play">▶</button>
          <button name="minimize" type="button" aria-label="Minimize controls" aria-expanded="true">-</button>
        </div>
      </div>
      <output class="sky-rewind__status"></output>
      <div class="sky-rewind__body">
        <p class="sky-rewind__copy">A 3D, framework-neutral night-sky simulator for story time jumps.</p>
        <label>UTC date and time <input name="date" type="datetime-local"></label>
        <div class="sky-rewind__grid">
          <label>Latitude <input name="lat" type="number" step="0.0001"></label>
          <label>Longitude <input name="lon" type="number" step="0.0001"></label>
        </div>
        <div class="sky-rewind__grid">
          <label>Rewind years <input name="years" type="number" min="1" max="10000" step="1" value="8"></label>
          <label>Duration sec <input name="duration" type="number" min="1" max="60" step="0.5" value="8"></label>
        </div>
        <fieldset class="sky-rewind__curve">
          <legend>Acceleration curve</legend>
          <label>
            Inertia hold
            <div class="sky-rewind__curve-row">
              <input name="curveInertia" type="range" min="0" max="0.65" step="0.01" value="0.32">
              <output data-curve="inertia">32%</output>
            </div>
          </label>
          <label>
            Movement before launch
            <div class="sky-rewind__curve-row">
              <input name="curveDrift" type="range" min="0" max="2" step="0.0001" value="0.0004">
              <output data-curve="drift">0.0004%</output>
            </div>
          </label>
          <label>
            Acceleration power
            <div class="sky-rewind__curve-row">
              <input name="curvePower" type="range" min="1" max="6" step="0.1" value="3">
              <output data-curve="power">3.0</output>
            </div>
          </label>
        </fieldset>
        <div class="sky-rewind__actions">
          <button name="set" type="submit">Set sky</button>
          <a href="./">Back to game</a>
        </div>
      </div>
    </form>
  `;
  host.appendChild(shell);

  const canvas = requiredElement<HTMLCanvasElement>(shell, 'canvas');
  const fps = requiredElement<HTMLOutputElement>(shell, '.sky-rewind__fps');
  const form = requiredElement<HTMLFormElement>(shell, 'form');
  const dateInput = requiredNamedInput(form, 'date');
  const latInput = requiredNamedInput(form, 'lat');
  const lonInput = requiredNamedInput(form, 'lon');
  const yearsInput = requiredNamedInput(form, 'years');
  const durationInput = requiredNamedInput(form, 'duration');
  const curveInertiaInput = requiredNamedInput(form, 'curveInertia');
  const curveDriftInput = requiredNamedInput(form, 'curveDrift');
  const curvePowerInput = requiredNamedInput(form, 'curvePower');
  const togglePlayButton = requiredElement<HTMLButtonElement>(form, 'button[name="togglePlay"]');
  const minimizeButton = requiredElement<HTMLButtonElement>(form, 'button[name="minimize"]');
  const status = requiredElement<HTMLOutputElement>(form, 'output');
  const curveInertiaValue = requiredElement<HTMLOutputElement>(form, 'output[data-curve="inertia"]');
  const curveDriftValue = requiredElement<HTMLOutputElement>(form, 'output[data-curve="drift"]');
  const curvePowerValue = requiredElement<HTMLOutputElement>(form, 'output[data-curve="power"]');

  const initialDate = new Date(Date.UTC(1844, 4, 22, 18, 30));
  dateInput.value = toDateTimeInput(initialDate);
  latInput.value = '29.5918';
  lonInput.value = '52.5837';

  status.value = 'Loading Hipparcos star catalog...';
  const catalog = await loadStarCatalog();
  status.value = `${catalog.length.toLocaleString()} real Hipparcos stars loaded. Drag to look around, scroll to zoom.`;

  const renderer = new SkyRewindRenderer(canvas, catalog);
  const time = new TimeController(initialDate);
  let location = readLocation(latInput, lonInput);
  let animationFrame = 0;
  let cinematicStrength = 0;
  let lastFrameMs = 0;
  let smoothedFps = 0;
  let lastFpsPaintMs = 0;
  let lastUiPaintMs = 0;

  const applyCurveSettings = (): void => {
    const settings = readCurveSettings(curveInertiaInput, curveDriftInput, curvePowerInput);
    time.setCurve(settings);
    updateCurveLabels(settings, curveInertiaValue, curveDriftValue, curvePowerValue);
  };
  applyCurveSettings();

  const updateFrameRate = (nowMs: number): void => {
    if (lastFrameMs > 0) {
      const instantFps = 1000 / Math.max(1, nowMs - lastFrameMs);
      smoothedFps = smoothedFps === 0 ? instantFps : smoothedFps * 0.88 + instantFps * 0.12;
    }
    lastFrameMs = nowMs;

    if (nowMs - lastFpsPaintMs >= 250 && smoothedFps > 0) {
      fps.value = `${Math.round(smoothedFps)} FPS`;
      lastFpsPaintMs = nowMs;
    }
  };

  const render = (nowMs = performance.now()) => {
    updateFrameRate(nowMs);
    const animating = time.update(nowMs);
    const targetCinematicStrength = animating && !time.isPaused ? time.state.motionStrength : 0;
    const follow = targetCinematicStrength > cinematicStrength ? 0.28 : 0.045;
    cinematicStrength = clamp(cinematicStrength + (targetCinematicStrength - cinematicStrength) * follow, 0, 1);
    const date = time.currentDate;
    renderer.render({ date, location, cinematicStrength, nowMs });
    if (nowMs - lastUiPaintMs >= 100) {
      dateInput.value = toDateTimeInput(date);
      status.value = formatSkyStatus(date, location);
      updateControlState(time, togglePlayButton);
      lastUiPaintMs = nowMs;
    }
    animationFrame = window.requestAnimationFrame(render);
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    location = readLocation(latInput, lonInput);
    time.setDate(fromDateTimeInput(dateInput.value));
    renderer.invalidate();
    applyCurveSettings();
    updateControlState(time, togglePlayButton);
  });
  curveInertiaInput.addEventListener('input', applyCurveSettings);
  curveDriftInput.addEventListener('input', applyCurveSettings);
  curvePowerInput.addEventListener('input', applyCurveSettings);
  togglePlayButton.addEventListener('click', () => {
    if (time.isPaused) {
      time.resume();
      updateControlState(time, togglePlayButton);
      return;
    }

    if (time.isActive) {
      time.pause();
      updateControlState(time, togglePlayButton);
      return;
    }

    location = readLocation(latInput, lonInput);
    const years = numericInput(yearsInput);
    const durationMs = numericInput(durationInput) * 1000;
    time.setDate(fromDateTimeInput(dateInput.value));
    renderer.invalidate();
    applyCurveSettings();
    time.animateTo(decimalYear(time.currentDate) - years, durationMs);
    updateControlState(time, togglePlayButton);
  });
  minimizeButton.addEventListener('click', () => {
    const minimized = form.classList.toggle('sky-rewind__panel--minimized');
    minimizeButton.textContent = minimized ? '+' : '-';
    minimizeButton.setAttribute('aria-label', minimized ? 'Expand controls' : 'Minimize controls');
    minimizeButton.setAttribute('aria-expanded', minimized ? 'false' : 'true');
  });
  window.addEventListener('pagehide', () => {
    window.cancelAnimationFrame(animationFrame);
    renderer.dispose();
  }, { once: true });

  render();
}

function updateControlState(time: TimeController, togglePlayButton: HTMLButtonElement): void {
  if (time.isPaused) {
    togglePlayButton.textContent = '▶';
    togglePlayButton.setAttribute('aria-label', 'Resume');
    return;
  }

  togglePlayButton.textContent = time.isActive ? '❚❚' : '▶';
  togglePlayButton.setAttribute('aria-label', time.isActive ? 'Pause' : 'Play');
}

function readCurveSettings(
  inertiaInput: HTMLInputElement,
  driftInput: HTMLInputElement,
  powerInput: HTMLInputElement,
): TimeCurveSettings {
  return {
    inertiaPortion: numericInput(inertiaInput),
    driftProgress: numericInput(driftInput) / 100,
    power: numericInput(powerInput),
  };
}

function updateCurveLabels(
  settings: TimeCurveSettings,
  inertiaValue: HTMLOutputElement,
  driftValue: HTMLOutputElement,
  powerValue: HTMLOutputElement,
): void {
  inertiaValue.value = `${Math.round(settings.inertiaPortion * 100)}%`;
  driftValue.value = `${formatPercent(settings.driftProgress)}%`;
  powerValue.value = settings.power.toFixed(1);
}

function formatPercent(value: number): string {
  const percent = value * 100;
  return percent < 0.01 ? percent.toFixed(4) : percent.toFixed(2);
}

function formatSkyStatus(date: Date, location: GeographicLocation): string {
  return `${formatUtcDateTime(date)} UTC | ${formatSignedYear(decimalYear(date))} | ${location.name}`;
}

function formatUtcDateTime(date: Date): string {
  const year = date.getUTCFullYear().toString().padStart(4, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function readLocation(latInput: HTMLInputElement, lonInput: HTMLInputElement): GeographicLocation {
  const latitude = numericInput(latInput);
  const longitude = numericInput(lonInput);
  return locationFromDegrees(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, latitude, longitude);
}

function numericInput(input: HTMLInputElement): number {
  const value = Number.parseFloat(input.value);
  if (!Number.isFinite(value)) throw new Error(`Invalid numeric input: ${input.name}`);
  return value;
}

function fromDateTimeInput(value: string): Date {
  const date = new Date(`${value}:00Z`);
  if (!Number.isFinite(date.getTime())) throw new Error(`Invalid date input: ${value}`);
  return date;
}

function toDateTimeInput(date: Date): string {
  const stable = dateFromDecimalYear(decimalYear(date));
  const year = stable.getUTCFullYear().toString().padStart(4, '0');
  const month = (stable.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = stable.getUTCDate().toString().padStart(2, '0');
  const hours = stable.getUTCHours().toString().padStart(2, '0');
  const minutes = stable.getUTCMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function requiredNamedInput(form: HTMLFormElement, name: string): HTMLInputElement {
  const input = form.elements.namedItem(name);
  if (!(input instanceof HTMLInputElement)) throw new Error(`Missing input: ${name}`);
  return input;
}

function requiredElement<T extends Element>(parent: ParentNode, selector: string): T {
  const element = parent.querySelector(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element as T;
}

function installSkyRewindStyles(): void {
  if (document.getElementById('sky-rewind-styles')) return;
  const style = document.createElement('style');
  style.id = 'sky-rewind-styles';
  style.textContent = `
    .sky-rewind-host, .sky-rewind { width: 100%; height: var(--game-viewport-height, 100vh); overflow: hidden; }
    .sky-rewind { position: relative; background: #02050e; color: #d8ecff; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .sky-rewind__canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; cursor: grab; touch-action: none; }
    .sky-rewind__canvas:active { cursor: grabbing; }
    .sky-rewind__fps { position: absolute; top: max(18px, env(safe-area-inset-top)); right: max(18px, env(safe-area-inset-right)); z-index: 2; padding: 7px 10px; border: 1px solid rgba(143, 210, 255, 0.22); border-radius: 999px; background: rgba(2, 6, 16, 0.62); color: #9edcff; font: 700 12px/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; letter-spacing: 0.04em; backdrop-filter: blur(12px); }
    .sky-rewind__panel { position: absolute; top: max(18px, env(safe-area-inset-top)); left: max(18px, env(safe-area-inset-left)); width: min(390px, calc(100vw - 36px)); box-sizing: border-box; padding: 20px; border: 1px solid rgba(143, 210, 255, 0.28); border-radius: 22px; background: linear-gradient(180deg, rgba(4, 11, 25, 0.86), rgba(3, 7, 18, 0.68)); box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45); backdrop-filter: blur(16px); }
    .sky-rewind__panel--minimized { display: flex; align-items: center; gap: 12px; width: min(680px, calc(100vw - 36px)); min-height: 42px; padding: 8px 10px; border-radius: 999px; }
    .sky-rewind__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
    .sky-rewind__panel--minimized .sky-rewind__header { order: 2; flex: 0 0 auto; }
    .sky-rewind__panel--minimized .sky-rewind__header > div:first-child { display: none; }
    .sky-rewind__quick-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
    .sky-rewind__panel--minimized .sky-rewind__quick-actions { flex-wrap: nowrap; gap: 6px; }
    .sky-rewind__body { display: block; }
    .sky-rewind__panel--minimized .sky-rewind__body { display: none; }
    .sky-rewind__eyebrow { margin: 0 0 6px; color: #76d8ff; text-transform: uppercase; letter-spacing: 0.18em; font-size: 11px; }
    .sky-rewind h1 { margin: 0; font-size: clamp(26px, 5vw, 54px); line-height: 0.94; }
    .sky-rewind__copy { margin: 10px 0 18px; color: #9cb4cf; line-height: 1.45; }
    .sky-rewind label { display: grid; gap: 6px; margin: 10px 0; color: #b9d4ee; font-size: 13px; }
    .sky-rewind input { box-sizing: border-box; width: 100%; border: 1px solid rgba(131, 214, 255, 0.28); border-radius: 12px; background: rgba(0, 0, 0, 0.32); color: #eaf7ff; padding: 10px 12px; font: inherit; }
    .sky-rewind__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .sky-rewind__curve { margin: 14px 0 0; padding: 12px; border: 1px solid rgba(131, 214, 255, 0.2); border-radius: 16px; }
    .sky-rewind__curve legend { padding: 0 6px; color: #76d8ff; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; }
    .sky-rewind__curve-row { display: grid; grid-template-columns: 1fr 74px; align-items: center; gap: 10px; }
    .sky-rewind__curve-row output { color: #eaf7ff; font: 700 12px/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; text-align: right; }
    .sky-rewind__actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 16px; }
    .sky-rewind button, .sky-rewind a { border: 0; border-radius: 999px; padding: 11px 15px; background: #83d6ff; color: #04111f; font-weight: 700; text-decoration: none; cursor: pointer; }
    .sky-rewind__panel--minimized button { display: grid; place-items: center; width: 34px; height: 34px; padding: 0; }
    .sky-rewind__quick-actions button:last-child { background: rgba(131, 214, 255, 0.14); color: #d8ecff; }
    .sky-rewind a { background: rgba(131, 214, 255, 0.14); color: #d8ecff; }
    .sky-rewind__status { display: block; margin-top: 14px; color: #76d8ff; font-size: 12px; min-height: 1.4em; }
    .sky-rewind__panel--minimized .sky-rewind__status { order: 1; flex: 1 1 auto; margin: 0; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
    @media (max-width: 640px) {
      .sky-rewind__panel { right: 12px; left: 12px; bottom: max(12px, env(safe-area-inset-bottom)); top: auto; width: auto; padding: 14px; }
      .sky-rewind__copy { display: none; }
    }
  `;
  document.head.appendChild(style);
}
