import type { DialogueTree } from '../../dialogue/types';

/**
 * Karbilá, the first of Muḥarram 1262 (the turn of 1845 into 1846), in the
 * house of the late Siyyid Káẓim. Qurratu'l-ʿAyn teaches from behind a
 * curtain; Shaykh Ṣáliḥ, an Arab of the city, keeps her door; a disciple of
 * the late Siyyid is troubled by her boldness; her sister Marḍíyyih wears
 * bright clothes for the Báb's birthday while the city mourns the Imám
 * Ḥusayn (Nabíl, chapter XV and its notes). The close tells the road through
 * Baghdád, Kirmánsháh and Hamadán to Qazvín.
 *
 * This chapter's witness is not the pilgrim of the other chapters but a
 * young woman of Qazvín, in Karbilá with her mother for Muḥarram, who sits
 * at the edge of the curtain where a woman may hear (`qz-opening`).
 */

/** The chapter's opening narration: who the player is this time. */
export const opening: DialogueTree = {
  id: 'qz-opening',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'This chapter goes back to Karbilá, and in it you are someone else: not the pilgrim from Shíráz, but a young woman of Qazvín, come to the shrine city with your mother for the mourning of Muḥarram.',
      choices: [{ text: '(Listen.)', next: 'who' }],
    },
    who: {
      speaker: 'Narrator',
      onEnter: { set: { qzWitness: true } },
      text: 'The women of Qazvín speak this year of one woman: Fáṭimih, daughter of Ḥájí Mullá Ṣáliḥ, who teaches the learned men of Karbilá from behind a curtain. Tonight, the first of Muḥarram, you have slipped away to the house of the late Siyyid Káẓim to hear her.',
    },
  },
};

/** The empty place before the curtain: her voice. */
export const curtain: DialogueTree = {
  id: 'qz-curtain',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'You kneel in the empty place at the curtain\'s edge, half in its shadow, where a woman may sit and hear. Beyond the cloth a lamp burns, and a woman\'s shadow moves across it as she turns a page. The men on the near side go still. Then the voice begins, clear and unhurried, in Arabic first and then in Persian.',
      choices: [{ text: '(Listen.)', next: 'voice' }],
    },
    voice: {
      speaker: 'Qurratu\'l-ʿAyn',
      text: 'The Book says the Hour will come suddenly. Our fathers read that and waited for the sky to split. I tell you it has come as the Book said: suddenly, and to people who were not looking. (A pause.) There is someone new at the curtain\'s edge. Who are you, child?',
      choices: [
        { text: '"A daughter of Qazvín, lady, as you are."', next: 'student' },
        { text: '"Only a pilgrim, here with my mother for Muḥarram."', next: 'traveller' },
      ],
    },
    student: {
      speaker: 'Qurratu\'l-ʿAyn',
      text: 'Of Qazvín! Then you have walked past my father\'s gate a hundred times. (A soft laugh.) I came from Qazvín too late to hear Siyyid Káẓim. His widow let me sit where his voice had been. Now you sit where mine is.',
      choices: [{ text: '"How did you come to believe?"', next: 'never' }],
    },
    traveller: {
      speaker: 'Qurratu\'l-ʿAyn',
      text: 'A pilgrim comes looking for something. So did I, and I never left my room to do it. My letter went out of this city sealed, to a Man I had never seen. (The shadow lifts its head.) Shall I tell you how?',
      choices: [{ text: '"Please."', next: 'never' }],
    },
    never: {
      speaker: 'Qurratu\'l-ʿAyn',
      text: 'When the friends rode out to search for the Promised One, I could not ride with them. So I wrote a letter and sealed it, and gave it to my sister\'s husband, Mírzá Muḥammad-ʿAlí, and said: give this to the One you find.',
      choices: [{ text: '"And he found Him?"', next: 'found' }],
    },
    found: {
      speaker: 'Qurratu\'l-ʿAyn',
      text: 'He found Him in Shíráz, and gave Him my letter, and I was counted among the first who believed. (The shadow is very still.) I have never seen His face. One does not need to see the sun to know that it is morning.',
      choices: [
        { text: '"Some here say you go too far."', next: 'far' },
        { text: '"What are you teaching tonight?"', next: 'tonight' },
      ],
    },
    far: {
      speaker: 'Qurratu\'l-ʿAyn',
      text: 'Some say so, and some have written to Shíráz about me. Let them write. If I go too far, it is because the people have stood still too long. I would rather be blamed for running than praised for sleeping.',
      choices: [{ text: '"What are you teaching tonight?"', next: 'tonight' }],
    },
    tonight: {
      speaker: 'Qurratu\'l-ʿAyn',
      onEnter: { set: { qzHeardCurtain: true } },
      text: 'Joy. It is the first of Muḥarram. All Karbilá has put on black for the Imám Ḥusayn, and he is worthy of every tear. But tonight is also the birthday of the Báb, and I will not mourn on it. Go and ask my sister why she is dressed like a bride.',
    },
  },
};

/** Shaykh Ṣáliḥ, an Arab of Karbilá who keeps her door. */
export const salih: DialogueTree = {
  id: 'qz-salih',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Shaykh Ṣáliḥ',
      text: '(He speaks Persian with an Arab\'s care, and keeps a courteous distance.) Peace be upon you, daughter. You are new at the curtain. Have you heard her before?',
      choices: [
        { text: '"Never. Only of her."', next: 'who' },
        { text: '"Who are you?"', next: 'me' },
      ],
    },
    who: {
      speaker: 'Shaykh Ṣáliḥ',
      text: 'Fáṭimih, daughter of Ḥájí Mullá Ṣáliḥ of Qazvín, who taught her himself as he would a son. The late Siyyid wrote to her and called her Qurratu\'l-ʿAyn, the Solace of the Eyes. She knows the Book better than any man here. Ask them. They will not like it, but they will say yes.',
      choices: [{ text: '"And you?"', next: 'me' }],
    },
    me: {
      speaker: 'Shaykh Ṣáliḥ',
      text: 'Ṣáliḥ, of this city. I sold cloth in the bazaar; then I heard her. Now I carry her letters and keep her door. It is a better trade.',
      choices: [{ text: '"Does she write poems?"', next: 'poems' }],
    },
    poems: {
      speaker: 'Shaykh Ṣáliḥ',
      text: 'She writes everything. Letters to the divines of Karbilá, each one longer than their answers. Treatises. And odes, which the friends copy out before she can think better of them. (He draws a folded paper from his sleeve.) Here is one. I cannot read it as she would.',
      choices: [{ text: '"Read it anyway."', next: 'verse' }],
    },
    verse: {
      speaker: 'Shaykh Ṣáliḥ',
      onEnter: { set: { qzMetSalih: true } },
      text: '"The effulgence of the Abhá Beauty hath pierced the veil of night; behold the souls of His lovers dancing, moth-like, in the light that has flashed from His face!" (He folds it away.) Whose face, I asked her. She would not say. She said only that the night was not yet over.',
    },
  },
};

/** A disciple of the late Siyyid, troubled by her boldness. */
export const doubter: DialogueTree = {
  id: 'qz-doubter',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Disciple of the Late Siyyid',
      text: '(An older man by the curtain\'s edge speaks low, so the voice behind it will not hear.) You are of her city, I heard you say it. Then tell me honestly: in Qazvín, do they laugh at her, or are they afraid of her?',
      choices: [{ text: '"What troubles you?"', next: 'troubles' }],
    },
    troubles: {
      speaker: 'A Disciple of the Late Siyyid',
      text: 'A woman teaching men. Letters to the divines that read like indictments. And tonight, the first of Muḥarram, laughter in this house while all Karbilá weeps for the Imám. The townsfolk say it already: the Bábís make a feast of the day of mourning.',
      choices: [
        { text: '"She says the Báb was born on this day."', next: 'born' },
        { text: '"Have you told her?"', next: 'told' },
      ],
    },
    born: {
      speaker: 'A Disciple of the Late Siyyid',
      text: 'I know it. I believe it, God help me, or I would not be here. But must the whole city learn it from the colour of a woman\'s dress? (He rubs his eyes.) Some of the friends have written to Shíráz to ask whether she has gone beyond the bounds.',
      choices: [{ text: '"Have you told her?"', next: 'told' }],
    },
    told: {
      speaker: 'A Disciple of the Late Siyyid',
      onEnter: { set: { qzMetDoubter: true } },
      text: 'I have. She answered me with three verses of the Qur\'án and a question I could not answer. (He almost smiles.) That is the trouble with her. She is very often right. I only wish she were right more quietly.',
    },
  },
};

/** Marḍíyyih, her sister, in bright clothes for the Báb's birthday. */
export const mardiyyihKarbila: DialogueTree = {
  id: 'qz-mardiyyih-karbila',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Marḍíyyih',
      text: '(She is dressed in saffron and red, with green at her sleeve, and carries a tray of sweets.) You are staring. Everyone stares tonight. Take one; they are made with rosewater.',
      choices: [
        { text: '"Forgive me. The whole city is in black."', next: 'black' },
        { text: '"Who are you, lady?"', next: 'who' },
      ],
    },
    who: {
      speaker: 'Marḍíyyih',
      text: 'Marḍíyyih, her sister. It was my husband who carried her letter to Shíráz, so I am in this as deep as anyone. (She holds out the tray again.) You will take a sweet. It is a birthday.',
      choices: [{ text: '"The whole city is in black."', next: 'black' }],
    },
    black: {
      speaker: 'Marḍíyyih',
      text: 'I know. I have worn black every Muḥarram of my life. This morning she came to me with this dress over her arm and said: today the Báb was born, and you will not mourn on His birthday. (She looks down at the saffron silk.) My hands shook doing up the buttons.',
      choices: [{ text: '"Are you afraid?"', next: 'afraid' }],
    },
    afraid: {
      speaker: 'Marḍíyyih',
      onEnter: { set: { qzSawBrightDress: true } },
      text: 'Of the street? Yes. They are already talking at the shrine. (She straightens.) But I have been afraid in black all my life, and nothing came of it. I would rather be afraid in colour, beside her, and see what comes.',
    },
  },
};

/** The curtain again, once the player has met the house: the city's anger, and the road to Qazvín. */
export const karbilaClose: DialogueTree = {
  id: 'qz-karbila-close',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'As you kneel again at the curtain, there is noise in the lane: the drums of Muḥarram, and under them angry voices at the door. Someone has seen the bright clothes. Shaykh Ṣáliḥ gets up and goes out to them.',
      choices: [{ text: '(Listen to the voice behind the curtain.)', next: 'voice' }],
    },
    voice: {
      speaker: 'Qurratu\'l-ʿAyn',
      text: 'Let them shout. They will complain of me to the governor of Baghdád, and he will send for me, and I will answer for what I teach before anyone who cares to hear it. (A page turns.) Do not grieve, friend. A lamp is not put out by being carried into another room.',
      choices: [{ text: '(Remember her words.)', next: 'baghdad' }],
    },
    baghdad: {
      speaker: 'Narrator',
      text: 'So it went. Accused before the governor, she was taken to Baghdád and lodged at last in the house of the muftí, while the governor waited months for word from Constantinople. Divines of every faith in that city came to dispute with her. The word, when it came, was that she must leave the Sultan\'s lands.',
      choices: [{ text: '(Follow the road east.)', next: 'road' }],
    },
    road: {
      speaker: 'Narrator',
      text: 'Early in 1847 she crossed into Persia, teaching as she went. In Kirmánsháh and Hamadán some divines honoured her and some stirred the crowds against her. At Hamadán her father\'s men found her and begged her to come home. She sent most of her companions back to their own lands; Shaykh Ṣáliḥ stayed.',
      choices: [{ text: '(Go home to Qazvín.)', next: 'home' }],
    },
    home: {
      speaker: 'Narrator',
      onEnter: { set: { qzLeftKarbila: true } },
      text: 'You go home with your mother by the caravan road, long before she does. In Qazvín wait her father, who loves her; her husband, her cousin, from whom she has long lived apart; and his father, her uncle Mullá Taqí, the foremost divine of the city, who curses the name of Shaykh Aḥmad from the pulpit.',
    },
  },
};

export const qazvinKarbilaDialogues: Record<string, DialogueTree> = {
  [opening.id]: opening,
  [curtain.id]: curtain,
  [salih.id]: salih,
  [doubter.id]: doubter,
  [mardiyyihKarbila.id]: mardiyyihKarbila,
  [karbilaClose.id]: karbilaClose,
};
