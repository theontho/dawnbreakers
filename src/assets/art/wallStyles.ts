import { GARDEN_WALL_H, gardenWallFace } from './badashtProps';
import type { Ctx } from './canvasKit';
import { FOLD_WALL, foldWallFace, RAMPART, rampartFace } from './fortressProps';
import { interiorFace, mihrabFace, vaultWallFace } from './interiorWalls';
import { SERAI_BAY_H, seraiBayFace, seraiWindowFace } from './seraiWalls';
import { MADRASA_BAY_H, madrasaBayFace, madrasaBlindFace } from './tehranMadrasa';
import {
  SHIP_CABIN_WALL_H, shipCurtainFace, shipPegsFace, shipPortFace, shipTimberFace,
} from './shipCabinWalls';
import { SHRINE_WALL_H, shrineNicheFace, shrineWallFace } from './shrineInterior';
import { ARCH_WALL_H, lowArchFace } from './siyahChal';
import { CITY_WALL_H, cityWallFace, snowyCityWallFace } from './tehranGate';
import { TENT_CLOTH, TENT_WALL_H, tentLiningFace } from './tentInterior';
import { PALISADE, palisadeFace } from './palisade';
import { COMPOUND_WALL, compoundWallFace, TOWN_WALL, townWallFace } from './town/townWalls';
import { vakilWallFace } from './vakilHall';
import { BRIDGE_GALLERY_H, bridgeGalleryFace } from './isfahanBridge';
import { ROOF_PARAPET_H, roofParapetFace } from './tabriz';
import { withDoorPieces, type OpeningPainter, type WallDoorLook } from './wallDoors';

/**
 * The connected wall styles: how tall and thick each wall is, how it is
 * capped and what it joins, with the face painter from its own art module.
 * `wallPainter.ts` turns a style into the pieces a map places cell by cell.
 */

export type WallCap = 'merlons' | 'snowMerlons' | 'stakes' | 'coping' | 'flat' | 'battlements' | 'mudCoping';

export interface WallStyle {
  height: number;
  /** Thickness as a fraction of a cell. */
  thickness: number;
  /** Paints one face in face space; `light` is the face brightness. */
  face: (ctx: Ctx, w: number, h: number, light: number) => void;
  top: number;
  cap: WallCap;
  /** Other textures this wall joins as if they were wall (gates, towers). */
  joins?: readonly string[];
  /**
   * The doorway of its derived door pieces (see wallDoors.ts), or false for
   * a wall that takes no door (a feature piece, a gallery of arches).
   */
  door?: WallDoorLook | false;
  /** On a derived door piece: the wall style it belongs to, as one run. */
  doorOf?: string;
  /** On a derived door piece: the doorway painted on the run's face. */
  opening?: OpeningPainter;
}

/** The run a piece belongs to: a door piece runs with its wall. */
export function wallFamily(texture: string): string {
  return WALL_STYLES[texture]?.doorOf ?? texture;
}

const BASE_STYLES: Readonly<Record<string, WallStyle>> = {
  // The mountain fortresses' outer wall (chapter 6), 8 m to the merlon tops; see fortressProps.
  'ch6-rampart': {
    height: RAMPART.height, thickness: 0.6, top: 0x7a838a, cap: 'snowMerlons',
    joins: ['ch6-fortress-gate', 'ch6-maku-fortress', 'ch6-chihriq-fortress'],
    face: rampartFace,
    door: { frame: 0x8a9298, leaf: 0x4a3626, lintel: 'stone' },
  },
  // A shepherd's fold on the mountainside (chapter 6): 1.2 m of dry stone under a cap of snow; see fortressProps.
  'ch6-fold-wall': {
    height: FOLD_WALL.height, thickness: 0.3, top: 0xe6ecf0, cap: 'mudCoping',
    face: foldWallFace,
  },
  // Ṭihrán's city wall (chapter 10), 5.7 m of rammed earth, plain in summer and snowbound in winter; see tehranGate.
  'ch10-city-wall': {
    height: CITY_WALL_H, thickness: 0.6, top: 0xb89670, cap: 'battlements', joins: ['ch10-west-gate'],
    face: cityWallFace,
  },
  'ch10-city-wall-snow': {
    height: CITY_WALL_H, thickness: 0.6, top: 0xb89670, cap: 'snowMerlons', joins: ['ch10-west-gate'],
    face: snowyCityWallFace,
  },
  // The Síyáh-Chál's walls, as high as its arcade (4.3 m); see siyahChal.
  'ch10-low-arch': {
    height: ARCH_WALL_H, thickness: 0.6, top: 0x2a2826, cap: 'flat', joins: ['ch10-vault-wall'],
    face: lowArchFace,
    door: false,
  },
  'ch10-vault-wall': {
    height: ARCH_WALL_H, thickness: 0.6, top: 0x2a2826, cap: 'flat', joins: ['ch10-low-arch'],
    face: vaultWallFace,
  },
  // Badasht's garden walls (chapter 7), at true scale; see badashtProps.
  'ch7-garden-wall': {
    height: GARDEN_WALL_H, thickness: 0.34, top: 0xa88456, cap: 'mudCoping',
    face: gardenWallFace,
    door: { frame: 0x9a7448, lintel: 'timber' },
  },
  // Ṭabarsí's palisade (chapter 8): 3.5 m of stakes on an earth bank; see palisade.ts.
  'ch8-palisade': {
    height: PALISADE.height, thickness: 0.36, top: 0x5a4028, cap: 'stakes', joins: ['ch8-watchtower'],
    face: palisadeFace,
    door: { frame: 0x5a4028, leaf: 0x4a3420, lintel: 'timber' },
  },
  // Indoors; see interiorFace.
  'interior-wall': {
    height: 90, thickness: 0.3, top: 0xd8ccb0, cap: 'flat', joins: ['interior-mihrab'],
    door: { frame: 0x8a6a48, leaf: 0x4a3420, lintel: 'none', ajar: true },
    face: interiorFace,
  },
  // The prayer niche set into the qibla wall: a tiled frame round a pointed arch.
  'interior-mihrab': {
    height: 90, thickness: 0.3, top: 0xd8ccb0, cap: 'flat', joins: ['interior-wall'],
    face: mihrabFace,
    door: false,
  },
  // The pilgrim ship's cabin, below the quarterdeck; see shipCabinWalls.ts.
  'ch3-cabin-wall': {
    height: SHIP_CABIN_WALL_H, thickness: 0.26, top: 0x5a3a20, cap: 'flat', joins: ['ch3-cabin-port', 'ch3-cabin-pegs', 'ch3-cabin-curtain'],
    face: shipTimberFace,
    door: { frame: 0x6a4a2c, leaf: 0x4a3420, lintel: 'none' },
  },
  'ch3-cabin-port': {
    height: SHIP_CABIN_WALL_H, thickness: 0.26, top: 0x5a3a20, cap: 'flat', joins: ['ch3-cabin-wall', 'ch3-cabin-pegs', 'ch3-cabin-curtain'],
    face: shipPortFace,
    door: false,
  },
  'ch3-cabin-pegs': {
    height: SHIP_CABIN_WALL_H, thickness: 0.26, top: 0x5a3a20, cap: 'flat', joins: ['ch3-cabin-wall', 'ch3-cabin-port', 'ch3-cabin-curtain'],
    face: shipPegsFace,
    door: false,
  },
  // The partition into the inner room, hung with a curtain that is never drawn aside.
  'ch3-cabin-curtain': {
    height: SHIP_CABIN_WALL_H, thickness: 0.26, top: 0x5a3a20, cap: 'flat', joins: ['ch3-cabin-wall', 'ch3-cabin-port', 'ch3-cabin-pegs'],
    face: shipCurtainFace,
    door: false,
  },
  // The arcade of lodging rooms round a caravanserai court; see seraiWalls.ts.
  'ch2-serai-bay': {
    height: SERAI_BAY_H, thickness: 0.34, top: 0xb89466, cap: 'coping', joins: ['ch2-serai-bay-lit', 'ch2-serai-window'],
    face: (ctx, w, h, l) => seraiBayFace(ctx, w, h, l, false),
  },
  'ch2-serai-bay-lit': {
    height: SERAI_BAY_H, thickness: 0.34, top: 0xb89466, cap: 'coping', joins: ['ch2-serai-bay', 'ch2-serai-window'],
    face: (ctx, w, h, l) => seraiBayFace(ctx, w, h, l, true),
    door: false,
  },
  'ch2-serai-window': {
    height: SERAI_BAY_H, thickness: 0.34, top: 0xb89466, cap: 'coping', joins: ['ch2-serai-bay', 'ch2-serai-bay-lit'],
    face: seraiWindowFace,
    door: false,
  },
  // The arcade of students' cells round a Ṭihrán madrasa court; see tehranMadrasa.ts.
  'nur-madrasa-cell': {
    height: MADRASA_BAY_H, thickness: 0.34, top: 0xbc9a6a, cap: 'coping', joins: ['nur-madrasa-cell-lit', 'nur-madrasa-blind'],
    face: (ctx, w, h, l) => madrasaBayFace(ctx, w, h, l, false),
  },
  'nur-madrasa-cell-lit': {
    height: MADRASA_BAY_H, thickness: 0.34, top: 0xbc9a6a, cap: 'coping', joins: ['nur-madrasa-cell', 'nur-madrasa-blind'],
    face: (ctx, w, h, l) => madrasaBayFace(ctx, w, h, l, true),
    door: false,
  },
  'nur-madrasa-blind': {
    height: MADRASA_BAY_H, thickness: 0.34, top: 0xbc9a6a, cap: 'coping', joins: ['nur-madrasa-cell', 'nur-madrasa-cell-lit'],
    face: madrasaBlindFace,
    door: false,
  },
  // The shrine of Shaykh Ṭabarsí: limewash, damp and lamp smoke; see shrineInterior.
  'ch8-shrine-wall': {
    height: SHRINE_WALL_H, thickness: 0.34, top: 0xcfc8b4, cap: 'flat', joins: ['ch8-shrine-niche'],
    face: shrineWallFace,
  },
  'ch8-shrine-niche': {
    height: SHRINE_WALL_H, thickness: 0.34, top: 0xcfc8b4, cap: 'flat', joins: ['ch8-shrine-wall'],
    face: shrineNicheFace,
    door: false,
  },
  // A Badasht pavilion seen from inside: printed cotton lining; see tentInterior.
  'ch7-tent-wall': {
    height: TENT_WALL_H, thickness: 0.12, top: TENT_CLOTH, cap: 'flat',
    face: tentLiningFace,
  },
  // True scale (the Shíráz pilot): the city wall, rammed earth under big merlons; see town/townWalls.
  'town-wall': {
    height: TOWN_WALL.height, thickness: 0.8, top: 0xb89670, cap: 'battlements', joins: ['city-gate', 'ch2-quran-gate', 'nayriz-round-tower'],
    face: townWallFace,
    door: { frame: 0x8f8068, leaf: 0x4a3020, lintel: 'stone' },
  },
  // A courtyard or garden wall at true scale, joining the town houses it closes
  // and the entrance bays and gatehouses set in it.
  'compound-wall': {
    height: COMPOUND_WALL.height, thickness: 0.3, top: 0xc49a68, cap: 'mudCoping',
    joins: ['town-house-small', 'town-house', 'town-house-large', 'ch1-house-threshold', 'trial-residence-gate', 'martyrs-serai-gate'],
    face: compoundWallFace,
    door: { frame: 0xa8744a, lintel: 'timber', tile: 0x2f7f96 },
  },
  // The Vakíl Mosque's hall walls (chapter 4): yellow brick, haft-rang band, marble dado; see vakilHall.ts.
  'ch4-vakil-wall': {
    height: 150, thickness: 0.4, top: 0xc8a070, cap: 'coping', joins: ['ch4-qibla-iwan', 'ch4-prayer-arch', 'ch4-vakil-portal'],
    face: vakilWallFace,
    door: { frame: 0xb08050, lintel: 'brick', tile: 0x2e7c8a },
  },
  // The Sí-o-Se-Pol's west gallery seen from the roadway (chapter 5): an arch to each cell; see isfahanBridge.ts.
  'ch5-bridge-gallery': {
    height: BRIDGE_GALLERY_H, thickness: 0.9, top: 0xc9a46a, cap: 'coping',
    face: (ctx, w, h, l) => bridgeGalleryFace(ctx, w, h, l),
    door: false,
  },
  // The low brick parapets of the Tabríz roofs (chapter 9), chest-high at true scale; see tabriz.ts.
  'ch9-parapet-low': {
    height: ROOF_PARAPET_H, thickness: 0.3, top: 0xd8c8a4, cap: 'coping',
    face: roofParapetFace,
  },
};

export const WALL_STYLES: Readonly<Record<string, WallStyle>> = withDoorPieces(BASE_STYLES);
