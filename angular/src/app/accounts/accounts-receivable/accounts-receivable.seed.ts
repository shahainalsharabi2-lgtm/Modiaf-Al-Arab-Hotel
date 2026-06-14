export interface AccountsReceivableRowDto {
  id: number;
  code: string;
  name: string;
  foreignName: string;
  accountNumber: string;
  countryCode: string;
  cityCode: string;
  mobile: string;
  isMain: boolean;
  isActive: boolean;
  accountType: 'guest' | 'company' | 'agent';
  balance: number;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — الذمم المدينة (نزلاء) */
export const ACCOUNTS_RECEIVABLE_SEED: AccountsReceivableRowDto[] = [
  {
    id: 1,
    code: '4',
    name: 'نزيه خالد الاكحلي',
    foreignName: '',
    accountNumber: '4',
    countryCode: 'SA',
    cityCode: 'SA',
    mobile: '',
    isMain: true,
    isActive: true,
    accountType: 'guest',
    balance: 16232,
  },
];
