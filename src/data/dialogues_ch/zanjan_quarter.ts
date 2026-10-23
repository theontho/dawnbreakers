import type { DialogueTree } from '../../dialogue/types';

/**
 * Zanján, 1850: the barricaded quarter. The player comes in by night with
 * Siyyid Ḥasan, brother of the Báb's amanuensis, carrying the news of the
 * martyrdom in Tabríz (Nabíl, chapter XXIV). Mír Ṣaláḥ keeps the south
 * barricade; Zaynab, called Rustam-ʿAlí, the east; in the truce a soldier
 * of the ʿIráqí regiment comes out among the ruins.
 */

/** Siyyid Ḥasan in the orchards, before the way in. */
export const hasan: DialogueTree = {
  id: 'zj-hasan',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Siyyid Ḥasan',
      text: 'Keep your voice low. Those fires to the south are the royal army\'s. (He points through the orchard trees to a dark huddle of roofs.) That is Ḥujjat\'s quarter. They have held it since the spring.',
      choices: [
        { text: '"Who is Ḥujjat?"', next: 'who' },
        { text: '"How do we get in?"', next: 'in' },
      ],
    },
    who: {
      speaker: 'Siyyid Ḥasan',
      text: 'Mullá Muḥammad-ʿAlí of Zanján, a divine so learned and so plain-spoken that the mullás of the town feared him more than they loved him. When he believed, half his congregation believed with him. The Báb named him Ḥujjat: the Proof.',
      choices: [{ text: '"And now the governor besieges him."', next: 'siege' }],
    },
    siege: {
      speaker: 'Siyyid Ḥasan',
      text: 'The governor, and the mullás behind the governor, and now the Sháh\'s regiments behind them both. Some three thousand souls are in there, the women and children with the men.',
      choices: [{ text: '"How do we get in?"', next: 'in' }],
    },
    in: {
      speaker: 'Siyyid Ḥasan',
      text: 'Up this lane to the barricade. The sentinel there knows me. (He hesitates.) My brother Siyyid Ḥusayn wrote for the Báb to His last hour, and is a prisoner in Tabríz still. Now it falls to me to tell Ḥujjat what we both saw. Stay by me when I do.',
      choices: [
        { text: '"I spoke with your brother in Tabríz."', next: 'brother', requires: f => !!f.ch9HeardAmanuensis },
        { text: '"I will stay by you."', next: 'go' },
      ],
    },
    brother: {
      speaker: 'Siyyid Ḥasan',
      text: 'Then you have seen his hands shake. Mine shake the same way. (He grips your arm.) Come.',
      choices: [{ text: '(Follow him up the lane.)', next: 'go' }],
    },
    go: {
      speaker: 'Narrator',
      onEnter: { set: { zjMetHasan: true } },
      text: 'From somewhere ahead, high up, a man\'s voice cries out a name of God, and another answers it, and another, all along a line you cannot see. The soldiers\' fires do not answer.',
    },
  },
};

/** The sentinel, before Siyyid Ḥasan has spoken for the player. */
export const mirSalahHalt: DialogueTree = {
  id: 'zj-mir-salah-halt',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Sentinel',
      text: 'Stand where you are. (A lantern swings up into your face.) Nobody walks up to this barricade at night but the Amír\'s men and fools. Go back to whoever brought you, and let him speak for you.',
    },
  },
};

/** The sentinel lets the player and Siyyid Ḥasan through the sally gap. */
export const mirSalahGate: DialogueTree = {
  id: 'zj-mir-salah-gate',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Sentinel',
      text: 'Stand. (The lantern finds Siyyid Ḥasan\'s face, then yours.) Siyyid Ḥasan, by God! And who is this with you?',
      choices: [
        { text: '"A witness, come from Tabríz."', next: 'witness' },
        { text: '(Let Siyyid Ḥasan answer.)', next: 'hasan' },
      ],
    },
    witness: {
      speaker: 'Mír Ṣaláḥ',
      text: 'From Tabríz. (His face changes in the lantern light.) Then I think you carry what we have been dreading. Do not say it here, where the wind carries. Say it to Ḥujjat first. I am Mír Ṣaláḥ; this barricade is mine.',
      choices: [{ text: '(Wait while they open the gap.)', next: 'open' }],
    },
    hasan: {
      speaker: 'Siyyid Ḥasan',
      text: 'A friend who has walked with me all the way from Tabríz, Mír Ṣaláḥ. Let us through. What we carry is for Ḥujjat\'s ears before anyone\'s.',
      choices: [{ text: '(Wait while they open the gap.)', next: 'open' }],
    },
    open: {
      speaker: 'Narrator',
      onEnter: { set: { zjEnteredQuarter: true } },
      text: 'Mír Ṣaláḥ lowers his musket and steps back from the gap in the sacks. Beyond it a lane runs up between shuttered houses to a square, and beyond the square stands the dark wall of a fort, its gate lit by a single lamp. Siyyid Ḥasan goes ahead of you to find Ḥujjat within.',
    },
  },
};

/** Mír Ṣaláḥ in summer: how the town divided. */
export const mirSalah: DialogueTree = {
  id: 'zj-mir-salah',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mír Ṣaláḥ',
      text: 'Twenty-eight barricades, each kept by nineteen men, with nineteen more to watch at each. That is how Ḥujjat ordered it. We were dyers and porters and students in the spring. Now we are this.',
      choices: [
        { text: '"How did it begin?"', next: 'begin' },
        { text: '"Why did the town divide?"', next: 'crier' },
      ],
    },
    begin: {
      speaker: 'Mír Ṣaláḥ',
      text: 'With two children quarrelling in the street. The governor, Majdu\'d-Dawlih, threw the believer\'s child into prison for it, and Ḥujjat would not leave a child in prison. So the mullás told the governor to take Ḥujjat himself. They sent two wrestlers to drag him out. (He touches his belt.) I met them in the lane. They did not reach his door.',
      choices: [{ text: '"And then?"', next: 'crier' }],
    },
    crier: {
      speaker: 'Mír Ṣaláḥ',
      text: 'Then the governor sent a crier through the streets. Whoever would risk his life and his goods, let him go to Ḥujjat. Whoever would keep them, let him seek the protection of the Sháh. In one night Zanján became two towns. Fathers went one way and their sons the other.',
      choices: [{ text: '"And the fort?"', next: 'fort' }],
    },
    fort: {
      speaker: 'Mír Ṣaláḥ',
      onEnter: { set: { zjHeardDivision: true } },
      text: 'The fort of ʿAlí-Mardán Khán stood by our quarter. We asked the families living in it to leave, and gave them our own houses in exchange. Now our wives and children sleep behind its walls, and we sleep behind these sacks.',
    },
  },
};

/** Mír Ṣaláḥ in the truce, while the children are in the royal camp. */
export const mirSalahTruce: DialogueTree = {
  id: 'zj-mir-salah-truce',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mír Ṣaláḥ',
      text: 'The guns have been quiet since morning. Ḥujjat answered the Amír-Tumán\'s oath with children and old men. (Half a smile.) Who could quarrel with that answer? Only a man who meant to.',
      choices: [{ text: '"Is it safe to go out?"', next: 'out' }],
    },
    out: {
      speaker: 'Mír Ṣaláḥ',
      text: 'Safe is a word for another year. But there is a soldier out among the ruins who has laid his musket down and keeps calling for someone to talk to. Under a truce, you may go. Come back through the gap before the light goes.',
    },
  },
};

/** Mír Ṣaláḥ in winter: the crier from the royal lines. */
export const mirSalahWinter: DialogueTree = {
  id: 'zj-mir-salah-winter',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mír Ṣaláḥ',
      text: 'Warm your hands, and listen. (He nods toward the royal lines, where a voice is calling across the snow.)',
      choices: [{ text: '(Listen.)', next: 'crier' }],
    },
    crier: {
      speaker: 'Narrator',
      text: 'The crier\'s voice carries thin and clear: the governor and the commander will forgive any who leaves the fort and renounces his faith, and grant him safe passage, and the Sháh will reward him richly.',
      choices: [{ text: '"How many have gone over to him?"', next: 'none' }],
    },
    none: {
      speaker: 'Mír Ṣaláḥ',
      onEnter: { set: { zjHeardCrier: true } },
      text: 'He calls every night now. Count them for me, if you can: I cannot find one. Not after the news from Tabríz, and not before it. (He holds his hands to the coals.) Hunger has not done it, nor the cold. A crier will not.',
    },
  },
};

/** Zaynab of the villages, in men's clothes at the east barricade. */
export const zaynab: DialogueTree = {
  id: 'zj-zaynab',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Youth at the Barricade',
      text: 'Keep your head below the sacks. Their marksmen have the eyes of hawks. (A beardless face under cropped hair, a man\'s coat with the sleeves rolled up.) You are the one who came in with Siyyid Ḥasan.',
      choices: [
        { text: '"What is your name?"', next: 'name' },
        { text: '"You look very young to keep a barricade."', next: 'young' },
      ],
    },
    young: {
      speaker: 'A Youth at the Barricade',
      text: 'Younger than you think, and not what you think either. (A small, fierce smile.) Ask me my name.',
      choices: [{ text: '"What is your name?"', next: 'name' }],
    },
    name: {
      speaker: 'A Youth at the Barricade',
      text: 'Rustam-ʿAlí. Ḥujjat gave me that name. Before it I had another, and wore other clothes. I am Zaynab, from a hamlet outside the town. When the fighting began I cut off my hair and put on a man\'s coat and came here.',
      choices: [{ text: '"Did Ḥujjat know?"', next: 'knew' }],
    },
    knew: {
      speaker: 'Zaynab',
      text: 'He saw me from a turret and knew me at once. He sent for me and asked why I had come out like this. I told him I was afraid he would deny me the right to stand with my men companions. (She looks east, toward the fires.) He did not deny me. He named me for Rustam.',
      choices: [{ text: '"What do you ask of God, out here?"', next: 'ask' }],
    },
    ask: {
      speaker: 'Zaynab',
      onEnter: { set: { zjMetZaynab: true } },
      text: 'Only to keep my place until my Master calls me from it. When they come over the ruins I cry "Yá Ṣáḥibu\'z-Zamán!" and they hear a voice they cannot place. (She laughs softly.) Go on, now. You are making the sacks nervous.',
    },
  },
};

/** The lamp where Zaynab kept watch, after she fell. */
export const zaynabPlace: DialogueTree = {
  id: 'zj-zaynab-place',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'A small clay lamp burns in a hollow pressed into the sacks, where the youth called Rustam-ʿAlí kept watch. The sentinel there now is a grey-bearded dyer who will not meet your eyes.',
      choices: [{ text: '(Ask him what became of her.)', next: 'fell' }],
    },
    fell: {
      speaker: 'Narrator',
      text: 'Five months she kept the barricades. Near the end she went to Ḥujjat and asked him to forgive her trespasses and to pray for her, for she felt her life was nearly done. In a charge over the ruins she fell beneath a shower of shot.',
      choices: [{ text: '(Kneel by the lamp.)', next: 'after' }],
    },
    after: {
      speaker: 'Narrator',
      onEnter: { set: { zjMournedZaynab: true } },
      text: 'Near the end the soldiers learned that Rustam-ʿAlí was a village girl, and feared her still. Afterwards, the dyer says, twenty women who had known her came to the Faith. Someone fills this lamp every night. He does not say who.',
    },
  },
};

/** A soldier of the ʿIráqí regiment among the ruins, during the truce. */
export const soldier: DialogueTree = {
  id: 'zj-soldier',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Soldier of ʿIráq',
      text: 'Peace, if peace is the word today. (He has laid his musket on a fallen beam, well out of reach.) I am of the ʿIráqí regiment. They tell us the Sháh has ended the war, and that you will all come out on the Amír-Tumán\'s oath.',
      choices: [
        { text: '"Do you believe it?"', next: 'believe' },
        { text: '"Why come out here to us?"', next: 'why' },
      ],
    },
    believe: {
      speaker: 'A Soldier of ʿIráq',
      text: 'I believe a Qur\'án is a Qur\'án. (He looks at the ground.) I also saw the Amír-Tumán\'s face this morning, when your children came into the camp with the Book held up before them. It was not the face of a man who has made peace.',
      choices: [{ text: '"Why come out here to us?"', next: 'why' }],
    },
    why: {
      speaker: 'A Soldier of ʿIráq',
      text: 'Because every dawn I hear your muezzin from the wall, and he has a better voice than any in our camp. In my village, when the call to prayer came, my father set down whatever he held. I still stop. My sergeant laughs at me.',
      choices: [{ text: '"Then keep stopping, whatever comes."', next: 'end' }],
    },
    end: {
      speaker: 'A Soldier of ʿIráq',
      onEnter: { set: { zjMetSoldier: true } },
      text: '(He picks the musket up again, slowly, as if it had grown heavier.) I will. Go back in, now. A truce lasts as long as the Amír\'s patience, and he is not a patient man.',
    },
  },
};

export const zanjanQuarterDialogues: Record<string, DialogueTree> = {
  [hasan.id]: hasan,
  [mirSalahHalt.id]: mirSalahHalt,
  [mirSalahGate.id]: mirSalahGate,
  [mirSalah.id]: mirSalah,
  [mirSalahTruce.id]: mirSalahTruce,
  [mirSalahWinter.id]: mirSalahWinter,
  [zaynab.id]: zaynab,
  [zaynabPlace.id]: zaynabPlace,
  [soldier.id]: soldier,
};
