export type NightAuditInquirySortKey =
  | 'transactionNo'
  | 'documentDate'
  | 'documentNo'
  | 'account'
  | 'bookingNo'
  | 'description';

export type NightAuditInquirySortDir = 'asc' | 'desc';

export interface NightAuditInquiryRow {
  id: string;
  transactionNo: string;
  documentDate: string;
  documentNo: string;
  accountNo: string;
  accountNameKey: string;
  bookingNo: string;
  descriptionKey: string;
}
