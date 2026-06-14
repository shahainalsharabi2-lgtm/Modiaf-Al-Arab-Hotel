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
  };
}

export function displayUsrUserName(row: Pick<UsrUserRowDto, 'firstName' | 'surname'>): string {
  return [row.firstName, row.surname].filter(Boolean).join(' ').trim();
}
