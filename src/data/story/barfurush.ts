import { ERRANDS, errandsDone } from '../maps/barfurushPhases';
import type { ChapterStory } from './types';

export const barfurushStory: ChapterStory = {
  objectives: [
    {
      text: 'Hear Mullá Ḥusayn after the dawn prayer, and do as he bids',
      done: f => !!f.bfCastAway,
    },
    {
      text: 'Walk on toward Bárfurúsh behind the Standard',
      done: f => !!f.bfClash,
    },
    {
      text: 'Kneel by the siyyid of Yazd where he fell',
      done: f => !!f.bfMournedYazdi,
    },
    {
      text: 'Follow Mullá Ḥusayn into the Sabzih-Maydán',
      done: f => !!f.bfHeardAddress,
    },
    {
      text: 'Ask after bread and water in the square, and bring word to Mullá Ḥusayn',
      done: f => !!f.bfGatesShut,
      progress: f => ({ current: errandsDone(f), total: ERRANDS.length }),
    },
    {
      text: 'Wait in the caravanserai until sunset, and hold the ladder',
      done: f => !!f.bfThirdFell,
    },
    {
      text: 'Hear what the Kháns of the town have come to say',
      done: f => !!f.bfOathSworn,
    },
    {
      text: 'Go out at dawn to the escort waiting in the square',
      done: f => !!f.bfMetKhusraw,
    },
    {
      text: 'Ride behind the escort toward Shír-Gáh',
      done: f => !!f.bfAmbush,
    },
    {
      text: 'Stay by Mullá Ḥusayn while he prays',
      done: f => !!f.bfKhusrawDead,
    },
    {
      text: 'See Khusraw\'s attendant on his way, then keep the night by the fire',
      done: f => !!f.bfSlept,
    },
    {
      text: 'At first light, go with Mullá Ḥusayn',
      done: f => !!f.barfurushComplete,
    },
  ],
  journal: [
    {
      flag: 'bfOpened',
      title: 'The Sermon in Bárfurúsh',
      body: 'On the night before the companions reached Bárfurúsh, its chief mujtahid, the Saʿídu\'l-ʿUlamá, threw down his turban in the masjid, tore his shirt, and called the town out to meet them at dawn.',
    },
    {
      flag: 'bfMetMajid',
      title: 'Turquoise of Nishápúr',
      body: 'Ḥájí ʿAbdu\'l-Majíd of Nishápúr, whose family worked a turquoise mine, was the first to empty his satchel of stones onto the heap.',
    },
    {
      flag: 'bfCastAway',
      title: 'Empty Hands',
      body: 'A farsang from Bárfurúsh, after the dawn prayer, Mullá Ḥusayn bade the companions leave all they carried by the road, and keep only their horses and their swords. You set down everything you had.',
    },
    {
      flag: 'bfClash',
      title: 'The Stroke',
      body: 'The town came out against the companions with clubs and muskets. Six of them fell, and a siyyid of Yazd was shot through the chest. Mullá Ḥusayn rode at the man who had fired, and with one stroke cut through the tree he hid behind, his musket, and the man.',
    },
    {
      flag: 'bfMournedYazdi',
      title: 'Siyyid Riḍá of Yazd',
      body: 'You knelt by the siyyid of Yazd, one of those nearest Mullá Ḥusayn, the first to fall on the road to Bárfurúsh.',
    },
    {
      flag: 'bfHeardFurughi',
      title: 'With His Own Eyes',
      body: 'Mírzá Muḥammad-i-Furúghí, who had known Mullá Ḥusayn since they were boys, said he would not have believed the stroke had he not seen it himself.',
    },
    {
      flag: 'bfRidaShaken',
      title: 'Bread, Not Baggage',
      body: 'Riḍá hid behind a horse when the stones came. He kept his mother\'s bread back from the heap, for someone who would need it more.',
    },
    {
      flag: 'bfHeardAddress',
      title: 'At the Mujtahid\'s Gate',
      body: 'Mullá Ḥusayn rode three times round the Saʿídu\'l-ʿUlamá\'s house and called on him to come out and lead the war he had preached. He did not come out. To the town Mullá Ḥusayn said: we have never denied your Faith; why do you hold our blood lawful?',
    },
    {
      flag: 'bfHeardSermon',
      title: 'A Club for Snakes',
      body: 'A townsman who went out with a club said the Saʿídu\'l-ʿUlamá had complained from the pulpit that Mullá Ḥusayn once sat in his lessons and scorned him. Having seen the stroke, the man dropped his club and went home.',
    },
    {
      flag: 'bfGatesShut',
      title: 'No Bread, No Water',
      body: 'The baker would not sell, and men with clubs sat on the cistern. Mullá Ḥusayn had the caravanserai\'s gates shut, and bade the companions wait with him until sunset.',
    },
    {
      flag: 'bfMetYouth',
      title: 'A Village Muezzin',
      body: 'A youth by the wall had given the call to prayer from his village masjid every morning since his voice broke. He asked you to hold the ladder for him.',
    },
    {
      flag: 'bfThirdFell',
      title: 'Three Calls',
      body: 'At sunset Mullá Ḥusayn asked who would give his life to sound the call to prayer from the roof. Three youths went up one after another. The first fell at "God is most great", the second at the witness to Muḥammad, the third at "there is no god but God". Then Mullá Ḥusayn opened the gates and rode out, and the square emptied.',
    },
    {
      flag: 'bfSatWithFallen',
      title: 'In the Arcade',
      body: 'You sat with the three who climbed, laid in the shade of the west arcade. You never learned their names.',
    },
    {
      flag: 'bfHeardTownsmanEvening',
      title: 'From the Roofs',
      body: 'The townsman heard the call begin three times from his roof, and three times stop. His father used to say the call to prayer was the one thing his town agreed on.',
    },
    {
      flag: 'bfOathSworn',
      title: 'An Oath on the Qur\'án',
      body: 'ʿAbbás-Qulí Khán of Láríján and Ḥájí Muṣṭafá Khán came on foot and swore on the Qur\'án that Khusraw of Qádí-Kalá and a hundred horsemen would see the companions safe through Shír-Gáh. Mullá Ḥusayn doubted their hearts, and accepted. It was Friday, and the companions broke their fast.',
    },
    {
      flag: 'bfMetMustafa',
      title: 'Sons of That Age',
      body: 'Ḥájí Muṣṭafá Khán, who swore with ʿAbbás-Qulí Khán, said he had sons the age of the three who fell, and meant to keep his oath.',
    },
    {
      flag: 'bfMetKhusraw',
      title: 'Khusraw of Qádí-Kalá',
      body: 'At dawn ʿAbbás-Qulí Khán charged Khusraw to treat the companions well. Mullá Ḥusayn reminded him from the Qur\'án that whoever does evil does it against his own soul.',
    },
    {
      flag: 'bfAmbush',
      title: 'The Forest Road',
      body: 'Khusraw led the companions off the open road into the forest. Long past noon his men fell on them, killed several, among them the brother of Mullá Ṣádiq, and bound others. Mullá Ḥusayn got down and said he would go no further with such a man.',
    },
    {
      flag: 'bfKhusrawDead',
      title: 'The Water-Pipe',
      body: 'While Mullá Ḥusayn prayed, Khusraw demanded his sword and his horse, and had no answer. Mírzá Muḥammad-Taqíy-i-Juvayní carried Khusraw his water-pipe and struck him down with his own dagger, and the escort was broken.',
    },
    {
      flag: 'bfAttendantSent',
      title: 'Only Just Begun',
      body: 'Mullá Ḥusayn spared the boy who had lit Khusraw\'s pipe and sent him back with it to ʿAbbás-Qulí Khán: Khusraw had thought his work was done, and it had only just begun.',
    },
    {
      flag: 'bfMournedForest',
      title: 'Under the Trees',
      body: 'You knelt by those the escort killed in the forest, among them the brother of Mullá Ṣádiq.',
    },
    {
      flag: 'bfHeardMidnight',
      title: 'What Was Said at Midnight',
      body: 'By the fire it was told that at midnight the Saʿídu\'l-ʿUlamá had bidden Khusraw rob and kill the companions. Khusraw asked whether men who died to finish the call to prayer were not Muslims; the mujtahid said he would answer for it before God.',
    },
    {
      flag: 'barfurushComplete',
      title: 'Our Karbilá',
      body: 'At dawn Mullá Ḥusayn said: we are drawing near to our Karbilá. He bade the companions leave all they had taken back from Khusraw\'s men, and walked a maydán through the woods to the shrine of Shaykh Ṭabarsí, where he prayed that his arrival be blessed.',
    },
  ],
};
