export type HkMaintenanceRequestSortKey =
  | 'serial'
  | 'roomNo'
  | 'reason'
  | 'fromDate'
  | 'toDate'
  | 'createdBy'
  | 'createdAt';

export type HkMaintenanceRequestSortDir = 'asc' | 'desc';

export type HkMaintenanceRequestViewMode = 'grid' | 'table';

export interface HkMaintenanceRequestRow {
  id: string;
  serial: number;
  roomNo: string;
  reason: string;
  fromDate: string;
  toDate: string;
  createdBy: string;
  createdAt: string;
}
