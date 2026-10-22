import type { DialogueTree } from '../../dialogue/types';
import { kulaynCampDialogues } from './kulayn_camp';
import { kulaynGateDialogues } from './kulayn_gate';
import { kulaynHouseDialogues } from './kulayn_house';
import { kulaynTentDialogues } from './kulayn_tent';

/**
 * Káshán and Kulayn, spring 1847: the eve of Naw-Rúz at the gate of
 * ʿAṭṭár, three nights in Ḥájí Mírzá Jání's house, and the waiting days by
 * the Grand Vizier's tent at Kulayn until the Sháh's letter sends the Báb
 * to Mákú. The tent's last scene (`kulayn-tent-struck`) sets
 * `kulaynComplete`.
 */
export const kulaynDialogues: Record<string, DialogueTree> = {
  ...kulaynGateDialogues,
  ...kulaynHouseDialogues,
  ...kulaynCampDialogues,
  ...kulaynTentDialogues,
};
