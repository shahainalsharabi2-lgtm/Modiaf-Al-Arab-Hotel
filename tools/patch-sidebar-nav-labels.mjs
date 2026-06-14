import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const patches = {
  dashboard: { ar: 'الرئيسية', en: 'Home' },
  frontDeskGroup: { ar: 'المكاتب الأمامية', en: 'Front Office' },
  bookingsGroup: { ar: 'الحجوزات', en: 'Reservations' },
  cashierGroup: { ar: 'الكاشير', en: 'Cashier' },
  crmGroup: { ar: 'علاقات العملاء', en: 'Customer Relations' },
  nightAuditorGroup: { ar: 'المراجع الليلي', en: 'Night Auditor' },
  housekeepingGroup: { ar: 'الإشراف الداخلي', en: 'Housekeeping' },
  settings: { ar: 'الإعدادات', en: 'Settings' },
  accountsGroup: { ar: 'الحسابات', en: 'Accounts' },
  reports: { ar: 'التقارير', en: 'Reports' },
  navCashierRecords: { ar: 'سجلات الدفع', en: 'Payment records' },
  navCrmGuests: { ar: 'سجل النزلاء', en: 'Guest registry' },
  navNightAuditReports: { ar: 'تقارير المراجعة الليلية', en: 'Night audit reports' },
  navAccountsReports: { ar: 'التقارير المالية', en: 'Financial reports' },
};

const files = [
  'angular/src/assets/ui-translations/ar.json',
  'angular/src/assets/ui-translations/en.json',
  'angular/src/assets/ui-translations/fr.json',
  'angular/src/assets/ui-translations/id.json',
  'angular/src/assets/ui-translations/tr.json',
  'angular/src/assets/ui-translations/zh-Hans.json',
  'angular/src/assets/ui-translations/ui-translations/ar.json',
  'angular/src/assets/ui-translations/ui-translations/en.json',
  'angular/src/assets/ui-translations/ui-translations/fr.json',
  'angular/src/assets/ui-translations/ui-translations/id.json',
  'angular/src/assets/ui-translations/ui-translations/tr.json',
  'angular/src/assets/ui-translations/ui-translations/zh-Hans.json',
  'aspnet-core/src/Modiaf.Al.Arab.Hotel.HttpApi.Host/UiTranslations/ar.json',
  'aspnet-core/src/Modiaf.Al.Arab.Hotel.HttpApi.Host/UiTranslations/en.json',
  'aspnet-core/src/Modiaf.Al.Arab.Hotel.HttpApi.Host/UiTranslations/fr.json',
  'aspnet-core/src/Modiaf.Al.Arab.Hotel.HttpApi.Host/UiTranslations/id.json',
  'aspnet-core/src/Modiaf.Al.Arab.Hotel.HttpApi.Host/UiTranslations/tr.json',
  'aspnet-core/src/Modiaf.Al.Arab.Hotel.HttpApi.Host/UiTranslations/zh-Hans.json',
];

for (const rel of files) {
  const filePath = path.join(root, rel);
  if (!fs.existsSync(filePath)) {
    continue;
  }
  const locale = rel.includes('/ar.json') ? 'ar' : rel.includes('/en.json') ? 'en' : 'en';
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
