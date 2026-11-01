import type { DialogueTree } from '../../dialogue/types';

/**
 * Karbilá, 1851 to 1852: the palm groves on the Ḥusayniyyih canal at the
 * edge of the town, where the player comes home from Zanján. A water-seller
 * who remembers the student, and an old classmate from Siyyid Káẓim's
 * lessons who stayed behind; in spring he brings the news from Ṭihrán.
 */

/** The water-seller at the canal, on the player's arrival. */
export const waterSeller: DialogueTree = {
  id: 'kr-water-seller',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Water-Seller',
      text: '(A man with a dripping goatskin on his back holds out a brass cup.) Water, pilgrim, in the name of the thirsty of Karbilá. No charge on the road in. (He looks at you over the cup.) By God. The Persian who used to buy water for the Siyyid\'s lessons. Two skins a morning, and never once haggled.',
      choices: [
        { text: '"You remember."', next: 'remember' },
        { text: '"You asked me once if I was still listening."', next: 'listening', requires: f => !!f.frMetWaterSeller || !!f.frMournedWithWaterSeller },
        { text: '(Drink.)', next: 'drink' },
      ],
    },
    remember: {
      speaker: 'A Water-Seller',
      text: 'I remember everybody who paid. (He grins.) Eight years? You have the look of a man who has drunk bad water in a lot of places since.',
      choices: [{ text: '(Drink.)', next: 'drink' }],
    },
    listening: {
      speaker: 'A Water-Seller',
      text: '(He lowers the cup.) So I did, the winter they buried the Siyyid. (He looks at your road-worn coat a long moment.) And you went off to listen somewhere else, all of you. Well. Did you hear it?',
      choices: [{ text: '(Drink, and do not answer yet.)', next: 'drink' }],
    },
    drink: {
      speaker: 'A Water-Seller',
      text: 'The Ḥusayniyyih, from the Euphrates. Before the Sultan\'s men dug it, long ago, this was all dust; now look at the palms. (He fills the cup again.) Karbilá is the same as ever, more or less. Hotter. Fuller of Persians.',
      choices: [{ text: '"Fuller of Persians?"', next: 'persians' }],
    },
    persians: {
      speaker: 'A Water-Seller',
      onEnter: { set: { krMetWaterSeller: true } },
      text: 'A gentleman from Ṭihrán has taken a house in the lanes east of the shrine. His people buy my water. And all day the Persians go to that door, and come away from it quiet, as if they had been to the tomb itself. (He shrugs the skin higher.) Go up to the shrine, pilgrim. Your old square is waiting.',
    },
  },
};

/** The water-seller through the winter. */
export const waterSellerWinter: DialogueTree = {
  id: 'kr-water-seller-winter',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Water-Seller',
      text: 'Cold water, cold morning. (He blows on his fingers.) There is a boy from Káshán who comes down for the house in the lane now, before light, every day. He carries the skin as if it held rosewater. I told him it is only the canal. He said, "Not when it gets there."',
    },
  },
};

/** The water-seller in spring. */
export const waterSellerSpring: DialogueTree = {
  id: 'kr-water-seller-spring',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Water-Seller',
      text: 'The palms are flowering, and I have one customer fewer. (He looks east, toward the lanes.) Strange. I only ever sold them water. Why should I miss a house?',
    },
  },
};

/** The old classmate in the square, in summer. */
export const classmate: DialogueTree = {
  id: 'kr-classmate',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'An Old Classmate',
      text: '(A man of your own age in a fine cloak stops dead in front of you.) It cannot be. You! We read Shaykh Aḥmad\'s commentaries side by side, in the Siyyid\'s house, with our backs to the same pillar. Where have you been for eight years?',
      choices: [
        { text: '"Shíráz. Mákú. Ṭabarsí. Zanján."', next: 'where' },
        { text: '"Following what the Siyyid told us to seek."', next: 'where' },
      ],
    },
    where: {
      speaker: 'An Old Classmate',
      text: '(His face closes a little, then opens again.) So you went with Mullá Ḥusayn. Of course you did; you always sat nearest him. I stayed. Somebody had to keep the Siyyid\'s books from the damp.',
      choices: [{ text: '"Who else is left?"', next: 'left' }],
    },
    left: {
      speaker: 'An Old Classmate',
      text: 'Hardly anyone. Mullá Ḥusayn fell at Ṭabarsí, you know that better than I. Mullá ʿAlíy-i-Basṭámí died a prisoner among the Turks. Some went to Kirmán, to Karím Khán, and curse the rest of us now. The Siyyid\'s house is let to strangers. Even the lady of Qazvín who taught there behind her curtain is gone.',
      choices: [
        { text: '"And you? What do you believe?"', next: 'believe' },
        { text: '"I am glad to see one face from the old pillar."', next: 'glad' },
      ],
    },
    believe: {
      speaker: 'An Old Classmate',
      text: 'I believe that a man of sense waits and sees. (He says it too quickly.) Your Báb is dead, my friend. If it was true, why did God let them shoot Him?',
      choices: [{ text: '"I do not have an answer you would take. But I have not stopped looking."', next: 'glad' }],
    },
    glad: {
      speaker: 'An Old Classmate',
      onEnter: { set: { krMetClassmate: true } },
      text: '(He grips your hands.) And I you. Come and eat with me before you go wandering again. (He lowers his voice.) And be careful. There are more of your people in Karbilá this summer than there have been for years, and the governor\'s men can count.',
    },
  },
};

/** The classmate at the canal in winter, before the news. */
export const classmateWinter: DialogueTree = {
  id: 'kr-classmate-winter',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'An Old Classmate',
      text: '(He is sitting on the bank with a book shut on his knees.) I come out here to read and do not read. (He looks at the water.) I went to that lane once, you know. At night. I stood in front of the door for as long as it takes to recite the Fátiḥa, and I did not knock.',
      choices: [{ text: '"Why not?"', next: 'why' }],
    },
    why: {
      speaker: 'An Old Classmate',
      onEnter: { set: { krClassmateDoor: true } },
      text: 'Because I was afraid it would open. (He laughs, not happily.) Go on, you. Go and see who sits on that step. When you come back I may have letters from Persia; my brother writes from Ṭihrán when the roads are open.',
    },
  },
};

/** The classmate at the canal with the news from Ṭihrán. */
export const classmateNews: DialogueTree = {
  id: 'kr-classmate-news',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'An Old Classmate',
      text: '(He is waiting for you, a letter open in his hands.) News from Ṭihrán, and old news by the time it reaches us. The Amír-Niẓám has fallen. The Sháh dismissed him in the autumn, and this winter they opened his veins in the bath at Fín, by Káshán.',
      choices: [{ text: '"Mírzá Taqí Khán. The man who gave the order for Tabríz."', next: 'tabriz' }],
    },
    tabriz: {
      speaker: 'An Old Classmate',
      text: 'The same. God is the judge of him. (He folds the letter.) There is a new Grand Vizier, Mírzá Áqá Khán, a man of Núr. My brother writes that he has invited his countryman back to Ṭihrán: the nobleman of the lane.',
      choices: [{ text: '"Will He go?"', next: 'go' }],
    },
    go: {
      speaker: 'An Old Classmate',
      onEnter: { set: { krSpring: true } },
      text: 'If I know anything of that house, He has gone already. (He looks at you, and for a moment he is the student at the pillar again.) Go and look at the door. And then, my friend, go wherever you are going with your eyes open. Ṭihrán is no place for one of you this year.',
    },
  },
};

/** The classmate at the canal in spring. */
export const classmateSpring: DialogueTree = {
  id: 'kr-classmate-spring',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'An Old Classmate',
      text: 'Spring on the canal. The Siyyid used to bring us out here after the lessons, do you remember, and make us argue with the frogs. (He smiles.) Write to me, if they let you write. And if you ever find what we were told to seek, come back and make me knock.',
    },
  },
};

export const karbilaGrovesDialogues: Record<string, DialogueTree> = {
  [waterSeller.id]: waterSeller,
  [waterSellerWinter.id]: waterSellerWinter,
  [waterSellerSpring.id]: waterSellerSpring,
  [classmate.id]: classmate,
  [classmateWinter.id]: classmateWinter,
  [classmateNews.id]: classmateNews,
  [classmateSpring.id]: classmateSpring,
};
