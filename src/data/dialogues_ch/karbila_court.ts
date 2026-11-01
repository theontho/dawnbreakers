import type { DialogueTree } from '../../dialogue/types';

/**
 * Karbilá, 1851: the square before the gate of the shrine of the Imám
 * Ḥusayn (Nabíl, chapter XXV). Shaykh Ḥasan-i-Zunúzí, who copied the Báb's
 * verses at Mákú and was told by Him to go to Karbilá and wait, keeps his
 * place by the gate; an old servant of the shrine remembers Siyyid Káẓim's
 * burial; a seller of turbah and an old classmate of the player's.
 */

/** Shaykh Ḥasan in summer, waiting by the gate. */
export const hasan: DialogueTree = {
  id: 'kr-hasan',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Shaykh Ḥasan',
      text: '(A spare man in a scholar\'s turban sits on the warm paving beside the gate, a writing-case on his knees, watching everyone who passes in.) Peace be with you, friend. You have the look of someone who has walked a long way to get home.',
      choices: [
        { text: '"From Zanján. Before that, from this very square."', next: 'home' },
        { text: '"Shaykh Ḥasan of Zunúz? We camped near Kulayn, the spring the Báb was taken north."', next: 'kulayn', requires: f => !!f.kulaynComplete },
      ],
    },
    kulayn: {
      speaker: 'Shaykh Ḥasan',
      text: '(He looks at you a long time, then smiles.) Under the almond trees, with the officer pretending not to count us. Yes. I followed Him on to Ádhirbáyján after that, as far as they would let me.',
      choices: [{ text: '"And how do you come to be here?"', next: 'maku' }],
    },
    home: {
      speaker: 'Shaykh Ḥasan',
      text: 'Zanján. (He closes his eyes a moment.) We heard. God have mercy on Ḥujjat and all of them. I am Ḥasan of Zunúz. I was a copyist once, at Mákú, when the mountain still had Him for its prisoner.',
      choices: [{ text: '"And how do you come to be here?"', next: 'maku' }],
    },
    maku: {
      speaker: 'Shaykh Ḥasan',
      text: 'He sent me. Before they moved Him to Chihríq He told me to go to Karbilá and stay. He said that I would behold, with my own eyes, the face of the promised Ḥusayn.',
      choices: [{ text: '"The promised Ḥusayn?"', next: 'husayn' }],
    },
    husayn: {
      speaker: 'Shaykh Ḥasan',
      text: 'The one who returns, the traditions say, after the Qá\'im. I did not ask Him to explain. So I came, and I copy prayers for the pilgrims for my bread, and every day I sit by this gate and look at faces.',
      choices: [
        { text: '"For three years?"', next: 'years' },
        { text: '"The Báb is gone. Do you still wait?"', next: 'still' },
      ],
    },
    years: {
      speaker: 'Shaykh Ḥasan',
      text: 'Three years, and the news of Tabríz in the middle of them. (He turns the pen-case over in his hands.) A man can wait a long time on a single sentence, if he trusts the one who said it.',
      choices: [{ text: '(Sit with him a while.)', next: 'sit' }],
    },
    still: {
      speaker: 'Shaykh Ḥasan',
      text: 'He did not tell me to wait for Him. He told me to wait for what I would see. (He looks up at the gilded dome.) So I wait.',
      choices: [{ text: '(Sit with him a while.)', next: 'sit' }],
    },
    sit: {
      speaker: 'Narrator',
      onEnter: { set: { krMetHasan: true } },
      text: 'Pilgrims go in under the tiled arch in their hundreds: Persians in felt hats, Arabs of the tribes, Indians, Turks, a widow carrying a child on her hip. Shaykh Ḥasan looks into every face, kindly, and lets each one go.',
    },
  },
};

/** Shaykh Ḥasan before the day of ʿArafih, once met. */
export const hasanWaiting: DialogueTree = {
  id: 'kr-hasan-waiting',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Shaykh Ḥasan',
      text: 'Go about the town, friend. Drink from the canal, pray at your teacher\'s grave, see who is new in the lanes. Then come and sit with me again. The day of ʿArafih is coming; the whole world comes to this gate on that day.',
    },
  },
};

/** The day of ʿArafih: Shaykh Ḥasan goes to the gate and comes back. */
export const hasanArafih: DialogueTree = {
  id: 'kr-hasan-arafih',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'It is the day of ʿArafih, in the autumn of 1851. The square is so full that the pigeons have given up the paving to the feet. Shaykh Ḥasan makes room for you beside him, and for a long time neither of you speaks.',
      choices: [{ text: '(Wait beside him.)', next: 'rise' }],
    },
    rise: {
      speaker: 'Narrator',
      text: 'Then he is on his feet. He goes toward the gate of the inner court without a word, his writing-case left open on the stones, and the crowd closes behind him.',
      choices: [{ text: '(Keep his place, and his writing-case.)', next: 'back' }],
    },
    back: {
      speaker: 'Narrator',
      text: 'The shadow of the minaret crosses the square. When he comes back he walks slowly, like a man carrying a full bowl. He sits down. His hands are shaking.',
      choices: [
        { text: '"What did you see?"', next: 'saw' },
        { text: '(Say nothing. Wait.)', next: 'saw' },
      ],
    },
    saw: {
      speaker: 'Shaykh Ḥasan',
      text: 'What I was told I would see. (His voice is very low.) I saw a face by the gate, and I knew it. He took my hand, and we walked together a little way, through the market, to a door in a lane. I will tell you that much. You would see the door for yourself.',
      choices: [
        { text: '"The nobleman of Núr? Jináb-i-Bahá?"', next: 'secret' },
        { text: '"Tell me the rest."', next: 'secret' },
      ],
    },
    secret: {
      speaker: 'Shaykh Ḥasan',
      text: '(He lays a finger on his lips.) I have been asked to keep it, and I will keep it. Its hour has not come. Do not ask me again, friend, because I love you and I would not like to refuse you twice.',
      choices: [
        { text: '"Then I will not ask. At a door in Shíráz I learned that some things are told in their own hour."', next: 'close', requires: f => f.recognised === true },
        { text: '"I asked for time once, at a door in Shíráz. I think I am still asking. I will not ask you."', next: 'close', requires: f => f.recognised === false },
        { text: '"Then I will not ask."', next: 'close', requires: f => f.recognised !== true && f.recognised !== false },
      ],
    },
    close: {
      speaker: 'Narrator',
      onEnter: { set: { krHasanSaw: true } },
      text: 'He gathers his pens back into their case, one by one, as if they were new to him. Above you the gold of the dome takes the late sun. Nothing in the square has changed, and the square is not the same.',
    },
  },
};

/** Shaykh Ḥasan through the winter. */
export const hasanWinter: DialogueTree = {
  id: 'kr-hasan-winter',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Shaykh Ḥasan',
      text: 'I still sit here. Habit, perhaps, or gratitude. (He nods east, toward the lanes.) Go and see who comes and goes at that door. The ones the storm scattered are finding their way to it, one by one, and no one has called them.',
      choices: [
        { text: '"Is it hard, keeping it?"', next: 'hard' },
        { text: '(Leave him to his watching.)' },
      ],
    },
    hard: {
      speaker: 'Shaykh Ḥasan',
      text: 'It is like carrying a lamp under your cloak. You are warm, and you must not let anyone see why. (He smiles.) It is not hard. It is the easiest thing I have ever done.',
    },
  },
};

/** In spring, before the player has seen the house shut. */
export const hasanSpringWait: DialogueTree = {
  id: 'kr-hasan-spring-wait',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Shaykh Ḥasan',
      text: '(He is not looking at the faces any more. He is looking east, toward the lanes.) Have you been to the house this morning? Go, friend, and then come back and sit with me.',
    },
  },
};

/** Spring 1852: the house is shut, and the chapter closes at the gate. */
export const hasanSpring: DialogueTree = {
  id: 'kr-hasan-spring',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Shaykh Ḥasan',
      text: 'So you have seen the door. (He makes room for you on the paving.) He has gone back to Ṭihrán. The new vizier wrote, and He went, though everyone told Him the capital was no place for a Bábí now.',
      choices: [
        { text: '"Are you afraid for Him?"', next: 'afraid' },
        { text: '"What will you do now?"', next: 'now' },
      ],
    },
    afraid: {
      speaker: 'Shaykh Ḥasan',
      text: 'Yes. (He says it simply.) But I have seen what I have seen. A man who has seen the first grey over the hills does not argue with the dark about whether the sun will come.',
      choices: [{ text: '"What will you do now?"', next: 'now' }],
    },
    now: {
      speaker: 'Shaykh Ḥasan',
      text: 'Copy prayers for pilgrims. Sit by this gate. Keep what I was given to keep. And you, friend? I think the road is in your face again.',
      choices: [
        { text: '"Ṭihrán. Wherever He is, that is where the story is."', next: 'end' },
        { text: '"I do not know yet. Somewhere I am needed."', next: 'end' },
      ],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { karbilaComplete: true } },
      text: 'Shaykh Ḥasan kept what he had seen, as he had been asked. In the summer of 1852 Bahá\'u\'lláh was in the hills near Ṭihrán when two young Bábís fired on the Sháh, and the storm broke over every believer in Persia. Within weeks He was in chains in a pit beneath the capital, where the dawn Shaykh Ḥasan had glimpsed by this gate would break unseen.',
    },
  },
};

/** The old servant of the shrine, at the gate. */
export const servant: DialogueTree = {
  id: 'kr-servant',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Keeper of the Shrine',
      text: '(An old man in a green sash sweeps the threshold of the gate with a broom of palm-rib, as he has every morning for forty years.) Shoes off at the step, pilgrim. Ah. (He peers at you.) I know that face. One of the late Siyyid\'s Persians.',
      choices: [
        { text: '"You remember us?"', next: 'remember' },
        { text: '"Who is the man who sits by the gate?"', next: 'hasan' },
      ],
    },
    remember: {
      speaker: 'A Keeper of the Shrine',
      text: 'Who could forget? You filled his house to the doors. And when he died, that winter, you carried him in here weeping like children. He lies inside, near the Imám, as he wished. Go and greet him. He would like to know one of you came back.',
      choices: [
        { text: '"Most of us did not."', next: 'gone' },
        { text: '"Who is the man who sits by the gate?"', next: 'hasan' },
      ],
    },
    gone: {
      speaker: 'A Keeper of the Shrine',
      text: '(He stops sweeping.) No. I heard about the tall one from Khurásán, Mullá Ḥusayn, who used to pray there by the pillar till the lamps were put out. God gave him a hard road and a good end. I have swept this step a long time, pilgrim. Everybody\'s road comes back through here.',
      choices: [{ text: '"Who is the man who sits by the gate?"', next: 'hasan' }],
    },
    hasan: {
      speaker: 'A Keeper of the Shrine',
      onEnter: { set: { krMetServant: true } },
      text: 'Shaykh Ḥasan? He has sat there three years. He says he is waiting for someone. I have stopped asking whom; he only smiles. A good copyist. Cheap, too.',
    },
  },
};

/** The gate of the shrine: the player goes in to pray and to greet the teacher's grave. */
export const gate: DialogueTree = {
  id: 'kr-shrine-gate',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The gate of the shrine: a tall arch of blue tile over a door of worn wood, its crest gilded. Through it pilgrims come and go between the glare of the square and the cool beyond.',
      choices: [
        { text: '(Go in to pray, and to greet your teacher\'s grave.)', next: 'in' },
        { text: '(Not yet.)' },
      ],
    },
    in: {
      speaker: 'Narrator',
      onEnter: { set: { krVisitedGrave: true } },
      text: 'You pray where you prayed as a student. Afterward you find Siyyid Káẓim\'s resting-place and stand by it a long time. Eight years ago he told you to scatter and seek. You came home with dust from Shíráz and Mákú and Zanján on your shoes, and nothing at all to say that he did not already know.',
    },
  },
};

/** The same gate on later visits. */
export const gateAgain: DialogueTree = {
  id: 'kr-shrine-gate-again',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Pilgrims pass in and out under the tiled arch, between the glare of the square and the cool within. You have greeted your teacher already.',
      choices: [
        { text: '(Look through the arch, toward the inner court.)', next: 'place', requires: f => !!f.krHasanSaw },
        { text: '(Watch the pilgrims a while.)', next: 'pilgrims', requires: f => !f.krHasanSaw },
      ],
    },
    place: {
      speaker: 'Narrator',
      text: 'Somewhere beyond this arch, by the gate of the inner court, is a place on the stones where the crowd parts, with no mark of anything on it at all. Only Shaykh Ḥasan glances that way, sometimes, the way a man looks at a window where a lamp once burned.',
    },
    pilgrims: {
      speaker: 'Narrator',
      text: 'An Indian family, barefoot, the father carrying the grandmother on his back. Two Arab boys racing each other to the step and being cuffed by the keeper. A Persian merchant weeping without shame. Everyone\'s road comes back through here, the keeper says.',
    },
  },
};

/** The seller of turbah tablets on the square. */
export const turbah: DialogueTree = {
  id: 'kr-turbah',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Turbah-Seller',
      text: 'Turbah, pilgrim! Clay of Karbilá, from the very ground of the Imám, pressed and dried in the sun. Rest your forehead on it in prayer and you pray in Karbilá wherever you are. Two for a copper. Beads, too.',
      choices: [
        { text: '(Buy two tablets.)', next: 'buy' },
        { text: '"Business is good?"', next: 'business' },
      ],
    },
    buy: {
      speaker: 'A Turbah-Seller',
      onEnter: { set: { krBoughtTurbah: true } },
      text: 'God accept it. (He wraps them in a twist of cloth.) Take them home. There is not a village in Persia that does not have a little of this square in it.',
      choices: [{ text: '"Business is good?"', next: 'business' }],
    },
    business: {
      speaker: 'A Turbah-Seller',
      text: 'Pilgrims come, pilgrims go. This summer, more Persians than ever, and quieter ones. They all ask the way to the same lane, east of the square. A gentleman from Ṭihrán has taken a house there. I have started telling them the way before they ask.',
    },
  },
};

export const karbilaCourtDialogues: Record<string, DialogueTree> = {
  [hasan.id]: hasan,
  [hasanWaiting.id]: hasanWaiting,
  [hasanArafih.id]: hasanArafih,
  [hasanWinter.id]: hasanWinter,
  [hasanSpringWait.id]: hasanSpringWait,
  [hasanSpring.id]: hasanSpring,
  [servant.id]: servant,
  [gate.id]: gate,
  [gateAgain.id]: gateAgain,
  [turbah.id]: turbah,
};
