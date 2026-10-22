import { localizedFont, rtl, t } from '../i18n';

/**
 * The artwork of the title book, painted once onto canvases that the
 * renderer maps onto its moving surfaces: a tooled leather cover with the
 * title in gold, marbled endpapers, an illuminated opening spread, and the
 * plain leaves that flutter across. The "script" is decorative strokes, never
 * real text.
 */

export interface BookArt {
  cover: HTMLCanvasElement;
  endpaper: HTMLCanvasElement;
  leftPage: HTMLCanvasElement;
  rightPage: HTMLCanvasElement;
  leaf: HTMLCanvasElement;
}

/** Texture resolution of one page; the book is drawn smaller than this. */
export const PAGE_W = 512;
export const PAGE_H = 704;

const GOLD = '#d9b25a';
const GOLD_DARK = '#8a6a2a';
const LAPIS = '#26407a';
const PAPER = '#efe2bf';

export function paintBookArt(): BookArt {
  return {
    cover: canvas(ctx => paintCover(ctx)),
    endpaper: canvas(ctx => paintEndpaper(ctx)),
    leftPage: canvas(ctx => paintFrontispiece(ctx)),
    rightPage: canvas(ctx => paintTextPage(ctx, 7, true)),
    leaf: canvas(ctx => paintTextPage(ctx, 31, false)),
  };
}

function canvas(paint: (ctx: CanvasRenderingContext2D) => void): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = PAGE_W;
  c.height = PAGE_H;
  paint(c.getContext('2d')!);
  return c;
}

function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let x = s;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function paintCover(ctx: CanvasRenderingContext2D): void {
  const g = ctx.createRadialGradient(PAGE_W * 0.4, PAGE_H * 0.35, 40, PAGE_W / 2, PAGE_H / 2, PAGE_H * 0.75);
  g.addColorStop(0, '#6e2a1c');
  g.addColorStop(1, '#3a120c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);
  // Grain of the leather.
  const rand = rng(3);
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = rand() < 0.5 ? 'rgba(0,0,0,0.12)' : 'rgba(255,200,160,0.05)';
    ctx.fillRect(rand() * PAGE_W, rand() * PAGE_H, 1.5, 1.5);
  }
  // Tooled borders: a double gold rule and a chain of small stamps.
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.strokeRect(26, 26, PAGE_W - 52, PAGE_H - 52);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(40, 40, PAGE_W - 80, PAGE_H - 80);
  ctx.fillStyle = GOLD;
  for (let x = 52; x < PAGE_W - 48; x += 14) {
    dot(ctx, x, 33, 2.2);
    dot(ctx, x, PAGE_H - 33, 2.2);
  }
  for (let y = 52; y < PAGE_H - 48; y += 14) {
    dot(ctx, 33, y, 2.2);
    dot(ctx, PAGE_W - 33, y, 2.2);
  }
  // Corner pieces and the central shamsa, the sunburst medallion.
  for (const [x, y, sx, sy] of [[40, 40, 1, 1], [PAGE_W - 40, 40, -1, 1], [40, PAGE_H - 40, 1, -1], [PAGE_W - 40, PAGE_H - 40, -1, -1]] as const) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 70 * sx, y);
    ctx.quadraticCurveTo(x + 40 * sx, y + 40 * sy, x, y + 70 * sy);
    ctx.closePath();
    ctx.fillStyle = 'rgba(217,178,90,0.85)';
    ctx.fill();
  }
  shamsa(ctx, PAGE_W / 2, PAGE_H * 0.42, 120, '#5a1e14');
  // The title in gold, below the medallion.
  ctx.fillStyle = GOLD;
  ctx.textAlign = 'center';
  ctx.direction = rtl ? 'rtl' : 'ltr';
  ctx.font = `600 40px ${localizedFont()}`;
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowOffsetY = 2;
  ctx.fillText(t('The Dawn-Breakers'), PAGE_W / 2, PAGE_H * 0.74, PAGE_W - 120);
  ctx.shadowColor = 'transparent';
}

/** A sunburst medallion: scalloped gold disc, lapis field, arabesque rosette. */
function shamsa(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, field: string): void {
  ctx.beginPath();
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    const rr = r * (i % 2 ? 0.9 : 1);
    ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 1.25);
  }
  ctx.fillStyle = GOLD;
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.8, r, 0, 0, Math.PI * 2);
  ctx.fillStyle = field;
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(cx + Math.cos(a) * r * 0.38, cy + Math.sin(a) * r * 0.48, r * 0.3, r * 0.14, a, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.22, r * 0.27, 0, 0, Math.PI * 2);
  ctx.fillStyle = GOLD;
  ctx.fill();
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** Ebru marbling: combed swirls of indigo, ochre and rose on cream. */
function paintEndpaper(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#e8dcc0';
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);
  const rand = rng(11);
  const colours = ['rgba(38,64,122,0.55)', 'rgba(184,120,48,0.5)', 'rgba(150,60,70,0.4)', 'rgba(40,90,90,0.45)'];
  for (let i = 0; i < 70; i++) {
    const x = rand() * PAGE_W;
    const y = rand() * PAGE_H;
    ctx.fillStyle = colours[i % colours.length]!;
    ctx.beginPath();
    ctx.ellipse(x, y, 20 + rand() * 50, 14 + rand() * 30, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  // Comb the drops into flowing veins.
  const image = ctx.getImageData(0, 0, PAGE_W, PAGE_H);
  const out = ctx.createImageData(PAGE_W, PAGE_H);
  for (let y = 0; y < PAGE_H; y++) {
    for (let x = 0; x < PAGE_W; x++) {
      const sx = Math.min(PAGE_W - 1, Math.max(0, Math.round(x + Math.sin(y * 0.045) * 26 + Math.sin(y * 0.011 + x * 0.02) * 12)));
      const sy = Math.min(PAGE_H - 1, Math.max(0, Math.round(y + Math.sin(x * 0.03) * 18)));
      const i = (y * PAGE_W + x) * 4;
      const j = (sy * PAGE_W + sx) * 4;
      out.data[i] = image.data[j]!;
      out.data[i + 1] = image.data[j + 1]!;
      out.data[i + 2] = image.data[j + 2]!;
      out.data[i + 3] = 255;
    }
  }
  ctx.putImageData(out, 0, 0);
}

function paper(ctx: CanvasRenderingContext2D, seed: number): void {
  const g = ctx.createRadialGradient(PAGE_W / 2, PAGE_H / 2, PAGE_W * 0.2, PAGE_W / 2, PAGE_H / 2, PAGE_H * 0.7);
  g.addColorStop(0, PAPER);
  g.addColorStop(1, '#d9c597');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);
  const rand = rng(seed);
  for (let i = 0; i < 1800; i++) {
    ctx.fillStyle = `rgba(120,90,40,${0.04 + rand() * 0.05})`;
    ctx.fillRect(rand() * PAGE_W, rand() * PAGE_H, 1.2, 1.2);
  }
}

/** The jadval: ruled frame lines in gold, lapis and red round the text block. */
function rules(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  for (const [inset, colour, width] of [[0, GOLD, 4], [6, LAPIS, 1.5], [10, '#a8322a', 1], [14, GOLD_DARK, 1]] as const) {
    ctx.strokeStyle = colour;
    ctx.lineWidth = width;
    ctx.strokeRect(x + inset, y + inset, w - inset * 2, h - inset * 2);
  }
}

/** Lines of flowing strokes that read as nastaʿlīq at a glance and say nothing. */
function script(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, lines: number, gap: number, seed: number): void {
  const rand = rng(seed);
  ctx.strokeStyle = 'rgba(30,22,16,0.85)';
  ctx.lineCap = 'round';
  for (let l = 0; l < lines; l++) {
    const baseline = y + l * gap;
    let u = x + w - rand() * 10;
    while (u > x + 8) {
      const word = 16 + rand() * 40;
      ctx.lineWidth = 1.6 + rand() * 1.4;
      ctx.beginPath();
      ctx.moveTo(u, baseline - rand() * 6);
      for (let k = 0; k < 4; k++) {
        const nx = u - word * (k + 1) / 4;
        ctx.quadraticCurveTo(nx + word / 8, baseline - 10 - rand() * 12, nx, baseline + rand() * 4 - 2);
      }
      ctx.stroke();
      if (rand() < 0.5) {
        ctx.fillStyle = 'rgba(30,22,16,0.85)';
        dot(ctx, u - word * rand(), baseline - 16 - rand() * 6, 1.6);
      }
      u -= word + 8 + rand() * 10;
    }
  }
}

/** The left page of the opening spread: a full illuminated frontispiece. */
function paintFrontispiece(ctx: CanvasRenderingContext2D): void {
  paper(ctx, 5);
  rules(ctx, 48, 56, PAGE_W - 96, PAGE_H - 112);
  ctx.fillStyle = LAPIS;
  ctx.fillRect(72, 80, PAGE_W - 144, PAGE_H - 160);
  ctx.fillStyle = 'rgba(217,178,90,0.9)';
  const rand = rng(9);
  for (let i = 0; i < 260; i++) dot(ctx, 76 + rand() * (PAGE_W - 152), 84 + rand() * (PAGE_H - 168), 1.4);
  shamsa(ctx, PAGE_W / 2, PAGE_H / 2, 130, '#8a2a20');
}

/** A page of text; the opening right page carries an illuminated headpiece. */
function paintTextPage(ctx: CanvasRenderingContext2D, seed: number, headpiece: boolean): void {
  paper(ctx, seed);
  rules(ctx, 48, 56, PAGE_W - 96, PAGE_H - 112);
  let top = 96;
  if (headpiece) {
    // The ʿunwān: a gold and lapis panel with a cartouche.
    ctx.fillStyle = LAPIS;
    ctx.fillRect(72, 80, PAGE_W - 144, 120);
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.ellipse(PAGE_W / 2, 140, 130, 38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PAPER;
    ctx.beginPath();
    ctx.ellipse(PAGE_W / 2, 140, 118, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    script(ctx, PAGE_W / 2 - 90, 150, 180, 1, 0, seed + 1);
    ctx.fillStyle = GOLD;
    for (let x = 80; x < PAGE_W - 76; x += 18) {
      dot(ctx, x, 88, 3);
      dot(ctx, x, 192, 3);
    }
    top = 240;
  }
  script(ctx, 80, top, PAGE_W - 160, Math.floor((PAGE_H - 96 - top) / 34), 34, seed);
}
