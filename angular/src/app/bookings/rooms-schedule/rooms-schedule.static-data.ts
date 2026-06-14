export type RoomsScheduleViewMode = 'day' | 'week' | '14days' | 'month';
export type RoomsScheduleViewBy = 'roomType' | 'floor';
export type RoomsScheduleBookingStatus =
  | 'requested'
  | 'reserved'
  | 'inHouse'
  | 'cancelled'
  | 'checkedOut'
  | 'checkedIn'
  | 'pending'
  | 'awaitingDeparture'
  | 'arriving'
  | 'expectedDeparture'
  | 'unconfirmed';

export interface RoomsScheduleDay {
  iso: string;
  weekdayKey: string;
  dayNum: number;
  isToday: boolean;
  availability: number;
}

export interface RoomsScheduleBookingBar {
  roomId: string;
  startDayIndex: number;
  span: number;
  status: RoomsScheduleBookingStatus;
  guestName: string;
}

export interface RoomsScheduleRoom {
  id: string;
  number: string;
  statusKey: 'clean' | 'dirty';
  groupId: string;
}

export interface RoomsScheduleRoomGroup {
  id: string;
  labelKey: string;
  rooms: RoomsScheduleRoom[];
}

export interface RoomsScheduleLegendItem {
  status: RoomsScheduleBookingStatus;
  labelKey: string;
  color: string;
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

export function buildScheduleDays(anchorIso: string, count: number, todayIso: string): RoomsScheduleDay[] {
  const days: RoomsScheduleDay[] = [];
  for (let i = 0; i < count; i++) {
    const iso = addDays(anchorIso, i);
    const dayNum = Number(iso.slice(8, 10));
    days.push({
      iso,
      weekdayKey: weekdayKey(iso),
      dayNum,
      isToday: iso === todayIso,
      availability: 56 - (i % 3) * 2,
    });
  }
  return days;
}

export const ROOMS_SCHEDULE_GROUPS: readonly RoomsScheduleRoomGroup[] = [
  {
    id: 'main-triple',
    labelKey: 'groupMainTriple',
    rooms: [
      { id: 'r123', number: '123', statusKey: 'clean', groupId: 'main-triple' },
      { id: 'r124', number: '124', statusKey: 'clean', groupId: 'main-triple' },
      { id: 'r127', number: '127', statusKey: 'clean', groupId: 'main-triple' },
      { id: 'r128', number: '128', statusKey: 'clean', groupId: 'main-triple' },
    ],
  },
];

export const ROOMS_SCHEDULE_LEGEND: readonly RoomsScheduleLegendItem[] = [
  { status: 'requested', labelKey: 'statusRequested', color: '#42a5f5' },
  { status: 'reserved', labelKey: 'statusReserved', color: '#81c784' },
  { status: 'inHouse', labelKey: 'statusInHouse', color: '#e53935' },
  { status: 'cancelled', labelKey: 'statusCancelled', color: '#9e9e9e' },
  { status: 'checkedOut', labelKey: 'statusCheckedOut', color: '#2e7d32' },
  { status: 'checkedIn', labelKey: 'statusCheckedIn', color: '#00897b' },
  { status: 'pending', labelKey: 'statusPending', color: '#fb8c00' },
  { status: 'awaitingDeparture', labelKey: 'statusAwaitingDeparture', color: '#4fc3f7' },
  { status: 'arriving', labelKey: 'statusArriving', color: '#ab47bc' },
  { status: 'expectedDeparture', labelKey: 'statusExpectedDeparture', color: '#fdd835' },
  { status: 'unconfirmed', labelKey: 'statusUnconfirmed', color: '#ffb300' },
];

export const ROOMS_SCHEDULE_SAMPLE_BARS: readonly RoomsScheduleBookingBar[] = [
  { roomId: 'r123', startDayIndex: 0, span: 3, status: 'checkedIn', guestName: 'أحمد محمد' },
  { roomId: 'r124', startDayIndex: 2, span: 4, status: 'reserved', guestName: 'سارة علي' },
  { roomId: 'r127', startDayIndex: 1, span: 2, status: 'arriving', guestName: 'خالد يوسف' },
  { roomId: 'r128', startDayIndex: 5, span: 3, status: 'inHouse', guestName: 'فاطمة حسن' },
];

export const ROOMS_SCHEDULE_DEFAULT_ANCHOR = '2025-11-14';

export function viewModeDayCount(mode: RoomsScheduleViewMode): number {
  switch (mode) {
    case 'day':
      return 1;
    case 'week':
      return 7;
    case '14days':
      return 14;
    case 'month':
      return 30;
    default:
      return 14;
  }
}
