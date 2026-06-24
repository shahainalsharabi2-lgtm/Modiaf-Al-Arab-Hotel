import { Booking } from '../../models/booking.model';
import { Room } from '../../models/room.model';
import {
  bookingCheckOutYmd,
  isBookingActive,
  isBookingArriving,
  isBookingCurrentlyStaying,
  isBookingDepartingStatus,
  isBookingDepartingWithinWindow,
  isBookingReserved,
  stayingBookingRoomNumbers,
} from '../../utils/booking-display.util';
import { todayLocalDateString } from '../../utils/date-only';
import {
  ROOM_PLAN_STAT_ROW_1,
  ROOM_PLAN_STAT_ROW_2,
} from './room-plan.static-data';
import type {
  RoomPlanBuilding,
  RoomPlanFooterSummary,
  RoomPlanRoom,
  RoomPlanRoomStatus,
  RoomPlanStaticPayload,
  RoomPlanStatCard,
} from './room-plan.types';

function cloneStatCards(cards: RoomPlanStatCard[]): RoomPlanStatCard[] {
  return cards.map((card) => ({ ...card, count: 0 }));
}

function roomTypeKey(type: string): string {
  const t = String(type ?? '').trim();
  if (/ثنائ|double/i.test(t)) {
    return 'typeDouble';
  }
  if (/ثلاث|triple/i.test(t)) {
    return 'typeQuadruple';
  }
  if (/رباع|quad/i.test(t)) {
    return 'typeQuadruple';
  }
  if (/خماس|quint/i.test(t)) {
    return 'typeQuintuple';
  }
  return 'typeDouble';
}

function isRoomDirty(room: Room): boolean {
  const status = (room.status ?? '').toLowerCase();
  return status === 'dirty' || status === 'cleaning';
}

function isRoomOutOfService(room: Room): boolean {
  const status = (room.status ?? '').toLowerCase();
  return status === 'maintenance' || status === 'suspended';
}

function activeBookingsByRoom(bookings: Booking[]): Map<string, Booking[]> {
  const map = new Map<string, Booking[]>();
  for (const booking of bookings) {
    if (!isBookingActive(booking)) {
      continue;
    }
    const roomNumber = String(booking.room_Number ?? '').trim();
    if (!roomNumber) {
      continue;
    }
    const list = map.get(roomNumber) ?? [];
    list.push(booking);
    map.set(roomNumber, list);
  }
  return map;
}

function pickPrimaryBooking(list: Booking[]): Booking | null {
  if (!list.length) {
    return null;
  }
  const staying = list.find((b) => isBookingCurrentlyStaying(b));
  if (staying) {
    return staying;
  }
  const reserved = list.find((b) => isBookingReserved(b));
  if (reserved) {
    return reserved;
  }
  return list[0];
}

function bookingBalance(booking: Booking | null): number {
  if (!booking) {
    return 0;
  }
  if (booking.remaining_Amount != null && Number.isFinite(Number(booking.remaining_Amount))) {
    return Number(booking.remaining_Amount);
  }
  const total = Number(booking.total_Price) || 0;
  const paid = Number(booking.payment_Amount) || 0;
  return total - paid;
}

function resolvePlanStatus(
  room: Room,
  stayingRooms: Set<string>,
  bookingsForRoom: Booking[],
): RoomPlanRoomStatus {
  const roomNumber = String(room.roomNumber ?? '').trim();
  const isStaying =
    stayingRooms.has(roomNumber) ||
    (room.status ?? '').toLowerCase() === 'occupied' ||
    bookingsForRoom.some((b) => isBookingCurrentlyStaying(b));

  if (isStaying) {
    return 'occupied';
  }
  if (isRoomDirty(room)) {
    return 'dirty';
  }
  return 'clean';
}

function classifyRoom(
  room: Room,
  stayingRooms: Set<string>,
  bookingsForRoom: Booking[],
): {
  outOfService: boolean;
  occupied: boolean;
  reserved: boolean;
  dirty: boolean;
  arriving: boolean;
  departing: boolean;
  departingReserved: boolean;
} {
  const roomNumber = String(room.roomNumber ?? '').trim();
  const outOfService = isRoomOutOfService(room);
  const occupied =
    !outOfService &&
    (stayingRooms.has(roomNumber) ||
      (room.status ?? '').toLowerCase() === 'occupied' ||
      bookingsForRoom.some((b) => isBookingCurrentlyStaying(b)));
  const reserved =
    !outOfService &&
    !occupied &&
    bookingsForRoom.some((b) => isBookingReserved(b));
  const dirty = isRoomDirty(room);
  const arriving = bookingsForRoom.some((b) => isBookingArriving(b));
  const departing = bookingsForRoom.some(
    (b) => isBookingDepartingStatus(b) || isBookingDepartingWithinWindow(b),
  );
  const today = todayLocalDateString();
  const departingReserved = bookingsForRoom.some(
    (b) => isBookingReserved(b) && bookingCheckOutYmd(b) === today,
  );

  return {
    outOfService,
    occupied,
    reserved,
    dirty,
    arriving,
    departing,
    departingReserved,
  };
}

export function buildRoomPlanFromApi(rooms: Room[], bookings: Booking[]): RoomPlanStaticPayload {
  const stayingRooms = stayingBookingRoomNumbers(bookings);
  const bookingsByRoom = activeBookingsByRoom(bookings);
  const statRow1 = cloneStatCards(ROOM_PLAN_STAT_ROW_1);
  const statRow2 = cloneStatCards(ROOM_PLAN_STAT_ROW_2);
  const statCounts = new Map<string, number>();

  const bump = (key: string, delta = 1) => {
    statCounts.set(key, (statCounts.get(key) ?? 0) + delta);
  };

  const planRooms: RoomPlanRoom[] = [];
  let totalCredit = 0;
  let totalDebit = 0;

  for (const room of rooms) {
    const roomNumber =
      String(room.roomNumber ?? '').trim() ||
      String((room as Room & { RoomNumber?: string }).RoomNumber ?? '').trim() ||
      (room.id != null && room.id > 0 ? String(room.id) : '');
    if (!roomNumber) {
      continue;
    }
    const roomBookings = bookingsByRoom.get(roomNumber) ?? [];
    const primaryBooking = pickPrimaryBooking(roomBookings);
    const balance = bookingBalance(primaryBooking);
    const classification = classifyRoom(room, stayingRooms, roomBookings);
    const status = resolvePlanStatus(room, stayingRooms, roomBookings);

    if (balance > 0) {
      totalDebit += balance;
    } else if (balance < 0) {
      totalCredit += Math.abs(balance);
    }

    if (classification.outOfService) {
      bump('outOfService');
    } else if (classification.occupied) {
      bump('occupiedNow');
      if (classification.dirty) {
        bump('occupiedDirty');
      } else {
        bump('occupiedClean');
      }
    } else if (classification.reserved) {
      if (classification.dirty) {
        bump('reservedDirty');
      } else {
        bump('reservedClean');
      }
      bump('vacantNow');
      bump('availableTonight');
    } else {
      bump('vacantNow');
      bump('availableTonight');
      if (classification.dirty) {
        bump('availableDirty');
      } else {
        bump('availableClean');
      }
    }

    if (classification.departing) {
      bump('expectedDeparture');
    }
    if (classification.departingReserved) {
      bump('expectedDepartureReserved');
    }

    planRooms.push({
      id: String(room.id ?? roomNumber),
      number: roomNumber,
      typeKey: roomTypeKey(room.type),
      balance,
      status,
      floor: Number(room.floor) || 1,
      buildingId: 'main',
      hasArrival: classification.arriving,
      paymentDue: balance > 0.009,
    });
  }

  for (const card of [...statRow1, ...statRow2]) {
    card.count = statCounts.get(card.key) ?? 0;
  }

  const operationalRooms = rooms.filter((room) => !isRoomOutOfService(room)).length;
  const occupiedCount = statCounts.get('occupiedNow') ?? 0;
  const occupancyRate =
    operationalRooms > 0 ? Math.round((occupiedCount / operationalRooms) * 1000) / 10 : 0;

  const floors = [...new Set(planRooms.map((room) => room.floor))].sort((a, b) => a - b);
  const buildings: RoomPlanBuilding[] = [
    { id: 'main', labelKey: 'buildingMain', count: planRooms.length },
    { id: 'a', labelKey: 'buildingA', count: 0 },
  ];

  const footer: RoomPlanFooterSummary = {
    occupancyRate,
    totalCredit: Math.round(totalCredit * 100) / 100,
    totalDebit: Math.round(totalDebit * 100) / 100,
    totalNet: Math.round((totalCredit - totalDebit) * 100) / 100,
  };

  return {
    statsRow1: statRow1,
    statsRow2: statRow2,
    buildings,
    floors: floors.length ? floors : [1],
    rooms: planRooms.sort((a, b) => {
      if (a.floor !== b.floor) {
        return a.floor - b.floor;
      }
      return a.number.localeCompare(b.number, undefined, { numeric: true });
    }),
    footer,
  };
}
