import type { DialogueTree } from '../../dialogue/types';
import { trialCourtDialogues } from './trial_court';
import { trialHallDialogues } from './trial_hall';
import { trialLaneDialogues } from './trial_lane';
import { trialStreetDialogues } from './trial_street';

/**
 * The trial at Tabríz, summer 1848: the Báb examined before the Valí-ʿAhd
 * and the divines of Ádhirbáyján, then bastinadoed at the house of the
 * Shaykhu'l-Islám, after Nabíl's chapter XVIII and Dr Cormick's letter.
 * The player waits outside every door; the hall's story ends the chapter
 * (`trial-hall-empty` sets `trialComplete`).
 */
export const trialDialogues: Record<string, DialogueTree> = {
  ...trialStreetDialogues,
  ...trialCourtDialogues,
  ...trialHallDialogues,
  ...trialLaneDialogues,
};
