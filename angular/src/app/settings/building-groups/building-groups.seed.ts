export interface BuildingGroupRowDto {
  id: number;
  name: string;
  foreignName: string;
  description?: string | null;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — مجموعات المباني */
export const BUILDING_GROUPS_SEED: BuildingGroupRowDto[] = [
  { id: 1, name: 'المباني الرئيسية', foreignName: 'Main Buildings', description: null },
  { id: 2, name: 'المباني الفرعية', foreignName: 'Sub Buildings', description: null },
  { id: 3, name: 'المباني الخارجية', foreignName: 'External Buildings', description: null },
  { id: 4, name: 'المباني الداخلية', foreignName: 'Internal Buildings', description: null },
];
