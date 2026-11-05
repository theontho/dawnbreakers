import type { DialogueTree } from '../../dialogue/types';

/**
 * Karbilá, summer 1851: how Bahá'u'lláh came there, told by one who came
 * with Him. Nabíl (chapter XXV): toward the end of spring 1851 the
 * Amír-Niẓám sent for Him, said he knew that but for His help Mullá Ḥusayn's
 * students could never have held out seven months against the Sháh's
 * forces, suggested He visit Karbilá while the Sháh went to Iṣfahán, and
 * offered Him the post of Amír-Díván on His return. He refused it, and left
 * Ṭihrán a few days later. He spent the month of Ramaḍán at Kirmánsháh
 * (where Nabíl and Mírzá Aḥmad, the Báb's amanuensis, came to Him), stayed a
 * few days in Baghdád, and reached Karbilá in Shavvál. Of all His
 * companions He took with Him only His kinsman Shukru'lláh of Núr and
 * Mírzá Muḥammad of Mázindarán, who had survived the struggle of Ṭabarsí.
 * Bahá'u'lláh is spoken of only, never seen.
 */
export const mazindarani: DialogueTree = {
  id: 'kr-mazindarani',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mírzá Muḥammad of Mázindarán',
      text: '(A man in a travel-stained northern coat is watering a horse at the canal.) Peace be upon you. You have the dust of the Persian road on you too. We came down by Kirmánsháh in Ramaḍán, and by Baghdád.',
      choices: [
        { text: '"Whose party are you with?"', next: 'party' },
        { text: '"You speak like a man of Mázindarán."', next: 'north' },
      ],
    },
    north: {
      speaker: 'Mírzá Muḥammad of Mázindarán',
      text: 'Bárfurúsh, and the forest beyond it. (He runs his hand down the horse\'s neck.) I was at Shaykh Ṭabarsí. I am still alive, which not many who were there can say.',
      choices: [
        { text: '"I was at Ṭabarsí too."', next: 'both', requires: f => !!f.tabarsiComplete },
        { text: '"Whose party are you with now?"', next: 'party' },
      ],
    },
    both: {
      speaker: 'Mírzá Muḥammad of Mázindarán',
      onEnter: { set: { krMazindaraniKnewYou: true } },
      text: '(He looks at you a long time.) Then we have both walked out of it. Do not tell me how, and I will not tell you. Not here, with the pilgrims going by. (He grips your arm once, hard.) Whose bread did you eat that winter, brother? No. Do not answer that either.',
      choices: [{ text: '"Whose party are you with now?"', next: 'party' }],
    },
    party: {
      speaker: 'Mírzá Muḥammad of Mázindarán',
      text: 'The gentleman of Núr\'s, in the house east of the shrine. Of everyone who would have come, He brought two: His kinsman Shukru\'lláh, and me. (He smiles a little.) I still do not know why me.',
      choices: [{ text: '"Why did He leave Ṭihrán?"', next: 'amir' }],
    },
    amir: {
      speaker: 'Mírzá Muḥammad of Mázindarán',
      text: 'The Amír-Niẓám sent for Him. All courtesy. He said he knew very well that without His help, Mullá Ḥusayn and a band of students could never have held out seven months against the Sháh. And would He not care to visit Karbilá, now, while the Sháh was away at Iṣfahán?',
      choices: [{ text: '"A visit to Karbilá?"', next: 'post' }],
    },
    post: {
      speaker: 'Mírzá Muḥammad of Mázindarán',
      text: 'And on the Sháh\'s return, a post at court: Amír-Díván. He refused the post, and the charge that came with it, and a few days later we were on the road. That is how He told it to us, as near as I can give it.',
      choices: [
        { text: '"Who is this Amír-Niẓám?"', next: 'rise' },
        { text: '"What was the road like?"', next: 'road' },
      ],
    },
    rise: {
      speaker: 'Mírzá Muḥammad of Mázindarán',
      text: 'Mírzá Taqí Khán of Faráhán. When the young Sháh came to the throne he put him in Ḥájí Mírzá Áqásí\'s place as Grand Vizier, and now nothing in Persia is decided without him. His order took the Báb\'s life at Tabríz. His armies were at Ṭabarsí, and at Zanján.',
      choices: [
        { text: '"I came here from Zanján."', next: 'zanjan', requires: f => !!f.zanjanComplete },
        { text: '"What was the road like?"', next: 'road' },
      ],
    },
    zanjan: {
      speaker: 'Mírzá Muḥammad of Mázindarán',
      text: '(He is quiet for a while.) Then you have seen what his orders look like when they are carried out. (He turns the horse\'s head from the water.) And yet he is only a man. Ministers fall, brother. Write that down somewhere.',
      choices: [{ text: '"What was the road like?"', next: 'road' }],
    },
    road: {
      speaker: 'Mírzá Muḥammad of Mázindarán',
      onEnter: { set: { krMetMazindarani: true } },
      text: 'The whole of Ramaḍán at Kirmánsháh. Believers came to the door every evening when the fast was broken; one was the Báb\'s own amanuensis, with a young man of Zarand who copied for him. Then a few days in Baghdád, and down to the groves. (He nods toward the town.) He walks in the streets here as if He had nothing to hide.',
    },
  },
};

export const karbilaRoadDialogues: Record<string, DialogueTree> = {
  [mazindarani.id]: mazindarani,
};
