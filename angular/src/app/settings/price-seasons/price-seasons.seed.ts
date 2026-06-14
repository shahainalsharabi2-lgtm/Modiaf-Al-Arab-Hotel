export interface PriceSeasonRowDto {
  id: number;
  code: string;
  name: string;
  foreignName: string;
  description: string;
  fromDate: string;
  toDate: string;
}

export interface PriceSeasonFormDto {
  id: number | null;
  code: string;
  name: string;
  foreignName: string;
  description: string;
  fromDate: string;
  toDate: string;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — مواسم الأسعار */
export const PRICE_SEASONS_SEED: PriceSeasonRowDto[] = [
  {
    id: 1,
    code: 'omrah',
    name: 'موسم عمرة رمضان',
    foreignName: '',
    description: 'موسم شهر رمضان',
    fromDate: '2026-06-09',
    toDate: '2027-06-09',
  },
  {
    id: 2,
    code: 'حج',
    name: 'موسم الحج',
    foreignName: 'حج',
    description: '',
    fromDate: '2026-06-09',
    toDate: '2026-06-09',
  },
];

export function emptyPriceSeasonForm(): PriceSeasonFormDto {
  return {
    id: null,
    code: '',
    name: '',
    foreignName: '',
    description: '',
    fromDate: '',
    toDate: '',
  };
}

export function priceSeasonRowToForm(row: PriceSeasonRowDto): PriceSeasonFormDto {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    foreignName: row.foreignName,
    description: row.description,
    fromDate: row.fromDate,
    toDate: row.toDate,
  };
}

export function formatSeasonDate(iso: string): string {
  if (!iso) {
    return '';
  }
  const parts = iso.split('-');
  if (parts.length !== 3) {
    return iso;
  }
  return `${parts[0]}/${parts[1]}/${parts[2]}`;
}
