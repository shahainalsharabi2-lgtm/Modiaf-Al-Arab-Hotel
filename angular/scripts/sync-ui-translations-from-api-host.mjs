import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const sourceDir = path.join(
  repoRoot,
  'aspnet-core/src/Modiaf.Al.Arab.Hotel.HttpApi.Host/UiTranslations',
);
const targetDir = path.join(repoRoot, 'angular/src/assets/ui-translations');
const locales = ['ar', 'en', 'fr', 'tr'];

if (!existsSync(sourceDir)) {
  console.error(`Source not found: ${sourceDir}`);
  process.exit(1);
}

mkdirSync(targetDir, { recursive: true });

for (const locale of locales) {
  const source = path.join(sourceDir, `${locale}.json`);
  const target = path.join(targetDir, `${locale}.json`);
  if (!existsSync(source)) {
    console.warn(`Skip missing: ${source}`);
    continue;
  }
  copyFileSync(source, target);
  console.log(`Copied ${locale}.json`);
}

console.log('UiTranslations synced from HttpApi.Host to angular assets.');
