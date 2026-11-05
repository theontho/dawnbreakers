# Ideas and Open Work

A running list of what could come next for Dawnbreakers: design directions
still to decide, and known polish and robustness items. Nothing here is
committed to; when an item is taken up, move its decisions into the code and
the relevant guide (`docs/content-guide.md`, `docs/true-scale.md`) and strike
it from this list.

Ground rules that apply to every idea below (see `AGENTS.md`): the Báb and
Bahá'u'lláh are never on the map or speaking, the game stays non-combat, and
no em-dash structures appear in game text.

## Gameplay depth (brainstorm, undecided)

The game today is a talking quest: walk to people, hear and witness, and
"do" things that amount to pressing a button. Games in the same genre make
listening into play. Techniques worth borrowing, with how each could fit:

1. **Information is the puzzle, not just the reward.** *Return of the Obra
   Dinn*, *Her Story* and *Paradise Killer* give fragments and ask the player
   to reconstruct what happened.
   *Here:* Nabíl built *The Dawn-Breakers* from eyewitness accounts and notes
   where they disagree. The player could be a chronicler gathering testimony:
   witnesses contradict each other (numbers, dates, who said what), and the
   player decides what goes into the record and with what confidence. The
   journal becomes the document the player writes.
2. **You cannot hear everything.** *Pentiment* splits days into time slots;
   *Citizen Sleeper* and *80 Days* make time and attention a resource.
   *Here:* in the busiest chapters (the siege of Ṭabarsí, the trial at
   Tabríz) the player can be in three of six places before nightfall; what
   they witness shapes their account, and a replay shows another side.
3. **Inner life as a character.** *Disco Elysium* gives doubts and
   convictions voices that interrupt conversations; *Kentucky Route Zero*
   uses choices to define what a character feels.
   *Here:* the pilgrim's search (asking for time, recognition) as a real
   track: doubt, fear for one's safety and longing as voices that argue in
   key moments and open or close what the player can say.
4. **One signature verb per chapter.** *(Built, October 2026: six of them,
   see "Mini-games" in `docs/content-guide.md`. Zanján's share of the
   rationing is still open.)*
   *What Remains of Edith Finch* gives
   each story its own small mechanic; *1979 Revolution: Black Friday* (set
   in Iran) makes choosing what to photograph the gameplay. Ideas:
   - Ship: keep the lamp lit through the storm.
   - Máh-Kú: copy the Bayán by tracing calligraphy as the ink freezes.
   - Trial at Tabríz: serve coffee and overhear the hall, timing deciding
     what is caught.
   - Ṭabarsí and Zanján: ration bread through the winter (a light survival
     layer).
   - Karbilá: listen behind the curtain, sound and text over sight.
   - Ṭihrán–Núr: carry the scroll through the night without drawing notice
     (gentle stealth).
5. **Use what you learned.** *Ace Attorney* and *Pentiment* let knowledge
   from one conversation be brought into another: the right fact to the
   right guard, merchant or doubter opens a scene or changes a mind.
6. **Care instead of combat.** *Spiritfarer* makes hospitality the play:
   carrying water to the wounded, keeping a fire, sheltering a child. The
   weight is moral, not mechanical.
7. **Consequence and memory.** Characters remember how they were treated
   across chapters; the epilogue could be the player's testimony to Nabíl,
   built from what they chose to see and record (as *Pentiment* closes on
   the story the player helped tell).
8. **Talk while moving.** *Oxenfree* and *Firewatch* keep conversations
   going as the player walks; companions remark on places they pass.

**Built (November 2026), worked through Ṭabarsí:** see
`docs/design/chronicler.md`. A day of three places out of six, where the
player hears accounts that disagree and writes the record, with a
confidence for each (1, 2); inner voices (doubt, fear, longing) at
Ṭabarsí, chapter 1's dawn, the Síyáh-Chál and the exile road (3); heard
accounts carried into other conversations with `present` (5); care in
place of questioning: water, wounds, a dying man's hand, your share of
rice (6); the epilogue as the player's testimony, built from the sealed
record and the pilgrim's own mini-game results (7); and walking talk,
with a companion on the map and remarks on roads and journeys (8). Next:
a second chapter's claims (the trial at Tabríz), so the testimony draws on
more than one.

See also `docs/ai/localization-research.md` for the narrative-system
direction (storylets, central narrative state, stable line ids).

## Story coverage

The book's main episodes all have chapters (20). Bahá'u'lláh's journey to
Karbilá in 1851 is told by witnesses: the caravan's talk at Kirmánsháh on
the journey into *The Promised Ḥusayn*, and Mírzá Muḥammad of Mázindarán,
who came down with Him, by the canal in Karbilá (the Amír-Niẓám's
"suggestion" and the post of Amír-Díván). Mullá ʿAlí-i-Basṭámí's trial is
*The Trial at Baghdád*.

## Art and polish

Nothing open. (November 2026: the floor writing board replaced the low desk
in the Badasht camp, Chihríq and the Nayríz fort, and the desk stays behind
Ṭáhirih's curtain at Karbilá, where only something that tall reads; the
Vakíl Mosque's front row of columns is cut away with its vaults; a sābāṭ
spans Shíráz's road north; smoke fails a story object with no sprite and
nothing on its cell to draw it, and the H / Tab rings now mark doors and
scenery-drawn story objects, and follow who is present.)

## Robustness and translation

- Every journal entry, dialogue and glossary has been checked against
  Nabíl, in the English and in Ishráq-Khávarí's Persian (*Maṭáliʿu'l-Anvár*,
  a translation of the English: Nabíl's own manuscript is unpublished).
  `docs/sources.md` lists what was checked, with pages in both, and the
  details that come from other sources (God Passes By, A Traveller's
  Narrative, The Chosen Highway). Two structural licences are recorded
  there: chapter 1's evening vigil in the lane, and chapter 2 sending Mullá
  Ḥusayn out with the others.
- The mini-games were tuned against bots. A person should still play each
  on a phone and in Farsi and say what is too hard, too easy or unclear
  (GitHub #3); `npm run minigames -- --phone --locale fa` shows each one
  there.
- HDR glow on a real HDR screen is unconfirmed (GitHub #1).
