import type { DialogueTree } from '../../dialogue/types';

/**
 * Chapter 9 on the rooftops around the barrack square, where ten thousand
 * people watched. The event is told only by the narrator at the parapet,
 * with restraint: the player lowers their eyes for the second volley, and
 * the chapter dwells on what the witnesses saw and what they could not.
 */

/** The parapet overlooking the square: the hour itself. */
export const ch9Vantage: DialogueTree = {
  id: 'ch9-vantage',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'From the parapet you look down into the barrack square. It is near noon. On every roof around you people stand shoulder to shoulder, thousands upon thousands, and almost no one speaks.',
      choices: [{ text: '(Look down.)', next: 'ropes' }],
    },
    ropes: {
      speaker: 'Narrator',
      text: 'At the pillar between the two doors, two figures are bound and lifted on ropes from the single nail. Anís has asked to be placed so that his body would shield his Master\'s. You can hardly bear to look, and you do not look away.',
      choices: [{ text: '(Keep watch.)', next: 'files' }],
    },
    files: {
      speaker: 'Narrator',
      text: 'Sám Khán\'s regiment draws up in three files of two hundred and fifty. Each file fires in turn. The sound breaks over the roofs like a wall falling, and the smoke rises so thick that noon turns brown.',
      choices: [{ text: '(Wait for the smoke to clear.)', next: 'clear' }],
    },
    clear: {
      speaker: 'Narrator',
      text: 'When the smoke thins, ten thousand people draw one breath. Anís stands alone beneath the nail, unhurt, his tunic unmarked. The ropes hang severed. The Báb is gone from the square. A cry runs across the roofs: He has vanished from our sight!',
      choices: [{ text: '(Watch the soldiers search.)', next: 'found' }],
    },
    found: {
      speaker: 'Narrator',
      onEnter: { set: { firstVolleyFailed: true, samKhanReleased: true } },
      text: 'Men run. They search, and they find Him in the very room where He sat the night before, completing His conversation with His secretary, unhurried, as if nothing outside had happened at all.',
      choices: [{ text: '(Look for Sám Khán.)', next: 'samkhan' }],
    },
    samkhan: {
      speaker: 'Narrator',
      text: 'Sám Khán orders his regiment out of the square. He will not do this again, he says, though it cost him his life. The Armenians march away through the silent crowd. For a long while nothing happens at all.',
      choices: [{ text: '(Wait.)', next: 'second' }],
    },
    second: {
      speaker: 'Narrator',
      text: 'Another regiment is brought, the Muslim guard of Áqá Ján Khán. Again the two are lifted to the nail. A voice carries up to the roofs, addressing the crowd: had you believed in Me, every one of you would have followed the example of this youth.',
      choices: [
        { text: '(Lower your eyes.)', next: 'volley' },
        { text: '(Pray.)', next: 'volley', effect: { set: { ch9Prayed: true } } },
      ],
    },
    volley: {
      speaker: 'Narrator',
      text: 'You do not see the second volley. You hear it. Beside you, someone covers a child\'s eyes. When you look again there is nothing to describe, and you will not describe it.',
      choices: [{ text: '(Stay.)', next: 'storm' }],
    },
    storm: {
      speaker: 'Narrator',
      onEnter: { set: { ch9WitnessedVolleys: true } },
      text: 'In that same moment a wind rises out of nowhere, a gale thick with dust, and the sun goes dark over Tabríz. From noon until night the city sits in a brown twilight. No one on the roofs can see the face of the person beside them.',
    },
  },
};

export const ch9VantageAfter: DialogueTree = {
  id: 'ch9-vantage-after',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Below, the square is empty and the dust is still settling. The pillar stands where it stood. Go down, if you can. Someone should stand before that wall.',
    },
  },
};

/** A watcher on the roofs who saw the procession that morning. */
export const ch9CrowdWitness: DialogueTree = {
  id: 'ch9-crowd-witness',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Witness in the Crowd',
      text: 'The roofs are full, yet no one speaks above a murmur. Some came from curiosity, some from fear, and some because their hearts would not let them stay away.',
      choices: [
        { text: '"How can a city bear such an hour?"', next: 'compassion' },
        { text: '"Tell me only what you know, not what rumour adds."', next: 'careful' },
        { text: '(Stand quietly beside him.)', next: 'silence' },
      ],
    },
    compassion: {
      speaker: 'Witness in the Crowd',
      onEnter: { set: { heardCrowdWitness: true } },
      text: 'By lowering its eyes, perhaps. They led Him past my shop this morning. He walked through the shouting like one who hears music from another room.',
    },
    careful: {
      speaker: 'Witness in the Crowd',
      onEnter: { set: { heardCrowdWitness: true } },
      text: 'Then know this: the warrants are signed, Sám Khán commands the regiment, and the Prisoner is calm. The rest belongs to God.',
    },
    silence: {
      speaker: 'Narrator',
      onEnter: { set: { heardCrowdWitness: true } },
      text: 'The witness nods once. Silence becomes the only honest language left on the roof.',
    },
  },
};

export const ch9CrowdWitnessAfter: DialogueTree = {
  id: 'ch9-crowd-witness-after',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Witness in the Crowd',
      onEnter: { set: { ch9CrowdAfter: true } },
      text: 'I came up here to see. Now I wish I had stayed in my shop. (He laughs, shaken.) No. That is not true. I wish the whole of Persia had been standing on these roofs.',
    },
  },
};

/** A baker's widow with her son, bread cooling on the parapet. */
export const ch9Widow: DialogueTree = {
  id: 'ch9-widow',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Baker\'s Widow',
      text: 'Mind the bread, it is cooling on the parapet. I bring it up here so the dust of the street will not reach it. Today the whole street has come up onto the roofs.',
      choices: [
        { text: '"Is this your son?"', next: 'son' },
        { text: '"Did you see Him pass this morning?"', next: 'pass' },
      ],
    },
    son: {
      speaker: 'A Baker\'s Widow',
      text: 'My Ḥasan. Eight years old, and he wants to see everything. (She draws the boy close.) His father would have known whether to let him watch. I do not.',
      choices: [{ text: '"Did you see Him pass?"', next: 'pass' }],
    },
    pass: {
      speaker: 'A Baker\'s Widow',
      onEnter: { set: { ch9HeardWidow: true } },
      text: 'They led the Siyyid past my oven, without His turban. Ḥasan held out a piece of bread. The guards laughed. He did not laugh. He looked at my son as though He had been given a kingdom.',
    },
  },
};

export const ch9WidowAfter: DialogueTree = {
  id: 'ch9-widow-after',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Baker\'s Widow',
      onEnter: { set: { ch9WidowAfter: true } },
      text: 'I put my hand over his eyes. He fought me, then he stopped. (The boy sleeps against her knee, grey with dust.) When the wind came he said: Mother, the sun has gone in. I told him it would come back.',
    },
  },
};

/** A madrasa student who came to watch a heresy end. */
export const ch9Student: DialogueTree = {
  id: 'ch9-student',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Madrasa Student',
      text: 'Come to see the end of the heresy? Good. Every soul should see what becomes of a man who claims to be the Gate of God. Mullá Muḥammad of Mamaqán signed the sentence himself.',
      choices: [
        { text: '"Have you ever read His words?"', next: 'read' },
        { text: '"And if He is what He claims?"', next: 'claims' },
      ],
    },
    read: {
      speaker: 'A Madrasa Student',
      text: 'Read them? The ʿulamá have read them. (He hesitates.) A friend lent me a page once. I gave it back within the hour. It was too... It was not suitable.',
      choices: [{ text: '"And if He is what He claims?"', next: 'claims' }],
    },
    claims: {
      speaker: 'A Madrasa Student',
      onEnter: { set: { ch9HeardStudent: true } },
      text: 'Then God will show it, will He not? Let it be shown here, before ten thousand eyes. (He folds his arms, but his knuckles are white.)',
    },
  },
};

export const ch9StudentAfter: DialogueTree = {
  id: 'ch9-student-after',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Madrasa Student',
      onEnter: { set: { ch9StudentShaken: true } },
      text: 'It proved nothing. He vanished from the ropes, and they found Him in His room, and the Christians would not fire again, and still it ended the same. It proved nothing. (Quieter.) Then why can I not stop shaking?',
    },
  },
};

export const chapter09RoofDialogues: Record<string, DialogueTree> = {
  [ch9Vantage.id]: ch9Vantage,
  [ch9VantageAfter.id]: ch9VantageAfter,
  [ch9CrowdWitness.id]: ch9CrowdWitness,
  [ch9CrowdWitnessAfter.id]: ch9CrowdWitnessAfter,
  [ch9Widow.id]: ch9Widow,
  [ch9WidowAfter.id]: ch9WidowAfter,
  [ch9Student.id]: ch9Student,
  [ch9StudentAfter.id]: ch9StudentAfter,
};
