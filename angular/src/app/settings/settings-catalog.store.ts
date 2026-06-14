export interface SettingsCatalogRow {
  id: string;
  displayOrder: number;
  nameAr: string;
  nameEn: string;
  description: string;
}

const STORAGE_PREFIX = 'hotelSettingsCatalog:';

function storageKey(navId: string): string {
  return `${STORAGE_PREFIX}${navId}`;
}

export function loadSettingsCatalogRows(navId: string): SettingsCatalogRow[] {
  if (!navId || typeof localStorage === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(storageKey(navId));
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as SettingsCatalogRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSettingsCatalogRows(navId: string, rows: SettingsCatalogRow[]): void {
  if (!navId || typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(storageKey(navId), JSON.stringify(rows));
}

export function nextSettingsCatalogRowId(): string {
  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
