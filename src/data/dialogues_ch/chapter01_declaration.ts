import type { DialogueTree } from '../../dialogue/types';

/**
 * The full opening exchange. Only reachable after the player has heard at
 * least two rumours about the Báb from townspeople.
 */
export const babDeclaration: DialogueTree = {
  id: 'bab-declaration',
  startId: 'greeting',
  nodes: {
    greeting: {
      speaker: 'The Young Host',
      text: 'Peace be upon you, weary traveller. The hour is late — will you not enter, and accept a cup of tea?',
      choices: [
        { text: '"Peace be upon you. I would be grateful."', next: 'seated' },
        { text: '"I am searching for someone. I should not linger."', next: 'searching' },
      ],
    },
    searching: {
      speaker: 'The Young Host',
      text: 'And yet you have come to this very door. Is it possible the One you seek has been seeking you?',
      choices: [
        { text: '"...Who are you?"', next: 'seated' },
        { text: '"Forgive me — I must go."', effect: { set: { leftEarly: true } } },
      ],
    },
    seated: {
      speaker: 'The Young Host',
      onEnter: { set: { enteredHouse: true } },
      text: 'Tell me then — what is the sign of the Promised One, by which He may be known?',
      choices: [
        { text: '"He must be of the line of Fáṭimih, of pure descent, of mature age, of profound knowledge."',
          next: 'signs', effect: { set: { gaveSigns: true } } },
        { text: '"It is not for me to say — the learned have written volumes on this question."',
          next: 'deflect' },
        { text: '"I know the signs, yet fear presumption more than ignorance."', next: 'presumption',
          effect: { set: { fearedPresumption: true } } },
      ],
    },
    presumption: {
      speaker: 'The Young Host',
      text: 'Fear may guard the threshold, but longing must enter the house. Speak not as a judge over the Beloved, but as one who has walked far to be judged by Him.',
      choices: [
        { text: '(Let the fear become longing.)', next: 'signs',
          effect: { set: { gaveSigns: true, longingConfessed: true } } },
        { text: '"Then ask me, and I will answer as honestly as I can."', next: 'signs',
          effect: { set: { gaveSigns: true, scholarlyCaution: true } } },
      ],
    },
    deflect: {
      speaker: 'The Young Host',
      text: 'Yet you have crossed deserts in His search. Surely your own heart has counted the signs?',
      choices: [
        { text: '(Recount the signs you carry in your heart.)', next: 'signs', effect: { set: { gaveSigns: true } } },
      ],
    },
    signs: {
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
      speaker: 'Narrator',
      text: 'A stillness settles. The lamp does not flicker. You feel the night turn upon a hinge you cannot see.',
      choices: [
        { text: '(Continue)', next: 'test' },
      ],
    },
    doubt: {
      speaker: 'The Young Host',
      text: 'Then sit a little longer. If by morning your heart is unmoved, you shall depart with My blessing.',
      choices: [
        { text: '(Remain, and listen.)', next: 'test' },
      ],
    },
    test: {
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
      speaker: 'The Young Host',
      text: 'Dawn will find you wherever you are. Go in peace — or stay, and be the first.',
      choices: [
        { text: '"I will stay."', next: 'accept', effect: { set: { firstLetter: true } } },
        { text: '"I will return."', next: 'endDelayed' },
      ],
    },
    accept: {
      speaker: 'Narrator',
      onEnter: { set: { ending: 'firstLetter' } },
      text: 'You become the first to recognise Him — the first of the Letters of the Living. The dawn, when it comes, is no longer only the sun\'s.',
    },
    endDelayed: {
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
      speaker: 'A Servant at the Door',
      text: 'The master is not receiving guests, friend. If you have travelled far, perhaps the people of the bazaar or the mosque can offer you news.',
    },
  },
};
