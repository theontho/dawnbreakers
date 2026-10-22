import { FAREWELLS_NEEDED, farewellCount } from '../dialogues_ch/chapter02_road';
import type { ChapterStory } from './types';

export const chapter02Story: ChapterStory = {
  objectives: [
    {
      text: 'Find Mullá Ḥusayn in the caravanserai yard beyond the Qur\'án Gate',
      done: f => !!f.ch2HeardCharge,
    },
    {
      text: 'Bid God-speed to those setting out',
      done: f => farewellCount(f) >= FAREWELLS_NEEDED,
      progress: f => ({ current: Math.min(farewellCount(f), FAREWELLS_NEEDED), total: FAREWELLS_NEEDED }),
    },
    {
      text: 'Answer the seeker on the north road without speaking His name',
      done: f => !!f.ch2SeekerAnswered,
    },
    {
      text: 'Say farewell to Mullá Ḥusayn at the milestone',
      done: f => !!f.roadComplete,
    },
  ],
  journal: [
    {
      flag: 'ch2HeardCharge',
      title: 'The Charge',
      body: 'Mullá Ḥusayn told you how the Letters of the Living were sent out like the disciples of old: to proclaim that the Gate has opened, but not yet to speak His name. He goes to Iṣfahán and Ṭihrán; the One he follows goes on pilgrimage to Mecca with Quddús.',
    },
    {
      flag: 'ch2AliFarewell',
      title: 'Pages for Najaf',
      body: 'Mullá ʿAlíy-i-Basṭámí set out for the shrine cities of ʿIráq, carrying pages of the commentary on the Súrih of Joseph to the very ʿulamá who taught you both. "Pages can be burned, but they cannot be made to recant."',
    },
    {
      flag: 'ch2WardenBlessing',
      title: 'Beneath the Book',
      body: 'The keeper of the Qur\'án Gate saw a scholar weep beneath the Book. "I have read it all my life, and only now has it answered me."',
    },
    {
      flag: 'ch2KeeperTally',
      title: 'Guests in Every Direction',
      body: 'The caravanserai keeper has never seen guests leave by so many roads at once, all wearing the same face.',
    },
    {
      flag: 'ch2FalTaken',
      title: 'A Verse for the Road',
      body: 'An old man near the poet\'s garden opened the Díván of Ḥáfiẓ for you. You keep the verse like a date stone in your mouth for the long road.',
    },
    {
      flag: 'ch2MubarakNews',
      title: 'Patient Eyes',
      body: 'Mubárak was choosing mules for the road to Búshihr and the sea. His Master told him to pay the muleteer a little more than the price, because the man has children.',
    },
    {
      flag: 'ch2SeraiMerchant',
      title: 'A Letter from Qazvín',
      body: 'A cloth merchant in the caravanserai shared his room with a young man from Qazvín who carried a sealed letter from a learned kinswoman. She is counted among the first, the young man said, though she never left her own house.',
    },
    {
      flag: 'ch2CameleerTea',
      title: 'Heavier than Salt',
      body: 'An old cameleer saw one traveller set out on foot for Khurásán, singing. Good news, he says, must be set down carefully, in the right house, or it breaks.',
    },
    {
      flag: 'ch2SweptRoom',
      title: 'A Swept Room',
      body: 'One of the guests swept his room before dawn and left the lamp filled with oil for whoever comes next.',
    },
    {
      flag: 'roadHeardDervish',
      title: 'The Two Tongues of the Road',
      body: 'A dervish by the roadside shrine spoke of the road\'s two tongues: dust beneath the foot, and silence inside the breast.',
    },
    {
      flag: 'roadMetMuleteer',
      title: 'The Iṣfahán Caravan',
      body: 'The muleteer bound for Iṣfahán carries a tall mullá from Khurásán who paid for a mule and walks beside it, "too full to sit still."',
    },
    {
      flag: 'ch2NearlyNamed',
      title: 'A Name on the Lips',
      body: 'His name rose to your lips before a stranger on the road, and you remembered the charge in time.',
    },
    {
      flag: 'roadCertaintyShared',
      title: 'Witness Without a Name',
      body: 'You told a seeker from Yazd that the Gate has opened, and sent him to Shíráz to search with a pure heart.',
    },
    {
      flag: 'roadUncertainWitness',
      title: 'An Honest Trembling',
      body: 'You told a seeker from Yazd only what you saw: a door, a lamp, a night of waiting. He went to Shíráz anyway.',
    },
    {
      flag: 'ch2SeekerAnswered',
      title: 'A Gate Without a Name',
      body: '"If a nameless light can make you guard it like this, it is worth the walk." The seeker went down toward the gate, against the stream of those leaving.',
    },
    {
      flag: 'roadComplete',
      title: 'The Road North',
      body: 'Mullá Ḥusayn climbed into the pass toward Iṣfahán. The pilgrim ships could wait: you took the same road north, a day behind him, toward the mystery he was sent to find in Ṭihrán.',
    },
  ],
};
