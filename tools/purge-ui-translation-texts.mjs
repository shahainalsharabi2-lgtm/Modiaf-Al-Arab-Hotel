/**
 * يفرّغ حقول ترجمة محددة (عربي/إنجليزي/باقي اللغات) عبر مطابقة النص.
 *
 * Usage:
 *   node tools/purge-ui-translation-texts.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');

const LOCALES = ['ar', 'en', 'fr', 'id', 'tr', 'am'];

const TEXTS_TO_PURGE = [
  'اختر لغة عرض القائمة والنصوص. الترجمات (فرنسية / إندونيسية / تركية / صينية) من ملفات JSON في المشروع — لا حاجة لإدخال نصوص هنا.',
  'نصوص التركية والصينية تُحمَّل من ملفات JSON في الخادم (Domain.Shared/UiTranslations/Files). لتعديلها عدّل الملفات ثم أعد بناء API.',
  'تطبيق JSON على الحقول',
  'عرض فقط — الإضافة والتعديل والحذف متاحة لمدير النظام فقط',
  '— اختر إطلالة الغرفة —',
  '123',
  'صورة العلم كبيرة — اختر ملف ye.svg / eg.svg من القائمة، أو حدّث خادم API لحفظ الصور المرفوعة.',
  'لم تُحفظ رمز الدولة أو العلم في SQL — أعد المحاولة أو حدّث خادم API.',
  'خطأ في الخادم — أوقف Visual Studio ثم أعد بناء وتشغيل HttpApi.Host',
  'جدول سجل النزلاء غير موجود — شغّل DbMigrator ثم أعد تشغيل الخادم',
  '/welcome',
  'يجب أن يبدأ بـ (71, 73, 77, 78)',
  'غير مؤكد: يُلغى الحجز تلقائياً بعد ساعة واحدة من انتهاء موعد الإقامة إن لم يُسكّن النزيل.',
  'من الإعدادات ← ترجمة واجهة النظام يمكنك البحث عن أي نص وتعديله في جدول: عربي | إنجليزي | لغة التحرير.',
  'اضغط زر الحفظ 💾 على حافة الشاشة مرة ثانية لحفظ كل التغييرات والخروج من وضع الترجمة.',
  'اضغط أي نص عربي في الصفحة الحالية — يتحول إلى حقل. اكتب الترجمة باللغة المختارة.',
  // English equivalents (for en.json matching)
  'Turkish and Chinese texts are loaded from JSON files in the server (Domain.Shared/UiTranslations/Files).',
  'Apply JSON to fields',
  'View only — Adding, editing, and deleting are available to the system administrator only',
  '— Choose the view of the room —',
  'Flag image is large — choose ye.svg / eg.svg file from the list, or update the API server to save uploaded images.',
  'The country code or flag was not saved in SQL — retry or update the API server.',
  'Server Error — Stop Visual Studio and then rebuild and run HttpApi.Host',
  'Guest log table not found — Run DbMigrator and restart the server',
  'Must start with (71, 73, 77, 78)',
  'Unconfirmed: The reservation will be automatically canceled one hour after the end of the stay if the guest is not accommodated.',
  'Settings → UI translations: search any string and edit in the Arabic | English | target language columns.',
  'Click the save 💾 edge button again to flush all changes and exit translation mode.',
  'Click any Arabic label on the current page — it becomes an input. Type the translation in the selected language.',
  'Encodings',
];

const purgeSet = new Set(TEXTS_TO_PURGE.map(normalize));

const targetDirs = [
  path.join(repoRoot, 'angular/src/assets/ui-translations'),
  path.join(repoRoot, 'aspnet-core/src/Modiaf.Al.Arab.Hotel.Domain.Shared/Localization/Abp/Hotel'),
  path.join(repoRoot, 'aspnet-core/src/Modiaf.Al.Arab.Hotel.HttpApi.Host/UiTranslations'),
];

function normalize(value) {
  return String(value ?? '')
    .replace(/\uFEFF/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function collectPaths(value, basePath, paths) {
  if (typeof value === 'string') {
    if (purgeSet.has(normalize(value))) {
      paths.add(basePath);
    }
    return;
  }
  if (!value || typeof value !== 'object') {
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    const nextPath = basePath ? `${basePath}.${key}` : key;
    collectPaths(child, nextPath, paths);
  }
}

function setByPath(root, dotPath, newValue) {
  const parts = dotPath.split('.');
  let current = root;
  for (let i = 0; i < parts.length - 1; i++) {
    current = current[parts[i]];
    if (!current) {
      return false;
    }
  }
  const last = parts[parts.length - 1];
  if (!(last in current)) {
    return false;
  }
  current[last] = newValue;
  return true;
}

function main() {
  const arPath = path.join(targetDirs[0], 'ar.json');
  const enPath = path.join(targetDirs[0], 'en.json');
  const pathsToClear = new Set();
  collectPaths(readJson(arPath), '', pathsToClear);
  collectPaths(readJson(enPath), '', pathsToClear);

  console.log(`Paths to clear: ${pathsToClear.size}`);
  for (const dotPath of [...pathsToClear].sort()) {
    console.log(`  - ${dotPath}`);
  }

  let filesUpdated = 0;
  let fieldsCleared = 0;

  for (const dir of targetDirs) {
    for (const locale of LOCALES) {
      const filePath = path.join(dir, `${locale}.json`);
      if (!fs.existsSync(filePath)) {
        continue;
      }
      const data = readJson(filePath);
      let changed = 0;
      for (const dotPath of pathsToClear) {
        if (setByPath(data, dotPath, '')) {
          changed += 1;
        }
      }
      if (changed > 0) {
        writeJson(filePath, data);
        filesUpdated += 1;
        fieldsCleared += changed;
        console.log(`cleared ${changed} field(s) in ${filePath}`);
      }
    }
  }

  console.log(`Done. ${filesUpdated} file(s), ${fieldsCleared} field update(s).`);
}

main();
