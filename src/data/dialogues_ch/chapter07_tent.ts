import type { DialogueTree } from '../../dialogue/types';

/**
 * Chapter 7, inside Quddús's pavilion at Badasht (`Ch7QuddusTent`). A man of
 * Bárfurúsh who has known Quddús since boyhood keeps the tent; Quddús's
 * papers lie on a low desk. Before the proclamation the man tells who
 * Quddús is; afterward, what he did when he came back to his tent.
 */

/** The man of Bárfurúsh, before the assembly. */
export const ch7TentKeeper: DialogueTree = {
  id: 'ch7-tent-keeper',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Man of Bárfurúsh',
      text: '(He is rinsing cups at the brazier.) Come in out of the dew. He is in the garden; he likes to pray under the cypresses. Coffee? It is bitter, but it is hot, and it keeps the learned men arguing past midnight.',
      choices: [
        { text: '"You have travelled with him long?"', next: 'boy' },
        { text: '"What kind of man is he, in his own tent?"', next: 'tent' },
      ],
    },
    boy: {
      speaker: 'Man of Bárfurúsh',
      text: 'Since he was a boy in Bárfurúsh. He went to study in Mashhad, then in Karbilá with Siyyid Káẓim, and sat by the door, the youngest of them all. Then he walked to Mecca beside the One who is now in Chihríq. He came home a different man, and the same.',
      choices: [{ text: '"The same how?"', next: 'tent' }],
    },
    tent: {
      speaker: 'Man of Bárfurúsh',
      text: 'He eats little and sleeps less. He keeps the prayers and the fasts as he always did. In Shíráz they led him through the streets by a cord through his nose, and he has never once spoken of it to me. He only asked for a cup of water, after.',
      choices: [{ text: '"And this quarrel with Ṭáhirih?"', next: 'quarrel' }],
    },
    quarrel: {
      speaker: 'Man of Bárfurúsh',
      onEnter: { set: { ch7HeardBarfurushi: true } },
      text: 'Everyone asks me. (He sets down a cup.) I have known him twenty years, and I have never seen him angry for longer than it takes to drink this. Whatever happens in the assembly, watch his eyes, not his voice.',
    },
  },
};

/** The man of Bárfurúsh, after the unveiling. */
export const ch7TentKeeperAfter: DialogueTree = {
  id: 'ch7-tent-keeper-after',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Man of Bárfurúsh',
      text: 'You were in the court? Then you saw more than I did. I only saw him come back. He washed his hands and face at the ewer, slowly, the way he does before prayer, and sat down on that mattress, and said nothing for a long time.',
      choices: [{ text: '"Did others come to him?"', next: 'others' }],
    },
    others: {
      speaker: 'Man of Bárfurúsh',
      text: 'A dozen of them, red in the face, saying they were his men and would stand with him against her. He heard them all out. Then he told them not to come to his tent to take sides, but to go and sit at the threshold of the Host\'s tent, and wait to be called.',
      choices: [{ text: '"Did they go?"', next: 'lamp' }],
    },
    lamp: {
      speaker: 'Man of Bárfurúsh',
      onEnter: { set: { ch7TentAfter: true } },
      text: 'Most of them. (He nods toward the open flap.) And then he asked me to tie the flap back, so he could see across the meadow to the lamp in her garden. He has been looking at it ever since. I told you: watch his eyes.',
    },
  },
};

/** Quddús's papers on the low desk. */
export const ch7QuddusPapers: DialogueTree = {
  id: 'ch7-quddus-papers',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A reed pen laid across a half-written page, the ink not yet dry, in a small, close hand. A penknife, a sand-shaker, a cake of ink in a brass case.',
      choices: [
        { text: '(Look, but do not read.)', next: 'letter' },
        { text: '(Leave them be.)' },
      ],
    },
    letter: {
      speaker: 'Narrator',
      onEnter: { set: { ch7SawPapers: true } },
      text: 'Under the page lies a letter, folded small and worn soft at the creases, the way letters from a prison are worn by being read again and again. You do not unfold it. You know, without being told, from which mountain it came.',
    },
  },
};
