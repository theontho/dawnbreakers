import type { DialogueTree, FlagState } from '../../dialogue/types';

/**
 * Ṭihrán, August 1852, in the days after two misguided Bábís fired on
 * Náṣiri'd-Dín Sháh at Níyávarán. Bahá'u'lláh has been led in chains from
 * the royal camp to the Síyáh-Chál; He is never a speaker here, only the
 * subject of the street's testimony. The player gathers what the quarter
 * says, then asks to go down to the prisoners and is chained.
 */

const STREET_TESTIMONY_FLAGS = [
  'ch10HeardAttempt',
  'ch10HeardProcession',
  'ch10MetZahra',
  'heardStreetAccusation',
  'ch10SawPlunder',
] as const;

/** How many of the street's testimonies the player has heard. */
export function streetTestimonyCount(flags: FlagState): number {
  return STREET_TESTIMONY_FLAGS.filter(flag => !!flags[flag]).length;
}

/** A draper of the prison quarter, shuttering his shop in August. */
export const ch10Shopkeeper: DialogueTree = {
  id: 'ch10-shopkeeper',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Shopkeeper',
      text: 'Forgive me, the shop is shut. Every shop on this row is shut. Have you not heard? At Níyávarán, two young men fired upon the Sháh with a pistol charged with birdshot. Birdshot! He was hardly scratched.',
      choices: [
        { text: '"Who were they?"', next: 'who' },
        { text: '"And what does the city do now?"', next: 'city' },
      ],
    },
    who: {
      speaker: 'A Shopkeeper',
      text: 'Bábís, the criers say. Young men half mad with grief since the Báb was shot at Tabríz. One was cut down where he stood. Whatever they meant, they have handed every Bábí in Persia to the executioner.',
      choices: [{ text: '"And what does the city do now?"', next: 'city' }],
    },
    city: {
      speaker: 'A Shopkeeper',
      text: 'The court has gone mad with fear, and fear wants names. I sold cloth to one of them last month. Should I have asked his creed before I measured his length?',
      choices: [
        { text: '"Which houses have they taken?"', next: 'houses' },
        { text: '"Shut your shop, then. I do not blame you."', next: 'blame' },
      ],
    },
    houses: {
      speaker: 'A Shopkeeper',
      onEnter: { set: { ch10HeardAttempt: true } },
      text: 'Many. Even a nobleman of Núr, Mírzá Ḥusayn-ʿAlí, who was the Grand Vizier\'s guest in the mountains when it happened. When He heard He was accused, He rode to the royal camp of His own accord. Who rides to his own accusers?',
      choices: [{ text: '"Someone with nothing to hide."' }],
    },
    blame: {
      speaker: 'A Shopkeeper',
      onEnter: { set: { ch10HeardAttempt: true } },
      text: 'You should. I blame myself. My father kept this shop open through the cholera. I am keeping it shut through a rumour.',
    },
  },
};

/** The same draper in December, after the player is released. */
export const ch10ShopkeeperWinter: DialogueTree = {
  id: 'ch10-shopkeeper-winter',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Shopkeeper',
      text: 'You! They let you up? Sit, sit, you look like a ghost of yourself. I opened again a month ago. The Sháh lives, and the criers have found new things to cry.',
      choices: [
        { text: '"Did you hear the singing, these nights?"', next: 'song' },
        { text: '"What did the bazaar see, while I was below?"', next: 'bazaar' },
      ],
    },
    song: {
      speaker: 'A Shopkeeper',
      onEnter: { set: { ch10ShopkeeperAnswers: true } },
      text: 'When the wind is right, the whole quarter hears it. One row calls and the other answers. I have caught myself, God forgive me, answering under my breath while I fold the cloth.',
      choices: [{ text: '"And the bazaar, while I was below?"', next: 'bazaar' }, { text: '(Leave him to his cloth.)' }],
    },
    bazaar: {
      speaker: 'A Shopkeeper',
      text: 'Sulaymán Khán came past this shop. An officer\'s son, once of the court. They had cut his flesh and set lit candles in the wounds, and drums went in front of him. (He smooths a bolt of cloth that is already smooth.)',
      choices: [{ text: '"How did he go?"', next: 'bridegroom' }],
    },
    bridegroom: {
      speaker: 'A Shopkeeper',
      onEnter: { set: { ch10SawSulaymanPass: true } },
      text: 'Dancing. Reciting the old poets, as a bridegroom walks to his wedding. The crowd that came to jeer went quiet before he reached the corner. I shut my shutter, and I have not stopped seeing it.',
    },
  },
};

/** An old water-seller who saw the procession from Shimírán. */
export const ch10WaterSeller: DialogueTree = {
  id: 'ch10-water-seller',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Water-Seller',
      text: 'Water, friend? Cool from the Shimírán channels. I sold none yesterday. A man does not drink while he is watching what I watched.',
      choices: [{ text: '"What did you watch?"', next: 'road' }],
    },
    road: {
      speaker: 'A Water-Seller',
      text: 'They brought a nobleman down the Shimírán road from the royal camp. On foot, in the noon sun, barefoot, in chains. A rider had snatched the hat from His head. The crowd threw what it had: stones, filth, curses.',
      choices: [
        { text: '"Who was He?"', next: 'who' },
        { text: '"Did no one stop them?"', next: 'woman' },
      ],
    },
    who: {
      speaker: 'A Water-Seller',
      text: 'Mírzá Ḥusayn-ʿAlí, son of the old Vazír of Núr. I filled His household\'s jars for ten years. The poor of this quarter called Him their father. Yesterday the poor threw stones.',
      choices: [{ text: '"Did no one stop them?"', next: 'woman' }],
    },
    woman: {
      speaker: 'A Water-Seller',
      text: 'An old woman pushed through with a stone in her fist, crying that she must strike Him for God\'s sake. The guards moved to thrust her back. And He asked them, they say, to let her be. She thought it a deed of merit, and He would not have her disappointed.',
      choices: [{ text: '(Say nothing for a long moment.)', next: 'after' }],
    },
    after: {
      speaker: 'A Water-Seller',
      onEnter: { set: { ch10HeardProcession: true } },
      text: 'I gave Him no water. The guards would not let me near. Forty years I have carried this skin through Ṭihrán, and I keep thinking of the one cup I did not pour.',
    },
  },
};

/** Zahrá, waiting near the prison stair with bread for her brother. */
export const ch10WaitingSister: DialogueTree = {
  id: 'ch10-waiting-sister',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Zahrá',
      text: 'Are you going toward the stair? Please, do not look at me as the guards do. I only wait.',
      choices: [
        { text: '"Who are you waiting for?"', next: 'who' },
        { text: '"You should go home. It is not safe here."', next: 'home' },
      ],
    },
    who: {
      speaker: 'Zahrá',
      text: 'My brother Riḍá. Nineteen. He went to hear the Bábís talk of justice and came home shining. Three days ago the farráshes came for him. He is down there, and they will not take my bread.',
      choices: [{ text: '"Are there others who wait?"', next: 'household' }],
    },
    home: {
      speaker: 'Zahrá',
      text: 'Home? Our door has a chalk mark on it now. I am safer here in plain sight than there behind a mark. And Riḍá is here.',
      choices: [{ text: '"Riḍá?"', next: 'who' }],
    },
    household: {
      speaker: 'Zahrá',
      onEnter: { set: { ch10MetZahra: true } },
      text: 'A lady comes, veiled, with a boy of eight. The wife of the nobleman they dragged from Shimírán. Her house was plundered to the walls. They say she sold the gold buttons off her own robe to buy her children bread.',
      choices: [
        { text: '"Give me the bread. If I go down, I will find your brother."', next: 'bread',
          requires: f => !f.ch10CarriedBread },
        { text: '"I carry it still. I will find him."', requires: f => !!f.ch10CarriedBread },
        { text: '"I cannot promise you anything."', next: 'nopromise', requires: f => !f.ch10CarriedBread },
      ],
    },
    bread: {
      speaker: 'Zahrá',
      onEnter: { set: { ch10CarriedBread: true } },
      text: 'It is only bread, and a little cheese folded in the cloth. Tell him nothing. He will know whose hands baked it.',
    },
    nopromise: {
      speaker: 'Zahrá',
      text: 'No one can, this week. Go with God. If you change your mind, I will be here. I am always here.',
    },
  },
};

/** The frightened crowd that gathers and scatters along the street. */
export const ch10Whispers: DialogueTree = {
  id: 'ch10-whispers',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Voice in the Crowd',
      text: 'They say the Bábís meant to burn the city. They say a hundred of them hide in this very quarter. Who says? Everybody says.',
      choices: [
        { text: '"Have any of you ever met one?"', next: 'met' },
        { text: '(Listen without answering.)', next: 'listen' },
      ],
    },
    met: {
      speaker: 'A Voice in the Crowd',
      onEnter: { set: { heardStreetAccusation: true } },
      text: 'I bought bread from one. He gave good weight and asked after my mother. That proves nothing, I suppose. Hush now, a patrol. Do you want the farráshes at all our doors?',
    },
    listen: {
      speaker: 'Narrator',
      onEnter: { set: { heardStreetAccusation: true } },
      text: 'The whispers circle like flies over a wound and settle nowhere. Fear in Ṭihrán this week has no face of its own. It borrows whatever face is nearest.',
    },
  },
};

/** The broken door of a plundered Bábí household. */
export const ch10PlunderedHouse: DialogueTree = {
  id: 'ch10-plundered-house',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'The door hangs from one hinge. Within, a courtyard stripped to the tiles, a pool with its fish gone, pale squares on the walls where carpets hung. A child\'s slipper lies in the dust of the lane.',
      choices: [
        { text: '(Pick up the slipper and set it on the step.)', next: 'step' },
        { text: '(Turn away.)', next: 'away' },
      ],
    },
    step: {
      speaker: 'Narrator',
      onEnter: { set: { ch10SawPlunder: true } },
      text: 'It is a small thing to do. You do it anyway. In such a week, one small thing set straight is a kind of prayer.',
    },
    away: {
      speaker: 'Narrator',
      onEnter: { set: { ch10SawPlunder: true } },
      text: 'You turn away, but the shape of the empty courtyard follows you down the street.',
    },
  },
};

/** The guard at the prison stair before the player has listened to the street. */
export const ch10GuardTurnaway: DialogueTree = {
  id: 'ch10-guard-turnaway',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Guard',
      text: 'Keep moving. Ṭihrán has filled its alleys with accusation, and the pit below this stair has room for every rumour. If you must ask questions, ask them in the street, not here.',
    },
  },
};

/** The guard at the stair: the player asks to go down, and is chained. */
export const ch10Guard: DialogueTree = {
  id: 'ch10-guard',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Guard',
      text: 'This stair goes down three flights to the Síyáh-Chál. It was a cistern for the public bath once. Now it holds a hundred and fifty men and no air.',
      choices: [
        { text: '"What crime has been proved against them?"', next: 'proved' },
        { text: '"I want to go down to them."', next: 'down' },
      ],
    },
    proved: {
      speaker: 'Guard',
      text: 'Proof? In such days fear calls itself proof. Thieves, cutthroats, and Bábís, all in one darkness. I repeat orders. I do not weigh souls.',
      choices: [{ text: '"Then I want to go down to them."', next: 'down' }],
    },
    down: {
      speaker: 'Guard',
      text: 'Only the chained go down that stair. Are you their kin? Their creditor? Go home.',
      choices: [
        { text: '"I am one of them, since a night in Shíráz eight years ago. Chain me."', next: 'arrest',
          requires: f => f.recognised === true },
        { text: '"I have not yet named myself theirs. But I kept watch at the door where it began, and I will not stand on this side of the stair."',
          next: 'arrest', requires: f => f.recognised !== true },
        { text: '(Not yet. Step back into the street.)' },
      ],
    },
    arrest: {
      speaker: 'Guard',
      text: 'He looks at you for a long time. "Then God help you, for the Sháh will not. Farrásh! Bring the irons."',
      choices: [{ text: '(Hold out your hands.)', next: 'irons' }],
    },
    irons: {
      speaker: 'Narrator',
      onEnter: { set: { ch10Arrested: true } },
      text: 'They are not gentle, and they are not slow. The iron closes cold about your neck. Behind you Zahrá makes a small sound. Someone pushes you toward the stair and its dark, which smells of wet stone and too many men.',
    },
  },
};

export const chapter10StreetDialogues: Record<string, DialogueTree> = {
  [ch10Shopkeeper.id]: ch10Shopkeeper,
  [ch10ShopkeeperWinter.id]: ch10ShopkeeperWinter,
  [ch10WaterSeller.id]: ch10WaterSeller,
  [ch10WaitingSister.id]: ch10WaitingSister,
  [ch10Whispers.id]: ch10Whispers,
  [ch10PlunderedHouse.id]: ch10PlunderedHouse,
  [ch10GuardTurnaway.id]: ch10GuardTurnaway,
  [ch10Guard.id]: ch10Guard,
};
