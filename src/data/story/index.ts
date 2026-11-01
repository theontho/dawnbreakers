import type { ChapterId } from '../chapters';
import { forerunnersStory } from './forerunners';
import { chapter01Story } from './chapter01';
import { chapter02Story } from './chapter02';
import { nurStory } from './nur';
import { chapter03Story } from './chapter03';
import { baghdadStory } from './baghdad';
import { chapter04Story } from './chapter04';
import { chapter05Story } from './chapter05';
import { kulaynStory } from './kulayn';
import { chapter06Story } from './chapter06';
import { qazvinStory } from './qazvin';
import { chapter07Story } from './chapter07';
import { trialStory } from './trial';
import { chapter08Story } from './chapter08';
import { martyrsStory } from './martyrs';
import { nayrizStory } from './nayriz';
import { chapter09Story } from './chapter09';
import { zanjanStory } from './zanjan';
import { karbilaStory } from './karbila';
import { chapter10Story } from './chapter10';
import type { ChapterStory } from './types';

/** Objectives and journal entries, one module per chapter. */
export const CHAPTER_STORIES: Record<ChapterId, ChapterStory> = {
  forerunners: forerunnersStory,
  shiraz: chapter01Story,
  road: chapter02Story,
  'tehran-nur': nurStory,
  mecca: chapter03Story,
  baghdad: baghdadStory,
  'shiraz-return': chapter04Story,
  isfahan: chapter05Story,
  'kashan-kulayn': kulaynStory,
  'mountain-prisons': chapter06Story,
  tahirih: qazvinStory,
  badasht: chapter07Story,
  'tabriz-trial': trialStory,
  tabarsi: chapter08Story,
  'seven-martyrs': martyrsStory,
  nayriz: nayrizStory,
  tabriz: chapter09Story,
  zanjan: zanjanStory,
  karbila: karbilaStory,
  'siyah-chal': chapter10Story,
};
