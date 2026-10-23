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

**Recommendation:** start with three that reinforce each other: the witness
who gives testimony (1), limited time per chapter (2) and one signature
activity per chapter (4). Layer inner voices (3) and using knowledge (5) on
top later. Next step: a short design doc working one chapter through (Ṭabarsí
or the trial at Tabríz) before building anything.

See also `docs/ai/localization-research.md` for the narrative-system
direction (storylets, central narrative state, stable line ids).

## Story coverage

The book's main episodes all have chapters (17). Episodes still only
mentioned in passing:

- Bahá'u'lláh's journey to Karbilá in 1851 and the Amír-Niẓám's rise; would
  have to be told entirely through witnesses.
- Mullá ʿAlí-i-Basṭámí's trial in Baghdád, the first martyrdom.

## Art and polish

- The low `writing-desk` table remains in four camp and outdoor scenes
  (Badasht camp, Chihríq, Qazvín, the Nayríz fort); the floor writing board
  (`floor-writing-board`) may suit them better.
- An officer by the Vakíl Mosque pulpit is 37% covered by the colonnade
  (a smoke note, under the 60% failure line); every nearby cell was worse.
- City's road north loses two of its four exit cells behind the wall and
  house on its east side (a smoke note, not a failure). Any tall thing just
  south-east of a north-edge exit hides it, so clearing it means reshaping
  the north end of the city, not moving one piece. A gateway over the road
  (a sābāṭ, as in Ṭihrán's street) would also count it as marked.
- Extend the visibility check to gameplay helpers (witness spots, door
  highlights) where they lack a sprite.

## Robustness and translation

- The journal history (`src/data/story/`) has been checked against Nabíl's
  text and corrected. A few details in it come from other sources, which is
  fine but worth knowing if the game ever cites them: the Súrih of the
  Inevitable at Badasht and the declaration at the Kaʿba (God Passes By),
  the condition on the Báb's release from Shíráz (A Traveller's Narrative),
  and the gold buttons at the Síyáh-Chál. The dialogue and glossary have had
  the same pass, except the Núr chapter, the first two chapters' rumours and
  travellers, and the place and word glossaries (only skimmed; Ṭáhirih's
  "two months" in Hamadán is unconfirmed).
