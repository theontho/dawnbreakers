import type { DialogueTree } from '../../dialogue/types';
import {
  bahaullahReconcile,
  ch7Assembly,
  ch7AssemblyWaiting,
  ch7HostTent,
  ch7Leaver,
  ch7MessengerWait,
  ch7Names,
  ch7QuddusGarden,
  ch7TahirihCurtain,
  quddusTension,
  shakenBeliever,
  unveiling,
} from './chapter07_gardens';
import { ch7Cook, ch7Khurasani, ch7Steward, ch7Villager } from './chapter07_hamlet';

/** Chapter 7, the Conference of Badasht: the hamlet, then the three gardens. */
const trees: DialogueTree[] = [
  ch7Steward,
  ch7Cook,
  ch7Khurasani,
  ch7Villager,
  ch7TahirihCurtain,
  ch7QuddusGarden,
  ch7HostTent,
  ch7AssemblyWaiting,
  ch7Assembly,
  unveiling,
  quddusTension,
  ch7MessengerWait,
  bahaullahReconcile,
  ch7Names,
  shakenBeliever,
  ch7Leaver,
];

export const chapter07Dialogues: Record<string, DialogueTree> = Object.fromEntries(trees.map(t => [t.id, t]));
