import { prisonVisits, squareWitnesses } from '../maps/martyrsPhases';
import type { ChapterStory } from './types';

export const martyrsStory: ChapterStory = {
  objectives: [
    {
      text: 'Find the merchants of Shíráz in the caravanserai',
      done: f => !!f.martyrsMerchantAsked,
    },
    {
      text: 'Sit with the prisoners in the Kalántar\'s house',
      done: f => prisonVisits(f) >= 3,
      progress: f => ({ current: prisonVisits(f), total: 3 }),
    },
    {
      text: 'Carry the uncle\'s answer back to the caravanserai',
      done: f => !!f.martyrsMorning,
    },
    {
      text: 'Go to the Sabzih-Maydán',
      done: f => !!f.martyrsAfter,
    },
    {
      text: 'Hear from those who were in the square',
      done: f => squareWitnesses(f) >= 2,
      progress: f => ({ current: squareWitnesses(f), total: 2 }),
    },
    {
      text: 'Stand by the swept stones',
      done: f => !!f.martyrsComplete,
    },
  ],
  journal: [
    {
      flag: 'martyrsHeardStreet',
      title: 'A List of Names',
      body: 'The Kalántar\'s men had gone round the madrasas and caravanserais of Ṭihrán with a list. Fourteen believers were taken, among them a famous dervish and the Báb\'s own uncle.',
    },
    {
      flag: 'martyrsMerchantAsked',
      title: 'One Word',
      body: 'The merchants of Shíráz and Ṭihrán had pledged a ransom for Ḥájí Mírzá Siyyid ʿAlí, and the Maliku\'t-Tujjár had spoken for him. One word of recantation would send him home with honour. You carried the offer, and some bread.',
    },
    {
      flag: 'martyrsMetYoungMan',
      title: 'A Shepherd of Zarand',
      body: 'A young man of Zarand waited in the caravanserai with a package of sacred writings left for him by his teacher, Mírzá Aḥmad. His name was Yár-Muḥammad. Years later, as Nabíl, he would write the history of these days.',
    },
    {
      flag: 'martyrsSatWithKhal',
      title: 'The Uncle\'s Answer',
      body: 'The Báb\'s uncle, who had raised Him, would not say the word. To deny Him, he said, would be to deny every Messenger before Him. He meant to ask only to be the first.',
    },
    {
      flag: 'martyrsSatWithQurban',
      title: 'Sacrifice for ʿAlí',
      body: 'Mírzá Qurbán-ʿAlí, a dervish of Bárfurúsh honoured by the court, had been too ill to reach Ṭabarsí and had meant to join Vaḥíd. He kept every prayer in the Kalántar\'s house, because his Leader did.',
    },
    {
      flag: 'martyrsSatWithIsmail',
      title: 'Mute, Not Dumb',
      body: 'The Kalántar\'s men thought Muḥammad-Ḥusayn of Marágha dumb, for he would tell them nothing. Ḥájí Mullá Ismáʿíl of Qum called him by his name, and he answered at once.',
    },
    {
      flag: 'martyrsSawTurshizi',
      title: 'The Mujtahid',
      body: 'Siyyid Ḥusayn of Turshíz, a mujtahid of Najaf, asked only that the ʿulamá of Ṭihrán be gathered so that he might prove the Cause before them.',
    },
    {
      flag: 'martyrsSawKirmani',
      title: 'The Merchant of Kirmán',
      body: 'Ḥájí Muḥammad-Taqí of Kirmán, taught the Cause by the Báb\'s uncle, would not leave the side of his old friend Siyyid Ḥusayn.',
    },
    {
      flag: 'martyrsSawMurtada',
      title: 'The Siyyid of Zanján',
      body: 'Siyyid Murtaḍá, a merchant of Zanján, spoke of his brother who fell beside Mullá Ḥusayn at Ṭabarsí as of a man gone on ahead.',
    },
    {
      flag: 'martyrsSawUpperDoor',
      title: 'The Floor Above',
      body: 'Ṭáhirih was held on the upper floor of the same house, treated with courtesy and not let go.',
    },
    {
      flag: 'martyrsMorning',
      title: 'Before the Amír-Niẓám',
      body: 'Mírzá Taqí Khán, the Amír-Niẓám, held the Sháh\'s whole confidence in such matters. He ordered that whoever of the fourteen would not recant should die. Seven recanted and were let go.',
    },
    {
      flag: 'martyrsAfter',
      title: 'At the Edge of the Crowd',
      body: 'You stood at the edge of the Sabzih-Maydán and saw nothing. You heard the uncle pray that God would forgive the crowd and wake it. For three days and nights the seven lay in the square.',
    },
    {
      flag: 'martyrsHeardHeadsman',
      title: 'The Headsman',
      body: 'The headsman would not strike the Báb\'s uncle. He said his sword wanted sharpening, walked away, and left for Khurásán to live as a porter and a crier.',
    },
    {
      flag: 'martyrsHeardSweetSeller',
      title: 'Something Sweet',
      body: 'Ḥájí Mullá Ismáʿíl sent the headsman for sweets, shared them with him and forgave him. The last three, Ḥájí Muḥammad-Taqí, Siyyid Murtaḍá and the young man of Marágha, begged each to go first, and went together.',
    },
    {
      flag: 'martyrsComplete',
      title: 'The Seven Goats',
      body: 'The seven were buried together in one grave outside the gate of Ṭihrán, between the gates of Naw and Sháh ʿAbdu\'l-ʿAẓím. The Báb called them the Seven Goats who walk before the Qáʾim; within months He followed them.',
    },
  ],
};
