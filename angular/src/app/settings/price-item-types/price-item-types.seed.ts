export interface PriceItemTypeRowDto {
  id: number;
  name: string;
  foreignName: string;
  revenueAccount: string;
}

export interface PriceItemTypeFormDto {
  id: number | null;
  name: string;
  foreignName: string;
  revenueType: string;
  account: string;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — أنواع الأصناف */
export const PRICE_ITEM_TYPES_SEED: PriceItemTypeRowDto[] = [
  {
    id: 1,
    name: 'مشروبات باردة',
    foreignName: '',
    revenueAccount: '3001 - ايرادات كوفي شوب',
  },
  {
    id: 2,
    name: 'مشروبات ساخنة',
    foreignName: '',
    revenueAccount: '3001 - ايرادات كوفي شوب',
  },
  {
    id: 3,
    name: 'مغسلة',
    foreignName: '',
    revenueAccount: '3006 - إيراد مغسلة (غسيل وكوي الملابس)',
  },
  {
    id: 4,
    name: 'وجبات',
    foreignName: '',
    revenueAccount: '3002 - ايرادات كرسي مطعم',
  },
];

export function emptyPriceItemTypeForm(): PriceItemTypeFormDto {
  return {
    id: null,
    name: '',
    foreignName: '',
    revenueType: 'restaurant',
    account: '',
  };
}

export function priceItemTypeRowToForm(row: PriceItemTypeRowDto): PriceItemTypeFormDto {
  return {
    id: row.id,
    name: row.name,
    foreignName: row.foreignName,
    revenueType: 'restaurant',
    account: row.revenueAccount.split(' - ')[0] ?? '',
  };
}
