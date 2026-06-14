export interface BankRowDto {
  id: number;
  name: string;
  foreignName: string;
  sortOrder: number;
  account?: string | null;
  currencies?: string | null;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — ترميز البنوك */
export const BANKS_SEED: BankRowDto[] = [
  { id: 1, name: 'بنك الاهلي 101', foreignName: 'National Bank 101', sortOrder: 1 },
  { id: 2, name: 'الراجحي 869', foreignName: 'Al Rajhi 869', sortOrder: 2 },
  { id: 3, name: 'بنك الرياض 20', foreignName: 'Riyad Bank 20', sortOrder: 3 },
  { id: 4, name: 'بنك سامبا 40', foreignName: 'Samba 40', sortOrder: 4 },
  { id: 5, name: 'البنك السعودي الفرنسي 55', foreignName: 'Banque Saudi Fransi 55', sortOrder: 5 },
];
