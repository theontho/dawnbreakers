# The Dawn-Breakers

A 2.5D isometric web RPG inspired by Nabíl's *The Dawn-Breakers*. Built with
Phaser 3, TypeScript, and Vite. The current prototype is **non-combat** and
focuses on isometric exploration, reflective dialogue, chapter progression,
journals, and historical set pieces.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL.

Useful checks:

```bash
npm run typecheck
npm run lint:localization
npm run build
```

## Native Sky Rewind prototype

The C++/OpenGL version renders the generated Hipparcos catalog in a native
OpenGL window. It has two separate ImGui programs: the original cinematic rewind
window, and a simpler Starfield Time Player window for moving the sky backward
or forward with a custom year/day/hour/minute/second rate. Run it from the repo
root:

```bash
npm run dev:starfield
```

The first run generates `public/sky/hipparcos.csv` from the cached/downloaded
CDS source data. Use `npm run skyrewind:cpp:check` to build, load the catalog,
and compile the OpenGL shaders without opening the visible app window. In the
native app, F1 toggles the old cinematic controls and F2 toggles the new time
player. The shared long-exposure controls accumulate recent sky frames once
apparent motion crosses the shutter threshold, producing camera-like trails in
either playback mode. Connected GPU capsule segments sweep each star between
sampled positions, while the sharp current star is composited only once at the
trail endpoint. Adjustable curve-segment length keeps fast, curved trails
continuous without exposing intermediate star dots. Streak styles include
smooth exposure, solid trails, explicit shutter samples, and the original
single-pass full-star line look with its legacy length and width controls. The moon is
rendered in the OpenGL sky from an approximate lunar orbit, so it follows its
own path rather than moving with the stellar catalog. Moon tracking can retain
a horizon-up view or stabilize the surrounding celestial field; dragging the
view exits tracking. A configurable moon-path framing control samples forward
or backward from the current time, centers the sampled path, and chooses a
perspective or fisheye FOV that contains it. Wide-angle fisheye projection blends in above 110 degrees
to preserve angular star size and avoid perspective edge defocus. The Sun,
Mercury, Venus, Mars, Jupiter, and Saturn use approximate orbital ephemerides,
apparent brightness, and colors, and share the same wide-angle, long-exposure,
and HDR rendering path. A calibrated flat-display projection derives a
rectilinear horizontal and vertical field of view from the rendered surface
size and centered eye distance, producing correct geometry from that viewing
position without fisheye distortion.

On macOS, the native app requests a half-float OpenGL surface and opts into
Extended Dynamic Range. **HDR output** uses available XDR headroom directly on
capable displays and falls back to ACES tone mapping on SDR displays. The
exposure slider adjusts reference brightness without changing simulation data.

## Controls

- **Arrow keys / WASD** - walk
- **E** - speak with a nearby character or interactable story object
- **1-9** - pick a dialogue choice, or click/tap the choice
- **J** - open the journal
- **Esc** - open settings

## Project structure

```
src/
  main.ts                 # Phaser game config + scene list
  scenes/
    BaseMapScene.ts       # shared isometric scene behavior
    baseMapTypes.ts       # shared map, tile, geometry, and spawn types
    baseMap*.ts           # shared map scene HUD, flow, movement, reveal, types, and world helpers
    isoGeometry.ts        # shared isometric projection/drawing helpers
    MapEditorScene.ts     # in-game map editor
    mapEditor*.ts         # editor storage, input, palette, geometry, asset picker, and world helpers
    TitleScene.ts         # title card and chapter entry
    titleControls.ts      # title screen button/dropdown helpers
    DialogueScene.ts      # overlay UI that renders a DialogueTree
    JournalScene.ts       # readable entries and chapter notes
  dialogue/
    types.ts              # DialogueTree / DialogueNode / DialogueChoice
    flags.ts              # persisted story flags (localStorage)
  data/
    chapters.ts           # chapter registry and completion predicates
    dialogues.ts          # dialogue registry
    dialogues_ch/         # chapter-owned dialogue modules
  assets/
    mapAssetLibrary.ts    # public map asset exports
    mapAssetDefinitions.ts
    mapAssetTextures.ts
    mapAssetTypes.ts
  i18n/
    locales/              # current locale content
```

## Adding a new dialogue

1. Add a `DialogueTree` in `src/data/dialogues.ts`.
2. For chapter-owned content, prefer a module in `src/data/dialogues_ch/` and
   register it through the dialogue registry.
3. Register an NPC or story object in a `BaseMapScene` subclass that calls
   `this.startSimpleDialogue('dialogue-id')`.
4. Use `effect: { set: { someFlag: true } }` on choices to record outcomes;
   read them later with `getFlags()`.

## Adding a new scene / location

1. Create `src/scenes/MyScene.ts` extending `BaseMapScene` for explorable maps.
2. Register it in the `scene` array in `src/main.ts`.
3. Add chapter metadata in `src/data/chapters.ts` when it belongs to chapter
   progression.
4. Transition with `this.scene.start('MyScene')`.

Central figures can be spoken of and represented through setting, narration, or
threshold objects, but should not be implemented as ordinary interactable NPCs.

## Roadmap ideas

- Replace generated placeholder textures with real isometric art.
- More locations: Karbilá, Búshihr, the road to Mákú, Shaykh Ṭabarsí.
- Letters of the Living as recruitable companions whose presence unlocks
  dialogue choices via flags.
- A small inventory of letters / tablets the player can carry between scenes.
- A narrative-friendly localization/content pipeline is deferred for now. The
  current locale files remain in place.

## A note on history

The dialogue is a **dramatised paraphrase**, not a quotation of Nabíl's
narrative. Treat it as a starting point and refine with primary sources.
