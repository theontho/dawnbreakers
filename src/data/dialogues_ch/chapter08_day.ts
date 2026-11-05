import type { DialogueTree, FlagState } from '../../dialogue/types';
import { heed, resist } from '../../dialogue/voices';
import { ch8LastLight, hasHeard, heard, type Line } from '../record';

/**
 * Chapter 8, the day the rice was shared out (Nabíl p. 384), some weeks
 * after Mullá Ḥusayn's burial and before Naw-Rúz 1849. Dawn is fixed; then
 * three of six places before nightfall (docs/design/chronicler.md). This
 * file: the dawn, the gate tower, the wounded and the shrine. The others
 * are in `chapter08_dayPlaces.ts`, the night in `chapter08_night.ts`.
 */

const LAST_LIGHT: Line = { text: '(The light is going. After this, the gate.)' };

/** The warning on a place's first node when this visit spends the last slot. */
export const lastLight = (placeFlag: string) => (f: FlagState): string[] =>
  ch8LastLight(f) && !f[placeFlag] ? [LAST_LIGHT.text] : [];

const SADIQ_REMEMBERS: Line = { text: '(He squints at you.) The young one who sat beside me in Shíráz, the day my back was opened. You see? God sends the same company round again.' };
const RATION_SEEN: Record<string, Line> = {
  wounded: { text: 'You gave these men most of the rice this morning. They have not said so. They will not forget it.' },
  watch: { text: 'You fed the watch first this morning. These men understand. Most of them were the watch, once.' },
  young: { text: 'You fed the boys first this morning. Good. These men were boys too, not long ago.' },
  even: { text: 'You shared the rice out to the grain this morning. Even here, they noticed.' },
};

function sadiqLines(f: FlagState): string[] {
  const out = lastLight('ch8DayWounded')(f);
  if (f.sadiqWitnessed) out.push(SADIQ_REMEMBERS.text);
  const ration = RATION_SEEN[String(f.ch8RationFavoured)];
  if (ration) out.push(ration.text);
  return out;
}

/** Mírzá Muḥammad-Báqir at the gate at dawn: the rice, and Quddús's warning. */
export const dayDawn: DialogueTree = {
  id: 'ch8-day-dawn',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mírzá Muḥammad-Báqir',
      text: 'You kept the gate the night he fell. I am Muḥammad-Báqir; I drew the lines of this fort for him, as I built the Bábíyyih in Mashhad, where he lodged. Quddús bids me share out the rice he stored against this day. Take the ladle. My hands are full of names.',
      choices: [{ text: '(Take the ladle.)', next: 'shared', play: 'TabarsiRationGame' }],
    },
    shared: {
      speaker: 'Narrator',
      text: 'The sacks are empty before the sun clears the palisade. Then Quddús comes out among the companions, and the whole fort goes still.',
      choices: [{ text: '(Listen.)', next: 'warning' }],
    },
    warning: {
      speaker: 'Quddús',
      text: 'Whoever feels strong enough for what is coming, let him stay with us. Whoever finds in himself the least hesitation or fear, let him go now, before the way is barred. No one will hold it against him.',
      voice: { voice: 'fear', text: 'You were afraid in Shíráz, of presuming. This is a plainer fear, and it has a gate.',
        requires: f => !!f.fearedPresumption },
      choices: [
        { text: 'The gate will be open tonight. No one would blame you.', next: 'fear', voice: 'fear',
          effect: { set: heed('ch8-dawn', 'fear') } },
        { text: '(Stay where you are, among them.)', next: 'stay', effect: { set: resist('ch8-dawn') } },
      ],
    },
    fear: {
      speaker: 'Narrator',
      text: 'The thought sits in you like cold water. No one looks your way. That is the worst of it: no one would.',
      choices: [{ text: '(Breathe.)', next: 'day' }],
    },
    stay: {
      speaker: 'Narrator',
      text: 'You do not move. Beside you Riḍá lets out a breath he has been holding since the rice ran out.',
      choices: [{ text: '(Breathe.)', next: 'day' }],
    },
    day: {
      speaker: 'Narrator',
      onEnter: { set: { ch8RiceShared: true } },
      text: 'The day is yours until nightfall, and it will not stretch to everyone. The wounded by the east wall; the keeper in the shrine; Muḥammad-Báqir at the gate tower; Furúghí at the west wall; the water below the causeway; the lean-tos by the south wall. Riḍá will walk with you.',
    },
  },
};

/** Mírzá Muḥammad-Báqir at the gate tower, keeping the names. */
export const dayTower: DialogueTree = {
  id: 'ch8-day-tower',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mírzá Muḥammad-Báqir',
      lines: lastLight('ch8DayTower'),
      text: 'Hold the ledger flat; the wind wants it. Every name I write here I write for two readers: this fort, and whoever comes after us and asks.',
      choices: [
        { text: '"How many have we lost?"', next: 'count' },
        { text: '"Where did they lay Mullá Ḥusayn?"', next: 'grave' },
        { text: '"You kept the door that night."', next: 'door' },
        { text: '(Tell him the Khán does not know whom he shot.)', next: 'khan',
          present: { claim: 'ch8-khan', account: 'conscript' } },
      ],
    },
    more: {
      speaker: 'Mírzá Muḥammad-Báqir',
      text: '(He dips the pen again.) Anything else, ask it now. The light will not wait for either of us.',
      choices: [
        { text: '"How many have we lost?"', next: 'count', requires: f => !hasHeard(f, 'ch8-fallen', 'baqir') },
        { text: '"Where did they lay Mullá Ḥusayn?"', next: 'grave', requires: f => !hasHeard(f, 'ch8-grave', 'baqir') },
        { text: '"You kept the door that night."', next: 'door', requires: f => !hasHeard(f, 'ch8-door', 'baqir') },
        { text: '(Tell him the Khán does not know whom he shot.)', next: 'khan',
          present: { claim: 'ch8-khan', account: 'conscript' }, requires: f => !f.ch8ToldBaqirKhan },
        { text: '(Leave him to his names.)', next: 'done' },
      ],
    },
    count: {
      speaker: 'Mírzá Muḥammad-Báqir',
      onEnter: { set: { [heard('ch8-fallen', 'baqir')]: true } },
      text: 'Seventy-two, from the first stones at Bárfurúsh to the dawn he fell. Thirty-six of them from that night alone, laid in one grave on the north side of the shrine. Write it as my count. I may have missed a man. God has not.',
      choices: [{ text: '(Go on.)', next: 'more' }],
    },
    grave: {
      speaker: 'Mírzá Muḥammad-Báqir',
      onEnter: { set: { [heard('ch8-grave', 'baqir')]: true } },
      text: 'Quddús asked those who laid him down to hide the place, even from us. Do not ask me to be the one who breaks it. Write that he lies near the Shaykh, and no nearer.',
      choices: [{ text: '(Go on.)', next: 'more' }],
    },
    door: {
      speaker: 'Mírzá Muḥammad-Báqir',
      onEnter: { set: { [heard('ch8-door', 'baqir')]: true } },
      text: 'He bade me shut it and let no one in. I watched through a crack. I should not have, and I did. Mullá Ḥusayn rose and knelt beside him as he always sat, and I heard him say: Are you well pleased with me? The rest I could not hear, and would not tell.',
      choices: [{ text: '(Go on.)', next: 'more' }],
    },
    khan: {
      speaker: 'Mírzá Muḥammad-Báqir',
      onEnter: { set: { ch8ToldBaqirKhan: true } },
      text: '(The pen stops.) Then let it not leave these walls. If ʿAbbás-Qulí Khán learns that Mullá Ḥusayn is gone, he will be back within the week, and the whole army behind him.',
      choices: [{ text: '(Go on.)', next: 'more' }],
    },
    done: {
      speaker: 'Mírzá Muḥammad-Báqir',
      onEnter: { set: { ch8DayTower: true } },
      text: 'Go, then. And if you write any of this down, write whose word it was.',
    },
  },
};

/** Mullá Ṣádiq among the wounded by the east wall: he talks only while you work. */
export const dayWounded: DialogueTree = {
  id: 'ch8-day-wounded',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ṣádiq',
      lines: sadiqLines,
      text: 'Do not stand there with empty hands. Water first, then questions.',
      choices: [
        { text: '(Carry the water skin along the wall.)', next: 'water' },
        { text: '"I only want to ask about the night he fell."', next: 'first' },
      ],
    },
    first: {
      speaker: 'Mullá Ṣádiq',
      text: 'And they only want to drink. Work, and I will talk. An old man talks better with his hands busy.',
      choices: [{ text: '(Carry the water skin along the wall.)', next: 'water' }],
    },
    water: {
      speaker: 'Narrator',
      text: 'You carry the skin from man to man, holding up heads that cannot lift themselves. Ṣádiq follows, binding as he goes, and talks without looking up.',
      choices: [{ text: '(Listen as you work.)', next: 'talk' }],
    },
    talk: {
      speaker: 'Mullá Ṣádiq',
      onEnter: { set: { [heard('ch8-door', 'sadiq')]: true, [heard('ch8-fallen', 'sadiq')]: true } },
      text: 'When they brought him in, Quddús sent us out. Furúghí and I stood by the wall like boys outside a lesson. Then we heard his voice, answering. Two hours. Near ninety were hurt that night. Most of these will not rise.',
      choices: [{ text: '(Go on to the last man by the wall.)', next: 'last' }],
    },
    last: {
      speaker: 'Narrator',
      text: 'The last man lies with his face to the palisade. He rode out with Mullá Ḥusayn that night. His lips are moving, but not for you.',
      choices: [
        { text: '"What did you see in the forest?"', next: 'asked' },
        { text: '(Hold his hand, and ask nothing.)', next: 'held', effect: { set: { ch8HeldHand: true } } },
      ],
    },
    asked: {
      speaker: 'A Wounded Believer',
      onEnter: { set: { [heard('ch8-khan', 'wounded')]: true, ch8DayWounded: true } },
      text: 'A shot, from the branches of a tree. The tents were burning, and we were in the light, and he was in the dark. That is all I saw. (He turns his face back to the wall.)',
    },
    held: {
      speaker: 'Narrator',
      onEnter: { set: { ch8DayWounded: true } },
      text: 'You hold his hand until the shaking stops. You do not learn what he saw. Ṣádiq, passing behind you, rests a hand on your shoulder and leaves it there a moment.',
    },
  },
};

/** The keeper in the shrine on the day: the lamps, and the graves. */
export const dayShrine: DialogueTree = {
  id: 'ch8-day-shrine',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Keeper of the Shrine',
      lines: lastLight('ch8DayShrine'),
      text: 'Come to help with the wicks? Short, remember. Oil is dearer than bread now, and the Shaykh would not want us to choose.',
      choices: [{ text: '(Trim the lamps with him.)', next: 'trim' }],
    },
    trim: {
      speaker: 'Narrator',
      text: 'You trim the wicks along the wall, one by one. The keeper hums under his breath. When you reach the north side he stops humming.',
      choices: [
        { text: '"Where did they lay Mullá Ḥusayn?"', next: 'grave' },
        { text: '"What is on the north side?"', next: 'north' },
      ],
    },
    north: {
      speaker: 'Keeper of the Shrine',
      text: 'The thirty-six from that night, together in one grave, as Quddús asked. Let them be one in death, he said, as he would have us be one in life. I swept the earth over them myself.',
      choices: [{ text: '"And Mullá Ḥusayn?"', next: 'grave' }],
    },
    grave: {
      speaker: 'Keeper of the Shrine',
      onEnter: { set: { [heard('ch8-grave', 'keeper')]: true, ch8DayShrine: true } },
      text: 'That one they did not let me near. In the morning the earth was turned on the south side, against the Shaykh\'s own wall. Or so it looked to an old man. I did not ask, and I will not.',
    },
  },
};

/** Every place, once the light is gone. */
export const dayLate: DialogueTree = {
  id: 'ch8-day-late',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The light has gone. Whatever is said here today, you will not hear it. Riḍá is waiting for you at the gate.',
    },
  },
};

export const chapter08DayDialogues: Record<string, DialogueTree> = {
  [dayDawn.id]: dayDawn,
  [dayTower.id]: dayTower,
  [dayWounded.id]: dayWounded,
  [dayShrine.id]: dayShrine,
  [dayLate.id]: dayLate,
};
