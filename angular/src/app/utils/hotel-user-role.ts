import { isSystemOwnerSession } from './hotel-system-owner.util';

export const HOTEL_USER_ROLE = {
  Manager: 'manager',
  Accountant: 'accountant',
  Cashier: 'cashier',
  Regular: 'user',
} as const;

export type HotelUserRole = (typeof HOTEL_USER_ROLE)[keyof typeof HOTEL_USER_ROLE];

export const HOTEL_USER_ROLE_OPTIONS: ReadonlyArray<{
  value: HotelUserRole;
  labelKey: string;
}> = [
  { value: HOTEL_USER_ROLE.Manager, labelKey: 'usersRoleManager' },
  { value: HOTEL_USER_ROLE.Accountant, labelKey: 'usersRoleAccountant' },
  { value: HOTEL_USER_ROLE.Cashier, labelKey: 'usersRoleCashier' },
  { value: HOTEL_USER_ROLE.Regular, labelKey: 'usersRoleRegular' },
];

export function normalizeHotelUserRole(role: string | null | undefined): HotelUserRole {
  const v = (role ?? '').trim().toLowerCase();
  if (v === HOTEL_USER_ROLE.Manager) return HOTEL_USER_ROLE.Manager;
  if (v === HOTEL_USER_ROLE.Accountant) return HOTEL_USER_ROLE.Accountant;
  if (v === HOTEL_USER_ROLE.Cashier) return HOTEL_USER_ROLE.Cashier;
  return HOTEL_USER_ROLE.Regular;
}

export function canManageHotelUsers(
  role: string | null | undefined,
  options?: { denyUserManagement?: boolean; isSystemOwner?: boolean } | null,
): boolean {
  if (isSystemOwnerSession(options ?? null)) {
    return true;
  }
  if (options?.denyUserManagement === true) {
    return false;
  }
  return normalizeHotelUserRole(role) === HOTEL_USER_ROLE.Manager;
}

/** إضافة / تعديل / حذف في واجهة الإعدادات — للمدير فقط */
export function canManageSettings(
  role: string | null | undefined,
  options?: { isSystemOwner?: boolean } | null,
): boolean {
  if (options?.isSystemOwner === true) {
    return true;
  }
  return normalizeHotelUserRole(role) === HOTEL_USER_ROLE.Manager;
}
