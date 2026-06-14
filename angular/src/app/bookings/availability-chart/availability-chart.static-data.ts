export interface AvailabilityChartDay {
  iso: string;
  weekdayKey: string;
}

export interface AvailabilityChartHotel {
  id: string;
  labelKey: string;
  baseAvailable: number;
  baseReserved: number;
}

const DAY_KEYS = ['dayFri', 'daySat', 'daySun', 'dayMon', 'dayTue', 'dayWed', 'dayThu'] as const;

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function weekdayKey(iso: string): string {
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
  return map[weekday] ?? 'dayFri';
}

export function buildAvailabilityDays(fromIso: string, toIso: string): AvailabilityChartDay[] {
  const start = new Date(`${fromIso}T12:00:00`);
  const end = new Date(`${toIso}T12:00:00`);
  const count = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
  const days: AvailabilityChartDay[] = [];
  for (let i = 0; i < count; i++) {
    const iso = addDays(fromIso, i);
    days.push({ iso, weekdayKey: weekdayKey(iso) });
  }
  return days;
}

export const AVAILABILITY_CHART_HOTELS: readonly AvailabilityChartHotel[] = [
  { id: 'suburbs', labelKey: 'hotelSuburbs', baseAvailable: 389, baseReserved: 0 },
  { id: 'h9', labelKey: 'hotelSolutions9', baseAvailable: 140, baseReserved: 0 },
  { id: 'h8', labelKey: 'hotelSolutions8', baseAvailable: 180, baseReserved: 0 },
  { id: 'h7', labelKey: 'hotelSolutions7', baseAvailable: 160, baseReserved: 0 },
  { id: 'h6', labelKey: 'hotelSolutions6', baseAvailable: 150, baseReserved: 0 },
  { id: 'h5', labelKey: 'hotelSolutions5', baseAvailable: 120, baseReserved: 0 },
];

export const AVAILABILITY_CHART_DEFAULT_FROM = '2025-11-14';
export const AVAILABILITY_CHART_DEFAULT_TO = '2025-11-29';
export const AVAILABILITY_CHART_SELECTED_HOTELS = 10;

export function cellValues(
  hotel: AvailabilityChartHotel,
  _dayIndex: number,
): { reserved: number; available: number } {
  return { reserved: hotel.baseReserved, available: hotel.baseAvailable };
}
