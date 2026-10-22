import type { DialogueTree } from '../../dialogue/types';
import { ch4Mubarak, ch4Vahid, ch4KhalHome, ch4UncleDoorLocked, ch4UncleDoor } from './chapter04_house';
import {
  ch4PulpitWaiting, ch4VakilPulpit, ch4ImamJumih, ch4MosqueWitness, ch4SternMulla, ch4WaterBoy, ch4OfficerMosque,
} from './chapter04_mosque';
import { ch4QuddusWitness, ch4MullaSadiq, ch4OfficerWarning, ch4Dyer, ch4Baker, ch4Khal, ch4Decree } from './chapter04_streets';

/**
 * Chapter 4, Return to Shíráz (1845 to 1846). The trees live in three
 * modules by place: the streets, the Vakíl Mosque, and the uncle's lane.
 */
const trees: DialogueTree[] = [
  ch4QuddusWitness, ch4MullaSadiq, ch4OfficerWarning, ch4Dyer, ch4Baker, ch4Khal, ch4Decree,
  ch4PulpitWaiting, ch4VakilPulpit, ch4ImamJumih, ch4MosqueWitness, ch4SternMulla, ch4WaterBoy, ch4OfficerMosque,
  ch4Mubarak, ch4Vahid, ch4KhalHome, ch4UncleDoorLocked, ch4UncleDoor,
];

export const chapter04Dialogues: Record<string, DialogueTree> = Object.fromEntries(trees.map(tree => [tree.id, tree]));
