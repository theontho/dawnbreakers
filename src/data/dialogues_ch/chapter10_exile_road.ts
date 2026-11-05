import type { DialogueTree } from '../../dialogue/types';
import { heed, heededCount } from '../../dialogue/voices';
import { anyToTell, canTell, carriedAnything, carriedLines, closingLines, recordLines, testimonyState, toldKey } from '../record';

/**
 * The western gate of Ṭihrán at dawn, January 1853. Bahá'u'lláh and His
 * family have set out for Baghdád under escort, in deep winter. The player
 * arrives after they have gone: only the tracks in the snow remain. The
 * final reflection closes the circle with the lamplit night in Shíráz and
 * branches on `recognised` (true, false, or never answered). Before the
 * last answer the pilgrim says what they carried and what they saw: the
 * record written at Ṭabarsí, read back as testimony (docs/design/chronicler.md).
 */

/** The guard from the prison stair, now posted at the western gate. */
export const ch10GateGuard: DialogueTree = {
  id: 'ch10-gate-guard',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Guard',
      text: 'You. I remember you: the one who held out both hands for the irons. They let you up, then. Most of them, we carried up.',
      choices: [
        { text: '"Why are you at the gate now?"', next: 'posted' },
        { text: '"Did you hear the singing, all those nights?"', next: 'song' },
      ],
    },
    posted: {
      speaker: 'Guard',
      text: 'They moved me once the pit was emptied of its famous prisoner. Easier duty. I count mules and stamp passes. Before light this morning I stamped one for a household bound for Baghdád, under escort.',
      choices: [{ text: '"Did you hear the singing, all those nights?"', next: 'song' }],
    },
    song: {
      speaker: 'Guard',
      text: 'Four months of it. One row calling, the other answering, coming up the stair like smoke. One night the Sháh himself heard it in his palace and asked what that sound was. They told him: the Bábís, singing in their prison. He said nothing at all.',
      choices: [{ text: '"And you?"', next: 'you' }],
    },
    you: {
      speaker: 'Guard',
      onEnter: { set: { ch10GuardRemembers: true } },
      text: 'Me? I am a guard. I repeat orders. He is quiet a while, stamping his feet in the snow. "But some nights, God help me, I found I knew the words."',
    },
  },
};

/** The muleteer who hired out animals for the exiles' journey. */
export const ch10Muleteer: DialogueTree = {
  id: 'ch10-muleteer',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Muleteer',
      text: 'Too late, friend, if you wanted the Baghdád party. They went out before first light. I hired them three of my mules and my brother\'s cart, for my sins and their silver.',
      choices: [
        { text: '"Why do you say, for your sins?"', next: 'sins' },
        { text: '"Tell me how they went."', next: 'went' },
      ],
    },
    sins: {
      speaker: 'A Muleteer',
      text: 'Because it is the dead of winter, and the road climbs past Hamadán into the passes beyond Kirmánsháh, and they are not dressed for it. The court gave them a month to quit Persia. Nobody gave them coats.',
      choices: [{ text: '"Tell me how they went."', next: 'went' }],
    },
    went: {
      speaker: 'A Muleteer',
      text: 'An officer of the royal guard rides with them, and a man from the Russian legation. Brothers, a few of the household. The lady, a boy of eight, a girl of six. The littlest they left with kin. He was too frail for the mountains.',
      choices: [{ text: '"And He?"', next: 'him' }],
    },
    him: {
      speaker: 'A Muleteer',
      onEnter: { set: { ch10HeardDeparture: true } },
      text: 'I did not see His face; it was dark, and I am a muleteer, I look at feet and girths. I saw how carefully they helped Him onto the grey mule, as one helps a man who has been ill a long time. The tracks are there still, past the milestone.',
    },
  },
};

/** Zahrá at the gate, come to see the exiles off. */
export const ch10SisterRoad: DialogueTree = {
  id: 'ch10-sister-road',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Zahrá',
      text: 'You came up! I watched every man they brought up that stair. You were not one of the ones they carried. I came to see the lady and her children go safely, and I brought bread again. It seems I am always bringing bread.',
      choices: [
        { text: '"Did Riḍá tell you about the bread?"', next: 'bread', requires: f => !!f.ch10GaveBread },
        { text: '"Riḍá asked me to tell you he is singing."', next: 'singing' },
      ],
    },
    bread: {
      speaker: 'Zahrá',
      text: 'He told me. He said you found him in the dark with my cloth in your hands, and that he gave half away before he had tasted it. That is my brother. That was always my brother.',
      choices: [{ text: '"He asked me to tell you he is singing."', next: 'singing' }],
    },
    singing: {
      speaker: 'Zahrá',
      onEnter: { set: { ch10SisterReunited: true } },
      text: 'He came up a week after you, on a cart. His legs are bad still. But yes, he sings. He sings all day. The neighbours have stopped complaining. Some of them have started to answer.',
    },
  },
};

/** Riḍá, freed, at the gate with his sister. */
export const ch10RidaRoad: DialogueTree = {
  id: 'ch10-rida-road',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Riḍá',
      text: 'My legs have not forgiven the stocks yet. But listen. "God is sufficient unto me; He verily is the All-Sufficing!"',
      choices: [
        { text: '"In Him let the trusting trust."', next: 'answer', effect: { set: { ch10AnsweredRida: true } } },
        { text: '(Listen, and say nothing.)', next: 'answer' },
      ],
    },
    answer: {
      speaker: 'Riḍá',
      onEnter: { set: { ch10MetRidaFree: true } },
      text: 'Ḥájí Muḥsin is still below. He made me promise to sing it here at the gate when they left, so they would know they were not forgotten. I sang it too late. I think the snow heard it, anyway.',
    },
  },
};

/** Before the player knows whose tracks these are. */
export const ch10FinalWaiting: DialogueTree = {
  id: 'ch10-final-waiting',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Tracks in the snow, already softening at the edges: wheel ruts and the small hooves of laden mules, all heading west. Whose are they? Someone by the caravanserai would know.',
    },
  },
};

/** The final reflection: the hidden dawn answers the lamplit night in Shíráz. */
export const ch10Final: DialogueTree = {
  id: 'ch10-final',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The sun rises behind you over the wall of Ṭihrán, and your shadow runs out ahead of you along the ruts, westward, as if it would go first. Eight years and more ago you sat on a step in Shíráz while a lamp burned behind a lattice.',
      choices: [
        { text: '(Remember the lamplit door.)', next: 'kept', requires: f => f.recognised === true },
        { text: '(Remember the lamplit door.)', next: 'asked', requires: f => f.recognised === false },
        { text: '(Remember the lamplit door.)', next: 'door', requires: f => f.recognised === undefined },
      ],
    },
    kept: {
      speaker: 'Narrator',
      text: 'That dawn you told Mullá Ḥusayn your heart turned toward the light. Since then you have watched the lamps go out one by one: Mullá Ḥusayn at Ṭabarsí and Quddús at Bárfurúsh, Vaḥíd at Nayríz and Ḥujjat at Zanján, the Báb Himself at Tabríz, Ṭáhirih in a garden at night. You had begun to fear the dawn was over.',
      choices: [{ text: '(Look down at the tracks.)', next: 'hidden' }],
    },
    asked: {
      speaker: 'Narrator',
      text: 'That dawn you asked for time, and for the verses themselves. Mullá Ḥusayn asked only that you search. You have searched for eight years, down roads and into squares, and every witness you meant to question was taken from you before you could ask.',
      choices: [{ text: '(Look down at the tracks.)', next: 'hidden' }],
    },
    door: {
      speaker: 'Narrator',
      text: 'That dawn Mullá Ḥusayn came out with a changed face and asked nothing of anyone but to search. Since then you have followed the witnesses down roads and into squares, and watched them taken one by one: Mullá Ḥusayn at Ṭabarsí and Quddús at Bárfurúsh, Vaḥíd at Nayríz and Ḥujjat at Zanján, the Báb Himself at Tabríz.',
      choices: [{ text: '(Look down at the tracks.)', next: 'hidden' }],
    },
    hidden: {
      speaker: 'Narrator',
      text: 'And then, in a pit with no window, a dawn no one saw. In Shíráz the door was closed and you sat outside it. Under Ṭihrán there was no door at all, only a chain, a thread of light, and a stillness that made the iron quiet.',
      choices: [
        { text: '(Remember what you carried.)', next: 'carried', requires: carriedAnything },
        { text: '(Say aloud what you saw at Ṭabarsí.)', next: 'testimony', requires: f => !carriedAnything(f) && anyToTell(f) },
        { text: '(Look west.)', next: 'answer', requires: f => !carriedAnything(f) && !anyToTell(f) },
      ],
    },
    carried: {
      speaker: 'Narrator',
      text: 'Eight years of roads, and your hands remember them better than your head.',
      lines: carriedLines,
      choices: [
        { text: '(Say aloud what you saw at Ṭabarsí.)', next: 'testimony', requires: anyToTell },
        { text: '(Look west.)', next: 'answer', requires: f => !anyToTell(f) },
      ],
    },
    testimony: {
      speaker: 'Narrator',
      text: 'There is no one on the road to hear it. Say it anyway, the way you will one day say it to whoever comes asking. What do you tell first?',
      choices: [
        { text: '(How many had fallen.)', next: 'tFallen', requires: canTell('ch8-fallen'), effect: { set: { [toldKey('ch8-fallen')]: true } } },
        { text: '(Where Mullá Ḥusayn lies.)', next: 'tGrave', requires: canTell('ch8-grave'), effect: { set: { [toldKey('ch8-grave')]: true } } },
        { text: '(What passed behind the closed door.)', next: 'tDoor', requires: canTell('ch8-door'), effect: { set: { [toldKey('ch8-door')]: true } } },
        { text: '(The man in the tree.)', next: 'tKhan', requires: canTell('ch8-khan'), effect: { set: { [toldKey('ch8-khan')]: true } } },
        { text: '(The trembling pen.)', next: 'tSword', requires: canTell('ch8-sword'), effect: { set: { [toldKey('ch8-sword')]: true } } },
        { text: '(The man at the gate at midnight.)', next: 'tMidnight', requires: canTell('ch8-midnight'), effect: { set: { [toldKey('ch8-midnight')]: true } } },
        { text: '(That is enough.)', next: 'close' },
      ],
    },
    tFallen: {
      speaker: 'Narrator', text: 'How many had fallen since Bárfurúsh:', lines: f => recordLines('ch8-fallen', f),
      choices: [{ text: '(Tell more.)', next: 'testimony', requires: anyToTell }, { text: '(That is enough.)', next: 'close' }],
    },
    tGrave: {
      speaker: 'Narrator', text: 'Where Mullá Ḥusayn lies:', lines: f => recordLines('ch8-grave', f),
      choices: [{ text: '(Tell more.)', next: 'testimony', requires: anyToTell }, { text: '(That is enough.)', next: 'close' }],
    },
    tDoor: {
      speaker: 'Narrator', text: 'What passed behind the closed door:', lines: f => recordLines('ch8-door', f),
      choices: [{ text: '(Tell more.)', next: 'testimony', requires: anyToTell }, { text: '(That is enough.)', next: 'close' }],
    },
    tKhan: {
      speaker: 'Narrator', text: 'The man in the tree:', lines: f => recordLines('ch8-khan', f),
      choices: [{ text: '(Tell more.)', next: 'testimony', requires: anyToTell }, { text: '(That is enough.)', next: 'close' }],
    },
    tSword: {
      speaker: 'Narrator', text: 'What kind of man Mullá Ḥusayn had been:', lines: f => recordLines('ch8-sword', f),
      choices: [{ text: '(Tell more.)', next: 'testimony', requires: anyToTell }, { text: '(That is enough.)', next: 'close' }],
    },
    tMidnight: {
      speaker: 'Narrator', text: 'The man at the gate at midnight:', lines: f => recordLines('ch8-midnight', f),
      choices: [{ text: '(Tell more.)', next: 'testimony', requires: anyToTell }, { text: '(That is enough.)', next: 'close' }],
    },
    close: {
      speaker: 'Narrator',
      text: 'Your breath hangs in the cold and is gone.',
      lines: closingLines,
      choices: [
        { text: '(Look west.)', next: 'answer', requires: f => testimonyState(f) === 'kept', effect: { set: { ch10Testimony: 'kept' } } },
        { text: '(Look west.)', next: 'answer', requires: f => testimonyState(f) === 'gaps', effect: { set: { ch10Testimony: 'gaps' } } },
        { text: '(Look west.)', next: 'answer', requires: f => testimonyState(f) === 'full', effect: { set: { ch10Testimony: 'full' } } },
      ],
    },
    answer: {
      speaker: 'Narrator',
      text: 'The tracks run west into the white. Something in you must answer them, as something answered a lamp in Shíráz.',
      choices: [
        { text: '"In Shíráz the lamp went out because the sun made it needless. I did not know the sun could rise underground."',
          next: 'end', requires: f => f.recognised === true, effect: { set: { ch10Final: 'kept' } } },
        { text: '"I asked for time. I was given eight years and a winter in the dark. I am ready now to say what I saw."',
          next: 'end', requires: f => f.recognised === false, effect: { set: { ch10Final: 'answered' } } },
        { text: '"Eight years since that door in Shíráz, and a winter in the dark. I am ready now to say what I saw."',
          next: 'end', requires: f => f.recognised === undefined, effect: { set: { ch10Final: 'ready' } } },
        { text: '"I do not know yet what I saw. I know which way the tracks go."',
          next: 'end', effect: { set: { ch10Final: 'following' } } },
        { text: 'You have been homesick for eight years, and never for a place. Follow them.',
          next: 'end', voice: 'longing', requires: f => heededCount(f, 'longing') >= 2,
          effect: { set: { ch10Final: 'following', ...heed('ch10-road', 'longing') } } },
      ],
    },
    end: {
      speaker: 'Narrator',
      onEnter: { set: { dawnComplete: true } },
      text: 'Ahead the road climbs toward the western mountains, and beyond them Baghdád, and a garden by the Tigris where, ten springs from now, what was hidden in the Black Pit will be spoken aloud. The tracks are filling with new snow. You set your feet in them, and follow.',
    },
  },
};

export const chapter10RoadDialogues: Record<string, DialogueTree> = {
  [ch10GateGuard.id]: ch10GateGuard,
  [ch10Muleteer.id]: ch10Muleteer,
  [ch10SisterRoad.id]: ch10SisterRoad,
  [ch10RidaRoad.id]: ch10RidaRoad,
  [ch10FinalWaiting.id]: ch10FinalWaiting,
  [ch10Final.id]: ch10Final,
};
