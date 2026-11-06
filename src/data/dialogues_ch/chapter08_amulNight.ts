import type { DialogueTree } from '../../dialogue/types';

/**
 * Chapter 8's interlude at Ámul, after the rods: the night the acting
 * governor's men opened the wall of the room where the travellers were held
 * and brought Bahá'u'lláh to his house past a siyyid with a club, and the
 * days after, until the governor came home from the fort and sent them on
 * to Ṭihrán. The last choice returns the player to the fort.
 */

/** The caretaker at night: the lantern, and the acting governor's errand. */
export const caretakerNight: DialogueTree = {
  id: 'ch8-amul-caretaker-night',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Old Caretaker',
      text: 'They are shut in the room off the court, under guard, until the governor comes home. (He holds out the big lantern, already lit.) The acting governor\'s man came to the gate asking for you by name. Go round by the alley, quietly.',
      choices: [
        { text: '"What did they do to him?"', next: 'what' },
        { text: '(Take the lantern.)', next: 'take' },
      ],
    },
    what: {
      speaker: 'The Old Caretaker',
      text: 'What no man should do to a guest, and in the house of God. (He looks away across the court.) The siyyids are still at the gate. Take the lantern. Ask the man nothing, and tell no one.',
      choices: [{ text: '(Take the lantern.)', next: 'take' }],
    },
    take: {
      speaker: 'The Old Caretaker',
      onEnter: { set: { ch8AmulLamp: true } },
      text: 'Keep your hand round the flame. It is a long way round in the snow.',
    },
  },
};

/** The siyyid from the hall, waiting at the gate of the court. */
export const siyyid: DialogueTree = {
  id: 'ch8-amul-siyyid',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Siyyid of Ámul',
      text: '(He stands in the street, staring at the court gate as if it might move.) You, the lamp boy. Are they still in there? Good. The governor\'s kinsman is soft. Tomorrow the town will see justice done.',
      choices: [{ text: '"They answered every question put to them."', next: 'answered' }],
    },
    answered: {
      speaker: 'A Siyyid of Ámul',
      onEnter: { set: { ch8AmulSiyyid: true } },
      text: 'That is what frightens me. (He pulls his cloak tight.) My father taught me the faith of our fathers on those carpets you laid. I will not stand by while it is unmade in a night by a man with a quiet voice.',
    },
  },
};

/** The acting governor's man, before the youth has the lantern. */
export const attendantWait: DialogueTree = {
  id: 'ch8-amul-attendant-wait',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Acting Governor\'s Man',
      text: '(A man in the acting governor\'s livery waits in the dark of the alley, a pick on his shoulder.) Not like that, boy, with empty hands. Fetch the old man\'s lantern, and bring it shaded.',
    },
  },
};

/** The way opened through the wall, the siyyid with the club, the acting governor's gate. */
export const wall: DialogueTree = {
  id: 'ch8-amul-wall',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Acting Governor\'s Man',
      text: 'Good. Hold it low. This wall is the back of the room where they are kept. The crowd is watching the front, at the court gate. Nobody is watching the back.',
      choices: [{ text: '"You are going to break through the masjid\'s wall?"', next: 'why' }],
    },
    why: {
      speaker: 'The Acting Governor\'s Man',
      text: 'Mud brick and straw. It will mend. My master says that if they stay till morning there will be a mob at the door, and the siyyids will have their way. He would sooner answer to the governor for a hole in a wall.',
      choices: [{ text: '(Hold the lantern low.)', next: 'dig' }],
    },
    dig: {
      speaker: 'Narrator',
      text: 'The pick bites. Dust and old straw fall through the lantern light. Another man works the bricks loose with his hands, and soon there is a dark opening the height of a crouching man, and warm air from the room within.',
      choices: [{ text: '(Keep your eyes on the alley.)', next: 'pass' }],
    },
    pass: {
      speaker: 'Narrator',
      text: 'Footsteps in the opening, slow ones. The servants close round someone and move off down the alley toward the acting governor\'s house. You are told to walk ahead with the lantern, and you do, and you do not turn round.',
      choices: [{ text: '(Walk ahead.)', next: 'club' }],
    },
    club: {
      speaker: 'Narrator',
      text: 'At the mouth of the alley a man springs from a doorway with a club raised: the siyyid from the hall. The lantern swings in your hand. Then the acting governor himself is there between them, his hand up.',
      choices: [{ text: '(Hold the light steady.)', next: 'adjure' }],
    },
    adjure: {
      speaker: 'The Acting Governor',
      text: 'By the Prophet of God, I adjure you: put it down!',
      choices: [{ text: '(Hold the light steady.)', next: 'enemy' }],
    },
    enemy: {
      speaker: 'A Siyyid of Ámul',
      text: 'How dare you let him go? He is the sworn enemy of the faith of our fathers!',
      choices: [{ text: '(Keep walking.)', next: 'gate' }],
    },
    gate: {
      speaker: 'Narrator',
      onEnter: { set: { ch8AmulWallOpened: true } },
      text: 'Men come running at the noise, and for a moment the street is full of shouting. But the servants keep together and keep walking, and the gate of the acting governor\'s house opens, and shuts behind them. You stand in the snow with the lantern, shaking, and find it has not gone out.',
    },
  },
};

/** The caretaker at the wall he has mended. */
export const caretakerAfter: DialogueTree = {
  id: 'ch8-amul-caretaker-after',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Old Caretaker',
      onEnter: { set: { ch8AmulWallMended: true } },
      text: 'I mended it myself this morning, mud and straw, before the mujtahid was up. He has not asked who made the hole, and I have not told him. (He pats the wet plaster.) Some holes a man is glad to have had in his wall.',
    },
  },
};

/** The acting governor's gate before the travellers are brought there. */
export const residenceShut: DialogueTree = {
  id: 'ch8-amul-residence-shut',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The gate of the acting governor\'s house: heavy timber studded with iron, shut. A lamp burns in the gatehouse. The governor himself is away with the army at Ṭabarsí, and this house is his kinsman\'s while he is gone.',
    },
  },
};

/** The days after, the governor's return, and the road to Ṭihrán; back to the fort. */
export const close: DialogueTree = {
  id: 'ch8-amul-close',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'In the days that follow the gate stays shut, and the town talks. The nobleman of Núr is a guest in the acting governor\'s house, they say, and never sets foot outside it, for his host fears what the governor, a kinsman of the Khán of Láríján, will do when he comes home.',
      choices: [{ text: '(Wait.)', next: 'home' }],
    },
    home: {
      speaker: 'Narrator',
      text: 'Then one night the governor rides in from the army at Ṭabarsí. What he has seen of the men in the fort has changed his heart. He hears out those who denounced the travellers, and asks them what proof they have, and they have none.',
      choices: [{ text: '(Wait.)', next: 'road' }],
    },
    road: {
      speaker: 'Narrator',
      onEnter: { set: { ch8AmulTold: true } },
      text: 'A few days later horses stand at this gate in the snow, and the travellers ride out, safe, on the road to Ṭihrán. You hold the bridle of the last horse until it is time to let it go.',
      choices: [{ text: '(Watch them go.)', next: 'providence' }],
    },
    providence: {
      speaker: 'Narrator',
      text: 'In Tabríz the Báb had been beaten in the prayer hall of the Shaykhu\'l-Islám; in Ámul the same was done to Bahá\'u\'lláh in the prayer hall of its mujtahid. He never reached the fort He set out for. Nabíl saw in it the hand of Providence, that He was spared the end that waited there for a work still to come.',
      choices: [{ text: '(Return to the fort.)', effect: { set: { ch8AtAmul: false } },
        travel: { scene: 'Ch8TabarsiFort', spawnX: 16, spawnY: 21 } }],
    },
  },
};

export const chapter08AmulNightDialogues: Record<string, DialogueTree> = {
  [caretakerNight.id]: caretakerNight,
  [siyyid.id]: siyyid,
  [attendantWait.id]: attendantWait,
  [wall.id]: wall,
  [caretakerAfter.id]: caretakerAfter,
  [residenceShut.id]: residenceShut,
  [close.id]: close,
};
