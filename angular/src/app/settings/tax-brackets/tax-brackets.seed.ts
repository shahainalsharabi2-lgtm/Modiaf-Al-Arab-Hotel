export interface TaxBracketRowDto {
  id: number;
  name: string;
  foreignName: string;
  percentage: number;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — الشرائح الضريبية */
export const TAX_BRACKETS_SEED: TaxBracketRowDto[] = [
  { id: 1, name: 'ضريبة القيمة المضافة', foreignName: 'VAT', percentage: 15 },
  { id: 2, name: 'الايواء السياحي', foreignName: 'Municipality', percentage: 2.5 },
];
