export interface CashierOperationRow {
  id: string;
  accountNo: string;
  descriptionKey: string;
  count: number;
  amount: number;
  currency: string;
}

export interface CashierUserOption {
  id: string;
  username: string;
  cashierNo: string;
}

export type CashierShiftStatus = 'open' | 'closed';
