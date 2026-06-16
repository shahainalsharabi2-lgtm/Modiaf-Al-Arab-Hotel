/**
 * مزامنة ملفات ترجمة واجهة النظام بين Domain.Shared و HttpApi.Host
 * للنشر: node tools/sync-ui-translations-for-deploy.mjs
 * بعد التعديل من الواجهة: node tools/sync-ui-translations-for-deploy.mjs --to-shared
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');

const LOCALES = ['ar', 'en', 'fr', 'id', 'tr', 'am'];

const sharedDir = path.join(
  repoRoot,
  'aspnet-core/src/Modiaf.Al.Arab.Hotel.Domain.Shared/Localization',
);
const hostDir = path.join(
  repoRoot,
  'aspnet-core/src/Modiaf.Al.Arab.Hotel.HttpApi.Host/UiTranslations',
);

const toShared = process.argv.includes('--to-shared');
const force = process.argv.includes('--force');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyLocale(locale, fromDir, toDir) {
  const src = path.join(fromDir, `${locale}.json`);
  const dest = path.join(toDir, `${locale}.json`);

  if (!fs.existsSync(src)) {
    console.warn(`skip ${locale}: missing ${src}`);
    return false;
  }

  if (fs.existsSync(dest) && !force) {
    const srcStat = fs.statSync(src);
    const destStat = fs.statSync(dest);
    if (destStat.mtimeMs >= srcStat.mtimeMs && destStat.size >= srcStat.size) {
      console.log(`keep ${locale}: ${dest} (newer or same size)`);
      return false;
    }
  }

  fs.copyFileSync(src, dest);
  console.log(`copied ${locale}: ${src} -> ${dest}`);
  return true;
}

function main() {
  ensureDir(hostDir);
  ensureDir(sharedDir);

  const [fromDir, toDir, label] = toShared
    ? [hostDir, sharedDir, 'HttpApi.Host -> Domain.Shared']
    : [sharedDir, hostDir, 'Domain.Shared -> HttpApi.Host'];

  console.log(`Sync UI translations (${label})`);
  if (force) {
    console.log('Mode: --force (overwrite all)');
  }

  let copied = 0;
  for (const locale of LOCALES) {
    if (copyLocale(locale, fromDir, toDir)) {
      copied += 1;
    }
  }

  console.log(`Done. ${copied}/${LOCALES.length} file(s) updated.`);
  if (!toShared) {
    console.log('');
    console.log('For deploy: commit HttpApi.Host/UiTranslations/*.json then publish.');
    console.log('Files are copied to output via CopyToOutputDirectory in HttpApi.Host.csproj.');
  }
}

main();
