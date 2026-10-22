import type { DialogueTree } from '../../dialogue/types';

/**
 * Chapter 4, the streets of Shíráz in 1845. Quddús and Mullá Ṣádiq have
 * been punished and paraded for sounding the new call; the governor's men
 * watch every doorway; the Báb's uncle has just given his name as surety.
 * The Báb is never on the map: He is spoken of by those who saw Him.
 */

/** Quddús, under guard, on the day he is driven from the city. */
export const ch4QuddusWitness: DialogueTree = {
  id: 'ch4-quddus-witness',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Quddús',
      text: 'You have reached Shíráz in a bitter hour, friend. Do not look at the cord on my wrists. Look at the sky over the minaret. It is the same sky that covered us at sea.',
      choices: [
        { text: '"What has happened here?"', next: 'what' },
        { text: '"Are you hurt?"', next: 'hurt' },
        { text: '"I kept vigil at His door, the night Mullá Ḥusayn believed."', next: 'vigil',
          requires: f => f.recognised === true },
        { text: '"I am still searching. Is this what searching costs?"', next: 'cost',
          requires: f => f.recognised === false },
      ],
    },
    what: {
      speaker: 'Quddús',
      text: 'At Búshihr He sent me ahead with a letter for His uncle, and a charge for the faithful. Mullá Ṣádiq, old and fearless, sounded the new words in the call to prayer. The whole bazaar heard. The governor heard it louder than anyone.',
      choices: [{ text: '"And now?"', next: 'now' }],
    },
    hurt: {
      speaker: 'Quddús',
      text: 'Less than they intended. They meant to make a spectacle of us, and they did. But the lesson the governor wrote is not the one the street is reading.',
      choices: [{ text: '"What will they do with you?"', next: 'now' }],
    },
    vigil: {
      speaker: 'Quddús',
      text: 'Then you have already learned to stand at a threshold without being let in. That is most of what this year will ask of us.',
      choices: [{ text: '"What will they do with you?"', next: 'now' }],
    },
    cost: {
      speaker: 'Quddús',
      text: 'Sometimes. But weigh what it costs against what it finds. A man may spend his whole fortune on a single pearl and still be called a fool by those who never saw it.',
      choices: [{ text: '"What will they do with you?"', next: 'now' }],
    },
    now: {
      speaker: 'Quddús',
      text: 'We are to be put outside the walls before sunset. Ḥusayn Khán has sent horsemen down the Búshihr road to bring our Master here as a prisoner. Do not grieve for us. Grieve only if fear teaches you silence where love should speak.',
      choices: [
        { text: '"Let me walk beside you, if only in silence."', next: 'compassion',
          effect: { set: { quddusWitnessed: true, ch4Response: 'compassion' } } },
        { text: '"I will hold my tongue and bear witness."', next: 'restraint',
          effect: { set: { quddusWitnessed: true, ch4Response: 'restraint' } } },
        { text: '"My anger rises at this injustice."', next: 'anger',
          effect: { set: { quddusWitnessed: true, ch4Response: 'anger' } } },
      ],
    },
    compassion: {
      speaker: 'Quddús',
      text: 'Compassion is a cloak no officer can strip away. Keep it close. Others will need its warmth before this year is out.',
      choices: [{ text: '"Where should I go?"', next: 'uncle' }],
    },
    restraint: {
      speaker: 'Quddús',
      text: 'Restraint is not surrender. It is a lamp guarded from the wind until a darker room requires it.',
      choices: [{ text: '"Where should I go?"', next: 'uncle' }],
    },
    anger: {
      speaker: 'Quddús',
      text: 'Let anger become courage, not harm. The Cause is not served by mirroring the hardness that opposes it. A sword drawn here would cut only our own hands.',
      choices: [{ text: '"Where should I go?"', next: 'uncle' }],
    },
    uncle: {
      speaker: 'Quddús',
      text: 'Find His uncle, Ḥájí Mírzá Siyyid ʿAlí, a merchant in a green turban. He went to the governor\'s gate at dawn and has not come back. And sit a moment with Mullá Ṣádiq. He is older than his courage.',
      choices: [{ text: '(Bow, and let the guards lead him on.)' }],
    },
  },
};

/** Mullá Ṣádiq: the old man who sounded the new words in the call to prayer. */
export const ch4MullaSadiq: DialogueTree = {
  id: 'ch4-mulla-sadiq',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ṣádiq',
      text: '(An old man sits against the wall, his back bent from the lash, his face oddly bright.) Sit with me, young friend. The officer allows an old man one breath before the road.',
      choices: [
        { text: '"Was it you who sounded the call?"', next: 'call' },
        { text: '"Let me bring you water."', next: 'water' },
      ],
    },
    call: {
      speaker: 'Mullá Ṣádiq',
      text: 'I stood where the muezzin stands and gave the call as I was bidden, with the new words in it. Every head in the bazaar lifted, like a field of wheat when the wind passes. Then the shouting began.',
      choices: [{ text: '"Why would a man of your years invite this?"', next: 'why' }],
    },
    water: {
      speaker: 'Mullá Ṣádiq',
      text: '(He drinks slowly.) God reward you. A thousand strokes, they tell me. I felt the first few, and then a strange thing: a great gladness, as if the whip were falling on someone else\'s coat.',
      choices: [{ text: '"Why would a man of your years invite this?"', next: 'why' }],
    },
    why: {
      speaker: 'Mullá Ṣádiq',
      text: 'Because I have waited my whole life to say something true in a loud voice. Quddús, and Mullá ʿAlí-Akbar there, and I: we are the first in this land to be struck for this Cause. We will not be the last.',
      choices: [
        { text: '"That frightens me."', next: 'fear', effect: { set: { sadiqWitnessed: true } } },
        { text: '"Then I am honoured to sit beside you."', next: 'honour', effect: { set: { sadiqWitnessed: true } } },
      ],
    },
    fear: {
      speaker: 'Mullá Ṣádiq',
      text: 'Good. A man who is not frightened has not understood. Fear is the toll at the gate, not the road beyond it. Pay it and walk on.',
    },
    honour: {
      speaker: 'Mullá Ṣádiq',
      text: 'The honour belongs to the dust, that such a Cause should walk on it. Go now. If you find the uncle, tell him old Ṣádiq is laughing.',
    },
  },
};

/** An officer of the governor, doing his duty and not quite at peace with it. */
export const ch4OfficerWarning: DialogueTree = {
  id: 'ch4-officer-warning',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Officer of Ḥusayn Khán',
      text: 'Keep moving, stranger. By order of Ḥusayn Khán, Governor of Fárs, these men are to be shown to the city and then put outside its walls. Gatherings are forbidden. Whispers are counted.',
      choices: [
        { text: '"What was their crime?"', next: 'crime' },
        { text: '"Who sent the horsemen to the Búshihr road?"', next: 'horse',
          requires: f => !!f.quddusWitnessed },
        { text: '(Lower your eyes and pass without argument.)', next: 'end',
          effect: { set: { officerWarningHeard: true } } },
      ],
    },
    crime: {
      speaker: 'Officer of Ḥusayn Khán',
      text: 'They added words to the call to prayer. Words about a Gate, and a new day. The governor calls it sedition. The mullás call it worse. I call it above my pay.',
      choices: [
        { text: '"And what do you call it when your pay is not listening?"', next: 'private' },
        { text: '"I understand."', next: 'end', effect: { set: { officerWarningHeard: true } } },
      ],
    },
    private: {
      speaker: 'Officer of Ḥusayn Khán',
      onEnter: { set: { officerWarningHeard: true } },
      text: '(He glances toward the governor\'s gate.) I say the old one laughed while they beat him. I have seen many men beaten. None of them laughed. Go away now, before I remember my duty.',
    },
    horse: {
      speaker: 'Officer of Ḥusayn Khán',
      onEnter: { set: { officerWarningHeard: true } },
      text: 'The governor did. They brought the young Siyyid up from the coast last night. My cousin rode with them. He says the Siyyid met them on the road before they found Him, and rode on ahead as if they were His escort. Do not repeat that.',
      choices: [{ text: '"I heard nothing."', next: 'end' }],
    },
    end: {
      speaker: 'Narrator',
      text: 'The officer watches the street as though silence itself were an offence. Closed doors answer him from every side.',
    },
  },
};

/** A dyer whose vats face the minaret where the call was sounded. */
export const ch4Dyer: DialogueTree = {
  id: 'ch4-dyer',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Dyer',
      text: '(His hands are blue to the wrist.) Mind the vats, friend. Forty years my shop has faced that minaret. Forty years the call to prayer has washed past me like the river. Yesterday it stopped my hands.',
      choices: [
        { text: '"What did you hear?"', next: 'words' },
        { text: '"Are you afraid?"', next: 'afraid' },
      ],
    },
    words: {
      speaker: 'A Dyer',
      text: 'Something of a Gate, and of One who has come. I cannot tell it rightly. I am a dyer, not a scholar. But I let the indigo go too long, and the cloth came out nearly black. I have never ruined a batch in my life.',
      choices: [{ text: '"What will you do with the cloth?"', next: 'keep' }],
    },
    afraid: {
      speaker: 'A Dyer',
      text: 'Of course I am afraid. The officer took the names of everyone who stood still. I stood still. My wife says I should have kept stirring and looked at nothing, like a sensible man.',
      choices: [{ text: '"And the cloth you were dyeing?"', next: 'keep' }],
    },
    keep: {
      speaker: 'A Dyer',
      onEnter: { set: { dyerHeardCall: true } },
      text: 'My wife says sell it cheap. I think I will make a coat of it, dark as a night with no lamps, so I remember the day the call to prayer said something new.',
    },
  },
};

/** A baker who saw the prisoner and His escort come in from the coast. */
export const ch4Baker: DialogueTree = {
  id: 'ch4-baker',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Baker',
      text: 'Bread, traveller? Still warm. You have the look of a man who walked through the night. So did the horsemen who came in from the Búshihr road before dawn.',
      choices: [
        { text: '"You saw them come in?"', next: 'saw' },
        { text: '(Buy a round of bread, and thank him.)', next: 'bread' },
      ],
    },
    bread: {
      speaker: 'A Baker',
      text: 'God bless your hand. Sit, eat. And since you are kind, I will tell you what I saw this morning, though my wife tells me to tell no one.',
      choices: [{ text: '"What did you see?"', next: 'saw' }],
    },
    saw: {
      speaker: 'A Baker',
      text: 'I was at my oven door. The governor\'s horsemen came up the street, and a young Siyyid rode in front of them. You would have thought they were His escort of honour and not His captors. They kept back from Him, the way you keep back from a lamp you are afraid to knock over.',
      choices: [{ text: '"Did He speak?"', next: 'greeted' }],
    },
    greeted: {
      speaker: 'A Baker',
      onEnter: { set: { bakerSawArrival: true } },
      text: 'Only a greeting, as He passed. Peace be upon you. A prisoner, greeting a baker, as if I had done Him a kindness by standing there. I burned the whole first batch. That is two of us in this street who have ruined our work this week.',
    },
  },
};

/** The Báb's maternal uncle, who has just stood surety for Him. */
export const ch4Khal: DialogueTree = {
  id: 'ch4-khal',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Ḥájí Mírzá Siyyid ʿAlí',
      text: '(A merchant in a green turban stands by the governor\'s gate, passing prayer beads through his fingers too quickly.) You came up from the coast? Then you know my nephew. Forgive me. I have not slept.',
      choices: [
        { text: '"What has happened to Him?"', next: 'road' },
        { text: '"I kept watch on His step in Shíráz, the night it all began."', next: 'vigil',
          requires: f => f.vigilKept === true },
      ],
    },
    vigil: {
      speaker: 'Ḥájí Mírzá Siyyid ʿAlí',
      text: 'Mubárak told me of a seeker who sat all night outside the door and asked for nothing. So that was you. Then you are already a friend of this family. Listen, and keep it well.',
      choices: [{ text: '"Tell me."', next: 'road' }],
    },
    road: {
      speaker: 'Ḥájí Mírzá Siyyid ʿAlí',
      text: 'The governor sent horsemen to seize Him. He met them on the road before they found Him and told them who He was. Their captain begged Him to turn aside and escape. He would not. He came to Shíráz of His own will, His captors behind Him.',
      choices: [{ text: '"And at the governor\'s?"', next: 'hall' }],
    },
    hall: {
      speaker: 'Ḥájí Mírzá Siyyid ʿAlí',
      text: 'Ḥusayn Khán raged at Him before the whole hall and ordered a man to strike Him. The blow threw His turban to the ground. (He is quiet a moment.) The Imám-Jumʿih, Shaykh Abú-Turáb, rebuked the governor, had the turban set again upon His head, and seated Him at his side.',
      choices: [{ text: '"And then?"', next: 'surety' }],
    },
    surety: {
      speaker: 'Ḥájí Mírzá Siyyid ʿAlí',
      onEnter: { set: { khalMet: true } },
      text: 'Then I gave my name as His surety. He is released to my house, on condition that He receives no one, and that on Friday He answers for Himself before the congregation of the Vakíl Mosque.',
      choices: [
        { text: '"What will He say there?"', next: 'say' },
        { text: '"Your name is a heavy thing to give."', next: 'word' },
      ],
    },
    say: {
      speaker: 'Ḥájí Mírzá Siyyid ʿAlí',
      text: 'No one knows. His enemies hope He will recant and be laughed at. Some friends hope He will proclaim everything and be killed for it. I hope only to bring Him home. Go east along the street to the Vakíl Mosque, and be my eyes there.',
    },
    word: {
      speaker: 'Ḥájí Mírzá Siyyid ʿAlí',
      text: 'I am a merchant. All my life my word was the only coin I truly owned. When Quddús brought me His letter, I read it standing in my shop and sat down without knowing I had sat. I am glad to spend that coin now. Go east to the Vakíl Mosque, and be my eyes there.',
    },
  },
};

/** The governor's decree, posted on the board by his gate. */
export const ch4Decree: DialogueTree = {
  id: 'ch4-decree',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      onEnter: { set: { decreeRead: true } },
      text: 'A sheet pasted to the board bears the governor\'s seal. No one is to gather. No one is to repeat the claims of the young Siyyid. No one is to add to the call to prayer what was not in it before. Beneath it, someone has scratched a single word into the wood with a nail.',
      choices: [
        { text: '(Lean close and try to read the scratched word.)', next: 'word' },
        { text: '(Read the decree again, slowly.)', next: 'again' },
      ],
    },
    word: {
      speaker: 'Narrator',
      text: 'The strokes are shallow and hurried. It might be "dawn". It might be a child\'s name. Whoever wrote it did not stay to be asked.',
    },
    again: {
      speaker: 'Narrator',
      text: 'Read twice, the decree sounds less like strength than like a man shouting in an empty room. You have never seen a government forbid something it was not afraid of.',
    },
  },
};
