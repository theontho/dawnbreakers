import type { DialogueTree } from '../../dialogue/types';

/**
 * Qazvín in the autumn of 1847, the days after Ḥájí Mullá Muḥammad-Taqí was
 * struck down at dawn prayer in his mosque. The killing is reported, never
 * staged. Nabíl records that a Mullá ʿAbdu'lláh of Shíráz, an admirer of
 * Shaykh Aḥmad who said he was no Bábí, confessed to it; the heirs blamed
 * Qurratu'l-ʿAyn and the Bábís, and some thirty were arrested. The lane
 * gives both accounts and lets neither speak for the player.
 */

/** A baker in the lane, who tells what the town says happened at dawn. */
export const baker: DialogueTree = {
  id: 'qz-baker',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Baker',
      text: 'Bread? Take it, take it, I am not counting coins this week. (He slaps a round of dough onto the oven wall.) They have kept you indoors since it happened, I suppose, like every daughter in Qazvín. Then you have not heard it properly. (He nods toward the mosque.)',
      choices: [{ text: '"Tell me."', next: 'dawn' }],
    },
    dawn: {
      speaker: 'A Baker',
      text: 'Ḥájí Mullá Taqí, God have mercy on him. He went into his mosque before dawn, as he did every day, and an old woman spread his rug in the miḥráb. While he was bowed in prayer, someone came up behind him with a blade.',
      choices: [{ text: '"Who?"', next: 'who' }],
    },
    who: {
      speaker: 'A Baker',
      text: 'Nobody saw. They carried him home on a litter, and he died of it. (He wipes his hands.) He had cursed the Shaykhís from the pulpit for years. He had cursed the Bábís. He had cursed his own niece, the learned one, who would not go back to his son. So you can guess who the town blamed.',
      choices: [{ text: '"And was it her doing?"', next: 'doing' }],
    },
    doing: {
      speaker: 'A Baker',
      onEnter: { set: { qzHeardDawn: true } },
      text: 'His sons say so. Her people say she knew nothing of it, and a man from Shíráz, a devotee of the old Shaykh, has gone to the governor and sworn the hand was his. (He shrugs.) I bake bread. I do not know. I know they have taken thirty men who did not do it.',
    },
  },
};

/** A farrásh with a list of names outside the mosque. */
export const farrash: DialogueTree = {
  id: 'qz-farrash',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Farrásh',
      text: '(He holds a list, and he is not reading it.) Go home, daughter. There are no women on this list. Not yet.',
      choices: [
        { text: '"Whose names are on it?"', next: 'names' },
        { text: '"I am on my way home."', next: 'names' },
      ],
    },
    names: {
      speaker: 'A Farrásh',
      text: 'Bábís. Friends of the woman in Mullá Ṣáliḥ\'s house. An Arab called Shaykh Ṣáliḥ, taken already. A Mullá Ṭáhir of Shíráz, taken. A merchant, Ḥájí Asadu\'lláh, a man I have bought tea from for ten years. (He taps the paper.) Taken.',
      choices: [{ text: '"Do you believe they did it?"', next: 'believe' }],
    },
    believe: {
      speaker: 'A Farrásh',
      onEnter: { set: { qzMetFarrash: true } },
      text: '(He looks at the mosque door a long time.) A man has confessed, and the governor has him. And still I am told to bring in more. The heirs want blood for blood, and they are not particular whose. Go along, daughter, before I remember to ask whose house you come from.',
    },
  },
};

/** The same farrásh on the night of the rescue. */
export const farrashNight: DialogueTree = {
  id: 'qz-farrash-night',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The farrásh sits on the mosque step with his chin on his chest and his list folded in his sash. He is asleep, or he has chosen to be. Either way, the lane is yours.',
    },
  },
};

export const qazvinLaneDialogues: Record<string, DialogueTree> = {
  [baker.id]: baker,
  [farrash.id]: farrash,
  [farrashNight.id]: farrashNight,
};
