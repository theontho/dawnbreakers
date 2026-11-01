# Dawn-Breakers RPG - Chapter Build Plan

This plan is the implementation contract for a dialogue-first, 2.5D isometric web RPG based on Nabíl-i-Aʿẓam's *The Dawn-Breakers* (*Maṭáliʿu'l-Anwár*). The game remains non-combat: walking, exploration, conversations, journals, choices, flags, chapter transitions, and reflective historical set pieces.

## Status (October 2026)

The original ten chapters are built out: 20 maps of roughly 20 to 32 cells a
side with per-map ambience, several new people per chapter, objectives and
journal entries for every chapter, and an epilogue map (`Ch10ExileRoad`).
Ten chapters were added after the plan, so there are now twenty, in
story order:

| # | Chapter (`id`) | Maps |
|---|---|---|
| 1 | The Forerunners (`forerunners`), Karbilá and Kúfih, winter 1843 to 1844 | `KarbilaQuarter`, `KazimHouse`, `BarathaRoad`, `KufihMosque` |
| 4 | Ṭihrán and Núr (`tehran-nur`), 1844 | `NurMadrasa`, `NurLane`, `NurTakur` |
| 6 | The Trial at Baghdád (`baghdad`), January 1845 | `BaghdadQuay`, `BaghdadSerai`, `BaghdadPrison` |
| 9 | Káshán and Kulayn (`kashan-kulayn`), spring 1847 | `KulaynKashan`, `KulaynHouse`, `KulaynCamp` |
| 11 | The Solace of the Eyes (`tahirih`), 1845 to 1848 | `QazvinKarbila`, `QazvinLane`, `QazvinHouse` |
| 13 | The Trial at Tabríz (`tabriz-trial`), summer 1848 | `TrialStreet`, `TrialCourt`, `TrialLane` |
| 15 | The Seven Martyrs of Ṭihrán (`seven-martyrs`), February 1850 | `MartyrsCity`, `MartyrsHouse`, `MartyrsSerai` |
| 16 | Nayríz (`nayriz`), May and June 1850 | `NayrizQuarter`, `NayrizMosque`, `NayrizFort` |
| 18 | Zanján (`zanjan`), 1850 to 1851 | `ZanjanQuarter`, `ZanjanFort`, `ZanjanHouse` |
| 19 | The Promised Ḥusayn (`karbila`), Karbilá, 1851 to 1852 | `KarbilaGroves`, `KarbilaShrineCourt`, `KarbilaLane` |

Chapter numbers come from the order of `SPECS` in `src/data/chapters.ts`, so
the "Chapter N" headings below are the original plan's numbering. Every
chapter of Nabíl's narrative now has a place in the game: the forerunners
(his first two chapters) open it, Mullá ʿAlí-i-Basṭámí's trial at Baghdád
follows the pilgrimage, and Bahá'u'lláh's sojourn in Karbilá (his chapter
25) comes between Zanján and the Síyáh-Chál.

The per-chapter build goals below are kept as the original brief. For how to
add or change content now, see `docs/content-guide.md`.

## Core structure

- **Engine:** Phaser 3 + TypeScript + Vite.
- **Perspective:** 2.5D isometric maps using the existing `BaseMapScene`.
- **Progression:** Each chapter has one or more map scenes and a completion flag.
- **Navigation:** The chapter selector allows free hopping across all chapters.
- **Dialogue:** Each chapter owns its own dialogue module under `src/data/dialogues_ch/`.
- **Scenes:** Each new chapter owns scene files under `src/scenes/` with chapter-prefixed class names.
- **Completion UI:** `ChapterEndScene` appears once when a chapter's completion predicate becomes true.
- **Map assets:** Shared map asset definitions and procedural texture generation live under `src/assets/mapAsset*.ts`.
- **Editor architecture:** `MapEditorScene` delegates storage, input, palette rendering, grid geometry, asset-picker calculations, and world rendering to `src/scenes/mapEditor*.ts` helpers.
- **Base map architecture:** `BaseMapScene` delegates HUD, chapter flow, movement, reveal-mask, and world rendering logic to focused `src/scenes/baseMap*.ts` helpers.
- **Title architecture:** Title controls and the book-opening animation are split from `TitleScene`.
- **Localization:** Current locale files remain as-is; the narrative localization model is intentionally deferred.

## Shared implementation conventions

- Chapter files must not overwrite unrelated chapter work.
- New scenes should subclass `BaseMapScene`.
- Shared tile/map geometry belongs in `src/scenes/baseMapTypes.ts` and `src/scenes/isoGeometry.ts`, not in individual chapter scenes.
- New chapter dialogue modules should export `chapterNNDialogues`.
- Central figures such as the Báb and Bahá'u'lláh may be described through narration, setting, and reverent story objects, but should not be ordinary interactable NPCs.
- The manager wires shared registries after agents finish:
  - `src/main.ts`
  - `src/data/chapters.ts`
  - `src/data/dialogues.ts`
- Every chapter needs:
  - at least one explorable map scene
  - at least two interactable NPCs or story objects, except short transition chapters
  - a chapter-completion flag
  - one primary dialogue tree that marks completion
  - one or more secondary dialogues for atmosphere or context
  - a concise historical note embedded through dialogue or narrator text

## Chapter 1 - The First Letter of the Living

**Historical focus:** Shíráz, evening of 22 May 1844 into dawn of 23 May 1844. Mullá Ḥusayn searches for the Promised One and is received by the Báb.

**Current status:** Fleshed out (October 2026). The declaration is now told from the threshold: the player keeps vigil and hears Mullá Ḥusayn's testimony at dawn.

**Scene keys:** `City`, `HouseQuarter`

**Owned files for agent:**
- `src/scenes/CityScene.ts`
- `src/scenes/HouseQuarterScene.ts`
- `src/data/dialogues_ch/chapter01_shiraz.ts`

**Completion predicate:** `f.ending !== undefined`

**Existing major flags:**
- `rumourTraveller`
- `rumourMerchant`
- `rumourMulla`
- `rumourNeighbour`
- `enteredHouse`
- `firstLetter`
- `ending`

**Build goals:**
- Expand Shíráz so it feels like a living city before the decisive meeting.
- Add 3-5 new NPCs:
  - Water-carrier near the fountain.
  - Gate guard watching late arrivals.
  - Calligrapher or bookbinder near the bazaar.
  - Beggar or orphan near the mosque.
  - Household servant near the Báb's lane.
- Add more non-blocking decor:
  - stacked crates
  - wall lamps
  - courtyard planters
  - small rugs / market cloths
  - cats or birds if simple to draw
- Add at least two new optional dialogue trees that:
  - deepen the rumour network
  - show contrasting attitudes toward the young Siyyid
  - optionally set minor flags such as `heardWaterCarrier`, `guardWarned`, `sawCalligraphy`
- Extend the Báb meeting dialogue with one additional reflective branch:
  - player's scholarly caution
  - player's longing
  - player's fear of presumption
- Do not change the core ending flow unless needed.

**Agent deliverable:** a richer Chapter 1 without changing chapter completion semantics.

## Chapter 2 - The Road North

**Historical focus:** The spread of news after the declaration. The seeker leaves Shíráz; conviction must become movement.

**Current status:** Fleshed out (October 2026).

**Scene key:** `Road`

**Owned files for agent:**
- `src/scenes/RoadScene.ts`
- `src/data/dialogues_ch/chapter02_road.ts`

**Completion predicate:** `!!f.roadComplete`

**Existing major flags:**
- `sharedNews`
- `directionsGiven`
- `roadComplete`

**Build goals:**
- Expand the road into a small journey map:
  - caravanserai stop
  - roadside shrine
  - dry stream bed or broken milestone
  - lone cypress or tamarisk trees
- Add 2-3 NPCs:
  - Another Seeker (already exists; expand him)
  - Sufi dervish or wandering poet
  - caravan merchant / muleteer
  - cautious courier
- Add one optional branch based on Chapter 1:
  - if `firstLetter`, the player can speak with certainty
  - if delayed ending, the player speaks with uncertainty
- Make the road feel transitional: dust, distance, silence, dawn light.
- Completion should still happen through the main road encounter, setting `roadComplete`.

**Agent deliverable:** a richer Chapter 2 transition with more atmosphere and one deeper branch.

## Chapter 3 - Pilgrimage to Mecca

**Historical focus:** The Báb's pilgrimage to Mecca and public proclamation before the Kaʿba.

**New scene keys:**
- `Ch3Ship`
- `Ch3Mecca`

**Owned files for agent:**
- `src/scenes/Ch3ShipScene.ts`
- `src/scenes/Ch3MeccaScene.ts`
- `src/data/dialogues_ch/chapter03_mecca.ts`

**Start scene:** `Ch3Ship`

**Completion flag:** `meccaComplete`

**Completion predicate:** `!!f.meccaComplete`

**Map design:**
- `Ch3Ship`: small deck map with sea tiles around it, mast, crates, railings.
- `Ch3Mecca`: stone courtyard with the Kaʿba represented respectfully as a simple black cuboid texture, pilgrims as non-interactive silhouettes or a few NPCs.

**Important NPCs / objects:**
- Quddús aboard ship.
- A sailor or pilgrim aboard ship.
- Mírzá Muḥíṭ-i-Kirmání near the Kaʿba.
- A restrained proclamation focal point near the Kaʿba, represented through narration and setting rather than an ordinary interactable NPC.

**Primary narrative arc:**
1. Player speaks with Quddús on the ship about certainty and sacrifice.
2. Player enters Mecca.
3. The Báb proclaims His mission before the Kaʿba.
4. A narrator node marks `meccaComplete`.

**Dialogue requirements:**
- Primary tree: `ch3-proclamation`
- Secondary tree: `ch3-quddus-ship`
- Optional tree: `ch3-pilgrim-question`
- At least one branch lets the player choose awe, caution, or scholarly observation.

**Historical tone note:** Avoid gamifying worship. Treat the Kaʿba scene with restraint and reverence.

## Chapter 4 - Return to Shíráz

**Historical focus:** Return from pilgrimage, rising opposition, public humiliation of Quddús, and the Báb's confinement in Shíráz.

**New scene keys:**
- `Ch4ShirazReturn`
- `Ch4VakilMosque`

**Owned files for agent:**
- `src/scenes/Ch4ShirazReturnScene.ts`
- `src/scenes/Ch4VakilMosqueScene.ts`
- `src/data/dialogues_ch/chapter04_shiraz_return.ts`

**Start scene:** `Ch4ShirazReturn`

**Completion flag:** `houseArrestComplete`

**Completion predicate:** `!!f.houseArrestComplete`

**Map design:**
- `Ch4ShirazReturn`: tense city street, governor's officers, closed doors, watchful townspeople.
- `Ch4VakilMosque`: mosque courtyard/interior suggestion with pulpit and gathering crowd.

**Important NPCs / objects:**
- Officer of Ḥusayn Khán.
- Quddús.
- A frightened townsman.
- Mosque witness.
- Optional: restrained mosque-scene narration or setting details that speak of the Báb without placing Him as an ordinary interactable NPC.

**Primary narrative arc:**
1. Player senses the city's change after the proclamation.
2. Quddús is publicly humiliated; player can respond with compassion, restraint, or anger.
3. The Báb is constrained by officials but remains composed.
4. Final narrator node marks `houseArrestComplete`.

**Dialogue requirements:**
- Primary tree: `ch4-house-arrest`
- Secondary tree: `ch4-quddus-witness`
- Optional tree: `ch4-officer-warning`

**Design constraint:** No combat, no graphic depiction. The emotional weight comes through witnesses and aftermath.

## Chapter 5 - Iṣfahán, the Muʿtamid's Sanctuary

**Historical focus:** The Báb's stay in Iṣfahán under the protection of Manúchihr Khán, the Muʿtamid; learned debates and the treatise on prophethood.

**New scene keys:**
- `Ch5IsfahanBridge`
- `Ch5MutamidPalace`

**Owned files for agent:**
- `src/scenes/Ch5IsfahanBridgeScene.ts`
- `src/scenes/Ch5MutamidPalaceScene.ts`
- `src/data/dialogues_ch/chapter05_isfahan.ts`

**Start scene:** `Ch5IsfahanBridge`

**Completion flag:** `isfahanComplete`

**Completion predicate:** `!!f.isfahanComplete`

**Map design:**
- `Ch5IsfahanBridge`: bridge over water, market visitors, city entrance.
- `Ch5MutamidPalace`: palace courtyard, audience carpets, guarded doorway.

**Important NPCs / objects:**
- Manúchihr Khán, the Muʿtamid.
- Imám-Jumʿih or learned cleric.
- Palace attendant.
- Scribe recording the treatise.

**Primary narrative arc:**
1. Player arrives in Iṣfahán and hears of the Muʿtamid's protection.
2. Courtly dialogue around whether power can shelter revelation.
3. The Báb writes a treatise on prophethood between prayers.
4. The Muʿtamid is moved; final node marks `isfahanComplete`.

**Dialogue requirements:**
- Primary tree: `ch5-treatise`
- Secondary tree: `ch5-mutamid`
- Optional tree: `ch5-cleric-question`

**Player stance branch:** respect for learning, concern for politics, or personal wonder.

## Chapter 6 - The Mountain Prisons

**Historical focus:** Imprisonment at Mákú and Chihríq, the harsh mountain setting, the transformation of wardens, and the revelation of the Persian Bayán.

**New scene keys:**
- `Ch6Maku`
- `Ch6Chihriq`

**Owned files for agent:**
- `src/scenes/Ch6MakuScene.ts`
- `src/scenes/Ch6ChihriqScene.ts`
- `src/data/dialogues_ch/chapter06_mountain_prisons.ts`

**Start scene:** `Ch6Maku`

**Completion flag:** `bayanComplete`

**Completion predicate:** `!!f.bayanComplete`

**Map design:**
- `Ch6Maku`: bleak mountain fortress, narrow path, snow/stone palette.
- `Ch6Chihriq`: harsher fortress map with barred chamber and distant cliffs.

**Important NPCs / objects:**
- Warden or guard.
- Ali Khán.
- A prisoner or courier.
- Mullá Ḥusayn arriving after long travel.
- Manuscript / writing desk as interactable object.

**Primary narrative arc:**
1. Player sees isolation at Mákú.
2. A guard's suspicion softens through conversation.
3. Transfer to Chihríq.
4. Player witnesses the revelation of the Persian Bayán.
5. Final node marks `bayanComplete`.

**Dialogue requirements:**
- Primary tree: `ch6-bayan`
- Secondary tree: `ch6-warden-softens`
- Optional tree: `ch6-mulla-husayn-visit`

**Tone:** sparse, cold, contemplative.

## Chapter 7 - The Conference of Badasht

**Historical focus:** The break with the Islamic dispensation publicly dramatized at Badasht; Ṭáhirih's unveiling; Bahá'u'lláh's reconciling presence.

**New scene keys:**
- `Ch7BadashtCamp`

**Owned files for agent:**
- `src/scenes/Ch7BadashtCampScene.ts`
- `src/data/dialogues_ch/chapter07_badasht.ts`

**Start scene:** `Ch7BadashtCamp`

**Completion flag:** `badashtComplete`

**Completion predicate:** `!!f.badashtComplete`

**Map design:**
- Three garden/camp areas:
  - Bahá'u'lláh's tent
  - Quddús's camp
  - Ṭáhirih's garden
- Use tents, carpets, lamps, garden trees.

**Important NPCs / objects:**
- Ṭáhirih.
- Quddús.
- Bahá'u'lláh.
- A shocked believer.
- Optional: messenger between camps.

**Primary narrative arc:**
1. Player hears tension between caution and proclamation.
2. Ṭáhirih appears unveiled.
3. Player chooses response: shock, defence, silence, or seeking explanation.
4. Bahá'u'lláh names a new dispensation and reconciles the gathering.
5. Final node marks `badashtComplete`.

**Dialogue requirements:**
- Primary tree: `ch7-unveiling`
- Secondary tree: `ch7-quddus-tension`
- Optional tree: `ch7-bahaullah-reconcile`

**Design constraint:** Present Ṭáhirih with dignity and agency; avoid sensationalism.

## Chapter 8 - Fort Shaykh Ṭabarsí

**Historical focus:** The gathering at the shrine of Shaykh Ṭabarsí, Mullá Ḥusayn's death, Quddús's leadership, siege, treachery, and sacrifice.

**New scene keys:**
- `Ch8ForestRoad`
- `Ch8TabarsiFort`

**Owned files for agent:**
- `src/scenes/Ch8ForestRoadScene.ts`
- `src/scenes/Ch8TabarsiFortScene.ts`
- `src/data/dialogues_ch/chapter08_tabarsi.ts`

**Start scene:** `Ch8ForestRoad`

**Completion flag:** `tabarsiComplete`

**Completion predicate:** `!!f.tabarsiComplete`

**Map design:**
- `Ch8ForestRoad`: Mazandaran forest path, mud, rain, shrine glimpsed ahead.
- `Ch8TabarsiFort`: wooden palisade around the shrine; no active combat.

**Important NPCs / objects:**
- Mullá Ḥusayn.
- Quddús.
- A royal officer under flag of truce.
- A wounded believer / witness.
- Shrine gate.

**Primary narrative arc:**
1. Player arrives at the forest road.
2. Mullá Ḥusayn speaks of steadfastness.
3. Inside the fort, Quddús counsels patience.
4. A truce dialogue foreshadows betrayal.
5. Final narrator node marks `tabarsiComplete`.

**Dialogue requirements:**
- Primary tree: `ch8-truce`
- Secondary tree: `ch8-mulla-husayn`
- Optional tree: `ch8-quddus-counsel`

**Design constraint:** Keep combat off-screen. Use aftermath, soundless tension, and dialogue.

## Chapter 9 - Tabríz

**Historical focus:** The martyrdom of the Báb in Tabríz, July 1850; the first volley's failure; Sám Khán's plea; final witness.

**New scene keys:**
- `Ch9TabrizSquare`
- `Ch9BarrackRoof`

**Owned files for agent:**
- `src/scenes/Ch9TabrizSquareScene.ts`
- `src/scenes/Ch9BarrackRoofScene.ts`
- `src/data/dialogues_ch/chapter09_tabriz.ts`

**Start scene:** `Ch9TabrizSquare`

**Completion flag:** `martyrdomComplete`

**Completion predicate:** `!!f.martyrdomComplete`

**Map design:**
- `Ch9TabrizSquare`: sombre public square, guards, townspeople.
- `Ch9BarrackRoof`: rooftop/barracks wall suggested from isometric view; ropes, soldiers, empty space.

**Important NPCs / objects:**
- Sám Khán.
- A soldier.
- A witness in the crowd.
- The Báb and Anís represented respectfully.

**Primary narrative arc:**
1. Player hears the crowd's uncertainty.
2. Sám Khán privately pleads to be released from the duty.
3. The Báb consoles him.
4. First volley misses; this can be narrated through a fade/banner, not animated violence.
5. Final witness node marks `martyrdomComplete`.

**Dialogue requirements:**
- Primary tree: `ch9-sam-khan`
- Secondary tree: `ch9-crowd-witness`
- Optional tree: `ch9-final-witness`

**Design constraint:** Treat martyrdom with gravity. No spectacle; no player agency over the execution.

## Chapter 10 - The Black Pit of Tihrán

**Historical focus:** Síyáh-Chál, 1852; Bahá'u'lláh's imprisonment and the foundational vision in the darkness.

**New scene keys:**
- `Ch10TehranStreet`
- `Ch10SiyahChal`

**Owned files for agent:**
- `src/scenes/Ch10TehranStreetScene.ts`
- `src/scenes/Ch10SiyahChalScene.ts`
- `src/data/dialogues_ch/chapter10_siyah_chal.ts`

**Start scene:** `Ch10TehranStreet`

**Completion flag:** `dawnComplete`

**Completion predicate:** `!!f.dawnComplete`

**Map design:**
- `Ch10TehranStreet`: tense street, chains, guards, hostile whispers.
- `Ch10SiyahChal`: nearly monochrome dungeon, lamp glow, heavy chains, prisoners.

**Important NPCs / objects:**
- Bahá'u'lláh.
- Fellow prisoner.
- Guard.
- Lamp or shaft of light.
- Chain / stone pillar as interactable objects.

**Primary narrative arc:**
1. Player sees false accusation and public hostility.
2. Descent into the Black Pit.
3. Fellow prisoner dialogue about fear and hope.
4. Bahá'u'lláh's vision is suggested through light and narrator text.
5. Final node marks `dawnComplete`.

**Dialogue requirements:**
- Primary tree: `ch10-vision`
- Secondary tree: `ch10-prisoner`
- Optional tree: `ch10-guard`

**Ending:** The final chapter end should feel like the close of Part I: from Shíráz's dawn to Tihrán's hidden dawn.

## Ten-agent execution plan

Each agent gets one chapter. To avoid merge conflicts:

| Agent | Chapter | Main task | Files owned |
| --- | --- | --- | --- |
| Agent 1 | Ch 1 | Flesh out existing Shíráz | `CityScene.ts`, `HouseQuarterScene.ts`, `chapter01_shiraz.ts` |
| Agent 2 | Ch 2 | Flesh out Road | `RoadScene.ts`, `chapter02_road.ts` |
| Agent 3 | Ch 3 | Build Mecca pilgrimage | `Ch3*Scene.ts`, `chapter03_mecca.ts` |
| Agent 4 | Ch 4 | Build Return to Shíráz | `Ch4*Scene.ts`, `chapter04_shiraz_return.ts` |
| Agent 5 | Ch 5 | Build Iṣfahán | `Ch5*Scene.ts`, `chapter05_isfahan.ts` |
| Agent 6 | Ch 6 | Build Mountain Prisons | `Ch6*Scene.ts`, `chapter06_mountain_prisons.ts` |
| Agent 7 | Ch 7 | Build Badasht | `Ch7*Scene.ts`, `chapter07_badasht.ts` |
| Agent 8 | Ch 8 | Build Ṭabarsí | `Ch8*Scene.ts`, `chapter08_tabarsi.ts` |
| Agent 9 | Ch 9 | Build Tabríz | `Ch9*Scene.ts`, `chapter09_tabriz.ts` |
| Agent 10 | Ch 10 | Build Síyáh-Chál | `Ch10*Scene.ts`, `chapter10_siyah_chal.ts` |

After all agents finish, the manager will:

1. Import each `chapterNNDialogues` map in `src/data/dialogues.ts`.
2. Add chapter definitions to `src/data/chapters.ts`.
3. Import/register scenes in `src/main.ts`.
4. Add chapter-to-chapter exits where appropriate.
5. Run `npm run build`.
6. Commit the finished checkpoint.
