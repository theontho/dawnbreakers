/**
 * Flags set by each chapter 1 rumour tree's `onEnter`. The lint script
 * (`scripts/lint-dialogues.mjs`) verifies that every flag in this list is
 * actually produced by some `effect.set` or `onEnter.set` in the dialogue
 * data, so the count and the data can't drift.
 */
export const RUMOUR_FLAGS = [
  'rumourTraveller',
  'rumourMerchant',
  'rumourMulla',
  'rumourNeighbour',
  'heardWaterCarrier',
  'guardWarned',
  'sawCalligraphy',
  'orphanMercy',
  'servantWelcomed',
] as const;

/** Counts how many rumours about the Young Siyyid the player has heard. */
export function rumourCount(flags: Record<string, boolean | number | string>): number {
  return RUMOUR_FLAGS.reduce((count, flag) => count + (flags[flag] ? 1 : 0), 0);
}
