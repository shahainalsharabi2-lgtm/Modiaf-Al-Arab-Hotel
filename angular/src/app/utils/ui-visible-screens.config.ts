/**
 * شاشات screenCopy المعروضة فعلياً في التطبيق (مسار + مكوّن أو overlay).
 * تُستبعد من محرر الترجمة أي شاشة غير موجودة هنا.
 */
export const UI_DISPLAYED_SCREEN_IDS = new Set<string>([
  'dashboard',
  'booking',
  'bookings',
  'groupBooking',
  'revenueCard',
  'groupsList',
  'bookingsChart',
  'roomsSchedule',
  'availabilityChart',
  'bookingsInquiries',
  'residentGuestsData',
  'roomPlan',
  'roomsRack',
  'guestValuables',
  'keys',
  'keyServices',
  'rooms',
  'roomForm',
  'roomDetails',
  'roomPreview',
  'rentPosting',
  'previousInvoices',
  'invoicesNotifications',
  'cashierClosing',
  'servicesInvoice',
  'crmProfileSettings',
  'crmIndividuals',
  'crmCompanies',
  'crmAgents',
  'crmBlacklist',
  'crmRepresentatives',
  'nightAuditSettings',
  'nightAuditReservations',
  'nightAuditProcedure',
  'nightAuditRoomMovement',
  'nightAuditInquiries',
  'hkTasks',
  'hkTaskRequest',
  'hkTaskRequests',
  'hkCheckRoomStatus',
  'hkMaintenanceRequests',
  'hkRoomInspectionItems',
  'hkRoomInspectionOps',
  'hkRoomConflicts',
  'arAccounts',
  'accountsReceivable',
  'agentAccounts',
  'openingBalances',
  'chartOfAccountsLink',
  'accountingEntries',
  'settings',
  'generalCodes',
  'reports',
  'myAccount',
  'translationGuide',
]);

/** شاشات محذوفة من التطبيق — تُستبعد من المحرر وملفات الترجمة */
export const UI_REMOVED_SCREEN_IDS = new Set<string>(['login', 'nav', 'database']);

export function isUiTranslationScreenDisplayed(screenId: string): boolean {
  return UI_DISPLAYED_SCREEN_IDS.has(screenId) && !UI_REMOVED_SCREEN_IDS.has(screenId);
}

export function filterUiTranslationScreenIds(screenIds: readonly string[] | undefined): string[] {
  if (!screenIds?.length) {
    return [];
  }
  return screenIds.filter(isUiTranslationScreenDisplayed);
}
