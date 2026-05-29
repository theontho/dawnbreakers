import type { DialogueTree } from '../dialogue/types';

/** Counts how many rumours about the Young Siyyid the player has heard. */
function rumourCount(flags: Record<string, boolean | number | string>): number {
  return (
    (flags.rumourTraveller ? 1 : 0) +
    (flags.rumourMerchant  ? 1 : 0) +
    (flags.rumourMulla     ? 1 : 0)
  );
}

/**
 * The full opening exchange. Only reachable after the player has heard at
 * least two rumours about the Báb from townspeople.
 */
export const babDeclaration: DialogueTree = {
  id: 'bab-declaration',
  startId: 'greeting',
  nodes: {
    greeting: {
      id: 'greeting',
      speaker: 'The Young Host',
      text: 'Peace be upon you, weary traveller. The hour is late — will you not enter, and accept a cup of tea?',
      choices: [
        { text: '"Peace be upon you. I would be grateful."', next: 'seated' },
        { text: '"I am searching for someone. I should not linger."', next: 'searching' },
      ],
    },
    searching: {
      id: 'searching',
      speaker: 'The Young Host',
      text: 'And yet you have come to this very door. Is it possible the One you seek has been seeking you?',
      choices: [
        { text: '"...Who are you?"', next: 'seated' },
        { text: '"Forgive me — I must go."', effect: { set: { leftEarly: true } } },
      ],
    },
    seated: {
      id: 'seated',
      speaker: 'The Young Host',
      onEnter: { set: { enteredHouse: true } },
      text: 'Tell me then — what is the sign of the Promised One, by which He may be known?',
      choices: [
        { text: '"He must be of the line of Fáṭimih, of pure descent, of mature age, of profound knowledge."',
          next: 'signs', effect: { set: { gaveSigns: true } } },
        { text: '"It is not for me to say — the learned have written volumes on this question."',
          next: 'deflect' },
      ],
    },
    deflect: {
      id: 'deflect',
      speaker: 'The Young Host',
      text: 'Yet you have crossed deserts in His search. Surely your own heart has counted the signs?',
      choices: [
        { text: '(Recount the signs you carry in your heart.)', next: 'signs', effect: { set: { gaveSigns: true } } },
      ],
    },
    signs: {
      id: 'signs',
      speaker: 'The Young Host',
      text: 'Behold — all these signs are manifest in Me.',
      choices: [
        { text: '(Stay silent. Watch Him.)', next: 'silence' },
        { text: '"This is a grave claim. Prove it — reveal a commentary upon the Súrih of Joseph, unbidden."',
          next: 'test', effect: { set: { askedForProof: true } } },
        { text: '"Forgive me — this cannot be."', next: 'doubt', effect: { set: { doubted: true } } },
      ],
    },
    silence: {
      id: 'silence',
      speaker: 'Narrator',
      text: 'A stillness settles. The lamp does not flicker. You feel the night turn upon a hinge you cannot see.',
      choices: [
        { text: '(Continue)', next: 'test' },
      ],
    },
    doubt: {
      id: 'doubt',
      speaker: 'The Young Host',
      text: 'Then sit a little longer. If by morning your heart is unmoved, you shall depart with My blessing.',
      choices: [
        { text: '(Remain, and listen.)', next: 'test' },
      ],
    },
    test: {
      id: 'test',
      speaker: 'The Young Host',
      text: 'He takes up a reed pen. Verses pour forth — swift, unhesitating, luminous — a commentary upon the Súrih of Joseph such as no scholar has composed.',
      choices: [
        { text: '"This… is the proof I sought. I bear witness."',
          next: 'accept', effect: { set: { firstLetter: true } } },
        { text: '"I — I must consider. Let me return at dawn."',
          next: 'delay', effect: { set: { delayed: true } } },
      ],
    },
    delay: {
      id: 'delay',
      speaker: 'The Young Host',
      text: 'Dawn will find you wherever you are. Go in peace — or stay, and be the first.',
      choices: [
        { text: '"I will stay."', next: 'accept', effect: { set: { firstLetter: true } } },
        { text: '"I will return."', next: 'endDelayed' },
      ],
    },
    accept: {
      id: 'accept',
      speaker: 'Narrator',
      onEnter: { set: { ending: 'firstLetter' } },
      text: 'You become the first to recognise Him — the first of the Letters of the Living. The dawn, when it comes, is no longer only the sun\'s.',
    },
    endDelayed: {
      id: 'endDelayed',
      speaker: 'Narrator',
      onEnter: { set: { ending: 'delayed' } },
      text: 'You step into the cool night. The door closes softly behind you. Somewhere ahead, another seeker is already on the road.',
    },
  },
};

/** Locked variant: the host politely declines until the player learns more. */
export const babLocked: DialogueTree = {
  id: 'bab-locked',
  startId: 'g',
  nodes: {
    g: {
      id: 'g',
      speaker: 'A Servant at the Door',
      text: 'The master is not receiving guests, friend. If you have travelled far, perhaps the people of the bazaar or the mosque can offer you news.',
    },
  },
};

/** Traveller at the city gate — gives the first rumour. */
export const travellerRumour: DialogueTree = {
  id: 'rumour-traveller',
  startId: 'g',
  nodes: {
    g: {
      id: 'g',
      speaker: 'A Weary Traveller',
      text: 'Salaam, friend. You have the road-dust of Karbilá about you. Are you, too, looking for the One Siyyid Káẓim foretold?',
      choices: [
        { text: '"I am. What have you heard?"', next: 'tell' },
        { text: '"Many speak of Him. I have my own purpose here."', next: 'tell' },
      ],
    },
    tell: {
      id: 'tell',
      speaker: 'A Weary Traveller',
      onEnter: { set: { rumourTraveller: true } },
      text: 'They say a young Siyyid of this city — modest, of the line of the Prophet — has returned from pilgrimage and speaks with a strange certainty. The merchants in the bazaar know His name; the mullá at the mosque speaks against Him. Decide for yourself whom to trust.',
      choices: [
        { text: '"Thank you. I will look for them."' },
      ],
    },
  },
};

/** Merchant in the bazaar — gives the second rumour. */
export const merchantRumour: DialogueTree = {
  id: 'rumour-merchant',
  startId: 'g',
  nodes: {
    g: {
      id: 'g',
      speaker: 'A Cloth Merchant',
      text: 'Welcome, welcome — silk from Yazd, indigo from Hind! Will you buy, or only browse, my friend?',
      choices: [
        { text: '"I am looking for someone — a young Siyyid, lately returned to Shíráz."', next: 'know' },
        { text: '"Only browsing today. Forgive me."' },
      ],
    },
    know: {
      id: 'know',
      speaker: 'A Cloth Merchant',
      onEnter: { set: { rumourMerchant: true } },
      text: '(He glances about, then lowers his voice.) Siyyid ʿAlí-Muḥammad. A good man — pays in full, never haggles. His house is in the quarter north of here, past the mosque. But have a care: not all in this city wish Him well.',
      choices: [
        { text: '"Who wishes Him ill?"', next: 'warn' },
        { text: '"Thank you. May God bless your trade."' },
      ],
    },
    warn: {
      id: 'warn',
      speaker: 'A Cloth Merchant',
      text: 'The mullá of the great mosque — that one. Speak with him if you must, but guard your tongue.',
      choices: [
        { text: '"Understood. Peace be with you."' },
      ],
    },
  },
};

/** Mullá at the mosque — gives the third rumour, hostile in tone. */
export const mullaWarning: DialogueTree = {
  id: 'rumour-mulla',
  startId: 'g',
  nodes: {
    g: {
      id: 'g',
      speaker: 'A Stern Mullá',
      text: 'You linger at the threshold of God\'s house, stranger. State your business.',
      choices: [
        { text: '"I seek knowledge of a young Siyyid of this city."', next: 'rebuke' },
        { text: '"Only to pray. Forgive the intrusion."' },
      ],
    },
    rebuke: {
      id: 'rebuke',
      speaker: 'A Stern Mullá',
      onEnter: { set: { rumourMulla: true } },
      text: '(His face darkens.) That youth — a merchant turned mystic — has stirred the foolish with talk of hidden meanings. The ʿulamá will not suffer it long. If you are wise, you will return to Karbilá and forget His name.',
      choices: [
        { text: '"And what is His name?"', next: 'name' },
        { text: '"Thank you for the warning."' },
      ],
    },
    name: {
      id: 'name',
      speaker: 'A Stern Mullá',
      text: 'Siyyid ʿAlí-Muḥammad. (He spits to the side.) Now go.',
      choices: [
        { text: '(Bow and leave.)' },
      ],
    },
  },
};

export const dialogues: Record<string, DialogueTree> = {
  [babDeclaration.id]: babDeclaration,
  [babLocked.id]:      babLocked,
  [travellerRumour.id]: travellerRumour,
  [merchantRumour.id]:  merchantRumour,
  [mullaWarning.id]:    mullaWarning,
};

/** Used by ShirazScene to decide which Báb tree to launch. */
export function babTreeFor(flags: Record<string, boolean | number | string>): DialogueTree {
  return rumourCount(flags) >= 2 ? babDeclaration : babLocked;
}

export { rumourCount };
