import Phaser from 'phaser';
import { PAGE_H, PAGE_W, type BookArt } from './titleBookArt';
import type { BookPage, BookSink, V2 } from './titleBookRender';

/**
 * The title book as one WebGL mesh: the five painted pages side by side in
 * one texture with a white patch for the gilt and leather, rebuilt from the
 * pose every frame and drawn by the GPU in a single batch, with the table's
 * shadow as an image under it. The pages are uploaded once; nothing is
 * painted or uploaded per frame, which Safari could not keep up with.
 */

const ATLAS = 'title-book-atlas';
const SHADOW = 'title-book-shadow';
const PAGES: readonly BookPage[] = ['cover', 'endpaper', 'leftPage', 'rightPage', 'leaf'];
/** The white patch after the pages, for faces of one colour. */
const WHITE = 8;
const ATLAS_W = PAGES.length * PAGE_W + WHITE;
const SHADOW_PX = 256;
/** The table shadow is darkest out to this fraction of its radius, then fades. */
const SHADOW_CORE = 0.2;

export class BookMesh implements BookSink {
  private readonly mesh: Phaser.GameObjects.Mesh;
  private readonly shade: Phaser.GameObjects.Image;
  private readonly vertices: number[] = [];
  private readonly uvs: number[] = [];
  private readonly colours: number[] = [];
  private readonly indices: number[] = [];

  constructor(private readonly scene: Phaser.Scene, art: BookArt, depth: number) {
    paintAtlas(scene, art);
    paintShadow(scene);
    this.shade = scene.add.image(0, 0, SHADOW).setDepth(depth);
    this.mesh = scene.add.mesh(0, 0, ATLAS).setDepth(depth);
    // Vertices are given in screen pixels, y up, as the orthographic view maps them 1:1.
    this.mesh.setOrtho(this.mesh.width, this.mesh.height);
    this.mesh.hideCCW = false;
  }

  /** Starts a frame of the book at this opacity. */
  begin(alpha: number): void {
    this.vertices.length = this.uvs.length = this.colours.length = this.indices.length = 0;
    this.mesh.setAlpha(alpha);
    this.shade.setAlpha(alpha);
  }

  /** Hands the frame's faces to the GPU. */
  end(): void {
    this.mesh.clear();
    this.mesh.addVertices(this.vertices, this.uvs, this.indices, false, undefined, this.colours);
    // The scene's own pre-update has already run this frame; project the new faces now.
    (this.mesh as unknown as { preUpdate(): void }).preUpdate();
  }

  destroy(): void {
    this.mesh.destroy();
    this.shade.destroy();
    for (const key of [ATLAS, SHADOW]) if (this.scene.textures.exists(key)) this.scene.textures.remove(key);
  }

  shadow(x: number, y: number, radius: number): void {
    this.shade.setPosition(x, y).setDisplaySize(radius * 2, radius * 2);
  }

  surface(page: BookPage, at: (u: number, v: number) => V2, cols: number, rows: number, shade: number, uRange: readonly [number, number]): void {
    const left = PAGES.indexOf(page) * PAGE_W;
    // Lit pages warm a little as they dim, as the old shade over them did.
    const k = 1 - (1 - shade) * 0.9;
    const tint = rgb(k, k * 0.97, k * 0.92);
    const first = this.vertices.length / 2;
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const u = c / cols;
        const v = r / rows;
        const p = at(u, v);
        const tu = uRange[0] + (uRange[1] - uRange[0]) * u;
        this.vertex(p, (left + tu * PAGE_W) / ATLAS_W, v, tint);
      }
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const a = first + r * (cols + 1) + c;
        const b = a + 1;
        const d = a + cols + 1;
        const e = d + 1;
        this.indices.push(a, b, e, a, e, d);
      }
    }
  }

  polygon(points: readonly V2[], colour: number, shade: number): void {
    const first = this.vertices.length / 2;
    const tint = rgb(((colour >> 16) & 0xff) / 255 * shade, ((colour >> 8) & 0xff) / 255 * shade, (colour & 0xff) / 255 * shade);
    const u = (PAGES.length * PAGE_W + WHITE / 2) / ATLAS_W;
    for (const p of points) this.vertex(p, u, 0.5, tint);
    for (let i = 1; i < points.length - 1; i++) this.indices.push(first, first + i, first + i + 1);
  }

  private vertex(p: V2, u: number, v: number, tint: number): void {
    this.vertices.push(p.x, -p.y);
    this.uvs.push(u, v);
    this.colours.push(tint);
  }
}

function rgb(r: number, g: number, b: number): number {
  const byte = (x: number) => Math.round(Math.min(1, Math.max(0, x)) * 255);
  return (byte(r) << 16) | (byte(g) << 8) | byte(b);
}

function paintAtlas(scene: Phaser.Scene, art: BookArt): void {
  if (scene.textures.exists(ATLAS)) scene.textures.remove(ATLAS);
  const texture = scene.textures.createCanvas(ATLAS, ATLAS_W, PAGE_H)!;
  const ctx = texture.context;
  PAGES.forEach((page, i) => ctx.drawImage(art[page], i * PAGE_W, 0));
  ctx.fillStyle = '#fff';
  ctx.fillRect(PAGES.length * PAGE_W, 0, WHITE, PAGE_H);
  texture.refresh();
}

function paintShadow(scene: Phaser.Scene): void {
  if (scene.textures.exists(SHADOW)) return;
  const texture = scene.textures.createCanvas(SHADOW, SHADOW_PX, SHADOW_PX)!;
  const ctx = texture.context;
  const half = SHADOW_PX / 2;
  const g = ctx.createRadialGradient(half, half, half * SHADOW_CORE, half, half, half);
  g.addColorStop(0, 'rgba(0,0,0,0.45)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SHADOW_PX, SHADOW_PX);
  texture.refresh();
}
