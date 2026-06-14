export type ReportManagementCategory =
  | 'bookings'
  | 'frontOffice'
  | 'accounts'
  | 'nightAuditor'
  | 'housekeeping'
  | 'inputs';

export interface ManagedReportDefinition {
  id: string;
  category: ReportManagementCategory;
  labelKey: string;
  foreignLabelKey: string;
  showInAllDefault: boolean;
}

export const MANAGED_REPORT_DEFINITIONS: ReadonlyArray<ManagedReportDefinition> = [
  {
    id: 'bookings',
    category: 'bookings',
    labelKey: 'navReportBookings',
    foreignLabelKey: 'mgmtForeignBookings',
    showInAllDefault: true,
  },
  {
    id: 'staying',
    category: 'bookings',
    labelKey: 'navReportStayingList',
    foreignLabelKey: 'mgmtForeignStaying',
    showInAllDefault: true,
  },
  {
    id: 'staying-summary',
    category: 'bookings',
    labelKey: 'navReportStayingSummary',
    foreignLabelKey: 'mgmtForeignStayingSummary',
    showInAllDefault: true,
  },
  {
    id: 'departing',
    category: 'bookings',
    labelKey: 'navReportDeparting',
    foreignLabelKey: 'mgmtForeignDeparting',
    showInAllDefault: true,
  },
  {
    id: 'cancelled',
    category: 'bookings',
    labelKey: 'navReportCancelled',
    foreignLabelKey: 'mgmtForeignCancelled',
    showInAllDefault: false,
  },
  {
    id: 'no_show',
    category: 'bookings',
    labelKey: 'navReportNoShow',
    foreignLabelKey: 'mgmtForeignNoShow',
    showInAllDefault: false,
  },
  {
    id: 'extended-stay',
    category: 'bookings',
    labelKey: 'mgmtNameExtendedStay',
    foreignLabelKey: 'mgmtForeignExtendedStay',
    showInAllDefault: true,
  },
  {
    id: 'ReportResRegCardGRP',
    category: 'bookings',
    labelKey: 'mgmtNameResGroupCard',
    foreignLabelKey: 'mgmtForeignResGroupCard',
    showInAllDefault: false,
  },
  {
    id: 'ReservationReceiptsPaymentsReports',
    category: 'bookings',
    labelKey: 'mgmtNameResReceipts',
    foreignLabelKey: 'mgmtForeignResReceipts',
    showInAllDefault: false,
  },
  {
    id: 'TrialBalanceRep',
    category: 'accounts',
    labelKey: 'mgmtNameTrialBalance',
    foreignLabelKey: 'mgmtForeignTrialBalance',
    showInAllDefault: true,
  },
  {
    id: 'front-office-daily',
    category: 'frontOffice',
    labelKey: 'mgmtNameFoDaily',
    foreignLabelKey: 'mgmtForeignFoDaily',
    showInAllDefault: true,
  },
  {
    id: 'night-audit-summary',
    category: 'nightAuditor',
    labelKey: 'mgmtNameNightAuditSummary',
    foreignLabelKey: 'mgmtForeignNightAuditSummary',
    showInAllDefault: true,
  },
  {
    id: 'hk-room-status',
    category: 'housekeeping',
    labelKey: 'mgmtNameHkRoomStatus',
    foreignLabelKey: 'mgmtForeignHkRoomStatus',
    showInAllDefault: true,
  },
  {
    id: 'inputs-master-list',
    category: 'inputs',
    labelKey: 'mgmtNameInputsMaster',
    foreignLabelKey: 'mgmtForeignInputsMaster',
    showInAllDefault: false,
  },
];

export const REPORT_MANAGEMENT_CATEGORIES: ReadonlyArray<{
  id: ReportManagementCategory | 'all';
  labelKey: string;
}> = [
  { id: 'all', labelKey: 'mgmtFilterAll' },
  { id: 'bookings', labelKey: 'advCatBookings' },
  { id: 'frontOffice', labelKey: 'advCatFrontOffice' },
  { id: 'accounts', labelKey: 'advCatAccounts' },
  { id: 'nightAuditor', labelKey: 'advCatNightAuditor' },
  { id: 'housekeeping', labelKey: 'advCatHousekeeping' },
  { id: 'inputs', labelKey: 'advCatInputs' },
];
