import type { KeyServiceRow } from './key-services.types';

export const KEY_SERVICE_ROWS: KeyServiceRow[] = [
  {
    id: 'svc-1',
    serviceNo: 'SRV-001',
    serviceName: 'SRV-001',
    status: 'offline',
    lastSeen: '',
    linkedUsersCount: 3,
  },
  {
    id: 'svc-2',
    serviceNo: 'ser1002',
    serviceName: '123',
    status: 'offline',
    lastSeen: '',
    linkedUsersCount: 0,
  },
];
