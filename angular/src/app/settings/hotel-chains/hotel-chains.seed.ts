import { HotelChainDto } from '../../services/hotel-chain.service';

/** بيانات ثابتة مطابقة لشاشة Ultimate — سلاسل الفنادق */
export const HOTEL_CHAINS_SEED: HotelChainDto[] = [
  {
    id: 1,
    code: 'HIL',
    name: 'شركة الحلول النهائية 1',
    foreignName: 'Ultimate Company',
    notes: null,
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 2,
    code: 'Hsma',
    name: 'شركة الحلول النهائية 2',
    foreignName: 'Ultimate Company',
    notes: null,
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 3,
    code: '2',
    name: 'الهدى',
    foreignName: 'Al Houda',
    notes: null,
    displayOrder: 3,
    isActive: true,
  },
  {
    id: 4,
    code: '101',
    name: 'شركة الوسام اسكان الفندقية',
    foreignName: 'start 5',
    notes: null,
    displayOrder: 4,
    isActive: true,
  },
];
