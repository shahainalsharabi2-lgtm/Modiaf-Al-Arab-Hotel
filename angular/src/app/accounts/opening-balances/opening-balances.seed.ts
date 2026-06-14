export interface OpeningBalanceRowDto {
  id: number;
  code: string;
  name: string;
  credit: number;
  debit: number;
  reference: string;
  hasOpeningBalance: boolean;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — الأرصدة الافتتاحية */
export const OPENING_BALANCES_SEED: OpeningBalanceRowDto[] = [
  { id: 1, code: '1', name: 'الاهلية', credit: 0, debit: 0, reference: '', hasOpeningBalance: false },
  { id: 2, code: '2', name: 'نزيه', credit: 0, debit: 0, reference: '', hasOpeningBalance: false },
  { id: 3, code: '3', name: 'شركه الاكحلي', credit: 0, debit: 0, reference: '', hasOpeningBalance: false },
  { id: 4, code: '4', name: 'نزيه خالد الاكحلي', credit: 0, debit: 0, reference: '', hasOpeningBalance: false },
];
