# دليل أدوات مشروع Hotel Premio PMS

**نظام إدارة فندق — واجهة Angular 21 + خادم ABP / ASP.NET Core**

| البند | القيمة |
|-------|--------|
| اسم المشروع | Hotel Premio PMS |
| تاريخ التوثيق | 2026-06-08 |
| ملف JSON المرافق | `docs/project-tools.json` |

---

## 1. نظرة عامة

المشروع نظام **PMS** (Property Management System) لإدارة الفندق يشمل:

- الحجوزات والتسكين والمغادرة
- الغرف والطوابق والمفاتيح
- الكاشير والفواتير
- CRM والمراجعة الليلية
- التقارير والإعدادات
- **ترجمة واجهة متعددة اللغات** مع تحرير مباشر على الصفحات

### هيكل المجلدات الرئيسي

```
Modiaf.Al.Arab.Hotel/
├── angular/          ← واجهة المستخدم (Angular)
├── aspnet-core/      ← الخادم و API (ABP)
└── docs/             ← التوثيق (هذا الملف + JSON + PDF)
```

---

## 2. أوامر npm (أدوات التشغيل والبناء)

| الأمر | الوظيفة |
|-------|---------|
| `npm start` | تشغيل التطوير على HTTPS مع بروكسي API |
| `npm run build` | بناء التطبيق |
| `npm run build:prod` | بناء الإنتاج |
| `npm test` | اختبارات الوحدة |
| `npm run lint` | فحص ESLint |
| `npm run ui-translations:split` | تقسيم ملف الترجمات المدمج إلى ملفات لغة |
| `npm run ui-translations:merge` | دمج ملفات اللغات في ملف واحد |
| `npm run ui-translations:sync` | مزامنة هيكل الترجمة ثم الدمج |

**متطلبات:** Node ≥ 20.19.0، npm ≥ 10.0.0

---

## 3. سكربتات التطوير (`angular/scripts/`)

| السكربت | الوظيفة |
|---------|---------|
| `migrate-ui-inline-text.mjs` | تحويل `screenText` و `label` في القوالب إلى `<ui-inline-text>` |
| `fix-ui-inline-imports.mjs` | إضافة استيراد `UiInlineTextComponent` تلقائياً |
| `fix-inline-key-bindings.mjs` | إصلاح ربط مفاتيح الترجمة في القوالب |
| `split-ui-translations-locale-files.mjs` | تقسيم JSON المدمج إلى `ar.json`, `en.json`, … |
| `merge-ui-locale-files-to-default.mjs` | دمج ملفات اللغة في `ui-translations-default.json` |
| `sync-ui-locale-structure.mjs` | توحيد مفاتيح ملفات الترجمة مع `ar.json` |
| `bootstrap-fr-id-locales.mjs` | إنشاء ملفات فرنسية/إندونيسية من الهيكل العربي |
| `simplify-translations-tab.mjs` | تبسيط تبويب الترجمات في الإعدادات |
| `fix-light-theme-text.ps1` | تصحيح ألوان النص في الثيم الفاتح (CSS) |

---

## 4. الحراس (Guards)

| الحارس | الملف | الوظيفة |
|--------|-------|---------|
| `authGuard` | `guards/auth.guard.ts` | يمنع الصفحات المحمية بدون تسجيل دخول |
| `loginPageGuard` | `guards/auth.guard.ts` | يمنع دخول `/login` للمستخدم المسجّل |
| `inlineTranslationNavGuard` | `guards/inline-translation-nav.guard.ts` | يمنع التنقل أثناء وضع الترجمة المباشرة |

---

## 5. المعترضات (Interceptors)

| المعترض | الوظيفة |
|---------|---------|
| `loadingInterceptor` | يعرض مؤشر التحميل العام لطلبات `/api/` |
| `apiTimeoutInterceptor` | مهلة 60 ثانية لطلبات API |

---

## 6. الأنابيب (Pipes)

| الأنبوب | الوظيفة | مثال |
|---------|---------|------|
| `HotelSymbolPipe` | رمز العملة الحالي | `{{ '' \| hotelSymbol }}` |
| `LocaleNumberPipe` | تنسيق أرقام/مال حسب اللغة | `{{ price \| localeNumber:'money' }}` |

---

## 7. خدمات الواجهة (`angular/src/app/services/`)

### 7.1 الترجمة والواجهة

| الخدمة | الوظيفة | دوال رئيسية |
|--------|---------|-------------|
| **UiTranslationsService** | لغة العرض وترجمات القائمة والشاشات | `screenText`, `sidebarLabel`, `chromeLabel`, `toggleInlineTranslationMode`, `patchLocaleField` |
| **UiMessageService** | رسائل Toast وتأكيد | `show`, `success`, `error`, `confirm` |
| **AppLoadingService** | عداد تحميل API | `begin`, `end` |
| **SystemNotificationsService** | إشعارات النظام | `record`, `markAllRead` |

### 7.2 المصادقة

| الخدمة | الوظيفة |
|--------|---------|
| **HotelAuthService** | تسجيل دخول، جلسة، صلاحيات |
| **HotelAppUserService** | CRUD مستخدمي التطبيق |

### 7.3 العمليات الفندقية (PMS)

| الخدمة | API | الوظيفة |
|--------|-----|---------|
| **BookingService** | `/api/app/booking` | الحجوزات |
| **RoomService** | `/api/app/room` | الغرف |
| **FloorService** | `/api/app/floor` | الطوابق |
| **GuestRegistryService** | `/api/app/guest-registry` | سجل الضيوف |
| **IdentityTypeService** | `/api/app/identity-type` | أنواع الهوية |
| **PaymentMethodService** | `/api/app/payment-method` | طرق الدفع |

### 7.4 الإعدادات والعملة

| الخدمة | الوظيفة |
|--------|---------|
| **HotelSettingsService** | إعدادات الفندق من API |
| **HotelSystemSettingsLoader** | تحميل إعدادات النظام والعملة |
| **HotelBrandingStoreService** | اسم الفندق والشعار |
| **HotelCurrencyService** | رمز وكود العملة |
| **ArabicPreferenceCategoryService** | فئات اللهجة العربية |
| **ArabicCategoryPickerService** | ورقة اختيار الفئة العربية |
| **GeneralCodesService** | الأكواد العامة (فئات غرف، مواقع…) |
| **HotelDatabaseAdminService** | نسخ احتياطي وتحديث DB |

---

## 8. المكوّنات المشتركة (`shared/`)

| المكوّن | الوظيفة |
|---------|---------|
| **ui-inline-text** | ترجمة مباشرة على الصفحة (انقر النص العربي للتعديل) |
| **app-top-bar** | الشريط العلوي: لغة، إشعارات، اختصارات |
| **app-notifications-panel** | لوحة الإشعارات |
| **account-hub-panel** | مركز الحساب |
| **app-calculator-modal** | حاسبة |
| **db-settings-panel** | إعدادات قاعدة البيانات |
| **room-status-panel** | ملخص حالة الغرف |
| **room-preview-sheet** | معاينة غرفة |
| **pms-booking-card** | بطاقة حجز PMS |
| **arabic-category-picker-sheet** | اختيار الفئة العربية |
| **ui-messages** | رسائل Toast |
| **app-loading-overlay** | طبقة التحميل |
| **account-locale-editor** | محرر JSON للترجمات |

---

## 9. أدوات مساعدة (`utils/`)

### الترجمة
`ui-translation.constants.ts`, `ui-translations-locale.util.ts`, `ui-translation-groups.config.ts`, `ui-screen-i18n.helper.ts`

### العملة واللغة
`hotel-currency.presets.ts`, `locale-format.util.ts`, `locale-phone.ts`, `arabic-region-profile.util.ts`

### الحجز
`booking-display.util.ts`, `booking-api-map.util.ts`, `booking-meta.options.ts`, `price-code.util.ts`

### الضيوف والغرف
`guest-profile.util.ts`, `guest-picker.util.ts`, `room-features.util.ts`, `room-cleaning.util.ts`

### متفرقات
`hotel-user-role.ts`, `date-only.ts`, `reports-filter.util.ts`, `dev-outlines.ts`

---

## 10. صفحات النظام (المسارات)

| المسار | الشاشة |
|--------|--------|
| `/dashboard` | لوحة التحكم |
| `/bookings` | قائمة الحجوزات |
| `/booking` | نموذج حجز/تسكين |
| `/front-desk/room-plan` | خطة الغرف |
| `/front-desk/rooms-rack` | رف الغرف |
| `/front-desk/keys` | المفاتيح |
| `/front-desk/key-services` | خدمات المفاتيح |
| `/front-desk/guest-valuables` | الأمانات |
| `/cashier/*` | الكاشير (ترحيل، فواتير، إشعارات) |
| `/crm/*` | CRM (أفراد، شركات، وكلاء) |
| `/night-auditor/*` | المراجعة الليلية |
| `/rooms` | إدارة الغرف |
| `/database` | قاعدة البيانات |
| `/reports` | التقارير |
| `/settings` | الإعدادات والترجمات |
| `/login` | تسجيل الدخول |

---

## 11. الخادم (aspnet-core)

### طبقات ABP
- **Domain** — الكيانات
- **Application** — خدمات التطبيق (AppServices)
- **HttpApi.Host** — نقطة التشغيل + ملفات `UiTranslations/*.json`
- **EntityFrameworkCore** — قاعدة البيانات

### خدمات API الرئيسية
| الخدمة | الوظيفة |
|--------|---------|
| HotelAuthAppService | تسجيل الدخول |
| BookingAppService | الحجوزات |
| RoomAppService / FloorAppService | الغرف والطوابق |
| UiTranslationsBlobAppService | ترجمات الواجهة |
| HotelSettingsAppService | إعدادات الفندق |
| GeneralCodesAppService | الأكواد العامة |
| HotelDatabaseAdminAppService | نسخ احتياطي DB |

---

## 12. ميزات رئيسية

### الترجمة المباشرة
1. اختر إنجليزية أو فرنسية من الشريط العلوي
2. انقر زر الترجمة الجانبي (أيقونة اللغة)
3. انقر النص العربي للتعديل — **حفظ تلقائي**
4. انقر أيقونة الحفظ 💾 للخروج والانتقال لصفحة أخرى

### ترجمات الواجهة
- أقسام: `sidebarNav`, `chrome`, `screenCopy`, `brandSubtitle`
- ملفات: `HttpApi.Host/UiTranslations/ar.json`, `en.json`, `fr.json`
- API: `/api/app/ui-translations-blob`

### أحداث النافذة المخصصة
`hotelUiLocaleChanged`, `hotelUiTranslationsUpdated`, `hotelUiInlineTranslationModeChanged`, `hotelCurrencyUpdated`

---

## 13. ملف JSON

التفاصيل الكاملة بصيغة JSON في:

**`docs/project-tools.json`**

يمكن استيراده في أدوات أخرى أو قراءته برمجياً.

---

*تم إنشاء هذا الدليل تلقائياً — Hotel Premio PMS*
