import type { FlagState } from '../../dialogue/types';

/**
 * The Bárfurúsh chapter runs through one Friday and the two days after it,
 * October 1848 (Nabíl, EN ch. XIX), and its four maps move through phases
 * by flag:
 *
 * - the road, a farsang south of the town: dawn in the companions' camp
 *   until Mullá Ḥusayn bids them cast down what they carry (`bfCastAway`),
 *   the town coming out over the rice fields, and the clash (`bfClash`);
 * - the Sabzih-Maydán: Mullá Ḥusayn at the Saʿídu'l-ʿUlamá's gate, then
 *   the errands for bread and water, until the caravanserai's gates are
 *   shut (`bfGatesShut`);
 * - the caravanserai at sunset: the call to prayer from the roof, three
 *   times (`bfFirstFell`, `bfSecondFell`, `bfThirdFell`); the notables'
 *   oath on the Qur'án and the night (`bfOathSworn`); dawn, and Khusraw's
 *   horsemen in the square (`bfMetKhusraw`);
 * - the forest toward Shír-Gáh: the turn off the open road and the ambush
 *   (`bfAmbush`), Mullá Ḥusayn at prayer (`bfSawPrayer`), Khusraw's end
 *   (`bfKhusrawDead`), the night (`bfAttendantSent`, `bfSlept`), and dawn
 *   on the last maydán to the shrine (`barfurushComplete`).
 */

export const bfDawn = (f: FlagState) => !f.bfClash;
export const bfTownComing = (f: FlagState) => !!f.bfCastAway && !f.bfClash;

/** The Sabzih-Maydán by day, before the gates are shut. */
export const bfSquareDay = (f: FlagState) => !f.bfGatesShut;
/** Shut in the caravanserai, before the third call. */
export const bfShutIn = (f: FlagState) => !!f.bfGatesShut && !f.bfThirdFell;
/** The evening the notables came, until the oath and the night. */
export const bfEvening = (f: FlagState) => !!f.bfThirdFell && !f.bfOathSworn;
/** The morning after: the escort in the square. */
export const bfMorning = (f: FlagState) => !!f.bfOathSworn;

/** The errands Mullá Ḥusayn sends the player on in the square. */
export const ERRANDS = ['bfAskedBread', 'bfAskedWater'] as const;
export const errandsDone = (f: FlagState) => ERRANDS.filter(k => !!f[k]).length;

/** How many have climbed to the roof. */
export const fallenOnRoof = (f: FlagState) => (f.bfThirdFell ? 3 : f.bfSecondFell ? 2 : f.bfFirstFell ? 1 : 0);

export const bfRiding = (f: FlagState) => !f.bfAmbush;
export const bfHalted = (f: FlagState) => !!f.bfAmbush && !f.bfKhusrawDead;
export const bfForestNight = (f: FlagState) => !!f.bfKhusrawDead && !f.bfSlept;
export const bfForestDawn = (f: FlagState) => !!f.bfSlept;
