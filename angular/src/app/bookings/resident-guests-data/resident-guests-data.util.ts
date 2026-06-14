import { Booking } from '../../models/booking.model';
import {
  bookingCheckInYmd,
  bookingCheckOutYmd,
  effectiveStayDays,
  isBookingCurrentlyStaying,
} from '../../utils/booking-display.util';
import {
  bookingConfirmationNo,
  bookingGuestDisplayName,
} from '../../cashier/rent-posting/rent-posting.util';
import { toDateOnlyString } from '../../utils/date-only';
import type { ResidentGuestRow } from './resident-guests-data.types';

export function bookingReservationDateYmd(booking: Booking): string {
  if (booking.bookingDateTime) {
    return toDateOnlyString(booking.bookingDateTime);
  }
  if (booking.lastModificationTime) {
    return toDateOnlyString(booking.lastModificationTime);
  }
  return '';
}

export function bookingToResidentGuestRow(booking: Booking): ResidentGuestRow | null {
  if (booking.id == null || !isBookingCurrentlyStaying(booking)) {
    return null;
  }
  return {
    id: String(booking.id),
    bookingId: booking.id,
    reservationNo: bookingConfirmationNo(booking),
    guestName: bookingGuestDisplayName(booking),
    bookingDate: bookingReservationDateYmd(booking),
    arrivalDate: bookingCheckInYmd(booking),
    nights: effectiveStayDays(booking),
    departureDate: bookingCheckOutYmd(booking),
    roomType: String(booking.room_Type ?? '').trim(),
  };
}

export function bookingsToResidentGuestRows(bookings: Booking[]): ResidentGuestRow[] {
  return bookings.map(bookingToResidentGuestRow).filter((row): row is ResidentGuestRow => row != null);
}
