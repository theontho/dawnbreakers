import type { DialogueTree } from '../../dialogue/types';

/**
 * The quay below the serai on the morning of the tribunal, and the same
 * quay at evening after it. The boatman, the bookseller, the merchant and
 * the coffee-seller are fictional; what they say of Mullá ʿAlí, brought up
 * from Najaf under guard after Shaykh Muḥammad-Ḥasan denounced him, and of
 * Najíb Páshá's joint tribunal of Sunni and Shíʿí divines, is history.
 *
 * This chapter's witness is not the pilgrim of the other chapters, who is
 * in Arabia with Quddús, but a boatman's son of Karkh apprenticed to the
 * scribes of the serai (`bg-opening`).
 */

/** The chapter's opening narration: who the player is this time. */
export const opening: DialogueTree = {
  id: 'bg-opening',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'In this chapter you are someone else. The pilgrim you have followed is far to the south, in Arabia, on the pilgrimage. You are a boatman\'s son of Karkh, on the west bank of the Tigris at Baghdád, apprenticed to the scribes of the governor\'s serai. You grind their ink and trim their reed pens.',
      choices: [{ text: '(Listen.)', next: 'who' }],
    },
    who: {
      speaker: 'Narrator',
      onEnter: { set: { bgWitness: true } },
      text: 'It is January of 1845, and cold. Your father has just brought you over the river in his guffa. Your master wants fresh ink from the bookseller at the bridge of boats, because today Najíb Páshá sits in judgement on a Persian prisoner, and every word will be written down.',
    },
  },
};

/** The boatman, the player's father, with his guffa on the shingle. */
export const father: DialogueTree = {
  id: 'bg-father',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Your Father',
      text: '(He is coiling the wet rope into the bottom of the guffa, his breath smoking.) Mind the ink this time. Your master paid for the last bottle twice: once in silver and once in your ears.',
      choices: [{ text: '"Have you heard about the prisoner?"', next: 'prisoner' }],
    },
    prisoner: {
      speaker: 'Your Father',
      text: 'The whole river has heard. A Persian mullá, brought up from Najaf under guard by the desert road. He stood before the great mujtahid there and said the Promised One has come. (He spits over the side.) They put him in the cells under the serai.',
      choices: [{ text: '"What will they do to him?"', next: 'do' }],
    },
    do: {
      speaker: 'Your Father',
      onEnter: { set: { bgHeardFather: true } },
      text: 'That is for the Páshá and the turbans. You write what your master tells you, and you keep your face like a closed door. (He pushes off from the shingle.) I will be back for you at the evening call.',
    },
  },
};

/** The bookseller at the foot of the bridge of boats, who sells the scribes their ink. */
export const bookseller: DialogueTree = {
  id: 'bg-bookseller',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Bookseller',
      text: '(An old man behind a stall of Qur\'áns, almanacs and bundled reed pens, a brazier at his feet.) The scribes\' boy. Oak-gall ink, the black that does not fade, and a bundle of Wásiṭ reeds. Your master will want them all today.',
      choices: [{ text: '(Pay him, and wrap the bottle in your sash.)', next: 'book' }],
    },
    book: {
      speaker: 'The Bookseller',
      text: 'They say the Persian\'s book is up there in the serai. A commentary on the Súrih of Joseph, they say, but written verse upon verse in the manner of the Qur\'án itself. I have been offered a copy of everything in my life. Nobody will sell me that one.',
      choices: [{ text: '"Why does that matter so much?"', next: 'why' }],
    },
    why: {
      speaker: 'The Bookseller',
      onEnter: { set: { bgHeardBookseller: true } },
      text: 'Because a commentary is a learned man\'s work, and verses are something else. (He taps the stall.) Today they will decide which it is. Go on, your master is waiting, and so is the Páshá.',
    },
  },
};

/** A merchant of Shíráz at the coffee-house, who has heard rumours from home. */
export const merchant: DialogueTree = {
  id: 'bg-merchant',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Merchant of Shíráz',
      text: '(A Persian in a tall black hat, warming his hands round a tiny cup.) You are the scribes\' boy? Then you will be in the room. I would give a bale of indigo to be in the room.',
      choices: [{ text: '"Do you know the prisoner?"', next: 'know' }],
    },
    know: {
      speaker: 'A Merchant of Shíráz',
      text: 'Not him. But my letters from home this summer were strange. Students of Karbilá came to Shíráz, one after another, and sat with a young siyyid of the city, a merchant like me. Then the students scattered, and the young man went on pilgrimage to Mecca.',
      choices: [{ text: '"Is he the one the prisoner speaks of?"', next: 'name' }],
    },
    name: {
      speaker: 'A Merchant of Shíráz',
      onEnter: { set: { bgHeardMerchant: true } },
      text: 'The prisoner has not said a name, I hear, not in Najaf and not here. (He sets the cup down.) A man who will not save himself with one word. Either he is mad, or the word is not his to spend.',
    },
  },
};

/** The coffee-seller under the arches of his coffee-house. */
export const coffee: DialogueTree = {
  id: 'bg-coffee',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Coffee-Seller',
      text: '(He pours from a long-spouted brass pot without looking.) Forty years I have poured coffee under the Páshá\'s windows, and I have never seen this. The Sunni divines of Baghdád and the Shíʿí divines of Karbilá and Najaf, called under one roof on one morning.',
      choices: [{ text: '"Why both?"', next: 'both' }],
    },
    both: {
      speaker: 'The Coffee-Seller',
      onEnter: { set: { bgHeardCoffee: true } },
      text: 'The prisoner is a Shíʿí and a Persian, and the Páshá is the Sultan\'s man. If the Sunni alone condemn him, Karbilá says it was spite. If the Shíʿí alone condemn him, Istanbul asks why a Sunni Páshá let them judge. So: both. (He grins.) Clever. Cold, but clever.',
    },
  },
};

/** The guffa on the shingle. */
export const guffa: DialogueTree = {
  id: 'bg-guffa',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A guffa lies drawn up on the shingle: a round boat of woven reeds sealed black with bitumen, as wide as a man is tall and a half again. Boats like it have crossed this river since before Babylon. Your father says they will cross it after Baghdád is dust.',
    },
  },
};

/** The bridge of boats over to Karkh. */
export const bridge: DialogueTree = {
  id: 'bg-bridge',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The bridge of boats runs out over the brown water to Karkh: old hulls moored side by side, planks laid across them, the whole thing lifting and creaking as the river shoulders past. When the floods come in spring they cut it loose and let it swing to the bank.',
    },
  },
};

/** The student from Karbilá, at evening, by the prison door. */
export const studentBread: DialogueTree = {
  id: 'bg-student-bread',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Student from Karbilá',
      text: '(The student from the hall stands near the prison door with a cloth bundle, as if he had been there since the court rose.) They will not let me in. A Persian asking after a Persian heretic, in the Páshá\'s own prison? The jailer laughed at me.',
      choices: [{ text: '"What is in the cloth?"', next: 'bread' }],
    },
    bread: {
      speaker: 'A Student from Karbilá',
      text: 'Bread, still warm, and dates, and a little jug of water. (He holds it out.) You are a Baghdádí boy with ink on your hands. The jailer will not look at you twice. Take it to him. Please.',
      choices: [
        { text: '(Take the bundle.)', next: 'take' },
        { text: '"Why do you care, if you think him wrong?"', next: 'why' },
      ],
    },
    why: {
      speaker: 'A Student from Karbilá',
      text: 'I did not say I think him wrong. I said my teachers do. (He looks at the river.) I stood in Najaf when he spoke to the Shaykh, and I have not slept well since. Take the bread.',
      choices: [{ text: '(Take the bundle.)', next: 'take' }],
    },
    take: {
      speaker: 'A Student from Karbilá',
      onEnter: { set: { bgCarryingBread: true } },
      text: 'God keep you. Tell him a student of Karbilá sent it, nothing more. I go home tomorrow, and I have a teacher there who asks a great many questions.',
    },
  },
};

/** The boatman at evening, waiting to take the player home. */
export const fatherWinter: DialogueTree = {
  id: 'bg-father-winter',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Your Father',
      text: '(He holds the guffa steady against the shingle with his pole.) Death, they are saying on the quay, and then they say banishment, and then they say the Páshá has written to Istanbul. Which is it?',
      choices: [{ text: '"All of them. He has gone back to the cells."', next: 'cells' }],
    },
    cells: {
      speaker: 'Your Father',
      onEnter: { set: { bgFatherWinter: true } },
      text: '(He is quiet a while.) Your mother would say take him something. I would say keep your head down. (He looks at the bundle in your hands, and sighs.) Go on, then. I will wait. The river is not going anywhere.',
    },
  },
};

/** The bookseller at evening. */
export const booksellerWinter: DialogueTree = {
  id: 'bg-bookseller-winter',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Bookseller',
      onEnter: { set: { bgBooksellerWinter: true } },
      text: '(He is tying a cloth over his stall for the night.) So. Not a commentary, then. (He shakes his head.) I sold your master the ink to write it down. Forty years of selling ink, boy, and I never once asked what it would be used for.',
    },
  },
};

/** The coffee-seller at evening. */
export const coffeeWinter: DialogueTree = {
  id: 'bg-coffee-winter',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Coffee-Seller',
      onEnter: { set: { bgCoffeeWinter: true } },
      text: 'Two verdicts and no sentence. The Sunni say death, the Shíʿí say banishment, and the Páshá says, let Istanbul decide. (He banks the coals for the night.) Months, that will take. The Persian will be thin by spring.',
    },
  },
};

export const baghdadQuayDialogues: Record<string, DialogueTree> = {
  [opening.id]: opening,
  [father.id]: father,
  [bookseller.id]: bookseller,
  [merchant.id]: merchant,
  [coffee.id]: coffee,
  [guffa.id]: guffa,
  [bridge.id]: bridge,
  [studentBread.id]: studentBread,
  [fatherWinter.id]: fatherWinter,
  [booksellerWinter.id]: booksellerWinter,
  [coffeeWinter.id]: coffeeWinter,
};
