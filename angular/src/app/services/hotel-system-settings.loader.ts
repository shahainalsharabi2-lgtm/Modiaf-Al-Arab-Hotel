import { Injectable, inject, Injector } from '@angular/core';
import { HotelBrandingStoreService } from './hotel-branding-store.service';
import { HotelCurrencyService } from './hotel-currency.service';
import { HotelSettingsDto, HotelSettingsService } from './hotel-settings.service';
import { Observable, tap } from 'rxjs';
import { UiTranslationsService } from './ui-translations.service';
import { ArabicPreferenceCategoryService } from './arabic-preference-category.service';
import type { HotelUiLocaleCode } from '../utils/hotel-currency.presets';

@Injectable({ providedIn: 'root' })
export class HotelSystemSettingsLoader {
  private readonly api = inject(HotelSettingsService);
  private readonly branding = inject(HotelBrandingStoreService);
  private readonly currency = inject(HotelCurrencyService);
  private readonly injector = inject(Injector);

  /** العملة تُحدَّد تلقائياً — لا اختيار يدوي */
  syncAutomaticCurrency(persist = false): void {
    const locale = this.injector.get(UiTranslationsService).displayLocale();
    if (locale === 'ar') {
      this.injector.get(ArabicPreferenceCategoryService).applyCurrencyForSelectedCategory(persist);
      return;
    }
    this.currency.syncForUiLocale(locale as HotelUiLocaleCode, { persist });
  }

  load(): Observable<HotelSettingsDto> {
    return this.api.get().pipe(
      tap((dto: HotelSettingsDto) => {
        this.branding.applyFromDto(dto);
        this.syncAutomaticCurrency(false);
      }),
    );
  }

  save(): Observable<HotelSettingsDto> {
    const dto = this.branding.buildSettingsDto(this.currency.toStorageFields());
    return this.api.save(dto);
  }
}
