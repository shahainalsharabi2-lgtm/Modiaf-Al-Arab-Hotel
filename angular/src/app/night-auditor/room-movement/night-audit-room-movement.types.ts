export type NightAuditRoomMovementSortKey =
  | 'workDate'
  | 'oldRoom'
  | 'newRoom'
  | 'oldRoomType'
  | 'newRoomType'
  | 'oldAmount'
  | 'newAmount'
  | 'transferType';

export type NightAuditRoomMovementSortDir = 'asc' | 'desc';

export type NightAuditRoomMovementViewMode = 'table' | 'grid';

export type NightAuditRoomMovementScopeFilter = 'all' | 'type1' | 'type3';

export interface NightAuditRoomMovementRow {
  id: string;
  workDate: string;
  oldRoomNo: string;
  newRoomNo: string;
  oldRoomType: string;
  newRoomType: string;
  oldAmount: number;
  newAmount: number;
  transferType: number;
}

export const NIGHT_AUDIT_ROOM_MOVEMENT_DEFAULTS: NightAuditRoomMovementRow[] = [
  {
    id: 'mv-1',
    workDate: '2025/11/14',
    oldRoomNo: '922',
    newRoomNo: '122',
    oldRoomType: 'ثنائية',
    newRoomType: 'ثنائية',
    oldAmount: 0,
    newAmount: 0,
    transferType: 1,
  },
  {
    id: 'mv-2',
    workDate: '2025/11/14',
    oldRoomNo: '415',
    newRoomNo: '418',
    oldRoomType: 'خماسية',
    newRoomType: 'خماسية',
    oldAmount: 0,
    newAmount: 0,
    transferType: 3,
  },
  {
    id: 'mv-3',
    workDate: '2025/11/14',
    oldRoomNo: '301',
    newRoomNo: '305',
    oldRoomType: 'ثنائية',
    newRoomType: 'ثنائية',
    oldAmount: 0,
    newAmount: 0,
    transferType: 1,
  },
  {
    id: 'mv-4',
    workDate: '2025/11/13',
    oldRoomNo: '210',
    newRoomNo: '214',
    oldRoomType: 'ثلاثية',
    newRoomType: 'ثلاثية',
    oldAmount: 0,
    newAmount: 0,
    transferType: 3,
  },
];
