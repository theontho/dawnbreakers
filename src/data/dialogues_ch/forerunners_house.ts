import type { DialogueTree } from '../../dialogue/types';

/**
 * Siyyid Káẓim's teaching room in Karbilá (Nabíl, chapters I and II): his
 * last lessons, the old copyist who saw a ray of light fall on a visitor's
 * lap, the elder student who will stay; and after the death, the empty
 * place, and the students who stay and who go.
 */

/** The lesson: Shaykh Aḥmad, the One who is near, and the charge to scatter. */
export const lesson: DialogueTree = {
  id: 'fr-kazim-lesson',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The room is full to the walls: turbans, bowed heads, the scratch of pens. At its head, under the lamp, Siyyid Káẓim stops speaking as you come in, and with two fingers motions you to a place near him.',
      choices: [{ text: '(Sit where he shows you.)', next: 'sit' }],
    },
    sit: {
      speaker: 'Siyyid Káẓim',
      text: 'Sit, sit. There is always room near the lamp for the late. (A ripple of laughter.) We were speaking of my master, Shaykh Aḥmad, and of what he went about the world to say.',
      choices: [
        { text: '"Tell us of Shaykh Aḥmad, master."', next: 'ahmad' },
        { text: '"What did he go about the world to say?"', next: 'near' },
      ],
    },
    ahmad: {
      speaker: 'Siyyid Káẓim',
      text: 'He came out of Aḥsá in Arabia, to Najaf and Karbilá, then into Persia, city after city, and everywhere he said: make ready, the Day is near. Princes honoured him and divines cursed him. He died on the road, near Medina. He was the first to wake. I have only kept his lamp lit.',
      choices: [{ text: '"And the Day he spoke of?"', next: 'near' }],
    },
    near: {
      speaker: 'Siyyid Káẓim',
      text: 'He whom you await is nearer than you think. He lives among you, and you do not know Him. He is of the line of the Prophet; He is young; and what He knows He did not learn from men like me.',
      choices: [
        { text: '"How shall we know Him, master?"', next: 'know' },
        { text: '"Then why do you speak of leaving us?"', next: 'leave' },
      ],
    },
    know: {
      speaker: 'Siyyid Káẓim',
      text: 'Not by my telling you. If I described Him, you would look for my description and pass Him in the street. Purify your hearts, and pray, and you will know Him by Himself.',
      choices: [{ text: '"And you, master? Why speak of leaving?"', next: 'leave' }],
    },
    leave: {
      speaker: 'Siyyid Káẓim',
      text: 'Every lamp is lit for one night. (He looks round the room, at each face.) When I am gone, do not linger by my side, nor sit in this house waiting for a new master. Scatter. Leave your comforts. Seek Him, and do not rest until you find Him.',
      choices: [{ text: '(Bow your head.)', next: 'end' }],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { frHeardLesson: true } },
      text: 'The lesson ends with prayers. As the students rise, the Siyyid says he will ride north tomorrow on pilgrimage to the shrines of Kázimayn, and that any who wish may ride with him. His eyes rest on you as he says it. The party gathers where the lane meets the north road.',
    },
  },
};

/** Siyyid Káẓim after the lesson. */
export const kazimAfter: DialogueTree = {
  id: 'fr-kazim-after',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Siyyid Káẓim',
      text: 'You will ride with us to Kázimayn? Good. (He is gathering his papers with careful hands.) The road runs north, past Baráthá. We will rest there at noon. Go and make ready.',
    },
  },
};

/** The old copyist, before the death: the ray of light. */
export const copyist: DialogueTree = {
  id: 'fr-copyist',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Copyist',
      text: '(An old man with ink to the second knuckle is ruling lines on a sheet.) Since he came to Karbilá I have copied the Siyyid\'s words. Shall I tell you the one time I saw him lose them?',
      choices: [{ text: '"Please."', next: 'ray' }],
    },
    ray: {
      speaker: 'The Copyist',
      text: 'Two winters ago, perhaps more. A young Siyyid came in, a merchant from Shíráz by his dress, and sat by the door. The master stopped in the middle of a sentence, and could not go on. We waited. He said nothing.',
      choices: [{ text: '"What happened?"', next: 'light' }],
    },
    light: {
      speaker: 'The Copyist',
      text: 'Someone begged him to continue. He said: what more can I say? The truth is plainer than that ray of light which has fallen on that lap. And there was a ray of sun, through the high window, lying across the young man\'s knees.',
      choices: [{ text: '"Who was he?"', next: 'who' }],
    },
    who: {
      speaker: 'The Copyist',
      onEnter: { set: { frHeardRay: true } },
      text: 'He left before the prayers, and I never learned his name. (He dips his pen.) None of us understood. I have thought about it every winter since, when the sun comes in low through that window.',
    },
  },
};

/** The elder student, before the death: caution. */
export const elder: DialogueTree = {
  id: 'fr-elder',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'An Elder Student',
      text: '(A grave man of forty, who was studying here before your beard grew.) You are young. Let me give you some advice. The master speaks in signs and in allusions. Do not take every word to the letter, as the young ones do.',
      choices: [
        { text: '"He seems to mean it to the letter."', next: 'letter' },
        { text: '"What do you take it to mean?"', next: 'mean' },
      ],
    },
    letter: {
      speaker: 'An Elder Student',
      text: 'He means it, certainly. But how many years has he said it? Twenty? Patience is also a virtue. The divines of Karbilá call us heretics already. If every student ran off at a word, who would keep the school?',
      choices: [{ text: '"Who is keeping it now, with Mullá Ḥusayn away?"', next: 'husayn' }],
    },
    mean: {
      speaker: 'An Elder Student',
      text: 'That the Day is near, as it has always been near. That we must be learned and pious and ready. That is enough to be going on with.',
      choices: [{ text: '"Mullá Ḥusayn would say it is not enough."', next: 'husayn' }],
    },
    husayn: {
      speaker: 'An Elder Student',
      onEnter: { set: { frMetElder: true } },
      text: 'Mullá Ḥusayn of Bushrúyih. (A small, unwilling smile.) The best mind in this room, and the most impatient. The master sent him to Iṣfahán to face the great mujtahid there, and on to Mashhad. He will come back with half of Persia\'s divines won over, and still not be content.',
    },
  },
};

/** After the death: the copyist beside the empty place. */
export const emptyPlace: DialogueTree = {
  id: 'fr-empty-place',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'His cushion is where it always was, under the lamp, and no one sits on it. His books are stacked beside it, with a reed pen laid across the top one. The copyist sits a little way off, not writing.',
      choices: [{ text: '(Sit with the copyist.)', next: 'sit' }],
    },
    sit: {
      speaker: 'The Copyist',
      text: 'At the end he could not lift his head, and still he asked who had come, and sent them away. Go, he told them. Why are you here? Go. (His hands lie still in his lap.) I was the only one he let stay, because someone had to write it down.',
      choices: [
        { text: '"What did he say last?"', next: 'last' },
        { text: '(Say nothing, and stay.)', next: 'stay' },
      ],
    },
    last: {
      speaker: 'The Copyist',
      text: 'I will not tell you his last words. They were for God. The last thing he said to us was what he had said all winter: do not linger. (He looks at the cushion.) And here we all are.',
      choices: [{ text: '(Stay a while.)', next: 'stay' }],
    },
    stay: {
      speaker: 'Narrator',
      onEnter: { set: { frSatAtEmptyPlace: true } },
      text: 'You sit with the old man until the lamp needs oil. The light comes low through the high window and lies on the floor across the empty cushion, and neither of you says anything about it.',
    },
  },
};

/** After the death: the elder student will stay. */
export const elderMourning: DialogueTree = {
  id: 'fr-elder-mourning',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'An Elder Student',
      text: 'Someone must keep this house, and the books, and the students who have nowhere else to go. Letters come already from men who say the master\'s mantle is theirs. Someone must be here to answer them.',
      choices: [
        { text: '"He told us not to stay."', next: 'told' },
        { text: '"Will you choose one of them?"', next: 'choose' },
      ],
    },
    told: {
      speaker: 'An Elder Student',
      text: 'He told us many things. (He will not meet your eyes.) A man of my years cannot go wandering the roads of Persia looking into every young face. If the Promised One appears, the world will hear of it. I will hear of it here.',
      choices: [{ text: '(Leave him to his books.)', next: 'end' }],
    },
    choose: {
      speaker: 'An Elder Student',
      text: 'I will wait and see who is worthy. That is prudence, not faithlessness. (A pause.) Do not look at me so. You are young. Go, if you must. I will keep his door.',
      choices: [{ text: '(Leave him to his books.)', next: 'end' }],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { frHeardStayers: true } },
      text: 'He turns back to the page. Around the room, more than half the students are still here, a month after the master told them to go.',
    },
  },
};

/** After the death: the student from Khurásán, packing. */
export const seekerMourning: DialogueTree = {
  id: 'fr-seeker-mourning',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Student from Khurásán',
      text: '(He is tying his books into a bundle with a cord, too tight.) I am going. He said scatter, so I am scattering. I do not know where to. East, I think. Home, and then wherever the road goes.',
      choices: [
        { text: '"Alone?"', next: 'alone' },
        { text: '"Wait for Mullá Ḥusayn. He will know what to do."', next: 'wait' },
      ],
    },
    alone: {
      speaker: 'A Student from Khurásán',
      text: 'Is there another way to look? He said He would not be found by a crowd of us walking behind a new master. (He pulls the knot.) Pray for me. I will pray for you.',
      choices: [{ text: '"Go with God."', next: 'end' }],
    },
    wait: {
      speaker: 'A Student from Khurásán',
      text: 'Mullá Ḥusayn will do what the Siyyid told him, as he always has. You wait for him. You are steadier than I am. (He shoulders the bundle.) If either of us finds Him, the other will hear.',
      choices: [{ text: '"Go with God."', next: 'end' }],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { frHeardSeeker: true } },
      text: 'He goes out without looking back. Afterwards you notice that he left his good pen-case on the carpet, and you put it aside for him, though you know he will not come back for it.',
    },
  },
};

export const forerunnersHouseDialogues: Record<string, DialogueTree> = {
  [lesson.id]: lesson,
  [kazimAfter.id]: kazimAfter,
  [copyist.id]: copyist,
  [elder.id]: elder,
  [emptyPlace.id]: emptyPlace,
  [elderMourning.id]: elderMourning,
  [seekerMourning.id]: seekerMourning,
};
