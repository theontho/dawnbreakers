import { pitCompanyCount } from '../dialogues_ch/chapter10_siyah_chal';
import { streetTestimonyCount } from '../dialogues_ch/chapter10_street';
import type { ChapterStory } from './types';

export const chapter10Story: ChapterStory = {
  objectives: [
    {
      text: 'Hear what Ṭihrán whispers of the arrests',
      done: f => streetTestimonyCount(f) >= 2 || !!f.ch10Arrested,
      progress: f => ({ current: Math.min(streetTestimonyCount(f), 2), total: 2 }),
    },
    {
      text: 'Ask the guard to let you go down to the prisoners',
      done: f => !!f.ch10Arrested,
    },
    {
      text: 'Keep company with the men in the chained rows',
      done: f => pitCompanyCount(f) >= 3,
      progress: f => ({ current: Math.min(pitCompanyCount(f), 3), total: 3 }),
    },
    {
      text: 'Keep watch where the light falls, and answer when your name is called',
      done: f => !!f.ch10Released,
    },
    {
      text: 'Go out by the western gate, where the road to Baghdád begins',
      done: f => !!f.dawnComplete,
    },
  ],
  journal: [
    {
      flag: 'ch10HeardAttempt',
      title: 'Birdshot at Níyávarán',
      body: 'Two young Bábís, half mad with grief, fired on the Sháh with a pistol charged with birdshot. Every Bábí in Persia now stands accused, and Bahá\'u\'lláh, though innocent, rode to the royal camp of His own accord.',
    },
    {
      flag: 'ch10HeardProcession',
      title: 'The Road from Shimírán',
      body: 'A water-seller watched Bahá\'u\'lláh driven on foot, in chains, under the August sun. When an old woman pressed forward with a stone, He told the guards not to stop her, nor deny her the act she thought meritorious.',
    },
    {
      flag: 'ch10MetZahra',
      title: 'Zahrá at the Stair',
      body: 'A young woman waits by the prison stair for her brother Riḍá. She told you of a veiled lady with a boy of eight, whose house was plundered, who sold the gold buttons from her robe for bread.',
    },
    {
      flag: 'ch10CarriedBread',
      title: 'Bread for Riḍá',
      body: 'You took Zahrá\'s bread, folded in a cloth, to carry down to her brother if you could.',
    },
    {
      flag: 'heardStreetAccusation',
      title: 'Fear Without a Face',
      body: 'The crowd says the Bábís meant to burn the city. Nobody has met one who did anything but give good weight and ask after their mother.',
    },
    {
      flag: 'ch10SawPlunder',
      title: 'The Broken Door',
      body: 'You found a Bábí household stripped to the tiles, its door hanging from one hinge and a child\'s slipper in the lane.',
    },
    {
      flag: 'ch10Arrested',
      title: 'Chained at the Stair',
      body: 'You asked to go down to the prisoners. Only the chained go down, the guard said. You held out your hands.',
    },
    {
      flag: 'ch10JoinedChant',
      title: 'God Is Sufficient',
      body: 'Night after night the two rows chant: "God is sufficient unto me; He verily is the All-Sufficing!" and "In Him let the trusting trust." The sound climbs the stair and goes out over the city.',
    },
    {
      flag: 'heardPrisonerHope',
      title: 'The Cobbler\'s Witness',
      body: 'A cobbler in the rows says hope is not the absence of fear, but the lamp that makes fear cast a smaller shadow. The men called up at dawn go up the stair lighter than they came down.',
    },
    {
      flag: 'ch10HeardSulayman',
      title: 'Candles in the Bazaar',
      body: 'Ḥájí Muḥsin, who has lost house and trade, told you how Sulaymán Khán was led through the bazaar with lighted candles in his wounds, walking as a bridegroom walks.',
    },
    {
      flag: 'ch10MetRida',
      title: 'Riḍá',
      body: 'Zahrá\'s brother is nineteen. When the farrásh asked if he was a Bábí, he found he could not say no.',
    },
    {
      flag: 'ch10GaveBread',
      title: 'Half the Loaf',
      body: 'You gave Riḍá his sister\'s bread in the dark. He broke it and passed half along the row before he had tasted it.',
    },
    {
      flag: 'sawChains',
      title: 'Qará-Guhar',
      body: 'You saw the chain the prisoners call Qará-Guhar, locked for four months about one neck. Its marks would stay with Him all His life.',
    },
    {
      flag: 'ch10HeardTahirih',
      title: 'The Ílkhání Garden',
      body: 'The jailer told you that Ṭáhirih was taken by night to the Ílkhání garden, dressed as for a wedding, and put to death there.',
    },
    {
      flag: 'ch10WitnessedDawn',
      title: 'The Hidden Dawn',
      body: 'You kept watch where the light falls. You saw nothing and heard nothing, only a stillness that made the chains quiet. Years later He would write of what came to Him in that darkness.',
    },
    {
      flag: 'ch10Released',
      title: 'Your Name Is Called',
      body: 'In December the jailer called your name, for release. Bahá\'u\'lláh had gone up before you, His innocence proved, ordered to leave Persia. He chose Baghdád.',
    },
    {
      flag: 'ch10ShopkeeperAnswers',
      title: 'Answering Under His Breath',
      body: 'The shopkeeper has opened again. On windy nights he heard the chant from the pit, and caught himself answering it as he folded cloth.',
    },
    {
      flag: 'ch10GuardRemembers',
      title: 'What the Sháh Heard',
      body: 'The guard, now at the western gate, says the Sháh himself heard the chanting in his palace and asked what it was. Some nights the guard found he knew the words.',
    },
    {
      flag: 'ch10HeardDeparture',
      title: 'Before First Light',
      body: 'A muleteer saw the exiles leave for Baghdád in deep winter, under escort, ill-clad for the mountains. He saw how carefully they helped Bahá\'u\'lláh onto the grey mule.',
    },
    {
      flag: 'ch10SisterReunited',
      title: 'Always Bringing Bread',
      body: 'Zahrá and Riḍá came to the gate to see the exiles off. Riḍá sings all day now, and some of the neighbours have begun to answer.',
    },
    {
      flag: 'ch10Final',
      equals: 'kept',
      title: 'The Sun Underground',
      body: 'In Shíráz the lamp went out because the sun had made it needless. In the Black Pit you learned the sun could rise underground. You followed the tracks west.',
    },
    {
      flag: 'ch10Final',
      equals: 'answered',
      title: 'Your Answer, at Last',
      body: 'Eight years ago you asked for time. You were given eight years and a winter in the dark, and at the western gate you were ready to say what you saw. You followed the tracks west.',
    },
    {
      flag: 'ch10Final',
      equals: 'ready',
      title: 'Ready to Say',
      body: 'Eight years after the lamplit door in Shíráz, and a winter in the dark, you were ready at the western gate to say what you saw. You followed the tracks west.',
    },
    {
      flag: 'ch10Final',
      equals: 'following',
      title: 'Which Way the Tracks Go',
      body: 'You did not yet have words for what you saw in the dark. You knew which way the tracks went, and you followed them west.',
    },
  ],
};
