import { CARAVANSERAI_FRONT } from './caravanserai';
import { KARBILA_SHRINE_FRONT } from './karbilaShrine';
import { PALACE_PORTICO_FRONT } from './isfahanPalace';
import { RESIDENCE_GATE_FRONT } from './tabrizResidence';
import { SERAI_GATE_FRONT } from './tehranSerai';
import { TOWN_BUILDING_FRONTS } from './town';
import { TOWN_HOUSES } from './town/townHouses';

/**
 * Street fronts: a face a building's art paints as its own front on the
 * street, a gateway, a portal or a row of shopfronts. Such a building is its
 * own street wall, so no wall may run along that face in front of it (see
 * `checkWallSeams`), and a door interaction (an NPC with no texture) may
 * stand on its front door cell: the art draws the door.
 */
export interface BuildingFront {
  /** The face: south (the front-left face, `p` along it) or east (the front-right face, `q` along it). */
  side: 's' | 'e';
  /**
   * Where the door stands along the face, in pixels of the art's ground
   * axes from the face's west end (south face) or south end (east face).
   * None for a front with no one door, such as a row of open shop bays.
   */
  door?: number;
}

/** Each building texture (variant key, as maps place it) with a street front. */
export const BUILDING_FRONTS: Readonly<Record<string, BuildingFront>> = {
  ...TOWN_BUILDING_FRONTS,
  'ch2-caravanserai': CARAVANSERAI_FRONT,
  'ch5-palace-portico': PALACE_PORTICO_FRONT,
  'trial-residence-gate': RESIDENCE_GATE_FRONT,
  'martyrs-serai-gate': SERAI_GATE_FRONT,
  'karbila-shrine': KARBILA_SHRINE_FRONT,
  // Painted as the court-glimpse town house: a street wall and its gateway.
  'zanjan-hujjat-house': TOWN_HOUSES[2]!.front!,
};
