import type { HkTaskRequestRow } from './hk-task-requests.types';

export const HK_TASK_REQUEST_ROWS: ReadonlyArray<HkTaskRequestRow> = [
  {
    id: '1',
    serial: 1,
    taskName: 'نظافة',
    taskDate: '2025-11-14',
    notes: '',
    roomNo: '101',
    roomCount: 1,
    employeeName: 'تام',
    completed: false,
  },
  {
    id: '2',
    serial: 2,
    taskName: 'تغيير الملايات والفوط',
    taskDate: '2025-11-14',
    notes: '',
    roomNo: '209',
    roomCount: 1,
    employeeName: 'محمد',
    completed: false,
  },
];
