import type { DialogueTree } from '../../dialogue/types';

/**
 * Ḥujjat in the fort of ʿAlí-Mardán Khán, from the night the news of the
 * martyrdom reaches him to the dawn he is wounded at his ablutions. His
 * words are dramatised paraphrase of what Nabíl records of him: that he
 * forbade holy war and fought only to defend, that he answered a sealed
 * Qur'án with children and old men, and that, wounded, he prayed God to
 * pardon those who shot him.
 */

/** Siyyid Ḥasan beside Ḥujjat, before the news is told. */
export const hasanFort: DialogueTree = {
  id: 'zj-hasan-fort',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Siyyid Ḥasan',
      text: 'There he is. I rehearsed the words the whole road from Tabríz, and now I have none. You saw the square with your own eyes. Go to him with me.',
    },
  },
};

/** Siyyid Ḥasan after the news. */
export const hasanAfter: DialogueTree = {
  id: 'zj-hasan-after',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Siyyid Ḥasan',
      text: 'It is said. I feel lighter, and I am ashamed to feel it. (He looks toward the wall, where the watch is crying the names of God.) Listen to them. Not one voice has dropped out of that line tonight.',
      choices: [{ text: '"What will you do now?"', next: 'now' }],
    },
    now: {
      speaker: 'Siyyid Ḥasan',
      onEnter: { set: { zjHasanStayed: true } },
      text: 'Stay, while I can be of use. My brother was bidden to live and carry what he was given. Perhaps I was bidden only to carry this one thing, this far.',
    },
  },
};

/** The news of the martyrdom, brought to Ḥujjat: the chapter's first turn. */
export const hujjatNews: DialogueTree = {
  id: 'zj-hujjat-news',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Ḥujjat',
      text: 'Siyyid Ḥasan. You have come a long road, and by night. (He looks from Ḥasan\'s face to yours, and is silent a moment.) And you have brought me something from Tabríz.',
      choices: [
        { text: '(Let Siyyid Ḥasan speak.)', next: 'hasan' },
        { text: '(Tell him yourself.)', next: 'tell' },
      ],
    },
    hasan: {
      speaker: 'Siyyid Ḥasan',
      text: 'On the twenty-eighth of Shaʿbán, at noon, in the barrack square of Tabríz... (He cannot go on, and turns to you.)',
      choices: [{ text: '(Tell the rest.)', next: 'tell' }],
    },
    tell: {
      speaker: 'Narrator',
      text: 'You tell him of the square and the crowded roofs, the regiment that would not fire again, the ropes cut clean, and the second volley. You tell him the Báb was thirty years old. Ḥujjat listens with his eyes closed.',
      choices: [{ text: '(Wait.)', next: 'silence' }],
    },
    silence: {
      speaker: 'Ḥujjat',
      text: '(For a long while he says nothing. When he speaks, his voice is steady.) Then He has gone ahead of us, as the sun goes down ahead of the traveller. Tomorrow they will shout it at us from their lines, to break our hearts.',
      choices: [{ text: '"Will it break them?"', next: 'break' }],
    },
    break: {
      speaker: 'Ḥujjat',
      text: 'Ask them in the morning. (He turns toward the wall, where the night watch cries the names of God.) We did not take this quarter for any man\'s life, not even His. We are here because He told us the truth, and the truth did not die in Tabríz.',
      choices: [{ text: '"What would you have me do?"', next: 'counsel' }],
    },
    counsel: {
      speaker: 'Ḥujjat',
      onEnter: { set: { zjNewsTold: true } },
      text: 'Stay with us, if you will. Walk the barricades. Find Muḥsin on the wall, and the women at the ovens, and my wife Khadíjih in the house. Then come back and tell me how my people bear it. Remember what you see. Someone must.',
    },
  },
};

/** Ḥujjat in summer, after the news. */
export const hujjatSummer: DialogueTree = {
  id: 'zj-hujjat-summer',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Ḥujjat',
      text: 'You heard them this morning, calling across the ruins? "For what will you sacrifice yourselves now? He for whom you longed to die has fallen to the bullets of a triumphant foe."',
      choices: [{ text: '"And no one has left."', next: 'none' }],
    },
    none: {
      speaker: 'Ḥujjat',
      text: 'No one. Not one man over the barricades, not one woman out of the fort. (A pause.) From the first I have told them: we do not wage holy war. We were bidden to plant charity and love in men\'s hearts. We hold these walls only because they have left us nothing else to stand on.',
      choices: [
        { text: '"Someone told me there were weddings in the fort."', next: 'weddings' },
        { text: '"Whom should I find?"', next: 'find' },
      ],
    },
    weddings: {
      speaker: 'Ḥujjat',
      text: 'Our young men who were unmarried, I married. Should a siege rob them of that too? There have been feasts in this court with the guns for drums. (He smiles for the first time.) Ask my wife what they cost.',
      choices: [{ text: '"Whom should I find?"', next: 'find' }],
    },
    find: {
      speaker: 'Ḥujjat',
      text: 'The youth they call Rustam-ʿAlí at the east barricade. Muḥsin at the foot of the wall. The women at the ovens. Khadíjih in the house. Go among them, then come back to me.',
    },
  },
};

/** The sealed Qur'án, and the delegation of children and old men: summer turns to truce. */
export const hujjatQuran: DialogueTree = {
  id: 'zj-hujjat-quran',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A rider comes up to the barricades under a white cloth, carrying a Qur\'án sealed with the seal of Muḥammad Khán, the Amír-Tumán, who has come against the quarter with seventeen regiments and fourteen guns. Ḥujjat takes the Book and holds it a long time.',
      choices: [{ text: '(Wait for him to speak.)', next: 'oath' }],
    },
    oath: {
      speaker: 'Ḥujjat',
      text: 'He writes that the Sháh has ended the campaign, and swears on this that any who come out will be safe. We must honour the Book, whether or not he does.',
      choices: [
        { text: '"Will you go out to him?"', next: 'send' },
        { text: '"Remember the oath they swore at Ṭabarsí."', next: 'tabarsi', requires: f => !!f.tabarsiComplete },
      ],
    },
    tabarsi: {
      speaker: 'Ḥujjat',
      text: 'I remember it. Quddús went out on such an oath, and all Persia knows what came of it. (He sets the Book down gently.) So I will not send him the men he wants. I will send him those no oath could excuse him for harming.',
      choices: [{ text: '"Whom?"', next: 'send' }],
    },
    send: {
      speaker: 'Ḥujjat',
      text: 'Nine of our children, none older than ten, and some of our old men, past eighty. Darvísh-Ṣaláḥ will carry the Qur\'án before them. If his oath is true, they will come back with it. If it is not, he will show himself to them, and to God.',
      choices: [{ text: '(Watch them go.)', next: 'go' }],
    },
    go: {
      speaker: 'Narrator',
      onEnter: { set: { zjDelegationSent: true } },
      text: 'The little procession goes down the lane and out through the sally gap: old men leaning on their staves, boys in their best coats, the sealed Book held high at the front. Among the boys is Mihr-ʿAlí, who gathers shot in the court. The guns are silent. The whole quarter watches until they are out of sight.',
    },
  },
};

/** Ḥujjat at the gate in the truce, waiting for the children. */
export const hujjatWaiting: DialogueTree = {
  id: 'zj-hujjat-waiting',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Ḥujjat',
      text: 'They have been gone since morning. (He does not take his eyes from the gate.) Mír Ṣaláḥ tells me a soldier has come out among the ruins and calls for someone to talk to. Go, if you will. The children will come back by this gate, and I will be here.',
    },
  },
};

/** Ḥujjat in winter, before the player has seen the cost of it. */
export const hujjatWinter: DialogueTree = {
  id: 'zj-hujjat-winter',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Ḥujjat',
      text: 'The snow has come, and the cold takes more of us than the shot. (He breaks the ice on the pool with the heel of his hand.) Go and see who is left: the barricades, the wall, the ovens. Then come back at dawn, and pray with me.',
    },
  },
};

/** Dawn at the pool: Ḥujjat is wounded at his ablutions. Winter turns to the end. */
export const hujjatAblution: DialogueTree = {
  id: 'zj-hujjat-ablution',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Before dawn, at the pool. Ḥujjat has broken the ice and is making his ablutions, unhurried, as in any winter of his life. The ladder against the wall stands empty.',
      choices: [{ text: '(Kneel beside him and wash.)', next: 'wash' }],
    },
    wash: {
      speaker: 'Ḥujjat',
      text: 'Cold water wakes the soul. (He smiles at you across the pool.) You have been everywhere in this fort. Tell me, how are my people?',
      choices: [
        { text: '"They are steadfast."', next: 'steadfast' },
        { text: '"They are hungry, and very cold."', next: 'cold' },
      ],
    },
    steadfast: {
      speaker: 'Ḥujjat',
      text: 'Then I am content.',
      choices: [{ text: '(Bend to the water.)', next: 'shot' }],
    },
    cold: {
      speaker: 'Ḥujjat',
      text: 'And yet they stay. That is the whole of it.',
      choices: [{ text: '(Bend to the water.)', next: 'shot' }],
    },
    shot: {
      speaker: 'Narrator',
      onEnter: { set: { zjHujjatWounded: true } },
      text: 'A shot cracks from the royal lines. Ḥujjat\'s right arm jerks, and the water in his hands runs dark. He does not cry out. Looking toward the smoke on the earthworks, he says quietly: "Pardon this people, O God, for they know not what they do."',
      choices: [{ text: '(Call for help.)', next: 'carried' }],
    },
    carried: {
      speaker: 'Narrator',
      text: 'Men come running from every barricade and every wall, and lift him, and carry him up into his house. Behind them, for the first time since May, the walls stand empty.',
    },
  },
};

export const zanjanHujjatDialogues: Record<string, DialogueTree> = {
  [hasanFort.id]: hasanFort,
  [hasanAfter.id]: hasanAfter,
  [hujjatNews.id]: hujjatNews,
  [hujjatSummer.id]: hujjatSummer,
  [hujjatQuran.id]: hujjatQuran,
  [hujjatWaiting.id]: hujjatWaiting,
  [hujjatWinter.id]: hujjatWinter,
  [hujjatAblution.id]: hujjatAblution,
};
