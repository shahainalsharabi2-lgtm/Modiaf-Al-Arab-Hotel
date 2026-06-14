import { Booking } from '../../models/booking.model';
import { Room } from '../../models/room.model';
import {
  isBookingArriving,
  isBookingDepartingWithinWindow,
  isBookingReserved,
  stayingBookingRoomNumbers,
} from '../../utils/booking-display.util';
import type {
  RoomsRackBuilding,
  RoomsRackBuildingId,
  RoomsRackModel,
  RoomsRackStat,
  RoomsRackTile,
  RoomsRackTileStatus,
  RoomsRackTypeFilterId,
  RoomsRackTypeFilterOption,
} from './rooms-rack.types';

const TYPE_FILTER_ORDER: Exclude<RoomsRackTypeFilterId, 'all'>[] = [
  'single',
  'double',
  'triple',
  'quadruple',
  'quintuple',
  'sextuple',
  'septuple',
];

function buildingIdForRoom(room: Room): RoomsRackBuildingId {
  const loc = String(room.roomLocation ?? '').trim();
  if (/^(أ|a|building\s*a|مبنى\s*أ)$/i.test(loc)) {
    return 'a';
  }
  return 'main';
}

function classifyRoomType(type: string): Exclude<RoomsRackTypeFilterId, 'all'> {
  const t = String(type ?? '').trim();
  if (/مفرد|single/i.test(t)) {
    return 'single';
  }
  if (/ثنائ|double/i.test(t)) {
    return 'double';
  }
  if (/ثلاث|triple/i.test(t)) {
    return 'triple';
  }
  if (/رباع|quad/i.test(t)) {
    return 'quadruple';
  }
  if (/خماس|quint/i.test(t)) {
    return 'quintuple';
  }
  if (/سداس|sext/i.test(t)) {
    return 'sextuple';
  }
  if (/سباع|sept/i.test(t)) {
    return 'septuple';
  }
  return 'double';
}

function reservedRoomNumbers(bookings: Booking[]): Set<string> {
  const staying = stayingBookingRoomNumbers(bookings);
  const nums = new Set<string>();
  for (const booking of bookings) {
    const num = String(booking.room_Number ?? '').trim();
    if (!num || staying.has(num)) {
      continue;
    }
    if (isBookingArriving(booking) || isBookingReserved(booking)) {
      nums.add(num);
    }
  }
  return nums;
}

function departingRoomNumbers(bookings: Booking[]): Set<string> {
  const nums = new Set<string>();
  for (const booking of bookings) {
    if (!isBookingDepartingWithinWindow(booking)) {
      continue;
    }
    const num = String(booking.room_Number ?? '').trim();
    if (num) {
      nums.add(num);
    }
  }
  return nums;
}

function arrivingRoomNumbers(bookings: Booking[]): Set<string> {
  const nums = new Set<string>();
  for (const booking of bookings) {
    if (!isBookingArriving(booking)) {
      continue;
    }
    const num = String(booking.room_Number ?? '').trim();
    if (num) {
      nums.add(num);
    }
  }
  return nums;
}

function resolveTileStatus(
  room: Room,
  staying: Set<string>,
  reserved: Set<string>,
): RoomsRackTileStatus {
  const num = String(room.roomNumber ?? '').trim();
  if (room.status === 'occupied' || staying.has(num)) {
    return 'occupied';
  }
  if (reserved.has(num)) {
    return 'reserved';
  }
  return 'vacant';
}

function buildStats(tiles: RoomsRackTile[], bookings: Booking[]): RoomsRackStat[] {
  const occupied = tiles.filter((t) => t.status === 'occupied').length;
  const vacant = tiles.filter((t) => t.status === 'vacant').length;
  const reserved = tiles.filter((t) => t.status === 'reserved').length;
  return [
    { key: 'occupiedNow', labelKey: 'statOccupiedNow', count: occupied, tone: 'red' },
    { key: 'vacantNow', labelKey: 'statVacantNow', count: vacant, tone: 'green' },
    { key: 'departures', labelKey: 'statDepartures', count: departingRoomNumbers(bookings).size, tone: 'purple' },
    {
      key: 'availableTonight',
      labelKey: 'statAvailableTonight',
      count: vacant + reserved,
      tone: 'mint',
    },
    { key: 'arrivals', labelKey: 'statArrivals', count: arrivingRoomNumbers(bookings).size, tone: 'blue' },
    { key: 'groupAllotment', labelKey: 'statGroupAllotment', count: 0, tone: 'grey' },
    { key: 'overbooking', labelKey: 'statOverbooking', count: 0, tone: 'pink' },
  ];
}

function buildTypeFilters(tiles: RoomsRackTile[]): RoomsRackTypeFilterOption[] {
  const counts = new Map<Exclude<RoomsRackTypeFilterId, 'all'>, number>();
  for (const id of TYPE_FILTER_ORDER) {
    counts.set(id, 0);
  }
  for (const tile of tiles) {
    counts.set(tile.typeFilterId, (counts.get(tile.typeFilterId) ?? 0) + 1);
  }
  return [
    { id: 'all', labelKey: 'filterAll', count: tiles.length },
    ...TYPE_FILTER_ORDER.map((id) => ({
      id,
      labelKey: `type_${id}`,
      count: counts.get(id) ?? 0,
    })),
  ];
}

function buildBuildings(tiles: RoomsRackTile[]): RoomsRackBuilding[] {
  const mainCount = tiles.filter((t) => t.buildingId === 'main').length;
  const aCount = tiles.filter((t) => t.buildingId === 'a').length;
  return [
    { id: 'main', labelKey: 'buildingMain', count: mainCount },
    { id: 'a', labelKey: 'buildingA', count: aCount },
  ];
}

export function buildRoomsRackModel(rooms: Room[], bookings: Booking[]): RoomsRackModel {
  const staying = stayingBookingRoomNumbers(bookings);
  const reserved = reservedRoomNumbers(bookings);
  const tiles: RoomsRackTile[] = rooms
    .map((room) => {
      const number = String(room.roomNumber ?? '').trim();
      if (!number) {
        return null;
      }
      const typeFilterId = classifyRoomType(room.type);
      const status = resolveTileStatus(room, staying, reserved);
      return {
        id: String(room.id),
        roomId: room.id,
        number,
        typeLabel: String(room.type ?? '').trim() || typeFilterId,
        typeFilterId,
        floor: Number(room.floor) || Math.floor(Number(number) / 100) || 1,
        buildingId: buildingIdForRoom(room),
        status,
        showInfo: status === 'occupied',
      } satisfies RoomsRackTile;
    })
    .filter((tile): tile is RoomsRackTile => tile != null)
    .sort((a, b) => {
      const an = Number(a.number) || a.number;
      const bn = Number(b.number) || b.number;
      if (typeof an === 'number' && typeof bn === 'number') {
        return an - bn;
      }
      return a.number.localeCompare(b.number, undefined, { numeric: true });
    });

  return {
    tiles,
    stats: buildStats(tiles, bookings),
    buildings: buildBuildings(tiles),
    typeFilters: buildTypeFilters(tiles),
  };
}

export function tileMatchesStatFilter(tile: RoomsRackTile, statKey: RoomsRackStat['key'] | null): boolean {
  if (!statKey) {
    return true;
  }
  switch (statKey) {
    case 'occupiedNow':
      return tile.status === 'occupied';
    case 'vacantNow':
      return tile.status === 'vacant';
    case 'availableTonight':
      return tile.status === 'vacant' || tile.status === 'reserved';
    case 'arrivals':
      return tile.status === 'reserved';
    default:
      return true;
  }
}
