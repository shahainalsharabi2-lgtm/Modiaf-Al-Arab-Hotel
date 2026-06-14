export interface KeyboardShortcutEntry {
  id: string;
  /** أجزاء العرض: f2 أو Ctrl + Alt + r */
  keyParts: string[];
  labelKey: string;
  path: string;
  queryParams?: Record<string, string>;
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcutEntry[] = [
  {
    id: 'home',
    keyParts: ['f2'],
    labelKey: 'shortcutHome',
    path: '/dashboard',
  },
  {
    id: 'bookings',
    keyParts: ['Ctrl', 'Alt', 'r'],
    labelKey: 'shortcutBookings',
    path: '/front-desk',
  },
  {
    id: 'pricing',
    keyParts: ['Ctrl', 'Alt', 'q'],
    labelKey: 'shortcutPricing',
    path: '/nav/settings/navSettingsPricing',
  },
  {
    id: 'roomSchedule',
    keyParts: ['Ctrl', 'Alt', 'b'],
    labelKey: 'shortcutRoomSchedule',
    path: '/rooms',
  },
  {
    id: 'guests',
    keyParts: ['Ctrl', 'Alt', 'p'],
    labelKey: 'shortcutGuests',
    path: '/crm/individuals',
  },
  {
    id: 'companies',
    keyParts: ['Ctrl', 'Alt', 'c'],
    labelKey: 'shortcutCompanies',
    path: '/crm/companies',
  },
  {
    id: 'users',
    keyParts: ['Ctrl', 'Alt', 'u'],
    labelKey: 'shortcutUsers',
    path: '/settings',
    queryParams: { tab: 'users' },
  },
  {
    id: 'groups',
    keyParts: ['Ctrl', 'Alt', 'g'],
    labelKey: 'shortcutGroups',
    path: '/nav/bookings/navGroupBooking',
  },
  {
    id: 'allotment',
    keyParts: ['Ctrl', 'Alt', 'a'],
    labelKey: 'shortcutAllotment',
    path: '/nav/bookings/navAllotmentContracts',
  },
];
