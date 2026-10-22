import type { DialogueTree } from '../../dialogue/types';

/**
 * Inside the fort of Khájih, June 1850. From Nabíl: the seventy-two who
 * first went up; Vaḥíd's answer to the governor (two children and their
 * two attendants, and why cut off our water?); the charges he gave (a
 * keeper of the gate, Karbilá'í Mírzá Muḥammad; a chronicler, Mírzá
 * Muḥammad-Jaʿfar); the cistern; the three who fell in the first sortie;
 * the night sortie of Ghulám-Riḍáy-i-Yazdí, with old men and boys, while
 * the women cried out from the roofs of Nayríz; the Qur'án sealed by the
 * officers; "Our appointed hour has struck"; the five who went down with
 * him; and the letter Ḥájí Siyyid ʿÁbid carried back. The soldier and the
 * boy are fictional.
 */

/** Vaḥíd at his place by the west wall, before the sealed Qur'án comes. */
export const vahidFort: DialogueTree = {
  id: 'nz-vahid-fort',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Vaḥíd',
      text: '(He sits on a carpet in the shade of the wall, a book open on his knee.) Zaynu\'l-ʿÁbidín Khán sent a man to ask why I have raised an army against him. I sent back that my army is two children and their two attendants.',
      choices: [{ text: '"And the rest of us?"', next: 'water' }],
    },
    water: {
      speaker: 'Vaḥíd',
      text: 'I asked him too why, if he fears only two children, he has cut off our water. He has not answered. (He turns a page.) So we dig.',
      choices: [{ text: '"What would you have me do?"', next: 'do' }],
    },
    do: {
      speaker: 'Vaḥíd',
      onEnter: { set: { nzVahidFort: true } },
      text: 'What I do: pray, and read, and teach anyone who will sit still. Go round the walls and see who is with us. Mírzá Muḥammad-Jaʿfar is writing it all down. He will tell you their names.',
    },
  },
};

/** Mírzá Muḥammad-Jaʿfar, the chronicler of the fort. */
export const chronicler: DialogueTree = {
  id: 'nz-chronicler',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mírzá Muḥammad-Jaʿfar',
      text: '(A man at a writing-board, ink to the wrist.) Vaḥíd has given each of us a charge. A keeper of the gate, a keeper of the purse, a reader, a gaoler with no prisoner. Mine is to write down what happens. I am the chronicler of a fort.',
      choices: [{ text: '"What have you written?"', next: 'written' }],
    },
    written: {
      speaker: 'Mírzá Muḥammad-Jaʿfar',
      text: 'That seventy-two came up at first. I counted twice, because it is the number who stood with the Imám Ḥusayn. That the governor\'s brother came against us with a thousand men, and we went out to them at the gate, and they fell back.',
      choices: [{ text: '"Did anyone fall?"', next: 'fell' }],
    },
    fell: {
      speaker: 'Mírzá Muḥammad-Jaʿfar',
      onEnter: { set: { nzMetChronicler: true } },
      text: 'Three. (He turns back a page and reads.) Táju\'d-Dín, who made hats. Zaynil, son of Iskandar, who farmed. Mírzá Abu\'l-Qásim. (He sets the pen down.) I write their trades as well as their names. A man is not only how he died.',
    },
  },
};

/** The cistern dug when the water was cut. */
export const cistern: DialogueTree = {
  id: 'nz-cistern',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A pit in the court, waist deep, and companions in it with spades and baskets. The governor has cut off the water that came to the fort, and Vaḥíd has bidden them dig a cistern.',
      choices: [
        { text: '(Climb down and dig.)', next: 'dig', requires: f => !f.nzDugCistern },
        { text: '(Look into the cistern.)', next: 'done', requires: f => !!f.nzDugCistern },
      ],
    },
    dig: {
      speaker: 'Narrator',
      text: 'The earth is hard and pale and full of stones. You dig until your palms blister. Someone begins to chant under his breath, and the spades fall into the rhythm of it.',
      choices: [{ text: '(Keep digging.)', next: 'deep' }],
    },
    deep: {
      speaker: 'Narrator',
      onEnter: { set: { nzDugCistern: true } },
      text: 'By dusk the pit is deep enough to stand in, and they begin lining it with stones from a fallen corner of the wall. Whatever water they can gather will be kept here. A digger looks at his blistered hands and laughs.',
    },
    done: {
      speaker: 'Narrator',
      text: 'The cistern, lined with stones from the old wall. Someone has scratched a name into the top stone with the point of a knife, too worn to read.',
    },
  },
};

/** Karbilá'í Mírzá Muḥammad, keeper of the gate. */
export const gatekeeper: DialogueTree = {
  id: 'nz-gatekeeper',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Karbilá\'í Mírzá Muḥammad',
      text: '(A broad man sits by the gate, a great iron key on a cord round his neck.) Keeper of the gate. Vaḥíd gave me the key with his own hand. I have never carried anything so heavy.',
      choices: [{ text: '"Who goes in and out?"', next: 'who' }],
    },
    who: {
      speaker: 'Karbilá\'í Mírzá Muḥammad',
      text: 'Whom he allows. Siyyid Jaʿfar of Yazd and Shaykh ʿAbdu\'l-ʿAlí begged him to let in some people of the Bázár quarter, kin of ours, and he did. (He frowns.) I would have kept them out. But he is kinder than I am.',
      choices: [{ text: '"And at night?"', next: 'night' }],
    },
    night: {
      speaker: 'Karbilá\'í Mírzá Muḥammad',
      onEnter: { set: { nzMetGatekeeper: true } },
      text: 'One night he sent out Ghulám-Riḍáy-i-Yazdí with fourteen, old men among them and boys, and a shoemaker past ninety. I opened the gate for them, and shut it, and opened it again near dawn. Not all of them came back through it.',
    },
  },
};

/** The boy, who has come up to the fort the back way. */
export const boyFort: DialogueTree = {
  id: 'nz-boy-fort',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Boy of Chinár-Súkhtih',
      text: 'I came up the back way, the way we go after birds\' eggs. Do not tell the keeper of the gate. He thinks nobody gets past him.',
      choices: [{ text: '"What news from the quarter?"', next: 'news' }],
    },
    news: {
      speaker: 'A Boy of Chinár-Súkhtih',
      text: 'The night our men went out of the gate, the women went up on every roof in Chinár-Súkhtih. My mother too. They cried out all together when the charge began, so loud it was louder than the guns.',
      choices: [{ text: '"Is she safe?"', next: 'safe' }],
    },
    safe: {
      speaker: 'A Boy of Chinár-Súkhtih',
      onEnter: { set: { nzHeardRooftops: true } },
      text: 'She has no voice left. She is very proud of it. (He looks round at the men by the fires.) She says I am to come home before the moon is up. I am going to be late.',
    },
  },
};

/** The soldier under the white cloth, carrying the sealed Qur'án. */
export const soldier: DialogueTree = {
  id: 'nz-soldier',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A soldier has been let in at the gate under a white cloth, alone, holding something wrapped in green silk against his chest the way a man carries a sleeping child.',
      choices: [{ text: '(Go to him.)', next: 'him' }],
    },
    him: {
      speaker: 'A Soldier of Hamadán',
      text: 'I am of the Hamadán regiment. They told me only: carry this to the Siyyid, and do not drop it. (He unwraps a Qur\'án. Seals are pressed along its pages.) The officers have set their seals in it. They swear by it.',
      choices: [{ text: '"What do they swear?"', next: 'swear' }],
    },
    swear: {
      speaker: 'A Soldier of Hamadán',
      text: 'That if he comes down to their camp and sets out his Cause before them, they will hear him honestly. If they are convinced, they will follow him. If not, he may come back up here unharmed. (He looks at the Book, not at you.) That is what they swear.',
      choices: [{ text: '"Do you believe them?"', next: 'believe' }],
    },
    believe: {
      speaker: 'A Soldier of Hamadán',
      onEnter: { set: { nzQuranArrived: true } },
      text: 'I believe the Book. (A pause.) Take it to him. I have carried it up the hill with both hands, and my arms are shaking, and I do not think it is the weight.',
    },
  },
};

/** Vaḥíd receives the Qur'án: the siege turns to the end. */
export const vahidOath: DialogueTree = {
  id: 'nz-vahid-oath',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'You carry the Book across the court. Vaḥíd rises when he sees what it is, takes it from you in both hands, and kisses it.',
      choices: [{ text: '(Wait.)', next: 'hour' }],
    },
    hour: {
      speaker: 'Vaḥíd',
      text: '(He says it quietly, as a man tells the time of day.) Our appointed hour has struck.',
      choices: [
        { text: '"You cannot trust them."', next: 'trust' },
        { text: '"Men say they swore on the Qur\'án at Ṭabarsí too."', next: 'tabarsi' },
      ],
    },
    tabarsi: {
      speaker: 'Vaḥíd',
      text: 'They did. Quddús went down on such a Book. (He holds it to his chest.) I would have gone to Ṭabarsí myself, if the way had been open. Perhaps this is the way.',
      choices: [{ text: '"You cannot trust them."', next: 'trust' }],
    },
    trust: {
      speaker: 'Vaḥíd',
      text: 'I do not. But I honour this Book, whether or not they do, and they have asked to hear the Cause. I will go down and tell it once more. (He turns to the companions gathering round.) Keep to your posts. Do not trust them. Do not leave these walls on any word but mine.',
      choices: [{ text: '(Watch him go.)', next: 'go' }],
    },
    go: {
      speaker: 'Narrator',
      onEnter: { set: { nzOathAccepted: true } },
      text: 'He goes down the slope with five companions, Mullá ʿAlíy-i-Mudhahhib and Ḥájí Siyyid ʿÁbid among them. At the edge of the camp the officers come out to meet him with every courtesy. Then the tent-flaps close behind him.',
    },
  },
};

/** The letter from the camp. */
export const chroniclerLetter: DialogueTree = {
  id: 'nz-chronicler-letter',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Three days. Word comes up the hill that he is lodged in a tent of honour, seated on a chair while the officers stand, and that they pray behind him. Then Ḥájí Siyyid ʿÁbid climbs back up the slope alone, with a letter.',
      choices: [{ text: '(Go to Mírzá Muḥammad-Jaʿfar.)', next: 'read' }],
    },
    read: {
      speaker: 'Mírzá Muḥammad-Jaʿfar',
      text: '(He holds the letter as if it might burn him.) It says: the matter is settled; go home to your families; leave the fort. ʿÁbid swears the whole camp has been won over.',
      choices: [{ text: '"Is it his hand?"', next: 'hand' }],
    },
    hand: {
      speaker: 'Mírzá Muḥammad-Jaʿfar',
      text: 'It is his hand. (He reads it again.) He told us: do not leave these walls on any word but mine. This is his word. What else do we obey?',
      choices: [{ text: '(Wait.)', next: 'go' }],
    },
    go: {
      speaker: 'Narrator',
      onEnter: { set: { nzLetterRead: true } },
      text: 'They obey. Some lay their muskets down in the court before they go. They file out of the gate in the late light and walk down toward Nayríz and their houses. The fort of Khájih stands empty behind them, its gate open.',
    },
  },
};

/** Vaḥíd's place, after he has gone down. */
export const vahidPlace: DialogueTree = {
  id: 'nz-vahid-place',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      onEnter: { set: { nzSawVahidPlace: true } },
      text: 'His carpet in the shade of the wall, a book-rest with the book still open on it, the bolster that kept his younger son\'s place. The court is very quiet. Somewhere a dove is calling from the old tower.',
    },
  },
};

export const nayrizFortDialogues: Record<string, DialogueTree> = {
  [vahidFort.id]: vahidFort,
  [chronicler.id]: chronicler,
  [cistern.id]: cistern,
  [gatekeeper.id]: gatekeeper,
  [boyFort.id]: boyFort,
  [soldier.id]: soldier,
  [vahidOath.id]: vahidOath,
  [chroniclerLetter.id]: chroniclerLetter,
  [vahidPlace.id]: vahidPlace,
};
