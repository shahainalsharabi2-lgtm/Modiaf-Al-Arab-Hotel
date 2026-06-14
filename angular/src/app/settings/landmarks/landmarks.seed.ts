export interface LandmarkRowDto {
  id: number;
  code: string;
  name: string;
  displayOrder: number;
  foreignName?: string | null;
  website?: string | null;
  city: string;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — المعالم */
export const LANDMARKS_SEED: LandmarkRowDto[] = [
  {
    id: 1,
    code: '8',
    name: 'مكة مول',
    displayOrder: 1,
    foreignName: 'Make Mall',
    website: 'make.mall',
    city: 'مكة المكرمة',
  },
  {
    id: 2,
    code: '2',
    name: 'مستشفى آل سعود',
    displayOrder: 3,
    foreignName: 'Hospital',
    website: 'make.hospital',
    city: 'مكة المكرمة',
  },
];
