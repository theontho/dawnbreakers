import type { DialogueTree } from '../../dialogue/types';

/**
 * The Sabzih-Maydán of Ṭihrán, beside the palace, February 1850. The
 * executions are never staged: on the morning the player stands at the edge
 * of the crowd and hears; three days later the square is quiet and those who
 * saw tell it. After Nabíl: the uncle's address to the crowd and his prayer
 * for them; the headsman who would not strike him and left for Khurásán;
 * Ḥájí Mullá Ismáʿíl's coin for sweets; Siyyid Ḥusayn's plea for a hearing
 * answered with a dagger; the last three going together; the seven left
 * three days in the square and buried in one grave outside the gate; the
 * Báb's Tablet naming them the "Seven Goats" who go before the Qáʾim.
 */

/** Before: the sweet-seller in his corner, who knows the city's news. */
export const martyrsSweetSellerBefore: DialogueTree = {
  id: 'martyrs-sweet-seller-before',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Sweet-Seller',
      text: 'Sugared almonds! Rock-sugar from Yazd! (An old man with a copper tray squints up at you.) A stranger. You have the look of someone hunting for a friend in this city, and this is a bad week for it.',
      choices: [{ text: '"Why a bad week?"', next: 'week' }],
    },
    week: {
      speaker: 'A Sweet-Seller',
      text: 'The Kalántar\'s men have been round the madrasas and the caravanserais with a list. Bábís. Fourteen taken, they say, and among them a dervish half the court comes to for blessings, and an old merchant of Shíráz who is uncle to the Báb Himself.',
      choices: [{ text: '"Where are they held?"', next: 'where' }],
    },
    where: {
      speaker: 'A Sweet-Seller',
      onEnter: { set: { martyrsHeardStreet: true } },
      text: 'In the Kalántar\'s own house, along the street. The merchants of Shíráz are sitting in the caravanserai with a bag of gold, trying to buy the old man back. (He shakes his head.) Gold. As if this were a matter of gold.',
    },
  },
};

/** The morning: the edge of the crowd. Nothing is seen. */
export const martyrsCrowdEdge: DialogueTree = {
  id: 'martyrs-crowd-edge',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The Sabzih-Maydán is full from the palace wall to the shuttered shops. People stand on the stalls and on the roofs. Soldiers hold a ring open in the middle of the square. You cannot see into it, and you do not try.',
      choices: [{ text: '(Stand at the edge, your back to the wall.)', next: 'voice' }],
    },
    voice: {
      speaker: 'Narrator',
      text: 'A voice carries over the heads, unhurried, a voice of Shíráz you know. For a thousand years, it says, you have prayed for the Qáʾim to come; now He has come, and you have sent Him to a prison at the edge of Ádhirbáyján. I will not call down God\'s wrath on you. With my last breath I pray He washes the stain away, and wakes you.',
      choices: [{ text: '(Bow your head.)', next: 'others' }],
    },
    others: {
      speaker: 'Narrator',
      text: 'Then other voices, one after another, and none of them afraid. Once the whole square cries out together, as Ṭihrán cries on the day of ʿÁshúrá, and you cannot tell whether it is grief or shame. Then it is quiet.',
      choices: [{ text: '(Stay where you are.)', next: 'days' }],
    },
    days: {
      speaker: 'Narrator',
      onEnter: { set: { martyrsAfter: true } },
      text: 'At noon the soldiers let the crowd in. You do not go in. For three days and three nights the square is no place for anyone who loved them. On the third evening, when the crowd has had its fill and gone home, you come back.',
    },
  },
};

/** After: the headsman who would not strike the Báb's uncle, leaving for Khurásán. */
export const martyrsHeadsman: DialogueTree = {
  id: 'martyrs-headsman',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Headsman',
      text: '(A broad man in a red coat sits on a bundle by the palace wall, a pack strapped to it, looking at his hands.) Do not look at me like that. I did not do it. I would not.',
      choices: [{ text: '"Tell me."', next: 'bargain' }],
    },
    bargain: {
      speaker: 'A Headsman',
      text: 'They took me on for murderers and highway robbers. That was the bargain. Then they gave me an old merchant of Shíráz, a siyyid, the Báb\'s own uncle. He had asked to be first. He spoke to the crowd, and when he had finished he did not curse us. He prayed for us.',
      choices: [{ text: '"What did you do?"', next: 'sword' }],
    },
    sword: {
      speaker: 'A Headsman',
      text: 'I said my sword wanted sharpening, and I walked away through the crowd, and I did not come back. Another man did it. (He wipes his face with the heel of his hand.) They asked me to shed the blood of a man as holy as the Imám Músá-Káẓim.',
      choices: [{ text: '"Where will you go?"', next: 'khurasan' }],
    },
    khurasan: {
      speaker: 'A Headsman',
      onEnter: { set: { martyrsHeardHeadsman: true } },
      text: 'Khurásán. I will carry loads there, or cry goods in the market. Anything but this. (He stands, and shoulders the pack.) If anyone there asks me about this square, I will tell them. I will tell them every time.',
    },
  },
};

/** After: the sweet-seller, who saw it all from his corner. */
export const martyrsSweetSeller: DialogueTree = {
  id: 'martyrs-sweet-seller',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Sweet-Seller',
      text: '(The old man sits by the green-sellers\' baskets with his tray. He has not called his wares all evening.) Buy, or sit. Either way, do not ask me to shout. I have no shout left in me.',
      choices: [{ text: '"Were you here that morning?"', next: 'coin' }],
    },
    coin: {
      speaker: 'A Sweet-Seller',
      text: 'Where else would I be? This is my corner. (He touches a coin set apart on the rim of his tray.) A mullá from Qum, waiting his turn, gave this to the headsman and sent him to me for sweets. He ate a little and gave the rest back to the man, and said: I forgive you. He said he had waited thirty years for that morning.',
      choices: [{ text: '"And the others?"', next: 'others' }],
    },
    others: {
      speaker: 'A Sweet-Seller',
      text: 'The dervish threw his arms round the old merchant where he lay and called it a day of rejoicing. The mujtahid from Khurásán begged them to gather the ʿulamá and hear his proofs, and an officer of the Amír answered him with a dagger.',
      choices: [{ text: '(Wait.)', next: 'three' }],
    },
    three: {
      speaker: 'A Sweet-Seller',
      text: 'Then the last three pressed forward, each begging to go before the others. The merchant of Kirmán, who would not live a moment after his friend. The siyyid of Zanján, who called on the name of his brother who fell at Ṭabarsí.',
      choices: [{ text: '"And the third?"', next: 'last' }],
    },
    last: {
      speaker: 'A Sweet-Seller',
      onEnter: { set: { martyrsHeardSweetSeller: true } },
      text: 'The boy from Marágha, who had not said a word to the Kalántar. He put his arms round the mullá of Qum and spoke at last, to say he would not be parted from his friend. They went together, all three at once. (He pushes the tray toward you.) Take one. For the mullá of Qum.',
    },
  },
};

/** The swept stones, before the player has heard the witnesses. */
export const martyrsSweptStonesLocked: DialogueTree = {
  id: 'martyrs-swept-stones-locked',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A stretch of paving by the palace wall has been scrubbed and swept, and is still dark with water. People cross the square around it, not over it. Those who were here that morning will tell you, if you ask.',
    },
  },
};

/** The swept stones: the chapter's close. */
export const martyrsSweptStones: DialogueTree = {
  id: 'martyrs-swept-stones',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The paving by the palace wall, scrubbed and swept and still dark with water. A sprig of winter green from the market lies on it, dropped or left. People cross the square around it, not over it.',
      choices: [{ text: '(Stand where they stood.)', next: 'grave' }],
    },
    grave: {
      speaker: 'Narrator',
      text: 'This morning they were carried out beyond the city gate, past the edge of the burial ground, and laid by the moat between the gate of Naw and the gate of Sháh ʿAbdu\'l-ʿAẓím. They were all put in one grave, together in the earth as they had been together in this.',
      choices: [{ text: '(Name them.)', next: 'seven' }],
    },
    seven: {
      speaker: 'Narrator',
      text: 'Ḥájí Mírzá Siyyid ʿAlí, the Báb\'s uncle. Mírzá Qurbán-ʿAlí, the dervish. Ḥájí Mullá Ismáʿíl of Qum. Siyyid Ḥusayn of Turshíz. Ḥájí Muḥammad-Taqí of Kirmán. Siyyid Murtaḍá of Zanján. Muḥammad-Ḥusayn of Marágha. Seven of the fourteen. The other seven said the word, and were let go.',
      choices: [{ text: '(Remember them.)', next: 'goats' }],
    },
    goats: {
      speaker: 'Narrator',
      onEnter: { set: { martyrsComplete: true } },
      text: 'The news will reach Chihríq on top of the Báb\'s grief for Ṭabarsí. In a Tablet in their honour He will call them the Seven Goats of the old traditions, who walk before the Qáʾim: their deaths would go before His own. And in the south, Vaḥíd, whom the dervish longed to follow, is already on the road.',
    },
  },
};

export const martyrsSquareDialogues: Record<string, DialogueTree> = {
  [martyrsSweetSellerBefore.id]: martyrsSweetSellerBefore,
  [martyrsCrowdEdge.id]: martyrsCrowdEdge,
  [martyrsHeadsman.id]: martyrsHeadsman,
  [martyrsSweetSeller.id]: martyrsSweetSeller,
  [martyrsSweptStonesLocked.id]: martyrsSweptStonesLocked,
  [martyrsSweptStones.id]: martyrsSweptStones,
};
