export type RoomBookingSection = 'statuses' | 'filterPerms';

export interface RoomStatusRowDto {
  id: number;
  serial: number;
  statusName: string;
  usedIn: string;
  statusType: string;
  colorHex?: string | null;
}

export interface RoomFilterPermRowDto {
  id: number;
  code: string;
  name: string;
  latinName: string;
  allowed: boolean;
}

/** حالات الغرف والحجوزات — بيانات ثابتة مطابقة لـ Ultimate */
export const ROOM_STATUSES_SEED: RoomStatusRowDto[] = [
  { id: 1, serial: 1, statusName: 'متاحة', usedIn: 'Rooms', statusType: 'Color', colorHex: '#4CAF50' },
  { id: 2, serial: 4, statusName: 'مشغولة', usedIn: 'Rooms', statusType: 'Color', colorHex: '#d62400' },
  { id: 3, serial: 5, statusName: 'محجوزة', usedIn: 'Rooms', statusType: 'Color', colorHex: null },
  { id: 4, serial: 6, statusName: 'متوقع مغادرة', usedIn: 'Rooms', statusType: 'Color', colorHex: null },
  { id: 5, serial: 7, statusName: 'ملغية', usedIn: 'Rooms', statusType: 'Color', colorHex: null },
  { id: 6, serial: 8, statusName: 'صيانة', usedIn: 'Rooms', statusType: 'Color', colorHex: null },
  { id: 7, serial: 9, statusName: 'خارج الطلب', usedIn: 'Rooms', statusType: 'Color', colorHex: null },
  { id: 8, serial: 10, statusName: 'خارج الخدمة', usedIn: 'Rooms', statusType: 'Color', colorHex: null },
];

/** أذونات فلاتر مخطط الغرف — 14 سجل ثابت */
export const ROOM_FILTER_PERMS_SEED: RoomFilterPermRowDto[] = [
  { id: 396, code: 'filterAvailableUnclean', name: 'متاحة غير نظيفة', latinName: 'Available Unclean', allowed: true },
  { id: 395, code: 'filterAvailableClean', name: 'متاحة نظيفة', latinName: 'Available Clean', allowed: true },
  { id: 401, code: 'filterOccupiedUnclean', name: 'مشغولة غير نظيفة', latinName: 'Occupied Unclean', allowed: true },
  { id: 400, code: 'filterOccupiedClean', name: 'مشغولة نظيفة', latinName: 'Occupied Clean', allowed: true },
  { id: 402, code: 'filterOutOfOrder', name: 'خارج الطلب', latinName: 'Out Of Order', allowed: true },
  { id: 403, code: 'filterOutOfService', name: 'خارج الخدمة', latinName: 'Out Of Service', allowed: true },
  { id: 404, code: 'filterUncleanReservation', name: 'محجوزة غير نظيفة', latinName: 'Unclean Reservation', allowed: true },
  { id: 397, code: 'filterCleanReservation', name: 'محجوزه نظيفه', latinName: 'Clean Reservation', allowed: true },
  { id: 398, code: 'filterExpDepReservation', name: 'مغادرة متوقعه محجوزه', latinName: 'Expected Departure Reservation', allowed: true },
  { id: 399, code: 'filterLeavingSoon', name: 'متوقع المغادره', latinName: 'Departures', allowed: true },
  { id: 390, code: 'filterAvailable', name: 'متاحة', latinName: 'Available', allowed: true },
  { id: 391, code: 'filterOccupied', name: 'مشغولة', latinName: 'Occupied', allowed: true },
  { id: 392, code: 'filterReserved', name: 'محجوزة', latinName: 'Reserved', allowed: true },
  { id: 393, code: 'filterMaintenance', name: 'صيانة', latinName: 'Maintenance', allowed: true },
];
