import type { DialogueTree } from '../../dialogue/types';

/**
 * The quarter of Chinár-Súkhtih, from the forenoon Vaḥíd comes in from the
 * road to the night the governor's men take the roofs, and Vaḥíd goes up to
 * the fort of Khájih at dawn. The boy and his mother are fictional; Mullá
 * ʿAbdu'l-Ḥusayn, eighty years old, wounded on his roof at prayer and
 * comforted by a letter from Vaḥíd, is in Nabíl.
 *
 * This chapter's witness is not the pilgrim of the other chapters but a
 * youth of the quarter, a neighbour of the boy and his mother, who went out
 * on the road with them to meet Vaḥíd (`nz-opening`).
 */

/** The chapter's opening narration: who the player is this time. */
export const opening: DialogueTree = {
  id: 'nz-opening',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'In this chapter you are someone else. The pilgrim you have followed is far to the north. You are a youth of Chinár-Súkhtih, the quarter of the burnt plane tree in Nayríz, a weaver\'s son, three doors from the boy who outruns everyone.',
      choices: [{ text: '(Listen.)', next: 'who' }],
    },
    who: {
      speaker: 'Narrator',
      onEnter: { set: { nzWitness: true } },
      text: 'This morning you went out on the Iṣṭahbánát road with half the quarter, though the governor\'s criers had promised death to any who did, to meet Siyyid Yaḥyá of Dáráb, called Vaḥíd, coming home. Now you are walking back in with the crowd.',
    },
  },
};

/** The boy who runs down the road to meet the newcomers. */
export const boyArrival: DialogueTree = {
  id: 'nz-boy-arrival',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Boy of Chinár-Súkhtih',
      text: '(The boy from three doors down pelts along the lane toward you, dust to his knees.) You went out on the road too! I saw you, behind the twenty from Iṣṭahbánát! He is here! The Siyyid is here!',
      choices: [{ text: '"Did you get near him?"', next: 'who' }],
    },
    who: {
      speaker: 'A Boy of Chinár-Súkhtih',
      text: 'I touched his stirrup! The governor sent criers round to say he would kill anyone who went out to meet him, and the whole quarter went out anyway. My mother too. Yours too, I saw her.',
      choices: [{ text: '"Where has he gone?"', next: 'where' }],
    },
    where: {
      speaker: 'A Boy of Chinár-Súkhtih',
      onEnter: { set: { nzMetBoy: true } },
      text: 'Straight to the masjid! Not home first, not even to wash the road off his face. (He is already running back.) Come on! You will never get in if you are slow!',
    },
  },
};

/** The boy's mother, at her door, on the forenoon of the arrival. */
export const womanArrival: DialogueTree = {
  id: 'nz-woman-arrival',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Woman of Chinár-Súkhtih',
      text: '(The boy\'s mother stands in her doorway with a water-jug on her hip, watching the lane fill.) Neighbour\'s son, you have the road on you like everyone else. Drink first. Your own mother is still at the edge of the town, shouting herself hoarse.',
      choices: [
        { text: '(Drink, and thank her.)', next: 'drink' },
        { text: '"Is it safe for you, to come out like this?"', next: 'safe' },
      ],
    },
    drink: {
      speaker: 'A Woman of Chinár-Súkhtih',
      text: 'When he first came to live in this quarter, he was the most learned man ever to walk down our lane. Now he comes back and says all his learning was a lamp carried about in daylight. (She takes back the jug.) My son ran half the night to be first on the road.',
      choices: [{ text: '"Is it safe for you, to come out like this?"', next: 'safe' }],
    },
    safe: {
      speaker: 'A Woman of Chinár-Súkhtih',
      onEnter: { set: { nzHeardWoman: true } },
      text: 'Zaynu\'l-ʿÁbidín Khán sent his criers round: any who go out to meet him lose their lives and their goods. (She shrugs.) The whole quarter went out. He cannot kill a whole quarter. Can he?',
    },
  },
};

/** Mullá ʿAbdu'l-Ḥusayn, eighty years old, by the masjid door. */
export const elderArrival: DialogueTree = {
  id: 'nz-elder-arrival',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá ʿAbdu\'l-Ḥusayn',
      text: '(An old man in a white turban leans on his staff beside the masjid door, letting the young push past.) Eighty years I have walked to this door. Today I could not get near it for the crowd. God be praised for a crowd.',
      choices: [{ text: '"You know Vaḥíd?"', next: 'know' }],
    },
    know: {
      speaker: 'Mullá ʿAbdu\'l-Ḥusayn',
      text: 'I knew him when he was only the most learned man in Persia. (A dry smile.) The Sháh sent him to Shíráz to examine the young Siyyid there, and he came home examined. They say the Báb has written a Tablet for the believers of Nayríz, and that he has come to open its meaning to us.',
      choices: [{ text: '"Will the governor allow it?"', next: 'governor' }],
    },
    governor: {
      speaker: 'Mullá ʿAbdu\'l-Ḥusayn',
      onEnter: { set: { nzMetElder: true } },
      text: 'Zaynu\'l-ʿÁbidín Khán has gone off to Quṭrih, to the fort there, as if an army were coming. (He laughs softly.) An old man with a staff, women with water-jugs, boys. Let him count us from his walls.',
    },
  },
};

/** The burnt plane tree that names the quarter. */
export const plane: DialogueTree = {
  id: 'nz-plane',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'An old chenar stands in the square, burnt hollow at its foot long ago, one great limb dead and black. The rest of it is still in leaf. The quarter takes its name from such a tree: Chinár-Súkhtih, the burnt plane.',
      choices: [{ text: '(Rest a moment in its shade.)', next: 'rest' }],
    },
    rest: {
      speaker: 'Narrator',
      onEnter: { set: { nzSawPlane: true } },
      text: 'Children have worn the hollow smooth with hiding in it. Above you the living half of the tree turns its leaves in the wind off the hills, as if the fire had been some other tree\'s trouble.',
    },
  },
};

/** The old mullá on his mattress, wounded on his roof at prayer. */
export const elderWounded: DialogueTree = {
  id: 'nz-elder-wounded',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá ʿAbdu\'l-Ḥusayn',
      text: '(The old man lies on a mattress in his yard, his right foot bound in linen gone dark.) Do not look so grave. I was at my prayers on my own roof, and they fired from the governor\'s roofs. Their aim is better than their manners. Go to Vaḥíd in the masjid. He will be fretting.',
    },
  },
};

/** The letter delivered. */
export const elderLetter: DialogueTree = {
  id: 'nz-elder-letter',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'You give Mullá ʿAbdu\'l-Ḥusayn the letter. He breaks the seal and reads it by the lamp, twice, his lips moving.',
      choices: [{ text: '(Wait.)', next: 'read' }],
    },
    read: {
      speaker: 'Mullá ʿAbdu\'l-Ḥusayn',
      text: 'He writes to me as one writes to a brother, not to an old fool who forgot to keep his head down. (He presses the paper to his eyes.) Eighty years, and I never had such a letter.',
      choices: [{ text: '"He says he sits with you in spirit."', next: 'end' }],
    },
    end: {
      speaker: 'Mullá ʿAbdu\'l-Ḥusayn',
      onEnter: { set: { nzLetterDelivered: true } },
      text: 'Then I am in good company. Go back to him. The young men say he will go up to the old fort of Khájih before dawn. Do not let him climb that hill without you.',
    },
  },
};

/** The boy's mother on the night of the muskets. */
export const womanNight: DialogueTree = {
  id: 'nz-woman-night',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Woman of Chinár-Súkhtih',
      text: '(She sits on her doorstep in the dark, a lamp shielded in her hand.) Keep to the walls. They fire at anything that moves on the roofs, and in summer the roofs are where we live.',
      choices: [{ text: '"Has the quarter held?"', next: 'held' }],
    },
    held: {
      speaker: 'A Woman of Chinár-Súkhtih',
      text: 'Most of it. (She looks down the lane.) Some doors were shut tonight that stood open yesterday. A man has a wife, a shop, sons, and the governor has a list. I do not curse them. But I counted the doors.',
      choices: [{ text: '"And you?"', next: 'you' }],
    },
    you: {
      speaker: 'A Woman of Chinár-Súkhtih',
      onEnter: { set: { nzHeardDefections: true } },
      text: 'My door is open. Where else would I go? The Siyyid has sent the twenty from Iṣṭahbánát up to the fort of Khájih with Shaykh Hádí. If it comes to it, the men will go up there, and we will be on our roofs, and they will hear us.',
    },
  },
};

/** The boy, back from running to the fort. */
export const boyNight: DialogueTree = {
  id: 'nz-boy-night',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Boy of Chinár-Súkhtih',
      text: '(The boy crouches in the hollow of the burnt plane tree.) I have been up to the fort and back twice! Shaykh Hádí\'s men are on the walls. It is old, the fort, but the walls are thick as a house.',
      choices: [{ text: '"Go home to your mother."', next: 'home' }],
    },
    home: {
      speaker: 'A Boy of Chinár-Súkhtih',
      onEnter: { set: { nzBoyRan: true } },
      text: 'She sent me! She says nobody fires at a boy. (He does not sound sure of it.) Is it true the Siyyid is going up there?',
    },
  },
};

/** Vaḥíd below the fort before dawn: the gathering turns to the siege. */
export const vahidDawn: DialogueTree = {
  id: 'nz-vahid-dawn',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Before dawn. Vaḥíd stands on the path below the fort of Khájih with his two sons and their two attendants. Behind him, up the slope by twos and threes, come the men of the quarter who have chosen to follow.',
      choices: [{ text: '(Go to him.)', next: 'him' }],
    },
    him: {
      speaker: 'Vaḥíd',
      text: 'You carried my letter. Thank you. (He looks back at the sleeping roofs.) I will not make a battlefield of their lanes, with their wives and children under the roofs. So we go up, and the governor may look for us on the hill.',
      choices: [{ text: '"I will come with you."', next: 'come' }],
    },
    come: {
      speaker: 'Vaḥíd',
      onEnter: { set: { nzToFort: true } },
      text: 'Then come. And mark this, whatever they say of us afterward: we have gone up to keep our faith, not to take any man\'s life. If they come against these walls, we will defend them, and no more.',
    },
  },
};

export const nayrizQuarterDialogues: Record<string, DialogueTree> = {
  [opening.id]: opening,
  [boyArrival.id]: boyArrival,
  [womanArrival.id]: womanArrival,
  [elderArrival.id]: elderArrival,
  [plane.id]: plane,
  [elderWounded.id]: elderWounded,
  [elderLetter.id]: elderLetter,
  [womanNight.id]: womanNight,
  [boyNight.id]: boyNight,
  [vahidDawn.id]: vahidDawn,
};
