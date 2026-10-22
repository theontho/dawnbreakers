import { laneRounds, madrasaRounds, villageRounds } from '../maps/nurPhases';
import type { ChapterStory } from './types';

export const nurStory: ChapterStory = {
  objectives: [
    {
      text: 'Learn how the madrasa has received Mullá Ḥusayn',
      done: f => madrasaRounds(f) >= 2,
      progress: f => ({ current: madrasaRounds(f), total: 2 }),
    },
    {
      text: 'Keep watch by Mullá Ḥusayn\'s lamp through the night',
      done: f => !!f.nurScrollGiven,
    },
    {
      text: 'Walk with the tutor at dawn to the house of the late Mírzá Buzurg',
      done: f => !!f.nurTutorWentIn,
    },
    {
      text: 'Wait in the lane until the tutor comes out',
      done: f => !!f.nurGiftCarried,
      progress: f => ({ current: f.nurTutorCameOut ? 2 : laneRounds(f), total: 2 }),
    },
    {
      text: 'Bring the answer back to Mullá Ḥusayn in the madrasa',
      done: f => !!f.nurHusaynFarewell,
    },
    {
      text: 'Take the road north to Núr and hear what the village says',
      done: f => villageRounds(f) >= 2,
      progress: f => ({ current: villageRounds(f), total: 2 }),
    },
    {
      text: 'Wait in Tákur for word of the mujtahid\'s envoys',
      done: f => !!f.nurHeardGroom,
    },
    {
      text: 'Stand at the door of the Vazír\'s house',
      done: f => !!f.nurComplete,
    },
  ],
  journal: [
    {
      flag: 'nurHeardPorter',
      title: 'The Foot of the Minaret',
      body: 'In Ṭihrán Mullá Ḥusayn lodged in the madrasa of Mírzá Ṣáliḥ, called Pá-Minár. The porter said he went out before dawn and came back an hour after sunset to shut himself in his cell.',
    },
    {
      flag: 'nurHeardHaji',
      title: 'A Cold Reception',
      body: 'Ḥájí Mírzá Muḥammad, the leader of the Shaykhís of Ṭihrán, had hoped Mullá Ḥusayn would revive the Shaykhí cause. He told him he had betrayed it.',
    },
    {
      flag: 'nurMetTutor',
      title: 'Through the Wall',
      body: 'Mullá Muḥammad-i-Muʿallim of Núr, whose cell adjoined his teacher\'s, overheard the whole discussion, and was ashamed of his teacher\'s contempt.',
    },
    {
      flag: 'nurHusaynBack',
      title: 'An Hour After Sunset',
      body: 'You kept vigil by a lamp at a shut door, as once in Shíráz. Mullá Ḥusayn came in alone, and held the lamp to your face.',
    },
    {
      flag: 'nurScrollGiven',
      title: 'A Trust at Dawn',
      body: 'At midnight the tutor knocked. Mullá Ḥusayn asked him about the family of the late Mírzá Buzurg of Núr, and of one son: Ḥusayn-ʿAlí, eight and twenty, who feeds the hungry and roams the woods. He gave the tutor a scroll wrapped in cloth to put into His hands at dawn.',
    },
    {
      flag: 'nurTutorWentIn',
      title: 'The Door in the Wall',
      body: 'His brother Mírzá Músá was at the gate before the bakers. The tutor went in. You stayed in the lane.',
    },
    {
      flag: 'nurHeardBaker',
      title: 'The Vazír\'s House',
      body: 'The baker remembered the late Vazír: a famous hand, twenty fortunate years, then a flood at Tákur and the loss of his posts. His son had refused the post at court.',
    },
    {
      flag: 'nurHeardPoorMan',
      title: 'The Father of the Poor',
      body: 'In that quarter they called the master of the house the Father of the Poor, and His wife the Mother of Consolation.',
    },
    {
      flag: 'nurGiftCarried',
      title: 'Sugar and Tea',
      body: 'He read passages of the scroll aloud and told His brother that whoever owns the Qur\'án as the Word of God and hesitates, even for a moment, to own the same power in these words has strayed from justice. He sent Mullá Ḥusayn a loaf of Russian sugar and a package of tea, with His love.',
    },
    {
      flag: 'nurHusaynFarewell',
      title: 'Blood Will Water the Tree',
      body: 'Mullá Ḥusayn received the gift with bowed head and kissed it. Leaving for Khurásán, he charged you to keep the secret and not to speak His name, and said that much blood would be shed in that city in this path.',
    },
    {
      flag: 'nurHeardWoman',
      title: 'No News of the Court',
      body: 'The notables of Núr came to the Vazír\'s son for news of the Sháh. He spoke to them instead of a new Cause, and they went home and told their villages.',
    },
    {
      flag: 'nurHeardElder',
      title: 'Something in His Tea',
      body: 'His uncle ʿAzíz alone opposed Him, and ran to the mujtahid of Núr crying sorcery. The mujtahid\'s reassuring note was so badly written that Tákur was scandalised by it.',
    },
    {
      flag: 'nurEnvoysSent',
      title: 'Two Envoys',
      body: 'Mullá ʿAbbás and Mírzá Abu\'l-Qásim, sent by the mujtahid of Núr with his promise to abide by their verdict, rode after Him to His winter quarters with their questions written out.',
    },
    {
      flag: 'nurHeardGroom',
      title: 'This Threshold',
      body: 'They found Him revealing a commentary on the opening Súrih of the Qur\'án. Mullá ʿAbbás rose and stood by the door, his questions forgotten, and sent word that he could never return to his teacher. Mírzá Abu\'l-Qásim vowed his days to the same service.',
    },
    {
      flag: 'nurHeardSaadat',
      title: 'The Closed Book',
      body: 'He rode to Saʿádat-Ábád to give the Message to the mujtahid himself. The mujtahid opened the Qur\'án, shut it, and would not say what verse he had found.',
    },
    {
      flag: 'nurComplete',
      title: 'The District of Light',
      body: 'Núr, in the mountains of Mázindarán, was the first district in Persia to embrace the Cause. From Khurásán Mullá Ḥusayn wrote to the Báb of all of it, and the Báb rejoiced. You took the road south to the sea.',
    },
  ],
};
