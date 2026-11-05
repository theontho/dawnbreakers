import type { DialogueTree } from '../../dialogue/types';
import { heed, heededAt, resist } from '../../dialogue/voices';
import { CH8_CLAIMS, heard } from '../record';

/**
 * Chapter 8: the night after the rice was shared out. Siyyid ʿAlíy-i-Zargar
 * goes out at midnight with his share of rice and the letter of the siyyid
 * from Qum (Nabíl pp. 384 to 385); the player writes the record by the
 * keeper's last wick. Then, ten days before Naw-Rúz, ʿAbbás-Qulí Khán comes
 * back knowing what the letter told him (p. 386).
 */

/** Riḍá at the gate at nightfall. */
export const nightGate: DialogueTree = {
  id: 'ch8-night-gate',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Riḍá',
      text: 'My watch, and yours. I have counted the army\'s fires: fewer since he fell. They are waiting to see what we do.',
      choices: [{ text: '(Keep the watch with him.)', next: 'midnight' }],
    },
    midnight: {
      speaker: 'Narrator',
      text: 'Near midnight a man comes along the inside of the palisade with a knotted cloth under his arm: his share of the morning\'s rice. He does not look at you. At the gate he stops.',
      choices: [
        { text: '(Look at where he came from.)', next: 'from', requires: f => !!f.ch8MetSiyyidQum },
        { text: '(Watch him.)', next: 'gate' },
      ],
    },
    from: {
      speaker: 'Narrator',
      onEnter: { set: { [heard('ch8-midnight', 'own')]: true } },
      text: 'He came from the lean-to of the siyyid from Qum. The siyyid\'s lamp is still lit, and under the man\'s arm, against the rice, there is the corner of a folded paper.',
      choices: [{ text: '(Watch him.)', next: 'gate' }],
    },
    gate: {
      speaker: 'Riḍá',
      onEnter: { set: { [heard('ch8-midnight', 'rida')]: true } },
      text: '(Very low.) Let him go. He is hungry, that is all. Quddús said whoever was afraid could leave, and he is afraid.',
      choices: [
        { text: '(Give him your own share for the road.)', next: 'given', effect: { set: { ch8ZargarGiven: true } } },
        { text: 'Go with him. It is not too late.', next: 'fear', voice: 'fear',
          requires: f => heededAt(f, 'ch8-dawn', 'fear'), effect: { set: heed('ch8-night', 'fear') } },
        { text: '(Let him go.)', next: 'go',
          effect: { set: resist('ch8-night') } },
      ],
    },
    given: {
      speaker: 'Narrator',
      text: 'You hold out the cloth with your own rice in it. He stares at it, then at you, and takes it without a word. The gate opens a hand\'s width and closes behind him.',
      choices: [{ text: '(Stand the rest of the watch.)', next: 'after' }],
    },
    fear: {
      speaker: 'Narrator',
      text: 'You take a step after him. Riḍá\'s hand closes on your sleeve, not hard. When you look round the gate is shut, the man is gone, and you are still inside.',
      choices: [{ text: '(Stand the rest of the watch.)', next: 'after' }],
    },
    go: {
      speaker: 'Narrator',
      text: 'The gate opens a hand\'s width and closes behind him. The forest takes him at once.',
      choices: [{ text: '(Stand the rest of the watch.)', next: 'after' }],
    },
    after: {
      speaker: 'Riḍá',
      onEnter: { set: { ch8NightWatch: true } },
      text: 'Go and sleep. No, I know you will not. Go and sit by the keeper\'s wick, then, and write. You have been listening all day; I watched you.',
      choices: [{ text: '(Go into the shrine, to the wick.)', next: 'wick' }],
    },
    wick: {
      speaker: 'Narrator',
      text: 'Inside the shrine one wick still burns for the Shaykh. You sit beside it with a borrowed pen. Whose words go down, and how sure are you?',
      voice: { voice: 'doubt', text: 'You saw two things today. The rest is other men\'s words.' },
      choices: [
        { text: '(Write.)', next: 'written', write: CH8_CLAIMS.map(c => c.id), effect: { set: resist('ch8-wick') } },
        { text: 'Write nothing tonight. You do not know enough.', next: 'unwritten', voice: 'doubt',
          effect: { set: heed('ch8-wick', 'doubt') } },
      ],
    },
    written: {
      speaker: 'Narrator',
      onEnter: { set: { ch8RecordWritten: true } },
      text: 'The ink is barely dry when the wick gutters. You leave room on the page for what you did not hear. Until the fort\'s story ends, you may still change what you wrote.',
    },
    unwritten: {
      speaker: 'Narrator',
      onEnter: { set: { ch8RecordWritten: true } },
      text: 'You put the pen down. The page waits in your journal, and so do the questions. From now on, doubt will not let you call one man\'s word certain.',
    },
  },
};

/** Ten days before Naw-Rúz: Mírzá Muḥammad-Báqir brings Quddús's words about the betrayer. */
export const baqirNews: DialogueTree = {
  id: 'ch8-baqir-news',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mírzá Muḥammad-Báqir',
      onEnter: { set: { [heard('ch8-midnight', 'quddus')]: true, ch8BetrayalNamed: true } },
      text: 'Ten days before Naw-Rúz the Khán was back at dawn, with two regiments, and he knew. Quddús told me: the betrayer has announced the death of Mullá Ḥusayn to ʿAbbás-Qulí Khán, and the Khán would have the glory of taking us all for himself.',
      choices: [
        { text: '"You said it must not leave these walls."', next: 'walls', requires: f => !!f.ch8ToldBaqirKhan },
        { text: '"What did Quddús do?"', next: 'sally' },
      ],
    },
    walls: {
      speaker: 'Mírzá Muḥammad-Báqir',
      text: 'It did not leave by the gate you kept. (He is quiet a moment.) Yes, it did. It left in a sealed letter, under a hungry man\'s arm.',
      choices: [{ text: '"What did Quddús do?"', next: 'sally' }],
    },
    sally: {
      speaker: 'Mírzá Muḥammad-Báqir',
      text: 'He sent me out with eighteen men and the cry, and the Khán\'s men scattered before it. He has gone back to his village to think. Your record of that night at the gate is still open, if you would write it again.',
      choices: [
        { text: '(Write it again.)', write: ['ch8-midnight'], next: 'end' },
        { text: '(Leave it as it stands.)', next: 'end' },
      ],
    },
    end: {
      speaker: 'Mírzá Muḥammad-Báqir',
      text: 'Go and find Riḍá at the cauldron. Whatever is in it tonight, it will not be rice.',
    },
  },
};

export const chapter08NightDialogues: Record<string, DialogueTree> = {
  [nightGate.id]: nightGate,
  [baqirNews.id]: baqirNews,
};
