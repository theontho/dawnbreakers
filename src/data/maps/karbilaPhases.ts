import type { FlagState } from '../../dialogue/types';

/**
 * The Karbilá chapter (summer 1851 to spring 1852) moves through three
 * phases by flag, shared by its maps, dialogues and objectives:
 *
 * - summer (August to early October 1851): the player comes home to
 *   Karbilá from Zanján, finds Shaykh Ḥasan-i-Zunúzí waiting by the shrine
 *   gate, and goes among the town; until Shaykh Ḥasan comes back from the
 *   gate on the day of ʿArafih (`krHasanSaw`);
 * - winter (autumn 1851 to the new year): the house in the lane, where the
 *   scattered believers are quietly drawn back; until the news from Ṭihrán
 *   comes to the canal (`krSpring`);
 * - spring (1852): the house is shut and its guest gone back to Ṭihrán; the
 *   chapter closes at the shrine gate (`karbilaComplete`).
 */

export const krSummer = (f: FlagState) => !f.krHasanSaw;
export const krWinter = (f: FlagState) => !!f.krHasanSaw && !f.krSpring;
export const krSpring = (f: FlagState) => !!f.krSpring;

const count = (f: FlagState, flags: readonly string[]) => flags.filter(k => !!f[k]).length;

/** The people of Karbilá the player meets in summer before the day of ʿArafih. */
export const SUMMER_ROUNDS = ['krMetWaterSeller', 'krMetClassmate', 'krMetServant', 'krVisitedGrave', 'krMetUluvi', 'krMetMazindarani'] as const;
export const SUMMER_NEEDED = 3;
export const krSummerRounds = (f: FlagState) => count(f, SUMMER_ROUNDS);

/** What the player sees at the house in the lane through the winter. */
export const WINTER_ROUNDS = ['krMetAqaJan', 'krUluvSilenced', 'krSawLamp'] as const;
export const WINTER_NEEDED = 2;
export const krWinterRounds = (f: FlagState) => count(f, WINTER_ROUNDS);

/** The day of ʿArafih comes once the player has met Shaykh Ḥasan and gone about the town. */
export const arafihReady = (f: FlagState) => !!f.krMetHasan && krSummerRounds(f) >= SUMMER_NEEDED;
