import { Booking } from '../models/booking.model';
import { Room } from '../models/room.model';
import { stayingBookingRoomNumbers } from '../utils/booking-display.util';

export type DashboardRoomCapacityId = 'double' | 'triple' | 'quadruple' | 'quintuple';

export interface DashboardRoomTypeOccupancyRow {
  labelKey: string;
  occupied: number;
  vacant: number;
}

const CHART_TYPE_ORDER: { id: DashboardRoomCapacityId; labelKey: string }[] = [
  { id: 'double', labelKey: 'type_double' },
  { id: 'triple', labelKey: 'type_triple' },
  { id: 'quadruple', labelKey: 'type_quadruple' },
  { id: 'quintuple', labelKey: 'type_quintuple' },
];

function classifyRoomCapacityType(type: string): DashboardRoomCapacityId | null {
  const t = String(type ?? '').trim();
  if (/ثنائ|double/i.test(t)) {
    return 'double';
  }
  if (/ثلاث|triple/i.test(t)) {
    return 'triple';
  }
  if (/رباع|quad/i.test(t)) {
    return 'quadruple';
  }
  if (/خماس|quint/i.test(t)) {
    return 'quintuple';
  }
  return null;
}

export function buildRoomTypeOccupancyRows(
  rooms: Room[],
  bookings: Booking[],
): DashboardRoomTypeOccupancyRow[] {
  const staying = stayingBookingRoomNumbers(bookings);
  const counts = new Map<DashboardRoomCapacityId, { occupied: number; vacant: number }>();
  for (const entry of CHART_TYPE_ORDER) {
    counts.set(entry.id, { occupied: 0, vacant: 0 });
  }

  for (const room of rooms) {
    const typeId = classifyRoomCapacityType(room.type);
    if (!typeId) {
      continue;
    }
    const num = String(room.roomNumber ?? '').trim();
    const isOccupied = room.status === 'occupied' || staying.has(num);
    const bucket = counts.get(typeId)!;
    if (isOccupied) {
      bucket.occupied += 1;
    } else if (room.status !== 'maintenance' && room.status !== 'suspended') {
      bucket.vacant += 1;
    }
  }

  return CHART_TYPE_ORDER.map((entry) => {
    const bucket = counts.get(entry.id)!;
    return {
      labelKey: entry.labelKey,
      occupied: bucket.occupied,
      vacant: bucket.vacant,
    };
  });
}

export function roomTypeChartMax(rows: DashboardRoomTypeOccupancyRow[]): number {
  const peak = Math.max(...rows.map((row) => row.occupied + row.vacant), 0);
  if (peak <= 0) {
    return 200;
  }
  return Math.max(40, Math.ceil(peak / 40) * 40);
}

export function roomTypeChartAxisTicks(max: number): number[] {
  const step = max <= 80 ? 20 : 40;
  const ticks: number[] = [];
  for (let v = 0; v <= max; v += step) {
    ticks.push(v);
  }
  if (ticks[ticks.length - 1] !== max) {
    ticks.push(max);
  }
  return ticks;
}

export function roomTypeBarSegmentPct(value: number, max: number): number {
  if (max <= 0 || value <= 0) {
    return 0;
  }
  return (value / max) * 100;
}
