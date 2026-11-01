import type { FlagState } from '../../dialogue/types';

/**
 * The Forerunners (Nabíl, chapters I and II) moves through three phases by
 * flag, shared by its maps, dialogues and objectives:
 *
 * - teaching (the late autumn of 1843): Siyyid Káẓim still teaches in his
 *   house in Karbilá; the player rides with him on the road to Kázimayn and
 *   hears the shepherd at the Masjid of Baráthá. It ends with the narration
 *   of his death, on 31 December 1843 (`frKazimDied`).
 * - mourning (January 1844): Karbilá in black, his place empty, his students
 *   divided; until Mullá Ḥusayn, come back from Iṣfahán and Mashhad, takes
 *   the player with him (`frJoinedHusayn`).
 * - retreat (late January to March 1844): forty days of prayer and fasting
 *   in the Masjid of Kúfih, to the chapter's close (`forerunnersComplete`).
 */

export const frTeaching = (f: FlagState) => !f.frKazimDied;
export const frMourning = (f: FlagState) => !!f.frKazimDied;

const count = (f: FlagState, flags: readonly string[]) => flags.filter(k => !!f[k]).length;

/** What the player sees of the mourning before Mullá Ḥusayn comes home. */
export const MOURNING_ROUNDS = ['frSatAtEmptyPlace', 'frHeardStayers', 'frHeardSeeker', 'frMournedWithWaterSeller'] as const;
export const MOURNING_NEEDED = 2;
export const mourningRounds = (f: FlagState) => count(f, MOURNING_ROUNDS);
export const husaynHome = (f: FlagState) => mourningRounds(f) >= MOURNING_NEEDED;

/** The forty days at Kúfih, before Mullá Ḥusayn comes out of his cell. */
export const RETREAT_ROUNDS = ['frKufihBrother', 'frKufihNephew', 'frKufihKeeper', 'frKeptFast'] as const;
export const RETREAT_NEEDED = 3;
export const retreatRounds = (f: FlagState) => count(f, RETREAT_ROUNDS);
export const fortiethDay = (f: FlagState) => retreatRounds(f) >= RETREAT_NEEDED;
