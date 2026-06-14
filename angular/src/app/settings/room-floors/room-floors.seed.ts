export interface RoomFloorRowDto {
  id: number;
  name: string;
  foreignName?: string | null;
  description: string;
  housekeeping: boolean;
  serialNumber: number;
  building: number;
}

const FLOOR_NAMES: Record<number, string> = {
  2: 'الطابق الثاني',
  3: 'الطابق الثالث',
  4: 'الطابق الرابع',
  5: 'الطابق الخامس',
  6: 'الطابق السادس',
  7: 'الطابق السابع',
  8: 'الطابق الثامن',
  9: 'الطابق التاسع',
  10: 'الطابق العاشر',
  11: 'الطابق الحادي عشر',
  12: 'الطابق الثاني عشر',
  13: 'الطابق الثالث عشر',
  14: 'الطابق الرابع عشر',
  15: 'الطابق الخامس عشر',
};

/** بيانات ثابتة مطابقة لشاشة Ultimate — الطوابق (14 سجل) */
export const ROOM_FLOORS_SEED: RoomFloorRowDto[] = Array.from({ length: 14 }, (_, index) => {
  const serialNumber = index + 2;
  const name = FLOOR_NAMES[serialNumber] ?? `الطابق ${serialNumber}`;
  return {
    id: serialNumber,
    name,
    foreignName: null,
    description: name,
    housekeeping: false,
    serialNumber,
    building: 1,
  };
});
