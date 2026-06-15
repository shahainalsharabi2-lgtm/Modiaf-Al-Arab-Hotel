import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { HotelAuthService } from '../services/hotel-auth.service';
import { UiTranslationsService } from '../services/ui-translations.service';

/** يمنع الانتقال لصفحة أخرى أثناء وضع ترجمة الواجهة على الصفحة الحالية */
export const inlineTranslationNavGuard: CanActivateFn = () => {
  const ui = inject(UiTranslationsService);
  const auth = inject(HotelAuthService);
  if (!auth.canManageSettings()) {
    if (ui.inlineTranslationMode()) {
      ui.inlineTranslationMode.set(false);
    }
    return true;
  }
  if (!ui.inlineTranslationMode()) {
    return true;
  }
  ui.notifyInlineTranslationNavBlocked();
  return false;
};
