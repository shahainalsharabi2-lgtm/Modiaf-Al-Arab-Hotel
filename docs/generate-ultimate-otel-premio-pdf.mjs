/**
 * يولّد PDF لملخص هيكلية UltimateOtelPremio
 * التشغيل: node docs/generate-ultimate-otel-premio-pdf.mjs
 */
import { copyFileSync, readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { execFileSync } from 'child_process';
import { homedir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const mdPath = join(__dirname, 'ملخص-UltimateOtelPremio.md');
const htmlPath = join(__dirname, 'ultimate-otel-premio-ar.html');
const pdfPath = join(__dirname, 'UltimateOtelPremio-Summary-AR.pdf');
const pdfPathAr = join(__dirname, 'ملخص-UltimateOtelPremio.pdf');
const pdfCopyDir = join(__dirname, '..', '..', 'UltimateOtelPremio');
const pdfCopyPath = join(pdfCopyDir, 'ملخص-UltimateOtelPremio.pdf');

const md = readFileSync(mdPath, 'utf8');

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(s) {
  return s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function mdToHtml(source) {
  let html = source.replace(/^---[\s\S]*?---\n/, '');
  const lines = html.split('\n');
  const out = [];
  let inCode = false;
  let tableRows = [];
  let inLi = false;

  const flushTable = () => {
    if (!tableRows.length) return;
    out.push('<table>');
    tableRows.forEach((row, i) => {
      const tag = i === 0 ? 'th' : 'td';
      out.push('<tr>' + row.map((c) => `<${tag}>${inline(c)}</${tag}>`).join('') + '</tr>');
    });
    out.push('</table>');
    tableRows = [];
  };

  const closeLi = () => {
    if (inLi) {
      out.push('</ul>');
      inLi = false;
    }
  };

  for (const line of lines) {
    if (line.startsWith('```')) {
      flushTable();
      closeLi();
      if (!inCode) {
        inCode = true;
        out.push('<pre><code>');
      } else {
        inCode = false;
        out.push('</code></pre>');
      }
      continue;
    }
    if (inCode) {
      out.push(escapeHtml(line));
      continue;
    }
    if (line.startsWith('|')) {
      closeLi();
      const cells = line.split('|').slice(1, -1).map((c) => c.trim());
      if (cells.every((c) => /^-+$/.test(c))) continue;
      tableRows.push(cells);
      continue;
    }
    flushTable();
    if (line.startsWith('# ')) {
      closeLi();
      out.push(`<h1>${inline(line.slice(2))}</h1>`);
    } else if (line.startsWith('## ')) {
      closeLi();
      out.push(`<h2>${inline(line.slice(3))}</h2>`);
    } else if (line.startsWith('### ')) {
      closeLi();
      out.push(`<h3>${inline(line.slice(4))}</h3>`);
    } else if (line.startsWith('- ')) {
      if (!inLi) {
        out.push('<ul>');
        inLi = true;
      }
      out.push(`<li>${inline(line.slice(2))}</li>`);
    } else if (line.trim() === '---') {
      closeLi();
      out.push('<hr/>');
    } else if (line.trim() === '') {
      closeLi();
      out.push('');
    } else if (line.startsWith('*') && line.endsWith('*')) {
      closeLi();
      out.push(`<p class="meta"><em>${inline(line)}</em></p>`);
    } else {
      closeLi();
      out.push(`<p>${inline(line)}</p>`);
    }
  }
  flushTable();
  closeLi();
  return out.join('\n');
}

const body = mdToHtml(md);

const fullHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>ملخص UltimateOtelPremio — هيكلية ABP</title>
  <style>
    @page { margin: 12mm 11mm; size: A4; }
    body {
      font-family: 'Segoe UI', Tahoma, 'Arabic Typesetting', Arial, sans-serif;
      font-size: 9pt;
      line-height: 1.42;
      color: #1a1a1a;
      direction: rtl;
      text-align: right;
    }
    h1 {
      color: #1b5e20;
      font-size: 17pt;
      border-bottom: 3px solid #2e7d32;
      padding-bottom: 6px;
      margin-top: 0;
      page-break-after: avoid;
    }
    h2 {
      color: #2e7d32;
      font-size: 12pt;
      margin-top: 14px;
      page-break-after: avoid;
      border-right: 4px solid #43a047;
      padding-right: 8px;
    }
    h3 {
      color: #37474f;
      font-size: 10.5pt;
      page-break-after: avoid;
      margin-top: 10px;
    }
    code {
      direction: ltr;
      unicode-bidi: embed;
      font-family: Consolas, 'Courier New', monospace;
      font-size: 7.5pt;
      background: #e8f5e9;
      padding: 1px 4px;
      border-radius: 3px;
      color: #1b5e20;
    }
    pre {
      direction: ltr;
      text-align: left;
      background: #f5f7fa;
      border: 1px solid #c8e6c9;
      padding: 7px 9px;
      border-radius: 5px;
      white-space: pre-wrap;
      font-family: Consolas, monospace;
      font-size: 7pt;
      page-break-inside: avoid;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 5px 0 10px;
      font-size: 8pt;
      page-break-inside: avoid;
    }
    th, td {
      border: 1px solid #81c784;
      padding: 3px 5px;
      vertical-align: top;
    }
    th {
      background: #2e7d32;
      color: #fff;
      font-weight: 600;
    }
    tr:nth-child(even) td { background: #f1f8e9; }
    ul { margin: 4px 0; padding-right: 16px; }
    li { margin: 2px 0; }
    hr { border: none; border-top: 1px solid #a5d6a7; margin: 12px 0; }
    .meta { color: #546e7a; font-size: 8.5pt; }
    strong { color: #1b5e20; }
  </style>
</head>
<body>
${body}
</body>
</html>`;

writeFileSync(htmlPath, fullHtml, 'utf8');
console.log('HTML:', htmlPath);

function findChrome() {
  const candidates = [
    join(homedir(), '.cache', 'puppeteer', 'chrome'),
    join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    join(process.env.PROGRAMFILES || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    join(process.env['PROGRAMFILES(X86)'] || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    join(process.env.PROGRAMFILES || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  ];
  for (const c of candidates) {
    if (c.endsWith('.exe') && existsSync(c)) return c;
    if (existsSync(c)) {
      for (const dir of readdirSync(c)) {
        const exe = join(c, dir, 'chrome-win64', 'chrome.exe');
        if (existsSync(exe)) return exe;
      }
    }
  }
  return null;
}

function main() {
  const chrome = findChrome();
  const fileUrl = pathToFileURL(htmlPath).href;
  if (chrome) {
    execFileSync(
      chrome,
      ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${pdfPath}`, fileUrl],
      { stdio: 'inherit' }
    );
    try {
      copyFileSync(pdfPath, pdfPathAr);
      console.log('PDF (عربي):', pdfPathAr);
    } catch {
      /* ignore */
    }
    try {
      if (!existsSync(pdfCopyDir)) mkdirSync(pdfCopyDir, { recursive: true });
      copyFileSync(pdfPath, pdfCopyPath);
      console.log('PDF (نسخة UltimateOtelPremio):', pdfCopyPath);
    } catch (e) {
      console.log('تعذّر نسخ PDF إلى UltimateOtelPremio:', e.message);
    }
    console.log('PDF:', pdfPath);
    return;
  }
  console.log('لم يُعثر على Chrome/Edge. افتح HTML واطبع إلى PDF:');
  console.log(htmlPath);
}

try {
  main();
} catch (e) {
  console.error('فشل إنشاء PDF:', e.message);
  process.exit(1);
}
