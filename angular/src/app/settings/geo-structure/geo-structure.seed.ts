export interface GeoRowDto {
  id: number;
  code: string;
  name: string;
  foreignName?: string | null;
}

export type GeoTab = 'countries' | 'governorates' | 'cities' | 'regions';

/** بيانات ثابتة مطابقة لشاشة Ultimate — الهيكل الجغرافي */
export const GEO_COUNTRIES_SEED: GeoRowDto[] = [
  {
    id: 1,
    code: 'SA',
    name: 'المملكة العربية السعودية',
    foreignName: 'Saudi Arabia',
  },
];

export const GEO_GOVERNORATES_SEED: GeoRowDto[] = [];
export const GEO_CITIES_SEED: GeoRowDto[] = [];
export const GEO_REGIONS_SEED: GeoRowDto[] = [];
