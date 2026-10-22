import type { DialogueTree } from '../../dialogue/types';

/**
 * Mákú, the "Open Mountain", winter 1847 to spring 1848. The Báb is never a
 * speaker: He is reached through the barred window, the pages in His
 * amanuensis's room, and the testimony of the warden, the guards, the town,
 * and Mullá Ḥusayn.
 */

export const ch6MakuWoman: DialogueTree = {
  id: 'ch6-maku-woman',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Woman of Mákú',
      text: 'You are climbing to the fortress? Then you are one of His pilgrims. (She shifts a water jar on her hip.) Every morning, before the fields, we stand here and look up at those walls.',
      choices: [
        { text: '"Why do you look up?"', next: 'why' },
        { text: '"Do you know who is held there?"', next: 'who' },
      ],
    },
    why: {
      speaker: 'A Woman of Mákú',
      text: 'My husband says it is foolishness. Then he does it too. When the voice carries down at dawn, chanting, the whole town goes still. Even the dogs. We go to work afterward a little lighter.',
      choices: [{ text: '(Listen with her.)', next: 'oath' }],
    },
    who: {
      speaker: 'A Woman of Mákú',
      text: 'A Siyyid from Shíráz. The Sháh\'s minister sent Him here to be forgotten, at the very edge of the kingdom, where the Russians and the Turks can see our rooftops. (She laughs.) Forgotten!',
      choices: [{ text: '"Why do you laugh?"', next: 'oath' }],
    },
    oath: {
      speaker: 'A Woman of Mákú',
      onEnter: { set: { ch6HeardVillagers: true } },
      text: 'When a man in our bazaar wants to be believed now, he swears by the Holy One on the mountain. Nobody cheats after that. You see? The minister sent us a Prisoner, and we got honest weights.',
      choices: [{ text: '(Smile, and look up at the walls beside her.)' }],
    },
  },
};

export const ch6FortressGuard: DialogueTree = {
  id: 'ch6-fortress-guard',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Fortress Guard',
      text: 'Stamp your feet, pilgrim, or you will lose your toes. Nine of us guard one Siyyid who has never once tried the gate.',
      choices: [
        { text: '"Was it always this quiet here?"', next: 'first' },
        { text: '"What are your orders?"', next: 'orders' },
      ],
    },
    first: {
      speaker: 'A Fortress Guard',
      text: 'The first nights the Khán\'s orders were iron. No visitors. No lamp after dark. I stood under that window and there was not a glimmer inside. And still I heard Him praying, as if the dark were a garden.',
      choices: [{ text: '"And now?"', next: 'lamp' }],
    },
    orders: {
      speaker: 'A Fortress Guard',
      text: 'They come from Ṭihrán, from the Grand Vizier himself: keep Him from the people. (He nods down at the town.) Look. The people come anyway. Orders do not climb mountains as well as pilgrims do.',
      choices: [{ text: '"Has anything changed?"', next: 'lamp' }],
    },
    lamp: {
      speaker: 'A Fortress Guard',
      onEnter: { set: { ch6GuardLamp: true } },
      text: 'Now there is oil enough, and the Khán climbs up himself to sit by the door. I do not know what changed him. I only know I have stopped being ashamed of my own post.',
      choices: [{ text: '(Warm your hands at the brazier beside him.)' }],
    },
  },
};

export const ch6WardenSoftens: DialogueTree = {
  id: 'ch6-warden-softens',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'ʿAlí Khán, Warden of Mákú',
      text: 'Halt. You have climbed a long way to be turned back. The Grand Vizier\'s order is plain: few may approach the Prisoner. These mountains keep silence better than men do.',
      choices: [
        { text: '"I bring no disturbance, only reverence for one unjustly confined."', next: 'soften',
          effect: { set: { ch6SpokeGently: true } } },
        { text: '"Can stone walls imprison a voice that has already crossed Persia?"', next: 'tested',
          effect: { set: { ch6ChallengedWarden: true } } },
        { text: '"Once I kept watch outside His door in Shíráz, the night it all began."', next: 'shiraz',
          requires: f => !!f.vigilKept },
      ],
    },
    soften: {
      speaker: 'ʿAlí Khán',
      text: 'When they brought Him here I thought severity was obedience. I gave orders I am ashamed of now. His patience has made my command look very small.',
      choices: [{ text: '"What changed?"', next: 'change' }],
    },
    tested: {
      speaker: 'ʿAlí Khán',
      text: 'Bold words for a narrow pass. (He studies you.) Still. I have watched His enemies grow loud while He grows only quieter. Perhaps you are right.',
      choices: [{ text: '"What made you think so?"', next: 'change' }],
    },
    shiraz: {
      speaker: 'ʿAlí Khán',
      text: 'Then you stood nearer the beginning than I. I came to Him late, and I came hard. For weeks I would not allow Him so much as a lamp.',
      choices: [{ text: '"And now?"', next: 'change' }],
    },
    change: {
      speaker: 'ʿAlí Khán',
      onEnter: { set: { ch6WardenSoftened: true } },
      text: 'One morning something broke in me. I will not tell you what I saw by the river; you would think me a fool. I went up to His door and asked forgiveness. It was given before I had finished asking.',
      choices: [
        { text: '"What do you do now?"', next: 'now' },
        { text: '"May your mercy become your honour."', next: 'honour' },
      ],
    },
    now: {
      speaker: 'ʿAlí Khán',
      text: 'Now the gate opens to pilgrims, and I climb up most days to sit by the door. If Ṭihrán hears of it they will move Him somewhere colder. Let them hear. Go in. Siyyid Ḥusayn, His amanuensis, keeps the pages in his room off the courtyard.',
      choices: [{ text: '(Bow, and pass through the gate.)' }],
    },
    honour: {
      speaker: 'ʿAlí Khán',
      text: 'Honour. (A short laugh.) I have had honour all my life. This is something else. Go in, and speak quietly. Siyyid Ḥusayn, His amanuensis, keeps the pages in his room off the courtyard.',
      choices: [{ text: '(Bow, and pass through the gate.)' }],
    },
  },
};

export const ch6Amanuensis: DialogueTree = {
  id: 'ch6-amanuensis',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Siyyid Ḥusayn, the Amanuensis',
      text: 'Peace be upon you. Mind the ink; it freezes if the brazier dies. I am Siyyid Ḥusayn of Yazd. I write down what is revealed, and copy it, and copy the copies.',
      choices: [
        { text: '"What is being revealed here?"', next: 'bayan' },
        { text: '"Is He well?"', next: 'well' },
      ],
    },
    well: {
      speaker: 'Siyyid Ḥusayn, the Amanuensis',
      text: 'He is cold, as we all are. He eats little and gives more away. When pilgrims come He asks first about their journey, their families, their feet. Then He returns to the writing, and I cannot keep pace.',
      choices: [{ text: '"What is He writing?"', next: 'bayan' }],
    },
    bayan: {
      speaker: 'Siyyid Ḥusayn, the Amanuensis',
      text: 'A Book. He calls it the Bayán, the Exposition. Not commentary on old verses this time, but laws, a new calendar, and again and again, Him whom God shall make manifest, who is to come after. Every page points beyond itself.',
      choices: [{ text: '"May I read it?"', next: 'invite' }],
    },
    invite: {
      speaker: 'Siyyid Ḥusayn, the Amanuensis',
      onEnter: { set: { ch6MetAmanuensis: true } },
      text: 'If the Khán has let you in, sit on my mat and read. The pages will go down the mountain soon enough, sewn into saddle-cloths. Better that a few should read them warm from the pen.',
      choices: [{ text: '(Thank him, and kneel by the pages.)' }],
    },
  },
};

export const ch6DeskClosed: DialogueTree = {
  id: 'ch6-desk-closed',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The fair copy lies on the copyist\'s mat, wrapped in a blue cloth and tied. It is not yours to untie uninvited. The warden at the gate must first allow you, and the amanuensis who keeps it must know who you are.',
    },
  },
};

export const ch6Bayan: DialogueTree = {
  id: 'ch6-bayan',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The pages lie in Siyyid Ḥusayn\'s careful hand, the ink still bright. You read of the Day of God, of nineteen months of nineteen days, and again and again of Him whom God shall make manifest.',
      choices: [
        { text: '(Read with awe.)', next: 'awe', effect: { set: { ch6BayanStance: 'awe' } } },
        { text: '(Study the order of the verses.)', next: 'study', effect: { set: { ch6BayanStance: 'study' } } },
        { text: '(Grieve that such words are born in prison.)', next: 'grief', effect: { set: { ch6BayanStance: 'grief' } } },
      ],
    },
    awe: {
      speaker: 'Narrator',
      text: 'The cold little room seems to widen around you. What was meant as a place of forgetting has become the place where a new Book is written down.',
      choices: [{ text: '(Read on.)', next: 'promise' }],
    },
    study: {
      speaker: 'Narrator',
      text: 'You trace the architecture of it: each law set down with a builder\'s care, and each one pointing past itself, to a future no prison can measure.',
      choices: [{ text: '(Read on.)', next: 'promise' }],
    },
    grief: {
      speaker: 'Narrator',
      text: 'Your sorrow does not dim the page. These words were written by a Prisoner who for weeks had not even a lamp, and the dark has only made them sharper.',
      choices: [{ text: '(Read on.)', next: 'promise' }],
    },
    promise: {
      speaker: 'Narrator',
      onEnter: { set: { ch6ReadBayan: true } },
      text: 'One thought stays with you as you set the pages down: that this whole Book is a gift held ready for the One who is to come. Even here, in the snow, the Prisoner is preparing the way for Another.',
    },
  },
};

export const ch6MakuWindow: DialogueTree = {
  id: 'ch6-maku-window',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The window is a narrow slot crossed by two iron bars, set into the wall of the keep. Frost furs the bars. From within comes no sound but, now and then, the scratch of a pen.',
      choices: [
        { text: '(Wait beneath it.)', next: 'wait' },
        { text: '(Remember the lamp behind the lattice in Shíráz.)', next: 'remember',
          requires: f => f.recognised === true },
      ],
    },
    wait: {
      speaker: 'Narrator',
      text: 'Late in the afternoon a voice begins to chant, low and unhurried. The guards at the brazier stop talking. You catch only fragments: a Day, a promise, a Name not yet spoken.',
      choices: [{ text: '(Stay.)', next: 'end' }],
    },
    remember: {
      speaker: 'Narrator',
      text: 'In Shíráz there was a lamp behind the lattice, and you sat outside it until dawn. Here, for weeks, there was not even that. He has not moved at all, you think. Only the walls around Him have changed.',
      choices: [{ text: '(Stay.)', next: 'end' }],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { ch6SawBarredWindow: true } },
      text: 'You lay your palm on the stone below the bars. It is as cold as the mountain. You stay until the cold reaches your bones, and then a little longer.',
    },
  },
};

export const ch6MullaHusaynVisit: DialogueTree = {
  id: 'ch6-mulla-husayn-visit',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn',
      text: 'Friend! You, here, at the edge of the world? I have come from Mashhad. On foot, every step of it. (He laughs at your face.) Do not look at my boots. They have given everything they had.',
      choices: [
        { text: '"On foot? From Mashhad?"', next: 'foot' },
        { text: '"I remember the night of first recognition, in Shíráz."', next: 'memory',
          requires: f => f.recognised === true, effect: { set: { ch6RememberedFirstNight: true } } },
        { text: '"What sustains you after so much hardship?"', next: 'steadfast',
          effect: { set: { ch6AskedSteadfastness: true } } },
        { text: '"I have read the pages of the Bayán. Where will you go now?"', next: 'charge',
          requires: f => !!f.ch6ReadBayan && !!f.ch6MetMullaHusayn },
      ],
    },
    foot: {
      speaker: 'Mullá Ḥusayn',
      text: 'A thousand miles and more. A friend offered me a horse. I told him some journeys must be paid for in steps. I wanted to arrive as a pilgrim arrives: tired enough to be emptied.',
      choices: [{ text: '(Walk beside him a little way.)', next: 'meet' }],
    },
    memory: {
      speaker: 'Mullá Ḥusayn',
      text: 'Then you know. A lamp once kindled does not become night again. These walls are only shadows thrown around that flame.',
      choices: [{ text: '(Stand with him in silence.)', next: 'meet' }],
    },
    steadfast: {
      speaker: 'Mullá Ḥusayn',
      text: 'The first word I heard from Him still walks ahead of me. I follow it, whether it leads to a garden or a prison gate. Today it led here, and I find I cannot tell the difference.',
      choices: [{ text: '(Let his certainty steady your own heart.)', next: 'meet' }],
    },
    meet: {
      speaker: 'Mullá Ḥusayn',
      onEnter: { set: { ch6MetMullaHusayn: true } },
      text: 'They tell me the Khán himself rode out on the road to greet me, which no one can explain. I will keep Naw-Rúz up there, if they let me. Go up ahead of me. Read what is being written, and come back and tell me.',
      choices: [
        { text: '(Promise to return.)' },
        { text: '"I have read it already. Where will you go now?"', next: 'charge', requires: f => !!f.ch6ReadBayan },
      ],
    },
    charge: {
      speaker: 'Mullá Ḥusayn',
      text: 'I have been bidden onward, to Mázindarán. A treasure lies hidden there, He says, which I will know when I see it. And He spoke of the friends who will suffer, gently, the way a farmer speaks of the harvest.',
      choices: [{ text: '"That frightens me."', next: 'farewell' }],
    },
    farewell: {
      speaker: 'Mullá Ḥusayn',
      onEnter: { set: { ch6HusaynCharge: true } },
      text: 'Do not be frightened of it, friend. If the road is hard, it is only because it is going somewhere. Look for me among the green hills of Mázindarán, when the time comes.',
      choices: [{ text: '(Embrace him.)' }],
    },
  },
};

export const ch6CourierLetters: DialogueTree = {
  id: 'ch6-courier-letters',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Mountain Courier',
      onEnter: { set: { ch6CourierLetters: true } },
      text: 'Snow shuts the pass by dusk. Still the letters go out: under wool, sewn into saddle-cloths, learned by heart, from Mákú to Tabríz and on to every town where a friend is waiting.',
      choices: [
        { text: '"The road itself has become a witness."', next: 'witness' },
        { text: '"Who carries them?"', next: 'who' },
      ],
    },
    witness: {
      speaker: 'A Mountain Courier',
      text: 'No prison is an ending while one line can be carried away. Men call Mákú remote. I have never seen news travel faster. Come back when there is news worth carrying; I will know it first.',
    },
    who: {
      speaker: 'A Mountain Courier',
      text: 'Pilgrims, mostly. Merchants who are not only merchants. Me. (He pats his saddlebag.) The border guards search for silver. They never think to search for verses. Come back to me when there is news; I always hear it first.',
    },
  },
};

export const ch6CourierTransfer: DialogueTree = {
  id: 'ch6-courier-transfer',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Mountain Courier',
      text: 'Ah, it is you. I have news from Ṭihrán, and I wish I did not. The Grand Vizier has heard that the Khán has gone soft, that pilgrims come and go as they please. He has ordered the Prisoner moved.',
      choices: [{ text: '"Moved where?"', next: 'where' }],
    },
    where: {
      speaker: 'A Mountain Courier',
      onEnter: { set: { ch6TransferOrdered: true } },
      text: 'Chihríq, among the Kurds, under Yaḥyá Khán. A harder fortress on a harder mountain. They say the Grand Vizier chose him because his sister is the Sháh\'s own wife, and such a man will not soften.',
      choices: [
        { text: '"Then I will go too."', next: 'go' },
        { text: '"Is there no end to this?"', next: 'end' },
      ],
    },
    go: {
      speaker: 'A Mountain Courier',
      text: 'The Tabríz road leaves from the caravanserai across the bridge. Keep to the track and keep your face down. I will be on it before you, with fresh paper for Siyyid Ḥusayn.',
    },
    end: {
      speaker: 'A Mountain Courier',
      text: 'There is always an end. I have only never seen a road that did not lead on to the next one. Cross the bridge and take the Tabríz road. I will see you at Chihríq.',
    },
  },
};
