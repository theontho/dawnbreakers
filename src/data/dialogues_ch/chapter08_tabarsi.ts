import type { DialogueTree } from '../../dialogue/types';
import { heard } from '../record';
import { chapter08DayDialogues } from './chapter08_day';
import { chapter08DayPlaceDialogues } from './chapter08_dayPlaces';
import { chapter08NightDialogues } from './chapter08_night';
import { chapter08ForestDialogues } from './chapter08_forest';
import { chapter08ShrineDialogues } from './chapter08_shrine';
import { chapter08SiegeDialogues } from './chapter08_siege';

/**
 * Chapter 8 at the shrine of Shaykh Ṭabarsí, from the raising of the walls
 * in autumn 1848 to the fall of Mullá Ḥusayn in February 1849. The siege's
 * hunger, the false oath, and the ending live in `chapter08_siege.ts`.
 *
 * The fort map moves through three phases by flag: building (until
 * `ch8QuddusArrived`), winter (until `ch8MullaHusaynFell`), and hunger.
 */

/** Mullá Ḥusayn at the gate before the player has worked on the walls. */
export const mullaHusaynWalls: DialogueTree = {
  id: 'ch8-mh-walls',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn',
      text: 'Welcome to our resting place. You see what must be done: the shrine needs walls, the walls need a ditch, and every man here needs work for his hands while his heart waits. Find our mason at the west wall. He will show you how to set a stone so that it stays.',
    },
  },
};

/** Mullá Ḥusayn at the gate, awaiting Quddús from Sárí. */
export const mullaHusaynAwaiting: DialogueTree = {
  id: 'ch8-mh-awaiting',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn',
      text: 'Your hands are bleeding. Good; now you belong to the wall. Sit with me at the gate. Something is coming up the road from Sárí.',
      choices: [{ text: '"Who is coming?"', next: 'who' }],
    },
    who: {
      speaker: 'Mullá Ḥusayn',
      text: 'Bahá\'u\'lláh came to us not many days ago. He walked our walls and was content. Before He rode away He said our company lacked only one soul: Quddús, who is held in Sárí in the house of a mujtahid. I sent seven men to bring him.',
      choices: [{ text: '"Will they let him go?"', next: 'release' }],
    },
    release: {
      speaker: 'Mullá Ḥusayn',
      text: 'He asked it, and so it will be. (He rises.) Look. Do you see the lights between the trees?',
      choices: [{ text: '(Stand with him at the gate.)', next: 'arrival' }],
    },
    arrival: {
      speaker: 'Narrator',
      text: 'Quddús rides in out of the dark under the dripping branches, ringed by candles, young and very still. Mullá Ḥusayn, who has led hundreds across Persia, walks behind the horse on foot with the candle-bearers, as a servant would behind his master.',
      choices: [{ text: '(Follow them to the shrine.)', next: 'verse' }],
    },
    verse: {
      speaker: 'Narrator',
      onEnter: { set: { ch8QuddusArrived: true } },
      text: 'Quddús leans his back against the shrine and recites the verse of the Remnant of God: that which God has left you is better for you, if you are of those who believe. Three hundred voices fall silent. The rain itself seems to listen.',
    },
  },
};

/** Mullá Ḥusayn in winter, before the player has sat with Quddús. */
export const mullaHusaynWinter: DialogueTree = {
  id: 'ch8-mh-winter',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn',
      text: 'Snow in the forest, and the Prince\'s army camped across the stream. Go and sit with Quddús. Every night he writes, and every morning we chant what he wrote. Bring me back a verse to warm my hands.',
    },
  },
};

/** The last evening, the sortie, and the burial within the shrine. */
export const mullaHusaynLast: DialogueTree = {
  id: 'ch8-mh-last',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn',
      text: 'You have been with Quddús. I can see it in your face, as he sees the end of this in mine. Sit with me a moment. I have been thinking of a lamp in Shíráz.',
      choices: [
        { text: '"The lamp that did not flicker. I remember it."', next: 'lamp', requires: f => f.recognised === true },
        { text: '"Tell me of it."', next: 'lamp' },
      ],
    },
    lamp: {
      speaker: 'Mullá Ḥusayn',
      text: 'I sat across from Him that night and thought I was the guest. I was the one being received. Everything since has been the same visit. (He touches the green turban.) Before dawn we ride out. The army has built its towers too close.',
      choices: [
        { text: '"Let me ride with you."', next: 'stay' },
        { text: '"Must you go yourself?"', next: 'must' },
      ],
    },
    stay: {
      speaker: 'Mullá Ḥusayn',
      text: 'You carry no sword and want none, and that is why I trust you. Stay at the gate. Someone must open it when we return.',
      choices: [{ text: '(Keep the gate.)', next: 'dawn' }],
    },
    must: {
      speaker: 'Mullá Ḥusayn',
      text: 'A shepherd does not send the flock ahead of him into the dark. Stay at the gate, friend. Someone must open it when we return.',
      choices: [{ text: '(Keep the gate.)', next: 'dawn' }],
    },
    dawn: {
      speaker: 'Narrator',
      text: 'Before dawn Mullá Ḥusayn washes, puts on fresh garments, and binds the green turban. The gate opens. A cry rises from the riders, Yá Ṣáḥibu\'z-Zamán, and they are gone into the mist. You stand at the open gate and do not move.',
      choices: [{ text: '(Wait.)', next: 'return' }],
    },
    return: {
      speaker: 'Narrator',
      onEnter: { set: { [heard('ch8-door', 'own')]: true } },
      text: 'They bring him back at sunrise. A shot from the branches of a tree, they say. He is carried to Quddús, who asks to be left alone with him. The door of the shrine is closed. Through it you hear two voices, and then one.',
      choices: [{ text: '(Wait.)', next: 'burial' }],
    },
    burial: {
      speaker: 'Narrator',
      onEnter: { set: { ch8MullaHusaynFell: true } },
      text: 'Quddús wraps him in his own shirt and lays him to rest beside the shrine he chose for a landing place, and bids those who carried him tell no one where. The first to believe in Shíráz has given the last of what he had. You remember a lamp, put out at dawn because the sun had made it needless.',
    },
  },
};

/** The mason at the west wall: the player's first work at Ṭabarsí. */
export const mason: DialogueTree = {
  id: 'ch8-mason',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Companion at the Wall',
      text: 'Hold that stone. No, with both hands, the way you would hold a child. I cut gravestones in Yazd for thirty years. Now I build a wall around the living. God has a sense of humour.',
      choices: [
        { text: '"Show me how to set it."', next: 'set' },
        { text: '"A wall? I thought we came here to pray."', next: 'pray' },
      ],
    },
    pray: {
      speaker: 'A Companion at the Wall',
      text: 'We did. But Bárfurúsh came after us with clubs, and Mullá Ḥusayn says a shrine full of praying men needs a wall, or the prayers will be very short. We will not go out to make war. We will only keep the door.',
      choices: [{ text: '"Then show me."', next: 'set' }],
    },
    set: {
      speaker: 'A Companion at the Wall',
      text: 'Mud, then the stone, then a timber across, then mud again. Ironwood for the towers; it does not burn easily. Press. Feel it settle? A stone set well never quarrels with the one beside it. Remember that inside the walls as well.',
      choices: [{ text: '(Set the stone, and another, until your palms are raw.)', next: 'done' }],
    },
    done: {
      speaker: 'A Companion at the Wall',
      onEnter: { set: { ch8HelpedBuild: true } },
      text: 'There. Your stone is in the wall, and long after us someone will lean on it and never know your name. That is the best kind of work. Go and tell Mullá Ḥusayn the west wall is a hand higher.',
    },
  },
};

/** Riḍá digging the ditch, in the first weeks. */
export const youthDigging: DialogueTree = {
  id: 'ch8-youth-digging',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Young Companion',
      text: 'You came! I am digging the ditch. Mullá Ḥusayn says it will fill when the rains come, and in Mázindarán the rains always come. My hands were blue; now they are brown.',
      choices: [
        { text: '(Help him lift a basket of earth.)', next: 'help' },
        { text: '"Where do you sleep?"', next: 'sleep' },
        { text: '(Give him the village woman\'s rice.)', next: 'rice', requires: f => !!f.ch8RiceGift && !f.ch8GaveRice,
          effect: { set: { ch8GaveRice: true } } },
      ],
    },
    sleep: {
      speaker: 'A Young Companion',
      text: 'Under a lean-to of branches by the south wall. It drips. I dream I am at home and my mother is wringing out the dyed cloth over my head.',
      choices: [{ text: '(Help him lift a basket of earth.)', next: 'help' }],
    },
    rice: {
      speaker: 'A Young Companion',
      text: 'Rice! From a woman at the stream? (He holds the knotted cloth as if it were alive.) I will make it last. I will make it last a very long time.',
      choices: [{ text: '(Help him lift a basket of earth.)', next: 'help' }],
    },
    help: {
      speaker: 'A Young Companion',
      onEnter: { set: { ch8DugDitch: true } },
      text: 'You are stronger than you look, or I am weaker than I thought. (He laughs.) They say we are nearly three hundred and thirteen now, the number of the Qáʾim\'s companions in the traditions. And one of them is me, Riḍá, the dyer\'s boy.',
    },
  },
};

/** Riḍá on night watch in winter. */
export const youthWatch: DialogueTree = {
  id: 'ch8-youth-watch',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Young Companion',
      text: 'My turn on watch. I count the army\'s fires to stay awake. Four hundred and twelve tonight; last week, three hundred. (He shivers.) Quddús says fear is a guest, and a guest must not be given the best room.',
      choices: [
        { text: '"Whose fires are they?"', next: 'fires' },
        { text: '"How is your mother\'s bread?"', next: 'bread' },
      ],
    },
    fires: {
      speaker: 'A Young Companion',
      text: 'The Prince\'s army, and the khans of Láríján, and men from every village between here and Sárí. All of that, for a few hundred of us and a tomb.',
      choices: [{ text: '"And your mother\'s bread?"', next: 'bread' }],
    },
    bread: {
      speaker: 'A Young Companion',
      onEnter: { set: { ch8KeptWatch: true } },
      text: 'Gone, every crumb. I saved the last piece a week, then gave it to an old man from Qazvín who could not stop coughing. My mother would have done the same. That is how I knew it was right.',
    },
  },
};

/** Quddús in winter: counsel, and the news from Ámul. */
export const quddusCounsel: DialogueTree = {
  id: 'ch8-quddus-counsel',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Quddús',
      text: 'Sit, friend. You look like one who has carried stones and questions in the same basket. This shrine was built for prayer, not for siege. Yet any hardship can become a place of prayer, if the heart turns wholly toward God.',
      choices: [
        { text: '"How do we endure without bitterness?"', next: 'endure' },
        { text: '"What do you write each night?"', next: 'write' },
        { text: '"News has come from Ámul. Is it true?"', next: 'amul' },
      ],
    },
    amul: {
      speaker: 'Quddús',
      text: 'It is true. Bahá\'u\'lláh set out to join us and was seized at Ámul, and beaten before the people as if He were a common thief. He bore it so that others might be spared. Do not ask me to say more of it.',
      choices: [{ text: '"Then how do we endure without bitterness?"', next: 'endure' }],
    },
    write: {
      speaker: 'Quddús',
      text: 'A commentary on one letter: the Ṣád of Ṣamad, the Eternal. A single letter, and still it is not exhausted. If one letter of the Word is an ocean, think what a single soul must be.',
      choices: [{ text: '(Carry the thought with you.)', next: 'end' }],
    },
    endure: {
      speaker: 'Quddús',
      text: 'Let grief sharpen compassion, not anger. The men across the stream are not our enemies; they are our audience. Every hour we are patient, they learn something they did not come here to learn.',
      choices: [{ text: '(Carry the thought with you.)', next: 'end' }],
    },
    end: {
      speaker: 'Quddús',
      onEnter: { set: { ch8QuddusCounsel: true } },
      text: 'Now go to Mullá Ḥusayn. He has been looking toward the gate all evening, and I think he will want a friend beside him tonight.',
    },
  },
};

/** The Black Standard, raised over the fort. */
export const standardFort: DialogueTree = {
  id: 'ch8-standard-fort',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The Black Standard flies from a pole beside the shrine, soaked and heavy, where the army across the stream cannot help but see it.',
      choices: [{ text: '(Look up at it.)', next: 'look' }],
    },
    look: {
      speaker: 'Narrator',
      onEnter: { set: { ch8SawStandard: true } },
      text: 'In autumn it snapped in the wind. In winter it froze stiff. It has not once been lowered. Beneath it, dyers and stonecutters and students have become something the traditions spoke of and no one expected to see.',
    },
  },
};

export const chapter08Dialogues: Record<string, DialogueTree> = {
  ...chapter08ForestDialogues,
  ...chapter08SiegeDialogues,
  ...chapter08ShrineDialogues,
  ...chapter08DayDialogues,
  ...chapter08DayPlaceDialogues,
  ...chapter08NightDialogues,
  [mullaHusaynWalls.id]: mullaHusaynWalls,
  [mullaHusaynAwaiting.id]: mullaHusaynAwaiting,
  [mullaHusaynWinter.id]: mullaHusaynWinter,
  [mullaHusaynLast.id]: mullaHusaynLast,
  [mason.id]: mason,
  [youthDigging.id]: youthDigging,
  [youthWatch.id]: youthWatch,
  [quddusCounsel.id]: quddusCounsel,
  [standardFort.id]: standardFort,
};
