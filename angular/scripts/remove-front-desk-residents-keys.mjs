import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const dirs = [
  path.join(repoRoot, 'aspnet-core/src/Modiaf.Al.Arab.Hotel.HttpApi.Host/UiTranslations'),
  path.join(repoRoot, 'angular/src/assets/ui-translations'),
];
const locales = ['ar', 'en', 'fr', 'tr'];
const dashboardKeys = [
  'viewTitleNormal',
  'viewTitleAdvanced',
  'welcomePrefix',
  'viewReservation',
];

for (const dir of dirs) {
  for (const locale of locales) {
    const file = path.join(dir, `${locale}.json`);
    const data = JSON.parse(readFileSync(file, 'utf8'));
    for (const key of dashboardKeys) {
      delete data.screenCopy?.dashboard?.[key];
    }
    writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    console.log(`updated ${path.relative(repoRoot, file)}`);
  }
}
