import { Booking } from '../models/booking.model';
import {
  bookingCheckInYmd,
  bookingCheckOutYmd,
  effectiveStayDays,
  formatSlashDate,
  formatTime12h,
  guestFullName,
  isBookingCurrentlyStaying,
  isBookingReserved,
  parseBookingCheckInLocal,
} from '../utils/booking-display.util';
import type {
  DashboardEventAdvancedFilter,
  DashboardEventFilter,
  DashboardEventItem,
  DashboardEventKind,
  DashboardLatestReservationRow,
  DashboardReservationStatus,
} from './dashboard-feed.types';

const LATEST_RESERVATIONS_LIMIT = 12;
const EVENTS_LIMIT = 20;

function reservationNumber(booking: Booking): number {
  if (booking.id != null && booking.id > 0) {
    return booking.id;
  }
  const inv = Number(String(booking.invoice_Number ?? '').replace(/\D/g, ''));
  return Number.isFinite(inv) && inv > 0 ? inv : 0;
}

function bookingSortTimestamp(booking: Booking): number {
  if (booking.lastModificationTime) {
    const mod = new Date(booking.lastModificationTime);
    if (!Number.isNaN(mod.getTime())) {
      return mod.getTime();
    }
  }
  if (booking.bookingDateTime) {
    const dt = new Date(booking.bookingDateTime);
    if (!Number.isNaN(dt.getTime())) {
      return dt.getTime();
    }
  }
  const checkIn = parseBookingCheckInLocal(booking);
  return checkIn?.getTime() ?? 0;
}

export function resolveDashboardReservationStatus(booking: Booking): DashboardReservationStatus {
  if (booking.status === 'cancelled') {
    return 'cancelled';
  }
  if (isBookingReserved(booking)) {
    return 'reserved';
  }
  if (isBookingCurrentlyStaying(booking) || booking.status === 'active' || booking.status === 'departing') {
    return 'staying';
  }
  return 'reserved';
}

function resolveEventKind(booking: Booking): DashboardEventKind {
  if (booking.status === 'cancelled') {
    return 'cancelled';
  }
  if (isBookingCurrentlyStaying(booking) || booking.status === 'active' || booking.status === 'departing') {
    return 'check_in';
  }
  return 'new';
}

function eventImportant(kind: DashboardEventKind): boolean {
  return kind === 'cancelled' || kind === 'check_in';
}

function eventTimestamp(booking: Booking, kind: DashboardEventKind): Date {
  if (kind === 'cancelled' && booking.lastModificationTime) {
    const mod = new Date(booking.lastModificationTime);
    if (!Number.isNaN(mod.getTime())) {
      return mod;
    }
  }
  if (booking.lastModificationTime) {
    const mod = new Date(booking.lastModificationTime);
    if (!Number.isNaN(mod.getTime())) {
      return mod;
    }
  }
  if (booking.bookingDateTime) {
    const dt = new Date(booking.bookingDateTime);
    if (!Number.isNaN(dt.getTime())) {
      return dt;
    }
  }
  return parseBookingCheckInLocal(booking) ?? new Date();
}

export function buildLatestReservations(bookings: Booking[]): DashboardLatestReservationRow[] {
  return [...bookings]
    .sort((a, b) => {
      const idDiff = reservationNumber(b) - reservationNumber(a);
      if (idDiff !== 0) {
        return idDiff;
      }
      return bookingSortTimestamp(b) - bookingSortTimestamp(a);
    })
    .slice(0, LATEST_RESERVATIONS_LIMIT)
    .map((booking) => ({
      booking,
      reservationNumber: reservationNumber(booking),
      guestName: guestFullName(booking) || '—',
      arrivalYmd: bookingCheckInYmd(booking),
      departureYmd: bookingCheckOutYmd(booking),
      nights: effectiveStayDays(booking),
      status: resolveDashboardReservationStatus(booking),
    }));
}

export function buildDashboardEvents(bookings: Booking[]): DashboardEventItem[] {
  return [...bookings]
    .map((booking) => {
      const kind = resolveEventKind(booking);
      const num = reservationNumber(booking);
      return {
        id: `${kind}-${booking.id ?? num}-${booking.lastModificationTime ?? booking.bookingDateTime ?? ''}`,
        kind,
        bookingId: booking.id,
        reservationNumber: num,
        timestamp: eventTimestamp(booking, kind),
        important: eventImportant(kind),
      } satisfies DashboardEventItem;
    })
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, EVENTS_LIMIT);
}

export function filterDashboardEvents(
  events: DashboardEventItem[],
  filter: DashboardEventFilter,
  advanced: DashboardEventAdvancedFilter,
): DashboardEventItem[] {
  let list = events;

  if (filter === 'important') {
    list = list.filter((event) => event.important);
  }

  if (advanced.importance === 'important') {
    list = list.filter((event) => event.important);
  } else if (advanced.importance === 'normal') {
    list = list.filter((event) => !event.important);
  }

  if (advanced.type) {
    list = list.filter((event) => event.kind === advanced.type);
  }

  const notificationId = advanced.notificationId.trim();
  if (notificationId) {
    list = list.filter((event) => String(event.reservationNumber).includes(notificationId));
  }

  const search = advanced.search.trim().toLowerCase();
  if (search) {
    list = list.filter((event) => {
      const haystack = `${event.kind} ${event.reservationNumber} ${event.id}`.toLowerCase();
      return haystack.includes(search);
    });
  }

  return list;
}

export function dashboardReservationStatusKey(status: DashboardReservationStatus): string {
  switch (status) {
    case 'cancelled':
      return 'resStatusCancelled';
    case 'reserved':
      return 'resStatusReserved';
    default:
      return 'resStatusStaying';
  }
}

export function dashboardEventTitleKey(kind: DashboardEventKind): string {
  switch (kind) {
    case 'cancelled':
      return 'eventTitleCancel';
    case 'check_in':
      return 'eventTitleCheckIn';
    default:
      return 'eventTitleNew';
  }
}

export function dashboardEventDescription(
  kind: DashboardEventKind,
  reservationNumber: number,
  actorLabel: string,
): { key: string; params: Record<string, string | number> } {
  switch (kind) {
    case 'cancelled':
      return {
        key: 'eventDescCancel',
        params: { n: reservationNumber, user: actorLabel },
      };
    case 'check_in':
      return {
        key: 'eventDescCheckIn',
        params: { n: reservationNumber, user: actorLabel },
      };
    default:
      return {
        key: 'eventDescNew',
        params: { n: reservationNumber, user: actorLabel },
      };
  }
}

export function formatDashboardEventTimestamp(date: Date, displayLocale: string): string {
  const locale =
    displayLocale === 'ar'
      ? 'ar-SA'
      : displayLocale === 'fr'
        ? 'fr-FR'
        : displayLocale === 'tr'
          ? 'tr-TR'
          : 'en-US';
  const time = formatTime12h(
    `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
  );
  const datePart = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(date);
  return `${time} , ${datePart}`;
}

export function formatDashboardTableDate(ymd: string): string {
  return formatSlashDate(ymd);
}
