import { streetWitnessCount } from '../dialogues_ch/trial_street';
import type { ChapterStory } from './types';

export const trialStory: ChapterStory = {
  objectives: [
    {
      text: 'Hear what the crowd at the residence gate is saying',
      done: f => streetWitnessCount(f) >= 2,
      progress: f => ({ current: Math.min(streetWitnessCount(f), 2), total: 2 }),
    },
    {
      text: 'Find a way into the governor\'s residence',
      done: f => !!f.trialHired,
    },
    {
      text: 'Wait at the foot of the hall steps while the divines examine Him',
      done: f => !!f.trialHeLeft,
    },
    {
      text: 'Follow to the house of the Shaykhu\'l-Islám',
      done: f => !!f.trialBastinado,
    },
    {
      text: 'Return to the residence and find the physician',
      done: f => !!f.trialHeardCormick,
    },
    {
      text: 'Look into the hall where the examination was held',
      done: f => !!f.trialComplete,
    },
  ],
  journal: [
    {
      flag: 'trialHeardMerchant',
      title: 'Outside the Walls',
      body: 'So many ran out to see the Báb when He was brought to Tabríz that He was lodged outside the city gate. At Urúmíyyih, on the road, an unbroken horse had stood still under His hand.',
    },
    {
      flag: 'trialMetAzim',
      title: 'ʿAẓím\'s Night',
      body: 'The night before the examination the Báb told ʿAẓím that He was the Qáʾim. ʿAẓím doubted until sunrise, then begged His forgiveness, and was told his faith would grow too firm to waver.',
    },
    {
      flag: 'trialHired',
      title: 'A Tray to Carry',
      body: 'The gate guard took you into the governor\'s residence to carry coffee for the steward. It was the only way through the crowd.',
    },
    {
      flag: 'trialPageBriefed',
      title: 'One Empty Seat',
      body: 'The Valí-ʿAhd\'s page said the hall was full: the Niẓámu\'l-ʿUlamá presiding, Mullá Muḥammad of Mamaqán, the Shaykhu\'l-Islám, the Imám-Jumʿih and the Valí-ʿAhd himself. One seat was empty, kept for the heir.',
    },
    {
      flag: 'trialBroughtIn',
      title: 'Brought In',
      body: 'Farráshes forced a passage through the crowd. You saw only the green of a turban between the guards before the doors of the hall closed, and then a silence.',
    },
    {
      flag: 'trialHeardDeclaration',
      title: 'I Am the Promised One',
      body: 'He took the empty seat. Asked whom He claimed to be, He declared three times that He was the Promised One whose name they had invoked for a thousand years. He had not come of His own will, He told Mullá Muḥammad; He had been summoned.',
    },
    {
      flag: 'trialHeardQuestions',
      title: 'A Question of Grammar',
      body: 'Asked for proof, He named His Word; asked for verses, He began with the praise of God and was interrupted over grammar. Asked the tense of a word, He answered with a verse of the Qur\'án, and rose.',
    },
    {
      flag: 'trialHeLeft',
      title: 'Without Leave',
      body: 'He left the hall without the chairman\'s leave. You stood with a cold tray and saw only the space between the guards cross the court.',
    },
    {
      flag: 'trialMetMamaqani',
      title: 'Mullá Muḥammad of Mamaqán',
      body: 'The Shaykhí divine warned that the people would drive the ʿulamá out of Tabríz, and wanted the Prisoner punished before the assembly. Two years later his would be the hand that wrote the Báb\'s death sentence.',
    },
    {
      flag: 'trialToShaykh',
      title: 'The Valí-ʿAhd Said No',
      body: 'The Valí-ʿAhd refused to have the Báb humiliated before the assembly. Instead He was taken to the house of the Shaykhu\'l-Islám.',
    },
    {
      flag: 'trialHeardCoffee',
      title: 'Forty Cups',
      body: 'The coffee-maker said divines do not drink while they are listening. He taught you to rinse a cup so the grounds slide out whole.',
    },
    {
      flag: 'trialHeardBodyguard',
      title: 'Not Ours to Do',
      body: 'The governor\'s bodyguard refused to strike the Báb, calling it a matter for the ʿulamá. They stood in the lane while it was done.',
    },
    {
      flag: 'trialHeardHouseBoy',
      title: 'Eleven',
      body: 'A water-boy counted eleven strokes of the rod, applied by the Shaykhu\'l-Islám himself. One of the farráshes struck the Báb across the face.',
    },
    {
      flag: 'trialBastinado',
      title: 'The Shut Door',
      body: 'At dusk the bodyguard led the Báb away from the house of Mírzá ʿAlí-Aṣghar, the Shaykhu\'l-Islám. Nabíl records that within the year the Shaykhu\'l-Islám was struck with paralysis, and died in great pain.',
    },
    {
      flag: 'trialHeardCormick',
      title: 'The Physician\'s Witness',
      body: 'Dr Cormick, who dressed the wound on the Báb\'s face, described a very mild and delicate-looking man with a soft, melodious voice, who told him the Europeans would come over to His faith.',
    },
    {
      flag: 'trialComplete',
      title: 'The Seat Kept for the Heir',
      body: 'At Tabríz, in the summer of 1848, the Báb declared before the Valí-ʿAhd and the divines of Ádhirbáyján that He was the Qáʾim. He was sent back to Chihríq, and the news ran through Persia ahead of Him.',
    },
  ],
};
