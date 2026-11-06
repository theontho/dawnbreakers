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
import {
  ch7NiyalaAbdullah,
  ch7NiyalaAbdullahAfter,
  ch7NiyalaKhurasaniAfter,
  ch7NiyalaLedger,
  ch7NiyalaOdes,
  ch7NiyalaShelter,
  ch7NiyalaTahirih,
  ch7NiyalaTahirihWait,
  ch7NiyalaVillager,
} from './chapter07_niyala';
import { ch7QuddusPapers, ch7TentKeeper, ch7TentKeeperAfter } from './chapter07_tent';

/** Chapter 7, the Conference of Badasht: the hamlet, the three gardens, then the stoning at Niyálá. */
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
  ch7TentKeeper,
  ch7TentKeeperAfter,
  ch7QuddusPapers,
  ch7NiyalaShelter,
  ch7NiyalaKhurasaniAfter,
  ch7NiyalaAbdullah,
  ch7NiyalaAbdullahAfter,
  ch7NiyalaLedger,
  ch7NiyalaOdes,
  ch7NiyalaVillager,
  ch7NiyalaTahirihWait,
  ch7NiyalaTahirih,
];

export const chapter07Dialogues: Record<string, DialogueTree> = Object.fromEntries(trees.map(t => [t.id, t]));
