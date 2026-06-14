export type AccountCodingTab = 'mainGroups' | 'subGroups' | 'accounts';

export interface AccountCodingRowDto {
  id: number;
  code: number;
  name: string;
  foreignName: string;
  type: number;
  sortOrder: number;
}

/** المجموعة الرئيسية — بيانات ثابتة مطابقة لشاشة Ultimate */
export const ACCOUNT_MAIN_GROUPS_SEED: AccountCodingRowDto[] = [
  { id: 1, code: 1, name: 'إيرادات', foreignName: 'Revenues', type: 1, sortOrder: 1 },
  { id: 2, code: 5, name: 'مدفوعات - قبض', foreignName: 'Payments- Credit', type: 2, sortOrder: 2 },
  { id: 3, code: 6, name: 'دفوعات - صرف', foreignName: 'PaidOuts/Refunds - Debit', type: 3, sortOrder: 3 },
  { id: 4, code: 7, name: 'التزامات', foreignName: 'Liabilities', type: 4, sortOrder: 4 },
  { id: 5, code: 8, name: 'ضرائب', foreignName: 'Taxes', type: 5, sortOrder: 5 },
  { id: 6, code: 9, name: 'تغليف', foreignName: 'Wrapper', type: 5, sortOrder: 6 },
];

export const ACCOUNT_SUB_GROUPS_SEED: AccountCodingRowDto[] = [];

export const ACCOUNT_ACCOUNTS_SEED: AccountCodingRowDto[] = [];
