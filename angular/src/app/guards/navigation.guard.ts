import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HotelAuthService } from '../services/hotel-auth.service';
import { normalizeLandingPagePath } from '../utils/landing-page-path.util';

/** يقيّد المستخدمين على صفحة محددة فقط (بدون شريط جانبي) */
export const navigationGuard: CanActivateFn = (_route, state) => {
  const auth = inject(HotelAuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated() || auth.canNavigateApp()) {
    return true;
  }
  const current = normalizeLandingPagePath(state.url);
  const locked = normalizeLandingPagePath(auth.lockedHomePath());
  if (current === locked || current === '/login') {
    return true;
  }
  return router.parseUrl(locked);
};
