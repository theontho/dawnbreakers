import type { FlagState } from '../../dialogue/types';

/**
 * What the pilgrim carried out of the chapters' mini-games, read back on the
 * exile road. Only chapters the pilgrim lived: Qazvín and Ṭihrán–Núr have
 * their own witnesses, so `qzListened` and `nurLanesNoticed` are not theirs
 * to remember.
 */
interface Carried { flag: string; when: (value: unknown) => boolean; text: string }

const CARRIED: Carried[] = [
  { flag: 'ch3LanternOuts', when: v => v === 0,
    text: 'On the pilgrim ship you kept the lantern lit through the whole storm.' },
  { flag: 'ch3LanternOuts', when: v => typeof v === 'number' && v > 0,
    text: 'On the pilgrim ship the lantern went out in the storm, and each time you lit it again.' },
  { flag: 'ch6CopiedLine', when: v => v === 'whole',
    text: 'At Máh-Kú you copied a whole line of the verses before the ink froze.' },
  { flag: 'ch6CopiedLine', when: v => v === 'part',
    text: 'At Máh-Kú the ink froze before the line was done. You kept the half you had.' },
  { flag: 'trialOverheard', when: v => Number(v) >= 4,
    text: 'At Tabríz you carried coffee at the hall and caught most of the questions through the doors.' },
  { flag: 'trialOverheard', when: v => typeof v === 'number' && v < 4,
    text: 'At Tabríz you carried coffee at the hall and caught only some of the questions through the doors.' },
  { flag: 'ch8RationFavoured', when: v => v === 'wounded', text: 'At Ṭabarsí you gave most of the rice to the wounded.' },
  { flag: 'ch8RationFavoured', when: v => v === 'watch', text: 'At Ṭabarsí you gave most of the rice to the watch on the walls.' },
  { flag: 'ch8RationFavoured', when: v => v === 'young', text: 'At Ṭabarsí you fed the youngest first.' },
  { flag: 'ch8RationFavoured', when: v => v === 'even', text: 'At Ṭabarsí you shared the rice out evenly, to the grain.' },
  { flag: 'zjRationFavoured', when: v => v === 'barricades', text: 'At Zanján you gave most of the bread to the barricades.' },
  { flag: 'zjRationFavoured', when: v => v === 'wounded', text: 'At Zanján you gave most of the bread to the sick and wounded.' },
  { flag: 'zjRationFavoured', when: v => v === 'children', text: 'At Zanján you gave most of the bread to the children.' },
  { flag: 'zjRationFavoured', when: v => v === 'even', text: 'At Zanján you gave every table the same.' },
];

export function carriedLines(f: FlagState): string[] {
  return CARRIED.filter(c => f[c.flag] !== undefined && c.when(f[c.flag])).map(c => c.text);
}

export const carriedAnything = (f: FlagState): boolean => carriedLines(f).length > 0;
