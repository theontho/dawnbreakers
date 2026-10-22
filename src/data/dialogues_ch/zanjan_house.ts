import type { DialogueTree } from '../../dialogue/types';

/**
 * Ḥujjat's house in the fort. Through the summer and autumn, his wife
 * Khadíjih and their infant son Hádí; at the end, the room the cannon-ball
 * opened to the sky, and Ḥujjat on his mattress through the nineteen days
 * of his wound. The chapter closes here: his death, his secret burial, the
 * fall of the quarter, and the regiment that would not go on (Nabíl,
 * chapter XXIV). The violence is told briefly and without spectacle.
 */

/** Khadíjih by the brazier, before the end. */
export const khadijih: DialogueTree = {
  id: 'zj-khadijih',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Khadíjih',
      text: 'Come in, and sit by the brazier. Hádí is asleep, so speak softly. (She draws the red quilt higher in the cradle.) My husband sent you up to me, I think. He sends me everyone he wants to see a little peace.',
      choices: [
        { text: '"He says the weddings were your doing."', next: 'jewels' },
        { text: '"Are you afraid?"', next: 'afraid' },
      ],
    },
    jewels: {
      speaker: 'Khadíjih',
      text: 'His doing, and my jewels. Some two hundred of our young men had never married, and he would not have them go to the barricades without a wedding. He sold everything I had to pay for the feasts. (She smiles.) I never wore anything as fine as those weddings.',
      choices: [{ text: '"Are you afraid?"', next: 'afraid' }],
    },
    afraid: {
      speaker: 'Khadíjih',
      onEnter: { set: { zjMetKhadijih: true } },
      text: 'Of the guns? Every day. (She looks at the cradle a long moment.) But I married a man who tells governors the truth to their faces. I knew what kind of house I was coming into. Go and tell him his son is sleeping.',
    },
  },
};

/** The cradle, before the end. */
export const cradle: DialogueTree = {
  id: 'zj-cradle',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A painted cradle on its rockers, a red quilt with yellow flowers. The baby sleeps with one small fist up by his face. Beside him the brazier ticks as its coals settle, and somewhere far off a gun fires, and he does not wake.',
    },
  },
};

/** The broken room: Khadíjih and Hádí. */
export const brokenRoom: DialogueTree = {
  id: 'zj-broken-room',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The east end of the room lies open to the sky. Snow sifts in over the fallen brick and onto the carpets. The cradle stands where it always stood. The quilt is gone.',
      choices: [{ text: '(Stand by the cradle.)', next: 'told' }],
    },
    told: {
      speaker: 'Narrator',
      text: 'After Ḥujjat was wounded, a cannon-ball struck the room where Khadíjih sat with Hádí in her arms, and she was killed at once. The child fell into the brazier beside her. They carried him to the house of a mujtahid of the town, and there, a little while after, he died.',
      choices: [{ text: '(Set your hand on the cradle.)', next: 'after' }],
    },
    after: {
      speaker: 'Narrator',
      onEnter: { set: { zjSawBrokenRoom: true } },
      text: 'Someone has set the cradle upright again, and swept the snow out of it. Across the room, Ḥujjat lies on his mattress against the wall, his eyes open, watching you.',
    },
  },
};

/** Ḥujjat on his mattress, before the player has seen the broken room. */
export const hujjatResting: DialogueTree = {
  id: 'zj-hujjat-resting',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Ḥujjat sleeps, or prays; it is hard to tell which. His right arm lies bound in white cloth over the quilt. Umm-i-Ashraf puts a finger to her lips, and looks toward the broken end of the room.',
    },
  },
};

/** Umm-i-Ashraf keeping Ḥujjat's house at the end. */
export const ummAshrafEnd: DialogueTree = {
  id: 'zj-umm-ashraf-end',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Umm-i-Ashraf',
      text: '(Ashraf is bound to her back in his sheepskin; she is warming broth over a few coals.) I keep his house now. There is no one else to keep it.',
      choices: [{ text: '"What happened, when he was hurt?"', next: 'gate' }],
    },
    gate: {
      speaker: 'Umm-i-Ashraf',
      text: 'When the word went round that he was wounded, the men left the walls, every one, and ran to him. The soldiers came in through the gate behind them. (She looks down at the coals.) They took a hundred of us, women and children, and left us out in the snow.',
      choices: [
        { text: '"And Mihr-ʿAlí?"', next: 'boy', requires: f => !!f.zjMetMihrAli },
        { text: '"How did you come back?"', next: 'back' },
      ],
    },
    boy: {
      speaker: 'Umm-i-Ashraf',
      text: 'I have not seen him since the gate fell. Pray for him. (A pause.) Pray for all the children.',
      choices: [{ text: '"How did you come back?"', next: 'back' }],
    },
    back: {
      speaker: 'Umm-i-Ashraf',
      onEnter: { set: { zjHeardUmmAshrafEnd: true } },
      text: 'Some of us were overlooked in the smoke, and God knows why I was one. The baby did not cry once. (She stirs the broth.) Sit with Ḥujjat. He asks after you.',
    },
  },
};

/** The last conversation, Ḥujjat's death and the fall of Zanján: completes the chapter. */
export const hujjatLast: DialogueTree = {
  id: 'zj-hujjat-last',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Ḥujjat',
      text: '(He turns his head on the bolster.) You came in with the news, in the summer. Now you have come for the end of it. Sit. (His voice is very quiet.)',
      choices: [{ text: '(Sit beside him.)', next: 'wound' }],
    },
    wound: {
      speaker: 'Ḥujjat',
      text: 'When the bullet struck, my family ran to me weeping, and I told them: rejoice, for I am still with you. (A pause.) I was with them a little while. Then God took her, and the boy. Everything He lent me, I have given back.',
      choices: [
        { text: '"Do you hold it against the men who fired?"', next: 'pardon' },
        { text: '"What should I carry from here?"', next: 'carry' },
      ],
    },
    pardon: {
      speaker: 'Ḥujjat',
      text: 'I asked God at the pool to pardon them, for they know not what they do. I have not taken it back. (He closes his eyes.) Hatred would be a heavier wound than this one.',
      choices: [{ text: '"What should I carry from here?"', next: 'carry' }],
    },
    carry: {
      speaker: 'Ḥujjat',
      text: 'What you saw. Not the guns: they have their own chroniclers. The bread and the water-skins, the weddings, the children walking out with the Book, the girl who cut her hair, the voice on the wall. Tell them we were not rebels. We were people who would not unsay the truth.',
      choices: [{ text: '(Stay with him.)', next: 'death' }],
    },
    death: {
      speaker: 'Narrator',
      text: 'For nineteen days he suffers from the wound. On the morning of the fifth of Rabíʿu\'l-Avval, in the depth of the winter, he dies prostrate in prayer, calling on the name of the Báb. Of all his companions, some two hundred are left.',
      choices: [{ text: '(Keep vigil.)', next: 'burial' }],
    },
    burial: {
      speaker: 'Narrator',
      text: 'At midnight two companions bury him in secret, in a room of a house in the quarter, and pull the room down over the grave so that no one will find it. In the end the governor will find it. But that night no one knows where he lies but God and those two men.',
      choices: [{ text: '(Go out into the quarter.)', next: 'fall' }],
    },
    fall: {
      speaker: 'Narrator',
      text: 'Then the last assault. Soldiers and townsmen plunder the quarter. The women are driven out into the snow; the men who are left are handed over to the regiments. Not one of them recants. Not one, it is said, speaks an angry word.',
      choices: [{ text: '(Listen.)', next: 'adhan' }],
    },
    adhan: {
      speaker: 'Narrator',
      text: 'As the soldiers make ready to kill the last of them, an old man, Ḥájí Muḥammad-Ḥusayn, rises and gives the call to prayer. The whole ʿIráqí regiment, hearing it, refuses to go on: never, they cry, though they all be slain, will they have a part in such deeds. They leave their posts.',
      choices: [
        { text: '(Remember the soldier among the ruins.)', next: 'soldier', requires: f => !!f.zjMetSoldier },
        { text: '(Bow your head.)', next: 'close' },
      ],
    },
    soldier: {
      speaker: 'Narrator',
      text: 'You think of a soldier who laid his musket on a fallen beam, and still stopped for the call to prayer when his sergeant laughed. You will never know whether he was among them. You hope so.',
      choices: [{ text: '(Bow your head.)', next: 'close' }],
    },
    close: {
      speaker: 'Narrator',
      onEnter: { set: { zanjanComplete: true } },
      text: 'Some eighteen hundred souls gave their lives in Zanján. The Báb had named the town the Ard-i-Aʿlá, the Exalted Land, a name joined for ever to His own. From Zanján the road runs east to Ṭihrán, where the dark has not yet reached its deepest.',
    },
  },
};

export const zanjanHouseDialogues: Record<string, DialogueTree> = {
  [khadijih.id]: khadijih,
  [cradle.id]: cradle,
  [brokenRoom.id]: brokenRoom,
  [hujjatResting.id]: hujjatResting,
  [ummAshrafEnd.id]: ummAshrafEnd,
  [hujjatLast.id]: hujjatLast,
};
