import type { UiLocaleFilePayload } from './ui-translations-locale.util';

export interface UiTranslationCsvRow {
  ar: string;
  en: string;
  translation: string;
}

export interface UiTranslationImportResult {
  applied: number;
  unmatched: number;
  duplicateHits: number;
}

function normalize(value: string | undefined | null): string {
  return String(value ?? '')
    .replace(/\uFEFF/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

export function parseUiTranslationCsvLine(line: string): UiTranslationCsvRow | null {
  const trimmed = line.replace(/\uFEFF/g, '').trim();
  if (!trimmed) {
    return null;
  }
  const parts = trimmed.split(';');
  if (parts.length < 3) {
    return null;
  }
  return {
    ar: parts[0],
    en: parts.slice(1, -1).join(';'),
    translation: parts[parts.length - 1],
  };
}

export function parseUiTranslationCsv(text: string): UiTranslationCsvRow[] {
  const rows: UiTranslationCsvRow[] = [];
  for (const line of text.split(/\r?\n/)) {
    const row = parseUiTranslationCsvLine(line);
    if (!row) {
      continue;
    }
    if (
      normalize(row.ar).toLowerCase() === 'arabic' &&
      normalize(row.en).toLowerCase() === 'english'
    ) {
      continue;
    }
    rows.push(row);
  }
  return rows;
}

type LocaleEntry =
  | { section: 'sidebarNav'; key: string; ar: string; en: string }
  | { section: 'brandSubtitle'; key: ''; ar: string; en: string }
  | { section: 'chrome'; key: string; ar: string; en: string }
  | { section: 'screenCopy'; screenId: string; key: string; ar: string; en: string };

function walkEntries(
  arFile: UiLocaleFilePayload,
  enFile: UiLocaleFilePayload,
  visit: (entry: LocaleEntry) => void,
): void {
  for (const key of Object.keys(arFile.sidebarNav ?? {})) {
    visit({
      section: 'sidebarNav',
      key,
      ar: arFile.sidebarNav?.[key] ?? '',
      en: enFile.sidebarNav?.[key] ?? '',
    });
  }

  if (arFile.brandSubtitle !== undefined || enFile.brandSubtitle !== undefined) {
    visit({
      section: 'brandSubtitle',
      key: '',
      ar: arFile.brandSubtitle ?? '',
      en: enFile.brandSubtitle ?? '',
    });
  }

  for (const key of Object.keys(arFile.chrome ?? {})) {
    visit({
      section: 'chrome',
      key,
      ar: arFile.chrome?.[key] ?? '',
      en: enFile.chrome?.[key] ?? '',
    });
  }

  for (const screenId of Object.keys(arFile.screenCopy ?? {})) {
    const arScreen = arFile.screenCopy?.[screenId] ?? {};
    const enScreen = enFile.screenCopy?.[screenId] ?? {};
    for (const key of Object.keys(arScreen)) {
      visit({
        section: 'screenCopy',
        screenId,
        key,
        ar: arScreen[key] ?? '',
        en: enScreen[key] ?? '',
      });
    }
  }
}

function buildLookupIndex(
  arFile: UiLocaleFilePayload,
  enFile: UiLocaleFilePayload,
): Map<string, LocaleEntry[]> {
  const index = new Map<string, LocaleEntry[]>();
  walkEntries(arFile, enFile, (entry) => {
    const lookupKey = `${normalize(entry.ar)}|${normalize(entry.en)}`;
    if (!lookupKey || lookupKey === '|') {
      return;
    }
    const list = index.get(lookupKey) ?? [];
    list.push(entry);
    index.set(lookupKey, list);
  });
  return index;
}

function applyTranslation(
  target: UiLocaleFilePayload,
  entry: LocaleEntry,
  value: string,
): boolean {
  const text = value.trim();
  if (!text) {
    return false;
  }

  switch (entry.section) {
    case 'sidebarNav':
      if (!target.sidebarNav) {
        target.sidebarNav = {};
      }
      target.sidebarNav[entry.key] = text;
      return true;
    case 'brandSubtitle':
      target.brandSubtitle = text;
      return true;
    case 'chrome':
      if (!target.chrome) {
        target.chrome = {};
      }
      target.chrome[entry.key] = text;
      return true;
    case 'screenCopy':
      if (!target.screenCopy) {
        target.screenCopy = {};
      }
      if (!target.screenCopy[entry.screenId]) {
        target.screenCopy[entry.screenId] = {};
      }
      target.screenCopy[entry.screenId][entry.key] = text;
      return true;
    default:
      return false;
  }
}

export function importUiTranslationsFromCsv(
  csvText: string,
  arReference: UiLocaleFilePayload,
  enReference: UiLocaleFilePayload,
  target: UiLocaleFilePayload,
): UiTranslationImportResult {
  const index = buildLookupIndex(arReference, enReference);
  const rows = parseUiTranslationCsv(csvText);

  let applied = 0;
  let unmatched = 0;
  let duplicateHits = 0;

  for (const row of rows) {
    const lookupKey = `${normalize(row.ar)}|${normalize(row.en)}`;
    const matches = index.get(lookupKey);
    if (!matches?.length) {
      unmatched += 1;
      continue;
    }
    if (matches.length > 1) {
      duplicateHits += 1;
    }
    for (const match of matches) {
      if (applyTranslation(target, match, row.translation)) {
        applied += 1;
      }
    }
  }

  return { applied, unmatched, duplicateHits };
}
