export interface AccountingEntryRowDto {
  id: number;
  entryDate: string;
  description: string;
  debit: number;
  credit: number;
  status: 'draft' | 'posted';
}

/** بيانات ثابتة — القيود المحاسبية (فارغة كما في Ultimate) */
export const ACCOUNTING_ENTRIES_SEED: AccountingEntryRowDto[] = [];

export const ACCOUNTING_ENTRIES_WARNINGS = [
  'warnCashAccountMissing',
  'warnBankAccountMissing',
  'warnCashAccountMissing2',
  'warnBankAccountMissing2',
  'warnBankAccountMissing6',
] as const;
