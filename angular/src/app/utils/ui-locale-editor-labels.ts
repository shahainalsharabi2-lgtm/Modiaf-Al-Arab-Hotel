import { SIDEBAR_NAV_KEYS, UI_CHROME_KEYS } from './ui-translation.constants';
import {
  uiTranslationScreenNavLabel,
} from './ui-translation-screen-labels.config';
import type { UiLocaleFilePayload } from './ui-translations-locale.util';

export type LocaleEditorSectionId = 'brandSubtitle' | 'sidebarNav' | 'chrome' | 'screenCopy';

export const UI_LOCALE_SECTION_LABELS: Record<
  LocaleEditorSectionId,
  { title: string; hint: string }
> = {
  brandSubtitle: {
    title: 'العنوان الفرعي للفندق',
    hint: 'يظهر تحت اسم الفندق في الشريط الجانبي',
  },
  sidebarNav: {
    title: 'أسماء القائمة الجانبية',
    hint: 'عناوين روابط التنقل الرئيسية',
  },
  chrome: {
    title: 'نصوص الواجهة العامة',
    hint: 'شريط الحساب، اللغة، الإشعارات، وأزرار التنقل',
  },
  screenCopy: {
    title: 'نصوص الشاشات',
    hint: 'عناوين وأزرار ورسائل كل صفحة في التطبيق',
  },
};

export const UI_LOCALE_BRAND_SUBTITLE_FIELD = {
  title: 'العنوان الفرعي للفندق',
  tech: 'brandSubtitle',
};

/** أسماء عربية للشاشات (المفتاح التقني screenCopy → screenId) — احتياطي عند غياب مسار القائمة */
export const UI_LOCALE_SCREEN_LABELS: Record<string, string> = {
  dashboard: 'الرئيسية',
  booking: 'الحجوزات / حجز جديد',
  bookings: 'الحجوزات / الحجوزات',
  rooms: 'الحجوزات / مخطط التوافر',
  reports: 'التقارير',
  settings: 'الإعدادات',
  roomDetails: 'الحجوزات / مخطط التوافر',
  roomForm: 'الحجوزات / مخطط التوافر',
  roomPreview: 'الحجوزات / مخطط التوافر',
  translationGuide: 'ترجمة واجهة النظام',
  groupBooking: 'الحجوزات / حجز مجموعة',
  revenueCard: 'الحجوزات / بطاقة إيراد',
  groupsList: 'الحجوزات / المجموعات',
  bookingsChart: 'الحجوزات / مخطط الحجوزات',
  roomsSchedule: 'الحجوزات / جدول الغرف',
  availabilityChart: 'الحجوزات / مخطط التوافر',
  bookingsInquiries: 'الحجوزات / الاستعلامات',
  residentGuestsData: 'الحجوزات / بيانات النزلاء الساكنين',
  cashierClosing: 'الكاشير / إغلاق الكاشير',
  servicesInvoice: 'الكاشير / فاتورة الخدمات',
  crmBlacklist: 'علاقات العملاء / القائمة السوداء',
  crmRepresentatives: 'علاقات العملاء / المندوبين',
  nightAuditInquiries: 'المراجع الليلي / الاستعلامات',
  hkTasks: 'الإشراف الداخلي / المهام',
  hkTaskRequest: 'الإشراف الداخلي / طلب مهمة',
  hkTaskRequests: 'الإشراف الداخلي / طلبات المهام',
  hkCheckRoomStatus: 'الإشراف الداخلي / التحقق من حالة الغرفة',
  hkMaintenanceRequests: 'الإشراف الداخلي / طلبات الصيانة',
  hkRoomInspectionItems: 'الإشراف الداخلي / عناصر فحص الغرف',
  hkRoomInspectionOps: 'الإشراف الداخلي / عمليات فحص الغرف',
  hkRoomConflicts: 'الإشراف الداخلي / تعارض الغرف',
};

const sidebarNavArabic = new Map(SIDEBAR_NAV_KEYS.map((k) => [k.routeKey, k.arabic]));
const chromeArabic = new Map(UI_CHROME_KEYS.map((k) => [k.key, k.arabic]));

export function localeEditorSectionTitle(section: LocaleEditorSectionId): string {
  return UI_LOCALE_SECTION_LABELS[section].title;
}

export function localeEditorSectionHint(section: LocaleEditorSectionId): string {
  return UI_LOCALE_SECTION_LABELS[section].hint;
}

export function localeEditorScreenTitle(screenId: string): string {
  const nav = uiTranslationScreenNavLabel(screenId, localeEditorSidebarNavLabel);
  if (nav) {
    return nav;
  }
  return UI_LOCALE_SCREEN_LABELS[screenId] ?? screenId;
}

export function localeEditorSidebarNavLabel(routeKey: string): string {
  return sidebarNavArabic.get(routeKey) ?? routeKey;
}

export function localeEditorChromeLabel(key: string): string {
  return chromeArabic.get(key) ?? key;
}

export function localeEditorReferenceHint(
  reference: UiLocaleFilePayload | null | undefined,
  section: 'brandSubtitle' | 'sidebarNav' | 'chrome' | 'screenCopy',
  key: string,
  screenId?: string,
): string | undefined {
  if (!reference) {
    return undefined;
  }
  if (section === 'brandSubtitle') {
    const v = reference.brandSubtitle?.trim();
    return v || undefined;
  }
  if (section === 'sidebarNav') {
    const v = reference.sidebarNav?.[key]?.trim();
    return v || sidebarNavArabic.get(key);
  }
  if (section === 'chrome') {
    const v = reference.chrome?.[key]?.trim();
    return v || chromeArabic.get(key);
  }
  if (section === 'screenCopy' && screenId) {
    const v = reference.screenCopy?.[screenId]?.[key]?.trim();
    return v || undefined;
  }
  return undefined;
}
