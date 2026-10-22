import type { FlagState } from '../../dialogue/types';

/**
 * The Zanján chapter moves through four phases by flag, shared by its maps,
 * dialogues and objectives:
 *
 * - summer (late July 1850): the player comes in with the news from Tabríz;
 *   until Ḥujjat sends the children out with the sealed Qur'án
 *   (`zjDelegationSent`);
 * - truce (autumn): the guns are quiet while the children are in the
 *   Amír-Tumán's camp; until they come back (`zjTruceBroken`);
 * - winter (December): the bombardment, the cold, the empty places; until
 *   Ḥujjat is wounded at his ablutions (`zjHujjatWounded`);
 * - end (late December to January 1851): Ḥujjat on his mattress, the broken
 *   room, and the chapter's close (`zanjanComplete`).
 */

export const zjSummer = (f: FlagState) => !f.zjDelegationSent;
export const zjTruce = (f: FlagState) => !!f.zjDelegationSent && !f.zjTruceBroken;
export const zjWinter = (f: FlagState) => !!f.zjTruceBroken && !f.zjHujjatWounded;
export const zjEnd = (f: FlagState) => !!f.zjHujjatWounded;

const count = (f: FlagState, flags: readonly string[]) => flags.filter(k => !!f[k]).length;

/** The people of the quarter the player meets in summer before the sealed Qur'án comes. */
export const SUMMER_ROUNDS = ['zjMetZaynab', 'zjHeardInvocations', 'zjHelpedWomen', 'zjMetKhadijih'] as const;
export const SUMMER_NEEDED = 3;
export const summerRounds = (f: FlagState) => count(f, SUMMER_ROUNDS);

/** What the player sees of the winter before Ḥujjat goes to his ablutions. */
export const WINTER_ROUNDS = ['zjMournedZaynab', 'zjMournedMuhsin', 'zjMetAshraf', 'zjHeardCrier'] as const;
export const WINTER_NEEDED = 2;
export const winterRounds = (f: FlagState) => count(f, WINTER_ROUNDS);
