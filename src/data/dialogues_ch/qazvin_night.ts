import type { DialogueTree } from '../../dialogue/types';

/**
 * The night of the rescue, 1848. Nabíl tells it: Bahá'u'lláh sent
 * Muḥammad-Hádíy-i-Farhádí from Ṭihrán with a sealed letter; his wife
 * Khátún-Ján went in the guise of a beggar to the house where Qurratu'l-
 * ʿAyn was confined, put the letter in her hands and waited at the
 * entrance until she joined her; three horses waited outside the walls;
 * they rode by an unfrequented road and reached Ṭihrán at daybreak, before
 * the ninth day. Bahá'u'lláh is never seen: the letter, the horses and the
 * house at the end of the road are His, and the Narrator says so.
 */

/** Khátún-Ján, in a beggar's chador, by Mullá Ṣáliḥ's gate. */
export const khatunJan: DialogueTree = {
  id: 'qz-khatun-jan',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A beggar woman sits against the wall by Mullá Ṣáliḥ\'s gate, wrapped to the eyes in a patched chador, a bowl in her lap. She has been there since dusk. Nobody gives her anything. Nobody looks at her twice.',
      choices: [
        { text: '(Drop a coin in her bowl.)', next: 'coin' },
        { text: '(Crouch down beside her.)', next: 'coin' },
      ],
    },
    coin: {
      speaker: 'Khátún-Ján',
      text: 'God reward you. (Her eyes above the veil are sharp and amused, and not a beggar\'s.) You are the one the sister asked to stay near the gate. Good. Then you are a friend, and I can stop whining at you.',
      choices: [{ text: '"Who are you?"', next: 'who' }],
    },
    who: {
      speaker: 'Khátún-Ján',
      text: 'Khátún-Ján, wife of Muḥammad-Hádí Farhádí. This afternoon I begged at that kitchen door, and I put a sealed letter into a certain lady\'s hand. Now I wait here until she comes out to me.',
      choices: [{ text: '"Who sent the letter?"', next: 'sent' }],
    },
    sent: {
      speaker: 'Khátún-Ján',
      onEnter: { set: { qzMetKhatun: true } },
      text: 'Mírzá Ḥusayn-ʿAlí of Núr, in Ṭihrán, who does not mean to let her die here. (She lowers her voice.) My husband waits outside the town wall, past the postern, with horses. Go and tell him the letter is in her hands. Then we will come.',
    },
  },
};

/** Muḥammad-Hádí before the player has met his wife. */
export const hadiWary: DialogueTree = {
  id: 'qz-hadi-wary',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Muḥammad-Hádí',
      text: '(A man stands under the trees with three saddled horses, and his hand goes to his sash as you come through the postern.) Peace. This is no hour for a girl to be walking. Go back in, and forget that you saw horses.',
    },
  },
};

/** Muḥammad-Hádí with the horses, once Khátún-Ján has sent the player. */
export const hadi: DialogueTree = {
  id: 'qz-hadi',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Muḥammad-Hádí',
      text: '(He lets out a long breath.) The letter is in her hands? God be praised. Then my wife has done the hard part, and I only have to ride.',
      choices: [{ text: '"You are Muḥammad-Hádí?"', next: 'who' }],
    },
    who: {
      speaker: 'Muḥammad-Hádí',
      text: 'Muḥammad-Hádí Farhádí, of Qazvín. These horses were sent to the gate last night by Mírzá Ḥusayn-ʿAlí\'s order. We are to be at the outskirts of Ṭihrán by first light, by roads the farráshes do not use, and go straight to His house when the gates open.',
      choices: [{ text: '"Your family has paid dearly this year."', next: 'uncle' }],
    },
    uncle: {
      speaker: 'Muḥammad-Hádí',
      text: 'My uncle, Ḥájí Asadu\'lláh. They said he died of a fever. (He tightens a girth that is already tight.) He was the most honest merchant in Qazvín. If they come for me too, I will at least have done one thing worth the trouble.',
      choices: [{ text: '(Wait with him.)', next: 'wait' }],
    },
    wait: {
      speaker: 'Narrator',
      onEnter: { set: { qzHadiReady: true } },
      text: 'You wait under the orange trees. The town sleeps; a dog barks once and gives it up. Then two women in beggars\' wraps come through the postern, one leading and one following, and walk without hurrying to the horses.',
    },
  },
};

/** Muḥammad-Hádí holding the horses, ready to go. */
export const hadiReady: DialogueTree = {
  id: 'qz-hadi-ready',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Muḥammad-Hádí',
      text: '(He is holding the grey\'s head.) Say what you have to say to her, and quickly. We have a long way to ride before the sun is up.',
    },
  },
};

/** Khátún-Ján by the horses. */
export const khatunJanAfter: DialogueTree = {
  id: 'qz-khatun-jan-after',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Khátún-Ján',
      text: '(She has thrown back the beggar\'s veil and is laughing without a sound, a hand over her mouth.) The women at her door never looked up. A beggar goes where she likes. Remember that, friend, the next time you pass one by.',
    },
  },
};

/** Qurratu'l-ʿAyn at the horses: the ride to Ṭihrán, and the road to Badasht. Completes the chapter. */
export const flight: DialogueTree = {
  id: 'qz-flight',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The woman nearest the horses turns. Under the dark chador you cannot see her face, but you know the voice before she speaks, as you knew it through a curtain and through a door.',
      choices: [{ text: '(Bow your head.)', next: 'speak' }],
    },
    speak: {
      speaker: 'Qurratu\'l-ʿAyn',
      text: 'The daughter of Qazvín. You keep finding me in the dark. (She lays a hand on the grey\'s neck.) I told my cousin God would free me within nine days. It has been eight. I did not know how it would be done. I only knew by Whom.',
      choices: [
        { text: '"Were you afraid?"', next: 'afraid' },
        { text: '"Where will you go?"', next: 'where' },
      ],
    },
    afraid: {
      speaker: 'Qurratu\'l-ʿAyn',
      text: 'Every night. Fear is not the opposite of faith, friend; it is the weather faith walks through. (A pause.) If you see my father, tell him I went out of his house as a daughter, and not as a thief.',
      choices: [{ text: '"Where will you go?"', next: 'where' }],
    },
    where: {
      speaker: 'Qurratu\'l-ʿAyn',
      text: 'To Ṭihrán tonight, and then wherever I am sent. The friends are gathering in the east, toward Khurásán. Something must be said there that has waited a thousand years, and someone must be willing to say it. (She sets her foot in the stirrup.)',
      choices: [{ text: '(Help her up into the saddle.)', next: 'ride' }],
    },
    ride: {
      speaker: 'Narrator',
      text: 'Three riders go out under the trees and are gone. At daybreak they reach the outskirts of Ṭihrán, and when the gates open they ride straight to the house of Bahá\'u\'lláh. In Qazvín, friends and enemies alike search the houses all night and do not find her.',
      choices: [{ text: '(Count the days.)', next: 'ninth' }],
    },
    ninth: {
      speaker: 'Narrator',
      text: 'The ninth day finds her safe under His roof. Even some who opposed her are shaken; her own brother, Mírzá ʿAbdu\'l-Vahháb, declares that day that her Cause is true. Soon Bahá\'u\'lláh sends her quietly out of the capital to an orchard at the foot of the mountains, and from there she sets out toward Khurásán.',
      choices: [{ text: '(Look east.)', next: 'close' }],
    },
    close: {
      speaker: 'Narrator',
      onEnter: { set: { qazvinComplete: true } },
      text: 'You slip home before the call to dawn prayer and tell no one, not even your mother. Bahá\'u\'lláh follows her a few days behind. Summer is coming. In a hamlet called Badasht, between Mázindarán and Khurásán, three gardens are being made ready, and there the Solace of the Eyes will be given another name.',
    },
  },
};

export const qazvinNightDialogues: Record<string, DialogueTree> = {
  [khatunJan.id]: khatunJan,
  [hadiWary.id]: hadiWary,
  [hadi.id]: hadi,
  [hadiReady.id]: hadiReady,
  [khatunJanAfter.id]: khatunJanAfter,
  [flight.id]: flight,
};
