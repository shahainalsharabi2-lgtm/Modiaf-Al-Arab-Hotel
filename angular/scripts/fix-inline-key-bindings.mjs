import fs from 'node:fs';
import path from 'node:path';

const APP_ROOT = path.resolve('src/app');
const DYNAMIC_KEY_PROPS = new Set(['cardCountdownLabelKey']);

const MANUAL_FIXES = [
  {
    file: 'src/app/booking-form/booking-form.component.html',
    from: '<span><ui-inline-text kind="screen" screen="booking" [key]="\'idNumberExactLength\').replace(\'{n}\', \'\' + idNumberMaxLength" /></span>',
    to: '<span>{{ ui.screenText(\'booking\', \'idNumberExactLength\').replace(\'{n}\', \'\' + idNumberMaxLength) }}</span>',
  },
  {
    file: 'src/app/rooms/rooms.component.html',
    from: '<ui-inline-text kind="screen" screen="rooms" [key]="\'floorBadge\').replace(\'{f}\', \'\' + room.floor" />',
    to: '{{ ui.screenText(\'rooms\', \'floorBadge\').replace(\'{f}\', \'\' + room.floor) }}',
  },
  {
    file: 'src/app/settings/settings.component.html',
    from: '<h2> hotelBranding.displayName() || <ui-inline-text kind="screen" screen="settings" key="loginTitle" /> </h2>',
    to: '<h2>{{ hotelBranding.displayName() || uiTranslations.screenText(\'settings\', \'loginTitle\') }}</h2>',
  },
];

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      walk(full, out);
    } else if (name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

for (const fix of MANUAL_FIXES) {
  const full = path.resolve(fix.file);
  if (fs.existsSync(full)) {
    const src = fs.readFileSync(full, 'utf8');
    if (src.includes(fix.from)) {
      fs.writeFileSync(full, src.replace(fix.from, fix.to));
      console.log('manual:', fix.file);
    }
  }
}

let changed = 0;
for (const file of walk(APP_ROOT)) {
  let src = fs.readFileSync(file, 'utf8');
  const original = src;
  src = src.replace(/\[key\]="([a-zA-Z_][a-zA-Z0-9_]*)"/g, (m, id) => {
    if (DYNAMIC_KEY_PROPS.has(id)) {
      return m;
    }
    return `key="${id}"`;
  });
  if (src !== original) {
    fs.writeFileSync(file, src);
    changed++;
    console.log('keys:', path.relative(process.cwd(), file));
  }
}
console.log(`Done. ${changed} file(s) updated.`);
