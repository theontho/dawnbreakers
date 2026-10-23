import { ARRIVAL_NEEDED, arrivalRounds, SIEGE_NEEDED, siegeRounds } from '../maps/nayrizPhases';
import type { ChapterStory } from './types';

export const nayrizStory: ChapterStory = {
  objectives: [
    {
      text: 'Follow the crowd into Chinár-Súkhtih, and hear what the quarter says',
      done: f => arrivalRounds(f) >= ARRIVAL_NEEDED || !!f.nzHeardSermon,
      progress: f => ({ current: Math.min(arrivalRounds(f), ARRIVAL_NEEDED), total: ARRIVAL_NEEDED }),
    },
    {
      text: 'Hear Vaḥíd in the masjid',
      done: f => !!f.nzHeardSermon,
    },
    {
      text: 'Go to Vaḥíd in the masjid at night, and carry his letter to Mullá ʿAbdu\'l-Ḥusayn',
      done: f => !!f.nzLetterDelivered,
    },
    {
      text: 'Find Vaḥíd on the path below the fort of Khájih before dawn',
      done: f => !!f.nzToFort,
    },
    {
      text: 'Go among the companions in the fort',
      done: f => siegeRounds(f) >= SIEGE_NEEDED,
      progress: f => ({ current: Math.min(siegeRounds(f), SIEGE_NEEDED), total: SIEGE_NEEDED }),
    },
    {
      text: 'Meet the soldier at the gate, and carry what he brings to Vaḥíd',
      done: f => !!f.nzOathAccepted,
    },
    {
      text: 'Wait in the fort for word from the camp',
      done: f => !!f.nzLetterRead,
    },
    {
      text: 'Go down to the quarter and find the boy and his mother',
      done: f => !!f.nzHeardEnd,
    },
    {
      text: 'Stand at Vaḥíd\'s door',
      done: f => !!f.nayrizComplete,
    },
  ],
  journal: [
    {
      flag: 'nzWitness',
      title: 'A Son of the Quarter',
      body: 'In this chapter you were not the pilgrim from Shíráz but a weaver\'s son of Chinár-Súkhtih, who went out on the road with the whole quarter to meet Vaḥíd coming home.',
    },
    {
      flag: 'nzMetBoy',
      title: 'The Road from Iṣṭahbánát',
      body: 'The boy from three doors down had touched Vaḥíd\'s stirrup on the road. The whole quarter had gone out to welcome him, though the governor had threatened death to any who did.',
    },
    {
      flag: 'nzHeardWoman',
      title: 'A Jug of Water',
      body: 'The boy\'s mother gave you water at her door. Vaḥíd\'s house was in Chinár-Súkhtih, and his wife\'s people were of Nayríz.',
    },
    {
      flag: 'nzMetElder',
      title: 'Eighty Years',
      body: 'Mullá ʿAbdu\'l-Ḥusayn, eighty years old, could not get into his own masjid for the crowd. The governor, Zaynu\'l-ʿÁbidín Khán, had shut himself up in the fort of Quṭrih.',
    },
    {
      flag: 'nzSawPlane',
      title: 'The Burnt Plane',
      body: 'The quarter takes its name from a burnt plane tree. Half of the old chenar in the square is dead and black; the other half is still in leaf.',
    },
    {
      flag: 'nzHeardSermon',
      title: 'We Have Heard',
      body: 'On the forenoon of 15 Rajab, 27 May 1850, Vaḥíd went to the masjid before his own house, still in the dust of the road. The people answered him: "We have heard, and we obey!"',
    },
    {
      flag: 'nzCarryingLetter',
      title: 'Muskets on the Roofs',
      body: 'The governor came back with a thousand men and fortified the roof of a house he had seized. Mullá ʿAbdu\'l-Ḥusayn was shot in the foot at his prayers on his own roof, and Vaḥíd gave you a letter for him.',
    },
    {
      flag: 'nzLetterDelivered',
      title: 'A Letter to a Brother',
      body: 'The old mullá read Vaḥíd\'s letter twice by the lamp. He had never had such a letter, he said.',
    },
    {
      flag: 'nzHeardDefections',
      title: 'Counting Doors',
      body: 'Some who had cried out in the masjid went home by back lanes. The boy\'s mother did not curse them, but she counted the doors.',
    },
    {
      flag: 'nzToFort',
      title: 'Up to Khájih',
      body: 'Before dawn Vaḥíd went up to the old fort of Khájih with his two sons, their attendants, and the men who chose to follow, so as not to make a battlefield of the quarter.',
    },
    {
      flag: 'nzVahidFort',
      title: 'Two Children',
      body: 'Asked why he had raised an army, Vaḥíd answered that his company was two children and their two attendants, and asked why the governor had cut off their water.',
    },
    {
      flag: 'nzMetChronicler',
      title: 'The Chronicler',
      body: 'Mírzá Muḥammad-Jaʿfar kept the record of the fort: seventy-two at first, and the names and trades of the first three to fall.',
    },
    {
      flag: 'nzDugCistern',
      title: 'The Cistern',
      body: 'With the water cut off, the companions dug a cistern in the court and lined it with stones from the old wall. You blistered your hands with them.',
    },
    {
      flag: 'nzMetGatekeeper',
      title: 'The Keeper of the Gate',
      body: 'Karbilá\'í Mírzá Muḥammad kept the key Vaḥíd had given him. He opened the gate one night for fourteen men, old men and boys among them, and not all came back.',
    },
    {
      flag: 'nzHeardRooftops',
      title: 'Voices on the Roofs',
      body: 'On the night of the sortie the women of Chinár-Súkhtih went up on their roofs and cried out together, louder than the guns.',
    },
    {
      flag: 'nzQuranArrived',
      title: 'The Sealed Qur\'án',
      body: 'A soldier of the Hamadán regiment brought a Qur\'án sealed by the officers, who swore on it that Vaḥíd could come down, set out his Cause, and return in safety.',
    },
    {
      flag: 'nzOathAccepted',
      title: 'The Appointed Hour',
      body: 'Vaḥíd kissed the Book and said, "Our appointed hour has struck." He bade the companions keep their posts and trust no word but his, and went down to the camp with five companions.',
    },
    {
      flag: 'nzLetterRead',
      title: 'His Word',
      body: 'After three days Ḥájí Siyyid ʿÁbid brought a letter in Vaḥíd\'s hand bidding the companions go home. They obeyed, and left the fort empty.',
    },
    {
      flag: 'nzHeardAmbush',
      title: 'At the Edge of the Town',
      body: 'The governor\'s men fell on the companions as they came down unarmed. Those who could fought their way to the Masjid-i-Jámiʿ.',
    },
    {
      flag: 'nzHeardEnd',
      title: 'The Turban',
      body: 'ʿÁbid had betrayed Vaḥíd\'s secret warning. Freed of their oath, as they thought, his enemies wound his turban about his neck and dragged him behind a horse through the streets of Nayríz.',
    },
    {
      flag: 'nayrizComplete',
      title: 'A Lamp in the Niche',
      body: 'Vaḥíd was slain on 29 June 1850. You lit the lamp at his door. Ten days later the Báb was martyred in Tabríz.',
    },
  ],
};
