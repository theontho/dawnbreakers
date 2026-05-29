import Phaser from 'phaser';
import { makeCharacterTexture, type CharacterTextureOptions } from './characterTexture';

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

    this.makeCharacter('npc-bab', {
      body: 0x2e7d4f,
      skin: 0xf6e8c2,
      clothing: { style: 'cloak', secondary: 0xf0e6c8, accent: 0xc9a55c },
      hat: { style: 'turban', color: 0xf0e6c8, accent: 0x2e7d4f },
      shadow: true,
    });
    this.makeCharacter('npc-traveller', {
      body: 0x4a3a2a,
      skin: 0xd9c79a,
      clothing: { style: 'sash', secondary: 0x6b8a9a, accent: 0xd8c7a0 },
      hat: { style: 'headscarf', color: 0x8a7450 },
      shadow: true,
    });
    this.makeCharacter('npc-merchant', {
      body: 0x8a5a2a,
      skin: 0xe6c89a,
      clothing: { style: 'vest', secondary: 0x3f5f73, accent: 0xc9a55c },
      hat: { style: 'cap', color: 0xb88742 },
      shadow: true,
    });
    this.makeCharacter('npc-mulla', {
      body: 0x1a1a1a,
      skin: 0xeadcb6,
      clothing: { style: 'robe', secondary: 0xf2ead6, accent: 0x7a6a4a },
      hat: { style: 'turban', color: 0xf2ead6, accent: 0x1a1a1a },
      shadow: true,
    });
    this.makeCharacter('player', {
      body: 0x6a3a3a,
      skin: 0xe0c08a,
      clothing: { style: 'sash', secondary: 0xc9a55c, accent: 0xead8aa },
      hat: { style: 'none' },
      hair: 0x2f1d12,
      shadow: true,
    });

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

  /** Character billboard with configurable clothes and headwear. */
  private makeCharacter(key: string, options: CharacterTextureOptions): void {
    makeCharacterTexture(this, key, options);
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
      const boxBottom = bottomR;
      const boxTop = { x: boxBottom.x, y: boxBottom.y - decorH };
      g.fillStyle(dc, 1);
      g.fillPoints([
        { x: boxBottom.x - 14, y: boxBottom.y - 7 },
        { x: boxBottom.x, y: boxBottom.y - 14 },
        { x: boxBottom.x + 14, y: boxBottom.y - 7 },
        boxBottom,
      ], true);
      g.fillStyle(Phaser.Display.Color.IntegerToColor(dc).darken(18).color, 1);
      g.fillPoints([
        { x: boxBottom.x - 14, y: boxBottom.y - 7 },
        boxBottom,
        boxTop,
        { x: boxTop.x - 14, y: boxTop.y - 7 },
      ], true);
      g.fillStyle(Phaser.Display.Color.IntegerToColor(dc).darken(8).color, 1);
      g.fillPoints([
        { x: boxBottom.x + 14, y: boxBottom.y - 7 },
        boxBottom,
        boxTop,
        { x: boxTop.x + 14, y: boxTop.y - 7 },
      ], true);
      g.lineStyle(1, edge, 1);
      g.strokePoints([
        { x: boxTop.x - 14, y: boxTop.y - 7 },
        boxTop,
        { x: boxTop.x + 14, y: boxTop.y - 7 },
        boxBottom,
      ], true);
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
    const beamBottom = top.y - wallH + 2;
    const beamTop = beamBottom - 10;
    g.fillPoints([
      { x: left.x + 4, y: beamBottom },
      { x: top.x, y: beamBottom - 10 },
      { x: right.x - 4, y: beamBottom },
      { x: top.x, y: beamBottom + 10 },
    ], true);
    g.fillStyle(Phaser.Display.Color.IntegerToColor(dark).darken(18).color, 1);
    g.fillPoints([
      { x: left.x + 4, y: beamBottom },
      { x: top.x, y: beamBottom + 10 },
      { x: top.x, y: beamTop + 10 },
      { x: left.x + 4, y: beamTop },
    ], true);
    g.lineStyle(1, 0x000000, 0.7);
    g.strokePoints([
      { x: left.x + 4, y: beamBottom },
      { x: top.x, y: beamBottom - 10 },
      { x: right.x - 4, y: beamBottom },
      { x: top.x, y: beamBottom + 10 },
    ], true);

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
