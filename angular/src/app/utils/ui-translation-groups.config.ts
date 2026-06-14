import {
  BOOKINGS_NAV_ITEMS,
  FRONT_DESK_NAV_ENTRIES,
  PMS_SIDEBAR_GROUPS,
  REPORTS_NAV_ITEMS,
  SETTINGS_SIDEBAR_NAV_ITEMS,
  flattenFrontDeskNavLabelKeys,
  isActiveSidebarNavLabelKey,
  type SidebarNavItem,
} from '../navigation/sidebar-nav.config';
import { flattenSettingsSidebarNavLabelKeys } from '../settings/settings-page-nav.config';
import { filterUiTranslationScreenIds, isUiTranslationScreenDisplayed } from './ui-visible-screens.config';

export interface UiTranslationSidebarSection {
  id: string;
  /** مفتاح عنوان القسم في sidebarNav */
  titleKey?: string;
  /** عنوان من settings.screenCopy عند عدم وجود titleKey */
  titleSettingsKey?: string;
  /** عناصر القائمة تحت العنوان (بدون titleKey) */
  itemKeys: readonly string[];
}

/** مفاتيح chrome لا تُعرض في محرر ترجمة الواجهة (نصوص ثابتة) */
export const UI_TRANSLATION_EDITOR_EXCLUDED_CHROME_KEYS = new Set<string>([
  'accountHubAria',
]);

export function isUiTranslationEditorChromeKeyExcluded(key: string): boolean {
  return UI_TRANSLATION_EDITOR_EXCLUDED_CHROME_KEYS.has(key);
}

export interface UiTranslationEditorGroup {
  id: string;
  /** عنوان القسم من sidebarNav */
  titleSidebarKey?: string;
  /** عنوان القسم من settings.screenCopy عند عدم وجود مفتاح في القائمة */
  titleSettingsKey?: string;
  sidebarNavKeys?: readonly string[];
  /** يعرض كل أقسام القائمة الجانبية بشكل هرمي */
  includeAllSidebar?: boolean;
  screenIds?: readonly string[];
  includeBrandSubtitle?: boolean;
  includeAllChrome?: boolean;
  includeAllSystemMessages?: boolean;
}

function navLabelKeys(items: readonly SidebarNavItem[]): string[] {
  return items.map((item) => item.labelKey);
}

function pmsGroupItems(section: (typeof PMS_SIDEBAR_GROUPS)[number]['section']): string[] {
  const group = PMS_SIDEBAR_GROUPS.find((g) => g.section === section);
  if (!group) {
    return [];
  }
  return navLabelKeys(group.items);
}

function sidebarSection(
  id: string,
  titleKey: string,
  itemKeys: readonly string[],
): UiTranslationSidebarSection {
  return { id, titleKey, itemKeys: [...itemKeys] };
}

/** أقسام القائمة الجانبية — عنوان + عناصر فرعية (مطابق للشريط الجانبي) */
export const UI_TRANSLATION_SIDEBAR_SECTIONS: readonly UiTranslationSidebarSection[] = [
  sidebarSection('dashboard', 'dashboard', []),
  sidebarSection('frontDesk', 'frontDeskGroup', [
    'rooms',
    ...flattenFrontDeskNavLabelKeys(FRONT_DESK_NAV_ENTRIES),
  ]),
  sidebarSection('bookings', 'bookingsGroup', navLabelKeys(BOOKINGS_NAV_ITEMS)),
  sidebarSection('cashier', 'cashierGroup', pmsGroupItems('cashier')),
  sidebarSection('crm', 'crmGroup', pmsGroupItems('crm')),
  sidebarSection('nightAuditor', 'nightAuditorGroup', pmsGroupItems('nightAuditor')),
  sidebarSection('housekeeping', 'housekeepingGroup', pmsGroupItems('housekeeping')),
  sidebarSection('settings', 'settings', flattenSettingsSidebarNavLabelKeys()),
  sidebarSection('accounts', 'accountsGroup', pmsGroupItems('accounts')),
  sidebarSection('reports', 'reports', navLabelKeys(REPORTS_NAV_ITEMS)),
];

const ASSIGNED_SCREEN_IDS = new Set<string>();

function group(
  def: UiTranslationEditorGroup & { screenIds?: readonly string[] },
): UiTranslationEditorGroup {
  const screenIds = filterUiTranslationScreenIds(def.screenIds);
  for (const id of screenIds) {
    ASSIGNED_SCREEN_IDS.add(id);
  }
  return { ...def, screenIds: screenIds.length ? screenIds : undefined };
}

/** ترتيب أقسام محرر الترجمة */
export const UI_TRANSLATION_EDITOR_GROUPS: readonly UiTranslationEditorGroup[] = [
  group({
    id: 'common',
    titleSettingsKey: 'uiTranslationsGroupCommon',
    includeAllChrome: true,
  }),
  group({
    id: 'systemMessages',
    titleSettingsKey: 'uiTranslationsSystemMessages',
    includeAllSystemMessages: true,
  }),
  group({
    id: 'sidebar',
    titleSettingsKey: 'uiTranslationsSidebarNav',
    includeAllSidebar: true,
  }),
  group({
    id: 'dashboard',
    titleSidebarKey: 'dashboard',
    screenIds: ['dashboard'],
  }),
  group({
    id: 'frontDesk',
    titleSidebarKey: 'frontDeskGroup',
    screenIds: [
      'roomPlan',
      'roomsRack',
      'guestValuables',
      'keys',
      'keyServices',
      'rooms',
      'roomPreview',
      'roomForm',
      'roomDetails',
    ],
  }),
  group({
    id: 'bookings',
    titleSidebarKey: 'bookingsGroup',
    screenIds: [
      'bookings',
      'groupBooking',
      'revenueCard',
      'groupsList',
      'bookingsChart',
      'roomsSchedule',
      'availabilityChart',
      'bookingsInquiries',
      'residentGuestsData',
    ],
  }),
  group({
    id: 'cashier',
    titleSidebarKey: 'cashierGroup',
    screenIds: ['rentPosting', 'previousInvoices', 'invoicesNotifications', 'cashierClosing', 'servicesInvoice'],
  }),
  group({
    id: 'crm',
    titleSidebarKey: 'crmGroup',
    screenIds: ['crmProfileSettings', 'crmIndividuals', 'crmCompanies', 'crmAgents', 'crmBlacklist', 'crmRepresentatives'],
  }),
  group({
    id: 'nightAuditor',
    titleSidebarKey: 'nightAuditorGroup',
    screenIds: ['nightAuditSettings', 'nightAuditReservations', 'nightAuditProcedure', 'nightAuditRoomMovement', 'nightAuditInquiries'],
  }),
  group({
    id: 'housekeeping',
    titleSidebarKey: 'housekeepingGroup',
    screenIds: ['hkTasks', 'hkTaskRequest', 'hkTaskRequests', 'hkCheckRoomStatus', 'hkMaintenanceRequests', 'hkRoomInspectionItems', 'hkRoomInspectionOps', 'hkRoomConflicts'],
  }),
  group({
    id: 'guide',
    titleSettingsKey: 'uiTranslationsGroupGuide',
    screenIds: ['translationGuide'],
  }),
  group({
    id: 'settings',
    titleSidebarKey: 'settings',
    screenIds: ['settings', 'generalCodes', 'myAccount'],
  }),
  group({
    id: 'accounts',
    titleSidebarKey: 'accountsGroup',
    screenIds: ['arAccounts', 'accountsReceivable', 'agentAccounts', 'openingBalances', 'chartOfAccountsLink', 'accountingEntries'],
  }),
  group({
    id: 'reports',
    titleSidebarKey: 'reports',
    screenIds: ['reports'],
  }),
];

export function uiTranslationSidebarSectionKeys(section: UiTranslationSidebarSection): string[] {
  return section.titleKey ? [section.titleKey, ...section.itemKeys] : [...section.itemKeys];
}

export function uiTranslationOtherScreenIds(allScreenIds: readonly string[]): string[] {
  const known = new Set<string>();
  for (const g of UI_TRANSLATION_EDITOR_GROUPS) {
    for (const id of g.screenIds ?? []) {
      known.add(id);
    }
  }
  return allScreenIds
    .filter((id) => !known.has(id) && isUiTranslationScreenDisplayed(id))
    .sort((a, b) => a.localeCompare(b));
}

export function uiTranslationEditorGroupsWithOther(
  allScreenIds: readonly string[],
): readonly UiTranslationEditorGroup[] {
  const otherIds = uiTranslationOtherScreenIds(allScreenIds);
  if (otherIds.length === 0) {
    return UI_TRANSLATION_EDITOR_GROUPS;
  }
  return [
    ...UI_TRANSLATION_EDITOR_GROUPS,
    {
      id: 'other',
      titleSettingsKey: 'uiTranslationsGroupOther',
      screenIds: otherIds,
    },
  ];
}

/** مفاتيح sidebarNav غير الموزّعة على أقسام القائمة */
export function uiTranslationUnassignedSidebarKeys(allKeys: readonly string[]): string[] {
  const assigned = new Set<string>();
  for (const section of UI_TRANSLATION_SIDEBAR_SECTIONS) {
    for (const key of uiTranslationSidebarSectionKeys(section)) {
      assigned.add(key);
    }
  }
  for (const g of UI_TRANSLATION_EDITOR_GROUPS) {
    for (const key of g.sidebarNavKeys ?? []) {
      assigned.add(key);
    }
  }
  return allKeys
    .filter((key) => !assigned.has(key) && isActiveSidebarNavLabelKey(key))
    .sort((a, b) => a.localeCompare(b));
}

export function uiTranslationSidebarSectionsWithOther(
  allKeys: readonly string[],
): readonly UiTranslationSidebarSection[] {
  const extra = uiTranslationUnassignedSidebarKeys(allKeys);
  if (extra.length === 0) {
    return UI_TRANSLATION_SIDEBAR_SECTIONS;
  }
  return [
    ...UI_TRANSLATION_SIDEBAR_SECTIONS,
    {
      id: 'other',
      titleSettingsKey: 'uiTranslationsSidebarSectionOther',
      itemKeys: extra,
    },
  ];
}
