import type { DialogueTree } from '../../dialogue/types';
import { heed, resist } from '../../dialogue/voices';
import { hasHeard, heard } from '../record';
import { lastLight } from './chapter08_day';

/**
 * Chapter 8, the day the rice was shared out: the west wall (Furúghí), the
 * water below the causeway (a conscript from the camp), and the lean-tos by
 * the south wall (the siyyid from Qum). After Nabíl pp. 333, 384 to 385, 390.
 */

/** Mírzá Muḥammad-i-Furúghí at a loophole of the west wall, copying verses. */
export const dayWall: DialogueTree = {
  id: 'ch8-day-wall',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mírzá Muḥammad-i-Furúghí',
      lines: lastLight('ch8DayWall'),
      text: 'Mind the ink. Muḥammad-Báqir chants these at morning and at evening, and I copy them out between. Some days we forget we are hungry. That is not a figure of speech.',
      choices: [
        { text: '"You knew Mullá Ḥusayn before all this?"', next: 'knew' },
        { text: '(Tell him what the camp says: that Mullá Ḥusayn trained with the sword for years.)', next: 'camp',
          present: { claim: 'ch8-sword', account: 'conscript' } },
        { text: '"Were you at the door, the night he fell?"', next: 'door' },
      ],
    },
    more: {
      speaker: 'Mírzá Muḥammad-i-Furúghí',
      text: '(He blots the page.) Ask, if you have more. I can copy and talk; I cannot copy and weep, so do not make me.',
      choices: [
        { text: '"You knew Mullá Ḥusayn before all this?"', next: 'knew', requires: f => !hasHeard(f, 'ch8-sword', 'furughi') },
        { text: '"Were you at the door, the night he fell?"', next: 'door', requires: f => !hasHeard(f, 'ch8-door', 'furughi') },
        { text: '(Leave him to his copying.)', next: 'done' },
      ],
    },
    knew: {
      speaker: 'Mírzá Muḥammad-i-Furúghí',
      onEnter: { set: { [heard('ch8-sword', 'furughi')]: true } },
      text: 'Since we were boys. I was the stronger of us, if you can believe it. His hand shook when he wrote; he could never get down as much as he wished. He never held a sword until the day at Bárfurúsh.',
      choices: [
        { text: '(Remember Karbilá.)', next: 'own', requires: f => !hasHeard(f, 'ch8-sword', 'own') },
        { text: '(Go on.)', next: 'more' },
      ],
    },
    own: {
      speaker: 'Narrator',
      onEnter: { set: { [heard('ch8-sword', 'own')]: true } },
      text: 'You remember Siyyid Káẓim\'s lessons, and the pen in Mullá Ḥusayn\'s hand trembling over the page while the rest of you raced ahead. He was always the last to finish writing, and the first to understand.',
      choices: [{ text: '(Go on.)', next: 'more' }],
    },
    camp: {
      speaker: 'Mírzá Muḥammad-i-Furúghí',
      onEnter: { set: { ch8ToldFurughiCamp: true } },
      text: 'The court chroniclers will write that, you will see. It is a lie, and an easy one. It is easier than what happened.',
      choices: [{ text: '"Then what happened?"', next: 'knew' }],
    },
    door: {
      speaker: 'Mírzá Muḥammad-i-Furúghí',
      onEnter: { set: { [heard('ch8-door', 'furughi')]: true } },
      text: 'Ṣádiq and I were sent out. We stood there sure he was already gone, and then we heard him answer. A dead man does not answer. Afterwards Quddús said he had shared with him things he had never thought it lawful to speak.',
      choices: [{ text: '(Go on.)', next: 'more' }],
    },
    done: {
      speaker: 'Mírzá Muḥammad-i-Furúghí',
      onEnter: { set: { ch8DayWall: true } },
      text: 'Write it down, if you are the kind who writes. Write who told you. One day someone will need to know which of us to believe.',
    },
  },
};

/** The water below the causeway, and a conscript from the royal camp on the far bank. */
export const dayWater: DialogueTree = {
  id: 'ch8-day-water',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      lines: lastLight('ch8DayWater'),
      text: 'Below the causeway the ditch runs full with rain. On the far bank a soldier from the camp squats on his heels, musket across his knees, and watches you kneel with the water skins.',
      choices: [{ text: '(Fill the skins, and nod to him.)', next: 'nod' }],
    },
    nod: {
      speaker: 'A Conscript',
      text: 'Go on, fill them. Nobody told me to stop you, and I would not anyway. (He watches the water.) Is it true, what they say in the camp? That the tall one in the green turban is dead? Nobody says it out loud.',
      choices: [
        { text: '(Say nothing.)', next: 'khan' },
        { text: '"Why does nobody say it?"', next: 'khan' },
      ],
    },
    khan: {
      speaker: 'A Conscript',
      onEnter: { set: { [heard('ch8-khan', 'conscript')]: true } },
      text: 'Because our khan sits in a village four farsangs off, ashamed to go home and afraid to go to Ṭihrán. He fired at a horseman in the firelight and does not know whom he hit. If he knew, he would be back here by now.',
      choices: [{ text: '"What else do they say in the camp?"', next: 'camp' }],
    },
    camp: {
      speaker: 'A Conscript',
      onEnter: { set: { [heard('ch8-sword', 'conscript')]: true, [heard('ch8-fallen', 'conscript')]: true } },
      text: 'That he trained with the sword for years, before ever he put on a scholar\'s turban, because no scholar could fight like that. And that your dead are in the hundreds. The officers like that number.',
      choices: [
        { text: '(Tell him what Furúghí said: that his hand shook when he wrote.)', next: 'pen',
          present: { claim: 'ch8-sword', account: 'furughi' }, effect: { set: { ch8ToldConscriptPen: true } } },
        { text: '(Shoulder the skins.)', next: 'done' },
      ],
    },
    pen: {
      speaker: 'A Conscript',
      text: 'His hand shook? (He looks at his own, on the musket.) Mine shakes too. I thought it was the cold.',
      choices: [{ text: '(Shoulder the skins.)', next: 'done' }],
    },
    done: {
      speaker: 'Narrator',
      onEnter: { set: { ch8DayWater: true } },
      text: 'The skins drag at your shoulders all the way up the causeway. Inside, the wounded by the east wall will drink tonight.',
    },
  },
};

/** The lean-tos by the south wall: the youngest, and the siyyid from Qum. */
export const dayLeanTo: DialogueTree = {
  id: 'ch8-day-leanto',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      lines: lastLight('ch8DayLeanTo'),
      text: 'Under the lean-tos the rain comes through in threads. The youngest companions sleep in a heap for warmth. A siyyid in a good cloak, gone thin on him, sits a little apart and writes on his knee.',
      choices: [{ text: '(Patch the roof over the boys.)', next: 'roof' }],
    },
    roof: {
      speaker: 'Narrator',
      text: 'You lash fresh branches over the worst of it. One of the boys wakes, does not know where he is, and asks for his mother.',
      choices: [
        { text: 'Tell him about home, as if you could see it from here.', next: 'home', voice: 'longing',
          effect: { set: heed('ch8-leanto', 'longing') } },
        { text: '(Sit with him until he sleeps.)', next: 'sleep', effect: { set: resist('ch8-leanto') } },
      ],
    },
    home: {
      speaker: 'Narrator',
      text: 'You tell him about a courtyard with a pool and a fig tree, and find it is your own home you are describing. Neither of you sleeps for a long time.',
      choices: [{ text: '(Look up.)', next: 'siyyid' }],
    },
    sleep: {
      speaker: 'Narrator',
      text: 'You sit with him and say nothing. Home is too far to talk about. After a while he sleeps.',
      choices: [{ text: '(Look up.)', next: 'siyyid' }],
    },
    siyyid: {
      speaker: 'The Siyyid from Qum',
      onEnter: { set: { ch8MetSiyyidQum: true } },
      text: 'You walk about the fort; you must hear things. (He folds his paper away.) Tell me, where did they lay Mullá Ḥusayn? And how many of us, truly, can still stand on the walls?',
      choices: [
        { text: '"Why do you want to know?"', next: 'why' },
        { text: '"I do not know where he lies."', next: 'unknown' },
        { text: '(Tell him what the keeper guessed: the south side, against the wall.)', next: 'told',
          present: { claim: 'ch8-grave', account: 'keeper' }, effect: { set: { ch8ToldSiyyidGrave: true } } },
        { text: '(Tell him that Quddús asked the place be hidden, even from the companions.)', next: 'kept',
          present: { claim: 'ch8-grave', account: 'baqir' } },
      ],
    },
    why: {
      speaker: 'The Siyyid from Qum',
      text: 'Because I am afraid, and so are you. Quddús said whoever is afraid should go. I want to know what I would be leaving behind.',
      choices: [
        { text: '"I do not know where he lies."', next: 'unknown' },
        { text: '(Tell him what the keeper guessed: the south side, against the wall.)', next: 'told',
          present: { claim: 'ch8-grave', account: 'keeper' }, effect: { set: { ch8ToldSiyyidGrave: true } } },
        { text: '(Tell him that Quddús asked the place be hidden, even from the companions.)', next: 'kept',
          present: { claim: 'ch8-grave', account: 'baqir' } },
      ],
    },
    unknown: {
      speaker: 'The Siyyid from Qum',
      text: 'No one does, it seems. Or no one will say.',
      choices: [{ text: '(Turn to go.)', next: 'rida' }],
    },
    told: {
      speaker: 'The Siyyid from Qum',
      text: 'The south side. (He writes it down.) Thank you. You have been kind to a frightened man.',
      choices: [{ text: '(Turn to go.)', next: 'rida' }],
    },
    kept: {
      speaker: 'The Siyyid from Qum',
      text: 'Hidden even from us? (A thin smile.) Then he trusts us less than he says. Well. I am glad someone here keeps a secret.',
      choices: [{ text: '(Turn to go.)', next: 'rida' }],
    },
    rida: {
      speaker: 'Riḍá',
      onEnter: { set: { ch8DayLeanTo: true } },
      text: '(At your elbow, low.) He has asked me the same thing twice today. I told him I count fires, not graves.',
    },
  },
};

export const chapter08DayPlaceDialogues: Record<string, DialogueTree> = {
  [dayWall.id]: dayWall,
  [dayWater.id]: dayWater,
  [dayLeanTo.id]: dayLeanTo,
};
