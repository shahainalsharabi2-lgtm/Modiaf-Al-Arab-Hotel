import { Injectable, Injector, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of, Subscription, switchMap, tap } from 'rxjs';
import {
  alignLocaleFileToAsset,
  extractLocaleFile,
  localeFileToJson,
  mergeLocaleFileIntoPayload,
  normalizeLocaleFileForSave,
  parseLocaleFileJson,
  prepareLocaleFileForForm,
} from '../utils/ui-translations-locale.util';
import type { UiLocaleFilePayload } from '../utils/ui-translations-locale.util';
import { environment } from '../../environments/environment';
import type {
  UiExtraLocaleCode,
  UiManualTranslationsPayload,
  UiTranslationsBlobDto,
} from '../utils/ui-translation.constants';
import {
  HOTEL_UI_LOCALE_STORAGE_KEY,
  SIDEBAR_NAV_KEYS,
  UI_BRAND_SUBTITLE_FIXED,
  UI_CHROME_KEYS,
  UI_EXTRA_LOCALES,
} from '../utils/ui-translation.constants';
import { roomTypeTranslationKey } from '../utils/room-type-i18n';
import { HotelCurrencyService, HOTEL_CURRENCY_UPDATED_EVENT } from './hotel-currency.service';
import { ArabicPreferenceCategoryService } from './arabic-preference-category.service';
import { HotelSystemSettingsLoader } from './hotel-system-settings.loader';
import type { HotelUiLocaleCode } from '../utils/hotel-currency.presets';
import { UiMessageService } from './ui-message.service';
import { uiLocalePickerOption } from '../utils/ui-locale-picker.util';
import { isUiTranslationCorruptedNumericPlaceholder } from '../utils/ui-translation-group-stats.util';

const DEFAULT_UI_LOCALE: UiExtraLocaleCode | 'ar' = 'ar';

export type UiInlineFieldKind = 'screen' | 'sidebar' | 'chrome';

@Injectable({
  providedIn: 'root',
})
export class UiTranslationsService {
  private readonly http = inject(HttpClient);
  private readonly hotelCurrency = inject(HotelCurrencyService);
  private readonly injector = inject(Injector);

  /** يُحمَّل من API مع إكمال النقص من ملفات assets المحلية */
  private readonly payload = signal<UiManualTranslationsPayload>({});

  /** false أثناء جلب/دمج الترجمات — يمنع الحفظ قبل اكتمال تحميل en/fr */
  readonly payloadReady = signal(false);

  private fetchInFlight: Subscription | null = null;

  /** يمنع استبدال payload محفوظ حديثاً باستجابة fetch قديمة */
  private lastPayloadMutationAt = 0;

  readonly displayLocale = signal<UiExtraLocaleCode | 'ar'>(DEFAULT_UI_LOCALE);

  /** تفعيل الترجمة المباشرة على الصفحة الحالية (زر ترجمة واجهة النظام) */
  readonly inlineTranslationMode = signal(false);

  readonly inlineTranslationSaving = signal(false);

  readonly extraLocales = UI_EXTRA_LOCALES;

  private get apiUrl(): string {
    return `${environment.apis.default.url}/api/app/ui-translations-blob`;
  }

  constructor() {
    this.restoreLocaleFromStorage();
  }

  private restoreLocaleFromStorage(): void {
    try {
      const raw = localStorage.getItem(HOTEL_UI_LOCALE_STORAGE_KEY);
      if (raw === 'ar' || raw === 'en' || raw === 'fr' || raw === 'tr') {
        this.displayLocale.set(raw);
        if (raw !== 'ar') {
          this.hotelCurrency.syncForUiLocale(raw as HotelUiLocaleCode, { persist: false });
        }
      } else if (raw === 'id' || raw === 'zh-Hans') {
        try {
          localStorage.setItem(HOTEL_UI_LOCALE_STORAGE_KEY, 'ar');
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* ignore */
    }
  }

  setDisplayLocale(locale: UiExtraLocaleCode | 'ar', options?: { skipToast?: boolean }): void {
    const previous = this.displayLocale();
    if (previous === locale) {
      return;
    }
    this.displayLocale.set(locale);
    if (locale === 'ar') {
      this.inlineTranslationMode.set(false);
    }
    try {
      localStorage.setItem(HOTEL_UI_LOCALE_STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
    if (locale === 'ar') {
      this.injector.get(ArabicPreferenceCategoryService).applyCurrencyForSelectedCategory();
    } else {
      this.hotelCurrency.syncForUiLocale(locale as HotelUiLocaleCode, { persist: false });
      this.injector.get(HotelSystemSettingsLoader).save().subscribe({
        next: () => window.dispatchEvent(new Event(HOTEL_CURRENCY_UPDATED_EVENT)),
        error: () => window.dispatchEvent(new Event(HOTEL_CURRENCY_UPDATED_EVENT)),
      });
    }
    window.dispatchEvent(new Event('hotelUiLocaleChanged'));
    if (!options?.skipToast) {
      this.showLocaleChangedToast(locale);
    }
  }

  private showLocaleChangedToast(locale: UiExtraLocaleCode | 'ar'): void {
    const opt = uiLocalePickerOption(locale);
    const label = this.screenText('settings', opt.labelKey);
    const message = this.chromeLabel('toastLocaleChanged').replace('{0}', label);
    this.injector.get(UiMessageService).success(message, {
      title: this.chromeLabel('toastLocaleChangedTitle'),
    });
  }

  reloadFromBackend(done?: () => void): void {
    this.fetchFromBackend(() => {
      window.dispatchEvent(new Event('hotelUiTranslationsUpdated'));
      done?.();
    });
  }

  fetchFromBackend(done?: () => void): void {
    this.payloadReady.set(false);
    const fetchStarted = Date.now();
    this.fetchInFlight?.unsubscribe();
    this.fetchInFlight = this.http.get<UiTranslationsBlobDto>(this.apiUrl).subscribe({
      next: (dto) => {
        if (this.lastPayloadMutationAt <= fetchStarted) {
          this.applyPayloadJson(dto?.payloadJson);
        }
        this.mergeMissingLocalesFromAssets(done);
      },
      error: () => {
        this.loadFallbackFromAssets(done);
      },
    });
  }

  /** يكمّل ar/en/tr من ملفات assets المحلية بعد استجابة API */
  private mergeMissingLocalesFromAssets(done?: () => void): void {
    const assetLocales: Array<UiExtraLocaleCode | 'ar'> = ['ar', 'en', 'tr'];
    forkJoin(
      assetLocales.map((locale) =>
        this.http.get<UiLocaleFilePayload>(`/assets/ui-translations/${locale}.json`).pipe(
          catchError(() => of(null)),
        ),
      ),
    ).subscribe((files) => {
      let payload = this.getPayload();
      assetLocales.forEach((locale, index) => {
        const asset = files[index];
        if (asset) {
          payload = this.syncLocaleFromAsset(payload, locale, asset);
        }
      });
      payload = this.ensureManualLocaleSkeleton(payload, 'fr');
      this.payload.set(payload);
      this.mergeArabicSettingsScreenCopyFromAssets(done);
    });
  }

  /** هيكل fr فارغ للإدخال اليدوي — دون نسخ من assets */
  private ensureManualLocaleSkeleton(
    payload: UiManualTranslationsPayload,
    locale: UiExtraLocaleCode | 'ar',
  ): UiManualTranslationsPayload {
    if (this.localeHasSavedData(payload, locale)) {
      return payload;
    }
    const reference = extractLocaleFile(payload, 'ar');
    const emptyForm = prepareLocaleFileForForm({}, reference);
    return mergeLocaleFileIntoPayload(payload, locale, normalizeLocaleFileForSave(emptyForm));
  }

  private fillMissingLocaleFromAsset(
    payload: UiManualTranslationsPayload,
    locale: string,
    asset: UiLocaleFilePayload,
  ): UiManualTranslationsPayload {
    if (locale === 'fr') {
      return payload;
    }

    const next = structuredClone(payload) as UiManualTranslationsPayload;

    if (!next.sidebarNav) {
      next.sidebarNav = {};
    }
    if (!next.brandSubtitle) {
      next.brandSubtitle = {};
    }
    if (!next.chrome) {
      next.chrome = {};
    }
    if (!next.screenCopy) {
      next.screenCopy = {};
    }
    if (!next.sidebarNav[locale]) {
      next.sidebarNav[locale] = {};
    }
    if (!next.chrome[locale]) {
      next.chrome[locale] = {};
    }
    if (!next.screenCopy[locale]) {
      next.screenCopy[locale] = {};
    }

    const assetBrand = (asset.brandSubtitle ?? '').trim();
    const currentBrand = (next.brandSubtitle[locale] ?? '').trim();
    if (assetBrand && (!currentBrand || currentBrand === 'brandSubtitle')) {
      next.brandSubtitle[locale] = assetBrand;
    }

    for (const [key, value] of Object.entries(asset.sidebarNav ?? {})) {
      const trimmed = (value ?? '').trim();
      if (!trimmed) {
        continue;
      }
      const existing = (next.sidebarNav[locale][key] ?? '').trim();
      if (!existing || existing === key) {
        next.sidebarNav[locale][key] = trimmed;
      }
    }

    for (const [key, value] of Object.entries(asset.chrome ?? {})) {
      const trimmed = (value ?? '').trim();
      if (!trimmed) {
        continue;
      }
      const existing = (next.chrome[locale][key] ?? '').trim();
      if (!existing || existing === key) {
        next.chrome[locale][key] = trimmed;
      }
    }

    for (const [screenId, msgs] of Object.entries(asset.screenCopy ?? {})) {
      if (!msgs || typeof msgs !== 'object') {
        continue;
      }
      if (!next.screenCopy[locale][screenId]) {
        next.screenCopy[locale][screenId] = {};
      }
      for (const [msgKey, value] of Object.entries(msgs)) {
        const trimmed = (value ?? '').trim();
        if (!trimmed) {
          continue;
        }
        const existing = (next.screenCopy[locale][screenId][msgKey] ?? '').trim();
        if (!existing || existing === msgKey) {
          next.screenCopy[locale][screenId][msgKey] = trimmed;
        }
      }
    }

    return next;
  }

  /** يكمّل النقص من asset ثم يحذف المفاتيح غير الموجودة في asset */
  private syncLocaleFromAsset(
    payload: UiManualTranslationsPayload,
    locale: string,
    asset: UiLocaleFilePayload,
  ): UiManualTranslationsPayload {
    const filled = this.fillMissingLocaleFromAsset(payload, locale, asset);
    const localeFile = extractLocaleFile(filled, locale);
    const aligned = alignLocaleFileToAsset(localeFile, asset);
    return mergeLocaleFileIntoPayload(filled, locale, aligned);
  }

  /** يكمّل مفاتيح العربية الناقصة من ملف ar.json المحلي */
  private mergeArabicSettingsScreenCopyFromAssets(done?: () => void): void {
    this.http
      .get<UiLocaleFilePayload>('/assets/ui-translations/ar.json')
      .pipe(catchError(() => of(null)))
      .subscribe((file) => {
        if (file) {
          const current = this.payload();
          const alignedAr = alignLocaleFileToAsset(
            extractLocaleFile(current, 'ar'),
            file,
          );
          this.payload.set(mergeLocaleFileIntoPayload(current, 'ar', alignedAr));
        }
        this.finishPayloadLoad(done);
      });
  }

  /** عند تعذّر API تُستخدم ملفات assets المحلية */
  private loadFallbackFromAssets(done?: () => void): void {
    const assetLocales: Array<UiExtraLocaleCode | 'ar'> = ['ar', 'en', 'tr'];
    forkJoin(
      assetLocales.map((locale) =>
        this.http.get<UiLocaleFilePayload>(`/assets/ui-translations/${locale}.json`).pipe(
          catchError(() => of(null)),
        ),
      ),
    ).subscribe((files) => {
      let payload: UiManualTranslationsPayload = {};
      assetLocales.forEach((locale, index) => {
        const file = files[index];
        if (file) {
          payload = mergeLocaleFileIntoPayload(payload, locale, file);
        }
      });
      payload = this.ensureManualLocaleSkeleton(payload, 'fr');
      this.payload.set(payload);
      this.mergeArabicSettingsScreenCopyFromAssets(done);
    });
  }

  private localeHasSavedData(payload: UiManualTranslationsPayload, locale: string): boolean {
    if (payload.brandSubtitle && locale in payload.brandSubtitle) {
      return true;
    }
    if (payload.sidebarNav?.[locale] && Object.keys(payload.sidebarNav[locale]).length > 0) {
      return true;
    }
    if (payload.chrome?.[locale] && Object.keys(payload.chrome[locale]).length > 0) {
      return true;
    }
    if (payload.screenCopy?.[locale] && Object.keys(payload.screenCopy[locale]).length > 0) {
      return true;
    }
    return false;
  }

  private finishPayloadLoad(done?: () => void): void {
    this.payloadReady.set(true);
    done?.();
    window.dispatchEvent(new Event('hotelUiTranslationsUpdated'));
  }

  applyPayloadJson(json: string | undefined | null): void {
    if (!json || json.trim() === '') {
      this.payload.set({});
      return;
    }
    try {
      const parsed = JSON.parse(json) as UiManualTranslationsPayload;
      this.payload.set(parsed && typeof parsed === 'object' ? parsed : {});
    } catch {
      this.payload.set({});
    }
  }

  getPayload(): UiManualTranslationsPayload {
    return structuredClone(this.payload()) as UiManualTranslationsPayload;
  }

  readPayloadForEdit(): UiManualTranslationsPayload {
    return structuredClone(this.payload()) as UiManualTranslationsPayload;
  }

  savePayload(payload: UiManualTranslationsPayload) {
    const body: UiTranslationsBlobDto = {
      payloadJson: JSON.stringify(payload ?? {}, null, 0),
    };
    return this.http.put<void>(this.apiUrl, body).pipe(
      tap(() => {
        this.lastPayloadMutationAt = Date.now();
        this.payload.set(JSON.parse(JSON.stringify(payload ?? {})) as UiManualTranslationsPayload);
        this.payloadReady.set(true);
        window.dispatchEvent(new Event('hotelUiTranslationsUpdated'));
      }),
      map(() => true as const),
      catchError((err) => {
        console.error('UiTranslationsService.savePayload', err);
        return of(false as const);
      }),
    );
  }

  serializeLocaleForEdit(locale: UiExtraLocaleCode | 'ar'): string {
    return localeFileToJson(extractLocaleFile(this.getPayload(), locale));
  }

  loadLocaleFileForForm(locale: UiExtraLocaleCode | 'ar'): UiLocaleFilePayload {
    const file = extractLocaleFile(this.getPayload(), locale);
    const reference = extractLocaleFile(this.getPayload(), 'ar');
    return prepareLocaleFileForForm(file, reference);
  }

  saveLocaleFileForm(locale: UiExtraLocaleCode | 'ar', form: UiLocaleFilePayload) {
    const file = normalizeLocaleFileForSave(form);
    return this.ensurePayloadReady$().pipe(
      switchMap(() => {
        const merged = mergeLocaleFileIntoPayload(this.getPayload(), locale, file);
        return this.savePayload(merged);
      }),
    );
  }

  private ensurePayloadReady$(): Observable<void> {
    if (this.payloadReady()) {
      return of(undefined);
    }
    return new Observable<void>((subscriber) => {
      this.fetchFromBackend(() => {
        subscriber.next();
        subscriber.complete();
      });
    });
  }

  saveLocaleFileJson(locale: UiExtraLocaleCode | 'ar', jsonText: string) {
    try {
      const file = parseLocaleFileJson(jsonText);
      const merged = mergeLocaleFileIntoPayload(this.getPayload(), locale, file);
      return this.savePayload(merged);
    } catch (err) {
      console.error('UiTranslationsService.saveLocaleFileJson', err);
      return of(false as const);
    }
  }

  sidebarLabel(routeKey: string): string {
    const locale = this.displayLocale();
    const fallbackAr =
      SIDEBAR_NAV_KEYS.find((k) => k.routeKey === routeKey)?.arabic ?? routeKey;
    const arabicResolved =
      this.payload().sidebarNav?.ar?.[routeKey]?.trim() || fallbackAr;
    return this.resolveLocalized(
      locale,
      () => arabicResolved,
      () => this.payload().sidebarNav?.[locale]?.[routeKey],
      routeKey,
      `sidebar:${routeKey}`,
    );
  }

  brandSubtitleDefaultArabic(): string {
    return UI_BRAND_SUBTITLE_FIXED;
  }

  brandSubtitle(): string {
    return UI_BRAND_SUBTITLE_FIXED;
  }

  chromeLabel(key: string): string {
    const fallbackAr = UI_CHROME_KEYS.find((k) => k.key === key)?.arabic ?? key;
    const arabicResolved = this.payload().chrome?.ar?.[key]?.trim() || fallbackAr;
    const locale = this.displayLocale();
    return this.resolveLocalized(
      locale,
      () => arabicResolved,
      () => this.payload().chrome?.[locale]?.[key],
      key,
      `chrome:${key}`,
    );
  }

  roomTypeLabel(storedType: string | null | undefined): string {
    const raw = (storedType ?? '').trim();
    if (!raw) {
      return '—';
    }
    const msgKey = roomTypeTranslationKey(raw);
    if (!msgKey) {
      return raw;
    }
    return this.screenText('rooms', msgKey);
  }

  screenText(screenId: string, msgKey: string): string {
    return this.resolveFieldText('screen', screenId, msgKey);
  }

  /** نص شاشة بلغة محددة (لمحرر الترجمة وغيره) */
  screenTextForLocale(
    locale: UiExtraLocaleCode | 'ar',
    screenId: string,
    msgKey: string,
  ): string {
    const arabicResolved =
      this.payload().screenCopy?.ar?.[screenId]?.[msgKey]?.trim() || msgKey;
    return this.resolveLocalized(
      locale,
      () => arabicResolved,
      () => this.payload().screenCopy?.[locale]?.[screenId]?.[msgKey],
      msgKey,
      `screen:${screenId}:${msgKey}`,
    );
  }

  /** وضع الترجمة المباشرة على الصفحة الحالية ولغة النظام المختارة */
  inlineWorkbenchActive(): boolean {
    return this.inlineTranslationMode() && this.displayLocale() !== 'ar';
  }

  toggleInlineTranslationMode(): boolean {
    if (this.displayLocale() === 'ar') {
      this.injector.get(UiMessageService).info(this.chromeLabel('uiInlineTranslationPickLocale'), {
        title: this.chromeLabel('settingsMenuUiTranslation'),
      });
      return false;
    }
    const next = !this.inlineTranslationMode();
    this.inlineTranslationMode.set(next);
    window.dispatchEvent(new Event('hotelUiInlineTranslationModeChanged'));
    return next;
  }

  notifyInlineTranslationNavBlocked(): void {
    this.injector.get(UiMessageService).info(this.chromeLabel('uiInlineTranslationNavBlocked'), {
      title: this.chromeLabel('settingsMenuUiTranslation'),
    });
  }

  setInlineTranslationSaving(saving: boolean): void {
    this.inlineTranslationSaving.set(saving);
  }

  inlineWorkbenchHintLabel(): string {
    const opt = uiLocalePickerOption(this.displayLocale());
    const localeLabel = this.screenText('settings', opt.labelKey);
    return this.chromeLabel('uiInlineWorkbenchHintActive').replace('{0}', localeLabel);
  }

  resolveFieldText(kind: UiInlineFieldKind, screenId: string, key: string): string {
    if (kind === 'screen') {
      const arabicResolved =
        this.payload().screenCopy?.ar?.[screenId]?.[key]?.trim() || key;
      const locale = this.displayLocale();
      return this.resolveLocalized(
        locale,
        () => arabicResolved,
        () => this.payload().screenCopy?.[locale]?.[screenId]?.[key],
        key,
        `screen:${screenId}:${key}`,
      );
    }
    if (kind === 'sidebar') {
      return this.sidebarLabel(key);
    }
    return this.chromeLabel(key);
  }

  arabicFieldText(kind: UiInlineFieldKind, screenId: string, key: string): string {
    if (kind === 'screen') {
      return this.payload().screenCopy?.ar?.[screenId]?.[key]?.trim() || key;
    }
    if (kind === 'sidebar') {
      return this.payload().sidebarNav?.ar?.[key]?.trim() || SIDEBAR_NAV_KEYS.find((k) => k.routeKey === key)?.arabic || key;
    }
    return this.payload().chrome?.ar?.[key]?.trim() || UI_CHROME_KEYS.find((k) => k.key === key)?.arabic || key;
  }

  localeFieldRaw(kind: UiInlineFieldKind, screenId: string, key: string): string {
    const locale = this.displayLocale();
    if (locale === 'ar') {
      return '';
    }
    const payload = this.payload();
    if (kind === 'screen') {
      return (payload.screenCopy?.[locale]?.[screenId]?.[key] ?? '').trim();
    }
    if (kind === 'sidebar') {
      return (payload.sidebarNav?.[locale]?.[key] ?? '').trim();
    }
    return (payload.chrome?.[locale]?.[key] ?? '').trim();
  }

  patchLocaleField(kind: UiInlineFieldKind, screenId: string, key: string, value: string): Observable<boolean> {
    const locale = this.displayLocale();
    if (locale === 'ar') {
      return of(false);
    }
    const file = this.loadLocaleFileForForm(locale);
    const trimmed = value.trim();
    if (kind === 'screen') {
      if (!file.screenCopy) {
        file.screenCopy = {};
      }
      if (!file.screenCopy[screenId]) {
        file.screenCopy[screenId] = {};
      }
      file.screenCopy[screenId][key] = trimmed;
    } else if (kind === 'sidebar') {
      if (!file.sidebarNav) {
        file.sidebarNav = {};
      }
      file.sidebarNav[key] = trimmed;
    } else {
      if (!file.chrome) {
        file.chrome = {};
      }
      file.chrome[key] = trimmed;
    }
    return this.saveLocaleFileForm(locale, file);
  }

  private resolveLocalized(
    locale: UiExtraLocaleCode | 'ar',
    arabic: () => string | undefined,
    fromPayload: () => string | undefined,
    lastResort: string,
    seed: string,
  ): string {
    const ar = arabic()?.trim();
    if (locale === 'ar') {
      if (
        isUiTranslationCorruptedNumericPlaceholder(ar) &&
        !isUiTranslationCorruptedNumericPlaceholder(lastResort)
      ) {
        return lastResort;
      }
      return ar || lastResort;
    }
    const raw = fromPayload();
    if (raw !== undefined) {
      const localized = raw.trim();
      if (
        localized &&
        !(
          isUiTranslationCorruptedNumericPlaceholder(localized) &&
          !isUiTranslationCorruptedNumericPlaceholder(ar)
        )
      ) {
        return localized;
      }
    }
    return this.missingTranslationNumber(seed);
  }

  private missingTranslationNumber(seed: string): string {
    let hash = 0;
    for (let index = 0; index < seed.length; index++) {
      hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
    }
    return String(1000 + (hash % 9000));
  }
}
