import type { DialogueTree } from '../../dialogue/types';
import { karbilaCourtDialogues } from './karbila_court';
import { karbilaGrovesDialogues } from './karbila_groves';
import { karbilaLaneDialogues } from './karbila_lane';
import { karbilaRoadDialogues } from './karbila_road';

/**
 * Karbilá, summer 1851 to spring 1852. The palm groves on the canal, the
 * water-seller and the old classmate are in `karbila_groves.ts`, and the
 * traveller from Mázindarán who came down from Ṭihrán with Bahá'u'lláh in
 * `karbila_road.ts`; the square
 * before the shrine gate and Shaykh Ḥasan-i-Zunúzí in `karbila_court.ts`;
 * the lane and the house where Bahá'u'lláh stayed in `karbila_lane.ts`.
 * Phases are described in `src/data/maps/karbilaPhases.ts`.
 */
export const karbilaDialogues: Record<string, DialogueTree> = {
  ...karbilaGrovesDialogues,
  ...karbilaRoadDialogues,
  ...karbilaCourtDialogues,
  ...karbilaLaneDialogues,
};
