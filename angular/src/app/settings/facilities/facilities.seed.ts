export interface FacilityRowDto {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  displayOrder: number;
}

/** بيانات ثابتة — المرافق (فارغة كما في شاشة Ultimate) */
export const FACILITIES_SEED: FacilityRowDto[] = [];
