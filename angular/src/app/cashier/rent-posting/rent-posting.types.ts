export type RentPostingSortKey =
  | 'bookingNo'
  | 'roomNo'
  | 'guestName'
  | 'arrivalDate'
  | 'departureDate'
  | 'lastPostDate';

export type RentPostingSortDir = 'asc' | 'desc';

export interface RentPostingRow {
  id: string;
  bookingId?: number;
  bookingNo: string;
  roomNo: string;
  guestName: string;
  arrivalDate: string;
  departureDate: string;
  lastPostDate: string;
}

export interface RentPostingStaticPayload {
  rows: RentPostingRow[];
}
