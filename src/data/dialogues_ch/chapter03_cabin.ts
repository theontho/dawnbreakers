import type { DialogueTree } from '../../dialogue/types';

/**
 * Chapter 3: the companions' cabin aboard the pilgrim ship, entered by the
 * plank door on the port side. A curtain divides it from the inner room
 * where the Báb keeps prayer; the curtain is a threshold and is never drawn
 * aside. Quddús writes here once the storm has passed.
 */

/** The slippers and ewer before the curtained partition. */
export const cabinCurtain: DialogueTree = {
  id: 'ch3-cabin-curtain',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A curtain of indigo cloth hangs across the partition, a hand\'s breadth short of the deck, and lamplight lies along its hem. Before it, a pair of slippers set side by side and a brass ewer for washing before prayer. Beyond is the inner room.',
      choices: [
        { text: '(Listen.)', next: 'storm', requires: f => !f.ch3StormWeathered },
        { text: '(Listen.)', next: 'calm', requires: f => !!f.ch3StormWeathered },
        { text: '(Set the slippers straight, and leave the curtain as it is.)', next: 'leave' },
      ],
    },
    storm: {
      speaker: 'Narrator',
      onEnter: { set: { ch3HonouredCurtain: true } },
      text: 'Within, a voice low and even, then a silence, then the scratch of a pen. The ship leans and the curtain swings out a finger\'s width and falls back. You do not lift it. Some doors are opened from the other side, or not at all.',
    },
    calm: {
      speaker: 'Narrator',
      onEnter: { set: { ch3HonouredCurtain: true } },
      text: 'Since the storm the voice within is slower, reading back what was written in the night. The curtain hangs straight now that the sea is calm, and you find you do not need to see behind it.',
    },
    leave: {
      speaker: 'Narrator',
      onEnter: { set: { ch3HonouredCurtain: true } },
      text: 'You set the slippers heel to heel, as your mother taught you, and step back. Mubárak\'s bedding roll lies close against the partition. At night, you think, he sleeps across this threshold like a wall.',
    },
  },
};

/** Quddús's corner: the book-stand and the pages wrapped in oilcloth. */
export const cabinPages: DialogueTree = {
  id: 'ch3-cabin-pages',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Quddús\'s corner: a folding book-stand, a reed pen cut down to a stub, and a bundle of pages wrapped in oilcloth against the spray, tied twice and knotted like a sailor\'s work.',
      choices: [
        { text: '(Feel the weight of the bundle.)', next: 'weight' },
        { text: '(Leave his things as they are.)' },
      ],
    },
    weight: {
      speaker: 'Narrator',
      onEnter: { set: { ch3WeighedPages: true } },
      text: 'It is heavier than it looks. Every page was written on a moving deck by lamplight. On the outer fold, in a small hand: Búshihr, and a date, and below it a column of tallies. Somewhere off Arabia he stopped counting days and began counting pages.',
    },
  },
};

/** The ship's boy, lashing everything down before the weather. */
export const shipBoy: DialogueTree = {
  id: 'ch3-ship-boy',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Ship\'s Boy',
      text: '(A boy of thirteen or so is lashing the sea chest to a ring-bolt, tongue between his teeth.) The captain says lash everything. Everything! The chest, the water jar, the pilgrims too, if they will let me.',
      choices: [
        { text: '"Where are you from?"', next: 'from' },
        { text: '"Let me hold the line."', next: 'hold' },
      ],
    },
    from: {
      speaker: 'The Ship\'s Boy',
      text: 'Búshihr. My father mends nets on the beach there. This is my first voyage to Jidda. I wanted to see the Red Sea. (He frowns at the swell.) So far it is the same colour as the other one.',
      choices: [{ text: '"What do they have you do on board?"', next: 'work' }],
    },
    hold: {
      speaker: 'The Ship\'s Boy',
      text: '(He hands you the end.) Pull. No, pull as if you mean it. Good. You are stronger than you look, for a scholar.',
      choices: [{ text: '"What do they have you do on board?"', next: 'work' }],
    },
    work: {
      speaker: 'The Ship\'s Boy',
      onEnter: { set: { ch3ShipBoy: true } },
      text: 'I fill the lamps, fetch water, and run wherever I am shouted at. This lamp I fill every evening. (He nods at the curtain.) The one in there, Mubárak fills himself. It has burned every night since Búshihr. I asked him how much oil one man can pray through. He laughed and gave me a date.',
      choices: [{ text: '"What do you make of it?"', next: 'end' }],
    },
    end: {
      speaker: 'The Ship\'s Boy',
      text: 'I think it is a great deal of oil. (He knots the last lashing and tugs it.) There. Now the sea can do what it likes.',
      choices: [{ text: '(Leave him to his work.)' }],
    },
  },
};

/** The ship's boy after the storm, sponging seawater out of the planking. */
export const shipBoyAfter: DialogueTree = {
  id: 'ch3-ship-boy-after',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'The Ship\'s Boy',
      text: '(He is on his knees, sponging seawater out of the planking into a bucket.) You were out there all night! I was in here holding the lamp chain so it would not smash. My arms are still shaking.',
      choices: [{ text: '"Were you afraid?"', next: 'afraid' }],
    },
    afraid: {
      speaker: 'The Ship\'s Boy',
      onEnter: { set: { ch3ShipBoyStorm: true } },
      text: 'Yes. Until the middle of the night. Then I could hear the reading through the curtain, under all the noise, and I thought: if He is not hurrying, I will not hurry either. (He wrings out the sponge.) Now help me with this bucket, scholar.',
      choices: [{ text: '(Take the other handle.)' }],
    },
  },
};

/** Quddús after the storm, making a fair copy under the swinging lamp. */
export const quddusCabin: DialogueTree = {
  id: 'ch3-quddus-cabin',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Quddús sits under the swinging lamp with a fresh sheet on his board, copying from pages puckered and stained with salt. He does not look up until he has finished the line.',
      choices: [{ text: '(Wait for him to finish the line.)', next: 'greet' }],
    },
    greet: {
      speaker: 'Quddús',
      text: 'You kept watch at the door all night; Mubárak told me. (He flexes his fingers.) I am making a fair copy of what was written in the storm. My hand shook, you see. The words did not shake. My hand did.',
      choices: [
        { text: '"Let me help."', next: 'help' },
        { text: '"How can you write while the ship rolls?"', next: 'roll' },
      ],
    },
    help: {
      speaker: 'Quddús',
      text: 'Then hold the lamp still when she rolls. (You steady the chain. For a while there is only the pen, the creak of the timbers, and the low voice beyond the curtain.)',
      choices: [{ text: '(Keep the light steady.)', next: 'end' }],
    },
    roll: {
      speaker: 'Quddús',
      text: 'The way a man walks on a deck: you stop fighting it. You lean when she leans. I think the soul learns to pray the same way.',
      choices: [{ text: '(Consider this.)', next: 'end' }],
    },
    end: {
      speaker: 'Quddús',
      onEnter: { set: { ch3FairCopy: true } },
      text: 'When we land, these pages go into my pack before my bread does. Go and rest, friend. The coast is near; the sailors say they can smell it.',
      choices: [{ text: '"Peace be with you."' }],
    },
  },
};

export const chapter03CabinDialogues: Record<string, DialogueTree> = {
  [cabinCurtain.id]: cabinCurtain,
  [cabinPages.id]: cabinPages,
  [shipBoy.id]: shipBoy,
  [shipBoyAfter.id]: shipBoyAfter,
  [quddusCabin.id]: quddusCabin,
};
