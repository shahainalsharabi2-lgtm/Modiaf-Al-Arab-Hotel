import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom, map, switchMap, tap } from 'rxjs';
import { HotelSettingsService } from './hotel-settings.service';
import {
  DEFAULT_LANDING_PAGE_PATH,
  normalizeLandingPagePath,
} from '../utils/landing-page-path.util';
import {
  TRANSLATOR_UI_PATH,
  isTranslatorLandingPath,
  sanitizeLandingPageForRole,
} from '../utils/landing-page-access.util';
import type { HotelAppUserSession } from './hotel-auth.service';

export interface HotelUserPageAccessEntry {
  allowNavigation: boolean;
  landingPagePath: string;
}

const PROFILE_ACCESS_KEY = 'userPageAccess';

function parseProfileRoot(raw: string | null | undefined): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw || '{}') as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    /* ignore */
  }
  return {};
}

function normalizeEntry(raw: unknown): HotelUserPageAccessEntry | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const row = raw as Partial<HotelUserPageAccessEntry>;
  return {
    allowNavigation: row.allowNavigation !== false,
    landingPagePath: normalizeLandingPagePath(row.landingPagePath),
  };
}

@Injectable({ providedIn: 'root' })
export class HotelUserPageAccessService {
  private readonly settings = inject(HotelSettingsService);
  private cache: Record<string, HotelUserPageAccessEntry> = {};
  private loadPromise: Promise<void> | null = null;

  ensureLoaded(): Observable<void> {
    return new Observable<void>((subscriber) => {
      void this.loadCache()
        .then(() => {
          subscriber.next();
          subscriber.complete();
        })
        .catch((err) => subscriber.error(err));
    });
  }

  getForUser(userId: number, userName: string): HotelUserPageAccessEntry | null {
    const byId = this.cache[String(userId)];
    if (byId) {
      return byId;
    }
    const key = (userName ?? '').trim().toLowerCase();
    return key ? (this.cache[key] ?? null) : null;
  }

  mergeIntoSessionUser(user: HotelAppUserSession): HotelAppUserSession {
    if (this.userHasApiAccessFields(user)) {
      return user;
    }
    const stored = this.getForUser(user.id, user.userName);
    if (!stored) {
      return user;
    }
    const allowNavigation = stored.allowNavigation !== false;
    const landingPagePath = allowNavigation
      ? DEFAULT_LANDING_PAGE_PATH
      : isTranslatorLandingPath(stored.landingPagePath)
        ? TRANSLATOR_UI_PATH
        : sanitizeLandingPageForRole(stored.landingPagePath, user.role);
    return {
      ...user,
      allowNavigation,
      landingPagePath,
    };
  }

  saveForUser(
    userId: number,
    userName: string,
    entry: HotelUserPageAccessEntry,
    role = 'user',
  ): Observable<void> {
    const allowNavigation = entry.allowNavigation !== false;
    const landingPagePath = allowNavigation
      ? DEFAULT_LANDING_PAGE_PATH
      : isTranslatorLandingPath(entry.landingPagePath)
        ? TRANSLATOR_UI_PATH
        : sanitizeLandingPageForRole(entry.landingPagePath, role);
    const normalized: HotelUserPageAccessEntry = {
      allowNavigation,
      landingPagePath,
    };
    const idKey = String(userId);
    const nameKey = userName.trim().toLowerCase();
    this.cache[idKey] = normalized;
    if (nameKey) {
      this.cache[nameKey] = normalized;
    }

    return this.settings.get().pipe(
      switchMap((dto) => {
        const root = parseProfileRoot(dto.profileJson);
        const existing = (root[PROFILE_ACCESS_KEY] as Record<string, unknown> | undefined) ?? {};
        const nextMap = {
          ...existing,
          [idKey]: normalized,
          ...(nameKey ? { [nameKey]: normalized } : {}),
        };
        root[PROFILE_ACCESS_KEY] = nextMap;
        return this.settings.save({
          ...dto,
          profileJson: JSON.stringify(root),
        });
      }),
      tap((dto) => this.hydrateCache(parseProfileRoot(dto.profileJson))),
      map(() => void 0),
    );
  }

  userHasApiAccessFields(
    user: Partial<HotelAppUserSession> | { allowNavigation?: boolean; landingPagePath?: string },
  ): boolean {
    return (
      Object.prototype.hasOwnProperty.call(user, 'allowNavigation') ||
      Object.prototype.hasOwnProperty.call(user, 'landingPagePath')
    );
  }

  private async loadCache(): Promise<void> {
    if (!this.loadPromise) {
      this.loadPromise = firstValueFrom(this.settings.get())
        .then((dto) => {
          this.hydrateCache(parseProfileRoot(dto?.profileJson));
        })
        .catch(() => {
          this.cache = {};
        });
    }
    await this.loadPromise;
  }

  private hydrateCache(root: Record<string, unknown>): void {
    const rawMap = root[PROFILE_ACCESS_KEY];
    if (!rawMap || typeof rawMap !== 'object' || Array.isArray(rawMap)) {
      this.cache = {};
      return;
    }
    const next: Record<string, HotelUserPageAccessEntry> = {};
    for (const [key, value] of Object.entries(rawMap as Record<string, unknown>)) {
      const entry = normalizeEntry(value);
      if (entry) {
        next[key] = entry;
      }
    }
    this.cache = next;
  }
}
