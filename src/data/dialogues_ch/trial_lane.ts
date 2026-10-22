import type { DialogueTree } from '../../dialogue/types';

/**
 * The lane outside the Shaykhu'l-Islám's house, the evening of the
 * examination. Nabíl records that the governor's bodyguard refused to
 * strike the Báb, holding it a matter for the ʿulamá, and that Mírzá
 * ʿAlí-Aṣghar, the Shaykhu'l-Islám, applied the rods to His feet himself,
 * eleven times. It is told by those outside; the door stays shut.
 */

/** The officer of the bodyguard, who would not lay hands on a Siyyid for the ʿulamá. */
export const trialBodyguard: DialogueTree = {
  id: 'trial-bodyguard',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'An Officer of the Bodyguard',
      text: '(An officer of the governor\'s bodyguard stands in the lane with his men, their muskets grounded. None of them is looking at the door.) Move along. There is nothing here for you.',
      choices: [
        { text: '"Why do you wait out here, and not within?"', next: 'refused' },
        { text: '"Is He inside?"', next: 'refused' },
      ],
    },
    refused: {
      speaker: 'An Officer of the Bodyguard',
      text: 'We brought Him here. That was our order. Then they told us to beat Him, in the Shaykhu\'l-Islám\'s own court. (He spits.) We are the governor\'s soldiers. We told them this is a quarrel of the ʿulamá, and no business of ours.',
      choices: [{ text: '"That took courage."', next: 'courage' }],
    },
    courage: {
      speaker: 'An Officer of the Bodyguard',
      onEnter: { set: { trialHeardBodyguard: true } },
      text: 'Courage? It was a matter of what is ours to do and what is not. (He looks at his hands.) Then the Shaykhu\'l-Islám said he would do it himself. And he did. We stood in this lane and heard it, and we are standing here still.',
    },
  },
};

/** A water-boy of the household, who was in the court. */
export const trialHouseBoy: DialogueTree = {
  id: 'trial-house-boy',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Water-Boy',
      text: '(A boy with an empty water-skin sits against a house front, very still.) I carry water to the Shaykhu\'l-Islám\'s house. I was in the court when they brought Him in.',
      choices: [{ text: '"Tell me only what you can."', next: 'told' }],
    },
    told: {
      speaker: 'A Water-Boy',
      text: 'When the soldiers would not, the Shaykhu\'l-Islám took the rods himself. Eleven strokes. I counted, because I did not know what else to do. One of the farráshes struck Him across the face. I do not know if he meant to.',
      choices: [{ text: '(Sit down beside him.)', next: 'after' }],
    },
    after: {
      speaker: 'A Water-Boy',
      onEnter: { set: { trialHeardHouseBoy: true } },
      text: 'My mother says the Shaykhu\'l-Islám is a great and learned man. (He wipes his nose on his sleeve.) Tomorrow I am going to carry my water to some other house.',
    },
  },
};

/** The door, before the player has heard the lane. */
export const trialShaykhDoorLocked: DialogueTree = {
  id: 'trial-shaykh-door-locked',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The carved door of the Shaykhu\'l-Islám\'s house is shut and barred. The lane is very quiet. The soldiers, and the boy down the lane, will know what has happened here.',
    },
  },
};

/** The door: the Prisoner is brought out at dusk, and days pass. */
export const trialShaykhDoor: DialogueTree = {
  id: 'trial-shaykh-door',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A tall carved door with two iron knockers, a heavy one for men and a light one for women, so the house knows who calls. It is the house of Mírzá ʿAlí-Aṣghar, the Shaykhu\'l-Islám of Tabríz.',
      choices: [{ text: '(Wait.)', next: 'out' }],
    },
    out: {
      speaker: 'Narrator',
      text: 'At dusk the door opens. The bodyguard closes round someone you cannot see, and they go away down the lane, slowly, as men walk beside one who cannot walk fast. The door shuts behind them.',
      choices: [{ text: '(Stay until the lane is dark.)', next: 'days' }],
    },
    days: {
      speaker: 'Narrator',
      onEnter: { set: { trialBastinado: true } },
      text: 'Days pass. In the bazaar they say the Prisoner is wounded, and that the Valí-ʿAhd\'s own European physician has been sent for. When you go back to the governor\'s residence, the gate guard waves you through without a word.',
    },
  },
};

export const trialLaneDialogues: Record<string, DialogueTree> = {
  [trialBodyguard.id]: trialBodyguard,
  [trialHouseBoy.id]: trialHouseBoy,
  [trialShaykhDoorLocked.id]: trialShaykhDoorLocked,
  [trialShaykhDoor.id]: trialShaykhDoor,
};
