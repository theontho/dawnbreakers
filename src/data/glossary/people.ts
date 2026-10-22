import { person, type GlossaryEntry } from './kinds';

/**
 * People of the story, as the history records them. The Báb and Bahá'u'lláh
 * are spoken of here as in the text; they are never characters in the game.
 */
export const PEOPLE: readonly GlossaryEntry[] = [
  // The twin figures, spoken of only.
  person('the-bab', 'The Báb', ['Báb'],
    '"The Gate": the title of Siyyid ʿAlí-Muḥammad of Shíráz (1819 to 1850), a young merchant who in 1844 declared that He was the Promised One awaited by Islam and the herald of One greater still. He was imprisoned in the mountain fortresses and executed in Tabríz in 1850.'),
  person('bahaullah', 'Bahá\'u\'lláh', ['Bahá\'u\'lláh'],
    '"The Glory of God": the title of Mírzá Ḥusayn-ʿAlí of Núr (1817 to 1892), a nobleman who became a foremost follower of the Báb. Imprisoned in the Síyáh-Chál in 1852 and exiled to Baghdád, in 1863 He declared that He was the One the Báb had foretold, and founded the Baháʾí Faith.'),

  // The Letters of the Living and the believers.
  person('mulla-husayn', 'Mullá Ḥusayn', ['Mullá Ḥusayn'],
    'Mullá Ḥusayn of Bushrúyih, a student of Siyyid Káẓim and the first to believe in the Báb, on the night of 22 May 1844. He led the defence of Shaykh Ṭabarsí, where he fell in 1849.'),
  person('quddus', 'Quddús', ['Quddús'],
    '"The Most Holy": Mullá Muḥammad-ʿAlí of Bárfurúsh, the last of the Letters of the Living and the foremost. He went with the Báb on pilgrimage to Mecca, and after the siege of Shaykh Ṭabarsí was put to death in Bárfurúsh in May 1849.'),
  person('tahirih', 'Ṭáhirih', ['Ṭáhirih'],
    '"The Pure One": Fáṭimih of Qazvín, a poet and scholar, and the only woman among the Letters of the Living. At Badasht in 1848 she appeared unveiled to proclaim that a new age had begun. She was put to death in Ṭihrán in 1852.'),
  person('bastami', 'Mullá ʿAlíy-i-Basṭámí', ['Mullá ʿAlíy-i-Basṭámí'],
    'The second Letter of the Living, the first sent out to teach. He was tried in Baghdád in 1845 and died a prisoner of the Ottomans.'),
  person('vahid', 'Vaḥíd', ['Vaḥíd', 'Siyyid Yaḥyá'],
    'Siyyid Yaḥyá of Dáráb, one of the most learned men in Persia, sent by Muḥammad Sháh to examine the Báb\'s claim. He became a believer, and was slain at Nayríz in 1850.'),
  person('anis', 'Anís', ['Anís'],
    'Mírzá Muḥammad-ʿAlí of Zunúz, a young disciple who asked to share the Báb\'s fate, and was executed with Him in Tabríz on 9 July 1850.'),
  person('mulla-sadiq', 'Mullá Ṣádiq', ['Mullá Ṣádiq'],
    'Mullá Ṣádiq of Khurásán, a revered teacher who added the Báb\'s words to the call to prayer in Shíráz in 1845, and was beaten and driven from the city with Quddús.'),
  person('dayyan', 'Dayyán', ['Dayyán'],
    'Mírzá Asadu\'lláh of Khuy, a learned secretary who came to the Báb at Chihríq doubting, and left believing. The Báb named him Dayyán, "the Judge".'),
  person('sulayman-khan', 'Sulaymán Khán', ['Sulaymán Khán'],
    'A believer of Ṭihrán who in August 1852 was led through the city with lighted candles set in his wounds, singing as he went.'),
  person('mubarak', 'Mubárak', ['Mubárak'],
    'An Ethiopian servant of the Báb\'s household in Shíráz, who went with Him on the pilgrimage to Mecca.'),
  person('khadijih', 'Khadíjih-Bagum', ['Khadíjih-Bagum'],
    'The wife of the Báb, married in 1842, and the first woman to believe in Him.'),
  person('nabil', 'Nabíl', ['Nabíl'],
    'Nabíl-i-Aʿẓam, Mullá Muḥammad of Zarand (1831 to 1892), a believer who gathered the memories of the survivors into The Dawn-Breakers, the history this game follows.'),

  // Teachers.
  person('siyyid-kazim', 'Siyyid Káẓim', ['Siyyid Káẓim'],
    'Siyyid Káẓim of Rasht (died 1843), the leader of the Shaykhí school in Karbilá. He told his students that the Promised One was near, and sent them out to seek Him.'),

  // Kings, ministers and governors.
  person('muhammad-shah', 'Muḥammad Sháh', ['Muḥammad Sháh'],
    'The Qajar king of Persia from 1834 until his death in 1848.'),
  person('nasiri-d-din-shah', 'Náṣiri\'d-Dín Sháh', ['Náṣiri\'d-Dín Sháh'],
    'The Qajar king of Persia from 1848 to 1896, under whom the Báb was executed and the believers persecuted.'),
  person('aqasi', 'Ḥájí Mírzá Áqásí', ['Ḥájí Mírzá Áqásí'],
    'Muḥammad Sháh\'s Grand Vizier, once the king\'s tutor. He kept the Báb from the capital and sent Him to the fortresses of Mákú and Chihríq.'),
  person('manuchihr', 'Manúchihr Khán', ['Manúchihr Khán', 'Muʿtamid'],
    'The Muʿtamidu\'d-Dawlih, governor of Iṣfahán: born in Georgia and brought to Persia as a captive boy, he rose to great power. He sheltered the Báb in his own palace until his death in 1847.'),
  person('gurgin-khan', 'Gurgín Khán', ['Gurgín Khán'],
    'Manúchihr Khán\'s nephew and heir, who on his uncle\'s death sent the Báb out of Iṣfahán under guard.'),
  person('husayn-khan', 'Ḥusayn Khán', ['Ḥusayn Khán'],
    'The governor of Fárs, who had the Báb struck in his presence and kept Him under watch in Shíráz.'),
  person('sam-khan', 'Sám Khán', ['Sám Khán'],
    'The Christian colonel of the Armenian regiment ordered to shoot the Báb in Tabríz. When the first volley left the Báb unharmed, he refused to fire again.'),

  // Clerics.
  person('abu-turab', 'Shaykh Abú-Turáb', ['Shaykh Abú-Turáb', 'Abú-Turáb'],
    'The Imám-Jumʿih of Shíráz, a moderate man who shielded the Báb from the worst of His enemies there.'),
  person('saidu-l-ulama', 'Saʿídu\'l-ʿUlamá', ['Saʿídu\'l-ʿUlamá'],
    'The leading cleric of Bárfurúsh, the fiercest enemy of Quddús.'),
  person('muhit', 'Mírzá Muḥíṭ', ['Mírzá Muḥíṭ-i-Kirmání', 'Mírzá Muḥíṭ'],
    'Mírzá Muḥíṭ of Kirmán, a Shaykhí leader whom the Báb challenged at the Kaʿba in 1844 to accept or deny His claim. He gave no answer.'),
  person('mamaqani', 'Mullá Muḥammad of Mamaqán', ['Mullá Muḥammad of Mamaqán'],
    'A Shaykhí leader of Tabríz, who wrote the Báb\'s death sentence.'),

  // Poets.
  person('hafiz', 'Ḥáfiẓ', ['Ḥáfiẓ'],
    'The great poet of Shíráz (died 1390). Persians still open his Díván to take a fál.'),
];
