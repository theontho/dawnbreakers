import type { DialogueTree } from '../../dialogue/types';

/** Traveller at the city gate: gives the first rumour. */
export const travellerRumour: DialogueTree = {
  id: 'rumour-traveller',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Weary Traveller',
      text: 'Salaam, friend. You have the road-dust of Karbilá about you. Are you, too, looking for the One Siyyid Káẓim foretold?',
      choices: [
        { text: '"I am. What have you heard?"', next: 'tell' },
        { text: '"Many speak of Him. I have my own purpose here."', next: 'tell' },
      ],
    },
    tell: {
      speaker: 'A Weary Traveller',
      onEnter: { set: { rumourTraveller: true } },
      text: 'They say a young Siyyid of this city, modest and of the line of the Prophet, has returned from pilgrimage and speaks with a strange certainty. The merchants in the bazaar know His name; the mullá at the mosque speaks against Him. Decide for yourself whom to trust.',
      choices: [
        { text: '"Thank you. I will look for them."' },
      ],
    },
  },
};

/** Merchant in the bazaar: gives the second rumour. */
export const merchantRumour: DialogueTree = {
  id: 'rumour-merchant',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Cloth Merchant',
      text: 'Welcome, welcome! Silk from Yazd, indigo from Hind! Will you buy, or only browse, my friend?',
      choices: [
        { text: '"I am looking for someone: a young Siyyid, lately returned to Shíráz."', next: 'know' },
        { text: '"Only browsing today. Forgive me."' },
      ],
    },
    know: {
      speaker: 'A Cloth Merchant',
      onEnter: { set: { rumourMerchant: true } },
      text: '(He glances about, then lowers his voice.) Siyyid ʿAlí-Muḥammad. A good man. He pays in full and never haggles. His house is in the quarter north of here, past the mosque. But have a care: not all in this city wish Him well.',
      choices: [
        { text: '"Who wishes Him ill?"', next: 'warn' },
        { text: '"Thank you. May God bless your trade."' },
      ],
    },
    warn: {
      speaker: 'A Cloth Merchant',
      text: 'The mullá of the great mosque, that one. Speak with him if you must, but guard your tongue.',
      choices: [
        { text: '"Understood. Peace be with you."' },
      ],
    },
  },
};

/** Mullá at the mosque: gives the third rumour, hostile in tone. */
export const mullaWarning: DialogueTree = {
  id: 'rumour-mulla',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Stern Mullá',
      text: 'You linger at the threshold of God\'s house, stranger. State your business.',
      choices: [
        { text: '"I seek knowledge of a young Siyyid of this city."', next: 'rebuke' },
        { text: '"Only to pray. Forgive the intrusion."' },
      ],
    },
    rebuke: {
      speaker: 'A Stern Mullá',
      onEnter: { set: { rumourMulla: true } },
      text: '(His face darkens.) That youth, a merchant turned mystic, has stirred the foolish with talk of hidden meanings. The ʿulamá will not suffer it long. If you are wise, you will return to Karbilá and forget His name.',
      choices: [
        { text: '"And what is His name?"', next: 'name' },
        { text: '"Thank you for the warning."' },
      ],
    },
    name: {
      speaker: 'A Stern Mullá',
      text: 'Siyyid ʿAlí-Muḥammad. (He spits to the side.) Now go.',
      choices: [
        { text: '(Bow and leave.)' },
      ],
    },
  },
};

/** A quiet neighbour in the Báb's lane: a fourth, gentler rumour. */
export const neighbourQuiet: DialogueTree = {
  id: 'rumour-neighbour',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Quiet Neighbour',
      onEnter: { set: { rumourNeighbour: true } },
      text: 'Salaam, friend. You are looking for the young Siyyid? He keeps a peaceful house here. His wife, Khadíjih-Bagum, is much loved on this lane. If He invites you within, count yourself fortunate.',
      choices: [
        { text: '"Is He often at home?"', next: 'home' },
        { text: '"Thank you. Peace be with you."' },
      ],
    },
    home: {
      speaker: 'A Quiet Neighbour',
      text: 'At all hours, of late. (She lowers her gaze.) Some come and never leave the same.',
      choices: [
        { text: '(Nod, and walk on.)' },
      ],
    },
  },
};

/** Water-carrier near the fountain: gentle rumour from the working city. */
export const waterCarrierRumour: DialogueTree = {
  id: 'rumour-water-carrier',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Water-Carrier',
      text: 'Careful, traveller, the stones are slick by the fountain. You look as though you have followed a question farther than your sandals wished to go.',
      choices: [
        { text: '"A question, yes. Have you heard of a young Siyyid in this city?"', next: 'heard' },
        { text: '"Only tell me where the quiet lanes begin."', next: 'directions' },
      ],
    },
    heard: {
      speaker: 'A Water-Carrier',
      onEnter: { set: { heardWaterCarrier: true } },
      text: 'Siyyid ʿAlí-Muḥammad? I have carried water to His lane. He thanks a poor man as if receiving a gift from a king. Some lamps give light; His seems to give stillness.',
      choices: [
        { text: '"Does He teach openly?"', next: 'teaches' },
        { text: '"May God reward your kindness."' },
      ],
    },
    directions: {
      speaker: 'A Water-Carrier',
      onEnter: { set: { heardWaterCarrier: true } },
      text: 'North, beyond the mosque road. If you find His door, lower your voice. The night itself seems to listen there.',
      choices: [
        { text: '"I will remember."' },
      ],
    },
    teaches: {
      speaker: 'A Water-Carrier',
      text: 'Not in the market like a crier. Those who leave His threshold look as if they have heard running water in a desert.',
      choices: [
        { text: '(Thank him and step away.)' },
      ],
    },
  },
};

/** Gate guard: wary official rumour about late seekers. */
export const gateGuardRumour: DialogueTree = {
  id: 'rumour-gate-guard',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Gate Guard',
      text: 'Halt a moment. Shíráz keeps count of those who enter after sunset. Your name and purpose?',
      choices: [
        { text: '"A seeker of learning. No threat to the city."', next: 'warning' },
        { text: '"A traveller looking for lodging."', next: 'lodging' },
      ],
    },
    warning: {
      speaker: 'A Gate Guard',
      onEnter: { set: { guardWarned: true } },
      text: 'Learning? Then hear this: men have come whispering after a young merchant-Siyyid. The governor dislikes whispers. Ask your questions softly, or not at all.',
      choices: [
        { text: '"Why does a merchant trouble the governor?"', next: 'trouble' },
        { text: '"Your warning is received."' },
      ],
    },
    lodging: {
      speaker: 'A Gate Guard',
      onEnter: { set: { guardWarned: true } },
      text: 'There are rooms near the bazaar. But if lodging is only a cloak for other errands, remember: watchmen stand at more doors than this gate.',
      choices: [
        { text: '(Bow and pass.)' },
      ],
    },
    trouble: {
      speaker: 'A Gate Guard',
      text: 'A man need not raise a sword to trouble a city. Sometimes a name spoken in hope is enough.',
      choices: [
        { text: '"Then I will weigh my words."' },
      ],
    },
  },
};

/** Bazaar calligrapher: a sympathetic rumour through manuscripts and letters. */
export const calligrapherRumour: DialogueTree = {
  id: 'rumour-calligrapher',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Calligrapher',
      text: 'Ink, paper, bindings repaired before the morning prayer. If your letter must travel, let it go clothed properly.',
      choices: [
        { text: '"Have you copied the hand of Siyyid ʿAlí-Muḥammad?"', next: 'hand' },
        { text: '"I am no buyer, only an admirer of the craft."', next: 'craft' },
      ],
    },
    hand: {
      speaker: 'A Calligrapher',
      onEnter: { set: { sawCalligraphy: true } },
      text: '(He uncovers a practice sheet, then quickly veils it.) I have seen lines from His pen. Swift as rain, balanced as architecture. Not ornament only. Meaning seems to press through the ink.',
      choices: [
        { text: '"You speak as a believer."', next: 'believer' },
        { text: '"Where may I find Him?"', next: 'where' },
      ],
    },
    craft: {
      speaker: 'A Calligrapher',
      text: 'Then admire this: the finest script is not the black mark, but the white breath around it. A true word needs silence to be read.',
      choices: [
        { text: '"A fitting lesson for this night."', next: 'hand' },
        { text: '"Peace be with you."' },
      ],
    },
    believer: {
      speaker: 'A Calligrapher',
      text: 'I speak as one who has learned caution. In Shíráz, admiration can cost more than gold leaf.',
      choices: [
        { text: '"Then your courage is noted."' },
      ],
    },
    where: {
      speaker: 'A Calligrapher',
      text: 'North, in the quiet quarter. If He receives you, do not bring Him market noise. Bring the question beneath the question.',
      choices: [
        { text: '(Commit the direction to memory.)' },
      ],
    },
  },
};

/** Orphan near the mosque: a mercy-focused rumour. */
export const orphanRumour: DialogueTree = {
  id: 'rumour-orphan',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'An Orphan by the Mosque',
      text: 'Spare a crust, Áqá? The mosque steps are cold when the lamps go out.',
      choices: [
        { text: '(Share what bread you have.)', next: 'bread',
          effect: { set: { helpedOrphan: true } } },
        { text: '"I have little, but I can listen."', next: 'listen' },
      ],
    },
    bread: {
      speaker: 'An Orphan by the Mosque',
      onEnter: { set: { orphanMercy: true } },
      text: 'May God remember you. Another man remembered me yesterday, a young Siyyid in a green turban. He asked my name before He gave bread, as if names mattered to the hungry.',
      choices: [
        { text: '"Did He say where He lived?"', next: 'lane' },
        { text: '(Let the child eat in peace.)' },
      ],
    },
    listen: {
      speaker: 'An Orphan by the Mosque',
      onEnter: { set: { orphanMercy: true } },
      text: 'Then hear this: not all learned men look down. The young Siyyid from the north lane bent low to hear me. I thought perhaps angels must bend that way.',
      choices: [
        { text: '"Thank you. Your witness is precious."', next: 'lane' },
        { text: '(Bow your head.)' },
      ],
    },
    lane: {
      speaker: 'An Orphan by the Mosque',
      text: 'Past the city noise. Where the houses are quiet and the night smells of jasmine.',
      choices: [
        { text: '(Leave softly.)' },
      ],
    },
  },
};

/** Mubárak, the household servant: threshold rumour and final invitation. */
export const servantRumour: DialogueTree = {
  id: 'rumour-servant',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mubárak, the Household Servant',
      text: 'Peace, traveller. This lane is narrow, and sound carries. Whom do you seek at such an hour?',
      choices: [
        { text: '"The young Siyyid whose name is spoken in the bazaar."', next: 'expected' },
        { text: '"Only the house where courtesy still keeps a lamp lit."', next: 'lamp' },
      ],
    },
    expected: {
      speaker: 'Mubárak, the Household Servant',
      onEnter: { set: { servantWelcomed: true } },
      text: 'Then you have come near. The Master receives no idle curiosity, yet He has asked that the lamp be trimmed. He has a guest tonight, a learned man from Karbilá. Perhaps He knew another seeker would arrive tired.',
      choices: [
        { text: '"How could He know?"', next: 'known' },
        { text: '"I will approach with reverence."' },
      ],
    },
    lamp: {
      speaker: 'Mubárak, the Household Servant',
      onEnter: { set: { servantWelcomed: true } },
      text: 'There is such a house. But courtesy is not its only light. If your heart is noisy, let the lane quiet it before you knock.',
      choices: [
        { text: '"I will wait a moment, then go on."', next: 'known' },
        { text: '"Peace be upon this household."' },
      ],
    },
    known: {
      speaker: 'Mubárak, the Household Servant',
      text: 'Some hosts prepare for guests. Some guests discover they have been expected longer than they knew.',
      choices: [
        { text: '(Thank the servant and continue.)' },
      ],
    },
  },
};
