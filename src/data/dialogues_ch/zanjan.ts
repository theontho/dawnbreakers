import type { DialogueTree } from '../../dialogue/types';
import { zanjanCourtDialogues } from './zanjan_court';
import { zanjanHouseDialogues } from './zanjan_house';
import { zanjanHujjatDialogues } from './zanjan_hujjat';
import { zanjanQuarterDialogues } from './zanjan_quarter';

/**
 * Zanján, summer 1850 to January 1851. The barricaded quarter and the sentinel,
 * Zaynab and the soldier are in `zanjan_quarter.ts`; Ḥujjat from the news of
 * the martyrdom to his wound in `zanjan_hujjat.ts`; the fort's court in
 * `zanjan_court.ts`; his house and the chapter's close in `zanjan_house.ts`.
 * Phases are described in `src/data/maps/zanjanPhases.ts`.
 */
export const zanjanDialogues: Record<string, DialogueTree> = {
  ...zanjanQuarterDialogues,
  ...zanjanHujjatDialogues,
  ...zanjanCourtDialogues,
  ...zanjanHouseDialogues,
};
