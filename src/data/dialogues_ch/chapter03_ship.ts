import type { DialogueTree } from '../../dialogue/types';
import { chapter03CabinDialogues } from './chapter03_cabin';

/**
 * Chapter 3, autumn 1844: the pilgrim ship from Búshihr to Jidda. The voyage
 * is long and rough; water runs short; through every storm the Báb keeps
 * prayer and reveals verses while Quddús writes them down. He is never on
 * deck as a character: the player reaches Him through the lamplit cabin door
 * and the testimony of those aboard.
 */

export const quddusShip: DialogueTree = {
  id: 'ch3-quddus-ship',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Quddús sits cross-legged in the lee of the cabin, a writing board on his knees, his pen case wedged against the roll of the ship. He is perhaps twenty-two. Ink has dried on his fingers like a second skin.',
      choices: [{ text: '(Greet him.)', next: 'greet' }],
    },
    greet: {
      speaker: 'Quddús',
      text: 'Peace be with you, friend from Shíráz. Mubárak told me a seeker who kept vigil at the door had taken passage. The sea is wide, yet the heart may be wider.',
      choices: [
        { text: '"What are you writing?"', next: 'writing' },
        { text: '"You were the last of the Letters to find Him. How did you know?"', next: 'last' },
      ],
    },
    writing: {
      speaker: 'Quddús',
      text: 'Whatever He reveals. By day and by night, in calm and in this swell, the verses do not wait for the weather. I write until the lamp gutters, and then I write from memory.',
      choices: [{ text: '"And how did you come to Him?"', next: 'last' }],
    },
    last: {
      speaker: 'Quddús',
      text: 'I came to Shíráz late, from Mázindarán, and found Mullá Ḥusayn already changed. He would not point. Then I saw a young man walking in the street, and I knew Him by His walk. (He smiles.) Mullá Ḥusayn says that is not a proof. It was enough for me.',
      choices: [
        { text: '"I believed Mullá Ḥusayn\'s witness at dawn. What does that belief ask of me?"', next: 'asks',
          requires: f => f.recognised === true },
        { text: '"I asked for the verses before I would believe. Are these they?"', next: 'verses',
          requires: f => f.recognised === false },
        { text: '"Mullá Ḥusayn said the verses came from Him unbidden. Are these they?"', next: 'verses',
          requires: f => f.recognised === undefined },
      ],
    },
    asks: {
      speaker: 'Quddús',
      text: 'Only everything, and only a little at a time. Today it asks that you be gentle with the seasick and patient with the water ration. Tomorrow, who knows?',
      choices: [{ text: '(Smile.)', next: 'sea' }],
    },
    verses: {
      speaker: 'Quddús',
      text: '(He turns the board so you can see the wet lines.) Some of them. Read, if you like. I will not tell you what to find there. A truth that needs my help to be seen is not the truth I am writing.',
      choices: [{ text: '(Read a few lines in silence.)', next: 'sea', effect: { set: { ch3ReadVerses: true } } }],
    },
    sea: {
      speaker: 'Quddús',
      onEnter: { set: { ch3MetQuddus: true } },
      text: 'We journey toward the House raised for remembrance, and every wave counsels detachment. How does the sea find you?',
      choices: [
        { text: '"In awe at what may unfold."', next: 'awe', effect: { set: { ch3ShipAwe: true } } },
        { text: '"Afraid that certainty asks more than I possess."', next: 'caution', effect: { set: { ch3ShipCaution: true } } },
        { text: '"Watching the signs and weighing them."', next: 'scholar', effect: { set: { ch3ShipScholar: true } } },
      ],
    },
    awe: {
      speaker: 'Quddús',
      text: 'Then keep that awe humble. The Cause is not made greater by our amazement; rather, our souls are made quieter before it.',
      choices: [{ text: '(Bow your head and listen to the sea.)', next: 'storm' }],
    },
    caution: {
      speaker: 'Quddús',
      text: 'Caution can be a lantern if it is not allowed to become a veil. Ask for steadfastness, and walk one faithful step at a time.',
      choices: [{ text: '(Let his words settle.)', next: 'storm' }],
    },
    scholar: {
      speaker: 'Quddús',
      text: 'The learned eye has its station. Yet some truths are recognised only when learning kneels beside love.',
      choices: [{ text: '(Remember this counsel.)', next: 'storm' }],
    },
    storm: {
      speaker: 'Quddús',
      text: 'The captain says the wind will turn tonight. If you cannot sleep, sit by the cabin door. That lamp has not gone out once since Búshihr.',
      choices: [{ text: '"I will keep watch there."' }],
    },
  },
};

/** The cabin door before the player has spoken with Quddús. */
export const cabinQuiet: DialogueTree = {
  id: 'ch3-cabin-quiet',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The cabin door is shut. Lamplight shows through the lattice, and a low voice within, steady as the creak of the timbers. To linger here now would feel like eavesdropping. Quddús, writing nearby, might tell you what keeps that lamp alight.',
    },
  },
};

/** The storm night, kept at the cabin threshold. */
export const cabinStorm: DialogueTree = {
  id: 'ch3-cabin-storm',
  startId: 'door',
  nodes: {
    door: {
      speaker: 'Narrator',
      text: 'Lamplight through the lattice, and the low voice within that has not stopped since Búshihr. Quddús\'s pen case lies on the green mat before the door.',
      choices: [
        { text: '(Keep watch here through the night.)', next: 'g', requires: f => !f.ch3StormWeathered },
        { text: '(Sit by the door in the calm.)', next: 'calm', requires: f => !!f.ch3StormWeathered },
      ],
    },
    calm: {
      speaker: 'Narrator',
      text: 'The sea is quiet now, blue to the horizon. Through the lattice you hear the scratch of a pen and a voice reading back what has been written, unhurried, as if the storm had been only a page turned.',
    },
    g: {
      speaker: 'Narrator',
      text: 'Night. The wind the captain promised comes out of the south like a door flung open. The deck tilts until the stars swing through the rigging. Below, pilgrims cry out; a cask breaks loose and rolls toward the rail.',
      choices: [
        { text: '(Throw yourself on the loose cask with the sailors.)', next: 'help', effect: { set: { ch3HelpedSailors: true } } },
        { text: '(Brace yourself against the cabin wall.)', next: 'voice' },
      ],
    },
    help: {
      speaker: 'Narrator',
      text: 'A sailor whose name you never learn pushes the galley lantern into your hands and shouts over the wind: light, here, so they can see the knots. The flame is already bending.',
      choices: [{ text: '(Shield the flame.)', next: 'lashed', play: 'LampGame' }],
    },
    lashed: {
      speaker: 'Narrator',
      text: 'The last knot is hauled tight, and the cask sits still against the rail. The sailor slaps your shoulder and points with his chin toward the stern.',
      choices: [
        { text: '(Look where he points.)', next: 'steady', requires: f => f.ch3LanternOuts === 0 },
        { text: '(Look where he points.)', next: 'guttered', requires: f => f.ch3LanternOuts !== 0 },
      ],
    },
    steady: {
      speaker: 'Narrator',
      text: 'Your flame never went out, though it lay down flat and stood up again a dozen times. At the stern, behind the lattice, the other lamp burns as it has burned since Búshihr, without a hand to shield it.',
      choices: [{ text: '(Crawl back to the cabin door.)', next: 'voice' }],
    },
    guttered: {
      speaker: 'Narrator',
      text: 'Your flame drowned in the spray, and Mubárak lit it again from the galley coals without a word. At the stern, behind the lattice, the other lamp has not so much as flickered.',
      choices: [{ text: '(Crawl back to the cabin door.)', next: 'voice' }],
    },
    voice: {
      speaker: 'Narrator',
      text: 'Through the lattice comes a voice, chanting. It does not rise against the storm or hurry before it. Beside the lamp, Quddús bends over his board, steadying the inkwell with one hand and writing with the other.',
      choices: [
        { text: '(Listen.)', next: 'words' },
        { text: '(Pray with the voice, as best you can.)', next: 'words', effect: { set: { ch3PrayedInStorm: true } } },
      ],
    },
    words: {
      speaker: 'Narrator',
      text: 'Between gusts you catch a few words: praise, and patience, and the Lord of the sea and the dry land. Around you grown men clutch the ropes and weep. Within, the lamp burns as if the night were still.',
      choices: [{ text: '(Stay where you are.)', next: 'mubarak' }],
    },
    mubarak: {
      speaker: 'Mubárak, the Household Servant',
      text: '(Mubárak crouches beside you and pulls a blanket over both your heads.) Every night since Búshihr it has been so. The sea grows angry, and He does not. I think the sea gives up first.',
      choices: [
        { text: '"Is He not afraid?"', next: 'fear' },
        { text: '(Say nothing. Share the blanket.)', next: 'dawn' },
      ],
    },
    fear: {
      speaker: 'Mubárak, the Household Servant',
      text: 'I have served Him since He was a boy. I have seen Him grieve. I have never seen Him afraid.',
      choices: [{ text: '(Wait for the dawn.)', next: 'dawn' }],
    },
    dawn: {
      speaker: 'Narrator',
      onEnter: { set: { ch3StormWeathered: true } },
      text: 'Toward morning the wind drops as suddenly as it came, and the sea lies down like a tired animal. The lamp behind the lattice is put out at last; the sun has made it needless. Days later a sailor in the rigging calls out: the brown coast of the Ḥijáz, and the roadstead of Jidda.',
    },
  },
};

/** The lashed water cask: a story object counting the voyage. */
export const waterCask: DialogueTree = {
  id: 'ch3-water-cask',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A water cask lashed to the rail, its lid chained. Knife-cuts on the staves count the days since Búshihr. The ladle hangs on a nail, dry.',
      choices: [
        { text: '(Count the marks.)', next: 'count' },
        { text: '(Leave it be.)' },
      ],
    },
    count: {
      speaker: 'Narrator',
      onEnter: { set: { ch3CountedWater: true } },
      text: 'More than fifty marks, and the season has turned since the first. The water tastes of tar now and is measured out a cup each morning. Beside the tally someone has scratched a few words too worn to read: a prayer, perhaps, or only a name.',
    },
  },
};

/** Mubárak at the galley brazier, making tea with too little water. */
export const mubarakGalley: DialogueTree = {
  id: 'ch3-mubarak-galley',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mubárak, the Household Servant',
      text: '(He is coaxing a kettle to boil on the brazier, shielding the coals with his body.) Half a cup of water, three leaves of tea, and patience. On the sea, that is a feast.',
      choices: [
        { text: '"How does your Master bear the voyage?"', next: 'master' },
        { text: '"Do you miss Shíráz?"', next: 'shiraz' },
      ],
    },
    master: {
      speaker: 'Mubárak, the Household Servant',
      text: 'He eats little and asks for nothing that the other pilgrims do not have. When I bring Him the better cup, He sends it to the old woman by the bow.',
      choices: [{ text: '"And you? Do you miss Shíráz?"', next: 'shiraz' }],
    },
    shiraz: {
      speaker: 'Mubárak, the Household Servant',
      onEnter: { set: { ch3MubarakGalley: true } },
      text: 'Khadíjih-Bagum stood at the door until we turned the corner of the lane. His mother too. I carry that picture the way you carry water on a ship: carefully, a little at a time.',
      choices: [{ text: '(Accept the half cup he offers you.)' }],
    },
  },
};

/** The nákhudá, master of the ship. */
export const captain: DialogueTree = {
  id: 'ch3-captain',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Captain',
      text: 'Stand clear of the sheet, pilgrim. My grandfather sailed this sea, and his grandfather. Búshihr to Jidda: around the horn of Arabia and up the long Red Sea. Two months if God is kind. He has not been kind this year.',
      choices: [
        { text: '"Will the wind turn against us?"', next: 'wind' },
        { text: '"You have carried many pilgrims?"', next: 'pilgrims' },
      ],
    },
    wind: {
      speaker: 'The Captain',
      text: 'Smell it. (He lifts his face.) Rain somewhere south, and a sky like a bruise. Tonight we will all be very pious. Tie down what you love.',
      choices: [{ text: '"You have carried many pilgrims?"', next: 'pilgrims' }],
    },
    pilgrims: {
      speaker: 'The Captain',
      onEnter: { set: { ch3CaptainSpoke: true } },
      text: 'Thousands. Holy men who curse the cook, and cooks who pray like saints. Your young Siyyid in the stern cabin asks after my crew by name. Twenty years at sea, and no passenger has asked me my helmsman\'s name.',
      choices: [{ text: '"What is his name?"', next: 'helmsman' }],
    },
    helmsman: {
      speaker: 'The Captain',
      text: '(He laughs.) Yúsuf. Like the prophet in the well. Go on, pilgrim. Find yourself a rope to hold.',
      choices: [{ text: '(Go.)' }],
    },
  },
};

/** A young sailor from Baḥrayn, once a pearl diver. */
export const sailorRopes: DialogueTree = {
  id: 'ch3-sailor',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Sailor',
      text: '(He is coiling wet rope, fast, without looking.) You are in my way, but kindly. Pilgrims always are.',
      choices: [
        { text: '"Where are you from?"', next: 'from' },
        { text: '"Let me help."', next: 'help' },
      ],
    },
    help: {
      speaker: 'A Sailor',
      text: 'Over, under, and keep the turns flat. Good. You have hands for it. A scholar? Hm. Scholars usually have hands like bread dough.',
      choices: [{ text: '"Where are you from?"', next: 'from' }],
    },
    from: {
      speaker: 'A Sailor',
      text: 'Baḥrayn. I dived for pearls until my ears bled. Down there it is green and silent, and you learn that a man can hold his breath much longer when he has a reason to come up.',
      choices: [{ text: '"And the man in the stern cabin? Have you seen him?"', next: 'stern' }],
    },
    stern: {
      speaker: 'A Sailor',
      onEnter: { set: { ch3SailorTalk: true } },
      text: 'At night I keep the middle watch. His lamp is always lit. Once I heard Him praying while I was up the mast, and I forgot to be afraid of the height. (He shrugs.) Do not tell the captain. He thinks I am never afraid.',
      choices: [{ text: '"Your secret is safe."' }],
    },
  },
};

/** Ḥájí Abu'l-Ḥasan-i-Shírází, a merchant on pilgrimage who watches carefully. */
export const abulHasan: DialogueTree = {
  id: 'ch3-abul-hasan',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Ḥájí Abu\'l-Ḥasan',
      text: 'A face from Shíráz! Ḥájí Abu\'l-Ḥasan, merchant, at your service, God willing for the last time on one of these floating coffins. Sit, sit. You know the family of the young Siyyid in the stern?',
      choices: [
        { text: '"A little. What do you know of Him?"', next: 'know' },
        { text: '"Why do you ask?"', next: 'why' },
      ],
    },
    why: {
      speaker: 'Ḥájí Abu\'l-Ḥasan',
      text: 'Because I have nothing to do for two months but watch, and He is the only thing on this ship worth watching.',
      choices: [{ text: '"What have you seen?"', next: 'know' }],
    },
    know: {
      speaker: 'Ḥájí Abu\'l-Ḥasan',
      text: 'His uncles keep honest scales in the bazaar; I have traded with them for years. I thought He was a merchant\'s nephew making the pilgrimage. But in all these weeks I have not seen Him rest from prayer or writing, and I have not heard one sharp word from His mouth. Not one. On this ship!',
      choices: [
        { text: '"I believe He is the Gate the scholars awaited."', next: 'gate', requires: f => f.recognised === true },
        { text: '"I am watching too. I have not yet decided what I see."', next: 'watching' },
      ],
    },
    gate: {
      speaker: 'Ḥájí Abu\'l-Ḥasan',
      onEnter: { set: { ch3HeardAbulHasan: true } },
      text: '(He glances at the cabin.) Say that softly, friend. I am a merchant; I trust what I can weigh. But I tell you, I will be weighing this for the rest of my life.',
      choices: [{ text: '(Nod.)' }],
    },
    watching: {
      speaker: 'Ḥájí Abu\'l-Ḥasan',
      onEnter: { set: { ch3HeardAbulHasan: true } },
      text: 'Good. Then we are two honest men with our eyes open. Let us compare notes in Mecca. I have a feeling we will both have a great deal to write.',
      choices: [{ text: '"In Mecca, then."' }],
    },
  },
};

/** A widow from Lár, making the pilgrimage her son saved for. */
export const widowOfLar: DialogueTree = {
  id: 'ch3-widow',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Widow from Lár',
      text: '(She is grey-faced from the sea, but sitting very straight.) Do not mind me, child. The sea and I have agreed to dislike each other politely.',
      choices: [
        { text: '"Who are you travelling with?"', next: 'son' },
        { text: '(Offer her your morning cup of water.)', next: 'water', effect: { set: { ch3GaveWater: true } } },
      ],
    },
    water: {
      speaker: 'A Widow from Lár',
      text: '(She hesitates, then drinks half and gives back the rest.) Half is a gift; all would be a theft. You are the second today. A young man from the stern sent me His cup this morning.',
      choices: [{ text: '"Who are you travelling with?"', next: 'son' }],
    },
    son: {
      speaker: 'A Widow from Lár',
      onEnter: { set: { ch3WidowSpoke: true } },
      text: 'My son Raḥím. He saved eleven years for this pilgrimage, a coin at a time in a clay jar. The fever took him in the spring. So I am going for him. (She pats a small purse.) His jar is here. I will pour it out at the House of God.',
      choices: [
        { text: '"He would be proud of you."' },
        { text: '"God accept it from you both."' },
      ],
    },
  },
};

export const chapter03ShipDialogues: Record<string, DialogueTree> = {
  [quddusShip.id]: quddusShip,
  [cabinQuiet.id]: cabinQuiet,
  [cabinStorm.id]: cabinStorm,
  [waterCask.id]: waterCask,
  [mubarakGalley.id]: mubarakGalley,
  [captain.id]: captain,
  [sailorRopes.id]: sailorRopes,
  [abulHasan.id]: abulHasan,
  [widowOfLar.id]: widowOfLar,
  ...chapter03CabinDialogues,
};
