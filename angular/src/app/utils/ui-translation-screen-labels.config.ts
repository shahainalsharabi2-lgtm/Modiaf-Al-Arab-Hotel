/** ربط screenId بمسار القائمة الجانبية — لمسميات أوضح في محرر الترجمة */
export interface UiTranslationScreenNavLabel {
  /** مفتاح القسم في sidebarNav (مثل bookingsGroup) */
  sectionKey?: string;
  /** مفتاح/مفاتيح الصفحة في sidebarNav — مثل navNewBooking */
  pageKeys: readonly string[];
}

/**
 * مسميات الشاشات على نمط شريط التنقل: «القسم / الصفحة»
 * مثال: booking → «الحجوزات / حجز جديد»
 */
export const UI_TRANSLATION_SCREEN_NAV_LABELS: Readonly<Record<string, UiTranslationScreenNavLabel>> = {
  dashboard: { pageKeys: ['dashboard'] },

  roomPlan: { sectionKey: 'frontDeskGroup', pageKeys: ['navRoomPlan'] },
  roomsRack: { sectionKey: 'frontDeskGroup', pageKeys: ['navRoomRack'] },
  guestValuables: { sectionKey: 'frontDeskGroup', pageKeys: ['navGuestValuables'] },
  keys: { sectionKey: 'frontDeskGroup', pageKeys: ['navKeyManagement', 'navKeys'] },
  keyServices: { sectionKey: 'frontDeskGroup', pageKeys: ['navKeyManagement', 'navKeyServices'] },
  rooms: { sectionKey: 'bookingsGroup', pageKeys: ['rooms'] },
  roomPreview: { sectionKey: 'bookingsGroup', pageKeys: ['rooms'] },
  roomForm: { sectionKey: 'bookingsGroup', pageKeys: ['rooms'] },
  roomDetails: { sectionKey: 'bookingsGroup', pageKeys: ['rooms'] },

  booking: { sectionKey: 'bookingsGroup', pageKeys: ['navNewBooking'] },
  bookings: { sectionKey: 'bookingsGroup', pageKeys: ['bookingsHub'] },
  groupBooking: { sectionKey: 'bookingsGroup', pageKeys: ['navGroupBooking'] },
  revenueCard: { sectionKey: 'bookingsGroup', pageKeys: ['navRevenueCard'] },
  groupsList: { sectionKey: 'bookingsGroup', pageKeys: ['navGroups'] },
  bookingsChart: { sectionKey: 'bookingsGroup', pageKeys: ['navBookingsChart'] },
  roomsSchedule: { sectionKey: 'bookingsGroup', pageKeys: ['navRoomsSchedule'] },
  availabilityChart: { sectionKey: 'bookingsGroup', pageKeys: ['navAvailabilityChart'] },
  bookingsInquiries: { sectionKey: 'bookingsGroup', pageKeys: ['navBookingsInquiries'] },
  residentGuestsData: { sectionKey: 'bookingsGroup', pageKeys: ['navResidentGuestsData'] },

  rentPosting: { sectionKey: 'cashierGroup', pageKeys: ['navRentPosting'] },
  previousInvoices: { sectionKey: 'cashierGroup', pageKeys: ['navPreviousInvoices'] },
  invoicesNotifications: { sectionKey: 'cashierGroup', pageKeys: ['navInvoicesNotifications'] },
  cashierClosing: { sectionKey: 'cashierGroup', pageKeys: ['navCashierClosing'] },
  servicesInvoice: { sectionKey: 'cashierGroup', pageKeys: ['navServicesInvoice'] },

  crmProfileSettings: { sectionKey: 'crmGroup', pageKeys: ['navCrmProfileSettings'] },
  crmIndividuals: { sectionKey: 'crmGroup', pageKeys: ['navCrmIndividuals'] },
  crmCompanies: { sectionKey: 'crmGroup', pageKeys: ['navCrmCompanies'] },
  crmAgents: { sectionKey: 'crmGroup', pageKeys: ['navCrmAgents'] },
  crmBlacklist: { sectionKey: 'crmGroup', pageKeys: ['navCrmBlacklist'] },
  crmRepresentatives: { sectionKey: 'crmGroup', pageKeys: ['navCrmRepresentatives'] },

  nightAuditSettings: { sectionKey: 'nightAuditorGroup', pageKeys: ['navNightAuditorSettings'] },
  nightAuditReservations: { sectionKey: 'nightAuditorGroup', pageKeys: ['navNightAuditReservations'] },
  nightAuditProcedure: { sectionKey: 'nightAuditorGroup', pageKeys: ['navNightAuditProcedure'] },
  nightAuditRoomMovement: { sectionKey: 'nightAuditorGroup', pageKeys: ['navNightAuditRoomMovement'] },
  nightAuditInquiries: { sectionKey: 'nightAuditorGroup', pageKeys: ['navNightAuditInquiries'] },

  hkTasks: { sectionKey: 'housekeepingGroup', pageKeys: ['navHkTasks'] },
  hkTaskRequest: { sectionKey: 'housekeepingGroup', pageKeys: ['navHkTaskRequest'] },
  hkTaskRequests: { sectionKey: 'housekeepingGroup', pageKeys: ['navHkTaskRequests'] },
  hkCheckRoomStatus: { sectionKey: 'housekeepingGroup', pageKeys: ['navHkCheckRoomStatus'] },
  hkMaintenanceRequests: { sectionKey: 'housekeepingGroup', pageKeys: ['navHkMaintenanceRequests'] },
  hkRoomInspectionItems: { sectionKey: 'housekeepingGroup', pageKeys: ['navHkRoomInspectionItems'] },
  hkRoomInspectionOps: { sectionKey: 'housekeepingGroup', pageKeys: ['navHkRoomInspectionOps'] },
  hkRoomConflicts: { sectionKey: 'housekeepingGroup', pageKeys: ['navHkRoomConflicts'] },

  arAccounts: { sectionKey: 'accountsGroup', pageKeys: ['navDebitAccounts'] },
  accountsReceivable: { sectionKey: 'accountsGroup', pageKeys: ['navAccountsReceivable'] },
  agentAccounts: { sectionKey: 'accountsGroup', pageKeys: ['navAgentAccounts'] },
  openingBalances: { sectionKey: 'accountsGroup', pageKeys: ['navOpeningBalances'] },
  chartOfAccountsLink: { sectionKey: 'accountsGroup', pageKeys: ['navChartOfAccountsLink'] },
  accountingEntries: { sectionKey: 'accountsGroup', pageKeys: ['navAccountingEntries'] },

  settings: { sectionKey: 'settings', pageKeys: [] },
  generalCodes: { sectionKey: 'settings', pageKeys: ['navSettingsSystemSetup', 'stgSysGeneralCodings'] },
  myAccount: { sectionKey: 'settings', pageKeys: ['myAccountBtn'] },

  reports: { pageKeys: ['reports'] },
};

function uiTranslationNavLabelParts(
  def: UiTranslationScreenNavLabel,
  labelForKey: (key: string) => string,
): string[] {
  const parts: string[] = [];
  if (def.sectionKey) {
    parts.push(labelForKey(def.sectionKey));
  }
  for (const key of def.pageKeys) {
    parts.push(labelForKey(key));
  }
  return parts;
}

export function uiTranslationScreenNavLabel(
  screenId: string,
  sidebarLabel: (key: string) => string,
  chromeLabel?: (key: string) => string,
): string | undefined {
  const def = UI_TRANSLATION_SCREEN_NAV_LABELS[screenId];
  if (!def) {
    return undefined;
  }
  const labelForKey = (key: string): string => {
    const fromSidebar = sidebarLabel(key)?.trim();
    if (fromSidebar) {
      return fromSidebar;
    }
    return chromeLabel?.(key)?.trim() ?? key;
  };
  const parts = uiTranslationNavLabelParts(def, labelForKey);
  if (parts.length === 0) {
    return undefined;
  }
  return parts.join(' / ');
}

export function uiTranslationScreenNavPathKeys(screenId: string): readonly string[] | undefined {
  const def = UI_TRANSLATION_SCREEN_NAV_LABELS[screenId];
  if (!def) {
    return undefined;
  }
  const keys: string[] = [];
  if (def.sectionKey) {
    keys.push(def.sectionKey);
  }
  keys.push(...def.pageKeys);
  return keys.length ? keys : undefined;
}
