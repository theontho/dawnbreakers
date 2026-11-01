import type { DialogueTree } from '../../dialogue/types';
import { baghdadEndDialogues } from './baghdad_end';
import { baghdadPrisonDialogues } from './baghdad_prison';
import { baghdadQuayDialogues } from './baghdad_quay';
import { baghdadSeraiDialogues } from './baghdad_serai';

/**
 * The Trial at Baghdád, January 1845. The quay below the serai, morning and
 * evening, is in `baghdad_quay.ts`; the tribunal in the serai's hall in
 * `baghdad_serai.ts`; the prison through the winter in `baghdad_prison.ts`;
 * the morning Mullá ʿAlí is led away, and the chapter's close, in
 * `baghdad_end.ts`. Phases are described in `src/data/maps/baghdadPhases.ts`.
 */
export const baghdadDialogues: Record<string, DialogueTree> = {
  ...baghdadQuayDialogues,
  ...baghdadSeraiDialogues,
  ...baghdadPrisonDialogues,
  ...baghdadEndDialogues,
};
