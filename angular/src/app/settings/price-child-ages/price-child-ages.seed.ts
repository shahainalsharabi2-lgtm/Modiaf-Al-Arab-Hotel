export interface PriceChildAgeRowDto {
  id: number;
  ageFrom: number;
  ageTo: number;
}

export interface PriceChildAgeFormDto {
  id: number | null;
  ageFrom: string;
  ageTo: string;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — فئات الأطفال العمرية */
export const PRICE_CHILD_AGES_SEED: PriceChildAgeRowDto[] = [
  { id: 1, ageFrom: 3, ageTo: 5 },
  { id: 2, ageFrom: 6, ageTo: 10 },
  { id: 3, ageFrom: 0, ageTo: 2 },
];

export function emptyPriceChildAgeForm(): PriceChildAgeFormDto {
  return {
    id: null,
    ageFrom: '',
    ageTo: '',
  };
}

export function priceChildAgeRowToForm(row: PriceChildAgeRowDto): PriceChildAgeFormDto {
  return {
    id: row.id,
    ageFrom: String(row.ageFrom),
    ageTo: String(row.ageTo),
  };
}
