import type { FlagState } from '../../dialogue/types';
import type { ChapterStory } from './types';

const learnedHeard = (f: FlagState): number => Number(!!f.readTreatise) + Number(!!f.heardDivines);

export const chapter05Story: ChapterStory = {
  objectives: [
    {
      text: 'Cross the river to the house of the Imám-Jumʿih',
      done: f => !!f.heardValAsr,
    },
    {
      text: 'Go east to the Palace of the Sun and seek the Muʿtamid',
      done: f => !!f.heardMutamidProtection,
    },
    {
      text: 'Learn what the learned of Iṣfahán made of Him',
      done: f => learnedHeard(f) >= 2,
      progress: f => ({ current: learnedHeard(f), total: 2 }),
    },
    {
      text: 'Return to the Muʿtamid in his garden',
      done: f => !!f.mutamidDied,
    },
    {
      text: 'Stand at the door of the inner apartments',
      done: f => !!f.isfahanComplete,
    },
  ],
  journal: [
    {
      flag: 'heardIsfahanArrival',
      title: 'A Polite Prisoner',
      body: 'A merchant told you the Báb wrote to the governor from outside the walls, asking where He should stay. The Muʿtamid lodged Him with the Imám-Jumʿih.',
    },
    {
      flag: 'heardValAsr',
      title: 'By the Afternoon',
      body: 'The Imám-Jumʿih asked after supper for a commentary on the Súrih of Va\'l-ʿAṣr, and watched it written at once among the dishes. Pages on the first letter alone.',
    },
    {
      flag: 'sawEwer',
      title: 'The Silver Ewer',
      body: 'The Imám-Jumʿih poured water over his Guest\'s hands himself. His old servant had not known his master knew how to kneel.',
    },
    {
      flag: 'printerSpoke',
      title: 'Colours That Set',
      body: 'A cloth-printer by the river said the Muʿtamid was once called the hardest man in Persia. Some colours run, she said. Some set.',
    },
    {
      flag: 'studentCopied',
      title: 'Copied by Night',
      body: 'A theology student copied the commentary on Va\'l-ʿAṣr against his teacher\'s wishes, and told you the divines were calling a gathering that half of them would not attend.',
    },
    {
      flag: 'heardIsfahanCleric',
      title: 'The Cleric\'s Scale',
      body: 'A learned cleric asked whether every eloquent pen should be mistaken for authority, and confessed his scale was made by his teachers.',
    },
    {
      flag: 'heardMutamidProtection',
      title: 'The Muʿtamid\'s Shelter',
      body: 'Manúchihr Khán, once a captive boy from Georgia, said order without justice is only fear arranged neatly. His house would not be closed to his Guest.',
    },
    {
      flag: 'readTreatise',
      title: 'Fifty Pages in an Afternoon',
      body: 'Asked to prove the specific mission of Muḥammad, the Báb wrote a treatise in less than two hours. The Muʿtamid said he now held his faith with conviction, not as an inheritance.',
    },
    {
      flag: 'scribeSpoke',
      title: 'The Scribe\'s Fourth Copy',
      body: 'The palace scribe sharpened three pens for the treatise. Only one was needed. He had never before seen the Muʿtamid without words.',
    },
    {
      flag: 'heardDivines',
      title: 'The Empty Seat of Honour',
      body: 'Most divines would not come to the gathering. Of those who came, one argued until the Muʿtamid sent him home. Later the ʿulamá met and signed and sealed a sentence of death against Him.',
    },
    {
      flag: 'philosopherSpoke',
      title: 'Disturbed, Not Persuaded',
      body: 'Mírzá Ḥasan-i-Núrí watched his life\'s work fit in a sentence. He called himself not persuaded, but disturbed, which is a word for the heart.',
    },
    {
      flag: 'mutamidDied',
      title: 'Three Months and Nine Days',
      body: 'The Muʿtamid hid his Guest in the Palace of the Sun and offered Him his riches and his influence with the Sháh, which He declined. As foretold, the old governor died, grateful.',
    },
    {
      flag: 'mournedMutamid',
      title: 'A Rolled Carpet',
      body: 'You stood a moment where the old governor used to sit, and found yourself praying for him.',
    },
    {
      flag: 'gurginMet',
      title: 'Gurgín Khán',
      body: 'The Muʿtamid\'s nephew wrote to the capital to reveal where the prisoner was hidden. The Sháh ordered Him brought north in secret, and He left after midnight.',
    },
    {
      flag: 'isfahanComplete',
      title: 'Out by the Back Gate',
      body: 'The escort rode out of the Palace of the Sun without torches. The road ran north toward the capital, and beyond it to the cold fortresses of Ádhirbáyján.',
    },
  ],
};
