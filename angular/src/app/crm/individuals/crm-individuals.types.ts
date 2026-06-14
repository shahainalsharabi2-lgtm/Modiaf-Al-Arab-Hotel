import { GuestRegistry } from '../../models/guest-registry.model';

export type CrmIndividualSortKey =
  | 'guestName'
  | 'country'
  | 'nationality'
  | 'birthPlace'
  | 'birthDate'
  | 'mobile'
  | 'email'
  | 'idNumber';

export type CrmIndividualSortDir = 'asc' | 'desc';

export type CrmIndividualViewMode = 'table' | 'grid';

export type CrmIndividualScopeFilter = 'all' | 'withMobile' | 'withId';

export interface CrmIndividualRow {
  id: string;
  registryId?: number;
  guestName: string;
  country: string;
  nationality: string;
  birthPlace: string;
  birthDate: string;
  mobile: string;
  email: string;
  idNumber: string;
  source: GuestRegistry;
}
