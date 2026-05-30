import type { DialogueTree } from '../../dialogue/types';
import { babDeclaration, babLocked } from './chapter01_declaration';
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

export {
  babDeclaration,
  babLocked,
  calligrapherRumour,
  gateGuardRumour,
  merchantRumour,
  mullaWarning,
  neighbourQuiet,
  orphanRumour,
  servantRumour,
  travellerRumour,
  waterCarrierRumour,
};

/** Counts how many rumours about the Young Siyyid the player has heard. */
export function rumourCount(flags: Record<string, boolean | number | string>): number {
  return (
    (flags.rumourTraveller ? 1 : 0) +
    (flags.rumourMerchant  ? 1 : 0) +
    (flags.rumourMulla     ? 1 : 0) +
    (flags.rumourNeighbour ? 1 : 0) +
    (flags.heardWaterCarrier ? 1 : 0) +
    (flags.guardWarned ? 1 : 0) +
    (flags.sawCalligraphy ? 1 : 0) +
    (flags.orphanMercy ? 1 : 0) +
    (flags.servantWelcomed ? 1 : 0)
  );
}

/** All dialogue trees for Chapter 1, in registry form. */
export const chapter01Dialogues: Record<string, DialogueTree> = {
  [babDeclaration.id]:  babDeclaration,
  [babLocked.id]:       babLocked,
  [travellerRumour.id]: travellerRumour,
  [merchantRumour.id]:  merchantRumour,
  [mullaWarning.id]:    mullaWarning,
  [neighbourQuiet.id]:  neighbourQuiet,
  [waterCarrierRumour.id]: waterCarrierRumour,
  [gateGuardRumour.id]:    gateGuardRumour,
  [calligrapherRumour.id]: calligrapherRumour,
  [orphanRumour.id]:       orphanRumour,
  [servantRumour.id]:      servantRumour,
};

/** Used by Chapter 1 House scene to decide which Báb tree to launch. */
export function babTreeFor(flags: Record<string, boolean | number | string>): DialogueTree {
  return rumourCount(flags) >= 2 ? babDeclaration : babLocked;
}
