import Phaser from 'phaser';

/**
 * Generates simple placeholder textures procedurally so the game runs with
 * no external art assets. Real sprite work can replace these later.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    this.makeIsoTile('tile-stone', 0x6b5a44, 0x4a3d2e);
    this.makeIsoTile('tile-path', 0x9c8458, 0x6d5b3b);
    this.makeIsoTile('tile-grass', 0x4a6b3a, 0x33502a);
    this.makeIsoTile('tile-door', 0x3a2a1a, 0x1c130a);

    this.makeIsoTile('tile-water', 0x2c4a6b, 0x1a3050);
    this.makeIsoTile('tile-sand', 0xb89968, 0x856b42);

    this.makeCharacter('npc-bab',       0x2e7d4f, 0xf6e8c2);
    this.makeCharacter('npc-traveller', 0x4a3a2a, 0xd9c79a);
    this.makeCharacter('npc-merchant',  0x8a5a2a, 0xe6c89a);
    this.makeCharacter('npc-mulla',     0x1a1a1a, 0xeadcb6);
    this.makeCharacter('player',        0x6a3a3a, 0xe0c08a);

    this.makeIsoBuilding('house',  2, 0xb0884e, 0x6b4824, 'none');
    this.makeIsoBuilding('mosque', 2, 0xd9c79a, 0x8b6a3a, 'dome', 0x4a7a9a);
    this.makeIsoBuilding('stall',  1, 0xa07040, 0x6a3a1a, 'box',  0xc05030);
    this.makeIsoGate('gate');
    this.makeTree('tree');
    this.makeWell('well');

    this.scene.start('Title');
  }

  /** Diamond isometric tile, 64x32. */
  private makeIsoTile(key: string, fill: number, edge: number): void {
    const w = 64, h = 32;
    const g = this.add.graphics();
    g.fillStyle(fill, 1);
    g.lineStyle(1, edge, 1);
    g.beginPath();
    g.moveTo(w / 2, 0);
    g.lineTo(w, h / 2);
    g.lineTo(w / 2, h);
    g.lineTo(0, h / 2);
    g.closePath();
    g.fillPath();
    g.strokePath();
    g.generateTexture(key, w, h);
    g.destroy();
  }

  /** Simple character billboard, 24x40 (body + head). */
  private makeCharacter(key: string, body: number, head: number): void {
    const w = 24, h = 40;
    const g = this.add.graphics();
    g.fillStyle(body, 1);
    g.fillRoundedRect(4, 16, 16, 22, 3);
    g.fillStyle(head, 1);
    g.fillCircle(w / 2, 10, 7);
    g.lineStyle(1, 0x000000, 0.6);
    g.strokeRoundedRect(4, 16, 16, 22, 3);
    g.strokeCircle(w / 2, 10, 7);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  /**
   * Generates an isometric box-shaped building texture sized to a square
   * footprint of `cells × cells` tiles. The texture's bottom-center vertex
   * corresponds to the front corner of the footprint, so it can be anchored
   * with origin (0.5, 1) at the front tile's bottom vertex.
   */
  private makeIsoBuilding(
    key: string,
    cells: number,
    wallColor: number,
    roofColor: number,
    decor: 'none' | 'dome' | 'box',
    decorColor?: number,
  ): void {
    const TILE_W = 64, TILE_H = 32;
    const baseW = cells * TILE_W;
    const baseH = cells * TILE_H;
    const wallH = 30 + cells * 18;
    const decorH = decor === 'dome' ? Math.round(baseW * 0.28) : decor === 'box' ? 14 : 0;
    const texW = baseW;
    const texH = baseH + wallH + decorH;

    // Base diamond corners (on the ground)
    const top    = { x: texW / 2, y: texH - baseH };
    const right  = { x: texW,     y: texH - baseH / 2 };
    const bottom = { x: texW / 2, y: texH };
    const left   = { x: 0,        y: texH - baseH / 2 };
    // Roof diamond corners (raised by wallH)
    const topR    = { x: top.x,    y: top.y    - wallH };
    const rightR  = { x: right.x,  y: right.y  - wallH };
    const bottomR = { x: bottom.x, y: bottom.y - wallH };
    const leftR   = { x: left.x,   y: left.y   - wallH };

    const wallLit   = wallColor;
    const wallShade = Phaser.Display.Color.IntegerToColor(wallColor)
      .darken(25).color;
    const edge = 0x2a1a0a;

    const g = this.add.graphics();
    g.lineStyle(1, edge, 1);

    // Right (south-east) wall — lit side
    g.fillStyle(wallLit, 1);
    g.fillPoints([right, bottom, bottomR, rightR], true);
    g.strokePoints([right, bottom, bottomR, rightR], true);

    // Left (south-west) wall — shaded side
    g.fillStyle(wallShade, 1);
    g.fillPoints([left, bottom, bottomR, leftR], true);
    g.strokePoints([left, bottom, bottomR, leftR], true);

    // Roof (flat top diamond)
    g.fillStyle(roofColor, 1);
    g.fillPoints([topR, rightR, bottomR, leftR], true);
    g.strokePoints([topR, rightR, bottomR, leftR], true);

    // Door on the right (lit) wall — drawn as a tilted quad on its surface
    const doorH = Math.min(28, wallH - 6);
    const tA = 0.45, tB = 0.62;
    const along = (t: number) => ({
      x: right.x + (bottom.x - right.x) * t,
      y: right.y + (bottom.y - right.y) * t,
    });
    const f1 = along(tA), f2 = along(tB);
    const t1 = { x: f1.x, y: f1.y - doorH };
    const t2 = { x: f2.x, y: f2.y - doorH };
    g.fillStyle(0x1c130a, 1);
    g.fillPoints([f1, f2, t2, t1], true);
    g.strokePoints([f1, f2, t2, t1], true);

    // Decoration on roof
    if (decor === 'dome') {
      const dc = decorColor ?? 0x4a7a9a;
      const cx = texW / 2;
      const cy = (topR.y + bottomR.y) / 2;
      g.fillStyle(dc, 1);
      g.fillEllipse(cx, cy - decorH / 4, decorH * 1.6, decorH * 1.4);
      g.strokeEllipse(cx, cy - decorH / 4, decorH * 1.6, decorH * 1.4);
      // small finial
      g.fillStyle(0xc9a55c, 1);
      g.fillRect(cx - 1, cy - decorH, 2, decorH / 2);
    } else if (decor === 'box') {
      const dc = decorColor ?? wallColor;
      g.fillStyle(dc, 1);
      g.fillRect(texW / 2 - 10, topR.y - decorH, 20, decorH);
      g.strokeRect(texW / 2 - 10, topR.y - decorH, 20, decorH);
    }

    g.generateTexture(key, texW, texH);
    g.destroy();
  }

  /** A simple isometric city gate: two pillars + a beam over the front tile. */
  private makeIsoGate(key: string): void {
    const TILE_W = 64, TILE_H = 32;
    const cells = 1;
    const baseW = cells * TILE_W;
    const baseH = cells * TILE_H;
    const wallH = 70;
    const texW = baseW;
    const texH = baseH + wallH + 10;

    const top    = { x: texW / 2, y: texH - baseH };
    const right  = { x: texW,     y: texH - baseH / 2 };
    const bottom = { x: texW / 2, y: texH };
    const left   = { x: 0,        y: texH - baseH / 2 };

    const wall = 0x6a5030;
    const dark = 0x3a2818;

    const g = this.add.graphics();
    g.lineStyle(1, 0x000000, 0.7);

    // Right pillar (between `right` and `bottom`)
    const rPillarBase = [
      { x: right.x - 6,  y: right.y + 3 },
      { x: right.x,      y: right.y + 6 },
      { x: bottom.x + 6, y: bottom.y - 6 },
      { x: bottom.x,     y: bottom.y - 9 },
    ];
    g.fillStyle(wall, 1);
    g.fillPoints(rPillarBase, true);
    g.fillPoints(rPillarBase.map(p => ({ x: p.x, y: p.y - wallH })), true);
    // vertical sides of right pillar
    g.fillPoints([
      rPillarBase[1], rPillarBase[2],
      { x: rPillarBase[2].x, y: rPillarBase[2].y - wallH },
      { x: rPillarBase[1].x, y: rPillarBase[1].y - wallH },
    ], true);

    // Left pillar (between `left` and `bottom`)
    const lPillarBase = [
      { x: left.x + 6,    y: left.y + 3 },
      { x: left.x,        y: left.y + 6 },
      { x: bottom.x - 6,  y: bottom.y - 6 },
      { x: bottom.x,      y: bottom.y - 9 },
    ];
    g.fillStyle(Phaser.Display.Color.IntegerToColor(wall).darken(20).color, 1);
    g.fillPoints(lPillarBase, true);
    g.fillPoints(lPillarBase.map(p => ({ x: p.x, y: p.y - wallH })), true);
    g.fillPoints([
      lPillarBase[1], lPillarBase[2],
      { x: lPillarBase[2].x, y: lPillarBase[2].y - wallH },
      { x: lPillarBase[1].x, y: lPillarBase[1].y - wallH },
    ], true);

    // Lintel beam joining the two pillars at the top
    g.fillStyle(dark, 1);
    g.fillRect(2, top.y - wallH - 6, texW - 4, 10);
    g.strokeRect(2, top.y - wallH - 6, texW - 4, 10);

    g.generateTexture(key, texW, texH);
    g.destroy();
  }

  /** A small isometric tree on a single tile (canopy + trunk). */
  private makeTree(key: string): void {
    const w = 56, h = 80;
    const g = this.add.graphics();
    // trunk
    g.fillStyle(0x4a2e18, 1);
    g.fillRect(w / 2 - 4, h - 28, 8, 22);
    g.lineStyle(1, 0x1c130a, 0.7);
    g.strokeRect(w / 2 - 4, h - 28, 8, 22);
    // canopy
    g.fillStyle(0x2f6b3a, 1);
    g.fillCircle(w / 2 - 8, h - 42, 20);
    g.fillCircle(w / 2 + 8, h - 46, 18);
    g.fillCircle(w / 2,     h - 56, 22);
    g.fillStyle(0x3f7a4a, 1);
    g.fillCircle(w / 2 - 6, h - 50, 12);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  /** A small isometric well. */
  private makeWell(key: string): void {
    const w = 48, h = 56;
    const g = this.add.graphics();
    // stone rim (ellipse to look iso)
    g.fillStyle(0x7a6a4a, 1);
    g.fillEllipse(w / 2, h - 12, 40, 18);
    g.lineStyle(1, 0x2a1a0a, 1);
    g.strokeEllipse(w / 2, h - 12, 40, 18);
    // water inside
    g.fillStyle(0x2c4a6b, 1);
    g.fillEllipse(w / 2, h - 14, 28, 12);
    // posts + roof
    g.fillStyle(0x4a2e18, 1);
    g.fillRect(w / 2 - 18, h - 50, 4, 38);
    g.fillRect(w / 2 + 14, h - 50, 4, 38);
    g.fillStyle(0x8b6a3a, 1);
    g.fillTriangle(w / 2 - 22, h - 46, w / 2, h - 56, w / 2 + 22, h - 46);
    g.strokeTriangle(w / 2 - 22, h - 46, w / 2, h - 56, w / 2 + 22, h - 46);
    g.generateTexture(key, w, h);
    g.destroy();
  }
}
