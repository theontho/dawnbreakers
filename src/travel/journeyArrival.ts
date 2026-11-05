import Phaser from 'phaser';
import { vistaFor } from '../assets/art/vista';
import { chapterById } from '../data/chapters';
import { journeyDeparture, type Journey } from '../data/journeys';
import { TITLE_OPENINGS } from '../data/titleOpenings';
import { chapterLabel, localizedStyle, t } from '../i18n';
import { addSunriseBackground, playSunrise, SUNRISE_DURATION_MS, type SunriseBackground } from '../scenes/titleSunrise';
import { SunriseClock } from '../scenes/titleSunriseClock';
import { glowTitleSun } from '../scenes/titleSunGlow';
import { responsiveFont, safeLayout } from '../ui/responsive';
import type { Party } from './party';
import type { SkyCamera } from './skyCamera';

/**
 * The end of a journey into a chapter: the road's last night gives way to
 * the dawn over the place it leads to, the chapter's own opening as the
 * title shows it. The camera turns from the road toward the sunrise and
 * pulls back; the party shrinks until they are small figures on the near
 * ground, walking on toward the town; then the sun comes up and a card
 * names the chapter. A first skip jumps to the pulled-back dawn, a second
 * goes on into the chapter.
 */

const DAY_MS = 86400000;
/** The move, in ms from its start: the turn, the dawn fading in and pulling back, the party shrinking. */
const TURN_MS = 2400;
const FADE_FROM_MS = 1400;
const FADE_TO_MS = 3200;
const MOVE_MS = 5200;
/** The dawn starts pulled in this much about its horizon, and eases out to its own framing. */
const PUSH_IN = 1.7;
/** The stretch of the title's sunrise the arrival plays, and how fast. */
const DAWN_FROM_MS = 38000;
const DAWN_TO_MS = 96000;
const DAWN_SPEED = 4;
const HOLD_MS = 1800;
/** The party's height at the end, as a share of the screen's. */
const PARTY_HEIGHT = 0.05;
const CARD_DEPTH = 90;
const DAWN_DEPTH = 25;
const PARTY_DEPTH = 30;

export type ArrivalState = 'waiting' | 'moving' | 'settled' | 'done';

export interface ArrivalOptions {
  journey: Journey;
  party: Party | undefined;
  camera: SkyCamera;
  /** A standing person's height in the journey's own frame. */
  figure: number;
  /** Where the bottom controls begin, so the party stands clear of them. */
  controlsTop: () => number;
  onFinished: () => void;
}

export class JourneyArrival {
  private readonly sunrise: SunriseBackground;
  private readonly layer: Phaser.GameObjects.Container;
  private readonly clock: SunriseClock;
  private readonly card: Phaser.GameObjects.Container;
  private stage: ArrivalState = 'waiting';
  private startedAt = 0;
  private fromBearing = 0;
  private finishing?: Phaser.Time.TimerEvent;

  constructor(private readonly scene: Phaser.Scene, private readonly options: ArrivalOptions) {
    const { width, height } = scene.scale;
    const opening = TITLE_OPENINGS[options.journey.to];
    const vista = vistaFor(opening.vista);
    // The dawn after the road's last night, over the place it leads to.
    const lastEvening = new Date(journeyDeparture(options.journey).getTime() + (options.journey.days - 1) * DAY_MS);
    const before = new Set(scene.children.list);
    this.sunrise = addSunriseBackground(scene, width, height, vista, lastEvening);
    const made = scene.children.list.filter(object => !before.has(object));
    this.layer = scene.add.container(0, 0, made).setDepth(DAWN_DEPTH).setVisible(false).setAlpha(0);
    this.clock = new SunriseClock(SUNRISE_DURATION_MS, { positionMs: DAWN_FROM_MS, speed: DAWN_SPEED, playing: false });
    playSunrise(scene, this.sunrise, this.clock, performance.now(), { glow: false });
    this.card = this.addCard(width, height);
    this.clock.onChange(() => {
      if (this.stage === 'settled' && this.clock.position >= DAWN_TO_MS && !this.finishing) {
        this.finishing = scene.time.delayedCall(HOLD_MS, () => this.finish());
      }
    });
  }

  get state(): ArrivalState {
    return this.stage;
  }

  /** True once the dawn covers the whole screen, so the road's sky and land need not be drawn. */
  get covers(): boolean {
    return this.layer.visible && this.layer.alpha >= 1;
  }

  /** Starts the move from the road's view; with `skip`, jumps straight to its end. */
  begin(skip = false): void {
    if (this.stage !== 'waiting') return;
    this.stage = 'moving';
    this.startedAt = performance.now();
    this.fromBearing = this.options.camera.facing;
    this.layer.setVisible(true);
    if (skip) this.settle();
    else this.frame(0);
  }

  /** The skip button: to the pulled-back dawn first, then on. Returns true when it means going on. */
  skip(): boolean {
    if (this.stage === 'waiting') {
      this.begin(true);
      return false;
    }
    if (this.stage === 'moving') {
      this.settle();
      return false;
    }
    return true;
  }

  /** Each frame while the camera moves. */
  update(): void {
    if (this.stage !== 'moving') return;
    const elapsed = performance.now() - this.startedAt;
    if (elapsed >= MOVE_MS) this.settle();
    else this.frame(elapsed);
  }

  private frame(elapsed: number): void {
    const { camera } = this.options;
    const turn = ease(Math.min(1, elapsed / TURN_MS));
    camera.face(this.fromBearing + shortestTurn(this.fromBearing, this.sunrise.dawn.azimuth) * turn);
    const fade = ease(clamp01((elapsed - FADE_FROM_MS) / (FADE_TO_MS - FADE_FROM_MS)));
    const pull = ease(clamp01((elapsed - FADE_FROM_MS) / (MOVE_MS - FADE_FROM_MS)));
    this.layer.setAlpha(fade);
    this.placeDawn(PUSH_IN + (1 - PUSH_IN) * pull);
    this.placeParty(ease(Math.min(1, elapsed / MOVE_MS)));
  }

  /** The end of the move: the dawn in its own framing, the party small in front, the sun coming up. */
  private settle(): void {
    if (this.stage === 'settled' || this.stage === 'done') return;
    this.stage = 'settled';
    this.options.camera.face(this.sunrise.dawn.azimuth);
    this.layer.setVisible(true).setAlpha(1);
    this.placeDawn(1);
    this.placeParty(1);
    glowTitleSun(this.scene, this.sunrise);
    if (!this.clock.isPlaying) this.clock.togglePlay();
    this.scene.tweens.add({ targets: this.card, alpha: 1, duration: 900, delay: 400, ease: 'Sine.easeOut' });
  }

  private finish(): void {
    if (this.stage === 'done') return;
    this.stage = 'done';
    this.options.onFinished();
  }

  /** Scales the dawn about the middle of its horizon. */
  private placeDawn(scale: number): void {
    const ax = this.sunrise.width / 2;
    const ay = this.sunrise.horizonY;
    this.layer.setScale(scale).setPosition(ax * (1 - scale), ay * (1 - scale));
  }

  /** From walking on the road to small figures on the near ground of the dawn, `t` of the way. */
  private placeParty(t: number): void {
    const { party, figure } = this.options;
    if (!party) return;
    const { width, height } = this.scene.scale;
    const from = party.centre();
    const endScale = (height * PARTY_HEIGHT) / figure;
    const end = { x: width * 0.3, y: Math.min(height * 0.88, this.options.controlsTop() - 16) };
    const scale = 1 + (endScale - 1) * t;
    party.setFrame(scale, from, { x: from.x + (end.x - from.x) * t, y: from.y + (end.y - from.y) * t }, PARTY_DEPTH);
  }

  /** "Chapter N · Title" over the place and the moment, as the title screen names them. */
  private addCard(width: number, height: number): Phaser.GameObjects.Container {
    const { journey } = this.options;
    const chapter = chapterById(journey.to);
    const size = { width, height };
    const safe = safeLayout(size);
    const top = safe.y + height * 0.1;
    const heading = this.scene.add.text(width / 2, top, chapter ? `${chapterLabel(chapter.number)} · ${t(chapter.title)}` : '', localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(40, size, 24),
      color: '#f3e2b5',
      align: 'center',
      wordWrap: { width: Math.min(safe.width, 860) },
      shadow: { offsetX: 0, offsetY: 2, color: '#120b05', blur: 10, fill: true, stroke: false },
    }, 'center')).setOrigin(0.5, 0);
    const line = this.scene.add.text(width / 2, heading.y + heading.height + 6, t(TITLE_OPENINGS[journey.to].subtitle), localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(20, size, 15),
      color: '#e2c98f',
      fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: Math.min(safe.width, 720) },
      shadow: { offsetX: 0, offsetY: 2, color: '#120b05', blur: 10, fill: true, stroke: false },
    }, 'center')).setOrigin(0.5, 0);
    return this.scene.add.container(0, 0, [heading, line]).setDepth(CARD_DEPTH).setAlpha(0);
  }
}

/** The signed turn in degrees from one bearing to another, the short way round. */
function shortestTurn(from: number, to: number): number {
  return ((to - from + 540) % 360) - 180;
}

function ease(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
