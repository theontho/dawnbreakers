# Narrative and Localization Research for Dawnbreakers

This document combines the research pasted into chat, additional research into narrative-heavy games and interactive fiction tools, and observations from the current Dawnbreakers codebase.

## Executive recommendation

Dawnbreakers should use a custom TypeScript narrative system rather than adopting a full external narrative engine right now. The project already has dialogue trees, flags, chapter files, map scenes, and localization scaffolding. The best path is to evolve that into a small, strongly typed narrative layer inspired by Ink, Yarn Spinner, Failbetter storylets, Larian's rule-based quest logic, Owlcat's chapter state systems, and professional localization pipelines.

The recommended shape is:

1. Chapters as the macro progression layer.
2. Storylets as the map and world narrative layer.
3. Dialogue graphs as the conversation layer.
4. A central narrative state object for flags, variables, quest stages, map visits, and major choices.
5. Stable localization line IDs with metadata, not source-text lookup.
6. Validation tools that block broken dialogue, missing translations, forbidden speakers, em dash structures in game text, missing flags, unreachable nodes, and invalid effects.

The strategic goal is not to create a fully branching alternate history. Dawnbreakers should be a historically ordered narrative with reflective agency. Player choices should affect tone, knowledge, trust, journal reflections, optional storylets, NPC follow-ups, and access to contextual material, while the major historical sequence remains anchored.

## Current Dawnbreakers baseline

The current codebase already has several useful foundations:

- `DialogueTree`, `DialogueNode`, and `DialogueChoice` types in `src/dialogue/types.ts`.
- A flag system represented as `Record<string, boolean | number | string>`.
- Chapter-specific dialogue files under `src/data/dialogues_ch/`.
- Chapter registry and chapter roadmap documentation.
- Phaser scenes that launch dialogue from maps.
- Localization support in `src/i18n.ts` with multiple locales:
  - English
  - Farsi
  - Spanish
  - French
  - Hebrew
  - Chinese
  - Japanese
  - Korean
- RTL support and localized font selection.

The main limitation is that localization currently falls back to source text as the key. That is workable for an early prototype, but it becomes fragile once writers revise English lines. Stable line IDs should become the foundation before content volume grows.

## What large narrative games tend to do

### Dialogue storage

Large narrative-heavy RPGs usually represent dialogue as node graphs. Each node typically contains:

- A stable unique ID.
- A speaker ID.
- A reference to localized text.
- Conditions that determine whether the node or choice is available.
- Effects that mutate narrative state.
- Links to child nodes.
- Optional metadata for tone, camera, audio, animation, tags, or production notes.

The storage format varies by studio. Some tools serialize to XML, JSON, ScriptableObjects, or proprietary binary formats. The key pattern is the same: authoring data is separate from engine logic, and runtime systems resolve nodes through stable IDs.

### State and flags

Branching narrative depends on a durable state database. It usually contains:

- Boolean flags.
- Numeric qualities or variables.
- Quest stage values.
- Faction or relationship values.
- Visited locations.
- Major decisions.
- One-shot content markers.

This state lives in the save file. Dialogue conditions, storylet prerequisites, quest logic, map gates, and journal entries all read from it.

### Scripting and quest logic

Larian's Divinity and Baldur's Gate 3 lineage is notable for Osiris, a rule-based, event-driven scripting system. The key idea is reactive logic: when a world event occurs and conditions match, a rule fires and applies effects. This model is powerful for nonlinear play because quest outcomes do not need to happen in a single intended order.

Owlcat's Pathfinder games use Unity and custom narrative tooling. Public modding and community documentation describe a pattern of condition objects, action objects, and a macro narrative state system often discussed as "etudes." The practical takeaway is useful even if we do not copy the implementation: a game with long chapters needs a macro layer that says which broad narrative content is currently active.

For Dawnbreakers, a full Osiris-like scripting language would be overkill. The useful parts are:

- Declarative conditions.
- Command-style effects.
- Event-driven reactions where needed.
- Validation of references and state keys.
- A macro chapter state layer.

### Localization

Professional localization pipelines separate text from game logic. The game references stable string IDs. Translators work on string tables, often exported to XLIFF and handled in CAT tools such as SDL Trados or memoQ.

A robust localization entry usually includes:

- Stable string ID.
- Source text.
- Speaker.
- Scene or chapter.
- Tone.
- Context note.
- Character limit if relevant.
- Whether the line has voice-over.
- Optional screenshot or in-game reference.

The source text must not be the lookup key. Writers revise source lines constantly. If source text is the key, every rewrite can break translations or produce duplicate stale entries.

### Voice-over localization

Fully voiced narrative games multiply complexity. VO localization requires:

- Stable audio IDs tied to string IDs.
- Adapted scripts, not only translated scripts.
- Timing and lip-sync constraints.
- Per-locale audio assets.
- In-engine QA for line length, pacing, and UI overflow.

Dawnbreakers should design IDs so VO can be added later, but it should not couple the narrative architecture to full VO production now.

## Patterns from specific tools and genres

### Ink

Ink is a writer-friendly narrative scripting language from Inkle. Its key strengths:

- Text-first authoring.
- Branching choices with variables and logic.
- A strong editor called Inky.
- Compilation to JSON.
- Game engine integration.

Ink is excellent for prose-heavy branching. The lesson for Dawnbreakers is to make authoring readable and testable, but not necessarily to adopt Ink wholesale. A typed TypeScript content model is easier to integrate with the current Phaser project.

Source: <https://www.inklestudios.com/ink/>

### Yarn Spinner

Yarn Spinner is a popular dialogue and interactive narrative tool used by many games. Its useful patterns include:

- Writer-friendly dialogue files.
- Nodes with titles.
- Commands embedded in dialogue.
- Variables and conditions.
- Line IDs for localization.
- Tooling for validation and integration.

The most important Yarn lesson for Dawnbreakers is stable line IDs plus commands. Dialogue should be able to say "show this line" and "run this effect" without embedding fragile code in every node.

Source: <https://docs.yarnspinner.dev/>

### Storylets and quality-based narrative

Storylets are small pieces of narrative content with prerequisites and effects. Emily Short summarizes the basic pattern:

- There is a piece of content.
- Prerequisites determine when it can play.
- Effects change world state after it plays.

This is ideal for Dawnbreakers map content. Instead of building one massive branching tree, each chapter and location can offer small storylets unlocked by flags, qualities, and historical progress.

Examples:

- A Shiraz bazaar storylet appears only after the player has heard two rumors.
- A companion reflection appears if `qualities.caution` is high.
- A journal entry appears after visiting a location and hearing a specific account.
- A map transition unlocks after a chapter milestone.

Storylets help control combinatorial explosion because content recombines rather than branching forever.

Source: <https://emshort.blog/2019/11/29/storylets-you-want-them/>

### Failbetter and quality-based design

Failbetter-style narrative is associated with qualities: named numeric or boolean values that represent knowledge, wounds, reputation, suspicion, fascination, or progress. Choices often increase or decrease these qualities, and later content checks them.

For Dawnbreakers, qualities are a good fit because the player should not be rewriting history. Instead, choices can shape:

- What the player understands.
- Which witnesses trust the player.
- Which accounts are surfaced.
- How reflective journal text is phrased.
- Which optional context becomes available.
- Which risks or tensions the player notices.

### ChoiceScript

ChoiceScript is useful as a reference for stat-driven branching. It often uses explicit variables that shape available choices and endings. Dawnbreakers can borrow the clarity of visible or hidden qualities without adopting ChoiceScript syntax.

Potential Dawnbreakers qualities:

- `faithfulness`
- `scholarship`
- `caution`
- `compassion`
- `resolve`
- `longing`
- `communityTrust`
- `historicalUnderstanding`

These should not become a min-max system. They should be narrative lenses.

### Twine

Twine is valuable for prototyping. It is fast for testing branch structures and pacing. Dawnbreakers can use Twine-like drafts outside the runtime, but production content should live in the typed content system so it can be validated, localized, and integrated with maps.

### Ren'Py

Ren'Py's useful lessons are:

- Stable labels.
- Clear speaker definitions.
- Script-first workflows.
- Translation extraction.
- Separate source script and translation files.

For Dawnbreakers, the main lesson is stable speaker IDs and stable line IDs from the beginning.

### Articy:draft

Articy:draft is a commercial narrative design tool used in larger productions. It is useful for visual planning and production pipelines. Dawnbreakers probably does not need it now, but the project should borrow its separation of:

- Flow structure.
- Entities.
- Variables.
- Dialogue fragments.
- Localization metadata.

## Recommended Dawnbreakers architecture

### Layer 1: chapters

Chapters should act as the macro state machine. A chapter determines:

- Active maps.
- Available storylets.
- Allowed dialogue sets.
- Journal sections.
- Historical timeline constraints.
- Music and presentation defaults.
- Transition conditions to the next chapter.

Suggested shape:

```ts
interface ChapterDefinition {
  id: ChapterId;
  number: number;
  titleLineId: LineId;
  startsAtMap: MapId;
  activeMaps: readonly MapId[];
  storyletIds: readonly StoryletId[];
  dialogueTreeIds: readonly DialogueTreeId[];
  journalEntryIds: readonly JournalEntryId[];
  completion: ConditionExpr;
}
```

### Layer 2: storylets

Storylets should be used for location-based, optional, reactive, and reflective content.

```ts
interface StoryletDefinition {
  id: StoryletId;
  chapterId: ChapterId;
  locationId?: LocationId;
  priority: number;
  once?: boolean;
  prerequisites: readonly ConditionExpr[];
  content: StoryletContent;
  effects: readonly NarrativeEffect[];
  tags?: readonly StoryTag[];
}
```

Storylets should be selected by a resolver:

```ts
function availableStorylets(
  state: NarrativeState,
  context: NarrativeContext,
): StoryletDefinition[] {
  return storylets
    .filter(storylet => storyletApplies(storylet, state, context))
    .sort((a, b) => b.priority - a.priority);
}
```

### Layer 3: dialogue graphs

Dialogue nodes should move from source-text fields to stable line IDs:

```ts
interface DialogueNode {
  id: DialogueNodeId;
  speakerId: SpeakerId;
  lineId: LineId;
  onEnter?: readonly NarrativeEffect[];
  choices?: readonly DialogueChoice[];
  tags?: readonly StoryTag[];
}

interface DialogueChoice {
  lineId: LineId;
  next?: DialogueNodeId;
  requires?: readonly ConditionExpr[];
  effects?: readonly NarrativeEffect[];
}
```

Do not store lambdas directly in content long term. Functions such as `(flags) => ...` are convenient early, but they are hard to serialize, inspect, localize, and validate. Prefer declarative condition expressions.

### Layer 4: narrative state

Use one central state object:

```ts
interface NarrativeState {
  chapterId: ChapterId;
  currentMapId: MapId;
  flags: Record<FlagId, boolean>;
  qualities: Record<QualityId, number>;
  variables: Record<VariableId, string | number | boolean>;
  quests: Record<QuestId, QuestStageId>;
  visitedLocations: Record<LocationId, boolean>;
  seenStorylets: Record<StoryletId, boolean>;
  seenDialogueNodes: Record<string, boolean>;
  decisions: Record<DecisionId, string>;
}
```

All changes should go through a dispatcher:

```ts
type NarrativeEffect =
  | { type: 'setFlag'; flag: FlagId; value: boolean }
  | { type: 'addQuality'; quality: QualityId; amount: number }
  | { type: 'setQuestStage'; quest: QuestId; stage: QuestStageId }
  | { type: 'markLocationVisited'; location: LocationId }
  | { type: 'recordDecision'; decision: DecisionId; value: string }
  | { type: 'unlockMap'; map: MapId };
```

This keeps save behavior, debugging, validation, and future analytics much cleaner.

### Layer 5: localization

Line IDs should be stable and hierarchical:

```ts
type LineId = `${ChapterId}.${string}.${string}.${number}`;
```

Example IDs:

```text
ch01.shiraz.traveller.arrival.001
ch01.shiraz.merchant.rumour.002
ch01.house.narrator.threshold.001
```

Localization entries should include metadata:

```ts
interface LocalizedLine {
  id: LineId;
  source: string;
  speakerId?: SpeakerId;
  chapterId: ChapterId;
  sceneId?: SceneId;
  tone?: 'quiet' | 'urgent' | 'reflective' | 'formal' | 'fearful';
  context: string;
  translatorNote?: string;
  maxLength?: number;
}
```

The runtime lookup should be closer to:

```ts
tLine('ch01.shiraz.traveller.arrival.001')
```

than:

```ts
t('The exact English sentence used as the key')
```

This allows writers to revise English without breaking every translation.

## Historical and religious content constraints

Dawnbreakers needs content rules that are stricter than a generic RPG because it is working with sacred and historical material.

Rules to encode in validation:

- Central figures such as the Bab and Baha'u'llah should not be represented as ordinary interactable NPCs.
- They may be spoken of, remembered, encountered through historical accounts, or described through narration.
- They should not be modeled as routine quest-giving characters.
- Game text should avoid em dash structures.
- Historical chapters should preserve the major sequence of events.
- Player agency should affect interpretation, preparation, empathy, and knowledge rather than changing core history.

Recommended narrative stance:

- Use witness-led narration.
- Use companions, townspeople, officials, travelers, family members, and chroniclers as interactable figures.
- Use letters, reports, rumors, memory, recitation, and journal reflection for sacred or central figures.
- Let choices shape what the player notices and how the journal synthesizes it.

## Validation should come before content expansion

Before the project adds many more chapters, add a validation script. It should run in CI and locally.

Minimum checks:

- Every dialogue tree has a valid `startId`.
- Every `next` points to an existing node.
- Every node is reachable or explicitly marked as externally reached.
- Every line ID exists in the source string table.
- Every localized catalog has either a translation or an intentional missing marker.
- Every speaker ID exists in the speaker registry.
- Forbidden central figures are not used as interactable speakers.
- Game text contains no em dash character.
- Every condition references a declared flag, quality, variable, quest, or location.
- Every effect references a declared state key.
- No file exceeds the project's content size threshold without being split.
- No duplicate line IDs.
- No duplicate node IDs inside a tree.
- No storylet is impossible because its prerequisites contradict each other.

Useful command target:

```json
{
  "scripts": {
    "validate:narrative": "tsx scripts/validate-narrative.ts"
  }
}
```

## Suggested authoring workflow

1. Writers draft chapter beats in a short chapter outline.
2. Each chapter is broken into locations.
3. Each location gets storylets for rumors, context, ambient encounters, and optional reflections.
4. Major conversations are authored as dialogue graphs.
5. Every line receives a stable line ID and metadata.
6. The validation script checks structure and content rules.
7. Source string tables are exported for translation.
8. Translations are imported into locale catalogs.
9. QA plays each chapter in each supported script direction where possible.

This keeps narrative work writer-friendly while preserving engineering safety.

## Localization pipeline roadmap

### Short term

- Add stable line IDs.
- Add source string table.
- Keep existing locale files, but key them by line ID.
- Add missing translation reporting.
- Preserve current RTL support.

### Medium term

- Add metadata per line.
- Add export to CSV or JSON for translators.
- Add import tooling for translated catalogs.
- Add line length warnings for UI-heavy strings.
- Add screenshots or scene references for difficult lines.

### Long term

- Add XLIFF export and import.
- Support CAT tools.
- Add terminology glossary for names, titles, theological terms, places, and recurring concepts.
- Add optional VO IDs that map directly to line IDs.
- Add per-locale QA reports.

## Recommended source structure

Keep files small and organized by chapter and location:

```text
src/narrative/
  engine/
    conditions.ts
    effects.ts
    narrativeState.ts
    storyletResolver.ts
    dialogueResolver.ts
  registry/
    flags.ts
    qualities.ts
    speakers.ts
    maps.ts
    quests.ts
  content/
    ch01/
      chapter.ts
      shiraz.storylets.ts
      shiraz.dialogues.ts
      house.dialogues.ts
      journal.ts
    ch02/
      chapter.ts
      ...
  localization/
    sourceLines.ts
    locales/
      fa.ts
      es.ts
      fr.ts
      he.ts
      zh.ts
      ja.ts
      ko.ts
scripts/
  validate-narrative.ts
  export-localization.ts
  import-localization.ts
```

This structure keeps code and content from becoming megafiles.

## Priority plan

### P0: foundation

- Add a source line registry with stable line IDs.
- Convert one chapter's dialogue to line IDs as a pilot.
- Add `validate:narrative`.
- Add speaker registry.
- Add forbidden interactable speaker validation.
- Add missing translation validation.
- Add em dash validation for game text.

### P1: narrative state and storylets

- Introduce `NarrativeState`.
- Replace ad hoc flag functions with declarative conditions.
- Add storylet definitions and resolver.
- Add quality registry.
- Add central effect dispatcher.
- Wire storylets into map scenes.

### P2: production localization

- Add translator metadata.
- Add CSV or JSON export.
- Add glossary.
- Add per-locale completeness reports.
- Add UI length checks.

### P3: advanced tooling

- Add visual graph export for dialogue.
- Add unreachable branch visualization.
- Add XLIFF support.
- Add optional VO asset ID mapping.
- Add storylet salience scoring beyond simple priority.

## Risks to avoid

- Do not build an Osiris-scale scripting language too early.
- Do not allow source text to remain the translation key once content grows.
- Do not model historical central figures as ordinary NPCs.
- Do not create one giant chapter file per chapter.
- Do not rely on anonymous lambdas in content if the content needs validation.
- Do not let optional branches become a time cave where every path requires unique follow-up forever.
- Do not add compatibility aliases during schema migrations. Since this is greenfield, migrate content directly.

## Practical design principle

Use branches for immediate emotional and tactical choices. Use qualities for long-term consequence. Use chapters for historical order. Use storylets for optional discovery. Use stable localization IDs for every visible string.

That combination gives Dawnbreakers enough narrative depth for a large historical RPG without inheriting the full cost of AAA branching production.

## Sources and references

- Ink overview and tooling: <https://www.inklestudios.com/ink/>
- Yarn Spinner documentation: <https://docs.yarnspinner.dev/>
- Unity XLIFF localization pipeline: <https://docs.unity3d.com/Packages/com.unity.localization@1.5/manual/XLIFF.html>
- Emily Short on storylets: <https://emshort.blog/2019/11/29/storylets-you-want-them/>
- Osiris extender community reference: <https://github.com/Norbyte/ositools>
- Yarn Spinner examples and game list: <https://yarnspinner.dev/>
- User-provided research notes on BG3, Owlcat, localization, CAT tooling, string IDs, VO localization, and narrative node graphs.
