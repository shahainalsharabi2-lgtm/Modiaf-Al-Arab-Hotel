export interface CurrencyRowDto {
  id: number;
  code: string;
  name: string;
  foreignName?: string | null;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — العملات */
export const CURRENCIES_SEED: CurrencyRowDto[] = [
  { id: 1, code: 'SAR', name: 'ريال سعودي', foreignName: 'Saudi Riyal' },
  { id: 2, code: 'USD', name: 'الدولار الأمريكي', foreignName: 'US Dollar' },
  { id: 3, code: 'YER', name: 'ريال يمني', foreignName: 'Yemeni Rial' },
  { id: 4, code: 'EGP', name: 'الجنيه المصري', foreignName: 'Egyptian Pound' },
];
