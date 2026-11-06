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
  ch6WardenSoftens,
} from './chapter06_maku';
import {
  ch6GateElder,
  ch6GateGroom,
  ch6GateGroomDays,
  ch6GateGroomNinth,
  ch6GateHusaynArrival,
  ch6GateHusaynFarewell,
  ch6GateKhan,
  ch6GateKhanRefused,
  ch6GateQambar,
  ch6GateQambarNinth,
} from './chapter06_maku_gate';

/** Chapter 6, the mountain prisons: Mákú, the river bridge at Naw-Rúz, then Chihríq. */
const trees: DialogueTree[] = [
  ch6MakuWoman,
  ch6FortressGuard,
  ch6WardenSoftens,
  ch6Amanuensis,
  ch6DeskClosed,
  ch6Bayan,
  ch6MakuWindow,
  ch6GateGroom,
  ch6GateGroomDays,
  ch6GateGroomNinth,
  ch6GateKhan,
  ch6GateKhanRefused,
  ch6GateHusaynArrival,
  ch6GateHusaynFarewell,
  ch6GateQambar,
  ch6GateQambarNinth,
  ch6GateElder,
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
