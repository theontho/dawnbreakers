import type { GlossaryEntry } from '../../data/glossary';
import { localizedFont, rtl, t } from '../../i18n';
import { glossaryMapSvg } from './glossaryMap';

/**
 * The glossary card: a small parchment panel near the word, with the
 * entry's name, what kind of thing it is, a sentence or two, and for places
 * a map. Hovering shows it while the pointer rests on the word; a tap pins
 * it until the next tap anywhere.
 */

export interface Anchor {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const STYLE_ID = 'glossary-tip-style';
let tip: HTMLDivElement | undefined;
let shownId: string | undefined;
let pinned = false;
let hideTimer = 0;

const KIND_LABEL = { term: 'Word', person: 'Person', place: 'Place', region: 'Province' } as const;

function ensureElement(): HTMLDivElement {
  if (tip) return tip;
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .gloss-tip { position: fixed; z-index: 50; max-width: min(300px, calc(100vw - 24px)); padding: 10px 12px 12px;
        background: #f3e6c4; color: #2a1c10; border: 1px solid #8a6a3a; border-radius: 6px;
        box-shadow: 0 6px 24px rgba(0,0,0,0.45); font-size: 14px; line-height: 1.45; pointer-events: auto; }
      .gloss-tip[hidden] { display: none; }
      .gloss-tip h3 { margin: 0; font-size: 17px; font-weight: 600; color: #4a2a10; }
      .gloss-tip .gloss-kind { font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: #8a6a3a; margin: 1px 0 6px; }
      .gloss-tip p { margin: 0; }
      .gloss-tip .gloss-map { display: block; max-width: 100%; height: auto; margin-top: 8px; border: 1px solid #b89a68; border-radius: 3px; }
    `;
    document.head.appendChild(style);
  }
  tip = document.createElement('div');
  tip.className = 'gloss-tip';
  tip.hidden = true;
  tip.setAttribute('role', 'tooltip');
  tip.addEventListener('pointerenter', () => window.clearTimeout(hideTimer));
  tip.addEventListener('pointerleave', () => scheduleHide());
  document.body.appendChild(tip);
  // A pinned card closes on the next tap outside it.
  document.addEventListener('pointerdown', event => {
    if (pinned && tip && !tip.contains(event.target as Node)) window.setTimeout(() => hideGlossaryTip(), 0);
  }, true);
  return tip;
}

function escape(text: string): string {
  return text.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}

/** Show `entry` next to `anchor` (page pixels). `pin` keeps it open until the next tap. */
export function showGlossaryTip(entry: GlossaryEntry, anchor: Anchor, pin: boolean): void {
  const el = ensureElement();
  window.clearTimeout(hideTimer);
  if (shownId !== entry.id) {
    el.dir = rtl ? 'rtl' : 'ltr';
    el.style.fontFamily = localizedFont();
    el.innerHTML = `<h3>${escape(t(entry.title))}</h3><div class="gloss-kind">${escape(t(KIND_LABEL[entry.kind]))}</div>`
      + `<p>${escape(t(entry.body))}</p>${entry.kind === 'place' || entry.kind === 'region' ? glossaryMapSvg(entry) : ''}`;
    shownId = entry.id;
  }
  pinned = pin || pinned;
  el.hidden = false;
  // Below the word if it fits, otherwise above; kept inside the window.
  const box = el.getBoundingClientRect();
  const margin = 8;
  const below = anchor.bottom + margin;
  const top = below + box.height <= window.innerHeight - margin ? below : Math.max(margin, anchor.top - margin - box.height);
  const centre = (anchor.left + anchor.right) / 2;
  const left = Math.min(window.innerWidth - margin - box.width, Math.max(margin, centre - box.width / 2));
  el.style.top = `${top}px`;
  el.style.left = `${left}px`;
}

/** Hide soon, unless the pointer moves onto the card or another word first. */
export function scheduleHide(): void {
  if (pinned) return;
  window.clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => hideGlossaryTip(), 220);
}

export function hideGlossaryTip(): void {
  window.clearTimeout(hideTimer);
  pinned = false;
  shownId = undefined;
  if (tip) tip.hidden = true;
}
