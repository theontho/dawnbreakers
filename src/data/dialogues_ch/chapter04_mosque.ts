import type { DialogueTree } from '../../dialogue/types';

/**
 * Chapter 4, the Vakíl Mosque. On a Friday the Báb is brought to address
 * the congregation, expected to recant. He is shown only through the
 * empty pulpit and the narration of what passed there.
 */

/** Before the uncle's news, the pulpit is only stone. */
export const ch4PulpitWaiting: DialogueTree = {
  id: 'ch4-pulpit-waiting',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The great pulpit of the Vakíl Mosque stands empty: fourteen steps cut from a single block of marble, cool to the touch. Pigeons walk on the courtyard stones. Whatever this place is waiting for, you do not yet know enough to wait with it. Someone in the streets to the west must have news.',
    },
  },
};

/** The Friday address, told from among the congregation. */
export const ch4VakilPulpit: DialogueTree = {
  id: 'ch4-vakil-pulpit',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Friday. The Vakíl Mosque is full to its arches: merchants, mullás, soldiers, the governor\'s men, the curious from every quarter of Shíráz. The great marble pulpit stands empty at the head of the hall.',
      choices: [{ text: '(Find a place among the pillars, and wait.)', next: 'arrive' }],
    },
    arrive: {
      speaker: 'Narrator',
      text: 'A stir at the entrance. The Imám-Jumʿih, Shaykh Abú-Turáb, comes in, and with him a young Siyyid in a green turban, under guard. The crowd presses toward Him so hard that men are pushed against the pillars. He walks through them without haste.',
      choices: [{ text: '(Rise on your toes to see.)', next: 'steps' }],
    },
    steps: {
      speaker: 'Narrator',
      text: 'The Imám-Jumʿih bids Him speak, so that the people may hear for themselves what He claims and what He does not. He mounts the marble steps and turns to face the congregation. The hall goes so quiet you hear the fountain in the court.',
      choices: [{ text: '(Listen.)', next: 'words' }],
    },
    words: {
      speaker: 'Narrator',
      text: 'He speaks briefly. He calls the condemnation of God upon whoever regards Him as the representative of the Imám, or the gate thereof. And upon whoever says He has denied the unity of God, the prophethood of Muḥammad, or the Imáms who came after. Then He is silent.',
      choices: [
        { text: '(Weigh each word as a scholar would.)', next: 'weigh' },
        { text: '(Watch the faces around you.)', next: 'faces' },
        { text: '(Remember Mullá Ḥusayn at dawn: all the signs were in Him.)', next: 'remember',
          requires: f => f.recognised === true },
      ],
    },
    weigh: {
      speaker: 'Narrator',
      text: 'You turn the sentences over. He has denied nothing of God, nor of the Prophet, nor of the Imáms. He has refused only a title: the gate to another, the deputy of someone absent. His enemies hear a retreat. You are not sure, listening, that it was one.',
      choices: [{ text: '(Keep still.)', next: 'end' }],
    },
    faces: {
      speaker: 'Narrator',
      text: 'The governor\'s men look relieved. The mullás who came for a recantation look as if they have been handed one, and cannot understand why it weighs so little in their hands. Beside you, an old merchant is weeping and does not know why.',
      choices: [{ text: '(Keep still.)', next: 'end' }],
    },
    remember: {
      speaker: 'Narrator',
      text: 'You remember the grey light of that dawn, and Mullá Ḥusayn\'s changed face. A man does not call himself the window, when he is the morning. You almost laugh aloud, and have to cover your mouth with your sleeve.',
      choices: [{ text: '(Keep still.)', next: 'end' }],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { vakilAddressHeard: true } },
      text: 'The Imám-Jumʿih raises his hand before anyone can demand more, and sends Him home to His uncle\'s house under guard. The crowd spills into the courtyard, talking. Those who came to watch a fall carry away something they cannot name. West along the street, a door is closing.',
    },
  },
};

/** Shaykh Abú-Turáb, Imám-Jumʿih of Shíráz: cautious, and kinder than his office. */
export const ch4ImamJumih: DialogueTree = {
  id: 'ch4-imam-jumih',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Shaykh Abú-Turáb',
      text: 'You stand near the pulpit as though you expect it to speak. Sit if you wish, traveller. An old man\'s mosque has room for one more question.',
      choices: [
        { text: '"Why bring Him here, before the whole city?"', next: 'why',
          requires: f => !f.vakilAddressHeard },
        { text: '"Why did you stop Him when you did?"', next: 'stopped',
          requires: f => !!f.vakilAddressHeard },
        { text: '"I heard you set His turban back upon His head."', next: 'turban',
          requires: f => !!f.khalMet },
        { text: '(Bow, and leave him to his thoughts.)' },
      ],
    },
    why: {
      speaker: 'Shaykh Abú-Turáb',
      onEnter: { set: { imamJumihMet: true } },
      text: 'The governor would settle this with the whip and call it justice. The divines would settle it with a sentence of death and call it zeal. I said: let Him speak in the mosque on Friday, and let words end it instead of blood.',
    },
    stopped: {
      speaker: 'Shaykh Abú-Turáb',
      onEnter: { set: { imamJumihMet: true } },
      text: 'Because I am old and I know this city. One more sentence and someone would have asked for more than words. (A faint smile.) I have heard many men preach from that pulpit. None of them ever made it look so small.',
    },
    turban: {
      speaker: 'Shaykh Abú-Turáb',
      onEnter: { set: { imamJumihMet: true } },
      text: 'A descendant of the Prophet, struck bareheaded in a governor\'s hall. Whatever else I am, I am not that kind of man. Ḥusayn Khán will not forgive me for it. I find I do not mind.',
    },
  },
};

/** A merchant of the congregation, who prays here every Friday. */
export const ch4MosqueWitness: DialogueTree = {
  id: 'ch4-mosque-witness',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mosque Witness',
      text: 'I have prayed in this courtyard since I was a boy with a wooden slate. I never saw it so full. Half of them came to pray. The other half came to watch a young man be broken.',
      choices: [
        { text: '"What do you expect today?"', next: 'before', requires: f => !f.vakilAddressHeard },
        { text: '"What did you make of His words?"', next: 'after', requires: f => !!f.vakilAddressHeard },
        { text: '(Leave him to his prayers.)' },
      ],
    },
    before: {
      speaker: 'Mosque Witness',
      text: 'They say He will be made to recant from the pulpit. I have seen men recant. They speak too fast and look at the floor. If He looks at the floor, I will go home and forget all of it.',
    },
    after: {
      speaker: 'Mosque Witness',
      onEnter: { set: { witnessReflected: true } },
      text: 'He did not look at the floor. He looked at us. Every word was something any of us would swear to, and yet the divines went out as though they had lost. I do not understand it. What will you carry away?',
      choices: [
        { text: '"After Quddús, I choose compassion over bitterness."', next: 'compassion',
          requires: f => f.ch4Response === 'compassion' },
        { text: '"I will watch carefully and remember truthfully."', next: 'restraint',
          requires: f => f.ch4Response === 'restraint' },
        { text: '"Let my anger be turned into steadfast courage."', next: 'anger',
          requires: f => f.ch4Response === 'anger' },
        { text: '"His composure, before those who confine Him."', next: 'restraint' },
      ],
    },
    compassion: {
      speaker: 'Mosque Witness',
      text: 'Then carry it into the alleys. Many are frightened, and some have mocked what they did not dare to understand. The frightened will need someone who is not.',
    },
    restraint: {
      speaker: 'Mosque Witness',
      text: 'Remember this plainly, then: no sword was drawn here by His friends. The wound was public shame, and the answer was composure.',
    },
    anger: {
      speaker: 'Mosque Witness',
      text: 'Courage will be needed, but not cruelty. He answered constraint with serenity, and the room grew smaller around those who commanded it.',
    },
  },
};

/** The stern mullá of the first chapter, older now, and no happier. */
export const ch4SternMulla: DialogueTree = {
  id: 'ch4-stern-mulla',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Stern Mullá',
      text: 'Another stranger come to stare at the pulpit? Last year I told every seeker from Karbilá to go home and forget His name. It seems the whole city has failed to take my advice.',
      choices: [
        { text: '"You came to hear Him recant."', next: 'recant', requires: f => !f.vakilAddressHeard },
        { text: '"Was it the recantation you hoped for?"', next: 'after', requires: f => !!f.vakilAddressHeard },
        { text: '"Why does He trouble you so?"', next: 'trouble' },
      ],
    },
    recant: {
      speaker: 'A Stern Mullá',
      onEnter: { set: { sternMullaSpoke: true } },
      text: 'I came to see order restored. A merchant\'s son does not add words to the call to prayer. When He climbs those steps and takes it back, the bazaar will go back to its weighing and its haggling, and God will be served as He has always been served.',
    },
    after: {
      speaker: 'A Stern Mullá',
      onEnter: { set: { sternMullaSpoke: true } },
      text: '(He is silent too long.) He cursed whoever calls Him the gate. Very well. A man who meant to recant would have wept and kissed the Imám\'s hand. He did neither. Mark me, traveller: this is not finished.',
    },
    trouble: {
      speaker: 'A Stern Mullá',
      onEnter: { set: { sternMullaSpoke: true } },
      text: 'Because I have spent forty years learning where every word belongs, and He writes as if He had never needed to learn. Either that is the devil\'s gift or it is God\'s. I would rather it were the devil\'s. I know what to do with the devil.',
    },
  },
};

/** A boy who sells water to the crowd from a goatskin. */
export const ch4WaterBoy: DialogueTree = {
  id: 'ch4-water-boy',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Water-Boy',
      text: 'Water! Cold water from the cistern, a copper a cup! (He lowers his voice.) You are not from here. Do you want to hear something? It is free.',
      choices: [{ text: '"Tell me."', next: 'tell' }],
    },
    tell: {
      speaker: 'A Water-Boy',
      text: 'Today I sold more water than in a month. Everyone was thirsty from shouting. But when the young Siyyid stood on the steps, nobody bought anything. I stood with the skin full on my back and forgot to call out.',
      choices: [
        { text: '"Did He frighten you?"', next: 'fright' },
        { text: '(Buy a cup, and pay him twice.)', next: 'paid' },
      ],
    },
    fright: {
      speaker: 'A Water-Boy',
      onEnter: { set: { waterBoyMet: true } },
      text: 'No. The governor\'s men frighten me. He made me feel the way I feel when my mother comes home. Do not tell my master I stopped selling.',
    },
    paid: {
      speaker: 'A Water-Boy',
      onEnter: { set: { waterBoyMet: true } },
      text: 'Two coppers! God make your road short and your well deep. If you want to see Him again, friend, they say He is going back to His uncle\'s house, and nobody is allowed in.',
    },
  },
};

/** The governor's officer, posted beside the pulpit. */
export const ch4OfficerMosque: DialogueTree = {
  id: 'ch4-officer-mosque',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Officer of Ḥusayn Khán',
      text: 'Stand back from the pulpit. The governor wants the whole city to see this, and none of it close enough to touch.',
      choices: [
        { text: '"Where will He be taken?"', next: 'where', requires: f => !!f.vakilAddressHeard },
        { text: '(Step back.)' },
      ],
    },
    where: {
      speaker: 'Officer of Ḥusayn Khán',
      text: 'Back to His uncle\'s house, west along the main street. No visitors. A man posted at the corner. (He lowers his voice.) Between us, I think the governor wanted a confession and got a sermon. He will not be in a good temper tonight.',
    },
  },
};
