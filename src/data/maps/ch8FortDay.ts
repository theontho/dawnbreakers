import type { FlagState } from '../../dialogue/types';
import { ch8CanVisit, ch8DayOpen, ch8Nightfall, ch8Visits, CH8_DAY, heard } from '../record';
import type { MapAmbience, MapCompanion, MapRemark, NpcSpec } from './types';

/**
 * Fort Shaykh Ṭabarsí on the day the rice was shared out (Nabíl p. 384;
 * docs/design/chronicler.md): the people of the six places, Riḍá walking a
 * step behind and remarking on what he has heard, and the light going as
 * the places are visited. Between `ch8MullaHusaynFell` and `ch8BetrayalNamed`.
 */

/** After the day, the hungry months as before. */
export const afterTheDay = (f: FlagState): boolean => !!f.ch8BetrayalNamed;

const late = 'ch8-day-late';
const place = (id: string) => ({ when: ch8CanVisit(id), lockedDialogue: late });

export const DAY_NPCS: NpcSpec[] = [
  // Mírzá Muḥammad-Báqir by the gate towers: the rice at dawn, the ledger by day, the news after.
  { gridX: 13, gridY: 16, texture: 'ch8-baqir',
    prompt: 'Speak with Mírzá Muḥammad-Báqir  [E]',
    dialogue: 'ch8-day-dawn',
    present: f => !!f.ch8MullaHusaynFell && !f.ch8RiceShared },
  { gridX: 13, gridY: 16, texture: 'ch8-baqir',
    prompt: 'Help Mírzá Muḥammad-Báqir with the ledger  [E]',
    dialogue: 'ch8-day-tower', gate: place('tower'),
    present: ch8DayOpen },
  { gridX: 13, gridY: 16, texture: 'ch8-baqir',
    prompt: 'Speak with Mírzá Muḥammad-Báqir  [E]',
    dialogue: 'ch8-baqir-news',
    present: f => !!f.ch8RecordWritten && !f.ch8BetrayalNamed },

  { gridX: 28, gridY: 19, texture: 'ch4-mulla-sadiq',
    prompt: 'Carry water to the wounded with Mullá Ṣádiq  [E]',
    dialogue: 'ch8-day-wounded', gate: place('wounded'),
    present: ch8DayOpen },
  { gridX: 12, gridY: 24, texture: 'ch8-furughi',
    prompt: 'Speak with Furúghí at the loophole  [E]',
    dialogue: 'ch8-day-wall', gate: place('wall'),
    present: ch8DayOpen },
  { gridX: 16, gridY: 26, texture: 'ch8-siyyid-qum',
    prompt: 'Go to the lean-tos by the south wall  [E]',
    dialogue: 'ch8-day-leanto', gate: place('leanto'),
    present: ch8DayOpen },
  // Across the ditch, by the causeway: the water skins, and a soldier from the camp.
  { gridX: 3, gridY: 22, texture: 'ch8-conscript',
    prompt: 'Fill the water skins below the causeway  [E]',
    dialogue: 'ch8-day-water', gate: place('water'),
    present: ch8DayOpen },

  // Nightfall: Riḍá's watch at the gate.
  { gridX: 12, gridY: 20, texture: 'ch8-young-companion',
    prompt: 'Keep the night watch with Riḍá  [E]',
    dialogue: 'ch8-night-gate',
    present: ch8Nightfall },
];

/** Riḍá walks with the player through the day, until the night watch. */
export const DAY_COMPANION: MapCompanion = {
  texture: 'ch8-young-companion',
  present: f => ch8DayOpen(f) && ch8Visits(f) < CH8_DAY.slots,
};

/** What Riḍá says as you pass: rumour is free; testimony costs a visit. */
export const DAY_REMARKS: MapRemark[] = [
  { id: 'day-shrine-door', gridX: 21, gridY: 19, radius: 2, requires: ch8DayOpen,
    lines: [{ speaker: 'Riḍá', text: 'They say he lies inside, beside the Shaykh himself. Do not look at the floor when you go in.' }],
    effect: { set: { [heard('ch8-grave', 'rida')]: true } } },
  { id: 'day-north-grave', gridX: 21, gridY: 11, radius: 3, requires: ch8DayOpen,
    lines: [{ speaker: 'Riḍá', text: 'I counted them that night, carried round to the north side. Thirty-six. I count everything. It keeps my hands still.' }],
    effect: { set: { [heard('ch8-fallen', 'rida')]: true } } },
  { id: 'day-gate', gridX: 12, gridY: 19, radius: 2, requires: f => ch8DayOpen(f) && ch8Visits(f) >= 1,
    lines: [{ speaker: 'Riḍá', text: 'The siyyid from Qum asked me twice today how many of us can still stand on the walls. I said: all of us, if the walls are short.' }] },
  { id: 'day-causeway', gridX: 5, gridY: 20, radius: 2, requires: ch8DayOpen,
    lines: [{ speaker: 'Riḍá', text: 'When the army held this bank, Quddús forbade us the water. Now they only watch us fill the skins. I do not know which is worse.' }] },
  { id: 'day-east-wall', gridX: 26, gridY: 19, radius: 2, requires: ch8DayOpen,
    lines: [{ speaker: 'Riḍá', text: 'Ṣádiq will not talk to anyone with empty hands. Take a water skin first.' }] },
];

/** Morning, then the dusk wash, then night, as the places are visited. */
export function dayAmbience(base: MapAmbience, f: FlagState): MapAmbience {
  if (!f.ch8MullaHusaynFell || f.ch8NightWatch || !f.ch8RiceShared) return base;
  const spent = ch8Visits(f);
  if (spent === 0) return { ...base, wash: { color: 0x8a90a0, alpha: 0.28 }, particles: 'leaves', music: 'forest' };
  if (spent === 1) return { ...base, wash: { color: 0x9a8a78, alpha: 0.3 }, particles: 'leaves', music: 'siege' };
  if (spent === 2) return { ...base, wash: { color: 0xd08850, alpha: 0.32 }, music: 'siege' };
  return { ...base, wash: { color: 0x2a3560, alpha: 0.58 }, music: 'night' };
}
