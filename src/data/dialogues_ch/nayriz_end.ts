import type { DialogueTree } from '../../dialogue/types';

/**
 * The quarter at dusk, after the companions came down from the fort. From
 * Nabíl: the companions were set upon at the edge of the town and fought
 * their way to the Masjid-i-Jámiʿ; Ḥájí Siyyid ʿÁbid had carried Vaḥíd's
 * secret warning to the governor and brought the companions the letter he
 * was made to write; an officer who said he had sworn no oath found men
 * whose kin had fallen below the fort; they wound Vaḥíd's turban about his
 * neck, bound him to a horse and dragged him through the streets; his last
 * words were those of the Imám Ḥusayn; it was 18 Shaʿbán 1266, and ten
 * days later the Báb was martyred in Tabríz. Told by a witness, briefly.
 */

/** The boy, after the ambush at the edge of the town. */
export const boyAmbush: DialogueTree = {
  id: 'nz-boy-ambush',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Boy of Chinár-Súkhtih',
      text: '(The boy is shaking, his coat torn at the shoulder.) They were waiting at the edge of the town. The governor\'s men. They let ours come down the road with their hands empty, and then...',
      choices: [{ text: '(Sit down beside him.)', next: 'sit' }],
    },
    sit: {
      speaker: 'A Boy of Chinár-Súkhtih',
      onEnter: { set: { nzHeardAmbush: true } },
      text: 'Ours ran for the Masjid-i-Jámiʿ, those who could, and held it. I hid in the hollow of the plane tree, like when I was little. (He swallows.) Nobody can tell me where the Siyyid is. Nobody. Go to my mother. She will know.',
    },
  },
};

/** The boy's mother, before the boy has been found. */
export const womanWait: DialogueTree = {
  id: 'nz-woman-wait',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Woman of Chinár-Súkhtih',
      text: '(She stands in her doorway, very still.) I heard firing at the edge of the town. My son ran out to meet them coming down. Find him. Please. Then come back.',
    },
  },
};

/** The boy's mother tells what became of Vaḥíd. */
export const womanEnd: DialogueTree = {
  id: 'nz-woman-end',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Woman of Chinár-Súkhtih',
      text: '(It is some days before the quarter learns the whole of it. She sits on her doorstep without a lamp, her son asleep with his head in her lap.) Ḥájí Siyyid ʿÁbid. Vaḥíd gave him two letters. One they made him write: go home. One he wrote in secret: do not believe them. ʿÁbid took the secret one to the governor, and brought you the other.',
      choices: [{ text: '"And Vaḥíd?"', next: 'vahid' }],
    },
    vahid: {
      speaker: 'A Woman of Chinár-Súkhtih',
      text: 'Once the fort was empty, they had no more use for the oath. One of the officers said he had sworn nothing, and he found men whose brothers and fathers had fallen below the fort. (Her voice is steady.) They took the turban from his head and wound it about his neck.',
      choices: [{ text: '(Wait.)', next: 'streets' }],
    },
    streets: {
      speaker: 'A Woman of Chinár-Súkhtih',
      text: 'They bound him to a horse, and dragged him through these streets. (She is silent a long while.) Those who were near say that at the last he spoke the words of the Imám Ḥusayn: "Thou knowest, O my Beloved, that I have abandoned the world for Thy sake, and have placed my trust in Thee alone."',
      choices: [{ text: '(Stay with her.)', next: 'stay' }],
    },
    stay: {
      speaker: 'A Woman of Chinár-Súkhtih',
      onEnter: { set: { nzHeardEnd: true } },
      text: 'Go and stand at his door. I cannot, not tonight. Somebody should.',
    },
  },
};

/** Vaḥíd's street door, before the end is known. */
export const vahidDoorShut: DialogueTree = {
  id: 'nz-vahid-door-shut',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The door of Vaḥíd\'s house in Chinár-Súkhtih, in its street wall, shut. There is a niche beside it for a lamp.',
    },
  },
};

/** At Vaḥíd's door: the chapter's close. */
export const close: DialogueTree = {
  id: 'nz-close',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'You stand at Vaḥíd\'s door in the dusk. The lamp in its niche is unlit. Down the lane the burnt plane tree holds up its dead limb and its living ones against the last of the light.',
      choices: [{ text: '(Light the lamp.)', next: 'lamp' }],
    },
    lamp: {
      speaker: 'Narrator',
      text: 'Siyyid Yaḥyá of Dáráb, called Vaḥíd, the Peerless, was slain at Nayríz on the eighteenth of Shaʿbán, the twenty-ninth of June 1850. He had gone to Shíráz to judge, and had set his learning down like a lamp in daylight. The fort of Khájih was burned, and the men of the quarter were led away in chains to Shíráz.',
      choices: [{ text: '(Wait.)', next: 'tabriz' }],
    },
    tabriz: {
      speaker: 'Narrator',
      onEnter: { set: { nayrizComplete: true } },
      text: 'In Chinár-Súkhtih the women keep the lamps, and you keep his. Ten days from now, far to the north, a regiment will be drawn up at noon before a wall in the barrack square of Tabríz, and the pilgrim you have followed since Shíráz will be there to see it.',
    },
  },
};

export const nayrizEndDialogues: Record<string, DialogueTree> = {
  [boyAmbush.id]: boyAmbush,
  [womanWait.id]: womanWait,
  [womanEnd.id]: womanEnd,
  [vahidDoorShut.id]: vahidDoorShut,
  [close.id]: close,
};
