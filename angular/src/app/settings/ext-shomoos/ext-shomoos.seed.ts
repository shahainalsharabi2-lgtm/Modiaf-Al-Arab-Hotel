export interface ExtShomoosLinkRowDto {
  id: number;
  number: string;
  keyName: string;
  value: string;
  description: string;
  isActive: boolean;
}

/** بيانات ثابتة — اعداد الربط مع شموس (فارغة كما في Ultimate) */
export const EXT_SHOMOOS_LINK_SEED: ExtShomoosLinkRowDto[] = [];

export const EXT_SHOMOOS_KEY_OPTIONS = [
  'UserName',
  'Password',
  'BranchCode',
  'HotelCode',
  'ApiKey',
] as const;
