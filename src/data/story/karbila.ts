import { krSummerRounds, krWinterRounds, SUMMER_NEEDED, WINTER_NEEDED } from '../maps/karbilaPhases';
import type { ChapterStory } from './types';

export const karbilaStory: ChapterStory = {
  objectives: [
    {
      text: 'Find Shaykh Ḥasan-i-Zunúzí by the gate of the shrine',
      done: f => !!f.krMetHasan,
    },
    {
      text: 'Go among the people of Karbilá: the canal, the shrine and your teacher\'s grave, the lane',
      done: f => krSummerRounds(f) >= SUMMER_NEEDED,
      progress: f => ({ current: Math.min(krSummerRounds(f), SUMMER_NEEDED), total: SUMMER_NEEDED }),
    },
    {
      text: 'Sit with Shaykh Ḥasan by the gate on the day of ʿArafih',
      done: f => !!f.krHasanSaw,
    },
    {
      text: 'Watch the house in the lane through the winter, then hear the news by the canal',
      done: f => !!f.krSpring,
      progress: f => ({ current: Math.min(krWinterRounds(f), WINTER_NEEDED), total: WINTER_NEEDED }),
    },
    {
      text: 'See the house in the lane in spring, and go back to Shaykh Ḥasan at the gate',
      done: f => !!f.karbilaComplete,
    },
  ],
  journal: [
    {
      flag: 'krMetWaterSeller',
      title: 'Home by the Canal',
      body: 'You came down to Karbilá in the summer of 1851 and drank from the Ḥusayniyyih canal. The water-seller remembered the student who bought water for Siyyid Káẓim\'s lessons.',
    },
    {
      flag: 'krMetHasan',
      title: 'The One Who Waits',
      body: 'Shaykh Ḥasan of Zunúz, once a copyist at Mákú, sits every day by the gate of the shrine. Before He was taken to Chihríq the Báb told him to go to Karbilá, where he would behold with his own eyes the promised Ḥusayn.',
    },
    {
      flag: 'krMetServant',
      title: 'The Keeper of the Step',
      body: 'An old servant of the shrine, sweeping its threshold as he has for forty years, remembered the late Siyyid\'s Persians and the winter they carried him in to his grave.',
    },
    {
      flag: 'krVisitedGrave',
      title: 'Your Teacher\'s Grave',
      body: 'You prayed in the shrine and stood a long time by Siyyid Káẓim\'s resting-place, eight years after he bade his students scatter and seek.',
    },
    {
      flag: 'krMetClassmate',
      title: 'The Old Pillar',
      body: 'A classmate from the Siyyid\'s lessons who stayed behind told you who was left: hardly anyone. He waits and sees, he says, and says it too quickly.',
    },
    {
      flag: 'krBoughtTurbah',
      title: 'Two Tablets of Clay',
      body: 'You bought two tablets of the clay of Karbilá from a seller in the square. He tells the quiet Persians the way to a lane east of the shrine before they ask.',
    },
    {
      flag: 'krMetUluvi',
      title: 'A Frightened Follower',
      body: 'Leaderless after Tabríz, some believers in Karbilá had gathered round a Siyyid ʿUlúv, who made extravagant claims for himself. One of his followers caught your sleeve in the lane, unable to sleep for them.',
    },
    {
      flag: 'krHeardNeighbour',
      title: 'Across the Lane',
      body: 'A neighbour watches the house where a gentleman of Núr is staying. Everyone comes to it fast, she says, looking behind them, and goes away slowly, looking at nothing.',
    },
    {
      flag: 'krHasanSaw',
      title: 'The Day of ʿArafih',
      body: 'On the day of ʿArafih, in the autumn of 1851, Shaykh Ḥasan went to the gate of the inner court and came back shaking. He had seen what he was told he would see, and he has been asked to keep it until its hour.',
    },
    {
      flag: 'krSawLamp',
      title: 'The Lamp in the Upper Room',
      body: 'On winter nights a lamp burns late in the upper room of the house in the lane. The scattered believers go in by ones and twos, and none of them was sent for.',
    },
    {
      flag: 'krMetAqaJan',
      title: 'The Boy on the Step',
      body: 'Mírzá Áqá Ján of Káshán came to Karbilá after a dream. He sleeps on the step of the house, fetches its water, and is learning to write a fair hand. He would become Bahá\'u\'lláh\'s amanuensis.',
    },
    {
      flag: 'krUluvSilenced',
      title: 'Claims Taken Back',
      body: 'Siyyid ʿUlúv went to the house in the lane and came out another man. Before his followers he took back every claim he had made, and they went to the house themselves.',
    },
    {
      flag: 'krClassmateDoor',
      title: 'A Door Not Knocked At',
      body: 'Your old classmate once stood at night before the door in the lane for as long as it takes to recite the Fátiḥa, and did not knock, because he was afraid it would open.',
    },
    {
      flag: 'krSpring',
      title: 'News from Ṭihrán',
      body: 'The Amír-Niẓám, who ordered the Báb\'s death, was dismissed and then put to death at Fín. The new Grand Vizier, Mírzá Áqá Khán of Núr, invited Bahá\'u\'lláh back to Ṭihrán.',
    },
    {
      flag: 'krHouseEmpty',
      title: 'A Swept Step',
      body: 'In the spring of 1852 the house in the lane was shut, its upper window dark, and the dust on its step swept into a neat heap.',
    },
    {
      flag: 'karbilaComplete',
      title: 'Kept Until Its Hour',
      body: 'Shaykh Ḥasan kept what he had seen. Bahá\'u\'lláh went back to Persia in 1852, and within months He was in chains in the Síyáh-Chál, where the dawn glimpsed at the gate of Karbilá broke unseen.',
    },
  ],
};
