import { SUMMER_NEEDED, summerRounds, WINTER_NEEDED, winterRounds } from '../maps/zanjanPhases';
import type { ChapterStory } from './types';

export const zanjanStory: ChapterStory = {
  objectives: [
    {
      text: 'Go up through the orchards with Siyyid Ḥasan to the barricade',
      done: f => !!f.zjEnteredQuarter,
    },
    {
      text: 'Bring the news from Tabríz to Ḥujjat in the fort',
      done: f => !!f.zjNewsTold,
    },
    {
      text: 'Go among Ḥujjat\'s people: the east barricade, the wall, the ovens, his house',
      done: f => summerRounds(f) >= SUMMER_NEEDED,
      progress: f => ({ current: Math.min(summerRounds(f), SUMMER_NEEDED), total: SUMMER_NEEDED }),
    },
    {
      text: 'Return to Ḥujjat, and watch the children carry out the sealed Qur\'án',
      done: f => !!f.zjDelegationSent,
    },
    {
      text: 'Speak with the soldier among the ruins, then meet the children at the gate',
      done: f => !!f.zjTruceBroken,
    },
    {
      text: 'See who is left in the winter, then pray with Ḥujjat at the pool',
      done: f => !!f.zjHujjatWounded,
      progress: f => ({ current: Math.min(winterRounds(f), WINTER_NEEDED), total: WINTER_NEEDED }),
    },
    {
      text: 'Go up into Ḥujjat\'s house, and sit beside him',
      done: f => !!f.zanjanComplete,
    },
  ],
  journal: [
    {
      flag: 'zjMetHasan',
      title: 'The Way In',
      body: 'Siyyid Ḥasan, brother of the Báb\'s amanuensis, brought you through the orchards of Zanján by night to the barricaded quarter of Ḥujjat, carrying the news of Tabríz.',
    },
    {
      flag: 'zjEnteredQuarter',
      title: 'The Sally Gap',
      body: 'Mír Ṣaláḥ, who keeps the south barricade, had the overturned cart dragged aside to let you in.',
    },
    {
      flag: 'zjHeardDivision',
      title: 'Two Towns',
      body: 'A quarrel between two children, a child thrown into prison, and a crier in the streets: in one night Zanján divided, fathers one way and sons the other. The believers moved their families into the fort of ʿAlí-Mardán Khán.',
    },
    {
      flag: 'zjNewsTold',
      title: 'The News from Tabríz',
      body: 'You told Ḥujjat of the barrack square. He listened with his eyes closed, and said the truth had not died in Tabríz. No one left the quarter when the soldiers shouted the news across the ruins.',
    },
    {
      flag: 'zjMetZaynab',
      title: 'Rustam-ʿAlí',
      body: 'At the east barricade a village girl, Zaynab, kept watch with cropped hair in a man\'s coat. Ḥujjat had named her Rustam-ʿAlí.',
    },
    {
      flag: 'zjHeardInvocations',
      title: 'Five Names in the Night',
      body: 'Muḥsin the muezzin told you how the watch cried five names of God, nineteen times each, through every night, as the Báb had bidden, and how he gave the call to prayer from the wall at dawn.',
    },
    {
      flag: 'zjHelpedWomen',
      title: 'The Women\'s Corner',
      body: 'You carried flour and water for the women of the fort, who baked, sewed, nursed the wounded and mended the barricades. One of them was expecting a child she meant to call Ashraf.',
    },
    {
      flag: 'zjMetKhadijih',
      title: 'Jewels for Weddings',
      body: 'Ḥujjat\'s wife Khadíjih told you he had sold all her jewels so that some two hundred young men of the fort could be married.',
    },
    {
      flag: 'zjMetMihrAli',
      title: 'A Basket of Iron',
      body: 'Mihr-ʿAlí, a boy who gathered shot from the courts, meant to grow up a smith and beat it all into ploughshares.',
    },
    {
      flag: 'zjDelegationSent',
      title: 'The Sealed Qur\'án',
      body: 'The Amír-Tumán sent a Qur\'án under his seal, swearing safety to any who came out. Ḥujjat answered by sending nine children and some old men, with Darvísh-Ṣaláḥ bearing the Book before them.',
    },
    {
      flag: 'zjMetSoldier',
      title: 'A Soldier of ʿIráq',
      body: 'Among the ruins in the truce, a soldier of the ʿIráqí regiment told you he still stopped for the call to prayer, though his sergeant laughed.',
    },
    {
      flag: 'zjTruceBroken',
      title: 'The Oath Broken',
      body: 'Mihr-ʿAlí came back shaking. The Amír-Tumán had the old dervish seized by the beard and the old men thrown in a dungeon. Before evening the guns began again.',
    },
    {
      flag: 'zjMournedZaynab',
      title: 'A Lamp in the Sacks',
      body: 'After five months at the barricades, Zaynab fell in a charge. Someone keeps a lamp burning where she stood.',
    },
    {
      flag: 'zjMournedMuhsin',
      title: 'The Empty Ladder',
      body: 'Muḥsin was shot at dawn as he gave the call to prayer from the wall. His prayer rug lies folded at the foot of the ladder.',
    },
    {
      flag: 'zjMetAshraf',
      title: 'Ashraf',
      body: 'Umm-i-Ashraf showed you her son, born in the fort under the guns. She had vowed him to God on the night of his birth.',
    },
    {
      flag: 'zjHeardCrier',
      title: 'The Crier in the Snow',
      body: 'Every winter night a crier offered pardon and reward to any who would leave the fort and renounce his faith. Mír Ṣaláḥ could not count one who had gone.',
    },
    {
      flag: 'zjHujjatWounded',
      title: 'At the Pool',
      body: 'A bullet struck Ḥujjat in the right arm as he made his ablutions at dawn. "Pardon this people, O God," he said, "for they know not what they do."',
    },
    {
      flag: 'zjSawBrokenRoom',
      title: 'The Empty Cradle',
      body: 'A cannon-ball struck the room where Khadíjih sat with Hádí in her arms. She was killed at once; the child died of his burns soon after.',
    },
    {
      flag: 'zjHeardUmmAshrafEnd',
      title: 'The Gate',
      body: 'When the companions ran from the walls to their wounded leader, the soldiers forced the gate behind them and drove a hundred women and children out into the snow.',
    },
    {
      flag: 'zanjanComplete',
      title: 'The Exalted Land',
      body: 'Ḥujjat died prostrate in prayer and was buried in secret. Some eighteen hundred believers gave their lives at Zanján, which the Báb had named the Ard-i-Aʿlá. When the last were led out, an old man gave the call to prayer, and the ʿIráqí regiment refused to go on.',
    },
  ],
};

