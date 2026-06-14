import type { HkCheckRoomStatusRow } from './hk-check-room-status.types';

const ROOM_TYPES = [
  { key: 'double', label: 'ثنائية' },
  { key: 'triple', label: 'ثلاثية' },
  { key: 'quadruple', label: 'رباعية' },
  { key: 'quintuple', label: 'خماسية' },
] as const;

const BUILDING = { key: 'main', label: 'المبنى الرئيسي' };

function floorForRoom(roomNo: number): number {
  return Math.floor(roomNo / 100);
}

function buildRow(roomNo: number): HkCheckRoomStatusRow {
  const type = ROOM_TYPES[roomNo % ROOM_TYPES.length];
  const occupied = roomNo % 3 !== 0;
  const clean = roomNo % 5 !== 0;
  const arrivals = roomNo === 108;
  return {
    id: String(roomNo),
    roomNo: String(roomNo),
    name: `غرفة ${roomNo}`,
    buildingKey: BUILDING.key,
    buildingLabel: BUILDING.label,
    floor: floorForRoom(roomNo),
    roomTypeKey: type.key,
    roomTypeLabel: type.label,
    foreignName: `Room${roomNo}`,
    roomStatus: occupied ? 'occupied' : 'vacant',
    hkStatus: clean ? 'clean' : 'dirty',
    composite: false,
    bookingStatus: arrivals ? 'arrivals' : 'unavailable',
    compositeDetailsKey: 'notComposite',
  };
}

export const HK_CHECK_ROOM_STATUS_ROWS: ReadonlyArray<HkCheckRoomStatusRow> = Array.from(
  { length: 388 },
  (_, index) => buildRow(101 + index),
);

export const HK_CHECK_ROOM_STATUS_FILTER_OPTIONS = {
  roomTypes: ROOM_TYPES,
  buildings: [BUILDING],
  floors: [1, 2, 3, 4, 5],
} as const;
