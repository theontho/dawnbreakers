import type { DialogueTree } from '../../dialogue/types';

/**
 * A merchants' caravanserai by the bazaar of Ṭihrán, February 1850. Nabíl
 * records that many of the wealthier merchants who knew Ḥájí Mírzá Siyyid
 * ʿAlí, the Báb's uncle, offered to pay his ransom, and that the
 * Maliku't-Tujjár interceded for him; he refused. Nabíl himself, a young
 * man of Zarand, was in the city the day after the arrests, carrying a
 * package of sacred writings his teacher Mírzá Aḥmad had left for him to a
 * man of Qazvín in a caravanserai.
 */

/** A merchant of Shíráz who has raised the uncle's ransom, and sends the player with it. */
export const martyrsMerchant: DialogueTree = {
  id: 'martyrs-merchant',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Merchant of Shíráz',
      text: '(A merchant in a fur-lined cloak stands over the brazier, a ledger under his arm that he has not opened all morning.) You have come in from the street. Then you have heard. They have taken Ḥájí Mírzá Siyyid ʿAlí.',
      choices: [
        { text: '"I knew him in Shíráz, when he stood surety for his Nephew."', next: 'shiraz',
          requires: f => !!f.khalMet || !!f.khalHome },
        { text: '"Who has taken him?"', next: 'taken' },
      ],
    },
    shiraz: {
      speaker: 'A Merchant of Shíráz',
      text: 'Then you know what kind of man he is. Half the bazaar of Shíráz has weighed goods on his scales, and nobody ever found them light.',
      choices: [{ text: '"Who has taken him?"', next: 'taken' }],
    },
    taken: {
      speaker: 'A Merchant of Shíráz',
      text: 'The Kalántar\'s men. Someone gave them a list of names, fifty they say, and fourteen were seized and shut up in Maḥmúd Khán\'s own house. His friends begged him to leave the city weeks ago. He would not.',
      choices: [{ text: '"What can be done?"', next: 'ransom' }],
    },
    ransom: {
      speaker: 'A Merchant of Shíráz',
      text: 'What merchants can do. We have pledged a sum, the men of Shíráz and of Ṭihrán together, and the Maliku\'t-Tujjár himself has spoken for him. They say the Amír-Niẓám has no wish to harm a descendant of the Prophet. One word, and he goes home with honour.',
      choices: [{ text: '"One word?"', next: 'word' }],
    },
    word: {
      speaker: 'A Merchant of Shíráz',
      text: 'That he is not a Bábí. A word said in a room, to save a life; the ʿulamá themselves allow it. (He holds out a knotted cloth.) Bread, cheese, a few dates. The guard at the Kalántar\'s door will let a servant in for a coin. Take him this, and tell him what we offer.',
      choices: [{ text: '"I will take it to him."', next: 'go' }],
    },
    go: {
      speaker: 'A Merchant of Shíráz',
      onEnter: { set: { martyrsMerchantAsked: true } },
      text: 'The house with the carved door, along the street toward the square. (He presses a coin into your palm.) And sit with the others, if they let you. Some of them have nobody in this city to bring them bread.',
    },
  },
};

/** The merchant, while the player has not yet sat with the prisoners. */
export const martyrsMerchantWaiting: DialogueTree = {
  id: 'martyrs-merchant-waiting',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Merchant of Shíráz',
      text: '(He turns the ledger over in his hands.) Have you been to him? The carved door, along the street. Sit with the others too, if the guard allows it. I would know how they all are, not only him.',
    },
  },
};

/** The merchant hears the uncle's answer; that night the city goes to the square. */
export const martyrsMerchantAnswer: DialogueTree = {
  id: 'martyrs-merchant-answer',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Merchant of Shíráz',
      text: '(He sees your face before you speak, and closes the ledger.) He will not.',
      choices: [{ text: '"He thanks you all. He will not say the word."', next: 'known' }],
    },
    known: {
      speaker: 'A Merchant of Shíráz',
      text: '(He sits down on the edge of the platform, slowly.) I have known him thirty years. He raised that Boy in his own house, after the father died. I should have known what he would say. I think I did know.',
      choices: [{ text: '"What happens now?"', next: 'amir' }],
    },
    amir: {
      speaker: 'A Merchant of Shíráz',
      text: 'Now it goes to the Amír-Niẓám, Mírzá Taqí Khán. The Sháh leaves such matters wholly to him, and nobody questions what he decides. They say he will see them tomorrow, and that whoever will not recant will not come back.',
      choices: [{ text: '(Sit with him.)', next: 'night' }],
    },
    night: {
      speaker: 'Narrator',
      onEnter: { set: { martyrsMorning: true } },
      text: 'That night the merchants of Shíráz sit up round the brazier with the ledger shut between them, and nobody sleeps. Before dawn there is a sound of many feet in the street outside, all going one way: toward the Sabzih-Maydán.',
    },
  },
};

/** A young man of Zarand with a package of writings: the chronicler, years before he wrote. */
export const martyrsYoungMan: DialogueTree = {
  id: 'martyrs-young-man',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Young Man of Zarand',
      text: '(A young man with a shepherd\'s weathered face sits on the platform, holding a package against his chest as if it might fly away.) Forgive me. I am waiting for a man of Qazvín who lodges here. I have something to put in his hands.',
      choices: [
        { text: '"What is in it?"', next: 'package' },
        { text: '"You look frightened."', next: 'package' },
      ],
    },
    package: {
      speaker: 'A Young Man of Zarand',
      text: 'Writings. Copies of the sacred writings, in a good hand. My teacher, Mírzá Aḥmad, left them in my room with a letter: if I reached this place safely I was to deliver them, and then come to the Masjid-i-Sháh, where he has taken sanctuary.',
      choices: [{ text: '"Then you know about the arrests."', next: 'list' }],
    },
    list: {
      speaker: 'A Young Man of Zarand',
      text: 'A siyyid of Káshán who sat among us at our gatherings took a list of our names, and where we lodge, to one of the ʿulamá. About fifty names. The Kalántar\'s men took fourteen. I was not in my room that night. I was with my uncle and my brother, who had come up from Zarand.',
      choices: [{ text: '"What will you do now?"', next: 'home' }],
    },
    home: {
      speaker: 'A Young Man of Zarand',
      onEnter: { set: { martyrsMetYoungMan: true } },
      text: 'My father has heard that I am arrested and to be put to death. My people want me home for Naw-Rúz. (He smiles crookedly.) I was a shepherd. I used to say prayers to the stars over the sheep. All that I have seen since, I mean to remember. Someone should write it down.',
    },
  },
};

export const martyrsSeraiDialogues: Record<string, DialogueTree> = {
  [martyrsMerchant.id]: martyrsMerchant,
  [martyrsMerchantWaiting.id]: martyrsMerchantWaiting,
  [martyrsMerchantAnswer.id]: martyrsMerchantAnswer,
  [martyrsYoungMan.id]: martyrsYoungMan,
};
