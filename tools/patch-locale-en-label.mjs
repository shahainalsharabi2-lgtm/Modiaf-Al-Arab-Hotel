import fs from 'fs';

const arLabel = '"localeEn": "إنجليزية"';
const enLabel = '"localeEn": "English"';
const files = [
  'angular/src/assets/ui-translations/ar.json',
  'angular/src/assets/ui-translations/fr.json',
  'angular/src/assets/ui-translations/id.json',
  'angular/src/assets/ui-translations/tr.json',
  'angular/src/assets/ui-translations/zh-Hans.json',
  'angular/src/assets/ui-translations/ui-translations/ar.json',
  'angular/src/assets/ui-translations/ui-translations/fr.json',
  'angular/src/assets/ui-translations/ui-translations/id.json',
  'angular/src/assets/ui-translations/ui-translations/tr.json',
  'angular/src/assets/ui-translations/ui-translations/zh-Hans.json',
  'aspnet-core/src/Modiaf.Al.Arab.Hotel.HttpApi.Host/UiTranslations/ar.json',
  'aspnet-core/src/Modiaf.Al.Arab.Hotel.HttpApi.Host/UiTranslations/fr.json',
  'aspnet-core/src/Modiaf.Al.Arab.Hotel.HttpApi.Host/UiTranslations/id.json',
  'aspnet-core/src/Modiaf.Al.Arab.Hotel.HttpApi.Host/UiTranslations/tr.json',
  'aspnet-core/src/Modiaf.Al.Arab.Hotel.HttpApi.Host/UiTranslations/zh-Hans.json',
];

for (const f of files) {
  if (!fs.existsSync(f)) {
    continue;
  }
  let t = fs.readFileSync(f, 'utf8');
  if (t.includes('localeEn')) {
    console.log('skip', f);
    continue;
  }
  const insert = f.endsWith('/ar.json') ? arLabel : enLabel;
  t = t.replace(/("localeAr":[^\n]+\n)/, `$1      ${insert},\n`);
  fs.writeFileSync(f, t);
  console.log('patched', f);
}
