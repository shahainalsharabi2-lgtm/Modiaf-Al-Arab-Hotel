export interface PriceCategoryRowDto {
  id: number;
  code: string;
  name: string;
  foreignName: string;
  description: string;
  displayOrder: number;
}

export interface PriceCategoryFormDto {
  id: number | null;
  code: string;
  name: string;
  foreignName: string;
  description: string;
  displayOrder: string;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — فئات الأسعار */
export const PRICE_CATEGORIES_SEED: PriceCategoryRowDto[] = [
  { id: 1, code: '1', name: 'افضل سعر متوفر', foreignName: 'Best Available Rate', description: '', displayOrder: 1 },
  { id: 2, code: '2', name: 'شركات', foreignName: 'Corporate', description: '', displayOrder: 2 },
  { id: 3, code: '3', name: 'مجموعات', foreignName: 'Groups', description: '', displayOrder: 3 },
  { id: 4, code: '4', name: 'حكومي', foreignName: 'Government', description: '', displayOrder: 4 },
  { id: 5, code: '5', name: 'ضيافة', foreignName: 'Complimentary', description: '', displayOrder: 5 },
  { id: 6, code: '6', name: 'حج', foreignName: 'Hajj', description: '', displayOrder: 6 },
  { id: 7, code: '7', name: 'موظفي الفندق', foreignName: 'Hotel Staff', description: '', displayOrder: 7 },
  { id: 8, code: '8', name: 'حجوزات بوكنج.كوم', foreignName: 'Booking.com', description: '', displayOrder: 8 },
  { id: 9, code: '9', name: 'سعر افتراضي', foreignName: 'Best Available Rate', description: '', displayOrder: 9 },
  { id: 10, code: '10', name: 'وكلاء', foreignName: 'Agents', description: '', displayOrder: 10 },
  { id: 11, code: '11', name: 'عروض خاصة', foreignName: 'Special Offers', description: '', displayOrder: 11 },
];

export function emptyPriceCategoryForm(): PriceCategoryFormDto {
  return {
    id: null,
    code: '',
    name: '',
    foreignName: '',
    description: '',
    displayOrder: '',
  };
}

export function priceCategoryRowToForm(row: PriceCategoryRowDto): PriceCategoryFormDto {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    foreignName: row.foreignName,
    description: row.description,
    displayOrder: String(row.displayOrder),
  };
}
