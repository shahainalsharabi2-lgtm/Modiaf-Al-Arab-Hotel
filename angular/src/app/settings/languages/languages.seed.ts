export interface LanguageRowDto {
  id: number;
  code: string;
  name: string;
  foreignName?: string | null;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — اللغات */
export const LANGUAGES_SEED: LanguageRowDto[] = [
  {
    id: 1,
    code: 'ar',
    name: 'العربية',
    foreignName: 'Arabic',
  },
];
