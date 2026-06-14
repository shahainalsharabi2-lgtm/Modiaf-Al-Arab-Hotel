import { Booking } from '../../models/booking.model';
import {
  bookingCheckInYmd,
  bookingCheckOutYmd,
} from '../../utils/booking-display.util';
import { toDateOnlyString } from '../../utils/date-only';
import {
  bookingConfirmationNo,
  bookingGuestDisplayName,
  hasRentPostingRoom,
} from '../rent-posting/rent-posting.util';
import type { PreviousInvoiceRow } from './previous-invoices.types';

/** فاتورة سابقة — حجز مُغلق (تسجيل خروج) */
export function isPreviousInvoiceBooking(booking: Booking): boolean {
  if (booking.id == null) {
    return false;
  }
  return booking.status === 'checked_out';
}

export function previousInvoiceIssueDate(booking: Booking): string {
  const fromModified = toDateOnlyString(booking.lastModificationTime);
  if (fromModified) {
    return fromModified;
  }
  const checkout = bookingCheckOutYmd(booking);
  if (checkout) {
    return checkout;
  }
  return toDateOnlyString(booking.booking_Date);
}

export function bookingToPreviousInvoiceRow(booking: Booking): PreviousInvoiceRow {
  const guestName = bookingGuestDisplayName(booking);
  const roomNo = hasRentPostingRoom(booking) ? String(booking.room_Number ?? '').trim() : String(booking.room_Number ?? '').trim() || '—';

  return {
    id: String(booking.id),
    bookingId: booking.id,
    serialNo: bookingConfirmationNo(booking),
    issueDate: previousInvoiceIssueDate(booking),
    guestName,
    payerName: guestName,
    windowNo: '1',
    bookingNo: bookingConfirmationNo(booking),
    roomNo,
    arrivalDate: bookingCheckInYmd(booking),
    departureDate: bookingCheckOutYmd(booking),
    amount: Number(booking.total_Price) || Number(booking.payment_Amount) || 0,
  };
}

export function bookingsToPreviousInvoiceRows(bookings: Booking[]): PreviousInvoiceRow[] {
  return bookings.filter(isPreviousInvoiceBooking).map(bookingToPreviousInvoiceRow);
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
