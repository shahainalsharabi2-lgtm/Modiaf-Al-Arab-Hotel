import type { GuestValuableDepositRow, LostFoundItemRow } from './guest-valuables.types';

export const GUEST_VALUABLE_DEPOSITS: GuestValuableDepositRow[] = [
  {
    id: 'dep-1',
    receiptNo: 'VC-1-20260504-0001',
    guestName: 'ندى سيد',
    roomNo: '201',
    categoryKey: 'catGoldJewelry',
    description: 'خواتم وانسيلات',
    quantity: 2,
    safeBoxNo: '1',
    status: 'in_custody',
  },
  {
    id: 'dep-2',
    receiptNo: 'VC-1-20260503-0004',
    guestName: 'محمد حسين',
    roomNo: '720',
    categoryKey: 'catDocuments',
    description: 'جواز سفر ومحفظة',
    quantity: 1,
    safeBoxNo: '2',
    status: 'in_custody',
  },
  {
    id: 'dep-3',
    receiptNo: 'VC-1-20260501-0002',
    guestName: 'سارة أحمد',
    roomNo: '415',
    categoryKey: 'catElectronics',
    description: 'ساعة ذكية',
    quantity: 1,
    safeBoxNo: '3',
    status: 'delivered',
  },
];

export const LOST_FOUND_ITEMS: LostFoundItemRow[] = [];

export const VALUABLE_CATEGORY_KEYS = [
  'catGoldJewelry',
  'catDocuments',
  'catElectronics',
  'catOther',
] as const;

export const SAFE_BOX_NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;
