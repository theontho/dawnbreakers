import type { DialogueTree } from '../../dialogue/types';

export const ch6WardenSoftens: DialogueTree = {
  id: 'ch6-warden-softens',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'ʿAlí Khán, Warden of Mákú',
      text: 'The order is plain: few may approach the Prisoner. These mountains keep silence better than men do.',
      choices: [
        {
          text: '"I bring no disturbance — only reverence for one unjustly confined."',
          next: 'soften',
          effect: { set: { ch6SpokeGently: true } },
        },
        {
          text: '"Can stone walls imprison a voice that has already crossed Persia?"',
          next: 'tested',
          effect: { set: { ch6ChallengedWarden: true } },
        },
      ],
    },
    soften: {
      speaker: 'ʿAlí Khán',
      onEnter: { set: { ch6WardenSoftened: true } },
      text: 'At first I thought severity was obedience. Yet His patience has made my own command seem small. Speak quietly, and pass.',
      choices: [
        { text: '"May your mercy become your honour."' },
      ],
    },
    tested: {
      speaker: 'ʿAlí Khán',
      onEnter: { set: { ch6WardenSoftened: true } },
      text: 'Bold words for a narrow pass. Still... I have seen His enemies grow loud while He remains serene. Go, then — but carry no rumor carelessly.',
      choices: [
        { text: '(Bow, and enter the cold fortress.)' },
      ],
    },
  },
};

export const ch6CourierWitness: DialogueTree = {
  id: 'ch6-prisoner-courier',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Mountain Courier',
      onEnter: { set: { ch6HeardTransfer: true } },
      text: 'Snow closes the track by dusk. Still the letters go out — hidden under wool, memorised in the heart, carried from Mákú toward Chihríq.',
      choices: [
        { text: '"The road itself has become a witness."', next: 'witness' },
        { text: '"Then Chihríq is not an ending."', next: 'witness' },
      ],
    },
    witness: {
      speaker: 'A Mountain Courier',
      text: 'No prison is an ending while a single line can be borne away. Men call these places remote; I have never seen news travel faster.',
      choices: [
        { text: '(Thank him, and watch the pass.)' },
      ],
    },
  },
};

export const ch6MullaHusaynVisit: DialogueTree = {
  id: 'ch6-mulla-husayn-visit',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn',
      text: 'I have crossed long roads for one more glimpse of my Beloved. The mountain wind is bitter, but it cannot chill recognition.',
      choices: [
        {
          text: '"I remember the night of first recognition."',
          next: 'memory',
          requires: f => !!f.firstLetter,
          effect: { set: { ch6RememberedFirstNight: true } },
        },
        {
          text: '"What sustains you after so much hardship?"',
          next: 'steadfast',
          effect: { set: { ch6AskedSteadfastness: true } },
        },
      ],
    },
    memory: {
      speaker: 'Mullá Ḥusayn',
      text: 'Then you know: a lamp once kindled does not become night again. These fortresses are only shadows around that flame.',
      choices: [
        { text: '(Stand with him in silence.)' },
      ],
    },
    steadfast: {
      speaker: 'Mullá Ḥusayn',
      text: 'The first word I heard from Him still travels ahead of me. I follow it, whether the path leads to a garden or a prison gate.',
      choices: [
        { text: '(Let his certainty steady your own heart.)' },
      ],
    },
  },
};

export const ch6Bayan: DialogueTree = {
  id: 'ch6-bayan',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Writing Desk',
      text: 'In the barred stillness of Chihríq, pages gather beneath the reed pen. The Persian Bayán is being revealed — law, symbol, summons, and promise.',
      choices: [
        {
          text: '(Read with awe.)',
          next: 'awe',
          effect: { set: { ch6BayanStance: 'awe' } },
        },
        {
          text: '(Study the order of the verses.)',
          next: 'study',
          effect: { set: { ch6BayanStance: 'study' } },
        },
        {
          text: '(Grieve that such words are born in prison.)',
          next: 'grief',
          effect: { set: { ch6BayanStance: 'grief' } },
        },
      ],
    },
    awe: {
      speaker: 'Narrator',
      text: 'The cold room seems to widen. What was meant as confinement becomes a chamber of revelation.',
      choices: [
        { text: '(Continue)', next: 'complete' },
      ],
    },
    study: {
      speaker: 'Narrator',
      text: 'You trace the careful architecture of meaning: each line answering old expectation while opening a future no prison can measure.',
      choices: [
        { text: '(Continue)', next: 'complete' },
      ],
    },
    grief: {
      speaker: 'Narrator',
      text: 'Your sorrow does not lessen the light. The ink dries beside iron bars, and the contrast makes the testimony sharper.',
      choices: [
        { text: '(Continue)', next: 'complete' },
      ],
    },
    complete: {
      speaker: 'Narrator',
      onEnter: { set: { bayanComplete: true } },
      text: 'From Mákú to Chihríq, isolation has failed its purpose. Wardens soften, visitors are strengthened, and the Bayán leaves the mountain prison as a sign for a new age.',
    },
  },
};

export const chapter06Dialogues: Record<string, DialogueTree> = {
  [ch6Bayan.id]: ch6Bayan,
  [ch6WardenSoftens.id]: ch6WardenSoftens,
  [ch6MullaHusaynVisit.id]: ch6MullaHusaynVisit,
  [ch6CourierWitness.id]: ch6CourierWitness,
};
