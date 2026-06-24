import { Room } from '../models/room.model';

function pickStr(raw: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = raw[key];
    if (value != null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function pickNum(raw: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = raw[key];
    if (value != null && value !== '' && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return undefined;
}

function normalizeRoomStatus(value: string): Room['status'] {
  const v = value.trim().toLowerCase();
  if (v === 'occupied' || v === 'occ') {
    return 'occupied';
  }
  if (
    v === 'suspended' ||
    v === 'stopped' ||
    v === 'blocked' ||
    v === 'halt' ||
    v === 'out_of_order' ||
    v === 'out_of_service'
  ) {
    return 'suspended';
  }
  if (v === 'maintenance' || v === 'maint') {
    return 'maintenance';
  }
  if (v === 'cleaning') {
    return 'cleaning';
  }
  if (v === 'dirty') {
    return 'dirty';
  }
  return 'available';
}

/** توحيد حقول الغرفة القادمة من الـ API (camelCase أو PascalCase) */
export function mapRoomFromApi(raw: Room | Record<string, unknown>): Room {
  const r = raw as Record<string, unknown>;
  const statusRaw = pickStr(r, 'status', 'Status') || 'available';
  const id = pickNum(r, 'id', 'Id') ?? 0;
  const roomNumber = pickStr(r, 'roomNumber', 'RoomNumber') || (id > 0 ? String(id) : '');

  return {
    id,
    roomNumber,
    type: pickStr(r, 'type', 'Type') || 'غرفة عادية',
    roomView: pickStr(r, 'roomView', 'RoomView') || null,
    roomArchitecture: pickStr(r, 'roomArchitecture', 'RoomArchitecture') || null,
    roomLocation: pickStr(r, 'roomLocation', 'RoomLocation') || null,
    roomFeatures: pickStr(r, 'roomFeatures', 'RoomFeatures') || null,
    status: normalizeRoomStatus(statusRaw),
    maintenanceReason: pickStr(r, 'maintenanceReason', 'MaintenanceReason') || null,
    price: pickNum(r, 'price', 'Price') ?? 0,
    floor: pickNum(r, 'floor', 'Floor') ?? 1,
    currencyCode: pickStr(r, 'currencyCode', 'CurrencyCode') || undefined,
    currencySymbol: pickStr(r, 'currencySymbol', 'CurrencySymbol') || undefined,
  };
}
