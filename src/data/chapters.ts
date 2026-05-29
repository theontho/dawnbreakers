import type { FlagState } from '../dialogue/types';

export interface Chapter {
  id: string;
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
  /** Returns true when the chapter is finished, based on flags. */
  isComplete: (flags: FlagState) => boolean;
}

export const chapters: Chapter[] = [
  {
    id: 'shiraz',
    number: 1,
    title: 'The Cup of Recognition',
    subtitle: 'Shíráz, 22 May 1844',
    description: 'A young seeker arrives in Shíráz, hears rumours of a Promised One, and finds himself at the threshold of a house at dusk.',
    startScene: 'City',
    scenes: ['City', 'HouseQuarter'],
    isComplete: f => f.ending !== undefined,
  },
  {
    id: 'road',
    number: 2,
    title: 'The Letters Disperse',
    subtitle: 'On the road from Shíráz',
    description: 'The first to recognise Him are sent forth in eighteen directions. On a dusty road north, a fellow seeker greets you.',
    startScene: 'Road',
    scenes: ['Road'],
    isComplete: f => !!f.roadComplete,
  },
  {
    id: 'mecca',
    number: 3,
    title: 'Pilgrimage to Mecca',
    subtitle: 'The Kaʿba, 1844–1845',
    description: 'A sea passage and a reverent proclamation before the Kaʿba carry the Cause beyond Shíráz.',
    startScene: 'Ch3Ship',
    scenes: ['Ch3Ship', 'Ch3Mecca'],
    isComplete: f => !!f.meccaComplete,
  },
  {
    id: 'shiraz-return',
    number: 4,
    title: 'Return to Shíráz',
    subtitle: 'Opposition gathers, 1845',
    description: 'The city changes around the returning believers as officials, witnesses, and the mosque become stages of trial.',
    startScene: 'Ch4ShirazReturn',
    scenes: ['Ch4ShirazReturn', 'Ch4VakilMosque'],
    isComplete: f => !!f.houseArrestComplete,
  },
  {
    id: 'isfahan',
    number: 5,
    title: 'The Muʿtamid’s Sanctuary',
    subtitle: 'Iṣfahán, 1846–1847',
    description: 'Bridge, palace, and learned council frame the Báb’s stay under Manúchihr Khán’s protection.',
    startScene: 'Ch5IsfahanBridge',
    scenes: ['Ch5IsfahanBridge', 'Ch5MutamidPalace'],
    isComplete: f => !!f.isfahanComplete,
  },
  {
    id: 'mountain-prisons',
    number: 6,
    title: 'The Mountain Prisons',
    subtitle: 'Mákú and Chihríq, 1847–1848',
    description: 'Cold fortresses, softened wardens, and hidden revelation mark the years of confinement.',
    startScene: 'Ch6Maku',
    scenes: ['Ch6Maku', 'Ch6Chihriq'],
    isComplete: f => !!f.bayanComplete,
  },
  {
    id: 'badasht',
    number: 7,
    title: 'The Conference of Badasht',
    subtitle: 'A new dispensation, 1848',
    description: 'Three camps, a shocking proclamation, and Bahá’u’lláh’s reconciling presence reshape the community.',
    startScene: 'Ch7BadashtCamp',
    scenes: ['Ch7BadashtCamp'],
    isComplete: f => !!f.badashtComplete,
  },
  {
    id: 'tabarsi',
    number: 8,
    title: 'Fort Shaykh Ṭabarsí',
    subtitle: 'Mazandaran, 1848–1849',
    description: 'Forest road and shrine-fort tell a story of steadfastness through counsel, truce, and betrayal.',
    startScene: 'Ch8ForestRoad',
    scenes: ['Ch8ForestRoad', 'Ch8TabarsiFort'],
    isComplete: f => !!f.tabarsiComplete,
  },
  {
    id: 'tabriz',
    number: 9,
    title: 'Tabríz',
    subtitle: 'The barracks square, July 1850',
    description: 'Sám Khán, the gathered witnesses, and a grave final testimony frame the martyrdom of the Báb.',
    startScene: 'Ch9TabrizSquare',
    scenes: ['Ch9TabrizSquare', 'Ch9BarrackRoof'],
    isComplete: f => !!f.martyrdomComplete,
  },
  {
    id: 'siyah-chal',
    number: 10,
    title: 'The Black Pit of Tihrán',
    subtitle: 'Síyáh-Chál, 1852',
    description: 'A descent into darkness becomes the hidden dawn of Bahá’u’lláh’s mission.',
    startScene: 'Ch10TehranStreet',
    scenes: ['Ch10TehranStreet', 'Ch10SiyahChal'],
    isComplete: f => !!f.dawnComplete,
  },
];

export function chapterByScene(sceneKey: string): Chapter | undefined {
  return chapters.find(c => c.scenes.includes(sceneKey));
}

export function chapterById(id: string): Chapter | undefined {
  return chapters.find(c => c.id === id);
}

export function nextChapter(chapter: Chapter): Chapter | undefined {
  return chapters.find(c => c.number === chapter.number + 1);
}
