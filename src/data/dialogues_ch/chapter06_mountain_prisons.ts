import type { DialogueTree } from '../../dialogue/types';
import {
  ch6AmanuensisChihriq,
  ch6ChihriqWindow,
  ch6ChihriqWindowClosed,
  ch6CourierBadasht,
  ch6Dayyan,
  ch6Dervish,
  ch6KurdishShepherd,
  ch6YahyaKhan,
} from './chapter06_chihriq';
import {
  ch6Amanuensis,
  ch6Bayan,
  ch6CourierLetters,
  ch6CourierTransfer,
  ch6DeskClosed,
  ch6FortressGuard,
  ch6MakuWindow,
  ch6MakuWoman,
  ch6MullaHusaynVisit,
  ch6WardenSoftens,
} from './chapter06_maku';

/** Chapter 6, the mountain prisons: Mákú, then Chihríq. */
const trees: DialogueTree[] = [
  ch6MakuWoman,
  ch6FortressGuard,
  ch6WardenSoftens,
  ch6Amanuensis,
  ch6DeskClosed,
  ch6Bayan,
  ch6MakuWindow,
  ch6MullaHusaynVisit,
  ch6CourierLetters,
  ch6CourierTransfer,
  ch6YahyaKhan,
  ch6Dayyan,
  ch6Dervish,
  ch6KurdishShepherd,
  ch6CourierBadasht,
  ch6AmanuensisChihriq,
  ch6ChihriqWindowClosed,
  ch6ChihriqWindow,
];

export const chapter06Dialogues: Record<string, DialogueTree> = Object.fromEntries(trees.map(t => [t.id, t]));
