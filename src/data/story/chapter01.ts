import { rumourCount } from '../dialogues_ch/chapter01_shiraz';
import type { ChapterStory } from './types';

export const chapter01Story: ChapterStory = {
  objectives: [
    {
      text: 'Find Mullá Ḥusayn near the city gate',
      done: f => !!f.metMullaHusayn,
    },
    {
      text: 'Hear what Shíráz says of the young Siyyid',
      done: f => rumourCount(f) >= 2,
      progress: f => ({ current: Math.min(rumourCount(f), 2), total: 2 }),
    },
    {
      text: 'Go north to the Quiet Quarter and keep vigil at the lamplit threshold',
      done: f => !!f.shirazComplete,
    },
  ],
  journal: [
    {
      flag: 'metMullaHusayn',
      title: 'A Greeting at the Gate',
      body: 'Mullá Ḥusayn, with whom you travelled from Karbilá, was greeted outside the gate by a young merchant-Siyyid who invited him home tonight. He asked you to learn what the city says of his host.',
    },
    {
      flag: 'metBrother',
      title: 'Kin at the Ílkhání',
      body: 'Mullá Ḥusayn\'s brother waits at the Masjid-i-Ílkhání. After Siyyid Káẓim died, his students scattered to search; Mullá Ḥusayn fasted forty days at Kúfih before setting out.',
    },
    {
      flag: 'rumourTraveller',
      title: 'A Traveller at the Gate',
      body: 'A fellow seeker speaks of a young Siyyid of this city, modest and of the Prophet\'s line, who has returned from pilgrimage speaking with strange certainty.',
    },
    {
      flag: 'rumourMerchant',
      title: 'The Cloth Merchant\'s Hint',
      body: 'A merchant in the bazaar names Him: Siyyid ʿAlí-Muḥammad. His house lies in the quarter north of the mosque. The merchant warns that not all in Shíráz wish Him well.',
    },
    {
      flag: 'rumourMulla',
      title: 'The Mullá\'s Warning',
      body: 'The mullá of the great mosque speaks bitterly of the youth, a merchant turned mystic who stirs the foolish with hidden meanings. He counsels you to leave the city.',
    },
    {
      flag: 'heardWaterCarrier',
      title: 'Water for the Lane',
      body: 'The water-carrier thanks God for a customer who thanks a poor man as if receiving a gift from a king. "Some lamps give light; His seems to give stillness."',
    },
    {
      flag: 'guardWarned',
      title: 'The Governor Dislikes Whispers',
      body: 'The gate guard warns that men whispering after a young merchant-Siyyid have already been noticed. Questions in Shíráz must be asked softly.',
    },
    {
      flag: 'sawCalligraphy',
      title: 'Lines Swift as Rain',
      body: 'A calligrapher glimpsed lines from the young Siyyid\'s pen, balanced as architecture, and veiled the sheet as soon as he had shown it.',
    },
    {
      flag: 'orphanMercy',
      title: 'A Name Asked Before Bread',
      body: 'An orphan on the mosque steps remembers a Siyyid in a green turban who asked the child\'s name before giving bread, as if names mattered to the hungry.',
    },
    {
      flag: 'rumourNeighbour',
      title: 'A Neighbour\'s Welcome',
      body: 'A woman in the quiet lane speaks gently of the household and of His wife, Khadíjih-Bagum. "Some come, and never leave the same."',
    },
    {
      flag: 'watchmanSpoke',
      title: 'The Night Watch',
      body: 'The watchman of the Quiet Quarter says the young merchant was raised by His uncle, pays His debts, and closes His shop to pray at noon. "The mullás are not on the night watch."',
    },
    {
      flag: 'servantWelcomed',
      title: 'The Trimmed Lamp',
      body: 'Mubárak, the household servant, says his Master has a guest from Karbilá tonight, and asked that the lamp be trimmed as if more seekers were expected.',
    },
    {
      flag: 'vigilKept',
      title: 'The Vigil',
      body: 'You kept watch outside the door through the night of 22 May 1844, hearing only fragments of verses chanted within: Joseph, the well, a light hidden in a garment.',
    },
    {
      flag: 'heardTestimony',
      title: 'Testimony at Dawn',
      body: 'Mullá Ḥusayn emerged at dawn. His host had declared that all the signs of the Promised One were manifest in Him, and revealed unbidden the commentary on the Súrih of Joseph that Mullá Ḥusayn had silently resolved to ask for.',
    },
    {
      flag: 'recognised',
      equals: true,
      title: 'Your Answer',
      body: 'You believed Mullá Ḥusayn\'s witness, and your heart turned toward the dawn. He became the first Letter of the Living; you, his first witness.',
    },
    {
      flag: 'recognised',
      equals: false,
      title: 'Your Answer',
      body: 'You asked for time and for the verses themselves. Mullá Ḥusayn asked nothing of you but to search.',
    },
  ],
};
