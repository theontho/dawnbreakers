import type { DialogueTree } from '../../dialogue/types';

/**
 * Chapter 5, the Palace of the Sun, winter 1846 to spring 1847. The
 * Muʿtamid's protection, the treatise on the specific mission of Muḥammad,
 * the gathering of divines, and the governor's death. The Báb is shown
 * through the writing desk, the empty seat of honour, and a closed door.
 */

/** Manúchihr Khán, the Muʿtamidu'd-Dawlih, Governor of Iṣfahán. */
export const mutamidDialogue: DialogueTree = {
  id: 'ch5-mutamid',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Manúchihr Khán, the Muʿtamid',
      text: 'Few come to me without a petition. Iṣfahán has received many claimants, scholars, and exiles. Yet when this Guest entered my city, I felt the weight of office change in my hands.',
      choices: [
        { text: '"You risk much by offering Him sanctuary."', next: 'shelter' },
        { text: '"What did you see that others refused to see?"', next: 'witness' },
        { text: '"The divines have signed against Him. What will you do?"', next: 'plan',
          requires: f => !!f.heardMutamidProtection && !!f.readTreatise && !!f.heardDivines },
      ],
    },
    shelter: {
      speaker: 'Manúchihr Khán, the Muʿtamid',
      onEnter: { set: { heardMutamidProtection: true } },
      text: 'A governor is entrusted with order. But order without justice is only fear arranged neatly. I came to this country as a captive boy from Georgia. I know what it is to be at the mercy of strangers. My house will not be closed to Him.',
      choices: [{ text: '"What have you asked of Him?"', next: 'question' }],
    },
    witness: {
      speaker: 'Manúchihr Khán, the Muʿtamid',
      onEnter: { set: { heardMutamidProtection: true } },
      text: 'Composure. Knowledge. A courtesy that made my rank look like a child\'s game. I have seen kings demand reverence. He awakens it without asking.',
      choices: [{ text: '"What have you asked of Him?"', next: 'question' }],
    },
    question: {
      speaker: 'Manúchihr Khán, the Muʿtamid',
      text: 'I asked Him to prove the specific mission of Muḥammad, which the learned argue over for whole winters. In less than two hours He had written fifty pages on it. Read them at the desk in the west court, if you have your letters. Then hear what the divines made of Him.',
    },
    plan: {
      speaker: 'Manúchihr Khán, the Muʿtamid',
      text: 'They have. Most would not even come and face Him. They signed in their own houses, where no answer could reach them. Now the Sháh orders Him sent to Ṭihrán. Very well. He shall leave by the gate in daylight, with five hundred horsemen, for the whole city to see.',
      choices: [{ text: '"And then?"', next: 'ruse' }],
    },
    ruse: {
      speaker: 'Manúchihr Khán, the Muʿtamid',
      text: 'And at night, by another road, a few men I trust will bring Him back here, to the Palace of the Sun. No one beyond these walls will know. Let the divines congratulate one another. He will have quiet, and I will have His company.',
      choices: [{ text: '"And if the Sháh learns of it?"', next: 'offer' }],
    },
    offer: {
      speaker: 'Manúchihr Khán, the Muʿtamid',
      text: 'I offered Him everything: my treasure, my soldiers, my credit at court, to win the Sháh for His Cause. He thanked me, and declined. Not by armies, He said, nor by gold. And He told me, very gently, that my days were few. Three months, and nine days.',
      choices: [{ text: '"Does that not frighten you?"', next: 'fear' }],
    },
    fear: {
      speaker: 'Manúchihr Khán, the Muʿtamid',
      text: 'I am old, and my name is hard in the mountains. I have done things I would not wish weighed. At the very end I have been given one thing truly worth doing. I am not frightened, traveller. I am grateful.',
      choices: [{ text: '(Bow low, and leave him in the garden.)', next: 'death' }],
    },
    death: {
      speaker: 'Narrator',
      onEnter: { set: { mutamidDied: true } },
      text: 'Winter closes over Iṣfahán. The Báb lives hidden in the Palace of the Sun, and the city believes Him gone. Then, as the days that were counted for him run out, Manúchihr Khán dies. His seat in the garden stands empty. His nephew, Gurgín Khán, holds the keys now.',
    },
  },
};

/** The writing desk in the west court, where the treatise was written. */
export const treatiseDialogue: DialogueTree = {
  id: 'ch5-treatise',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A low writing desk stands on a carpet in the west court, a reed pen laid across the inkwell. The pages are gone to the copyists, but the desk keeps the shape of the work: a worn place where a sleeve rested, a single drop of ink dried on the wood.',
      choices: [
        { text: '"Let learning bow before a living proof."', next: 'learning', effect: { set: { isfahanStance: 'learning' } } },
        { text: '"Can a governor shelter such a claim from politics?"', next: 'politics', effect: { set: { isfahanStance: 'politics' } } },
        { text: '"I only wonder that such words came down in this quiet court."', next: 'wonder', effect: { set: { isfahanStance: 'wonder' } } },
      ],
    },
    learning: {
      speaker: 'Narrator',
      text: 'You think of the scholars of Karbilá, who asked for measured argument their whole lives. Here, in an afternoon, someone gave them oceans in the vessel of a page.',
      choices: [{ text: '(Read the copy left beside the desk.)', next: 'writing' }],
    },
    politics: {
      speaker: 'Narrator',
      text: 'The palace walls are thick, but not thicker than fear. Still, the Muʿtamid has opened them, and protection itself has become a kind of testimony.',
      choices: [{ text: '(Read the copy left beside the desk.)', next: 'writing' }],
    },
    wonder: {
      speaker: 'Narrator',
      text: 'Wonder is no small beginning. Many arrive with ledgers of proof. Some depart with a silence no ledger can contain.',
      choices: [{ text: '(Read the copy left beside the desk.)', next: 'writing' }],
    },
    writing: {
      speaker: 'Narrator',
      text: 'Sentence follows sentence on the mission of Muḥammad, on the station of the Messengers of God, on the signs by which the sincere may know truth when it comes. It was written, the servants say, without a pause, in the time it takes a long meal to grow cold.',
      choices: [{ text: '(Set the pages down gently.)', next: 'moved' }],
    },
    moved: {
      speaker: 'Narrator',
      onEnter: { set: { readTreatise: true } },
      text: 'When the treatise was read aloud, the Muʿtamid declared before his court that until that day he had held his faith as an inheritance, and now he held it with conviction. A governor of Persia, moved by a prisoner\'s pen, in front of his own servants.',
    },
  },
};

/** The palace scribe, copying the treatise for the divines. */
export const scribeDialogue: DialogueTree = {
  id: 'ch5-scribe',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Palace Scribe',
      text: '(He does not look up from his page.) One moment. If I lift the pen in the middle of a word, the Muʿtamid will hear of it. This is the fourth copy. The divines want their own, so they can find the mistakes.',
      choices: [
        { text: '"Have they found any?"', next: 'mistakes' },
        { text: '"Were you there when it was written?"', next: 'there' },
      ],
    },
    mistakes: {
      speaker: 'Palace Scribe',
      onEnter: { set: { scribeSpoke: true } },
      text: 'They found that some of the grammar is not the grammar of the schools. I found that I have copied it four times and still cannot stop at the end of a page. Make of that what you like. I am only a scribe.',
    },
    there: {
      speaker: 'Palace Scribe',
      onEnter: { set: { scribeSpoke: true } },
      text: 'I was there to sharpen pens. I sharpened three. He needed one. The Muʿtamid sat with his hands in his lap like a schoolboy, and when it was done he did not speak for a long while. I have served him eleven years. I had never seen him without words.',
    },
  },
};

/** The empty seat of honour beneath the garden canopy. */
export const seatDialogue: DialogueTree = {
  id: 'ch5-seat',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Beneath the canopy a seat of honour stands empty, its bolster square, its carpet swept. Here the Muʿtamid seated his Guest above himself, when he summoned the learned of Iṣfahán to meet Him face to face.',
      choices: [{ text: '(Look at the carpets set in a ring before it.)', next: 'gathered' }],
    },
    gathered: {
      speaker: 'Narrator',
      text: 'Many sent excuses. Some were ill, some had pressing business, and some simply did not wish to be seen to lose. Those who came sat in a ring on these carpets, among them Áqá Muḥammad-Mihdí, and the philosopher Mírzá Ḥasan-i-Núrí.',
      choices: [{ text: '(Imagine the questions.)', next: 'questions' }],
    },
    questions: {
      speaker: 'Narrator',
      text: 'Mírzá Ḥasan put the hardest questions of the philosophers, the kind a man spends a lifetime trying to answer. The replies came simply and briefly, and the philosopher fell silent. The evening ended without a victory anyone dared to claim.',
      choices: [{ text: '(Step back from the empty seat.)', next: 'end' }],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { heardDivines: true } },
      text: 'Afterwards those who had stayed away wrote that the young Siyyid had been allowed to speak unchallenged, and signed their names to a sentence against Him, each in his own house. The seat holds the shape of no one. You find you cannot sit down near it.',
    },
  },
};

/** Mírzá Ḥasan-i-Núrí, a philosopher who came to the gathering. */
export const philosopherDialogue: DialogueTree = {
  id: 'ch5-philosopher',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mírzá Ḥasan-i-Núrí',
      text: 'You are looking at the carpets as if someone were still sitting on them. I do the same. I came to that gathering prepared to be bored. I am not used to being wrong about being bored.',
      choices: [
        { text: '"What did you ask Him?"', next: 'asked' },
        { text: '"Why did the others stay away?"', next: 'away' },
      ],
    },
    asked: {
      speaker: 'Mírzá Ḥasan-i-Núrí',
      text: 'The old riddles of the philosophers: how the One gives rise to the many, how the bodily rising is to be understood. Questions I have taught for thirty years by making them longer. He made them shorter. It is a very humbling thing, to watch your life\'s work fit in a sentence.',
      choices: [{ text: '"And are you persuaded?"', next: 'persuaded' }],
    },
    away: {
      speaker: 'Mírzá Ḥasan-i-Núrí',
      text: 'Because a man who comes and loses has lost. A man who stays home and signs has only been cautious. Iṣfahán has always admired caution. It is our architecture: beautiful domes, and very thick walls.',
      choices: [{ text: '"And you? Are you persuaded?"', next: 'persuaded' }],
    },
    persuaded: {
      speaker: 'Mírzá Ḥasan-i-Núrí',
      onEnter: { set: { philosopherSpoke: true } },
      text: 'Persuaded is a word for arguments. I am disturbed, which is a word for the heart. Ask me again in a year, if they let either of us live that long.',
    },
  },
};

/** Where the old governor sat, after his death. */
export const mutamidEmptyDialogue: DialogueTree = {
  id: 'ch5-mutamid-empty',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Where Manúchihr Khán used to sit in the evenings, a carpet lies rolled and tied with cord. Someone has left a cushion on it, out of habit. The gardeners walk around the place without being told.',
      choices: [{ text: '(Stand a moment for the old governor.)', next: 'end' }],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { mournedMutamid: true } },
      text: 'A captive boy from Georgia who became the hardest man in Persia, and at the end of his life chose to be a host. You find that you are praying for him, and that it does not feel strange.',
    },
  },
};

/** Gurgín Khán, the Muʿtamid's nephew and successor. */
export const gurginDialogue: DialogueTree = {
  id: 'ch5-gurgin',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Gurgín Khán',
      text: 'You knew my uncle? Then you know he kept secrets. I do not intend to inherit them. This palace has housed a guest the Sháh believes is in Ṭihrán. That ends today.',
      choices: [
        { text: '"He protected an innocent man."', next: 'innocent' },
        { text: '"What will you do?"', next: 'do' },
      ],
    },
    innocent: {
      speaker: 'Gurgín Khán',
      text: 'He protected a man the Sháh had sent for. My uncle could afford such feelings. He had no heirs to ruin. I have written to the capital and told them where their prisoner is.',
      choices: [{ text: '"And what will become of Him?"', next: 'do' }],
    },
    do: {
      speaker: 'Gurgín Khán',
      onEnter: { set: { gurginMet: true } },
      text: 'An escort under Muḥammad Big will take Him north by night, avoiding the towns. Quietly. No crowds, no Friday prayers, no water carried off in jars. Stand at the door if you must. You will not be standing there long.',
    },
  },
};

/** While the Muʿtamid lives, the inner door is his secret. */
export const chamberLockedDialogue: DialogueTree = {
  id: 'ch5-chamber-locked',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A carved door to the inner apartments, watched by the Muʿtamid\'s own men, who look at you without seeing you. While the old governor lives, what lies behind it is his to keep. You have not yet heard all that this palace has to tell.',
    },
  },
};

/** The departure from the Palace of the Sun, toward the north. */
export const chamberDialogue: DialogueTree = {
  id: 'ch5-chamber',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The carved door of the inner apartments stands open now. Gurgín Khán\'s men wait beside it with lanterns hooded. Within is a plain room: a carpet, a lamp, a writing case closed and strapped. Four months of hidden quiet, packed into one small bundle.',
      choices: [{ text: '(Stand aside in the dark of the garden.)', next: 'escort' }],
    },
    escort: {
      speaker: 'Narrator',
      text: 'Past midnight, horses in the outer court. The escort forms up under Muḥammad Big. They ride out without torches, by the back gate, so that the city will wake and know nothing. No one tells you which road. You do not need to be told.',
      choices: [
        { text: '"His protection was a testimony. So is this departure."', next: 'end',
          requires: f => f.isfahanStance === 'politics' },
        { text: '"He wrote fifty pages in an afternoon. What will He write in a prison?"', next: 'end',
          requires: f => f.isfahanStance === 'learning' },
        { text: '(Say nothing. Wonder needs no words tonight.)', next: 'end',
          requires: f => f.isfahanStance === 'wonder' },
        { text: '(Follow the hoofprints north.)', next: 'end' },
      ],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { isfahanComplete: true } },
      text: 'At dawn the river is grey and the plane trees are bare. In the garden an old man\'s seat is empty, and so is a young man\'s room. The road runs north toward the capital, but orders change on the road. Beyond Ṭihrán lie the mountains of Ádharbáyján, and their fortresses are already cold.',
    },
  },
};
