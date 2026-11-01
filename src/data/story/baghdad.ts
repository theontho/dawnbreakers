import { QUAY_NEEDED, quayRounds, readyForSerai } from '../maps/baghdadPhases';
import type { ChapterStory } from './types';

export const baghdadStory: ChapterStory = {
  objectives: [
    {
      text: 'Buy ink at the bookseller\'s by the bridge of boats, and hear what the quay says',
      done: f => readyForSerai(f) || !!f.bgAtDesk,
      progress: f => ({ current: Math.min(quayRounds(f), QUAY_NEEDED), total: QUAY_NEEDED }),
    },
    {
      text: 'Carry the ink up to your master in the governor\'s serai',
      done: f => !!f.bgAtDesk,
    },
    {
      text: 'Hear what the benches say, then kneel at the scribes\' desk when the tribunal sits',
      done: f => !!f.bgVerdict,
    },
    {
      text: 'Take the student\'s bread down to the prisoner under the serai',
      done: f => !!f.bgSpokeWithAli,
    },
    {
      text: 'Stand on the quay where he can see you when he is led away',
      done: f => !!f.baghdadComplete,
    },
  ],
  journal: [
    {
      flag: 'bgWitness',
      title: 'A Boatman\'s Son',
      body: 'In this chapter you were not the pilgrim from Shíráz but a boatman\'s son of Karkh, across the Tigris from the governor\'s serai in Baghdád, who ground ink and trimmed reed pens for its scribes.',
    },
    {
      flag: 'bgHeardFather',
      title: 'Across in the Guffa',
      body: 'Your father ferried you over the river in his guffa. The Persian prisoner, he said, had been brought up from Najaf under guard after he told the great mujtahid there that the Promised One had come.',
    },
    {
      flag: 'bgHeardBookseller',
      title: 'Oak-Gall Ink',
      body: 'The bookseller at the bridge of boats sold you your master\'s ink, and told you of the prisoner\'s book: a commentary on the Súrih of Joseph, written verse upon verse in the manner of the Qur\'án.',
    },
    {
      flag: 'bgHeardMerchant',
      title: 'Letters from Shíráz',
      body: 'A merchant of Shíráz had heard that students of Karbilá came that summer to sit with a young siyyid of his city, who then went on pilgrimage to Mecca. The prisoner, he said, had named no one.',
    },
    {
      flag: 'bgHeardCoffee',
      title: 'Under One Roof',
      body: 'In forty years the coffee-seller had never seen the Sunni divines of Baghdád and the Shíʿí divines of Karbilá and Najaf called under one roof. Najíb Páshá, the Sultan\'s governor, had summoned them both.',
    },
    {
      flag: 'bgAtDesk',
      title: 'At the Scribes\' Desk',
      body: 'Your master set you to grind the ink. The verdicts would be written in Arabic for the divines to seal, and copied fair for Istanbul.',
    },
    {
      flag: 'bgHeardClerk',
      title: 'After the Seal',
      body: 'The muftí\'s clerk said the pages spoke as if sent down, in the manner of the Qur\'án. To claim a revelation after Muḥammad, the Seal of the Prophets, was in their law a crime deserving death.',
    },
    {
      flag: 'bgHeardStudent',
      title: 'In Najaf',
      body: 'A student from Karbilá had seen Mullá ʿAlíy-i-Basṭámí stand before Shaykh Muḥammad-Ḥasan, who wrote the Javáhir, and announce that the Gate had opened, without naming Him. The Shaykh had named him a heretic.',
    },
    {
      flag: 'bgVerdict',
      title: 'Two Verdicts',
      body: 'Before Najíb Páshá the Sunni divines declared the book unbelief and its bearer worthy of death. The Shíʿí divines named it heresy too, but would go no further than banishment. The Páshá sent both verdicts to Istanbul.',
    },
    {
      flag: 'bgCarryingBread',
      title: 'Bread for the Prisoner',
      body: 'The student from Karbilá could not get into the Páshá\'s prison, and gave you bread and dates to carry down.',
    },
    {
      flag: 'bgJailerLetIn',
      title: 'The Jailer',
      body: 'The jailer let you through. The Persian prayed half the night, he said, quietly, so as not to wake the thieves.',
    },
    {
      flag: 'bgSpokeWithAli',
      title: 'Not Alone',
      body: 'Mullá ʿAlí would not speak the name: it was not his to give. He asked you to tell any Persian pilgrim who asked at the bridge of boats that he had not been alone in Baghdád.',
    },
    {
      flag: 'baghdadComplete',
      title: 'The First',
      body: 'He was led away north in chains toward Istanbul, and no sure word of him came back. He died in Ottoman captivity, the first of the believers to give his life for the Faith of the Báb.',
    },
  ],
};
