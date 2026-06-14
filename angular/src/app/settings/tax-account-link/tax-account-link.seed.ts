export interface TaxAccountLinkRowDto {
  id: number;
  linkingMethod: 'account';
  itemNumber: string;
  itemName: string;
  taxTypeName: string;
  entityNumber: string;
  entityName: string;
  taxCode: string;
  taxPercentage: number;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — ربط الضرائب بالخدمات والأصناف */
export const TAX_ACCOUNT_LINK_SEED: TaxAccountLinkRowDto[] = [
  {
    id: 1,
    linkingMethod: 'account',
    itemNumber: '1001',
    itemName: 'إيراد غرف',
    taxTypeName: 'ضريبة القيمة المضافة',
    entityNumber: '',
    entityName: '',
    taxCode: '',
    taxPercentage: 15,
  },
  {
    id: 2,
    linkingMethod: 'account',
    itemNumber: '1011',
    itemName: 'غرامات عدم الظهور',
    taxTypeName: 'ضريبة القيمة المضافة',
    entityNumber: '',
    entityName: '',
    taxCode: '',
    taxPercentage: 15,
  },
  {
    id: 3,
    linkingMethod: 'account',
    itemNumber: '1021',
    itemName: 'غرامات إلغاء',
    taxTypeName: 'ضريبة القيمة المضافة',
    entityNumber: '',
    entityName: '',
    taxCode: '',
    taxPercentage: 15,
  },
  {
    id: 4,
    linkingMethod: 'account',
    itemNumber: '1031',
    itemName: 'ترقية غرف',
    taxTypeName: 'ضريبة القيمة المضافة',
    entityNumber: '',
    entityName: '',
    taxCode: '',
    taxPercentage: 15,
  },
  {
    id: 5,
    linkingMethod: 'account',
    itemNumber: '1041',
    itemName: 'مغادرة متأخرة',
    taxTypeName: 'ضريبة القيمة المضافة',
    entityNumber: '',
    entityName: '',
    taxCode: '',
    taxPercentage: 15,
  },
  {
    id: 6,
    linkingMethod: 'account',
    itemNumber: '1051',
    itemName: 'وصول مبكر',
    taxTypeName: 'ضريبة القيمة المضافة',
    entityNumber: '',
    entityName: '',
    taxCode: '',
    taxPercentage: 15,
  },
  {
    id: 7,
    linkingMethod: 'account',
    itemNumber: '1061',
    itemName: 'استخدام نهاري',
    taxTypeName: 'ضريبة القيمة المضافة',
    entityNumber: '',
    entityName: '',
    taxCode: '',
    taxPercentage: 15,
  },
  {
    id: 8,
    linkingMethod: 'account',
    itemNumber: '2001',
    itemName: 'ايراد طعام',
    taxTypeName: 'ضريبة القيمة المضافة',
    entityNumber: '',
    entityName: '',
    taxCode: '',
    taxPercentage: 15,
  },
  {
    id: 9,
    linkingMethod: 'account',
    itemNumber: '3001',
    itemName: 'ايرادات كوفي شوب',
    taxTypeName: 'ضريبة القيمة المضافة',
    entityNumber: '',
    entityName: '',
    taxCode: '',
    taxPercentage: 15,
  },
  {
    id: 10,
    linkingMethod: 'account',
    itemNumber: '3002',
    itemName: 'ايرادات كرسي مطعم',
    taxTypeName: 'ضريبة القيمة المضافة',
    entityNumber: '',
    entityName: '',
    taxCode: '',
    taxPercentage: 15,
  },
];

export interface TaxAccountLinkModalRowDto {
  id: number;
  taxType: string;
  taxTypeName: string;
  entityNumber: string;
  entityName: string;
  taxCode: string;
  taxPercentage: string;
  exemptionCode: string;
}
