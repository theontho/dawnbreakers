import { chihriqWitnesses } from '../dialogues_ch/chapter06_chihriq';
import type { ChapterStory } from './types';

export const chapter06Story: ChapterStory = {
  objectives: [
    {
      text: 'Climb to the fortress gate and speak with ʿAlí Khán',
      done: f => !!f.ch6WardenSoftened,
    },
    {
      text: 'Read the pages of the Bayán, and find Mullá Ḥusayn on the Mashhad road',
      done: f => !!f.ch6ReadBayan && !!f.ch6MetMullaHusayn,
      progress: f => ({ current: Number(!!f.ch6ReadBayan) + Number(!!f.ch6MetMullaHusayn), total: 2 }),
    },
    {
      text: 'Ask the Mountain Courier in town for news',
      done: f => !!f.ch6TransferOrdered,
    },
    {
      text: 'At Chihríq, speak with Yaḥyá Khán and those who have climbed the mountain',
      done: f => !!f.ch6MetYahyaKhan && chihriqWitnesses(f) >= 2,
      progress: f => ({ current: Number(!!f.ch6MetYahyaKhan) + Math.min(chihriqWitnesses(f), 2), total: 3 }),
    },
    {
      text: 'Keep watch beneath the barred window',
      done: f => !!f.bayanComplete,
    },
  ],
  journal: [
    {
      flag: 'ch6HeardVillagers',
      title: 'Honest Weights',
      body: 'The people of Mákú look up at the fortress each morning before the fields. When a man in their bazaar wants to be believed, he swears by the Holy One on the mountain.',
    },
    {
      flag: 'ch6GuardLamp',
      title: 'No Lamp After Dark',
      body: 'A guard told you that in the first weeks the Prisoner was denied even a lamp at night. He heard Him praying in the dark all the same.',
    },
    {
      flag: 'ch6WardenSoftened',
      title: 'The Warden\'s Change',
      body: 'ʿAlí Khán, who once kept Him from a lamp, asked His forgiveness and now opens the gate to pilgrims. He would not say what he saw by the river.',
    },
    {
      flag: 'ch6MetAmanuensis',
      title: 'Siyyid Ḥusayn of Yazd',
      body: 'The amanuensis writes down what is revealed and copies it for the saddlebags. He says every page of the new Book points beyond itself.',
    },
    {
      flag: 'ch6ReadBayan',
      title: 'The Persian Bayán',
      body: 'You read the pages of the Bayán in the amanuensis\'s room: laws, a calendar of nineteen months, and everywhere Him whom God shall make manifest.',
    },
    {
      flag: 'ch6BayanStance',
      equals: 'awe',
      title: 'Read in Awe',
      body: 'The cold little room seemed to widen as you read. A place of forgetting had become the place where a Book was written.',
    },
    {
      flag: 'ch6BayanStance',
      equals: 'study',
      title: 'Read as a Student',
      body: 'You traced the Book\'s architecture, each law pointing beyond itself toward the One to come.',
    },
    {
      flag: 'ch6BayanStance',
      equals: 'grief',
      title: 'Read in Grief',
      body: 'You grieved that such words were born in a prison. The dark only made them sharper.',
    },
    {
      flag: 'ch6SawBarredWindow',
      title: 'The Barred Window',
      body: 'You stood beneath the frosted bars of the keep and heard the pen, and then the chanting. You stayed until the cold reached your bones.',
    },
    {
      flag: 'ch6MetMullaHusayn',
      title: 'On Foot from Mashhad',
      body: 'Mullá Ḥusayn walked the whole road from Mashhad to Mákú, a thousand miles and more, to keep Naw-Rúz near the Prisoner. "Some journeys must be paid for in steps."',
    },
    {
      flag: 'ch6HusaynCharge',
      title: 'A Treasure in Mázindarán',
      body: 'Mullá Ḥusayn has been bidden onward to Mázindarán, where a hidden treasure waits that he will know when he sees it. "Look for me among the green hills."',
    },
    {
      flag: 'ch6TransferOrdered',
      title: 'The Order from Ṭihrán',
      body: 'Hearing that the warden of Mákú had softened, the Grand Vizier ordered the Prisoner moved to Chihríq, under Yaḥyá Khán, brother-in-law of the Sháh.',
    },
    {
      flag: 'ch6MetYahyaKhan',
      title: 'Harder Than Snow',
      body: 'Yaḥyá Khán was chosen because his blood was meant to be harder than snow. He admits he cannot shut his gate against all Ádhirbáyján.',
    },
    {
      flag: 'ch6MetDayyan',
      title: 'Dayyán',
      body: 'Mírzá Asadu\'lláh of Khuy came to expose a pretender with a hidden question. It was answered unasked. He has a new name now, Dayyán.',
    },
    {
      flag: 'ch6MetDervish',
      title: 'Qahru\'lláh',
      body: 'A dervish walked from India toward a call he could not name. He was named Qahru\'lláh and sent home again, on foot and alone.',
    },
    {
      flag: 'ch6GaveBread',
      title: 'Bread for the Road',
      body: 'You gave the dervish your bread for the long walk back to India. He took it as if it were gold.',
    },
    {
      flag: 'ch6HeardKurds',
      title: 'A Lonely Mountain',
      body: 'A Kurdish shepherd carries water to the gate; his mother sends bread in secret. He fears the mountain will be lonely when the Prisoner is moved on.',
    },
    {
      flag: 'ch6AmanuensisChihriq',
      title: 'The Grievous Mountain',
      body: 'At Chihríq the writing has not slowed: letters to the Sháh, to the learned, prayers for the friends by name.',
    },
    {
      flag: 'ch6CourierBadasht',
      title: 'Word of Badasht',
      body: 'The courier carries news east: this summer the friends will gather in gardens at Badasht, where Qurratu\'l-ʿAyn, Quddús, and Bahá\'u\'lláh are expected.',
    },
    {
      flag: 'bayanComplete',
      title: 'The Watch at Chihríq',
      body: 'You kept watch through the night beneath the barred window. The mountain meant to make Him alone had made Him a door. Now the road leads to Badasht.',
    },
  ],
};
