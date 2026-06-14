import { Booking } from '../../models/booking.model';
import type { CrmCompanyRow } from './crm-companies.types';

const COMPANY_NAME_RE = /شركة|company|مجموعة|group/i;
const LATIN_RE = /^[A-Za-z0-9\s._-]+$/;

function bookingDisplayName(b: Booking): string {
  const parts = [b.first_Name, b.last_Name].map((p) => String(p ?? '').trim()).filter(Boolean);
  if (parts.length === 0) {
    return '';
  }
  if (parts.length === 1) {
    return parts[0];
  }
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (LATIN_RE.test(last) && !LATIN_RE.test(first)) {
    return first;
  }
  return parts.join(' ');
}

function bookingForeignName(b: Booking): string {
  const first = String(b.first_Name ?? '').trim();
  const last = String(b.last_Name ?? '').trim();
  if (last && LATIN_RE.test(last) && !LATIN_RE.test(first)) {
    return last;
  }
  if (first && LATIN_RE.test(first) && last && !LATIN_RE.test(last)) {
    return first;
  }
  if (first && LATIN_RE.test(first) && LATIN_RE.test(last)) {
    return [first, last].filter(Boolean).join(' ');
  }
  if (LATIN_RE.test(`${first} ${last}`.trim())) {
    return `${first} ${last}`.trim();
  }
  return '';
}

export function isCompanyBooking(booking: Booking): boolean {
  const source = String(booking.booking_Source ?? '').trim().toLowerCase();
  if (source === 'company' || source === 'institution') {
    return true;
  }
  const label = `${booking.first_Name ?? ''} ${booking.last_Name ?? ''}`.trim();
  return COMPANY_NAME_RE.test(label);
}

function companyKey(name: string, foreignName: string): string {
  return `${name.toLowerCase()}|${foreignName.toLowerCase()}`;
}

export function bookingsToCompanyRows(bookings: Booking[]): CrmCompanyRow[] {
  const map = new Map<string, CrmCompanyRow>();

  for (const booking of bookings) {
    if (!isCompanyBooking(booking)) {
      continue;
    }
    const name = bookingDisplayName(booking);
    if (!name || name === '—') {
      continue;
    }
    const foreignName = bookingForeignName(booking);
    const key = companyKey(name, foreignName);
    const mobile = String(booking.phone_Number ?? '').trim();
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        id: key,
        name,
        foreignName,
        country: '',
        mobile,
        email: '',
      });
      continue;
    }
    if (!existing.mobile && mobile) {
      existing.mobile = mobile;
    }
    if (!existing.foreignName && foreignName) {
      existing.foreignName = foreignName;
    }
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
}
