import { Booking } from '../../models/booking.model';
import {
  bookingGuestDisplayName,
  hasRentPostingRoom,
  isRentPostingEligible,
} from '../../cashier/rent-posting/rent-posting.util';
import type { GuestValuableDepositRow } from './guest-valuables.types';

export interface DepositReservationOption {
  id: string;
  bookingId: number;
  label: string;
  guestName: string;
  roomNo: string;
}

export function bookingsToDepositReservations(bookings: Booking[]): DepositReservationOption[] {
  return bookings
    .filter(isRentPostingEligible)
    .map((booking) => {
      const guestName = bookingGuestDisplayName(booking);
      const roomNo = String(booking.room_Number ?? '').trim();
      const parts = [guestName, roomNo && hasRentPostingRoom(booking) ? roomNo : ''].filter(Boolean);
      return {
        id: String(booking.id),
        bookingId: booking.id!,
        label: parts.join(' — '),
        guestName: guestName === '—' ? '' : guestName,
        roomNo,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'ar'));
}

export function filterDepositReservations(
  options: DepositReservationOption[],
  query: string,
): DepositReservationOption[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return options.slice(0, 12);
  }
  return options
    .filter((row) => [row.label, row.guestName, row.roomNo, row.id].some((v) => v.toLowerCase().includes(q)))
    .slice(0, 12);
}

export function occupiedSafeBoxNumbers(deposits: GuestValuableDepositRow[]): Set<string> {
  return new Set(
    deposits.filter((row) => row.status === 'in_custody').map((row) => String(row.safeBoxNo).trim()).filter(Boolean),
  );
}

export function nextDepositReceiptNo(existing: GuestValuableDepositRow[], date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const prefix = `VC-1-${y}${m}${d}-`;
  const seq = existing.filter((row) => row.receiptNo.startsWith(prefix)).length + 1;
  return `${prefix}${String(seq).padStart(4, '0')}`;
}
