import type { ChapterStory } from './types';

export const chapter08Story: ChapterStory = {
  objectives: [
    {
      text: 'Find Mullá Ḥusayn at the head of the column',
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
      title: 'The Column in the Forest',
      body: 'You found Mullá Ḥusayn in the forests of Mázindarán, wearing the green turban the Báb had sent him. Driven out of Bárfurúsh after a few nights in its caravanserai, the companions marched for the shrine of Shaykh Ṭabarsí.',
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
      title: 'River Stones',
      body: 'You knelt at the grave beside the shrine, ringed with white river stones, its lamp fed with the last of the oil.',
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
