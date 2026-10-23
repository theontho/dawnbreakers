import type { DialogueTree } from '../../dialogue/types';

/**
 * The Grand Vizier's tent at Kulayn, told from the kilim before its door:
 * quiet while He waits, the letter carried in, the gladness after, and the
 * tent struck when the order comes. `kulayn-tent-struck` sets
 * `kulaynComplete`, the chapter's close.
 */

export const kulaynTentQuiet: DialogueTree = {
  id: 'kulayn-tent-quiet',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The Grand Vizier\'s own tent, red cloth under a cream valance, pitched on the slope above the orchards. The flap is down. A soldier sits at a respectful distance with his musket across his knees. On the kilim before the door someone has left a bowl of curds under a cloth.',
    },
  },
};

export const kulaynTentLetter: DialogueTree = {
  id: 'kulayn-tent-letter',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Mullá Mihdí stops at the edge of the kilim and says his name, and the flap is drawn back from within. He goes in. You stand where the soldier stands, at a respectful distance, and look at the almond trees.',
      choices: [{ text: '(Wait.)', next: 'joy' }],
    },
    joy: {
      speaker: 'Narrator',
      onEnter: { set: { kulaynLetter: true } },
      text: 'He is a long time inside. When he comes out his face is wet, and he walks past you without seeing you, down to the stream, and kneels there a while. That night no sound of weeping comes from the tent on the slope. Down by the water, the woman of Kulayn takes her hands from her ears and listens.',
    },
  },
};

export const kulaynTentGlad: DialogueTree = {
  id: 'kulayn-tent-glad',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The flap is looped back today, and a lamp burns in the red shade within, beside a writing case. You do not look further. From the companions\' tent comes the sound of a pen, and from the stream the woman of Kulayn singing over her bowl.',
    },
  },
};

export const kulaynTentStruck: DialogueTree = {
  id: 'kulayn-tent-struck',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'At first light the soldiers strike the Grand Vizier\'s tent. The red cloth comes down in long folds, the poles are laid in the grass, and where it stood there is only a square of pressed meadow with the outline of a kilim on it.',
      choices: [{ text: '(Watch them ride out.)', next: 'ride' }],
    },
    ride: {
      speaker: 'Narrator',
      text: 'The escort forms up on the road: Muḥammad Big at the head, the companions behind, and between the riders a space they keep around Someone you do not look at directly. They turn, not north toward Ṭihrán, half a day away, but away to the north-west.',
      choices: [{ text: '(Follow.)', next: 'end' }],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { kulaynComplete: true } },
      text: 'Behind you the almond blossom is already falling into the stream. Ahead lie Qazvín; a night on the Zanján road when friends will beg Him to flee, and be sent home; Tabríz; and beyond Tabríz, the mountains of Ádhirbáyján and a fortress called Mákú, where the snow comes early.',
    },
  },
};

export const kulaynTentDialogues: Record<string, DialogueTree> = {
  [kulaynTentQuiet.id]: kulaynTentQuiet,
  [kulaynTentLetter.id]: kulaynTentLetter,
  [kulaynTentGlad.id]: kulaynTentGlad,
  [kulaynTentStruck.id]: kulaynTentStruck,
};
