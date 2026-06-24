/**
 * استيراد ترجمة لغة من ملف CSV (أعمدة: عربي؛ إنجليزي؛ الترجمة)
 * الربط بالمفاتيح عبر مطابقة النص العربي + الإنجليزي مع ar.json و en.json
 *
 * Usage:
 *   node tools/import-ui-translations-csv.mjs "path/to/file.csv" fr
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');

const locale = process.argv[3] ?? 'fr';
const csvPath = process.argv[2];

if (!csvPath) {
  console.error('Usage: node tools/import-ui-translations-csv.mjs <csv-file> [locale]');
  process.exit(1);
}

const assetsDir = path.join(repoRoot, 'angular/src/assets/ui-translations');
const sharedDir = path.join(
  repoRoot,
  'aspnet-core/src/Modiaf.Al.Arab.Hotel.Domain.Shared/Localization/Abp/Hotel',
);
const hostDir = path.join(
  repoRoot,
  'aspnet-core/src/Modiaf.Al.Arab.Hotel.HttpApi.Host/UiTranslations',
);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function normalize(value) {
  return String(value ?? '')
    .replace(/\uFEFF/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

function parseCsvLine(line) {
  const trimmed = line.replace(/\uFEFF/g, '').trim();
  if (!trimmed) {
    return null;
  }
  const parts = trimmed.split(';');
  if (parts.length < 3) {
    return null;
  }
  return {
    ar: parts[0],
    en: parts.slice(1, -1).join(';'),
    translation: parts[parts.length - 1],
  };
}

function walkEntries(arFile, enFile, visit) {
  for (const key of Object.keys(arFile.sidebarNav ?? {})) {
    visit({
      section: 'sidebarNav',
      key,
      ar: arFile.sidebarNav[key],
      en: enFile.sidebarNav?.[key] ?? '',
    });
  }

  if (arFile.brandSubtitle !== undefined || enFile.brandSubtitle !== undefined) {
    visit({
      section: 'brandSubtitle',
      key: '',
      ar: arFile.brandSubtitle ?? '',
      en: enFile.brandSubtitle ?? '',
    });
  }

  for (const key of Object.keys(arFile.chrome ?? {})) {
    visit({
      section: 'chrome',
      key,
      ar: arFile.chrome[key],
      en: enFile.chrome?.[key] ?? '',
    });
  }

  for (const screenId of Object.keys(arFile.screenCopy ?? {})) {
    const arScreen = arFile.screenCopy[screenId] ?? {};
    const enScreen = enFile.screenCopy?.[screenId] ?? {};
    for (const key of Object.keys(arScreen)) {
      visit({
        section: 'screenCopy',
        screenId,
        key,
        ar: arScreen[key],
        en: enScreen[key] ?? '',
      });
    }
  }
}

function buildLookupIndex(arFile, enFile) {
  const index = new Map();
  walkEntries(arFile, enFile, (entry) => {
    const lookupKey = `${normalize(entry.ar)}|${normalize(entry.en)}`;
    if (!lookupKey || lookupKey === '|') {
      return;
    }
    if (!index.has(lookupKey)) {
      index.set(lookupKey, []);
    }
    index.get(lookupKey).push(entry);
  });
  return index;
}

function applyTranslation(target, entry, value) {
  const text = String(value ?? '').trim();
  if (!text) {
    return false;
  }

  switch (entry.section) {
    case 'sidebarNav':
      if (!target.sidebarNav) {
        target.sidebarNav = {};
      }
      target.sidebarNav[entry.key] = text;
      return true;
    case 'brandSubtitle':
      target.brandSubtitle = text;
      return true;
    case 'chrome':
      if (!target.chrome) {
        target.chrome = {};
      }
      target.chrome[entry.key] = text;
      return true;
    case 'screenCopy':
      if (!target.screenCopy) {
        target.screenCopy = {};
      }
      if (!target.screenCopy[entry.screenId]) {
        target.screenCopy[entry.screenId] = {};
      }
      target.screenCopy[entry.screenId][entry.key] = text;
      return true;
    default:
      return false;
  }
}

function countFilledStrings(obj) {
  if (typeof obj === 'string') {
    return obj.trim() ? 1 : 0;
  }
  if (!obj || typeof obj !== 'object') {
    return 0;
  }
  return Object.values(obj).reduce((sum, value) => sum + countFilledStrings(value), 0);
}

const arFile = readJson(path.join(assetsDir, 'ar.json'));
const enFile = readJson(path.join(assetsDir, 'en.json'));
const targetFile = readJson(path.join(assetsDir, `${locale}.json`));
const index = buildLookupIndex(arFile, enFile);

const raw = fs.readFileSync(csvPath, 'utf8');
const lines = raw.split(/\r?\n/);

let applied = 0;
let duplicateHits = 0;
let unmatched = 0;
let skippedHeader = 0;

for (const line of lines) {
  const row = parseCsvLine(line);
  if (!row) {
    continue;
  }

  if (
    normalize(row.ar).toLowerCase() === 'arabic' &&
    normalize(row.en).toLowerCase() === 'english'
  ) {
    skippedHeader += 1;
    continue;
  }

  const lookupKey = `${normalize(row.ar)}|${normalize(row.en)}`;
  const matches = index.get(lookupKey);
  if (!matches?.length) {
    unmatched += 1;
    continue;
  }

  if (matches.length > 1) {
    duplicateHits += 1;
  }

  for (const match of matches) {
    if (applyTranslation(targetFile, match, row.translation)) {
      applied += 1;
    }
  }
}

const targets = [
  path.join(assetsDir, `${locale}.json`),
  path.join(sharedDir, `${locale}.json`),
  path.join(hostDir, `${locale}.json`),
];

for (const filePath of targets) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  writeJson(filePath, targetFile);
}

console.log(`Import locale: ${locale}`);
console.log(`CSV: ${csvPath}`);
console.log(`Applied field updates: ${applied}`);
console.log(`Unmatched CSV rows: ${unmatched}`);
console.log(`Rows with multiple key matches: ${duplicateHits}`);
console.log(`Filled strings in ${locale}.json: ${countFilledStrings(targetFile)}`);
console.log('Updated:');
for (const filePath of targets) {
  console.log(`  - ${filePath}`);
}
