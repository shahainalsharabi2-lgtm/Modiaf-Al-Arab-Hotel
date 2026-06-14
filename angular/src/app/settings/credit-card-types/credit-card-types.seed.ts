import { CreditCardTypeDto } from '../../services/credit-card-type.service';

/** بيانات ثابتة مطابقة لشاشة Ultimate — أنواع بطاقات الائتمان */
export const CREDIT_CARD_TYPES_SEED: CreditCardTypeDto[] = [
  {
    id: 1,
    code: 'Mada',
    name: 'مدى',
    foreignName: 'Span',
    description: null,
    displayOrder: 1,
    isActive: true,
    bank: 'شبكة وسيط',
  },
  {
    id: 2,
    code: 'Visa',
    name: 'فيزة',
    foreignName: 'Visa',
    description: null,
    displayOrder: 2,
    isActive: true,
    bank: 'شبكة وسيط',
  },
  {
    id: 3,
    code: 'MasterCard',
    name: 'ماستر كارد',
    foreignName: 'MasterCard',
    description: null,
    displayOrder: 0,
    isActive: true,
    bank: 'شبكة وسيط',
  },
];
