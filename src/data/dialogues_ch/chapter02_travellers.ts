import type { DialogueTree } from '../../dialogue/types';

/**
 * Chapter 2: those setting out from the Qur'án Gate, and those who watch
 * them go. Each farewell sets a flag counted by `farewellCount`.
 */

/** Mullá ʿAlíy-i-Basṭámí, the second Letter, bound for the shrine cities of ʿIráq. */
export const mullaAliFarewell: DialogueTree = {
  id: 'ch2-mulla-ali',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá ʿAlíy-i-Basṭámí',
      text: 'Ah, the one who kept vigil on the step. Mullá Ḥusayn told us of you. I am Mullá ʿAlí, of Basṭám. My road runs west, to Najaf and Karbilá.',
      choices: [
        { text: '"Back to the shrine cities? To our own teachers?"', next: 'teachers' },
        { text: '"What do you carry?"', next: 'pages' },
      ],
    },
    teachers: {
      speaker: 'Mullá ʿAlíy-i-Basṭámí',
      text: 'To the very ʿulamá who taught us. They will hear me out politely, I think. Then less politely. A Gate that opens in Shíráz is a Gate they did not open.',
      choices: [{ text: '"And what do you carry to them?"', next: 'pages' }],
    },
    pages: {
      speaker: 'Mullá ʿAlíy-i-Basṭámí',
      text: '(He touches a bundle wrapped in oilcloth.) Pages copied from His commentary on the Súrih of Joseph. I have read them by every lamp between here and the gate. They read differently each time, as if they were reading me.',
      choices: [
        { text: '"Are you afraid?"', next: 'afraid' },
        { text: '"May God keep you on the road."', next: 'blessing' },
      ],
    },
    afraid: {
      speaker: 'Mullá ʿAlíy-i-Basṭámí',
      text: 'Of the road? No. Of being found unworthy of what I carry? Every hour. If I am the first to suffer for this, let it be with my face toward Shíráz.',
      choices: [{ text: '(Clasp his hand.)', next: 'blessing' }],
    },
    blessing: {
      speaker: 'Mullá ʿAlíy-i-Basṭámí',
      onEnter: { set: { ch2AliFarewell: true } },
      text: 'And may He keep you. Pray for the pages, friend, more than for me. Pages can be burned, but they cannot be made to recant.',
      choices: [{ text: '"Go in peace."' }],
    },
  },
};

/** The keeper of the Qur'án Gate, who has watched travellers pass beneath the Book for thirty years. */
export const gateWarden: DialogueTree = {
  id: 'ch2-gate-warden',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Gate Guard',
      text: 'Mind the arch, friend. Up there in the little room is a Qur\'án copied by a hand four hundred years dead. Whoever leaves Shíráz passes beneath it, and the Book keeps him on the road.',
      choices: [
        { text: '"Have many passed beneath it this week?"', next: 'many' },
        { text: '"Does it work?"', next: 'work' },
      ],
    },
    work: {
      speaker: 'A Gate Guard',
      text: '(He chuckles.) It has never stopped a bandit. But I have seen men pass under it angry and come out the other side quiet. That is a kind of keeping.',
      choices: [{ text: '"Have many passed this week?"', next: 'many' }],
    },
    many: {
      speaker: 'A Gate Guard',
      text: 'Scholars. More going out than ever came in. One of them stopped right where you stand, looked up at the Book, and wept like a child. Then he wiped his face and walked toward Khurásán as if the mountains were a garden path.',
      choices: [{ text: '"Did he say why he wept?"', next: 'why' }],
    },
    why: {
      speaker: 'A Gate Guard',
      onEnter: { set: { ch2WardenBlessing: true } },
      text: 'He said, "Because I have read it all my life, and only now has it answered me." I did not understand him. Go under the Book, friend, when your time comes. It costs nothing.',
      choices: [{ text: '"I will. Peace upon your gate."' }],
    },
  },
};

/** The caravanserai keeper, counting coins and strangers. */
export const seraiKeeper: DialogueTree = {
  id: 'ch2-serai-keeper',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Caravanserai Keeper',
      text: 'Rooms are full, water is extra, and the gray mule is not for sale whatever anyone tells you. What do you need?',
      choices: [
        { text: '"Only to ask about your guests."', next: 'guests' },
        { text: '"Nothing. You look busy."', next: 'busy' },
      ],
    },
    busy: {
      speaker: 'The Caravanserai Keeper',
      text: 'Busy! Thirty years I have kept this serai, and I have never seen a summer like it. Sit, sit. My feet hurt, and you have a listening face.',
      choices: [{ text: '"Tell me about this summer."', next: 'guests' }],
    },
    guests: {
      speaker: 'The Caravanserai Keeper',
      text: 'Men from Khurásán, Qazvín, Mázindarán, one from as far as Basṭám. They came one by one, like birds before rain. They paid without arguing, prayed half the night, and did not once quarrel over the well.',
      choices: [{ text: '"And now?"', next: 'leaving' }],
    },
    leaving: {
      speaker: 'The Caravanserai Keeper',
      onEnter: { set: { ch2KeeperTally: true } },
      text: 'Now they leave by every road at once. ʿIráq, Khurásán, Yazd, the north. In thirty years I have never seen guests go off in so many directions wearing the same face. (He lowers his voice.) What did they find in Shíráz? Not my soup.',
      choices: [
        { text: '"Something they were looking for a long time."' },
        { text: '"Ask them when they come back."' },
      ],
    },
  },
};

/** An old man near the poet's garden who reads fortunes from the Díván of Ḥáfiẓ. */
export const falReader: DialogueTree = {
  id: 'ch2-fal-reader',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Fál-Reader',
      text: 'The poet sleeps a stone\'s throw from here, under his cypresses. They call him the Tongue of the Unseen. Take a fál before you travel, friend. Make an intention, and I will open the Díván.',
      choices: [
        { text: '(Make an intention about the road ahead.)', next: 'road' },
        { text: '(Make an intention about the One the scholars are whispering of.)', next: 'one' },
        { text: '"I do not hold with fortunes."', next: 'doubt' },
      ],
    },
    doubt: {
      speaker: 'The Fál-Reader',
      text: 'Nor do I, entirely. But a good verse at the right hour is not a fortune. It is a friend who arrives on time. Make an intention anyway; it costs nothing.',
      choices: [
        { text: '(Make an intention about the road ahead.)', next: 'road' },
        { text: '(Make an intention about the One the scholars are whispering of.)', next: 'one' },
      ],
    },
    road: {
      speaker: 'The Fál-Reader',
      text: '(He opens the book with his eyes closed and reads.) The poet says: the breeze of dawn has brought news of the Friend, and the sleepers ask where the fragrance comes from. (He looks up.) A good fál for a traveller. Walk early.',
      choices: [{ text: '"News of the Friend."', next: 'close' }],
    },
    one: {
      speaker: 'The Fál-Reader',
      text: '(He opens the book with his eyes closed and reads.) The poet says: do not ask the wine-seller for the secret; ask the cup, for the cup has been in His hand. (He is quiet a moment.) Strange. I have opened this book ten thousand times. That page has never come before.',
      choices: [{ text: '"Ask the cup."', next: 'close' }],
    },
    close: {
      speaker: 'The Fál-Reader',
      onEnter: { set: { ch2FalTaken: true } },
      text: 'Keep it in your mouth like a date stone on a long road. And when you find whatever it is you are looking for, come back and tell an old man whether the poet was right.',
      choices: [{ text: '"I will, if God allows."' }],
    },
  },
};

/** Mubárak, the household servant, buying mules for the road to Búshihr. */
export const mubarakMules: DialogueTree = {
  id: 'ch2-mubarak',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mubárak, the Household Servant',
      text: '(He is running his hand down a mule\'s foreleg, frowning.) Too hot. This one would go lame before Kázirún. Peace be with you, friend.',
      choices: [
        { text: '"You remember me?"', next: 'remember', requires: f => !!f.vigilKept },
        { text: '"You are buying for a journey?"', next: 'journey' },
      ],
    },
    remember: {
      speaker: 'Mubárak, the Household Servant',
      text: 'I trimmed the lamp that night, and I saw you on the step when I opened the door at dawn. You had not moved. My Master asked after you, later. He remembers those who wait.',
      choices: [{ text: '"You are buying for a journey?"', next: 'journey' }],
    },
    journey: {
      speaker: 'Mubárak, the Household Servant',
      text: 'To Búshihr, and from there the sea, and then Mecca. My Master makes the pilgrimage this year, with Quddús. I must find mules that are sound and water-skins that do not weep.',
      choices: [
        { text: '"And the household in Shíráz?"', next: 'household' },
        { text: '"May I help you choose?"', next: 'choose' },
      ],
    },
    household: {
      speaker: 'Mubárak, the Household Servant',
      text: 'His mother and His wife remain. Khadíjih-Bagum asks me each morning whether everything is ready, and each morning I say not yet, so that she has one more morning. (He smiles.) That is a servant\'s small lie. God forgive it.',
      choices: [{ text: '"May I help you choose a mule?"', next: 'choose' }],
    },
    choose: {
      speaker: 'Mubárak, the Household Servant',
      onEnter: { set: { ch2MubarakNews: true } },
      text: 'Look at the eyes, not the coat. A mule with patient eyes will carry you over a mountain. (He pays the muleteer and adds a coin.) My Master told me to give a little more than the price. The man has children.',
      choices: [{ text: '"May your road to the sea be gentle."' }],
    },
  },
};

/** A wandering dervish near the roadside shrine reflects on motion and silence. */
export const roadDervish: DialogueTree = {
  id: 'road-dervish',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Wandering Dervish',
      text: 'The road has two tongues: one of dust beneath the foot, one of silence inside the breast. Most men hear only the first.',
      choices: [
        { text: '"And what does the silence say today?"', next: 'silence' },
        { text: '(Offer him a little water from your skin.)', next: 'water' },
        { text: '"Have you seen the scholars leaving?"', next: 'scholars' },
      ],
    },
    silence: {
      speaker: 'Wandering Dervish',
      onEnter: { set: { roadHeardDervish: true } },
      text: 'It says that a dawn does not argue with the horizon. It arrives, and the sleepers must decide whether to call it light.',
      choices: [{ text: '"Then may I not sleep through it."' }],
    },
    water: {
      speaker: 'Wandering Dervish',
      onEnter: { set: { roadHeardDervish: true } },
      text: 'May the cup you give return as courage when your own throat is dry. The roads are long, friend, and not all thirst is of the body.',
      choices: [{ text: '"Pray for the travellers."' }],
    },
    scholars: {
      speaker: 'Wandering Dervish',
      onEnter: { set: { roadHeardDervish: true } },
      text: 'I have seen them. They walk like men who have been told a secret and are not allowed to tell it. I know that walk. I have been waiting forty years to walk it myself.',
      choices: [{ text: '"Perhaps your road is shorter than you think."' }],
    },
  },
};

/** A caravan muleteer loading for Iṣfahán. */
export const roadMuleteer: DialogueTree = {
  id: 'road-muleteer',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Caravan Muleteer',
      text: 'Keep clear of the gray mule; she bites scholars and governors alike. Are you bound north with letters, trade, or a question?',
      choices: [
        { text: '"A question that has become a road."', next: 'question' },
        { text: '"What news travels with the caravans?"', next: 'news' },
      ],
    },
    question: {
      speaker: 'Caravan Muleteer',
      onEnter: { set: { roadMetMuleteer: true } },
      text: 'Then carry dates, patience, and a quiet tongue. Twelve days to Iṣfahán if the passes are kind, and a careless word can outrun the swiftest horse.',
      choices: [{ text: '"Who rides with you this time?"', next: 'rider' }],
    },
    news: {
      speaker: 'Caravan Muleteer',
      onEnter: { set: { roadMetMuleteer: true } },
      text: 'Pilgrims speak of expectation, couriers of unrest, merchants of unpaid debts. Yet under all of it I hear one thing: people are listening for a voice they cannot name.',
      choices: [{ text: '"Who rides with you this time?"', next: 'rider' }],
    },
    rider: {
      speaker: 'Caravan Muleteer',
      text: 'A tall mullá from Khurásán who paid for a mule and then walks beside it. Says he is too full to sit still. (He spits in the dust, not unkindly.) Scholars. Still, he helped me reload when the girth broke. Not many do.',
      choices: [{ text: '"That sounds like him."' }],
    },
  },
};

export const chapter02TravellerDialogues: Record<string, DialogueTree> = {
  [mullaAliFarewell.id]: mullaAliFarewell,
  [gateWarden.id]: gateWarden,
  [seraiKeeper.id]: seraiKeeper,
  [falReader.id]: falReader,
  [mubarakMules.id]: mubarakMules,
  [roadDervish.id]: roadDervish,
  [roadMuleteer.id]: roadMuleteer,
};
