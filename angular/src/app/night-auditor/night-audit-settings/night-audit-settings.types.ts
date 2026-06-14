export type NightAuditSettingsSortKey =
  | 'automatic'
  | 'startTime'
  | 'attemptCount'
  | 'expectedArrivals'
  | 'expectedDepartures'
  | 'openCashiers';

export type NightAuditSettingsSortDir = 'asc' | 'desc';

export type NightAuditSettingsViewMode = 'table' | 'grid';

export type NightAuditSettingsScopeFilter = 'all' | 'automatic' | 'manual';

export type NightAuditExpectedArrivalsAction = 'no_show' | 'keep' | 'cancel';

export type NightAuditExpectedDeparturesAction = 'extend_stay' | 'check_out' | 'keep';

export type NightAuditOpenCashiersAction = 'auto_close' | 'keep_open' | 'warn';

export interface NightAuditSettingsRow {
  id: string;
  automatic: boolean;
  startTime: string;
  attemptCount: number;
  expectedArrivals: NightAuditExpectedArrivalsAction;
  expectedDepartures: NightAuditExpectedDeparturesAction;
  openCashiers: NightAuditOpenCashiersAction;
}

export const NIGHT_AUDIT_SETTINGS_DEFAULTS: NightAuditSettingsRow = {
  id: 'default',
  automatic: false,
  startTime: '02:00',
  attemptCount: 5,
  expectedArrivals: 'no_show',
  expectedDepartures: 'extend_stay',
  openCashiers: 'auto_close',
};
