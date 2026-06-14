import type { HkRoomInspectionItemRow } from './hk-room-inspection-items.types';

export const HK_ROOM_INSPECTION_ITEM_ROWS: ReadonlyArray<HkRoomInspectionItemRow> = [
  {
    id: '1',
    rowNo: 1,
    itemName: 'تلفزيون',
    foreignName: '',
    category: 'إلكترونيات',
    fineAmount: 50,
    defaultQuantity: 1,
    displayOrder: 1,
  },
  {
    id: '2',
    rowNo: 2,
    itemName: 'كرسي',
    foreignName: '',
    category: 'أثاث',
    fineAmount: 50,
    defaultQuantity: 1,
    displayOrder: 1,
  },
  {
    id: '3',
    rowNo: 3,
    itemName: 'مكواة',
    foreignName: '',
    category: 'إلكترونيات',
    fineAmount: 30,
    defaultQuantity: 1,
    displayOrder: 2,
  },
  {
    id: '4',
    rowNo: 4,
    itemName: 'وسادة',
    foreignName: '',
    category: 'مفروشات',
    fineAmount: 20,
    defaultQuantity: 2,
    displayOrder: 3,
  },
];
