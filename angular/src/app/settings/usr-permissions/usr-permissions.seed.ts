import { RESERVATIONS_PERMISSIONS_SEED } from './usr-permissions-reservations.seed';

export type PermissionActionKey =
  | 'add'
  | 'view'
  | 'details'
  | 'edit'
  | 'delete'
  | 'viewPage'
  | 'changeStatus'
  | 'allow';

export interface PermissionActionSeed {
  id: string;
  label?: string;
  labelKey?: string;
}

export interface PermissionEntitySeed {
  id: string;
  name: string;
  actions: PermissionActionSeed[];
}

export interface PermissionTreeNodeSeed {
  id: string;
  labelKey: string;
  entities: PermissionEntitySeed[];
}

function stdAct(key: PermissionActionKey): PermissionActionSeed {
  return {
    id: key,
    labelKey: `usrPermAction${key.charAt(0).toUpperCase()}${key.slice(1)}`,
  };
}

function entity(id: string, name: string, actions: PermissionActionSeed[]): PermissionEntitySeed {
  return { id, name, actions };
}

const CRUD = (): PermissionActionSeed[] => [
  stdAct('add'),
  stdAct('view'),
  stdAct('details'),
  stdAct('edit'),
  stdAct('delete'),
];

const CRUD_PAGE = (): PermissionActionSeed[] => [
  stdAct('viewPage'),
  stdAct('add'),
  stdAct('view'),
  stdAct('details'),
  stdAct('edit'),
  stdAct('delete'),
];

const CRUD_NO_DELETE = (): PermissionActionSeed[] => [
  stdAct('add'),
  stdAct('view'),
  stdAct('details'),
  stdAct('edit'),
];

const VIEW_ONLY = (): PermissionActionSeed[] => [stdAct('view')];

const INQUIRY = (): PermissionActionSeed[] => [stdAct('viewPage'), stdAct('details'), stdAct('view')];

const SYSTEM_SETTINGS = (): PermissionActionSeed[] => [
  stdAct('view'),
  stdAct('details'),
  stdAct('edit'),
  stdAct('delete'),
];

const LINK_SETTINGS = (): PermissionActionSeed[] => [
  stdAct('details'),
  stdAct('allow'),
  stdAct('add'),
  stdAct('edit'),
  stdAct('view'),
];

const ALLOW_ONLY = (): PermissionActionSeed[] => [stdAct('details'), stdAct('allow')];

/** شجرة الصلاحيات — بيانات الإعدادات مطابقة لـ Ultimate */
export const PERMISSION_TREE_SEED: PermissionTreeNodeSeed[] = [
  {
    id: 'settings',
    labelKey: 'usrPermTreeSettings',
    entities: [
      entity('tax-types', 'أنواع الضرائب', CRUD()),
      entity('tax-account-link', 'ربط الضرائب بالحسابات', CRUD()),
      entity('tax-classification', 'تصنيف الضرائب', CRUD()),
      entity('tax-brackets', 'الشرائح الضريبيه', CRUD()),
      entity('tax-definitions', 'تعريفات الضرائب', CRUD()),
      entity('rooms', 'الغرف', CRUD_PAGE()),
      entity('room-types', 'أنواع الغرف', CRUD_PAGE()),
      entity('building-groups', 'مجموعات المباني', CRUD()),
      entity('floors', 'الطوابق', CRUD()),
      entity('buildings', 'المباني', CRUD()),
      entity('packages', 'الباقات', CRUD_PAGE()),
      entity('price-code', 'رمز السعر', [...CRUD_PAGE(), stdAct('changeStatus')]),
      entity('package-groups', 'مجموعات الباقات', CRUD_PAGE()),
      entity('price-category', 'فئة السعر', CRUD_PAGE()),
      entity('seasons', 'المواسم', CRUD_PAGE()),
      entity('item-types', 'انواع الاصناف', CRUD_PAGE()),
      entity('sold-items', 'الاصناف المباعة', CRUD_PAGE()),
      entity('child-age-category', 'فئة الاطفال العمرية', CRUD_PAGE()),
      entity('price-inquiry', 'الاستعلام عن السعر', INQUIRY()),
      entity('airports', 'المطارات', CRUD()),
      entity('transport', 'وسائل النقل', CRUD()),
      entity('accounts', 'الحسابات', CRUD()),
      entity('account-groups', 'مجموعة الحسابات', CRUD()),
      entity('sub-account-groups', 'مجموعة الحسابات الفرعيه', CRUD()),
      entity('banks', 'البنوك', CRUD()),
      entity('bank-accounts', 'الحسابات البنكية', CRUD()),
      entity('bank-currencies', 'عملات البنوك', CRUD()),
      entity('routing-codes', 'تعليمات التوجيه', CRUD()),
      entity('market-codes', 'رموز السوق', CRUD()),
      entity('booking-sources', 'مصادر الحجز', CRUD()),
      entity('market-categories', 'فئات السوق', CRUD()),
      entity('cashier-coding', 'ترميز الكاشير', CRUD()),
      entity('confirmation-messages', 'تاكيد الرسائل', CRUD()),
      entity('advance-payment-policies', 'سياسة الدفع المقدم', CRUD()),
      entity('booking-types', 'أنواع الحجز', CRUD_NO_DELETE()),
      entity('account-tree', 'شجرة الحسابات', VIEW_ONLY()),
      entity('shomoos-link', 'اعداد الربط مع شموس', LINK_SETTINGS()),
      entity('tourism-link', 'اعداد الربط مع السياحي', LINK_SETTINGS()),
      entity('omani-police-link', 'اعداد الربط مع الشرطة العمانيه', LINK_SETTINGS()),
      entity('general-link-code', 'الكود العام للربط', ALLOW_ONLY()),
      entity('service-logs', 'سجلات الخدمة الخارجية', ALLOW_ONLY()),
      entity('shomoos-tourism-sync', 'مزامنة بيانات شموس والسياحة', ALLOW_ONLY()),
      entity('payment-gateway', 'إعدادات بوابة الدفع', ALLOW_ONLY()),
      entity('hotel-chains', 'سلاسل الفنادق', CRUD()),
      entity('hotels', 'الفنادق', CRUD()),
      entity('credit-card-types', 'انواع بطاقات الائتمان', CRUD()),
      entity('facilities', 'المرافق', CRUD()),
      entity('world', 'العالم', CRUD()),
      entity('landmarks', 'مواقع المعالم', CRUD()),
      entity('countries', 'الدول', CRUD()),
      entity('provinces', 'المحافظات', CRUD()),
      entity('cities', 'المدن', CRUD()),
      entity('areas', 'المناطق', CRUD()),
      entity('payment-methods', 'طرق الدفع', CRUD()),
      entity('languages', 'اللغات', CRUD()),
      entity('currencies', 'العملات', CRUD()),
      entity('departments', 'الأقسام', CRUD()),
      entity('system-settings', 'اعدادات النظام', SYSTEM_SETTINGS()),
      entity('sequence-settings', 'إعدادات التسلسل', CRUD()),
      entity('accounting-link', 'إعدادات الربط مع النظام المحاسبي', CRUD()),
      entity('agent-commissions', 'خطط العمولات', CRUD_NO_DELETE()),
      entity('early-arrival', 'اعدادات الوصول المبكر', CRUD()),
      entity('employees', 'الموظفون', CRUD()),
      entity('geo-location', 'الموقع الجغرافي', VIEW_ONLY()),
      entity('room-booking-statuses', 'إعدادات خالات الغرف والحجوزات', CRUD()),
      entity('layout-filter-perms', 'Permission.LayoutFilterPermissions', CRUD()),
      entity('visit-purpose', 'الغرض من الزيارة', CRUD()),
      entity('nationalities', 'الجنسيات', CRUD()),
      entity('relationships', 'صلة القرابه', CRUD()),
      entity('identity-types', 'أنواع الهوية', CRUD()),
      entity('preference-types', 'انواع التفضيلات', CRUD()),
      entity('preference-category', 'فئة التفضيلات', CRUD()),
      entity('customer-classification', 'تصنيف العملاء', CRUD()),
      entity('age-categories', 'الفئات العمريه', CRUD()),
      entity('floor-types', 'أنواع الطوابق', CRUD()),
      entity('room-design', 'تصميم الغرفة', CRUD()),
      entity('room-features', 'مميزات الغرفة', CRUD()),
      entity('room-locations', 'مواقع الغرف', CRUD()),
      entity('room-views', 'مناظر الغرف', CRUD()),
      entity('room-categories', 'فئات الغرف', CRUD()),
      entity('room-maintenance-reasons', 'أسباب صيانة الغرف', CRUD()),
      entity('room-transfer-reasons', 'أسباب نقل الغرف', CRUD()),
    ],
  },
  {
    id: 'reservations',
    labelKey: 'usrPermTreeReservations',
    entities: RESERVATIONS_PERMISSIONS_SEED,
  },
  { id: 'reports', labelKey: 'usrPermTreeReports', entities: [] },
  { id: 'crm', labelKey: 'usrPermTreeCrm', entities: [] },
  { id: 'night-auditor', labelKey: 'usrPermTreeNightAuditor', entities: [] },
  { id: 'housekeeping', labelKey: 'usrPermTreeHousekeeping', entities: [] },
  { id: 'front-office', labelKey: 'usrPermTreeFrontOffice', entities: [] },
  { id: 'cashier', labelKey: 'usrPermTreeCashier', entities: [] },
  { id: 'accounts-module', labelKey: 'usrPermTreeAccounts', entities: [] },
  { id: 'hotel-perms', labelKey: 'usrPermTreeHotelPerms', entities: [] },
  { id: 'item-type-perms', labelKey: 'usrPermTreeItemTypePerms', entities: [] },
];

export function buildInitialPermissionState(
  nodes: PermissionTreeNodeSeed[],
): Record<string, Record<string, boolean>> {
  const state: Record<string, Record<string, boolean>> = {};
  for (const node of nodes) {
    for (const entityRow of node.entities) {
      state[entityRow.id] = {};
      for (const action of entityRow.actions) {
        state[entityRow.id][action.id] = true;
      }
    }
  }
  return state;
}
