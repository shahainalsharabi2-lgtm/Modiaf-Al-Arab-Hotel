export type CrmProfileRequirementKey = 'onCreate' | 'onCheckIn' | 'onNightAudit';

export interface CrmProfileFieldSetting {
  id: string;
  labelKey: string;
  used: boolean;
  requirements: Record<CrmProfileRequirementKey, boolean>;
  /** مجموعة فرعية — مثل الهويات */
  subItemCount?: number;
  expanded?: boolean;
}

export const CRM_PROFILE_REQUIREMENT_KEYS: readonly CrmProfileRequirementKey[] = [
  'onCreate',
  'onCheckIn',
  'onNightAudit',
];

export const CRM_PROFILE_FIELD_DEFAULTS: CrmProfileFieldSetting[] = [
  {
    id: 'firstName',
    labelKey: 'fieldFirstName',
    used: false,
    requirements: { onCreate: false, onCheckIn: false, onNightAudit: false },
  },
  {
    id: 'middleName',
    labelKey: 'fieldMiddleName',
    used: false,
    requirements: { onCreate: false, onCheckIn: false, onNightAudit: false },
  },
  {
    id: 'lastName',
    labelKey: 'fieldLastName',
    used: true,
    requirements: { onCreate: true, onCheckIn: true, onNightAudit: true },
  },
  {
    id: 'gender',
    labelKey: 'fieldGender',
    used: true,
    requirements: { onCreate: true, onCheckIn: true, onNightAudit: true },
  },
  {
    id: 'country',
    labelKey: 'fieldCountry',
    used: false,
    requirements: { onCreate: false, onCheckIn: false, onNightAudit: false },
  },
  {
    id: 'nationality',
    labelKey: 'fieldNationality',
    used: true,
    requirements: { onCreate: false, onCheckIn: true, onNightAudit: true },
  },
  {
    id: 'phoneNumbers',
    labelKey: 'fieldPhoneNumbers',
    used: false,
    requirements: { onCreate: false, onCheckIn: false, onNightAudit: false },
  },
  {
    id: 'identities',
    labelKey: 'fieldIdentities',
    used: true,
    requirements: { onCreate: false, onCheckIn: true, onNightAudit: false },
    subItemCount: 13,
  },
  {
    id: 'status',
    labelKey: 'fieldStatus',
    used: false,
    requirements: { onCreate: false, onCheckIn: false, onNightAudit: false },
  },
  {
    id: 'photo',
    labelKey: 'fieldPhoto',
    used: false,
    requirements: { onCreate: false, onCheckIn: false, onNightAudit: false },
  },
  {
    id: 'activateRecord',
    labelKey: 'fieldActivateRecord',
    used: false,
    requirements: { onCreate: false, onCheckIn: false, onNightAudit: false },
  },
  {
    id: 'vipLevel',
    labelKey: 'fieldVipLevel',
    used: true,
    requirements: { onCreate: false, onCheckIn: true, onNightAudit: false },
  },
  {
    id: 'accountCode',
    labelKey: 'fieldAccountCode',
    used: false,
    requirements: { onCreate: false, onCheckIn: false, onNightAudit: false },
  },
  {
    id: 'notes',
    labelKey: 'fieldNotes',
    used: false,
    requirements: { onCreate: false, onCheckIn: false, onNightAudit: false },
  },
  {
    id: 'linkedTravelers',
    labelKey: 'fieldLinkedTravelers',
    used: false,
    requirements: { onCreate: false, onCheckIn: false, onNightAudit: false },
  },
  {
    id: 'email',
    labelKey: 'fieldEmail',
    used: false,
    requirements: { onCreate: false, onCheckIn: false, onNightAudit: false },
  },
  {
    id: 'addresses',
    labelKey: 'fieldAddresses',
    used: false,
    requirements: { onCreate: false, onCheckIn: false, onNightAudit: false },
  },
  {
    id: 'birthDate',
    labelKey: 'fieldBirthDate',
    used: false,
    requirements: { onCreate: false, onCheckIn: false, onNightAudit: false },
  },
  {
    id: 'language',
    labelKey: 'fieldLanguage',
    used: false,
    requirements: { onCreate: false, onCheckIn: false, onNightAudit: false },
  },
];
