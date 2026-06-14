/**
 * يحوّل {{ ui.screenText(...) }} و label(...) و chromeLabel إلى <ui-inline-text>
 */
import fs from 'node:fs';
import path from 'node:path';

const APP_ROOT = path.resolve('src/app');

const LABEL_SCREEN_BY_BASENAME = {
  'room-plan.component': 'roomPlan',
  'rooms-rack.component': 'roomsRack',
  'guest-valuables.component': 'guestValuables',
  'keys.component': 'keys',
  'key-services.component': 'keyServices',
  'rent-posting.component': 'rentPosting',
  'previous-invoices.component': 'previousInvoices',
  'invoices-notifications.component': 'invoicesNotifications',
  'crm-profile-settings.component': 'crmProfileSettings',
  'crm-individuals.component': 'crmIndividuals',
  'crm-companies.component': 'crmCompanies',
  'crm-agents.component': 'crmAgents',
  'night-audit-settings.component': 'nightAuditSettings',
  'night-audit-reservations.component': 'nightAuditReservations',
  'night-audit-procedure.component': 'nightAuditProcedure',
  'night-audit-room-movement.component': 'nightAuditRoomMovement',
};

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full, out);
    } else if (name.endsWith('.html') || name === 'app.component.ts') {
      out.push(full);
    }
  }
  return out;
}

function screenTextToInline(call) {
  const m =
    /^(?:uiTranslations|ui)\.screenText\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)$/.exec(call.trim()) ||
    /^(?:uiTranslations|ui)\.screenText\(\s*'([^']+)'\s*,\s*(.+)\s*\)$/.exec(call.trim());
  if (!m) {
    return null;
  }
  const screen = m[1];
  const keyPart = m[2].trim();
  if (/^'[^']+'$/.test(keyPart)) {
    const key = keyPart.slice(1, -1);
    return `<ui-inline-text kind="screen" screen="${screen}" key="${key}" />`;
  }
  return `<ui-inline-text kind="screen" screen="${screen}" [key]="${keyPart}" />`;
}

function chromeToInline(call) {
  const m = /^ui\.chromeLabel\(\s*'([^']+)'\s*\)$/.exec(call.trim());
  if (!m) {
    return null;
  }
  return `<ui-inline-text kind="chrome" key="${m[1]}" />`;
}

function sidebarToInline(call) {
  const m = /^ui\.sidebarLabel\(\s*'([^']+)'\s*\)$/.exec(call.trim());
  if (!m) {
    return null;
  }
  return `<ui-inline-text kind="sidebar" key="${m[1]}" />`;
}

function labelToInline(call, screenId) {
  if (!screenId) {
    return null;
  }
  const m =
    /^label\(\s*'([^']+)'\s*\)$/.exec(call.trim()) || /^label\(\s*(.+)\s*\)$/.exec(call.trim());
  if (!m) {
    return null;
  }
  const keyPart = m[1].trim();
  if (/^'[^']+'$/.test(keyPart)) {
    return `<ui-inline-text kind="screen" screen="${screenId}" key="${keyPart.slice(1, -1)}" />`;
  }
  return `<ui-inline-text kind="screen" screen="${screenId}" [key]="${keyPart}" />`;
}

function transformExpression(expr, screenId) {
  const trimmed = expr.trim();
  const direct =
    screenTextToInline(trimmed) ||
    chromeToInline(trimmed) ||
    sidebarToInline(trimmed) ||
    labelToInline(trimmed, screenId);
  if (direct) {
    return direct;
  }

  let out = expr;
  const patterns = [
    {
      re: /(?:uiTranslations|ui)\.screenText\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/g,
      fn: (_, s, k) => `<ui-inline-text kind="screen" screen="${s}" key="${k}" />`,
    },
    {
      re: /(?:uiTranslations|ui)\.screenText\(\s*'([^']+)'\s*,\s*([^)]+?)\s*\)/g,
      fn: (_, s, k) => `<ui-inline-text kind="screen" screen="${s}" [key]="${k.trim()}" />`,
    },
    {
      re: /ui\.chromeLabel\(\s*'([^']+)'\s*\)/g,
      fn: (_, k) => `<ui-inline-text kind="chrome" key="${k}" />`,
    },
    {
      re: /ui\.sidebarLabel\(\s*'([^']+)'\s*\)/g,
      fn: (_, k) => `<ui-inline-text kind="sidebar" key="${k}" />`,
    },
  ];
  if (screenId) {
    patterns.push({
      re: /label\(\s*'([^']+)'\s*\)/g,
      fn: (_, k) => `<ui-inline-text kind="screen" screen="${screenId}" key="${k}" />`,
    });
    patterns.push({
      re: /label\(\s*([^)]+?)\s*\)/g,
      fn: (_, k) => {
        const t = k.trim();
        if (/^'[^']+'$/.test(t)) {
          return `<ui-inline-text kind="screen" screen="${screenId}" key="${t.slice(1, -1)}" />`;
        }
        return `<ui-inline-text kind="screen" screen="${screenId}" [key]="${t}" />`;
      },
    });
  }

  for (const { re, fn } of patterns) {
    out = out.replace(re, fn);
  }
  return out;
}

function transformHtml(html, screenId) {
  return html.replace(/\{\{([\s\S]*?)\}\}/g, (full, inner) => {
    if (!/(?:screenText|chromeLabel|sidebarLabel|\blabel\s*\()/.test(inner)) {
      return full;
    }
    const replaced = transformExpression(inner, screenId);
    if (replaced === inner.trim()) {
      return full;
    }
    if (replaced.includes('{{')) {
      return replaced;
    }
    return replaced;
  });
}

function relativeImport(fromFile) {
  const target = path.join(APP_ROOT, 'shared/ui-inline-text/ui-inline-text.component');
  let rel = path.relative(path.dirname(fromFile), target).replace(/\\/g, '/');
  if (!rel.startsWith('.')) {
    rel = `./${rel}`;
  }
  return rel;
}

function ensureComponentImport(tsPath) {
  if (!fs.existsSync(tsPath)) {
    return false;
  }
  let src = fs.readFileSync(tsPath, 'utf8');
  if (src.includes('UiInlineTextComponent')) {
    return false;
  }
  const rel = relativeImport(tsPath);
  src = src.replace(
    /^(import .+;\r?\n)(?=@Component)/m,
    `$1import { UiInlineTextComponent } from '${rel}';\n`,
  );
  src = src.replace(/imports:\s*\[([^\]]*)\]/, (m, inner) => {
    if (inner.includes('UiInlineTextComponent')) {
      return m;
    }
    const trimmed = inner.trim();
    const prefix = trimmed.length ? `${trimmed}, ` : '';
    return `imports: [${prefix}UiInlineTextComponent]`;
  });
  fs.writeFileSync(tsPath, src);
  return true;
}

function companionTs(htmlPath) {
  const dir = path.dirname(htmlPath);
  const base = path.basename(htmlPath, '.html');
  const candidates = [
    path.join(dir, `${base}.ts`),
    path.join(dir, `${base.replace('.component', '')}.ts`),
  ];
  if (base === 'room-form') {
    candidates.unshift(path.join(dir, 'room-form.ts'));
  }
  if (base === 'room-details') {
    candidates.unshift(path.join(dir, 'room-details.ts'));
  }
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return c;
    }
  }
  return null;
}

function screenIdForFile(filePath) {
  const base = path.basename(filePath).replace(/\.html$/, '');
  if (LABEL_SCREEN_BY_BASENAME[base]) {
    return LABEL_SCREEN_BY_BASENAME[base];
  }
  const ts = companionTs(filePath);
  if (!ts) {
    return null;
  }
  const src = fs.readFileSync(ts, 'utf8');
  const m = /screenText\(\s*'([^']+)'/.exec(src);
  return m?.[1] ?? null;
}

let changedFiles = 0;
for (const file of walk(APP_ROOT)) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // لا نستبدل داخل ربط الخصائص [placeholder]="ui.screenText(...)"
  const attrParts = [];
  content = content.replace(
    /(\[[\w.-]+\]|(?:href|placeholder|title|aria-label|alt))="([^"]*)"/g,
    (m) => {
      const id = attrParts.length;
      attrParts.push(m);
      return `__ATTR_PLACEHOLDER_${id}__`;
    },
  );

  const screenId = file.endsWith('.html') ? screenIdForFile(file) : null;
  content = transformHtml(content, screenId);

  content = content.replace(/__ATTR_PLACEHOLDER_(\d+)__/g, (_, i) => attrParts[Number(i)]);

  if (content !== original) {
    fs.writeFileSync(file, content);
    changedFiles++;
    console.log('updated HTML:', path.relative(process.cwd(), file));
    const ts =
      file.endsWith('.html')
        ? companionTs(file)
        : file.endsWith('app.component.ts')
          ? file
          : null;
    if (ts && ensureComponentImport(ts)) {
      console.log('  + import:', path.relative(process.cwd(), ts));
    }
  }
}

console.log(`Done. ${changedFiles} file(s) updated.`);
