/**
 * The glossary behind the hover and tap tooltips: words and places a player
 * may not know, as they appear in the story's text. People are deliberately
 * left out. Each entry lists the English spellings to match; the Farsi and
 * Chinese spellings live in `localeForms.ts`, and `title`/`body` are
 * translated through the catalogs like any other text.
 *
 * Places carry a position (longitude, latitude) for the map; provinces name
 * an outline in `geography.ts`.
 */

export type GlossaryKind = 'term' | 'place' | 'region';

export interface GlossaryEntry {
  id: string;
  kind: GlossaryKind;
  title: string;
  body: string;
  /** English spellings to match, exactly as the text writes them. */
  match: readonly string[];
  /** Longitude and latitude, for places. */
  at?: readonly [number, number];
  /** Province outline id in `geography.ts`, for regions. */
  region?: string;
}

const term = (id: string, title: string, match: readonly string[], body: string): GlossaryEntry =>
  ({ id, kind: 'term', title, body, match });
const place = (id: string, title: string, at: readonly [number, number], body: string, match: readonly string[] = [title]): GlossaryEntry =>
  ({ id, kind: 'place', title, body, match, at });
const region = (id: string, title: string, body: string, match: readonly string[] = [title]): GlossaryEntry =>
  ({ id, kind: 'region', title, body, match, region: id });

export const GLOSSARY: readonly GlossaryEntry[] = [
  // Titles and words.
  term('mulla', 'Mullá', ['Mullá', 'mullá', 'mullás', 'Mullás'],
    'A Muslim cleric trained in religious law. In Qajar Persia the title covered every man of religious learning, from a village teacher to a leading jurist.'),
  term('siyyid', 'Siyyid', ['Siyyid', 'siyyid', 'siyyids'],
    'A descendant of the Prophet Muḥammad, honoured for his lineage and often marked by a green or black turban.'),
  term('shaykh', 'Shaykh', ['Shaykh'],
    'An elder or a teacher of religion. It is also the title of Shaykh Aḥmad-i-Aḥsáʾí, whose school taught that the Promised One was near.'),
  term('shaykhi', 'Shaykhí', ['Shaykhí', 'Shaykhís'],
    'The school of Shaykh Aḥmad and his successor Siyyid Káẓim of Rasht. Its students expected the Promised One soon, and many of the first believers came from among them.'),
  term('haji', 'Ḥájí', ['Ḥájí'],
    'A title of honour for one who has made the pilgrimage to Mecca.'),
  term('mirza', 'Mírzá', ['Mírzá'],
    'Before a name, a title for a man of letters or a government secretary; after a name, it marks a prince.'),
  term('khan', 'Khán', ['Khán'],
    'A title of rank for a nobleman, a tribal chief, a governor or a military commander.'),
  term('madrasa', 'Madrasa', ['madrasa', 'madrasas', 'Madrasa'],
    'A religious college, usually built round a courtyard of students\' cells, where law and theology were taught.'),
  term('caravanserai', 'Caravanserai', ['caravanserai', 'caravanserais', 'Caravanserai'],
    'A walled inn on a trade road: rooms round a courtyard for travellers, their goods and their animals, a day\'s march apart.'),
  term('bazaar', 'Bazaar', ['bazaar', 'bazaars', 'Bazaar'],
    'The covered market at the heart of a Persian city: vaulted lanes of shops grouped by trade.'),
  term('imam-jumih', 'Imám-Jumʿih', ['Imám-Jumʿih'],
    'The leading cleric of a city, who led the Friday prayer at its great mosque and held much local authority.'),
  term('qaim', 'Qáʾim', ['Qáʾim'],
    '"He who shall arise": the Promised One whose coming Shíʿih Muslims awaited.'),
  term('letters', 'Letters of the Living', ['Letters of the Living'],
    'The first eighteen disciples of the Báb, each of whom recognised Him for themselves. Mullá Ḥusayn was the first.'),
  term('farrash', 'Farrásh', ['farrásh', 'farráshes', 'Farrásh'],
    'An attendant of a household or a governor; the farrásh-báshí led a governor\'s attendants and enforced his orders.'),
  term('kaaba', 'Kaʿba', ['Kaʿba'],
    'The cube-shaped shrine at the centre of the Sacred Mosque in Mecca, towards which Muslims turn in prayer.'),
  term('mihrab', 'Mihrab', ['mihrab'],
    'The niche in a mosque\'s wall that shows the direction of Mecca.'),
  term('minbar', 'Minbar', ['minbar'],
    'The stepped pulpit of a mosque, from which the Friday sermon is given.'),
  term('iwan', 'Iwan', ['iwan', 'iwans'],
    'A vaulted hall walled on three sides and open on the fourth, often framed by a tall tiled portal.'),
  term('quran', 'Qurʾán', ['Qur\'án', 'Qurʾán'],
    'The holy book of Islam.'),

  // Cities and places.
  place('shiraz', 'Shíráz', [52.53, 29.61], 'The capital of the province of Fárs in southern Persia, city of gardens and poets, where the Báb was born and declared His mission in 1844.'),
  place('bushihr', 'Búshihr', [50.84, 28.97], 'Persia\'s chief port on the Persian Gulf, where pilgrims took ship for Arabia.'),
  place('isfahan', 'Iṣfahán', [51.67, 32.65], 'The former Safavid capital in central Persia, famed for its bridges, mosques and great squares.'),
  place('tihran', 'Ṭihrán', [51.39, 35.69], 'The capital of Qajar Persia and seat of the Sháh.'),
  place('tabriz', 'Tabríz', [46.29, 38.08], 'The chief city of Ádhirbáyján in north-west Persia, seat of the crown prince.'),
  place('maku', 'Mákú', [44.52, 39.29], 'A fortress town in the mountains of the far north-west, near the Ottoman and Russian borders.'),
  place('chihriq', 'Chihríq', [44.75, 38.15], 'A remote mountain fortress in Ádhirbáyján, near Lake Urúmíyyih, called "the Grievous Mountain".'),
  place('badasht', 'Badasht', [55.05, 36.45], 'A hamlet near Sháhrúd on the road to Khurásán, where the believers gathered in the summer of 1848.'),
  place('barfurush', 'Bárfurúsh', [52.68, 36.54], 'A market town in Mázindarán, the home of Quddús.'),
  place('tabarsi', 'Shaykh Ṭabarsí', [52.95, 36.43], 'A shrine in the forests of Mázindarán, round which the believers raised a fort in 1848.', ['Ṭabarsí']),
  place('mashhad', 'Mashhad', [59.6, 36.3], 'The holy city of Khurásán, around the shrine of the eighth Imám.'),
  place('karbila', 'Karbilá', [44.03, 32.62], 'A shrine city in Ottoman Iraq, where Siyyid Káẓim taught and Mullá Ḥusayn studied under him.'),
  place('najaf', 'Najaf', [44.33, 32.0], 'A shrine city in Ottoman Iraq, around the tomb of the Imám ʿAlí.'),
  place('kufih', 'Kúfih', [44.4, 32.03], 'An old town near Najaf, where Mullá Ḥusayn spent forty days in prayer before seeking the Promised One.'),
  place('baghdad', 'Baghdád', [44.36, 33.31], 'The great city of Ottoman Iraq, where Bahá\'u\'lláh and His family were exiled in 1853.'),
  place('mecca', 'Mecca', [39.83, 21.42], 'The holiest city of Islam, in the Ḥijáz of Arabia, goal of the pilgrimage.'),
  place('medina', 'Medina', [39.61, 24.47], 'The city of the Prophet in the Ḥijáz, where he is buried.'),
  place('jidda', 'Jidda', [39.19, 21.49], 'The Red Sea port where pilgrims landed for Mecca.'),
  place('qazvin', 'Qazvín', [50.0, 36.27], 'A city west of Ṭihrán, home of Ṭáhirih.'),
  place('kashan', 'Káshán', [51.43, 33.98], 'A city on the edge of the central desert, known for its silk and carpets.'),
  place('yazd', 'Yazd', [54.37, 31.9], 'A desert city of wind-catchers in central Persia.'),
  place('kazirun', 'Kázirún', [51.65, 29.62], 'A town on the road from Búshihr up into the mountains to Shíráz.'),
  place('shahrud', 'Sháhrúd', [54.98, 36.42], 'A town on the road east to Khurásán, near Badasht.'),
  place('kirman', 'Kirmán', [57.08, 30.28], 'A city in south-east Persia.'),
  place('siyah-chal', 'Síyáh-Chál', [51.42, 35.68], 'The "Black Pit": an underground dungeon in Ṭihrán, once a reservoir, where Bahá\'u\'lláh was imprisoned in 1852.'),

  // Provinces.
  region('mazindaran', 'Mázindarán', 'The forested province along the Caspian Sea\'s southern shore, between the mountains and the sea.'),
  region('khurasan', 'Khurásán', 'The great north-eastern province of Persia, around the holy city of Mashhad.'),
  region('adhirbayjan', 'Ádhirbáyján', 'The mountainous north-western province of Persia, around Tabríz.'),
  region('fars', 'Fárs', 'The southern province of Persia, around Shíráz.'),
];
