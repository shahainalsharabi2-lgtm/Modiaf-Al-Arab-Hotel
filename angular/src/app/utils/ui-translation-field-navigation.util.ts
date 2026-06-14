import {
  BOOKINGS_NAV_ITEMS,
  FRONT_DESK_NAV_ITEMS,
  PMS_SIDEBAR_GROUPS,
  REPORTS_NAV_ITEMS,
  SETTINGS_SIDEBAR_NAV_ITEMS,
  type SidebarNavItem,
} from '../navigation/sidebar-nav.config';
import { findSettingsNavLeaf } from '../settings/settings-page-nav.config';
import { UI_TRANSLATION_SCREEN_NAV_LABELS } from './ui-translation-screen-labels.config';
import type {
  UiTranslationFieldLocationKind,
  UiTranslationFieldLocationQuery,
} from './ui-translation-field-location.util';

export interface UiTranslationFieldNavigateTarget {
  route: string[];
  queryParams?: Record<string, string>;
  targetSelector: string;
}

function collectSidebarRoutes(): ReadonlyMap<string, { path: string; queryParams?: Record<string, string> }> {
  const map = new Map<string, { path: string; queryParams?: Record<string, string> }>();
  const addItems = (items: readonly SidebarNavItem[]) => {
    for (const item of items) {
      map.set(item.labelKey, { path: item.path, queryParams: item.queryParams });
    }
  };

  addItems(FRONT_DESK_NAV_ITEMS);
  addItems(BOOKINGS_NAV_ITEMS);
  addItems(SETTINGS_SIDEBAR_NAV_ITEMS);
  addItems(REPORTS_NAV_ITEMS);
  for (const group of PMS_SIDEBAR_GROUPS) {
    addItems(group.items);
  }

  map.set('dashboard', { path: '/dashboard' });
  map.set('reports', { path: '/reports' });
  map.set('rooms', { path: '/rooms' });
  map.set('bookings', { path: '/bookings', queryParams: { view: 'records' } });
  map.set('settings', { path: '/settings', queryParams: { tab: 'uiTranslations', nav: 'uiTranslation' } });

  return map;
}

const SIDEBAR_ROUTES = collectSidebarRoutes();

const SCREEN_ID_ROUTES: Readonly<Record<string, { path: string; queryParams?: Record<string, string> }>> = {
  dashboard: { path: '/dashboard' },
  bookings: { path: '/bookings', queryParams: { view: 'records' } },
  rooms: { path: '/rooms' },
  roomForm: { path: '/rooms/add' },
  roomPreview: { path: '/rooms' },
  roomDetails: { path: '/rooms' },
  roomPlan: { path: '/front-desk/room-plan' },
  roomsRack: { path: '/front-desk/rooms-rack' },
  guestValuables: { path: '/front-desk/guest-valuables' },
  keys: { path: '/front-desk/keys' },
  keyServices: { path: '/front-desk/key-services' },
  settings: { path: '/settings', queryParams: { tab: 'general', nav: 'sys-hotels' } },
  generalCodes: { path: '/settings', queryParams: { tab: 'translations', nav: 'sys-general-codings' } },
  myAccount: { path: '/account/manage' },
  reports: { path: '/reports' },
  translationGuide: { path: '/welcome' },
};

function routeFromPath(path: string): string[] {
  if (!path || path === '/') {
    return ['/'];
  }
  return [path];
}

function resolveScreenRoute(screenId: string): { path: string; queryParams?: Record<string, string> } | null {
  const direct = SCREEN_ID_ROUTES[screenId];
  if (direct) {
    return direct;
  }

  const def = UI_TRANSLATION_SCREEN_NAV_LABELS[screenId];
  if (!def) {
    return null;
  }

  for (let index = def.pageKeys.length - 1; index >= 0; index -= 1) {
    const nav = SIDEBAR_ROUTES.get(def.pageKeys[index]);
    if (nav) {
      return nav;
    }
  }

  if (def.sectionKey === 'settings') {
    return { path: '/settings', queryParams: { tab: 'uiTranslations', nav: 'uiTranslation' } };
  }

  return null;
}

export function uiTranslationFieldTargetSelector(
  kind: UiTranslationFieldLocationKind,
  key: string,
  screenId?: string,
): string {
  switch (kind) {
    case 'brandSubtitle':
      return '[data-ui-tr-target="brandSubtitle"]';
    case 'chrome':
      return `[data-ui-tr-chrome-keys*="${key}"], [data-ui-tr-target="chrome:${key}"]`;
    case 'sidebarNav':
      return `[data-ui-tr-target="sidebar:${key}"]`;
    case 'screenCopy':
      return `[data-ui-tr-target="screen:${screenId ?? ''}:${key}"]`;
    case 'settings':
      return `[data-ui-tr-target="screen:settings:${key}"]`;
    default:
      return '[data-ui-tr-target]';
  }
}

export function uiTranslationFieldNavigateTarget(
  query: UiTranslationFieldLocationQuery & { settingsNavId?: string },
): UiTranslationFieldNavigateTarget | null {
  const targetSelector = uiTranslationFieldTargetSelector(query.kind, query.key, query.screenId);

  switch (query.kind) {
    case 'brandSubtitle':
    case 'chrome':
      return { route: ['/dashboard'], targetSelector };
    case 'sidebarNav': {
      const nav = SIDEBAR_ROUTES.get(query.key);
      if (!nav) {
        return { route: ['/dashboard'], targetSelector };
      }
      return {
        route: routeFromPath(nav.path),
        queryParams: nav.queryParams,
        targetSelector,
      };
    }
    case 'settings': {
      const leaf = findSettingsNavLeaf(query.settingsNavId);
      if (leaf) {
        return {
          route: ['/settings'],
          queryParams: leaf.tab
            ? { tab: leaf.tab, nav: leaf.id }
            : { tab: 'page', nav: leaf.id },
          targetSelector,
        };
      }
      return {
        route: ['/settings'],
        queryParams: { tab: 'uiTranslations', nav: 'uiTranslation' },
        targetSelector,
      };
    }
    case 'screenCopy': {
      const screenId = query.screenId ?? '';
      const nav = resolveScreenRoute(screenId);
      if (!nav) {
        return null;
      }
      return {
        route: routeFromPath(nav.path),
        queryParams: nav.queryParams,
        targetSelector,
      };
    }
    default:
      return null;
  }
}

export function findUiTranslationFieldElement(selector: string): HTMLElement | null {
  for (const part of selector.split(',')) {
    const trimmed = part.trim();
    if (!trimmed) {
      continue;
    }
    const found = document.querySelector(trimmed);
    if (found instanceof HTMLElement) {
      return found;
    }
  }
  return null;
}

export function highlightUiTranslationFieldElement(element: HTMLElement): void {
  element.classList.add('ui-tr-field-highlight');
  element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  window.setTimeout(() => {
    element.classList.remove('ui-tr-field-highlight');
  }, 2800);
}

export function uiTranslationScreenNavigateTarget(
  screenId: string,
  settingsNavId?: string,
): UiTranslationFieldNavigateTarget | null {
  if (screenId === 'settings' || settingsNavId) {
    return uiTranslationFieldNavigateTarget({
      kind: 'settings',
      key: 'pageTitle',
      settingsNavId: settingsNavId ?? 'uiTranslation',
    });
  }
  return uiTranslationFieldNavigateTarget({
    kind: 'screenCopy',
    key: 'pageTitle',
    screenId,
  });
}

export function waitAndHighlightUiTranslationField(selector: string, attempt = 0): void {
  const element = findUiTranslationFieldElement(selector);
  if (element) {
    highlightUiTranslationFieldElement(element);
    return;
  }
  if (attempt >= 24) {
    return;
  }
  window.setTimeout(() => waitAndHighlightUiTranslationField(selector, attempt + 1), 150);
}
