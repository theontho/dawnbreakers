import type { DialogueTree } from '../../dialogue/types';

/**
 * Chapter 8, inside the shrine of Shaykh Ṭabarsí (`Ch8TabarsiShrine`). The
 * tomb of the old scholar under its plain dome; its keeper, who dreamt of
 * the companions before they came; and an old man of Qazvín who coughs by
 * the west wall through the winter. The keeper's talk follows the fort's
 * three phases: building, winter, and hunger.
 */

/** The tomb itself. */
export const shrine: DialogueTree = {
  id: 'ch8-shrine',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The tomb of Shaykh Ṭabarsí, a scholar of long ago, under a plain dome. A green cloth covers it, faded almost to grey. Candle smoke has blackened the plaster above. The companions sleep in its shadow and pray at its head.',
      choices: [
        { text: '(Rest your hand on the tomb.)', next: 'touch' },
        { text: '(Think of Mullá Ḥusayn.)', next: 'near', requires: f => !!f.ch8MullaHusaynFell },
      ],
    },
    near: {
      speaker: 'Narrator',
      text: 'Quddús laid him to rest close beside the old Shaykh, under the turned earth against this wall. The scholar who wanted only quiet has a companion now who never once sat still.',
      choices: [{ text: '(Rest your hand on the tomb.)', next: 'touch' }],
    },
    touch: {
      speaker: 'Narrator',
      onEnter: { set: { ch8TouchedShrine: true } },
      text: 'The cloth is worn smooth by many hands. A man who lived and died in quiet now keeps three hundred guests, and an army at his gate. The dead are generous hosts.',
    },
  },
};

/** The keeper of the shrine in the first weeks, while the walls go up. */
export const keeperAutumn: DialogueTree = {
  id: 'ch8-keeper-autumn',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Keeper of the Shrine',
      text: '(An old man is sweeping candle ends from around the tomb.) Mind the step, friend. I have kept this tomb since I was a boy. Pilgrims came in ones and twos, lit a candle, and went home. I never expected three hundred.',
      choices: [
        { text: '"Who was Shaykh Ṭabarsí?"', next: 'shaykh' },
        { text: '"Did we frighten you, arriving like that?"', next: 'dream' },
      ],
    },
    shaykh: {
      speaker: 'Keeper of the Shrine',
      text: 'A man of learning, from long ago. He wrote books that no one in these villages can read. The woodcutters say his tomb keeps travellers from harm. (He glances at the wall rising outside the door.) We shall see.',
      choices: [{ text: '"Were you afraid when we came?"', next: 'dream' }],
    },
    dream: {
      speaker: 'Keeper of the Shrine',
      text: 'Afraid? The night before your company came, I dreamt that the Prince of Martyrs rode to this tomb with his faithful companions, and that they stood their ground here. In the morning I opened the door and saw a black banner between the trees.',
      choices: [{ text: '"What will you do?"', next: 'stay' }],
    },
    stay: {
      speaker: 'Keeper of the Shrine',
      onEnter: { set: { ch8HeardKeeperDream: true } },
      text: 'I swept the floor for them. What else does a keeper do? I told Mullá Ḥusayn my dream. He did not laugh. He only asked whether I would stay. (He leans on his broom.) I am staying.',
    },
  },
};

/** The keeper in winter: the night watch at the tomb, and the oil. */
export const keeperWinter: DialogueTree = {
  id: 'ch8-keeper-winter',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Keeper of the Shrine',
      text: 'Snow on the dome, and the lamps burning low. The men pray here in turns all night, so the tomb is never alone. At dawn they chant what Quddús wrote the night before. I cannot read, but I know some of it by heart now.',
      choices: [
        { text: '"Let me help you with the lamps."', next: 'lamps' },
        { text: '"Has anyone of note prayed here?"', next: 'visitor' },
      ],
    },
    visitor: {
      speaker: 'Keeper of the Shrine',
      text: 'In the autumn a nobleman of Núr stood in that doorway. Bahá\'u\'lláh, Mullá Ḥusayn told me afterward. He looked a long while at the tomb, and at the men asleep around it, and I heard nothing of what He said. But the men slept easier after.',
      choices: [{ text: '"Let me help you with the lamps."', next: 'lamps' }],
    },
    lamps: {
      speaker: 'Keeper of the Shrine',
      onEnter: { set: { ch8TrimmedLamps: true } },
      text: 'Trim the wick short, so. A long flame is a proud flame, and it drinks. (He shows you the jar.) I count the oil like a miser counts coins. When it is gone, the dark will be the same dark it was before we came.',
    },
  },
};

/** The keeper in the hungry months. */
export const keeperHunger: DialogueTree = {
  id: 'ch8-keeper-hunger',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Keeper of the Shrine',
      text: 'One wick left, for the Shaykh. The rest of the oil went into the pot with the grass. (He is thinner than his broom.) Quddús comes in at dusk and sits by the wall nearest where Mullá Ḥusayn lies, and speaks to him, low, as if through a door.',
      choices: [{ text: '"And you? Will you stay to the end?"', next: 'end' }],
    },
    end: {
      speaker: 'Keeper of the Shrine',
      onEnter: { set: { ch8KeeperLastLamp: true } },
      text: 'I dreamt they would stand their ground here, and they have. My dream did not say what came after. (He shields the little flame with his hand.) A keeper keeps. That is the whole of the trade.',
    },
  },
};

/** An old man from Qazvín, coughing by the west wall through the winter. */
export const qazviniElder: DialogueTree = {
  id: 'ch8-qazvini-elder',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Old Man of Qazvín',
      text: '(He coughs a long time before he can speak.) Forgive me. The damp of Mázindarán has found my chest and likes it there. Sit, if you do not mind an old man\'s noise.',
      choices: [
        { text: '"What brought you so far from Qazvín?"', next: 'qazvin' },
        { text: '"Riḍá told me he gave you bread."', next: 'bread', requires: f => !!f.ch8KeptWatch },
      ],
    },
    qazvin: {
      speaker: 'Old Man of Qazvín',
      text: 'After the murder of the mujtahid in our city, they blamed the friends of the new Cause, and hunted us street by street. I left my shop with the door open and the scales still on the counter. I did not want to be found holding a grudge.',
      choices: [{ text: '"And now you are here."', next: 'here' }],
    },
    bread: {
      speaker: 'Old Man of Qazvín',
      text: 'The dyer\'s boy. He swore he had eaten already, with his stomach growling loud enough to wake the guard. (He smiles.) It was his mother\'s bread. I could taste that someone had made it for someone they loved.',
      choices: [{ text: '"And how did you come here?"', next: 'qazvin' }],
    },
    here: {
      speaker: 'Old Man of Qazvín',
      onEnter: { set: { ch8MetQazviniElder: true } },
      text: 'Here, where a cough is the worst thing anyone can say of me. I am too old to set stones or dig. So I sit by the Shaykh and pray for the young ones on the wall. Someone must do the work that makes no noise.',
    },
  },
};

/** His place by the wall, in the spring. */
export const emptyBedroll: DialogueTree = {
  id: 'ch8-empty-bedroll',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A felt bedroll by the west wall, rolled tight, a cloak folded on top of it with care. The old man of Qazvín coughed here through the winter. No one has taken his place, though the floor is crowded.',
      choices: [{ text: '(Rest your hand on the cloak.)', next: 'cloak' }],
    },
    cloak: {
      speaker: 'Narrator',
      onEnter: { set: { ch8SawEmptyBedroll: true } },
      text: 'Someone has laid a sprig of green box on it, gathered under the walls at night with the grass. Even now, with nothing left to eat, the companions find something to give.',
    },
  },
};

export const chapter08ShrineDialogues: Record<string, DialogueTree> = {
  [shrine.id]: shrine,
  [keeperAutumn.id]: keeperAutumn,
  [keeperWinter.id]: keeperWinter,
  [keeperHunger.id]: keeperHunger,
  [qazviniElder.id]: qazviniElder,
  [emptyBedroll.id]: emptyBedroll,
};
