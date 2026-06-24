import { Booking } from '../models/booking.model';
import {
  bookingCheckInYmd,
  bookingCheckOutYmd,
  isBookingActive,
  isBookingReserved,
} from '../utils/booking-display.util';
import { toDateOnlyString } from '../utils/date-only';

export type DashboardTrendPeriod = 'weekly' | 'monthly' | 'annual';

export interface DashboardAreaSeriesPaths {
  line: string;
  area: string;
}

export interface DashboardReservationsTrendChart {
  labels: string[];
  yTicks: number[];
  yMax: number;
  residents: number[];
  departing: number[];
  arriving: number[];
  residentsPaths: DashboardAreaSeriesPaths;
  departingPaths: DashboardAreaSeriesPaths;
  arrivingPaths: DashboardAreaSeriesPaths;
}

export interface DashboardOccupiedTrendChart {
  labels: string[];
  yTicks: number[];
  yMax: number;
  values: number[];
  paths: DashboardAreaSeriesPaths;
}

const CHART_WIDTH = 920;
const CHART_HEIGHT = 240;
const CHART_PAD_X = 12;
const CHART_PAD_Y = 16;

function formatDayLabel(ymd: string): string {
  const p = ymd.split('-');
  if (p.length !== 3) {
    return ymd;
  }
  return `${p[2]}/${p[1]}`;
}

function formatMonthLabel(year: number, month: number): string {
  return `${String(month).padStart(2, '0')}/${String(year).slice(-2)}`;
}

function chartYTicks(maxValue: number): { yMax: number; yTicks: number[] } {
  const peak = Math.max(maxValue, 0);
  if (peak <= 0) {
    return { yMax: 5, yTicks: [0, 1, 2, 3, 4, 5] };
  }
  const step = Math.max(1, Math.ceil(peak / 5));
  const yMax = step * 5;
  const yTicks: number[] = [];
  for (let v = 0; v <= yMax; v += step) {
    yTicks.push(v);
  }
  return { yMax, yTicks };
}

function localDaysBack(count: number): string[] {
  const out: string[] = [];
  const base = new Date();
  base.setHours(12, 0, 0, 0);
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    out.push(toDateOnlyString(d));
  }
  return out;
}

function localMonthsBack(count: number): { key: string; year: number; month: number; days: string[] }[] {
  const out: { key: string; year: number; month: number; days: string[] }[] = [];
  const base = new Date();
  base.setDate(1);
  base.setHours(12, 0, 0, 0);
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const key = `${year}-${String(month).padStart(2, '0')}`;
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: string[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    }
    out.push({ key, year, month, days });
  }
  return out;
}

function bookingCoversDay(booking: Booking, day: string): boolean {
  const ci = bookingCheckInYmd(booking);
  const co = bookingCheckOutYmd(booking);
  if (!ci || !co) {
    return false;
  }
  return ci <= day && day < co;
}

function bookingStayingOnDay(booking: Booking, day: string): boolean {
  if (booking.status === 'cancelled' || booking.status === 'checked_out') {
    return false;
  }
  if (isBookingReserved(booking)) {
    return false;
  }
  return bookingCoversDay(booking, day);
}

function bookingArrivingOnDay(booking: Booking, day: string): boolean {
  if (!isBookingActive(booking)) {
    return false;
  }
  return bookingCheckInYmd(booking) === day;
}

function bookingDepartingOnDay(booking: Booking, day: string): boolean {
  if (!isBookingActive(booking)) {
    return false;
  }
  return bookingCheckOutYmd(booking) === day;
}

function occupiedRoomsOnDay(bookings: Booking[], day: string): number {
  const rooms = new Set<string>();
  for (const booking of bookings) {
    if (!bookingStayingOnDay(booking, day)) {
      continue;
    }
    const num = String(booking.room_Number ?? '').trim();
    if (num) {
      rooms.add(num);
    }
  }
  return rooms.size;
}

function countResidentsOnDay(bookings: Booking[], day: string): number {
  let count = 0;
  for (const booking of bookings) {
    if (bookingStayingOnDay(booking, day)) {
      count += 1;
    }
  }
  return count;
}

function countArrivingOnDay(bookings: Booking[], day: string): number {
  let count = 0;
  for (const booking of bookings) {
    if (bookingArrivingOnDay(booking, day)) {
      count += 1;
    }
  }
  return count;
}

function countDepartingOnDay(bookings: Booking[], day: string): number {
  let count = 0;
  for (const booking of bookings) {
    if (bookingDepartingOnDay(booking, day)) {
      count += 1;
    }
  }
  return count;
}

function peakInSeries(series: number[][]): number {
  return Math.max(0, ...series.flat());
}

function buildAreaPaths(values: number[], yMax: number): DashboardAreaSeriesPaths {
  const series = values.length ? values : [0];
  const innerW = CHART_WIDTH - CHART_PAD_X * 2;
  const innerH = CHART_HEIGHT - CHART_PAD_Y * 2;
  const span = yMax > 0 ? yMax : 1;
  const points = series.map((value, index) => {
    const ratio = series.length === 1 ? 0.5 : index / (series.length - 1);
    const x = CHART_PAD_X + (1 - ratio) * innerW;
    const y = CHART_PAD_Y + innerH - (Math.max(0, value) / span) * innerH;
    return { x, y };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(' ');
  const areaPoints = points.map((point) => `L ${point.x},${point.y}`).join(' ');
  const baseY = CHART_HEIGHT - CHART_PAD_Y;
  const area = `M ${points[0].x},${baseY} ${areaPoints} L ${points[points.length - 1].x},${baseY} Z`;
  return { line, area };
}

function buildDailyReservationsTrend(
  bookings: Booking[],
  dayCount: number,
): Omit<
  DashboardReservationsTrendChart,
  'residentsPaths' | 'departingPaths' | 'arrivingPaths' | 'yTicks' | 'yMax'
> {
  const days = localDaysBack(dayCount);
  const labels = days.map(formatDayLabel);
  const residents = days.map((day) => countResidentsOnDay(bookings, day));
  const departing = days.map((day) => countDepartingOnDay(bookings, day));
  const arriving = days.map((day) => countArrivingOnDay(bookings, day));
  return { labels, residents, departing, arriving };
}

function buildMonthlyReservationsTrend(
  bookings: Booking[],
): Omit<
  DashboardReservationsTrendChart,
  'residentsPaths' | 'departingPaths' | 'arrivingPaths' | 'yTicks' | 'yMax'
> {
  const months = localMonthsBack(12);
  const labels = months.map((bucket) => formatMonthLabel(bucket.year, bucket.month));
  const residents = months.map((bucket) => {
    const daily = bucket.days.map((day) => countResidentsOnDay(bookings, day));
    return daily.length ? Math.max(...daily) : 0;
  });
  const departing = months.map((bucket) =>
    bucket.days.reduce((sum, day) => sum + countDepartingOnDay(bookings, day), 0),
  );
  const arriving = months.map((bucket) =>
    bucket.days.reduce((sum, day) => sum + countArrivingOnDay(bookings, day), 0),
  );
  return { labels, residents, departing, arriving };
}

function buildDailyOccupiedTrend(
  bookings: Booking[],
  dayCount: number,
): Omit<DashboardOccupiedTrendChart, 'paths' | 'yTicks' | 'yMax'> {
  const days = localDaysBack(dayCount);
  return {
    labels: days.map(formatDayLabel),
    values: days.map((day) => occupiedRoomsOnDay(bookings, day)),
  };
}

function buildMonthlyOccupiedTrend(
  bookings: Booking[],
): Omit<DashboardOccupiedTrendChart, 'paths' | 'yTicks' | 'yMax'> {
  const months = localMonthsBack(12);
  return {
    labels: months.map((bucket) => formatMonthLabel(bucket.year, bucket.month)),
    values: months.map((bucket) => {
      const daily = bucket.days.map((day) => occupiedRoomsOnDay(bookings, day));
      return daily.length ? Math.max(...daily) : 0;
    }),
  };
}

function finalizeReservationsTrend(
  partial: Omit<
    DashboardReservationsTrendChart,
    'residentsPaths' | 'departingPaths' | 'arrivingPaths' | 'yTicks' | 'yMax'
  >,
): DashboardReservationsTrendChart {
  const { yMax, yTicks } = chartYTicks(peakInSeries([partial.residents, partial.departing, partial.arriving]));
  return {
    ...partial,
    yMax,
    yTicks,
    residentsPaths: buildAreaPaths(partial.residents, yMax),
    departingPaths: buildAreaPaths(partial.departing, yMax),
    arrivingPaths: buildAreaPaths(partial.arriving, yMax),
  };
}

function finalizeOccupiedTrend(
  partial: Omit<DashboardOccupiedTrendChart, 'paths' | 'yTicks' | 'yMax'>,
): DashboardOccupiedTrendChart {
  const { yMax, yTicks } = chartYTicks(Math.max(...partial.values, 0));
  return {
    ...partial,
    yMax,
    yTicks,
    paths: buildAreaPaths(partial.values, yMax),
  };
}

export function buildReservationsTrendChart(
  bookings: Booking[],
  period: DashboardTrendPeriod,
): DashboardReservationsTrendChart {
  switch (period) {
    case 'weekly':
      return finalizeReservationsTrend(buildDailyReservationsTrend(bookings, 7));
    case 'annual':
      return finalizeReservationsTrend(buildMonthlyReservationsTrend(bookings));
    default:
      return finalizeReservationsTrend(buildDailyReservationsTrend(bookings, 30));
  }
}

export function buildOccupiedRoomsTrendChart(
  bookings: Booking[],
  period: DashboardTrendPeriod,
): DashboardOccupiedTrendChart {
  switch (period) {
    case 'weekly':
      return finalizeOccupiedTrend(buildDailyOccupiedTrend(bookings, 7));
    case 'annual':
      return finalizeOccupiedTrend(buildMonthlyOccupiedTrend(bookings));
    default:
      return finalizeOccupiedTrend(buildDailyOccupiedTrend(bookings, 30));
  }
}

export function trendGridLineTopPct(tick: number, yMax: number): number {
  if (yMax <= 0) {
    return 100;
  }
  return 100 - (tick / yMax) * 100;
}

export interface DashboardWeeklyRoomStatusDay {
  label: string;
  occupied: number;
  vacant: number;
}

export interface DashboardWeeklyRoomStatusChart {
  days: DashboardWeeklyRoomStatusDay[];
  yMax: number;
  yTicks: number[];
}

export function buildWeeklyRoomStatusChart(
  bookings: Booking[],
  totalRooms: number,
): DashboardWeeklyRoomStatusChart {
  const days = localDaysBack(7);
  const rows = days.map((day) => {
    const occupied = occupiedRoomsOnDay(bookings, day);
    const vacant = Math.max(0, totalRooms - occupied);
    return {
      label: formatDayLabel(day),
      occupied,
      vacant,
    };
  });
  const peak = Math.max(totalRooms, ...rows.map((row) => row.occupied + row.vacant), 0);
  const { yMax, yTicks } = chartYTicks(peak);
  return { days: rows, yMax, yTicks };
}

export function weeklyBarHeightPct(value: number, yMax: number): number {
  if (yMax <= 0 || value <= 0) {
    return 0;
  }
  return (value / yMax) * 100;
}
