import type { FlagState } from '../../dialogue/types';

/**
 * The Ṭihrán and Núr chapter moves by flag through one night, one dawn and
 * an autumn in the hills, shared by its maps, dialogues and objectives:
 *
 * - dusk in the madrasa: the player hears how Mullá Ḥusayn has been
 *   received, then waits by his lamp until he comes in (`nurHusaynBack`);
 * - night: the tutor from Núr knocks at midnight and is given the scroll
 *   (`nurScrollGiven`);
 * - dawn in the lane: the tutor goes in at the gate of the house of the
 *   late Mírzá Buzurg (`nurTutorWentIn`), comes out with the answer and the
 *   gifts (`nurGiftCarried`);
 * - morning in the madrasa: Mullá Ḥusayn receives them, and some days later
 *   takes the road to Khurásán (`nurHusaynFarewell`);
 * - Tákur in autumn: the village tells what it heard, the mujtahid's envoys
 *   ride after Him (`nurEnvoysSent`), word comes back of what befell them
 *   (`nurHeardGroom`), and the chapter closes at the empty house
 *   (`nurComplete`).
 */

export const has = (flag: string) => (f: FlagState) => !!f[flag];
export const not = (flag: string) => (f: FlagState) => !f[flag];
export const both = (a: (f: FlagState) => boolean, b: (f: FlagState) => boolean) => (f: FlagState) => a(f) && b(f);

const count = (f: FlagState, flags: readonly string[]) => flags.filter(k => !!f[k]).length;

/** The madrasa's people the player hears before Mullá Ḥusayn comes in. */
export const MADRASA_ROUNDS = ['nurHeardHaji', 'nurMetTutor'] as const;
export const madrasaRounds = (f: FlagState) => count(f, MADRASA_ROUNDS);

/** The lane's people the player talks with while the tutor is within. */
export const LANE_ROUNDS = ['nurHeardBaker', 'nurHeardPoorMan'] as const;
export const laneRounds = (f: FlagState) => count(f, LANE_ROUNDS);

/** The villagers of Tákur heard before the mujtahid's envoys ride in. */
export const VILLAGE_ROUNDS = ['nurHeardWoman', 'nurHeardElder'] as const;
export const villageRounds = (f: FlagState) => count(f, VILLAGE_ROUNDS);

/** The madrasa's hours: dusk, the night of the scroll, the morning of the gift. */
export const madrasaNight = both(has('nurHusaynBack'), not('nurGiftCarried'));
export const madrasaMorning = has('nurGiftCarried');
