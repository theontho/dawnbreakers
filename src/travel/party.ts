import Phaser from 'phaser';
import { mix } from '../assets/art/canvasKit';
import type { TravellerKind } from '../data/journeys';
import { drawLitter, drawPack, drawRider, drawWalker, type Hand, type Headwear } from './figures';
import { GLOW_TEXTURE } from './glowTexture';
import type { GroundLayout } from './landscape';
import { drawMount, mountWidth, type MountKind, type Saddle } from './mounts';
import type { SkyLight } from './skyLight';

const MOUNT_OF: Partial<Record<TravellerKind, MountKind>> = {
  mule: 'mule',
  packMule: 'mule',
  rider: 'horse',
  standard: 'horse',
  camel: 'camel',
  litter: 'camel',
};
const HEADWEAR: readonly Headwear[] = ['turban', 'kulah', 'turban'];
const LANTERN = 0xffb45a;

/**
 * The travelling party in silhouette (see `figures.ts` and `mounts.ts`), leader on the right, each walking to
 * the right at their own stride while the land slides past. A carried lantern
 * throws a warm pool of light on the road.
 */
export class Party {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly glows: Phaser.GameObjects.Image[] = [];
  private readonly slots: { kind: TravellerKind; x: number; offset: number }[] = [];

  constructor(scene: Phaser.Scene, members: readonly TravellerKind[], private readonly ground: GroundLayout, width: number) {
    this.graphics = scene.add.graphics().setDepth(10);
    const f = ground.figure;
    const gap = f * 0.2;
    const widths = members.map(kind => {
      const mount = MOUNT_OF[kind];
      return mount ? mountWidth(mount, f) : f * 0.42;
    });
    const total = widths.reduce((sum, w) => sum + w, 0) + gap * Math.max(0, members.length - 1);
    // The leader walks a little right of centre, the rest strung out behind.
    let right = Math.min(width - f * 0.4, width * 0.5 + total / 2 + f * 0.3);
    members.forEach((kind, i) => {
      const w = widths[i]!;
      this.slots.push({ kind, x: right - w / 2, offset: i * 1.9 });
      right -= w + gap;
      if (kind === 'lantern') {
        this.glows.push(scene.add.image(0, 0, GLOW_TEXTURE).setDepth(9).setBlendMode(Phaser.BlendModes.ADD).setTint(LANTERN));
      }
    });
  }

  /** The screen span the party walks in, from the road up past a rider's head. */
  bounds(): { left: number; right: number; top: number } {
    const f = this.ground.figure;
    const xs = this.slots.map(slot => slot.x);
    return { left: Math.min(...xs) - f, right: Math.max(...xs) + f, top: this.ground.roadY - f * 1.8 };
  }

  /** `walked` is the distance covered in pixels at the road. */
  draw(walked: number, light: SkyLight, realMs: number): void {
    const g = this.graphics;
    g.clear();
    const f = this.ground.figure;
    const color = mix(mix(0x020306, 0x141a2a, light.moonlight), 0x2e241c, light.daylight);
    const night = 1 - light.daylight;
    let lantern = 0;
    this.slots.forEach((slot, i) => {
      const mount = MOUNT_OF[slot.kind];
      const stride = mount ? f * 0.9 : f * 0.62;
      const phase = (walked / stride) * Math.PI * 2 + slot.offset;
      const ground = this.ground.roadY + (i % 2) * f * 0.03;
      if (mount) {
        const seat = drawMount(g, mount, slot.x, ground, f, phase, color, slot.kind !== 'packMule');
        this.load(slot.kind, seat, phase, color, realMs);
        return;
      }
      const hand = drawWalker(g, {
        x: slot.x,
        ground,
        f,
        phase,
        color,
        headwear: HEADWEAR[i % HEADWEAR.length]!,
        carrying: slot.kind === 'staff' ? 'staff' : slot.kind === 'lantern' ? 'lantern' : 'none',
        realMs,
      });
      if (slot.kind === 'lantern') this.lantern(this.glows[lantern++]!, hand, f, night, realMs);
    });
  }

  private load(kind: TravellerKind, seat: Saddle, phase: number, color: number, realMs: number): void {
    const f = this.ground.figure;
    if (kind === 'packMule') drawPack(this.graphics, seat, f, color);
    else if (kind === 'litter') drawLitter(this.graphics, seat, f, color);
    else drawRider(this.graphics, seat, f, phase, color, kind === 'standard' ? 'standard' : 'none', realMs);
  }

  private lantern(glow: Phaser.GameObjects.Image, hand: Hand, f: number, night: number, realMs: number): void {
    const flicker = 0.85 + Math.sin(realMs * 0.013) * 0.06 + Math.sin(realMs * 0.031) * 0.05;
    glow.setPosition(hand.x, hand.y).setDisplaySize(f * 2.6, f * 1.9).setAlpha(0.55 * night * flicker);
    this.graphics.fillStyle(0xffd590, 0.4 + 0.6 * night);
    this.graphics.fillRect(hand.x - f * 0.025, hand.y - f * 0.04, f * 0.05, f * 0.07);
  }
}
