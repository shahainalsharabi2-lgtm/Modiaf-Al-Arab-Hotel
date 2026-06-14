import type { BlacklistRow } from './crm-blacklist.types';

export const CRM_BLACKLIST_ROWS: ReadonlyArray<BlacklistRow> = [
  {
    id: '1',
    entityType: 'guest',
    firstName: 'شركة 15',
    secondName: '',
    middleName: '',
    lastName: '',
    mobile: '3456789',
  },
  {
    id: '2',
    entityType: 'guest',
    firstName: 'أحمد',
    secondName: 'محمد',
    middleName: 'علي',
    lastName: 'السعيد',
    mobile: '0501234567',
  },
  {
    id: '3',
    entityType: 'company',
    firstName: 'شركة النور',
    secondName: '',
    middleName: '',
    lastName: '',
    mobile: '0112345678',
  },
  {
    id: '4',
    entityType: 'agent',
    firstName: 'وكالة',
    secondName: 'السفر',
    middleName: 'العالمية',
    lastName: '',
    mobile: '0559876543',
  },
];
