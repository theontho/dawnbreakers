import type { FlagState } from '../../dialogue/types';

/**
 * The Seven Martyrs of Ṭihrán, February 1850, moves through three phases by
 * flag, shared by its maps, dialogues and objectives:
 *
 * - the arrests: fourteen believers are held in the house of Maḥmúd
 *   Khán-i-Kalántar. The player carries the Shíráz merchants' offer of
 *   ransom to the Báb's uncle and sits with the prisoners; until the
 *   uncle's answer is carried back to the caravanserai (`martyrsMorning`);
 * - the morning: the prisoners have been taken before the Amír-Niẓám, the
 *   crowd fills the Sabzih-Maydán and the player stands at its edge; until
 *   it is over (`martyrsAfter`);
 * - after: the third evening, the square quiet, told by those who saw it;
 *   until the chapter closes (`martyrsComplete`).
 */

export const martyrsArrests = (f: FlagState) => !f.martyrsMorning;
export const martyrsMorning = (f: FlagState) => !!f.martyrsMorning && !f.martyrsAfter;
export const martyrsAfter = (f: FlagState) => !!f.martyrsAfter;

const count = (f: FlagState, flags: readonly string[]) => flags.filter(k => !!f[k]).length;

/** The three prisoners the player must sit with before the uncle's answer goes back. */
export const PRISON_VISITS = ['martyrsSatWithKhal', 'martyrsSatWithQurban', 'martyrsSatWithIsmail'] as const;
export const prisonVisits = (f: FlagState) => count(f, PRISON_VISITS);

/** The two who tell the player what happened in the square. */
export const SQUARE_WITNESSES = ['martyrsHeardHeadsman', 'martyrsHeardSweetSeller'] as const;
export const squareWitnesses = (f: FlagState) => count(f, SQUARE_WITNESSES);
