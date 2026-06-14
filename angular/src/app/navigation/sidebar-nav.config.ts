import {
  flattenSettingsSidebarNavItems,
  flattenSettingsSidebarNavLabelKeys,
  SETTINGS_SIDEBAR_NAV_ENTRIES,
  type SettingsSidebarNavEntry,
  isSettingsSidebarNavSubgroup,
} from '../settings/settings-page-nav.config';

export {
  SETTINGS_SIDEBAR_NAV_ENTRIES,
  isSettingsSidebarNavSubgroup,
  type SettingsSidebarNavEntry,
};

export type SidebarNavLinkActive = { exact: boolean; queryParams: 'exact' | 'ignored' };

export interface SidebarNavItem {
  path: string;
  labelKey: string;
  icon: string;
  queryParams?: Record<string, string>;
  linkActive: SidebarNavLinkActive;
}

export type PmsSidebarSection =
  | 'cashier'
  | 'crm'
  | 'nightAuditor'
  | 'housekeeping'
  | 'accounts';

export type SidebarMainSection =
  | 'bookings'
  | 'frontDesk'
  | PmsSidebarSection
  | 'settings'
  | 'reports';

export interface PmsSidebarGroup {
  section: PmsSidebarSection;
  labelKey: string;
  faIcon: string;
  items: ReadonlyArray<SidebarNavItem>;
}

export interface SidebarNavSubgroup {
  kind: 'subgroup';
  labelKey: string;
  icon: string;
  children: ReadonlyArray<SidebarNavItem>;
}

export type FrontDeskNavEntry = SidebarNavItem | SidebarNavSubgroup;

export function isFrontDeskNavSubgroup(entry: FrontDeskNavEntry): entry is SidebarNavSubgroup {
  return (entry as SidebarNavSubgroup).kind === 'subgroup';
}

export function flattenFrontDeskNavLabelKeys(entries: ReadonlyArray<FrontDeskNavEntry>): string[] {
  const keys: string[] = [];
  for (const entry of entries) {
    if (isFrontDeskNavSubgroup(entry)) {
      keys.push(entry.labelKey, ...entry.children.map((child) => child.labelKey));
    } else {
      keys.push(entry.labelKey);
    }
  }
  return keys;
}

function navSubgroup(
  labelKey: string,
  icon: string,
  children: ReadonlyArray<SidebarNavItem>,
): SidebarNavSubgroup {
  return { kind: 'subgroup', labelKey, icon, children };
}

const subExact: SidebarNavLinkActive = { exact: true, queryParams: 'ignored' };
const subQueryExact: SidebarNavLinkActive = { exact: true, queryParams: 'exact' };

function emptyNav(
  section: SidebarMainSection,
  labelKey: string,
  icon: string,
): SidebarNavItem {
  return {
    path: `/nav/${section}/${labelKey}`,
    labelKey,
    icon,
    linkActive: subExact,
  };
}

function pageNav(
  path: string,
  labelKey: string,
  icon: string,
  queryParams?: Record<string, string>,
  linkActive: SidebarNavLinkActive = subQueryExact,
): SidebarNavItem {
  return { path, labelKey, icon, queryParams, linkActive };
}

export const FRONT_DESK_NAV_ENTRIES: ReadonlyArray<FrontDeskNavEntry> = [
  pageNav('/front-desk', 'navArriving', 'svg-arriving', { pmsTab: 'arriving' }),
  pageNav('/front-desk', 'navDeparting', 'svg-departing', { pmsTab: 'departing' }),
  pageNav('/front-desk', 'navResidents', 'svg-staying', { pmsTab: 'staying' }),
  pageNav('/front-desk/room-plan', 'navRoomPlan', 'svg-layout', undefined, subExact),
  pageNav('/front-desk/rooms-rack', 'navRoomRack', 'svg-database', undefined, subExact),
  pageNav('/front-desk/guest-valuables', 'navGuestValuables', 'svg-guests', undefined, subExact),
  navSubgroup('navKeyManagement', 'fa-key', [
    pageNav('/front-desk/keys', 'navKeys', 'fa-id-card', undefined, subExact),
    pageNav('/front-desk/key-services', 'navKeyServices', 'fa-server', undefined, subExact),
  ]),
];

/** روابط مسطّحة — للبحث والتوافق */
export const FRONT_DESK_NAV_ITEMS: ReadonlyArray<SidebarNavItem> = FRONT_DESK_NAV_ENTRIES.flatMap((entry) =>
  isFrontDeskNavSubgroup(entry) ? [...entry.children] : [entry],
);

export const BOOKINGS_NAV_ITEMS: ReadonlyArray<SidebarNavItem> = [
  pageNav('/front-desk/booking', 'navNewBooking', 'svg-add', undefined, subExact),
  pageNav('/bookings', 'bookingsHub', 'svg-bookings', { view: 'records' }),
  emptyNav('bookings', 'navGroupBooking', 'svg-add'),
  emptyNav('bookings', 'navRevenueCard', 'svg-payments'),
  emptyNav('bookings', 'navGroups', 'fa-users'),
  emptyNav('bookings', 'navAllotmentContracts', 'fa-th'),
  emptyNav('bookings', 'navBookingsChart', 'svg-database'),
  emptyNav('bookings', 'navRoomsSchedule', 'svg-rooms'),
  emptyNav('bookings', 'navAvailabilityChart', 'svg-rooms'),
  emptyNav('bookings', 'navBookingsInquiries', 'fa-search'),
  emptyNav('bookings', 'navResidentGuestsData', 'svg-staying'),
];

export interface SettingsPageNavItem {
  labelKey: string;
  icon: string;
  tab: string | null;
  requiresUsers?: boolean;
}

/** عناصر شريط الإعدادات داخل صفحة /settings */
export const SETTINGS_PAGE_NAV_ITEMS: ReadonlyArray<SettingsPageNavItem> = [
  { labelKey: 'settingsMenuUiTranslation', icon: 'svg-language', tab: 'uiTranslations' },
  { labelKey: 'navSettingsSystemSetup', icon: 'svg-settings', tab: 'general' },
  { labelKey: 'navSettingsMasterData', icon: 'svg-inputs', tab: 'translations' },
  { labelKey: 'navSettingsRoomMgmt', icon: 'svg-layout', tab: 'layout' },
  { labelKey: 'navSettingsTax', icon: 'svg-payments', tab: 'payments' },
  { labelKey: 'navSettingsPricing', icon: 'svg-currency', tab: 'currency' },
  { labelKey: 'navSettingsExternal', icon: 'fa-link', tab: null },
  { labelKey: 'navSettingsUsers', icon: 'svg-user-plus', tab: 'users', requiresUsers: true },
];

/** روابط مسطّحة — للبحث والترجمة */
export const SETTINGS_SIDEBAR_NAV_ITEMS: ReadonlyArray<SidebarNavItem> =
  flattenSettingsSidebarNavItems();

export const REPORTS_NAV_HUB_ITEMS: ReadonlyArray<SidebarNavItem> = [
  pageNav('/reports', 'navReportsAdvancedCenter', 'fa-chart-line', { hub: 'advanced' }),
  pageNav('/reports', 'navReportsTemplate', 'fa-file-alt', { hub: 'template' }),
  pageNav('/reports', 'navReportsManagement', 'fa-file-alt', { hub: 'management' }),
];

export const REPORTS_NAV_ITEMS: ReadonlyArray<SidebarNavItem> = [...REPORTS_NAV_HUB_ITEMS];

export const PMS_SIDEBAR_GROUPS: ReadonlyArray<PmsSidebarGroup> = [
  {
    section: 'cashier',
    labelKey: 'cashierGroup',
    faIcon: 'fa-cash-register',
    items: [
      pageNav('/cashier/rent-posting', 'navRentPosting', 'fa-calculator', undefined, subExact),
      pageNav('/cashier/previous-invoices', 'navPreviousInvoices', 'fa-file-invoice', undefined, subExact),
      pageNav('/cashier/invoices-notifications', 'navInvoicesNotifications', 'fa-link', undefined, subExact),
      emptyNav('cashier', 'navServicesInvoice', 'fa-file-alt'),
      emptyNav('cashier', 'navCashierClosing', 'fa-cash-register'),
    ],
  },
  {
    section: 'crm',
    labelKey: 'crmGroup',
    faIcon: 'fa-chart-pie',
    items: [
      pageNav('/crm/profile-settings', 'navCrmProfileSettings', 'fa-user-cog', undefined, subExact),
      pageNav('/crm/individuals', 'navCrmIndividuals', 'fa-user', undefined, subExact),
      pageNav('/crm/companies', 'navCrmCompanies', 'fa-building', undefined, subExact),
      pageNav('/crm/agents', 'navCrmAgents', 'fa-handshake', undefined, subExact),
      emptyNav('crm', 'navCrmRepresentatives', 'fa-user-tie'),
      emptyNav('crm', 'navCrmBlacklist', 'fa-user-slash'),
    ],
  },
  {
    section: 'nightAuditor',
    labelKey: 'nightAuditorGroup',
    faIcon: 'fa-moon',
    items: [
      pageNav('/night-auditor/settings', 'navNightAuditorSettings', 'fa-cog', undefined, subExact),
      pageNav('/night-auditor/reservations-review', 'navNightAuditReservations', 'svg-bookings', undefined, subExact),
      pageNav('/night-auditor/procedure', 'navNightAuditProcedure', 'fa-clipboard-check', undefined, subExact),
      pageNav('/night-auditor/room-movement', 'navNightAuditRoomMovement', 'fa-calculator', undefined, subExact),
      emptyNav('nightAuditor', 'navNightAuditInquiries', 'fa-search'),
    ],
  },
  {
    section: 'housekeeping',
    labelKey: 'housekeepingGroup',
    faIcon: 'fa-broom',
    items: [
      emptyNav('housekeeping', 'navHkTasks', 'fa-tasks'),
      emptyNav('housekeeping', 'navHkTaskRequest', 'fa-broom'),
      emptyNav('housekeeping', 'navHkRoomConflicts', 'fa-broom'),
      emptyNav('housekeeping', 'navHkTaskRequests', 'fa-broom'),
      emptyNav('housekeeping', 'navHkCheckRoomStatus', 'fa-broom'),
      emptyNav('housekeeping', 'navHkEmployeeTasks', 'fa-broom'),
      emptyNav('housekeeping', 'navHkMaintenanceRequests', 'fa-broom'),
      emptyNav('housekeeping', 'navHkRoomInspectionItems', 'fa-broom'),
      emptyNav('housekeeping', 'navHkRoomInspectionOps', 'fa-clipboard-list'),
    ],
  },
  {
    section: 'accounts',
    labelKey: 'accountsGroup',
    faIcon: 'fa-wallet',
    items: [
      emptyNav('accounts', 'navDebitAccounts', 'fa-hand-holding-usd'),
      emptyNav('accounts', 'navAccountsReceivable', 'fa-coins'),
      emptyNav('accounts', 'navAgentAccounts', 'fa-hand-holding-usd'),
      emptyNav('accounts', 'navOpeningBalances', 'fa-wallet'),
      emptyNav('accounts', 'navChartOfAccountsLink', 'fa-hand-holding-usd'),
      emptyNav('accounts', 'navAccountingEntries', 'fa-hand-holding-usd'),
    ],
  },
];

export const SIDEBAR_MAIN_SECTIONS: ReadonlyArray<SidebarMainSection> = [
  'frontDesk',
  'bookings',
  'cashier',
  'crm',
  'nightAuditor',
  'housekeeping',
  'settings',
  'accounts',
  'reports',
];

export function sidebarSectionFromNavPath(path: string): SidebarMainSection | null {
  const match = path.match(/^\/nav\/([^/]+)/);
  if (!match) {
    return null;
  }
  const section = match[1] as SidebarMainSection;
  return SIDEBAR_MAIN_SECTIONS.includes(section) ? section : null;
}

/** مفاتيح sidebarNav المحذوفة من التطبيق — لا تُعرض في محرر الترجمة */
export const UI_REMOVED_SIDEBAR_NAV_KEYS = new Set<string>([
  'booking',
  'bookings',
  'database',
  'navAddBooking',
  'navWalkInCheckIn',
  'navCheckIn',
  'navCashierRecords',
  'navCrmGuests',
  'navNightAuditReports',
  'navAccountsReports',
]);

/** مفاتيح sidebarNav المستخدمة في القائمة أو العناوين الفرعية */
export function collectActiveSidebarNavLabelKeys(): string[] {
  const keys = new Set<string>([
    'dashboard',
    'frontDeskGroup',
    'bookingsGroup',
    'cashierGroup',
    'crmGroup',
    'nightAuditorGroup',
    'housekeepingGroup',
    'accountsGroup',
    'reports',
    'settings',
    'rooms',
  ]);

  for (const entry of FRONT_DESK_NAV_ENTRIES) {
    if (isFrontDeskNavSubgroup(entry)) {
      keys.add(entry.labelKey);
      for (const child of entry.children) {
        keys.add(child.labelKey);
      }
    } else {
      keys.add(entry.labelKey);
    }
  }
  for (const item of BOOKINGS_NAV_ITEMS) {
    keys.add(item.labelKey);
  }
  for (const item of REPORTS_NAV_ITEMS) {
    keys.add(item.labelKey);
  }
  for (const key of flattenSettingsSidebarNavLabelKeys()) {
    keys.add(key);
  }
  for (const group of PMS_SIDEBAR_GROUPS) {
    keys.add(group.labelKey);
    for (const item of group.items) {
      keys.add(item.labelKey);
    }
  }
  for (const removed of UI_REMOVED_SIDEBAR_NAV_KEYS) {
    keys.delete(removed);
  }
  return [...keys].sort((a, b) => a.localeCompare(b));
}

export function activeSidebarNavLabelKeys(): ReadonlySet<string> {
  return new Set(collectActiveSidebarNavLabelKeys());
}

export function isActiveSidebarNavLabelKey(key: string): boolean {
  return activeSidebarNavLabelKeys().has(key);
}
