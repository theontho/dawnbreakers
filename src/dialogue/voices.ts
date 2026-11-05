import { t } from '../i18n';
import type { FlagState, Voice } from './types';

/**
 * The pilgrim's inner voices (doubt, fear, longing) at the moments where
 * they speak. Each moment is remembered under `voice:<moment>`: the voice
 * that was heeded there, or 'resisted'. Later choices read these to open or
 * close what the pilgrim can say.
 */

const PREFIX = 'voice:';

export const voiceKey = (moment: string): string => `${PREFIX}${moment}`;

/** For a choice's `effect.set`: the pilgrim heeded `voice` at `moment`. */
export const heed = (moment: string, voice: Voice): Record<string, string> => ({ [voiceKey(moment)]: voice });

/** For a choice's `effect.set`: a voice spoke at `moment` and the pilgrim did not follow it. */
export const resist = (moment: string): Record<string, string> => ({ [voiceKey(moment)]: 'resisted' });

export const heededAt = (f: FlagState, moment: string, voice?: Voice): boolean => {
  const value = f[voiceKey(moment)];
  return voice ? value === voice : typeof value === 'string' && value !== 'resisted';
};

export const resistedAt = (f: FlagState, moment: string): boolean => f[voiceKey(moment)] === 'resisted';

/** How many times, across the whole journey, the pilgrim has heeded `voice`. */
export function heededCount(f: FlagState, voice: Voice): number {
  let n = 0;
  for (const [key, value] of Object.entries(f)) {
    if (key.startsWith(PREFIX) && value === voice) n += 1;
  }
  return n;
}

/** The name drawn before a voiced line, and its colour. */
export const VOICE_STYLE: Record<Voice, { name: () => string; color: string; bar: number }> = {
  doubt: { name: () => t('Doubt'), color: '#a9c3d4', bar: 0x7f9fb4 },
  fear: { name: () => t('Fear'), color: '#e09a86', bar: 0xb85a48 },
  longing: { name: () => t('Longing'), color: '#d2b0e0', bar: 0x9a72b0 },
};
