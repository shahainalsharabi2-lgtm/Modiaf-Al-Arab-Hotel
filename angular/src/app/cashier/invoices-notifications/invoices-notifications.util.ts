import { Booking } from '../../models/booking.model';
import { toDateOnlyString } from '../../utils/date-only';
import { bookingGuestDisplayName } from '../rent-posting/rent-posting.util';
import { isWithinDateRange } from '../previous-invoices/previous-invoices.util';
import type { InvoiceNotificationRow } from './invoices-notifications.types';

export { isWithinDateRange };

const PLACEHOLDER_INVOICE = new Set(['', '0', '—']);

export function isInvoiceNotificationBooking(booking: Booking): boolean {
  if (booking.id == null || booking.status === 'cancelled') {
    return false;
  }
  const total = Number(booking.total_Price) || 0;
  const paid = Number(booking.payment_Amount) || 0;
  return total > 0 || paid > 0;
}

export function invoiceNotificationDate(booking: Booking): string {
  return (
    toDateOnlyString(booking.booking_Date) ||
    toDateOnlyString(booking.lastModificationTime) ||
    ''
  );
}

export function invoiceNotificationNo(booking: Booking): string {
  const invoice = String(booking.invoice_Number ?? '').trim();
  if (invoice && !PLACEHOLDER_INVOICE.has(invoice)) {
    return invoice;
  }
  if (booking.id != null) {
    return String(booking.id).padStart(12, '0');
  }
  return '';
}

function isCashPayment(booking: Booking): boolean {
  const method = String(booking.payment_Method ?? '').trim().toLowerCase();
  return method.includes('نقد') || method.includes('cash');
}

function resolveDisplayName(booking: Booking, labels: Record<string, string>): string {
  const guest = bookingGuestDisplayName(booking);
  if (guest !== '—') {
    return guest;
  }
  if (isCashPayment(booking)) {
    return labels['nameCashCustomer'] ?? 'Cash customer';
  }
  return guest;
}

function resolveInternalType(booking: Booking, labels: Record<string, string>): string {
  const room = String(booking.room_Number ?? '').trim();
  if (room && room !== '—' && room.toUpperCase() !== 'PM') {
    return labels['internalTypeRoom'] ?? '';
  }
  return labels['internalTypeServices'] ?? '';
}

function resolveInvoiceType(amount: number, labels: Record<string, string>): string {
  if (amount >= 1000) {
    return labels['invoiceTypeTax'] ?? '';
  }
  return labels['invoiceTypeSimplified'] ?? '';
}

function resolveStatus(booking: Booking, labels: Record<string, string>): { label: string; pending: boolean } {
  if (booking.status === 'checked_out') {
    return { label: labels['statusSubmitted'] ?? '', pending: false };
  }
  if (booking.status === 'departing') {
    return { label: labels['statusPending'] ?? '', pending: true };
  }
  return { label: '', pending: true };
}

export function bookingToInvoiceNotificationRow(
  booking: Booking,
  labels: Record<string, string>,
): InvoiceNotificationRow {
  const amount = Number(booking.payment_Amount) || Number(booking.total_Price) || 0;
  const status = resolveStatus(booking, labels);
  const invoiceDate = invoiceNotificationDate(booking);

  return {
    id: String(booking.id),
    bookingId: booking.id,
    invoiceNo: invoiceNotificationNo(booking),
    invoiceDate,
    currency: String(booking.currencyCode ?? 'YER').trim() || 'YER',
    amount,
    typeLabel: labels['typeInvoice'] ?? '',
    internalTypeLabel: resolveInternalType(booking, labels),
    invoiceTypeLabel: resolveInvoiceType(amount, labels),
    name: resolveDisplayName(booking, labels),
    statusLabel: status.label,
    statusPending: status.pending,
    uuid: `INV-${booking.id}-${invoiceDate.replace(/-/g, '')}`,
  };
}

export function bookingsToInvoiceNotificationRows(
  bookings: Booking[],
  labels: Record<string, string>,
): InvoiceNotificationRow[] {
  return bookings
    .filter(isInvoiceNotificationBooking)
    .map((booking) => bookingToInvoiceNotificationRow(booking, labels));
}
