import type { DialogueTree } from '../../dialogue/types';

/**
 * Bárfurúsh, the Sabzih-Maydán (Nabíl, EN ch. XIX): Mullá Ḥusayn rides
 * three times round the Saʿídu'l-ʿUlamá's house and calls him out, then
 * asks the town why it has risen; no bread is sold and no water given, and
 * the companions are shut in the caravanserai. The townsman who went out
 * with a club; the evening, when the square is empty; and at dawn Khusraw
 * of Qádí-Kalá with his hundred horsemen.
 */

/** Mullá Ḥusayn at the Saʿídu'l-ʿUlamá's gate, and his words to the town. */
export const mullaHusaynHouse: DialogueTree = {
  id: 'bf-mh-house',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'Mullá Ḥusayn has ridden three times round the house of the Saʿídu\'l-ʿUlamá. Its gate stays shut. The square fills behind him with the same men who were on the road, without their clubs now.',
      choices: [{ text: '(Come up beside his stirrup.)', next: 'call' }],
    },
    call: {
      speaker: 'Mullá Ḥusayn',
      text: '(He calls to the shut gate.) You who preached holy war from the pulpit, come out and lead it! The one who calls men to fight goes out in front of them. Why do you sit behind your walls?',
      choices: [{ text: '(Wait.)', next: 'silence' }],
    },
    silence: {
      speaker: 'Narrator',
      text: 'No one comes to the gate. Behind you someone cries out for peace, and then many voices together: peace, peace. Mullá Ḥusayn turns his horse to face them.',
      choices: [{ text: '(Listen.)', next: 'why' }],
    },
    why: {
      speaker: 'Mullá Ḥusayn',
      text: 'People of Bárfurúsh, why have you risen against us? Why do you count it a merit before God to shed our blood? Have we ever once denied the Faith you hold?',
      choices: [{ text: '(Listen.)', next: 'scratch' }],
    },
    scratch: {
      speaker: 'Mullá Ḥusayn',
      text: 'You fired on me with all your muskets, and I came through it with a sword alone and nothing worse than this. (He touches a scratch on his cheek.) God kept me. And He will yet make His Cause plain to you.',
      choices: [{ text: '(Stand with him.)', next: 'after' }],
    },
    after: {
      speaker: 'Narrator',
      onEnter: { set: { bfHeardAddress: true } },
      text: 'At last he gets down from his horse. The caravanserai on the north side of the square will lodge them, he says, and the companions lead their horses in under its arch.',
    },
  },
};

/** The Saʿídu'l-ʿUlamá's gate, which does not open. */
export const clericGate: DialogueTree = {
  id: 'bf-cleric-gate',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      onEnter: { set: { bfSawClericGate: true } },
      text: 'The gate of the Saʿídu\'l-ʿUlamá\'s house: studded, barred, the lamp above it unlit. Somewhere behind it is the man who threw down his turban in the masjid last night. He was called out to lead what he preached, and he does not come out.',
    },
  },
};

/** Mullá Ḥusayn at the serai gate, sending the player for bread and water. */
export const mullaHusaynErrand: DialogueTree = {
  id: 'bf-mh-errand',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn',
      text: 'No one here has eaten since before dawn, and the horses have not drunk. Go and see whether the baker will sell to us, and whether we may draw at the cistern. Ask them their price.',
    },
  },
};

/** The report: no bread, no water; the gates are shut until sunset. */
export const mullaHusaynReport: DialogueTree = {
  id: 'bf-mh-report',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Mullá Ḥusayn',
      text: 'Well?',
      choices: [{ text: '"The baker will not sell, and they will not let us near the water."', next: 'decree' }],
    },
    decree: {
      speaker: 'Mullá Ḥusayn',
      text: '(He is quiet a moment.) Then we will rest in what God has decreed for us. Bring everyone inside. Shut the gates, and wait with me until the sun goes down.',
      choices: [{ text: '(Go in with him.)', next: 'shut' }],
    },
    shut: {
      speaker: 'Narrator',
      onEnter: { set: { bfGatesShut: true } },
      text: 'The companions lead the last horses in under the arch, and the doors stand ready to swing to behind you. The square goes quiet in a way you do not like, and you hear feet on the roofs across it.',
    },
  },
};

/** The baker, before Mullá Ḥusayn has spoken to the town. */
export const bakerShut: DialogueTree = {
  id: 'bf-baker-shut',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Baker',
      text: '(He is pulling the shutter down over his oven.) Not today. Today nobody in this town bakes.',
    },
  },
};

export const baker: DialogueTree = {
  id: 'bf-baker',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Baker',
      text: 'Bread? (He does not look at you.) There is none. There is flour, and there is fire, and there is none.',
      choices: [{ text: '"We will pay whatever you ask."', next: 'price' }],
    },
    price: {
      speaker: 'A Baker',
      text: 'It is not the price. (He lowers his voice.) Last night, from the pulpit: whoever sells to them sells to the enemies of God. My children have to live in this town after you are gone.',
      choices: [{ text: '"I understand."', next: 'shutter' }],
    },
    shutter: {
      speaker: 'Narrator',
      onEnter: { set: { bfAskedBread: true } },
      text: 'He pulls the shutter halfway down and stops, and looks for a long time at the loaves on the rack behind him. Then he pulls it all the way down.',
    },
  },
};

/** The water-carrier at the cistern, before Mullá Ḥusayn has spoken to the town. */
export const waterEarly: DialogueTree = {
  id: 'bf-water-early',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Water-Carrier',
      text: 'Mind the skin, it is full. No, it is not for sale. Not today.',
    },
  },
};

export const water: DialogueTree = {
  id: 'bf-water',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Water-Carrier',
      text: '(Two men with clubs sit on the lip of the cistern and watch you come.) Water? You can see who is sitting on it. All my life I carry for anyone who pays: Jew, Armenian, dervish. Today they say I carry for no one in that caravanserai.',
      choices: [{ text: '"Not even for the horses?"', next: 'horses' }],
    },
    horses: {
      speaker: 'A Water-Carrier',
      onEnter: { set: { bfAskedWater: true } },
      text: 'Not even for the horses. (He looks at the ground.) May God forgive this town. I hope He has more patience with it than I have.',
    },
  },
};

/** A townsman who went out on the road with a club, in the square by day. */
export const townsman: DialogueTree = {
  id: 'bf-townsman',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Townsman of Bárfurúsh',
      text: '(A man in a rice-farmer\'s waistcoat, a club still in his belt.) Do not look at me like that. I did not throw anything. I only went out because everyone went out.',
      choices: [
        { text: '"Why did everyone go out?"', next: 'sermon' },
        { text: '"And the club?"', next: 'club' },
      ],
    },
    club: {
      speaker: 'A Townsman of Bárfurúsh',
      text: '(He pulls it out of his belt and looks at it as if someone else had put it there.) For snakes in the paddies. Today it was for you, they said.',
      choices: [{ text: '"Who said?"', next: 'sermon' }],
    },
    sermon: {
      speaker: 'A Townsman of Bárfurúsh',
      text: 'Last night the Saʿídu\'l-ʿUlamá threw his turban on the floor of the masjid and tore his shirt. He said your leader once sat in his lessons and looked down his nose at him. He said you were coming to tear down all we hold holy, and whoever went out against you went out for God.',
      choices: [{ text: '"And now?"', next: 'now' }],
    },
    now: {
      speaker: 'A Townsman of Bárfurúsh',
      onEnter: { set: { bfHeardSermon: true } },
      text: 'Now I have seen your man ride at that tree. (He lets the club fall in the dust and does not pick it up.) I have cut trees all my life. I am going home.',
    },
  },
};

/** The same townsman in the evening, after the three calls from the roof. */
export const townsmanEvening: DialogueTree = {
  id: 'bf-townsman-evening',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'A Townsman of Bárfurúsh',
      text: '(He is sitting on his doorstep in the dark.) I heard it from my roof. The call to prayer, three times, and three times it stopped in the middle. My father used to say the call is the one thing in this town that everybody agrees on.',
      choices: [{ text: '"They were young. Younger than me."', next: 'young' }],
    },
    young: {
      speaker: 'A Townsman of Bárfurúsh',
      onEnter: { set: { bfHeardTownsmanEvening: true } },
      text: 'I know. (He gets up.) Go back inside. The Kháns have gone across the square to your gate on foot, with a Qur\'án under a cloth, and they will be speaking very sweetly.',
    },
  },
};

/** Dawn: Khusraw of Qádí-Kalá and the escort in the square. */
export const khusrawSquare: DialogueTree = {
  id: 'bf-khusraw-square',
  startId: 'g',
  nodes: {
    g: {
      speaker: 'Narrator',
      text: 'In the grey of the morning a hundred horsemen wait in the square, and at their head a broad man on a bay horse: Khusraw of Qádí-Kalá, whom the Kháns swore would see you safe through Shír-Gáh. ʿAbbás-Qulí Khán stands at his stirrup, telling him to treat his guests well.',
      choices: [{ text: '(Go nearer.)', next: 'khusraw' }],
    },
    khusraw: {
      speaker: 'Khusraw of Qádí-Kalá',
      text: 'Well, scholars, did you sleep? (He smiles with half his mouth.) The Khán says I am to guard you like my own eyes. I will, I will. My men know every path in these woods.',
      choices: [{ text: '(Look at Mullá Ḥusayn.)', next: 'verse' }],
    },
    verse: {
      speaker: 'Narrator',
      onEnter: { set: { bfMetKhusraw: true } },
      text: 'Mullá Ḥusayn rides up beside him and looks at him a long moment. Then he recites from the Qur\'án, quietly, as if to himself: whoso does good, does it for his own soul; and whoso does evil, does it against himself. Khusraw laughs, and turns his horse toward the road out of town.',
    },
  },
};

export const barfurushMaydanDialogues: Record<string, DialogueTree> = {
  [mullaHusaynHouse.id]: mullaHusaynHouse,
  [clericGate.id]: clericGate,
  [mullaHusaynErrand.id]: mullaHusaynErrand,
  [mullaHusaynReport.id]: mullaHusaynReport,
  [bakerShut.id]: bakerShut,
  [baker.id]: baker,
  [waterEarly.id]: waterEarly,
  [water.id]: water,
  [townsman.id]: townsman,
  [townsmanEvening.id]: townsmanEvening,
  [khusrawSquare.id]: khusrawSquare,
};
