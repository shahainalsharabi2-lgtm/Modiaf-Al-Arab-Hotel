export interface BookingSourceRowDto {
  id: number;
  code: string;
  name: string;
  foreignName: string;
  description?: string | null;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — مصادر الحجز */
export const BOOKING_SOURCES_SEED: BookingSourceRowDto[] = [
  { id: 1, code: 'WLKIN', name: 'مباشر', foreignName: 'Walk In', description: 'حجز مباشر' },
  { id: 2, code: 'ONLN', name: 'الكتروني', foreignName: 'Online', description: 'حجز الكتروني' },
  { id: 3, code: 'AGNC', name: 'وكالة', foreignName: 'Agency', description: 'حجز وكالة' },
  { id: 4, code: 'CRP', name: 'شركة', foreignName: 'Corporate', description: 'حجز شركة' },
];
