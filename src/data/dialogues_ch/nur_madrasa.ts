import type { DialogueTree } from '../../dialogue/types';

/**
 * The madrasa of Mírzá Ṣáliḥ in Ṭihrán at dusk, summer 1844. Mullá Ḥusayn
 * lodges in one of its cells; Nabíl records that he went out early every
 * morning and came back only an hour after sunset, to shut himself in his
 * room until the next day. Ḥájí Mírzá Muḥammad-i-Khurásání, the leader of
 * the Shaykhís of Ṭihrán, who taught there, has rejected him; his student
 * Mullá Muḥammad-i-Muʿallim of Núr overheard it all through the wall.
 *
 * This chapter's witness is not the pilgrim of the other chapters but a
 * young student of the madrasa, a pupil of the Ḥájí's like the tutor, whose
 * cell is two doors from his (`nur-opening` says so).
 */

/** The chapter's opening narration: who the player is this time. */
export const nurOpening: DialogueTree = {
  id: 'nur-opening',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'In this chapter you are someone else. The pilgrim you have followed from Shíráz has gone down to Búshihr and the sea. Here in Ṭihrán you are a young student of the madrasa of Mírzá Ṣáliḥ, which the quarter calls Pá-Minár, the foot of the minaret.',
      choices: [{ text: '(Listen.)', next: 'who' }],
    },
    who: {
      speaker: 'Narrator',
      onEnter: { set: { nurWitness: true } },
      text: 'You read with Ḥájí Mírzá Muḥammad, the leader of the Shaykhís of the city, and your cell is two doors from his favoured pupil, a tutor from Núr. For some days a tall mullá from Khurásán has lodged in the west cell. Today your teacher quarrelled with him, and the whole court heard it.',
    },
  },
};

/** The madrasa's porter, sweeping the court at the end of the day. */
export const nurPorter: DialogueTree = {
  id: 'nur-porter',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Porter',
      text: '(The old porter is sweeping plane leaves toward the gate.) Still out of your cell, young sir? Your lamp will burn down for nothing. Or are you waiting up for the tall one, like half the court?',
      choices: [
        { text: '"Is he back yet? Mullá Ḥusayn."', next: 'him' },
        { text: '"What did he and the Ḥájí talk of today?"', next: 'haji' },
      ],
    },
    him: {
      speaker: 'The Porter',
      text: 'The tall one with the quiet voice? Not yet. He goes out before the bread is baked and comes back an hour after sunset. Then he shuts his door, and that is the last anyone sees of him.',
      choices: [{ text: '"What did he and the Ḥájí talk of today?"', next: 'haji' }],
    },
    haji: {
      speaker: 'The Porter',
      onEnter: { set: { nurHeardPorter: true } },
      text: 'Your teacher is of Khurásán too, and the head of the Shaykhís of Ṭihrán, and he thought the tall one had come to serve him. (He leans on his broom.) They talked a long while, and not sweetly. If you want my advice, do not mention the one to the other.',
    },
  },
};

/** Ḥájí Mírzá Muḥammad, the Shaykhí teacher, in the evening after he has turned Mullá Ḥusayn away. */
export const nurHaji: DialogueTree = {
  id: 'nur-haji',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Ḥájí Mírzá Muḥammad',
      text: '(Your teacher sits on the rug before his cell, a book open and unread on his knee.) You were at my lesson this morning with your mind in the court. Do not tell me you too have been listening to that man from Bushrúyih.',
      choices: [
        { text: '"The whole court is talking of him, Ḥájí."', next: 'shiraz' },
        { text: '"He was a disciple of the late Siyyid Káẓim, whom you revere."', next: 'kazim' },
      ],
    },
    shiraz: {
      speaker: 'Ḥájí Mírzá Muḥammad',
      text: 'Of course it is. He comes from Shíráz, and everything is from Shíráz now.',
      choices: [{ text: '"What has he done to offend you?"', next: 'hope' }],
    },
    kazim: {
      speaker: 'Ḥájí Mírzá Muḥammad',
      text: 'Then you know what the Siyyid was to us, and what Mullá Ḥusayn was to him.',
      choices: [{ text: '"What has he done to offend you?"', next: 'hope' }],
    },
    hope: {
      speaker: 'Ḥájí Mírzá Muḥammad',
      text: 'We had hoped that after the Siyyid\'s death he would take up the cause of the Shaykhís and lift us out of the obscurity we have sunk into. Instead he brings us a new Revelation, a new Book, and a Gate.',
      choices: [{ text: '"Did you hear him out?"', next: 'heard' }],
    },
    heard: {
      speaker: 'Ḥájí Mírzá Muḥammad',
      text: 'I heard enough. I told him he has betrayed us, and that if he goes on spreading these doctrines he will put out what is left of the Shaykhís in this city.',
      choices: [{ text: '"And what did he say?"', next: 'answer' }],
    },
    answer: {
      speaker: 'Ḥájí Mírzá Muḥammad',
      onEnter: { set: { nurHeardHaji: true } },
      text: 'That he does not mean to stay long in Ṭihrán, and that he has no wish to abase the teachings of Shaykh Aḥmad and the Siyyid. (He closes the book.) Courteous. He was always courteous. Go to your cell, boy. Good night.',
    },
  },
};

/** The Ḥájí the morning after; he has heard nothing of the night. */
export const nurHajiMorning: DialogueTree = {
  id: 'nur-haji-morning',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Ḥájí Mírzá Muḥammad',
      text: 'Your friend is in high spirits this morning, I am told. (He does not look up from his book.) Let him sing in Khurásán.',
    },
  },
};

/** Mullá Muḥammad-i-Muʿallim of Núr at his door, which adjoins his teacher's. */
export const nurTutor: DialogueTree = {
  id: 'nur-tutor',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Muḥammad-i-Muʿallim',
      text: '(The tutor from Núr stands at his door, as if he had just been about to go in for some time.) Peace be upon you, brother. You were in the court today. Did you hear them?',
      choices: [
        { text: '"Only the Ḥájí\'s voice, raised."', next: 'wall' },
        { text: '"Your teacher was not pleased with him."', next: 'wall' },
      ],
    },
    wall: {
      speaker: 'Mullá Muḥammad-i-Muʿallim',
      text: 'My cell adjoins my teacher\'s. When they spoke today I heard every word through the wall, from the first to the last. I am his student. I am thought one of his favoured students.',
      choices: [{ text: '"And what did you hear?"', next: 'heard' }],
    },
    heard: {
      speaker: 'Mullá Muḥammad-i-Muʿallim',
      text: 'A young man speaking with such ardour, such fluency and learning, as I have never heard. And my teacher answering him with evasions, and with contempt. (He lowers his voice.) I was ashamed. I said nothing.',
      choices: [
        { text: '"Go and speak with him."', next: 'notYet' },
        { text: '"You are a Shaykhí, as he is."', next: 'nur' },
      ],
    },
    nur: {
      speaker: 'Mullá Muḥammad-i-Muʿallim',
      text: 'A Shaykhí of Núr, who tutors the sons of the great houses for his bread. I loved Shaykh Aḥmad and Siyyid Káẓim as he does. (He glances at his teacher\'s door.) I should go and speak with him, I know it.',
      choices: [{ text: '"Then go."', next: 'notYet' }],
    },
    notYet: {
      speaker: 'Mullá Muḥammad-i-Muʿallim',
      onEnter: { set: { nurMetTutor: true } },
      text: 'Not while the court is awake and my teacher is sitting at his door. When the lamps are out. (He tries to smile.) You will keep this to yourself?',
    },
  },
};

/** The tutor after Mullá Ḥusayn has come in, waiting for the court to sleep. */
export const nurTutorWaiting: DialogueTree = {
  id: 'nur-tutor-waiting',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Muḥammad-i-Muʿallim',
      text: 'He has come in. I saw his lamp. (He is very pale.) At midnight, when the Ḥájí\'s lamp is out. Go and sit by him, brother, so that he is not alone. I will come.',
    },
  },
};

/** Mullá Ḥusayn's door before the player has heard the madrasa. */
export const nurCellShut: DialogueTree = {
  id: 'nur-cell-shut',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A lamp burns on a reed mat before a shut door: someone has trimmed it and left it for him. A pen case, a closed book. He is not back. The porter, the old teacher at the lit cell, and the young man at the next door all glance this way when they think you are not looking.',
    },
  },
};

/** The vigil by the lamp, until Mullá Ḥusayn comes in an hour after sunset. */
export const nurCellWait: DialogueTree = {
  id: 'nur-cell-wait',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'You sit down by the lamp on the edge of the platform, where you have no business to be. The sky over the arcade goes from copper to ash. The other students go in one by one. The Ḥájí\'s lamp burns on.',
      choices: [{ text: '(Wait.)', next: 'comes' }],
    },
    comes: {
      speaker: 'Narrator',
      onEnter: { set: { nurHusaynBack: true } },
      text: 'An hour after sunset the gate opens and a tall figure crosses the court alone, dust to the knees. He stops when he sees you. Then he lifts the lamp and holds it to your face.',
    },
  },
};

export const nurMadrasaDialogues: Record<string, DialogueTree> = {
  [nurOpening.id]: nurOpening,
  [nurPorter.id]: nurPorter,
  [nurHaji.id]: nurHaji,
  [nurHajiMorning.id]: nurHajiMorning,
  [nurTutor.id]: nurTutor,
  [nurTutorWaiting.id]: nurTutorWaiting,
  [nurCellShut.id]: nurCellShut,
  [nurCellWait.id]: nurCellWait,
};
