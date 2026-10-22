import type { DialogueTree } from '../../dialogue/types';

/**
 * The lane before the house of the family of the late Mírzá Buzurg of Núr,
 * at dawn. Nabíl, from Mírzá Músá, records that the tutor found Mírzá Músá
 * at the gate, was brought in with a message of welcome, and gave the
 * scroll; that Bahá'u'lláh read passages of it aloud, spoke a few words to
 * His brother, and sent Mullá Ḥusayn a loaf of Russian sugar and a package
 * of tea with His love. The player waits outside; what passed within is
 * told by the tutor, as he told it.
 */

/** The tutor at dawn, before he goes in. */
export const nurTutorDawn: DialogueTree = {
  id: 'nur-tutor-dawn',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Muḥammad-i-Muʿallim',
      text: '(He has the bundle under his cloak and has kept one hand on it the whole way through the lanes.) There. The door in the wall. And that is His brother, Mírzá Músá, at the gate already. This house is up before the bakers.',
      choices: [{ text: '"Go on. I will wait here."', next: 'in' }],
    },
    in: {
      speaker: 'Narrator',
      onEnter: { set: { nurTutorWentIn: true } },
      text: 'The tutor speaks a few words at the gate. Mírzá Músá goes in, and comes out again almost at once with a word of welcome, and the two of them pass inside. The door does not quite close. Through the gap you see a swept court, a pool, and nothing else.',
    },
  },
};

/** Mírzá Músá at the gate, before the tutor goes in. */
export const nurMusa: DialogueTree = {
  id: 'nur-musa',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mírzá Músá',
      text: '(A young man in a dark coat stands at the gate as if he were used to keeping it.) Peace be upon you. You are with Mullá Muḥammad? Then let him speak first. The door of this house opens early, and the poor know it better than anyone.',
    },
  },
};

/** The baker across the lane, lighting his oven. */
export const nurBaker: DialogueTree = {
  id: 'nur-baker',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Baker',
      text: '(A baker is feeding brushwood into his oven. The first loaves are slapped to its wall.) Waiting on the house? Everyone waits on that house. Sit, the oven is warm.',
      choices: [{ text: '"Whose house is it?"', next: 'vazir' }],
    },
    vazir: {
      speaker: 'The Baker',
      text: 'The family of the late Mírzá Buzurg, the Vazír, from Núr in Mázindarán. He wrote a hand like nobody in Persia; the great houses of Ṭihrán kept his pages like jewels. My father baked for his kitchen.',
      choices: [{ text: '"The late Vazír?"', next: 'fortune' }],
    },
    fortune: {
      speaker: 'The Baker',
      text: 'Twenty years nothing went wrong for that family, and then everything did. A flood came down out of the mountains at Tákur and took half his great house there. Then his posts were taken, one after another, by men who envied him. He kept giving bread away until the end.',
      choices: [{ text: '"And now?"', next: 'son' }],
    },
    son: {
      speaker: 'The Baker',
      onEnter: { set: { nurHeardBaker: true } },
      text: 'Now one of the sons keeps the house, and keeps it the same way. When the Vazír died they offered Him his post at court. He did not want it. (He pulls out a loaf and tosses it from hand to hand.) He would rather feed half the quarter. I do not complain: I bake the bread.',
    },
  },
};

/** An old man waiting by the door with the poor of the quarter. */
export const nurPoorMan: DialogueTree = {
  id: 'nur-poor-man',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'An Old Man',
      text: '(An old man sits against the wall by the door with a cloth folded on his knees, waiting with a patience that has no hurry in it.) You are early. The bread does not come out before the sun.',
      choices: [{ text: '"You come here every day?"', next: 'every' }],
    },
    every: {
      speaker: 'An Old Man',
      text: 'Every day God sends. So do they. (He nods at the others along the wall.) In this quarter they call the master of this house the Father of the Poor. His wife they call the Mother of Consolation.',
      choices: [{ text: '"What is He like?"', next: 'like' }],
    },
    like: {
      speaker: 'An Old Man',
      onEnter: { set: { nurHeardPoorMan: true } },
      text: 'Like? (He thinks about it.) Whatever is given at this door is given as if we did them a kindness by taking it. I have been given bread by great men before. It is not the same.',
    },
  },
};

/** The door, before the tutor has gone in (or once he is back at the madrasa). */
export const nurHouseDoorBefore: DialogueTree = {
  id: 'nur-house-door-before',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A plain door in a long wall, under a band of blue tile. It is not your errand that waits behind it. You step back into the lane.',
    },
  },
};

/** The door while the tutor is within, before the player has heard the lane. */
export const nurHouseDoorShut: DialogueTree = {
  id: 'nur-house-door-shut',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The door stands a hand\'s breadth open. You do not look through it. Across the lane the baker\'s oven is roaring, and along the wall the poor of the quarter are waiting, as they wait every morning. You wait with them.',
    },
  },
};

/** The door while the tutor is within: he comes out with the answer. */
export const nurHouseDoorWait: DialogueTree = {
  id: 'nur-house-door-wait',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The sun clears the roofs. A servant brings out the bread and the old men along the wall rise to meet it. You hear nothing from within: no raised voice, no music. Only, once, a voice reading, too low to make out, and then a long silence.',
      choices: [{ text: '(Wait.)', next: 'out' }],
    },
    out: {
      speaker: 'Narrator',
      onEnter: { set: { nurTutorCameOut: true } },
      text: 'Then the door opens and the tutor comes out. He is carrying something wrapped in a cloth in both hands, a sugar-loaf by its shape, and a packet. He walks straight past you, stops, and comes back as if he had forgotten where he was going.',
    },
  },
};

/** The tutor in the lane with the gifts, telling what passed within. */
export const nurTutorAnswer: DialogueTree = {
  id: 'nur-tutor-answer',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Muḥammad-i-Muʿallim',
      text: 'He bade us both be seated, His brother and me. Mírzá Músá laid the scroll before Him. He unfolded it, glanced over it, and began to read certain of its passages aloud.',
      choices: [{ text: '"What did it say?"', next: 'voice' }],
    },
    voice: {
      speaker: 'Mullá Muḥammad-i-Muʿallim',
      text: 'I do not know. I heard the words, and I do not know. I listened to the sound of His voice, and its sweetness, and I sat there like a man enraptured. I have read the Qur\'án aloud all my life. I have never heard it read like that.',
      choices: [{ text: '"Did He answer?"', next: 'said' }],
    },
    said: {
      speaker: 'Mullá Muḥammad-i-Muʿallim',
      text: 'When He had read a page He turned to His brother. He said that whoever believes in the Qur\'án and knows it is from God, and yet hesitates, though it be for a moment, to own that these words have the same power to give new life, has erred in his judgment and strayed far from the path of justice. Then He said no more.',
      choices: [{ text: '"And this?" (The bundle in his hands.)', next: 'gift' }],
    },
    gift: {
      speaker: 'Mullá Muḥammad-i-Muʿallim',
      onEnter: { set: { nurGiftCarried: true } },
      text: 'For Mullá Ḥusayn, a gift from Him: a loaf of Russian sugar and a package of tea, with His appreciation and His love. That is all. (He looks at the sugar-loaf as if it might tell him something.) Come. He will be waiting.',
    },
  },
};

/** The door afterwards. */
export const nurHouseDoorAfter: DialogueTree = {
  id: 'nur-house-door-after',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The door is shut again, the step swept, the bread given out. Nothing about it is different from yesterday. Mullá Ḥusayn had told you a mystery was hidden in this city. You stand a moment longer than you need to, and then you go.',
    },
  },
};

export const nurLaneDialogues: Record<string, DialogueTree> = {
  [nurTutorDawn.id]: nurTutorDawn,
  [nurMusa.id]: nurMusa,
  [nurBaker.id]: nurBaker,
  [nurPoorMan.id]: nurPoorMan,
  [nurHouseDoorBefore.id]: nurHouseDoorBefore,
  [nurHouseDoorShut.id]: nurHouseDoorShut,
  [nurHouseDoorWait.id]: nurHouseDoorWait,
  [nurTutorAnswer.id]: nurTutorAnswer,
  [nurHouseDoorAfter.id]: nurHouseDoorAfter,
};
