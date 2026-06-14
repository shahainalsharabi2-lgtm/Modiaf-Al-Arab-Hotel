export interface BookingsChartRow {
  id: string;
  labelKey: string;
  tone: BookingsChartRowTone;
  values: readonly number[];
  format?: 'number' | 'percent' | 'money';
}

export type BookingsChartRowTone =
  | 'neutral'
  | 'purple'
  | 'green'
  | 'blue'
  | 'pink'
  | 'sage'
  | 'yellow'
  | 'peach';

export interface BookingsChartDay {
  iso: string;
  weekdayKey: string;
}

const DAY_KEYS = ['dayFri', 'daySat', 'daySun', 'dayMon', 'dayTue', 'dayWed', 'dayThu'] as const;

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function buildDays(fromIso: string, count: number): BookingsChartDay[] {
  const days: BookingsChartDay[] = [];
  for (let i = 0; i < count; i++) {
    const iso = addDays(fromIso, i);
    const weekday = new Date(`${iso}T12:00:00`).getDay();
    const map: Record<number, (typeof DAY_KEYS)[number]> = {
      5: 'dayFri',
      6: 'daySat',
      0: 'daySun',
      1: 'dayMon',
      2: 'dayTue',
      3: 'dayWed',
      4: 'dayThu',
    };
    days.push({ iso, weekdayKey: map[weekday] ?? 'dayFri' });
  }
  return days;
}

function series(base: number, deltas: number[]): number[] {
  return deltas.map((d) => Math.max(0, base + d));
}

export function buildBookingsChart(fromIso: string, toIso: string): {
  days: BookingsChartDay[];
  rows: BookingsChartRow[];
} {
  const start = new Date(`${fromIso}T12:00:00`);
  const end = new Date(`${toIso}T12:00:00`);
  const count = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
  const days = buildDays(fromIso, count);
  const n = days.length;
  const deltas = Array.from({ length: n }, (_, i) => (i % 3) - 1);

  const totalRooms = Array(n).fill(200);
  const outOfOrder = series(4, deltas);
  const roomsForRent = totalRooms.map((t, i) => t - outOfOrder[i]);
  const occupied = series(118, deltas.map((d) => d * 2));
  const groupAllotment = series(42, deltas.map((d) => d + 1));
  const available = roomsForRent.map((r, i) => Math.max(0, r - occupied[i] - groupAllotment[i]));
  const expectedOccupied = occupied.map((v, i) => v + Math.max(0, 6 - (i % 4)));
  const occupancyPct = roomsForRent.map((r, i) => (r > 0 ? Math.round((occupied[i] / r) * 1000) / 10 : 0));
  const avgRoomRate = Array.from({ length: n }, (_, i) => 420 + (i % 5) * 15);

  const rows: BookingsChartRow[] = [
    { id: 'totalRooms', labelKey: 'rowTotalRooms', tone: 'neutral', values: totalRooms },
    { id: 'outOfOrder', labelKey: 'rowOutOfOrder', tone: 'purple', values: outOfOrder },
    { id: 'roomsForRent', labelKey: 'rowRoomsForRent', tone: 'green', values: roomsForRent },
    { id: 'occupied', labelKey: 'rowOccupied', tone: 'blue', values: occupied },
    { id: 'groupAllotment', labelKey: 'rowGroupAllotment', tone: 'pink', values: groupAllotment },
    { id: 'available', labelKey: 'rowAvailable', tone: 'sage', values: available },
    { id: 'expectedOccupied', labelKey: 'rowExpectedOccupied', tone: 'yellow', values: expectedOccupied },
    { id: 'occupancyPct', labelKey: 'rowOccupancyPct', tone: 'peach', values: occupancyPct, format: 'percent' },
    { id: 'avgRoomRate', labelKey: 'rowAvgRoomRate', tone: 'neutral', values: avgRoomRate, format: 'money' },
  ];

  return { days, rows };
}

export const BOOKINGS_CHART_DEFAULT_FROM = '2025-11-14';
export const BOOKINGS_CHART_DEFAULT_TO = '2025-11-29';
