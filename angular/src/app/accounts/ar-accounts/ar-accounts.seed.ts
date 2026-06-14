export interface ArAccountRowDto {
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
  accountType: 'company' | 'individual';
  balance: number;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — الحسابات المدينة */
export const AR_ACCOUNTS_SEED: ArAccountRowDto[] = [
  {
    id: 1,
    code: '1',
    name: 'الاهلية',
    foreignName: '',
    accountNumber: '1',
    countryCode: '',
    cityCode: 'SA-1',
    mobile: '',
    isMain: true,
    isActive: true,
    accountType: 'company',
    balance: 0,
  },
  {
    id: 2,
    code: '3',
    name: 'شركه الاحكلي',
    foreignName: 'شركه الاحكلي',
    accountNumber: '3',
    countryCode: '',
    cityCode: 'SA-2',
    mobile: '',
    isMain: true,
    isActive: true,
    accountType: 'company',
    balance: 0,
  },
];
