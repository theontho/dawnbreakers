import type { DialogueTree } from '../../dialogue/types';

/**
 * The masjid of Chinár-Súkhtih. Nabíl records that Vaḥíd, arriving on the
 * forenoon of 15 Rajab 1266, went to the masjid before his own house, still
 * in the dust of the road, and preached from its pulpit; that the people
 * answered "We have heard, and we obey!"; and that in those days about a
 * thousand of the quarter and five hundred more of Nayríz believed. That he
 * told the crowd at Yazd his sword was a gift and that he was forbidden to
 * wage war on the people is also Nabíl's.
 */

/** The sermon: arrival turns to the gathering. */
export const vahidSermon: DialogueTree = {
  id: 'nz-vahid-sermon',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The masjid of Chinár-Súkhtih is full to the walls, and men stand in the doorway on one another\'s heels. Vaḥíd has come straight from the road, its dust still on his cloak. He climbs the pulpit and begins.',
      choices: [{ text: '(Listen.)', next: 'sermon' }],
    },
    sermon: {
      speaker: 'Narrator',
      text: 'He tells them of a young merchant of Shíráz, of three audiences, of verses written unasked faster than a scribe could set them down. He tells them he went to judge, and was judged. He does not raise his voice. At the back of the hall you can hear a child breathing.',
      choices: [{ text: '(Listen.)', next: 'answer' }],
    },
    answer: {
      speaker: 'Narrator',
      onEnter: { set: { nzHeardSermon: true } },
      text: 'When he ends, one voice cries out, and then the whole hall: "We have heard, and we obey!" Before many days are out, some fifteen hundred souls of Nayríz will have answered so, a thousand of them of this one quarter.',
      choices: [{ text: '(Go to him when the crowd thins.)', next: 'peace' }],
    },
    peace: {
      speaker: 'Vaḥíd',
      text: '(He is older than his voice, grey in the beard, the road still in the creases of his cloak.) A son of this quarter. You walked out on the road to meet me, I think, against the governor\'s word. Sit, sit. I have come home, you see.',
      choices: [{ text: '"Is this home?"', next: 'home' }],
    },
    home: {
      speaker: 'Vaḥíd',
      text: 'My wife\'s people are of Nayríz, and my house is in this quarter. When I left Yazd, they were pulling my house down behind me. (He shrugs.) It was built to be given away. Where else would I come but here?',
      choices: [{ text: '"They say the governor is gathering men."', next: 'sword' }],
    },
    sword: {
      speaker: 'Vaḥíd',
      text: 'Then they ask whether I have come to make war. (He touches the sword at his side.) This was a gift, and I am forbidden to draw it against the people. I have come to tell what I have seen. Let the governor do what governors do.',
      choices: [{ text: '(Wait.)', next: 'days' }],
    },
    days: {
      speaker: 'Narrator',
      text: 'In the days that follow he preaches here every day, and every day more come. In Quṭrih, Zaynu\'l-ʿÁbidín Khán gathers horse and foot, a thousand of them, and comes back to his house in the Bázár quarter. He fortifies its roof.',
    },
  },
};

/** Vaḥíd by the pulpit on the night of the muskets: the letter to the wounded elder. */
export const vahidLetter: DialogueTree = {
  id: 'nz-vahid-letter',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Vaḥíd',
      text: '(The hall is lamplit and half empty. He sits by the pulpit, writing.) You have heard? Mullá ʿAbdu\'l-Ḥusayn was at his prayers on his own roof, and they fired on him from the governor\'s. A ball in his right foot. Eighty years old.',
      choices: [{ text: '"Is he alive?"', next: 'alive' }],
    },
    alive: {
      speaker: 'Vaḥíd',
      text: 'Alive, and indignant, they tell me, that his prayer was interrupted. (He folds the paper and seals it.) I cannot go to him tonight without bringing the muskets down on his house. Will you carry this?',
      choices: [{ text: '(Take the letter.)', next: 'take' }],
    },
    take: {
      speaker: 'Vaḥíd',
      onEnter: { set: { nzCarryingLetter: true } },
      text: 'Tell him I sit with him in spirit. His house is by the west end of the lane. (He looks at the empty places on the carpets.) Some who cried loudest in this hall have gone home by the back lanes tonight. I do not blame them. Fear is not a sin.',
    },
  },
};

export const nayrizMosqueDialogues: Record<string, DialogueTree> = {
  [vahidSermon.id]: vahidSermon,
  [vahidLetter.id]: vahidLetter,
};
