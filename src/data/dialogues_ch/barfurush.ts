import type { DialogueTree } from '../../dialogue/types';
import { barfurushForestDialogues } from './barfurush_forest';
import { barfurushMaydanDialogues } from './barfurush_maydan';
import { barfurushRoadDialogues } from './barfurush_road';
import { barfurushSeraiDialogues } from './barfurush_serai';

/**
 * Bárfurúsh, October 1848. The road across the rice plain, the opening and
 * the clash are in `barfurush_road.ts`; the Sabzih-Maydán and the escort's
 * morning in `barfurush_maydan.ts`; the caravanserai, the three calls from
 * the roof and the oath in `barfurush_serai.ts`; Khusraw's forest and the
 * dawn before the shrine in `barfurush_forest.ts`. Phases are described in
 * `src/data/maps/barfurushPhases.ts`.
 */
export const barfurushDialogues: Record<string, DialogueTree> = {
  ...barfurushRoadDialogues,
  ...barfurushMaydanDialogues,
  ...barfurushSeraiDialogues,
  ...barfurushForestDialogues,
};
