import type { DialogueTree } from '../dialogue/types';
import { chapter01Dialogues } from './dialogues_ch/chapter01_shiraz';
import { chapter02Dialogues } from './dialogues_ch/chapter02_road';
import { chapter03Dialogues } from './dialogues_ch/chapter03_mecca';
import { chapter04Dialogues } from './dialogues_ch/chapter04_shiraz_return';
import { chapter05Dialogues } from './dialogues_ch/chapter05_isfahan';
import { chapter06Dialogues } from './dialogues_ch/chapter06_mountain_prisons';
import { chapter07Dialogues } from './dialogues_ch/chapter07_badasht';
import { trialDialogues } from './dialogues_ch/trial_tabriz';
import { chapter08Dialogues } from './dialogues_ch/chapter08_tabarsi';
import { chapter09Dialogues } from './dialogues_ch/chapter09_tabriz';
import { chapter10Dialogues } from './dialogues_ch/chapter10_siyah_chal';

/**
 * Global dialogue registry. Each chapter exports its own dialogue map from
 * src/data/dialogues_ch/*.ts; this barrel merges them so scenes can look up
 * trees by id without knowing which chapter they belong to.
 *
 * To add a chapter: create src/data/dialogues_ch/chapterNN_<name>.ts, export
 * a `chapterNNDialogues` record, then import + spread it below.
 *
 * Only the merged `dialogues` map is exported. Individual node trees are an
 * implementation detail of each chapter file.
 */
export const dialogues: Record<string, DialogueTree> = {
  ...chapter01Dialogues,
  ...chapter02Dialogues,
  ...chapter03Dialogues,
  ...chapter04Dialogues,
  ...chapter05Dialogues,
  ...chapter06Dialogues,
  ...chapter07Dialogues,
  ...trialDialogues,
  ...chapter08Dialogues,
  ...chapter09Dialogues,
  ...chapter10Dialogues,
};
