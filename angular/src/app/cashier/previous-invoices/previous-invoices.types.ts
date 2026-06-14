export type PreviousInvoiceSortKey =
  | 'serialNo'
  | 'issueDate'
  | 'guestName'
  | 'payerName'
  | 'windowNo'
  | 'bookingNo'
  | 'roomNo'
  | 'arrivalDate'
  | 'departureDate'
  | 'amount';

export type PreviousInvoiceSortDir = 'asc' | 'desc';

export interface PreviousInvoiceRow {
  id: string;
  bookingId?: number;
  serialNo: string;
  issueDate: string;
  guestName: string;
  payerName: string;
  windowNo: string;
  bookingNo: string;
  roomNo: string;
  arrivalDate: string;
  departureDate: string;
  amount: number;
}
