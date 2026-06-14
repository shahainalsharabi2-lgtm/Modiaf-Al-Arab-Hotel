export interface PaymentMethodRowDto {
  id: number;
  name: string;
  foreignName?: string | null;
  type: number;
  account: string;
  isActive: boolean;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — طرق الدفع */
export const PAYMENT_METHODS_SEED: PaymentMethodRowDto[] = [
  { id: 1, name: 'دفع كاش', foreignName: 'Cash', type: 1, account: '5001', isActive: true },
  { id: 2, name: 'مدى', foreignName: 'Mada', type: 2, account: '5101', isActive: true },
  { id: 3, name: 'شيك', foreignName: 'Check', type: 3, account: '5201', isActive: true },
  { id: 4, name: 'تحويل بنكي', foreignName: 'Bank Transfer', type: 4, account: '5501', isActive: true },
  { id: 5, name: 'آجل', foreignName: 'City Ledger', type: 6, account: '5301', isActive: true },
  { id: 6, name: 'ماستر كارد', foreignName: 'MasterCard', type: 2, account: '5102', isActive: true },
  { id: 7, name: 'فيزة', foreignName: 'Visa', type: 2, account: '5103', isActive: true },
];
