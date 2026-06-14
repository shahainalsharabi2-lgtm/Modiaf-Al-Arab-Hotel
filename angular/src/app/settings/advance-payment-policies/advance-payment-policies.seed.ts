export type AdvancePaymentType = 'percentage' | 'amount';
export type PolicyTimingType = 'at_booking' | 'before_arrival';

export interface AdvancePaymentPolicyRowDto {
  id: number;
  name: string;
  paymentType: AdvancePaymentType;
  value: number;
  policyTimingType: PolicyTimingType;
  policyTimingDays: number;
  bookingType: string;
  isActive: boolean;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — سياسات الدفع المقدم */
export const ADVANCE_PAYMENT_POLICIES_SEED: AdvancePaymentPolicyRowDto[] = [
  {
    id: 1,
    name: 'دفع مقدم',
    paymentType: 'percentage',
    value: 10,
    policyTimingType: 'at_booking',
    policyTimingDays: 0,
    bookingType: 'حجز دفعة مقدمة',
    isActive: true,
  },
  {
    id: 2,
    name: '50% من قيمة الحجز',
    paymentType: 'percentage',
    value: 50,
    policyTimingType: 'at_booking',
    policyTimingDays: 0,
    bookingType: 'حجز دفعة مقدمة',
    isActive: true,
  },
  {
    id: 3,
    name: '20% قبل الوصول',
    paymentType: 'percentage',
    value: 20,
    policyTimingType: 'before_arrival',
    policyTimingDays: 3,
    bookingType: 'مؤكد',
    isActive: true,
  },
];
