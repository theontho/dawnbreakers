import type { DialogueTree } from '../../dialogue/types';
import { qazvinHouseDialogues } from './qazvin_house';
import { qazvinKarbilaDialogues } from './qazvin_karbila';
import { qazvinLaneDialogues } from './qazvin_lane';
import { qazvinNightDialogues } from './qazvin_night';

/**
 * The Solace of the Eyes: Qurratu'l-ʿAyn from Karbilá to Qazvín, 1845 to
 * 1848. The curtain in the house of Siyyid Káẓim is in `qazvin_karbila.ts`;
 * the lane after Mullá Taqí's murder in `qazvin_lane.ts`; her father's house
 * and the closed door in `qazvin_house.ts`; the night of the rescue in
 * `qazvin_night.ts`. Phases are described in `src/data/maps/qazvinPhases.ts`.
 */
export const qazvinDialogues: Record<string, DialogueTree> = {
  ...qazvinKarbilaDialogues,
  ...qazvinLaneDialogues,
  ...qazvinHouseDialogues,
  ...qazvinNightDialogues,
};
