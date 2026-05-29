import type { DialogueTree } from '../../dialogue/types';

/** Chapter 2 main encounter: meeting another seeker on the road north of Shíráz. */
export const roadEncounter: DialogueTree = {
  id: 'road-encounter',
  startId: 'g',
  nodes: {
    g: {
      id: 'g',
      speaker: 'Another Seeker',
      text: 'Peace upon you, friend. The dust of Shíráz is on your sandals, and dawn is behind your shoulder. Have you news of the One Siyyid Káẓim foretold?',
      choices: [
        { text: '"I have. The Promise is fulfilled — I have met Him."',
          next: 'certain', requires: f => !!f.firstLetter,
          effect: { set: { sharedNews: true, roadCertaintyShared: true } } },
        { text: '"I found a door, a lamp, and words I am still trying to understand."',
          next: 'uncertain', requires: f => !f.firstLetter,
          effect: { set: { sharedNews: true, roadUncertainWitness: true } } },
        { text: '"Walk south with a pure heart. Shíráz will answer better than I can."',
          next: 'guarded', effect: { set: { directionsGiven: true } } },
      ],
    },
    certain: {
      id: 'certain',
      speaker: 'Another Seeker',
      text: '(His hand goes to his breast.) Then the veils have been lifted for you. Tell me where to go, and by what sign you knew Him.',
      choices: [
        { text: '"At the house of Siyyid ʿAlí-Muḥammad. The verses flowed before my question had finished forming."',
          next: 'directions', effect: { set: { directionsGiven: true } } },
        { text: '"Do not borrow even my certainty. Go, listen, and let the verses judge your heart."',
          next: 'counsel', effect: { set: { directionsGiven: true } } },
      ],
    },
    uncertain: {
      id: 'uncertain',
      speaker: 'Another Seeker',
      text: 'There is honesty in trembling. A borrowed flame may gutter; a hidden ember may yet kindle. Did He send you onward?',
      choices: [
        { text: '"He did not compel me. That mercy troubles me more than command would have."', next: 'counsel' },
        { text: '"I delayed, yet the road itself seems to ask for witness."', next: 'counsel' },
      ],
    },
    guarded: {
      id: 'guarded',
      speaker: 'Another Seeker',
      text: 'South, then. Past the last gardens and into the lanes where lamps burn late. I will go carefully; the age is full of listeners.',
      choices: [
        { text: '"Carefully, yes — but do not let caution become sleep."', next: 'gathering' },
      ],
    },
    directions: {
      id: 'directions',
      speaker: 'Another Seeker',
      text: 'Siyyid ʿAlí-Muḥammad of Shíráz. The name lands like rain on dust. If this is true, my whole life has been a road to one threshold.',
      choices: [
        { text: '"Then ride before the day grows hot."', next: 'gathering' },
      ],
    },
    counsel: {
      id: 'counsel',
      speaker: 'Another Seeker',
      text: 'I will go, not to weigh your heart, but to offer mine. Certainty may be a sunrise; uncertainty may be the paling sky just before it.',
      choices: [
        { text: '"May your search be accepted."', next: 'gathering' },
      ],
    },
    gathering: {
      id: 'gathering',
      speaker: 'Narrator',
      text: 'At the caravanserai, merchants bind loads for Iṣfahán and beyond. At the shrine, dust gathers in the carved letters. News no longer belongs to one room in Shíráz; it has entered roads, mouths, silences.',
      choices: [
        { text: '(Part as kindred travellers.)', next: 'farewell' },
      ],
    },
    farewell: {
      id: 'farewell',
      speaker: 'Narrator',
      onEnter: { set: { roadComplete: true } },
      text: 'He rides south; you turn your face north. Behind you, the first declaration burns like a lamp. Ahead lie Iṣfahán, Tabríz, Mákú — and the gathering of the Dawn-Breakers.\n\n(To be continued.)',
    },
  },
};

/** A wandering dervish near the roadside shrine reflects on motion and silence. */
export const roadDervish: DialogueTree = {
  id: 'road-dervish',
  startId: 'g',
  nodes: {
    g: {
      id: 'g',
      speaker: 'Wandering Dervish',
      onEnter: { set: { roadHeardDervish: true } },
      text: 'The road has two tongues: one of dust beneath the foot, one of silence inside the breast. Most men hear only the first.',
      choices: [
        { text: '"And what does the silence say today?"', next: 'silence' },
        { text: '(Offer him a little water from your skin.)', next: 'water' },
      ],
    },
    silence: {
      id: 'silence',
      speaker: 'Wandering Dervish',
      text: 'It says that a dawn does not argue with the horizon. It merely arrives, and the sleepers must decide whether to call it light.',
      choices: [
        { text: '"Then may I not sleep through it."' },
      ],
    },
    water: {
      id: 'water',
      speaker: 'Wandering Dervish',
      text: 'May the cup you give return as courage when your own throat is dry. The north road is long, friend, and not all thirst is of the body.',
      choices: [
        { text: '"Pray for the travellers."' },
      ],
    },
  },
};

/** A caravan muleteer gives grounded context for the road north. */
export const roadMuleteer: DialogueTree = {
  id: 'road-muleteer',
  startId: 'g',
  nodes: {
    g: {
      id: 'g',
      speaker: 'Caravan Muleteer',
      onEnter: { set: { roadMetMuleteer: true } },
      text: 'Keep clear of the gray mule; she bites scholars and governors alike. Are you bound north with letters, trade, or a question?',
      choices: [
        { text: '"A question that has become a road."', next: 'question' },
        { text: '"What news travels with the caravans?"', next: 'news' },
      ],
    },
    question: {
      id: 'question',
      speaker: 'Caravan Muleteer',
      text: 'Then carry dates, patience, and a quiet tongue. Between Shíráz and Iṣfahán, a careless word can outrun the swiftest horse.',
      choices: [
        { text: '"I will remember."' },
      ],
    },
    news: {
      id: 'news',
      speaker: 'Caravan Muleteer',
      text: 'Pilgrims speak of expectation, couriers of unrest, merchants of unpaid debts. Yet beneath it all I hear one thing: people are listening for a voice they cannot name.',
      choices: [
        { text: '"Perhaps the name is already on the road."' },
      ],
    },
  },
};

export const chapter02Dialogues: Record<string, DialogueTree> = {
  [roadEncounter.id]: roadEncounter,
  [roadDervish.id]: roadDervish,
  [roadMuleteer.id]: roadMuleteer,
};
