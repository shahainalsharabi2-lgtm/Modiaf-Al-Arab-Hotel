import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

const defaultPath = path.join(
  repoRoot,
  'aspnet-core/src/Modiaf.Al.Arab.Hotel.Domain/UiTranslations/ui-translations-default.json',
);
const hostDir = path.join(
  repoRoot,
  'aspnet-core/src/Modiaf.Al.Arab.Hotel.HttpApi.Host/UiTranslations',
);
const assetsDir = path.join(repoRoot, 'angular/src/assets/ui-translations');
const bookingFormDir = path.join(repoRoot, 'angular/src/app/booking-form');

const GIT =
  process.env.GIT_EXECUTABLE ||
  'C:\\Users\\Thinkpad\\AppData\\Local\\Temp\\MinGit\\cmd\\git.exe';

function loadSnapshot(locale) {
  const snapshotPath = path.join(__dirname, `.${locale}-booking-snapshot.json`);
  if (existsSync(snapshotPath)) {
    return JSON.parse(readFileSync(snapshotPath, 'utf8').replace(/^\uFEFF/, ''));
  }
  if (!existsSync(GIT)) {
    return {};
  }
  try {
    const raw = execSync(`"${GIT}" show 9d11170:angular/src/assets/ui-translations/${locale}.json`, {
      cwd: repoRoot,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    });
    const json = JSON.parse(raw.replace(/^\uFEFF/, ''));
    return json.screenCopy?.booking ?? {};
  } catch {
    return {};
  }
}

function collectKeysFromBookingForm() {
  const keys = new Set();
  const patterns = [
    /screenText\(\s*'booking'\s*,\s*'([^']+)'\s*\)/g,
    /key="([^"]+)"/g,
  ];
  for (const file of ['booking-form.component.html', 'booking-form.component.ts']) {
    const text = readFileSync(path.join(bookingFormDir, file), 'utf8');
    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (file.endsWith('.html') && pattern === patterns[1]) {
          if (!text.slice(Math.max(0, match.index - 80), match.index).includes('screen="booking"')) {
            continue;
          }
        }
        keys.add(match[1]);
      }
    }
  }
  return keys;
}

function sortBooking(booking) {
  return Object.fromEntries(
    Object.entries(booking)
      .filter(([, value]) => typeof value === 'string' && value.trim())
      .sort(([a], [b]) => a.localeCompare(b)),
  );
}

function mergeBooking(...parts) {
  const merged = {};
  for (const part of parts) {
    for (const [key, value] of Object.entries(part ?? {})) {
      const trimmed = (value ?? '').trim();
      if (trimmed) {
        merged[key] = trimmed;
      }
    }
  }
  for (const key of collectKeysFromBookingForm()) {
    if (!(key in merged)) {
      merged[key] = '';
    }
  }
  return sortBooking(merged);
}

const defaults = JSON.parse(readFileSync(defaultPath, 'utf8'));
const bookingAr = mergeBooking(
  defaults.screenCopy?.ar?.booking ?? {},
  loadSnapshot('ar'),
);
const bookingEn = mergeBooking(loadSnapshot('en'));
const bookingTr = mergeBooking(defaults.screenCopy?.tr?.booking ?? {}, loadSnapshot('tr'));
const bookingFr = mergeBooking(loadSnapshot('fr'));

const bookingByLocale = { ar: bookingAr, en: bookingEn, tr: bookingTr, fr: bookingFr };

for (const locale of ['ar', 'en', 'tr', 'fr']) {
  for (const targetDir of [hostDir, assetsDir]) {
    const filePath = path.join(targetDir, `${locale}.json`);
    const file = JSON.parse(readFileSync(filePath, 'utf8'));
    if (!file.screenCopy) {
      file.screenCopy = {};
    }
    file.screenCopy.booking = bookingByLocale[locale];
    writeFileSync(filePath, `${JSON.stringify(file, null, 2)}\n`, 'utf8');
    console.log(
      `Updated ${path.relative(repoRoot, filePath)} — booking keys: ${Object.keys(file.screenCopy.booking).length}`,
    );
  }
}

console.log('Booking screen translations restored from snapshots + defaults.');
