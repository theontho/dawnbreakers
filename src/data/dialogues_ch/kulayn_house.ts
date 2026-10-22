import type { DialogueTree } from '../../dialogue/types';

/**
 * The house of Ḥájí Mírzá Jání in Káshán, the night of Naw-Rúz 1847, after
 * Nabíl: Siyyid Ḥusayn-i-Yazdí, called to Káshán beforehand, taking down a
 * Tablet the Báb revealed in honour of His host; a few friends received,
 * among them a young man named Mihdí; Siyyid ʿAbdu'l-Báqí, learned and
 * unmoved, leaving without asking the Guest's name; the third morning. The
 * guest room's door stays shut while He is within (`kulayn-hall-door`
 * sets `kulaynFarewell`).
 */

/** The host in his own court. */
export const kulaynJaniHouse: DialogueTree = {
  id: 'kulayn-jani-house',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Ḥájí Mírzá Jání',
      text: '(He crosses the court with a tray of sweets he has forgotten he is carrying.) You found it. Come. (He looks back at the lamplit iwan.) Siyyid Ḥusayn of Yazd is in there with Him. He came to Káshán days ago at His bidding, and waited in the town without knowing why. Now he knows.',
      choices: [{ text: '"What is happening in there?"', next: 'tablet' }],
    },
    tablet: {
      speaker: 'Ḥájí Mírzá Jání',
      text: 'He is dictating, and Siyyid Ḥusayn writes as fast as his hand will go. (He sets the tray on the rim of the pool, very carefully, as if it might break.) It is a Tablet. It is for me. For me, who sells silk.',
      choices: [{ text: '"Who else has He received?"', next: 'guests' }],
    },
    guests: {
      speaker: 'Ḥájí Mírzá Jání',
      onEnter: { set: { kulaynHeardHost: true } },
      text: 'The few friends I trust. A young man named Mihdí, who could not stop smiling. And Siyyid ʿAbdu\'l-Báqí, the most learned man in Káshán; I brought him so that he might hear. (He looks toward the street door, where an old man is putting on his shoes.) He has heard. I do not know yet what he heard.',
    },
  },
};

/** Siyyid ʿAbdu'l-Báqí, leaving. */
export const kulaynAbdulBaqi: DialogueTree = {
  id: 'kulayn-abdul-baqi',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Siyyid ʿAbdu\'l-Báqí',
      text: '(An old scholar in a black turban settles his cloak by the street door. He looks pleased with the evening, and a little tired.) You are of the household? Tell our host his guest is a young man of rare eloquence. I listened to the verses with pleasure. The cadence was fine.',
      choices: [
        { text: '"Did you ask who He is?"', next: 'name' },
        { text: '(Say nothing. It is not yours to tell.)', next: 'silent' },
      ],
    },
    name: {
      speaker: 'Siyyid ʿAbdu\'l-Báqí',
      text: 'His name? (He considers.) No. A young merchant of some education, travelling with an escort for his own protection, I suppose. These are uncertain roads. I shall ask Jání in the morning, if I remember.',
      choices: [{ text: '(Open the street door for him.)', next: 'leave' }],
    },
    silent: {
      speaker: 'Siyyid ʿAbdu\'l-Báqí',
      text: '(He waits for you to speak, then nods kindly, as one does to a servant who is shy.) Well. A fine evening. A fine evening.',
      choices: [{ text: '(Open the street door for him.)', next: 'leave' }],
    },
    leave: {
      speaker: 'Narrator',
      onEnter: { set: { kulaynHeardBaqi: true } },
      text: 'He goes out into the dark lane, and the porter bars the door behind him. He has heard the verses and gone away unmoved, without asking the Guest\'s name. It will be days before he learns it, and by then the road will be empty.',
    },
  },
};

/** The guest room's door, before the household has been heard. */
export const kulaynHallDoorLocked: DialogueTree = {
  id: 'kulayn-hall-door-locked',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The door in the iwan is shut. A lantern hangs in the vault above it, and behind the coloured glass of the sash windows a lamp is burning. Through the wood comes a voice, low and steady, and the quick scratch of a reed pen trying to keep pace. The household has more to tell you first.',
    },
  },
};

/** Naw-Rúz kept round a closed door, and the third morning. */
export const kulaynHallDoor: DialogueTree = {
  id: 'kulayn-hall-door',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'On the step a lantern burns beside a dish of green wheat, sprouted for the new year, and a pair of slippers is set neatly by the door. Behind it the voice goes on: not words you can make out, only the rise and fall of verses, and the pen.',
      choices: [{ text: '(Keep watch on the step through the night.)', next: 'nawruz' }],
    },
    nawruz: {
      speaker: 'Narrator',
      text: 'Toward dawn the voice falls silent, and the city wakes to Naw-Rúz: drums in the lanes, children in new clothes, rice and herbs steaming in every kitchen. In this house the festival is kept quietly, round a closed door. Ḥájí Mírzá Jání sends trays from his own kitchen to the escort at the caravanserai, and the horsemen send back their thanks.',
      choices: [{ text: '(Stay until the third morning.)', next: 'farewell' }],
    },
    farewell: {
      speaker: 'Narrator',
      onEnter: { set: { kulaynFarewell: true } },
      text: 'On the third morning Ḥájí Mírzá Jání opens the door himself. You stand back against the wall while host and Guest cross the court, and go out by the street door toward the gate of ʿAṭṭár. The lantern on the step has burned out. The dish of green wheat is still there.',
    },
  },
};

/** The guest room after He has gone. */
export const kulaynHallEmpty: DialogueTree = {
  id: 'kulayn-hall-empty',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The door of the guest room stands open on a swept carpet and a cold lamp. The slippers are gone. On the thirteenth day of the new year the green wheat will be thrown into running water, as the custom is. Not yet.',
    },
  },
};

export const kulaynHouseDialogues: Record<string, DialogueTree> = {
  [kulaynJaniHouse.id]: kulaynJaniHouse,
  [kulaynAbdulBaqi.id]: kulaynAbdulBaqi,
  [kulaynHallDoorLocked.id]: kulaynHallDoorLocked,
  [kulaynHallDoor.id]: kulaynHallDoor,
  [kulaynHallEmpty.id]: kulaynHallEmpty,
};
