import {
  HOTEL_USER_ROLE,
  canManageSettings,
  normalizeHotelUserRole,
  type HotelUserRole,
} from './hotel-user-role';
import { DEFAULT_LANDING_PAGE_PATH, normalizeLandingPagePath } from './landing-page-path.util';
import { findSettingsNavLeaf } from '../settings/settings-page-nav.config';
import { isSystemOwnerSession } from './hotel-system-owner.util';

/** صفحة ترجمة الواجهة للمترجم */
export const TRANSLATOR_UI_PATH = '/settings?tab=uiTranslations&nav=uiTranslation';

const MANAGER_ONLY_SETTINGS_TABS = new Set(['uiTranslations', 'users']);

export type AppPageAccessSession = {
  role?: string | null;
  allowNavigation?: boolean;
  landingPagePath?: string | null;
  denyUserManagement?: boolean;
  isSystemOwner?: boolean;
};

function settingsQueryFromPath(path: string): URLSearchParams {
  const normalized = normalizeLandingPagePath(path);
  const qIndex = normalized.indexOf('?');
  if (qIndex < 0) {
    return new URLSearchParams();
  }
  return new URLSearchParams(normalized.slice(qIndex + 1));
}

export function isTranslatorLandingPath(path: string | null | undefined): boolean {
  return normalizeLandingPagePath(path ?? '') === normalizeLandingPagePath(TRANSLATOR_UI_PATH);
}

export function isTranslatorSession(session: AppPageAccessSession | null | undefined): boolean {
  if (!session || session.allowNavigation !== false) {
    return false;
  }
  if (canManageSettings(session.role, { isSystemOwner: session.isSystemOwner })) {
    return false;
  }
  return isTranslatorLandingPath(session.landingPagePath);
}

/** مسارات إعدادات النظام المحجوزة للمدير فقط (ما عدا المترجم على صفحة الترجمة) */
export function isManagerOnlyAppPath(url: string): boolean {
  const normalized = normalizeLandingPagePath(url);
  if (!normalized.startsWith('/settings')) {
    return false;
  }
  if (isTranslatorLandingPath(normalized)) {
    return false;
  }
  const params = settingsQueryFromPath(normalized);
  const tab = (params.get('tab') || '').trim();
  const nav = (params.get('nav') || '').trim();
  if (MANAGER_ONLY_SETTINGS_TABS.has(tab)) {
    return true;
  }
  const leaf = findSettingsNavLeaf(nav);
  if (leaf?.requiresSettings || leaf?.requiresUsers) {
    return true;
  }
  return false;
}

function canAccessUserManagementPages(session: AppPageAccessSession | null | undefined): boolean {
  if (!session) {
    return false;
  }
  if (isSystemOwnerSession(session)) {
    return true;
  }
  if (session.denyUserManagement === true) {
    return false;
  }
  return normalizeHotelUserRole(session.role) === HOTEL_USER_ROLE.Manager;
}

function isUserManagementAppPath(url: string): boolean {
  const normalized = normalizeLandingPagePath(url);
  if (!normalized.startsWith('/settings')) {
    return false;
  }
  const params = settingsQueryFromPath(normalized);
  const tab = (params.get('tab') || '').trim();
  const nav = (params.get('nav') || '').trim();
  if (tab === 'users') {
    return true;
  }
  const leaf = findSettingsNavLeaf(nav);
  return leaf?.requiresUsers === true;
}

function canAccessManagerOnlySettings(session: AppPageAccessSession | null | undefined): boolean {
  if (!session) {
    return false;
  }
  if (isSystemOwnerSession(session)) {
    return true;
  }
  return canManageSettings(session.role, { isSystemOwner: session.isSystemOwner });
}

export function isAppPathAllowedForSession(
  url: string,
  session: AppPageAccessSession | null | undefined,
): boolean {
  if (!session) {
    return true;
  }
  if (isSystemOwnerSession(session)) {
    return true;
  }
  if (isTranslatorSession(session)) {
    const current = normalizeLandingPagePath(url);
    return current === normalizeLandingPagePath(TRANSLATOR_UI_PATH) || current === '/login';
  }
  if (isUserManagementAppPath(url) && !canAccessUserManagementPages(session)) {
    return false;
  }
  if (isManagerOnlyAppPath(url) && !canAccessManagerOnlySettings(session)) {
    return false;
  }
  return true;
}

export function sanitizeLandingPageForRole(
  url: string,
  role: string | null | undefined,
): string {
  if (isTranslatorLandingPath(url)) {
    return normalizeLandingPagePath(TRANSLATOR_UI_PATH);
  }
  const normalized = normalizeLandingPagePath(url);
  if (canManageSettings(role)) {
    return normalized;
  }
  if (isManagerOnlyAppPath(normalized)) {
    return DEFAULT_LANDING_PAGE_PATH;
  }
  return normalized;
}

export function roleFromGroupIds(groupIds: number[]): HotelUserRole {
  if (groupIds.includes(1)) {
    return HOTEL_USER_ROLE.Manager;
  }
  if (groupIds.includes(3) || groupIds.includes(8)) {
    return HOTEL_USER_ROLE.Cashier;
  }
  if (groupIds.includes(2)) {
    return HOTEL_USER_ROLE.Accountant;
  }
  return HOTEL_USER_ROLE.Regular;
}

export function canAccessUiTranslations(session: AppPageAccessSession | null | undefined): boolean {
  if (!session) {
    return false;
  }
  return canManageSettings(session.role, { isSystemOwner: session.isSystemOwner }) || isTranslatorSession(session);
}
