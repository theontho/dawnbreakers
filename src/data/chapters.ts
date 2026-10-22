import type { FlagState } from '../dialogue/types';
import { CHAPTER_STORIES } from './story';
import type { ChapterStory } from './story/types';

export type ChapterId =
  | 'shiraz'
  | 'road'
  | 'tehran-nur'
  | 'mecca'
  | 'shiraz-return'
  | 'isfahan'
  | 'kashan-kulayn'
  | 'mountain-prisons'
  | 'tahirih'
  | 'badasht'
  | 'tabriz-trial'
  | 'tabarsi'
  | 'nayriz'
  | 'tabriz'
  | 'zanjan'
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
  'tehran-nur': 'nurComplete',
  mecca: 'meccaComplete',
  'shiraz-return': 'houseArrestComplete',
  isfahan: 'isfahanComplete',
  'kashan-kulayn': 'kulaynComplete',
  'mountain-prisons': 'bayanComplete',
  tahirih: 'qazvinComplete',
  badasht: 'badashtComplete',
  'tabriz-trial': 'trialComplete',
  tabarsi: 'tabarsiComplete',
  nayriz: 'nayrizComplete',
  tabriz: 'martyrdomComplete',
  zanjan: 'zanjanComplete',
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

/** A chapter as written below; its number is its place in the list. */
type ChapterSpec = Omit<Chapter, 'isComplete' | 'number'>;

const SPECS: ChapterSpec[] = [
  {
    id: 'shiraz',
    story: CHAPTER_STORIES['shiraz'],
    title: 'The Cup of Recognition',
    subtitle: 'Shíráz, 22 May 1844',
    description: 'You arrive in Shíráz with Mullá Ḥusayn, hear what the city whispers of a young Siyyid, and keep vigil at a lamplit door through the night the new age begins.',
    startScene: 'City',
    scenes: ['City', 'Ch1IlkhaniMosque', 'HouseQuarter'],
  },
  {
    id: 'road',
    story: CHAPTER_STORIES['road'],
    title: 'The Letters Disperse',
    subtitle: 'Beyond the Qur\'án Gate, summer 1844',
    description: 'The Letters of the Living set out from Shíráz in every direction, bidden to proclaim that the Gate has opened without yet speaking His name. You see them off, and a stranger on the road asks you the one thing you may not say.',
    startScene: 'Road',
    scenes: ['Road', 'Ch2Caravanserai'],
  },
  {
    id: 'tehran-nur',
    story: CHAPTER_STORIES['tehran-nur'],
    title: 'Ṭihrán and Núr',
    subtitle: 'Ṭihrán and Mázindarán, 1844',
    description: 'You follow Mullá Ḥusayn north to Ṭihrán, where a Shaykhí teacher turns him away and a tutor from Núr knocks at his door at midnight. At dawn a scroll goes in at a door you may not enter, and in the green hills of Núr you hear how a whole district was won.',
    startScene: 'NurMadrasa',
    scenes: ['NurMadrasa', 'NurLane', 'NurTakur'],
  },
  {
    id: 'mecca',
    story: CHAPTER_STORIES['mecca'],
    title: 'Pilgrimage to Mecca',
    subtitle: 'The Kaʿba, 1844 to 1845',
    description: 'A storm-tossed voyage from Búshihr with Quddús and Mubárak, a lamp that never goes out, and a proclamation by the door of the Kaʿba that almost no one hears.',
    startScene: 'Ch3Ship',
    scenes: ['Ch3Ship', 'Ch3ShipCabin', 'Ch3Mecca'],
  },
  {
    id: 'shiraz-return',
    story: CHAPTER_STORIES['shiraz-return'],
    title: 'Return to Shíráz',
    subtitle: 'Shíráz, 1845 to 1846',
    description: 'Quddús and Mullá Ṣádiq are paraded for sounding a new call, the Báb is summoned to the pulpit of the Vakíl Mosque, and a learned envoy of the Sháh comes to judge Him and is himself won.',
    startScene: 'Ch4ShirazReturn',
    scenes: ['Ch4ShirazReturn', 'Ch4VakilMosque'],
  },
  {
    id: 'isfahan',
    story: CHAPTER_STORIES['isfahan'],
    title: 'The Muʿtamid’s Sanctuary',
    subtitle: 'Iṣfahán, 1846 to 1847',
    description: 'Across the river, an Imám-Jumʿih pours water for his Guest, a hard old governor finds one thing worth doing, and the divines of Iṣfahán sign what they would not come to debate.',
    startScene: 'Ch5IsfahanBridge',
    scenes: ['Ch5IsfahanBridge', 'Ch5MutamidPalace', 'Ch5ReceptionRoom'],
  },
  {
    id: 'kashan-kulayn',
    story: CHAPTER_STORIES['kashan-kulayn'],
    title: 'Káshán and Kulayn',
    subtitle: 'The road toward Ṭihrán, spring 1847',
    description: 'On the eve of Naw-Rúz a silk merchant waits at the gate of Káshán for the Guest he saw in a dream. Three nights in his house, then a red tent among almond orchards half a day from the capital, a sealed letter from Bahá’u’lláh, and an order that turns the road toward the mountains.',
    startScene: 'KulaynKashan',
    scenes: ['KulaynKashan', 'KulaynHouse', 'KulaynCamp'],
  },
  {
    id: 'mountain-prisons',
    story: CHAPTER_STORIES['mountain-prisons'],
    title: 'The Mountain Prisons',
    subtitle: 'Mákú and Chihríq, 1847 to 1848',
    description: 'Snow on the ramparts of Mákú and Chihríq. A warden asks forgiveness, Mullá Ḥusayn arrives on foot from Mashhad, and in a prison without a lamp the Bayán is written down.',
    startScene: 'Ch6Maku',
    scenes: ['Ch6Maku', 'Ch6MakuChamber', 'Ch6Chihriq'],
  },
  {
    id: 'tahirih',
    story: CHAPTER_STORIES['tahirih'],
    title: 'The Solace of the Eyes',
    subtitle: 'Karbilá and Qazvín, 1845 to 1848',
    description: 'Go back to Karbilá, where a woman who never saw the Báb teaches His Cause from behind a curtain. Follow her home to Qazvín, where her uncle is struck down at dawn prayer and she is shut in her father\'s house, and keep watch in the lane on the night a beggar woman comes to the gate.',
    startScene: 'QazvinKarbila',
    scenes: ['QazvinKarbila', 'QazvinLane', 'QazvinHouse'],
  },
  {
    id: 'badasht',
    story: CHAPTER_STORIES['badasht'],
    title: 'The Conference of Badasht',
    subtitle: 'Three gardens, summer 1848',
    description: 'Eighty-one believers gather in three rented gardens. Each day brings a new name; one day brings a proclamation that breaks with the past, and Bahá’u’lláh draws the shaken friends back together.',
    startScene: 'Ch7BadashtHamlet',
    scenes: ['Ch7BadashtHamlet', 'Ch7BadashtCamp', 'Ch7QuddusTent'],
  },
  {
    id: 'tabriz-trial', // renumbered by the manager
    story: CHAPTER_STORIES['tabriz-trial'],
    title: 'The Trial at Tabríz',
    subtitle: 'Tabríz, summer 1848',
    description: 'Brought down from Chihríq, the Báb is examined before the Crown Prince and the divines of Ádhirbáyján. You carry coffee in the residence courtyard, wait at the foot of the hall steps, and hear from those who come out what was declared within.',
    startScene: 'TrialStreet',
    scenes: ['TrialStreet', 'TrialCourt', 'TrialLane'],
  },
  {
    id: 'tabarsi',
    story: CHAPTER_STORIES['tabarsi'],
    title: 'Fort Shaykh Ṭabarsí',
    subtitle: 'Mázindarán, 1848 to 1849',
    description: 'You find Mullá Ḥusayn and the Black Standard in the autumn forests of Mázindarán, raise walls around a forest shrine, and keep faith through a winter of siege and hunger until an oath sworn on the Qur\'án is broken.',
    startScene: 'Ch8ForestRoad',
    scenes: ['Ch8ForestRoad', 'Ch8TabarsiFort', 'Ch8TabarsiShrine'],
  },
  {
    id: 'nayriz',
    story: CHAPTER_STORIES['nayriz'],
    title: 'Nayríz',
    subtitle: 'Fárs, May and June 1850',
    description: 'In the quarter of the burnt plane tree, Vaḥíd comes in from the road and goes straight to the masjid. You carry his letter to a wounded old man, follow him up to the fort of Khájih, dig a cistern when the water is cut, and carry a sealed Qur\'án across the court to him.',
    startScene: 'NayrizQuarter',
    scenes: ['NayrizQuarter', 'NayrizMosque', 'NayrizFort'],
  },
  {
    id: 'tabriz',
    story: CHAPTER_STORIES['tabriz'],
    title: 'Tabríz',
    subtitle: 'The barrack square, 9 July 1850',
    description: 'In the noon heat of Tabríz you hear the square, meet Anís and the Christian colonel Sám Khán, and keep watch from the rooftops on the day the Báb is martyred.',
    startScene: 'Ch9TabrizSquare',
    scenes: ['Ch9TabrizSquare', 'Ch9BarrackRoof'],
  },
  {
    id: 'zanjan', // renumbered by the manager
    story: CHAPTER_STORIES['zanjan'],
    title: 'Zanján',
    subtitle: 'The fort of ʿAlí-Mardán Khán, 1850 to 1851',
    description: 'You carry the news of Tabríz by night into the barricaded quarter of Ḥujjat, where some three thousand believers have held out since the spring. You bake with the women, keep watch with a girl in a man\'s coat, see children sent out with a sealed Qur\'án, and stay through the winter to the end.',
    startScene: 'ZanjanQuarter',
    scenes: ['ZanjanQuarter', 'ZanjanFort', 'ZanjanHouse'],
  },
  {
    id: 'siyah-chal',
    story: CHAPTER_STORIES['siyah-chal'],
    title: 'The Black Pit of Ṭihrán',
    subtitle: 'Ṭihrán, August 1852 to January 1853',
    description: 'Chained among the prisoners of the Síyáh-Chál, you keep a second vigil in the dark, where the hidden dawn of Bahá’u’lláh’s mission breaks unseen, and follow His exiles’ tracks west in the snow.',
    startScene: 'Ch10TehranStreet',
    scenes: ['Ch10TehranStreet', 'Ch10SiyahChal', 'Ch10ExileRoad'],
  },
];

export const chapters: Chapter[] = SPECS.map((spec, i) => ({
  ...spec,
  number: i + 1,
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
