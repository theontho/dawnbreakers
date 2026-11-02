import Phaser from 'phaser';
import { getAudioSettings, playMusic, setSoundscape, stopMusic } from '../audio';
import { logGameMessage } from '../logging/gameLogger';
import type { SunriseClock } from './titleSunriseClock';

/**
 * The title screen's music: the recorded score `dawnbreakers.m4a`, or the
 * synthesized ensemble's dawn theme if the recording cannot be loaded.
 */

const MUSIC_PATH = 'dawnbreakers.m4a';
const VOLUME = 0.45;

/**
 * The recording plays from a media element, not a decoded buffer: a media
 * element can play faster or slower and keep its pitch, so the score speeds
 * up with the sunrise instead of squeaking. It is routed through the game's
 * audio graph, where its volume holds (an iPhone ignores a media element's
 * own volume) and the game's mute reaches it. One element serves every
 * visit to the title, since a browser lets an element play once a tap or
 * key has started it.
 */
let recording: { element: HTMLAudioElement; gain?: GainNode } | undefined;

/**
 * Readies the recording. Probe for it first: if it is missing, a dev
 * server's HTML fallback would be handed to the media element as audio.
 */
export async function loadTitleMusic(scene: Phaser.Scene): Promise<boolean> {
  if (recording) return true;
  try {
    const probe = await fetch(MUSIC_PATH, { method: 'HEAD' });
    if (!probe.ok || !(probe.headers.get('content-type') ?? '').startsWith('audio')) {
      logGameMessage('title music unavailable, using synthesized score', { path: MUSIC_PATH }, 'warn');
      return false;
    }
  } catch {
    return false;
  }
  if (recording) return true;
  const element = new Audio(MUSIC_PATH);
  element.preload = 'auto';
  element.loop = true;
  element.preservesPitch = true;
  (element as HTMLAudioElement & { webkitPreservesPitch?: boolean }).webkitPreservesPitch = true;
  recording = { element };
  const sound = scene.sound;
  if (sound instanceof Phaser.Sound.WebAudioSoundManager) {
    const gain = sound.context.createGain();
    sound.context.createMediaElementSource(element).connect(gain);
    gain.connect(sound.destination);
    recording.gain = gain;
  }
  allowPlaybackOnFirstGesture(element);
  return true;
}

/**
 * Safari plays a media element only from a tap or key, and the title starts
 * its music a moment after the press that starts it: start and stop the
 * element, silently, on the first press anywhere, so it may play later.
 */
function allowPlaybackOnFirstGesture(element: HTMLAudioElement): void {
  const events = ['pointerdown', 'keydown', 'touchend'] as const;
  const bless = () => {
    events.forEach(type => document.removeEventListener(type, bless, true));
    if (!element.paused) return;
    element.muted = true;
    void element.play().then(() => {
      if (!playing) element.pause();
      element.muted = false;
    }, () => {
      element.muted = false;
    });
  };
  events.forEach(type => document.addEventListener(type, bless, true));
}

/** Whether the title wants the recording heard, so the first press's silent start does not stop it. */
let playing = false;

/**
 * What the sunrise's transport can do to the music: pause and resume it,
 * move the recording to a moment and set its speed (the synthesized piece is
 * composed as it plays, so it has no moments to seek to and plays on at its
 * own pace).
 */
export interface TitleMusic {
  readonly recorded: boolean;
  /** Seconds into the recording, or 0 for the synthesized piece. */
  readonly seconds: number;
  pause(): void;
  resume(): void;
  seek(seconds: number): void;
  /** Plays at this many times normal speed, keeping its pitch. */
  setRate(rate: number): void;
}

/** Plays the recording if `recorded` loaded, else the synthesized title piece. */
export function startTitleMusic(scene: Phaser.Scene, recorded: boolean, fromSeconds = 0): TitleMusic {
  setSoundscape([]);
  if (!recorded || !recording) {
    playMusic('title');
    return {
      recorded: false,
      seconds: 0,
      pause: () => stopMusic(),
      resume: () => playMusic('title'),
      seek: () => {},
      setRate: () => {},
    };
  }
  stopMusic();
  // The recording runs through the game's audio context; keep it running when the window loses focus.
  scene.sound.pauseOnBlur = false;
  const { element, gain } = recording;
  const { music: level, muted } = getAudioSettings();
  const volume = muted ? 0 : VOLUME * level ** 2;
  if (gain) gain.gain.value = volume;
  else element.volume = volume;
  const seekTo = (seconds: number) => {
    // Before its length is known the element starts from the top.
    if (Number.isFinite(element.duration)) element.currentTime = wrap(seconds, element.duration);
  };
  const play = () => {
    playing = true;
    void element.play().catch(() => {});
  };
  seekTo(fromSeconds);
  play();
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    playing = false;
    element.pause();
  });
  return {
    recorded: true,
    get seconds() {
      return element.currentTime;
    },
    pause: () => {
      playing = false;
      element.pause();
    },
    resume: play,
    seek: seekTo,
    setRate: (rate) => {
      element.playbackRate = rate;
    },
  };
}

/** `seconds` folded into a looping track of `length` seconds. */
function wrap(seconds: number, length: number): number {
  return length > 0 ? ((seconds % length) + length) % length : Math.max(0, seconds);
}

/**
 * Keeps the music with the sunrise's playhead: it pauses and resumes with
 * the picture, plays as fast or as slow as the sunrise does (keeping its
 * pitch), and when the playhead jumps or the speed changes the recording
 * moves to the same moment. `leadSeconds` is how far the music is ahead of
 * the sunrise, since it starts with the title and the dawn after the book.
 */
export function followSunrise(music: TitleMusic, clock: SunriseClock, leadSeconds: number): () => void {
  const sync = () => music.seek(leadSeconds + clock.position / 1000);
  music.setRate(clock.speed);
  return clock.onChange((_clock, change) => {
    if (change === 'play') {
      if (!clock.isPlaying) {
        music.pause();
        return;
      }
      sync();
      music.resume();
    } else if (change === 'speed') {
      music.setRate(clock.speed);
      sync();
    } else if (change === 'seek') {
      sync();
    }
  });
}
