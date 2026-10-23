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
4. **One signature verb per chapter.** *What Remains of Edith Finch* gives
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

- The old plane tree (`plane-tree-old`, 24 m) reads like a dense dome; give
  it a lower fork and visible limbs.
- Qazvín's mosque faces the tall town wall across a two-cell walk, so its
  portal is mostly hidden; a mosque variant whose front faces the other way
  would let it open onto the lane.
- Orange trees remain in Zanján, Qazvín's lane and the Tabríz court, where
  the climate is wrong, because dialogue names them; swapping them means
  rewording lines that are already translated.
- The low `writing-desk` table remains in four camp and outdoor scenes
  (Badasht camp, Chihríq, Qazvín, the Nayríz fort); the floor writing board
  (`floor-writing-board`) may suit them better.
- An officer by the Vakíl Mosque pulpit is 37% covered by the colonnade
  (a smoke note, under the 60% failure line); every nearby cell was worse.
- Extend the visibility check to gameplay helpers (witness spots, door
  highlights) where they lack a sprite.

## Robustness and translation

- The new map-editor tree labels (Young Oak, Walnut, Pollard and others) are
  built from templates, so the localization lint does not see them and they
  have no fa/zh yet.
- QazvinLane's east-edge arrival is described in the map's notes as the
  Hamadán road, but Hamadán lies south-west of Qazvín; the exit check only
  catches labels that name a direction.
- A chapter's opening narration plays once per save
  (`opened_<chapter>`), so replaying a chapter from chapter select does not
  show it again.
- A few historical details were checked from memory rather than against the
  page (for example Quddús's halter in Shíráz); a pass against the full text
  of Nabíl would confirm them.
- `src/scenes/MapScene.ts` is near the 500-line limit again; split further
  if it grows.
