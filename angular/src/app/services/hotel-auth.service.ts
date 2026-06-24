import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  canManageHotelUsers,
  canManageSettings,
  normalizeHotelUserRole,
  type HotelUserRole,
} from '../utils/hotel-user-role';
import {
  DEFAULT_LANDING_PAGE_PATH,
  normalizeLandingPagePath,
} from '../utils/landing-page-path.util';
import { sanitizeLandingPageForRole, isTranslatorSession, canAccessUiTranslations } from '../utils/landing-page-access.util';
import { isSystemOwnerSession } from '../utils/hotel-system-owner.util';
import { HotelUserPageAccessService } from './hotel-user-page-access.service';

export interface HotelAppUserSession {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  role: HotelUserRole;
  allowNavigation: boolean;
  landingPagePath: string;
  denyUserManagement?: boolean;
  isSystemOwner?: boolean;
}

export interface HotelLoginResult {
  success: boolean;
  message?: string;
  user?: HotelAppUserSession & { denyUserManagement?: boolean; isSystemOwner?: boolean };
}

const SESSION_STORAGE_KEY = 'hotelAppUserSession';
export const LOCKED_HOME_PATH = DEFAULT_LANDING_PAGE_PATH;

@Injectable({ providedIn: 'root' })
export class HotelAuthService {
  private readonly http = inject(HttpClient);
  private readonly pageAccess = inject(HotelUserPageAccessService);
  private session: HotelAppUserSession | null = null;

  constructor() {
    this.restoreSession();
    this.pageAccess.ensureLoaded().subscribe(() => {
      if (!this.session) {
        return;
      }
      const merged = this.pageAccess.mergeIntoSessionUser(this.session);
      if (
        merged.allowNavigation !== this.session.allowNavigation ||
        merged.landingPagePath !== this.session.landingPagePath
      ) {
        this.persistSession(merged);
      }
    });
  }

  private get apiUrl(): string {
    return `${environment.apis.default.url}/api/app/hotel-auth/login`;
  }

  isAuthenticated(): boolean {
    return isSystemOwnerSession(this.session) || (this.session?.id ?? 0) > 0;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  currentUser(): HotelAppUserSession | null {
    return this.session;
  }

  currentRole(): HotelUserRole | null {
    return this.session?.role ?? null;
  }

  canManageUsers(): boolean {
    return canManageHotelUsers(this.session?.role, {
      denyUserManagement: this.session?.denyUserManagement,
      isSystemOwner: this.session?.isSystemOwner,
    });
  }

  canManageSettings(): boolean {
    return canManageSettings(this.session?.role, {
      isSystemOwner: this.session?.isSystemOwner,
    });
  }

  isSystemOwner(): boolean {
    return isSystemOwnerSession(this.session);
  }

  isTranslatorUser(): boolean {
    return isTranslatorSession(this.session);
  }

  canAccessUiTranslations(): boolean {
    return canAccessUiTranslations(this.session);
  }

  canNavigateApp(): boolean {
    if (isSystemOwnerSession(this.session)) {
      return true;
    }
    if (canManageSettings(this.session?.role, { isSystemOwner: this.session?.isSystemOwner })) {
      return true;
    }
    return this.session?.allowNavigation !== false;
  }

  lockedHomePath(): string {
    if (this.session?.allowNavigation !== false) {
      return DEFAULT_LANDING_PAGE_PATH;
    }
    const raw = normalizeLandingPagePath(this.session?.landingPagePath);
    return sanitizeLandingPageForRole(raw, this.session?.role);
  }

  login(userName: string, password: string): Observable<HotelLoginResult> {
    return this.http
      .post<HotelLoginResult>(this.apiUrl, {
        userName: userName.trim(),
        password,
      })
      .pipe(
        switchMap((result) => {
          if (!result.success || !result.user) {
            return of(result);
          }
          return this.pageAccess.ensureLoaded().pipe(
            map(() => ({
              ...result,
              user: this.pageAccess.mergeIntoSessionUser(result.user!),
            })),
            catchError(() =>
              of({
                ...result,
                user: result.user!,
              }),
            ),
          );
        }),
        tap((result) => {
          if (result.success && result.user) {
            this.persistSession(result.user);
          }
        }),
      );
  }

  updateSession(user: HotelAppUserSession): void {
    this.persistSession(user);
  }

  logout(): void {
    this.session = null;
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  private persistSession(user: HotelAppUserSession): void {
    const role = normalizeHotelUserRole(user.role);
    const allowNavigation = user.allowNavigation !== false;
    const landingPagePath = allowNavigation
      ? DEFAULT_LANDING_PAGE_PATH
      : sanitizeLandingPageForRole(user.landingPagePath, role);
    this.session = {
      ...user,
      role,
      allowNavigation,
      landingPagePath,
      denyUserManagement: user.isSystemOwner ? false : user.denyUserManagement !== false,
      isSystemOwner: user.isSystemOwner === true,
    };
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.session));
    } catch {
      /* ignore */
    }
  }

  private restoreSession(): void {
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as HotelAppUserSession;
      if ((parsed?.id ?? 0) > 0 && parsed?.userName) {
        this.session = {
          ...parsed,
          role: normalizeHotelUserRole(parsed.role),
          allowNavigation: parsed.allowNavigation !== false,
          landingPagePath: parsed.allowNavigation === false
            ? sanitizeLandingPageForRole(parsed.landingPagePath, parsed.role)
            : DEFAULT_LANDING_PAGE_PATH,
          denyUserManagement: parsed.isSystemOwner ? false : parsed.denyUserManagement !== false,
          isSystemOwner: parsed.isSystemOwner === true,
        };
      } else if (isSystemOwnerSession(parsed)) {
        this.session = {
          ...parsed,
          role: normalizeHotelUserRole(parsed.role),
          allowNavigation: true,
          landingPagePath: DEFAULT_LANDING_PAGE_PATH,
          denyUserManagement: false,
          isSystemOwner: true,
        };
      }
    } catch {
      this.session = null;
    }
  }
}
