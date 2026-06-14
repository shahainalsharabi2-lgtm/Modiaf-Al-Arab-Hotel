import {
  calcMethodTranslationKey,
  calcRuleTranslationKey,
} from '../price-packages/price-packages.seed';

export interface PackageGroupItemDto {
  code: string;
  name: string;
  price: string;
  calculationMethodKey: string;
  calculationRuleKey: string;
}

export interface PricePackageGroupRowDto {
  id: number;
  code: string;
  name: string;
  price: number;
  packageItemsText: string;
  fullBoard: boolean;
  sellSeparately: boolean;
}

export interface PricePackageGroupFormDto {
  id: number | null;
  code: string;
  name: string;
  foreignName: string;
  description: string;
  fullBoard: boolean;
  sellSeparately: boolean;
  items: PackageGroupItemDto[];
}

export interface PackageItemCatalogDto {
  code: string;
  name: string;
  price: string;
  calculationMethodKey: string;
  calculationRuleKey: string;
}

export const DEFAULT_PACKAGE_ITEMS_TEXT =
  'فطور، غداء، عشاء، بداية عشاء، نهاية غداء، نهاية فطور';

/** أصناف الباقات المتاحة للاختيار — مطابقة لشاشة Ultimate */
export const PACKAGE_ITEM_CATALOG: PackageItemCatalogDto[] = [
  {
    code: 'ai1',
    name: 'فطور',
    price: '16.00',
    calculationMethodKey: 'everyNightExceptArrival',
    calculationRuleKey: 'perPerson',
  },
  {
    code: 'bi1',
    name: 'غداء',
    price: '13.00',
    calculationMethodKey: 'everyNightExceptArrival',
    calculationRuleKey: 'perPerson',
  },
  {
    code: 'ci1',
    name: 'عشاء',
    price: '18.00',
    calculationMethodKey: 'everyNightExceptArrival',
    calculationRuleKey: 'perPerson',
  },
  {
    code: 'di1',
    name: 'بداية عشاء',
    price: '10.00',
    calculationMethodKey: 'arrivalDay',
    calculationRuleKey: 'perPerson',
  },
  {
    code: 'ei1',
    name: 'نهاية غداء',
    price: '12.00',
    calculationMethodKey: 'departureNight',
    calculationRuleKey: 'perPerson',
  },
  {
    code: 'fi1',
    name: 'نهاية فطور',
    price: '11.00',
    calculationMethodKey: 'departureNight',
    calculationRuleKey: 'perPerson',
  },
];

/** بيانات ثابتة مطابقة لشاشة Ultimate — مجموعة الباقات */
export const PRICE_PACKAGE_GROUPS_SEED: PricePackageGroupRowDto[] = [
  {
    id: 1,
    code: 'FB-IND1',
    name: 'فل بورد إندونيسي',
    price: 90,
    packageItemsText: DEFAULT_PACKAGE_ITEMS_TEXT,
    fullBoard: true,
    sellSeparately: true,
  },
  {
    id: 2,
    code: 'FB-MALY1',
    name: 'فل بورد ماليزي',
    price: 90,
    packageItemsText: DEFAULT_PACKAGE_ITEMS_TEXT,
    fullBoard: true,
    sellSeparately: true,
  },
  {
    id: 3,
    code: 'FB-ARBE1',
    name: 'فل بورد عربي',
    price: 90,
    packageItemsText: DEFAULT_PACKAGE_ITEMS_TEXT,
    fullBoard: true,
    sellSeparately: true,
  },
  {
    id: 4,
    code: '101',
    name: 'شاملة',
    price: 105,
    packageItemsText: DEFAULT_PACKAGE_ITEMS_TEXT,
    fullBoard: true,
    sellSeparately: true,
  },
];

export function defaultPackageGroupItems(): PackageGroupItemDto[] {
  return PACKAGE_ITEM_CATALOG.map((item) => ({ ...item }));
}

export function emptyPricePackageGroupForm(): PricePackageGroupFormDto {
  return {
    id: null,
    code: '',
    name: '',
    foreignName: '',
    description: '',
    fullBoard: true,
    sellSeparately: true,
    items: [],
  };
}

export function pricePackageGroupRowToForm(row: PricePackageGroupRowDto): PricePackageGroupFormDto {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    foreignName: '',
    description: '',
    fullBoard: row.fullBoard,
    sellSeparately: row.sellSeparately,
    items: defaultPackageGroupItems(),
  };
}

export function packageItemsSummary(items: PackageGroupItemDto[]): string {
  if (!items.length) {
    return '';
  }
  return items.map((item) => item.name).join('، ');
}

export { calcMethodTranslationKey, calcRuleTranslationKey };
