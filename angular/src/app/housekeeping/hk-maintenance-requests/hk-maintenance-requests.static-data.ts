import type { HkMaintenanceRequestRow } from './hk-maintenance-requests.types';

export const HK_MAINTENANCE_REQUEST_ROWS: ReadonlyArray<HkMaintenanceRequestRow> = [
  {
    id: '1',
    serial: 3,
    roomNo: '122',
    reason: '',
    fromDate: '2025-11-04',
    toDate: '2025-11-05',
    createdBy: 'Egypt',
    createdAt: '2026-04-29',
  },
  {
    id: '2',
    serial: 2,
    roomNo: '215',
    reason: 'تسريب ماء في الحمام',
    fromDate: '2025-11-10',
    toDate: '2025-11-12',
    createdBy: 'أحمد',
    createdAt: '2025-11-10',
  },
  {
    id: '3',
    serial: 1,
    roomNo: '308',
    reason: 'صيانة تكييف',
    fromDate: '2025-11-13',
    toDate: '2025-11-14',
    createdBy: 'سارة',
    createdAt: '2025-11-13',
  },
];
