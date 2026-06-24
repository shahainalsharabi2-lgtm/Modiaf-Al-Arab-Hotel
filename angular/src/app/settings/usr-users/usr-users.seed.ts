import {
  HOTEL_USER_ROLE,
  normalizeHotelUserRole,
  type HotelUserRole,
} from '../../utils/hotel-user-role';
import {
  USR_GROUP_DENY_USER_MGMT_ID,
  isSystemOwnerUsername,
} from '../../utils/hotel-system-owner.util';
import { DEFAULT_LANDING_PAGE_PATH } from '../../utils/landing-page-path.util';
import {
  TRANSLATOR_UI_PATH,
  isTranslatorLandingPath,
} from '../../utils/landing-page-access.util';
import type { CreateUpdateHotelAppUserDto, HotelAppUserDto } from '../../services/hotel-app-user.service';
import type { HotelUserPageAccessEntry } from '../../services/hotel-user-page-access.service';

export type UsrPageAccessMode = 'all' | 'translator';

export interface UsrUserRowDto {
  id: number;
  firstName: string;
  surname: string;
  userName: string;
  mobile: string;
  email: string;
  isActive: boolean;
  defaultHotelId: number;
  groupIds: number[];
  pageAccessMode: UsrPageAccessMode;
  landingPagePath: string;
}

export interface UsrUserFormDto {
  id: number | null;
  firstName: string;
  surname: string;
  userName: string;
  mobile: string;
  email: string;
  password: string;
  isActive: boolean;
  defaultHotelId: number | null;
  groupIds: number[];
  pageAccessMode: UsrPageAccessMode;
  landingPagePath: string;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — المستخدمين */
export const USR_USERS_SEED: UsrUserRowDto[] = [
  {
    id: 1,
    firstName: 'admin',
    surname: 'Al_shrabi',
    userName: 'admin',
    mobile: '',
    email: 'admin1@admin.com',
    isActive: true,
    defaultHotelId: 1,
    groupIds: [1],
    pageAccessMode: 'all',
    landingPagePath: DEFAULT_LANDING_PAGE_PATH,
  },
  {
    id: 2,
    firstName: 'محمد',
    surname: '',
    userName: 'محمد',
    mobile: '0555123456',
    email: 'mohammed@example.com',
    isActive: true,
    defaultHotelId: 1,
    groupIds: [3],
    pageAccessMode: 'all',
    landingPagePath: DEFAULT_LANDING_PAGE_PATH,
  },
  {
    id: 3,
    firstName: 'وليد',
    surname: 'فكري',
    userName: 'وليد',
    mobile: '0509876543',
    email: 'waleed@example.com',
    isActive: true,
    defaultHotelId: 1,
    groupIds: [8],
    pageAccessMode: 'all',
    landingPagePath: DEFAULT_LANDING_PAGE_PATH,
  },
  {
    id: 4,
    firstName: 'Ahmed',
    surname: 'Ali',
    userName: 'ahmed',
    mobile: '0544332211',
    email: 'ahmed@example.com',
    isActive: true,
    defaultHotelId: 10,
    groupIds: [2, 6],
    pageAccessMode: 'all',
    landingPagePath: DEFAULT_LANDING_PAGE_PATH,
  },
  {
    id: 5,
    firstName: 'سارة',
    surname: 'العتيبي',
    userName: 'sara',
    mobile: '0566778899',
    email: 'sara@example.com',
    isActive: false,
    defaultHotelId: 1,
    groupIds: [4],
    pageAccessMode: 'all',
    landingPagePath: DEFAULT_LANDING_PAGE_PATH,
  },
];

export function emptyUsrUserForm(defaultHotelId: number | null = 1): UsrUserFormDto {
  return {
    id: null,
    firstName: '',
    surname: '',
    userName: '',
    mobile: '',
    email: '',
    password: '',
    isActive: true,
    defaultHotelId,
    groupIds: [USR_GROUP_DENY_USER_MGMT_ID],
    pageAccessMode: 'all',
    landingPagePath: DEFAULT_LANDING_PAGE_PATH,
  };
}

export function usrUserRowToForm(row: UsrUserRowDto): UsrUserFormDto {
  return {
    id: row.id,
    firstName: row.firstName,
    surname: row.surname,
    userName: row.userName,
    mobile: row.mobile,
    email: row.email,
    password: '********',
    isActive: row.isActive,
    defaultHotelId: row.defaultHotelId,
    groupIds: [...row.groupIds],
    pageAccessMode: row.pageAccessMode,
    landingPagePath: row.landingPagePath,
  };
}

export function displayUsrUserName(row: Pick<UsrUserRowDto, 'firstName' | 'surname'>): string {
  return [row.firstName, row.surname].filter(Boolean).join(' ').trim();
}

export function roleToGroupIds(role: string | null | undefined, denyUserManagement = true): number[] {
  const normalized = normalizeHotelUserRole(role);
  const groups: number[] = [];
  if (normalized === HOTEL_USER_ROLE.Manager) {
    groups.push(1);
  } else if (normalized === HOTEL_USER_ROLE.Accountant) {
    groups.push(2);
  } else if (normalized === HOTEL_USER_ROLE.Cashier) {
    groups.push(3, 8);
  }
  if (denyUserManagement !== false) {
    groups.push(USR_GROUP_DENY_USER_MGMT_ID);
  }
  return groups;
}

export function groupIdsToRole(groupIds: number[]): HotelUserRole {
  if (groupIds.includes(1)) {
    return HOTEL_USER_ROLE.Manager;
  }
  if (groupIds.includes(3) || groupIds.includes(8)) {
    return HOTEL_USER_ROLE.Cashier;
  }
  if (groupIds.includes(2)) {
    return HOTEL_USER_ROLE.Accountant;
  }
  return HOTEL_USER_ROLE.Regular;
}

function resolvePageAccess(
  allowNavigation: boolean,
  landingPagePath: string,
): Pick<UsrUserRowDto, 'pageAccessMode' | 'landingPagePath'> {
  if (allowNavigation !== false) {
    return { pageAccessMode: 'all', landingPagePath: DEFAULT_LANDING_PAGE_PATH };
  }
  if (isTranslatorLandingPath(landingPagePath)) {
    return { pageAccessMode: 'translator', landingPagePath: TRANSLATOR_UI_PATH };
  }
  return { pageAccessMode: 'all', landingPagePath: DEFAULT_LANDING_PAGE_PATH };
}

export function apiUserToRow(
  dto: HotelAppUserDto,
  storedAccess?: HotelUserPageAccessEntry | null,
): UsrUserRowDto {
  const apiHasAccess =
    Object.prototype.hasOwnProperty.call(dto, 'allowNavigation') ||
    Object.prototype.hasOwnProperty.call(dto, 'landingPagePath');
  const allowNavigation = apiHasAccess
    ? dto.allowNavigation !== false
    : storedAccess
      ? storedAccess.allowNavigation !== false
      : true;
  const landing = apiHasAccess
    ? dto.landingPagePath ?? DEFAULT_LANDING_PAGE_PATH
    : storedAccess
      ? storedAccess.landingPagePath
      : DEFAULT_LANDING_PAGE_PATH;
  const access = resolvePageAccess(allowNavigation, landing);
  return {
    id: dto.id,
    firstName: dto.firstName,
    surname: dto.lastName,
    userName: dto.userName,
    mobile: dto.phoneNumber,
    email: dto.email,
    isActive: true,
    defaultHotelId: 1,
    groupIds: roleToGroupIds(dto.role, dto.denyUserManagement !== false),
    ...access,
  };
}

export function rowToApiInput(
  form: UsrUserFormDto,
  retainedPassword = '',
): CreateUpdateHotelAppUserDto {
  const password = form.password.trim();
  const keepPassword = password === '' || password === '********';
  const isTranslator = form.pageAccessMode === 'translator';
  const effectivePassword = keepPassword ? retainedPassword : password;
  return {
    firstName: form.firstName.trim(),
    lastName: form.surname.trim() || form.firstName.trim() || '-',
    userName: form.userName.trim(),
    email: form.email.trim(),
    phoneNumber: form.mobile.trim(),
    password: effectivePassword,
    role: groupIdsToRole(form.groupIds),
    allowNavigation: !isTranslator,
    landingPagePath: isTranslator ? TRANSLATOR_UI_PATH : DEFAULT_LANDING_PAGE_PATH,
    denyUserManagement: form.groupIds.includes(USR_GROUP_DENY_USER_MGMT_ID),
  };
}
