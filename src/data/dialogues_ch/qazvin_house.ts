import type { DialogueTree } from '../../dialogue/types';

/**
 * The house of Ḥájí Mullá Ṣáliḥ in Qazvín, 1847 to 1848. Her father, "a
 * peace-loving and fair-minded man" in Nabíl's words, who failed to make
 * peace in his family; the closed door of the women's court, where she is
 * confined and spoken to only through the wood; her sister Marḍíyyih, who
 * carries her challenge of nine days to the new Imám-Jumʿih, her husband.
 * The weeks between are told: Shaykh Ṣáliḥ's death in Ṭihrán, and the
 * killing of the prisoners sent back to Qazvín (Nabíl, chapter XV).
 */

/** Mullá Ṣáliḥ by his pool, three days after his brother's death. */
export const father: DialogueTree = {
  id: 'qz-father',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ṣáliḥ',
      text: '(An old man in a white turban sits by the pool with a book he is not reading.) A daughter of the quarter? Forgive me if I do not rise. My brother is three days in his grave, and I have not slept since.',
      choices: [
        { text: '"I am sorry for your brother."', next: 'brother' },
        { text: '"I came to ask after your daughter."', next: 'daughter' },
      ],
    },
    brother: {
      speaker: 'Mullá Ṣáliḥ',
      text: 'He was a hard man, Taqí. A great scholar, and hard. He could not abide the Shaykhís, nor anything that smelled of them. (He closes the book.) But he was my brother, and he was killed at his prayers. There is no defending that, whoever did it.',
      choices: [{ text: '"And your daughter?"', next: 'daughter' }],
    },
    daughter: {
      speaker: 'Mullá Ṣáliḥ',
      text: 'Fáṭimih. (He says the name gently.) I taught her myself when she was small. She learned faster than her brothers, faster than I could teach her. I used to say: if only she had been a boy. (A pause.) I do not say it any more.',
      choices: [{ text: '"Where is she now?"', next: 'where' }],
    },
    where: {
      speaker: 'Mullá Ṣáliḥ',
      text: 'Behind that door, in the women\'s court. My brother\'s sons say she ordered his death, and they have set women to watch her day and night. She may leave her room to make her ablutions, and for nothing else. In my own house. (His hands tremble on the book.)',
      choices: [{ text: '"Do you believe she did it?"', next: 'believe' }],
    },
    believe: {
      speaker: 'Mullá Ṣáliḥ',
      text: 'No. Her tongue is sharp, God knows. She sent word to my nephew that she would not be his wife in this world or the next. But a knife in the dark? Never. (He looks at the closed door.) I tried to make peace between them. I have failed at everything this year except loving her.',
      choices: [{ text: '"May I speak with her?"', next: 'speak' }],
    },
    speak: {
      speaker: 'Mullá Ṣáliḥ',
      onEnter: { set: { qzMetFather: true } },
      text: 'Through the door, if she wishes it. Say who you are; she remembers every friend from Karbilá. (He opens the book again.) And if you are one of hers, keep it from your neighbours. My nephews have long memories and short tempers.',
    },
  },
};

/** The closed door of the women's court: her voice through the wood. */
export const door: DialogueTree = {
  id: 'qz-door',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A plain door of walnut, studded with iron, in the wall of the women\'s court. Her cousins\' women keep the key, and they let no one through, not even a woman. On the far side, slippers on stone, then stillness. Someone is listening.',
      choices: [{ text: '(Say your name, and that you knelt at her curtain in Karbilá.)', next: 'voice' }],
    },
    voice: {
      speaker: 'Qurratu\'l-ʿAyn',
      text: 'Karbilá! (A soft laugh through the wood.) The daughter of Qazvín who knelt at the curtain\'s edge, on the night of the bright dresses. And now you find me behind another curtain. This one is made of walnut.',
      choices: [
        { text: '"Are they treating you well?"', next: 'well' },
        { text: '"They say you ordered the killing."', next: 'killing' },
      ],
    },
    well: {
      speaker: 'Qurratu\'l-ʿAyn',
      text: 'They feed me, and watch me eat. Two of my uncle\'s women sit at my door even while I pray. (A pause.) My father comes and stands where you are standing, and says nothing, and goes away. That is the hardest part.',
      choices: [{ text: '"They say you ordered the killing."', next: 'killing' }],
    },
    killing: {
      speaker: 'Qurratu\'l-ʿAyn',
      text: 'I know what they say. I did not wish my uncle dead; I wished him awake. The man who struck him has said before the governor that it was his own anger, for Shaykh Aḥmad\'s sake. (Her voice hardens.) And for that, they are hunting every friend I have in Qazvín.',
      choices: [{ text: '"What can I do?"', next: 'do' }],
    },
    do: {
      speaker: 'Qurratu\'l-ʿAyn',
      onEnter: { set: { qzHeardDoor: true } },
      text: 'Nothing, today. Pray for Shaykh Ṣáliḥ; they have taken him to Ṭihrán in chains, and he went singing. (The slippers move away from the door, then come back.) And remember: I was not born in this room. I will not end in it.',
    },
  },
};

/** Marḍíyyih before the player has heard the town and the house. */
export const mardiyyihWait: DialogueTree = {
  id: 'qz-mardiyyih-wait',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Marḍíyyih',
      text: '(She is in grey now, and she does not smile.) Not yet, friend. Hear what the town is saying, and sit with my father, and go to her door. Then come back to me, and I will tell you what she has told me.',
    },
  },
};

/** Marḍíyyih: the weeks after the arrests, and the challenge of nine days. */
export const mardiyyih: DialogueTree = {
  id: 'qz-mardiyyih',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Marḍíyyih',
      text: 'You have heard it all, then: the lane, my father, the door. (She draws her chador closer.) Come away from the pool. I do not want my cousins\' women to see me talking to you.',
      choices: [{ text: '"What has happened?"', next: 'weeks' }],
    },
    weeks: {
      speaker: 'Narrator',
      text: 'Weeks pass, and the news comes in from Ṭihrán like stones through a window. The heirs have named Shaykh Ṣáliḥ the murderer, and he has been put to death in the capital, the first of the believers to shed his blood on the soil of Persia. He went to the gallows, they say, as if to meet a friend.',
      choices: [{ text: '(Bow your head.)', next: 'weeks2' }],
    },
    weeks2: {
      speaker: 'Narrator',
      text: 'The other prisoners are handed back to the heirs, to be pardoned in Qazvín. Ḥájí Asadu\'lláh dies in the night before they leave Ṭihrán, of an illness no one believes in. Mullá Ṭáhir and Mullá Ibráhím are killed by a mob in the streets of this town, and no one raises a voice.',
      choices: [{ text: '(Listen to Marḍíyyih.)', next: 'after' }],
    },
    after: {
      speaker: 'Marḍíyyih',
      text: 'And now my cousin, her husband, who sits in his father\'s place as Imám-Jumʿih, has turned his eyes on her. She knows it. She gave me a message for him, and made me say it to his face.',
      choices: [{ text: '"What did she say?"', next: 'nine' }],
    },
    nine: {
      speaker: 'Marḍíyyih',
      text: 'She gave him the verse of the Qur\'án: they would put out God\'s light with their mouths, but God will perfect His light. Then: if my Cause is the truth, God will deliver me from you before nine days are out. If He does not, do as you please, and you will have proved me false.',
      choices: [{ text: '"And what did he answer?"', next: 'answer' }],
    },
    answer: {
      speaker: 'Marḍíyyih',
      onEnter: { set: { qzNight: true } },
      text: 'Nothing. He laughed, and then he stopped laughing, and sent me away. (She looks at the door in the wall.) That was eight days ago. It is nearly dark. Stay near the gate tonight, friend. I do not know why I ask it. Only stay.',
    },
  },
};

/** Marḍíyyih on the night of the rescue. */
export const mardiyyihNight: DialogueTree = {
  id: 'qz-mardiyyih-night',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Marḍíyyih',
      text: '(A lamp in her hand, shaded by her sleeve.) Go out to the lane. A beggar woman came to the kitchen door this afternoon, and my sister has been very quiet since. (She lowers the lamp.) I have not asked her why. I am not going to.',
    },
  },
};

/** Mullá Ṣáliḥ in the dark by the pool. */
export const fatherNight: DialogueTree = {
  id: 'qz-father-night',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ṣáliḥ',
      text: '(He sits by the pool without a lamp.) The friend from Karbilá? Go out to the lane, then. An old man does not sleep. He only closes his eyes. (He does not look at you, or at the door.)',
    },
  },
};

/** The closed door at night. */
export const doorNight: DialogueTree = {
  id: 'qz-door-night',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The door is shut. Behind it no slippers, no breath. Only, through the crack at the sill, the smell of a lamp just put out.',
    },
  },
};

export const qazvinHouseDialogues: Record<string, DialogueTree> = {
  [father.id]: father,
  [door.id]: door,
  [mardiyyihWait.id]: mardiyyihWait,
  [mardiyyih.id]: mardiyyih,
  [mardiyyihNight.id]: mardiyyihNight,
  [fatherNight.id]: fatherNight,
  [doorNight.id]: doorNight,
};
