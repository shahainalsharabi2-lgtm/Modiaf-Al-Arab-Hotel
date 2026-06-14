import { Booking } from '../../models/booking.model';
import {
  bookingCheckInYmd,
  bookingCheckOutYmd,
  effectiveStayDays,
  isBookingCurrentlyStaying,
  isBookingDepartingStatus,
  isBookingDepartingWithinWindow,
} from '../../utils/booking-display.util';
import {
  bookingConfirmationNo,
  bookingGuestDisplayName,
} from '../../cashier/rent-posting/rent-posting.util';
import type {
  NightAuditReservationRow,
  NightAuditReservationStatusKey,
  NightAuditReservationsTab,
} from './night-audit-reservations.types';

function reservationStatusKey(booking: Booking): NightAuditReservationStatusKey {
  const status = String(booking.status ?? '').trim().toLowerCase();
  if (status === 'active' || isBookingCurrentlyStaying(booking)) {
    return 'staying';
  }
  if (booking.booking_Confirmed === false) {
    return 'unconfirmed';
  }
  return 'reserved';
}

function isDepositRefundBooking(booking: Booking): boolean {
  if (String(booking.status ?? '').trim().toLowerCase() === 'cancelled') {
    return false;
  }
  const paid = Number(booking.payment_Amount) || 0;
  const remaining = Number(booking.remaining_Amount) || 0;
  return paid > 0 && remaining > 0;
}

function isDepartingBalanceBooking(booking: Booking): boolean {
  const status = String(booking.status ?? '').trim().toLowerCase();
  if (status === 'cancelled' || status === 'checked_out') {
    return false;
  }
  const remaining = Number(booking.remaining_Amount) || 0;
  if (remaining <= 0) {
    return false;
  }
  return isBookingDepartingWithinWindow(booking) || isBookingDepartingStatus(booking);
}

function isReviewableBooking(booking: Booking): boolean {
  return String(booking.status ?? '').trim().toLowerCase() !== 'cancelled';
}

export function bookingToNightAuditReservationRow(booking: Booking): NightAuditReservationRow | null {
  if (booking.id == null || !isReviewableBooking(booking)) {
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
    statusKey: reservationStatusKey(booking),
    depositRefundEligible: isDepositRefundBooking(booking),
    departingBalanceEligible: isDepartingBalanceBooking(booking),
  };
}

export function bookingsToNightAuditReservationRows(bookings: Booking[]): NightAuditReservationRow[] {
  return bookings
    .map(bookingToNightAuditReservationRow)
    .filter((row): row is NightAuditReservationRow => row != null);
}

export function rowsForNightAuditTab(
  rows: NightAuditReservationRow[],
  tab: NightAuditReservationsTab,
): NightAuditReservationRow[] {
  switch (tab) {
    case 'depositRefund':
      return rows.filter((row) => row.depositRefundEligible);
    case 'departingBalance':
      return rows.filter((row) => row.departingBalanceEligible);
    default:
      return rows;
  }
}

export function countNightAuditTabRows(
  rows: NightAuditReservationRow[],
  tab: Exclude<NightAuditReservationsTab, 'reservations'>,
): number {
  return rowsForNightAuditTab(rows, tab).length;
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
