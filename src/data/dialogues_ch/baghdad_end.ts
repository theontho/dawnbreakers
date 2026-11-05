import type { DialogueTree } from '../../dialogue/types';

/**
 * The morning Mullá ʿAlí is led away from Baghdád toward Istanbul, by the
 * road north, and the chapter's close. What became of him is uncertain:
 * Nabíl could learn nothing sure; Ottoman records suggest he was condemned
 * to labour in the imperial dockyards and died there, perhaps in 1846. He
 * is remembered as the first to give his life for the Faith of the Báb.
 */

/** Mullá ʿAlí in chains at the head of the quay. */
export const aliDeparture: DialogueTree = {
  id: 'bg-ali-departure',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Grey light on the river. At the head of the quay the Páshá\'s soldiers stand yawning beside their mules, and between them, with chains at his wrists, Mullá ʿAlí. They are taking him north, to Mosul and the long road to Istanbul.',
      choices: [{ text: '(Go to him.)', next: 'him' }],
    },
    him: {
      speaker: 'Mullá ʿAlíy-i-Basṭámí',
      text: 'The boatman\'s son. (The chain clinks as he lifts his hand to you.) You came. Go home after, before the soldiers notice you. They are tired this morning, and so am I.',
      choices: [{ text: '"Will they let you go, in Istanbul?"', next: 'go' }],
    },
    go: {
      speaker: 'Mullá ʿAlíy-i-Basṭámí',
      text: 'God knows. They have the pages, at least, and pages travel further than men. (He looks down the river toward the bridge of boats.) Remember what you promised me.',
      choices: [{ text: '"I remember."', next: 'march' }],
    },
    march: {
      speaker: 'Narrator',
      text: 'An officer calls the march. The mules move off up the river road, and he goes with them on foot between the soldiers, and does not look back until the bend. At the bend he does.',
      choices: [{ text: '(Lift your hand.)', next: 'close' }],
    },
    close: {
      speaker: 'Narrator',
      onEnter: { set: { baghdadComplete: true } },
      text: 'No word of him came back that anyone could trust. Some said he fell ill and died on the road, and some that he was put to death. Some said he was set to labour in the Sultan\'s dockyards at Istanbul and died there. Mullá ʿAlí of Basṭám, the fourth Letter of the Living, was the first to give his life for the new Faith.',
    },
  },
};

/** The boatman, the morning his son's prisoner goes. */
export const fatherDawn: DialogueTree = {
  id: 'bg-father-dawn',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Your Father',
      onEnter: { set: { bgFatherDawn: true } },
      text: '(He has his pole across his knees, and does not push off.) Go and stand where he can see you. A man going that far should see one face on the quay that is not a soldier\'s. I will wait. I am good at waiting.',
    },
  },
};

export const baghdadEndDialogues: Record<string, DialogueTree> = {
  [aliDeparture.id]: aliDeparture,
  [fatherDawn.id]: fatherDawn,
};
