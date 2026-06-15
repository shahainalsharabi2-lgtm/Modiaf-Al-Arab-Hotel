import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  canManageHotelUsers,
  canManageSettings,
  normalizeHotelUserRole,
  type HotelUserRole,
} from '../utils/hotel-user-role';

export interface HotelAppUserSession {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  role: HotelUserRole;
  allowNavigation: boolean;
}

export interface HotelLoginResult {
  success: boolean;
  message?: string;
  user?: HotelAppUserSession;
}

const SESSION_STORAGE_KEY = 'hotelAppUserSession';
export const LOCKED_HOME_PATH = '/dashboard';

@Injectable({ providedIn: 'root' })
export class HotelAuthService {
  private readonly http = inject(HttpClient);
  private session: HotelAppUserSession | null = null;

  constructor() {
    this.restoreSession();
  }

  private get apiUrl(): string {
    return `${environment.apis.default.url}/api/app/hotel-auth/login`;
  }

  isAuthenticated(): boolean {
    return (this.session?.id ?? 0) > 0;
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
    return canManageHotelUsers(this.session?.role);
  }

  canManageSettings(): boolean {
    return canManageSettings(this.session?.role);
  }

  canNavigateApp(): boolean {
    if (canManageSettings(this.session?.role)) {
      return true;
    }
    return this.session?.allowNavigation !== false;
  }

  lockedHomePath(): string {
    return LOCKED_HOME_PATH;
  }

  login(userName: string, password: string): Observable<HotelLoginResult> {
    return this.http
      .post<HotelLoginResult>(this.apiUrl, {
        userName: userName.trim(),
        password,
      })
      .pipe(
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
    this.session = {
      ...user,
      role: normalizeHotelUserRole(user.role),
      allowNavigation: user.allowNavigation !== false,
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
        };
      }
    } catch {
      this.session = null;
    }
  }
}
