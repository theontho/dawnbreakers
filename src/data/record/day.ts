import type { FlagState } from '../../dialogue/types';
import type { ChapterDay } from './types';

/**
 * A day of limited time. A visit counts once the place's last node sets its
 * flag; talking and walking away costs nothing. Visits are counted from the
 * flags, never stored, so nothing can drift.
 */
export const visits = (day: ChapterDay, f: FlagState): number =>
  day.places.filter(p => !!f[p.flag]).length;

export const dayOpen = (day: ChapterDay, f: FlagState): boolean => day.opens(f) && !f[day.closes];

/** Light remains for this place: it is already visited, or a slot is left. */
export function canVisit(day: ChapterDay, placeId: string, f: FlagState): boolean {
  const place = day.places.find(p => p.id === placeId);
  if (!place) throw new Error(`Unknown place '${placeId}' in day ${day.id}`);
  return dayOpen(day, f) && (!!f[place.flag] || visits(day, f) < day.slots);
}

/** The last place before nightfall: this visit uses the final slot. */
export const lastLight = (day: ChapterDay, f: FlagState): boolean => visits(day, f) === day.slots - 1;

/** Every slot is spent: the night scene may begin. */
export const nightfall = (day: ChapterDay, f: FlagState): boolean => day.opens(f) && visits(day, f) >= day.slots;

/**
 * Ṭabarsí, the day the rice was shared out (Nabíl p. 384): from the dawn
 * share-out to the night watch, three of six places.
 */
export const CH8_DAY: ChapterDay = {
  id: 'ch8-rice',
  opens: f => !!f.ch8RiceShared,
  closes: 'ch8NightWatch',
  slots: 3,
  places: [
    { id: 'tower', flag: 'ch8DayTower' },
    { id: 'wounded', flag: 'ch8DayWounded' },
    { id: 'shrine', flag: 'ch8DayShrine' },
    { id: 'wall', flag: 'ch8DayWall' },
    { id: 'water', flag: 'ch8DayWater' },
    { id: 'leanto', flag: 'ch8DayLeanTo' },
  ],
};

/** Shorthands for chapter 8's maps and dialogue. */
export const ch8DayOpen = (f: FlagState): boolean => dayOpen(CH8_DAY, f);
export const ch8CanVisit = (place: string) => (f: FlagState): boolean => canVisit(CH8_DAY, place, f);
export const ch8Visits = (f: FlagState): number => visits(CH8_DAY, f);
export const ch8LastLight = (f: FlagState): boolean => lastLight(CH8_DAY, f) && ch8DayOpen(f);
export const ch8Nightfall = (f: FlagState): boolean => nightfall(CH8_DAY, f) && !f.ch8NightWatch;
