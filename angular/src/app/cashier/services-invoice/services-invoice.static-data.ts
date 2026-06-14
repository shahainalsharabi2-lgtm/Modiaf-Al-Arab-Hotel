import type { ServicesInvoiceRow } from './services-invoice.types';

export const SERVICES_INVOICE_ROWS: ReadonlyArray<ServicesInvoiceRow> = [
  {
    id: '1',
    invoiceNo: '254010500085',
    invoiceDate: '2025-11-14',
    statementPercent: 2.5,
    total: 153.24,
    createdAt: '2026-06-09T14:03:00',
    returnInvoiceNo: '',
    hasReturn: true,
  },
  {
    id: '2',
    invoiceNo: '254010500084',
    invoiceDate: '2025-11-14',
    statementPercent: 2.5,
    total: 89.5,
    createdAt: '2026-06-09T11:20:00',
    returnInvoiceNo: '',
    hasReturn: true,
  },
];
