import { GuestRegistry } from '../../models/guest-registry.model';
import type { CrmIndividualRow } from './crm-individuals.types';

export function guestRegistryDisplayName(g: GuestRegistry): string {
  const parts = [g.first_Name, g.middle_Name, g.last_Name].map((p) => String(p ?? '').trim()).filter(Boolean);
  return parts.join(' ') || '—';
}

export function formatIndividualDate(iso: string): string {
  if (!iso) {
    return '';
  }
  const head = iso.split('T')[0];
  const [y, m, d] = head.split('-');
  if (!y || !m || !d) {
    return iso;
  }
  return `${y}/${m}/${d}`;
}

export function guestRegistryToIndividualRow(g: GuestRegistry): CrmIndividualRow {
  return {
    id: g.id != null ? String(g.id) : guestRegistryDisplayName(g),
    registryId: g.id,
    guestName: guestRegistryDisplayName(g),
    country: String(g.country ?? '').trim(),
    nationality: String(g.nationality ?? '').trim(),
    birthPlace: String(g.id_Issuing_Country ?? '').trim(),
    birthDate: formatIndividualDate(String(g.birth_Date ?? '').trim()),
    mobile: String(g.phone_Number ?? '').trim(),
    email: '',
    idNumber: String(g.id_Number ?? '').trim(),
    source: g,
  };
}

export function guestRegistriesToIndividualRows(guests: GuestRegistry[]): CrmIndividualRow[] {
  return guests.map(guestRegistryToIndividualRow);
}
