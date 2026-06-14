export interface PriceSoldItemRowDto {
  id: number;
  name: string;
  foreignName: string;
  itemType: string;
}

export interface PriceSoldItemFormDto {
  id: number | null;
  name: string;
  foreignName: string;
  itemType: string;
  displayOrder: number | null;
  price: string;
  defaultQuantity: string;
  stockQuantity: string;
  discountable: boolean;
  soldSeparately: boolean;
  availableOutsideStay: boolean;
}

export interface PriceSoldItemImportExportRowDto {
  selected: boolean;
  name: string;
  foreignName: string;
  itemType: string;
  price: string;
  error: string;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — الأصناف المباعة */
export const PRICE_SOLD_ITEMS_SEED: PriceSoldItemRowDto[] = [
  { id: 1, name: 'كوفي', foreignName: 'coffee', itemType: '4 - مشروبات ساخنة' },
  { id: 2, name: 'شاي', foreignName: 'tee', itemType: '4 - مشروبات ساخنة' },
  { id: 3, name: 'ايس لاتيه', foreignName: '', itemType: '5 - مشروبات باردة' },
  { id: 4, name: 'وجبة فراخ كرسبي', foreignName: '', itemType: '2 - وجبات' },
  { id: 5, name: 'غسل وكي ملابس', foreignName: '', itemType: '3 - مغسلة' },
];

export const PRICE_SOLD_ITEM_TYPE_OPTIONS = [
  { value: '4', label: '4 - مشروبات ساخنة' },
  { value: '5', label: '5 - مشروبات باردة' },
  { value: '2', label: '2 - وجبات' },
  { value: '3', label: '3 - مغسلة' },
  { value: '1', label: '1 - مشروبات باردة' },
];

export function emptyPriceSoldItemForm(): PriceSoldItemFormDto {
  return {
    id: null,
    name: '',
    foreignName: '',
    itemType: '',
    displayOrder: null,
    price: '',
    defaultQuantity: '',
    stockQuantity: '',
    discountable: false,
    soldSeparately: false,
    availableOutsideStay: false,
  };
}

export function priceSoldItemRowToForm(row: PriceSoldItemRowDto): PriceSoldItemFormDto {
  const typeOpt = PRICE_SOLD_ITEM_TYPE_OPTIONS.find((o) => o.label === row.itemType);
  return {
    id: row.id,
    name: row.name,
    foreignName: row.foreignName,
    itemType: typeOpt?.value ?? '',
    displayOrder: row.id,
    price: '',
    defaultQuantity: '',
    stockQuantity: '',
    discountable: false,
    soldSeparately: false,
    availableOutsideStay: false,
  };
}

export function itemTypeLabel(value: string): string {
  return PRICE_SOLD_ITEM_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
