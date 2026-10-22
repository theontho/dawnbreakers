import { COMPANION_TALES, companionTales, WAITING_DAYS, waitingDays } from '../maps/kulaynPhases';
import type { ChapterStory } from './types';

export const kulaynStory: ChapterStory = {
  objectives: [
    {
      text: 'Wait at the gate of ʿAṭṭár with Ḥájí Mírzá Jání',
      done: f => !!f.kulaynRidersCame,
    },
    {
      text: 'Hear whether the escort will let the Prisoner lodge in the city',
      done: f => !!f.kulaynInvited,
    },
    {
      text: 'Keep Naw-Rúz in the house of Ḥájí Mírzá Jání',
      done: f => !!f.kulaynFarewell,
    },
    {
      text: 'Ride north with the escort',
      done: f => !!f.kulaynCampArrived,
    },
    {
      text: 'Keep the waiting days at Kulayn',
      done: f => !!f.kulaynLetter,
      progress: f => ({ current: waitingDays(f), total: WAITING_DAYS.length }),
    },
    {
      text: 'Hear what the companions have seen',
      done: f => companionTales(f) >= COMPANION_TALES.length,
      progress: f => ({ current: companionTales(f), total: COMPANION_TALES.length }),
    },
    {
      text: 'Hear the order from the capital, and stand by the tent',
      done: f => !!f.kulaynComplete,
    },
  ],
  journal: [
    {
      flag: 'kulaynMetJani',
      title: 'A Merchant\'s Dream',
      body: 'Ḥájí Mírzá Jání of Káshán dreamed that the Báb came to the gate of ʿAṭṭár among horsemen, in a merchant\'s kuláh, and would be his Guest for three nights. He swept his house and went to wait at the gate.',
    },
    {
      flag: 'kulaynRidersCame',
      title: 'As in the Dream',
      body: 'At sunset on the eve of Naw-Rúz, 1847, the escort came up the Iṣfahán road, and the Prisoner rode among them as the dream had shown. Ḥájí Mírzá Jání bent to kiss His stirrup and was gently stopped.',
    },
    {
      flag: 'kulaynLeave',
      title: 'Three Nights',
      body: 'Muḥammad Big prevailed over his colleague: the Báb might lodge with Ḥájí Mírzá Jání, to be handed back at the gate on the third morning. The horsemen were lodged in a caravanserai by the gate.',
    },
    {
      flag: 'kulaynHeardHost',
      title: 'A Tablet for a Silk Merchant',
      body: 'Siyyid Ḥusayn of Yazd, called to Káshán beforehand, took down a Tablet the Báb revealed in honour of His host. Among the few who met Him in that house was a young man named Mihdí, who would give his life in Ṭihrán five years later.',
    },
    {
      flag: 'kulaynHeardBaqi',
      title: 'He Did Not Ask',
      body: 'Siyyid ʿAbdu\'l-Báqí, the most learned man in Káshán, heard the verses and went away unmoved, without asking the Guest\'s name. Learning it days later, he was filled with remorse, and lived the rest of his life in seclusion.',
    },
    {
      flag: 'kulaynFarewell',
      title: 'The Third Morning',
      body: 'The Báb kept Naw-Rúz in Ḥájí Mírzá Jání\'s house. On the third morning His host handed Him back to the escort at the gate, as he had promised, and bade Him a last farewell.',
    },
    {
      flag: 'kulaynJaniFarewell',
      title: 'A Tongue Loosed',
      body: 'In the Tablet the Báb prayed that His host\'s tongue be loosed. The unschooled merchant went on to silence learned men in argument. Ḥájí Mírzá Jání gave his life for the Faith in Ṭihrán in 1852.',
    },
    {
      flag: 'kulaynCampArrived',
      title: 'Kulayn',
      body: 'Kept clear of Qum, the escort went round by Qumrúd to the fort of Kinár-Gird, where the Grand Vizier\'s messenger turned them aside to Kulayn, a village of his own. His tent was pitched for the Prisoner on a hillside among orchards and streams.',
    },
    {
      flag: 'kulaynHeardVillager',
      title: 'A Bowl of Curds',
      body: 'A woman of Kulayn left curds at the tent each morning. At night, she said, you could hear Him from the stream, like someone calling to a friend who had gone a long way off.',
    },
    {
      flag: 'kulaynCompanions',
      title: 'Within Call',
      body: 'Two days after Him came Siyyid Ḥusayn of Yazd and his brother Siyyid Ḥasan, Mullá ʿAbdu\'l-Karím of Qazvín and Shaykh Ḥasan of Zunúz, and camped near His tent.',
    },
    {
      flag: 'kulaynLetter',
      title: 'A Sealed Letter',
      body: 'Mullá Mihdíy-i-Kandí, who had been close to Bahá\'u\'lláh in Ṭihrán, brought the Báb a sealed letter and gifts from Him. What was written, no one has told.',
    },
    {
      flag: 'kulaynHeardKandi',
      title: 'Praise for Tears',
      body: 'The Báb\'s face shone as He read. Nabíl records that the letter brought Him solace and strength: His weeping gave way to praise and thanksgiving, until the news of Shaykh Ṭabarsí clouded it.',
    },
    {
      flag: 'kulaynHeardMoonlit',
      title: 'A Moonlit Night',
      body: 'One night the tent was found empty. Muḥammad Big said He would not endanger them, and went out on foot toward Ṭihrán. At dawn they saw Him coming from that direction, with such majesty that no one dared ask where He had been.',
    },
    {
      flag: 'kulaynOrder',
      title: 'The Sháh\'s Letter',
      body: 'After a fortnight a letter came in the Sháh\'s name: he could not receive the Báb now, and He was to be taken to Mákú. Nabíl lays it at the door of Ḥájí Mírzá Áqásí, who feared what such a meeting would cost him.',
    },
    {
      flag: 'kulaynComplete',
      title: 'Toward the Mountains',
      body: 'In the spring of 1847 the Báb was taken from Kulayn, half a day from the capital, toward Qazvín, Tabríz and the fortress of Mákú. Near Tabríz, Muḥammad Big asked His forgiveness with tears, and was told that he was counted among His fold.',
    },
  ],
};
