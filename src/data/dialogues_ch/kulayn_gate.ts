import type { DialogueTree } from '../../dialogue/types';

/**
 * Káshán, outside the gate of ʿAṭṭár, the eve of Naw-Rúz 1847 (2 Rabíʿu'th-
 * Thání 1263), after Nabíl's chapter on the Báb's stay in Káshán: Ḥájí
 * Mírzá Jání's dream, the escort coming up the Iṣfahán road, Muḥammad Big
 * prevailing over his colleague so that the Báb may lodge three nights with
 * the merchant, the horsemen lodged in a caravanserai by the gate, and, on
 * the third morning, the farewell. The Báb is never a speaker; His words
 * reach the player only as His host reports them.
 */

/** Ḥájí Mírzá Jání at the gate, before the riders come. */
export const kulaynJaniGate: DialogueTree = {
  id: 'kulayn-jani-gate',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Ḥájí Mírzá Jání',
      text: '(A merchant in a good black kuláh stands outside the gate, watching the Iṣfahán road as if it owed him money.) You have come up that road. Did you pass horsemen? Seven or eight of them, and Someone riding in their midst?',
      choices: [
        { text: '"I have followed their hoofprints from Iṣfahán."', next: 'dream' },
        { text: '"Whom are you waiting for?"', next: 'dream' },
      ],
    },
    dream: {
      speaker: 'Ḥájí Mírzá Jání',
      text: 'Last night I dreamed I stood here, at the gate of ʿAṭṭár, and He came up this road among horsemen, as their prisoner. He wore a merchant\'s kuláh in place of His turban. He said He would be my Guest for three nights, and that I should prepare.',
      choices: [{ text: '"And you believed a dream?"', next: 'prepared' }],
    },
    prepared: {
      speaker: 'Ḥájí Mírzá Jání',
      text: 'I swept the house and ordered a banquet, and I have stood here since the afternoon prayer. My servants think I have lost my wits. (He smiles.) It is the eve of Naw-Rúz. A merchant who loses his wits tonight is only keeping the festival early.',
      choices: [{ text: '(Wait with him.)', next: 'riders' }],
    },
    riders: {
      speaker: 'Narrator',
      onEnter: { set: { kulaynMetJani: true, kulaynRidersCame: true } },
      text: 'The sun goes down behind the walls. Then dust on the road, and horsemen: two officers, a handful of riders, and among them One who rides in a merchant\'s kuláh, as the dream had it. Ḥájí Mírzá Jání goes forward and bends to kiss the stirrup. He is gently stopped, and straightens with his face wet.',
    },
  },
};

/** The merchant, while the officers decide. */
export const kulaynJaniWaiting: DialogueTree = {
  id: 'kulayn-jani-waiting',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Ḥájí Mírzá Jání',
      text: 'He said that tomorrow is Naw-Rúz, and that we would keep it together in my house. (He glances at the two officers.) But it is for them to say whether a prisoner of the Sháh may sleep inside a city. Go and hear them. My heart is beating too loudly for me to listen.',
    },
  },
};

/** The merchant, once Muḥammad Big has prevailed. */
export const kulaynJaniInvite: DialogueTree = {
  id: 'kulayn-jani-invite',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Ḥájí Mírzá Jání',
      text: '(He is laughing and weeping at once.) Three nights! He would have no one come with Him but me. The horsemen rest at the caravanserai, and when I offered to pay for their keep, He said there was no need. Muḥammad Big will walk with Him as far as my door.',
      choices: [{ text: '"Then I will leave you to your Guest."', next: 'come' }],
    },
    come: {
      speaker: 'Ḥájí Mírzá Jání',
      onEnter: { set: { kulaynInvited: true } },
      text: 'Leave? No, no. Come after us, when the lamps are lit. My servants are few, it is the eve of Naw-Rúz, and someone must carry the trays. Go in by this gate and ask anyone for the house of Jání Parpá.',
    },
  },
};

/** Muḥammad Big and his colleague settle where the Prisoner will sleep. */
export const kulaynBigGate: DialogueTree = {
  id: 'kulayn-big-gate',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Muḥammad Big',
      text: '(The officer of the escort is dusty to the eyebrows. His colleague stands at his shoulder with his arms folded.) You are the one who has been riding a day behind us since Iṣfahán. This merchant asks to take the Siyyid into his house for Naw-Rúz.',
      choices: [{ text: '"Will you let Him go?"', next: 'colleague' }],
    },
    colleague: {
      speaker: 'The Second Officer',
      text: 'He will not. Our orders are to keep Him out of every city between Iṣfahán and Ṭihrán. Káshán is a city. (He points at the walls, in case it is in doubt.) If the Grand Vizier hears of this, it is our heads, not the merchant\'s.',
      choices: [{ text: '(Look to Muḥammad Big.)', next: 'big' }],
    },
    big: {
      speaker: 'Muḥammad Big',
      text: 'I asked the Siyyid what He wished, and I said I would abide by it. (To his colleague.) Three nights. The merchant hands Him back to us at this gate on the third morning, and the men rest in the caravanserai. Have you ever known a prisoner ask for less?',
      choices: [{ text: '(Stand back while they argue.)', next: 'argued' }],
    },
    argued: {
      speaker: 'Narrator',
      onEnter: { set: { kulaynLeave: true } },
      text: 'It goes on for some time, in the low hard voices of men who must ride together tomorrow. In the end the second officer throws up his hands and stalks off to the caravanserai. Ḥájí Mírzá Jání is to have his Guest, on condition that he hand Him back safely on the third morning.',
      choices: [{ text: '"Why did you take His side?"', next: 'why' }],
    },
    why: {
      speaker: 'Muḥammad Big',
      text: 'Side? (He rubs his eyes.) I have ridden beside Him for days. He has not once complained of the road, nor of me. When a man like that asks for one thing, you find you would rather give it than refuse it. Go on. The merchant is waiting for you.',
    },
  },
};

/** The officer while the Báb is in the merchant's house. */
export const kulaynBigWaitingGate: DialogueTree = {
  id: 'kulayn-big-gate-after',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Muḥammad Big',
      text: 'The men are at the caravanserai, and my colleague is counting the hours on his fingers. Three nights. Then the road again.',
    },
  },
};

/** The merchant at the gate on the third morning. */
export const kulaynJaniFarewell: DialogueTree = {
  id: 'kulayn-jani-farewell',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Ḥájí Mírzá Jání',
      text: '(He stands by the gate with his hands empty. His eyes are red.) I have handed Him back, as I promised, safe, on the third morning. He would not let me ride out with Him.',
      choices: [{ text: '"What will you do now?"', next: 'now' }],
    },
    now: {
      speaker: 'Ḥájí Mírzá Jání',
      onEnter: { set: { kulaynJaniFarewell: true } },
      text: 'I am a merchant. I will open my shop and sell silk to people who have not seen what I have seen. (A small smile.) But in the Tablet He prayed that my tongue be loosed. I have never in my life won an argument with a mullá. We shall see.',
    },
  },
};

/** Muḥammad Big on the third morning, ready to ride. */
export const kulaynBigMorning: DialogueTree = {
  id: 'kulayn-big-morning',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Muḥammad Big',
      text: '(He is tightening a girth, and nods at you over the saddle.) The merchant kept his word, and I have kept mine. My colleague may breathe again.',
      choices: [{ text: '"Where now?"', next: 'road' }],
    },
    road: {
      speaker: 'Muḥammad Big',
      onEnter: { set: { kulaynRideNorth: true } },
      text: 'Ṭihrán. Our orders keep us clear of Qum, so we go round the walls and out by the villages. Ride with us if you like. You can be no worse company than my colleague.',
    },
  },
};

export const kulaynGateDialogues: Record<string, DialogueTree> = {
  [kulaynJaniGate.id]: kulaynJaniGate,
  [kulaynJaniWaiting.id]: kulaynJaniWaiting,
  [kulaynJaniInvite.id]: kulaynJaniInvite,
  [kulaynBigGate.id]: kulaynBigGate,
  [kulaynBigWaitingGate.id]: kulaynBigWaitingGate,
  [kulaynJaniFarewell.id]: kulaynJaniFarewell,
  [kulaynBigMorning.id]: kulaynBigMorning,
};
