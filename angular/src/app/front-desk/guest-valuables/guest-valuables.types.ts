export type GuestValuablesTab = 'valuables' | 'lostFound';

export type GuestValuableCustodyStatus = 'in_custody' | 'delivered';

export type GuestValuableScopeFilter = 'all' | 'inCustody' | 'delivered';

export type LostFoundStatus = 'open' | 'delivered' | 'disposed' | 'expired';

export type LostFoundScopeFilter = 'all' | 'open' | 'delivered' | 'disposed' | 'expired';

export type GuestValuableSortKey =
  | 'receiptNo'
  | 'guestName'
  | 'roomNo'
  | 'category'
  | 'description'
  | 'quantity'
  | 'safeBoxNo';

export type LostFoundSortKey =
  | 'referenceNo'
  | 'description'
  | 'category'
  | 'foundLocation'
  | 'safeBoxNo'
  | 'status'
  | 'foundDate';

export type GuestValuablesSortDir = 'asc' | 'desc';

export interface GuestValuableDepositRow {
  id: string;
  receiptNo: string;
  guestName: string;
  roomNo: string;
  categoryKey: string;
  description: string;
  quantity: number;
  safeBoxNo: string;
  status: GuestValuableCustodyStatus;
}

export interface LostFoundItemRow {
  id: string;
  referenceNo: string;
  description: string;
  categoryKey: string;
  foundLocation: string;
  safeBoxNo: string;
  status: LostFoundStatus;
  foundDate: string;
}
