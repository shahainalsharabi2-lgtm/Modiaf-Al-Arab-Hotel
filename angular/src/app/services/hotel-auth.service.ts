import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  HOTEL_USER_ROLE,
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
}

export interface HotelLoginResult {
  success: boolean;
  message?: string;
  user?: HotelAppUserSession;
}

const SESSION_STORAGE_KEY = 'hotelAppUserSession';

/** جلسة افتراضية — بدون صفحة تسجيل دخول */
const DEFAULT_GUEST_SESSION: HotelAppUserSession = {
  id: 0,
  firstName: 'Hotel',
  lastName: 'Premio',
  userName: 'admin',
  email: '',
  phoneNumber: '',
  role: HOTEL_USER_ROLE.Manager,
};

@Injectable({ providedIn: 'root' })
export class HotelAuthService {
  private readonly http = inject(HttpClient);
  private session: HotelAppUserSession | null = null;

  constructor() {
    this.restoreSession();
    this.ensureGuestSession();
  }

  private get apiUrl(): string {
    return `${environment.apis.default.url}/api/app/hotel-auth/login`;
  }

  isLoggedIn(): boolean {
    this.ensureGuestSession();
    return this.session != null;
  }

  /** يضمن وجود جلسة نشطة دون صفحة login */
  ensureGuestSession(): void {
    if (this.session) {
      return;
    }
    this.persistSession({ ...DEFAULT_GUEST_SESSION });
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
    this.ensureGuestSession();
  }

  private persistSession(user: HotelAppUserSession): void {
    this.session = {
      ...user,
      role: normalizeHotelUserRole(user.role),
    };
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
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
      if (parsed?.id && parsed?.userName) {
        this.session = {
          ...parsed,
          role: normalizeHotelUserRole(parsed.role),
        };
      }
    } catch {
      this.session = null;
    }
  }
}
