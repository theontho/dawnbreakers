import type { DialogueTree } from '../../dialogue/types';

/**
 * Bárfurúsh, the road across the rice plain a farsang south of the town
 * (Nabíl, EN ch. XIX): the Saʿídu'l-ʿUlamá's sermon the night before, told
 * as the chapter opens; Mullá Ḥusayn's word after the dawn prayer to cast
 * down everything but horses and swords, and Ḥájí ʿAbdu'l-Majíd's turquoise
 * first on the heap; the town coming out, the six who fell and the siyyid
 * of Yazd; the stroke through the tree, the musket and the man.
 */

/** The opening: the sermon in the town, which the pilgrim hears of only later. */
export const opening: DialogueTree = {
  id: 'bf-opening',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Last night, a farsang to the north, the Saʿídu\'l-ʿUlamá climbed the pulpit of the masjid of Bárfurúsh. He threw his turban down before the people, tore open the neck of his shirt, and wept aloud for the Faith of God.',
      choices: [{ text: '(Listen.)', next: 'call' }],
    },
    call: {
      speaker: 'Narrator',
      text: 'Strangers were at the gates, he cried, come to tear down all that the town held holy. Let every man who could lift a weapon go out at dawn and meet them on the road.',
      choices: [{ text: '(Listen.)', next: 'you' }],
    },
    you: {
      speaker: 'Narrator',
      onEnter: { set: { bfOpened: true } },
      text: 'You will hear all this later, from men who were there. This morning you know only the mist lying on the rice fields and the smell of horses. You have walked behind the Black Standard since Khurásán, and Mullá Ḥusayn has just finished the dawn prayer.',
    },
  },
};

/** Mullá Ḥusayn after the dawn prayer, before the camp moves. */
export const mullaHusaynDawn: DialogueTree = {
  id: 'bf-mh-dawn',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn',
      text: 'You slept? Good. Some of us lay awake listening to the dogs of Bárfurúsh. (He looks north, into the mist over the fields.) The town knows we are coming. It has been told what to think of us.',
      choices: [
        { text: '"Then let us go round it."', next: 'round' },
        { text: '"What do you mean to do?"', next: 'cast' },
      ],
    },
    round: {
      speaker: 'Mullá Ḥusayn',
      text: 'Round it? We have hidden nothing on this road, and we will not begin now. We go in by the open way, and God will do as He wills.',
      choices: [{ text: '"Then what must we do?"', next: 'cast' }],
    },
    cast: {
      speaker: 'Mullá Ḥusayn',
      text: 'Put down everything you carry, here, by the road. Keep your horse and your sword, if you have them, and nothing else. Let this plain see that we have not come for its goods, nor to guard our own.',
      choices: [
        { text: '"Everything?"', next: 'everything' },
        { text: '(Look round at the companions.)', next: 'faces' },
      ],
    },
    everything: {
      speaker: 'Mullá Ḥusayn',
      text: 'Everything. (He says it gently, as if you had asked the way.) There is nothing in a saddlebag that we will need where we are going.',
      choices: [{ text: '(Look round at the companions.)', next: 'faces' }],
    },
    faces: {
      speaker: 'Narrator',
      onEnter: { set: { bfToldCastAway: true } },
      text: 'Some of them look at their saddlebags. Then Ḥájí ʿAbdu\'l-Majíd of Nishápúr, whose family has a turquoise mine in the hills there, walks to the roadside with a leather satchel and empties it into the mud. Others come after him.',
    },
  },
};

/** Mullá Ḥusayn waiting for the camp to finish. */
export const mullaHusaynWait: DialogueTree = {
  id: 'bf-mh-wait',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn',
      text: 'Put down what you carry, friend, on the heap with the rest. Then we ride.',
    },
  },
};

/** The column moves on, and the town meets it. */
export const mullaHusaynGo: DialogueTree = {
  id: 'bf-mh-go',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn',
      text: 'You hear them. (He mounts.) Keep behind the horses, you who carry no sword. We have not come to fight anyone.',
      choices: [{ text: '(Walk on behind the Standard.)', next: 'crowd' }],
    },
    crowd: {
      speaker: 'Narrator',
      text: 'A farsang from Bárfurúsh the road is full: men of the town and the villages with clubs and muskets and stones, and the mist behind them. Someone shouts a name you do not catch. The first stones come over.',
      choices: [{ text: '(Keep walking.)', next: 'fire' }],
    },
    fire: {
      speaker: 'Narrator',
      text: 'Then the muskets. Six of the companions go down in the road. A siyyid of Yazd, who has walked beside Mullá Ḥusayn all the way from Khurásán, is struck in the chest and falls without a word.',
      choices: [{ text: '(Stand still.)', next: 'prayer' }],
    },
    prayer: {
      speaker: 'Narrator',
      text: 'Mullá Ḥusayn reins in beside him and looks down at him, and then up at the sky. His lips move. You cannot hear the words.',
      choices: [{ text: '(Watch.)', next: 'stroke' }],
    },
    stroke: {
      speaker: 'Narrator',
      text: 'Then he draws his sword and rides at the man who fired. The man runs behind the alder by the road and holds his musket up across himself. Mullá Ḥusayn strikes once. The blade goes through the tree, the musket and the man together.',
      choices: [{ text: '(Watch.)', next: 'flight' }],
    },
    flight: {
      speaker: 'Narrator',
      onEnter: { set: { bfClash: true } },
      text: 'The road empties as if a wind had gone through it. Clubs lie in the grass. Mullá Ḥusayn does not look back; he rides on toward Bárfurúsh, and the Standard after him, and the companions who can walk go after the Standard.',
    },
  },
};

/** The heap by the road. */
export const heap: DialogueTree = {
  id: 'bf-heap',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Saddlebags, quilts, a cooking pot, books tied up in cloth. On top, the leather satchel, open, and turquoise spilled in the mud like pieces of the sky.',
      voice: { voice: 'longing', text: 'The pen-case, at least. You have carried it since Karbilá.' },
      choices: [
        { text: '(Set down your bundle: the spare shirt, the bowl, the pen-case.)', next: 'down' },
        { text: '(Keep the pen-case back, in your sash.)', next: 'pen' },
      ],
    },
    pen: {
      speaker: 'Narrator',
      text: 'Your hand closes on it. Then you think of the Ḥájí\'s turquoise in the mud, and you lay the pen-case on the heap with the rest.',
      choices: [{ text: '(Step back.)', next: 'down' }],
    },
    down: {
      speaker: 'Narrator',
      onEnter: { set: { bfCastAway: true } },
      text: 'Your hands have never been so light. Behind you the companions come one by one, and the heap grows: harness, rugs, a silver cup, a child\'s wooden horse someone carried all the way from Khurásán. From the north, out of the mist, comes a noise like a market on a feast day.',
    },
  },
};

export const heapAfter: DialogueTree = {
  id: 'bf-heap-after',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The heap by the road, with the turquoise in the mud and your pen-case somewhere under it. No one has come back for anything.',
    },
  },
};

/** Ḥájí ʿAbdu'l-Majíd of Nishápúr, before the word is given. */
export const majidEarly: DialogueTree = {
  id: 'bf-majid-early',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Ḥájí ʿAbdu\'l-Majíd',
      text: 'Look, friend. (He opens a leather satchel: blue-green stones, some rough, some polished.) From my father\'s mine above Nishápúr, the best of the year. I meant to sell them in Ṭihrán and give the price to the Cause.',
      choices: [{ text: '"They are beautiful."', next: 'end' }],
    },
    end: {
      speaker: 'Ḥájí ʿAbdu\'l-Majíd',
      onEnter: { set: { bfMetMajid: true } },
      text: 'The hills of Nishápúr bleed this colour. (He ties the satchel shut.) Well. God knows what they are for. I have stopped pretending that I do.',
    },
  },
};

/** Ḥájí ʿAbdu'l-Majíd, after he has emptied his satchel first. */
export const majid: DialogueTree = {
  id: 'bf-majid',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Ḥájí ʿAbdu\'l-Majíd',
      text: 'You saw? I was the first. (He laughs, not quite steadily.) My father dug that colour out of the hill for forty years, and I have poured it into the mud of Mázindarán. And I feel as if I had put down a stone I carried on my chest.',
      choices: [{ text: '"Do you regret it?"', next: 'regret' }],
    },
    regret: {
      speaker: 'Ḥájí ʿAbdu\'l-Majíd',
      onEnter: { set: { bfMetMajid: true } },
      text: 'Ask me tonight. (He shakes his head.) No. Do not ask me at all. It is done, and it was well done, and that is the end of it.',
    },
  },
};

/** Riḍá at dawn, feeding a horse. */
export const ridaDawn: DialogueTree = {
  id: 'bf-rida-dawn',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Young Companion',
      text: '(Riḍá is feeding his last date to somebody else\'s horse, his hands still blue from his father\'s vats in Mashhad.) Mullá Ḥusayn prayed a long time this morning. When he prays long, my stomach knows something before I do.',
      choices: [{ text: '"Are you afraid?"', next: 'afraid' }],
    },
    afraid: {
      speaker: 'A Young Companion',
      text: 'Of a town? I am from Mashhad. We have more mullás in one street than Bárfurúsh has in its whole bazaar. (He grins, not very well.) Ask me again tonight.',
    },
  },
};

/** The siyyid of Yazd, laid by the road. */
export const siyyid: DialogueTree = {
  id: 'bf-siyyid',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Someone has laid him on the verge and covered his face with his own green turban-cloth. He came from Yazd. He walked from Khurásán among those nearest Mullá Ḥusayn, and stopped a farsang short of a town he had never seen.',
      choices: [
        { text: '(Kneel, and say the prayer for the dead.)', next: 'pray' },
        { text: '(Straighten the cloth over his face.)', next: 'cloth' },
      ],
    },
    pray: {
      speaker: 'Narrator',
      text: 'You say it under your breath, the words you said over strangers in Karbilá. They were never for a man who shared your water on the road.',
      choices: [{ text: '(Stay a moment.)', next: 'name' }],
    },
    cloth: {
      speaker: 'Narrator',
      text: 'The cloth is warm from the sun already. You fold the edge under, as his mother might have, so the wind will not lift it.',
      choices: [{ text: '(Stay a moment.)', next: 'name' }],
    },
    name: {
      speaker: 'Narrator',
      onEnter: { set: { bfMournedYazdi: true } },
      text: 'Siyyid Riḍá of Yazd, the first to fall on this road. Ahead, the road to Bárfurúsh is empty, and the Standard is already far along it.',
    },
  },
};

/** Mírzá Muḥammad-i-Furúghí at the cut tree. */
export const furughi: DialogueTree = {
  id: 'bf-furughi',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mírzá Muḥammad-i-Furúghí',
      text: '(He is standing by the alder, staring at the cut.) Look at it. Clean as a pen-knife through a reed. I have known him since we were boys, and if I had not seen it with my own eyes I would not believe it.',
      choices: [
        { text: '"Nor would I."', next: 'write' },
        { text: '"Did you know he could do that?"', next: 'know' },
      ],
    },
    know: {
      speaker: 'Mírzá Muḥammad-i-Furúghí',
      text: 'Him? He is a scholar. He never held a sword in his life before this road. (He touches the cut wood.) Nobody knew. I do not think he knew.',
      choices: [{ text: '"What will people say of it?"', next: 'write' }],
    },
    write: {
      speaker: 'Mírzá Muḥammad-i-Furúghí',
      onEnter: { set: { bfHeardFurughi: true } },
      text: 'They will make a giant of him, or a liar of me. It was neither. It was one stroke, and then he put the sword away and rode on as if he were late for a lesson. Say that, if anyone asks you. Say only that.',
    },
  },
};

/** Riḍá after the clash, on the dike. */
export const ridaAfter: DialogueTree = {
  id: 'bf-rida-after',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Young Companion',
      text: '(Riḍá is sitting on the dike with his blue hands over his ears.) I hid behind a horse. When the stones came I hid behind a horse, like a child.',
      choices: [
        { text: '"So did I."', next: 'name' },
        { text: '(Sit beside him.)', next: 'name' },
      ],
    },
    name: {
      speaker: 'A Young Companion',
      text: 'Did you hear the siyyid\'s name? The one from Yazd. Riḍá. Like mine. (He takes his hands from his ears.) My mother sewed bread into my sash, and I did not put it on the heap. Is that a sin, do you think, today?',
      choices: [{ text: '"It is bread, not baggage."', next: 'keep' }],
    },
    keep: {
      speaker: 'A Young Companion',
      onEnter: { set: { bfRidaShaken: true } },
      text: 'Then I will keep it for someone who needs it more than I do. (He stands, and wipes his face.) Come. They are already at the town.',
    },
  },
};

export const barfurushRoadDialogues: Record<string, DialogueTree> = {
  [opening.id]: opening,
  [mullaHusaynDawn.id]: mullaHusaynDawn,
  [mullaHusaynWait.id]: mullaHusaynWait,
  [mullaHusaynGo.id]: mullaHusaynGo,
  [heap.id]: heap,
  [heapAfter.id]: heapAfter,
  [majidEarly.id]: majidEarly,
  [majid.id]: majid,
  [ridaDawn.id]: ridaDawn,
  [siyyid.id]: siyyid,
  [furughi.id]: furughi,
  [ridaAfter.id]: ridaAfter,
};
