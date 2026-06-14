import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const git =
  process.env.GIT_EXECUTABLE ||
  'C:\\Users\\Thinkpad\\AppData\\Local\\Temp\\MinGit\\cmd\\git.exe';

for (const locale of ['ar', 'en']) {
  const raw = execSync(`"${git}" show 9d11170:angular/src/assets/ui-translations/${locale}.json`, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
  });
  const json = JSON.parse(raw.replace(/^\uFEFF/, ''));
  writeFileSync(
    path.join(__dirname, `.${locale}-booking-snapshot.json`),
    `${JSON.stringify(json.screenCopy.booking, null, 2)}\n`,
    'utf8',
  );
  console.log(locale, json.screenCopy.booking.guestPaneTitle, Object.keys(json.screenCopy.booking).length);
}
