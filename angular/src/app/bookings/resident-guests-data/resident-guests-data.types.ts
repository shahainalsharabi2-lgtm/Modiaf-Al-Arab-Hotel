export type ResidentGuestSortKey =
  | 'reservationNo'
  | 'guestName'
  | 'bookingDate'
  | 'arrivalDate'
  | 'nights'
  | 'departureDate';

export type ResidentGuestSortDir = 'asc' | 'desc';

export interface ResidentGuestRow {
  id: string;
  bookingId?: number;
  reservationNo: string;
  guestName: string;
  bookingDate: string;
  arrivalDate: string;
  nights: number;
  departureDate: string;
  roomType: string;
}
