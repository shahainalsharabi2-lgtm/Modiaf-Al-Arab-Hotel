/**
 * يملأ en.json من ar.json عبر ترجمة Google/Lingva.
 * الاستخدام: node tools/fill-en-translations.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uiDir = path.resolve(
  __dirname,
  '../aspnet-core/src/Modiaf.Al.Arab.Hotel.HttpApi.Host/UiTranslations',
);
const assetsDir = path.resolve(__dirname, '../angular/src/assets/ui-translations');
const nestedAssetsDir = path.join(assetsDir, 'ui-translations');

const DELAY_MS = 120;
const SAVE_EVERY = 20;
const LANGPAIR = 'ar|en';

const cachePath = path.join(__dirname, '.translation-cache.json');
let cache = {};
if (fs.existsSync(cachePath)) {
  try {
    cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  } catch {
    cache = {};
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function translateViaGoogle(text, langpair) {
  const [sl, tl] = langpair.split('|');
  const gtxUrl =
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' +
    encodeURIComponent(sl) +
    '&tl=' +
    encodeURIComponent(tl) +
    '&dt=t&q=' +
    encodeURIComponent(text);
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(gtxUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const raw = await res.text();
      if (raw.startsWith('[')) {
        const json = JSON.parse(raw);
        const out = json?.[0]?.[0]?.[0]?.trim();
        if (out) {
          return out;
        }
      }
    } catch {
      /* retry */
    }
    await sleep(600 * (attempt + 1));
  }
  return text;
}

async function translateText(text) {
  const key = `${LANGPAIR}::${text}`;
  if (cache[key]) {
    return cache[key];
  }
  const out = await translateViaGoogle(text, LANGPAIR);
  cache[key] = out;
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
  return out;
}

function collectStrings(node, prefix, out) {
  if (typeof node === 'string') {
    out.push({ path: prefix, value: node });
    return;
  }
  if (!node || typeof node !== 'object') {
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    collectStrings(v, prefix ? `${prefix}.${k}` : k, out);
  }
}

function setByPath(obj, dotPath, value) {
  const parts = dotPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!cur[p] || typeof cur[p] !== 'object') {
      cur[p] = {};
    }
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

function getByPath(obj, dotPath) {
  return dotPath.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
}

function shouldTranslate(text) {
  if (!text || !text.trim()) {
    return false;
  }
  if (/^[\d\s\-_./:\\]+$/.test(text.trim())) {
    return false;
  }
  return true;
}

function copyToAssets(localePath) {
  const dest = path.join(assetsDir, 'en.json');
  fs.copyFileSync(localePath, dest);
  if (fs.existsSync(nestedAssetsDir)) {
    fs.copyFileSync(localePath, path.join(nestedAssetsDir, 'en.json'));
  }
}

async function main() {
  const arPath = path.join(uiDir, 'ar.json');
  const enPath = path.join(uiDir, 'en.json');
  const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));
  const existing = fs.existsSync(enPath) ? JSON.parse(fs.readFileSync(enPath, 'utf8')) : {};
  const result = structuredClone(existing);
  const entries = [];
  collectStrings(ar, '', entries);

  let done = 0;
  let translatedSinceSave = 0;

  for (const { path: dotPath, value: arText } of entries) {
    done++;
    const current = getByPath(result, dotPath);
    if (typeof current === 'string' && current.trim()) {
      process.stdout.write(`\r[en] skip ${done}/${entries.length}`);
      continue;
    }

    if (!shouldTranslate(arText)) {
      setByPath(result, dotPath, arText);
      continue;
    }

    const translated = await translateText(arText);
    setByPath(result, dotPath, translated);
    translatedSinceSave++;
    process.stdout.write(`\r[en] ${done}/${entries.length} ${dotPath.slice(0, 50)}`);
    await sleep(DELAY_MS);

    if (translatedSinceSave >= SAVE_EVERY) {
      fs.writeFileSync(enPath, JSON.stringify(result, null, 2) + '\n', 'utf8');
      copyToAssets(enPath);
      translatedSinceSave = 0;
    }
  }

  setByPath(result, 'screenCopy.settings.localeEn', 'English');
  fs.writeFileSync(enPath, JSON.stringify(result, null, 2) + '\n', 'utf8');
  copyToAssets(enPath);
  console.log(`\nSaved ${enPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
