import Phaser from 'phaser';
import { getAudioSettings, playMusic, setSoundscape, stopMusic } from '../audio';
import { logGameMessage } from '../logging/gameLogger';

/**
 * The title screen's music: the recorded score when `dawnbreakers.mp3` is
 * present, otherwise the synthesized ensemble's dawn theme.
 */

const MUSIC_KEY = 'title-background-music';
const MUSIC_PATH = 'dawnbreakers.mp3';
const VOLUME = 0.45;

/**
 * Streams the recording in after first paint. The file is not checked in
 * (see .gitignore), so probe for it first: decoding a dev server's HTML
 * fallback as audio throws an uncaught error.
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

/** Plays the recording if `recorded` loaded, else the synthesized title piece. */
export function startTitleMusic(scene: Phaser.Scene, recorded: boolean): void {
  setSoundscape([]);
  if (!recorded) {
    playMusic('title');
    return;
  }
  stopMusic();
  scene.sound.pauseOnBlur = false;
  const { music: level, muted } = getAudioSettings();
  const config: Phaser.Types.Sound.SoundConfig = { loop: true, volume: muted ? 0 : VOLUME * level ** 2 };
  let music = scene.sound.get<Phaser.Sound.BaseSound>(MUSIC_KEY);
  if (music) music.stop();
  else music = scene.sound.add(MUSIC_KEY, config);
  music.play(config);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => music.stop());
}
