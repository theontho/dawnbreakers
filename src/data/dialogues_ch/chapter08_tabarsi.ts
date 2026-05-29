import type { DialogueTree } from '../../dialogue/types';

export const mullaHusaynAftermath: DialogueTree = {
  id: 'ch8-mulla-husayn',
  startId: 'g',
  nodes: {
    g: {
      id: 'g',
      speaker: 'A Wounded Believer',
      text: 'The forest is hushed now. Rain gathers in the ruts, and every branch seems to hold its breath for the name of Mullá Ḥusayn.',
      choices: [
        { text: '"Tell me what befell him."', next: 'memory' },
        { text: '(Kneel and bind the wound first.)', next: 'mercy', effect: { set: { ch8ShowedMercy: true } } },
      ],
    },
    mercy: {
      id: 'mercy',
      speaker: 'A Wounded Believer',
      text: 'May God reward your gentleness. He taught us the same courage: not fury, but a heart steady enough to spend itself.',
      choices: [
        { text: '"Then speak his name, and I will remember."', next: 'memory' },
      ],
    },
    memory: {
      id: 'memory',
      speaker: 'A Wounded Believer',
      onEnter: { set: { ch8HeardMullaHusayn: true } },
      text: 'Mullá Ḥusayn has fallen near the shrine gate. We did not see defeat in his face — only the peace of one who had already offered everything.',
    },
  },
};

export const tabarsiTruce: DialogueTree = {
  id: 'ch8-truce',
  startId: 'g',
  nodes: {
    g: {
      id: 'g',
      speaker: 'A Royal Officer',
      text: 'I come beneath a white flag and a pledge sworn upon the Qur’án. Lay down your guard, and the survivors of Ṭabarsí shall be spared.',
      choices: [
        { text: '"A pledge before God must be honoured."', next: 'trust', effect: { set: { ch8TrustedTruce: true } } },
        { text: '"This rain has washed too many promises into mud."', next: 'caution', effect: { set: { ch8DoubtedTruce: true } } },
      ],
    },
    trust: {
      id: 'trust',
      speaker: 'A Royal Officer',
      text: 'Then let your courtesy stand witness against any man who breaks it. The gate will open without a blade drawn.',
      choices: [
        { text: '(Carry the answer back with solemn courtesy.)', next: 'endTrust' },
      ],
    },
    caution: {
      id: 'caution',
      speaker: 'A Royal Officer',
      text: 'Your caution is not without cause. Still, hunger and grief have narrowed every road. Choose the path that leaves no stain upon your soul.',
      choices: [
        { text: '(Warn the friends, yet refuse hatred.)', next: 'endCaution' },
      ],
    },
    endTrust: {
      id: 'endTrust',
      speaker: 'Narrator',
      onEnter: { set: { tabarsiComplete: true, ch8TruceResolved: true } },
      text: 'The palisade falls silent. No combat is shown — only the fragile mercy of a promise, and the shadow of what men may do after making it.',
    },
    endCaution: {
      id: 'endCaution',
      speaker: 'Narrator',
      onEnter: { set: { tabarsiComplete: true, ch8TruceResolved: true } },
      text: 'You return through the gate with eyes open. The friends meet treachery without surrendering their dignity, and Ṭabarsí becomes a trust for memory.',
    },
  },
};

export const quddusCounsel: DialogueTree = {
  id: 'ch8-quddus-counsel',
  startId: 'g',
  nodes: {
    g: {
      id: 'g',
      speaker: 'Quddús',
      text: 'This shrine was built for prayer, not siege. Yet every hardship can become a miḥráb if the heart turns wholly toward God.',
      choices: [
        { text: '"How do we endure without bitterness?"', next: 'endure', effect: { set: { ch8SoughtCounsel: true } } },
        { text: '"What should I carry to the gate?"', next: 'watch' },
      ],
    },
    endure: {
      id: 'endure',
      speaker: 'Quddús',
      onEnter: { set: { ch8QuddusCounsel: true } },
      text: 'Remember Mullá Ḥusayn with deeds worthy of him. Let grief sharpen compassion, not anger.',
    },
    watch: {
      id: 'watch',
      speaker: 'Quddús',
      onEnter: { set: { ch8QuddusCounsel: true } },
      text: 'Carry patience. Carry truth. If a flag of truce approaches, meet it as servants of God — clear-eyed, but without malice.',
    },
  },
};

export const chapter08Dialogues: Record<string, DialogueTree> = {
  [mullaHusaynAftermath.id]: mullaHusaynAftermath,
  [tabarsiTruce.id]: tabarsiTruce,
  [quddusCounsel.id]: quddusCounsel,
};
