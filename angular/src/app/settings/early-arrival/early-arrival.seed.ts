export interface EarlyArrivalRowDto {
  id: number;
  policyType: string;
  rentPercentage: number;
  gracePeriodHours: number;
  accountCode: string;
  accountName: string;
  isActive: boolean;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — إعداد الوصول المبكر */
export const EARLY_ARRIVAL_SEED: EarlyArrivalRowDto[] = [
  {
    id: 1,
    policyType: 'وصول مبكر',
    rentPercentage: 2,
    gracePeriodHours: 1,
    accountCode: '1001',
    accountName: 'إيراد غرف',
    isActive: true,
  },
];
