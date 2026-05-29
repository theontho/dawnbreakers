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
