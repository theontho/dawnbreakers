import type { DialogueTree } from '../../dialogue/types';
import { chapter08AmulNightDialogues } from './chapter08_amulNight';

/**
 * Chapter 8's interlude at Ámul, the first days of Muḥarram 1265 (December
 * 1848), after Nabíl's chapter XIX. Bahá'u'lláh set out from Núr with a few
 * companions to join the defenders of Ṭabarsí, was taken by night at a lonely
 * house on the road, and brought to Ámul, where the acting governor, the
 * governor's kinsman, summoned the divines to the masjid. He is never seen:
 * the youth who trims the masjid's lamps stands at the back of the hall, and
 * hears. This file holds the morning, until the rods; the night the wall was
 * opened and the days after are in `chapter08_amulNight.ts`.
 */

/** Who the player is, for this one map. */
export const amulOpening: DialogueTree = {
  id: 'ch8-amul-opening',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'For a while you are someone else. Leave the fort in its snow. A day\'s ride to the west, in the town of Ámul, you are a youth who trims the lamps of the masjid for your uncle, its old caretaker.',
      choices: [{ text: '(Listen.)', next: 'who' }],
    },
    who: {
      speaker: 'Narrator',
      onEnter: { set: { ch8AmulWitness: true, ch8AtAmul: true } },
      text: 'It is the first days of Muḥarram, and black cloth hangs in the arches for the Imám Ḥusayn. At daybreak the guards of the forest road brought in travellers taken in the night, and the acting governor has sent word: let the divines and the siyyids of Ámul gather in the masjid at once.',
    },
  },
};

/** The old caretaker in the court, the morning the divines are summoned. */
export const caretakerMorning: DialogueTree = {
  id: 'ch8-amul-caretaker-morning',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Old Caretaker',
      text: 'There you are. Muḥarram, and snow, and now this. The acting governor wants every turban in Ámul in the hall before the sun is over the roofs. Lay the long carpets, and light the lamps by the mihrab.',
      choices: [
        { text: '"Who are the prisoners?"', next: 'who' },
        { text: '(Go and lay the carpets.)', next: 'done' },
      ],
    },
    who: {
      speaker: 'The Old Caretaker',
      text: 'Travellers taken on the forest road, riding, they say, for the Bábís at the shrine of Shaykh Ṭabarsí. One of them is a nobleman of Núr, the son of the old vizier. (He lowers his voice.) A vizier\'s son, brought in like a thief. Go on. The carpets.',
      choices: [{ text: '(Go and lay the carpets.)', next: 'done' }],
    },
    done: {
      speaker: 'Narrator',
      onEnter: { set: { ch8AmulCarpets: true } },
      text: 'You unroll the long carpets down the hall, cold as river stones, and light the lamps by the mihrab where the mujtahid of Ámul leads the prayer. When you come out, the court is filling, and the soldiers who brought the travellers in are stamping their feet at the gate.',
    },
  },
};

/** The chief of the guards on the forest road, at the gate of the court. */
export const guard: DialogueTree = {
  id: 'ch8-amul-guard',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Chief of the Guards',
      text: '(He knocks the snow from his boots.) Me? I did as I was told. Since ʿAbdu\'lláh Khán took the command, nobody is to help the men in the fort. Anyone we find on the roads near it, we bring to Ámul and hand to the governor, no questions asked.',
      choices: [{ text: '"Where did you find these?"', next: 'found' }],
    },
    found: {
      speaker: 'The Chief of the Guards',
      text: 'At a lonely house by the road, after their supper. Somebody told us they were there. The others slept, but He was awake, the nobleman. He told us we had been misled about them, and that we should act so as to have nothing to regret.',
      choices: [{ text: '"And what did you do?"', next: 'river' }],
    },
    river: {
      speaker: 'The Chief of the Guards',
      onEnter: { set: { ch8AmulGuardHeard: true } },
      text: 'Brought them in, as I was ordered. But on horses, and civilly, and I kept my men\'s hands off them. One of my men says papers went into the river on the way. If they did, the river has them now. (He looks at the masjid door.) I hope that is the end of it.',
    },
  },
};

/** A cloth-seller of the bázár, come to look at the prisoners. */
export const townsman: DialogueTree = {
  id: 'ch8-amul-townsman',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Cloth-Seller',
      text: 'Have you seen them? I came to look at Bábís. After what the pulpits say, I thought they would have horns. (He laughs, not easily.) They look like any travellers who have slept badly.',
      choices: [{ text: '"What do they say in the bázár?"', next: 'bazar' }],
    },
    bazar: {
      speaker: 'A Cloth-Seller',
      onEnter: { set: { ch8AmulTownsman: true } },
      text: 'That the governor rode off with his horsemen to the army at the fort, and left a kinsman in his seat. That the kinsman knows the nobleman of Núr, and wishes he did not. That some siyyid will make trouble before the day is out. Some siyyid always does.',
    },
  },
};

/** The prayer hall's door before there is work done and news heard. */
export const hallShut: DialogueTree = {
  id: 'ch8-amul-hall-shut',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The hall is filling with turbans, black and white. Your uncle has work for you first, and the soldiers at the court gate are talking of how the travellers were taken.',
    },
  },
};

/** The gathering in the masjid, heard from the back of the hall, to the rods. */
export const hall: DialogueTree = {
  id: 'ch8-amul-hall',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'You stand at the back of the hall among the servants, a taper in your hand. Between the turbans you can see little: the acting governor on the dais, and before him the travellers. You cannot see their faces from here.',
      choices: [{ text: '(Listen.)', next: 'charge' }],
    },
    charge: {
      speaker: 'The Acting Governor',
      text: '(Loudly, for the room.) What is this? Men of family, riding by night to the rebels in the forest? Explain yourselves.',
      choices: [{ text: '(Listen.)', next: 'answer' }],
    },
    answer: {
      speaker: 'Narrator',
      text: 'The answer comes from the front of the hall, quiet and unhurried. They are innocent, He says, of what is charged against them, and in time their innocence will be plain. The acting governor looks down at his hands.',
      lines: f => (f.ch8AmulTownsman ? ['You remember the cloth-seller: he knows this man, and wishes he did not.'] : []),
      choices: [{ text: '(Listen.)', next: 'questions' }],
    },
    questions: {
      speaker: 'Narrator',
      text: 'The divines put their questions one after another, and the answers come back plain and sure, until the questions grow fewer. Then a soldier holds up a manuscript found in a traveller\'s bag, and it is handed to the chief of the divines.',
      choices: [{ text: '(Listen.)', next: 'chief' }],
    },
    chief: {
      speaker: 'The Chief of the Divines',
      text: '(He reads a few lines, and lifts his head.) Hear this. These people make the greatest of claims, and in this very sentence they show they do not know the first rules of writing.',
      choices: [{ text: '(Listen.)', next: 'kumayl' }],
    },
    kumayl: {
      speaker: 'Narrator',
      text: 'The same quiet voice answers him, without heat. The words he finds fault with are not the Báb\'s. They are the Imám ʿAlí\'s, the Commander of the Faithful, from his answer to Kumayl. An old man near you murmurs that it is so. The chief of the divines lays the paper down and says nothing.',
      choices: [{ text: '(Listen.)', next: 'siyyid' }],
    },
    siyyid: {
      speaker: 'A Siyyid of Ámul',
      text: '(A siyyid springs up by the dais.) Then that proves it! Who but a Bábí would stand up for such a book? He is one of them. Their leader! The law is plain: put them to death!',
      choices: [{ text: '(Listen.)', next: 'rods' }],
    },
    rods: {
      speaker: 'The Acting Governor',
      text: '(Other siyyids are on their feet. His voice is rough.) Enough! Bring the rods. They will be punished here, and held until the governor comes back from the fort, and he will send them to Ṭihrán.',
      choices: [{ text: '(Listen.)', next: 'spared' }],
    },
    spared: {
      speaker: 'Narrator',
      text: 'One of the travellers, a mullá of Tabríz, cries out that he is only a groom. At a word from the front he is let go. A merchant of Káshán is named a guest, and a youth, the nobleman\'s own brother, an attendant, and they are let go too.',
      choices: [{ text: '(Listen.)', next: 'offered' }],
    },
    offered: {
      speaker: 'Narrator',
      text: 'Then the quiet voice says that none of these men has done any wrong; and if there must be a punishment, He offers Himself to bear it.',
      choices: [{ text: '(Listen.)', next: 'alone' }],
    },
    alone: {
      speaker: 'Narrator',
      text: 'For a long moment the acting governor will not look up. At last he gives the order: the nobleman of Núr alone. The servants come forward with the rods. Your uncle\'s hand closes on your shoulder and turns you to face the door.',
      choices: [{ text: '(Do not look.)', next: 'bastinado' }],
    },
    bastinado: {
      speaker: 'Narrator',
      onEnter: { set: { ch8AmulRods: true } },
      text: 'You hear it, all of it, with your face to the snow in the doorway. No cry comes from the front of the hall. Only the rods, and the breathing of the crowd, and behind you the lamps you lit this morning, burning on by the mihrab.',
    },
  },
};

export const chapter08AmulDialogues: Record<string, DialogueTree> = {
  ...chapter08AmulNightDialogues,
  [amulOpening.id]: amulOpening,
  [caretakerMorning.id]: caretakerMorning,
  [guard.id]: guard,
  [townsman.id]: townsman,
  [hallShut.id]: hallShut,
  [hall.id]: hall,
};
