import type { Booking } from '../models/booking.model';
import type { Room } from '../models/room.model';
import {
  isBookingActive,
  isBookingArriving,
  isBookingCurrentlyStaying,
  isBookingDepartingStatus,
  isBookingDepartingWithinWindow,
  isBookingReserved,
} from '../utils/booking-display.util';

export interface RoomStatusSummary {
  totalRooms: number;
  cleanRooms: number;
  dirtyRooms: number;
  vacantAvailable: number;
  occupied: number;
  reserved: number;
  maintenance: number;
  outOfService: number;
  arriving: number;
  departing: number;
  residents: number;
}

export function buildRoomStatusSummary(rooms: Room[], bookings: Booking[]): RoomStatusSummary {
  const totalRooms = rooms.length;
  const dirtyRooms = rooms.filter((r) => r.status === 'dirty').length;
  const maintenance = rooms.filter((r) => r.status === 'maintenance').length;
  const outOfService = rooms.filter((r) => r.status === 'suspended').length;
  const cleanRooms = Math.max(0, totalRooms - dirtyRooms);

  const activeBookings = bookings.filter((b) => isBookingActive(b));
  const bookedRooms = new Set<string>();
  const stayingRooms = new Set<string>();

  for (const b of activeBookings) {
    const roomNum = String(b.room_Number ?? '').trim();
    const isBookedRecord =
      isBookingReserved(b) || (isBookingArriving(b) && !isBookingCurrentlyStaying(b));
    if (isBookedRecord && roomNum) {
      bookedRooms.add(roomNum);
    }
    if (isBookingCurrentlyStaying(b) && roomNum) {
      stayingRooms.add(roomNum);
    }
  }

  const occupied = stayingRooms.size;
  const reserved = bookedRooms.size;
  const vacantAvailable = Math.max(
    0,
    rooms.filter((r) => r.status === 'available').length - occupied,
  );

  return {
    totalRooms,
    cleanRooms,
    dirtyRooms,
    vacantAvailable,
    occupied,
    reserved,
    maintenance,
    outOfService,
    arriving: activeBookings.filter((b) => isBookingArriving(b)).length,
    departing: activeBookings.filter(
      (b) => isBookingDepartingStatus(b) || isBookingDepartingWithinWindow(b),
    ).length,
    residents: stayingRooms.size,
  };
}
