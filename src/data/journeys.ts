import type { MusicMood, SoundLayer } from '../audio';
import type { ChapterId } from './chapters';

/** The country a journey crosses, which sets its hills, road and props. */
export type JourneyTerrain = 'desert' | 'mountains' | 'forest' | 'snow' | 'lakeside' | 'sea';

/**
 * One figure in the travelling party, drawn side-on and walking to the
 * right. Riders sit on their mount; a `litter` is a covered howdah on a
 * camel, a `standard` a horseman carrying a black banner.
 */
export type TravellerKind =
  | 'walker'
  | 'staff'
  | 'lantern'
  | 'mule'
  | 'packMule'
  | 'rider'
  | 'standard'
  | 'camel'
  | 'litter';

export interface Journey {
  id: string;
  /** The chapter it leaves and the one it leads into. */
  from: ChapterId;
  to: ChapterId;
  title: string;
  /** Where the road runs and when, a short line under the title. */
  subtitle: string;
  /** What the road is for, a sentence or two. */
  description: string;
  /** Where the sky is seen from, in degrees (east positive). */
  latitude: number;
  longitude: number;
  /** When the journey is first seen, in local mean time at that place. */
  departs: { year: number; month: number; day: number; hour: number; minute: number };
  /** How many days the road takes at a caravan's pace, from this first night to the last. */
  days: number;
  /** Compass bearing the view looks toward, in degrees from north. */
  facing: number;
  terrain: JourneyTerrain;
  party: readonly TravellerKind[];
  music: MusicMood;
  sound: readonly SoundLayer[];
}

/**
 * The roads between the chapters, in story order. The party is always the
 * witness of the chapter and their companions; the central figures are
 * spoken of in the descriptions and never drawn.
 */
export const JOURNEYS: readonly Journey[] = [
  {
    id: 'shiraz-to-road',
    from: 'shiraz',
    to: 'road',
    title: 'Out by the Qur\'án Gate',
    subtitle: 'Shíráz to the northern road, summer 1844',
    description: 'The Letters of the Living leave Shíráz by night, each by his own road, carrying news of a Gate whose name they may not yet speak.',
    latitude: 29.65,
    longitude: 52.55,
    departs: { year: 1844, month: 6, day: 18, hour: 21, minute: 10 },
    days: 18,
    facing: 0,
    terrain: 'mountains',
    party: ['lantern', 'staff', 'packMule'],
    music: 'road',
    sound: ['crickets', 'breeze'],
  },
  {
    id: 'road-to-tehran',
    from: 'road',
    to: 'tehran-nur',
    title: 'A Letter for Ṭihrán',
    subtitle: 'Iṣfahán, Káshán and Qum, autumn 1844',
    description: 'Mullá Ḥusayn goes north with a sealed letter for Ṭihrán. He has been told only that the city holds a secret, and that the letter will find it.',
    latitude: 34.6,
    longitude: 50.9,
    departs: { year: 1844, month: 9, day: 12, hour: 20, minute: 40 },
    days: 16,
    facing: 350,
    terrain: 'desert',
    party: ['mule', 'walker'],
    music: 'road',
    sound: ['breeze'],
  },
  {
    id: 'tehran-to-mecca',
    from: 'tehran-nur',
    to: 'mecca',
    title: 'Into the Gulf',
    subtitle: 'Búshihr to the open sea, autumn 1844',
    description: 'From Búshihr a pilgrim ship beats south into the Gulf. Jiddah is two months away if God is kind, and this season the sea is not.',
    latitude: 27.4,
    longitude: 51.2,
    departs: { year: 1844, month: 10, day: 20, hour: 21, minute: 0 },
    days: 60,
    facing: 215,
    terrain: 'sea',
    party: [],
    music: 'sea',
    sound: ['sea', 'wind'],
  },
  {
    id: 'mecca-to-shiraz',
    from: 'mecca',
    to: 'shiraz-return',
    title: 'The Stairways of the Passes',
    subtitle: 'Búshihr to Shíráz, summer 1845',
    description: 'Home from the pilgrimage, Quddús is sent on ahead up the passes from the Gulf, climbing by night out of the heat toward Shíráz.',
    latitude: 29.5,
    longitude: 51.7,
    departs: { year: 1845, month: 6, day: 8, hour: 21, minute: 20 },
    days: 12,
    facing: 20,
    terrain: 'mountains',
    party: ['rider', 'walker', 'packMule'],
    music: 'mountain',
    sound: ['crickets', 'breeze'],
  },
  {
    id: 'shiraz-to-isfahan',
    from: 'shiraz-return',
    to: 'isfahan',
    title: 'The Cholera Summer',
    subtitle: 'Shíráz to Iṣfahán, autumn 1846',
    description: 'Cholera empties the streets of Shíráz. The chief constable, his own sons stricken, lets his Prisoner go on the one condition that He leave the city, and the road north to Iṣfahán lies open.',
    latitude: 30.9,
    longitude: 52.3,
    departs: { year: 1846, month: 9, day: 26, hour: 20, minute: 30 },
    days: 18,
    facing: 240,
    terrain: 'desert',
    party: ['walker', 'mule', 'packMule'],
    music: 'night',
    sound: ['breeze'],
  },
  {
    id: 'isfahan-to-kashan',
    from: 'isfahan',
    to: 'kashan-kulayn',
    title: 'Behind the Escort',
    subtitle: 'Iṣfahán to Káshán, March 1847',
    description: 'A mounted escort leaves Iṣfahán by night toward the capital. You follow at the distance the riders allow, and the cold of the end of winter comes up off the plain.',
    latitude: 33.6,
    longitude: 51.4,
    departs: { year: 1847, month: 3, day: 16, hour: 20, minute: 0 },
    days: 7,
    facing: 0,
    terrain: 'desert',
    party: ['lantern', 'walker', 'packMule'],
    music: 'road',
    sound: ['wind'],
  },
  {
    id: 'kulayn-to-maku',
    from: 'kashan-kulayn',
    to: 'mountain-prisons',
    title: 'The Road to the Mountains',
    subtitle: 'Qazvín, Tabríz and Mákú, summer 1847',
    description: 'The road turns away from the capital, through Qazvín and Tabríz to Mákú, a fortress under a cliff at the far edge of the kingdom.',
    latitude: 38.9,
    longitude: 44.9,
    departs: { year: 1847, month: 7, day: 10, hour: 21, minute: 30 },
    days: 40,
    facing: 330,
    terrain: 'mountains',
    party: ['staff', 'walker', 'mule'],
    music: 'mountain',
    sound: ['wind'],
  },
  {
    id: 'maku-to-qazvin',
    from: 'mountain-prisons',
    to: 'tahirih',
    title: 'Meanwhile, in the West',
    subtitle: 'Baghdád, Kirmánsháh and Hamadán, spring 1847',
    description: 'Far to the west, Ṭáhirih is sent out of Baghdád, and her company crosses the mountains toward Qazvín, teaching in every town that will listen.',
    latitude: 34.3,
    longitude: 47.1,
    departs: { year: 1847, month: 4, day: 28, hour: 21, minute: 0 },
    days: 40,
    facing: 125,
    terrain: 'mountains',
    party: ['walker', 'litter', 'mule'],
    music: 'pilgrimage',
    sound: ['breeze', 'crickets'],
  },
  {
    id: 'qazvin-to-badasht',
    from: 'tahirih',
    to: 'badasht',
    title: 'By Twos and Threes',
    subtitle: 'East of Ṭihrán toward Sháhrúd, June 1848',
    description: 'Along the foot of the mountains the believers make their way toward the hamlet of Badasht, a few at a time, so as not to be noticed.',
    latitude: 36.4,
    longitude: 54.9,
    departs: { year: 1848, month: 6, day: 14, hour: 21, minute: 40 },
    days: 14,
    facing: 0,
    terrain: 'desert',
    party: ['walker', 'rider'],
    music: 'garden',
    sound: ['crickets'],
  },
  {
    id: 'badasht-to-tabriz',
    from: 'badasht',
    to: 'tabriz-trial',
    title: 'Around the Salt Lake',
    subtitle: 'Ádhirbáyján, summer 1848',
    description: 'Word comes that the Prisoner of Chihríq is being brought down to Tabríz to be examined. You take the road around the salt lake of Urúmíyyih.',
    latitude: 37.9,
    longitude: 45.7,
    departs: { year: 1848, month: 7, day: 18, hour: 21, minute: 30 },
    days: 8,
    facing: 110,
    terrain: 'lakeside',
    party: ['walker', 'mule'],
    music: 'night',
    sound: ['breeze', 'river'],
  },
  {
    id: 'tabriz-to-tabarsi',
    from: 'tabriz-trial',
    to: 'tabarsi',
    title: 'The Black Standard',
    subtitle: 'From Mashhad into Mázindarán, autumn 1848',
    description: 'Out of Mashhad a black standard moves west, some two hundred companions on foot and horseback behind it, down into the forests of Mázindarán.',
    latitude: 36.4,
    longitude: 53.6,
    departs: { year: 1848, month: 9, day: 10, hour: 20, minute: 30 },
    days: 30,
    facing: 0,
    terrain: 'forest',
    party: ['standard', 'rider', 'walker', 'staff'],
    music: 'forest',
    sound: ['wind', 'river'],
  },
  {
    id: 'tabarsi-to-tehran',
    from: 'tabarsi',
    to: 'seven-martyrs',
    title: 'Over the Winter Passes',
    subtitle: 'Mázindarán to Ṭihrán, winter 1850',
    description: 'Over the snows of the mountains to Ṭihrán, you carry the names of the fallen of Ṭabarsí and say them aloud to no one.',
    latitude: 35.8,
    longitude: 52.4,
    departs: { year: 1850, month: 1, day: 22, hour: 19, minute: 30 },
    days: 10,
    facing: 0,
    terrain: 'snow',
    party: ['staff'],
    music: 'sorrow',
    sound: ['wind'],
  },
  {
    id: 'tehran-to-nayriz',
    from: 'seven-martyrs',
    to: 'nayriz',
    title: 'Vaḥíd Comes Home',
    subtitle: 'From Yazd into Fárs, May 1850',
    description: 'Far to the south, Vaḥíd rides out of Yazd toward his own country of Nayríz, and the villages along the way come out to meet him.',
    latitude: 29.6,
    longitude: 54.0,
    departs: { year: 1850, month: 5, day: 20, hour: 21, minute: 0 },
    days: 14,
    facing: 180,
    terrain: 'desert',
    party: ['rider', 'walker', 'walker', 'lantern'],
    music: 'pilgrimage',
    sound: ['crickets'],
  },
  {
    id: 'nayriz-to-tabriz',
    from: 'nayriz',
    to: 'tabriz',
    title: 'North in the Heat',
    subtitle: 'Ádhirbáyján, July 1850',
    description: 'The Báb has been brought from Chihríq to Tabríz once more. The road north is hot even at night, and full of soldiers.',
    latitude: 38.0,
    longitude: 46.0,
    departs: { year: 1850, month: 7, day: 4, hour: 22, minute: 0 },
    days: 6,
    facing: 330,
    terrain: 'lakeside',
    party: ['walker', 'packMule'],
    music: 'night',
    sound: ['crickets'],
  },
  {
    id: 'tabriz-to-zanjan',
    from: 'tabriz',
    to: 'zanjan',
    title: 'The News of Tabríz',
    subtitle: 'Tabríz to Zanján, July 1850',
    description: 'You ride east by night with the news of Tabríz toward Zanján, where the quarter of Ḥujjat has held out since the spring.',
    latitude: 36.9,
    longitude: 48.3,
    departs: { year: 1850, month: 7, day: 16, hour: 21, minute: 30 },
    days: 8,
    facing: 0,
    terrain: 'mountains',
    party: ['rider'],
    music: 'sorrow',
    sound: ['wind'],
  },
  {
    id: 'zanjan-to-tehran',
    from: 'zanjan',
    to: 'siyah-chal',
    title: 'Ṭihrán Again',
    subtitle: 'The capital, August 1852',
    description: 'A year and more of quiet roads, and then the summer of 1852: the city gates are watched, and every Bábí in Ṭihrán is sought.',
    latitude: 35.8,
    longitude: 51.1,
    departs: { year: 1852, month: 8, day: 18, hour: 22, minute: 0 },
    days: 6,
    facing: 20,
    terrain: 'desert',
    party: ['walker', 'staff'],
    music: 'prison',
    sound: ['breeze'],
  },
];

export function journeyBetween(from: ChapterId, to: ChapterId): Journey | undefined {
  return JOURNEYS.find(journey => journey.from === from && journey.to === to);
}

/** The journey's first moment as a UTC date: local mean time less the longitude's hours. */
export function journeyDeparture(journey: Journey): Date {
  const { year, month, day, hour, minute } = journey.departs;
  const localMs = Date.UTC(year, month - 1, day, hour, minute);
  return new Date(localMs - (journey.longitude / 15) * 3600000);
}
