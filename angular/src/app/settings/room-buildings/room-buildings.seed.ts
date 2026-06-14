export interface RoomBuildingRowDto {
  id: number;
  name: string;
  foreignName?: string | null;
  serialNumber: number;
  buildingGroup: number;
  description: string;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — المباني */
export const ROOM_BUILDINGS_SEED: RoomBuildingRowDto[] = [
  {
    id: 1,
    name: 'المبنى الرئيسي',
    foreignName: null,
    serialNumber: 1,
    buildingGroup: 1,
    description: 'المبنى الرئيسي',
  },
  {
    id: 2,
    name: 'المبنى (أ)',
    foreignName: null,
    serialNumber: 2,
    buildingGroup: 1,
    description: 'مبنى (أ) للمبنى الرئيسي',
  },
];
