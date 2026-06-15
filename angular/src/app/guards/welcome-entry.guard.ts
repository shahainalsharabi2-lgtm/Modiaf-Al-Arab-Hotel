import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HotelAuthService } from '../services/hotel-auth.service';

export const WELCOME_GUIDE_STORAGE_KEY = 'hotelWelcomeGuideCompleted';

export const welcomeEntryGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(HotelAuthService);
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }
  try {
    if (localStorage.getItem(WELCOME_GUIDE_STORAGE_KEY) === '1') {
      if (auth.canManageSettings()) {
        return router.createUrlTree(['/settings'], { queryParams: { tab: 'uiTranslations' } });
      }
      if (auth.canNavigateApp()) {
        return router.createUrlTree(['/dashboard']);
      }
      return router.parseUrl(auth.lockedHomePath());
    }
  } catch {
    /* ignore */
  }
  return router.createUrlTree(['/welcome']);
};
