import { collectActiveSidebarNavLabelKeys } from '../navigation/sidebar-nav.config';
import type { UiManualTranslationsPayload } from './ui-translation.constants';
import { UI_CHROME_KEYS } from './ui-translation.constants';
import { isUiTranslationScreenDisplayed } from './ui-visible-screens.config';

/** شكل ملف لغة واحدة (ar.json / tr.json / zh-Hans.json) */
export interface UiLocaleFilePayload {
  sidebarNav?: Record<string, string>;
  brandSubtitle?: string;
  chrome?: Record<string, string>;
  screenCopy?: Record<string, Record<string, string>>;
}

export function extractLocaleFile(
  payload: UiManualTranslationsPayload,
  locale: string,
): UiLocaleFilePayload {
  const file: UiLocaleFilePayload = {};
  const nav = payload.sidebarNav?.[locale];
  if (nav !== undefined) {
    file.sidebarNav = { ...nav };
  }
  const sub = payload.brandSubtitle?.[locale];
  if (sub !== undefined) {
    file.brandSubtitle = sub;
  }
  const chrome = payload.chrome?.[locale];
  if (chrome !== undefined) {
    file.chrome = { ...chrome };
  }
  const screens = payload.screenCopy?.[locale];
  if (screens !== undefined) {
    file.screenCopy = JSON.parse(JSON.stringify(screens)) as Record<
      string,
      Record<string, string>
    >;
  }
  return file;
}

export function mergeLocaleFileIntoPayload(
  payload: UiManualTranslationsPayload,
  locale: string,
  file: UiLocaleFilePayload,
): UiManualTranslationsPayload {
  const next = structuredClone(payload) as UiManualTranslationsPayload;

  if (!next.sidebarNav) {
    next.sidebarNav = {};
  }
  if (!next.brandSubtitle) {
    next.brandSubtitle = {};
  }
  if (!next.chrome) {
    next.chrome = {};
  }
  if (!next.screenCopy) {
    next.screenCopy = {};
  }

  if (file.sidebarNav !== undefined) {
    next.sidebarNav[locale] = file.sidebarNav;
  }
  if (file.brandSubtitle !== undefined) {
    next.brandSubtitle[locale] = file.brandSubtitle;
  }
  if (file.chrome !== undefined) {
    next.chrome[locale] = file.chrome;
  }
  if (file.screenCopy !== undefined) {
    next.screenCopy[locale] = file.screenCopy;
  }

  return next;
}

export function localeFileToJson(file: UiLocaleFilePayload, indent = 2): string {
  return JSON.stringify(file, null, indent);
}

export function parseLocaleFileJson(json: string): UiLocaleFilePayload {
  const parsed = JSON.parse(json) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new SyntaxError('Locale JSON must be an object');
  }
  return parsed as UiLocaleFilePayload;
}

/** نموذج تحرير: كل المفاتيح المعروفة + الموجودة في الملف المرجعي (عادة ar) */
export function prepareLocaleFileForForm(
  file: UiLocaleFilePayload,
  reference?: UiLocaleFilePayload,
): UiLocaleFilePayload {
  const sidebarNav: Record<string, string> = {};
  const chrome: Record<string, string> = {};
  const screenCopy: Record<string, Record<string, string>> = {};

  for (const k of collectActiveSidebarNavLabelKeys()) {
    sidebarNav[k] = file.sidebarNav?.[k] ?? '';
  }

  const chromeKeys = new Set<string>([
    ...UI_CHROME_KEYS.map((k) => k.key),
    ...Object.keys(file.chrome ?? {}),
    ...Object.keys(reference?.chrome ?? {}),
  ]);
  for (const k of chromeKeys) {
    chrome[k] = file.chrome?.[k] ?? '';
  }

  const screenIds = new Set<string>([
    ...Object.keys(file.screenCopy ?? {}),
    ...Object.keys(reference?.screenCopy ?? {}),
  ].filter(isUiTranslationScreenDisplayed));
  for (const screenId of screenIds) {
    const msgKeys = new Set<string>([
      ...Object.keys(file.screenCopy?.[screenId] ?? {}),
      ...Object.keys(reference?.screenCopy?.[screenId] ?? {}),
    ]);
    screenCopy[screenId] = {};
    for (const mk of msgKeys) {
      screenCopy[screenId][mk] = file.screenCopy?.[screenId]?.[mk] ?? '';
    }
  }

  return {
    brandSubtitle: file.brandSubtitle ?? '',
    sidebarNav,
    chrome,
    screenCopy,
  };
}

/** يقيّد مفاتيح ملف اللغة بما هو موجود في ملف asset (يحذف المفاتيح اليتيمة من API القديم) */
export function alignLocaleFileToAsset(
  localeFile: UiLocaleFilePayload,
  asset: UiLocaleFilePayload,
): UiLocaleFilePayload {
  const next = structuredClone(localeFile) as UiLocaleFilePayload;

  if (asset.chrome) {
    const chrome: Record<string, string> = {};
    for (const key of Object.keys(asset.chrome)) {
      chrome[key] = next.chrome?.[key] ?? asset.chrome[key] ?? '';
    }
    next.chrome = chrome;
  }

  if (asset.screenCopy) {
    const screenCopy: Record<string, Record<string, string>> = {
      ...(next.screenCopy ?? {}),
    };
    for (const [screenId, assetMsgs] of Object.entries(asset.screenCopy)) {
      if (!assetMsgs || typeof assetMsgs !== 'object') {
        continue;
      }
      const existingScreen = next.screenCopy?.[screenId] ?? {};
      const alignedScreen: Record<string, string> = {};
      for (const key of Object.keys(assetMsgs)) {
        alignedScreen[key] = existingScreen[key] ?? assetMsgs[key] ?? '';
      }
      screenCopy[screenId] = alignedScreen;
    }
    next.screenCopy = screenCopy;
  }

  return next;
}

export function normalizeLocaleFileForSave(file: UiLocaleFilePayload): UiLocaleFilePayload {
  const sidebarNav: Record<string, string> = {};
  const activeNavKeys = new Set(collectActiveSidebarNavLabelKeys());
  for (const [k, v] of Object.entries(file.sidebarNav ?? {})) {
    if (!activeNavKeys.has(k)) {
      continue;
    }
    sidebarNav[k] = (v ?? '').trim();
  }

  const chrome: Record<string, string> = {};
  for (const [k, v] of Object.entries(file.chrome ?? {})) {
    chrome[k] = (v ?? '').trim();
  }

  const screenCopy: Record<string, Record<string, string>> = {};
  for (const [screenId, msgs] of Object.entries(file.screenCopy ?? {})) {
    if (!isUiTranslationScreenDisplayed(screenId)) {
      continue;
    }
    screenCopy[screenId] = {};
    for (const [mk, v] of Object.entries(msgs ?? {})) {
      screenCopy[screenId][mk] = (v ?? '').trim();
    }
  }

  return {
    brandSubtitle: (file.brandSubtitle ?? '').trim(),
    sidebarNav,
    chrome,
    screenCopy,
  };
}
