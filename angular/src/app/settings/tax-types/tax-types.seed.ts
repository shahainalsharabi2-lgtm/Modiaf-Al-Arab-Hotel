export interface TaxTypeRowDto {
  id: number;
  name: string;
  valueLabel: string;
  typeLabel: string;
  account: string;
  percentageLevel: string;
}

export interface TaxTypeFormDto {
  id: number | null;
  name: string;
  foreignName: string;
  taxBracketType: string;
  taxApplicationType: string;
  account: string;
  currency: string;
  valueType: string;
  percentage: string;
  roundingType: string;
  decimalPlaces: string;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — أنواع الضرائب */
export const TAX_TYPES_SEED: TaxTypeRowDto[] = [
  {
    id: 1,
    name: 'ضريبة القيمة المضافة',
    valueLabel: 'نسبة 15%',
    typeLabel: 'ضريبة القيمة المضافة',
    account: '7001',
    percentageLevel: 'المجموع الفرعي 1',
  },
  {
    id: 2,
    name: 'الايواء السياحي',
    valueLabel: 'نسبة 2.5%',
    typeLabel: 'ضريبة الإيواء',
    account: '7101',
    percentageLevel: 'المبلغ الأساسي',
  },
];

export function emptyTaxTypeForm(): TaxTypeFormDto {
  return {
    id: null,
    name: '',
    foreignName: '',
    taxBracketType: 'vat',
    taxApplicationType: 'sales',
    account: '',
    currency: 'sar',
    valueType: 'percentage',
    percentage: '',
    roundingType: 'none',
    decimalPlaces: '1',
  };
}

export function taxTypeRowToForm(row: TaxTypeRowDto): TaxTypeFormDto {
  const pctMatch = row.valueLabel.match(/[\d.]+/);
  return {
    id: row.id,
    name: row.name,
    foreignName: '',
    taxBracketType: row.typeLabel.includes('القيمة') ? 'vat' : 'lodging',
    taxApplicationType: 'sales',
    account: row.account,
    currency: 'sar',
    valueType: 'percentage',
    percentage: pctMatch?.[0] ?? '',
    roundingType: 'none',
    decimalPlaces: '1',
  };
}
