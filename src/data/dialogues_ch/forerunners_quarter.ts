import type { DialogueTree } from '../../dialogue/types';

/**
 * Karbilá, the late autumn of 1843 to January 1844: the lane outside Siyyid
 * Káẓim's house (Nabíl, chapters I and II). The opening, the people of the
 * lane before and after his death, the copyist at the door with the news,
 * and Mullá Ḥusayn coming home along the north road.
 */

/** The chapter's opening narration: the first thing a new player sees. */
export const opening: DialogueTree = {
  id: 'fr-opening',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Karbilá, in the late autumn of 1843. Over the flat roofs and the date palms the gilded dome of the shrine of the Imám Ḥusayn catches the low sun. The water-sellers are out, and the lanes smell of bread and the canal.',
      choices: [{ text: '(Go on.)', next: 'who' }],
    },
    who: {
      speaker: 'Narrator',
      text: 'You came from Persia to sit at the feet of Siyyid Káẓim of Rasht, who keeps the teaching of his master, Shaykh Aḥmad, alive in this city. Both have said the same strange thing for forty years: that the One the ages have awaited is near.',
      choices: [{ text: '(Go on.)', next: 'today' }],
    },
    today: {
      speaker: 'Narrator',
      onEnter: { set: { frWitness: true } },
      text: 'This morning the Siyyid teaches in his house, along the lane. Lately he speaks of little else but leaving, and of seeking. You had better not be late.',
    },
  },
};

/** The water-seller, before the death. */
export const waterSeller: DialogueTree = {
  id: 'fr-water-seller',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Water-Seller',
      text: '(He tips the goatskin and fills a brass cup for you.) Canal water, sweet as the Euphrates gives it. You are one of the Siyyid\'s Persians. You all have the same look, as if you were listening for something.',
      choices: [
        { text: '"Did you know Shaykh Aḥmad, his master?"', next: 'ahmad' },
        { text: '"Listening for what?"', next: 'what' },
      ],
    },
    ahmad: {
      speaker: 'A Water-Seller',
      text: 'I was a boy when he taught here. An Arab of Aḥsá, white-bearded, always about to leave for somewhere. My father said the Shaykh walked half of Persia telling people to make ready. He died on the road to Mecca, near Medina, these seventeen years.',
      choices: [{ text: '"Make ready for what?"', next: 'what' }],
    },
    what: {
      speaker: 'A Water-Seller',
      onEnter: { set: { frMetWaterSeller: true } },
      text: 'For the Qá\'im, they say, the Promised One. (He wipes the cup on his sleeve.) My trade is water, friend. But I notice the Siyyid\'s students have stopped buying houses here. They rent by the month.',
    },
  },
};

/** The water-seller in the mourning, after the death. */
export const waterSellerMourning: DialogueTree = {
  id: 'fr-water-seller-mourning',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Water-Seller',
      text: '(He has a strip of black cloth knotted round his arm.) You. I carried water at the Siyyid\'s burial, for the washing and for the crowd. There were more people than I have skins.',
      choices: [{ text: '"He was laid to rest by the shrine?"', next: 'shrine' }],
    },
    shrine: {
      speaker: 'A Water-Seller',
      text: 'Within its precincts, near the Imám he loved. And now Muḥarram is coming, and the whole city will put on black for the Imám Ḥusayn as it does every year. This year the black was out early.',
      choices: [{ text: '"What will his students do?"', next: 'students' }],
    },
    students: {
      speaker: 'A Water-Seller',
      onEnter: { set: { frMournedWithWaterSeller: true } },
      text: 'Some sit in his house as if he had only gone to the bathhouse. Some argue in the lane about who will sit in his place. (He fills your cup and will not take the coin.) And you, Persian? Are you still listening?',
    },
  },
};

/** The bookseller, before the death: Shaykh Aḥmad's books and their enemies. */
export const bookseller: DialogueTree = {
  id: 'fr-bookseller',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Bookseller',
      text: 'Commentaries, prayers, a fine Qur\'án from Iṣfahán? (He sees your face and lowers his voice.) Ah. You want the Shaykh\'s writings. Under the cloth, on the left.',
      choices: [
        { text: '"Why under the cloth?"', next: 'why' },
        { text: '"Do they sell well?"', next: 'sell' },
      ],
    },
    why: {
      speaker: 'A Bookseller',
      text: 'Years ago a great divine of Qazvín pronounced Shaykh Aḥmad an unbeliever, and the word went from pulpit to pulpit. Since then half my customers want his books, and the other half want them burnt.',
      choices: [{ text: '"And Siyyid Káẓim?"', next: 'kazim' }],
    },
    sell: {
      speaker: 'A Bookseller',
      text: 'To the Siyyid\'s students, always. To his enemies, also, so they can quote them in the mosque and shake their heads. I sell to both and say my prayers.',
      choices: [{ text: '"And Siyyid Káẓim? Has he enemies here?"', next: 'kazim' }],
    },
    kazim: {
      speaker: 'A Bookseller',
      onEnter: { set: { frMetBookseller: true } },
      text: 'In Karbilá? They insult him to his face in the shrine court, and he answers them with courtesy, which they find worse. He writes more than any man I know, and lately he writes as if he were in a hurry.',
    },
  },
};

/** The bookseller in the mourning. */
export const booksellerMourning: DialogueTree = {
  id: 'fr-bookseller-mourning',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Bookseller',
      text: '(The cloth is off his stall; the Shaykh\'s books lie openly in the cold light.) No one to hide them from this month. His enemies are content, and his friends are too sad to buy.',
      choices: [{ text: '"Who will lead his students now?"', next: 'lead' }],
    },
    lead: {
      speaker: 'A Bookseller',
      onEnter: { set: { frBooksellerMourning: true } },
      text: 'Everyone has a name. There are letters from a man in Kirmán who says the mantle is his. A few of the old students here would not mind it either. (He shrugs.) The Siyyid himself named no one. He only said, go.',
    },
  },
};

/** The young student from Khurásán, in the lane before the lesson. */
export const seeker: DialogueTree = {
  id: 'fr-seeker',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Student from Khurásán',
      text: 'There you are! Come on, he has started already. (He falls into step with you, talking fast.) Did you hear what he said yesterday? That some of us would live to see the day, and some would see it and not know it.',
      choices: [
        { text: '"He says such things every week."', next: 'week' },
        { text: '"Where is Mullá Ḥusayn? I have not seen him."', next: 'husayn' },
      ],
    },
    week: {
      speaker: 'A Student from Khurásán',
      text: 'Every week, and every week more plainly. My father thinks I am wasting my youth among dreamers. I would walk to the end of the earth tomorrow if the Siyyid told me where.',
      choices: [{ text: '"And Mullá Ḥusayn?"', next: 'husayn' }],
    },
    husayn: {
      speaker: 'A Student from Khurásán',
      onEnter: { set: { frMetSeeker: true } },
      text: 'Gone to Iṣfahán with the Siyyid\'s letters, to answer the divines who call us heretics, and then on to Mashhad. He is from Bushrúyih, near my own town. If anyone among us is ready for the day, it is him. (He tugs your sleeve toward the gateway.)',
    },
  },
};

/** At the door, after the road to Kázimayn: the copyist tells of the weeks to ʿArafih. */
export const copyistDoor: DialogueTree = {
  id: 'fr-copyist-door',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Copyist',
      text: '(The old copyist is waiting in the gateway, his pen-case under his arm, as if he had not moved since you left.) You have come back with him from Kázimayn. Then you heard the shepherd, too.',
      choices: [{ text: '"We heard him."', next: 'days' }],
    },
    days: {
      speaker: 'Narrator',
      text: 'The weeks until ʿArafih pass in this house. The Siyyid teaches when he can, and when he cannot, he has the door left open. To everyone who comes in he says the same: do not linger by my side when I am gone. Scatter, and seek Him.',
      choices: [{ text: '(Go on.)', next: 'death' }],
    },
    death: {
      speaker: 'Narrator',
      onEnter: { set: { frKazimDied: true } },
      text: 'On the day of ʿArafih, the ninth of Dhi\'l-Ḥijjih, the last day of the year 1843 by the Christian reckoning, Siyyid Káẓim dies in Karbilá. He is laid to rest within the precincts of the shrine of the Imám Ḥusayn. Within the month, the city puts on black.',
    },
  },
};

/** Mullá Ḥusayn, coming in by the north road on the first of Muḥarram. */
export const husaynReturn: DialogueTree = {
  id: 'fr-husayn-return',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'On the first day of Muḥarram, three travellers walk in by the north road, grey with dust: Mullá Ḥusayn of Bushrúyih, back from Iṣfahán and Mashhad, with his brother and his young nephew.',
      choices: [{ text: '(Go to meet him.)', next: 'meet' }],
    },
    meet: {
      speaker: 'Mullá Ḥusayn',
      text: 'I heard on the road. (He holds your hands a long moment.) Tell me what he said at the end. Not what the lane says. What he said.',
      choices: [
        { text: '"That we should not linger by his side. That we should scatter and seek."', next: 'scatter' },
        { text: '"A shepherd at Baráthá told him he would die on the day of ʿArafih. He was glad."', next: 'shepherd',
          requires: f => !!f.frForetold },
      ],
    },
    shepherd: {
      speaker: 'Mullá Ḥusayn',
      text: 'Glad. Yes, that is like him. He went out to meet his death the way a host goes out to the gate. (He is quiet.) And his charge to us?',
      choices: [{ text: '"To scatter, and seek."', next: 'scatter' }],
    },
    scatter: {
      speaker: 'Mullá Ḥusayn',
      text: 'Then why is his house still full? (He looks along the lane, at the knots of students talking.) I will go in and speak with them, and say the same to every one who will hear it. But words are cheap in Karbilá. I must do it myself.',
      choices: [{ text: '"What will you do?"', next: 'kufih' }],
    },
    kufih: {
      speaker: 'Mullá Ḥusayn',
      text: 'Go out to the old masjid at Kúfih, and pray and fast there forty days, to make my heart ready for whatever road comes after. My brother and nephew come with me. (He looks at you.) You were dear to him.',
      choices: [
        { text: '"Let me come with you."', next: 'come' },
        { text: '"Let me think on it."', next: 'think' },
      ],
    },
    come: {
      speaker: 'Mullá Ḥusayn',
      onEnter: { set: { frHusaynReturned: true, frJoinedHusayn: true } },
      text: 'Come, then. At Kúfih I will say very little; do not take it for coldness. We leave by the road south-east, at the end of the lane, when I have spoken with his household.',
    },
    think: {
      speaker: 'Mullá Ḥusayn',
      onEnter: { set: { frHusaynReturned: true } },
      text: 'Think, but not for long. He did not leave us time for long thinking.',
    },
  },
};

/** Mullá Ḥusayn again, if the player asked for time. */
export const husaynAgain: DialogueTree = {
  id: 'fr-husayn-again',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn',
      text: 'Have you thought?',
      choices: [
        { text: '"I will come with you to Kúfih."', next: 'come' },
        { text: '"Not yet."' },
      ],
    },
    come: {
      speaker: 'Mullá Ḥusayn',
      onEnter: { set: { frJoinedHusayn: true } },
      text: 'Good. We leave by the road south-east, at the end of the lane, when I have spoken with his household.',
    },
  },
};

/** On the Kúfih road: Mullá Ḥusayn waiting with the mules. */
export const husaynRoad: DialogueTree = {
  id: 'fr-husayn-road',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn',
      text: 'I said it to all of them in his own room: he told us to go, and we are still here. A few listened. (He checks the girth of a mule.) The road to Kúfih is south-east, past the palms. Walk with us.',
    },
  },
};

/** His brother, with the mules. */
export const brotherRoad: DialogueTree = {
  id: 'fr-brother-road',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn\'s Brother',
      text: 'All the way from Mashhad, and now on to Kúfih. (He laughs tiredly.) Where my brother goes, I go. Someone has to make sure he eats.',
    },
  },
};

export const forerunnersQuarterDialogues: Record<string, DialogueTree> = {
  [opening.id]: opening,
  [waterSeller.id]: waterSeller,
  [waterSellerMourning.id]: waterSellerMourning,
  [bookseller.id]: bookseller,
  [booksellerMourning.id]: booksellerMourning,
  [seeker.id]: seeker,
  [copyistDoor.id]: copyistDoor,
  [husaynReturn.id]: husaynReturn,
  [husaynAgain.id]: husaynAgain,
  [husaynRoad.id]: husaynRoad,
  [brotherRoad.id]: brotherRoad,
};
