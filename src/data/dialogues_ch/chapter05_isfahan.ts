import type { DialogueTree } from '../../dialogue/types';
import {
  arrivalDialogue, clericQuestionDialogue, imamJumihIsfahan, ewerDialogue, clothPrinterDialogue, studentDialogue,
} from './chapter05_bridge';
import {
  mutamidDialogue, mutamidEmptyDialogue, treatiseDialogue, scribeDialogue, seatDialogue, philosopherDialogue, gurginDialogue,
  chamberLockedDialogue, chamberDialogue,
} from './chapter05_palace';

/**
 * Chapter 5, the Muʿtamid's Sanctuary (Iṣfahán, 1846 to 1847). Trees live
 * in two modules by place: the river and bridge, and the Palace of the Sun.
 */
const trees: DialogueTree[] = [
  arrivalDialogue, clericQuestionDialogue, imamJumihIsfahan, ewerDialogue, clothPrinterDialogue, studentDialogue,
  mutamidDialogue, mutamidEmptyDialogue, treatiseDialogue, scribeDialogue, seatDialogue, philosopherDialogue, gurginDialogue,
  chamberLockedDialogue, chamberDialogue,
];

export const chapter05Dialogues: Record<string, DialogueTree> = Object.fromEntries(trees.map(tree => [tree.id, tree]));
