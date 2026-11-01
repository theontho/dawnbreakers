import Phaser from 'phaser';
import { playMusic, setSoundscape } from '../audio';
import { JOURNEYS, journeyDeparture, type Journey } from '../data/journeys';
import { rtl, t } from '../i18n';
import { localSiderealTime, locationFromDegrees } from '../sky/projection';
import { skyBodies, type SkyBodies } from '../sky/skyBodies';
import type { GeographicLocation } from '../sky/types';
import { restartSceneOnResize } from '../ui/responsive';
import { firstSunEvent, type SunEvent } from '../travel/firstSunEvent';
import { JourneyClock } from '../travel/journeyClock';
import { JourneyHud, type HudButton } from '../travel/journeyHud';
import { JourneyPassage, dayOfJourney } from '../travel/journeyPassage';
import { SECONDS_PER_DAY_STEPS, VIEWER_SECONDS_PER_DAY } from '../travel/roadCurve';
import { Landscape, groundLayout, type GroundLayout } from '../travel/landscape';
import { Party } from '../travel/party';
import { Sea } from '../travel/sea';
import { SkyCamera } from '../travel/skyCamera';
import { blendSkyLights, skyLightFor, type SkyLight } from '../travel/skyLight';
import { SkyGlows } from '../travel/skyGlows';
import { SkyPainter, TRAIL_MODES, type TrailMode } from '../travel/skyPainter';
import { starFieldFor, type StarField } from '../travel/travelStars';

/** Where to go once a journey played between chapters is over. */
export interface JourneyOnward {
  scene: string;
  spawnX?: number;
  spawnY?: number;
}

/** How the viewer was set, carried across a restart for the next journey or a resize. */
interface ViewerSettings {
  rateIndex: number;
  direction: 1 | -1;
  playing: boolean;
  trails: TrailMode;
  /** Quarter turns away from the journey's own facing. */
  turn: number;
  /** Facing where the sun first rises or sets after the road sets out, instead of the road's facing. */
  centerSun: boolean;
  /** Playing each road as the game does between chapters, and going on to the next. */
  autoplay: boolean;
  /** Real seconds each day takes while the days between roll by. */
  secondsPerDay: number;
  /** The most frames a second the sky is drawn: 120 for fast stars on a screen that can show them, 60 to save power. */
  maxHz: FrameRate;
}

type FrameRate = 60 | 120;

export interface JourneyLaunch {
  [key: string]: unknown;
  journeyId?: string;
  /** Set when the journey plays between chapters: it runs once along the road and goes on. */
  onward?: JourneyOnward;
  settings?: ViewerSettings;
}

const PASSAGE_HOLD_MS = 1600;
/** How much of the screen's height is sky, above the horizon. */
const SKY_SHARE = 0.7;
/** Real seconds of sky the light is blended over when time runs fast, and how many moments are taken. */
const BLUR_SECONDS = 0.4;
const BLUR_SAMPLES = 7;
const FACINGS: readonly { label: string }[] = [
  { label: 'Facing north' },
  { label: 'Facing east' },
  { label: 'Facing south' },
  { label: 'Facing west' },
];
const TRAIL_LABELS: Record<TrailMode, { label: string }> = {
  off: { label: 'Trails: off' },
  tail: { label: 'Trails: comet tails' },
  exposure: { label: 'Trails: long exposure' },
};
const DEFAULT_SETTINGS: ViewerSettings = { rateIndex: 2, direction: 1, playing: true, trails: 'tail', turn: 0, centerSun: false, autoplay: true, secondsPerDay: VIEWER_SECONDS_PER_DAY, maxHz: 120 };

/**
 * A journey between chapters: the party on the road under the true sky of
 * that night and place, the stars wheeling about the pole as time runs.
 * Between chapters it plays the road's nights from the first to the last
 * and goes on into the next chapter. Opened from the title it is a viewer
 * that plays each road the same way and goes on to the next, until the
 * player takes the clock with the controls for the rate and direction of
 * time, the trails and the view.
 */
export class JourneyScene extends Phaser.Scene {
  private journey!: Journey;
  private onward?: JourneyOnward;
  private settings!: ViewerSettings;
  private location!: GeographicLocation;
  private firstSun?: SunEvent;
  private field!: StarField;
  private clock!: JourneyClock;
  private passage!: JourneyPassage;
  private camera3!: SkyCamera;
  private sky!: SkyPainter;
  private land!: Landscape | Sea;
  private party?: Party;
  private hud!: JourneyHud;
  private glows!: SkyGlows;
  private ground!: GroundLayout;
  private walked = 0;
  private lastMs: number | undefined;
  private shownFrameRate = '';
  private leaving = false;

  constructor() { super('Journey'); }

  init(data: JourneyLaunch = {}): void {
    this.journey = JOURNEYS.find(j => j.id === data.journeyId) ?? JOURNEYS[0]!;
    this.onward = data.onward;
    this.settings = { ...DEFAULT_SETTINGS, ...data.settings };
    this.walked = 0;
    this.lastMs = undefined;
    this.leaving = false;
  }

  create(): void {
    restartSceneOnResize(this, () => this.launchData());
    const { width, height } = this.scale;
    const journey = this.journey;
    this.location = locationFromDegrees(journey.subtitle, journey.latitude, journey.longitude);
    const departure = journeyDeparture(journey);
    this.field = starFieldFor(departure, this.location);
    this.firstSun = firstSunEvent(departure, this.location);

    // The sky takes the same share of the screen at every size and shape.
    const horizonY = Math.round(height * SKY_SHARE);
    this.camera3 = new SkyCamera(width, height, horizonY);
    this.camera3.face(this.viewBearing());
    this.ground = groundLayout(width, height, horizonY);
    this.sky = new SkyPainter(this, this.camera3);
    if (journey.terrain === 'sea') {
      this.land = new Sea(this, this.camera3, this.ground);
    } else {
      this.land = new Landscape(this, this.camera3, this.ground, journey.terrain, journey.id);
      this.party = new Party(this, journey.party, this.ground, width);
    }

    this.clock = new JourneyClock(departure);
    this.passage = new JourneyPassage(this.clock, journey);
    this.hud = new JourneyHud(this, journey);
    this.glows = new SkyGlows(this, this.sky, this.land, this.party, this.hud);
    playMusic(journey.music);
    setSoundscape(journey.sound);

    if (this.onward) this.startPassage();
    else this.startViewer();
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  update(): void {
    const now = performance.now();
    // Held under the cap, the frame keeps what was drawn last; a little slack
    // keeps a 60 Hz cap from dropping frames that land a hair early.
    if (this.lastMs !== undefined && now - this.lastMs < 1000 / this.settings.maxHz - 2) return;
    const deltaMs = Math.min(100, now - (this.lastMs ?? now));
    this.lastMs = now;
    this.clock.update(now);
    const date = this.clock.date;
    const bodies = skyBodies(date, this.location);
    const paceHours = Math.abs(this.clock.speed) / 3600;
    const light = this.blurredLight(date, bodies, paceHours);
    const skyMs = date.getTime();
    // Between chapters the stars always draw comet tails; the viewer shows them as it is set.
    const trails = this.onward ? 'tail' : this.settings.trails;
    const timeBlur = Math.min(1, Math.max(0, (paceHours - 6) / 18));
    this.sky.draw({
      field: this.field,
      siderealTime: localSiderealTime(date, this.location),
      skyMs,
      sinLat: Math.sin(this.location.latitude),
      cosLat: Math.cos(this.location.latitude),
      light,
      bodies,
      motion: this.clock.motion,
      timeBlur,
      trails,
      tailStartMs: trails === 'exposure' ? this.clock.exposureStart() : this.clock.tailStart(),
      realMs: now,
    });
    // An easy walking pace, about four kilometres an hour against a person's height.
    this.walked += (deltaMs / 1000) * this.ground.figure * 0.68;
    this.land.draw(this.walked, light, now);
    this.party?.draw(this.walked, light, now);
    this.glows.update(light, timeBlur);
    this.hud.updateClockFor(date, this.journey.longitude, this.statusLine());
  }

  /**
   * The light of the moment, or when the days roll by, the light of the last
   * part of a day taken together, so day and night blend instead of flicker.
   */
  private blurredLight(date: Date, bodies: SkyBodies, paceHours: number): SkyLight {
    const windowMs = Math.min(24, paceHours * BLUR_SECONDS) * 3600000;
    const now = skyLightFor(bodies);
    if (windowMs < 3600000) return now;
    const lights: SkyLight[] = [];
    for (let i = BLUR_SAMPLES - 1; i > 0; i -= 1) {
      lights.push(skyLightFor(skyBodies(new Date(date.getTime() - (windowMs * i) / (BLUR_SAMPLES - 1)), this.location)));
    }
    lights.push(now);
    return blendSkyLights(lights);
  }

  private launchData(): JourneyLaunch {
    return { journeyId: this.journey.id, onward: this.onward, settings: this.settings };
  }

  private statusLine(): string {
    const day = dayOfJourney(this.journey, this.clock.date);
    const onRoad = day >= 1 && day <= this.journey.days;
    const dayLine = onRoad ? t('Day {n} of {total}', { n: day, total: this.journey.days }) : '';
    if (this.passage.active || this.onward || this.settings.autoplay) return dayLine;
    const rate = !this.clock.playing ? t('Paused')
      : this.clock.direction < 0 ? t('{rate}, running backward', { rate: t(this.clock.rate.label) })
      : t(this.clock.rate.label);
    return dayLine ? `${dayLine}  ·  ${rate}` : rate;
  }

  /** Between chapters: the nights of the road going by, then on into the next chapter. */
  private startPassage(): void {
    this.clock.setRate(0);
    this.passage.start(() => this.time.delayedCall(PASSAGE_HOLD_MS, () => this.goOnward()));
    this.hud.setButtons([{ label: () => t('Continue ›'), onClick: () => this.goOnward() }]);
    for (const key of ['ENTER', 'SPACE', 'ESC']) this.input.keyboard?.once(`keydown-${key}`, () => this.goOnward());
  }

  private goOnward(): void {
    const onward = this.onward;
    if (!onward || this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(onward.scene, { spawnX: onward.spawnX, spawnY: onward.spawnY });
    });
  }

  private startViewer(): void {
    const s = this.settings;
    this.clock.setRate(s.rateIndex);
    if (s.direction < 0) this.clock.reverse();
    if (!s.playing) this.clock.togglePlaying();
    const index = JOURNEYS.indexOf(this.journey);
    const buttons: HudButton[] = [
      // Arrows point the way the row reads, so they turn around right to left.
      { label: () => (rtl ? '›' : '‹'), onClick: () => this.showJourney(index - 1), essential: true },
      { label: () => t('{n} of {total}', { n: index + 1, total: JOURNEYS.length }), onClick: () => this.showJourney(index + 1), essential: true },
      { label: () => (rtl ? '‹' : '›'), onClick: () => this.showJourney(index + 1), essential: true },
      { label: () => (this.clock.playing ? t('Pause') : t('Play')), onClick: () => this.togglePlaying(), essential: true },
      { label: () => t('Slower'), onClick: () => this.changeRate(-1) },
      { label: () => t('Faster'), onClick: () => this.changeRate(1) },
      { label: () => t('Reverse'), onClick: () => this.reverse() },
      { label: () => t(TRAIL_LABELS[s.trails].label), onClick: () => this.cycleTrails() },
      { label: () => t(this.facingLabel()), onClick: () => this.turn() },
      { label: () => t(s.centerSun ? 'Center sun: on' : 'Center sun: off'), onClick: () => this.toggleCenterSun() },
      { label: () => t('Pass the journey'), onClick: () => this.passTheJourney() },
      { label: () => '−', onClick: () => this.changeDayPace(-1), keepWithNext: true },
      { label: () => t('{seconds} s a day', { seconds: s.secondsPerDay }), onClick: () => this.changeDayPace(1), keepWithNext: true },
      { label: () => '+', onClick: () => this.changeDayPace(1) },
      { label: () => this.frameRateLabel(), onClick: () => this.toggleFrameRate() },
      { label: () => t('Hide controls'), onClick: () => this.hud.setVisible(false) },
      { label: () => t('Back'), onClick: () => this.scene.start('Title') },
    ];
    this.hud.setButtons(buttons);
    this.input.on('pointerdown', () => this.hud.setVisible(true));
    // The frame-rate button reports the rate really reached once it has been measured.
    this.shownFrameRate = this.frameRateLabel();
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        const label = this.frameRateLabel();
        if (label === this.shownFrameRate) return;
        this.shownFrameRate = label;
        this.hud.refreshButtons();
      },
    });

    const keys: Record<string, () => void> = {
      ArrowLeft: () => this.showJourney(index - 1),
      ArrowRight: () => this.showJourney(index + 1),
      Space: () => this.togglePlaying(),
      ArrowUp: () => this.changeRate(1),
      ArrowDown: () => this.changeRate(-1),
      KeyR: () => this.reverse(),
      KeyT: () => this.cycleTrails(),
      KeyF: () => this.turn(),
      KeyC: () => this.toggleCenterSun(),
      KeyZ: () => this.toggleFrameRate(),
      KeyN: () => this.passTheJourney(),
      BracketLeft: () => this.changeDayPace(-1),
      BracketRight: () => this.changeDayPace(1),
      KeyH: () => this.hud.setVisible(!this.hud.layer.visible),
      Escape: () => this.scene.start('Title'),
    };
    // Phaser replays its whole frame's key queue on every DOM key event, so two
    // presses inside one frame would each act twice. Listen to the page itself.
    const onKey = (event: KeyboardEvent) => {
      const action = keys[event.code];
      if (!action) return;
      event.preventDefault();
      action();
      this.hud.refreshButtons();
    };
    window.addEventListener('keydown', onKey);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => window.removeEventListener('keydown', onKey));
    if (s.autoplay) this.passTheJourney();
  }

  private showJourney(index: number): void {
    const next = JOURNEYS[(index + JOURNEYS.length) % JOURNEYS.length]!;
    this.scene.restart({ journeyId: next.id, settings: { ...this.settings, turn: 0 } });
  }

  private togglePlaying(): void {
    this.takeClock();
    this.clock.togglePlaying();
    this.settings.playing = this.clock.playing;
  }

  private changeRate(step: number): void {
    this.takeClock();
    this.clock.setRate(this.clock.rateIndex + step);
    this.settings.rateIndex = this.clock.rateIndex;
    if (!this.clock.playing) this.togglePlaying();
  }

  private reverse(): void {
    this.takeClock();
    this.clock.reverse();
    this.settings.direction = this.clock.direction;
    this.restartExposure();
  }

  private cycleTrails(): void {
    const s = this.settings;
    s.trails = TRAIL_MODES[(TRAIL_MODES.indexOf(s.trails) + 1) % TRAIL_MODES.length]!;
    this.restartExposure();
  }

  /** Turns a quarter from the road's facing; turning away from the sun lets it go. */
  private turn(): void {
    if (this.settings.centerSun) this.settings.centerSun = false;
    else this.settings.turn = (this.settings.turn + 1) % 4;
    this.camera3.face(this.viewBearing());
    this.restartExposure();
  }

  private toggleFrameRate(): void {
    this.settings.maxHz = this.settings.maxHz === 120 ? 60 : 120;
    this.shownFrameRate = this.frameRateLabel();
  }

  /**
   * The cap, and when fewer frames than that are coming, how many are: the
   * page cannot go faster than the screen and browser allow (Safari holds
   * pages to 60 Hz unless told otherwise), nor than the machine can draw.
   */
  private frameRateLabel(): string {
    const hz = this.settings.maxHz;
    const actual = Math.round(this.game.loop.actualFps / 10) * 10;
    return actual > 0 && actual < hz * 0.9
      ? t('{hz} Hz (getting {actual})', { hz, actual })
      : t('{hz} Hz', { hz });
  }

  private toggleCenterSun(): void {
    this.settings.centerSun = !this.settings.centerSun;
    this.camera3.face(this.viewBearing());
    this.restartExposure();
  }

  private facingLabel(): string {
    if (this.settings.centerSun && this.firstSun) {
      return this.firstSun.kind === 'sunrise' ? 'Facing the sunrise' : 'Facing the sunset';
    }
    return FACINGS[facingIndex(this.camera3.facing)]!.label;
  }

  /** Where the view looks: at the first sunrise or sunset of the road, or the road's facing turned by quarters. */
  private viewBearing(): number {
    const { centerSun, turn } = this.settings;
    if (centerSun && this.firstSun) return this.firstSun.azimuth;
    return this.journey.facing + turn * 90;
  }

  /** Plays the whole road as the game does between chapters, then goes on to the next journey. */
  private passTheJourney(): void {
    this.settings.autoplay = true;
    this.passage.start(() => this.time.delayedCall(PASSAGE_HOLD_MS, () => {
      if (!this.settings.autoplay || this.leaving) return;
      this.leaving = true;
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.showJourney(JOURNEYS.indexOf(this.journey) + 1));
    }), this.settings.secondsPerDay);
    this.restartExposure();
  }

  /** Steps the dial for how long each day takes, and plays the road again from its first evening to show it. */
  private changeDayPace(step: number): void {
    const steps = SECONDS_PER_DAY_STEPS;
    const at = steps.indexOf(this.settings.secondsPerDay);
    const next = Math.max(0, Math.min(steps.length - 1, (at < 0 ? steps.indexOf(VIEWER_SECONDS_PER_DAY) : at) + step));
    this.settings.secondsPerDay = steps[next]!;
    this.passTheJourney();
  }

  /** The player takes the clock: the road stops playing itself and time runs as they set it. */
  private takeClock(): void {
    this.settings.autoplay = false;
    if (!this.passage.active) return;
    this.passage.stop();
    this.clock.setRate(this.settings.rateIndex);
    this.clock.playing = this.settings.playing;
  }

  private restartExposure(): void {
    this.clock.openShutter();
    this.sky.openShutter();
  }
}

function facingIndex(bearing: number): number {
  return Math.round(bearing / 90) % 4;
}
