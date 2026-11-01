import type { DialogueTree } from '../../dialogue/types';

/**
 * The prison under the serai through the winter of 1845, while the Páshá's
 * letter goes to Istanbul and the answer comes back. Mullá ʿAlí had been
 * bidden, like all the Letters of the Living, to proclaim that the Gate had
 * opened without yet naming Him; what he says here keeps to that and to
 * what Nabíl records of Najaf. The jailer and the debtor are fictional.
 */

/** The jailer at his brazier, before he lets the player through. */
export const jailer: DialogueTree = {
  id: 'bg-jailer',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Jailer',
      text: '(A heavy man in a sheepskin, warming his hands over a brazier at the foot of the steps.) Visitors? Down here? Go back up, ink-boy, before I find you a niche of your own.',
      choices: [
        { text: '"A student sent bread for the Persian."', next: 'bread' },
        { text: '"My father is the boatman Ḥasan, of Karkh."', next: 'father' },
      ],
    },
    father: {
      speaker: 'The Jailer',
      text: 'Ḥasan the boatman? (He squints.) He took my wife over in the flood year, when the bridge was cut, and would not take a coin for it. Hm. What is in the cloth?',
      choices: [{ text: '"Bread for the Persian."', next: 'bread' }],
    },
    bread: {
      speaker: 'The Jailer',
      text: 'He has eaten nothing but what the Páshá gives, and the Páshá is not generous. (He prods the bundle, finds nothing in it but bread and dates.) He prays half the night. Quietly, so as not to wake the thieves. I have had worse guests.',
      choices: [{ text: '"May I take it to him?"', next: 'let' }],
    },
    let: {
      speaker: 'The Jailer',
      onEnter: { set: { bgJailerLetIn: true } },
      text: '(He jerks his head toward the back of the vault.) The niche by the grating. Be quick, and if anyone asks, you were never here and I was asleep.',
    },
  },
};

/** The jailer once he has let the player through. */
export const jailerAfter: DialogueTree = {
  id: 'bg-jailer-after',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Jailer',
      text: '(He does not look up from the coals.) Still here? Quick, I said. And mind, tell your father I asked after him.',
    },
  },
};

/** Mullá ʿAlí, before the jailer has let the player through. */
export const aliBarred: DialogueTree = {
  id: 'bg-ali-barred',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'At the back of the vault, in the niche under the grating, a man sits on the straw with his back to the wall. Between you and him is the jailer\'s brazier, and the jailer.',
    },
  },
};

/** Mullá ʿAlí in his niche. */
export const aliPrison: DialogueTree = {
  id: 'bg-ali-prison',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Mullá ʿAlí sits on the straw under the grating, where a little grey light comes down from the quay. He looks at the bundle, and then at you, and smiles.',
      choices: [{ text: '(Give him the bread.)', next: 'bread' }],
    },
    bread: {
      speaker: 'Mullá ʿAlíy-i-Basṭámí',
      text: 'Bread from a stranger, on a cold night. God reward you. You were at the scribes\' desk today. I saw your hands, black to the wrist.',
      choices: [{ text: '"A student from Karbilá sent it."', next: 'student' }],
    },
    student: {
      speaker: 'Mullá ʿAlíy-i-Basṭámí',
      text: 'Then he is braver than he thinks. Tell him I ate it, and prayed for him. (He breaks the loaf in two, and passes half to the man asleep in the next niche, who wakes enough to take it.)',
      choices: [
        { text: '"Why would you not say the name, before them all?"', next: 'name' },
        { text: '"What happened in Najaf?"', next: 'najaf' },
      ],
    },
    najaf: {
      speaker: 'Mullá ʿAlíy-i-Basṭámí',
      text: 'I went to the greatest of them, Shaykh Muḥammad-Ḥasan. I told him the Promised One had come, and laid the pages before him. He called me a heretic in front of his students, and they put me out. A few days later the governor\'s men came for me.',
      choices: [{ text: '"Why would you not say the name, before them all?"', next: 'name' }],
    },
    name: {
      speaker: 'Mullá ʿAlíy-i-Basṭámí',
      text: 'Because it is not mine to give. I was sent to say that the Gate has opened, and to show what has come through it. The name will be spoken when He wills, and not by a prisoner bargaining for his life.',
      choices: [{ text: '"Are you afraid of Istanbul?"', next: 'afraid' }],
    },
    afraid: {
      speaker: 'Mullá ʿAlíy-i-Basṭámí',
      text: 'On the road from Shíráz I was afraid I would be found unworthy of what I carried. I am less afraid now. (He turns his face up to the grating.) Listen. You can hear your father\'s river from here.',
      choices: [{ text: '"Is there anything I can do?"', next: 'ask' }],
    },
    ask: {
      speaker: 'Mullá ʿAlíy-i-Basṭámí',
      text: 'One thing. If ever a Persian pilgrim asks at the bridge of boats what became of Mullá ʿAlí of Basṭám, tell him I was not alone in Baghdád. Tell him a boatman\'s son brought me bread.',
      choices: [{ text: '(Promise him.)', next: 'weeks' }],
    },
    weeks: {
      speaker: 'Narrator',
      onEnter: { set: { bgSpokeWithAli: true } },
      text: 'You come back with bread on other nights, through the rest of the winter, while the Páshá\'s letter goes to Istanbul and the answer comes slowly back. Then one morning, before it is light, your father shakes you awake. They are bringing the Persian out.',
    },
  },
};

/** A debtor in the next niche. */
export const prisoner: DialogueTree = {
  id: 'bg-prisoner',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Prisoner',
      text: '(A porter of the bazaar, in for a debt of eleven piastres, wrapped in a torn blanket.) The Persian? He gives away half of what he is given, and says his prayers so softly you would think he was ashamed of them. A strange heretic. I have known pious men who snored louder.',
      choices: [{ text: '"Does he ever speak of what he believes?"', next: 'speak' }],
    },
    speak: {
      speaker: 'A Prisoner',
      onEnter: { set: { bgHeardPrisoner: true } },
      text: 'To me? (He laughs, and coughs.) He asked my name, and my children\'s names, and he says them in his prayers. That is all the preaching I have had from him. It is more than the muftí ever did for me.',
    },
  },
};

export const baghdadPrisonDialogues: Record<string, DialogueTree> = {
  [jailer.id]: jailer,
  [jailerAfter.id]: jailerAfter,
  [aliBarred.id]: aliBarred,
  [aliPrison.id]: aliPrison,
  [prisoner.id]: prisoner,
};
