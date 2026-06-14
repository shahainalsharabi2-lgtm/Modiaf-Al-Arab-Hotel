export type HkRoomInspectionStatus = 'inProgress' | 'completed' | 'cancelled';

export type HkRoomInspectionOpsSortKey =
  | 'rowNo'
  | 'roomNo'
  | 'inspectionDate'
  | 'status'
  | 'totalFines';

export type HkRoomInspectionOpsSortDir = 'asc' | 'desc';

export interface HkRoomInspectionOpsRow {
  id: string;
  rowNo: number;
  roomNo: string;
  inspectionDate: string;
  status: HkRoomInspectionStatus;
  totalFines: number;
  finesPosted: boolean;
}
