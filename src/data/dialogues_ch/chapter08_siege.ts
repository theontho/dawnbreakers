import type { DialogueTree } from '../../dialogue/types';

/**
 * Chapter 8, the last months at Ṭabarsí: spring 1849. Mullá Ḥusayn rests in
 * the shrine; the companions eat grass and boiled leather; a royal officer
 * brings a Qur'án sealed with a false oath. The violence that follows is
 * told briefly and without spectacle. The ending turns toward Ṭihrán.
 */

/** A companion wounded in the sortie where Mullá Ḥusayn fell. */
export const wounded: DialogueTree = {
  id: 'ch8-wounded',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Wounded Believer',
      text: 'Sit, if you can bear the smell of it. I rode beside him in the sortie. The forest is hushed now, and every branch seems to hold its breath for his name.',
      choices: [
        { text: '"Tell me what befell him."', next: 'memory' },
        { text: '(Kneel and bind the wound first.)', next: 'mercy', effect: { set: { ch8ShowedMercy: true } } },
      ],
    },
    mercy: {
      speaker: 'A Wounded Believer',
      text: 'May God reward your gentleness. He taught us the same courage: not fury, but a heart steady enough to spend itself.',
      choices: [{ text: '"Now tell me what befell him."', next: 'memory' }],
    },
    memory: {
      speaker: 'A Wounded Believer',
      text: 'His horse caught its foot in a tent rope. While he was freeing it, a shot came from the branches of a tree. He did not cry out. He only turned his horse toward the fort, as if he had remembered an appointment.',
      choices: [{ text: '(Listen.)', next: 'face' }],
    },
    face: {
      speaker: 'A Wounded Believer',
      onEnter: { set: { ch8HeardMullaHusayn: true } },
      text: 'We did not see defeat in his face. Only the peace of a man who had already offered everything, and was surprised it had taken so long to be accepted.',
    },
  },
};

/** The grave within the shrine's precinct. */
export const grave: DialogueTree = {
  id: 'ch8-grave',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Beside the shrine the earth has been smoothed flat. Only those who carried him know the place, and they do not look at it.',
      choices: [
        { text: '(Kneel and pray.)', next: 'pray' },
        { text: '(Remember the first dawn in Shíráz.)', next: 'shiraz' },
      ],
    },
    pray: {
      speaker: 'Narrator',
      onEnter: { set: { ch8VisitedGrave: true } },
      text: 'You pray, and the words come out as a seeker\'s words, not a mourner\'s. He would have liked that. Behind you the companions are chanting, and their voices are thinner than they were.',
    },
    shiraz: {
      speaker: 'Narrator',
      onEnter: { set: { ch8VisitedGrave: true } },
      text: 'You remember him stepping into the grey light of a Shíráz lane, unable to speak. He was the first to find the door. He has gone through another one now, ahead of you, as he always walked ahead.',
    },
  },
};

/** Riḍá at the cauldron in the hungry months. */
export const youthHunger: DialogueTree = {
  id: 'ch8-youth-hunger',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Young Companion',
      text: 'Do not look in the pot. (He smiles weakly.) It is a saddle. We boil the leather until it is soft enough to chew. Before the saddles it was the horses, and before the horses the rice ran out.',
      choices: [
        { text: '"Eat my share. I am not hungry."', next: 'give' },
        { text: '(Sit and take your share in silence.)', next: 'share' },
        { text: '"Do you remember the village woman\'s rice?"', next: 'rice', requires: f => !!f.ch8GaveRice },
      ],
    },
    give: {
      speaker: 'A Young Companion',
      text: 'You are lying, and badly. Sit. We share everything here, or none of it is ours.',
      choices: [{ text: '(Sit beside him.)', next: 'share' }],
    },
    rice: {
      speaker: 'A Young Companion',
      text: 'I made it last nine days. A few grains in every pot, for whoever was weakest. Nine days I was a rich man. Tell her, if you ever see her.',
      choices: [{ text: '(Sit beside him.)', next: 'share' }],
    },
    share: {
      speaker: 'Narrator',
      text: 'The broth tastes of salt, smoke, and old leather. Around the fire men chew grass gathered beneath the walls at night, and bark, and bones ground to powder. No one complains. Someone begins, very quietly, to chant.',
      choices: [{ text: '(Listen.)', next: 'chant' }],
    },
    chant: {
      speaker: 'A Young Companion',
      onEnter: { set: { ch8SharedHunger: true } },
      text: 'Quddús\'s verses. When I am hungriest I say them and forget. (A pause.) If I do not see Mashhad again, tell my father the blue never washed out of my hands. Tell him I did not want it to.',
    },
  },
};

/** Quddús in the hungry months, before the officer comes. */
export const quddusHunger: DialogueTree = {
  id: 'ch8-quddus-hunger',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Quddús',
      text: 'He rests beside the shrine now, and I speak with him in the evenings as before. (He is thin; his eyes are not.) We have eaten our horses and our saddles. Share what there is with the youngest, and keep listening at the gate.',
      choices: [{ text: '"How long can we hold?"', next: 'hold' }],
    },
    hold: {
      speaker: 'Quddús',
      text: 'As long as God wills, and not an hour longer. We did not come here to hold a fort. We came to show what faith looks like when everything else is taken away. The showing is nearly done.',
    },
  },
};

/** The royal officer under a white flag, carrying the sealed Qur'án. */
export const officerTruce: DialogueTree = {
  id: 'ch8-truce',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Royal Officer',
      text: 'I come under a white flag, on the word of Prince Mihdí-Qulí Mírzá. (He holds out a Qur\'án wrapped in silk.) His Highness has sworn on this Book: come out, lay down your guard, and every soul will be spared and sent home.',
      choices: [
        { text: '"A pledge before God must be honoured."', next: 'trust', effect: { set: { ch8TrustedTruce: true } } },
        { text: '"This rain has washed too many promises into mud."', next: 'doubt', effect: { set: { ch8DoubtedTruce: true } } },
        { text: '"Why now, after so many months?"', next: 'why' },
      ],
    },
    why: {
      speaker: 'A Royal Officer',
      text: 'Because the capital asks why a few hundred hungry men have held a royal army through a whole winter, and the Prince has no answer he likes. (He looks at the walls, not at you.) I will not pretend it is mercy.',
      choices: [
        { text: '"A pledge before God must still be honoured."', next: 'trust', effect: { set: { ch8TrustedTruce: true } } },
        { text: '"Then I do not trust it."', next: 'doubt', effect: { set: { ch8DoubtedTruce: true } } },
      ],
    },
    trust: {
      speaker: 'A Royal Officer',
      text: 'Then let your courtesy stand witness against any man who breaks it. Take the Book to your leader.',
      choices: [{ text: '(Take the Book.)', next: 'carry' }],
    },
    doubt: {
      speaker: 'A Royal Officer',
      text: 'Your caution is not without cause. (A long pause.) I am a soldier; I carry what I am given. Take the Book to your leader, and let him judge.',
      choices: [{ text: '(Take the Book.)', next: 'carry' }],
    },
    carry: {
      speaker: 'Narrator',
      onEnter: { set: { ch8TruceOffered: true } },
      text: 'The Qur\'án is heavier than it looks. You carry it through the gate, past the grave beside the shrine, to Quddús.',
    },
  },
};

/** The white flag planted on the causeway. */
export const truceFlag: DialogueTree = {
  id: 'ch8-truce-flag',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A strip of white cloth on a lance, planted in the mud of the causeway. For months the only flags here were the Black Standard and the smoke of the guns. Now this. It moves when the wind moves, and means whatever the hand that planted it intends.',
    },
  },
};

/** Quddús receives the oath. The ending of the chapter. */
export const quddusOath: DialogueTree = {
  id: 'ch8-quddus-oath',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Quddús takes the Qur\'án in both hands and kisses it. On its first page, under the Prince\'s seal, the oath is written plainly: safe conduct for every soul in the fort, and leave to go home.',
      choices: [
        { text: '"I do not trust the hand that wrote it."', next: 'doubt', requires: f => !!f.ch8DoubtedTruce },
        { text: '"Is it enough?"', next: 'enough', requires: f => !f.ch8DoubtedTruce },
      ],
    },
    doubt: {
      speaker: 'Quddús',
      text: 'Nor do I. But they have sworn on the Book of God, and we will honour the Book even if they do not. Let it be written that we went out trusting His word, and that the breaking was theirs.',
      choices: [{ text: '(Walk out beside him.)', next: 'out' }],
    },
    enough: {
      speaker: 'Quddús',
      text: 'It is the Book of God. We will honour it, whatever is done by those who swore upon it. Let it be written that we went out trusting His word.',
      choices: [{ text: '(Walk out beside him.)', next: 'out' }],
    },
    out: {
      speaker: 'Narrator',
      text: 'The gate opens. The companions walk out of Ṭabarsí, thin as reeds, and are led to the royal camp, where food is set before them. Then the oath is broken. Many are slain where they sit. Others are sold, or taken away in chains.',
      choices: [{ text: '(Do not look away.)', next: 'quddus' }],
    },
    quddus: {
      speaker: 'Narrator',
      text: 'Quddús is taken to Bárfurúsh and given over to the Saʿídu\'l-ʿUlamá. In the Sabzih-Maydán, on 16 May 1849, the town that once came out with stones takes his life. He is twenty-seven. Those who stood near say he prayed that God forgive them.',
      choices: [{ text: '(Remember them all.)', next: 'after' }],
    },
    after: {
      speaker: 'Narrator',
      onEnter: { set: { tabarsiComplete: true, ch8TruceResolved: true } },
      text: 'When the news reaches the prison of Chihríq, the Báb\'s grief is so deep that for days He will see no one, and for months His pen is still. The forest closes over Ṭabarsí. Another road is already bending south, over the mountains to Ṭihrán.',
    },
  },
};

export const chapter08SiegeDialogues: Record<string, DialogueTree> = {
  [wounded.id]: wounded,
  [grave.id]: grave,
  [youthHunger.id]: youthHunger,
  [quddusHunger.id]: quddusHunger,
  [officerTruce.id]: officerTruce,
  [truceFlag.id]: truceFlag,
  [quddusOath.id]: quddusOath,
};
