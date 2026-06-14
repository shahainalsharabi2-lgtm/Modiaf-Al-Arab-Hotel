export type CrmCompanySortKey = 'name' | 'foreignName' | 'country' | 'mobile' | 'email';

export type CrmCompanySortDir = 'asc' | 'desc';

export type CrmCompanyViewMode = 'table' | 'grid';

export type CrmCompanyScopeFilter = 'all' | 'withMobile' | 'withForeignName';

export interface CrmCompanyRow {
  id: string;
  name: string;
  foreignName: string;
  country: string;
  mobile: string;
  email: string;
}
