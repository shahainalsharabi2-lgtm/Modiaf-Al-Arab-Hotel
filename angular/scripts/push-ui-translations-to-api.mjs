import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const sourceDir = path.join(
  repoRoot,
  'aspnet-core/src/Modiaf.Al.Arab.Hotel.HttpApi.Host/UiTranslations',
);
const apiUrl =
  process.env.UI_TRANSLATIONS_API_URL ??
  'https://hotel-api-fo0z.onrender.com/api/app/ui-translations-blob';
const locales = ['ar', 'en', 'fr', 'tr'];

function readLocale(locale) {
  const filePath = path.join(sourceDir, `${locale}.json`);
  if (!existsSync(filePath)) {
    throw new Error(`Missing locale file: ${filePath}`);
  }
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

const payload = {
  sidebarNav: {},
  brandSubtitle: {},
  chrome: {},
  screenCopy: {},
};

for (const locale of locales) {
  const file = readLocale(locale);
  payload.sidebarNav[locale] = file.sidebarNav ?? {};
  payload.brandSubtitle[locale] = file.brandSubtitle ?? '';
  payload.chrome[locale] = file.chrome ?? {};
  payload.screenCopy[locale] = file.screenCopy ?? {};
}

const body = JSON.stringify({ payloadJson: JSON.stringify(payload) });
const response = await fetch(apiUrl, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body,
});

if (!response.ok) {
  const text = await response.text();
  console.error(`PUT failed (${response.status}): ${text}`);
  process.exit(1);
}

console.log(`UiTranslations pushed to ${apiUrl}`);
