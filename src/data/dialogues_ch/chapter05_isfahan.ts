import type { DialogueTree } from '../../dialogue/types';

export const arrivalDialogue: DialogueTree = {
  id: 'ch5-arrival',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Market Visitor',
      text: 'You have come by the river road at a strange hour. The city speaks of the Báb, and of the Muʿtamid who has taken Him beneath his protection.',
      choices: [
        { text: '"Where may I learn more?"', next: 'palace' },
        { text: '"Does the city welcome such protection?"', next: 'murmur' },
      ],
    },
    palace: {
      speaker: 'Market Visitor',
      onEnter: { set: { heardIsfahanArrival: true } },
      text: 'Cross the bridge and follow the stone way to the palace courtyard. Scribes, clerics, and servants all wait to see what will be written there.',
    },
    murmur: {
      speaker: 'Market Visitor',
      onEnter: { set: { heardIsfahanArrival: true } },
      text: 'Some bless the governor for courage; others count the letters of complaint already forming in their minds. Iṣfahán is beautiful, friend, but beauty does not make a city fearless.',
    },
  },
};

export const treatiseDialogue: DialogueTree = {
  id: 'ch5-treatise',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Palace Scribe',
      text: 'The reed pen is ready. Between the appointed prayers, the Báb has consented to answer the question of prophethood in a treatise for the learned of Iṣfahán.',
      choices: [
        { text: '"Let learning bow before a living proof."', next: 'learning', effect: { set: { isfahanStance: 'learning' } } },
        { text: '"Can a governor shelter such a claim from politics?"', next: 'politics', effect: { set: { isfahanStance: 'politics' } } },
        { text: '"I only wonder that such words can descend in this quiet room."', next: 'wonder', effect: { set: { isfahanStance: 'wonder' } } },
      ],
    },
    learning: {
      speaker: 'Palace Scribe',
      text: 'Then watch closely. The scholars ask for measured argument, and He gives them oceans in the vessel of a page.',
      choices: [{ text: '(Stand near the carpet and listen.)', next: 'writing' }],
    },
    politics: {
      speaker: 'Palace Scribe',
      text: 'The court walls are thick, but not thicker than fear. Still, the Muʿtamid has opened them, and tonight protection itself becomes a kind of testimony.',
      choices: [{ text: '(Stand near the carpet and listen.)', next: 'writing' }],
    },
    wonder: {
      speaker: 'Palace Scribe',
      text: 'Wonder is no small beginning. Many arrive with ledgers of proof; some depart with a silence no ledger can contain.',
      choices: [{ text: '(Stand near the carpet and listen.)', next: 'writing' }],
    },
    writing: {
      speaker: 'Narrator',
      text: 'The Báb writes with unhurried swiftness. Sentence follows sentence on the station of the Manifestations of God, on divine authority, on the signs by which the sincere may recognise truth.',
      choices: [{ text: '(Wait as the pages are gathered.)', next: 'moved' }],
    },
    moved: {
      speaker: 'Manúchihr Khán, the Muʿtamid',
      text: 'I have heard disputants fill halls with words and leave them empty. This youth fills a page, and the room itself seems altered.',
      choices: [{ text: '"May your shelter remain worthy of what it has received."', next: 'end' }],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { isfahanComplete: true } },
      text: 'In Iṣfahán, learning, power, and wonder meet for a brief sanctuary. Beyond the palace gates, opposition gathers; within them, a governor has been moved.',
    },
  },
};

export const mutamidDialogue: DialogueTree = {
  id: 'ch5-mutamid',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Manúchihr Khán, the Muʿtamid',
      text: 'Iṣfahán has received many claimants, scholars, and exiles. Yet when the Báb entered this city, I felt the burden of office change in my hands.',
      choices: [
        { text: '"You risk much by offering Him sanctuary."', next: 'shelter' },
        { text: '"What did you see that others refused to see?"', next: 'witness' },
      ],
    },
    shelter: {
      speaker: 'Manúchihr Khán, the Muʿtamid',
      onEnter: { set: { heardMutamidProtection: true } },
      text: 'A governor is entrusted with order, but order without justice is only fear arranged neatly. Let the envious write their complaints; my house will not be closed to Him.',
    },
    witness: {
      speaker: 'Manúchihr Khán, the Muʿtamid',
      onEnter: { set: { heardMutamidProtection: true } },
      text: 'Composure. Knowledge. A courtesy that made rank seem childish. I have seen kings demand reverence; He awakens it without asking.',
    },
  },
};

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
      ],
    },
    humble: {
      speaker: 'Learned Cleric',
      onEnter: { set: { heardIsfahanCleric: true } },
      text: 'A careful answer. Perhaps Iṣfahán will learn whether humility can bear a weight that pride cannot lift.',
    },
    test: {
      speaker: 'Learned Cleric',
      onEnter: { set: { heardIsfahanCleric: true } },
      text: 'Then we shall hear the treatise, and each heart will discover what kind of scale it has brought.',
    },
  },
};

export const chapter05Dialogues: Record<string, DialogueTree> = {
  [arrivalDialogue.id]: arrivalDialogue,
  [treatiseDialogue.id]: treatiseDialogue,
  [mutamidDialogue.id]: mutamidDialogue,
  [clericQuestionDialogue.id]: clericQuestionDialogue,
};
