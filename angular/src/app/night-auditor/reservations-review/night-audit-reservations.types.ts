export type NightAuditReservationsTab = 'reservations' | 'depositRefund' | 'departingBalance';

export type NightAuditReservationSortKey =
  | 'reservationNo'
  | 'guestName'
  | 'arrivalDate'
  | 'nights'
  | 'departureDate'
  | 'roomNo'
  | 'roomType'
  | 'status';

export type NightAuditReservationSortDir = 'asc' | 'desc';

export type NightAuditReservationStatusKey = 'unconfirmed' | 'reserved' | 'staying';

export interface NightAuditReservationRow {
  id: string;
  bookingId?: number;
  reservationNo: string;
  guestName: string;
  arrivalDate: string;
  nights: number;
  departureDate: string;
  roomNo: string;
  roomType: string;
  statusKey: NightAuditReservationStatusKey;
  depositRefundEligible: boolean;
  departingBalanceEligible: boolean;
}
