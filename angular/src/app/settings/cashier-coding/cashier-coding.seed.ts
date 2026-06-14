export interface CashierRowDto {
  id: number;
  name: string;
  foreignName: string;
  code: string;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — ترميز الكاشير */
export const CASHIERS_SEED: CashierRowDto[] = [
  { id: 1, name: 'الكاشير الرئيسي', foreignName: 'Main Cashier', code: 'MC' },
  { id: 2, name: 'admin', foreignName: 'Admin Cashier', code: 'ADM' },
  { id: 3, name: 'emp1', foreignName: 'emp1', code: 'emp1' },
  { id: 4, name: 'emp2', foreignName: 'emp2', code: 'emp2' },
  { id: 5, name: 'test', foreignName: 'test', code: 'test' },
  { id: 6, name: 't', foreignName: 't', code: 't' },
  { id: 7, name: 'test555', foreignName: 'test555', code: 'test555' },
];
