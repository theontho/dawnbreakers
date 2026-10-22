import type { MapAmbience, ParticleKind } from '../data/maps/types';
import { playMusic } from './music';
import { setSoundscape, type SoundLayer } from './soundscape';

export { installAudioUnlock, getAudioSettings, setAudioSettings, onAudioSettingsChange } from './engine';
export type { AudioSettings } from './engine';
export { playMusic, stopMusic, currentMood } from './music';
export { playSfx, playFootstep } from './sfx';
export { setSoundscape } from './soundscape';
export type { MusicMood } from './scores';
export type { SoundLayer } from './soundscape';

/** What each kind of weather sounds like when a map does not say. */
const PARTICLE_SOUND: Record<ParticleKind, SoundLayer[]> = {
  dust: ['breeze'],
  motes: ['birds'],
  fireflies: ['crickets'],
  snow: ['wind'],
  embers: ['breeze'],
  spray: ['sea'],
  leaves: ['breeze', 'birds'],
  rain: ['rain'],
};

/** Starts a map's score and ambient bed. `hasFire` adds a crackle near campfires and braziers. */
export function applyMapAudio(ambience: MapAmbience | undefined, hasFire: boolean): void {
  playMusic(ambience?.music ?? 'dusk');
  const layers = new Set<SoundLayer>(ambience?.sound ?? (ambience?.particles ? PARTICLE_SOUND[ambience.particles] : ['breeze']));
  if (hasFire) layers.add('fire');
  setSoundscape([...layers]);
}
