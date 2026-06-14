export interface ConfirmationMessageRowDto {
  id: number;
  name: string;
  foreignName?: string | null;
  messageTitle: string;
  messageText: string;
  messageFooter: string;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — رسائل التأكيد */
export const CONFIRMATION_MESSAGES_SEED: ConfirmationMessageRowDto[] = [
  {
    id: 1,
    name: 'الوسام للمقاولات',
    foreignName: null,
    messageTitle: 'تم قبول الحجز',
    messageText: 'تم قبول الحجز',
    messageFooter: 'تم قبول الحجز',
  },
];
