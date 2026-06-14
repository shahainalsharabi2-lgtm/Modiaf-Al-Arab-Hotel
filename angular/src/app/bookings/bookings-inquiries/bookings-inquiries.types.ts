export type BookingsInquirySortKey =
  | 'reservationNo'
  | 'guestName'
  | 'arrivalDate'
  | 'nights'
  | 'departureDate'
  | 'roomNo'
  | 'roomType'
  | 'status'
  | 'total';

export type BookingsInquirySortDir = 'asc' | 'desc';

export type BookingsInquiryStatusKey = 'unconfirmed' | 'reserved' | 'staying';

export interface BookingsInquiryRow {
  id: string;
  bookingId?: number;
  reservationNo: string;
  guestName: string;
  arrivalDate: string;
  nights: number;
  departureDate: string;
  roomNo: string;
  roomType: string;
  statusKey: BookingsInquiryStatusKey;
  total: number;
}
