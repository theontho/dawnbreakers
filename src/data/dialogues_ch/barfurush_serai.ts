import type { DialogueTree } from '../../dialogue/types';

/**
 * Bárfurúsh, the caravanserai of the Sabzih-Maydán (Nabíl, EN ch. XIX).
 * At sunset Mullá Ḥusayn asks who will give his life to go up on the roof
 * and sound the call to prayer; three young men go up one after another,
 * and each is shot before the call is finished: the first at its first
 * words, the second at the witness to Muḥammad, the third near its end.
 * Nabíl does not name them here, and neither does the game. Then the gates are
 * opened and the square is cleared, and in the evening ʿAbbás-Qulí Khán
 * of Láríján and Ḥájí Muṣṭafá Khán come on foot to swear on the Qur'án.
 */

/** Mullá Ḥusayn at sunset, asking. */
export const mullaHusaynCall: DialogueTree = {
  id: 'bf-mh-call',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The sun is down behind the roofs. No one in the court has eaten or drunk since dawn. Mullá Ḥusayn gets up from the platform and looks round at them all.',
      choices: [{ text: '(Listen.)', next: 'ask' }],
    },
    ask: {
      speaker: 'Mullá Ḥusayn',
      text: 'Is there one among you who will give his life for his Faith? Let him go up on the roof and sound the call to prayer, so that this town hears it.',
      choices: [{ text: '(Keep still.)', next: 'still' }],
    },
    still: {
      speaker: 'Narrator',
      onEnter: { set: { bfCallAsked: true } },
      text: 'For a moment no one moves. Then a youth by the wall gets up, brushing the dust from his knees, and goes toward the ladder.',
      voice: { voice: 'fear', text: 'Do not stand up. Do not stand up. Let it be someone else.' },
    },
  },
};

/** Mullá Ḥusayn while the call is given. */
export const mullaHusaynWaiting: DialogueTree = {
  id: 'bf-mh-waiting',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn',
      text: '(He does not take his eyes from the roof.) Hold the ladder for them, friend. That is your part tonight.',
    },
  },
};

export const ladderBefore: DialogueTree = {
  id: 'bf-ladder-before',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A ladder of poles and rope, leaning against the arcade, for the roof. Up there the parapet catches the last of the light.',
    },
  },
};

export const ladderFirst: DialogueTree = {
  id: 'bf-ladder-first',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'He sets his foot on the first rung, and you set your weight against the poles so they will not shift. He goes up quickly. At the top he does not look down.',
      choices: [{ text: '(Hold the ladder.)', next: 'call' }],
    },
    call: {
      speaker: 'Narrator',
      text: 'On the roof he turns toward the qiblih and lifts his hands to his ears. Alláh-u-Akbar. His voice goes out over the Sabzih-Maydán, very clear in the evening.',
      choices: [{ text: '(Hold the ladder.)', next: 'shot' }],
    },
    shot: {
      speaker: 'Narrator',
      onEnter: { set: { bfFirstFell: true } },
      text: 'A single shot from across the square. The call stops at its first words. He comes down the slope of the roof toward you much faster than he went up, and you and Riḍá carry him into the shade of the west arcade.',
    },
  },
};

export const ladderSecond: DialogueTree = {
  id: 'bf-ladder-second',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A second youth is already at the foot of the ladder, tightening his sash. He does not wait for anyone to ask him. You put your weight against the poles again.',
      choices: [{ text: '(Hold the ladder.)', next: 'call' }],
    },
    call: {
      speaker: 'Narrator',
      text: 'He stands where the first stood and begins the call again, and gets further: God is most great; I bear witness that there is no god but God; I bear witness that Muḥammad is the Apostle of God.',
      choices: [{ text: '(Hold the ladder.)', next: 'shot' }],
    },
    shot: {
      speaker: 'Narrator',
      onEnter: { set: { bfSecondFell: true } },
      text: 'He falls on those words. You bring him down, and lay him in the arcade beside the first.',
    },
  },
};

export const ladderThird: DialogueTree = {
  id: 'bf-ladder-third',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The third does not look at the two in the arcade. He goes up fast, as if afraid someone might stop him.',
      choices: [{ text: '(Hold the ladder.)', next: 'call' }],
    },
    call: {
      speaker: 'Narrator',
      text: 'He gives the call nearly to its end: the witness, the summons to prayer, the summons to salvation, God is most great. He has reached the last words, there is no god but God, when the shot comes.',
      choices: [{ text: '(Hold the ladder.)', next: 'gate' }],
    },
    gate: {
      speaker: 'Narrator',
      onEnter: { set: { bfThirdFell: true } },
      text: 'Mullá Ḥusayn says nothing. He mounts, has the gates thrown open, and rides out into the square with the companions behind him, and the men on the roofs and in the square scatter before them. You stay with the three in the arcade. By the time the evening star is out, the Sabzih-Maydán is empty.',
    },
  },
};

export const ladderAfter: DialogueTree = {
  id: 'bf-ladder-after',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The ladder still leans against the arcade. No one has taken it down, and no one has gone up.',
    },
  },
};

/** The first youth, before the call is asked for. */
export const youth: DialogueTree = {
  id: 'bf-youth',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Youth by the Wall',
      text: '(He sits against the wall with his eyes shut and his lips moving.) I am not asleep. I am practising. In our village I gave the call to prayer from the roof of the masjid every morning, since my voice broke. Here no one has given it all day.',
      choices: [{ text: '"Would you give it here?"', next: 'here' }],
    },
    here: {
      speaker: 'A Youth by the Wall',
      onEnter: { set: { bfMetYouth: true } },
      text: 'If I am asked. (He opens his eyes.) My mother says my voice is the only thing about me worth anything. I would like it to be worth something here.',
    },
  },
};

/** The first youth, going to the ladder. */
export const youthReady: DialogueTree = {
  id: 'bf-youth-ready',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Youth by the Wall',
      onEnter: { set: { bfMetYouth: true } },
      text: 'Hold the ladder for me, will you? My hands are shaking, and I do not want them to see.',
    },
  },
};

/** The three, laid in the arcade. */
export const fallenFirst: DialogueTree = {
  id: 'bf-fallen-first',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The one who gave the call in his village every morning since his voice broke. Someone has folded his hands on his chest and drawn his cloak up over his face.',
      choices: [{ text: '(Sit with him a while.)', next: 'sit' }],
    },
    sit: {
      speaker: 'Narrator',
      onEnter: { set: { bfSatWithFirst: true, bfSatWithFallen: true } },
      text: 'You never asked his name. You sit with him until the court is dark, and the words he did not finish go round and round in you.',
    },
  },
};

export const fallenSecond: DialogueTree = {
  id: 'bf-fallen-second',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The second, who tightened his sash at the foot of the ladder and did not wait to be asked. His sandals are still on the platform where he left them.',
      choices: [{ text: '(Sit with him a while.)', next: 'sit' }],
    },
    sit: {
      speaker: 'Narrator',
      onEnter: { set: { bfSatWithSecond: true, bfSatWithFallen: true } },
      text: 'You set his sandals side by side at his feet. It is the only thing left to do for him, so you do it carefully.',
    },
  },
};

export const fallenThird: DialogueTree = {
  id: 'bf-fallen-third',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The third, who all but finished. There is no god but God: he was saying it when he fell, and it is the last thing anyone heard from the roof.',
      choices: [{ text: '(Sit with him a while.)', next: 'sit' }],
    },
    sit: {
      speaker: 'Narrator',
      onEnter: { set: { bfSatWithThird: true, bfSatWithFallen: true } },
      text: 'You find you are saying it yourself, under your breath, to the end, for him.',
    },
  },
};

/** Mullá Ḥusayn in the evening, beside the three. */
export const mullaHusaynEvening: DialogueTree = {
  id: 'bf-mh-evening',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn',
      text: '(He sits with his back against the arcade, near the three, his sword across his knees.) I asked, and three answered. Remember their voices, friend. Remember that they finished the call between them.',
      choices: [{ text: '"The Kháns are waiting for you."', next: 'khans' }],
    },
    khans: {
      speaker: 'Mullá Ḥusayn',
      text: 'Let them drink their tea. (He gets up.) Go and hear what they have come to say. I will come when they have said it.',
    },
  },
};

/** Riḍá in the court, by day and at sunset. */
export const ridaSerai: DialogueTree = {
  id: 'bf-rida-serai',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Young Companion',
      text: 'No bread? (He pats his sash.) I still have my mother\'s. Not yet. Not until someone needs it more than I do. Today everybody needs it the same, so nobody gets it.',
    },
  },
};

/** Riḍá in the evening. */
export const ridaNight: DialogueTree = {
  id: 'bf-rida-night',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Young Companion',
      text: 'I held the foot of the ladder with you. I think I will be holding it in my sleep. (He looks at the three under their cloaks.) I did not know any of them. Is that worse, or better?',
      choices: [{ text: '"I do not know."', next: 'end' }],
    },
    end: {
      speaker: 'A Young Companion',
      onEnter: { set: { bfRidaEvening: true } },
      text: 'Nor do I. (He sits down beside you.) I am going to learn all their names, someday, from someone. And then I will know.',
    },
  },
};

/** ʿAbbás-Qulí Khán of Láríján, with the oath. */
export const abbasQuli: DialogueTree = {
  id: 'bf-abbas-quli',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Two Kháns have come on foot across the empty square, with their servants and a Qur\'án wrapped in silk: ʿAbbás-Qulí Khán of Láríján, broad and soft-spoken, and Ḥájí Muṣṭafá Khán. Mullá Ḥusayn has had tea brought for them, and sat down with them.',
      choices: [{ text: '(Listen.)', next: 'plea' }],
    },
    plea: {
      speaker: 'ʿAbbás-Qulí Khán',
      text: 'We want only peace. All of this is the doing of the Saʿídu\'l-ʿUlamá, and his alone. Let what is past be past. But the town is a pot left on the fire; tomorrow, for your own sakes, go on toward Ámul.',
      choices: [{ text: '(Watch Mullá Ḥusayn.)', next: 'mh' }],
    },
    mh: {
      speaker: 'Mullá Ḥusayn',
      text: '(He looks at the Khán over his tea for a while, as if reading something written very small.) What your tongues say and what your hearts hold may not be one thing. God knows which. I accept.',
      choices: [{ text: '(Listen.)', next: 'oath' }],
    },
    oath: {
      speaker: 'ʿAbbás-Qulí Khán',
      text: '(He unwraps the Qur\'án and lays his hand on it, and Ḥájí Muṣṭafá Khán lays his beside it.) By this Book: tonight you are our guests, and tomorrow Khusraw of Qádí-Kalá and a hundred horsemen will take you safe through Shír-Gáh. If we do you any harm, may the curse of God fall on us.',
      choices: [{ text: '(Listen.)', next: 'fast' }],
    },
    fast: {
      speaker: 'Narrator',
      text: 'It is Friday. No one in the caravanserai has eaten or drunk since dawn; the crowd outside kept even the tea from their lips. Now Mullá Ḥusayn tells them to break their fast.',
      choices: [{ text: '(Eat, a little.)', next: 'night' }],
    },
    night: {
      speaker: 'Narrator',
      onEnter: { set: { bfOathSworn: true } },
      text: 'Four hours after sunset he sits down to supper with the two Kháns, host and guests. You sleep against the arcade near the three, with your cloak over your knees. Once in the night you wake and hear horsemen crossing the square, and then nothing, and then it is grey morning.',
    },
  },
};

/** Ḥájí Muṣṭafá Khán, who keeps looking at the three. */
export const mustafaKhan: DialogueTree = {
  id: 'bf-mustafa-khan',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Ḥájí Muṣṭafá Khán',
      text: '(An older man, his beard hennaed, who keeps glancing at the three under their cloaks.) I did not want this. I want you to know that. I have sons the age of those boys.',
      choices: [{ text: '"Then keep your oath."', next: 'oath' }],
    },
    oath: {
      speaker: 'Ḥájí Muṣṭafá Khán',
      onEnter: { set: { bfMetMustafa: true } },
      text: '(He touches the silk round the Qur\'án in his servant\'s arms.) God hear me, I mean to. Whether it is mine to keep, in this town, God knows better than I.',
    },
  },
};

export const barfurushSeraiDialogues: Record<string, DialogueTree> = {
  [mullaHusaynCall.id]: mullaHusaynCall,
  [mullaHusaynWaiting.id]: mullaHusaynWaiting,
  [ladderBefore.id]: ladderBefore,
  [ladderFirst.id]: ladderFirst,
  [ladderSecond.id]: ladderSecond,
  [ladderThird.id]: ladderThird,
  [ladderAfter.id]: ladderAfter,
  [youth.id]: youth,
  [youthReady.id]: youthReady,
  [fallenFirst.id]: fallenFirst,
  [fallenSecond.id]: fallenSecond,
  [fallenThird.id]: fallenThird,
  [mullaHusaynEvening.id]: mullaHusaynEvening,
  [ridaSerai.id]: ridaSerai,
  [ridaNight.id]: ridaNight,
  [abbasQuli.id]: abbasQuli,
  [mustafaKhan.id]: mustafaKhan,
};
