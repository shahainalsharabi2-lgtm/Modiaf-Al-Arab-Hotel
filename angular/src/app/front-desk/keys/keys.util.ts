import { KEY_SERVICE_ROWS } from '../key-services/key-services.static-data';
import type { KeyRow } from './keys.types';

export function isKeyHardwareOnline(): boolean {
  return KEY_SERVICE_ROWS.some((service) => service.status === 'online');
}

export function nextKeyReceiptNo(existing: KeyRow[]): string {
  const seq = existing.length + 1;
  return `KEY-${String(seq).padStart(4, '0')}`;
}

export function expiryYmdFromHours(hours: number, from = new Date()): string {
  const end = new Date(from.getTime());
  end.setHours(end.getHours() + Math.max(1, hours));
  return end.toISOString().slice(0, 10);
}

export {
  bookingsToDepositReservations as bookingsToKeyReservations,
  filterDepositReservations as filterKeyReservations,
  type DepositReservationOption as KeyReservationOption,
} from '../guest-valuables/guest-valuables.deposit.util';
