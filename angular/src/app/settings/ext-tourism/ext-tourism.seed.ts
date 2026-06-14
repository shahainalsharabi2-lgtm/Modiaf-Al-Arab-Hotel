export interface ExtTourismLinkRowDto {
  id: number;
  number: string;
  keyName: string;
  value: string;
  description: string;
  isActive: boolean;
}

/** بيانات ثابتة — اعداد الربط مع السياحه (فارغة كما في Ultimate) */
export const EXT_TOURISM_LINK_SEED: ExtTourismLinkRowDto[] = [];

export const EXT_TOURISM_KEY_OPTIONS = [
  'UserName',
  'Password',
  'BranchCode',
  'HotelCode',
  'ApiKey',
  'LicenseNo',
] as const;
