export interface BookingTypeRowDto {
  id: number;
  code: string;
  name: string;
  deductFromAvailable: boolean;
  requireCreditCard: boolean;
  requireAdvancePayment: boolean;
  requirePhone: boolean;
  requireArrivalTime: boolean;
  isActive: boolean;
  displayOrder: number;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — أنواع الحجز */
export const BOOKING_TYPES_SEED: BookingTypeRowDto[] = [
  {
    id: 1,
    code: 'WLKN',
    name: 'تسكين مباشر',
    deductFromAvailable: true,
    requireCreditCard: false,
    requireAdvancePayment: false,
    requirePhone: false,
    requireArrivalTime: false,
    isActive: true,
    displayOrder: 0,
  },
  {
    id: 2,
    code: 'GDT',
    name: 'مؤكد',
    deductFromAvailable: true,
    requireCreditCard: false,
    requireAdvancePayment: true,
    requirePhone: false,
    requireArrivalTime: false,
    isActive: true,
    displayOrder: 1,
  },
  {
    id: 3,
    code: '',
    name: 'غير مؤكد',
    deductFromAvailable: false,
    requireCreditCard: false,
    requireAdvancePayment: false,
    requirePhone: false,
    requireArrivalTime: false,
    isActive: true,
    displayOrder: 2,
  },
  {
    id: 4,
    code: 'TA',
    name: 'حجز دفعة مقدمة',
    deductFromAvailable: true,
    requireCreditCard: false,
    requireAdvancePayment: true,
    requirePhone: false,
    requireArrivalTime: false,
    isActive: true,
    displayOrder: 1,
  },
  {
    id: 5,
    code: '',
    name: 'تسكين غير مباشر',
    deductFromAvailable: false,
    requireCreditCard: true,
    requireAdvancePayment: false,
    requirePhone: true,
    requireArrivalTime: false,
    isActive: false,
    displayOrder: 1,
  },
];
