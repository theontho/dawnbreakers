import type { JourneyTerrain } from '../data/journeys';

/** What a band of land may carry, drawn as silhouettes by `landscapeProps`. */
export type PropKind =
  | 'cypress'
  | 'poplar'
  | 'roundTree'
  | 'pine'
  | 'shrub'
  | 'rock'
  | 'serai'
  | 'village'
  | 'cairn'
  | 'reeds'
  | 'snowPine';

export interface PropChance {
  kind: PropKind;
  weight: number;
}

/**
 * One band of the land, from the far range to the verge at the walkers'
 * feet. `base` is where its foot sits (0 at the horizon, 1 at the bottom of
 * the screen) and `rise` how high its outline climbs, both as fractions of
 * the ground's height; `parallax` how fast it slides past.
 */
export interface LandLayer {
  base: number;
  rise: number;
  /** Width of its features in screen heights: small for jagged ridges, large for long swells. */
  wavelength: number;
  /** 0 for rounded swells, 1 for sharp ridges. */
  ridged: number;
  parallax: number;
  /** Night and day colours; nearer layers are darker by night. */
  night: number;
  day: number;
  props?: readonly PropChance[];
  /** Average spacing of props, in screen heights; a prop is skipped by chance. */
  propSpacing?: number;
  propScale?: number;
  /** A still water plane instead of land (the lake shore's middle distance). */
  water?: boolean;
}

export interface TerrainStyle {
  layers: readonly LandLayer[];
  /** The road's dust, night and day, and the near verge it runs along. */
  road: { night: number; day: number };
  /** Grass, stones or snow flicking past in front of the walkers. */
  verge: readonly PropChance[];
  snowfall?: boolean;
}

const DESERT: TerrainStyle = {
  layers: [
    { base: 0, rise: 0.42, wavelength: 1.4, ridged: 0.55, parallax: 0.03, night: 0x0e1222, day: 0x9a8a92 },
    { base: 0.04, rise: 0.16, wavelength: 1.1, ridged: 0.2, parallax: 0.12, night: 0x090b16, day: 0xb79f78,
      props: [{ kind: 'serai', weight: 1 }, { kind: 'village', weight: 1.4 }, { kind: 'cypress', weight: 1 }], propSpacing: 2.6, propScale: 0.32 },
    { base: 0.1, rise: 0.08, wavelength: 0.7, ridged: 0.1, parallax: 0.38, night: 0x05060d, day: 0xa98a5e,
      props: [{ kind: 'shrub', weight: 3 }, { kind: 'rock', weight: 2 }, { kind: 'cairn', weight: 0.5 }], propSpacing: 0.55, propScale: 0.5 },
  ],
  road: { night: 0x23242c, day: 0xcdb48a },
  verge: [{ kind: 'shrub', weight: 2 }, { kind: 'rock', weight: 2 }],
};

const MOUNTAINS: TerrainStyle = {
  layers: [
    { base: 0, rise: 0.95, wavelength: 0.9, ridged: 0.9, parallax: 0.025, night: 0x0f1325, day: 0x8c8ea4 },
    { base: 0.03, rise: 0.48, wavelength: 0.8, ridged: 0.7, parallax: 0.09, night: 0x090c18, day: 0x8a7a68,
      props: [{ kind: 'serai', weight: 0.6 }, { kind: 'poplar', weight: 1.5 }], propSpacing: 2.2, propScale: 0.3 },
    { base: 0.18, rise: 0.14, wavelength: 0.6, ridged: 0.45, parallax: 0.34, night: 0x05060d, day: 0x857258,
      props: [{ kind: 'rock', weight: 3 }, { kind: 'shrub', weight: 2 }, { kind: 'pine', weight: 0.6 }], propSpacing: 0.6, propScale: 0.55 },
  ],
  road: { night: 0x202128, day: 0xb8a284 },
  verge: [{ kind: 'rock', weight: 3 }, { kind: 'shrub', weight: 1 }],
};

const FOREST: TerrainStyle = {
  layers: [
    { base: 0, rise: 0.7, wavelength: 1.2, ridged: 0.3, parallax: 0.03, night: 0x0c1220, day: 0x6a8478 },
    { base: 0.04, rise: 0.22, wavelength: 0.9, ridged: 0.1, parallax: 0.1, night: 0x070b11, day: 0x3f5a3c,
      props: [{ kind: 'roundTree', weight: 3 }, { kind: 'pine', weight: 1 }], propSpacing: 0.12, propScale: 0.42 },
    { base: 0.1, rise: 0.06, wavelength: 0.6, ridged: 0, parallax: 0.36, night: 0x040609, day: 0x30462c,
      props: [{ kind: 'roundTree', weight: 2 }, { kind: 'shrub', weight: 2 }], propSpacing: 0.45, propScale: 1 },
  ],
  road: { night: 0x1a1c1c, day: 0x8a7656 },
  verge: [{ kind: 'shrub', weight: 2 }, { kind: 'rock', weight: 0.5 }],
};

const SNOW: TerrainStyle = {
  layers: [
    { base: 0, rise: 0.9, wavelength: 1, ridged: 0.85, parallax: 0.025, night: 0x3a4660, day: 0xe4ecf4 },
    { base: 0.04, rise: 0.4, wavelength: 0.8, ridged: 0.6, parallax: 0.09, night: 0x2c3650, day: 0xd6e0ea,
      props: [{ kind: 'snowPine', weight: 2 }], propSpacing: 0.5, propScale: 0.35 },
    { base: 0.1, rise: 0.1, wavelength: 0.6, ridged: 0.2, parallax: 0.35, night: 0x232b42, day: 0xc8d4e2,
      props: [{ kind: 'snowPine', weight: 1 }, { kind: 'rock', weight: 1 }], propSpacing: 0.8, propScale: 0.7 },
  ],
  road: { night: 0x384260, day: 0xe8eef6 },
  verge: [{ kind: 'rock', weight: 1 }],
  snowfall: true,
};

const LAKESIDE: TerrainStyle = {
  layers: [
    { base: 0, rise: 0.3, wavelength: 1.5, ridged: 0.4, parallax: 0.03, night: 0x0f1325, day: 0x9a96a8 },
    { base: 0.02, rise: 0, wavelength: 1, ridged: 0, parallax: 0.08, night: 0, day: 0, water: true },
    { base: 0.2, rise: 0.05, wavelength: 0.7, ridged: 0.05, parallax: 0.36, night: 0x05060d, day: 0xb0a080,
      props: [{ kind: 'reeds', weight: 3 }, { kind: 'poplar', weight: 0.6 }, { kind: 'rock', weight: 1 }], propSpacing: 0.5, propScale: 0.55 },
  ],
  road: { night: 0x24262e, day: 0xd2c4a2 },
  verge: [{ kind: 'reeds', weight: 2 }, { kind: 'rock', weight: 1 }],
};

export const TERRAIN_STYLES: Record<Exclude<JourneyTerrain, 'sea'>, TerrainStyle> = {
  desert: DESERT,
  mountains: MOUNTAINS,
  forest: FOREST,
  snow: SNOW,
  lakeside: LAKESIDE,
};
