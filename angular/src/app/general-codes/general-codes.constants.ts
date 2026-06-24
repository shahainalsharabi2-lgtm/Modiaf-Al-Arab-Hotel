export type GeneralCodeCategoryId =
  | 'purposes-of-stay'
  | 'nationalities'
  | 'relationship-types'
  | 'identification-types'
  | 'preference-type'
  | 'preference-category'
  | 'vip-levels'
  | 'age-qualifying-codes'
  | 'floor-types'
  | 'room-architecture'
  | 'room-features'
  | 'room-locations'
  | 'room-views'
  | 'room-classes'
  | 'room-maintenance-reasons'
  | 'room-move-reasons';

export interface GeneralCodeTabConfig {
  id: GeneralCodeCategoryId;
  labelKey: string;
  descriptionKey: string;
  icon: string;
}

export const GENERAL_CODE_TABS: readonly GeneralCodeTabConfig[] = [
  { id: 'purposes-of-stay', labelKey: 'tabPurposesOfStay', descriptionKey: 'descPurposesOfStay', icon: 'fas fa-plane-arrival' },
  { id: 'nationalities', labelKey: 'tabNationalities', descriptionKey: 'descNationalities', icon: 'fas fa-globe' },
  { id: 'relationship-types', labelKey: 'tabRelationshipTypes', descriptionKey: 'descRelationshipTypes', icon: 'fas fa-users' },
  { id: 'identification-types', labelKey: 'tabIdentificationTypes', descriptionKey: 'descIdentificationTypes', icon: 'fas fa-id-card' },
  { id: 'preference-type', labelKey: 'tabPreferenceType', descriptionKey: 'descPreferenceType', icon: 'fas fa-star' },
  { id: 'preference-category', labelKey: 'tabPreferenceCategory', descriptionKey: 'descPreferenceCategory', icon: 'fas fa-tags' },
  { id: 'vip-levels', labelKey: 'tabVipLevels', descriptionKey: 'descVipLevels', icon: 'fas fa-crown' },
  { id: 'age-qualifying-codes', labelKey: 'tabAgeQualifyingCodes', descriptionKey: 'descAgeQualifyingCodes', icon: 'fas fa-child' },
  { id: 'floor-types', labelKey: 'tabFloorTypes', descriptionKey: 'descFloorTypes', icon: 'fas fa-layer-group' },
  { id: 'room-architecture', labelKey: 'tabRoomArchitecture', descriptionKey: 'descRoomArchitecture', icon: 'fas fa-door-open' },
  { id: 'room-features', labelKey: 'tabRoomFeatures', descriptionKey: 'descRoomFeatures', icon: 'fas fa-concierge-bell' },
  { id: 'room-locations', labelKey: 'tabRoomLocations', descriptionKey: 'descRoomLocations', icon: 'fas fa-map-marker-alt' },
  { id: 'room-views', labelKey: 'tabRoomViews', descriptionKey: 'descRoomViews', icon: 'fas fa-eye' },
  { id: 'room-classes', labelKey: 'tabRoomClasses', descriptionKey: 'descRoomClasses', icon: 'fas fa-bed' },
  { id: 'room-maintenance-reasons', labelKey: 'tabRoomMaintenanceReasons', descriptionKey: 'descRoomMaintenanceReasons', icon: 'fas fa-tools' },
  { id: 'room-move-reasons', labelKey: 'tabRoomMoveReasons', descriptionKey: 'descRoomMoveReasons', icon: 'fas fa-exchange-alt' },
] as const;

export const GENERAL_CODE_CATEGORIES_WITHOUT_FNAME = new Set<GeneralCodeCategoryId>([
  'purposes-of-stay',
  'nationalities',
  'relationship-types',
  'identification-types',
  'preference-type',
  'vip-levels',
  'age-qualifying-codes',
  'floor-types',
  'room-features',
  'room-locations',
  'room-views',
  'room-classes',
  'room-maintenance-reasons',
  'room-move-reasons',
]);

export const GENERAL_CODE_CATEGORIES_WITHOUT_DESCRIPTION = new Set<GeneralCodeCategoryId>([
  'purposes-of-stay',
  'relationship-types',
  'identification-types',
  'preference-type',
  'preference-category',
  'vip-levels',
  'age-qualifying-codes',
  'floor-types',
  'room-features',
  'room-classes',
]);

export function generalCodeShowsForeignName(category: GeneralCodeCategoryId): boolean {
  return !GENERAL_CODE_CATEGORIES_WITHOUT_FNAME.has(category);
}

export function generalCodeShowsDescription(category: GeneralCodeCategoryId): boolean {
  return !GENERAL_CODE_CATEGORIES_WITHOUT_DESCRIPTION.has(category);
}
