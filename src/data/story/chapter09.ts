import { squareWitnessCount } from '../dialogues_ch/chapter09_tabriz';
import type { ChapterStory } from './types';

export const chapter09Story: ChapterStory = {
  objectives: [
    {
      text: 'Hear what the barrack square knows before the hour',
      done: f => squareWitnessCount(f) >= 2,
      progress: f => ({ current: Math.min(squareWitnessCount(f), 2), total: 2 }),
    },
    {
      text: 'Find Sám Khán beside his regiment',
      done: f => !!f.samKhanPlea,
    },
    {
      text: 'Climb to the rooftops and keep watch at the parapet',
      done: f => !!f.ch9WitnessedVolleys,
    },
    {
      text: 'Return to the square and stand before the empty wall',
      done: f => !!f.martyrdomComplete,
    },
  ],
  journal: [
    {
      flag: 'ch9HeardWaterSeller',
      title: 'Water for Nothing',
      body: 'A water-seller poured for free in memory of the thirst of Karbilá. That morning the Báb had been led bareheaded through Tabríz, stripped of His green turban and sash.',
    },
    {
      flag: 'ch9HeardFarrash',
      title: 'An Interrupted Conversation',
      body: 'The Farrásh-Báshí pulled the Báb away from His secretary mid-sentence, and was told that no power on earth could silence Him until He had finished.',
    },
    {
      flag: 'ch9MetAnis',
      title: 'Anís',
      body: 'Anís, a youth of Tabríz whose stepfather had locked him away, was the only one who rose when the Báb asked for a friend\'s hand. He was promised that he would be with Him instead.',
    },
    {
      flag: 'ch9HeardSoldier',
      title: 'The First File',
      body: 'An Armenian soldier in Sám Khán\'s regiment thought of his grandmother\'s icon, and asked you to pray for men who had not chosen the square.',
    },
    {
      flag: 'ch9SawCellDoor',
      title: 'A Door in Tabríz',
      body: 'The guard at the cell door said the companions had been cheerful through their last night, as if at a wedding. You thought of a door in Shíráz.',
    },
    {
      flag: 'ch9SawPillar',
      title: 'The Nail',
      body: 'A new iron nail had been driven into the pillar between the cell and the next room, and two ropes hung from it.',
    },
    {
      flag: 'samKhanPlea',
      title: 'Sám Khán\'s Plea',
      body: 'The Christian colonel Sám Khán asked to be freed from shedding the Báb\'s blood, and was told: follow your instructions, and if your intention be sincere, the Almighty is surely able to relieve you of your perplexity.',
    },
    {
      flag: 'heardCrowdWitness',
      title: 'On the Roofs',
      body: 'Thousands crowded the roofs around the barrack square. A shopkeeper who had seen the Báb led past said He walked like one hearing music from another room.',
    },
    {
      flag: 'ch9HeardWidow',
      title: 'Bread for a Prisoner',
      body: 'A baker\'s widow\'s small son held out bread as the Báb passed. "He looked at my son as though He had been given a kingdom."',
    },
    {
      flag: 'ch9HeardStudent',
      title: 'A Student\'s Challenge',
      body: 'A madrasa student came to see a heresy ended, and dared God to show the truth before ten thousand eyes. His knuckles were white.',
    },
    {
      flag: 'firstVolleyFailed',
      title: 'The First Volley',
      body: 'Seven hundred and fifty rifles fired. When the smoke cleared, Anís stood unhurt, the ropes were severed, and the Báb was found in His room, completing His conversation with His secretary.',
    },
    {
      flag: 'ch9WitnessedVolleys',
      title: 'Noon Became Night',
      body: 'Sám Khán withdrew his regiment and would not fire again. Another regiment was brought. At the second volley you lowered your eyes, and a gale of dust darkened Tabríz from noon until night.',
    },
    {
      flag: 'ch9StudentShaken',
      title: 'It Proved Nothing',
      body: 'The madrasa student insisted the day had proved nothing, and could not stop shaking.',
    },
    {
      flag: 'ch9FarrashResigned',
      title: 'The Coat Returned',
      body: 'The Farrásh-Báshí heard the Báb say, "I have finished My conversation. Now you may proceed to fulfil your intention." He left the barracks and his post, never to return.',
    },
    {
      flag: 'ch9SawOpenCell',
      title: 'The Open Cell',
      body: 'Afterwards the cell door stood open: a mat, a water jug, a pen case, and a square of light on the floor.',
    },
    {
      flag: 'ch9WaterSellerAfter',
      title: 'A Dropped Cup',
      body: 'The water-seller left the soldier\'s dropped cup where it fell, and went on pouring for whoever was thirsty.',
    },
    {
      flag: 'ch9WidowAfter',
      title: 'The Sun Has Gone In',
      body: 'The baker\'s widow covered her son\'s eyes. When the dust came he said the sun had gone in, and she told him it would come back.',
    },
    {
      flag: 'ch9HeardAmanuensis',
      title: 'Siyyid Ḥusayn of Yazd',
      body: 'The Báb\'s amanuensis, who was with Him in the cell, had been bidden to live and carry what was entrusted to him. Staying behind, he said, was its own kind of offering.',
    },
    {
      flag: 'ch9HeardCoppersmith',
      title: 'A Mark Under the Handle',
      body: 'An old coppersmith heard the volleys and the silence after. Every pot he makes will carry a small hidden mark.',
    },
    {
      flag: 'martyrdomComplete',
      title: 'The Empty Wall',
      body: 'The Báb was martyred with Anís in the barrack square of Tabríz at noon on 9 July 1850. Their bodies were cast beside the moat, and on the second night friends carried them away in secret.',
    },
  ],
};
