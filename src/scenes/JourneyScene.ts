import Phaser from 'phaser';
import { playMusic, setSoundscape } from '../audio';
import { JOURNEYS, journeyDeparture, type Journey } from '../data/journeys';
import { rtl, t } from '../i18n';
import { localSiderealTime, locationFromDegrees } from '../sky/projection';
import { skyBodies } from '../sky/skyBodies';
import type { GeographicLocation } from '../sky/types';
import { capFrameRate } from '../ui/frameCap';
import { RemarkCaption } from '../ui/remarkCaption';
import { restartSceneOnResize } from '../ui/responsive';
import { firstSunEvent, type SunEvent } from '../travel/firstSunEvent';
import { JourneyArrival } from '../travel/journeyArrival';
import { JourneyClock } from '../travel/journeyClock';
import { JourneyHud, type HudButton } from '../travel/journeyHud';
import { JourneyPassage, dayOfJourney } from '../travel/journeyPassage';
import { SECONDS_PER_DAY_STEPS, SECONDS_PER_DAY } from '../travel/roadCurve';
import { Landscape, groundLayout, type GroundLayout } from '../travel/landscape';
import { Party } from '../travel/party';
import { Sea } from '../travel/sea';
import { SkyCamera } from '../travel/skyCamera';
import { blurredSkyLight, type SkyLight } from '../travel/skyLight';
import { SkyGlows } from '../travel/skyGlows';
import { SkyPainter, TRAIL_MODES } from '../travel/skyPainter';
import { DEFAULT_SETTINGS, FACINGS, facingIndex, TRAIL_LABELS, type ViewerSettings } from '../travel/journeyViewerSettings';
import { starFieldFor, type StarField } from '../travel/travelStars';

/** Where to go once a journey played between chapters is over. */
export interface JourneyOnward {
  scene: string;
  spawnX?: number;
  spawnY?: number;
}

export interface JourneyLaunch {
  [key: string]: unknown;
  journeyId?: string;
  /** Set when the journey plays between chapters: it runs once along the road and goes on. */
  onward?: JourneyOnward;
  settings?: ViewerSettings;
  /** The journey had already reached its arrival (the scene restarted for a resize): show the dawn at once. */
  arrived?: boolean;
  /** The viewer's "Show the arrival": play the move into the dawn as soon as the road is up. */
  showArrival?: boolean;
}

const PASSAGE_HOLD_MS = 1600;
/** How much of the screen's height is sky, above the horizon. */
const SKY_SHARE = 0.7;
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
  private caption!: RemarkCaption;
  /** The day whose remarks have been said, so each is said once as the road passes it. */
  private remarkedDay = 0;
  /** The dawn over the place the road leads to, which the road gives way to at its end. */
  private arrival?: JourneyArrival;
  private arrived = false;
  private showArrival = false;
  private arriveAt?: number;
  private lastLight?: SkyLight;

  constructor() { super('Journey'); }

  init(data: JourneyLaunch = {}): void {
    this.journey = JOURNEYS.find(j => j.id === data.journeyId) ?? JOURNEYS[0]!;
    this.onward = data.onward;
    this.settings = { ...DEFAULT_SETTINGS, ...data.settings };
    this.walked = 0;
    this.remarkedDay = 0;
    this.lastMs = undefined;
    this.leaving = false;
    this.arrived = data.arrived ?? false;
    this.showArrival = data.showArrival ?? false;
    this.arriveAt = undefined;
    this.arrival = undefined;
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
    this.caption = new RemarkCaption(this, () => this.hud.controlsTop() - 10, 150);
    // Every road gets its arrival: between chapters, and in the viewer to watch it.
    this.arrival = new JourneyArrival(this, {
      journey,
      party: this.party,
      camera: this.camera3,
      figure: this.ground.figure,
      controlsTop: () => this.hud.controlsTop(),
      onFinished: () => (this.onward ? this.goOnward() : this.showNextAfterArrival()),
    });
    playMusic(journey.music);
    setSoundscape(journey.sound);

    if (this.onward) this.startPassage();
    else this.startViewer();
    if (this.arrived) this.arrive(true);
    // On the wall clock, which the scene's own can lag behind while the road's first frames are slow.
    else if (this.showArrival) this.arriveAt = performance.now() + 600;
    this.cameras.main.fadeIn(500, 0, 0, 0);
    // The cap holds while the sky is up; the rest of the game runs as the screen does.
    capFrameRate(this.game, this.settings.maxHz);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => capFrameRate(this.game, undefined));
  }

  update(): void {
    const now = performance.now();
    const deltaMs = Math.min(100, now - (this.lastMs ?? now));
    this.lastMs = now;
    this.clock.update(now);
    if (this.arriveAt !== undefined && now >= this.arriveAt) {
      this.arriveAt = undefined;
      this.arrive();
    }
    this.arrival?.update();
    // Once the dawn covers the road, only the party is left to draw.
    if (this.arrival?.covers) {
      this.walked += (deltaMs / 1000) * this.ground.figure * 0.68;
      // Backlit by the sunrise, they keep the road's last light: silhouettes against the dawn.
      if (this.lastLight) this.party?.draw(this.walked, this.lastLight, now);
      return;
    }
    const date = this.clock.date;
    const bodies = skyBodies(date, this.location);
    const paceHours = Math.abs(this.clock.speed) / 3600;
    const light = blurredSkyLight(date, bodies, this.location, paceHours);
    this.lastLight = light;
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
      fullDark: this.settings.fullDark,
    });
    // An easy walking pace, about four kilometres an hour against a person's height.
    this.walked += (deltaMs / 1000) * this.ground.figure * 0.68;
    this.land.draw(this.walked, light, now);
    this.party?.draw(this.walked, light, now);
    this.glows.update(light, timeBlur);
    this.hud.updateClockFor(date, this.journey.longitude, this.statusLine());
    this.sayRemarks();
  }

  /** The party's remarks for the days the road has reached since the last frame, going forward only. */
  private sayRemarks(): void {
    const day = dayOfJourney(this.journey, this.clock.date);
    if (day <= this.remarkedDay) {
      // Run back before a remark's day, it may be said again on the way forward.
      if (day < this.remarkedDay) this.remarkedDay = day;
      return;
    }
    const due = (this.journey.remarks ?? []).filter(r => r.day > this.remarkedDay && r.day <= day);
    this.remarkedDay = day;
    if (due.length > 0) this.caption.say(due);
  }

  private launchData(): JourneyLaunch {
    return { journeyId: this.journey.id, onward: this.onward, settings: this.settings, arrived: this.arrived };
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
    this.passage.start(() => this.time.delayedCall(PASSAGE_HOLD_MS, () => this.arrive()), this.settings.secondsPerDay);
    this.hud.setButtons([{ label: () => t('Continue ›'), onClick: () => this.skipAhead() }]);
    // Continue goes in two steps: to the dawn over the place, then on into the chapter. Esc goes straight on.
    const onKey = (event: KeyboardEvent) => {
      if (event.code === 'Escape') this.goOnward();
      else if (event.code === 'Enter' || event.code === 'Space') this.skipAhead();
      else return;
      event.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => window.removeEventListener('keydown', onKey));
  }

  /** The road's end: its sky gives way to the dawn over the place it leads to. */
  private arrive(skip = false): void {
    if (!this.arrival) {
      this.goOnward();
      return;
    }
    this.arrived = true;
    this.passage.stop();
    this.clock.setRate(0);
    this.caption.clear();
    this.glows.hide();
    this.hud.fadeHeading();
    this.arrival.begin(skip);
  }

  /** The first press shows the dawn over the place; the next goes on into the chapter. */
  private skipAhead(): void {
    if (!this.arrival) {
      this.goOnward();
      return;
    }
    if (this.arrival.state === 'waiting') this.arrive(true);
    else if (this.arrival.skip()) this.goOnward();
  }

  /** The viewer's preview of the road's end: the move into the dawn, from the road as it is now, or again from the start. */
  private replayArrival(): void {
    this.takeClock();
    if (this.arrival?.state === 'waiting') this.arrive();
    else this.scene.restart({ journeyId: this.journey.id, settings: this.settings, showArrival: true });
  }

  /** In the viewer, once the dawn has come up, on to the next road. */
  private showNextAfterArrival(): void {
    if (!this.settings.autoplay || this.leaving) return;
    this.leaving = true;
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.showJourney(JOURNEYS.indexOf(this.journey) + 1));
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
      { label: () => t(s.fullDark ? 'Stars: full dark, as in the 1840s' : 'Stars: as usual'), onClick: () => this.toggleFullDark() },
      { label: () => t('Pass the journey'), onClick: () => this.passTheJourney() },
      { label: () => t('Show the arrival'), onClick: () => this.replayArrival() },
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
      KeyB: () => this.toggleFullDark(),
      KeyZ: () => this.toggleFrameRate(),
      KeyN: () => this.passTheJourney(),
      KeyA: () => this.replayArrival(),
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
    capFrameRate(this.game, this.settings.maxHz);
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

  private toggleFullDark(): void {
    this.settings.fullDark = !this.settings.fullDark;
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
      if (this.arrival) this.arrive();
      else this.showNextAfterArrival();
    }), this.settings.secondsPerDay);
    this.restartExposure();
  }

  /** Steps the dial for how long each day takes, and plays the road again from its first evening to show it. */
  private changeDayPace(step: number): void {
    const steps = SECONDS_PER_DAY_STEPS;
    const at = steps.indexOf(this.settings.secondsPerDay);
    const next = Math.max(0, Math.min(steps.length - 1, (at < 0 ? steps.indexOf(SECONDS_PER_DAY) : at) + step));
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
