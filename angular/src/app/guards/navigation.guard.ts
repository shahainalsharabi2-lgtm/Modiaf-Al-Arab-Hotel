import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HotelAuthService } from '../services/hotel-auth.service';

/** يقيّد المستخدمين بدون صلاحية تنقل على الصفحة الرئيسية فقط */
export const navigationGuard: CanActivateFn = (_route, state) => {
  const auth = inject(HotelAuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated() || auth.canNavigateApp()) {
    return true;
  }
  const path = (state.url.split('?')[0] || '').replace(/\/$/, '') || '/';
  const home = auth.lockedHomePath();
  if (path === home || path === '/login') {
    return true;
  }
  return router.parseUrl(home);
};
