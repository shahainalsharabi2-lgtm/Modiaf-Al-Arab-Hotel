import { isReportKind } from '../utils/reports-filter.util';

export interface AdvancedReportLeaf {
  id: string;
  labelKey: string;
}

export interface AdvancedReportCategory {
  id: string;
  labelKey: string;
  icon: string;
  reports: ReadonlyArray<AdvancedReportLeaf>;
}

export const ADVANCED_REPORT_CATEGORIES: ReadonlyArray<AdvancedReportCategory> = [
  {
    id: 'bookings',
    labelKey: 'advCatBookings',
    icon: 'fa-calendar-alt',
    reports: [
      { id: 'bookings', labelKey: 'navReportBookings' },
      { id: 'staying', labelKey: 'navReportStayingList' },
      { id: 'staying-summary', labelKey: 'navReportStayingSummary' },
      { id: 'departing', labelKey: 'navReportDeparting' },
      { id: 'cancelled', labelKey: 'navReportCancelled' },
      { id: 'no_show', labelKey: 'navReportNoShow' },
    ],
  },
  {
    id: 'frontOffice',
    labelKey: 'advCatFrontOffice',
    icon: 'fa-concierge-bell',
    reports: [
      { id: 'fo-receipts', labelKey: 'rptFoReceipts' },
      { id: 'fo-guest-data', labelKey: 'rptFoGuestData' },
      { id: 'fo-cash-summary', labelKey: 'rptFoCashSummary' },
      { id: 'fo-general-journal', labelKey: 'rptFoGeneralJournal' },
      { id: 'fo-services', labelKey: 'rptFoServices' },
      { id: 'fo-occupancy', labelKey: 'rptFoOccupancy' },
    ],
  },
  {
    id: 'accounts',
    labelKey: 'advCatAccounts',
    icon: 'fa-calculator',
    reports: [
      { id: 'acc-tax', labelKey: 'rptAccTax' },
      { id: 'acc-company-invoices', labelKey: 'rptAccCompanyInvoices' },
      { id: 'acc-revenue', labelKey: 'rptAccRevenue' },
      { id: 'acc-invoices', labelKey: 'rptAccInvoices' },
      { id: 'acc-statement', labelKey: 'rptAccStatement' },
    ],
  },
  {
    id: 'nightAuditor',
    labelKey: 'advCatNightAuditor',
    icon: 'fa-moon',
    reports: [
      { id: 'na-trial-balance', labelKey: 'rptNaTrialBalance' },
      { id: 'na-ops-review', labelKey: 'rptNaOpsReview' },
      { id: 'na-manager', labelKey: 'rptNaManager' },
      { id: 'na-closing-memo', labelKey: 'rptNaClosingMemo' },
      { id: 'na-res-memo', labelKey: 'rptNaResMemo' },
      { id: 'na-payment-voucher', labelKey: 'rptNaPaymentVoucher' },
      { id: 'na-room-movement', labelKey: 'rptNaRoomMovement' },
      { id: 'na-final-invoice', labelKey: 'rptNaFinalInvoice' },
    ],
  },
  {
    id: 'housekeeping',
    labelKey: 'advCatHousekeeping',
    icon: 'fa-broom',
    reports: [],
  },
  {
    id: 'inputs',
    labelKey: 'advCatInputs',
    icon: 'fa-database',
    reports: [],
  },
];

export function isBookingReportId(reportId: string | null | undefined): boolean {
  return isReportKind(reportId);
}

export function advancedReportLeaf(
  reportId: string | null | undefined,
): AdvancedReportLeaf | null {
  if (!reportId) {
    return null;
  }
  for (const category of ADVANCED_REPORT_CATEGORIES) {
    const match = category.reports.find((r) => r.id === reportId);
    if (match) {
      return match;
    }
  }
  return null;
}

export function advancedReportCategoryForReport(reportId: string): string | null {
  for (const category of ADVANCED_REPORT_CATEGORIES) {
    if (category.reports.some((r) => r.id === reportId)) {
      return category.id;
    }
  }
  return null;
}
