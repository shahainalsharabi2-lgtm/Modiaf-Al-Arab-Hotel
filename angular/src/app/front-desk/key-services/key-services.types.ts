export type KeyServiceStatus = 'online' | 'offline';

export type KeyServiceSortKey = 'serviceNo' | 'serviceName' | 'status' | 'lastSeen' | 'linkedUsers';

export type KeyServiceSortDir = 'asc' | 'desc';

export interface KeyServiceRow {
  id: string;
  serviceNo: string;
  serviceName: string;
  status: KeyServiceStatus;
  lastSeen: string;
  linkedUsersCount: number;
}
