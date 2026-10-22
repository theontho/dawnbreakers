import type { FlagState } from '../../dialogue/types';

/**
 * Káshán and Kulayn, spring 1847, moves by flag through these beats, shared
 * by the maps, dialogues and objectives:
 *
 * - the gate of ʿAṭṭár at dusk on the eve of Naw-Rúz: the riders come
 *   (`kulaynRidersCame`), the officers settle the three nights
 *   (`kulaynLeave`), the host asks the player in (`kulaynInvited`);
 * - the house by night, until the third morning (`kulaynFarewell`);
 * - the gate in the morning, the escort ready to ride (`kulaynRideNorth`);
 * - Kulayn: the arrival (`kulaynCampArrived`), the waiting days, the letter
 *   from Bahá'u'lláh (`kulaynLetter`), the order from the capital
 *   (`kulaynOrder`), the tent struck (`kulaynComplete`).
 */

export const has = (flag: string) => (f: FlagState) => !!f[flag];
export const not = (flag: string) => (f: FlagState) => !f[flag];
export const both = (a: (f: FlagState) => boolean, b: (f: FlagState) => boolean) => (f: FlagState) => a(f) && b(f);

const count = (f: FlagState, flags: readonly string[]) => flags.filter(k => !!f[k]).length;

/** The waiting days at Kulayn: the village, the companions, the letter. */
export const WAITING_DAYS = ['kulaynHeardVillager', 'kulaynCompanions', 'kulaynLetter'] as const;
export const waitingDays = (f: FlagState) => count(f, WAITING_DAYS);

/** What the companions tell after the letter, before the order is read. */
export const COMPANION_TALES = ['kulaynHeardKandi', 'kulaynHeardMoonlit'] as const;
export const companionTales = (f: FlagState) => count(f, COMPANION_TALES);

/** The bearer of the letter comes once the village and the companions have been heard. */
export const letterDue = (f: FlagState) => !!f.kulaynCompanions && !!f.kulaynHeardVillager;
