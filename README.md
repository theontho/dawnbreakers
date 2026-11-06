# The Dawn-Breakers

A 2.5D isometric web RPG inspired by Nabíl's *The Dawn-Breakers*. Built with
Phaser 3, TypeScript, and Vite. The current prototype is **non-combat** and
focuses on isometric exploration, reflective dialogue, chapter progression,
journals, and historical set pieces.

Play it at **https://theontho.github.io/dawnbreakers/**. Publishing a GitHub
release (or running the "Deploy to GitHub Pages" workflow by hand) redeploys it.

## About this game

This is a hobby game, made for fun. It is inspired by Nabíl's narrative of
the early days of the Bábí and Bahá'í Faiths, but it is not that book, and it
is not an official or authoritative work of any kind.

Much of it was made with AI: the code, the art, the music, the writing and the
translations. It will have mistakes in names, dates, places, people and
events, and in how they are told. So please don't take it seriously, as
history or as a statement of anyone's belief. For the true story, read *The
Dawn-Breakers* itself.

The same note is in the game, under **About** on the title screen.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL.

With [just](https://github.com/casey/just) installed (`brew install just`),
`just` lists the shortcuts: `just run` starts the dev server, `just play`
also opens the game in your browser, `just check` typechecks, lints and
builds, and `just smoke`, `just look City:8:13` and the other headless
scripts take the same arguments as their `npm run` forms.

Useful checks:

```bash
npm run typecheck
npm run lint      # eslint, localization coverage, dialogue references, content rules
npm run smoke     # headless: boots every map, opens every NPC dialogue (add -- --gpu for real fps)
npm run build
npm run gallery       # contact sheets of every generated texture -> out/gallery/
npm run render:music  # the synthesized score and sound effects as WAV -> out/music/
npm run look -- City:8:13  # screenshot with the player at a cell -> out/look-*.png
```

The headless scripts render in software by default and always close their
browser; GPU runs leave memory in the graphics driver's page pool, so use
`--gpu` only when measuring frame rate. They use `/usr/bin/chromium` on
Linux (or `CHROMIUM_PATH`); elsewhere, install Playwright's build once with
`npx playwright-core install chromium-headless-shell`.

All art and sound are generated at runtime: textures are painted with the
canvas API at boot, and the music is a generative Persian ensemble (santur,
tār, ney, kamāncheh, daf) synthesized with WebAudio, in modes that keep the
dastgāhs' quarter tones. The title screen plays a recorded score,
`public/dawnbreakers.m4a` (AAC, 96 kbps), "Dawnbreakers" by macattacka, made with
[Suno](https://suno.com) and used non-commercially under its free plan; it falls
back to the synthesized dawn theme if it cannot load.

Writing chapters, maps, or dialogue? Read [`docs/content-guide.md`](docs/content-guide.md)
first. To bring the translations up to date after changing English text:

```bash
node scripts/i18n-sync.mjs --export out/i18n   # missing keys per locale, as JSON
node scripts/i18n-sync.mjs --import out/i18n   # merge the translated JSON back
node scripts/i18n-sync.mjs --prune             # drop keys no source string uses
```

## Publishing

`.github/workflows/pages.yml` builds the game and deploys `dist/` to
<https://theontho.github.io/dawnbreakers/> whenever a GitHub release is
published, or when run by hand (`gh workflow run pages.yml`). The build uses
relative paths, so it works under `/dawnbreakers/`. The title recording and
the packed journey stars are checked in, so deploys never wait on the CDS
server.

## Native Sky Rewind prototype

The C++/OpenGL version renders the generated Hipparcos catalog in a native
OpenGL window. It has two separate ImGui programs: the original cinematic rewind
window, and a simpler Starfield Time Player window for moving the sky backward
or forward with a custom year/day/hour/minute/second rate. Run it from the repo
root:

```bash
npm run dev:starfield
```

It regenerates the checked-in `data/sky/hipparcos.csv` from the
cached/downloaded CDS source data. Use `npm run skyrewind:cpp:check` to build, load the catalog,
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

- **Arrow keys / WASD** - walk; or **click / tap** a spot to walk there (click a person to walk up and talk)
- **E** - speak with a nearby character or interactable story object
- **1-9** - pick a dialogue choice, or click/tap the choice; **Space / Enter** continues
- **J** - open the journal (all chapters, with the current objective)
- **H / hold Tab** - highlight people, story objects, and exits
- **Esc** - open settings
- **`** (backtick) - toggle the developer console and FPS counter (also in Settings)

## Project structure

```
src/
  main.ts                 # Phaser game config + scene list
  scenes/
    MapScene.ts           # the one walkable map scene, driven by a MapDefinition
    mapGround.ts          # ground baked into one RenderTexture (tile variants, slab edges)
    mapAmbience.ts        # colour wash, light pools, vignette, weather particles
    mapNpcs.ts            # NPC placement, presence, speech marks
    mapPathing.ts         # click-to-walk picking and pathfinding
    mapObjectiveHud.ts    # objective tracker under the map title
    baseMapTypes.ts       # shared map, tile, geometry, and spawn types
    baseMap*.ts           # shared map scene HUD, flow, movement, reveal, and world helpers
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
    maps/                 # one MapDefinition per location
    story/                # per-chapter objectives and journal entries
  audio/
    engine.ts             # WebAudio buses, reverb, volume settings, autoplay unlock
    instruments.ts        # synthesized santur, tār, ney, kamāncheh, drone, daf/tombak
    scores.ts             # per-mood pieces in Persian modes (cents, with koron)
    music.ts              # generative phrase composer and look-ahead scheduler
    sfx.ts                # UI, dialogue, footstep and transition effects
    soundscape.ts         # ambient beds: wind, rain, sea, fire, crickets, birds
  assets/
    art/                  # canvas painting kit: iso faces, materials, arches, domes, houses, trees, figures
    mapAssetLibrary.ts    # public map asset exports
    mapAssetDefinitions.ts
    chapters/             # each chapter's placeable objects and bespoke textures
    mapAssetTextures.ts
    mapAssetTypes.ts
  i18n/
    locales/              # current locale content
```

## Adding content

See [`docs/content-guide.md`](docs/content-guide.md): dialogue trees, map
definitions (gates, presence, gated exits, ambience), objectives, journal
entries, and new characters.

Central figures can be spoken of and represented through setting, narration, or
threshold objects, but are never NPCs or dialogue speakers. `npm run lint:content`
enforces this.

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

## License

The game's own code, art, music, writing and translations are licensed under
either of [MIT](LICENSE-MIT) or [Apache-2.0](LICENSE-APACHE), at your option.
[LICENSE](LICENSE) is the full account: it lists the parts under other terms
(the recorded title music, which is non-commercial only, a few quoted scripture
translations, the Hipparcos star data, Natural Earth geography and the bundled
Phaser), and each build writes the bundled packages' notices to `LICENSE.txt` beside `index.html`.

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in this work by you, as defined in the Apache-2.0 license, shall be
dual licensed as above, without any additional terms or conditions.
