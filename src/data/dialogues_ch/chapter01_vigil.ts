import type { DialogueTree } from '../../dialogue/types';
import { heed, heededAt } from '../../dialogue/voices';
import { rumourCount } from './chapter01_rumourFlags';

/**
 * The night of 22 May 1844, told from outside the door. The Báb is never a
 * speaking character: the player keeps vigil at the threshold, and at dawn
 * Mullá Ḥusayn recounts what passed within. His testimony is the story
 * speaking of the Báb, as AGENTS.md requires.
 */

/** Mullá Ḥusayn at the city gate: the companion the player travelled with. */
export const mullaHusaynAtGate: DialogueTree = {
  id: 'ch1-mulla-husayn-gate',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn',
      text: 'There you are, friend. Forty days we prayed in the mosque at Kúfih, and still my heart would not settle. Then, outside this very gate, a youth in a green turban greeted me as though we had parted only yesterday.',
      choices: [
        { text: '"Who was He?"', next: 'who' },
        { text: '"Siyyid Káẓim told us the Promised One would be young. Do you think...?"', next: 'young' },
      ],
    },
    who: {
      speaker: 'Mullá Ḥusayn',
      text: 'A merchant of this city, Siyyid ʿAlí-Muḥammad. He invited me to His house tonight. I meant to refuse, for my brother and nephew wait at the Masjid-i-Ílkhání. Yet I found I could not.',
      choices: [{ text: '"Then I will come with you."', next: 'task' }],
    },
    young: {
      speaker: 'Mullá Ḥusayn',
      text: 'I think nothing yet. I have learned to be suspicious of my own longing. A seeker who wishes too hard may mistake a lamp for the sun.',
      choices: [{ text: '"Then let us test the lamp."', next: 'task' }],
    },
    task: {
      speaker: 'Mullá Ḥusayn',
      onEnter: { set: { metMullaHusayn: true } },
      text: 'He asked me alone. But do this for me: walk the city before dark. Hear what the bazaar, the mosque, and the poor say of Him. Then find me in the Quiet Quarter, north beyond the mosque road. A man is known by his neighbours before he is known by his claims.',
      choices: [{ text: '"I will listen, and then I will find you."' }],
    },
  },
};

/** Before the player has met Mullá Ḥusayn or heard enough of the city. */
export const thresholdClosed: DialogueTree = {
  id: 'ch1-threshold-closed',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A lamp burns behind the lattice, but the door is shut. You know almost nothing of the household within. Knocking now would be curiosity, not search. Better first to learn what Shíráz says of the young Siyyid, and to find Mullá Ḥusayn, who waits near the city gate.',
    },
  },
};

/** The vigil: a night outside the door, and the testimony at dawn. */
export const thresholdVigil: DialogueTree = {
  id: 'ch1-threshold-vigil',
  startId: 'door',
  nodes: {
    door: {
      speaker: 'Narrator',
      text: 'The servant Mubárak opens the door for Mullá Ḥusayn, then closes it gently. Through the lattice you glimpse a ewer, a cup of tea, a lamp that does not flicker. Two hours after sunset, the lane falls silent.',
      choices: [
        { text: '(Sit on the step and keep vigil.)', next: 'night', effect: { set: { vigilKept: true } } },
        { text: '(Pray quietly beneath the window.)', next: 'night', effect: { set: { vigilKept: true, vigilPrayed: true } } },
      ],
    },
    night: {
      speaker: 'Narrator',
      text: 'Hours pass. Now and then a voice rises within, chanting verses with a swiftness no copyist could follow. You catch only fragments: Joseph, the well, a light hidden in a garment. The jasmine on the wall closes and opens again.',
      choices: [
        { text: '(Listen without trying to understand.)', next: 'dawn' },
        { text: '(Recite to yourself the signs Siyyid Káẓim taught you.)', next: 'dawn', effect: { set: { recitedSigns: true } } },
      ],
    },
    dawn: {
      speaker: 'Narrator',
      text: 'The call to prayer drifts up from the city. The door opens. Mullá Ḥusayn steps into the grey light, and for a long moment he cannot speak. His face is the face of a man who has crossed a desert and found the river already flowing toward him.',
      choices: [{ text: '"Mullá Ḥusayn. What happened?"', next: 'signs' }],
    },
    signs: {
      speaker: 'Mullá Ḥusayn',
      onEnter: { set: { heardTestimony: true } },
      text: 'He asked me the signs by which the Promised One would be known. I named them, as our teacher taught us: of the line of the Prophet, more than twenty years of age and less than thirty, of innate knowledge, of medium height, free of bodily defect. He listened. Then He said, very quietly, that all these signs were manifest in Him.',
      choices: [
        { text: '"A grave claim. What proof did you ask?"', next: 'proof' },
        { text: '"And your heart? What did it answer?"', next: 'heart' },
      ],
    },
    proof: {
      speaker: 'Mullá Ḥusayn',
      text: 'In secret I had resolved: if He unfolds, unbidden, a commentary on the Súrih of Joseph, I will believe. I never spoke it aloud. He took up His pen and wrote it, the first chapter, without pause, verses streaming like rain. I was as one struck by lightning.',
      choices: [{ text: '(Let the words settle in the silence.)', next: 'reflect' }],
    },
    heart: {
      speaker: 'Mullá Ḥusayn',
      text: 'My heart had already answered before my mind gave it leave. When He began to write upon the Súrih of Joseph, the very commentary I had resolved in silence to ask for, my scholarship fell from me like a cloak in the heat.',
      choices: [{ text: '(Let the words settle in the silence.)', next: 'reflect' }],
    },
    reflect: {
      speaker: 'Narrator',
      text: 'The lane is brightening. You have not seen what he has seen. You have only a night of waiting, a city of rumours, and the changed face of a man you trust. Something in you must answer.',
      choices: [
        { text: '"I have studied too long to leap. Teach me the proofs, and I will weigh them."', next: 'caution',
          voice: 'doubt', effect: { set: { scholarlyCaution: true, ...heed('ch1-dawn', 'doubt') } } },
        { text: '"I have longed for this dawn since I was a child."', next: 'longing',
          voice: 'longing', effect: { set: { longingConfessed: true, ...heed('ch1-dawn', 'longing') } } },
        { text: '"Who am I to judge such a claim? I fear presumption more than ignorance."', next: 'presumption',
          voice: 'fear', effect: { set: { fearedPresumption: true, ...heed('ch1-dawn', 'fear') } } },
      ],
    },
    caution: {
      speaker: 'Mullá Ḥusayn',
      text: 'Good. Do not borrow my certainty. Read the verses with your own eyes. A proof that cannot survive your questions was never meant for you.',
      choices: [{ text: '(Consider.)', next: 'silence' }],
    },
    longing: {
      speaker: 'Mullá Ḥusayn',
      text: 'Then guard that longing, and let it become search rather than wishing. Longing opened my door tonight; only sincerity kept me seated.',
      choices: [{ text: '(Consider.)', next: 'silence' }],
    },
    presumption: {
      speaker: 'Mullá Ḥusayn',
      text: 'Fear may guard the threshold, but it must not bar the door. We are not judges over the Beloved. We are seekers who walked far, hoping to be found.',
      choices: [{ text: '(Consider.)', next: 'silence' }],
    },
    silence: {
      speaker: 'Mullá Ḥusayn',
      text: 'He has bidden me keep this secret for now. Seventeen others must find Him by their own search, each unprompted, before His name is spoken openly. So I ask nothing of you. I only tell you what I saw.',
      voice: [
        { voice: 'doubt', text: 'One man\'s face at dawn, after a night without sleep. You have trusted faces before.',
          requires: f => heededAt(f, 'ch1-dawn', 'doubt') },
        { voice: 'longing', text: 'You have waited your whole life for someone to come out of a door like that one.',
          requires: f => heededAt(f, 'ch1-dawn', 'longing') },
        { voice: 'fear', text: 'If it is true, everything you are will be asked of you. Everything.',
          requires: f => heededAt(f, 'ch1-dawn', 'fear') },
      ],
      choices: [
        { text: '"I believe your witness. My heart turns toward this dawn."', next: 'recognised',
          effect: { set: { recognised: true } } },
        { text: 'I have waited since I was a child. I need no more time.', next: 'recognised', voice: 'longing',
          requires: f => heededAt(f, 'ch1-dawn', 'longing'), effect: { set: { recognised: true, ...heed('ch1-answer', 'longing') } } },
        { text: '"I need time, and the verses themselves, before I can say I believe."', next: 'deferred',
          effect: { set: { recognised: false } } },
        { text: 'Say nothing at all. Not yet. Not to anyone.', next: 'mute', voice: 'fear',
          requires: f => heededAt(f, 'ch1-dawn', 'fear'), effect: { set: heed('ch1-answer', 'fear') } },
      ],
    },
    recognised: {
      speaker: 'Narrator',
      onEnter: { set: { shirazComplete: true } },
      text: 'Mullá Ḥusayn grips your hands. Behind him, the lamp is extinguished; the sun has made it needless. Tonight in Shíráz a new age began, and you were at its door. The first of the Letters of the Living has been found, and you have been his first witness.',
    },
    mute: {
      speaker: 'Narrator',
      onEnter: { set: { shirazComplete: true } },
      text: 'You open your mouth and nothing comes. Mullá Ḥusayn waits, then lays a hand on your shoulder as if you had answered. Behind him the lamp is extinguished; the sun has made it needless. You walk down the lane with the question still unspoken, and it walks with you.',
    },
    deferred: {
      speaker: 'Narrator',
      onEnter: { set: { shirazComplete: true } },
      text: 'Mullá Ḥusayn nods, without disappointment. "Then search," he says. "That is all He asks." You walk down the lane as the city wakes. Behind you the lamp is extinguished; the sun has made it needless. Your question is no longer whether the dawn will come, but whether you will meet it.',
    },
  },
};

/** Mullá Ḥusayn in the lane, waiting to be received. */
export const mullaHusaynInLane: DialogueTree = {
  id: 'ch1-mulla-husayn-lane',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn',
      text: 'The servant says his Master expects me after the evening prayer. Tell me, friend: what did the city say of Him?',
      choices: [
        { text: '"His neighbours love Him. His enemies already fear Him. The poor say He asks their names."',
          next: 'ready', requires: f => rumourCount(f) >= 2 },
        { text: '"Not enough yet. Let me listen a little longer."', next: 'notYet', requires: f => rumourCount(f) < 2 },
      ],
    },
    notYet: {
      speaker: 'Mullá Ḥusayn',
      text: 'Then go back down to the bazaar and the mosque. I will not knock until I know what kind of house this is.',
    },
    ready: {
      speaker: 'Mullá Ḥusayn',
      text: 'Love from the lowly and fear from the proud. Siyyid Káẓim used to say that the Promised One would be recognised by both. I will go in. Keep watch at the threshold for me, and pray I do not mistake a lamp for the sun.',
      choices: [{ text: '"I will be at the door until you come out."' }],
    },
  },
};

/** Mullá Ḥusayn's brother at the Masjid-i-Ílkhání: context and family warmth. */
export const brotherAtIlkhani: DialogueTree = {
  id: 'ch1-brother',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn\'s Brother',
      text: 'You have found our corner of the Ílkhání. My nephew is asleep on the bundles already. Have you seen my brother? He sent us on ahead from the city gate, and promised to join us for the evening prayer. He has not come.',
      choices: [
        { text: '"He met a young merchant-Siyyid who invited him home tonight."', next: 'invited',
          requires: f => !!f.metMullaHusayn },
        { text: '"Not yet. I will look for him."', next: 'search', requires: f => !f.metMullaHusayn },
        { text: '"Why did you come all this way with him?"', next: 'why' },
      ],
    },
    invited: {
      speaker: 'Mullá Ḥusayn\'s Brother',
      onEnter: { set: { metBrother: true } },
      text: 'Invited? My brother, who refused the hospitality of princes in Karbilá? (He laughs softly.) Then something has moved him. Go with him if you can. Someone should be awake when he returns.',
      choices: [{ text: '"I will keep watch."' }],
    },
    search: {
      speaker: 'Mullá Ḥusayn\'s Brother',
      onEnter: { set: { metBrother: true } },
      text: 'He prays at the gate sometimes, looking out at the road as if it owed him an answer. Try there.',
      choices: [{ text: '"Thank you."' }],
    },
    why: {
      speaker: 'Mullá Ḥusayn\'s Brother',
      onEnter: { set: { metBrother: true } },
      text: 'You were there last winter, when Siyyid Káẓim died and left us all to scatter and search. You saw my brother come out of his cell at Kúfih after forty days. A man who fasts like that does not walk alone, not while I live.',
      choices: [{ text: '"Then we are three seekers, and the night is young."' }],
    },
  },
};

/** The night watchman: the quarter's quiet, and the city's suspicion. */
export const nightWatchman: DialogueTree = {
  id: 'ch1-watchman',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Night Watchman',
      text: 'Another stranger in the lane after dark. You are the second tonight. The first went in at that door with the lamps, and the servant greeted him like family.',
      choices: [
        { text: '"Is that unusual?"', next: 'unusual' },
        { text: '"What do you know of the household?"', next: 'household' },
      ],
    },
    unusual: {
      speaker: 'A Night Watchman',
      text: 'In this lane, yes. The young merchant keeps early hours and pays His debts. No drinking, no quarrels. If every house were like His, I would sleep through my watch.',
      choices: [{ text: '"Then I will not trouble your sleep."' }],
    },
    household: {
      speaker: 'A Night Watchman',
      onEnter: { set: { watchmanSpoke: true } },
      text: 'His uncle raised Him after His father died. He traded for years in Búshihr, honest to a fault. They say that on Fridays He would pray for hours on His roof in the noon sun, even in the hottest season. (He shrugs.) The mullás say worse things. The mullás are not on the night watch.',
      choices: [{ text: '"Peace be with you, watchman."' }],
    },
  },
};
