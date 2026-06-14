export type HkTaskRequestTab = 'incomplete' | 'completed';

export type HkTaskRequestSortKey =
  | 'serial'
  | 'taskName'
  | 'taskDate'
  | 'notes'
  | 'roomNo'
  | 'roomCount'
  | 'employeeName';

export type HkTaskRequestSortDir = 'asc' | 'desc';

export type HkTaskRequestViewMode = 'grid' | 'table';

export interface HkTaskRequestRow {
  id: string;
  serial: number;
  taskName: string;
  taskDate: string;
  notes: string;
  roomNo: string;
  roomCount: number;
  employeeName: string;
  completed: boolean;
}
