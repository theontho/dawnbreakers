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

/**
 * Flags set by each chapter 1 rumour tree's `onEnter`. The lint script
 * (`scripts/lint-dialogues.mjs`) verifies that every flag in this list is
 * actually produced by some `effect.set` or `onEnter.set` in the dialogue
 * data, so the count and the data can't drift.
 */
export const RUMOUR_FLAGS = [
  'rumourTraveller',
  'rumourMerchant',
  'rumourMulla',
  'rumourNeighbour',
  'heardWaterCarrier',
  'guardWarned',
  'sawCalligraphy',
  'orphanMercy',
  'servantWelcomed',
] as const;

/** Counts how many rumours about the Young Siyyid the player has heard. */
export function rumourCount(flags: Record<string, boolean | number | string>): number {
  return RUMOUR_FLAGS.reduce((count, flag) => count + (flags[flag] ? 1 : 0), 0);
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
