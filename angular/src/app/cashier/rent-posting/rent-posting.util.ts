import { Booking } from '../../models/booking.model';
import {
  bookingCheckInYmd,
  bookingCheckOutYmd,
  isBookingCurrentlyStaying,
  isBookingDepartingStatus,
  isBookingDepartingWithinWindow,
} from '../../utils/booking-display.util';
import type { RentPostingRow } from './rent-posting.types';

const PLACEHOLDER_ROOM = new Set(['', '—', 'PM']);

export function bookingConfirmationNo(booking: Booking): string {
  const invoice = String(booking.invoice_Number ?? '').trim();
  if (invoice && invoice !== '0' && invoice !== '—') {
    return invoice;
  }
  return booking.id != null ? String(booking.id) : '';
}

export function bookingGuestDisplayName(booking: Booking): string {
  const name = `${booking.first_Name || ''} ${booking.last_Name || ''}`.trim();
  return name || '—';
}

export function hasRentPostingRoom(booking: Booking): boolean {
  const room = String(booking.room_Number ?? '').trim();
  return !!room && !PLACEHOLDER_ROOM.has(room) && !PLACEHOLDER_ROOM.has(room.toUpperCase());
}

/** حجوزات داخل الفندق — مرشّحة لترحيل الإيجار اليومي */
export function isRentPostingEligible(booking: Booking): boolean {
  if (booking.id == null || !hasRentPostingRoom(booking)) {
    return false;
  }
  return (
    isBookingCurrentlyStaying(booking) ||
    isBookingDepartingWithinWindow(booking) ||
    isBookingDepartingStatus(booking)
  );
}

export function bookingToRentPostingRow(booking: Booking): RentPostingRow {
  return {
    id: String(booking.id),
    bookingId: booking.id,
    bookingNo: bookingConfirmationNo(booking),
    roomNo: String(booking.room_Number ?? '').trim(),
    guestName: bookingGuestDisplayName(booking),
    arrivalDate: bookingCheckInYmd(booking),
    departureDate: bookingCheckOutYmd(booking),
    lastPostDate: '',
  };
}

export function bookingsToRentPostingRows(bookings: Booking[]): RentPostingRow[] {
  return bookings.filter(isRentPostingEligible).map(bookingToRentPostingRow);
}
