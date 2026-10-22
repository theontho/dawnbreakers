import type { DialogueTree } from '../../dialogue/types';

/**
 * The night in Mullá Ḥusayn's cell, after the account Mullá Muḥammad-i-
 * Muʿallim gave and Mírzá Músá, Áqáy-i-Kalím, passed on to Nabíl: at
 * midnight the tutor knocked and found him awake beside his lamp; Mullá
 * Ḥusayn asked after the family of the late Mírzá Buzurg of Núr, and gave
 * him a scroll wrapped in cloth to carry at dawn to one of its sons. The
 * player sits by the lamp and hears it; the One the scroll is for is spoken
 * of only, in the tutor's answers.
 */

export const nurHusaynNight: DialogueTree = {
  id: 'nur-husayn-night',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn',
      text: 'You. (He sets the lamp down.) I told you to take ship from Búshihr, and you have walked the whole of Persia the wrong way to sit on my doorstep.',
      choices: [
        { text: '"You said a mystery is hidden in Ṭihrán. I wanted to see it found."', next: 'mystery',
          requires: f => f.recognised === true },
        { text: '"I still have not found my certainty. I thought I might find it near you."', next: 'certainty',
          requires: f => f.recognised !== true },
      ],
    },
    mystery: {
      speaker: 'Mullá Ḥusayn',
      text: 'So did I. (He laughs, quietly.) Sit, then. There is bread, and there is a lamp, and that is the whole of my hospitality.',
      choices: [{ text: '"The Ḥájí says you have betrayed the Shaykhís."', next: 'haji' }],
    },
    certainty: {
      speaker: 'Mullá Ḥusayn',
      text: 'Near me you will find only a tired man from Bushrúyih. But sit. There is bread, and there is a lamp, and that is the whole of my hospitality.',
      choices: [{ text: '"The Ḥájí says you have betrayed the Shaykhís."', next: 'haji' }],
    },
    haji: {
      speaker: 'Mullá Ḥusayn',
      text: 'He hoped I would come to lead the Shaykhís after Siyyid Káẓim, and I came instead to tell him that what the Siyyid awaited has come. I told him I would not stay long. I meant it. Yet every evening I come back to this cell.',
      choices: [{ text: '"Why?"', next: 'why' }],
    },
    why: {
      speaker: 'Mullá Ḥusayn',
      text: 'He told me that in this city lies hidden a mystery that neither Ḥijáz nor Shíráz can rival. Every morning I go out into the streets and every evening I come back with my hands empty. And I am not told to leave.',
      choices: [{ text: '(Keep the lamp company with him.)', next: 'knock' }],
    },
    knock: {
      speaker: 'Narrator',
      text: 'The court goes quiet. The Ḥájí\'s lamp goes out. Near midnight there is a knock at the door, so soft you think it is the wind, and then again. It is the tutor from the next cell, and he cannot get his first words out for tears.',
      choices: [{ text: '(Make room for him by the lamp.)', next: 'see' }],
    },
    see: {
      speaker: 'Mullá Ḥusayn',
      text: '(He listens to all of it, and then he is very gentle.) Now I can see why I have chosen to dwell in this place. Your teacher has rejected this Message with contempt. My hope is that his pupil, unlike his master, may know its truth. What is your name, and which city is your home?',
      choices: [{ text: '(Listen.)', next: 'name' }],
    },
    name: {
      speaker: 'Mullá Muḥammad-i-Muʿallim',
      text: 'My name is Mullá Muḥammad, and they call me Muʿallim. My home is Núr, in the province of Mázindarán.',
      choices: [{ text: '(Watch Mullá Ḥusayn.)', next: 'buzurg' }],
    },
    buzurg: {
      speaker: 'Mullá Ḥusayn',
      text: '(Something changes in his face.) Núr. Tell me: of the family of the late Mírzá Buzurg of Núr, who was so renowned for his character and his charm, his art and his learning, is there anyone today who keeps up the high traditions of that house?',
      choices: [{ text: '(Listen.)', next: 'son' }],
    },
    son: {
      speaker: 'Mullá Muḥammad-i-Muʿallim',
      text: 'Yes. Among his sons now living there is One who has the very virtues of His father. By His life, His attainments, His loving-kindness and His liberality, He has shown Himself a noble son of a noble father.',
      choices: [{ text: '(Listen.)', next: 'questions' }],
    },
    questions: {
      speaker: 'Narrator',
      text: 'Mullá Ḥusayn asks and asks. His occupation? "He cheers the disconsolate and feeds the hungry." His rank? "None, beyond befriending the poor and the stranger." His name? "Ḥusayn-ʿAlí." His age? "Eight and twenty." With every answer the lamp seems to burn higher in Mullá Ḥusayn\'s face.',
      choices: [{ text: '(Listen.)', next: 'more' }],
    },
    more: {
      speaker: 'Mullá Muḥammad-i-Muʿallim',
      text: 'Of His father\'s scripts He loves best the shikastih-nastaʿlíq. And He roams the woods, and delights in the beauty of the countryside. (He breaks off, puzzled.) Why do you ask me all this?',
      choices: [{ text: '(Wait for Mullá Ḥusayn\'s answer.)', next: 'trust' }],
    },
    trust: {
      speaker: 'Mullá Ḥusayn',
      text: 'You often see Him? Then will you put into His hands a trust from me? (He draws out a scroll wrapped in a piece of cloth.) Tomorrow, at the hour of dawn. And if He should deign to answer me, come and tell me what He says.',
      choices: [{ text: '(Watch the tutor take it.)', next: 'given' }],
    },
    given: {
      speaker: 'Mullá Muḥammad-i-Muʿallim',
      onEnter: { set: { nurScrollGiven: true } },
      text: 'Most assuredly. (He holds the bundle against his chest with both hands, as if it were warm.) At dawn, then. (To you:) The lanes are dark before the sun. Walk with me, if you will.',
      choices: [
        { text: '"I will walk with you as far as the door."' },
        { text: '(Look to Mullá Ḥusayn.)', next: 'door' },
      ],
    },
    door: {
      speaker: 'Mullá Ḥusayn',
      text: 'Go with him as far as the door. Not through it. What is in the scroll is not mine to show, and it is not yours to carry. (He turns the wick down.) Sleep an hour if you can.',
    },
  },
};

/** Mullá Ḥusayn before dawn, while the tutor is on his way. */
export const nurHusaynDawn: DialogueTree = {
  id: 'nur-husayn-dawn',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn',
      text: '(He has not slept. He sits facing the gate with his hands open on his knees.) Go with him. I will be here when you come back. I find I cannot go out into the streets this morning.',
    },
  },
};

export const nurNightDialogues: Record<string, DialogueTree> = {
  [nurHusaynNight.id]: nurHusaynNight,
  [nurHusaynDawn.id]: nurHusaynDawn,
};
