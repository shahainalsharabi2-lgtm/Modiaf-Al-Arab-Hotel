import {
  SETTINGS_PAGE_NAV,
  settingsSidebarNavPathKeys,
  type SettingsPageNavEntry,
  type SettingsPageNavLeaf,
  type SettingsPageNavSection,
} from './settings-page-nav.config';

export interface SettingsUiTranslationRow {
  screenId: string;
  key: string;
}

export interface SettingsUiTranslationPanel {
  navId: string;
  labelKey: string;
  pathKeys: readonly string[];
  sectionId: string | null;
  rows: readonly SettingsUiTranslationRow[];
}

const SETTINGS_TAB_KEY_FILTERS: Readonly<Record<string, (key: string) => boolean>> = {
  uiTranslations: (key) => key.startsWith('uiTranslations') || key === 'settingsMenuUiTranslation',
  general: (key) =>
    key.startsWith('general') ||
    key.startsWith('field') ||
    key.startsWith('ph') ||
    key.startsWith('hint') ||
    key.startsWith('tabGeneral') ||
    key.startsWith('tabHotel') ||
    key.startsWith('login') ||
    key === 'sidebarTitle' ||
    key === 'saveChanges' ||
    key.startsWith('settingsRead') ||
    key.startsWith('settingsManager') ||
    key.startsWith('settingsConfirm') ||
    key.startsWith('confirmPassword') ||
    key.startsWith('toggle') ||
    key === 'wrongPassword' ||
    key === 'passwordPh' ||
    key === 'loginBtn' ||
    key.startsWith('choose') ||
    key.startsWith('remove') ||
    key === 'saveSuccess' ||
    key === 'loginFooter' ||
    key === 'editBtn' ||
    key === 'deleteBtn' ||
    key === 'cancelBtn' ||
    key === 'saveEditsBtn',
  layout: (key) =>
    key.startsWith('layout') ||
    key.startsWith('room') ||
    key.startsWith('floor') ||
    key.startsWith('features') ||
    key.startsWith('tabLayout') ||
    key.startsWith('tabFloors') ||
    key.startsWith('tabRooms') ||
    key === 'addFloor' ||
    key === 'addRoom' ||
    key.startsWith('stat') ||
    key.startsWith('suspend') ||
    key.startsWith('statusPicker') ||
    key.startsWith('quickStatus') ||
    key === 'totalRooms' ||
    key === 'capacityLabel' ||
    key === 'floorRoomsCountTitle',
  payments: (key) => key.startsWith('payments') || key.startsWith('tabPayment'),
  identities: (key) => key.startsWith('identities') || key.startsWith('tabIdentit'),
  guests: (key) =>
    key.startsWith('guests') ||
    key.startsWith('guestCol') ||
    (key.startsWith('guest') && key !== 'guestStatusLabel') ||
    key === 'statusActiveLabel' ||
    key === 'statusCheckedOutLabel' ||
    key === 'statusCancelledLabel',
  currency: (key) => key.startsWith('currency') || key === 'tabCurrency',
  arabicLocale: (key) =>
    key.startsWith('arabic') ||
    key.startsWith('tabArabic') ||
    key.startsWith('localeAr') ||
    key.startsWith('localeEn') ||
    key.startsWith('localeFr') ||
    key.startsWith('localeTr') ||
    key.startsWith('localeZh') ||
    key.startsWith('localeId'),
  users: (key) => key.startsWith('users') || key.startsWith('tabUser') || key.startsWith('usrUsers'),
  translations: (key) => key.startsWith('translations') || key === 'tabTranslations',
};

/** ربط صفحات الإعدادات (nav id) بمفاتيح screenCopy.settings */
const SETTINGS_PAGE_NAV_KEY_PREFIXES: Readonly<Record<string, string>> = {
  uiTranslation: 'uiTranslations',
  'sys-hotel-chains': 'hotelChains',
  'sys-credit-cards': 'creditCardTypes',
  'sys-hotels': 'general',
  'sys-sequence': 'sequence',
  'sys-facilities': 'facilities',
  'sys-landmarks': 'landmarks',
  'sys-geo': 'geo',
  'sys-payment-methods': 'paymentMethods',
  'sys-languages': 'languages',
  'sys-agent-commissions': 'agentCommissions',
  'sys-currencies': 'currencies',
  'sys-departments': 'departments',
  'sys-system-settings': 'systemSettings',
  'sys-early-arrival': 'earlyArrival',
  'sys-employees': 'employees',
  'inp-booking-types': 'bookingTypes',
  'inp-account-coding': 'accountCoding',
  'inp-routing-codes': 'routingCodes',
  'inp-market-codes': 'marketCodes',
  'inp-booking-sources': 'bookingSources',
  'inp-market-categories': 'marketCategories',
  'inp-bank-coding': 'bankCoding',
  'inp-cashier-coding': 'cashierCoding',
  'inp-confirmation-messages': 'confirmationMessages',
  'inp-advance-payment-policies': 'advancePaymentPolicies',
  'room-floors': 'roomFloors',
  'room-building-groups': 'buildingGroups',
  'room-buildings': 'roomBuildings',
  'room-types': 'roomTypes',
  'room-rooms': 'roomRooms',
  'tax-brackets': 'taxBrackets',
  'tax-types': 'taxTypes',
  'tax-classification': 'taxClassification',
  'tax-account-link': 'taxAccountLink',
  'price-seasons': 'priceSeasons',
  'price-categories': 'priceCategories',
  'price-child-ages': 'priceChildAges',
  'price-item-types': 'priceItemTypes',
  'price-sold-items': 'priceSoldItems',
  'price-packages': 'pricePackages',
  'price-package-groups': 'pricePackageGroups',
  'price-code': 'priceCode',
  'price-inquiry': 'priceInquiry',
  'usr-groups': 'usrGroups',
  'usr-users': 'usrUsers',
  'usr-permissions': 'usrPerm',
  'usr-audit-logs': 'usrAudit',
  'ext-shomoos': 'extShomoos',
  'ext-tourism': 'extTourism',
  'ext-omani-police': 'extOmaniPolice',
};

/** مفاتيح لا تُعرض في محرر ترجمة الإعدادات (مثل عناوين عمود الإجراءات). */
const SETTINGS_UI_TRANSLATION_EXCLUDED_KEYS = new Set<string>(['hotelChainsColActions']);

const SETTINGS_PAGE_NAV_KEY_RULES: Readonly<Record<string, (key: string) => boolean>> = {
  'sys-room-booking-statuses': (key) =>
    key.startsWith('roomBookingSettings') && key !== 'roomBookingSettingsTabFilterPerms',
  'sys-room-plan-filter-perms': (key) => key === 'roomBookingSettingsTabFilterPerms',
};

function settingsPageNavKeyPredicate(navId: string): ((key: string) => boolean) | null {
  const rule = SETTINGS_PAGE_NAV_KEY_RULES[navId];
  if (rule) {
    return rule;
  }
  const prefix = SETTINGS_PAGE_NAV_KEY_PREFIXES[navId];
  if (prefix) {
    return (key) => key.startsWith(prefix);
  }
  return null;
}

function allSettingsPageNavLeaves(): SettingsPageNavLeaf[] {
  const leaves: SettingsPageNavLeaf[] = [];
  for (const entry of SETTINGS_PAGE_NAV) {
    if (entry.kind === 'leaf') {
      leaves.push(entry);
      continue;
    }
    leaves.push(...entry.children);
  }
  return leaves;
}

function primaryNavIdForTab(tab: string): string | null {
  for (const entry of SETTINGS_PAGE_NAV) {
    if (entry.kind === 'leaf' && entry.tab === tab) {
      return entry.id;
    }
    if (entry.kind === 'section') {
      for (const child of entry.children) {
        if (child.tab === tab) {
          return child.id;
        }
      }
    }
  }
  return null;
}

function sortedScreenKeys(screenCopy: Record<string, Record<string, string>> | undefined, screenId: string): string[] {
  return Object.keys(screenCopy?.[screenId] ?? {}).sort((a, b) => a.localeCompare(b));
}

function isExcludedSettingsUiTranslationKey(key: string): boolean {
  return SETTINGS_UI_TRANSLATION_EXCLUDED_KEYS.has(key);
}

function rowsForSettingsKeys(
  screenCopy: Record<string, Record<string, string>> | undefined,
  predicate: (key: string) => boolean,
): SettingsUiTranslationRow[] {
  return sortedScreenKeys(screenCopy, 'settings')
    .filter((key) => predicate(key) && !isExcludedSettingsUiTranslationKey(key))
    .map((key) => ({ screenId: 'settings', key }));
}

function rowsForLeaf(
  leaf: SettingsPageNavLeaf,
  screenCopy: Record<string, Record<string, string>> | undefined,
): SettingsUiTranslationRow[] {
  const pagePredicate = settingsPageNavKeyPredicate(leaf.id);
  if (pagePredicate) {
    return rowsForSettingsKeys(screenCopy, pagePredicate);
  }
  if (!leaf.tab) {
    return [];
  }
  if (primaryNavIdForTab(leaf.tab) !== leaf.id) {
    return [];
  }
  if (leaf.tab === 'translations') {
    return sortedScreenKeys(screenCopy, 'generalCodes').map((key) => ({
      screenId: 'generalCodes',
      key,
    }));
  }
  const filter = SETTINGS_TAB_KEY_FILTERS[leaf.tab];
  if (!filter) {
    return [];
  }
  return rowsForSettingsKeys(screenCopy, filter);
}

function collectAssignedSettingsKeys(screenCopy: Record<string, Record<string, string>> | undefined): Set<string> {
  const assigned = new Set<string>();
  for (const leaf of allSettingsPageNavLeaves()) {
    for (const row of rowsForLeaf(leaf, screenCopy)) {
      if (row.screenId === 'settings') {
        assigned.add(row.key);
      }
    }
  }
  return assigned;
}

function sharedSettingsRows(
  screenCopy: Record<string, Record<string, string>> | undefined,
): SettingsUiTranslationRow[] {
  const assigned = collectAssignedSettingsKeys(screenCopy);
  return sortedScreenKeys(screenCopy, 'settings')
    .filter((key) => !assigned.has(key) && !isExcludedSettingsUiTranslationKey(key))
    .map((key) => ({ screenId: 'settings', key }));
}

function panelForLeaf(
  leaf: SettingsPageNavLeaf,
  sectionId: string | null,
  screenCopy: Record<string, Record<string, string>> | undefined,
): SettingsUiTranslationPanel {
  return {
    navId: leaf.id,
    labelKey: leaf.labelKey,
    pathKeys: settingsSidebarNavPathKeys(leaf.labelKey),
    sectionId,
    rows: rowsForLeaf(leaf, screenCopy),
  };
}

export function buildSettingsUiTranslationPanels(
  screenCopy: Record<string, Record<string, string>> | undefined,
): readonly SettingsUiTranslationPanel[] {
  const panels: SettingsUiTranslationPanel[] = [];

  for (const entry of SETTINGS_PAGE_NAV) {
    if (entry.kind === 'leaf') {
      panels.push(panelForLeaf(entry, null, screenCopy));
      continue;
    }
    for (const child of entry.children) {
      panels.push(panelForLeaf(child, entry.id, screenCopy));
    }
  }

  const shared = sharedSettingsRows(screenCopy);
  if (shared.length) {
    panels.push({
      navId: 'settings-shared',
      labelKey: 'uiTranslationsSettingsShared',
      pathKeys: ['settings', 'uiTranslationsSettingsShared'],
      sectionId: null,
      rows: shared,
    });
  }

  const myAccountRows = sortedScreenKeys(screenCopy, 'myAccount').map((key) => ({
    screenId: 'myAccount',
    key,
  }));
  if (myAccountRows.length) {
    panels.push({
      navId: 'my-account',
      labelKey: 'myAccountBtn',
      pathKeys: ['settings', 'myAccountBtn'],
      sectionId: null,
      rows: myAccountRows,
    });
  }

  return panels;
}

export function settingsUiTranslationPanelId(panel: SettingsUiTranslationPanel): string {
  return `settings-panel:${panel.navId}`;
}

export function settingsUiTranslationPanelsForSection(
  panels: readonly SettingsUiTranslationPanel[],
  sectionId: string,
): readonly SettingsUiTranslationPanel[] {
  return panels.filter((panel) => panel.sectionId === sectionId);
}

export function settingsUiTranslationTopLevelPanels(
  panels: readonly SettingsUiTranslationPanel[],
): readonly SettingsUiTranslationPanel[] {
  return panels.filter((panel) => !panel.sectionId);
}

export function settingsUiTranslationSectionEntries(): ReadonlyArray<SettingsPageNavSection> {
  return SETTINGS_PAGE_NAV.filter((entry) => entry.kind === 'section');
}
