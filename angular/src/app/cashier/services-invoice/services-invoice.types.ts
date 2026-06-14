export type ServicesInvoiceSortKey =
  | 'invoiceNo'
  | 'invoiceDate'
  | 'statementPercent'
  | 'total'
  | 'createdAt'
  | 'returnInvoiceNo';

export type ServicesInvoiceSortDir = 'asc' | 'desc';

export interface ServicesInvoiceRow {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  statementPercent: number;
  total: number;
  createdAt: string;
  returnInvoiceNo: string;
  hasReturn: boolean;
}
