export type NightAuditDayStatus = 'open' | 'in_progress' | 'closed';

export type NightAuditArchiveStatus = 'completed' | 'in_progress';

export type NightAuditRunMode = 'automatic' | 'manual';

export interface NightAuditArchiveRow {
  id: string;
  businessDate: string;
  startAt: string;
  endAt: string;
  status: NightAuditArchiveStatus;
  mode: NightAuditRunMode;
  notes: string;
}

export const NIGHT_AUDIT_ARCHIVE_DEFAULTS: NightAuditArchiveRow[] = [
  {
    id: 'arch-1',
    businessDate: '2025/11/13',
    startAt: '2026/06/08 09:38:40 ص',
    endAt: '2026/06/08 09:41:12 ص',
    status: 'completed',
    mode: 'manual',
    notes: '',
  },
  {
    id: 'arch-2',
    businessDate: '2025/11/12',
    startAt: '2026/06/07 02:05:18 ص',
    endAt: '2026/06/07 02:08:44 ص',
    status: 'completed',
    mode: 'automatic',
    notes: '',
  },
  {
    id: 'arch-3',
    businessDate: '2025/11/11',
    startAt: '2026/06/06 02:12:03 ص',
    endAt: '',
    status: 'in_progress',
    mode: 'manual',
    notes: '',
  },
];
