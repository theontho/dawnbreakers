import type { FlagState } from '../../dialogue/types';

/**
 * The Nayríz chapter moves through four phases by flag, shared by its maps,
 * dialogues and objectives:
 *
 * - arrival (15 Rajab 1266, 27 May 1850, forenoon): Vaḥíd comes into
 *   Chinár-Súkhtih and goes straight to its masjid; until the player hears
 *   him there (`nzHeardSermon`);
 * - gathering (the days after, and a night): the governor is back in his
 *   house in the Bázár quarter with a thousand men on its roofs; until the
 *   player follows Vaḥíd up to the fort of Khájih at dawn (`nzToFort`);
 * - siege (June): inside the fort; until Vaḥíd accepts the sealed Qur'án and
 *   goes down to the camp (`nzOathAccepted`);
 * - after: the letter, the empty fort, the quarter at dusk, and the chapter's
 *   close (`nayrizComplete`).
 */

export const nzArrival = (f: FlagState) => !f.nzHeardSermon;
export const nzGathering = (f: FlagState) => !!f.nzHeardSermon && !f.nzToFort;
export const nzSiege = (f: FlagState) => !!f.nzToFort && !f.nzOathAccepted;
export const nzAfter = (f: FlagState) => !!f.nzOathAccepted;

const count = (f: FlagState, flags: readonly string[]) => flags.filter(k => !!f[k]).length;

/** The people of the quarter the player meets before the masjid. */
export const ARRIVAL_ROUNDS = ['nzMetBoy', 'nzHeardWoman', 'nzMetElder'] as const;
export const ARRIVAL_NEEDED = 2;
export const arrivalRounds = (f: FlagState) => count(f, ARRIVAL_ROUNDS);

/** What the player sees of the fort before the sealed Qur'án comes. */
export const SIEGE_ROUNDS = ['nzMetChronicler', 'nzDugCistern', 'nzMetGatekeeper', 'nzHeardRooftops'] as const;
export const SIEGE_NEEDED = 3;
export const siegeRounds = (f: FlagState) => count(f, SIEGE_ROUNDS);
