import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { HotelAuthService } from '../services/hotel-auth.service';

export const authGuard: CanActivateFn = () => {
  inject(HotelAuthService).ensureGuestSession();
  return true;
};
