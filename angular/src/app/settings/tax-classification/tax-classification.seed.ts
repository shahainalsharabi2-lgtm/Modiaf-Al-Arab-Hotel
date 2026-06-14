export interface TaxClassificationRowDto {
  id: number;
  name: string;
  foreignName: string;
  description: string;
  invoiceType: 'standard';
  isDefault: boolean;
  displayOrder: number;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — تصنيف الضريبة */
export const TAX_CLASSIFICATION_SEED: TaxClassificationRowDto[] = [
  {
    id: 1,
    name: 'ضريبة الخدمات الفندقية',
    foreignName: '',
    description: '',
    invoiceType: 'standard',
    isDefault: true,
    displayOrder: 1,
  },
];
