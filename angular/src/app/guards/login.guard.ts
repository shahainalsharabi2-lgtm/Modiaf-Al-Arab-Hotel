import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HotelAuthService } from '../services/hotel-auth.service';
import { normalizeLandingPagePath } from '../utils/landing-page-path.util';

export const loginGuard: CanActivateFn = (route) => {
  const auth = inject(HotelAuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) {
    return true;
  }
  const returnUrl = route.queryParamMap.get('returnUrl');
  const target = auth.canNavigateApp()
    ? returnUrl || '/dashboard'
    : auth.lockedHomePath();
  return router.parseUrl(normalizeLandingPagePath(target));
};
