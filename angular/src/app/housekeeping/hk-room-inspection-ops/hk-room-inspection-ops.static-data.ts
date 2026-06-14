import type { HkRoomInspectionOpsRow } from './hk-room-inspection-ops.types';

export const HK_ROOM_INSPECTION_OPS_ROWS: ReadonlyArray<HkRoomInspectionOpsRow> = [
  {
    id: '1',
    rowNo: 1,
    roomNo: '720',
    inspectionDate: '2026-04-30T11:15:00',
    status: 'inProgress',
    totalFines: 100,
    finesPosted: false,
  },
  {
    id: '2',
    rowNo: 2,
    roomNo: '415',
    inspectionDate: '2025-11-13T09:30:00',
    status: 'completed',
    totalFines: 50,
    finesPosted: true,
  },
  {
    id: '3',
    rowNo: 3,
    roomNo: '208',
    inspectionDate: '2025-11-12T14:45:00',
    status: 'completed',
    totalFines: 0,
    finesPosted: false,
  },
];
