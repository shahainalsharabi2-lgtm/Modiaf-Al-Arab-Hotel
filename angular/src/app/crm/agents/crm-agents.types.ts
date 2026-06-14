export type CrmAgentSortKey = 'name' | 'foreignName' | 'mobile' | 'email';

export type CrmAgentSortDir = 'asc' | 'desc';

export type CrmAgentViewMode = 'table' | 'grid';

export type CrmAgentScopeFilter = 'all' | 'withMobile' | 'withForeignName';

export interface CrmAgentRow {
  id: string;
  name: string;
  foreignName: string;
  mobile: string;
  email: string;
}
