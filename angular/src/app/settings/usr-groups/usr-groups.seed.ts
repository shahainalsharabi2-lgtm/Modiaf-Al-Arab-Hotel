export interface UsrGroupRowDto {
  id: number;
  name: string;
  isDefault: boolean;
  isGeneral: boolean;
}

export interface UsrGroupFormDto {
  id: number | null;
  name: string;
  isDefault: boolean;
  isGeneral: boolean;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — مجموعات المستخدمين */
export const USR_GROUPS_SEED: UsrGroupRowDto[] = [
  { id: 1, name: 'admin', isDefault: false, isGeneral: true },
  { id: 2, name: 'Back Office', isDefault: false, isGeneral: false },
  { id: 3, name: 'Front Desk', isDefault: false, isGeneral: false },
  { id: 4, name: 'Housekeeping', isDefault: false, isGeneral: false },
  { id: 5, name: 'Night Auditor', isDefault: false, isGeneral: false },
  { id: 6, name: 'Reservation', isDefault: false, isGeneral: false },
  { id: 7, name: 'Staff Application', isDefault: false, isGeneral: false },
  { id: 8, name: 'الاستقبال', isDefault: false, isGeneral: true },
  { id: 9, name: 'منع إدارة المستخدمين', isDefault: true, isGeneral: true },
];

export function emptyUsrGroupForm(): UsrGroupFormDto {
  return {
    id: null,
    name: '',
    isDefault: false,
    isGeneral: true,
  };
}

export function usrGroupRowToForm(row: UsrGroupRowDto): UsrGroupFormDto {
  return {
    id: row.id,
    name: row.name,
    isDefault: row.isDefault,
    isGeneral: row.isGeneral,
  };
}
