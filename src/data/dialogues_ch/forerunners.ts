import type { DialogueTree } from '../../dialogue/types';
import { forerunnersHouseDialogues } from './forerunners_house';
import { forerunnersKufihDialogues } from './forerunners_kufih';
import { forerunnersQuarterDialogues } from './forerunners_quarter';
import { forerunnersRoadDialogues } from './forerunners_road';

/**
 * The Forerunners: Karbilá, winter 1843 to 1844 (Nabíl, chapters I and II).
 * The lane, the opening and Mullá Ḥusayn's return are in
 * `forerunners_quarter.ts`; Siyyid Káẓim's teaching room before and after his
 * death in `forerunners_house.ts`; the shepherd at the Masjid of Baráthá in
 * `forerunners_road.ts`; the forty days at Kúfih and the chapter's close in
 * `forerunners_kufih.ts`. Phases are described in
 * `src/data/maps/forerunnersPhases.ts`.
 */
export const forerunnersDialogues: Record<string, DialogueTree> = {
  ...forerunnersQuarterDialogues,
  ...forerunnersHouseDialogues,
  ...forerunnersRoadDialogues,
  ...forerunnersKufihDialogues,
};
