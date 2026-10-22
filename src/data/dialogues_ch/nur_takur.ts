import type { DialogueTree } from '../../dialogue/types';

/**
 * Tákur in Núr, autumn 1844, after Nabíl's chapter on Bahá'u'lláh's
 * journey to Mázindarán: the notables who came for news of the court and
 * heard of the new Cause instead; His uncle ʿAzíz and the mujtahid's
 * ill-written note; the two envoys of Mullá Muḥammad, the mujtahid of
 * Núr, who rode after Him to His winter quarters and did not come back to
 * their teacher; the visit to Saʿádat-Ábád. He is away throughout; the
 * village tells it. In 1844 nobody yet calls Him Bahá'u'lláh: to the
 * village He is Mírzá Ḥusayn-ʿAlí, the Vazír's son.
 */

/** A woman of the village at her bread oven. */
export const nurWoman: DialogueTree = {
  id: 'nur-woman',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Village Woman',
      text: '(A woman is pressing dough to the wall of a clay oven under a dripping eave.) From Ṭihrán, in this rain? Then you have come after the Vazír\'s son like all the rest. He has gone down to His winter quarters. You can wait for the bread.',
      choices: [{ text: '"What do they come to Him for?"', next: 'news' }],
    },
    news: {
      speaker: 'A Village Woman',
      text: 'At first, for news. When He came home this year every official and notable in Núr rode up to that house to ask Him about the Sháh and the ministers and the court. My husband carried in the tea.',
      choices: [{ text: '"And what did He tell them?"', next: 'cause' }],
    },
    cause: {
      speaker: 'A Village Woman',
      text: 'Nothing! Of the court, nothing. He answered as if the Sháh were a rumour from another country. Then He spoke to them of a new Cause that has appeared, and of what it would do for this land. My husband says nobody touched his tea.',
      choices: [{ text: '"And they listened?"', next: 'listened' }],
    },
    listened: {
      speaker: 'A Village Woman',
      text: 'They could not answer Him. A man of His rank, and young, and caring about things only the mullás are supposed to care about. Half of them went home and told their villages. (She slaps a round of dough to the oven wall.) Now the villages come to us.',
      choices: [{ text: '"Has He always been like this?"', next: 'youth' }],
    },
    youth: {
      speaker: 'A Village Woman',
      onEnter: { set: { nurHeardWoman: true } },
      text: 'My mother tells a story. Years ago, when the great mujtahid Mírzá Muḥammad-Taqí still taught here with two hundred students at his feet, He passed by as a youth and stopped to listen. None of the students could explain the passage. He did, in a few words. The mujtahid was furious with his students: all those years of study, and a youth in a nobleman\'s hat had to show them. Now the mujtahid is dead, and his students are a handful.',
    },
  },
};

/** The elder of Tákur, in the forecourt of the Vazír's house. */
export const nurElder: DialogueTree = {
  id: 'nur-elder',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Village Elder',
      text: '(An old man in a good coat sits on a rug in the forecourt, as if keeping the house for its owner.) Peace upon you, traveller. If you want a quarrel you have come a week too late. If you want a story, sit.',
      choices: [{ text: '"A quarrel?"', next: 'aziz' }],
    },
    aziz: {
      speaker: 'The Village Elder',
      text: 'Only one man in Núr dared to stand up and contradict Him: His own uncle, ʿAzíz. When the people would have shut his mouth for him, Mírzá Ḥusayn-ʿAlí stopped them. Leave him in the hands of God, He said.',
      choices: [{ text: '"And ʿAzíz?"', next: 'tea' }],
    },
    tea: {
      speaker: 'The Village Elder',
      text: 'Ran to the mujtahid, Mullá Muḥammad, at Saʿádat-Ábád. A youth in a nobleman\'s hat, he says, is breaking up the faith of Islam, and whoever goes near him falls under his spell. A sorcerer, or he mixes something in his tea! (He wheezes.) And the mujtahid says: have you not drunk his tea yourself?',
      choices: [{ text: '"What did the mujtahid do?"', next: 'note' }],
    },
    note: {
      speaker: 'The Village Elder',
      text: 'He would not come himself. He wrote ʿAzíz a note: be not afraid, no one will dare molest you. Only he made such a slip in the grammar that it said something else altogether, and when it was read out here in Tákur the notables were scandalised. They vilified the bearer and the author both.',
      choices: [{ text: '"And now?"', next: 'envoys' }],
    },
    envoys: {
      speaker: 'The Village Elder',
      onEnter: { set: { nurHeardElder: true } },
      text: 'Now even the mujtahid\'s own students are pressing him to go and see for himself. He will not. They say he means to send two of them in his place, and swear to abide by whatever they decide. (He looks down the road.) If they come, they will come up that way.',
    },
  },
};

/** Mullá ʿAbbás, envoy of the mujtahid of Núr, arriving at Tákur. */
export const nurEnvoys: DialogueTree = {
  id: 'nur-envoys',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá ʿAbbás',
      text: '(Two divines in rain-dark cloaks have come up the road and stopped in the forecourt. The elder of them speaks for both.) Peace upon you. We are sent by Mullá Muḥammad, the mujtahid of Núr, to the son of the late Vazír. Is He within?',
      choices: [{ text: '"Why are you sent?"', next: 'errand' }],
    },
    errand: {
      speaker: 'Mullá ʿAbbás',
      text: 'I am ʿAbbás, and this is Mírzá Abu\'l-Qásim. We are both sons-in-law of the late Mírzá Muḥammad-Taqí, God rest him, and both his disciples. Our teacher has pledged to accept whatever we conclude about this new message, and to hold our decision as final.',
      choices: [{ text: '"That is a great trust."', next: 'questions' }],
    },
    questions: {
      speaker: 'Mullá ʿAbbás',
      text: 'It is a great nuisance, in this weather. (He pats his breast, where papers crackle.) I have my questions written out. Theology, the traditions, the signs of the Qáʾim. A layman will not get past the third.',
      choices: [{ text: '"He is not here. He has gone down to His winter quarters."', next: 'gone' }],
    },
    gone: {
      speaker: 'Mullá ʿAbbás',
      onEnter: { set: { nurEnvoysSent: true } },
      text: 'Gone? (He looks at his companion, and then at the rain.) Then we ride on after Him. We did not come all this way to go back with dry paper. Good day to you.',
    },
  },
};

/** Mírzá Abu'l-Qásim, the second envoy. */
export const nurAbulQasim: DialogueTree = {
  id: 'nur-abul-qasim',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mírzá Abu\'l-Qásim',
      text: '(The younger envoy is wringing out the end of his turban.) ʿAbbás has the questions. I have the horses. Between us we are supposed to have the truth by nightfall. (He lowers his voice.) Have you heard Him speak? What is He like?',
      choices: [{ text: '"I have only heard what the village says."', next: 'village' }],
    },
    village: {
      speaker: 'Mírzá Abu\'l-Qásim',
      text: 'So have I. That is what troubles me. A village does not usually agree on anything.',
    },
  },
};

/** A groom of the household, back from the winter quarters. */
export const nurGroom: DialogueTree = {
  id: 'nur-groom',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Groom',
      text: '(Some days later. A young man has brought two lathered horses up from the lowlands and is rubbing them down by the stump.) The mujtahid\'s men? Yes, I saw them. I was holding their bridles at the door. You will not believe me.',
      choices: [{ text: '"Tell me."', next: 'surih' }],
    },
    surih: {
      speaker: 'A Groom',
      text: 'When they came in He was revealing a commentary on the opening Súrih of the Qur\'án, the Seven Verses of Repetition. They sat down to wait for their turn to ask. Then Mullá ʿAbbás got up, all of a sudden, and walked back, and stood by the door like a servant.',
      choices: [{ text: '"Why?"', next: 'abbas' }],
    },
    abbas: {
      speaker: 'A Groom',
      text: 'He was shaking, and his eyes were full. He said to the other one: you see how I am. I cannot question Him. The questions I had have gone out of my head. Go back alone if you like and tell our teacher that ʿAbbás can never return to him. He cannot leave this threshold.',
      choices: [{ text: '"And Mírzá Abu\'l-Qásim?"', next: 'qasim' }],
    },
    qasim: {
      speaker: 'A Groom',
      onEnter: { set: { nurHeardGroom: true } },
      text: 'He said he had ceased to know his teacher, and that from that moment he had vowed his days to God and to the service of the One they had come to examine. (He laughs, and wipes his face.) I held their horses all evening. Nobody came out to ride them.',
    },
  },
};

/** The elder once the news of the envoys has gone round: the visit to Saʿádat-Ábád. */
export const nurElderSaadat: DialogueTree = {
  id: 'nur-elder-saadat',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Village Elder',
      text: 'Divines, officials, merchants, peasants: all Núr is on the road to Him since the envoys did not come back. Some of the great men said to Him, if only Mullá Muḥammad would join them too, the thing would be won.',
      choices: [{ text: '"What did He say?"', next: 'leagues' }],
    },
    leagues: {
      speaker: 'The Village Elder',
      text: 'That He had come to Núr for one purpose only, to proclaim the Cause of God. That if He heard of a seeker a hundred leagues away who could not come to Him, He would go to that man gladly. And He rode to Saʿádat-Ábád to see the mujtahid that same day.',
      choices: [{ text: '"And the mujtahid?"', next: 'book' }],
    },
    book: {
      speaker: 'The Village Elder',
      onEnter: { set: { nurHeardSaadat: true } },
      text: 'Received Him with every ceremony, and then said he did nothing without first consulting the Qur\'án. He called for the Book, opened it, shut it again, and would not tell anyone the verse. "I have consulted the Book of God," he said, "and deem it inadvisable to go further." (He shrugs.) A few nodded. The rest of us know fear when we see it. Mírzá Ḥusayn-ʿAlí would not shame him. He took His leave most courteously.',
    },
  },
};

/** The Vazír's house before the news of the envoys comes back. */
export const nurHouseTakurShut: DialogueTree = {
  id: 'nur-house-takur-shut',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The door of the Vazír\'s house is shut, the step swept, a lamp left filled on the sill for whoever comes back first. Rain runs off the shingles in a curtain. Beside the house, where the other half of it stood before the flood, ferns grow through the old footings.',
    },
  },
};

/** The Vazír's house at the chapter's close. */
export const nurHouseTakur: DialogueTree = {
  id: 'nur-house-takur',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The rain has lifted. The road below the house is full of people going down toward the lowlands, toward His winter quarters: a mullá on a mule, two merchants, a woman with a child on her hip. The house itself stands empty, its door shut, its upper verandah open to the valley.',
      choices: [{ text: '(Stand a while at the door.)', next: 'light' }],
    },
    light: {
      speaker: 'Narrator',
      text: 'Núr means light. Nabíl would write that this district, hidden in the mountains of Mázindarán, was the first in all Persia to catch the rays of the Sun that had risen in Shíráz, and that while He went about it the very stones and trees seemed quickened.',
      choices: [{ text: '(Think of Mullá Ḥusayn.)', next: 'letter' }],
    },
    letter: {
      speaker: 'Narrator',
      text: 'Far to the east, in Khurásán, Mullá Ḥusayn is writing his letter: of Iṣfahán and Káshán, of a scroll carried at dawn, of the journey to Mázindarán and what has happened in Núr. It will go south by way of Yazd, and reach the Báb in Shíráz on a holy night of Ramaḍán, with Quddús beside Him; and Nabíl records that He rejoiced, and spoke of a marvel that had come to pass between the months of Jamádí and Rajab.',
      choices: [
        { text: '"A secret hidden in Ṭihrán. I stood at its door, and I did not go in."', next: 'end',
          requires: f => f.recognised === true },
        { text: '"I still do not know what I saw. But I know where I saw it."', next: 'end',
          requires: f => f.recognised !== true },
      ],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { nurComplete: true } },
      text: 'You go down out of the hills with the wet woods at your back and take the long road south, across the whole of Persia, to Búshihr and the sea, where pilgrim ships wait for the wind to the Ḥijáz.',
    },
  },
};

export const nurTakurDialogues: Record<string, DialogueTree> = {
  [nurWoman.id]: nurWoman,
  [nurElder.id]: nurElder,
  [nurEnvoys.id]: nurEnvoys,
  [nurAbulQasim.id]: nurAbulQasim,
  [nurGroom.id]: nurGroom,
  [nurElderSaadat.id]: nurElderSaadat,
  [nurHouseTakurShut.id]: nurHouseTakurShut,
  [nurHouseTakur.id]: nurHouseTakur,
};
