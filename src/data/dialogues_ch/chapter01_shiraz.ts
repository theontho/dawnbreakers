import type { DialogueTree } from '../../dialogue/types';
import { brotherAtIlkhani, mullaHusaynAtGate, mullaHusaynInLane, nightWatchman, thresholdClosed, thresholdVigil } from './chapter01_vigil';
import {
  calligrapherRumour,
  gateGuardRumour,
  merchantRumour,
  mullaWarning,
  neighbourQuiet,
  orphanRumour,
  servantRumour,
  travellerRumour,
  waterCarrierRumour,
} from './chapter01_rumours';
import { chapter01IlkhaniDialogues } from './chapter01_ilkhani';

export { RUMOUR_FLAGS, rumourCount } from './chapter01_rumourFlags';

/** All dialogue trees for Chapter 1, in registry form. */
export const chapter01Dialogues: Record<string, DialogueTree> = {
  [mullaHusaynAtGate.id]: mullaHusaynAtGate,
  [thresholdClosed.id]: thresholdClosed,
  [thresholdVigil.id]:  thresholdVigil,
  [mullaHusaynInLane.id]: mullaHusaynInLane,
  [brotherAtIlkhani.id]: brotherAtIlkhani,
  [nightWatchman.id]: nightWatchman,
  [travellerRumour.id]: travellerRumour,
  [merchantRumour.id]:  merchantRumour,
  [mullaWarning.id]:    mullaWarning,
  [neighbourQuiet.id]:  neighbourQuiet,
  [waterCarrierRumour.id]: waterCarrierRumour,
  [gateGuardRumour.id]:    gateGuardRumour,
  [calligrapherRumour.id]: calligrapherRumour,
  [orphanRumour.id]:       orphanRumour,
  [servantRumour.id]:      servantRumour,
  ...chapter01IlkhaniDialogues,
};
