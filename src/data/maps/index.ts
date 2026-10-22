import type { MapDefinition } from './types';
import { cityMap } from './city';
import { ch1IlkhaniMosqueMap } from './ch1IlkhaniMosque';
import { houseQuarterMap } from './houseQuarter';
import { roadMap } from './road';
import { ch2CaravanseraiMap } from './ch2Caravanserai';
import { nurMadrasaMap } from './nurMadrasa';
import { nurLaneMap } from './nurLane';
import { nurTakurMap } from './nurTakur';
import { ch3ShipMap } from './ch3Ship';
import { ch3ShipCabinMap } from './ch3ShipCabin';
import { ch3MeccaMap } from './ch3Mecca';
import { ch4ShirazReturnMap } from './ch4ShirazReturn';
import { ch4VakilMosqueMap } from './ch4VakilMosque';
import { ch5IsfahanBridgeMap } from './ch5IsfahanBridge';
import { ch5MutamidPalaceMap } from './ch5MutamidPalace';
import { ch5ReceptionRoomMap } from './ch5ReceptionRoom';
import { kulaynKashanMap } from './kulaynKashan';
import { kulaynHouseMap } from './kulaynHouse';
import { kulaynCampMap } from './kulaynCamp';
import { ch6MakuMap } from './ch6Maku';
import { ch6MakuChamberMap } from './ch6MakuChamber';
import { ch6ChihriqMap } from './ch6Chihriq';
import { qazvinKarbilaMap } from './qazvinKarbila';
import { qazvinLaneMap } from './qazvinLane';
import { qazvinHouseMap } from './qazvinHouse';
import { ch7BadashtHamletMap } from './ch7BadashtHamlet';
import { ch7BadashtCampMap } from './ch7BadashtCamp';
import { ch7QuddusTentMap } from './ch7QuddusTent';
import { trialStreetMap } from './trialStreet';
import { trialCourtMap } from './trialCourt';
import { trialLaneMap } from './trialLane';
import { ch8ForestRoadMap } from './ch8ForestRoad';
import { ch8TabarsiFortMap } from './ch8TabarsiFort';
import { ch8TabarsiShrineMap } from './ch8TabarsiShrine';
import { nayrizQuarterMap } from './nayrizQuarter';
import { nayrizMosqueMap } from './nayrizMosque';
import { nayrizFortMap } from './nayrizFort';
import { ch9TabrizSquareMap } from './ch9TabrizSquare';
import { ch9BarrackRoofMap } from './ch9BarrackRoof';
import { zanjanQuarterMap } from './zanjanQuarter';
import { zanjanFortMap } from './zanjanFort';
import { zanjanHouseMap } from './zanjanHouse';
import { ch10TehranStreetMap } from './ch10TehranStreet';
import { ch10SiyahChalMap } from './ch10SiyahChal';
import { ch10ExileRoadMap } from './ch10ExileRoad';

export type { MapDefinition } from './types';

/**
 * The single source of truth for walkable map scenes. `main.ts` iterates this
 * list and constructs one `MapScene` instance per definition. To add a new
 * map: create a `MapDefinition` file in this directory and append it here.
 */
export const MAP_DEFINITIONS: readonly MapDefinition[] = [
  cityMap,
  ch1IlkhaniMosqueMap,
  houseQuarterMap,
  roadMap,
  ch2CaravanseraiMap,
  nurMadrasaMap,
  nurLaneMap,
  nurTakurMap,
  ch3ShipMap,
  ch3ShipCabinMap,
  ch3MeccaMap,
  ch4ShirazReturnMap,
  ch4VakilMosqueMap,
  ch5IsfahanBridgeMap,
  ch5MutamidPalaceMap,
  ch5ReceptionRoomMap,
  kulaynKashanMap,
  kulaynHouseMap,
  kulaynCampMap,
  ch6MakuMap,
  ch6MakuChamberMap,
  ch6ChihriqMap,
  qazvinKarbilaMap,
  qazvinLaneMap,
  qazvinHouseMap,
  ch7BadashtHamletMap,
  ch7BadashtCampMap,
  ch7QuddusTentMap,
  trialStreetMap,
  trialCourtMap,
  trialLaneMap,
  ch8ForestRoadMap,
  ch8TabarsiFortMap,
  ch8TabarsiShrineMap,
  nayrizQuarterMap,
  nayrizMosqueMap,
  nayrizFortMap,
  ch9TabrizSquareMap,
  ch9BarrackRoofMap,
  zanjanQuarterMap,
  zanjanFortMap,
  zanjanHouseMap,
  ch10TehranStreetMap,
  ch10SiyahChalMap,
  ch10ExileRoadMap,
];
