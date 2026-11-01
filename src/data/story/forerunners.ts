import {
  MOURNING_NEEDED, mourningRounds, RETREAT_NEEDED, retreatRounds,
} from '../maps/forerunnersPhases';
import type { ChapterStory } from './types';

export const forerunnersStory: ChapterStory = {
  objectives: [
    {
      text: 'Go along the lane to Siyyid Káẓim\'s house, and take your place in his circle',
      done: f => !!f.frHeardLesson,
    },
    {
      text: 'Ride north with him toward Kázimayn, then come home to his door',
      done: f => !!f.frKazimDied,
    },
    {
      text: 'Go among the mourners, and see who stays and who goes',
      done: f => mourningRounds(f) >= MOURNING_NEEDED,
      progress: f => ({ current: Math.min(mourningRounds(f), MOURNING_NEEDED), total: MOURNING_NEEDED }),
    },
    {
      text: 'Meet Mullá Ḥusayn where the north road comes in, and go with him to Kúfih',
      done: f => !!f.frJoinedHusayn,
    },
    {
      text: 'Keep the forty days at Kúfih, until Mullá Ḥusayn comes out of his cell',
      done: f => !!f.forerunnersComplete,
      progress: f => ({ current: Math.min(retreatRounds(f), RETREAT_NEEDED), total: RETREAT_NEEDED }),
    },
  ],
  journal: [
    {
      flag: 'frWitness',
      title: 'A Student in Karbilá',
      body: 'You came from Persia to Karbilá to study with Siyyid Káẓim of Rasht, heir to the teaching of Shaykh Aḥmad, who for forty years have both said that the Promised One is near.',
    },
    {
      flag: 'frMetWaterSeller',
      title: 'Canal Water',
      body: 'The water-seller remembered Shaykh Aḥmad from his boyhood, always about to leave for somewhere, and noticed that the Siyyid\'s students rent their rooms by the month.',
    },
    {
      flag: 'frMetBookseller',
      title: 'Under the Cloth',
      body: 'The bookseller keeps Shaykh Aḥmad\'s writings under a cloth: a divine of Qazvín once declared him an unbeliever, and half of Karbilá wants his books burnt.',
    },
    {
      flag: 'frMetSeeker',
      title: 'A Student from Khurásán',
      body: 'A young student from Khurásán would walk to the end of the earth if the Siyyid told him where. Mullá Ḥusayn of Bushrúyih, the foremost of the students, is away in Iṣfahán and Mashhad on the Siyyid\'s errand.',
    },
    {
      flag: 'frHeardLesson',
      title: 'Every Lamp Is Lit for One Night',
      body: 'Siyyid Káẓim taught that He whom you await lives among you unknown: of the Prophet\'s line, young, His knowledge not learned from men. When I am gone, he said, do not linger by my side. Scatter, and seek Him.',
    },
    {
      flag: 'frHeardRay',
      title: 'A Ray of Light',
      body: 'The old copyist told of a young merchant-Siyyid of Shíráz who once sat by the door of the lesson. The master fell silent, and said only that the truth was plainer than the ray of sunlight lying across that young man\'s lap.',
    },
    {
      flag: 'frMetElder',
      title: 'Patience',
      body: 'An elder student counselled patience: the master speaks in allusions, and someone must keep the school.',
    },
    {
      flag: 'frForetold',
      title: 'The Shepherd at Baráthá',
      body: 'At noon by the Masjid of Baráthá, an Arab shepherd told Siyyid Káẓim of a dream: within thirty days he would die. The Siyyid smiled, and asked his weeping students whether they did not wish him to go, so that the One they awaited might appear.',
    },
    {
      flag: 'frKazimDied',
      title: 'The Eleventh of Dhi\'l-Ḥijjih',
      body: 'Siyyid Káẓim died in Karbilá on 31 December 1843, telling all who came to him to go and seek. He was laid to rest within the precincts of the shrine of the Imám Ḥusayn.',
    },
    {
      flag: 'frSatAtEmptyPlace',
      title: 'The Empty Place',
      body: 'You sat with the copyist beside the Siyyid\'s empty cushion, until the lamp needed oil and the low sun lay across it.',
    },
    {
      flag: 'frHeardStayers',
      title: 'Keeping the Door',
      body: 'The elder student will stay in Karbilá to keep the house and wait to see who is worthy of the master\'s place. More than half the students stayed with him.',
    },
    {
      flag: 'frHeardSeeker',
      title: 'Scattering',
      body: 'The student from Khurásán tied up his books and set out alone, because the Siyyid had said to scatter. He left his good pen-case behind.',
    },
    {
      flag: 'frMournedWithWaterSeller',
      title: 'Black Before Muḥarram',
      body: 'The water-seller carried water at the Siyyid\'s burial. This year the city put on black before Muḥarram came.',
    },
    {
      flag: 'frBooksellerMourning',
      title: 'Claimants',
      body: 'Letters come from a man in Kirmán who says the Siyyid\'s mantle is his. The Siyyid named no successor. He only said: go.',
    },
    {
      flag: 'frHusaynReturned',
      title: 'Back from Mashhad',
      body: 'On the first of Muḥarram, Mullá Ḥusayn came home by the north road with his brother and nephew, asked what the master had said at the end, and resolved to go out to Kúfih to pray and fast for forty days before setting out to seek.',
    },
    {
      flag: 'frJoinedHusayn',
      title: 'Four on the Road',
      body: 'You asked to go with Mullá Ḥusayn to Kúfih, and he took you.',
    },
    {
      flag: 'frKufihKeeper',
      title: 'The Oldest Masjid',
      body: 'The keeper of the masjid of Kúfih told you that another company of the Siyyid\'s students, led by a man of Basṭám, keeps its own vigil in the far cells.',
    },
    {
      flag: 'frKufihBrother',
      title: 'God Is Enough',
      body: 'Mullá Ḥusayn\'s brother brings him bread and dates at sunset and listens to his prayers through the curtain, as you would listen to a river.',
    },
    {
      flag: 'frKufihNephew',
      title: 'Sandals by the Door',
      body: 'The nephew scratches the days on his cell wall. His uncle never says where they are going until he is already walking.',
    },
    {
      flag: 'frKeptFast',
      title: 'The Same Time',
      body: 'Hunger became a kind of quiet. You prayed to be ready, and not to carry a picture of Him in your head.',
    },
    {
      flag: 'forerunnersComplete',
      title: 'Drawn Toward Persia',
      body: 'On the fortieth morning Mullá Ḥusayn came out of his cell, drawn toward Persia as a needle is drawn north. You set out with him, his brother and his nephew, by Najaf and the Gulf and Búshihr, in the spring of 1844.',
    },
  ],
};
