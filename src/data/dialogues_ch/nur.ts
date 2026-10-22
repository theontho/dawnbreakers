import type { DialogueTree } from '../../dialogue/types';
import { nurLaneDialogues } from './nur_lane';
import { nurMadrasaDialogues } from './nur_madrasa';
import { nurMorningDialogues } from './nur_morning';
import { nurNightDialogues } from './nur_night';
import { nurTakurDialogues } from './nur_takur';

/**
 * Ṭihrán and Núr, 1844: Mullá Ḥusayn in the madrasa of Mírzá Ṣáliḥ, the
 * scroll carried at dawn by Mullá Muḥammad-i-Muʿallim to the house of the
 * late Mírzá Buzurg, and the winning of Núr, after Nabíl's chapters on
 * Mullá Ḥusayn's journey to Ṭihrán and Bahá'u'lláh's journey to Mázindarán.
 * The player waits at every door; the empty house at Tákur ends the chapter
 * (`nur-house-takur` sets `nurComplete`).
 */
export const nurDialogues: Record<string, DialogueTree> = {
  ...nurMadrasaDialogues,
  ...nurNightDialogues,
  ...nurLaneDialogues,
  ...nurMorningDialogues,
  ...nurTakurDialogues,
};
