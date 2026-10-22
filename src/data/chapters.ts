import type { FlagState } from '../dialogue/types';
import { CHAPTER_STORIES } from './story';
import type { ChapterStory } from './story/types';

export type ChapterId =
  | 'shiraz'
  | 'road'
  | 'mecca'
  | 'shiraz-return'
  | 'isfahan'
  | 'mountain-prisons'
  | 'badasht'
  | 'tabarsi'
  | 'tabriz'
  | 'siyah-chal';

/**
 * Flag name that, when truthy, marks the corresponding chapter "complete".
 * Centralised so chapter predicates and dialogue effects can't drift apart:
 * if you add a chapter, add its completion flag here, and the dialogue lint
 * script will check that some `effect.set` actually produces it.
 */
export const CHAPTER_COMPLETION_FLAGS: Record<ChapterId, string> = {
  shiraz: 'shirazComplete',
  road: 'roadComplete',
  mecca: 'meccaComplete',
  'shiraz-return': 'houseArrestComplete',
  isfahan: 'isfahanComplete',
  'mountain-prisons': 'bayanComplete',
  badasht: 'badashtComplete',
  tabarsi: 'tabarsiComplete',
  tabriz: 'martyrdomComplete',
  'siyah-chal': 'dawnComplete',
};

function chapterIsComplete(id: ChapterId, flags: FlagState): boolean {
  return !!flags[CHAPTER_COMPLETION_FLAGS[id]];
}

export interface Chapter {
  id: ChapterId;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  /** First scene shown when entering this chapter. */
  startScene: string;
  startSpawnX?: number;
  startSpawnY?: number;
  /** All scene keys that belong to this chapter. */
  scenes: string[];
  /** Objectives for the HUD tracker and journal entries for this chapter. */
  story: ChapterStory;
  /** Returns true when the chapter is finished, based on flags. */
  isComplete: (flags: FlagState) => boolean;
}

type ChapterSpec = Omit<Chapter, 'isComplete'>;

const SPECS: ChapterSpec[] = [
  {
    id: 'shiraz',
    number: 1,
    story: CHAPTER_STORIES['shiraz'],
    title: 'The Cup of Recognition',
    subtitle: 'Shíráz, 22 May 1844',
    description: 'You arrive in Shíráz with Mullá Ḥusayn, hear what the city whispers of a young Siyyid, and keep vigil at a lamplit door through the night the new age begins.',
    startScene: 'City',
    scenes: ['City', 'Ch1IlkhaniMosque', 'HouseQuarter'],
  },
  {
    id: 'road',
    number: 2,
    story: CHAPTER_STORIES['road'],
    title: 'The Letters Disperse',
    subtitle: 'Beyond the Qur\'án Gate, summer 1844',
    description: 'The Letters of the Living set out from Shíráz in every direction, bidden to proclaim that the Gate has opened without yet speaking His name. You see them off, and a stranger on the road asks you the one thing you may not say.',
    startScene: 'Road',
    scenes: ['Road', 'Ch2Caravanserai'],
  },
  {
    id: 'mecca',
    number: 3,
    story: CHAPTER_STORIES['mecca'],
    title: 'Pilgrimage to Mecca',
    subtitle: 'The Kaʿba, 1844 to 1845',
    description: 'A storm-tossed voyage from Búshihr with Quddús and Mubárak, a lamp that never goes out, and a proclamation by the door of the Kaʿba that almost no one hears.',
    startScene: 'Ch3Ship',
    scenes: ['Ch3Ship', 'Ch3ShipCabin', 'Ch3Mecca'],
  },
  {
    id: 'shiraz-return',
    number: 4,
    story: CHAPTER_STORIES['shiraz-return'],
    title: 'Return to Shíráz',
    subtitle: 'Shíráz, 1845 to 1846',
    description: 'Quddús and Mullá Ṣádiq are paraded for sounding a new call, the Báb is summoned to the pulpit of the Vakíl Mosque, and a learned envoy of the Sháh comes to judge Him and is himself won.',
    startScene: 'Ch4ShirazReturn',
    scenes: ['Ch4ShirazReturn', 'Ch4VakilMosque'],
  },
  {
    id: 'isfahan',
    number: 5,
    story: CHAPTER_STORIES['isfahan'],
    title: 'The Muʿtamid’s Sanctuary',
    subtitle: 'Iṣfahán, 1846 to 1847',
    description: 'Across the river, an Imám-Jumʿih pours water for his Guest, a hard old governor finds one thing worth doing, and the divines of Iṣfahán sign what they would not come to debate.',
    startScene: 'Ch5IsfahanBridge',
    scenes: ['Ch5IsfahanBridge', 'Ch5MutamidPalace', 'Ch5ReceptionRoom'],
  },
  {
    id: 'mountain-prisons',
    number: 6,
    story: CHAPTER_STORIES['mountain-prisons'],
    title: 'The Mountain Prisons',
    subtitle: 'Mákú and Chihríq, 1847–1848',
    description: 'Snow on the ramparts of Mákú and Chihríq. A warden asks forgiveness, Mullá Ḥusayn arrives on foot from Mashhad, and in a prison without a lamp the Bayán is written down.',
    startScene: 'Ch6Maku',
    scenes: ['Ch6Maku', 'Ch6MakuChamber', 'Ch6Chihriq'],
  },
  {
    id: 'badasht',
    number: 7,
    story: CHAPTER_STORIES['badasht'],
    title: 'The Conference of Badasht',
    subtitle: 'Three gardens, summer 1848',
    description: 'Eighty-one believers gather in three rented gardens. Each day brings a new name; one day brings a proclamation that breaks with the past, and Bahá’u’lláh draws the shaken friends back together.',
    startScene: 'Ch7BadashtHamlet',
    scenes: ['Ch7BadashtHamlet', 'Ch7BadashtCamp', 'Ch7QuddusTent'],
  },
  {
    id: 'tabarsi',
    number: 8,
    story: CHAPTER_STORIES['tabarsi'],
    title: 'Fort Shaykh Ṭabarsí',
    subtitle: 'Mázindarán, 1848 to 1849',
    description: 'You find Mullá Ḥusayn and the Black Standard in the autumn forests of Mázindarán, raise walls around a forest shrine, and keep faith through a winter of siege and hunger until an oath sworn on the Qur\'án is broken.',
    startScene: 'Ch8ForestRoad',
    scenes: ['Ch8ForestRoad', 'Ch8TabarsiFort', 'Ch8TabarsiShrine'],
  },
  {
    id: 'tabriz',
    number: 9,
    story: CHAPTER_STORIES['tabriz'],
    title: 'Tabríz',
    subtitle: 'The barrack square, 9 July 1850',
    description: 'In the noon heat of Tabríz you hear the square, meet Anís and the Christian colonel Sám Khán, and keep watch from the rooftops on the day the Báb is martyred.',
    startScene: 'Ch9TabrizSquare',
    scenes: ['Ch9TabrizSquare', 'Ch9BarrackRoof'],
  },
  {
    id: 'siyah-chal',
    number: 10,
    story: CHAPTER_STORIES['siyah-chal'],
    title: 'The Black Pit of Ṭihrán',
    subtitle: 'Ṭihrán, August 1852 to January 1853',
    description: 'Chained among the prisoners of the Síyáh-Chál, you keep a second vigil in the dark, where the hidden dawn of Bahá’u’lláh’s mission breaks unseen, and follow His exiles’ tracks west in the snow.',
    startScene: 'Ch10TehranStreet',
    scenes: ['Ch10TehranStreet', 'Ch10SiyahChal', 'Ch10ExileRoad'],
  },
];

export const chapters: Chapter[] = SPECS.map(spec => ({
  ...spec,
  isComplete: (flags: FlagState) => chapterIsComplete(spec.id, flags),
}));

export function chapterByScene(sceneKey: string): Chapter | undefined {
  return chapters.find(c => c.scenes.includes(sceneKey));
}

export function chapterById(id: ChapterId): Chapter | undefined {
  return chapters.find(c => c.id === id);
}

export function nextChapter(chapter: Chapter): Chapter | undefined {
  return chapters.find(c => c.number === chapter.number + 1);
}
