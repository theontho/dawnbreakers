import type { FlagState } from '../../dialogue/types';

/**
 * The Baghdád chapter moves through three phases by flag, shared by its
 * maps, dialogues and objectives:
 *
 * - morning (a cold morning of January 1845): the quay, the serai, and the
 *   tribunal; until the Páshá sends the verdicts to Istanbul (`bgVerdict`);
 * - winter (that evening, and the nights after): the student's bread, the
 *   jailer, the prisoner; until the player has sat with Mullá ʿAlí
 *   (`bgSpokeWithAli`);
 * - departure (weeks later, before dawn): he is led away north in chains,
 *   and the chapter closes (`baghdadComplete`).
 */

export const bgMorning = (f: FlagState) => !f.bgVerdict;
export const bgWinter = (f: FlagState) => !!f.bgVerdict && !f.bgSpokeWithAli;
export const bgDeparture = (f: FlagState) => !!f.bgSpokeWithAli;

const count = (f: FlagState, flags: readonly string[]) => flags.filter(k => !!f[k]).length;

/** The people of the quay the player hears before going up to the serai. */
export const QUAY_ROUNDS = ['bgHeardFather', 'bgHeardBookseller', 'bgHeardMerchant', 'bgHeardCoffee'] as const;
export const QUAY_NEEDED = 3;
export const quayRounds = (f: FlagState) => count(f, QUAY_ROUNDS);

/** The serai is open to the player once the ink is bought and the quay heard. */
export const readyForSerai = (f: FlagState) => !!f.bgHeardBookseller && quayRounds(f) >= QUAY_NEEDED;

/** The two benches' people the player hears in the hall before the tribunal sits. */
export const HALL_ROUNDS = ['bgHeardClerk', 'bgHeardStudent'] as const;
export const hallRounds = (f: FlagState) => count(f, HALL_ROUNDS);
