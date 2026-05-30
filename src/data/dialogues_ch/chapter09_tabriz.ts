import type { DialogueTree } from '../../dialogue/types';

export const ch9CrowdWitness: DialogueTree = {
  id: 'ch9-crowd-witness',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Witness in the Crowd',
      text: 'The square is full, yet no one speaks above a murmur. Some have come from curiosity, some from fear, and some because their hearts cannot stay away.',
      choices: [
        {
          text: '"How can a city bear such an hour?"',
          next: 'compassion',
          effect: { set: { heardCrowdWitness: true } },
        },
        {
          text: '"Tell me only what you know, not what rumour adds."',
          next: 'careful',
          effect: { set: { heardCrowdWitness: true } },
        },
        {
          text: '(Stand quietly beside him.)',
          next: 'silence',
          effect: { set: { heardCrowdWitness: true } },
        },
      ],
    },
    compassion: {
      speaker: 'Witness in the Crowd',
      text: 'By lowering its eyes, perhaps. The Báb has walked through their shouting as one who hears a music from another world.',
    },
    careful: {
      speaker: 'Witness in the Crowd',
      text: 'Then know this: the order has been given, Sám Khán commands the regiment, and the Báb remains composed. The rest belongs to God.',
    },
    silence: {
      speaker: 'Narrator',
      text: 'The witness nods once. Silence becomes the only honest language left in the square.',
    },
  },
};

export const ch9SamKhan: DialogueTree = {
  id: 'ch9-sam-khan',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Sám Khán',
      text: 'I have led men in battle, yet my hand trembles today. I am a Christian; I want no guilt in the blood of this Siyyid. If His cause is true, may I be released from this duty.',
      choices: [
        {
          text: '"Speak your plea to Him plainly."',
          next: 'plain',
          effect: { set: { samKhanPlea: true, samKhanCounsel: 'plain' } },
        },
        {
          text: '"Duty can be a hard chain, Khán."',
          next: 'duty',
          effect: { set: { samKhanPlea: true, samKhanCounsel: 'duty' } },
        },
        {
          text: '"I would be afraid as well."',
          next: 'fear',
          effect: { set: { samKhanPlea: true, samKhanCounsel: 'fear' } },
        },
      ],
    },
    plain: {
      speaker: 'Sám Khán',
      text: 'Plainly, then. Let history keep no ornament over what a frightened man asks of a Prisoner.',
      choices: [{ text: '(Accompany him in silence.)', next: 'bab' }],
    },
    duty: {
      speaker: 'Sám Khán',
      text: 'A chain, yes — and yet some chains break before a word of truth. I will ask whether this one may break.',
      choices: [{ text: '(Accompany him in silence.)', next: 'bab' }],
    },
    fear: {
      speaker: 'Sám Khán',
      text: 'Fear is no shame if it turns a man toward mercy. Come. I will ask Him before the order is carried out.',
      choices: [{ text: '(Accompany him in silence.)', next: 'bab' }],
    },
    bab: {
      speaker: 'Narrator',
      text: 'The answer given to him is calm and unadorned: follow your instructions; if your intention is sincere, the Almighty is surely able to relieve you of your perplexity.',
      choices: [{ text: '(Receive the words gravely.)', next: 'firstVolley' }],
    },
    firstVolley: {
      speaker: 'Narrator',
      onEnter: { set: { firstVolleyFailed: true, samKhanReleased: true } },
      text: 'The volley is not shown. Smoke folds over the barrack wall; when it thins, the ropes are severed and the Báb is not there. Sám Khán lays down his command and will not repeat the order.',
      choices: [{ text: '(Wait as the crowd struggles to understand.)', next: 'lastWords' }],
    },
    lastWords: {
      speaker: 'Narrator',
      text: 'They find the Báb completing His final words to His amanuensis. No haste, no spectacle — only the solemn completion of what had been entrusted to Him.',
      choices: [{ text: '(Let the witness speak the end.)', next: 'end' }],
    },
    end: {
      speaker: 'Final Witness',
      onEnter: { set: { martyrdomComplete: true } },
      text: 'The city keeps the sound, but the heart keeps the stillness after it. We lower our gaze. The Dawn is not extinguished by the shadow that passes before it.',
    },
  },
};

export const ch9FinalWitness: DialogueTree = {
  id: 'ch9-final-witness',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Final Witness',
      text: 'I will not dress this hour in grandeur. Ask only if your heart is prepared to hear what a witness can bear to say.',
      choices: [
        {
          text: '(Listen to his final testimony.)',
          next: 'after',
          requires: f => !!f.firstVolleyFailed || !!f.martyrdomComplete,
        },
        {
          text: '"Not yet. Tell me what the crowd understands."',
          next: 'before',
        },
      ],
    },
    before: {
      speaker: 'Final Witness',
      text: 'Very little. A crowd can gather around a mystery and still remain far from it. Speak with Sám Khán before the order reaches its hour.',
    },
    after: {
      speaker: 'Final Witness',
      onEnter: { set: { martyrdomComplete: true } },
      text: 'What was meant to end a Cause became testimony to it. Remember the Báb and Anís with reverence, not with spectacle.',
    },
  },
};

export const chapter09Dialogues: Record<string, DialogueTree> = {
  [ch9CrowdWitness.id]: ch9CrowdWitness,
  [ch9SamKhan.id]: ch9SamKhan,
  [ch9FinalWitness.id]: ch9FinalWitness,
};
