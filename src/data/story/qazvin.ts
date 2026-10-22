import { KARBILA_NEEDED, karbilaRounds, QAZVIN_NEEDED, qazvinRounds } from '../maps/qazvinPhases';
import type { ChapterStory } from './types';

export const qazvinStory: ChapterStory = {
  objectives: [
    {
      text: 'Sit among the listeners in the house of Siyyid Káẓim',
      done: f => karbilaRounds(f) >= KARBILA_NEEDED && !!f.qzHeardCurtain,
      progress: f => ({ current: Math.min(karbilaRounds(f), KARBILA_NEEDED), total: KARBILA_NEEDED }),
    },
    {
      text: 'Return to the empty place before the curtain',
      done: f => !!f.qzLeftKarbila,
    },
    {
      text: 'Hear what Qazvín says, and go to Mullá Ṣáliḥ\'s house',
      done: f => qazvinRounds(f) >= QAZVIN_NEEDED,
      progress: f => ({ current: Math.min(qazvinRounds(f), QAZVIN_NEEDED), total: QAZVIN_NEEDED }),
    },
    {
      text: 'Find Marḍíyyih in her father\'s court',
      done: f => !!f.qzNight,
    },
    {
      text: 'Keep watch in the lane, and find who waits beyond the postern',
      done: f => !!f.qzHadiReady,
    },
    {
      text: 'Speak with the veiled woman by the horses',
      done: f => !!f.qazvinComplete,
    },
  ],
  journal: [
    {
      flag: 'qzHeardCurtain',
      title: 'Behind the Curtain',
      body: 'In the house of the late Siyyid Káẓim, Qurratu\'l-ʿAyn taught the men from behind a curtain. She had never seen the Báb: she sent her sealed letter with her sister\'s husband, and was counted among the Letters of the Living.',
    },
    {
      flag: 'qzMetSalih',
      title: 'Shaykh Ṣáliḥ',
      body: 'An Arab of Karbilá who sold cloth until he heard her, and now carried her letters and kept her door. He read you one of her odes, of a Beauty that pierced the veil of night.',
    },
    {
      flag: 'qzMetDoubter',
      title: 'Right, but not Quietly',
      body: 'A disciple of the late Siyyid believed, but feared her boldness. Some of the friends had written to Shíráz to complain of her.',
    },
    {
      flag: 'qzSawBrightDress',
      title: 'The First of Muḥarram',
      body: 'While Karbilá mourned the Imám Ḥusayn, Qurratu\'l-ʿAyn kept the Báb\'s birthday, and her sister Marḍíyyih put off her black for saffron silk.',
    },
    {
      flag: 'qzLeftKarbila',
      title: 'Baghdád and the Road Home',
      body: 'Accused before the governor, she was sent to Baghdád and lodged in the house of the muftí, then expelled from ʿIráq. She taught through Kirmánsháh and Hamadán, and at her father\'s plea went home to Qazvín.',
    },
    {
      flag: 'qzHeardDawn',
      title: 'At Dawn Prayer',
      body: 'Her uncle Mullá Taqí, who had cursed Shaykh Aḥmad from the pulpit, was struck down in his mosque at dawn. His sons blamed her. A man of Shíráz, an admirer of Shaykh Aḥmad, confessed that the deed was his.',
    },
    {
      flag: 'qzMetFarrash',
      title: 'The List',
      body: 'A farrásh outside the mosque had a list of names: Shaykh Ṣáliḥ, Mullá Ṭáhir, Ḥájí Asadu\'lláh. "The heirs want blood for blood," he said, "and they are not particular whose."',
    },
    {
      flag: 'qzMetFather',
      title: 'Her Father',
      body: 'Ḥájí Mullá Ṣáliḥ had taught his daughter himself. He had tried to make peace in his family and failed, and now she was confined in his house under her cousins\' watch.',
    },
    {
      flag: 'qzHeardDoor',
      title: 'A Curtain of Walnut',
      body: 'Through the closed door of the women\'s court she told you she had wished her uncle awake, not dead. "I was not born in this room," she said. "I will not end in it."',
    },
    {
      flag: 'qzNight',
      title: 'Nine Days',
      body: 'Shaykh Ṣáliḥ was put to death in Ṭihrán, the first believer to shed his blood on Persian soil, and other prisoners were killed in Qazvín. She sent word to her husband: if her Cause were true, God would free her within nine days.',
    },
    {
      flag: 'qzMetKhatun',
      title: 'A Beggar at the Gate',
      body: 'The beggar by Mullá Ṣáliḥ\'s gate was Khátún-Ján, wife of Muḥammad-Hádí Farhádí. She had carried a sealed letter from Ṭihrán into the house.',
    },
    {
      flag: 'qzHadiReady',
      title: 'Three Horses',
      body: 'Beyond the postern Muḥammad-Hádí waited with three horses, though his own uncle, Ḥájí Asadu\'lláh, had been put to death in prison in Ṭihrán.',
    },
    {
      flag: 'qazvinComplete',
      title: 'The Solace of the Eyes',
      body: 'Before the ninth day she was safe in the house of Bahá\'u\'lláh in Ṭihrán. From there He sent her on toward Khurásán, and to the gardens of Badasht.',
    },
  ],
};
