import type { DialogueTree } from '../../dialogue/types';

/**
 * The foot of the hall steps, where the player waits with a coffee tray
 * among the slippers the divines left there. The Báb is never seen: the
 * arrival and departure are a knot of guards, a silence, a space no one
 * can see into. The last tree, days later, closes the chapter before the
 * empty seat.
 */

/** Before the page has told the player where to stand. */
export const trialHallClosed: DialogueTree = {
  id: 'trial-hall-closed',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A row of slippers on the lowest step, left by the divines going in: red leather, green, black, the white cotton of a poor mullá\'s gívih. A farrásh waves you off. Find the page; he will tell you where to stand.',
    },
  },
};

/** The Prisoner is brought in. */
export const trialHallArrival: DialogueTree = {
  id: 'trial-hall-arrival',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Out in the square the crowd roars, and then gives way. Farráshes are forcing a passage through it. They are bringing Him.',
      choices: [{ text: '(Stand with the tray, and watch.)', next: 'cross' }],
    },
    cross: {
      speaker: 'Narrator',
      text: 'A knot of guards crosses the court. Over their shoulders you catch only the green of a Siyyid\'s turban, and then they are on the steps, and the doors of the hall close behind them.',
      choices: [{ text: '(Listen.)', next: 'silence' }],
    },
    silence: {
      speaker: 'Narrator',
      onEnter: { set: { trialBroughtIn: true } },
      text: 'For a while there is nothing at all: not a cough, not a cup set down. Then a voice, unhurried, greeting the assembly. Then the silence again, deeper, like water closing over a stone.',
    },
  },
};

/** While the examination goes on behind the doors. */
export const trialHallListen: DialogueTree = {
  id: 'trial-hall-listen',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Voices come through the doors, rising and falling, too muffled for words. The coffee on your tray has gone cold. Whoever comes out next will know more than you.',
    },
  },
};

/** The Prisoner rises and goes out without leave. */
export const trialHallDeparture: DialogueTree = {
  id: 'trial-hall-departure',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The doors open. The farráshes come down first, and the whole court gets to its feet: grooms, servants, the coffee-maker with his tongs still in his hand.',
      choices: [{ text: '(Hold the tray still.)', next: 'pass' }],
    },
    pass: {
      speaker: 'Narrator',
      text: 'Between the guards there is a space you cannot see into. It comes down the steps, past the slippers, past you, across the court, and the gate takes it.',
      choices: [{ text: '(Set down the tray.)', next: 'after' }],
    },
    after: {
      speaker: 'Narrator',
      onEnter: { set: { trialHeLeft: true } },
      text: 'Behind you, in the hall, everyone is talking at once. No one gave Him leave to go. He did not ask for it.',
    },
  },
};

/** After He has gone, before the physician has been heard. */
export const trialHallShut: DialogueTree = {
  id: 'trial-hall-shut',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The doors of the hall are shut again, and the servants come and go with brooms. Of the slippers on the step, one pair is left, forgotten by someone in a hurry.',
    },
  },
};

/** The chapter's close: days later, the cleared hall and the seat He sat in. */
export const trialHallEmpty: DialogueTree = {
  id: 'trial-hall-empty',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The doors of the hall stand open now, propped for the air. The carpets along the walls are rolled. Only one cushion is left in its place, at the head of the room: the seat kept for the Valí-ʿAhd.',
      choices: [{ text: '(Go up the steps, and look in.)', next: 'look' }],
    },
    look: {
      speaker: 'Narrator',
      text: 'A square of light from the high windows lies across it. You think of the hush the page told you of, a room of learned men without a word to say, and of the One who walked in and sat there as though the place had been kept for Him.',
      choices: [{ text: '(Remember what was said in this room.)', next: 'said' }],
    },
    said: {
      speaker: 'Narrator',
      text: 'Before the heir to the throne and the divines of Ádhirbáyján, the Báb declared that He was the Qáʾim, the Promised One. They had brought Him to Tabríz to silence Him. Instead they gave Him the most public hearing of His life, and the news of it outran every courier in Persia.',
      choices: [{ text: '(Go out into the evening.)', next: 'end' }],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { trialComplete: true } },
      text: 'Within days He was taken back over the mountains to Chihríq and the keeping of Yaḥyá Khán. From there He wrote to the Grand Vizier a sermon of wrath, and sent it by the hand of Ḥujjat of Zanján. Far to the east, Mullá Ḥusayn\'s black standard was moving west out of Khurásán, toward the forests of Mázindarán.',
    },
  },
};

export const trialHallDialogues: Record<string, DialogueTree> = {
  [trialHallClosed.id]: trialHallClosed,
  [trialHallArrival.id]: trialHallArrival,
  [trialHallListen.id]: trialHallListen,
  [trialHallDeparture.id]: trialHallDeparture,
  [trialHallShut.id]: trialHallShut,
  [trialHallEmpty.id]: trialHallEmpty,
};
