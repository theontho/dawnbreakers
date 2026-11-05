import type { DialogueTree } from '../../dialogue/types';

/**
 * Inside the Masjid-i-Ílkhání, the evening of 22 May 1844. Mullá Ḥusayn has
 * sent his brother and nephew ahead to wait for him here while he walks out
 * beyond the gate; the mosque's attendant and a student of its school fill in
 * the city around them.
 */

/** The khādim who keeps the lamps and the carpets. */
export const ilkhaniAttendant: DialogueTree = {
  id: 'ch1-ilkhani-attendant',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Mosque Attendant',
      text: '(He is trimming the wicks of the hanging lamps, one by one.) Peace be upon you. The sunset prayer is done; the late worshippers will come when the bazaar shuts. You are with the men from Karbilá?',
      choices: [
        { text: '"I travelled with them. Is there room for us here?"', next: 'room' },
        { text: '"Who comes to this mosque?"', next: 'who' },
      ],
    },
    room: {
      speaker: 'The Mosque Attendant',
      text: 'A mosque is a house that cannot refuse a traveller. Your friends have taken the corner by the west wall. The tall one, their leader, stayed behind at the city gate and has not come in. I have kept a lamp filled for him.',
      choices: [
        { text: '"Thank you. That is kind."' },
        { text: '"Who comes to this mosque?"', next: 'who' },
      ],
    },
    who: {
      speaker: 'The Mosque Attendant',
      onEnter: { set: { metIlkhaniAttendant: true } },
      text: 'Merchants after the bazaar, students from the madrasa, the poor in winter because the floor is warm. Lately, men like your friends: learned men from the shrine cities, asking every porter in Shíráz the same quiet question. Whatever they are looking for, they are in earnest.',
      choices: [{ text: '"So am I."' }],
    },
  },
};

/** A young student of the mosque's school, reading late by the lamps. */
export const ilkhaniStudent: DialogueTree = {
  id: 'ch1-ilkhani-student',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Student of the Madrasa',
      text: '(He looks up from a much-mended book.) Forgive me, I should be asleep. Is it true your leader is Mullá Ḥusayn of Bushrúyih, the foremost of Siyyid Káẓim\'s students? In the madrasa they say he could out-argue anyone in Karbilá.',
      choices: [
        { text: '"It is true. But he has not come to argue."', next: 'search' },
        { text: '"What do they teach you about the Promised One?"', next: 'promised' },
      ],
    },
    search: {
      speaker: 'A Student of the Madrasa',
      text: 'Then why come so far? (He closes the book over his finger.) My teacher says the learned search for proofs, and the sincere search for a person. I did not understand him until I saw your friends praying tonight. They pray like men waiting for a knock at the door.',
      choices: [{ text: '"Perhaps they are."' }],
    },
    promised: {
      speaker: 'A Student of the Madrasa',
      onEnter: { set: { metIlkhaniStudent: true } },
      text: 'That he will come, and that we will not recognise him because we are looking for a king. The year is twelve hundred and sixty; the old men count it on their fingers and go quiet. I would like to be awake when it happens. I would not like to be one of those who argued.',
      choices: [{ text: '"Keep your lamp lit, then."' }],
    },
  },
};

/** The nephew, asleep on the bundles: a moment, not a conversation. */
export const ilkhaniNephew: DialogueTree = {
  id: 'ch1-ilkhani-nephew',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Mullá Ḥusayn\'s nephew sleeps on the saddlebags with one hand on the strap, the way travellers learn to. The dust of the Kázirún road is still in the folds of his cloak. You leave him to his rest.',
    },
  },
};

export const chapter01IlkhaniDialogues: Record<string, DialogueTree> = {
  [ilkhaniAttendant.id]: ilkhaniAttendant,
  [ilkhaniStudent.id]: ilkhaniStudent,
  [ilkhaniNephew.id]: ilkhaniNephew,
};
