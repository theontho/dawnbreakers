import { locationFromDegrees } from './astronomy';
import { loadStarCatalog } from './catalog';
import { dateFromDecimalYear, decimalYear, formatSignedYear } from './math';
import { SkyRewindRenderer } from './SkyRewindRenderer';
import { TimeController } from './timeController';
import type { GeographicLocation } from './types';

export async function mountSkyRewindApp(host: HTMLElement): Promise<void> {
  host.replaceChildren();
  host.classList.add('sky-rewind-host');
  installSkyRewindStyles();

  const shell = document.createElement('section');
  shell.className = 'sky-rewind';
  shell.innerHTML = `
    <canvas class="sky-rewind__canvas" aria-label="3D sky rewind simulator"></canvas>
    <form class="sky-rewind__panel">
      <div>
        <p class="sky-rewind__eyebrow">Astronomy prototype</p>
        <h1>Sky Rewind</h1>
        <p class="sky-rewind__copy">A 3D, framework-neutral night-sky simulator for story time jumps.</p>
      </div>
      <label>UTC date and time <input name="date" type="datetime-local"></label>
      <div class="sky-rewind__grid">
        <label>Latitude <input name="lat" type="number" step="0.0001"></label>
        <label>Longitude <input name="lon" type="number" step="0.0001"></label>
      </div>
      <div class="sky-rewind__grid">
        <label>Rewind years <input name="years" type="number" min="1" max="10000" step="1" value="8"></label>
        <label>Duration sec <input name="duration" type="number" min="1" max="60" step="0.5" value="8"></label>
      </div>
      <div class="sky-rewind__actions">
        <button name="set" type="submit">Set sky</button>
        <button name="play" type="button">Play rewind</button>
        <a href="./">Back to game</a>
      </div>
      <output class="sky-rewind__status"></output>
    </form>
  `;
  host.appendChild(shell);

  const canvas = requiredElement<HTMLCanvasElement>(shell, 'canvas');
  const form = requiredElement<HTMLFormElement>(shell, 'form');
  const dateInput = requiredNamedInput(form, 'date');
  const latInput = requiredNamedInput(form, 'lat');
  const lonInput = requiredNamedInput(form, 'lon');
  const yearsInput = requiredNamedInput(form, 'years');
  const durationInput = requiredNamedInput(form, 'duration');
  const playButton = requiredElement<HTMLButtonElement>(form, 'button[name="play"]');
  const status = requiredElement<HTMLOutputElement>(form, 'output');

  const initialDate = new Date(Date.UTC(1844, 4, 22, 18, 30));
  dateInput.value = toDateTimeInput(initialDate);
  latInput.value = '29.5918';
  lonInput.value = '52.5837';

  status.value = 'Loading bright-star catalog...';
  const catalog = await loadStarCatalog();
  status.value = `${catalog.length} catalog stars loaded. Drag to look around, scroll to zoom.`;

  const renderer = new SkyRewindRenderer(canvas, catalog);
  const time = new TimeController(initialDate);
  let location = readLocation(latInput, lonInput);
  let animationFrame = 0;
  let cinematicStrength = 0;

  const render = () => {
    const animating = time.update();
    cinematicStrength = animating
      ? Math.min(1, Math.abs(time.state.speed) / 18)
      : Math.max(0, cinematicStrength - 0.035);
    const date = time.currentDate;
    renderer.render({ date, location, cinematicStrength });
    dateInput.value = toDateTimeInput(date);
    status.value = `${location.name} - ${formatSignedYear(decimalYear(date))}`;
    animationFrame = window.requestAnimationFrame(render);
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    location = readLocation(latInput, lonInput);
    time.setDate(fromDateTimeInput(dateInput.value));
  });
  playButton.addEventListener('click', () => {
    location = readLocation(latInput, lonInput);
    const years = numericInput(yearsInput);
    const durationMs = numericInput(durationInput) * 1000;
    time.setDate(fromDateTimeInput(dateInput.value));
    time.animateTo(decimalYear(time.currentDate) - years, durationMs);
  });
  window.addEventListener('pagehide', () => {
    window.cancelAnimationFrame(animationFrame);
    renderer.dispose();
  }, { once: true });

  render();
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
    .sky-rewind__panel { position: absolute; top: max(18px, env(safe-area-inset-top)); left: max(18px, env(safe-area-inset-left)); width: min(390px, calc(100vw - 36px)); box-sizing: border-box; padding: 20px; border: 1px solid rgba(143, 210, 255, 0.28); border-radius: 22px; background: linear-gradient(180deg, rgba(4, 11, 25, 0.86), rgba(3, 7, 18, 0.68)); box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45); backdrop-filter: blur(16px); }
    .sky-rewind__eyebrow { margin: 0 0 6px; color: #76d8ff; text-transform: uppercase; letter-spacing: 0.18em; font-size: 11px; }
    .sky-rewind h1 { margin: 0; font-size: clamp(32px, 6vw, 54px); line-height: 0.94; }
    .sky-rewind__copy { margin: 10px 0 18px; color: #9cb4cf; line-height: 1.45; }
    .sky-rewind label { display: grid; gap: 6px; margin: 10px 0; color: #b9d4ee; font-size: 13px; }
    .sky-rewind input { box-sizing: border-box; width: 100%; border: 1px solid rgba(131, 214, 255, 0.28); border-radius: 12px; background: rgba(0, 0, 0, 0.32); color: #eaf7ff; padding: 10px 12px; font: inherit; }
    .sky-rewind__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .sky-rewind__actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 16px; }
    .sky-rewind button, .sky-rewind a { border: 0; border-radius: 999px; padding: 11px 15px; background: #83d6ff; color: #04111f; font-weight: 700; text-decoration: none; cursor: pointer; }
    .sky-rewind a { background: rgba(131, 214, 255, 0.14); color: #d8ecff; }
    .sky-rewind__status { display: block; margin-top: 14px; color: #76d8ff; font-size: 12px; min-height: 1.4em; }
    @media (max-width: 640px) {
      .sky-rewind__panel { right: 12px; left: 12px; bottom: max(12px, env(safe-area-inset-bottom)); top: auto; width: auto; padding: 14px; }
      .sky-rewind__copy { display: none; }
    }
  `;
  document.head.appendChild(style);
}
