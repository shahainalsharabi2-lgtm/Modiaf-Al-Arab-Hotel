import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const patches = {
  navRoomPlan: { ar: 'مخطط الغرف', en: 'Room plan' },
  navRoomRack: { ar: 'رف الغرف', en: 'Room rack' },
  navGuestValuables: { ar: 'أمانات النزلاء', en: 'Guest valuables' },
  navKeyManagement: { ar: 'إدارة المفاتيح', en: 'Key management' },
  navGroupBooking: { ar: 'حجز مجموعة', en: 'Group reservation' },
  navRevenueCard: { ar: 'بطاقة إيراد', en: 'Revenue card' },
  navGroups: { ar: 'المجموعات', en: 'Groups' },
  navAllotmentContracts: { ar: 'عقود الألوتمنت', en: 'Allotment contracts' },
  navBookingsChart: { ar: 'مخطط الحجوزات', en: 'Reservations chart' },
  navRoomsSchedule: { ar: 'جدول الغرف', en: 'Rooms schedule' },
  navAvailabilityChart: { ar: 'مخطط التوافر', en: 'Availability chart' },
  navBookingsInquiries: { ar: 'الاستعلامات', en: 'Inquiries' },
  navResidentGuestsData: { ar: 'بيانات النزلاء الساكنين', en: 'Resident guests data' },
  navRentPosting: { ar: 'ترحيل الإيجار', en: 'Rent posting' },
  navPreviousInvoices: { ar: 'الفواتير السابقة', en: 'Previous invoices' },
  navInvoicesNotifications: { ar: 'الفواتير والإشعارات', en: 'Invoices and notifications' },
  navServicesInvoice: { ar: 'فاتورة الخدمات', en: 'Services invoice' },
  navCashierClosing: { ar: 'إغلاق الكاشier', en: 'Cashier closing' },
  navCrmProfileSettings: { ar: 'إعدادات الملف الشخصي', en: 'Profile settings' },
  navCrmIndividuals: { ar: 'الأفراد', en: 'Individuals' },
  navCrmCompanies: { ar: 'الشركات', en: 'Companies' },
  navCrmAgents: { ar: 'الوكلاء', en: 'Agents' },
  navCrmRepresentatives: { ar: 'المندوبين', en: 'Representatives' },
  navCrmBlacklist: { ar: 'القائمة السوداء', en: 'Blacklist' },
  navNightAuditorSettings: { ar: 'إعدادات المراجع الليلي', en: 'Night auditor settings' },
  navNightAuditReservations: { ar: 'مراجعة الحجوزات', en: 'Review reservations' },
  navNightAuditProcedure: { ar: 'إجراء المراجع الليلي', en: 'Night auditor procedure' },
  navNightAuditRoomMovement: { ar: 'حركة الغrooms', en: 'Room movement' },
  navNightAuditInquiries: { ar: 'الاستعلامات', en: 'Inquiries' },
  navHkTasks: { ar: 'المهام', en: 'Tasks' },
  navHkTaskRequest: { ar: 'طلب مهمة', en: 'Task request' },
  navHkRoomConflicts: { ar: 'تعارض الغرف', en: 'Room conflicts' },
  navHkTaskRequests: { ar: 'طلبات المهام', en: 'Task requests' },
  navHkCheckRoomStatus: { ar: 'التحقق من حالة الغرفة', en: 'Check room status' },
  navHkEmployeeTasks: { ar: 'مهام الموظف', en: 'Employee tasks' },
  navHkMaintenanceRequests: { ar: 'طلبات الصيانة', en: 'Maintenance requests' },
  navHkRoomInspectionItems: { ar: 'عناصر فحص الغرف', en: 'Room inspection items' },
  navHkRoomInspectionOps: { ar: 'عمليات فحص الغرف', en: 'Room inspection operations' },
  navSettingsSystemSetup: { ar: 'تهيئة النظام', en: 'System configuration' },
  navSettingsMasterData: { ar: 'المدخلات', en: 'Master data' },
  navSettingsRoomMgmt: { ar: 'إدارة الغرف', en: 'Room management' },
  navSettingsTax: { ar: 'تهيئة الضرائب', en: 'Tax configuration' },
  navSettingsPricing: { ar: 'إدارة التسعير', en: 'Pricing management' },
  navSettingsExternal: { ar: 'الخدمات الخارجية', en: 'External services' },
  navSettingsUsers: { ar: 'إدارة المستخدمين', en: 'User management' },
  navDebitAccounts: { ar: 'الحسابات المدينة', en: 'Debit accounts' },
  navAccountsReceivable: { ar: 'الذمم المدينة', en: 'Accounts receivable' },
  navAgentAccounts: { ar: 'حسابات الوكلاء', en: 'Agent accounts' },
  navOpeningBalances: { ar: 'الأرصدة الافتتاحية', en: 'Opening balances' },
  navChartOfAccountsLink: { ar: 'ربط الدليل المحاسبي', en: 'Chart of accounts link' },
  navAccountingEntries: { ar: 'القيود المحاسبية', en: 'Accounting entries' },
  navReportsAdvancedCenter: { ar: 'مركز التقارير المتقدم', en: 'Advanced reports center' },
  navReportsTemplate: { ar: 'نموذج التقرير', en: 'Report template' },
  navReportsManagement: { ar: 'إدارة التقارير', en: 'Reports management' },
  navReportStayingList: { ar: 'تقرير المقيمين', en: 'Staying guests report' },
  navReportStayingSummary: { ar: 'ملخص المقيمين', en: 'Staying summary' },
  navReportDeparting: { ar: 'تقرير المغادرين', en: 'Departures report' },
  navReportBookings: { ar: 'تقرير الحجوزات', en: 'Bookings report' },
  navReportCancelled: { ar: 'الحجوزات الملغاة', en: 'Cancelled bookings' },
  navReportNoShow: { ar: 'لم يحضر', en: 'No-show' },
  rooms: { ar: 'مخطط التوافر', en: 'Availability chart' },
  database: { ar: 'مخطط الحجوزات', en: 'Reservations chart' },
};

// Fix typos in patch script
patches.navCashierClosing.ar = 'إغلاق الكاشير';
patches.navNightAuditRoomMovement.ar = 'حركة الغرف';

const files = [
  'angular/src/assets/ui-translations/ar.json',
  'angular/src/assets/ui-translations/en.json',
  'angular/src/assets/ui-translations/fr.json',
  'aspnet-core/src/Modiaf.Al.Arab.Hotel.HttpApi.Host/UiTranslations/ar.json',
  'aspnet-core/src/Modiaf.Al.Arab.Hotel.HttpApi.Host/UiTranslations/en.json',
  'aspnet-core/src/Modiaf.Al.Arab.Hotel.HttpApi.Host/UiTranslations/fr.json',
];

for (const rel of files) {
  const filePath = path.join(root, rel);
  if (!fs.existsSync(filePath)) {
    continue;
  }
  const locale = rel.includes('/ar.json') ? 'ar' : 'en';
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!data.sidebarNav) {
    data.sidebarNav = {};
  }
  for (const [key, labels] of Object.entries(patches)) {
    data.sidebarNav[key] = labels[locale] ?? labels.en;
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('patched', rel);
}
