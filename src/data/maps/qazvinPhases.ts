import type { FlagState } from '../../dialogue/types';

/**
 * The Solace of the Eyes moves through three phases by flag, shared by its
 * maps, dialogues and objectives:
 *
 * - Karbilá, the first of Muḥarram (the turn of 1845 into 1846): the house
 *   of the late Siyyid Káẓim, where Qurratu'l-ʿAyn teaches from behind a
 *   curtain; until the city's anger sends her away (`qzLeftKarbila`). The
 *   road from Baghdád through Kirmánsháh and Hamadán is told, not walked.
 * - Qazvín by day (autumn 1847): the days after Mullá Taqí was struck down
 *   at dawn prayer; arrests in the lanes, and Qurratu'l-ʿAyn confined in her
 *   father's house; until her challenge of nine days (`qzNight`).
 * - The night of the rescue (1848): a beggar woman at the gate, three horses
 *   beyond the walls; until she rides for Ṭihrán (`qazvinComplete`).
 */

export const qzNight = (f: FlagState) => !!f.qzNight;
export const qzDay = (f: FlagState) => !f.qzNight;

const count = (f: FlagState, flags: readonly string[]) => flags.filter(k => !!f[k]).length;

/** The listeners in the house of Siyyid Káẓim. */
export const KARBILA_ROUNDS = ['qzHeardCurtain', 'qzMetSalih', 'qzMetDoubter', 'qzSawBrightDress'] as const;
export const KARBILA_NEEDED = 3;
export const karbilaRounds = (f: FlagState) => count(f, KARBILA_ROUNDS);

/** What Qazvín says, and what her father's house holds, after the murder. */
export const QAZVIN_ROUNDS = ['qzHeardDawn', 'qzMetFarrash', 'qzMetFather', 'qzHeardDoor'] as const;
export const QAZVIN_NEEDED = 3;
export const qazvinRounds = (f: FlagState) => count(f, QAZVIN_ROUNDS);
