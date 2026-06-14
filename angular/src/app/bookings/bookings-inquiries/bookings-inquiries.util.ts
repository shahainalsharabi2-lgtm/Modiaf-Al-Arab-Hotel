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
import type { BookingsInquiryRow, BookingsInquiryStatusKey } from './bookings-inquiries.types';

function inquiryStatusKey(booking: Booking): BookingsInquiryStatusKey {
  const status = String(booking.status ?? '').trim().toLowerCase();
  if (status === 'active' || isBookingCurrentlyStaying(booking)) {
    return 'staying';
  }
  if (booking.booking_Confirmed === false) {
    return 'unconfirmed';
  }
  return 'reserved';
}

function isInquiryBooking(booking: Booking): boolean {
  return String(booking.status ?? '').trim().toLowerCase() !== 'cancelled';
}

export function bookingToInquiryRow(booking: Booking): BookingsInquiryRow | null {
  if (booking.id == null || !isInquiryBooking(booking)) {
    return null;
  }
  const roomNo = String(booking.room_Number ?? '').trim();
  return {
    id: String(booking.id),
    bookingId: booking.id,
    reservationNo: bookingConfirmationNo(booking),
    guestName: bookingGuestDisplayName(booking),
    arrivalDate: bookingCheckInYmd(booking),
    nights: effectiveStayDays(booking),
    departureDate: bookingCheckOutYmd(booking),
    roomNo: roomNo || '—',
    roomType: String(booking.room_Type ?? '').trim() || '—',
    statusKey: inquiryStatusKey(booking),
    total: Number(booking.total_Price) || 0,
  };
}

export function bookingsToInquiryRows(bookings: Booking[]): BookingsInquiryRow[] {
  return bookings.map(bookingToInquiryRow).filter((row): row is BookingsInquiryRow => row != null);
}

export function isWithinDateRange(ymd: string, from: string, to: string): boolean {
  if (!ymd) {
    return false;
  }
  if (from && ymd < from) {
    return false;
  }
  if (to && ymd > to) {
    return false;
  }
  return true;
}
