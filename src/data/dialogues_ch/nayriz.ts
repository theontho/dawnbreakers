import type { DialogueTree } from '../../dialogue/types';
import { nayrizEndDialogues } from './nayriz_end';
import { nayrizFortDialogues } from './nayriz_fort';
import { nayrizMosqueDialogues } from './nayriz_mosque';
import { nayrizQuarterDialogues } from './nayriz_quarter';

/**
 * Nayríz, May and June 1850. The quarter of Chinár-Súkhtih, from Vaḥíd's
 * arrival to the night of the muskets, is in `nayriz_quarter.ts`; his sermon
 * and the letter in `nayriz_mosque.ts`; the fort of Khájih from the siege to
 * the letter from the camp in `nayriz_fort.ts`; the quarter at dusk and the
 * chapter's close in `nayriz_end.ts`. Phases are described in
 * `src/data/maps/nayrizPhases.ts`.
 */
export const nayrizDialogues: Record<string, DialogueTree> = {
  ...nayrizQuarterDialogues,
  ...nayrizMosqueDialogues,
  ...nayrizFortDialogues,
  ...nayrizEndDialogues,
};
