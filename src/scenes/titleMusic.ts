import Phaser from 'phaser';
import { getAudioSettings, playMusic, setSoundscape, stopMusic } from '../audio';
import { logGameMessage } from '../logging/gameLogger';
import type { SunriseClock } from './titleSunriseClock';

/**
 * The title screen's music: the recorded score `dawnbreakers.mp3`, or the
 * synthesized ensemble's dawn theme if the recording cannot be loaded.
 */

const MUSIC_KEY = 'title-background-music';
const MUSIC_PATH = 'dawnbreakers.mp3';
const VOLUME = 0.45;

/**
 * Streams the recording in after first paint. Probe for it first: if it is
 * missing, decoding a dev server's HTML fallback as audio throws an uncaught
 * error.
 */
export async function loadTitleMusic(scene: Phaser.Scene): Promise<boolean> {
  if (scene.cache.audio.exists(MUSIC_KEY)) return true;
  try {
    const probe = await fetch(MUSIC_PATH, { method: 'HEAD' });
    if (!probe.ok || !(probe.headers.get('content-type') ?? '').startsWith('audio')) {
      logGameMessage('title music unavailable, using synthesized score', { path: MUSIC_PATH }, 'warn');
      return false;
    }
  } catch {
    return false;
  }
  if (!scene.scene.isActive()) return false;
  return new Promise(resolve => {
    scene.load.audio(MUSIC_KEY, MUSIC_PATH);
    scene.load.once(Phaser.Loader.Events.COMPLETE, () => resolve(scene.cache.audio.exists(MUSIC_KEY)));
    scene.load.start();
  });
}

/**
 * What the sunrise's transport can do to the music: pause and resume it, and
 * move the recording to a moment (the synthesized piece is composed as it
 * plays, so it has no moments to seek to and simply plays on).
 */
export interface TitleMusic {
  readonly recorded: boolean;
  /** Seconds into the recording, or 0 for the synthesized piece. */
  readonly seconds: number;
  pause(): void;
  resume(): void;
  seek(seconds: number): void;
}

/** Plays the recording if `recorded` loaded, else the synthesized title piece. */
export function startTitleMusic(scene: Phaser.Scene, recorded: boolean, fromSeconds = 0): TitleMusic {
  setSoundscape([]);
  if (!recorded) {
    playMusic('title');
    return {
      recorded,
      seconds: 0,
      pause: () => stopMusic(),
      resume: () => playMusic('title'),
      seek: () => {},
    };
  }
  stopMusic();
  scene.sound.pauseOnBlur = false;
  const { music: level, muted } = getAudioSettings();
  const config: Phaser.Types.Sound.SoundConfig = { loop: true, volume: muted ? 0 : VOLUME * level ** 2 };
  let music = scene.sound.get<Phaser.Sound.WebAudioSound>(MUSIC_KEY);
  if (music) music.stop();
  else music = scene.sound.add(MUSIC_KEY, config) as Phaser.Sound.WebAudioSound;
  music.play({ ...config, seek: wrap(fromSeconds, music.duration) });
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => music.stop());
  return {
    recorded,
    get seconds() {
      return music.seek;
    },
    pause: () => {
      if (music.isPlaying) music.pause();
    },
    resume: () => {
      if (music.isPaused) music.resume();
    },
    seek: (seconds) => {
      music.setSeek(wrap(seconds, music.duration));
    },
  };
}

/** `seconds` folded into a looping track of `length` seconds. */
function wrap(seconds: number, length: number): number {
  return length > 0 ? ((seconds % length) + length) % length : Math.max(0, seconds);
}

/**
 * Keeps the music with the sunrise's playhead: it pauses and resumes with
 * the picture, and when the playhead jumps (or returns to normal speed) the
 * recording moves to the same moment. `leadSeconds` is how far the music is
 * ahead of the sunrise, since it starts with the title and the dawn after
 * the book. At other speeds the music plays on at its own pace, since a
 * sped-up recording only squeaks.
 */
export function followSunrise(music: TitleMusic, clock: SunriseClock, leadSeconds: number): () => void {
  const sync = () => music.seek(leadSeconds + clock.position / 1000);
  return clock.onChange((_clock, change) => {
    if (change === 'play') {
      if (!clock.isPlaying) {
        music.pause();
        return;
      }
      sync();
      music.resume();
    } else if (change === 'seek' || (change === 'speed' && clock.speed === 1)) {
      sync();
    }
  });
}
