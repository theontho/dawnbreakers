import type { DialogueTree } from '../../dialogue/types';

/**
 * The morning after, in the madrasa. Nabíl, from the tutor: Mullá Ḥusayn
 * started to his feet, received the gift with bowed head and kissed it,
 * took the tutor in his arms and kissed his eyes, and prayed for him; the
 * tutor could not fathom what bond there was between the two. A few days
 * later Mullá Ḥusayn left for Khurásán, charging him to keep the secret
 * and not to divulge the name, and foretelling that much blood would be
 * shed in that city in this path. Bahá'u'lláh, Nabíl goes on, then set out
 * for Núr; the student follows.
 */

export const nurHusaynGift: DialogueTree = {
  id: 'nur-husayn-gift',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Mullá Ḥusayn sees the cloth in the tutor\'s hands from across the court and starts to his feet. He receives the sugar-loaf and the tea with his head bowed, and kisses them, as a man kisses a letter from someone he has waited years to hear from.',
      choices: [{ text: '(Stay where you are.)', next: 'embrace' }],
    },
    embrace: {
      speaker: 'Narrator',
      text: 'Then he takes the tutor in his arms and kisses his eyes. "My dearly beloved friend," he says, "even as you have gladdened my heart, may God grant you lasting joy, and fill your heart with gladness that does not pass."',
      choices: [{ text: '"Mullá Ḥusayn, what was in the scroll?"', next: 'scroll' }],
    },
    scroll: {
      speaker: 'Mullá Ḥusayn',
      text: '(He sits down on the platform with the sugar-loaf in his lap, like a boy.) Pages of the verses I heard in Shíráz. And He read them. That is all I may tell you, and it is more than enough.',
      choices: [
        { text: '"Was this the mystery you were sent to find?"', next: 'secret' },
        { text: '"What will you do now?"', next: 'khurasan' },
      ],
    },
    secret: {
      speaker: 'Mullá Ḥusayn',
      text: 'Ask me again in some years, and perhaps I will answer. (His eyes go to the gate.) The secret of things is hidden from our eyes. Ours is to raise the call of the new Day, and to give this Message to every soul who will hear it.',
      choices: [{ text: '"What will you do now?"', next: 'khurasan' }],
    },
    khurasan: {
      speaker: 'Mullá Ḥusayn',
      text: 'What I was told: write to Him of every soul who has believed and every soul who has turned away, from Iṣfahán, from Ṭihrán, and from Khurásán. I go to Khurásán within the week. My hands are not empty now.',
      choices: [{ text: '(Wait with him through the days before he goes.)', next: 'farewell' }],
    },
    farewell: {
      speaker: 'Narrator',
      text: 'A few days later he stands at the gate with his staff, dust already on his hem. He takes the tutor\'s hands, and then, as if you had always been one of his, yours, and speaks low.',
      choices: [{ text: '(Listen.)', next: 'charge' }],
    },
    charge: {
      speaker: 'Mullá Ḥusayn',
      text: 'Breathe to no one what you have heard and seen. Keep it a secret hidden in your breast. Do not speak His name, for those who envy His station will rise to harm Him. And when you pray, pray that God protect Him, that through Him He may lift the downtrodden, enrich the poor, and redeem the fallen.',
      choices: [{ text: '(Listen.)', next: 'blood' }],
    },
    blood: {
      speaker: 'Mullá Ḥusayn',
      text: '(He looks past you, at the city.) Many a soul in this city will shed his blood in this path. That blood will water the Tree of God, and it will flourish, and overshadow all mankind.',
      choices: [{ text: '"Go with God, Mullá Ḥusayn."', next: 'gone' }],
    },
    gone: {
      speaker: 'Narrator',
      onEnter: { set: { nurHusaynFarewell: true } },
      text: 'He goes east. Not long after, the tutor finds you in the court: the son of the house in the lane has set out for Núr, the Vazír\'s country in the hills of Mázindarán. The tutor says it as if he had been told to tell no one, and could not help it. The road north leaves Ṭihrán from the end of that same lane.',
    },
  },
};

/** The tutor in the morning, puzzled by what he has seen. */
export const nurTutorMorning: DialogueTree = {
  id: 'nur-tutor-morning',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Muḥammad-i-Muʿallim',
      text: '(He stands a little apart, watching Mullá Ḥusayn with the sugar-loaf.) That man thinks nothing of the pomp of kings. I have seen him look at a prince\'s retinue as at a passing cart. And for a loaf of sugar he weeps.',
      choices: [{ text: '"What do you make of it?"', next: 'bond' }],
    },
    bond: {
      speaker: 'Mullá Muḥammad-i-Muʿallim',
      text: 'I do not know. What bond can there be between those two, who have never met? What has lit such a fire between them? (He shakes his head.) I cannot unravel it. I think I will be a long time trying.',
    },
  },
};

/** Mullá Ḥusayn's cell after he has gone to Khurásán. */
export const nurCellSwept: DialogueTree = {
  id: 'nur-cell-swept',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The cell is swept, the reed mat rolled, the lamp left filled for the next student. On the platform where he sat there is still a dusting of sugar, which the sparrows have found.',
    },
  },
};

export const nurMorningDialogues: Record<string, DialogueTree> = {
  [nurHusaynGift.id]: nurHusaynGift,
  [nurTutorMorning.id]: nurTutorMorning,
  [nurCellSwept.id]: nurCellSwept,
};
