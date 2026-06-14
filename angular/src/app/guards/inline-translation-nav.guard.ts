import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { UiTranslationsService } from '../services/ui-translations.service';

/** يمنع الانتقال لصفحة أخرى أثناء وضع ترجمة الواجهة على الصفحة الحالية */
export const inlineTranslationNavGuard: CanActivateFn = () => {
  const ui = inject(UiTranslationsService);
  if (!ui.inlineTranslationMode()) {
    return true;
  }
  ui.notifyInlineTranslationNavBlocked();
  return false;
};
