import { KEY_SERVICE_ROWS } from './key-services.static-data';
import type { KeyServiceRow } from './key-services.types';

export function nextKeyServiceId(): string {
  return `svc-${Date.now()}`;
}

export function isDuplicateServiceNo(serviceNo: string, excludeId?: string | null): boolean {
  const q = serviceNo.trim().toLowerCase();
  return KEY_SERVICE_ROWS.some((row) => row.id !== excludeId && row.serviceNo.trim().toLowerCase() === q);
}

export function findKeyServiceRow(id: string): KeyServiceRow | undefined {
  return KEY_SERVICE_ROWS.find((row) => row.id === id);
}

export function removeKeyServiceRow(id: string): void {
  const index = KEY_SERVICE_ROWS.findIndex((row) => row.id === id);
  if (index >= 0) {
    KEY_SERVICE_ROWS.splice(index, 1);
  }
}
