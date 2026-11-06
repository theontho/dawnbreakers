import type Phaser from 'phaser';
import type { FlagOp, FlagState } from '../../dialogue/types';
import type { MusicMood, SoundLayer } from '../../audio';
import type { Building, Decor, MapExit, TileKind } from '../../scenes/baseMapTypes';
import type { SpokenLine } from '../../ui/remarkCaption';

/**
 * Data-driven map definition consumed by `MapScene`. One file per map under
 * `src/data/maps/<key>.ts` exports a `MapDefinition`; the registry in
 * `src/data/maps/index.ts` is the single source of truth that `main.ts`
 * iterates to register scenes.
 *
 * The `build` callback gets a thin `TileCanvas` so each chapter's tile
 * painting reads the same as the old `buildMap()` body, just on the canvas
 * instead of on a class. Buildings, decor, NPCs, and exits are pure data.
 */
export interface MapDefinition {
  /** Phaser scene key. */
  key: string;
  /** HUD title shown at the top of the screen. */
  title: string;
  /** Map size in grid cells. */
  width: number;
  height: number;
  /** Default spawn when entering the scene without explicit spawnX/spawnY. */
  spawn: { x: number; y: number };
  /**
   * Texture of the player's figure on this map, when someone other than the
   * chapter's witness is seen through here (an interlude). Left out, the
   * chapter's `player` walks it.
   */
  player?: string;
  /**
   * Narration played once, on first arrival on this map, saying who the
   * player is here: the map's counterpart to a chapter's `opening`.
   */
  opening?: string;
  /** Tile painting. Map starts as all `grass`. */
  build: (canvas: TileCanvas) => void;
  buildings: BuildingSpec[];
  decor: DecorSpec[];
  npcs: NpcSpec[];
  exits: MapExit[];
  /**
   * Lighting, colour wash, and weather. Omit for a plain daylit map. A
   * function lets the mood follow the story (a dust storm after an event,
   * winter after a siege); it is re-evaluated after every dialogue.
   */
  ambience?: MapAmbience | ((flags: FlagState) => MapAmbience);
  /** Doorways into other maps (usually a building's interior). */
  doors?: DoorSpec[];
  /** Cells that open only as the story allows (a ladder rigged after a storm). */
  passages?: PassageSpec[];
  /** Things said as the player walks past places; see `MapRemark`. */
  remarks?: MapRemark[];
  /** A companion who walks with the player; see `MapCompanion`. */
  companion?: MapCompanion;
  /**
   * An indoor map: the cut edge of the slab is drawn as masonry rather than
   * earth. Pair it with interior walls along the back edges and a door or
   * edge exit back outside.
   */
  interior?: boolean;
  /** How the map's water moves; rivers otherwise run along their length on their own. */
  water?: WaterSpec;
  /**
   * Scenery that moves, drawn live in the scene (a ship's wake): called once
   * the world is built, with the world position of grid cell (0, 0)'s centre.
   */
  animate?: (scene: Phaser.Scene, origin: { x: number; y: number }) => void;
}

/**
 * Something said as the player walks past a place, without stopping them
 * (`src/scenes/mapRemarks.ts`): a companion's remark on what they pass, or
 * a word called out on the road. It plays once, the first time the player
 * comes within `radius` cells of `gridX, gridY` while `requires` holds.
 * Central figures never speak one (see AGENTS.md).
 */
export interface MapRemark {
  /** Unique on its map; it is remembered as heard under this id. */
  id: string;
  gridX: number;
  gridY: number;
  /** How near, in cells either way, the player must come. Defaults to 3. */
  radius?: number;
  requires?: (flags: FlagState) => boolean;
  lines: SpokenLine[];
  /** Applied when the remark is said: what the player learns by hearing it. */
  effect?: FlagOp;
}

/** Someone who walks a step behind the player on this map, while `present` holds. */
export interface MapCompanion {
  texture: string;
  present?: (flags: FlagState) => boolean;
}

export interface WaterSpec {
  /**
   * Open sea all round: the moving sea is drawn under the whole view, out
   * past the map to the screen's edges, instead of painted on the ground.
   */
  openSea?: boolean;
  /** Grid cells a second the water moves past (x, y); [0, 0] for still water. */
  flow?: readonly [number, number];
  /** The view rolls and heaves gently, as from a ship's deck. */
  roll?: boolean;
}

/**
 * Cells walkable only while `open` holds and blocked otherwise, re-checked
 * after every dialogue. Pair with props whose `present` follows the same flag.
 */
export interface PassageSpec {
  cells: Array<{ x: number; y: number }>;
  open: (flags: FlagState) => boolean;
}

/**
 * A door the player can go through: stand next to the building cell
 * `gridX, gridY` (where the door is painted) and press E or click it.
 */
export interface DoorSpec {
  gridX: number;
  gridY: number;
  /** Prompt while the door is open, ending with `[E]`, e.g. "Enter the mosque  [E]". */
  prompt: string;
  targetScene: string;
  targetSpawnX: number;
  targetSpawnY: number;
  /** When provided, the door only opens while this returns true. */
  requires?: (flags: FlagState) => boolean;
  /** Prompt while the door is shut. */
  lockedLabel?: string;
}

export type ParticleKind = 'dust' | 'motes' | 'fireflies' | 'snow' | 'embers' | 'spray' | 'leaves' | 'rain';

/** A warm (or cold) pool of additive light on a cell. */
export interface MapLight {
  gridX: number;
  gridY: number;
  radius: number;
  color: number;
  /** 0..1 peak alpha of the glow. */
  intensity: number;
}

export interface MapAmbience {
  /**
   * Multiply colour wash over the whole world, under the HUD. Use deep blues
   * for night, ambers for dusk, greys for prisons. Alpha 0.3..0.7 reads well.
   */
  wash?: { color: number; alpha: number };
  /** Extra light pools. Lamps (`lamp` decor) already glow automatically. */
  lights?: MapLight[];
  particles?: ParticleKind;
  /** Vignette strength 0..1, or false for none. Defaults to 0.55. */
  vignette?: number | false;
  /** Score for the map; crossfades when it changes. Defaults to 'dusk'. */
  music?: MusicMood;
  /** Ambient bed. Defaults to a sound matching `particles`, plus fire near fires. */
  sound?: SoundLayer[];
}

/** A canvas the `build` callback paints onto. */
export interface TileCanvas {
  readonly width: number;
  readonly height: number;
  /** Direct read/write into the tile grid. Use sparingly; prefer `paintRect` etc. */
  readonly map: TileKind[][];
  /** Direct read/write into the block grid. Use sparingly; prefer `block`. */
  readonly blocked: boolean[][];
  paintRect(x: number, y: number, w: number, h: number, kind: TileKind): void;
  paintPath(cells: ReadonlyArray<readonly [number, number]>): void;
  setTile(x: number, y: number, kind: TileKind): void;
  block(x: number, y: number): void;
  unblock(x: number, y: number): void;
  inBounds(x: number, y: number): boolean;
}

/** A building footprint placed at a grid cell. */
export interface BuildingSpec extends Building {
  /** When true, mark every footprint cell as blocked. Defaults to true. */
  blocks?: boolean;
  /**
   * Which painted variant (`texture~N`) of a texture with variants to use.
   * Left out, the map picks one from the placement; set it whenever the map
   * depends on a particular variant's art, such as a door on its front.
   */
  variant?: number;
}

/** Decor: cosmetic prop on a single cell, optionally blocking. */
export interface DecorSpec extends Decor {
  /**
   * Which painted variant (`texture~N`) to use, as for buildings: set it
   * when the map depends on a particular one, such as a tree of a given age.
   */
  variant?: number;
}

/** Gate on a dialogue: until `when(flags)` holds, `lockedDialogue` plays instead. */
export interface DialogueGate {
  when: (flags: FlagState) => boolean;
  lockedDialogue: string;
}

/**
 * A person or story object the player can face and press E on. Central
 * figures are never NpcSpecs; they are reached through threshold objects
 * and narration (see AGENTS.md).
 */
export interface NpcSpec {
  gridX: number;
  gridY: number;
  /**
   * Its sprite. Left out for a story object the map already draws, such as
   * a door piece in a wall run (`wallRun(..., { doors })`): the interaction
   * sits on that cell with no block of its own.
   */
  texture?: string;
  /** Prompt shown when the player is adjacent. Should end with `[E]`. */
  prompt: string;
  /** Dialogue tree id launched on interaction. */
  dialogue: string;
  gate?: DialogueGate;
  /** When provided, the NPC only stands on the map while this returns true. */
  present?: (flags: FlagState) => boolean;
}
