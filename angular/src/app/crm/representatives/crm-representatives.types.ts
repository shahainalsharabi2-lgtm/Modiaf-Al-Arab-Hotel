export type RepresentativeSortKey = 'name' | 'foreignName' | 'mobile' | 'email';

export type RepresentativeSortDir = 'asc' | 'desc';

export type RepresentativeViewMode = 'grid' | 'table';

export interface RepresentativeRow {
  id: string;
  name: string;
  foreignName: string;
  mobile: string;
  email: string;
}
