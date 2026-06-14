export type HkTaskSortKey =
  | 'rowNo'
  | 'name'
  | 'foreignName'
  | 'code'
  | 'description'
  | 'points'
  | 'timeUnit'
  | 'requiredTime'
  | 'displayOrder';

export type HkTaskSortDir = 'asc' | 'desc';

export interface HkTaskRow {
  id: string;
  rowNo: number;
  name: string;
  foreignName: string;
  code: string;
  description: string;
  points: number;
  color: string;
  timeUnit: number;
  requiredTime: number;
  displayOrder: number;
}
