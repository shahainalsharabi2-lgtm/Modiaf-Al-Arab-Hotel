export interface MarketCategoryRowDto {
  id: number;
  code: string;
  name: string;
  foreignName?: string | null;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — فئات السوق */
export const MARKET_CATEGORIES_SEED: MarketCategoryRowDto[] = [
  { id: 1, code: 'GEn', name: 'عام' },
];
