import type { DialogueTree } from '../../dialogue/types';

/**
 * Chapter 5, Iṣfahán by the river, autumn 1846. The Báb has come from
 * Shíráz and is lodged, at the Muʿtamid's request, in the house of the
 * Imám-Jumʿih. He is spoken of by those who served and watched Him.
 */

/** A merchant at the caravan stalls on the south bank. */
export const arrivalDialogue: DialogueTree = {
  id: 'ch5-arrival',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Market Visitor',
      text: 'You came up the Shíráz road? You have its dust on your boots. So did He, when He came. Half the city speaks of nothing else: the young Siyyid of Shíráz, and the Muʿtamid who has taken Him under his protection.',
      choices: [
        { text: '"Where is He lodged?"', next: 'lodged' },
        { text: '"Does the city welcome such protection?"', next: 'murmur' },
      ],
    },
    lodged: {
      speaker: 'Market Visitor',
      onEnter: { set: { heardIsfahanArrival: true } },
      text: 'He wrote to the governor from outside the walls, asking where He should stay. Imagine it: a prisoner asking a governor\'s leave, politely. The Muʿtamid sent Him to the Imám-Jumʿih, whose house is across the bridge, to the west.',
      choices: [{ text: '"And the governor\'s palace?"', next: 'palace' }],
    },
    murmur: {
      speaker: 'Market Visitor',
      onEnter: { set: { heardIsfahanArrival: true } },
      text: 'Some bless the governor for his courage. Others count the letters of complaint already forming in their heads. Iṣfahán is beautiful, friend, but beauty has never made a city brave.',
      choices: [{ text: '"Where may I learn more?"', next: 'lodged' }],
    },
    palace: {
      speaker: 'Market Visitor',
      text: 'The Palace of the Sun, east along the north bank. Scribes, divines, and servants all wait to see what will be written there. Cross the bridge and keep the river on your right.',
    },
  },
};

/** A cleric at the madrasa gate, honest in his doubts. */
export const clericQuestionDialogue: DialogueTree = {
  id: 'ch5-cleric-question',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Learned Cleric',
      text: 'The city murmurs that the young Siyyid will answer questions on prophethood itself. Tell me, traveller: should every eloquent pen be mistaken for authority?',
      choices: [
        { text: '"No. But neither should authority be denied because it arrives humbly."', next: 'humble' },
        { text: '"Let the test be knowledge, character, and the power of the revealed word."', next: 'test' },
        { text: '"They say the divines have signed against Him. Did you?"', next: 'signed',
          requires: f => !!f.heardDivines },
      ],
    },
    humble: {
      speaker: 'Learned Cleric',
      onEnter: { set: { heardIsfahanCleric: true } },
      text: 'A careful answer. Perhaps Iṣfahán will learn whether humility can bear a weight that pride cannot lift. I confess I am not sure the city wishes to learn it.',
    },
    test: {
      speaker: 'Learned Cleric',
      onEnter: { set: { heardIsfahanCleric: true } },
      text: 'Then we shall hear the treatise, and each heart will discover what kind of scale it has brought. Mine, I fear, was made by my teachers, and weighs only what they weighed.',
    },
    signed: {
      speaker: 'Learned Cleric',
      onEnter: { set: { heardIsfahanCleric: true } },
      text: '(He looks at his ink-stained thumb.) They brought the paper to my room after the evening prayer. Thirty names already on it. I did not go to the gathering. I did not read the treatise. I signed. Do not ask me to be proud of it.',
    },
  },
};

/** Mír Siyyid Muḥammad, Imám-Jumʿih of Iṣfahán, host to the Báb. */
export const imamJumihIsfahan: DialogueTree = {
  id: 'ch5-imam-jumih',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Imám-Jumʿih of Iṣfahán',
      text: 'Welcome, traveller. You have the look of a man who followed someone here. Many do, these days. My doorkeeper says he has never been so busy, nor so tired.',
      choices: [{ text: '"I followed your Guest from Shíráz."', next: 'guest' }],
    },
    guest: {
      speaker: 'The Imám-Jumʿih of Iṣfahán',
      text: 'The Muʿtamid wrote to me: lodge Him, and honour Him. I meant to do it as a duty. On the first evening I found myself taking the ewer from my servant\'s hands, to pour the water for His washing myself. My household thought I had lost my mind.',
      choices: [{ text: '"And had you?"', next: 'asr' }],
    },
    asr: {
      speaker: 'The Imám-Jumʿih of Iṣfahán',
      text: 'Perhaps. One night after supper I asked Him for a commentary on the Súrih of Va\'l-ʿAṣr, By the Afternoon. I thought He would promise it for some later day. He took up His pen at once and wrote, there among the dishes, while we watched.',
      choices: [
        { text: '"What did He write?"', next: 'wrote' },
        { text: '"How has the city taken it?"', next: 'city' },
      ],
    },
    wrote: {
      speaker: 'The Imám-Jumʿih of Iṣfahán',
      onEnter: { set: { heardValAsr: true } },
      text: 'Pages, on the first letter alone. On the afternoon of the world, when the day is far spent and the light lies low and gold. I have heard every preacher in Persia. I could not have written that in a year.',
      choices: [
        { text: '"How has the city taken it?"', next: 'city' },
        { text: '"I am still searching. What did you find?"', next: 'search', requires: f => f.recognised === false },
      ],
    },
    search: {
      speaker: 'The Imám-Jumʿih of Iṣfahán',
      text: 'I found I had become a servant in my own house. Whether that is faith or only good manners, I am still discovering. Do not be ashamed to discover slowly. Only be ashamed to stop.',
      choices: [{ text: '"And the city?"', next: 'city' }],
    },
    city: {
      speaker: 'The Imám-Jumʿih of Iṣfahán',
      onEnter: { set: { heardValAsr: true } },
      text: 'They crowd to the Friday prayers to see Him. Some carry off the water of His washing as though it were holy. The divines do not like it. Nor, I confess, does some cowardly part of me. Go east along the river to the Palace of the Sun. The Muʿtamid will want an honest witness.',
    },
  },
};

/** The silver ewer and basin in the Imám-Jumʿih's porch. */
export const ewerDialogue: DialogueTree = {
  id: 'ch5-ewer',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'On a low inlaid stand in the Imám-Jumʿih\'s porch sit a silver ewer and basin, polished until they hold the whole sky. A servant is wiping the rim, very carefully, though it is already clean.',
      choices: [
        { text: '(Ask the servant why he polishes it so.)', next: 'servant' },
        { text: '(Look at your reflection in the basin.)', next: 'basin' },
      ],
    },
    servant: {
      speaker: 'Narrator',
      onEnter: { set: { sawEwer: true } },
      text: 'He tells you, without looking up, that the master of this house poured water from it over the hands of his Guest, with his own hands, kneeling. "I have served here thirty years," he says. "I did not know the master knew how to kneel."',
    },
    basin: {
      speaker: 'Narrator',
      onEnter: { set: { sawEwer: true } },
      text: 'Your face looks back at you, travel-thin, with plane leaves drifting across it. A little water still lies in the bottom of the basin. You find you do not want to disturb it.',
    },
  },
};

/** A cloth-printer rinsing block-printed cotton in the river. */
export const clothPrinterDialogue: DialogueTree = {
  id: 'ch5-cloth-printer',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Cloth-Printer',
      text: '(She wrings a length of printed cotton, red and indigo, into the river.) The river takes the loose dye and leaves the pattern. Mostly. You are not here to buy cloth, I think.',
      choices: [
        { text: '"I am here for the Guest of the Imám-Jumʿih."', next: 'guest' },
        { text: '"What do people say of the Muʿtamid?"', next: 'mutamid' },
      ],
    },
    guest: {
      speaker: 'A Cloth-Printer',
      text: 'Everyone is. I went to the Friday prayer only to see Him. My husband went for the sermon and came home talking about the Guest. I never heard my husband talk about anything but the price of madder.',
      choices: [{ text: '"And the Muʿtamid?"', next: 'mutamid' }],
    },
    mutamid: {
      speaker: 'A Cloth-Printer',
      onEnter: { set: { printerSpoke: true } },
      text: 'Manúchihr Khán? The hardest man in Persia, they used to say. He put down the tribes in the mountains without mercy. And now he shelters a young Siyyid against every turban in Iṣfahán. People change, like cloth in the river. Some colours run. Some set.',
    },
  },
};

/** A theology student who copies the commentary by night. */
export const studentDialogue: DialogueTree = {
  id: 'ch5-student',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Theology Student',
      text: '(A young man with ink to the elbow hides a sheaf of pages under his cloak as you come near.) Oh. You are not my teacher. Forgive me. I have not slept.',
      choices: [
        { text: '"What are you hiding?"', next: 'pages' },
        { text: '"Your teacher would not approve?"', next: 'teacher' },
      ],
    },
    pages: {
      speaker: 'A Theology Student',
      text: 'A copy of the commentary on Va\'l-ʿAṣr. Someone in the Imám-Jumʿih\'s household lent it to me for one night. I have copied until my fingers will not close. Here: look at this line. I cannot stop reading it.',
      choices: [{ text: '(Read over his shoulder.)', next: 'read' }],
    },
    teacher: {
      speaker: 'A Theology Student',
      text: 'My teacher says it is a forgery of eloquence, sweet poison. He has not read it. I asked him how he knew. He said a man need not drink from a well to know it is poisoned. I said that is exactly how one would never find out.',
      choices: [{ text: '"What do you have there?"', next: 'pages' }],
    },
    read: {
      speaker: 'A Theology Student',
      onEnter: { set: { studentCopied: true } },
      text: 'You see? The afternoon, the long gold light, a people at the end of a day who do not know it is ending. The divines are calling a gathering to test Him. Half of them will not come. They are afraid of losing to a merchant in front of the Muʿtamid.',
    },
  },
};
