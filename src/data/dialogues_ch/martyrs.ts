import type { DialogueTree } from '../../dialogue/types';
import { martyrsHouseDialogues } from './martyrs_house';
import { martyrsSeraiDialogues } from './martyrs_serai';
import { martyrsSquareDialogues } from './martyrs_square';

/**
 * The Seven Martyrs of Ṭihrán, February 1850, after Nabíl's chapter of that
 * name: the arrests and the offers to recant (the caravanserai, the house of
 * the Kalántar), the morning (the edge of the crowd in the Sabzih-Maydán),
 * and after (the square on the third evening). The player witnesses from
 * outside; the swept stones end the chapter (`martyrs-swept-stones` sets
 * `martyrsComplete`).
 */
export const martyrsDialogues: Record<string, DialogueTree> = {
  ...martyrsSeraiDialogues,
  ...martyrsHouseDialogues,
  ...martyrsSquareDialogues,
};
