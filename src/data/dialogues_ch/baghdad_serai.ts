import type { DialogueTree } from '../../dialogue/types';

/**
 * The hall of the serai in January 1845: Najíb Páshá's tribunal of the
 * Sunni divines of Baghdád and the Shíʿí divines of the shrine cities,
 * convened to judge Mullá ʿAlíy-i-Basṭámí and the book he carried, the
 * Báb's commentary on the Súrih of Joseph. The Sunni side pronounced the
 * book unbelief and its bearer worthy of death; the Shíʿí side, banishment
 * or prison. The Páshá referred the matter to Istanbul. The arguments are
 * heard only in outline, from the scribes' desk at the edge of the room;
 * the master scribe, the muftí's clerk and the student are fictional.
 */

/** The master scribe, at the desk by the door. */
export const scribe: DialogueTree = {
  id: 'bg-scribe',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Your Master',
      text: '(An old scribe in a white turban, a red thread wound in it, sharpening a reed on his thumbnail.) There you are. Is that the ink? Unstop it, smell it. Good. Kneel there and grind me a second well before they begin.',
      choices: [{ text: '"What will we write?"', next: 'write' }],
    },
    write: {
      speaker: 'Your Master',
      text: 'Everything that is decided, and nothing that is merely said. The Páshá will want the verdicts in Arabic for the divines to seal, and a fair copy for Istanbul. (He squints at you.) And you will write nothing at all. You will grind, and blot, and hold your tongue.',
      choices: [{ text: '"Who are they all?"', next: 'who' }],
    },
    who: {
      speaker: 'Your Master',
      onEnter: { set: { bgAtDesk: true } },
      text: 'On the west, the Sunni divines of Baghdád, the muftí\'s people. On the east, the Shíʿí mujtahids come up from Karbilá and Najaf. The Páshá at the head. Go and stand among their clerks if you like, until the Páshá takes his seat. Then to the desk.',
    },
  },
};

/** The master scribe after the court rises. */
export const scribeAfter: DialogueTree = {
  id: 'bg-scribe-after',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Your Master',
      onEnter: { set: { bgScribeAfter: true } },
      text: '(He is sanding the last sheet, alone in the emptied hall.) Two seals on two papers, and both of them wrong in the Páshá\'s eyes, or both of them right. Now a courier rides to Istanbul, and we wait. (He does not look up.) Go home, boy. You held your tongue well today.',
    },
  },
};

/** The desk, before the master has set the player to it. */
export const deskWait: DialogueTree = {
  id: 'bg-desk-wait',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The scribes\' desk: a low board with the inkwells sunk in it, sand, reeds, a stack of polished paper. It is your master\'s place, and he has not yet called you to it. Around the room the divines are still settling, their clerks and students standing behind them.',
    },
  },
};

/** The muftí's clerk, standing behind the Sunni bench. */
export const clerk: DialogueTree = {
  id: 'bg-clerk',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Muftí\'s Clerk',
      text: '(A young man in a white turban wound tight and neat, a pen-case at his belt.) You are from the scribes\' desk? Then we are colleagues. My master has read the Persian\'s pages twice through, by lamplight, which he never does.',
      choices: [{ text: '"What did he find?"', next: 'find' }],
    },
    find: {
      speaker: 'The Muftí\'s Clerk',
      text: 'Arabic that is strange, and strong. That is the whole trouble. A commentary explains the Book of God. These pages speak as if they were themselves sent down, verse after verse, in its manner.',
      choices: [{ text: '"And that is a crime?"', next: 'crime' }],
    },
    crime: {
      speaker: 'The Muftí\'s Clerk',
      onEnter: { set: { bgHeardClerk: true } },
      text: 'Muḥammad is the Seal of the Prophets. Whoever claims a revelation after him claims what no man may claim, and whoever carries such a claim abroad carries it with him. (He says it gently, as a thing long settled.) The law is old, and clear, and I did not write it.',
    },
  },
};

/** The student from Karbilá, standing behind the Shíʿí bench. */
export const studentHall: DialogueTree = {
  id: 'bg-student-hall',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Student from Karbilá',
      text: '(A Persian student with a thin face and a shabby ʿabá, standing behind the mujtahids as if he would rather be anywhere else.) I was in Najaf, you know. I was in the room when he went before Shaykh Muḥammad-Ḥasan, who wrote the Javáhir.',
      choices: [{ text: '"What did he say?"', next: 'said' }],
    },
    said: {
      speaker: 'A Student from Karbilá',
      text: 'That the Promised One, whom we have waited for a thousand years, has appeared. That the Gate has opened. He laid the pages on the Shaykh\'s carpet and asked him to read. He would not say who, or where. Only that it was so.',
      choices: [{ text: '"And the Shaykh?"', next: 'shaykh' }],
    },
    shaykh: {
      speaker: 'A Student from Karbilá',
      text: 'He named him a heretic before all his students, and the students drove him out. (He lowers his voice.) Our own mujtahids have condemned the book too. But they will not hand a Shíʿí to a Sunni sword. You will see.',
      choices: [{ text: '"Do you think he is a heretic?"', next: 'you' }],
    },
    you: {
      speaker: 'A Student from Karbilá',
      onEnter: { set: { bgHeardStudent: true } },
      text: 'I think he was not afraid, and the rest of us were. (He looks across at the prisoner between his guards.) He still is not.',
    },
  },
};

/** Mullá ʿAlí, standing between his guards before the tribunal sits. */
export const aliHall: DialogueTree = {
  id: 'bg-ali-hall',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A man of middle years in a travel-stained ʿabá, thin from the cells, standing very straight between two of the Páshá\'s soldiers in their red fezzes. Everyone in the hall is looking at him. He is looking at the window, where the light comes in off the river.',
      choices: [{ text: '(Catch his eye.)', next: 'eye' }],
    },
    eye: {
      speaker: 'Narrator',
      onEnter: { set: { bgSawAli: true } },
      text: 'He sees the ink on your hands, and nods to you, as a learned man nods to a boy who carries ink: gravely, as if you were both about the same work. Then the soldiers turn him to face the divan.',
    },
  },
};

/** The tribunal, heard from the scribes' desk. */
export const tribunal: DialogueTree = {
  id: 'bg-tribunal',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Najíb Páshá takes his place on the divan, in a fez and a dark frock-coat after the new fashion of Istanbul. The hall falls quiet. You kneel at your master\'s elbow and grind the ink in slow circles, and try to make no sound at all.',
      choices: [{ text: '(Grind the ink.)', next: 'book' }],
    },
    book: {
      speaker: 'Narrator',
      text: 'The book is brought out and laid before the divines: pages in a fine Persian hand, a commentary on the Súrih of Joseph. One of the muftí\'s men reads from it aloud. You do not follow all of the Arabic. You follow the silence that comes after it.',
      choices: [{ text: '(Listen.)', next: 'questions' }],
    },
    questions: {
      speaker: 'Narrator',
      text: 'The questions come from both benches, and you hear them only in pieces over the scratch of your master\'s pen. Whose words are these? Does their author claim to be the Gate? Are they a commentary, or do they claim to be revealed? The prisoner\'s answers are short, and quiet, and do not change.',
      choices: [{ text: '(Lean closer.)', next: 'answer' }],
    },
    answer: {
      speaker: 'Mullá ʿAlíy-i-Basṭámí',
      text: 'I have said what I was sent to say, and I have shown you what I was given to carry. Judge the pages. I cannot unsay them.',
      choices: [{ text: '(Blot your master\'s line.)', next: 'sunni' }],
    },
    sunni: {
      speaker: 'Narrator',
      text: 'The Sunni divines confer, and their verdict is read out: the book is unbelief, and he who believes in it and spreads it deserves to die. Your master writes it down without a pause. The reed does not shake. Your hand on the grinding-stone does.',
      choices: [{ text: '(Keep grinding.)', next: 'shii' }],
    },
    shii: {
      speaker: 'Narrator',
      text: 'Then the Shíʿí mujtahids. They too name the book heresy. But for its bearer they will go no further than banishment, or prison. They will not give one of their own to the sword of the other bench. Two verdicts lie on the carpet, under two sets of seals.',
      choices: [{ text: '(Look up at the divan.)', next: 'pasha' }],
    },
    pasha: {
      speaker: 'Narrator',
      onEnter: { set: { bgVerdict: true } },
      text: 'Najíb Páshá gives neither. He will send both papers and the book to Istanbul, and let the Sublime Porte decide. The prisoner is taken back down to the cells. As he passes the desk he does not look at anyone, and the court rises, and the light has gone off the river.',
    },
  },
};

/** The empty divan after the court has risen. */
export const divan: DialogueTree = {
  id: 'bg-divan',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The Páshá\'s divan, empty now, its cushions still dented. On the carpet below it someone has dropped a reed pen and not come back for it. Through the lattice you can hear the river, which was here before the Sultan and will be here after him.',
    },
  },
};

export const baghdadSeraiDialogues: Record<string, DialogueTree> = {
  [scribe.id]: scribe,
  [scribeAfter.id]: scribeAfter,
  [deskWait.id]: deskWait,
  [clerk.id]: clerk,
  [studentHall.id]: studentHall,
  [aliHall.id]: aliHall,
  [tribunal.id]: tribunal,
  [divan.id]: divan,
};
