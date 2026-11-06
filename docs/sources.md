# Sources

The game follows Nabíl's narrative (*The Dawn-Breakers*). This page lists the
details it takes from elsewhere, and records what has been checked against
Nabíl and where. Keep it current when a scene leans on another source.

Editions used for checking:

- **EN**: *The Dawn-Breakers: Nabíl's Narrative of the Early Days of the
  Baháʾí Revelation*, translated and edited by Shoghi Effendi (US Baháʾí
  Publishing Trust, 1932). Page numbers are the printed pages.
- **FA**: *Maṭáliʿ al-Anwár*, ʿAbdu'l-Ḥamíd Ishráq-Khávarí's Persian
  translation and abridgement of the above (its title page reads
  "تلخيص تاريخ نبيل زرندى ... ترجمة وتلخيص"). It is a Persian rendering of
  Shoghi Effendi's English, not Nabíl's own manuscript, so agreement between
  EN and FA confirms the reading, not an independent witness. Page numbers
  are the `ص` markers in the text. Where FA abridges or words a passage
  differently, that is noted below.

## Details from other sources

| Detail | Where in the game | Source |
| --- | --- | --- |
| The Súrih of the Inevitable (al-Wáqiʿa) chanted at Badasht at the Host's word, the day Ṭáhirih appeared unveiled | `src/data/dialogues_ch/chapter07_gardens.ts` (`quddus` node) | Shoghi Effendi, *God Passes By*, ch. II (p. 32 in the US editions; verify page). Nabíl's Badasht chapter (EN ch. XVI, pp. 288 to 301) does not name the súrih. |
| The Báb's public declaration at the Kaʿba that He was the Qáʾim | `src/data/dialogues_ch/chapter03_mecca.ts` (`ch3-proclamation`) | *God Passes By*, ch. I (p. 9; verify page). Nabíl gives the circumambulation and the challenge to Mírzá Muḥíṭ at the Black Stone (EN pp. 134 to 136; FA p. 113), not a public declaration to the crowd. |
| Ḥusayn Khán released the Báb "on condition of his quitting the city" | no longer in the game | ʿAbdu'l-Bahá, *A Traveller's Narrative*, p. 11, quoted by Shoghi Effendi in EN p. 197 n. 29. Nabíl's own text (EN p. 197; FA p. 168) says only that the Báb was released "to go wherever He might please", and the `release` node in `src/data/dialogues_ch/chapter04_house.ts` now follows Nabíl. |
| Ásíyih Khánum, with her son of eight, selling the gold buttons of her robe for bread after the arrests of 1852 | `src/data/dialogues_ch/chapter10_street.ts` (Zahrá, `household`), `src/data/story/chapter10.ts` | Bahíyyih Khánum's recollections in Lady Blomfield, *The Chosen Highway* (Part I; around pp. 40 to 41; verify page). Not in Nabíl. |
| Bahá'u'lláh called "the Father of the Poor" and His wife "the Mother of Consolation" in Ṭihrán | `src/data/dialogues_ch/nur_lane.ts` (`nur-poor-man`), `src/data/story/nur.ts` (`nurHeardPoorMan`) | *The Chosen Highway*, Bahíyyih Khánum's recollections (Part I, around p. 40; verify page). Not in Nabíl. |
| Bahá'u'lláh declined His father's post at court after the Vazír's death | `src/data/dialogues_ch/nur_lane.ts` (`nur-baker`, `son`), `src/data/story/nur.ts` (`nurHeardBaker`) | J. E. Esslemont, *Bahá'u'lláh and the New Era*, pp. 29 to 30 (ʿAbdu'l-Bahá's account), quoted by Shoghi Effendi in EN p. 106 n. 9. Not in Nabíl's text. |
| The name Mubárak for the Báb's Ethiopian servant | `chapter01_rumours.ts`, `chapter01_vigil.ts`, `chapter02_travellers.ts`, `chapter02_road.ts`, `chapter03_mecca.ts`, `src/data/glossary/people.ts` | H. M. Balyuzi, *The Báb* (1973). Nabíl calls him only "an Ethiopian servant" (EN pp. 53, 62, 68, 96; FA p. 41 "غلامی حبشی"). |
| Ṭáhirih stayed two months in Hamadán | Not used now (the Hamadán glossary entry was made impressionistic) | ʿAbdu'l-Bahá, *Memorials of the Faithful*, p. 275, quoted in EN p. 272 n. 10. Nabíl's text (EN pp. 272 to 273; FA p. 237) gives no duration. |
| The Qurʾán of the Qurʾán Gate of Shíráz, copied by a Timurid prince some four hundred years before | `src/data/dialogues_ch/chapter02_travellers.ts` (`ch2-gate-warden`) | General history of Shíráz: the "Hifdah-Man" Qurʾán ascribed to Sulṭán Ibráhím ibn Sháhrukh (died 1435). Not in Nabíl. |
| The verses the fál-reader reads from Ḥáfiẓ | `src/data/dialogues_ch/chapter02_travellers.ts` (`ch2-fal-reader`) | Paraphrases in the spirit of the Díván, not quoted couplets. Not in Nabíl. |

## Checked against Nabíl

Each row was read in both editions; "same" means FA agrees with EN in
substance.

### Ṭihrán and Núr, 1844 (`tehran-nur`)

Files: `src/data/dialogues_ch/nur_madrasa.ts`, `nur_night.ts`, `nur_lane.ts`,
`nur_morning.ts`, `nur_takur.ts`, `src/data/story/nur.ts`.

| Claim | EN | FA | Notes |
| --- | --- | --- | --- |
| Mullá Ḥusayn lodged in the madrasa of Mírzá Ṣáliḥ, called Pá-Minár; Ḥájí Mírzá Muḥammad-i-Khurásání, head of the Shaykhís of Ṭihrán, taught there and rejected him, with the words the Ḥájí speaks in `nur-haji` | pp. 102 to 103 | p. 82 | Same. |
| Mullá Ḥusayn went out early each morning, came back an hour after sunset and shut his door | p. 103 | p. 82 | Same ("صبح زود"). The journal said "before dawn"; now "early each morning". |
| The tutor's account: cell adjoining his teacher's, overheard the discussion, midnight knock, Mullá Ḥusayn awake by his lamp, the questions about the family of Mírzá Buzurg (occupation, rank, name Ḥusayn-ʿAlí, shikastih-nastaʿlíq, the woods, age twenty-eight), the scroll in cloth to be given at dawn | pp. 104 to 106 | pp. 82 to 86 | Same. FA has "early in the morning" where EN has "the hour of dawn". |
| Mírzá Músá at the gate; the welcome; the scroll read aloud; Bahá'u'lláh's words to Músá; the loaf of Russian sugar and package of tea | pp. 106 to 107 | p. 86 | Same. FA puts Bahá'u'lláh's words as a rhetorical question. |
| Mullá Ḥusayn kissed the gift, kissed the tutor's eyes, his prayer for him; left for Khurásán a few days later with the charge of secrecy and the prophecy of blood in that city | pp. 107 to 108 | pp. 86 to 87 | Same. FA omits "redeem the fallen". |
| The Báb told Mullá Ḥusayn to report on every soul who accepted and every soul who rejected, from Iṣfahán, Ṭihrán and Khurásán (`nur-husayn-gift`, `khurasan`) | p. 123 | p. 104 | Same. FA adds that the Báb would not leave Shíráz for the pilgrimage until the letter came (EN also has this). |
| "A Mystery ... neither Ḥijáz nor Shíráz can hope to rival" | p. 96 | p. 76 | Same. |
| The Vazír's twenty prosperous years, the flood at Tákur that took half the house, the loss of his posts | pp. 109 to 111 | pp. 88 to 90 | EN "over twenty years", FA "twenty years". |
| The youth who explained the passage before Mírzá Muḥammad-Taqí and his two hundred students; "a wearer of the kuláh" | p. 111 | p. 90 | EN "over two hundred", FA "nearly two hundred" (قريب دويست). EN says an abstruse theory, FA a difficult ḥadíth. |
| The mujtahid dead by '60; his followers a handful under Mullá Muḥammad; notables came for news of the court and heard of the new Cause | pp. 112 to 113 | pp. 91 to 93 | Same. |
| His uncle ʿAzíz, the tea, "Have you not partaken of his tea", the note "O ʿAzíz, be not afraid", the grammatical error that scandalised the notables of Tákur | pp. 113 to 114 | pp. 93 to 94 | EN: the error "perverted the purport"; FA: it was so badly written that no meaning could be made of it. The elder's line now covers both. |
| The envoys Mullá ʿAbbás and Mírzá Abu'l-Qásim, sons-in-law and disciples of Mírzá Muḥammad-Taqí, the pledge to abide by their verdict; Bahá'u'lláh at His winter quarters revealing a commentary on the opening Súrih; ʿAbbás at the door; Abu'l-Qásim's vow | pp. 114 to 116 | pp. 94 to 96 | Same. FA's word for the winter quarters is qishláq (قشلاق). FA calls them only sons-in-law. |
| All Núr flocking to Him; "a hundred leagues"; Saʿádat-Ábád; the closed Qurʾán; "I have consulted the Book of God" | pp. 116 to 117 | pp. 96 to 97 | EN "a number of the most distinguished" spoke; FA "one of His devotees among the notables". |
| Núr, "light", the first district to catch the rays of the Sun risen in Shíráz; the stones and trees quickened | pp. 118 to 119 | p. 99 | Same. |
| Mullá Ḥusayn's letter from Khurásán by way of Yazd; reached the Báb on the night before 27 Ramaḍán with Quddús alone beside Him; "between the months of Jamádí and Rajab" | pp. 126 to 127 | pp. 107 to 108 | Same. |
| Bahá'u'lláh set out for Núr after Mullá Ḥusayn's visit | p. 109; p. 126 | p. 88; p. 108 | Nabíl gives no interval. `nur-husayn-gift` said "Within the week"; now "Not long after". |

### Shíráz, 22 May 1844 (chapter 1)

Files: `src/data/dialogues_ch/chapter01_rumours.ts`,
`chapter01_rumourFlags.ts` (flag list only, no text), `chapter01_vigil.ts`,
`chapter01_ilkhani.ts`.

| Claim | EN | FA | Notes |
| --- | --- | --- | --- |
| Forty days at the Masjid of Kúfih with his brother and nephew; Najaf; Búshihr; Shíráz | pp. 50 to 52 | pp. 40 to 41 | Same. |
| At the gate he sent his brother and nephew to the Masjid-i-Ílkhání, promising to join them for the evening prayer; met the Báb outside the gate a few hours before sunset | p. 52 | pp. 40 to 41 | FA: he walked some hours outside the city. The attendant and the brother said he had gone to the gate "at noon"; now they say he stayed behind at the gate. |
| Green turban; welcomed like a lifelong friend; an Ethiopian servant opened the door; ewer, tea; the conversation began about an hour after sunset | pp. 52 to 57 | pp. 41 to 43 | FA: half an hour after nightfall. |
| The signs Mullá Ḥusayn named | p. 57 | pp. 44 to 45 | "Of mature age" was wrong: both say more than twenty and less than thirty. Fixed in `chapter01_vigil.ts`. |
| The commentary on the Súrih of Joseph revealed unasked; two hours and eleven minutes after sunset; dawn call to prayer | pp. 59 to 62 | pp. 45 to 50 | Same. |
| Eighteen must find Him unprompted (so "seventeen others") | p. 63 | p. 50 | Same. |
| The Báb raised by His maternal uncle; traded in Búshihr; prayed on His roof in the noon heat | pp. 75, 77 to 78 | pp. 61 to 62 | EN: each Friday; FA: by day, several hours. The watchman's line made the uncle the trader of Búshihr; now it is the Báb. |
| Year 1260 | p. 61 | p. 49 | Same. |

The rumours of chapter 1 (the gate guard's "whispers", the stern mullá's
threat) put talk of the Báb in the city before the night of the
declaration. Nabíl has none; Mullá Ḥusayn met Him by chance. This is the
chapter's frame, kept as dramatic licence. Likewise Mullá Ḥusayn waits in
the lane after dark before going in, where Nabíl has him follow the Báb
home straight from the gate in the afternoon.

### The Letters leave Shíráz (chapter 2)

Files: `src/data/dialogues_ch/chapter02_travellers.ts`, `chapter02_serai.ts`,
`chapter02_road.ts`.

| Claim | EN | FA | Notes |
| --- | --- | --- | --- |
| Mullá ʿAlíy-i-Basṭámí sent first, to Najaf and Karbilá, "the first to suffer" | p. 87 | pp. 69 to 70 | Same. |
| His fate: tried in Baghdád, sent toward Constantinople, end unknown | p. 91 | p. 73 | The people glossary said he "died a prisoner of the Ottomans"; now it says Nabíl could learn nothing certain. Nabíl lists him fourth among the Letters (p. 80), not second. |
| The Letters of the Living, and Ṭáhirih's sealed letter given to Mírzá Muḥammad-ʿAlí as he left Qazvín | pp. 80 to 81 | pp. 65 to 66 | EN: "from Qazvín"; FA only says he was setting out. The merchant said she "never left her own house"; now she "never made the journey herself". |
| The farewell: the disciples of Jesus; each sent to his province; not to speak His name | pp. 92 to 94 | pp. 74 to 76 | Same. |
| Mullá Ḥusayn to Iṣfahán, Káshán, Ṭihrán, Khurásán; the Báb to Mecca with Quddús and His Ethiopian servant | p. 96 | pp. 76 to 78 | Same. |
| Quddús twenty-two when he believed | p. 72 | p. 379 (in his later biography) | Nabíl does not call him the youngest Letter; "the youngest of us" was dropped from `chapter02_road.ts`. |

Nabíl has the fourteen leave at dawn, with Mullá Ḥusayn and Quddús staying
on in Shíráz (EN p. 96); the chapter sends them out together.

### Glossaries

Files: `src/data/glossary/places.ts`, `words.ts`, `people.ts`.

| Entry | EN | FA | Notes |
| --- | --- | --- | --- |
| Baráthá: the shepherd's dream | pp. 42 to 45 | pp. 33 to 35 | Nabíl: he would die on the day of ʿArafih, three days after his return to Karbilá. "Within thirty days" was not in either text; fixed. |
| Hamadán | pp. 272 to 273 | p. 237 | "Two months" is only in Shoghi Effendi's footnote from *Memorials of the Faithful*; the entry no longer gives a duration. |
| Kulayn: Ḥájí Mírzá Áqásí's village and tent | p. 227 | | Confirmed. |
| Chihríq, "the Grievous Mountain" | p. 261 n. | | Confirmed (footnote). |
| Nayríz: Iṣṭahbánát's twenty; a thousand of Chinár-Súkhtih; Khájih burned | pp. 478 to 479, 495 | | Confirmed. |
| Amír-Tumán: seventeen regiments, fourteen guns | p. 557 | | Confirmed. |
| Qará-Guhar | p. 608 | | Confirmed. |
| Kuláh: the Báb at the gate of Káshán | p. 217 | | Confirmed (Ḥájí Mírzá Jání's dream, and the arrival "in the same clothes"). |
| Shaykh Ṣáliḥ, first to shed his blood on Persian soil; the murder of Mullá Taqí at dawn prayer | pp. 277, 280 | | Confirmed. |
| Majdu'd-Dawlih, maternal uncle of Náṣiri'd-Dín Sháh | p. 540 | | Confirmed. |

### The Trial at Baghdád (#11)

Files: `src/data/dialogues_ch/baghdad_quay.ts`, `baghdad_serai.ts`,
`baghdad_prison.ts`, `baghdad_end.ts`, `src/data/story/baghdad.ts`,
`src/data/maps/baghdadPhases.ts` (comments only). The journey
`mecca-to-baghdad` in `src/data/journeys.ts` is listed at the end.

Nabíl's own account of Basṭámí after Shíráz is short: Najaf, Baghdád, and
Ḥájí Háshim's report of one hearing (EN pp. 90 to 92; FA p. 73). The
tribunal, the two verdicts, the referral to Istanbul and the dockyards come
from Moojan Momen, "The Trial of Mullā ʿAlī Basṭāmī: A Combined
Sunnī-Shīʿī Fatwā against the Báb", *Iran* 20 (1982), pp. 113 to 143, which
uses the British consular despatches from Baghdád (Rawlinson) and the text
of the fatwá; H. M. Balyuzi, *The Báb* (1973), tells the same story from the
same despatches (verify pages). Below, "Momen" means that article; its
internal page for each point is marked verify.

FA abridges this passage heavily. It keeps Najaf, the move to Baghdád and
Ḥájí Háshim's uncertainty about the end, but drops the chains, Government
House, the charges, the Muftí's "O enemy of God", Ḥájí Háshim's rebuke and
the deportation "on the night of that same day", and it has no counterpart
to Shoghi Effendi's footnote 42. It adds that Shaykh Muḥammad-Ḥasan was the
author of the *Javáhir* (صاحب جواهر).

| Claim | Where | EN | FA | Notes |
| --- | --- | --- | --- | --- |
| The Báb sent Basṭámí first, to Najaf and Karbilá; "the first to leave the House of God, and to suffer for His sake" | prison (`afraid`, framing) | p. 87 | p. 69 | Same. FA: "the first to be afflicted in the path". |
| The Letters bidden to proclaim that the Gate had opened, without naming the Báb | `baghdad_prison.ts` header, `name`; serai `said`; quay `merchant`; journal `bgHeardStudent`, `bgSpokeWithAli` | p. 94 | p. 76 | Same. |
| Before Shaykh Muḥammad-Ḥasan in Najaf he announced the Báb; His proof is His Word; an "unschooled Háshimite Youth of Persia" had revealed in forty-eight hours verses equal to the whole Qurʾán | serai `said`; journal `bgHeardStudent` | p. 90 | p. 73 | **Changed.** `said` had him say neither "who, or where"; Nabíl has him name no one but speak of a youth of Persia and the forty-eight hours. Now: "He would not give a name. Only that an unschooled youth of Persia, of the House of Háshim, had in two days and nights set down verses to equal the whole Qurʾán." FA keeps only the bare announcement ("after many events, which Nabíl's history records"). |
| Shaykh Muḥammad-Ḥasan, author of the *Javáhir* | serai `g`; journal `bgHeardStudent` | p. 90 ("one of the most celebrated ecclesiastics") | p. 73 (صاحب جواهر) | FA names the book; EN does not. Consistent. |
| The Shaykh pronounced him a heretic and expelled him; his students (the Shaykhís among them) heaped indignities on him and gave him up, hands in chains, to an Ottoman official; taken to Baghdád under escort and imprisoned by the governor | quay `prisoner`; serai `shaykh`; prison `najaf`; journal `bgHeardFather` | pp. 90 to 91 | p. 73 | **Changed.** Prison `najaf` said "A few days later the governor's men came for me"; Nabíl has the Shaykh's own disciples hand him over. Now: "...and they put me out, and in the end they gave me up in chains to the Sultan's officers." FA: "he fell into the hands of bloodthirsty enemies through the incitement of the ʿulamá; from Najaf they took him to Baghdád". |
| The book he carried was the Báb's commentary on the Súrih of Joseph (Qayyúmu'l-Asmá), verse in the manner of the Qurʾán | quay `bookseller`; serai header, `clerk`, `tribunal` `book`; journal `bgHeardBookseller` | not said of Basṭámí | | Momen (the fatwá condemns the book found with him; verify page). |
| Tribunal of the Sunni divines of Baghdád and the Shíʿí divines of Karbilá and Najaf, convened by Najíb Páshá, January 1845 (13 January) | quay `opening`, `coffee`; serai header, `scribe` `who`, `tribunal`; maps; journal `bgHeardCoffee`, `bgVerdict` | | | Momen (verify page). Nabíl's Ḥájí Háshim describes Basṭámí before "the assembled notables and government officials" at Government House, accused as an infidel, abrogator of the laws of Islám and repudiator of its rituals, the Muftí calling him "O enemy of God" and then leaving (EN p. 91). Not contradictory; the game does not use the Muftí scene. |
| Sunni verdict: the book unbelief, its bearer deserving death; Shíʿí verdict: heresy, but banishment or prison | quay `coffeeWinter`; serai header, `tribunal` `sunni`, `shii`; journal `bgVerdict` | | | Momen (verify page); Balyuzi, *The Báb* (verify page). Not in Nabíl. |
| Najíb Páshá referred the case to Istanbul (letter of 25 January 1845) | quay `fatherWinter`; serai `pasha`, `scribeAfter`; prison `weeks` | p. 91 n. 42 (ordered to Constantinople "according to instructions received from the Ottoman government") | | Momen (date of the letter; verify page). Consistent with Shoghi Effendi's footnote from Muḥammad Muṣṭafá. |
| Held in Baghdád through the winter, led away in spring | prison `weeks`; end `ali-departure`; `baghdadPhases.ts` | p. 91 n. 42 (six months' imprisonment by order of Najíb Páshá) | | Momen gives 16 April 1845 for his removal from Baghdád (verify page). **Changed:** `weeks` now says "through the rest of the winter and into the spring"; the departure no longer has the soldiers "stamping in the cold" or Basṭámí saying he is cold; the phases comment says "in spring" for "weeks later". Nabíl's text (Ḥájí Háshim, EN p. 91) says instead that he was deported "on the night of that same day" as the hearing; Shoghi Effendi's footnote and Momen both disagree with that. FA has neither the night nor the six months. |
| Led north by Mosul toward Istanbul | end `ali-departure` | p. 91 n. 42 | | From Muḥammad Muṣṭafá, quoted by Shoghi Effendi. Not in FA. |
| Chains at his wrists | end `ali-departure`; journal `baghdadComplete` | p. 91 (chains when handed over in Najaf) | | Nabíl mentions chains only at Najaf; kept. |
| His end: some said he fell ill and died on the road, others that he was martyred; Nabíl could not learn the truth | end `close`; journal `baghdadComplete` | p. 91 | p. 73 | **Changed.** `close` gave only "died on the road"; now also "some that he was put to death", as Nabíl. The journal said "He died in Ottoman captivity"; now "Whatever his end", Nabíl's words (p. 92). |
| Sentenced to hard labour in the imperial naval dockyard at Istanbul, and died there | end header, `close` | | | Momen, from Ottoman records; death in late 1846 (December 1846 in summaries of Momen; verify). **Changed:** `close` said he "died there within the year", which does not fit April 1845 to late 1846; now "and died there". |
| "The first to have laid down his life"; his persecution in ʿIráq, outside Persia | end `close`; journal `baghdadComplete` | pp. 92, 147; p. 652 (the mission in Turkish territory "collapsed at its very outset") | p. 73; p. 125 | Same. |
| The fourth Letter of the Living | end `close` | p. 80 | p. 66 | **Changed** from "the second Letter of the Living". He was the first after Mullá Ḥusayn to find the Báb by his own effort (EN p. 68; FA p. 55), but Nabíl's list puts him fourth. |
| In January 1845 the Báb and Quddús were in Arabia on the pilgrimage | quay `opening`; header | p. 140 (on the road to Medina on 1 Muḥarram 1261, 10 January 1845) | | Same. |
| Students of Karbilá came to Shíráz in the summer and sat with a young siyyid, a merchant, who then went to Mecca | quay `merchant`; journal `bgHeardMerchant` | pp. 63, 80 to 96, 129 | pp. 50, 66 to 78, 109 | Consistent with Nabíl; the merchant's letters are invented. |

Invented atmosphere, kept: the boatman's son and his father Ḥasan, the
guffa, the bridge of boats, the bookseller, the ink, the coffee-seller, the
merchant, the master scribe, the muftí's clerk, the student and his bread,
the jailer, the debtor, the pages laid on the Shaykh's carpet, Najíb Páshá's
frock-coat, the verdicts sealed in Arabic, and the coffee-seller's reading
of why both benches were called.

Not edited here (outside this chapter's files): the journey
`mecca-to-baghdad` in `src/data/journeys.ts` dates the march from Najaf to
10 December 1844 and has him walk "between the governor's horsemen ... by
the desert road along the Euphrates". Nabíl gives only "under the escort of
government officials" (EN p. 91) and no date; Momen has him held in
Baghdád for some months before the January tribunal, so a December march
is probably too late. It should be made impressionistic.

### Bárfurúsh, October 1848 (`barfurush`)

Files: `src/data/dialogues_ch/barfurush_road.ts`, `barfurush_maydan.ts`,
`barfurush_serai.ts`, `barfurush_forest.ts`, `src/data/story/barfurush.ts`,
and the last remark of the journey `tabriz-to-barfurush`. Read against the
reference.bahai.org text of EN ch. XIX ("The Mázindarán Upheaval");
printed page numbers to be filled in when checked against the book, and FA
not yet checked.

| Claim | Where | Source | Notes |
| --- | --- | --- | --- |
| The Saʿídu'l-ʿUlamá gathered the town in the masjid, threw down his turban, tore his shirt, lamented the Faith; said Mullá Ḥusayn had once sat in his lessons and scorned him; called the people out at dawn | `bf-opening`, `bf-townsman`; journal `bfOpened`, `bfHeardSermon` | EN ch. XIX | Paraphrase. The player hears it afterwards; the opening says so. |
| After the morning prayer Mullá Ḥusayn bade the companions cast away their belongings and keep only their horses and swords; Ḥájí ʿAbdu'l-Majíd of Nishápúr, father of Badíʿ, threw down his satchel of turquoise first | `bf-mh-dawn`, `bf-majid`, `bf-heap`; journal `bfCastAway`, `bfMetMajid` | EN ch. XIX | Badíʿ is not mentioned: he was not yet born. The pen-case, the wooden horse and the silver cup on the heap are invented. |
| About a farsang from the town the crowd barred the way; six companions fell; a siyyid of Yazd, one of Mullá Ḥusayn's most devoted, was shot in the chest | `bf-mh-go`; journal `bfClash` | EN ch. XIX; footnote names him Siyyid Riḍá | "Six go down" is left open on whether they died. |
| Mullá Ḥusayn pursued the man who fired; he had taken shelter behind a tree, holding his musket before him; one stroke cut tree, musket and man | `bf-mh-go`; map `bf-cleft-tree` | EN ch. XIX | The tree is drawn as an alder; Nabíl does not give the kind. |
| Furúghí: had he not seen it himself he would not have believed it; Mullá Ḥusayn had never been a swordsman | `bf-furughi` | EN ch. XIX (Nabíl's enquiry of Mírzá Muḥammad-i-Furúghí) | Agrees with `ch8-sword` in the record. |
| Quddús, told of the stroke, quoted "it was not ye who slew them" | not used | EN ch. XIX | Quddús was held at Sárí; left out so as not to place him. |
| Mullá Ḥusayn rode three times round the Saʿídu'l-ʿUlamá's house, called on him to come out and lead the holy war he had preached; then asked the people why they had risen, whether the companions had denied their Faith, and spoke of coming through their fire with only a scratch on his face | `bf-mh-house`; journal `bfHeardAddress` | EN ch. XIX | Paraphrase. |
| The companions lodged in the caravanserai of the Sabzih-Maydán; no bread could be bought nor water drawn; the gates were shut until sunset | `bf-mh-errand`, `bf-mh-report`, `bf-baker`, `bf-water`; journal `bfGatesShut` | EN ch. XIX | The player as one of those sent is invented; the baker's and water-carrier's reasons are invented. |
| Mullá Ḥusayn asked who would give his life to sound the adhán from the roof; three youths in turn were shot, at "Alláh-u-Akbar", at "I bear witness that Muḥammad is the Apostle of God", and near "There is no God but God"; then he opened the gate and charged, and the square was empty by evening | `bf-mh-call`, `bf-ladder-*`; journal `bfThirdFell` | EN ch. XIX | Nabíl does not name the three. The first's village and the second's sandals are invented. |
| Notables came on foot; ʿAbbás-Qulí Khán-i-Laríjání and Ḥájí Muṣṭafá Khán blamed the Saʿídu'l-ʿUlamá, urged them on toward Ámul, swore on the Qur'án that Khusraw-i-Qádí-Kalá'í and a hundred horsemen would escort them through Shír-Gáh, and called God's curse on themselves; Mullá Ḥusayn hinted at their insincerity and accepted; tea; it was Friday, 12 Dhi'l-Qaʿdih, and they broke their fast; he dined with the Kháns four hours after sunset | `bf-abbas-quli`, `bf-mustafa-khan`; journal `bfOathSworn` | EN ch. XIX | Ḥájí Muṣṭafá Khán's words are invented. |
| At midnight the Saʿídu'l-ʿUlamá bade Khusraw rob and kill them; Khusraw asked whether men who sacrificed three rather than leave the call unfinished were not Muslims; the mujtahid took it on his own neck | `bf-rida-fire` `told`; journal `bfHeardMidnight` | EN ch. XIX | Told as what was said round the fire, since the player cannot have known it then. |
| At dawn ʿAbbás-Qulí Khán charged Khusraw to treat them well; Mullá Ḥusayn quoted the Qurʾán on good and evil returning to the doer | `bf-khusraw-square` | EN ch. XIX | Paraphrase of the verse. |
| They left two hours after sunrise expecting Shír-Gáh by noon; Khusraw took the forest way; his men seized their goods, killed several (among them the brother of Mullá Ṣádiq) and bound others; Mullá Ḥusayn dismounted, said midday was long past, had Qambar-ʿAlí spread his prayer-mat | `bf-khusraw-forest`, `bf-mh-halt`; journal `bfAmbush` | EN ch. XIX | |
| Khusraw demanded his sword and horse; no answer; Mírzá Muḥammad-Taqíy-i-Juvayní carried him the qalyán and struck him with his own dagger; the companions turned on the escort, sparing only the attendant who had lit the pipe, who was sent with the jewelled qalyán to ʿAbbás-Qulí Khán: Khusraw thought his work was done; it had only just begun | `bf-juvayni`, `bf-attendant-spared`; journal `bfKhusrawDead`, `bfAttendantSent` | EN ch. XIX | The fight is not shown; the player sees "little of it". |
| They camped there that night; at dawn Mullá Ḥusayn said "We are approaching our Karbilá", bade them leave all plunder and keep only swords and horses, walked a maydán to the shrine, and prayed (Qurʾán 23:29) that his arrival be blessed | `bf-mh-karbila`; journal `barfurushComplete` | EN ch. XIX | The keeper's dream is left to `ch8-keeper`; only his figure in the doorway is seen. |

Dates: Nabíl gives Friday 12 Dhi'l-Qaʿdih 1264 for the day in the
caravanserai, which falls about 10 to 13 October 1848 depending on the
tabular reckoning. The title opening uses the evening of 9 October.
