import type { DialogueTree } from '../../dialogue/types';

export const ch10Guard: DialogueTree = {
  id: 'ch10-guard',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Guard',
      text: 'Keep moving. Tihrán has filled its alleys with accusation, and the pit below the city has room for every rumour men are afraid to examine.',
      choices: [
        {
          text: '"What crime has been proved?"',
          next: 'proved',
          effect: { set: { heardStreetAccusation: true } },
        },
        {
          text: '"These chains speak before any judge does."',
          next: 'chains',
          effect: { set: { sawChains: true } },
        },
        {
          text: '(Lower your voice and pass by.)',
          next: 'silence',
          effect: { set: { keptStreetSilence: true } },
        },
      ],
    },
    proved: {
      speaker: 'Guard',
      text: 'Proof? In such days, fear calls itself proof. I repeat orders; I do not weigh souls.',
    },
    chains: {
      speaker: 'Guard',
      text: 'A chain is a crude witness. It tells you only who has power, not who has truth.',
    },
    silence: {
      speaker: 'Narrator',
      text: 'The street answers with hostile whispers. Above them all, Bahá\'u\'lláh walks with a calm that accusation cannot imitate.',
    },
  },
};

export const ch10Prisoner: DialogueTree = {
  id: 'ch10-prisoner',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Fellow Prisoner',
      text: 'The air is close, the stones sweat, and the chain bites whenever one man turns in sleep. Yet when He speaks, this place forgets its own name for a moment.',
      choices: [
        {
          text: '"Are you not afraid?"',
          next: 'afraid',
          effect: { set: { heardPrisonerHope: true } },
        },
        {
          text: '"What does He say in the darkness?"',
          next: 'words',
          effect: { set: { heardPrisonerHope: true } },
        },
        {
          text: '(Sit beside him without speaking.)',
          next: 'beside',
          effect: { set: { satWithPrisoner: true } },
        },
      ],
    },
    afraid: {
      speaker: 'Fellow Prisoner',
      text: 'I am afraid. Hope is not the absence of fear; it is the lamp that makes fear cast a smaller shadow.',
    },
    words: {
      speaker: 'Fellow Prisoner',
      text: 'He gives no boast, no call to vengeance. He speaks as though mercy were already descending by a stair we cannot see.',
    },
    beside: {
      speaker: 'Narrator',
      text: 'Your silence joins his. Somewhere in the pit, a chain settles, and the sound passes like a question through the dark.',
    },
  },
};

export const ch10Vision: DialogueTree = {
  id: 'ch10-vision',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'In this pit, beneath the feet of Tihrán, the outward world has narrowed to stone, darkness, and iron. Yet the worlds of God are not narrowed.',
      choices: [
        {
          text: '"My heart trembles before such suffering."',
          next: 'compassion',
          effect: { set: { ch10Stance: 'compassion' } },
        },
        {
          text: '"How can revelation be born in a prison?"',
          next: 'wonder',
          effect: { set: { ch10Stance: 'wonder' } },
        },
        {
          text: '(Attend to the faint light above Him.)',
          next: 'attend',
          effect: { set: { ch10Stance: 'silence' } },
        },
      ],
    },
    compassion: {
      speaker: 'Recollected Voice',
      text: 'Let the trembling heart become spacious. The wrongs of men cannot exhaust the mercy of God.',
      choices: [{ text: '(Listen as the darkness grows still.)', next: 'light' }],
    },
    wonder: {
      speaker: 'Recollected Voice',
      text: 'Men look for dawn on the horizon. God may kindle it where no horizon can be seen.',
      choices: [{ text: '(Listen as the darkness grows still.)', next: 'light' }],
    },
    attend: {
      speaker: 'Narrator',
      text: 'The lamp is small, almost spent. Still, its glow gathers upon the stone as if answering a command too gentle for the ear.',
      choices: [{ text: '(Remain with the light.)', next: 'light' }],
    },
    light: {
      speaker: 'Narrator',
      text: 'No spectacle breaks the pit. Only a suggestion of radiance: a shaft of light, a stillness around Bahá\'u\'lláh, and the intimation of a Voice summoning Him to arise.',
      choices: [{ text: '(Receive the hidden dawn.)', next: 'end' }],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { dawnComplete: true } },
      text: 'From the night of Shíráz to the blackness beneath Tihrán, the story has come to another dawn — unseen by the city above, yet destined to illumine what follows.',
    },
  },
};

export const chapter10Dialogues: Record<string, DialogueTree> = {
  [ch10Guard.id]: ch10Guard,
  [ch10Prisoner.id]: ch10Prisoner,
  [ch10Vision.id]: ch10Vision,
};
