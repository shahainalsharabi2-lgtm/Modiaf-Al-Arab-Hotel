export type RoomsRackTileStatus = 'vacant' | 'occupied' | 'reserved';

export type RoomsRackBuildingId = 'main' | 'a';

export type RoomsRackTypeFilterId =
  | 'all'
  | 'single'
  | 'double'
  | 'triple'
  | 'quadruple'
  | 'quintuple'
  | 'sextuple'
  | 'septuple';

export type RoomsRackStatKey =
  | 'occupiedNow'
  | 'vacantNow'
  | 'departures'
  | 'availableTonight'
  | 'arrivals'
  | 'groupAllotment'
  | 'overbooking';

export interface RoomsRackTile {
  id: string;
  roomId: number;
  number: string;
  typeLabel: string;
  typeFilterId: Exclude<RoomsRackTypeFilterId, 'all'>;
  floor: number;
  buildingId: RoomsRackBuildingId;
  status: RoomsRackTileStatus;
  showInfo: boolean;
}

export interface RoomsRackStat {
  key: RoomsRackStatKey;
  labelKey: string;
  count: number;
  tone: string;
}

export interface RoomsRackBuilding {
  id: RoomsRackBuildingId;
  labelKey: string;
  count: number;
}

export interface RoomsRackTypeFilterOption {
  id: RoomsRackTypeFilterId;
  labelKey: string;
  count: number;
}

export interface RoomsRackModel {
  tiles: RoomsRackTile[];
  stats: RoomsRackStat[];
  buildings: RoomsRackBuilding[];
  typeFilters: RoomsRackTypeFilterOption[];
}
