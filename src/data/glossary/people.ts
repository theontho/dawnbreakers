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
  person('tahirih', 'Ṭáhirih', ['Ṭáhirih', 'Qurratu\'l-ʿAyn'],
    '"The Pure One": Fáṭimih of Qazvín, a poet and scholar whom Siyyid Káẓim called Qurratu\'l-ʿAyn, "Solace of the Eyes", and the only woman among the Letters of the Living. At Badasht in 1848 she appeared unveiled to proclaim that a new age had begun. She was put to death in Ṭihrán in 1852.'),

  // Karbilá and Qazvín, 1845 to 1848.
  person('mardiyyih', 'Marḍíyyih', ['Marḍíyyih'],
    'Ṭáhirih\'s sister, wife of Mírzá Muḥammad-ʿAlí of Qazvín, the Letter of the Living who carried Ṭáhirih\'s sealed letter to the Báb. She shared her sister\'s faith.'),
  person('shaykh-salih', 'Shaykh Ṣáliḥ', ['Shaykh Ṣáliḥ'],
    'An Arab of Karbilá who believed through Ṭáhirih and went with her to Qazvín. Named by Mullá Taqí\'s heirs as his murderer, he was put to death in Ṭihrán in 1847, the first believer to shed his blood on the soil of Persia.'),
  person('mulla-salih', 'Mullá Ṣáliḥ', ['Mullá Ṣáliḥ'],
    'Ḥájí Mullá Ṣáliḥ Baraghání, a leading mujtahid of Qazvín and Ṭáhirih\'s father, who taught her himself. Nabíl calls him peace-loving and fair-minded; he tried and failed to reconcile her with his brother\'s family.'),
  person('mulla-taqi', 'Mullá Taqí', ['Mullá Taqí'],
    'Ḥájí Mullá Muḥammad-Taqí Baraghání, Ṭáhirih\'s uncle and father-in-law, the foremost divine of Qazvín and a fierce enemy of the Shaykhís. He was stabbed at dawn prayer in his mosque in 1847. A Mullá ʿAbdu\'lláh of Shíráz, an admirer of Shaykh Aḥmad, confessed to the killing; the heirs blamed Ṭáhirih and the Bábís.'),
  person('muhammad-hadi', 'Muḥammad-Hádí', ['Muḥammad-Hádí'],
    'Muḥammad-Hádíy-i-Farhádí, a believer of Qazvín whose uncle was killed in the reprisals of 1847. Sent by Bahá\'u\'lláh, he brought Ṭáhirih secretly by night from Qazvín to Ṭihrán.'),
  person('khatun-jan', 'Khátún-Ján', ['Khátún-Ján'],
    'The wife of Muḥammad-Hádí Farhádí. Disguised as a beggar, she carried a sealed letter into the house where Ṭáhirih was confined, and brought her out.'),
  person('bastami', 'Mullá ʿAlíy-i-Basṭámí', ['Mullá ʿAlíy-i-Basṭámí'],
    'The second Letter of the Living, the first sent out to teach. He was tried in Baghdád in 1845 and died a prisoner of the Ottomans.'),
  person('vahid', 'Vaḥíd', ['Vaḥíd', 'Siyyid Yaḥyá'],
    'Siyyid Yaḥyá of Dáráb, one of the most learned men in Persia, sent by Muḥammad Sháh to examine the Báb\'s claim. He became a believer, and was named Vaḥíd, "the Peerless". In 1850 he took refuge with some seventy-two companions in the fort of Khájih above Nayríz; lured out by an oath sworn on the Qur\'án, he was slain on 29 June 1850, ten days before the Báb.'),
  person('anis', 'Anís', ['Anís'],
    'Mírzá Muḥammad-ʿAlí of Zunúz, a young disciple who asked to share the Báb\'s fate, and was executed with Him in Tabríz on 9 July 1850.'),
  person('azim', 'ʿAẓím', ['ʿAẓím'],
    'Mullá Shaykh ʿAlí of Khurásán, whom the Báb named ʿAẓím, "the Great". On the eve of the examination at Tabríz in 1848 the Báb told him that He was the Qáʾim. He was put to death in Ṭihrán in 1852.'),
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

  // Ṭihrán and Núr, 1844.
  person('mirza-buzurg', 'Mírzá Buzurg', ['Mírzá Buzurg'],
    'Mírzá ʿAbbás of Núr, called Mírzá Buzurg (died 1839), a minister of the Qajar court and a celebrated calligrapher, the father of Bahá\'u\'lláh. His fortunes failed in his last years: a flood took half his house at Tákur, and envious rivals took his posts.'),
  person('mirza-musa', 'Mírzá Músá', ['Mírzá Músá'],
    'Áqáy-i-Kalím, the brother of Bahá\'u\'lláh and His companion in every exile. He was at the gate when the tutor brought Mullá Ḥusayn\'s scroll in 1844, and told the story to Nabíl.'),
  person('muallim', 'Mullá Muḥammad-i-Muʿallim', ['Mullá Muḥammad-i-Muʿallim'],
    'A tutor from Núr, a student of the Shaykhí teacher in the madrasa of Mírzá Ṣáliḥ in Ṭihrán. In 1844 he carried Mullá Ḥusayn\'s scroll to Bahá\'u\'lláh at dawn, and brought back His answer.'),
  person('khurasani', 'Ḥájí Mírzá Muḥammad-i-Khurásání', ['Ḥájí Mírzá Muḥammad'],
    'The leader of the Shaykhís of Ṭihrán in 1844, who taught in the madrasa of Mírzá Ṣáliḥ, and turned away Mullá Ḥusayn and his message.'),
  person('mulla-abbas', 'Mullá ʿAbbás', ['Mullá ʿAbbás'],
    'A son-in-law and disciple of the late mujtahid of Núr, sent with Mírzá Abu\'l-Qásim in 1844 to examine Bahá\'u\'lláh. He forgot his questions, stood by the door, and never went back to his teacher.'),
  person('abul-qasim', 'Mírzá Abu\'l-Qásim', ['Mírzá Abu\'l-Qásim'],
    'A son-in-law and disciple of the late mujtahid of Núr, Mullá ʿAbbás\'s companion on the errand of 1844, who vowed the rest of his life to the service of the One he had been sent to examine.'),

  // Nayríz, 1850.
  person('zaynul-abidin-khan', 'Zaynu\'l-ʿÁbidín Khán', ['Zaynu\'l-ʿÁbidín Khán'],
    'The governor of Nayríz in 1850, who threatened death to any who welcomed Vaḥíd, besieged him in the fort of Khájih with the help of regiments from Shíráz, and broke the oath sworn on the Qur\'án that drew him out.'),

  // Zanján, 1850 to 1851.
  person('hujjat', 'Ḥujjat', ['Ḥujjat'],
    '"The Proof": the title the Báb gave Mullá Muḥammad-ʿAlí of Zanján, a learned and outspoken divine who believed with much of his congregation. In 1850 he and some three thousand believers held the fort of ʿAlí-Mardán Khán against royal regiments for months. Wounded at his ablutions, he died in prayer in January 1851.'),
  person('zaynab', 'Zaynab', ['Zaynab', 'Rustam-ʿAlí'],
    'A village girl near Zanján who cut her hair, put on men\'s clothes and kept the barricades for five months in 1850. Ḥujjat named her Rustam-ʿAlí, after the hero of Persian legend. She fell in a charge.'),
  person('umm-i-ashraf', 'Umm-i-Ashraf', ['Umm-i-Ashraf'],
    '"Mother of Ashraf": a woman of Zanján who bore her son Ashraf in the besieged fort and vowed him to God. Years later, when he was put to death for his faith, she bade him be steadfast.'),
  person('mihr-ali', 'Mihr-ʿAlí', ['Mihr-ʿAlí'],
    'Ustád Mihr-ʿAlí, a smith of Zanján, who as a boy of under ten was among the children Ḥujjat sent out with the sealed Qur\'án. He survived the massacre and told the story to Nabíl.'),
  person('majdu-d-dawlih', 'Majdu\'d-Dawlih', ['Majdu\'d-Dawlih'],
    'The governor of Zanján in 1850, maternal uncle of Náṣiri\'d-Dín Sháh, who at the mullás\' urging moved against Ḥujjat and his companions.'),

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
  // Káshán and Kulayn, spring 1847.
  person('jani', 'Ḥájí Mírzá Jání', ['Ḥájí Mírzá Jání', 'Jání Parpá'],
    'A merchant of Káshán, surnamed Parpá, who by leave of the escort kept the Báb as his Guest for three nights over Naw-Rúz in 1847. The Báb revealed a Tablet in his honour. He gave his life for the Faith in Ṭihrán in 1852.'),
  person('muhammad-big', 'Muḥammad Big', ['Muḥammad Big'],
    'The officer who commanded the escort that took the Báb from Iṣfahán toward Ṭihrán in 1847, and then by way of Qazvín to Tabríz. He grew devoted to his Prisoner; near Tabríz he begged His forgiveness with tears, and was told that he was counted among His fold.'),
  person('abdul-baqi', 'Siyyid ʿAbdu\'l-Báqí', ['Siyyid ʿAbdu\'l-Báqí'],
    'A divine of Káshán noted for his learning, who heard the Báb in the house of Ḥájí Mírzá Jání in 1847 and left unmoved, without asking His name. When he learned it, he was filled with remorse, and lived the rest of his life in seclusion.'),
  person('abdul-karim', 'Mullá ʿAbdu\'l-Karím', ['Mullá ʿAbdu\'l-Karím'],
    'A believer of Qazvín who joined the Báb at Kulayn in the spring of 1847 with Siyyid Ḥusayn of Yazd and others. Nabíl records his account of the night the tent at Kulayn was found empty.'),
  person('kandi', 'Mullá Mihdíy-i-Kandí', ['Mullá Mihdíy-i-Kandí'],
    'Mullá Muḥammad-Mihdíy-i-Kandí, a believer closely associated with Bahá\'u\'lláh in Ṭihrán, who in 1847 carried a sealed letter and gifts from Him to the Báb at Kulayn.'),
  person('manuchihr', 'Manúchihr Khán', ['Manúchihr Khán', 'Muʿtamid'],
    'The Muʿtamidu\'d-Dawlih, governor of Iṣfahán: born in Georgia and brought to Persia as a captive boy, he rose to great power. He sheltered the Báb in his own palace until his death in 1847.'),
  person('gurgin-khan', 'Gurgín Khán', ['Gurgín Khán'],
    'Manúchihr Khán\'s nephew and heir, who on his uncle\'s death sent the Báb out of Iṣfahán under guard.'),
  person('husayn-khan', 'Ḥusayn Khán', ['Ḥusayn Khán'],
    'The governor of Fárs, who had the Báb struck in his presence and kept Him under watch in Shíráz.'),
  person('cormick', 'Dr Cormick', ['Dr Cormick', 'Cormick'],
    'William Cormick, a British physician to the Crown Prince\'s household in Tabríz, who examined the Báb in 1848 and treated Him after the bastinado. His letter is the only account of the Báb by a Westerner who met Him.'),
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
  person('nizamu-l-ulama', 'Niẓámu\'l-ʿUlamá', ['Niẓámu\'l-ʿUlamá'],
    'Ḥájí Mullá Maḥmúd, called the Niẓámu\'l-ʿUlamá, tutor to the Crown Prince Náṣiri\'d-Dín Mírzá. He presided at the examination of the Báb in Tabríz in 1848.'),
  person('ali-asghar', 'Mírzá ʿAlí-Aṣghar', ['Mírzá ʿAlí-Aṣghar'],
    'The Shaykhu\'l-Islám of Tabríz. In 1848, when the governor\'s bodyguard refused, he applied the rods to the Báb\'s feet with his own hand.'),

  // Poets.
  person('hafiz', 'Ḥáfiẓ', ['Ḥáfiẓ'],
    'The great poet of Shíráz (died 1390). Persians still open his Díván to take a fál.'),
];
