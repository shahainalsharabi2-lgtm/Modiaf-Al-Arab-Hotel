export type HkRoomOccupancyStatus = 'occupied' | 'vacant';

export type HkHousekeepingStatus = 'clean' | 'dirty';

export type HkBookingStatusKey = 'unavailable' | 'arrivals';

export type HkCompositeDetailsKey = 'notComposite' | 'composite';

export type HkCheckRoomStatusSortKey =
  | 'roomNo'
  | 'name'
  | 'building'
  | 'floor'
  | 'roomType'
  | 'foreignName'
  | 'roomStatus'
  | 'hkStatus';

export type HkCheckRoomStatusSortDir = 'asc' | 'desc';

export type HkCheckRoomStatusViewMode = 'grid' | 'table';

export interface HkCheckRoomStatusRow {
  id: string;
  roomNo: string;
  name: string;
  buildingKey: string;
  buildingLabel: string;
  floor: number;
  roomTypeKey: string;
  roomTypeLabel: string;
  foreignName: string;
  roomStatus: HkRoomOccupancyStatus;
  hkStatus: HkHousekeepingStatus;
  composite: boolean;
  bookingStatus: HkBookingStatusKey;
  compositeDetailsKey: HkCompositeDetailsKey;
}
