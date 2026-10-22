import type { ChapterId } from '../chapters';
import { chapter01Story } from './chapter01';
import { chapter02Story } from './chapter02';
import { chapter03Story } from './chapter03';
import { chapter04Story } from './chapter04';
import { chapter05Story } from './chapter05';
import { chapter06Story } from './chapter06';
import { chapter07Story } from './chapter07';
import { trialStory } from './trial';
import { chapter08Story } from './chapter08';
import { chapter09Story } from './chapter09';
import { chapter10Story } from './chapter10';
import type { ChapterStory } from './types';

/** Objectives and journal entries, one module per chapter. */
export const CHAPTER_STORIES: Record<ChapterId, ChapterStory> = {
  shiraz: chapter01Story,
  road: chapter02Story,
  mecca: chapter03Story,
  'shiraz-return': chapter04Story,
  isfahan: chapter05Story,
  'mountain-prisons': chapter06Story,
  badasht: chapter07Story,
  'tabriz-trial': trialStory,
  tabarsi: chapter08Story,
  tabriz: chapter09Story,
  'siyah-chal': chapter10Story,
};
