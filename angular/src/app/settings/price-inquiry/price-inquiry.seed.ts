export interface PriceInquiryFilterDto {
  fromDate: string;
  toDate: string;
  roomCount: number | null;
  adultCount: number | null;
  childCount: number | null;
  priceCode: string;
  roomType: string;
  roomCategory: string;
  roomStatus: string;
  negotiable: boolean;
}

export interface PriceInquiryResultRowDto {
  id: number;
  pricePlan: string;
  roomType: string;
  availableRooms: string;
  currency: string;
  firstNightAmount: string;
  totalAmount: string;
  hasPackages: boolean;
  fixedPrice: boolean;
}

export const PRICE_INQUIRY_DEFAULT_FILTER: PriceInquiryFilterDto = {
  fromDate: '2025-11-14',
  toDate: '2026-06-15',
  roomCount: null,
  adultCount: null,
  childCount: null,
  priceCode: 'Grp',
  roomType: '',
  roomCategory: '',
  roomStatus: '',
  negotiable: false,
};

/** نتائج ثابتة مطابقة لشاشة Ultimate — الاستعلام عن السعر */
export const PRICE_INQUIRY_RESULTS_SEED: PriceInquiryResultRowDto[] = [
  {
    id: 1,
    pricePlan: 'سعر المجموعات',
    roomType: 'ثنائية',
    availableRooms: '6',
    currency: 'SAR',
    firstNightAmount: '200.00',
    totalAmount: '200.00',
    hasPackages: false,
    fixedPrice: false,
  },
  {
    id: 2,
    pricePlan: 'سعر المجموعات',
    roomType: 'ثلاثية',
    availableRooms: '4',
    currency: 'SAR',
    firstNightAmount: '200.00',
    totalAmount: '200.00',
    hasPackages: false,
    fixedPrice: false,
  },
  {
    id: 3,
    pricePlan: 'سعر المجموعات',
    roomType: 'رباعية',
    availableRooms: '16',
    currency: 'SAR',
    firstNightAmount: '200.00',
    totalAmount: '200.00',
    hasPackages: false,
    fixedPrice: false,
  },
  {
    id: 4,
    pricePlan: 'سعر المجموعات',
    roomType: 'خماسية',
    availableRooms: '3',
    currency: 'SAR',
    firstNightAmount: '200.00',
    totalAmount: '200.00',
    hasPackages: false,
    fixedPrice: false,
  },
];

export const PRICE_INQUIRY_PRICE_CODE_OPTIONS = [
  { value: 'Grp', labelKey: 'priceInquiryPriceCodeGroups' },
  { value: 'comp', labelKey: 'priceInquiryPriceCodeHospitality' },
  { value: 'indivi', labelKey: 'priceInquiryPriceCodeIndividual' },
];

export function formatInquiryDate(iso: string): string {
  if (!iso) {
    return '';
  }
  const parts = iso.split('-');
  if (parts.length !== 3) {
    return iso;
  }
  return `${parts[0]}/${parts[1]}/${parts[2]}`;
}

export function emptyPriceInquiryFilter(): PriceInquiryFilterDto {
  return { ...PRICE_INQUIRY_DEFAULT_FILTER };
}
