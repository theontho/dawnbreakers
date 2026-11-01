import type { DialogueTree } from '../../dialogue/types';

/**
 * Karbilá, 1851 to 1852: the lane east of the shrine and the house where
 * Bahá'u'lláh stayed, spoken of only through its door, its lamp and the
 * people who come to it. The young Mírzá Áqá Ján of Káshán, who came after
 * a dream and would become His amanuensis; a follower of Siyyid ʿUlúv, a
 * pretender among the leaderless believers, whose claims ended at that
 * door; and a neighbour who watches the lane.
 */

/** The gate of the house in summer: shut, with visitors coming and going. */
export const doorSummer: DialogueTree = {
  id: 'kr-door-summer',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A plain gateway in a plain wall, like every other in the lane. The door is shut. Behind it you hear water poured from a jug, and a low voice reading, and then a silence.',
      choices: [{ text: '(Wait in the lane.)', next: 'wait' }],
    },
    wait: {
      speaker: 'Narrator',
      text: 'The door opens for a dusty man in a Khurásání coat, who goes in with his head bowed. Later another comes out, a merchant by his clothes, and stands a moment in the lane wiping his eyes before he walks away. Nobody knocks twice.',
    },
  },
};

/** The gate in winter, by night: the lamp in the upper room. */
export const doorWinter: DialogueTree = {
  id: 'kr-door-winter',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Night, and a cold wind off the desert. Above the gateway, in the upper room of the house, a lamp is burning. It burns late, long after the lane has gone dark, and now and then a shadow crosses it.',
      choices: [{ text: '(Stand in the lane and watch the window.)', next: 'watch' }],
    },
    watch: {
      speaker: 'Narrator',
      onEnter: { set: { krSawLamp: true } },
      text: 'Below it the door opens and closes, opens and closes. Men you last saw scattered and frightened after Tabríz go in by ones and twos: a Shaykhí from Baghdád, a dyer from Káshán, a mullá you once argued with in the Siyyid\'s house. None of them was sent for. You stand in the cold until the lamp goes out.',
    },
  },
};

/** The gate in spring: shut, the house given up. */
export const doorSpring: DialogueTree = {
  id: 'kr-door-spring',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      onEnter: { set: { krHouseEmpty: true } },
      text: 'The door is shut, and this time it is only a door. The upper window is dark, its lattice closed. On the step someone has swept the dust into a neat heap and left the broom leaning against the wall, as if the sweeper meant to come back for it.',
    },
  },
};

/** The neighbour across the lane, in summer and winter. */
export const neighbour: DialogueTree = {
  id: 'kr-neighbour',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Neighbour',
      text: '(A woman in a black ʿabá sits on her own step across the lane, shelling beans into her lap.) You are looking at that house too. Everybody looks at that house. A Persian gentleman of Núr has taken it since the summer, with a servant or two.',
      choices: [
        { text: '"Is he a good neighbour?"', next: 'good' },
        { text: '"Who comes to see him?"', next: 'who' },
      ],
    },
    good: {
      speaker: 'A Neighbour',
      text: 'The best I have had. No shouting, no horses in the lane at midnight. When my boy was sick, his servant came across with a dish of rice and asked after him, and never once let me thank anyone for it.',
      choices: [{ text: '"Who comes to see him?"', next: 'who' }],
    },
    who: {
      speaker: 'A Neighbour',
      onEnter: { set: { krHeardNeighbour: true } },
      text: 'All sorts. Mullás and porters, Persians mostly, and they all come the same way: fast, looking behind them. And they all go away the same way, slowly, looking at nothing. I have stopped trying to understand it. I just watch.',
    },
  },
};

/** The neighbour in spring. */
export const neighbourSpring: DialogueTree = {
  id: 'kr-neighbour-spring',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Neighbour',
      text: 'Gone. (She does not look up from her beans.) They left before dawn, three days since, a few of them on mules, for the Persian road. The lane is too quiet now. I did not know a lane could be too quiet.',
    },
  },
};

/** A follower of Siyyid ʿUlúv in summer, confused and frightened. */
export const uluvi: DialogueTree = {
  id: 'kr-uluvi',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Follower of Siyyid ʿUlúv',
      text: '(A thin man in a dervish\'s tall hat catches your sleeve.) You are a believer. I can see it. Have you come to my master? Siyyid ʿUlúv has a house by the bath. The Spirit speaks in him at night, he says. He says such things.',
      choices: [
        { text: '"What things?"', next: 'things' },
        { text: '"Who is your master?"', next: 'who' },
      ],
    },
    who: {
      speaker: 'A Follower of Siyyid ʿUlúv',
      text: 'After Tabríz we had no one. The Báb was gone, the Letters were dead or in hiding, and every week another of us went back to the old mosque out of fear. Siyyid ʿUlúv gathered us. He fed us. Then he began to speak of himself.',
      choices: [{ text: '"What does he say?"', next: 'things' }],
    },
    things: {
      speaker: 'A Follower of Siyyid ʿUlúv',
      text: 'That he is more than a man, and other things I will not repeat in the street. (He lowers his voice.) Some of us write it all down. I cannot sleep for it. If it is true, I am damned for doubting; and if it is false, what are we?',
      choices: [
        { text: '"A man who frightens you into following him is not the one we were promised."', next: 'warn' },
        { text: '"Go to the house in this lane. Ask there."', next: 'house' },
      ],
    },
    warn: {
      speaker: 'A Follower of Siyyid ʿUlúv',
      text: '(He lets go of your sleeve.) That is what my mother would say. (He tries to laugh.) Where would I go, then? Back to the mullás who cursed us from the pulpit?',
      choices: [{ text: '"Go to the house in this lane. Ask there."', next: 'house' }],
    },
    house: {
      speaker: 'A Follower of Siyyid ʿUlúv',
      onEnter: { set: { krMetUluvi: true } },
      text: 'The nobleman\'s house? (He looks at the shut gate as if it might open by itself.) My master says the man there is nobody. But my master went himself, last week, to look at him. He came back and would not say a word all evening.',
    },
  },
};

/** The same follower in winter, after Siyyid ʿUlúv was silenced. */
export const uluviWinter: DialogueTree = {
  id: 'kr-uluvi-winter',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Follower of Siyyid ʿUlúv',
      text: '(A thin man with a dervish\'s cropped hair is carrying a water-jar up the lane to the house. He sets it down when he sees you.) Peace be with you. Did you hear what happened to my master?',
      choices: [
        { text: '"You were the man in the tall hat."', next: 'known', requires: f => !!f.krMetUluvi },
        { text: '"Who is your master?"', next: 'who', requires: f => !f.krMetUluvi },
      ],
    },
    known: {
      speaker: 'A Follower of Siyyid ʿUlúv',
      text: 'I have given it up. (He almost smiles.) You were right, and so was my mother. My master went to that house again, and this time he asked to be received.',
      choices: [{ text: '"What happened?"', next: 'what' }],
    },
    who: {
      speaker: 'A Follower of Siyyid ʿUlúv',
      text: 'Siyyid ʿUlúv. After Tabríz, when we had no one, he gathered us and fed us, and then he began to make claims for himself that frightened us all. Last month he went to that house and asked to be received.',
      choices: [{ text: '"What happened?"', next: 'what' }],
    },
    what: {
      speaker: 'A Follower of Siyyid ʿUlúv',
      text: 'I do not know what was said in that room. There was no shouting; we waited in the court and heard nothing. My master came down the stairs another man, and before us all he took back every claim he had made.',
      choices: [{ text: '"And you?"', next: 'you' }],
    },
    you: {
      speaker: 'A Follower of Siyyid ʿUlúv',
      onEnter: { set: { krUluvSilenced: true } },
      text: 'I fetch water for the house now. (He hitches the jar higher.) It is less exciting than being damned. I sleep, though. I had forgotten what it is to sleep.',
    },
  },
};

/** Mírzá Áqá Ján of Káshán at the door, through the winter. */
export const aqaJan: DialogueTree = {
  id: 'kr-aqa-jan',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mírzá Áqá Ján',
      text: '(A youth, hardly more than a boy, sits on the step of the gate with his knees drawn up and a blanket round his shoulders. He jumps up when he sees you.) Have you come to the house? Wait here, please. I will ask if you may go up.',
      choices: [
        { text: '"Who are you?"', next: 'who' },
        { text: '"Do you sleep in this doorway?"', next: 'sleep' },
      ],
    },
    who: {
      speaker: 'Mírzá Áqá Ján',
      text: 'Áqá Ján, of Káshán. (He says it as if it were a very small thing to be.) I had a dream, and the dream sent me here. I walked all the way. I could not have sat still in Káshán after it if they had chained me.',
      choices: [{ text: '"What was the dream?"', next: 'dream' }],
    },
    dream: {
      speaker: 'Mírzá Áqá Ján',
      text: '(He hesitates, then smiles.) I told it to Him, the first night. I will not tell you what He said. I have not stopped thinking about it since, and I do not want to spend it.',
      choices: [{ text: '"Do you sleep in this doorway?"', next: 'sleep' }],
    },
    sleep: {
      speaker: 'Mírzá Áqá Ján',
      text: 'When I am let. I fetch the water, I sweep the step, I sit up with the lamp if anyone needs a thing in the night. And I am learning to write a fair hand. (He shows you ink-stained fingers.) One day perhaps it will be good enough to be of use.',
      choices: [{ text: '"I think it will."', next: 'end' }],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { krMetAqaJan: true } },
      text: 'He goes up the stairs two at a time, and comes back to say, very gravely, that the house is full tonight and you are welcome to come back tomorrow. He sits down on the step again and pulls the blanket round him. In the window above, the lamp burns on.',
    },
  },
};

export const karbilaLaneDialogues: Record<string, DialogueTree> = {
  [doorSummer.id]: doorSummer,
  [doorWinter.id]: doorWinter,
  [doorSpring.id]: doorSpring,
  [neighbour.id]: neighbour,
  [neighbourSpring.id]: neighbourSpring,
  [uluvi.id]: uluvi,
  [uluviWinter.id]: uluviWinter,
  [aqaJan.id]: aqaJan,
};
