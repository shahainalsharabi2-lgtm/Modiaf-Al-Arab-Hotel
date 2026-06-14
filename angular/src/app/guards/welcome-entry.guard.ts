import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const WELCOME_GUIDE_STORAGE_KEY = 'hotelWelcomeGuideCompleted';

export const welcomeEntryGuard: CanActivateFn = () => {
  const router = inject(Router);
  try {
    if (localStorage.getItem(WELCOME_GUIDE_STORAGE_KEY) === '1') {
      return router.createUrlTree(['/settings'], { queryParams: { tab: 'uiTranslations' } });
    }
  } catch {
    /* ignore */
  }
  return router.createUrlTree(['/welcome']);
};
