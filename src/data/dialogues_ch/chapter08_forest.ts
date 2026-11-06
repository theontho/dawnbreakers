import type { DialogueTree } from '../../dialogue/types';
import { heard } from '../record';

/**
 * Chapter 8, the forest road below the shrine of Shaykh Ṭabarsí: autumn
 * 1848, the first days after the companions came there from Bárfurúsh and
 * Khusraw's forest (the `barfurush` chapter). They camp by the stream while
 * the lines of a wall are paced out round the shrine. The woodcutter and
 * the conscript come back later in the siege with changed voices.
 */

/** Mullá Ḥusayn at the camp by the stream; going on sets the companions to the walls. */
export const mullaHusaynForest: DialogueTree = {
  id: 'ch8-mh-forest',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn',
      text: 'There you are. The keeper of the shrine has given us his blessing and the use of his well, and Mírzá Muḥammad-Báqir is up there pacing out lines in the mud. (He looks back down the road toward Bárfurúsh.) By now Qádí-Kalá will have heard how Khusraw\'s errand ended.',
      choices: [
        { text: '"Lines? For what?"', next: 'walls' },
        { text: '"Why a black standard?"', next: 'why' },
      ],
    },
    why: {
      speaker: 'Mullá Ḥusayn',
      text: 'The traditions say black standards will come out of Khurásán in the days of the Qáʾim. We did not raise it to frighten anyone. We raised it so that those who know the old promise might look up and wonder.',
      choices: [{ text: '"And the lines in the mud?"', next: 'walls' }],
    },
    walls: {
      speaker: 'Mullá Ḥusayn',
      text: 'For a wall. Bárfurúsh came out against us with muskets, and in the forest we saw what an oath was worth. A shrine full of praying men needs a wall round it, and a ditch, and a gate someone can keep.',
      choices: [
        { text: '"Then I will go up and help raise it."', next: 'go' },
        { text: '"You called this place our Karbilá."', next: 'knows' },
      ],
    },
    knows: {
      speaker: 'Mullá Ḥusayn',
      text: 'I did. I know that I have given everything already; what remains is only the handing over. Do not grieve before the hour, friend. There is work to do: walls to raise, and hearts to steady.',
      choices: [{ text: '"Then let us go."', next: 'go' }],
    },
    go: {
      speaker: 'Narrator',
      onEnter: { set: { ch8JoinedColumn: true } },
      text: 'Mullá Ḥusayn walks back up the road toward the shrine, and the Standard-bearer goes after him. Behind them the companions break camp slowly, chanting. The shrine lies beyond the stream and the ironwoods.',
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
        { text: '(Ask the Standard-bearer whether he ever sets it down.)', next: 'far' },
      ],
    },
    hem: {
      speaker: 'Narrator',
      text: 'There is no inscription. Only black cloth, darkened further by the weather. Its meaning is carried in memory, not in thread: an old promise that black standards would rise out of Khurásán in the last days.',
      choices: [{ text: '(Stand beneath it a moment.)', next: 'end' }],
    },
    far: {
      speaker: 'Narrator',
      text: 'He only smiles. A companion beside him answers instead: "Not at Bárfurúsh when the muskets fired, and not in the forest when Khusraw\'s men came. Every step from Mashhad, and he has not once let it touch the ground."',
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
      text: 'I washed in the stream this morning, look, and the blue still will not come off. My father\'s vats in Mashhad, on my hands all the way to this forest. (He holds them up.) I thought Bárfurúsh would scrub it off, if anything did.',
      choices: [
        { text: '"Why did you come, Riḍá?"', next: 'why' },
        { text: '"Are you still afraid?"', next: 'afraid' },
      ],
    },
    why: {
      speaker: 'A Young Companion',
      text: 'I heard Mullá Ḥusayn speak in Mashhad, near the shrine of the Imám whose name I carry. He did not shout. He only said the Promised One had come, and asked who would walk with him. My feet answered before I did.',
      choices: [{ text: '"And your family?"', next: 'mother' }],
    },
    afraid: {
      speaker: 'A Young Companion',
      text: 'You saw me at Bárfurúsh, behind that horse. In the forest, when Khusraw\'s men came, I did not hide; I was too busy being afraid for you. (He laughs.) Mullá Ḥusayn\'s face never changed, either time. I keep looking at it to borrow some.',
      choices: [{ text: '"And your family?"', next: 'mother' }],
    },
    mother: {
      speaker: 'A Young Companion',
      onEnter: { set: { ch8MetYoungCompanion: true } },
      text: 'My mother\'s bread is still in my sash, the bread I kept back from the heap. I said I would give it to someone who needed it more. (He offers you a piece, hard as wood.) Today I think that is you. It tastes of home.',
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

/**
 * A conscript from Láríján on picket, late in the siege, after ʿAbbás-Qulí
 * Khán has come back knowing whom he shot (Nabíl p. 386): before that the
 * Khán kept even his officers in the dark. On the day of the rice the same
 * man sits by the causeway (`ch8-day-water`).
 */
export const conscript: DialogueTree = {
  id: 'ch8-conscript',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Conscript',
      text: 'Halt. No, wait. You are no soldier, and I am not much of one. They took me from my village in Láríján after the harvest. I had never seen a fort before this one.',
      choices: [
        { text: '"You were at the water, the day of the rice."', next: 'water', requires: f => !!f.ch8DayWater },
        { text: '"Do you know who is inside?"', next: 'inside' },
        { text: '"Are you allowed to speak to me?"', next: 'allowed' },
      ],
    },
    water: {
      speaker: 'A Conscript',
      text: 'With the water skins. I remember. (He looks along the road.) The week after, our khan came back from his village like a man who had been handed a gift. Somebody inside handed it to him.',
      choices: [
        { text: '"And the pen? Did you tell them?"', next: 'pen', requires: f => !!f.ch8ToldConscriptPen },
        { text: '"Who do they say is inside, now?"', next: 'inside' },
      ],
    },
    pen: {
      speaker: 'A Conscript',
      text: 'About his hand shaking? I told them at the fire. They laughed. I did not. I have stopped believing the officers about anything they did not see.',
      choices: [{ text: '"Who do they say is inside, now?"', next: 'inside' }],
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
      onEnter: { set: { ch8MetConscript: true, [heard('ch8-khan', 'boast')]: true } },
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
