import type { DialogueTree, FlagState } from '../../dialogue/types';
import { chapter09RoofDialogues } from './chapter09_roof';

/**
 * Chapter 9 in the barrack square of Tabríz, 9 July 1850. The Báb is never a
 * speaker or a sprite. Before the event the square holds the people who
 * will see it: a water-seller, the Farrásh-Báshí, Anís, Sám Khán and one of
 * his soldiers. The moment itself is told from the rooftops
 * (`chapter09_roof.ts`). Afterwards the square holds what remains: severed
 * ropes, an open cell door, and witnesses.
 */

const SQUARE_WITNESS_FLAGS = [
  'ch9HeardWaterSeller', 'ch9HeardFarrash', 'ch9MetAnis', 'ch9HeardSoldier', 'ch9SawCellDoor', 'ch9SawPillar',
] as const;

/** How many of the square's witnesses the player has heard before the hour. */
export function squareWitnessCount(f: FlagState): number {
  return SQUARE_WITNESS_FLAGS.filter(flag => !!f[flag]).length;
}

/** A water-seller who pours for nothing today, for the thirst of Karbilá. */
export const ch9WaterSeller: DialogueTree = {
  id: 'ch9-water-seller',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Water-Seller',
      text: 'Water, cold water, for the love of Ḥusayn! No, keep your coin. Today I pour for nothing. On a day like this a man remembers Karbilá, and the thirst of the Imám.',
      choices: [
        { text: '"Why is the whole city here?"', next: 'why' },
        { text: '(Drink, and thank him.)', next: 'drink' },
      ],
    },
    drink: {
      speaker: 'A Water-Seller',
      text: '(The water is cold and tastes of the clay jar.) You drink like a man off the road. Then you have not heard. They brought the young Siyyid down from the prison at Chihríq.',
      choices: [{ text: '"I have heard. Tell me of this morning."', next: 'streets' }],
    },
    why: {
      speaker: 'A Water-Seller',
      text: 'The Siyyid they call the Báb. They brought Him down from the mountain prison at Chihríq, and yesterday they led Him through the city to the houses of the mujtahids.',
      choices: [{ text: '"Tell me of this morning."', next: 'streets' }],
    },
    streets: {
      speaker: 'A Water-Seller',
      text: 'Yesterday they took His green turban and His sash, so all would know Him for a man condemned. Bareheaded, under this sun. (He stares into his cup.) He walked as if the streets were His, and He was lending them to us.',
      choices: [{ text: '(Wait.)', next: 'end' }],
    },
    end: {
      speaker: 'A Water-Seller',
      onEnter: { set: { ch9HeardWaterSeller: true } },
      text: 'I pour for the soldiers too. Thirst is thirst. God will sort out the rest.',
    },
  },
};

export const ch9WaterSellerAfter: DialogueTree = {
  id: 'ch9-water-seller-after',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Water-Seller',
      text: 'I was pouring for a soldier when the first smoke went up. When it cleared he dropped the cup. (The pieces lie in the dust at his feet.) Then the wind came, and the dust, and noon became night.',
      choices: [{ text: '(Stand with him.)', next: 'end' }],
    },
    end: {
      speaker: 'A Water-Seller',
      onEnter: { set: { ch9WaterSellerAfter: true } },
      text: 'Drink. Please. Someone must still be given water today.',
    },
  },
};

/** The Farrásh-Báshí, head of the attendants, who interrupted the conversation. */
export const ch9Farrash: DialogueTree = {
  id: 'ch9-farrash',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Farrásh-Báshí',
      text: 'Stand back from that door. I am the Farrásh-Báshí; the Prisoner is in my charge. (He is sweating in his red coat.) I have orders from the Amír, sealed and signed. Everything is signed.',
      choices: [
        { text: '"Signed by whom?"', next: 'signed' },
        { text: '"You seem troubled."', next: 'troubled' },
      ],
    },
    signed: {
      speaker: 'The Farrásh-Báshí',
      text: 'The mujtahids, this morning. Mullá Muḥammad of Mamaqán had written his sentence before the Prisoner even reached his door. Easy, for them. They do not have to walk Him across the square.',
      choices: [{ text: '"And you?"', next: 'interrupt' }],
    },
    troubled: {
      speaker: 'The Farrásh-Báshí',
      text: 'I am a servant of the state. I do what the state signs. (He wipes his face.) Only, something happened this morning that I cannot put down.',
      choices: [{ text: '"What happened?"', next: 'interrupt' }],
    },
    interrupt: {
      speaker: 'The Farrásh-Báshí',
      text: 'I went into the cell to take Him. He was speaking quietly with His secretary. I told Him to come. He turned, calm as water, and said that until He had said all He wished to say to that man, no power on earth could silence Him.',
      choices: [{ text: '"What did you do?"', next: 'pulled' }],
    },
    pulled: {
      speaker: 'The Farrásh-Báshí',
      onEnter: { set: { ch9HeardFarrash: true } },
      text: 'I pulled the secretary aside by his sleeve and took the Prisoner out. (He looks at his own hand.) He had not finished. I know He had not finished.',
    },
  },
};

export const ch9FarrashAfter: DialogueTree = {
  id: 'ch9-farrash-after',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Farrásh-Báshí',
      text: 'I am no longer Farrásh-Báshí. I have given back the coat. When the smoke cleared and the ropes hung empty, I ran to the cell. He was there, with His secretary, finishing what I had interrupted.',
      choices: [{ text: '"What did He say to you?"', next: 'words' }],
    },
    words: {
      speaker: 'The Farrásh-Báshí',
      onEnter: { set: { ch9FarrashResigned: true } },
      text: 'He looked up and said: I have finished My conversation. Now you may proceed to fulfil your intention. (His voice breaks.) I could not. I walked out of the barracks, and I will never go back.',
    },
  },
};

/** Anís, Mírzá Muḥammad-ʿAlíy-i-Zunúzí, under guard before the hour. */
export const ch9Anis: DialogueTree = {
  id: 'ch9-anis',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Anís',
      text: 'You look at me as if you know me. They call me Anís, the companion. My stepfather locked me in our house to keep me from this day. (He smiles.) Locks are poor arguments.',
      choices: [
        { text: '"I kept vigil at His door in Shíráz, the night it began."', next: 'shiraz',
          requires: f => f.recognised === true },
        { text: '"Why are you here, under guard?"', next: 'why' },
      ],
    },
    shiraz: {
      speaker: 'Anís',
      text: 'Then you saw the first morning, and I will see the last. Between us we hold both ends of the thread. (He takes your hand a moment.) Tell them in Shíráz that it did not break.',
      choices: [{ text: '"Why are you here, under guard?"', next: 'why' }],
    },
    why: {
      speaker: 'Anís',
      text: 'Last night He told us that tomorrow He would be slain, and that He would sooner die by the hand of a friend than an enemy. The others wept and held still. I stood up. He would not let me. He said that I would be with Him instead.',
      choices: [{ text: '(Say nothing.)', next: 'with' }],
    },
    with: {
      speaker: 'Anís',
      onEnter: { set: { ch9MetAnis: true } },
      text: 'So I will be with Him. That is all. My family will beg me to recant, and I will say no, and I will say it kindly. Pray for my mother. She does not understand yet.',
    },
  },
};

/** Sám Khán, the Christian colonel, before the order is carried out. */
export const ch9SamKhan: DialogueTree = {
  id: 'ch9-sam-khan',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Sám Khán',
      text: 'You are not one of mine. Good; I would rather my men did not see my hands. I command this regiment, Armenians, Christians most of us. Today they have given us a Siyyid to shoot.',
      choices: [
        { text: '"You do not wish to do it."', next: 'wish' },
        { text: '"Can you refuse?"', next: 'refuse' },
      ],
    },
    wish: {
      speaker: 'Sám Khán',
      text: 'I wish no guilt in this man\'s blood. A Christian knows something of what it is to watch a righteous man led out between soldiers.',
      choices: [{ text: '"Then what will you do?"', next: 'plan' }],
    },
    refuse: {
      speaker: 'Sám Khán',
      text: 'Refuse the Amír? My men would be flogged and I would hang, and another would do it within the hour. No. But I can ask Him.',
      choices: [{ text: '"Ask Him what?"', next: 'plan' }],
    },
    plan: {
      speaker: 'Sám Khán',
      text: 'I will say: I am a Christian, and I bear you no ill will. If your Cause be the Cause of Truth, enable me to free myself from the obligation to shed your blood.',
      choices: [
        { text: '"Speak your plea to Him plainly."', next: 'plain',
          effect: { set: { samKhanCounsel: 'plain' } } },
        { text: '"Duty can be a hard chain, Khán."', next: 'duty',
          effect: { set: { samKhanCounsel: 'duty' } } },
        { text: '"I would be afraid as well."', next: 'fear',
          effect: { set: { samKhanCounsel: 'fear' } } },
      ],
    },
    plain: {
      speaker: 'Sám Khán',
      text: 'Plainly, then. Let history keep no ornament over what a frightened man asks of a Prisoner.',
      choices: [{ text: '(Wait while he goes in.)', next: 'answer' }],
    },
    duty: {
      speaker: 'Sám Khán',
      text: 'A chain, yes. And yet some chains break before a word of truth. I will ask whether this one may.',
      choices: [{ text: '(Wait while he goes in.)', next: 'answer' }],
    },
    fear: {
      speaker: 'Sám Khán',
      text: 'Fear is no shame if it turns a man toward mercy. Wait here. I will ask Him before the hour.',
      choices: [{ text: '(Wait while he goes in.)', next: 'answer' }],
    },
    answer: {
      speaker: 'Narrator',
      text: 'Sám Khán ducks through the low barrack door. When he comes out his face has changed, like a man who has been told something he will spend the rest of his life understanding.',
      choices: [{ text: '"What did He say?"', next: 'words' }],
    },
    words: {
      speaker: 'Sám Khán',
      onEnter: { set: { samKhanPlea: true } },
      text: 'Follow your instructions, He said, and if your intention be sincere, the Almighty is surely able to relieve you of your perplexity. (He looks up at the crowded roofs.) So I will follow them. And I will watch for God.',
    },
  },
};

/** A soldier of Sám Khán's regiment. */
export const ch9Soldier: DialogueTree = {
  id: 'ch9-soldier',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'An Armenian Soldier',
      text: 'Barev. Forgive me; that is how we say peace at home. (He grips his musket too hard.) Three files of two hundred and fifty, they told us. I am in the first.',
      choices: [
        { text: '"Are you afraid?"', next: 'afraid' },
        { text: '"What does your colonel say?"', next: 'colonel' },
      ],
    },
    afraid: {
      speaker: 'An Armenian Soldier',
      text: 'My grandmother keeps an icon of Saint Sargis by the door. I keep thinking of it. He was a soldier too. He would understand a soldier who does not want to fire.',
      choices: [{ text: '(Rest a hand on his shoulder.)', next: 'pray' }],
    },
    colonel: {
      speaker: 'An Armenian Soldier',
      text: 'Sám Khán says nothing, which is how we know he is troubled. He has gone pale as bread. When the colonel goes pale, the whole regiment goes pale.',
      choices: [{ text: '(Rest a hand on his shoulder.)', next: 'pray' }],
    },
    pray: {
      speaker: 'An Armenian Soldier',
      onEnter: { set: { ch9HeardSoldier: true } },
      text: 'If you pray, pray for us too. We did not choose this square. (He tries to laugh, and cannot.)',
    },
  },
};

/** The cell door, shut, before the hour. */
export const ch9CellDoor: DialogueTree = {
  id: 'ch9-cell-door',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A low door in the barrack wall, shut and guarded. Behind it, last night, a few companions sat with the Báb in the lamplight.',
      choices: [{ text: '(Ask the guard what passed within.)', next: 'night' }],
    },
    night: {
      speaker: 'Narrator',
      text: 'The guard shrugs. "Cheerful, they were. Some of them laughing, as if it were a wedding." He spits into the dust. "I have guarded many men the night before. Never like that."',
      choices: [{ text: '(Rest your palm on the door.)', next: 'end' }],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { ch9SawCellDoor: true } },
      text: 'The wood is warm from the sun. You think of another door, in Shíráz, and a lamp that did not flicker.',
    },
  },
};

/** The same door, standing open, after. */
export const ch9OpenCell: DialogueTree = {
  id: 'ch9-open-cell',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      onEnter: { set: { ch9SawOpenCell: true } },
      text: 'The cell door stands open. Inside: a mat, a water jug, a pen case, and a square of light on the floor. Here they found Him after the first volley, finishing His conversation as though the square outside did not exist.',
    },
  },
};

/** The pillar and the nail, before. */
export const ch9Pillar: DialogueTree = {
  id: 'ch9-pillar',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A pillar of plastered brick between the cell door and the next room. Someone has driven an iron nail into it, high up, and from the nail two ropes hang to the ground.',
      choices: [
        { text: '(Look at the nail.)', next: 'nail' },
        { text: '(Look away.)', next: 'away' },
      ],
    },
    nail: {
      speaker: 'Narrator',
      onEnter: { set: { ch9SawPillar: true } },
      text: 'New iron, bright against old plaster. Whoever drove it in did careful work. You find you cannot forgive him for it, and then you find that you must.',
    },
    away: {
      speaker: 'Narrator',
      onEnter: { set: { ch9SawPillar: true } },
      text: 'You look away. On every roof around the square the crowd is still growing, and the sun climbs toward noon.',
    },
  },
};

/** The severed ropes: the chapter's ending, in the square after the dust. */
export const ch9SeveredRopes: DialogueTree = {
  id: 'ch9-severed-ropes',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The nail is still in the pillar. From it hang two short ends of rope, cut clean. The rest lies in the dust, and the dust is everywhere now, softening every edge of the square.',
      choices: [{ text: '(Stand before the empty wall.)', next: 'stand' }],
    },
    stand: {
      speaker: 'Narrator',
      text: 'There is nothing here to see. That is what you will remember: a wall, a nail, two ropes, and an empty space where the morning had been. The crowd goes home through a noon as dark as evening, and no one speaks.',
      choices: [{ text: '(Stay until nightfall.)', next: 'bodies' }],
    },
    bodies: {
      speaker: 'Narrator',
      text: 'That evening the two bodies are laid at the edge of the moat outside the city gate, under guard. On the second night, friends carry them away in secret. For years they will be hidden, and moved, and kept, waiting.',
      choices: [{ text: '(Remember.)', next: 'end' }],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { martyrdomComplete: true } },
      text: 'The Báb was thirty years old. What began at a lamplit door in Shíráz was sealed at a wall in Tabríz, at noon on 9 July 1850. The Dawn is not put out by the shadow that crosses it. In Zanján the siege goes on, and in Ṭihrán the dark will deepen before it breaks.',
    },
  },
};

/** Siyyid Ḥusayn of Yazd, the amanuensis, after. */
export const ch9Amanuensis: DialogueTree = {
  id: 'ch9-amanuensis',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Siyyid Ḥusayn',
      text: 'I am Siyyid Ḥusayn of Yazd. I wrote for Him in Mákú and in Chihríq, and I was with Him in that room. (His hands are ink-stained, and shaking.) Ask, and I will tell you what I may.',
      choices: [
        { text: '"What was He saying, when they came?"', next: 'saying' },
        { text: '"How is it that you are alive?"', next: 'alive' },
      ],
    },
    saying: {
      speaker: 'Siyyid Ḥusayn',
      text: 'Things meant for me to carry, and for others to hear. The first time they came, He told them no power on earth could silence Him until He had finished. When the smoke cleared, He had finished.',
      choices: [{ text: '"And you?"', next: 'alive' }],
    },
    alive: {
      speaker: 'Siyyid Ḥusayn',
      onEnter: { set: { ch9HeardAmanuensis: true } },
      text: 'He bade me live, so that what He entrusted to me would reach those who must have it. (He covers his face.) To be told to stay behind. That, too, is a kind of offering.',
    },
  },
};

/** An old coppersmith in the square, after. */
export const ch9Coppersmith: DialogueTree = {
  id: 'ch9-coppersmith',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'An Old Coppersmith',
      text: 'Forty years I have beaten copper in the bazaar. I know the sound of every hammer in Tabríz. Today I heard seven hundred and fifty muskets, twice, and then a silence louder than both.',
      choices: [
        { text: '"What did you see?"', next: 'saw' },
        { text: '"What will you do now?"', next: 'do' },
      ],
    },
    saw: {
      speaker: 'An Old Coppersmith',
      text: 'The first time, the smoke cleared and the youth stood alone by the wall, untouched, like a man waiting for a friend who had stepped out. The second time I shut my eyes. I am old. I have earned the right to shut my eyes.',
      choices: [{ text: '"What will you do now?"', next: 'do' }],
    },
    do: {
      speaker: 'An Old Coppersmith',
      onEnter: { set: { ch9HeardCoppersmith: true } },
      text: 'Go home and beat copper. What else? But every pot I make from now on will carry a small mark on its base, under the handle, where no one looks. I will know what it means.',
    },
  },
};

export const chapter09Dialogues: Record<string, DialogueTree> = {
  ...chapter09RoofDialogues,
  [ch9WaterSeller.id]: ch9WaterSeller,
  [ch9WaterSellerAfter.id]: ch9WaterSellerAfter,
  [ch9Farrash.id]: ch9Farrash,
  [ch9FarrashAfter.id]: ch9FarrashAfter,
  [ch9Anis.id]: ch9Anis,
  [ch9SamKhan.id]: ch9SamKhan,
  [ch9Soldier.id]: ch9Soldier,
  [ch9CellDoor.id]: ch9CellDoor,
  [ch9OpenCell.id]: ch9OpenCell,
  [ch9Pillar.id]: ch9Pillar,
  [ch9SeveredRopes.id]: ch9SeveredRopes,
  [ch9Amanuensis.id]: ch9Amanuensis,
  [ch9Coppersmith.id]: ch9Coppersmith,
};
