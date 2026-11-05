import type { DialogueTree } from '../../dialogue/types';

/**
 * The Masjid of Baráthá, on the road from Karbilá to Kázimayn, at noon
 * (Nabíl, chapter II): Siyyid Káẓim rests with his companions, and an Arab
 * shepherd comes to tell him of a dream. He receives it calmly; it is his
 * companions who grieve.
 */

/** Siyyid Káẓim resting in the shade, before the shepherd speaks. */
export const kazimBaratha: DialogueTree = {
  id: 'fr-kazim-baratha',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Siyyid Káẓim',
      text: '(He sits in the shade of the old masjid\'s wall, his cloak drawn round him, watching the pasture.) The noon prayer, and a little bread, and then on to Kázimayn. (He nods toward the flock.) That shepherd has been looking at us since we came. Go and see what he wants.',
    },
  },
};

/** The young student from Khurásán, on the road. */
export const seekerBaratha: DialogueTree = {
  id: 'fr-seeker-baratha',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Student from Khurásán',
      text: 'This is the Masjid of Baráthá. They say the Imám ʿAlí prayed here on his way back from war, and that a Christian hermit\'s cell stood on this ground before it. (He looks at the shepherd.) That man keeps edging closer, like someone with a message he does not want to give.',
    },
  },
};

/** The shepherd's dream, and the Siyyid's answer. */
export const shepherd: DialogueTree = {
  id: 'fr-shepherd',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'An Arab Shepherd',
      text: '(A lean man with a crook, his headcloth faded by the sun. He looks past you at the Siyyid.) Is that Siyyid Káẓim of Karbilá? I must speak to him. I have waited here three days.',
      choices: [{ text: '(Bring him to the Siyyid.)', next: 'brought' }],
    },
    brought: {
      speaker: 'An Arab Shepherd',
      text: '(He kneels on the dust before the Siyyid and kisses his hand.) Master, three days ago I fell asleep in this pasture among my sheep, and in my sleep I saw the Prophet of God, peace be upon him. He told me: go to the Masjid of Baráthá. At noon one of My sons, Siyyid Káẓim, will come there.',
      choices: [{ text: '(Listen.)', next: 'message' }],
    },
    message: {
      speaker: 'An Arab Shepherd',
      text: 'He said: greet him from Me, and tell him to rejoice, for the hour of his going is at hand. When he has made his visits at Kázimayn and come home to Karbilá, three days after, on the day of ʿArafih, he will come to Me. (His voice shakes.) Forgive me, master. I am only a shepherd. I would not have said it if I had not been told to.',
      choices: [{ text: '(Look at the Siyyid.)', next: 'calm' }],
    },
    calm: {
      speaker: 'Siyyid Káẓim',
      text: '(He lifts the shepherd up by both hands, and is smiling.) There is nothing to forgive, my friend. Your dream is true, and you have done what you were told. Sit, and eat with us.',
      choices: [{ text: '(Around you, the companions begin to weep.)', next: 'weep' }],
    },
    weep: {
      speaker: 'Siyyid Káẓim',
      text: 'Why do you weep? Is it not your wish that I should go, so that He whom you await may appear? My going is a gate for Him. Be glad of it, as I am.',
      choices: [
        { text: '"Master, we are not ready."', next: 'ready' },
        { text: '(Say nothing. Hold the shepherd\'s cup while he eats.)', next: 'end' },
      ],
    },
    ready: {
      speaker: 'Siyyid Káẓim',
      text: 'No one is ever ready. That is why you must go out and seek, and not wait for readiness to come to you in Karbilá. (He tears the bread and hands half to the shepherd.) It is some weeks yet to ʿArafih. Let us use them.',
      choices: [{ text: '(Go on.)', next: 'end' }],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { frForetold: true } },
      text: 'They say the noon prayer together, the Siyyid and his students and the shepherd, in the shade of the masjid wall. Then the party rides on to Kázimayn, and a few days later turns south again for home. The road back to Karbilá runs south-east, past the palms.',
    },
  },
};

export const forerunnersRoadDialogues: Record<string, DialogueTree> = {
  [kazimBaratha.id]: kazimBaratha,
  [seekerBaratha.id]: seekerBaratha,
  [shepherd.id]: shepherd,
};
