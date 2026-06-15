import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HotelAuthService } from '../services/hotel-auth.service';

export const loginGuard: CanActivateFn = (route) => {
  const auth = inject(HotelAuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) {
    return true;
  }
  const returnUrl = route.queryParamMap.get('returnUrl') || '/dashboard';
  return router.parseUrl(returnUrl);
};
