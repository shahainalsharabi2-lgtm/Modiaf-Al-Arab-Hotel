export type BlacklistEntityTab = 'guest' | 'company' | 'agent';

export type BlacklistSortKey =
  | 'firstName'
  | 'secondName'
  | 'middleName'
  | 'lastName'
  | 'mobile';

export type BlacklistSortDir = 'asc' | 'desc';

export type BlacklistViewMode = 'grid' | 'table';

export interface BlacklistRow {
  id: string;
  entityType: BlacklistEntityTab;
  firstName: string;
  secondName: string;
  middleName: string;
  lastName: string;
  mobile: string;
}
