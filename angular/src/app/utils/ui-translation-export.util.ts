export interface UiTranslationExportRow {
  fieldKey: string;
  referenceAr: string;
  referenceEn: string;
  translation: string;
}

export type UiTranslationExportFormat = 'pdf' | 'excel' | 'text';

export type UiTranslationExportHeaders = readonly [string, string, string];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildUiTranslationExportText(
  rows: readonly UiTranslationExportRow[],
  headers: UiTranslationExportHeaders,
): string {
  const divider = '-'.repeat(72);
  const blocks: string[] = [`${headers[0]}\t${headers[1]}\t${headers[2]}`];
  for (const row of rows) {
    blocks.push(divider);
    blocks.push(`${headers[0]}: ${row.referenceAr}`);
    blocks.push(`${headers[1]}: ${row.referenceEn}`);
    blocks.push(`${headers[2]}: ${row.translation}`);
  }
  return `\uFEFF${blocks.join('\n')}`;
}

export function buildUiTranslationExportHtmlTable(
  rows: readonly UiTranslationExportRow[],
  headers: UiTranslationExportHeaders,
  title: string,
): string {
  const head = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('');
  const body = rows
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(row.referenceAr)}</td>
        <td>${escapeHtml(row.referenceEn)}</td>
        <td>${escapeHtml(row.translation)}</td>
      </tr>`,
    )
    .join('');

  return `\uFEFF<!DOCTYPE html>
<html lang="ar" dir="rtl" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
  <x:Name>Translations</x:Name>
  <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
  </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
  <style>
    body { font-family: Tahoma, Arial, sans-serif; color: #111827; }
    h1 { font-size: 16px; margin: 0 0 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px; vertical-align: top; text-align: right; }
    th { background: #f1f5f9; font-weight: 700; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <table>
    <thead><tr>${head}</tr></thead>
    <tbody>${body}</tbody>
  </table>
</body>
</html>`;
}

export function downloadUiTranslationExportFile(
  filename: string,
  content: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function printUiTranslationExportPdf(
  title: string,
  headers: UiTranslationExportHeaders,
  rows: readonly UiTranslationExportRow[],
): boolean {
  const html = buildUiTranslationExportHtmlTable(rows, headers, title);
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const frameWindow = iframe.contentWindow;
  const frameDoc = iframe.contentDocument ?? frameWindow?.document;
  if (!frameWindow || !frameDoc) {
    document.body.removeChild(iframe);
    return false;
  }

  frameDoc.open();
  frameDoc.write(html);
  frameDoc.close();

  const cleanup = (): void => {
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  };

  const triggerPrint = (): void => {
    frameWindow.focus();
    frameWindow.print();
    window.setTimeout(cleanup, 1500);
  };

  if (frameDoc.readyState === 'complete') {
    window.setTimeout(triggerPrint, 300);
  } else {
    iframe.onload = () => window.setTimeout(triggerPrint, 300);
  }

  return true;
}
