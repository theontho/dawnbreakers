import type { DialogueTree } from '../../dialogue/types';

/**
 * Chapter 8, the forest road: autumn 1848. Mullá Ḥusayn leads the Black
 * Standard out of Khurásán toward the shrine of Shaykh Ṭabarsí after the
 * town of Bárfurúsh has turned on the companions. The woodcutter and the
 * conscript come back later in the siege with changed voices.
 */

/** Mullá Ḥusayn at the head of the column; joining sets the march moving. */
export const mullaHusaynForest: DialogueTree = {
  id: 'ch8-mh-forest',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn',
      text: 'Peace be upon you, friend. The road from Khurásán is long, and this forest makes every man a stranger. Come closer. Let me see your face.',
      choices: [
        { text: '"It is the one who sat outside the door in Shíráz."', next: 'shirazYes',
          requires: f => f.recognised !== false && !f.ch6MetMullaHusayn },
        { text: '"It is the one who sat outside the door in Shíráz, and walked with you at Mákú."', next: 'makuYes',
          requires: f => f.recognised !== false && !!f.ch6MetMullaHusayn },
        { text: '"You told me once to search. I have been searching."', next: 'shirazNo',
          requires: f => f.recognised === false },
      ],
    },
    shirazYes: {
      speaker: 'Mullá Ḥusayn',
      text: 'The first who heard me at dawn! Four years, and you find us again in the rain of Mázindarán. God keeps a long memory for those who wait at doors.',
      choices: [{ text: '"Where does this road lead you?"', next: 'standard' }],
    },
    makuYes: {
      speaker: 'Mullá Ḥusayn',
      text: 'The first who heard me at dawn! At Mákú there was snow on my boots; now there is the mud of Mázindarán. Half a year, and you find us again. God keeps a long memory for those who wait at doors.',
      choices: [{ text: '"Where does this road lead you?"', next: 'standard' }],
    },
    shirazNo: {
      speaker: 'Mullá Ḥusayn',
      text: 'And still you walk toward the light and not away from it. That is search. You asked for the verses; since then He has poured out more than any scribe can carry. Walk with us, and read.',
      choices: [{ text: '"Where does this road lead you?"', next: 'standard' }],
    },
    standard: {
      speaker: 'Mullá Ḥusayn',
      text: 'From Mashhad we raised the Black Standard, as He bade me. He sent me His own green turban to wear, and a new name, Siyyid ʿAlí. Two hundred of us left Khurásán. More joined at every village.',
      choices: [
        { text: '"Why a black standard?"', next: 'why' },
        { text: '"And what news from Ṭihrán?"', next: 'shah' },
      ],
    },
    why: {
      speaker: 'Mullá Ḥusayn',
      text: 'The traditions say black standards will come out of Khurásán in the days of the Qáʾim. We did not raise it to frighten anyone. We raised it so that those who know the old promise might look up and wonder.',
      choices: [{ text: '"And the towns along the way?"', next: 'barfurush' }],
    },
    shah: {
      speaker: 'Mullá Ḥusayn',
      text: 'Muḥammad Sháh is dead. The capital is busy with a young king, and in every province the men who hated us are free to do as they please.',
      choices: [{ text: '"Has it begun already?"', next: 'barfurush' }],
    },
    barfurush: {
      speaker: 'Mullá Ḥusayn',
      text: 'At Bárfurúsh the Saʿídu\'l-ʿUlamá preached against us from the pulpit, and the town came out with stones and muskets. We did not come to fight. We came to proclaim, and to wait.',
      choices: [{ text: '"Where will you wait?"', next: 'shrine' }],
    },
    shrine: {
      speaker: 'Mullá Ḥusayn',
      text: 'There is a shrine in this forest, the tomb of Shaykh Ṭabarsí. When I saw its dome through the trees I prayed: O Lord, bring me down to a blessed landing place. My heart tells me our road ends there.',
      choices: [
        { text: '"Then I will go with you to the shrine."', next: 'go' },
        { text: '"Ends? You speak as if you know what is coming."', next: 'knows' },
      ],
    },
    knows: {
      speaker: 'Mullá Ḥusayn',
      text: 'I know that I have given everything already. What remains is only the handing over. Do not grieve before the hour, friend. There is work to do: walls to raise, and hearts to steady.',
      choices: [{ text: '"Then let us go."', next: 'go' }],
    },
    go: {
      speaker: 'Narrator',
      onEnter: { set: { ch8JoinedColumn: true } },
      text: 'Mullá Ḥusayn turns his horse east along the forest road, and the Standard-bearer rides after him into the green dark. Behind them the companions break camp slowly, chanting. The shrine lies beyond the stream and the ironwoods.',
    },
  },
};

/** The Black Standard on the road, before the column moves on. */
export const standardForest: DialogueTree = {
  id: 'ch8-standard-forest',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A black banner hangs heavy with rain from a tall pole. The Standard-bearer, a silent man from Khurásán, holds it as though it weighed nothing at all.',
      choices: [
        { text: '(Look along the hem for an inscription.)', next: 'hem' },
        { text: '(Ask the Standard-bearer how far he has carried it.)', next: 'far' },
      ],
    },
    hem: {
      speaker: 'Narrator',
      text: 'There is no inscription. Only black cloth, darkened further by the weather. Its meaning is carried in memory, not in thread: an old promise that black standards would rise out of Khurásán in the last days.',
      choices: [{ text: '(Stand beneath it a moment.)', next: 'end' }],
    },
    far: {
      speaker: 'Narrator',
      text: 'He only smiles. A companion beside him answers instead: "Every step from Mashhad, through Nishápúr and the mountains and the mud. He has not once let it touch the ground."',
      choices: [{ text: '(Stand beneath it a moment.)', next: 'end' }],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { ch8SawStandard: true } },
      text: 'Rain runs off the cloth and onto your sleeve. You feel, absurdly and completely, that you have been counted.',
    },
  },
};

/** Riḍá, a dyer's son from Mashhad, on the march. */
export const youthForest: DialogueTree = {
  id: 'ch8-youth-forest',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Young Companion',
      text: 'You are not from Khurásán; I can tell by your boots. Mine wore through at Nishápúr. My name is Riḍá. My father dyes cloth in Mashhad. Look, my hands are still blue.',
      choices: [
        { text: '"Why did you come?"', next: 'why' },
        { text: '"Are you afraid?"', next: 'afraid' },
      ],
    },
    why: {
      speaker: 'A Young Companion',
      text: 'I heard Mullá Ḥusayn speak in Mashhad, near the shrine of the Imám whose name I carry. He did not shout. He only said the Promised One had come, and asked who would walk with him. My feet answered before I did.',
      choices: [{ text: '"And your family?"', next: 'mother' }],
    },
    afraid: {
      speaker: 'A Young Companion',
      text: 'At Bárfurúsh, when the stones came, yes. I hid behind a horse. Then I saw Mullá Ḥusayn\'s face, so calm that I felt ashamed, and I stopped hiding.',
      choices: [{ text: '"And your family?"', next: 'mother' }],
    },
    mother: {
      speaker: 'A Young Companion',
      onEnter: { set: { ch8MetYoungCompanion: true } },
      text: 'My mother sewed bread into my sash so I would not go hungry. I eat it one corner at a time. (He offers you a piece, hard as wood.) Share it with me. It tastes of home.',
      choices: [
        { text: '(Take the bread and thank him.)', next: 'took', effect: { set: { ch8SharedBread: true } } },
        { text: '(Refuse gently. He will need it more.)', next: 'refuse' },
      ],
    },
    took: {
      speaker: 'A Young Companion',
      text: 'There. Now we are brothers by bread, which my grandfather said is stronger than brothers by blood, because you choose it.',
    },
    refuse: {
      speaker: 'A Young Companion',
      text: 'You sound like my mother. Very well, I will keep it. But when the walls are built, you will eat with me.',
    },
  },
};

/** Qásim the woodcutter, in his clearing, before the siege tightens. */
export const woodcutter: DialogueTree = {
  id: 'ch8-woodcutter',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Woodcutter',
      text: 'Mind the stumps, stranger. Half this clearing is my grandfather\'s work and half is mine. The rest of the forest belongs to God and the wild pigs.',
      choices: [
        { text: '"Do you know the shrine beyond the stream?"', next: 'shrine' },
        { text: '"You live out here alone?"', next: 'alone' },
      ],
    },
    alone: {
      speaker: 'A Woodcutter',
      text: 'With my wife, and a daughter who sings to the buffalo. We cut ironwood, which sinks in water and laughs at the axe, and sell it in Bárfurúsh for beams and charcoal.',
      choices: [{ text: '"And the shrine?"', next: 'shrine' }],
    },
    shrine: {
      speaker: 'A Woodcutter',
      text: 'Shaykh Ṭabarsí? A holy man, buried long ago. Pilgrims come in spring with candles. Now these men of Khurásán come in autumn with a black flag. (He scratches his beard.) The mullás say they are infidels. They pray more than the mullás do.',
      choices: [
        { text: '"What else is said in town?"', next: 'town' },
        { text: '"And what do you say?"', next: 'you' },
      ],
    },
    town: {
      speaker: 'A Woodcutter',
      text: 'That the Saʿídu\'l-ʿUlamá threw his turban on the ground and cried that the Faith was being destroyed. That any man who kills one of these strangers goes straight to Paradise. (He spits.) Paradise is not bought with a club.',
      choices: [{ text: '"And you?"', next: 'you' }],
    },
    you: {
      speaker: 'A Woodcutter',
      onEnter: { set: { ch8MetWoodcutter: true } },
      text: 'I say a man is known by how he treats a poor man\'s woodpile. Their leader asked before he let the horses graze, and paid for the grass. Go carefully. The forest has more ears than leaves.',
    },
  },
};

/** The woodcutter again, once the siege has closed around the shrine. */
export const woodcutterSiege: DialogueTree = {
  id: 'ch8-woodcutter-siege',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Woodcutter',
      text: 'You are from the fort. I can tell by how thin you are. The soldiers took my ironwood for their towers and paid me in promises. Now there are cannon in the forest, and I cannot hear my daughter sing over them.',
      choices: [{ text: '"Do you hear anything from the fort?"', next: 'hear' }],
    },
    hear: {
      speaker: 'A Woodcutter',
      onEnter: { set: { ch8WoodcutterListened: true } },
      text: 'At night, when the guns rest, a cry comes through the trees: Yá Ṣáḥibu\'z-Zamán! A few hundred voices, and the whole army goes quiet to listen. My wife weeps. I tell her it is the wind. (He looks away.) It is not the wind.',
    },
  },
};

/** A village woman washing rice at the stream. */
export const villageWoman: DialogueTree = {
  id: 'ch8-village-woman',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Village Woman',
      text: 'Do not step there, the bank is soft. I am washing rice for the evening. You walk with the men of the black flag?',
      choices: [
        { text: '"I do."', next: 'yes' },
        { text: '"I am only a traveller."', next: 'no' },
      ],
    },
    yes: {
      speaker: 'A Village Woman',
      text: 'Then you are hungry, whatever you say. My husband says I am not to speak with you. My husband also says the river will not flood this year.',
      choices: [{ text: '(Wait.)', next: 'gift' }],
    },
    no: {
      speaker: 'A Village Woman',
      text: 'A traveller who walks behind a black flag. Well. God knows what is in hearts; I only know what is in pots.',
      choices: [{ text: '(Wait.)', next: 'gift' }],
    },
    gift: {
      speaker: 'A Village Woman',
      text: '(She folds a cloth around two handfuls of rice and knots it.) Give it to the young ones. They look like my sons did when the army took them. Thin necks, big eyes.',
      choices: [
        { text: '(Accept it with both hands.)', next: 'thanks', effect: { set: { ch8RiceGift: true } } },
        { text: '"Your husband will be angry."', next: 'husband' },
      ],
    },
    husband: {
      speaker: 'A Village Woman',
      text: 'My husband eats rice I cooked yesterday and will eat rice I cook tomorrow. He can spare two handfuls. Take it.',
      choices: [{ text: '(Accept it with both hands.)', next: 'thanks', effect: { set: { ch8RiceGift: true } } }],
    },
    thanks: {
      speaker: 'A Village Woman',
      text: 'May the Lady Fáṭimih keep you. And if they ask who sent it, say no one. In Bárfurúsh these days, even rice can be a crime.',
    },
  },
};

/** A conscript from Láríján on picket, late in the siege. */
export const conscript: DialogueTree = {
  id: 'ch8-conscript',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Conscript',
      text: 'Halt. No, wait. You are no soldier, and I am not much of one. They took me from my village in Láríján after the harvest. I had never seen a fort before this one.',
      choices: [
        { text: '"Do you know who is inside?"', next: 'inside' },
        { text: '"Are you allowed to speak to me?"', next: 'allowed' },
      ],
    },
    allowed: {
      speaker: 'A Conscript',
      text: 'Nobody has told me not to. Nobody tells me anything except where to stand and when to fire. Today they told me to stand here.',
      choices: [{ text: '"Who do they say is inside?"', next: 'inside' }],
    },
    inside: {
      speaker: 'A Conscript',
      text: 'The officers say robbers and heretics. But I hear them pray at dawn, louder than our mullá at home. And when the tall one in the green turban rode out, men twice my size threw down their muskets and ran.',
      choices: [{ text: '"He is dead now."', next: 'khan' }],
    },
    khan: {
      speaker: 'A Conscript',
      onEnter: { set: { ch8MetConscript: true } },
      text: 'I know. My khan says he fired the shot himself, from up in a tree. He boasts of it at supper. (He lowers his voice.) Since then he does not sleep well. None of us do. Go on. I did not see you.',
    },
  },
};

export const chapter08ForestDialogues: Record<string, DialogueTree> = {
  [mullaHusaynForest.id]: mullaHusaynForest,
  [standardForest.id]: standardForest,
  [youthForest.id]: youthForest,
  [woodcutter.id]: woodcutter,
  [woodcutterSiege.id]: woodcutterSiege,
  [villageWoman.id]: villageWoman,
  [conscript.id]: conscript,
};
