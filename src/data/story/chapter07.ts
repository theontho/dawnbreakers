import { gardensVisited } from '../dialogues_ch/chapter07_gardens';
import type { ChapterStory } from './types';

export const chapter07Story: ChapterStory = {
  objectives: [
    {
      text: 'Find the steward who receives the guests at Badasht',
      done: f => !!f.ch7Arrived,
    },
    {
      text: 'Go up the lane and visit the three gardens',
      done: f => gardensVisited(f) >= 3,
      progress: f => ({ current: gardensVisited(f), total: 3 }),
    },
    {
      text: 'Join the assembly in the Host\'s garden',
      done: f => !!f.ch7WitnessedUnveiling,
    },
    {
      text: 'Hear Ṭáhirih and Quddús after the proclamation',
      done: f => !!f.ch7HeardTahirih && !!f.ch7QuddusAfter,
      progress: f => ({ current: Number(!!f.ch7HeardTahirih) + Number(!!f.ch7QuddusAfter), total: 2 }),
    },
    {
      text: 'Return to the messenger at the Host\'s tent',
      done: f => !!f.badashtComplete,
    },
  ],
  journal: [
    {
      flag: 'ch7Arrived',
      title: 'Eighty-One Guests',
      body: 'At Badasht a steward received you as a guest of Mírzá Ḥusayn-ʿAlí of Núr, whom the friends have begun to call Bahá. He has rented three gardens: for Quddús, for Ṭáhirih, and for Himself.',
    },
    {
      flag: 'ch7HeardCook',
      title: 'One Purse',
      body: 'A widow of Sháhrúd cooks for the whole gathering, paid from one purse. She has never fed men who argued so much and quarrelled so little.',
    },
    {
      flag: 'ch7HeardKhurasan',
      title: 'What Are We?',
      body: 'A believer who came with Quddús from Mashhad says the friends must decide whether they are a sect, or the first people of a new Day. Mullá Ḥusayn stayed behind in Mashhad.',
    },
    {
      flag: 'ch7HeardVillager',
      title: 'Polite Madmen',
      body: 'The gardener of Badasht thinks the guests are polite madmen. His wife climbed the garden wall to hear the learned lady who teaches from behind a curtain.',
    },
    {
      flag: 'ch7HeardCurtain',
      title: 'Behind the Curtain',
      body: 'Ṭáhirih taught from behind a curtain in her garden: the graves that open on the Day of Resurrection are hearts. A promise carried a thousand years must be set down where all can see.',
    },
    {
      flag: 'ch7MetQuddus',
      title: 'Two Right Answers',
      body: 'Quddús told you that he and Ṭáhirih disagree: she would proclaim the end of the old law now; he fears for friends still new to their feet. "We are both right, and that is the difficulty."',
    },
    {
      flag: 'ch7SawTent',
      title: 'The Lamplit Tent',
      body: 'You waited at the threshold of the Host\'s tent. Each day a friend is called in and comes out with a new name. The Host Himself is now called Bahá.',
    },
    {
      flag: 'ch7HeardNames',
      title: 'The Keeper of Names',
      body: 'A young believer records each day\'s new name and each old custom laid aside. "It feels like being born in public."',
    },
    {
      flag: 'ch7HeardBarfurushi',
      title: 'Watch His Eyes',
      body: 'In Quddús\'s tent a man of Bárfurúsh who had known him since boyhood poured you coffee. He had never seen Quddús angry longer than it takes to drink a cup.',
    },
    {
      flag: 'ch7SawPapers',
      title: 'A Letter Worn Soft',
      body: 'On Quddús\'s desk, under a half-written page, lay a letter worn soft at the creases. You did not unfold it.',
    },
    {
      flag: 'ch7WitnessedUnveiling',
      title: 'The Day the Veil Fell',
      body: 'Ṭáhirih entered the assembly unveiled and proclaimed that the fetters of the past were broken. Men cried out and fled; Quddús disputed with her before everyone; from the tent came word to chant the Súrih of the Inevitable.',
    },
    {
      flag: 'badashtResponse',
      equals: 'shock',
      title: 'Your Unease',
      body: 'You told Ṭáhirih the unveiling shocked you, but that you would listen before judging.',
    },
    {
      flag: 'badashtResponse',
      equals: 'defence',
      title: 'Your Defence',
      body: 'You told Ṭáhirih she spoke with the courage of one who knew her hour.',
    },
    {
      flag: 'badashtResponse',
      equals: 'silence',
      title: 'Your Silence',
      body: 'You kept silent before Ṭáhirih, weighing what had changed. She asked that your silence be a witness, not a hiding place.',
    },
    {
      flag: 'badashtResponse',
      equals: 'seeking',
      title: 'Your Question',
      body: 'You asked Ṭáhirih what the sign meant. A new Day has opened, she said, and the veils of a past age cannot govern its sun.',
    },
    {
      flag: 'ch7HeardTahirih',
      title: 'Wind and Light',
      body: 'Ṭáhirih grieves for those who fled. "A door flung open lets in the wind as well as the light. Those who stay will learn to stand in both."',
    },
    {
      flag: 'ch7QuddusAfter',
      title: 'The Physician\'s Way',
      body: 'Quddús hinted that his quarrel with Ṭáhirih was a kindness: by standing against her he let the frightened stand with him, and stay, until they found the two were on one road.',
    },
    {
      flag: 'ch7TentAfter',
      title: 'The Lamp Across the Meadow',
      body: 'After the assembly Quddús sent the friends who wanted to take his side to wait at the Host\'s tent instead. Then he had his tent flap tied back, to see the lamp in Ṭáhirih\'s garden.',
    },
    {
      flag: 'ch7SteadiedBeliever',
      title: 'A Shaken Friend',
      body: 'You sat with a believer whose certainties had been overturned, and he resolved to listen before speaking against the light.',
    },
    {
      flag: 'ch7SpokeToLeaver',
      title: 'Those Who Could Not Stay',
      body: 'A believer left Badasht after the unveiling, wanting a Day that looked like what he had expected. He was not the only one.',
    },
    {
      flag: 'badashtComplete',
      title: 'One Purpose',
      body: 'In the lamplit tent Bahá\'u\'lláh received the friends one by one and drew them back to one purpose. The old dispensation was left behind. Now most of the friends ride for Mázindarán, and Mullá Ḥusayn has raised a black standard in Khurásán. You turned west, toward Tabríz.',
    },
  ],
};
