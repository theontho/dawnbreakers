import type { VistaId } from '../assets/art/vista/types';
import { chapterByScene, chapters, type Chapter, type ChapterId } from './chapters';

/**
 * The dawn the title opens on for each chapter: the place it breaks over,
 * the evening before it (the stars, the moon and the hour of sunrise are
 * worked out for that night and place), the line under the title, and any
 * weather in the dark before it clears. Places the story comes back to
 * share a vista.
 */
export interface TitleOpening {
  vista: VistaId;
  /** The local date of the evening before the dawn, YYYY-MM-DD. */
  evening: string;
  subtitle: string;
  weather?: Weather;
}

/** Snow falling, rain, or mist lying along the land; thinning as the sun climbs. */
export type Weather = 'snow' | 'rain' | 'mist';

export const TITLE_OPENINGS: Record<ChapterId, TitleOpening> = {
  forerunners: { vista: 'karbila', evening: '1843-12-29', subtitle: 'Karbilá, the last days of 1843' },
  shiraz: { vista: 'shiraz', evening: '1844-05-22', subtitle: 'Shíráz, the eve of 23 May 1844' },
  road: { vista: 'quran-gate', evening: '1844-07-10', subtitle: 'The Qur\'án Gate of Shíráz, summer 1844' },
  'tehran-nur': { vista: 'tehran', evening: '1844-09-20', subtitle: 'Ṭihrán, autumn 1844' },
  mecca: { vista: 'mecca', evening: '1844-12-19', subtitle: 'Mecca, the month of pilgrimage, 1844' },
  baghdad: { vista: 'baghdad', evening: '1845-01-12', subtitle: 'Baghdád, January 1845', weather: 'mist' },
  'shiraz-return': { vista: 'shiraz', evening: '1845-11-08', subtitle: 'Shíráz, autumn 1845' },
  isfahan: { vista: 'isfahan', evening: '1846-10-05', subtitle: 'Iṣfahán, autumn 1846' },
  'kashan-kulayn': { vista: 'kashan', evening: '1847-03-19', subtitle: 'Káshán, the eve of Naw-Rúz 1847' },
  'mountain-prisons': { vista: 'maku', evening: '1847-12-20', subtitle: 'Mákú, winter 1847', weather: 'snow' },
  tahirih: { vista: 'qazvin', evening: '1847-09-15', subtitle: 'Qazvín, 1847' },
  badasht: { vista: 'badasht', evening: '1848-06-25', subtitle: 'Badasht, summer 1848' },
  'tabriz-trial': { vista: 'tabriz', evening: '1848-07-22', subtitle: 'Tabríz, summer 1848' },
  tabarsi: { vista: 'tabarsi', evening: '1848-10-12', subtitle: 'Shaykh Ṭabarsí, autumn 1848', weather: 'mist' },
  'seven-martyrs': { vista: 'tehran', evening: '1850-02-18', subtitle: 'Ṭihrán, February 1850', weather: 'snow' },
  nayriz: { vista: 'nayriz', evening: '1850-05-27', subtitle: 'Nayríz, May 1850' },
  tabriz: { vista: 'tabriz', evening: '1850-07-08', subtitle: 'Tabríz, the eve of 9 July 1850' },
  zanjan: { vista: 'zanjan', evening: '1850-11-02', subtitle: 'Zanján, autumn 1850', weather: 'rain' },
  karbila: { vista: 'karbila', evening: '1851-10-04', subtitle: 'Karbilá, autumn 1851' },
  'siyah-chal': { vista: 'tehran', evening: '1852-08-20', subtitle: 'Ṭihrán, August 1852' },
};

/** The evening as a moment: 15:00 UTC, which is early evening across Persia, Iraq and the Ḥijáz. */
export function openingEvening(opening: TitleOpening): Date {
  const [year, month, day] = opening.evening.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(year, month - 1, day, 15, 0));
}

/** The chapter the title belongs to: the one Continue would resume, or the first for a new story. */
export function titleChapter(bookmarkScene: string | undefined): Chapter {
  return (bookmarkScene ? chapterByScene(bookmarkScene) : undefined) ?? chapters[0]!;
}
