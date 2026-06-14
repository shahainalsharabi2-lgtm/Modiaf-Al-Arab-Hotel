export interface AuditLogRowDto {
  id: number;
  applicationName: string;
  durationMs: number;
  occurredAt: string;
  ipAddress: string;
  userName: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  correlationId: string;
}

export interface AuditLogFilterDto {
  fromDate: string;
  toDate: string;
  userName: string;
  url: string;
  minDuration: string;
  httpMethod: string;
  applicationName: string;
  ipAddress: string;
  correlationId: string;
}

export function emptyAuditLogFilter(): AuditLogFilterDto {
  return {
    fromDate: '',
    toDate: '',
    userName: '',
    url: '',
    minDuration: '',
    httpMethod: '',
    applicationName: '',
    ipAddress: '',
    correlationId: '',
  };
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — سجلات الرقابة */
export const AUDIT_LOGS_SEED: AuditLogRowDto[] = [
  {
    id: 1,
    applicationName: 'OtelPremio',
    durationMs: 14,
    occurredAt: '2026-06-10T02:20:00',
    ipAddress: '',
    userName: '',
    httpMethod: 'GET',
    url: '/api/abp/application-configuration',
    correlationId: '8f2a1c4d-91b0-4e2a-a1b2-001122334455',
  },
  {
    id: 2,
    applicationName: 'OtelPremio',
    durationMs: 48,
    occurredAt: '2026-06-10T02:20:05',
    ipAddress: '',
    userName: '',
    httpMethod: 'GET',
    url: '/api/identity/audit-log',
    correlationId: '9a3b2d5e-a2c1-4f3b-b2c3-112233445566',
  },
  {
    id: 3,
    applicationName: 'OtelPremio',
    durationMs: 13,
    occurredAt: '2026-06-10T02:20:08',
    ipAddress: '',
    userName: '',
    httpMethod: 'POST',
    url: '/api/identity/audit-log/search',
    correlationId: '1b4c3e6f-b3d2-4a4c-c3d4-223344556677',
  },
  {
    id: 4,
    applicationName: 'OtelPremio',
    durationMs: 12,
    occurredAt: '2026-06-10T02:20:12',
    ipAddress: '',
    userName: '',
    httpMethod: 'GET',
    url: '/api/setting-management/settings',
    correlationId: '2c5d4f7a-c4e3-4b5d-d4e5-334455667788',
  },
  {
    id: 5,
    applicationName: 'OtelPremio',
    durationMs: 11,
    occurredAt: '2026-06-10T02:20:15',
    ipAddress: '',
    userName: '',
    httpMethod: 'GET',
    url: '/api/identity/users',
    correlationId: '3d6e5a8b-d5f4-4c6e-e5f6-445566778899',
  },
  {
    id: 6,
    applicationName: 'OtelPremio',
    durationMs: 12,
    occurredAt: '2026-06-10T02:20:18',
    ipAddress: '',
    userName: '',
    httpMethod: 'GET',
    url: '/api/identity/roles',
    correlationId: '4e7f6b9c-e6a5-4d7f-f6a7-556677889900',
  },
];

export const AUDIT_LOG_HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;

export const AUDIT_LOG_APPLICATIONS = ['OtelPremio'] as const;
