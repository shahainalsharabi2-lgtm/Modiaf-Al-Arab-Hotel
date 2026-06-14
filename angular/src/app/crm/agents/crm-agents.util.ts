import { Booking } from '../../models/booking.model';
import { GuestRegistry } from '../../models/guest-registry.model';
import { isCompanyBooking } from '../companies/crm-companies.util';
import type { CrmAgentRow } from './crm-agents.types';

const LATIN_RE = /^[A-Za-z0-9\s._-]+$/;
const AGENT_RELATIONSHIP_RE = /وكيل|agent|ممثل|representative/i;
const AGENT_PRICE_CODE_RE = /وكيل|agent/i;

function agentKey(name: string, foreignName: string, mobile: string): string {
  return `${name.toLowerCase()}|${foreignName.toLowerCase()}|${mobile.toLowerCase()}`;
}

function latinForeignName(first: string, last: string): string {
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

function guestDisplayName(g: GuestRegistry): string {
  const parts = [g.first_Name, g.middle_Name, g.last_Name].map((p) => String(p ?? '').trim()).filter(Boolean);
  return parts.join(' ');
}

function isAgentGuest(g: GuestRegistry): boolean {
  const rel = String(g.relationship_Type ?? '').trim();
  const price = String(g.price_Code ?? '').trim();
  return AGENT_RELATIONSHIP_RE.test(rel) || AGENT_PRICE_CODE_RE.test(price);
}

function isAgentBooking(booking: Booking): boolean {
  const source = String(booking.booking_Source ?? '').trim().toLowerCase();
  if (source !== 'electronic') {
    return false;
  }
  return !isCompanyBooking(booking);
}

function upsertRow(map: Map<string, CrmAgentRow>, row: CrmAgentRow): void {
  const existing = map.get(row.id);
  if (!existing) {
    map.set(row.id, row);
    return;
  }
  if (!existing.mobile && row.mobile) {
    existing.mobile = row.mobile;
  }
  if (!existing.foreignName && row.foreignName) {
    existing.foreignName = row.foreignName;
  }
  if (!existing.email && row.email) {
    existing.email = row.email;
  }
}

export function buildAgentRows(guests: GuestRegistry[], bookings: Booking[]): CrmAgentRow[] {
  const map = new Map<string, CrmAgentRow>();

  for (const guest of guests) {
    if (!isAgentGuest(guest)) {
      continue;
    }
    const first = String(guest.first_Name ?? '').trim();
    const last = String(guest.last_Name ?? '').trim();
    const name = guestDisplayName(guest);
    if (!name) {
      continue;
    }
    const foreignName = latinForeignName(first, last);
    const mobile = String(guest.phone_Number ?? '').trim();
    upsertRow(map, {
      id: agentKey(name, foreignName, mobile),
      name,
      foreignName,
      mobile,
      email: '',
    });
  }

  for (const booking of bookings) {
    if (!isAgentBooking(booking)) {
      continue;
    }
    const first = String(booking.first_Name ?? '').trim();
    const last = String(booking.last_Name ?? '').trim();
    const name = bookingDisplayName(booking);
    if (!name || name === '—') {
      continue;
    }
    const foreignName = latinForeignName(first, last);
    const mobile = String(booking.phone_Number ?? '').trim();
    upsertRow(map, {
      id: agentKey(name, foreignName, mobile),
      name,
      foreignName,
      mobile,
      email: '',
    });
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
}
