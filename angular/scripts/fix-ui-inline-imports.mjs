import fs from 'node:fs';
import path from 'node:path';

const APP_ROOT = path.resolve('src/app');

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      walk(full, out);
    } else if (name.endsWith('.ts') && !name.endsWith('.spec.ts')) {
      out.push(full);
    }
  }
  return out;
}

function relativeImport(fromFile) {
  const target = path.join(APP_ROOT, 'shared/ui-inline-text/ui-inline-text.component');
  let rel = path.relative(path.dirname(fromFile), target).replace(/\\/g, '/');
  if (!rel.startsWith('.')) {
    rel = `./${rel}`;
  }
  return rel;
}

let fixed = 0;
for (const file of walk(APP_ROOT)) {
  if (file.includes('ui-inline-text.component.ts')) {
    continue;
  }
  let src = fs.readFileSync(file, 'utf8');
  if (!src.includes('UiInlineTextComponent')) {
    continue;
  }
  const original = src;
  src = src.replace(/,\s*,/g, ',');
  if (!/import\s+\{\s*UiInlineTextComponent\s*\}/.test(src)) {
    const rel = relativeImport(file);
    const importLine = `import { UiInlineTextComponent } from '${rel}';\n`;
    const m = src.match(/^import .+;\r?\n/m);
    if (m) {
      const idx = src.indexOf(m[0]) + m[0].length;
      src = src.slice(0, idx) + importLine + src.slice(idx);
    } else {
      src = importLine + src;
    }
  }
  if (src !== original) {
    fs.writeFileSync(file, src);
    fixed++;
    console.log('fixed:', path.relative(process.cwd(), file));
  }
}
console.log(`Done. ${fixed} file(s) fixed.`);
