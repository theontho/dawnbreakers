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

/**
 * A word on the road from someone in the party, said in a caption as the
 * journey reaches `day` (1 is the first night). Never a central figure.
 */
export interface JourneyRemark {
  day: number;
  speaker: string;
  text: string;
}

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
  /** What the party says along the way, in order of `day`. */
  remarks?: readonly JourneyRemark[];
}

/**
 * The roads between the chapters, in story order. The party is always the
 * witness of the chapter and their companions; the central figures are
 * spoken of in the descriptions and never drawn.
 */
export const JOURNEYS: readonly Journey[] = [
  {
    id: 'kufih-to-shiraz',
    from: 'forerunners',
    to: 'shiraz',
    title: 'Drawn Toward Persia',
    subtitle: 'Kúfih and Najaf to Búshihr and Shíráz, spring 1844',
    description: 'After forty days at Kúfih, Mullá Ḥusayn sets out with his brother, his nephew and you by way of Najaf, down to the Gulf and by sea to Búshihr, then up through the mountains toward Shíráz, drawn he cannot say why.',
    latitude: 32.03,
    longitude: 44.4,
    departs: { year: 1844, month: 3, day: 4, hour: 19, minute: 20 },
    days: 77,
    facing: 90,
    terrain: 'desert',
    party: ['lantern', 'staff', 'walker', 'walker', 'packMule'],
    music: 'road',
    sound: ['wind', 'breeze'],
    remarks: [
      { day: 2, speaker: 'Mullá Ḥusayn\'s Nephew',
        text: 'Najaf by morning. I asked my uncle where we go after the shrine, and he said: wherever we are drawn.' },
      { day: 30, speaker: 'Mullá Ḥusayn\'s Brother',
        text: 'Búshihr. My brother walks the streets of this port as if it were a garden in spring, in this heat. He says there is a sweetness in the air here he cannot account for.' },
      { day: 50, speaker: 'Mullá Ḥusayn',
        text: 'We cannot stay here. Something draws me north, as a magnet draws iron, and I have stopped asking it why.' },
      { day: 76, speaker: 'Mullá Ḥusayn',
        text: 'At the gate, go on to the Masjid-i-Ílkhání, both of you, and wait for me there. God willing, I will be with you for the evening prayer.' },
    ],
  },
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
    remarks: [
      { day: 1, speaker: 'Narrator',
        text: 'In Iṣfahán the great divines would not receive him. The first to believe was a sifter of wheat, who heard him once and from then on would not leave his side.' },
      { day: 3, speaker: 'Narrator',
        text: 'Years later, hearing of a fort in the forests of Mázindarán, the sifter of wheat took up his sieve and set out, saying he would sift the people of every town on the way.' },
      { day: 8, speaker: 'Narrator',
        text: 'In Káshán a merchant, Ḥájí Mírzá Jání, believed. In Qum no one would listen at all.' },
    ],
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
    id: 'mecca-to-baghdad',
    from: 'mecca',
    to: 'baghdad',
    title: 'Up from Najaf in Chains',
    subtitle: 'From Najaf to Baghdád, autumn 1844',
    description: 'Far to the west, in Ottoman ʿIráq, the disciples of the Shaykh of Najaf give Mullá ʿAlíy-i-Basṭámí up in chains to the Sultan\'s officers, and he is taken north to Baghdád, to wait in prison for the Páshá\'s judgement.',
    latitude: 32.75,
    longitude: 44.3,
    departs: { year: 1844, month: 10, day: 20, hour: 20, minute: 30 },
    days: 5,
    facing: 0,
    terrain: 'desert',
    party: ['rider', 'walker', 'rider'],
    music: 'sorrow',
    sound: ['wind'],
  },
  {
    id: 'baghdad-to-shiraz',
    from: 'baghdad',
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
    description: 'Cholera empties the streets of Shíráz. The chief constable\'s son is stricken and recovers, the constable begs the governor to set his Prisoner free, and the road north to Iṣfahán lies open.',
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
    remarks: [
      { day: 1, speaker: 'Narrator',
        text: 'A farsang out of Mashhad, Mullá Ḥusayn raises the Black Standard and sets the Báb\'s own turban on his head. Two hundred and two companions follow him west.' },
      { day: 6, speaker: 'A Young Companion',
        text: 'At Míyámay thirty men of the village joined us in one night. Thirty! The whole village came out to the masjid to watch them go.' },
      { day: 14, speaker: 'Mullá Ḥusayn',
        text: 'We stand at the parting of the ways. We shall wait here, by this stream, for His decree as to which way we should take.' },
      { day: 20, speaker: 'Narrator',
        text: 'At Chashmih-ʿAlí a gale tears a great branch from the tree you camp under. Three days later a rider from Ṭihrán brings the news: Muḥammad Sháh is dead.' },
      { day: 22, speaker: 'Mullá Ḥusayn',
        text: 'This is the way that leads to our Karbilá. Whoever is unprepared for the trials that lie before us, let him go home now and give up the journey.' },
      { day: 28, speaker: 'A Young Companion',
        text: 'Twenty have turned back since Savád-Kúh. I counted them. (He hitches up his bundle.) I am not going to be the twenty-first.' },
    ],
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
    remarks: [
      { day: 3, speaker: 'Narrator',
        text: 'You say the names over as you climb, the ones you are sure of. There are more of them than you can hold, and the snow takes your breath between them.' },
    ],
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
    id: 'zanjan-to-karbila',
    from: 'zanjan',
    to: 'karbila',
    title: 'Down to the Shrine Cities',
    subtitle: 'Kirmánsháh and the passes to ʿIráq, summer 1851',
    description: 'After the winter of Zanján you go down with a pilgrim caravan by Kirmánsháh and the passes of the Zagros to the hot plain of ʿIráq, home to the city where you were a student. That same summer the Amír-Niẓám has asked Bahá\'u\'lláh to leave Ṭihrán, and He too is on the road to Karbilá.',
    latitude: 34.39,
    longitude: 47.44,
    departs: { year: 1851, month: 7, day: 18, hour: 21, minute: 15 },
    days: 18,
    facing: 0,
    terrain: 'mountains',
    party: ['staff', 'litter', 'camel', 'packMule'],
    music: 'pilgrimage',
    sound: ['wind', 'crickets'],
    remarks: [
      { day: 1, speaker: 'A Muleteer',
        text: 'Kirmánsháh is full this Ramaḍán. They say a nobleman from Ṭihrán has been here the whole month, and his door is never shut once the fast is broken.' },
      { day: 2, speaker: 'Narrator',
        text: 'In a house near the bazaar two Bábís sit up late over a heap of copied pages: an older scribe who once wrote for the Báb, and a youth of Zarand who crossed half of Persia to find him. Years later the youth will write the history of these days. His name is Nabíl.' },
      { day: 6, speaker: 'An Old Cameleer',
        text: 'The Ṭáq-i-Garrá, the old gate of the mountains. From here the road falls all the way to ʿIráq, and the heat comes up to meet it.' },
      { day: 10, speaker: 'A Muleteer',
        text: 'Khániqín, and the Sultan\'s customs men. Show them your pilgrim\'s face, not your purse.' },
      { day: 15, speaker: 'An Old Cameleer',
        text: 'Baghdád. The boatmen say a Persian nobleman crossed the bridge of boats not long ago with only two companions, going south to the shrines.' },
    ],
  },
  {
    id: 'karbila-to-tehran',
    from: 'karbila',
    to: 'siyah-chal',
    title: 'Ṭihrán Again',
    subtitle: 'From Karbilá to the capital, spring and summer 1852',
    description: 'Out of the palm groves in the spring of 1852 and back up into Persia, on the road Bahá\'u\'lláh has taken ahead of you. A few quiet months, and then August: the city gates are watched, and every Bábí in Ṭihrán is sought.',
    latitude: 32.75,
    longitude: 44.15,
    departs: { year: 1852, month: 4, day: 28, hour: 21, minute: 0 },
    days: 30,
    facing: 20,
    terrain: 'desert',
    party: ['walker', 'staff', 'packMule'],
    music: 'prison',
    sound: ['breeze'],
    remarks: [
      { day: 8, speaker: 'A Muleteer',
        text: 'News from the capital: the new Grand Vizier is a man of Núr, Mírzá Áqá Khán. They say he is gentle with his own countrymen.' },
      { day: 24, speaker: 'A Muleteer',
        text: 'Ṭihrán in summer? Every man with sense and a mule goes up into the hills, to Shimrán and Lavásán, until the heat breaks.' },
    ],
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
