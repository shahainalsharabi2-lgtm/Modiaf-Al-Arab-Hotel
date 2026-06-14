export type ExtOmaniPoliceCategoryId =
  | 'countries'
  | 'nationalities'
  | 'roomTypes'
  | 'gender'
  | 'paymentMethods'
  | 'idTypes'
  | 'customerTypes'
  | 'rentalTypes'
  | 'visitPurposes'
  | 'expenseTypes'
  | 'cancellationReasons';

export interface ExtOmaniPoliceCategory {
  id: ExtOmaniPoliceCategoryId;
  labelKey: string;
}

export interface ExtOmaniPoliceMappingRowDto {
  id: number;
  categoryId: ExtOmaniPoliceCategoryId;
  serviceType: string;
  code: string;
  externalValue: string;
  dataType: string;
}

export const EXT_OMANI_POLICE_CATEGORIES: ExtOmaniPoliceCategory[] = [
  { id: 'countries', labelKey: 'extOmaniPoliceCatCountries' },
  { id: 'nationalities', labelKey: 'extOmaniPoliceCatNationalities' },
  { id: 'roomTypes', labelKey: 'extOmaniPoliceCatRoomTypes' },
  { id: 'gender', labelKey: 'extOmaniPoliceCatGender' },
  { id: 'paymentMethods', labelKey: 'extOmaniPoliceCatPaymentMethods' },
  { id: 'idTypes', labelKey: 'extOmaniPoliceCatIdTypes' },
  { id: 'customerTypes', labelKey: 'extOmaniPoliceCatCustomerTypes' },
  { id: 'rentalTypes', labelKey: 'extOmaniPoliceCatRentalTypes' },
  { id: 'visitPurposes', labelKey: 'extOmaniPoliceCatVisitPurposes' },
  { id: 'expenseTypes', labelKey: 'extOmaniPoliceCatExpenseTypes' },
  { id: 'cancellationReasons', labelKey: 'extOmaniPoliceCatCancellationReasons' },
];

export const EXT_OMANI_POLICE_DATA_TYPES = ['String', 'Number', 'Boolean'] as const;

/** بيانات ثابتة — الكود العام للربط (فارغة كما في Ultimate) */
export const EXT_OMANI_POLICE_MAPPING_SEED: ExtOmaniPoliceMappingRowDto[] = [];
