import { Booking } from '../models/booking.model';

export type DashboardReservationStatus = 'cancelled' | 'reserved' | 'staying';

export type DashboardEventKind = 'cancelled' | 'new' | 'check_in';

export type DashboardEventFilter = 'all' | 'important';

export interface DashboardEventAdvancedFilter {
  status: '' | 'read' | 'unread';
  importance: '' | 'important' | 'normal';
  type: '' | DashboardEventKind;
  notificationId: string;
  search: string;
}

export interface DashboardLatestReservationRow {
  booking: Booking;
  reservationNumber: number;
  guestName: string;
  arrivalYmd: string;
  departureYmd: string;
  nights: number;
  status: DashboardReservationStatus;
}

export interface DashboardEventItem {
  id: string;
  kind: DashboardEventKind;
  bookingId?: number;
  reservationNumber: number;
  timestamp: Date;
  important: boolean;
}
