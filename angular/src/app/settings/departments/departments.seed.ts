export interface DepartmentRowDto {
  id: number;
  code: string;
  name: string;
  foreignName?: string | null;
  description?: string | null;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — الأقسام */
export const DEPARTMENTS_SEED: DepartmentRowDto[] = [
  { id: 1, code: 'FO', name: 'الإستقبال', foreignName: 'الإستقبال' },
  { id: 2, code: 'HK', name: 'الإشراف الداخلي', foreignName: 'الإشراف الداخلي' },
  { id: 3, code: 'BO', name: 'الحسابات', foreignName: 'الحسابات' },
];
