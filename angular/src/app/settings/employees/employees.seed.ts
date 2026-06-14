export interface EmployeeRowDto {
  id: number;
  name: string;
  mobile: string;
  departmentId: number;
  isActive: boolean;
  isAvailable: boolean;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — الموظفين */
export const EMPLOYEES_SEED: EmployeeRowDto[] = [
  { id: 1, name: 'عاصم الشريفي', mobile: '454', departmentId: 28, isActive: true, isAvailable: true },
  { id: 2, name: 'تامر', mobile: '01018812563', departmentId: 30, isActive: false, isAvailable: false },
  { id: 3, name: 'حسن عبدالله', mobile: '0552232476', departmentId: 30, isActive: true, isAvailable: false },
];
