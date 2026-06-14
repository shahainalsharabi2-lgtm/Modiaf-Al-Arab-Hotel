export interface PricePackageRowDto {
  id: number;
  code: string;
  name: string;
  foreignName: string;
  calculationMethodKey: string;
  calculationRuleKey: string;
}

export interface PricePackagePricingRowDto {
  id: number;
  fromDate: string;
  toDate: string;
  price: string;
}

export interface PricePackagePricingFormDto {
  id: number | null;
  fromDate: string;
  toDate: string;
  price: string;
}

export interface PricePackageFormDto {
  id: number | null;
  code: string;
  name: string;
  foreignName: string;
  description: string;
  meals: boolean;
  calculationMethod: string;
  calculationRule: string;
  revenueAccount: string;
  addedToPriceCode: boolean;
  calculateNextDay: boolean;
  taxInclusive: boolean;
  sellSeparately: boolean;
  printSeparateLine: boolean;
  pricingRows: PricePackagePricingRowDto[];
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — الباقات */
export const PRICE_PACKAGES_SEED: PricePackageRowDto[] = [
  {
    id: 1,
    code: 'ai1',
    name: 'فطور',
    foreignName: '',
    calculationMethodKey: 'everyNightExceptArrival',
    calculationRuleKey: 'perPerson',
  },
  {
    id: 2,
    code: 'bi1',
    name: 'غداء',
    foreignName: '',
    calculationMethodKey: 'everyNightExceptArrival',
    calculationRuleKey: 'perPerson',
  },
  {
    id: 3,
    code: 'ci1',
    name: 'عشاء',
    foreignName: '',
    calculationMethodKey: 'everyNightExceptArrival',
    calculationRuleKey: 'perPerson',
  },
  {
    id: 4,
    code: 'di1',
    name: 'بداية عشاء',
    foreignName: '',
    calculationMethodKey: 'arrivalDay',
    calculationRuleKey: 'perPerson',
  },
  {
    id: 5,
    code: 'ei1',
    name: 'نهاية غداء',
    foreignName: '',
    calculationMethodKey: 'departureNight',
    calculationRuleKey: 'perPerson',
  },
  {
    id: 6,
    code: 'fi1',
    name: 'نهاية فطور',
    foreignName: '',
    calculationMethodKey: 'departureNight',
    calculationRuleKey: 'perPerson',
  },
  {
    id: 7,
    code: 'b121',
    name: 'سباحه',
    foreignName: '',
    calculationMethodKey: 'everyNight',
    calculationRuleKey: 'perPerson',
  },
];

export function emptyPricePackageForm(): PricePackageFormDto {
  return {
    id: null,
    code: '',
    name: '',
    foreignName: '',
    description: '',
    meals: false,
    calculationMethod: 'everyNightExceptArrival',
    calculationRule: 'perPerson',
    revenueAccount: '',
    addedToPriceCode: true,
    calculateNextDay: false,
    taxInclusive: true,
    sellSeparately: false,
    printSeparateLine: false,
    pricingRows: [],
  };
}

export function emptyPricePackagePricingForm(): PricePackagePricingFormDto {
  return {
    id: null,
    fromDate: '2025-11-14',
    toDate: '2026-01-14',
    price: '',
  };
}

export function pricePackageRowToForm(row: PricePackageRowDto): PricePackageFormDto {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    foreignName: row.foreignName,
    description: '',
    meals: false,
    calculationMethod: row.calculationMethodKey,
    calculationRule: row.calculationRuleKey,
    revenueAccount: '',
    addedToPriceCode: true,
    calculateNextDay: false,
    taxInclusive: true,
    sellSeparately: false,
    printSeparateLine: false,
    pricingRows: [],
  };
}

export function formatPackageDate(iso: string): string {
  if (!iso) {
    return '';
  }
  const parts = iso.split('-');
  if (parts.length !== 3) {
    return iso;
  }
  return `${parts[0]}/${parts[1]}/${parts[2]}`;
}

export function calcMethodTranslationKey(key: string): string {
  return `pricePackagesCalc${key.charAt(0).toUpperCase()}${key.slice(1)}`;
}

export function calcRuleTranslationKey(key: string): string {
  return `pricePackagesRule${key.charAt(0).toUpperCase()}${key.slice(1)}`;
}
