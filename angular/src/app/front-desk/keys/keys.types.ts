export type KeyRowSortKey = 'roomNo' | 'guestName' | 'keyNo' | 'type' | 'status' | 'expiry';

export type KeyRowSortDir = 'asc' | 'desc';

export interface KeyRow {
  id: string;
  roomNo: string;
  guestName: string;
  keyNo: string;
  typeKey: string;
  statusKey: string;
  expiry: string;
}
