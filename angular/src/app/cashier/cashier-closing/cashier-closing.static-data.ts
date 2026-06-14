import type { CashierOperationRow, CashierUserOption } from './cashier-closing.types';

export const CASHIER_CLOSING_USERS: ReadonlyArray<CashierUserOption> = [
  { id: 'admin', username: 'admin', cashierNo: '2' },
];

export const CASHIER_CLOSING_OPERATIONS: ReadonlyArray<CashierOperationRow> = [
  { id: '1', accountNo: '7001', descriptionKey: 'opVat', count: 5, amount: 22.07, currency: 'SAR' },
  { id: '2', accountNo: '7101', descriptionKey: 'opTourism', count: 5, amount: 3.59, currency: 'SAR' },
  { id: '3', accountNo: '5001', descriptionKey: 'opCashPayment', count: 1, amount: -130.0, currency: 'SAR' },
  { id: '4', accountNo: '3002', descriptionKey: 'opShawarma', count: 1, amount: 130.0, currency: 'SAR' },
  { id: '5', accountNo: '5001', descriptionKey: 'opCash', count: 1, amount: -300.0, currency: 'SAR' },
  { id: '6', accountNo: '5001', descriptionKey: 'opCash', count: 2, amount: -450.0, currency: 'SAR' },
  { id: '7', accountNo: '3002', descriptionKey: 'opShawarma', count: 3, amount: 390.0, currency: 'SAR' },
  { id: '8', accountNo: '7001', descriptionKey: 'opVat', count: 4, amount: 18.5, currency: 'SAR' },
  { id: '9', accountNo: '7101', descriptionKey: 'opTourism', count: 4, amount: 2.8, currency: 'SAR' },
  { id: '10', accountNo: '5001', descriptionKey: 'opCashPayment', count: 2, amount: -260.0, currency: 'SAR' },
  { id: '11', accountNo: '3002', descriptionKey: 'opShawarma', count: 1, amount: 130.0, currency: 'SAR' },
  { id: '12', accountNo: '5001', descriptionKey: 'opCash', count: 1, amount: -200.0, currency: 'SAR' },
];

export const CASHIER_DEMO_SUMMARY = {
  openingBalance: 0,
  receipts: 830,
  payments: 0,
  total: 6030,
  balance: 6030,
  actualCash: 6030,
} as const;
