import type { DialogueTree } from '../../dialogue/types';

/**
 * The house of Maḥmúd Khán-i-Kalántar in Ṭihrán, February 1850, where
 * fourteen believers are held after the arrests, and Ṭáhirih on the floor
 * above. After Nabíl's chapter "The Seven Martyrs of Ṭihrán": the Báb's
 * uncle refusing the merchants' ransom; Mírzá Qurbán-ʿAlí, the dervish of
 * Bárfurúsh, who was too ill to reach Ṭabarsí and longed to join Vaḥíd;
 * Ḥájí Mullá Ismáʿíl-i-Qumí and Muḥammad-Ḥusayn-i-Marághiʾí, whom the
 * Kalántar's men thought dumb ("He is mute, but not dumb"). The other three
 * who will not recant are seen, not questioned.
 */

/** The Báb's maternal uncle, who raised Him, refuses the ransom. */
export const martyrsKhal: DialogueTree = {
  id: 'martyrs-khal',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Ḥájí Mírzá Siyyid ʿAlí',
      text: '(The Báb\'s uncle sits against the wall on a thin mat, his green turban set straight, his hands quiet in his lap. He looks up as if you were expected.) You have brought bread. And something else, by your face.',
      choices: [
        { text: '"You knew me once in Shíráz."', next: 'shiraz',
          requires: f => !!f.khalMet || !!f.khalHome },
        { text: '"The merchants of Shíráz have sent me."', next: 'offer' },
      ],
    },
    shiraz: {
      speaker: 'Ḥájí Mírzá Siyyid ʿAlí',
      text: 'I remember. You stood at my door when my Nephew was a prisoner in my own house. (He almost laughs.) Now I am the prisoner, and you are at the door again. God keeps careful accounts.',
      choices: [{ text: '"The merchants have sent me."', next: 'offer' }],
    },
    offer: {
      speaker: 'Ḥájí Mírzá Siyyid ʿAlí',
      text: 'Let me guess. A sum has been raised. The Maliku\'t-Tujjár has spoken for me. One word, and I go home to Shíráz with honour.',
      choices: [{ text: '"Will you say it?"', next: 'answer' }],
    },
    answer: {
      speaker: 'Ḥájí Mírzá Siyyid ʿAlí',
      text: 'If I deny Him, I deny every Messenger before Him: Muḥammad, Jesus, Moses, all of them. Whatever I have read of them, I have watched in Him, from His boyhood to this, the thirtieth year of His life. I raised Him. I know.',
      choices: [{ text: '"Your friends begged you to leave Ṭihrán."', next: 'banquet' }],
    },
    banquet: {
      speaker: 'Ḥájí Mírzá Siyyid ʿAlí',
      text: 'They did, and kindly. I asked them why they feared for me. I would that I too might sit at the banquet the hand of Providence is spreading for His chosen ones.',
      choices: [{ text: '"What shall I tell the merchants?"', next: 'tell' }],
    },
    tell: {
      speaker: 'Ḥájí Mírzá Siyyid ʿAlí',
      onEnter: { set: { martyrsSatWithKhal: true } },
      text: 'Thank them. Tell them I am grateful, and that I will not say it. (He breaks the bread and passes half of it along the wall.) If they bring me before the Amír, I shall ask him one thing only: to let me be the first.',
    },
  },
};

/** Mírzá Qurbán-ʿAlí, the dervish of Bárfurúsh, at his prayers. */
export const martyrsQurban: DialogueTree = {
  id: 'martyrs-qurban',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mírzá Qurbán-ʿAlí',
      text: '(A dervish in a white tunic of the Arab kind and a coarse ʿabá finishes his prayer facing the wall, and turns, unhurried.) Peace be upon you. Forgive me. The hour of prayer does not wait on the Kalántar\'s convenience.',
      choices: [
        { text: '"You keep every prayer, even here?"', next: 'prayers' },
        { text: '"They say half of Ṭihrán knows your name."', next: 'fame' },
      ],
    },
    prayers: {
      speaker: 'Mírzá Qurbán-ʿAlí',
      text: 'He keeps every observance of His Faith, they tell me, to the smallest detail. Am I to neglect what my Leader keeps?',
      choices: [{ text: '"They say half of Ṭihrán knows your name."', next: 'fame' }],
    },
    fame: {
      speaker: 'Mírzá Qurbán-ʿAlí',
      text: 'Fame is a coat that itches. (He shrugs inside the ʿabá.) Since they brought me here, half the court has sent to plead for me. A dervish of Bárfurúsh! Let them plead. I am where I wanted to be, only late.',
      choices: [{ text: '"Late?"', next: 'illness' }],
    },
    illness: {
      speaker: 'Mírzá Qurbán-ʿAlí',
      text: 'When Mullá Ḥusayn raised his standard in Mázindarán I lay sick, and could not go. They drank the cup at Ṭabarsí while I was in my bed. I meant to go south to Vaḥíd and serve under his banner, to make amends. Instead the cup has come to me.',
      choices: [
        { text: '"I was at Ṭabarsí."', next: 'tabarsi', requires: f => !!f.tabarsiComplete },
        { text: '"Your name is Qurbán: sacrifice."', next: 'name' },
      ],
    },
    tabarsi: {
      speaker: 'Mírzá Qurbán-ʿAlí',
      text: '(He takes your hands in both of his.) Then you have stood where I longed to stand. Do not tell me of it. Not now. Only tell me: were they glad, at the end?',
      choices: [{ text: '(Nod.)', next: 'name' }],
    },
    name: {
      speaker: 'Mírzá Qurbán-ʿAlí',
      onEnter: { set: { martyrsSatWithQurban: true } },
      text: 'Qurbán-ʿAlí: a sacrifice for ʿAlí. My mother wrote it without knowing what she wrote. (He smiles.) All names come down from heaven, friend. Mine was written for the Siyyid of Shíráz long before I was born.',
    },
  },
};

/** Ḥájí Mullá Ismáʿíl-i-Qumí and the young man of Marágha who will not speak. */
export const martyrsIsmail: DialogueTree = {
  id: 'martyrs-ismail',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A young man sits against the wall with his knees drawn up, his wrists raw from the cords. Beside him an older mullá is dividing a handful of dried peas: two for himself, two for the young man.',
      choices: [{ text: '(Speak to the young man.)', next: 'silent' }],
    },
    silent: {
      speaker: 'Narrator',
      text: 'He does not look up. He does not answer. The guard by the door laughs. "Save your breath. We have tried everything on that one. He is dumb."',
      choices: [{ text: '(Turn to the mullá.)', next: 'mute' }],
    },
    mute: {
      speaker: 'Ḥájí Mullá Ismáʿíl',
      text: 'He is mute, but not dumb. There is nothing wrong with his tongue. (He leans toward the young man.) Muḥammad-Ḥusayn.',
      choices: [{ text: '(Wait.)', next: 'answered' }],
    },
    answered: {
      speaker: 'Narrator',
      text: 'The young man lifts his head at once and answers, clearly, that he is ready to do whatever his friend wishes. Then he looks at the floor again, and does not say another word.',
      choices: [{ text: '"Who is he?"', next: 'who' }],
    },
    who: {
      speaker: 'Ḥájí Mullá Ismáʿíl',
      text: 'Muḥammad-Ḥusayn of Marágha. I taught him the Cause, and he has decided the Kalántar shall have nothing from him but silence. Not a name, not a street. They have done all they could think of to him.',
      choices: [
        { text: '"I think I saw you at Badasht."', next: 'badasht', requires: f => !!f.badashtComplete },
        { text: '"And you?"', next: 'thirty' },
      ],
    },
    badasht: {
      speaker: 'Ḥájí Mullá Ismáʿíl',
      text: 'You did. They named me Sirru\'l-Vujúd there, the Mystery of Being, which made the young men laugh at an old man of Faráhán. Perhaps you were one of them. (He does not seem to mind.)',
      choices: [{ text: '"And now?"', next: 'thirty' }],
    },
    thirty: {
      speaker: 'Ḥájí Mullá Ismáʿíl',
      onEnter: { set: { martyrsSatWithIsmail: true } },
      text: 'I lay sick when the call came from Ṭabarsí, and when I rose the fort was gone. (He divides the peas again.) Since Karbilá, since I sat at the feet of Siyyid Káẓim, I have waited thirty years for a day worth giving my life to. I was afraid I would carry the wish into the grave.',
    },
  },
};

/** Siyyid Ḥusayn-i-Turshízí, the mujtahid, rehearsing his proofs. */
export const martyrsTurshizi: DialogueTree = {
  id: 'martyrs-turshizi',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Siyyid Ḥusayn of Turshíz, a mujtahid trained for years in Najaf, sits very upright with his lips moving. He is setting out proofs, one after another, as if for an examination.',
      choices: [{ text: '(Listen.)', next: 'asks' }],
    },
    asks: {
      speaker: 'Narrator',
      onEnter: { set: { martyrsSawTurshizi: true } },
      text: 'He has asked his guards for one thing only: that the ʿulamá of Ṭihrán be gathered, so that he may prove the Cause before them and let them judge. He learned the Báb\'s name only lately, on the road from Baghdád, from the merchant who sits at his shoulder.',
    },
  },
};

/** Ḥájí Muḥammad-Taqíy-i-Kirmání, who will not leave his friend's side. */
export const martyrsKirmani: DialogueTree = {
  id: 'martyrs-kirmani',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Ḥájí Muḥammad-Taqí of Kirmán, a merchant with a house of business as far away as Khurásán, sits close against Siyyid Ḥusayn. They met long ago at Káẓimayn and came to the capital together.',
      choices: [{ text: '(Sit a moment.)', next: 'uncle' }],
    },
    uncle: {
      speaker: 'Narrator',
      onEnter: { set: { martyrsSawKirmani: true } },
      text: 'It was the Báb\'s uncle who taught him the Cause in Shíráz, and the uncle who sent for him to come to Ṭihrán. He has not moved from his friend\'s side since they were brought in, and he does not mean to.',
    },
  },
};

/** Siyyid Murtaḍáy-i-Zanjání, whose brother fell at Ṭabarsí. */
export const martyrsMurtada: DialogueTree = {
  id: 'martyrs-murtada',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Siyyid Murtaḍá, a merchant of Zanján, sits near the door where the draught comes in, his cloak pulled round his knees, a green turban on his head.',
      choices: [{ text: '(Sit beside him.)', next: 'brother' }],
    },
    brother: {
      speaker: 'Narrator',
      onEnter: { set: { martyrsSawMurtada: true } },
      text: 'His brother fought beside Mullá Ḥusayn at Ṭabarsí and fell there. He speaks of him often, the guard says, and always as of a man who has gone on ahead to make the road ready.',
    },
  },
};

/** The door to the stair: Ṭáhirih is held on the floor above. */
export const martyrsUpperDoor: DialogueTree = {
  id: 'martyrs-upper-door',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A narrow door, and behind it a stair to the upper floor. A guard sits on the bottom step with his back to it. Lamplight shows under the door at the top.',
      choices: [{ text: '"Who is kept up there?"', next: 'tahirih' }],
    },
    tahirih: {
      speaker: 'Narrator',
      onEnter: { set: { martyrsSawUpperDoor: true } },
      text: 'The guard shrugs. The poet of Qazvín, Ṭáhirih, brought from Núr: the Kalántar keeps her above, and treats her with courtesy, and does not let her go. Fourteen below, one above, and one house holding them all.',
    },
  },
};

export const martyrsHouseDialogues: Record<string, DialogueTree> = {
  [martyrsKhal.id]: martyrsKhal,
  [martyrsQurban.id]: martyrsQurban,
  [martyrsIsmail.id]: martyrsIsmail,
  [martyrsTurshizi.id]: martyrsTurshizi,
  [martyrsKirmani.id]: martyrsKirmani,
  [martyrsMurtada.id]: martyrsMurtada,
  [martyrsUpperDoor.id]: martyrsUpperDoor,
};
