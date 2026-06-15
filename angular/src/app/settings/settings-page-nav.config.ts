import type { SidebarNavItem } from '../navigation/sidebar-nav.config';

export interface SettingsPageNavLeaf {
  kind: 'leaf';
  id: string;
  labelKey: string;
  icon: string;
  tab: string | null;
  requiresUsers?: boolean;
  requiresSettings?: boolean;
}

export interface SettingsPageNavSection {
  kind: 'section';
  id: string;
  labelKey: string;
  icon: string;
  children: SettingsPageNavLeaf[];
}

export type SettingsPageNavEntry = SettingsPageNavLeaf | SettingsPageNavSection;

export const SETTINGS_PAGE_NAV: ReadonlyArray<SettingsPageNavEntry> = [
  {
    kind: 'leaf',
    id: 'uiTranslation',
    labelKey: 'settingsMenuUiTranslation',
    icon: 'svg-language',
    tab: 'uiTranslations',
    requiresSettings: true,
  },
  {
    kind: 'section',
    id: 'systemSetup',
    labelKey: 'navSettingsSystemSetup',
    icon: 'svg-settings',
    children: [
      { kind: 'leaf', id: 'sys-general-codings', labelKey: 'stgSysGeneralCodings', icon: 'fa-font', tab: 'translations' },
      { kind: 'leaf', id: 'sys-hotel-chains', labelKey: 'stgSysHotelChains', icon: 'fa-city', tab: null },
      { kind: 'leaf', id: 'sys-credit-cards', labelKey: 'stgSysCreditCardTypes', icon: 'fa-credit-card', tab: null },
      { kind: 'leaf', id: 'sys-hotels', labelKey: 'stgSysHotels', icon: 'fa-hotel', tab: 'general' },
      { kind: 'leaf', id: 'sys-sequence', labelKey: 'stgSysSequenceSettings', icon: 'fa-random', tab: null },
      { kind: 'leaf', id: 'sys-facilities', labelKey: 'stgSysFacilities', icon: 'fa-leaf', tab: null },
      { kind: 'leaf', id: 'sys-landmarks', labelKey: 'stgSysLandmarks', icon: 'fa-map-marked-alt', tab: null },
      { kind: 'leaf', id: 'sys-geo', labelKey: 'stgSysGeoStructure', icon: 'fa-globe-africa', tab: null },
      { kind: 'leaf', id: 'sys-payment-methods', labelKey: 'stgSysPaymentMethods', icon: 'fa-wallet', tab: 'payments' },
      { kind: 'leaf', id: 'sys-languages', labelKey: 'stgInpLanguages', icon: 'fa-language', tab: null },
      { kind: 'leaf', id: 'sys-agent-commissions', labelKey: 'stgInpAgentCommissions', icon: 'fa-percent', tab: null },
      { kind: 'leaf', id: 'sys-currencies', labelKey: 'stgInpCurrencies', icon: 'fa-coins', tab: null },
      { kind: 'leaf', id: 'sys-departments', labelKey: 'stgInpDepartments', icon: 'fa-th', tab: null },
      { kind: 'leaf', id: 'sys-room-booking-statuses', labelKey: 'stgInpRoomBookingStatuses', icon: 'fa-door-open', tab: null },
      { kind: 'leaf', id: 'sys-system-settings', labelKey: 'stgInpSystemSettings', icon: 'fa-cogs', tab: null },
      { kind: 'leaf', id: 'sys-room-plan-filter-perms', labelKey: 'stgInpRoomPlanFilterPerms', icon: 'fa-filter', tab: null },
      { kind: 'leaf', id: 'sys-early-arrival', labelKey: 'stgInpEarlyArrival', icon: 'fa-clock', tab: null },
      { kind: 'leaf', id: 'sys-employees', labelKey: 'stgInpEmployees', icon: 'fa-users', tab: null },
    ],
  },
  {
    kind: 'section',
    id: 'masterData',
    labelKey: 'navSettingsMasterData',
    icon: 'svg-inputs',
    children: [
      { kind: 'leaf', id: 'inp-booking-types', labelKey: 'stgInpBookingTypes', icon: 'fa-cogs', tab: null },
      { kind: 'leaf', id: 'inp-account-coding', labelKey: 'stgInpAccountCoding', icon: 'fa-cogs', tab: null },
      { kind: 'leaf', id: 'inp-manager-reports', labelKey: 'stgInpManagerReports', icon: 'fa-cogs', tab: null },
      { kind: 'leaf', id: 'inp-routing-codes', labelKey: 'stgInpRoutingCodes', icon: 'fa-cogs', tab: null },
      { kind: 'leaf', id: 'inp-market-codes', labelKey: 'stgInpMarketCodes', icon: 'fa-cogs', tab: null },
      { kind: 'leaf', id: 'inp-booking-sources', labelKey: 'stgInpBookingSources', icon: 'fa-cogs', tab: null },
      { kind: 'leaf', id: 'inp-market-categories', labelKey: 'stgInpMarketCategories', icon: 'fa-cogs', tab: null },
      { kind: 'leaf', id: 'inp-bank-coding', labelKey: 'stgInpBankCoding', icon: 'fa-cogs', tab: null },
      { kind: 'leaf', id: 'inp-cashier-coding', labelKey: 'stgInpCashierCoding', icon: 'fa-cogs', tab: null },
      { kind: 'leaf', id: 'inp-confirmation-messages', labelKey: 'stgInpConfirmationMessages', icon: 'fa-cogs', tab: null },
      { kind: 'leaf', id: 'inp-advance-payment-policies', labelKey: 'stgInpAdvancePaymentPolicies', icon: 'fa-cogs', tab: null },
    ],
  },
  {
    kind: 'section',
    id: 'roomMgmt',
    labelKey: 'navSettingsRoomMgmt',
    icon: 'svg-layout',
    children: [
      { kind: 'leaf', id: 'room-floors', labelKey: 'stgRoomFloors', icon: 'fa-building', tab: 'layout' },
      { kind: 'leaf', id: 'room-building-groups', labelKey: 'stgRoomBuildingGroups', icon: 'fa-building', tab: 'layout' },
      { kind: 'leaf', id: 'room-buildings', labelKey: 'stgRoomBuildings', icon: 'fa-building', tab: 'layout' },
      { kind: 'leaf', id: 'room-types', labelKey: 'stgRoomTypes', icon: 'fa-building', tab: 'layout' },
      { kind: 'leaf', id: 'room-rooms', labelKey: 'stgRoomRooms', icon: 'fa-building', tab: 'layout' },
    ],
  },
  {
    kind: 'section',
    id: 'tax',
    labelKey: 'navSettingsTax',
    icon: 'svg-payments',
    children: [
      { kind: 'leaf', id: 'tax-brackets', labelKey: 'stgTaxBrackets', icon: 'fa-circle', tab: null },
      { kind: 'leaf', id: 'tax-types', labelKey: 'stgTaxTypes', icon: 'fa-dollar-sign', tab: 'payments' },
      { kind: 'leaf', id: 'tax-classification', labelKey: 'stgTaxClassification', icon: 'fa-chart-bar', tab: null },
      { kind: 'leaf', id: 'tax-account-link', labelKey: 'stgTaxAccountLink', icon: 'fa-link', tab: 'payments' },
    ],
  },
  {
    kind: 'section',
    id: 'pricing',
    labelKey: 'navSettingsPricing',
    icon: 'svg-currency',
    children: [
      { kind: 'leaf', id: 'price-seasons', labelKey: 'stgPriceSeasons', icon: 'fa-calendar-alt', tab: null },
      { kind: 'leaf', id: 'price-categories', labelKey: 'stgPriceCategories', icon: 'fa-tags', tab: null },
      { kind: 'leaf', id: 'price-child-ages', labelKey: 'stgPriceChildAgeCategories', icon: 'fa-child', tab: null },
      { kind: 'leaf', id: 'price-item-types', labelKey: 'stgPriceItemTypes', icon: 'fa-box', tab: null },
      { kind: 'leaf', id: 'price-sold-items', labelKey: 'stgPriceSoldItems', icon: 'fa-receipt', tab: null },
      { kind: 'leaf', id: 'price-packages', labelKey: 'stgPricePackages', icon: 'fa-box-open', tab: null },
      { kind: 'leaf', id: 'price-package-groups', labelKey: 'stgPricePackageGroups', icon: 'fa-boxes', tab: null },
      { kind: 'leaf', id: 'price-code', labelKey: 'stgPriceCode', icon: 'fa-dollar-sign', tab: 'currency' },
      { kind: 'leaf', id: 'price-inquiry', labelKey: 'stgPriceInquiry', icon: 'fa-search-dollar', tab: null },
    ],
  },
  {
    kind: 'section',
    id: 'external',
    labelKey: 'navSettingsExternal',
    icon: 'fa-link',
    children: [
      { kind: 'leaf', id: 'ext-shomoos', labelKey: 'stgExtShomoosLink', icon: 'fa-link', tab: null },
      { kind: 'leaf', id: 'ext-tourism', labelKey: 'stgExtTourismLink', icon: 'fa-link', tab: null },
      { kind: 'leaf', id: 'ext-omani-police', labelKey: 'stgExtOmaniPoliceLink', icon: 'fa-link', tab: null },
      { kind: 'leaf', id: 'ext-general-code', labelKey: 'stgExtGeneralLinkCode', icon: 'fa-link', tab: null },
      { kind: 'leaf', id: 'ext-service-logs', labelKey: 'stgExtServiceLogs', icon: 'fa-link', tab: null },
      { kind: 'leaf', id: 'ext-channels', labelKey: 'stgExtChannels', icon: 'fa-plug', tab: null },
      { kind: 'leaf', id: 'ext-tech-solution', labelKey: 'stgExtTechSolutionLink', icon: 'fa-link', tab: null },
      { kind: 'leaf', id: 'ext-shomoos-tourism-sync', labelKey: 'stgExtShomoosTourismSync', icon: 'fa-link', tab: null },
      { kind: 'leaf', id: 'ext-payment-gateway', labelKey: 'stgExtPaymentGateway', icon: 'fa-credit-card', tab: null },
      { kind: 'leaf', id: 'ext-accounting-link', labelKey: 'stgExtAccountingLink', icon: 'fa-project-diagram', tab: null },
    ],
  },
  {
    kind: 'section',
    id: 'users',
    labelKey: 'navSettingsUsers',
    icon: 'svg-user-plus',
    children: [
      { kind: 'leaf', id: 'usr-groups', labelKey: 'stgUsrGroups', icon: 'fa-users-cog', tab: null, requiresUsers: true },
      { kind: 'leaf', id: 'usr-users', labelKey: 'stgUsrUsers', icon: 'fa-user', tab: 'users', requiresUsers: true },
      { kind: 'leaf', id: 'usr-permissions', labelKey: 'stgUsrPermissions', icon: 'fa-user-shield', tab: null, requiresUsers: true },
      { kind: 'leaf', id: 'usr-audit-logs', labelKey: 'stgUsrAuditLogs', icon: 'fa-clipboard-list', tab: null, requiresUsers: true },
    ],
  },
];

export function settingsNavSectionForTab(tab: string): string | null {
  for (const entry of SETTINGS_PAGE_NAV) {
    if (entry.kind !== 'section') {
      continue;
    }
    if (entry.children.some((child) => child.tab === tab)) {
      return entry.id;
    }
  }
  return null;
}

export interface SettingsSidebarNavSubgroup {
  kind: 'subgroup';
  id: string;
  labelKey: string;
  icon: string;
  children: ReadonlyArray<SidebarNavItem>;
}

export type SettingsSidebarNavEntry = SidebarNavItem | SettingsSidebarNavSubgroup;

export function isSettingsSidebarNavSubgroup(
  entry: SettingsSidebarNavEntry,
): entry is SettingsSidebarNavSubgroup {
  return (entry as SettingsSidebarNavSubgroup).kind === 'subgroup';
}

const settingsSubQueryExact = { exact: true, queryParams: 'exact' as const };
const settingsSubExact = { exact: true, queryParams: 'ignored' as const };

function settingsLeafToSidebarItem(leaf: SettingsPageNavLeaf): SidebarNavItem {
  return {
    path: '/settings',
    labelKey: leaf.labelKey,
    icon: leaf.icon,
    queryParams: leaf.tab ? { tab: leaf.tab, nav: leaf.id } : { tab: 'page', nav: leaf.id },
    linkActive: settingsSubQueryExact,
  };
}

export function findSettingsNavLeaf(navId: string | null | undefined): SettingsPageNavLeaf | null {
  if (!navId) {
    return null;
  }
  const resolvedNavId =
    navId === 'uiTranslationDashboard' ? 'uiTranslation' : navId;
  for (const entry of SETTINGS_PAGE_NAV) {
    if (entry.kind === 'leaf' && entry.id === resolvedNavId) {
      return entry;
    }
    if (entry.kind === 'section') {
      const match = entry.children.find((child) => child.id === resolvedNavId);
      if (match) {
        return match;
      }
    }
  }
  return null;
}

export function settingsNavSectionIdForNav(navId: string): string | null {
  for (const entry of SETTINGS_PAGE_NAV) {
    if (entry.kind === 'section' && entry.children.some((child) => child.id === navId)) {
      return entry.id;
    }
  }
  return null;
}

function buildSettingsSidebarNavEntries(): SettingsSidebarNavEntry[] {
  const entries: SettingsSidebarNavEntry[] = [];
  for (const entry of SETTINGS_PAGE_NAV) {
    if (entry.kind === 'leaf') {
      entries.push(settingsLeafToSidebarItem(entry));
      continue;
    }
    entries.push({
      kind: 'subgroup',
      id: entry.id,
      labelKey: entry.labelKey,
      icon: entry.icon,
      children: entry.children.map(settingsLeafToSidebarItem),
    });
  }
  return entries;
}

export const SETTINGS_SIDEBAR_NAV_ENTRIES: ReadonlyArray<SettingsSidebarNavEntry> =
  buildSettingsSidebarNavEntries();

export function flattenSettingsSidebarNavLabelKeys(
  entries: ReadonlyArray<SettingsSidebarNavEntry> = SETTINGS_SIDEBAR_NAV_ENTRIES,
): string[] {
  const keys: string[] = [];
  for (const entry of entries) {
    if (isSettingsSidebarNavSubgroup(entry)) {
      keys.push(entry.labelKey, ...entry.children.map((child) => child.labelKey));
    } else {
      keys.push(entry.labelKey);
    }
  }
  return keys;
}

export function flattenSettingsSidebarNavItems(
  entries: ReadonlyArray<SettingsSidebarNavEntry> = SETTINGS_SIDEBAR_NAV_ENTRIES,
): SidebarNavItem[] {
  const items: SidebarNavItem[] = [];
  for (const entry of entries) {
    if (isSettingsSidebarNavSubgroup(entry)) {
      items.push(...entry.children);
    } else {
      items.push(entry);
    }
  }
  return items;
}

export const SETTINGS_ROOT_SIDEBAR_KEY = 'settings';

const SETTINGS_SIDEBAR_PATH_MAP = buildSettingsSidebarNavPathMap();

function buildSettingsSidebarNavPathMap(): ReadonlyMap<string, readonly string[]> {
  const map = new Map<string, readonly string[]>();
  map.set(SETTINGS_ROOT_SIDEBAR_KEY, [SETTINGS_ROOT_SIDEBAR_KEY]);

  for (const entry of SETTINGS_PAGE_NAV) {
    if (entry.kind === 'leaf') {
      map.set(entry.labelKey, [SETTINGS_ROOT_SIDEBAR_KEY, entry.labelKey]);
      continue;
    }
    map.set(entry.labelKey, [SETTINGS_ROOT_SIDEBAR_KEY, entry.labelKey]);
    for (const child of entry.children) {
      map.set(child.labelKey, [SETTINGS_ROOT_SIDEBAR_KEY, entry.labelKey, child.labelKey]);
    }
  }
  return map;
}

/** مسار مفاتيح القائمة من الجذر إلى العنصر (مثل: settings → navSettingsSystemSetup → stgSysGeneralCodings) */
export function settingsSidebarNavPathKeys(labelKey: string): readonly string[] {
  return SETTINGS_SIDEBAR_PATH_MAP.get(labelKey) ?? [SETTINGS_ROOT_SIDEBAR_KEY, labelKey];
}
