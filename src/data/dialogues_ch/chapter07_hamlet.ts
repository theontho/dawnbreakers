import type { DialogueTree } from '../../dialogue/types';

/**
 * Badasht, the hamlet and the guests' camp, early summer 1848. Arrival
 * scenes: the steward who receives each guest, the camp cook, a believer
 * from Khurásán, and a gardener of the village.
 */

export const ch7Steward: DialogueTree = {
  id: 'ch7-steward',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Steward of the Gardens',
      text: 'Welcome, friend, welcome. Dust to the knees: you came by Sháhrúd? Then you are expected, whoever you are. No guest at Badasht is to pay for so much as a cup of water.',
      choices: [
        { text: '"Whose guest am I?"', next: 'master' },
        { text: '"How many have come?"', next: 'count' },
      ],
    },
    master: {
      speaker: 'The Steward of the Gardens',
      text: 'My Master\'s: Mírzá Ḥusayn-ʿAlí of Núr. He has rented three gardens up the lane, one for Quddús, one for Ṭáhirih, one for Himself. Since we came, the friends have begun to call Him by a new name: Bahá. I am still learning to say it.',
      choices: [{ text: '"And the other guests?"', next: 'count' }],
    },
    count: {
      speaker: 'The Steward of the Gardens',
      text: 'Eighty-one, with you. (He shows a list in a careful hand.) Though the names keep changing. Every day someone is given a new one, and I must cross out and write again.',
      choices: [{ text: '"What is the gathering for?"', next: 'arrive' }],
    },
    arrive: {
      speaker: 'The Steward of the Gardens',
      onEnter: { set: { ch7Arrived: true } },
      text: 'Something is being prepared; no one will say what. Go up the lane when you are rested and visit all three gardens. And come with a heart ready to be surprised. That is the only counsel I have heard twice.',
      choices: [{ text: '(Thank him, and look north up the lane.)' }],
    },
  },
};

export const ch7Cook: DialogueTree = {
  id: 'ch7-cook',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Camp Cook',
      text: 'Eighty-one mouths, friend, and every one of them a scholar with opinions about rice. (She stirs the pot.) Sit. Eat. It is paid for. Everything here is paid for, from one purse.',
      choices: [
        { text: '"Whose purse?"', next: 'purse' },
        { text: '"What do the scholars argue about?"', next: 'argue' },
      ],
    },
    purse: {
      speaker: 'The Camp Cook',
      text: 'The Nobleman of Núr\'s. He asks nothing for it, not even thanks. When I tried to thank him, his steward said: cook well, that is thanks enough. So I cook well.',
      choices: [{ text: '(Accept a bowl.)', next: 'end' }],
    },
    argue: {
      speaker: 'The Camp Cook',
      text: 'Whether the old law still binds. Whether a new Day means new prayers, or only new hearts. Last night one shouted so hard he spilled my stew over the mullá beside him. Both apologised to the stew, not to each other.',
      choices: [{ text: '(Laugh, and accept a bowl.)', next: 'end' }],
    },
    end: {
      speaker: 'The Camp Cook',
      onEnter: { set: { ch7HeardCook: true } },
      text: 'I am a widow of Sháhrúd. I came to cook, not to believe. But I have never fed men who argued so much and quarrelled so little. Eat. You will need your strength in those gardens.',
    },
  },
};

export const ch7Khurasani: DialogueTree = {
  id: 'ch7-khurasani',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Believer from Khurásán',
      text: 'Sit, sit. I came with Quddús, from Mashhad, by the mountain roads. My feet are still arguing with me about it.',
      choices: [
        { text: '"Is Mullá Ḥusayn with you?"', next: 'husayn' },
        { text: '"Why have the friends gathered here?"', next: 'why' },
        { text: '"I come from Chihríq. I kept watch beneath His window."', next: 'chihriq',
          requires: f => !!f.bayanComplete },
      ],
    },
    husayn: {
      speaker: 'A Believer from Khurásán',
      text: 'No. He stayed in Mashhad. The friends there have a house they call the Bábíyyih, and men come to it day and night. (He lowers his voice.) Some say he waits for a sign to ride out. I do not know what kind of sign.',
      choices: [{ text: '"And this gathering?"', next: 'why' }],
    },
    chihriq: {
      speaker: 'A Believer from Khurásán',
      text: '(He takes your hands in both of his.) Then you have seen what I can only pray toward. Tell Quddús. He will want every word: the snow, the walls, whether the lamp still burns.',
      choices: [{ text: '"Why have the friends gathered here?"', next: 'why' }],
    },
    why: {
      speaker: 'A Believer from Khurásán',
      onEnter: { set: { ch7HeardKhurasan: true } },
      text: 'To decide what we are. A sect of Islam with a holy Siyyid in prison? Or the first people of a new Day? Some want the old law kept to the letter. Some want it burned. And there is talk of finding a way to free Him from Chihríq.',
      choices: [{ text: '"Can a few dozen scholars free anyone from a fortress?"', next: 'free' }],
    },
    free: {
      speaker: 'A Believer from Khurásán',
      text: 'I do not know. But hearts have done stranger things than scholars. Go up to the gardens. Whatever is decided there, I would like a witness from the mountain to see it.',
    },
  },
};

export const ch7Villager: DialogueTree = {
  id: 'ch7-villager',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Gardener of Badasht',
      text: 'Mind the melons! (A man in an earth-streaked apron straightens up.) Those gardens up the lane are my master\'s. Rented, all three, for the summer, by your nobleman. Paid in advance. Silver, not promises.',
      choices: [
        { text: '"Tell me about the gardens."', next: 'gardens' },
        { text: '"What does the village make of the guests?"', next: 'think' },
      ],
    },
    gardens: {
      speaker: 'The Gardener of Badasht',
      text: 'The stream feeds all three. The west garden has the old pool. The east has the best roses; that is where the lady is. The north garden is the largest, with the water running through it and lamps lit until all hours.',
      choices: [{ text: '"And the guests?"', next: 'think' }],
    },
    think: {
      speaker: 'The Gardener of Badasht',
      text: 'Madmen, mostly. Polite madmen. They pray at strange hours and talk until the lamps die. Yesterday one gave my boy a book. My boy cannot read. He sleeps with it under his head.',
      choices: [{ text: '"And the lady in the east garden?"', next: 'lady' }],
    },
    lady: {
      speaker: 'The Gardener of Badasht',
      onEnter: { set: { ch7HeardVillager: true } },
      text: 'Learned as a mujtahid, they say. She teaches the men from behind a curtain. My wife says that is proper. My wife also climbed the wall to listen. (He grins.) Do not tell her I told you.',
    },
  },
};
