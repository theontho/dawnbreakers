import type { FlagState } from '../../dialogue/types';
import type { ChapterStory } from './types';

const prisonersWitnessed = (f: FlagState): number => Number(!!f.quddusWitnessed) + Number(!!f.sadiqWitnessed);

export const chapter04Story: ChapterStory = {
  objectives: [
    {
      text: 'Find Quddús and Mullá Ṣádiq in the square',
      done: f => prisonersWitnessed(f) >= 2,
      progress: f => ({ current: prisonersWitnessed(f), total: 2 }),
    },
    {
      text: 'Find the uncle near the governor\'s gate',
      done: f => !!f.khalMet,
    },
    {
      text: 'Go east to the Vakíl Mosque and stand before the pulpit',
      done: f => !!f.vakilAddressHeard,
    },
    {
      text: 'Seek out the Sháh\'s envoy in the lane of the uncle\'s house',
      done: f => !!f.vahidTestimony,
    },
    {
      text: 'Keep watch at the uncle\'s door',
      done: f => !!f.houseArrestComplete,
    },
  ],
  journal: [
    {
      flag: 'quddusWitnessed',
      title: 'Quddús in the Square',
      body: 'You found Quddús under guard, to be driven from Shíráz for the new words sounded in the call to prayer. He told you not to look at the cord on his wrists, but at the sky.',
    },
    {
      flag: 'ch4Response',
      equals: 'compassion',
      title: 'A Cloak of Compassion',
      body: 'You asked to walk beside Quddús in silence. He called compassion a cloak no officer can strip away.',
    },
    {
      flag: 'ch4Response',
      equals: 'restraint',
      title: 'A Guarded Lamp',
      body: 'You chose to hold your tongue and bear witness. Quddús called restraint a lamp kept from the wind until a darker room needs it.',
    },
    {
      flag: 'ch4Response',
      equals: 'anger',
      title: 'Anger into Courage',
      body: 'Your anger rose at the injustice. Quddús asked you to let it become courage, not harm.',
    },
    {
      flag: 'sadiqWitnessed',
      title: 'Old Ṣádiq Laughing',
      body: 'Mullá Ṣádiq, who sounded the new call from the minaret, sat bent from the lash with a bright face. He and his companions were the first in Persia to be struck for this Cause.',
    },
    {
      flag: 'officerWarningHeard',
      title: 'Whispers Are Counted',
      body: 'An officer of Ḥusayn Khán warned you that gatherings are forbidden. Off his guard, he admitted he had never seen a beaten man laugh before.',
    },
    {
      flag: 'dyerHeardCall',
      title: 'Cloth Dark as Night',
      body: 'A dyer whose vats face the minaret stopped stirring when he heard the new call, and ruined a batch of indigo. He means to make a coat of it, to remember.',
    },
    {
      flag: 'bakerSawArrival',
      title: 'Captors Like an Escort',
      body: 'A baker saw the prisoner ride in from the Búshihr road ahead of the governor\'s horsemen, who kept back from Him like men afraid to knock over a lamp.',
    },
    {
      flag: 'khalMet',
      title: 'The Uncle\'s Surety',
      body: 'Ḥájí Mírzá Siyyid ʿAlí told you of the blow in the governor\'s hall, and of the Imám-Jumʿih who rebuked it. He gave his name as surety, and asked you to be his eyes at the Vakíl Mosque.',
    },
    {
      flag: 'decreeRead',
      title: 'The Governor\'s Decree',
      body: 'A decree by the governor\'s gate forbids gathering, repeating the young Siyyid\'s claims, or adding to the call to prayer. Someone has scratched an unreadable word beneath it.',
    },
    {
      flag: 'imamJumihMet',
      title: 'Words Instead of Blood',
      body: 'Shaykh Abú-Turáb, Imám-Jumʿih of Shíráz, arranged the Friday address so that words, not whips, would end the matter.',
    },
    {
      flag: 'vakilAddressHeard',
      title: 'The Pulpit of the Vakíl',
      body: 'From the marble steps He condemned whoever called Him the Imám\'s deputy or gate, and whoever said He denied God, the Prophet, or the Imáms. His enemies heard a retreat. You were not sure it was one.',
    },
    {
      flag: 'witnessReflected',
      title: 'He Did Not Look at the Floor',
      body: 'A merchant of the congregation said men who recant look at the floor. This one looked at them.',
    },
    {
      flag: 'sternMullaSpoke',
      title: 'The Stern Mullá Again',
      body: 'The mullá who once told you to forget His name is no happier in 1845. "This is not finished," he says.',
    },
    {
      flag: 'waterBoyMet',
      title: 'A Full Waterskin',
      body: 'A water-boy in the mosque court forgot to call his trade while the young Siyyid stood on the steps.',
    },
    {
      flag: 'mubarakMet',
      title: 'Mubárak at Another Door',
      body: 'Mubárak, who trimmed the lamp on the night of your vigil, came up from Búshihr with his Master and waits again at a door.',
    },
    {
      flag: 'khalHome',
      title: 'A Pupil in His Own House',
      body: 'The uncle who raised Him, and taught Him to keep accounts, finds himself a pupil in his own house.',
    },
    {
      flag: 'vahidTestimony',
      title: 'Vaḥíd',
      body: 'Siyyid Yaḥyá of Dáráb, sent by the Sháh to judge the claim, resolved in silence to ask for a commentary on the Súrih of Kawthar, and received it unasked. He was named Vaḥíd, the Peerless.',
    },
    {
      flag: 'houseArrestComplete',
      title: 'North from Shíráz',
      body: 'Through months of confinement and a summer of cholera you kept watch. Released on condition that He leave the city, He set out for Iṣfahán, and you followed.',
    },
  ],
};
