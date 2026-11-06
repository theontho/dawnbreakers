import type { DialogueTree } from '../../dialogue/types';

/**
 * The river bridge below Mákú, Naw-Rúz 1848 (Nabíl, ch. XIII). Mullá Ḥusayn
 * walks in from Mashhad with Qambar-ʿAlí; ʿAlí Khán, after a dream on the
 * eve of the New Year, has walked out alone to the bridge with three horses
 * led after him, and is refused them. The dream is told by his groom, who
 * heard it from him. Nine days later Mullá Ḥusayn goes back over the bridge,
 * on foot, toward Mázindarán. The Báb is never a speaker: He is spoken of
 * by those who have been with Him.
 */

export const ch6GateGroom: DialogueTree = {
  id: 'ch6-gate-groom',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Khán\'s Groom',
      text: '(He holds three horses by the bridle, the best in the Khán\'s stable, in their good saddle-cloths.) A good New Year to you. Go on, ask me why the Khán\'s horses stand at a bridge at sunrise with nobody on them.',
      choices: [
        { text: '"Why are they here?"', next: 'woke' },
        { text: '"Why is the Khán on foot?"', next: 'woke' },
      ],
    },
    woke: {
      speaker: 'The Khán\'s Groom',
      text: 'He woke us before light, the Khán himself, with no cloak on. Bring the three best horses to the bridge, he said. Then he stood in the stable door and told us what he had dreamed, as if he could not keep it in.',
      choices: [{ text: '"What had he dreamed?"', next: 'dream' }],
    },
    dream: {
      speaker: 'The Khán\'s Groom',
      text: 'That the Prophet of God was coming to Mákú, to visit the Prisoner and wish Him joy of the New Year. That he ran out on foot to this bridge to meet Him, and saw two men on the road, and fell down before the one he took for the Prophet.',
      choices: [{ text: '(Look along the road beyond the bridge.)', next: 'walked' }],
    },
    walked: {
      speaker: 'The Khán\'s Groom',
      onEnter: { set: { ch6HeardDream: true } },
      text: 'So he walked out of the town alone, ahead of his own horses. The Khán, who rides to cross his own courtyard. I only tell you what he told us. (He stops.) Look. Two men on foot, there, coming down to the bridge.',
      choices: [{ text: '(Watch them come.)' }],
    },
  },
};

export const ch6GateGroomDays: DialogueTree = {
  id: 'ch6-gate-groom-days',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Khán\'s Groom',
      text: 'The horses went home with empty saddles, and nobody has ridden them to the bridge since. Nine days now the gate up there has stood open. The Khán sends up fruit, and goes up himself, and comes down quiet.',
      choices: [{ text: '"And Mullá Ḥusayn?"', next: 'stay' }],
    },
    stay: {
      speaker: 'The Khán\'s Groom',
      text: 'His friend Qambar-ʿAlí comes down for bread and talks to the horses. He says the Prisoner kept the New Year with them, and gave Mullá Ḥusayn sweets and fruit from His own hand. They go on the ninth morning, he says. On foot again.',
      choices: [{ text: '(Wait at the bridge for the ninth morning.)', next: 'ninth' }],
    },
    ninth: {
      speaker: 'Narrator',
      onEnter: { set: { ch6NinthMorning: true } },
      text: 'Nine mornings the river runs loud and full with the snow going off the mountain. On the ninth, two men come down the road from the town on foot, and stop at the bridge where you first saw them.',
    },
  },
};

export const ch6GateGroomNinth: DialogueTree = {
  id: 'ch6-gate-groom-ninth',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Khán\'s Groom',
      text: 'I brought no horses this time. (He shrugs.) The Khán said there was no use. A man who walks to a prison will walk away from it too.',
    },
  },
};

export const ch6GateKhan: DialogueTree = {
  id: 'ch6-gate-khan',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'ʿAlí Khán',
      text: '(He stands bare-headed on the bridge in the wind off the river, and does not take his eyes from the road beyond it.) You again. Ask my groom why I am here, if you must. Grooms always know. I would rather watch the road.',
      choices: [{ text: '(Leave him to his watching.)' }],
    },
  },
};

export const ch6GateKhanRefused: DialogueTree = {
  id: 'ch6-gate-khan-refused',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'ʿAlí Khán',
      text: '(He has held out the grey\'s reins with his own hand, and been refused, and does not seem to mind.) He will walk, he says. Then I will walk behind him. It is only a mountain.',
      choices: [{ text: '(Bow to him.)' }],
    },
  },
};

export const ch6GateHusaynArrival: DialogueTree = {
  id: 'ch6-gate-husayn-arrival',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn',
      text: '(He is grey with dust to the knees, and his staff is worn pale where his hand holds it.) Friend! You, here, at the edge of the world? I have come from Mashhad. On foot, every step of it. Do not look at my shoes. They have given all they had.',
      choices: [
        { text: '"On foot? From Mashhad?"', next: 'foot' },
        { text: '"I remember the night of first recognition, in Shíráz."', next: 'memory',
          requires: f => f.recognised === true, effect: { set: { ch6RememberedFirstNight: true } } },
        { text: '"What sustains you after so much hardship?"', next: 'steadfast',
          effect: { set: { ch6AskedSteadfastness: true } } },
      ],
    },
    foot: {
      speaker: 'Mullá Ḥusayn',
      text: 'Mashhad was arming for a rebellion, and I would not be drawn into it. I left by night with Qambar-ʿAlí. Friends ran after us with provisions and a horse. I told them I had vowed to walk the whole distance between me and my Beloved.',
      choices: [{ text: '(Look at the Khán\'s horses.)', next: 'horses' }],
    },
    memory: {
      speaker: 'Mullá Ḥusayn',
      text: 'Then you know. A lamp once kindled does not become night again. Those walls up there are only shadows thrown around that flame.',
      choices: [{ text: '(Look up at the walls with him.)', next: 'horses' }],
    },
    steadfast: {
      speaker: 'Mullá Ḥusayn',
      text: 'The first word I heard from Him still walks ahead of me. I follow it, whether it leads to a garden or a prison gate. Today it led to a bridge, and a Khán waiting on it with horses.',
      choices: [{ text: '(Look at the Khán\'s horses.)', next: 'horses' }],
    },
    horses: {
      speaker: 'Mullá Ḥusayn',
      text: 'He begged me to mount. I told him what I told my friends in Mashhad: I have vowed to make the whole journey on foot. I will walk to the top of his mountain, and there visit his Prisoner.',
      choices: [{ text: '(Walk with him toward the town.)', next: 'climb' }],
    },
    climb: {
      speaker: 'Narrator',
      onEnter: { set: { ch6MetMullaHusayn: true } },
      text: 'You walk with him through the town, past people in their New Year clothes who stop to stare. The Khán walks behind, on foot, his horses led after him with empty saddles. At the foot of the climb Mullá Ḥusayn grips your hand and goes on up toward the gate.',
    },
  },
};

export const ch6GateQambar: DialogueTree = {
  id: 'ch6-gate-qambar',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Qambar-ʿAlí',
      text: '(He leans on the bridge rail and eases his weight off his feet.) Peace be upon you. I am Qambar-ʿAlí. I was not invited, if you want to know. I followed him out of Mashhad in the dark.',
      choices: [{ text: '"He let you come?"', next: 'came' }],
    },
    came: {
      speaker: 'Qambar-ʿAlí',
      text: 'He told me to go home. I would not. In the end he let me carry the water skin, and called me his attendant so that I would stop arguing. (He laughs, and winces.)',
      choices: [{ text: '"How was the road?"', next: 'road' }],
    },
    road: {
      speaker: 'Qambar-ʿAlí',
      onEnter: { set: { ch6MetQambar: true } },
      text: 'In every town the friends came out to meet him. He ate their bread and refused their horses. Do not offer him anything with four legs, friend. It upsets him.',
      choices: [{ text: '(Smile, and offer him your arm instead.)' }],
    },
  },
};

export const ch6GateQambarNinth: DialogueTree = {
  id: 'ch6-gate-qambar-ninth',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Qambar-ʿAlí',
      text: 'Khuy, Urúmíyyih, Marághih, Mílán, Tabríz, Zanján, Qazvín, Ṭihrán. (He counts them on his fingers.) Every town where there are friends, and then Mázindarán. My feet have stopped complaining. They know it is useless.',
    },
  },
};

export const ch6GateHusaynFarewell: DialogueTree = {
  id: 'ch6-gate-husayn-farewell',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn',
      text: 'Nine days, friend. Nine days near Him. He kept the New Year with us, and gave me sweets and fruit from His own hand, quinces and apples from Mílán. Now I have been told to go, and I am going.',
      choices: [{ text: '"Where?"', next: 'road' }],
    },
    road: {
      speaker: 'Mullá Ḥusayn',
      text: 'He said to me: you came on foot from your own province, and on foot you must go back. To every town where the friends are, one by one, and then to Mázindarán. A treasure lies hidden there, He says, which I will know when I see it.',
      choices: [
        { text: '"What treasure?"', next: 'treasure' },
        { text: '(Walk with him to the end of the bridge.)', next: 'farewell' },
      ],
    },
    treasure: {
      speaker: 'Mullá Ḥusayn',
      text: 'I do not know, and I did not ask. In Shíráz I did not know what I was looking for either, until it stood before me. (He smiles.) I will know it.',
      choices: [{ text: '(Walk with him to the end of the bridge.)', next: 'farewell' }],
    },
    farewell: {
      speaker: 'Mullá Ḥusayn',
      onEnter: { set: { ch6HusaynCharge: true } },
      text: 'If the road is hard, it is only because it is going somewhere. Look for me among the green hills of Mázindarán, when the time comes.',
      choices: [{ text: '(Embrace him, and watch him go.)' }],
    },
  },
};

export const ch6GateElder: DialogueTree = {
  id: 'ch6-gate-elder',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'An Old Man of Mákú',
      text: '(He sits on a stone by the road with a dish of sprouted wheat on his knees, green as a field.) A good New Year to you, stranger. The snow is going off the low slopes. Listen to the river.',
      choices: [
        { text: '"A good New Year to you."', next: 'year' },
        { text: '"What is the wheat for?"', next: 'wheat' },
      ],
    },
    wheat: {
      speaker: 'An Old Man of Mákú',
      text: 'My granddaughter grew it on the sill. On the thirteenth day we give it to the river, and the year\'s troubles go with it. So the women say. The men say it too, when the women are listening.',
      choices: [{ text: '(Laugh with him.)', next: 'year' }],
    },
    year: {
      speaker: 'An Old Man of Mákú',
      onEnter: { set: { ch6NawRuzGreeted: true } },
      text: 'Seventy New Years I have sat by this bridge. Never once have I seen the Khán come down to it on his own two feet. (He chuckles.) Every year, something new. That is what the New Year is for.',
      choices: [{ text: '(Wish him many more.)' }],
    },
  },
};
