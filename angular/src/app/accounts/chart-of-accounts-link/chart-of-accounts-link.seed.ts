export interface ChartOfAccountsLinkRowDto {
  id: number;
  accountNumber: string;
  accountName: string;
  accountReference: string;
  operationCode: string;
  costCenter: string;
  subAccount: string;
}

/** بيانات ثابتة — ربط الدليل المحاسبي (فارغة كما في Ultimate) */
export const CHART_OF_ACCOUNTS_LINK_SEED: ChartOfAccountsLinkRowDto[] = [];
