import type { ChapterStory } from './types';

export const chapter03Story: ChapterStory = {
  objectives: [
    {
      text: 'Find Quddús on the deck',
      done: f => !!f.ch3MetQuddus,
    },
    {
      text: 'Keep watch by the lamplit cabin door through the storm',
      done: f => !!f.ch3StormWeathered,
    },
    {
      text: 'Go ashore and find Quddús in the Sacred Mosque',
      done: f => !!f.ch3QuddusMecca,
    },
    {
      text: 'Stand near the door of the Kaʿba and hear what is proclaimed',
      done: f => !!f.ch3HeardProclamation,
    },
    {
      text: 'Seek out Mírzá Muḥíṭ-i-Kirmání, then find Quddús by the gate',
      done: f => !!f.meccaComplete,
    },
  ],
  journal: [
    {
      flag: 'ch3MetQuddus',
      title: 'Ink on His Fingers',
      body: 'Quddús, the youngest of the Letters, writes down the verses revealed in the stern cabin by day and night, whatever the weather. He knew his Beloved in a Shíráz street by His walk.',
    },
    {
      flag: 'ch3ReadVerses',
      title: 'Wet Lines',
      body: 'Quddús let you read the verses still wet on his board, and would not tell you what to find there.',
    },
    {
      flag: 'ch3CountedWater',
      title: 'Marks on the Cask',
      body: 'More than fifty knife-cuts on the water cask count the days since Búshihr. The water tastes of tar and is measured a cup each morning.',
    },
    {
      flag: 'ch3MubarakGalley',
      title: 'Half a Cup of Tea',
      body: 'Mubárak says his Master asks for nothing the other pilgrims lack, and sends the better cup to an old woman at the bow. Khadíjih-Bagum stood at the door in Shíráz until they turned the corner.',
    },
    {
      flag: 'ch3CaptainSpoke',
      title: 'The Helmsman\'s Name',
      body: 'In twenty years at sea, the captain says, no passenger before the young Siyyid in the stern cabin ever asked his helmsman\'s name.',
    },
    {
      flag: 'ch3SailorTalk',
      title: 'The Middle Watch',
      body: 'A sailor from Baḥrayn heard prayer from the stern cabin while he was up the mast at night, and forgot to be afraid of the height.',
    },
    {
      flag: 'ch3HeardAbulHasan',
      title: 'A Merchant\'s Scales',
      body: 'Ḥájí Abu\'l-Ḥasan of Shíráz has watched for weeks and never heard a sharp word from the young Siyyid. "I will be weighing this for the rest of my life."',
    },
    {
      flag: 'ch3WidowSpoke',
      title: 'A Clay Jar',
      body: 'A widow from Lár carries her dead son\'s savings to pour out at the House of God, making the pilgrimage he could not.',
    },
    {
      flag: 'ch3ShipBoy',
      title: 'Oil for the Lamp',
      body: 'The ship\'s boy fills every lamp aboard but one. Mubárak fills that one himself, and it has burned every night since Búshihr.',
    },
    {
      flag: 'ch3WeighedPages',
      title: 'Oilcloth',
      body: 'Quddús keeps the verses written on the voyage wrapped in oilcloth against the spray. Somewhere off Arabia he stopped counting days and began counting pages.',
    },
    {
      flag: 'ch3HonouredCurtain',
      title: 'The Curtain',
      body: 'In the companions\' cabin a curtain hangs before the inner room, slippers set side by side before it. You listened, and did not lift it.',
    },
    {
      flag: 'ch3StormWeathered',
      title: 'The Storm',
      body: 'Through the night of the storm you kept watch by the cabin door. The voice within never hurried, and the lamp never went out until the sun made it needless.',
    },
    {
      flag: 'ch3ShipBoyStorm',
      title: 'Not Hurrying',
      body: 'Through the storm the ship\'s boy held the cabin lamp\'s chain, and took heart from the reading beyond the curtain: if He was not hurrying, neither would he.',
    },
    {
      flag: 'ch3FairCopy',
      title: 'A Fair Copy',
      body: 'After the storm Quddús made a fair copy of the verses written that night. "The words did not shake. My hand did."',
    },
    {
      flag: 'ch3QuddusMecca',
      title: 'The Bridle',
      body: 'From Jidda to Mecca, Quddús walked every step holding the bridle of his Master\'s camel, refusing a mount of his own.',
    },
    {
      flag: 'ch3HeardSharif',
      title: 'A Letter Set Aside',
      body: 'Quddús carried a letter to the Sharíf of Mecca, who was busy with the affairs of the season and set it aside unopened.',
    },
    {
      flag: 'ch3HeardSacrifice',
      title: 'Nineteen Lambs',
      body: 'At Muná nineteen lambs were offered: nine in His own name, seven for Quddús, three for Mubárak. The meat was given to the poor.',
    },
    {
      flag: 'ch3Zamzam',
      title: 'Water of Zamzam',
      body: 'A Meccan water-seller remembered a young Siyyid who asked after his children, in a season when nobody in Mecca has time.',
    },
    {
      flag: 'ch3AskedPilgrim',
      title: 'A Pilgrim from Lucknow',
      body: 'Among a hundred thousand pilgrims, a man from Lucknow was praying for his sick daughter, and hardly heard what was said by the House.',
    },
    {
      flag: 'ch3HeardProclamation',
      title: 'By the Door of the House',
      body: 'Near the Kaʿba, the One you followed declared Himself the Qá\'im whose advent all were awaiting. The river of pilgrims flowed on; almost none of them heard.',
    },
    {
      flag: 'ch3MuhitChallenge',
      title: 'An Answer Deferred',
      body: 'Mírzá Muḥíṭ-i-Kirmání was challenged to submit or deny, and promised his answer at Medina. He never came to give it.',
    },
    {
      flag: 'meccaComplete',
      title: 'Toward Home',
      body: 'The pilgrims go on to Medina, then home by sea in the spring of 1845, toward a Shíráz where opposition is gathering.',
    },
  ],
};
