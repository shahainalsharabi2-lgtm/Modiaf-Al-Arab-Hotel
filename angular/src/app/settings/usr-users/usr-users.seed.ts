import {
  HOTEL_USER_ROLE,
  normalizeHotelUserRole,
  type HotelUserRole,
} from '../../utils/hotel-user-role';
import type { CreateUpdateHotelAppUserDto, HotelAppUserDto } from '../../services/hotel-app-user.service';

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
  allowNavigation: boolean;
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
  allowNavigation: boolean;
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
    allowNavigation: true,
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
    allowNavigation: true,
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
    allowNavigation: true,
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
    allowNavigation: true,
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
    allowNavigation: true,
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
    groupIds: [],
    allowNavigation: true,
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
    allowNavigation: row.allowNavigation,
  };
}

export function displayUsrUserName(row: Pick<UsrUserRowDto, 'firstName' | 'surname'>): string {
  return [row.firstName, row.surname].filter(Boolean).join(' ').trim();
}

export function roleToGroupIds(role: string | null | undefined): number[] {
  const normalized = normalizeHotelUserRole(role);
  if (normalized === HOTEL_USER_ROLE.Manager) {
    return [1];
  }
  if (normalized === HOTEL_USER_ROLE.Accountant) {
    return [2];
  }
  if (normalized === HOTEL_USER_ROLE.Cashier) {
    return [3];
  }
  return [2];
}

export function groupIdsToRole(groupIds: readonly number[]): HotelUserRole {
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

export function apiUserToRow(dto: HotelAppUserDto): UsrUserRowDto {
  return {
    id: dto.id,
    firstName: dto.firstName,
    surname: dto.lastName,
    userName: dto.userName,
    mobile: dto.phoneNumber,
    email: dto.email,
    isActive: true,
    defaultHotelId: 1,
    groupIds: roleToGroupIds(dto.role),
    allowNavigation: dto.allowNavigation !== false,
  };
}

export function rowToApiInput(form: UsrUserFormDto): CreateUpdateHotelAppUserDto {
  const password = form.password.trim();
  const keepPassword = password === '' || password === '********';
  return {
    firstName: form.firstName.trim(),
    lastName: form.surname.trim(),
    userName: form.userName.trim(),
    email: form.email.trim(),
    phoneNumber: form.mobile.trim(),
    password: keepPassword ? '' : password,
    role: groupIdsToRole(form.groupIds),
    allowNavigation: form.allowNavigation !== false,
  };
}
