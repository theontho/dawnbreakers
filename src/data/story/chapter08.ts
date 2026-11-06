import { CH8_DAY, ch8Visits } from '../record/day';
import type { FlagState } from '../../dialogue/types';
import type { ChapterStory } from './types';

/** While the player is the youth of Ámul, that interlude's steps come first; otherwise they are out of the way. */
const atAmul = (step: (f: FlagState) => boolean) => (f: FlagState): boolean => !f.ch8AtAmul || step(f);

export const chapter08Story: ChapterStory = {
  objectives: [
    // The interlude at Ámul (Ch8Amul), reached from Quddús's news in winter.
    {
      text: 'Help your uncle ready the hall, and hear how the travellers were taken',
      done: atAmul(f => (!!f.ch8AmulCarpets && !!f.ch8AmulGuardHeard) || !!f.ch8AmulRods),
    },
    {
      text: 'Stand at the door of the prayer hall',
      done: atAmul(f => !!f.ch8AmulRods),
    },
    {
      text: 'Take your uncle\'s lantern round by the alley to the acting governor\'s man',
      done: atAmul(f => !!f.ch8AmulWallOpened),
    },
    {
      text: 'Go to the acting governor\'s gate',
      done: atAmul(() => false),
    },
    {
      text: 'Find Mullá Ḥusayn at the camp by the stream',
      done: f => !!f.ch8JoinedColumn,
    },
    {
      text: 'Help raise the walls, then wait at the gate with Mullá Ḥusayn',
      done: f => !!f.ch8QuddusArrived,
    },
    {
      text: 'Sit with Quddús, and stand by Mullá Ḥusayn through the winter',
      done: f => !!f.ch8MullaHusaynFell,
    },
    {
      text: 'Share out the rice with Mírzá Muḥammad-Báqir by the gate',
      done: f => !!f.ch8RiceShared,
    },
    {
      text: 'Before nightfall, go where you are needed',
      done: f => ch8Visits(f) >= CH8_DAY.slots,
      progress: f => ({ current: Math.min(ch8Visits(f), CH8_DAY.slots), total: CH8_DAY.slots }),
    },
    {
      text: 'Keep the night watch at the gate with Riḍá, then write by the keeper\'s wick',
      done: f => !!f.ch8RecordWritten,
    },
    {
      text: 'Hear the news Mírzá Muḥammad-Báqir brings to the gate',
      done: f => !!f.ch8BetrayalNamed,
    },
    {
      text: 'Share the hunger of the companions at the cauldron',
      done: f => !!f.ch8SharedHunger,
    },
    {
      text: 'Answer the white flag at the causeway, and carry its oath to Quddús',
      done: f => !!f.tabarsiComplete,
    },
  ],
  journal: [
    {
      flag: 'ch8JoinedColumn',
      title: 'The Camp by the Stream',
      body: 'In the first days at the shrine of Shaykh Ṭabarsí the companions camped by the stream below it. After Bárfurúsh and Khusraw\'s forest, Mullá Ḥusayn, in the green turban the Báb had sent him, spoke of a wall round the shrine.',
    },
    {
      flag: 'ch8SawStandard',
      title: 'The Black Standard',
      body: 'You stood beneath the Black Standard raised in Khurásán, recalling the tradition of black banners in the days of the Qáʾim. It was never once allowed to touch the ground.',
    },
    {
      flag: 'ch8MetYoungCompanion',
      title: 'Riḍá of Mashhad',
      body: 'A dyer\'s son from Mashhad, his hands still stained blue, walked with the column. His mother had sewn bread into his sash.',
    },
    {
      flag: 'ch8SharedBread',
      title: 'Brothers by Bread',
      body: 'You ate a corner of Riḍá\'s mother\'s bread with him on the forest road.',
    },
    {
      flag: 'ch8MetWoodcutter',
      title: 'The Woodcutter\'s Judgement',
      body: 'A woodcutter in his clearing said the mullás of Bárfurúsh promised Paradise to any who killed the strangers. He judged the companions by how they treated a poor man\'s woodpile.',
    },
    {
      flag: 'ch8RiceGift',
      title: 'Two Handfuls of Rice',
      body: 'A village woman at the stream gave you rice for the young ones, against her husband\'s wishes. "Even rice can be a crime," she said.',
    },
    {
      flag: 'ch8GaveRice',
      title: 'Rice for Riḍá',
      body: 'You gave the village woman\'s rice to Riḍá, who promised to make it last.',
    },
    {
      flag: 'ch8HelpedBuild',
      title: 'A Stone in the Wall',
      body: 'A stonecutter from Yazd taught you to set stone, mud, and timber. A stone set well never quarrels with the one beside it.',
    },
    {
      flag: 'ch8DugDitch',
      title: 'The Ditch',
      body: 'You helped Riḍá dig the ditch around the walls. The companions numbered close to three hundred and thirteen.',
    },
    {
      flag: 'ch8QuddusArrived',
      title: 'Quddús Comes to Ṭabarsí',
      body: 'At Bahá\'u\'lláh\'s counsel, Quddús was brought from Sárí. Mullá Ḥusayn went out to meet him with candle-bearers and walked behind him on foot, and Quddús, leaning on the shrine, recited the verse of the Remnant of God.',
    },
    {
      flag: 'ch8QuddusCounsel',
      title: 'Winter Counsel',
      body: 'Quddús told you to let grief sharpen compassion, not anger. Each night he wrote; each morning the companions chanted what he had written.',
    },
    {
      flag: 'ch8AmulWitness',
      title: 'A Youth of Ámul',
      body: 'For a while you were someone else: a youth who trimmed the lamps of the masjid of Ámul for your uncle, in the first days of Muḥarram, while the fort lay under snow.',
    },
    {
      flag: 'ch8AmulGuardHeard',
      title: 'A Lonely House by the Road',
      body: 'The chief of the guards had taken the travellers at a lonely house on the forest road, under orders to bring anyone near the fort to Ámul. He brought them in on horses, civilly, and papers went into a river on the way.',
    },
    {
      flag: 'ch8AmulRods',
      title: 'The Rods in the Prayer Hall',
      body: 'From the back of the hall you heard Bahá\'u\'lláh answer the divines, and win His companions\' release, and offer Himself to bear the punishment in their place. You turned your face to the door and heard the rods.',
    },
    {
      flag: 'ch8AmulSiyyid',
      title: 'The Faith of Our Fathers',
      body: 'A siyyid at the court gate feared that what his father taught him on the masjid\'s carpets would be unmade in a night.',
    },
    {
      flag: 'ch8AmulWallOpened',
      title: 'A Way Through the Wall',
      body: 'You held a lantern while the acting governor\'s men opened the back wall of the room where the travellers were held. When the siyyid came at them with a club, the acting governor adjured him by the Prophet, and brought them safe to his house.',
    },
    {
      flag: 'ch8AmulWallMended',
      title: 'Mud and Straw',
      body: 'Your uncle mended the hole in the masjid\'s wall before the mujtahid was up, and told no one who had made it.',
    },
    {
      flag: 'ch8AmulTold',
      title: 'The Road to Ṭihrán',
      body: 'The governor came home from the fort with a changed heart, found no proof against the travellers, and a few days later sent them safe to Ṭihrán. Bahá\'u\'lláh never reached Ṭabarsí; Nabíl saw Providence in it.',
    },
    {
      flag: 'ch8KeptWatch',
      title: 'Counting Fires',
      body: 'On watch, Riḍá counted the army\'s fires to stay awake. He had given his last piece of bread to a coughing old man from Qazvín.',
    },
    {
      flag: 'ch8MullaHusaynFell',
      title: 'The Gate at Dawn',
      body: 'Mullá Ḥusayn rode out before dawn in February 1849 and was carried back mortally wounded. Quddús buried him beside the shrine, clothed in Quddús\'s own shirt. You kept the gate.',
    },
    {
      flag: 'ch8HeardMullaHusayn',
      title: 'A Wounded Witness',
      body: 'A wounded companion told you how Mullá Ḥusayn\'s horse caught in a tent rope, and the shot came from a tree. His face held no defeat.',
    },
    {
      flag: 'ch8TouchedShrine',
      title: 'The Hospitable Dead',
      body: 'Inside the shrine you rested your hand on the tomb of Shaykh Ṭabarsí, a scholar who lived in quiet and now kept three hundred guests and an army at his gate.',
    },
    {
      flag: 'ch8HeardKeeperDream',
      title: 'The Keeper\'s Dream',
      body: 'The old keeper of the shrine dreamt, the night before the companions came, that the Prince of Martyrs and his faithful stood their ground at the tomb. In the morning he saw the black banner between the trees, and stayed.',
    },
    {
      flag: 'ch8TrimmedLamps',
      title: 'A Short Flame',
      body: 'You helped the keeper trim the shrine\'s lamps, short, so they would drink less oil. The companions prayed at the tomb in turns all night.',
    },
    {
      flag: 'ch8MetQazviniElder',
      title: 'The Work That Makes No Noise',
      body: 'An old man of Qazvín, driven from his shop after the murder of the mujtahid there, coughed by the shrine\'s west wall and prayed for the young men on the walls.',
    },
    {
      flag: 'ch8SawEmptyBedroll',
      title: 'A Sprig of Box',
      body: 'In the spring the old man of Qazvín\'s bedroll lay empty, his cloak folded on it, and a sprig of green laid on the cloak.',
    },
    {
      flag: 'ch8KeeperLastLamp',
      title: 'One Wick',
      body: 'In the hungry months the keeper kept one wick burning for the Shaykh. Quddús sat each dusk by the wall nearest Mullá Ḥusayn\'s grave and spoke to him low, as if through a door.',
    },
    {
      flag: 'ch8ShowedMercy',
      title: 'A Bound Wound',
      body: 'You knelt and bound a wounded companion\'s wound before asking him anything.',
    },
    {
      flag: 'ch8VisitedGrave',
      title: 'Earth Smoothed Flat',
      body: 'You knelt by the shrine where the earth had been smoothed flat. Quddús asked that the place be hidden, even from the companions, and no stone marks it.',
    },
    {
      flag: 'ch8RiceShared',
      title: 'The Rice He Stored',
      body: 'Mírzá Muḥammad-Báqir, who drew the lines of the fort, shared out the rice Mullá Ḥusayn had stored against the hard days. Then Quddús told any who were afraid to go now, before the way was barred.',
    },
    {
      flag: 'ch8DayTower',
      title: 'The Ledger at the Gate',
      body: 'You held the ledger flat while Muḥammad-Báqir wrote the names of the fallen. "Write whose word it was," he said.',
    },
    {
      flag: 'ch8DayWounded',
      title: 'Water Along the Wall',
      body: 'You carried water to the wounded by the east wall while Mullá Ṣádiq bound their wounds and talked of the night behind the closed door.',
    },
    {
      flag: 'ch8HeldHand',
      title: 'A Hand Held',
      body: 'A dying companion who had ridden out with Mullá Ḥusayn lay facing the palisade. You held his hand and asked him nothing.',
    },
    {
      flag: 'ch8DayShrine',
      title: 'Short Wicks',
      body: 'You trimmed the shrine\'s lamps with the keeper, who swept the earth over the thirty-six in the north grave, and would not guess aloud about the other.',
    },
    {
      flag: 'ch8DayWall',
      title: 'A Trembling Pen',
      body: 'At a loophole of the west wall Furúghí copied out the verses and remembered Mullá Ḥusayn as a boy whose hand shook when he wrote.',
    },
    {
      flag: 'ch8DayWater',
      title: 'Across the Ditch',
      body: 'Filling the water skins below the causeway, you heard from a conscript that his khan sits four farsangs off, not knowing whom he shot.',
    },
    {
      flag: 'ch8DayLeanTo',
      title: 'The Siyyid from Qum',
      body: 'Under the lean-tos a frightened siyyid from Qum asked you where Mullá Ḥusayn lies, and how many can still stand.',
    },
    {
      flag: 'ch8ToldSiyyidGrave',
      title: 'What You Told Him',
      body: 'You told the siyyid from Qum what the keeper guessed about the grave. He wrote it down.',
    },
    {
      flag: 'ch8ZargarGiven',
      title: 'Rice for the Road',
      body: 'At midnight a hungry man went out of the gate. You gave him your own share of rice for the road.',
    },
    {
      flag: 'ch8NightWatch',
      title: 'The Midnight Gate',
      body: 'On the night watch with Riḍá you saw a man slip out of the gate with his rice under his arm. Riḍá said: let him go.',
    },
    {
      flag: 'ch8BetrayalNamed',
      title: 'A Sealed Letter',
      body: 'Ten days before Naw-Rúz ʿAbbás-Qulí Khán came back knowing Mullá Ḥusayn was dead. A betrayer in the fort had written to him, and the man at the gate had carried the letter.',
    },
    {
      flag: 'ch8WoodcutterListened',
      title: 'Not the Wind',
      body: 'The woodcutter said that at night the whole army fell silent to hear the companions\' cry through the trees. His wife wept at it.',
    },
    {
      flag: 'ch8MetConscript',
      title: 'A Boy from Láríján',
      body: 'A conscript taken from his village after the harvest said his khan boasts of the shot fired from the tree, and no longer sleeps well.',
    },
    {
      flag: 'ch8SharedHunger',
      title: 'Leather and Grass',
      body: 'You shared a broth of boiled saddle leather at Riḍá\'s fire. The companions ate grass, bark, and ground bones, and chanted Quddús\'s verses to forget their hunger.',
    },
    {
      flag: 'ch8TrustedTruce',
      title: 'The Oath Received',
      body: 'You told the royal officer that a pledge before God must be honoured, and carried the sealed Qur\'án to Quddús.',
    },
    {
      flag: 'ch8DoubtedTruce',
      title: 'The Oath Doubted',
      body: 'You told the royal officer you did not trust his Prince\'s oath, yet carried the sealed Qur\'án to Quddús all the same.',
    },
    {
      flag: 'tabarsiComplete',
      title: 'The Breaking of the Oath',
      body: 'The companions went out trusting an oath sworn on the Qur\'án, and the oath was broken. Quddús was slain in the Sabzih-Maydán of Bárfurúsh on 16 May 1849. In Chihríq, the Báb\'s grief stilled His pen for months.',
    },
  ],
};
