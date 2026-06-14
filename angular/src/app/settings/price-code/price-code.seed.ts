export interface PriceCodeRowDto {
  id: number;
  number: number;
  code: string;
  name: string;
  currency: string;
  pricingStartDate: string;
  pricingEndDate: string;
  negotiable: boolean;
  hospitality: boolean;
  active: boolean;
}

export interface PriceCodeIncludedPackageDto {
  code: string;
  name: string;
  price: string;
  calculationMethodKey: string;
  calculationRuleKey: string;
}

export interface PriceCodeFormDto {
  id: number | null;
  code: string;
  name: string;
  foreignName: string;
  category: string;
  marketCode: string;
  sourceCode: string;
  pricingStartDate: string;
  pricingEndDate: string;
  currency: string;
  schedulingMechanism: string;
  description: string;
  active: boolean;
  negotiable: boolean;
  hospitality: boolean;
  internalUse: boolean;
  electronicPathHajj: boolean;
  priceIncludesPackages: boolean;
  dayUse: boolean;
  priceIncludesTax: boolean;
  includedPackages: PriceCodeIncludedPackageDto[];
  roomRevenueAccount: string;
  packageRevenueAccount: string;
  folioDescription: string;
  discountable: boolean;
}

export type PriceCodeFormTab = 'schedule' | 'packages' | 'posting' | 'promotions';

/** بيانات ثابتة مطابقة لشاشة Ultimate — رمز السعر */
export const PRICE_CODE_SEED: PriceCodeRowDto[] = [
  {
    id: 1,
    number: 1,
    code: 'Grp',
    name: 'سعر المجموعات',
    currency: 'SAR',
    pricingStartDate: '2025-11-01',
    pricingEndDate: '2028-11-30',
    negotiable: false,
    hospitality: false,
    active: true,
  },
  {
    id: 2,
    number: 2,
    code: 'comp',
    name: 'ضيافة',
    currency: 'SAR',
    pricingStartDate: '2025-11-01',
    pricingEndDate: '2028-11-30',
    negotiable: false,
    hospitality: true,
    active: true,
  },
  {
    id: 3,
    number: 3,
    code: 'indivi',
    name: 'سعر الافراد',
    currency: 'SAR',
    pricingStartDate: '2025-11-01',
    pricingEndDate: '2028-11-30',
    negotiable: false,
    hospitality: false,
    active: true,
  },
  {
    id: 4,
    number: 5,
    code: 'alotmnt',
    name: 'سعر الوتمنت',
    currency: 'SAR',
    pricingStartDate: '2025-11-01',
    pricingEndDate: '2028-11-30',
    negotiable: false,
    hospitality: false,
    active: true,
  },
  {
    id: 5,
    number: 6,
    code: '121',
    name: 'ذوي الاعاقه',
    currency: 'SAR',
    pricingStartDate: '2025-11-01',
    pricingEndDate: '2028-11-30',
    negotiable: false,
    hospitality: false,
    active: true,
  },
  {
    id: 6,
    number: 7,
    code: 'h',
    name: 'سعر متوسط',
    currency: 'SAR',
    pricingStartDate: '2025-11-01',
    pricingEndDate: '2028-11-30',
    negotiable: true,
    hospitality: false,
    active: true,
  },
];

export function emptyPriceCodeForm(): PriceCodeFormDto {
  return {
    id: null,
    code: '',
    name: '',
    foreignName: '',
    category: '',
    marketCode: '',
    sourceCode: '',
    pricingStartDate: '2025-11-14',
    pricingEndDate: '2029-06-10',
    currency: 'SAR',
    schedulingMechanism: 'period',
    description: '',
    active: true,
    negotiable: false,
    hospitality: false,
    internalUse: false,
    electronicPathHajj: false,
    priceIncludesPackages: false,
    dayUse: false,
    priceIncludesTax: true,
    includedPackages: [],
    roomRevenueAccount: '',
    packageRevenueAccount: '',
    folioDescription: '',
    discountable: false,
  };
}

export function priceCodeRowToForm(row: PriceCodeRowDto): PriceCodeFormDto {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    foreignName: '',
    category: '',
    marketCode: '',
    sourceCode: '',
    pricingStartDate: row.pricingStartDate,
    pricingEndDate: row.pricingEndDate,
    currency: row.currency,
    schedulingMechanism: 'period',
    description: '',
    active: row.active,
    negotiable: row.negotiable,
    hospitality: row.hospitality,
    internalUse: false,
    electronicPathHajj: false,
    priceIncludesPackages: false,
    dayUse: false,
    priceIncludesTax: true,
    includedPackages: [],
    roomRevenueAccount: '',
    packageRevenueAccount: '',
    folioDescription: '',
    discountable: false,
  };
}

export function formatPriceCodeDate(iso: string): string {
  if (!iso) {
    return '';
  }
  const parts = iso.split('-');
  if (parts.length !== 3) {
    return iso;
  }
  return `${parts[0]}/${parts[1]}/${parts[2]}`;
}
