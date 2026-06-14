export type InvoiceNotificationSortKey =
  | 'invoiceNo'
  | 'invoiceDate'
  | 'currency'
  | 'amount'
  | 'typeLabel'
  | 'internalTypeLabel'
  | 'invoiceTypeLabel'
  | 'name'
  | 'statusLabel'
  | 'uuid';

export type InvoiceNotificationSortDir = 'asc' | 'desc';

export interface InvoiceNotificationRow {
  id: string;
  bookingId?: number;
  invoiceNo: string;
  invoiceDate: string;
  currency: string;
  amount: number;
  typeLabel: string;
  internalTypeLabel: string;
  invoiceTypeLabel: string;
  name: string;
  statusLabel: string;
  statusPending: boolean;
  uuid: string;
}

export interface InvoiceNotificationColumnFilters {
  invoiceNo: string;
  invoiceDate: string;
  currency: string;
  amount: string;
  typeLabel: string;
  internalTypeLabel: string;
  invoiceTypeLabel: string;
  name: string;
  statusLabel: string;
  uuid: string;
}

export function emptyInvoiceNotificationColumnFilters(): InvoiceNotificationColumnFilters {
  return {
    invoiceNo: '',
    invoiceDate: '',
    currency: '',
    amount: '',
    typeLabel: '',
    internalTypeLabel: '',
    invoiceTypeLabel: '',
    name: '',
    statusLabel: '',
    uuid: '',
  };
}
