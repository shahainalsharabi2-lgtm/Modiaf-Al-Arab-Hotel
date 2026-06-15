import { CommonModule } from '@angular/common';
import { UiInlineTextComponent } from '../shared/ui-inline-text/ui-inline-text.component';
import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin, from, of } from 'rxjs';
import { catchError, concatMap, finalize, switchMap, toArray } from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { Floor } from '../models/floor.model';
import { Room } from '../models/room.model';
import { FloorService } from '../services/floor.service';
import { RoomService } from '../services/room.service';
import { IdentityTypeService } from '../services/identity-type.service';
import { IdentityType } from '../models/identity-type.model';

import { Booking } from '../models/booking.model';
import { BookingService } from '../services/booking.service';
import { toDateOnlyString } from '../utils/date-only';
import { UiTranslationsService } from '../services/ui-translations.service';
import { bookingNotifyParams } from '../utils/booking-notify-params.util';
import { HotelBrandingStoreService } from '../services/hotel-branding-store.service';
import { HotelCurrencyService } from '../services/hotel-currency.service';
import { PreferenceCategoryCurrencyService } from '../services/preference-category-currency.service';
import {
  type HotelCurrencyPreset,
  type HotelCurrencyPresetId,
} from '../utils/hotel-currency.presets';
import { roomCurrencySymbol as displayRoomCurrencySymbol } from '../utils/room-currency';
import {
  parseRoomFeatures,
  roomFeaturesSummary,
  serializeRoomFeatures,
} from '../utils/room-features.util';
import { formatLocalePickerLabel } from '../utils/locale-picker-label';
import { resolveHotelImageSrc } from '../utils/hotel-branding.constants';
import { UiMessageService } from '../services/ui-message.service';
import { GeneralCodesComponent } from '../general-codes/general-codes.component';
import { ArabicLocalePickComponent } from './arabic-locale-pick/arabic-locale-pick.component';
import {
  GeneralCodesService,
  type GeneralCodeItem,
} from '../general-codes/general-codes.service';
import { HotelSystemSettingsLoader } from '../services/hotel-system-settings.loader';
import { PaymentMethodService, PaymentMethodDto } from '../services/payment-method.service';
import {
  CreateUpdateHotelAppUserDto,
  HotelAppUserDto,
  HotelAppUserService,
} from '../services/hotel-app-user.service';
import { HotelAuthService } from '../services/hotel-auth.service';
import {
  HOTEL_USER_ROLE,
  HOTEL_USER_ROLE_OPTIONS,
  normalizeHotelUserRole,
} from '../utils/hotel-user-role';
import type { UiExtraLocaleCode } from '../utils/ui-translation.constants';
import { HOTEL_UI_TRANSLATIONS_EDITOR_LOCALE_KEY } from '../utils/ui-translation.constants';
import type { UiLocaleFilePayload } from '../utils/ui-translations-locale.util';
import {
  isUiTranslationEditorChromeKeyExcluded,
  uiTranslationEditorGroupsWithOther,
  uiTranslationSidebarSectionKeys,
  uiTranslationSidebarSectionsWithOther,
  type UiTranslationEditorGroup,
  type UiTranslationSidebarSection,
} from '../utils/ui-translation-groups.config';
import {
  uiTranslationScreenNavLabel,
  uiTranslationScreenNavPathKeys,
} from '../utils/ui-translation-screen-labels.config';
import { ArabicPreferenceCategoryService } from '../services/arabic-preference-category.service';
import { uiLocalePickerOption } from '../utils/ui-locale-picker.util';
import { CreditCardTypesComponent } from './credit-card-types/credit-card-types.component';
import { HotelChainsComponent } from './hotel-chains/hotel-chains.component';
import { HotelsComponent } from './hotels/hotels.component';
import { FacilitiesComponent } from './facilities/facilities.component';
import { GeoStructureComponent } from './geo-structure/geo-structure.component';
import { LandmarksComponent } from './landmarks/landmarks.component';
import { AgentCommissionsComponent } from './agent-commissions/agent-commissions.component';
import { CurrenciesComponent } from './currencies/currencies.component';
import { DepartmentsComponent } from './departments/departments.component';
import { RoomBookingSettingsComponent } from './room-booking-settings/room-booking-settings.component';
import { SystemSettingsComponent } from './system-settings/system-settings.component';
import { EarlyArrivalComponent } from './early-arrival/early-arrival.component';
import { EmployeesComponent } from './employees/employees.component';
import { BookingTypesComponent } from './booking-types/booking-types.component';
import { AccountCodingComponent } from './account-coding/account-coding.component';
import { RoutingCodesComponent } from './routing-codes/routing-codes.component';
import { MarketCodesComponent } from './market-codes/market-codes.component';
import { BookingSourcesComponent } from './booking-sources/booking-sources.component';
import { MarketCategoriesComponent } from './market-categories/market-categories.component';
import { BankCodingComponent } from './bank-coding/bank-coding.component';
import { CashierCodingComponent } from './cashier-coding/cashier-coding.component';
import { ConfirmationMessagesComponent } from './confirmation-messages/confirmation-messages.component';
import { AdvancePaymentPoliciesComponent } from './advance-payment-policies/advance-payment-policies.component';
import { RoomFloorsComponent } from './room-floors/room-floors.component';
import { BuildingGroupsComponent } from './building-groups/building-groups.component';
import { RoomBuildingsComponent } from './room-buildings/room-buildings.component';
import { RoomTypesComponent } from './room-types/room-types.component';
import { RoomRoomsComponent } from './room-rooms/room-rooms.component';
import { TaxBracketsComponent } from './tax-brackets/tax-brackets.component';
import { TaxTypesComponent } from './tax-types/tax-types.component';
import { TaxClassificationComponent } from './tax-classification/tax-classification.component';
import { TaxAccountLinkComponent } from './tax-account-link/tax-account-link.component';
import { PriceSeasonsComponent } from './price-seasons/price-seasons.component';
import { PriceCategoriesComponent } from './price-categories/price-categories.component';
import { PriceChildAgesComponent } from './price-child-ages/price-child-ages.component';
import { PriceItemTypesComponent } from './price-item-types/price-item-types.component';
import { PriceSoldItemsComponent } from './price-sold-items/price-sold-items.component';
import { PricePackagesComponent } from './price-packages/price-packages.component';
import { PricePackageGroupsComponent } from './price-package-groups/price-package-groups.component';
import { PriceCodeComponent } from './price-code/price-code.component';
import { PriceInquiryComponent } from './price-inquiry/price-inquiry.component';
import { UsrGroupsComponent } from './usr-groups/usr-groups.component';
import { UsrUsersComponent } from './usr-users/usr-users.component';
import { UsrPermissionsComponent } from './usr-permissions/usr-permissions.component';
import { UsrAuditLogsComponent } from './usr-audit-logs/usr-audit-logs.component';
import { LanguagesComponent } from './languages/languages.component';
import { PaymentMethodsComponent } from './payment-methods/payment-methods.component';
import { SequenceSettingsComponent } from './sequence-settings/sequence-settings.component';
import { SettingsCatalogPageComponent } from './settings-catalog-page/settings-catalog-page.component';
import { ExtShomoosComponent } from './ext-shomoos/ext-shomoos.component';
import { ExtTourismComponent } from './ext-tourism/ext-tourism.component';
import { ExtOmaniPoliceComponent } from './ext-omani-police/ext-omani-police.component';
import { UiTranslationFieldInputComponent } from './ui-translation-field-input/ui-translation-field-input.component';
import {
  findSettingsNavLeaf,
  isSettingsSidebarNavSubgroup,
  SETTINGS_PAGE_NAV,
  SETTINGS_SIDEBAR_NAV_ENTRIES,
  settingsSidebarNavPathKeys,
  type SettingsPageNavLeaf,
  type SettingsPageNavSection,
  type SettingsSidebarNavEntry,
  type SettingsSidebarNavSubgroup,
} from './settings-page-nav.config';
import {
  BOOKINGS_NAV_ITEMS,
  FRONT_DESK_NAV_ENTRIES,
  isFrontDeskNavSubgroup,
  PMS_SIDEBAR_GROUPS,
  REPORTS_NAV_ITEMS,
} from '../navigation/sidebar-nav.config';
import {
  buildSettingsUiTranslationPanels,
  settingsUiTranslationPanelId,
  settingsUiTranslationPanelsForSection,
  settingsUiTranslationSectionEntries,
  settingsUiTranslationTopLevelPanels,
  type SettingsUiTranslationPanel,
  type SettingsUiTranslationRow,
} from './settings-ui-translation.config';
import {
  emptyUiTranslationGroupStats,
  isUiTranslationCorruptedNumericPlaceholder,
  isUiTranslationValueFilled,
  uiTranslationGroupMatchesSectionFilter,
  uiTranslationGroupStatsFromCounts,
  uiTranslationValueMatchesSectionFilter,
  type UiTranslationGroupTranslationStats,
  type UiTranslationSectionFilter,
} from '../utils/ui-translation-group-stats.util';
import type { UiTranslationFieldLocationKind } from '../utils/ui-translation-field-location.util';
import { todayLocalDateString } from '../utils/date-only';
import {
  buildUiTranslationExportHtmlTable,
  buildUiTranslationExportText,
  downloadUiTranslationExportFile,
  printUiTranslationExportPdf,
  type UiTranslationExportFormat,
  type UiTranslationExportRow,
} from '../utils/ui-translation-export.util';
import {
  pushUntranslatedFlatRow,
  type UiTranslationUntranslatedFlatRow,
} from '../utils/ui-translation-untranslated-flat.util';
import {
  uiTranslationFieldNavigateTarget,
  uiTranslationScreenNavigateTarget,
  waitAndHighlightUiTranslationField,
} from '../utils/ui-translation-field-navigation.util';
import {
  isUiTranslationSystemMessageKey,
  uiTranslationScreenSectionStorageKey,
  uiTranslationScreenSectionsForEditor,
  type UiTranslationScreenSection,
} from '../utils/ui-translation-screen-sections.util';

interface UiTranslationFlatEditorRow {
  kind: 'brandSubtitle' | 'chrome' | 'sidebarNav' | 'screenCopy';
  key: string;
  screenId?: string;
  referenceAr: string;
  referenceEn: string;
  value: string;
  displayValue: string;
  searchNumber: string;
  trackId: string;
}

type UiTranslationSystemToolId =
  | 'texts'
  | 'buttons'
  | 'inputs'
  | 'selects'
  | 'tables'
  | 'notifications'
  | 'tabs'
  | 'modals';

interface UiTranslationSystemTool {
  id: UiTranslationSystemToolId;
  label: string;
  englishLabel: string;
  icon: string;
}

interface UiTranslationSystemPageOption {
  id: string;
  screenId: string;
  label: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings-base.css', './settings.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    GeneralCodesComponent,
    ArabicLocalePickComponent,
    HotelChainsComponent,
    CreditCardTypesComponent,
    HotelsComponent,
    SequenceSettingsComponent,
    FacilitiesComponent,
    LandmarksComponent,
    GeoStructureComponent,
    PaymentMethodsComponent,
    LanguagesComponent,
    AgentCommissionsComponent,
    CurrenciesComponent,
    DepartmentsComponent,
    RoomBookingSettingsComponent,
    SystemSettingsComponent,
    EarlyArrivalComponent,
    EmployeesComponent,
    BookingTypesComponent,
    AccountCodingComponent,
    RoutingCodesComponent,
    MarketCodesComponent,
    BookingSourcesComponent,
    MarketCategoriesComponent,
    BankCodingComponent,
    CashierCodingComponent,
    ConfirmationMessagesComponent,
    AdvancePaymentPoliciesComponent,
    RoomFloorsComponent,
    BuildingGroupsComponent,
    RoomBuildingsComponent,
    RoomTypesComponent,
    RoomRoomsComponent,
    TaxBracketsComponent,
    TaxTypesComponent,
    TaxClassificationComponent,
    TaxAccountLinkComponent,
    PriceSeasonsComponent,
    PriceCategoriesComponent,
    PriceChildAgesComponent,
    PriceItemTypesComponent,
    PriceSoldItemsComponent,
    PricePackagesComponent,
    PricePackageGroupsComponent,
    PriceCodeComponent,
    PriceInquiryComponent,
    UsrGroupsComponent,
    UsrUsersComponent,
    UsrPermissionsComponent,
    UsrAuditLogsComponent,
    SettingsCatalogPageComponent,
    ExtShomoosComponent,
    ExtTourismComponent,
    ExtOmaniPoliceComponent,
    UiTranslationFieldInputComponent,
    UiInlineTextComponent,
  ],
})
export class SettingsComponent implements OnInit {
  /** شعار/صورة الفندق كـ data URL للطباعة (بيضوي) — مشترك بين اللغات */
  hotelImageDataUrl = '';
  password = ''; // The actual password stored

  isAuthorized = true;
  inputPassword = '';
  passwordError = '';
  showLoginPassword = false;
  showSettingsPassword = false;

  /** تأكيد كلمة المرور قبل إضافة بيانات */
  passwordGateOpen = false;
  passwordGateInput = '';
  passwordGateError = '';
  showPasswordGateVisible = false;
  private pendingGateAction: (() => void) | null = null;

  activeTab:
    | 'general'
    | 'layout'
    | 'payments'
    | 'identities'
    | 'guests'
    | 'currency'
    | 'arabicLocale'
    | 'users'
    | 'translations'
    | 'uiTranslations'
    | 'page' = 'uiTranslations';

  activeSettingsNavId: string | null = 'uiTranslation';

  appUsers: HotelAppUserDto[] = [];
  appUsersLoading = false;
  editingAppUser: HotelAppUserDto | null = null;
  newAppUser: CreateUpdateHotelAppUserDto = this.emptyAppUserForm();

  get currencyPresets() {
    return this.prefCategoryCurrency.currencies();
  }

  allBookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  selectedGuestDate: string = '';
  
  editingBooking: Booking | null = null;

  paymentMethodRows: PaymentMethodDto[] = [];

  get paymentMethods(): string[] {
    return this.paymentMethodRows.map((x) => x.name);
  }
  newPaymentMethod = '';
  editingPaymentIndex: number | null = null;
  editingPaymentValue = '';

  identityTypes: IdentityType[] = [];
  newIdentityTypeName = '';
  identityTypesLoading = false;
  identityTypesError = '';

  editingFloorId: number | null = null;
  editingFloorLevel: number = 0;
  editingFloorRoomsCount: number = 0;

  editingRoomId: number | null = null;
  editingRoomNumber: string = '';
  editingRoomType: string = '';
  editingRoomFloor: number = 0;
  editingRoomPrice: number = 0;
  editingRoomStatus: Room['status'] = 'available';

  floors: Floor[] = [];
  rooms: Room[] = [];

  newFloorLevel = 1;
  newFloorRoomsCount = 1;

  /** إنشاء سريع: طابق + سلسلة غرف */
  layoutQuickCreateExpanded = true;
  layoutQuickFromTouched = false;
  layoutQuickFromText = '101';
  layoutQuickRoomCountText = '5';
  layoutQuickPriceText = '1';
  layoutQuickRoomView = '';
  layoutQuickCreating = false;
  layoutFeaturesModalRoom: Room | null = null;

  newRoomNumber = '';
  newRoomType = '';
  newRoomFloor = 1;
  newRoomPrice = 0;
  newRoomStatus: Room['status'] = 'available';

  /** واجهة تقسيم الفندق الشبكية */
  layoutPanelOpen = false;
  layoutPanelIsNew = false;
  layoutPanelRoomId: number | null = null;
  layoutPanelFloorLevel = 1;
  layoutPanelRoomNumber = '';
  layoutPanelRoomType = '';
  layoutPanelRoomView = '';
  layoutPanelRoomArchitecture = '';
  layoutPanelRoomLocation = '';
  layoutPanelRoomFeatures: string[] = [];
  layoutPanelRoomPrice = 0;
  layoutPanelRoomStatus: Room['status'] = 'available';
  layoutPanelCurrencyCode = 'YER';
  layoutPanelCurrencySymbol = 'YR';
  layoutCurrencyPickerOpen = false;
  layoutPanelCurrencySaving = false;

  /** فئات الغرف من المدخلات (room-classes) */
  roomClassOptions: GeneralCodeItem[] = [];
  roomViewOptions: GeneralCodeItem[] = [];
  roomArchitectureOptions: GeneralCodeItem[] = [];
  roomFeatureOptions: GeneralCodeItem[] = [];
  roomLocationOptions: GeneralCodeItem[] = [];
  layoutRoomCodeOptionsLoading = false;

  layoutStatusFilter: Room['status'] | 'all' = 'all';

  readonly layoutStatusOptions: readonly {
    value: Room['status'];
    labelKey: string;
    icon: string;
    tone: string;
  }[] = [
    { value: 'available', labelKey: 'statAvailable', icon: 'fa-broom', tone: 'green' },
    { value: 'dirty', labelKey: 'statDirty', icon: 'fa-spray-can', tone: 'amber' },
    { value: 'occupied', labelKey: 'statOccupied', icon: 'fa-user-tag', tone: 'gold' },
    { value: 'maintenance', labelKey: 'statMaintenance', icon: 'fa-screwdriver-wrench', tone: 'red' },
    { value: 'suspended', labelKey: 'statSuspended', icon: 'fa-hand-paper', tone: 'rose' },
  ];

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly uiMsg = inject(UiMessageService);
  private readonly prefCategoryCurrency = inject(PreferenceCategoryCurrencyService);
  private readonly arabicPref = inject(ArabicPreferenceCategoryService);
  private readonly hotelSystemSettings = inject(HotelSystemSettingsLoader);
  private readonly paymentMethodService = inject(PaymentMethodService);
  private readonly hotelAppUserService = inject(HotelAppUserService);
  private readonly generalCodesService = inject(GeneralCodesService);
  readonly auth = inject(HotelAuthService);
  readonly userRoleOptions = HOTEL_USER_ROLE_OPTIONS;

  /** إضافة / تعديل / حذف في الإعدادات — للمدير فقط */
  get settingsEditable(): boolean {
    return this.auth.canManageSettings();
  }

  private readonly settingsTabKeys = new Set([
    'general',
    'layout',
    'payments',
    'identities',
    'guests',
    'arabicLocale',
    'currency',
    'users',
    'translations',
    'uiTranslations',
    'page',
  ]);

  uiTranslationsLocale: UiExtraLocaleCode | 'ar' = 'ar';
  uiTranslationsLoading = false;
  uiTranslationsSaving = false;
  uiTranslationsError = '';
  uiTranslationsSearch = '';
  uiTranslationsToolbarCollapsed = true;
  uiTranslationsSectionFilter: UiTranslationSectionFilter = 'all';
  uiTranslationsForm: UiLocaleFilePayload | null = null;
  uiTranslationsReferenceAr: UiLocaleFilePayload | null = null;
  uiTranslationsReferenceEn: UiLocaleFilePayload | null = null;
  uiTranslationsOpenScreens = new Set<string>();
  uiTranslationsOpenGroups = new Set<string>();
  uiTranslationsOpenSidebarSections = new Set<string>();
  uiTranslationsJumpGroupId = '';
  /** قيمة قائمة «كل الصفحات» — مميزة عن عدم الاختيار (فارغ) */
  readonly uiTranslationsAllPagesGroupId = 'all';
  uiTranslationsFormEpoch = 0;
  uiTranslationsPage = 1;
  readonly uiTranslationsPageSize = 10;
  activeUiTranslationSystemTool: UiTranslationSystemToolId = 'texts';
  readonly uiTranslationSystemTools: readonly UiTranslationSystemTool[] = [
    { id: 'texts', label: 'النصوص', englishLabel: 'Texts', icon: 'fa-file-lines' },
    { id: 'buttons', label: 'الأزرار', englishLabel: 'Buttons', icon: 'fa-wand-magic-sparkles' },
    { id: 'inputs', label: 'حقول الإدخال', englishLabel: 'Input Fields', icon: 'fa-keyboard' },
    { id: 'selects', label: 'القوائم المنسدلة', englishLabel: 'Dropdowns', icon: 'fa-list-ul' },
    { id: 'tables', label: 'الجداول', englishLabel: 'Tables', icon: 'fa-table' },
    { id: 'notifications', label: 'الإشعارات', englishLabel: 'Notifications', icon: 'fa-bell' },
    { id: 'tabs', label: 'التبويبات', englishLabel: 'Tabs', icon: 'fa-folder' },
    { id: 'modals', label: 'النوافذ المنبثقة', englishLabel: 'Popups', icon: 'fa-window-restore' },
  ];
  private uiTranslationEditorGroupsCache: readonly UiTranslationEditorGroup[] = [];
  private uiTranslationGroupScreenIdsCache = new Map<string, string[]>();
  private uiTranslationScreenSectionsCache = new Map<string, readonly UiTranslationScreenSection[]>();
  private uiTranslationPanelSectionsCache = new Map<string, readonly UiTranslationScreenSection[]>();
  private uiTranslationGroupStatsCache = new Map<string, UiTranslationGroupTranslationStats>();
  private uiTranslationsUntranslatedFlatCache: readonly UiTranslationUntranslatedFlatRow[] = [];
  private uiTranslationsFlatRowsRevision = 0;
  private uiTranslationsFlatRowsBaseCacheKey = '';
  private uiTranslationsFlatRowsBaseCache: UiTranslationFlatEditorRow[] = [];
  private uiTranslationsFlatRowsCacheKey = '';
  private uiTranslationsFlatRowsCache: UiTranslationFlatEditorRow[] = [];
  private uiTranslationsSystemToolStatsCache = new Map<
    UiTranslationSystemToolId,
    { key: string; stats: UiTranslationGroupTranslationStats }
  >();
  private uiTranslationsAutoSaveTimer: ReturnType<typeof setTimeout> | null = null;
  private uiTranslationsSearchAutoOpenTimer: ReturnType<typeof setTimeout> | null = null;
  private uiTranslationsEditorOwnsSave = false;
  /** اللغة المرتبطة بـ uiTranslationsForm الحالي (قبل تغيير القائمة) */
  private uiTranslationsFormLocale: UiExtraLocaleCode | 'ar' = 'ar';
  /** انتظار حفظ اللغة الحالية قبل التبديل */
  private uiTranslationsPendingLocale: (UiExtraLocaleCode | 'ar') | null = null;

  constructor(
    private floorService: FloorService,
    private roomService: RoomService,
    private identityService: IdentityTypeService,
    private bookingService: BookingService,
    readonly uiTranslations: UiTranslationsService,
    readonly hotelBranding: HotelBrandingStoreService,
    readonly hotelCurrency: HotelCurrencyService
  ) {}

  get selectedCurrencyId(): HotelCurrencyPresetId {
    return this.hotelCurrency.id();
  }

  currencyAutoSourceLabel(): string {
    const locale = this.uiTranslations.displayLocale();
    if (locale === 'ar') {
      const cat = this.arabicPref.selectedCategory();
      if (cat?.label) {
        return `${this.uiTranslations.screenText('settings', 'currencyAutoSourceArabicPrefix')} ${cat.label}`;
      }
      return this.uiTranslations.screenText('settings', 'currencyAutoSourceArabicDefault');
    }
    const opt = uiLocalePickerOption(locale);
    const localeLabel = this.uiTranslations.screenText('settings', opt.labelKey);
    return `${this.uiTranslations.screenText('settings', 'currencyAutoSourceLocalePrefix')} ${localeLabel}`;
  }

  private refreshAutomaticCurrency(): void {
    this.hotelSystemSettings.syncAutomaticCurrency(false);
    this.cdr.markForCheck();
  }

  currencyPreviewAmount(): string {
    return this.hotelCurrency.formatWithSymbol(12500);
  }

  activeCurrencyFlag(): string {
    if (this.hotelCurrency.isCustom()) {
      return '⚙';
    }
    const preset = this.currencyPresets.find((p) => p.id === this.selectedCurrencyId);
    return preset?.flag ?? '💱';
  }

  activeCurrencyEngrave(): string {
    if (this.hotelCurrency.isCustom()) {
      return this.uiTranslations.screenText('settings', 'currencyCustomTitle');
    }
    const preset = this.currencyPresets.find((p) => p.id === this.selectedCurrencyId);
    return preset?.engraveAr ?? '';
  }

  roomPriceSymbol(room: Room): string {
    return displayRoomCurrencySymbol(room, this.hotelCurrency);
  }

  /** خيارات القائمة: فئات الغرف من قاعدة البيانات + القيمة الحالية إن كانت قديماً */
  get layoutRoomCategorySelectOptions(): string[] {
    return this.codeNameSelectOptions(this.roomClassOptions, this.layoutPanelRoomType);
  }

  get layoutRoomViewSelectOptions(): string[] {
    return this.codeNameSelectOptions(this.roomViewOptions, this.layoutPanelRoomView);
  }

  get layoutQuickRoomViewSelectOptions(): string[] {
    return this.codeNameSelectOptions(this.roomViewOptions, this.layoutQuickRoomView);
  }

  get layoutRoomArchitectureSelectOptions(): string[] {
    return this.codeNameSelectOptions(this.roomArchitectureOptions, this.layoutPanelRoomArchitecture);
  }

  get layoutRoomLocationSelectOptions(): string[] {
    return this.codeNameSelectOptions(this.roomLocationOptions, this.layoutPanelRoomLocation);
  }

  roomFeaturesList(room: Room): string[] {
    return parseRoomFeatures(room.roomFeatures);
  }

  roomMetaLine(room: Room): string {
    const parts: string[] = [];
    const arch = (room.roomArchitecture ?? '').trim();
    const loc = (room.roomLocation ?? '').trim();
    const feats = roomFeaturesSummary(this.roomFeaturesList(room), 4);
    if (arch) {
      parts.push(arch);
    }
    if (loc) {
      parts.push(loc);
    }
    if (feats) {
      parts.push(feats);
    }
    return parts.join(' · ');
  }

  isLayoutFeatureSelected(name: string): boolean {
    const n = name.trim();
    return this.layoutPanelRoomFeatures.some((x) => x === n);
  }

  toggleLayoutFeature(name: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const n = name.trim();
    if (!n) {
      return;
    }
    if (checked) {
      if (!this.layoutPanelRoomFeatures.includes(n)) {
        this.layoutPanelRoomFeatures = [...this.layoutPanelRoomFeatures, n];
      }
      return;
    }
    this.layoutPanelRoomFeatures = this.layoutPanelRoomFeatures.filter((x) => x !== n);
  }

  private codeNameSelectOptions(options: GeneralCodeItem[], current: string): string[] {
    const names = options.map((x) => String(x.name ?? '').trim()).filter(Boolean);
    const value = current.trim();
    if (value && !names.includes(value)) {
      return [value, ...names];
    }
    return names;
  }

  private layoutRoomCodingPayload(): Pick<
    Room,
    'roomView' | 'roomArchitecture' | 'roomLocation' | 'roomFeatures'
  > {
    return {
      roomView: this.layoutPanelRoomView.trim() || null,
      roomArchitecture: this.layoutPanelRoomArchitecture.trim() || null,
      roomLocation: this.layoutPanelRoomLocation.trim() || null,
      roomFeatures: serializeRoomFeatures(this.layoutPanelRoomFeatures),
    };
  }

  private applyLayoutRoomCodingFromRoom(room: Room): void {
    this.layoutPanelRoomView = room.roomView ?? '';
    this.layoutPanelRoomArchitecture = room.roomArchitecture ?? '';
    this.layoutPanelRoomLocation = room.roomLocation ?? '';
    this.layoutPanelRoomFeatures = parseRoomFeatures(room.roomFeatures);
  }

  private resetLayoutRoomCodingForNew(): void {
    this.layoutPanelRoomView = '';
    this.layoutPanelRoomArchitecture = '';
    this.layoutPanelRoomLocation = '';
    this.layoutPanelRoomFeatures = [];
  }

  loadLayoutRoomCodeOptions(): void {
    if (this.layoutRoomCodeOptionsLoading) {
      return;
    }
    this.layoutRoomCodeOptionsLoading = true;
    forkJoin({
      classes: this.generalCodesService.getList('room-classes'),
      views: this.generalCodesService.getList('room-views'),
      architecture: this.generalCodesService.getList('room-architecture'),
      features: this.generalCodesService.getList('room-features'),
      locations: this.generalCodesService.getList('room-locations'),
    })
      .pipe(
        finalize(() => {
          this.layoutRoomCodeOptionsLoading = false;
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ classes, views, architecture, features, locations }) => {
          this.roomClassOptions = this.sortGeneralCodeItems(classes);
          this.roomViewOptions = this.sortGeneralCodeItems(views);
          this.roomArchitectureOptions = this.sortGeneralCodeItems(architecture);
          this.roomFeatureOptions = this.sortGeneralCodeItems(features);
          this.roomLocationOptions = this.sortGeneralCodeItems(locations);
          this.ensureLayoutPanelRoomCodingDefaults();
          this.ensureLayoutQuickViewDefault();
          this.mergeLayoutPanelFeaturesWithCatalog();
        },
        error: () => {
          this.roomClassOptions = [];
          this.roomViewOptions = [];
          this.roomArchitectureOptions = [];
          this.roomFeatureOptions = [];
          this.roomLocationOptions = [];
        },
      });
  }

  private sortGeneralCodeItems(items: GeneralCodeItem[]): GeneralCodeItem[] {
    return [...items].sort((a, b) => {
      const ao = Number(a.displayOrder ?? 0);
      const bo = Number(b.displayOrder ?? 0);
      if (ao !== bo) {
        return ao - bo;
      }
      return String(a.name ?? '').localeCompare(String(b.name ?? ''), 'ar');
    });
  }

  private ensureLayoutPanelRoomCodingDefaults(): void {
    if (!this.layoutPanelOpen) {
      return;
    }
    const pickFirstIfEmpty = (current: string, options: GeneralCodeItem[]): string => {
      const value = current.trim();
      const names = options.map((x) => String(x.name ?? '').trim()).filter(Boolean);
      if (!names.length) {
        return value;
      }
      if (value && names.includes(value)) {
        return value;
      }
      if (this.layoutPanelIsNew || !value) {
        return names[0];
      }
      return value;
    };

    this.layoutPanelRoomType = pickFirstIfEmpty(this.layoutPanelRoomType, this.roomClassOptions);
    if (this.layoutPanelIsNew) {
      this.layoutPanelRoomView = pickFirstIfEmpty(this.layoutPanelRoomView, this.roomViewOptions);
      this.layoutPanelRoomArchitecture = pickFirstIfEmpty(
        this.layoutPanelRoomArchitecture,
        this.roomArchitectureOptions,
      );
      this.layoutPanelRoomLocation = pickFirstIfEmpty(
        this.layoutPanelRoomLocation,
        this.roomLocationOptions,
      );
    }
  }

  private defaultNewRoomCategory(): string {
    const names = this.roomClassOptions.map((x) => String(x.name ?? '').trim()).filter(Boolean);
    return names[0] ?? '';
  }

  private ensureLayoutQuickViewDefault(): void {
    if (!this.layoutQuickRoomView.trim()) {
      const names = this.roomViewOptions.map((x) => String(x.name ?? '').trim()).filter(Boolean);
      this.layoutQuickRoomView = names[0] ?? '';
    }
    if (!this.layoutQuickFromTouched) {
      this.layoutQuickFromText = String(this.suggestedRoomNumberFromFloor(this.newFloorLevel));
    }
  }

  /** رقم أول غرفة تلقائياً: طابق 5 → 501 */
  suggestedRoomNumberFromFloor(floor: number): number {
    const level = Math.max(1, Math.floor(Number(floor) || 1));
    return level * 100 + 1;
  }

  onLayoutQuickFloorLevelChange(raw: string | number): void {
    this.newFloorLevel = Math.max(1, this.parseLayoutQuickInt(String(raw), 1));
    if (!this.layoutQuickFromTouched) {
      this.layoutQuickFromText = String(this.suggestedRoomNumberFromFloor(this.newFloorLevel));
    }
    this.cdr.markForCheck();
  }

  onLayoutQuickFromInput(): void {
    this.layoutQuickFromTouched = true;
  }

  private parseLayoutQuickInt(raw: string, fallback = 0): number {
    const n = parseInt(String(raw ?? '').replace(/\D/g, ''), 10);
    return Number.isFinite(n) ? n : fallback;
  }

  /** معاينة أرقام الغرف: 101 - 102 - 103 … */
  get layoutQuickNumberPreview(): string {
    const from = this.parseLayoutQuickInt(this.layoutQuickFromText, 0);
    const count = Math.max(1, Math.min(12, this.parseLayoutQuickInt(this.layoutQuickRoomCountText, 1)));
    if (from <= 0) {
      return '';
    }
    return Array.from({ length: count }, (_, i) => from + i).join(' - ');
  }

  openRoomFeaturesModal(room: Room, event: Event): void {
    event.stopPropagation();
    this.layoutFeaturesModalRoom = room;
    this.cdr.markForCheck();
  }

  closeRoomFeaturesModal(): void {
    this.layoutFeaturesModalRoom = null;
    this.cdr.markForCheck();
  }

  editRoomFromFeaturesModal(): void {
    const room = this.layoutFeaturesModalRoom;
    if (!room) {
      return;
    }
    this.closeRoomFeaturesModal();
    this.openLayoutRoomPanel(room);
  }

  quickCreateLayoutRooms(): void {
    this.requirePasswordConfirm(() => this.quickCreateLayoutRoomsConfirmed());
  }

  private quickCreateLayoutRoomsConfirmed(): void {
    const floorLevel = Math.floor(Number(this.newFloorLevel) || 0);
    const fromNum = this.parseLayoutQuickInt(this.layoutQuickFromText, 0);
    const count = this.parseLayoutQuickInt(this.layoutQuickRoomCountText, 0);
    const price = this.parseLayoutQuickInt(this.layoutQuickPriceText, 0);

    if (floorLevel < 1) {
      this.uiMsg.show(this.uiTranslations.screenText('settings', 'layoutQuickInvalidFloor'));
      return;
    }
    if (!Number.isFinite(fromNum) || fromNum < 1) {
      this.uiMsg.show(this.uiTranslations.screenText('settings', 'layoutQuickInvalidFrom'));
      return;
    }
    if (count < 1 || count > 200) {
      this.uiMsg.show(this.uiTranslations.screenText('settings', 'layoutQuickInvalidCount'));
      return;
    }
    if (price <= 0) {
      this.uiMsg.show(this.uiTranslations.screenText('settings', 'layoutQuickInvalidPrice'));
      return;
    }

    const numbers = Array.from({ length: count }, (_, i) => String(fromNum + i));
    const duplicates = numbers.filter((n) => this.rooms.some((r) => r.roomNumber === n));
    if (duplicates.length) {
      this.uiMsg.show(
        this.uiTranslations
          .screenText('settings', 'layoutQuickDuplicate')
          .replace('{nums}', duplicates.slice(0, 5).join('، ')),
      );
      return;
    }

    const roomType = this.defaultNewRoomCategory() || 'غرفة';
    const roomView = this.layoutQuickRoomView.trim() || null;
    const currencyCode = this.hotelCurrency.code();
    const currencySymbol = this.hotelCurrency.symbol();

    this.layoutQuickCreating = true;
    this.cdr.markForCheck();

    this.ensureLayoutFloor$(floorLevel, count)
      .pipe(
        switchMap(() =>
          from(numbers).pipe(
            concatMap((roomNumber) =>
              this.roomService.addRoom(
                {
                  id: 0,
                  roomNumber,
                  type: roomType,
                  roomView,
                  roomArchitecture: null,
                  roomLocation: null,
                  roomFeatures: null,
                  floor: floorLevel,
                  price,
                  status: 'available',
                  currencyCode,
                  currencySymbol,
                },
                false,
              ),
            ),
            toArray(),
          ),
        ),
        finalize(() => {
          this.layoutQuickCreating = false;
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (created) => {
          this.rooms.push(...created);
          this.newFloorLevel = floorLevel + 1;
          this.layoutQuickFromTouched = false;
          this.onLayoutQuickFloorLevelChange(this.newFloorLevel);
          this.uiMsg.success(
            this.uiTranslations
              .screenText('settings', 'layoutQuickSuccess')
              .replace('{n}', String(created.length)),
          );
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Quick layout room create failed', err);
          this.uiMsg.show(this.uiTranslations.screenText('settings', 'layoutQuickFail'));
        },
      });
  }

  /** إنشاء الطابق إن لم يكن موجوداً وتحديث سعته */
  private ensureLayoutFloor$(floorLevel: number, roomsCount: number) {
    const existing = this.floors.find((f) => f.level === floorLevel);
    if (existing?.id) {
      const nextCount = Math.max(existing.roomsCount, roomsCount);
      if (nextCount === existing.roomsCount) {
        return of(existing);
      }
      const updated: Floor = { ...existing, roomsCount: nextCount };
      return this.floorService.updateFloor(existing.id, updated).pipe(
        switchMap(() => {
          const i = this.floors.findIndex((f) => f.id === existing.id);
          if (i !== -1) {
            this.floors[i] = updated;
          }
          return of(updated);
        }),
        catchError((err) => {
          console.error('Floor update failed', err);
          throw err;
        }),
      );
    }
    const newFloor: Floor = { level: floorLevel, roomsCount };
    return this.floorService.addFloor(newFloor).pipe(
      switchMap((floor) => {
        this.floors.push(floor);
        if (!this.newRoomFloor) {
          this.newRoomFloor = floor.level;
        }
        return of(floor);
      }),
    );
  }

  /** إبقاء مميزات محفوظة سابقاً (حتى لو حُذفت من القائمة) */
  private mergeLayoutPanelFeaturesWithCatalog(): void {
    const seen = new Set<string>();
    const merged: string[] = [];
    for (const name of this.layoutPanelRoomFeatures) {
      const n = name.trim();
      if (n && !seen.has(n)) {
        seen.add(n);
        merged.push(n);
      }
    }
    this.layoutPanelRoomFeatures = merged;
  }

  toggleLayoutCurrencyPicker(event: Event): void {
    event.stopPropagation();
    this.layoutCurrencyPickerOpen = !this.layoutCurrencyPickerOpen;
  }

  selectLayoutPanelCurrency(preset: HotelCurrencyPreset): void {
    if (
      this.layoutPanelCurrencyCode === preset.code &&
      this.layoutPanelCurrencySymbol === preset.symbol
    ) {
      this.layoutCurrencyPickerOpen = false;
      return;
    }

    this.layoutPanelCurrencyCode = preset.code;
    this.layoutPanelCurrencySymbol = preset.symbol;
    this.layoutCurrencyPickerOpen = false;

    if (!this.layoutPanelIsNew && this.layoutPanelRoomId) {
      this.autoSaveLayoutPanelCurrency();
    }
    this.cdr.markForCheck();
  }

  private autoSaveLayoutPanelCurrency(): void {
    if (!this.layoutPanelRoomId || this.layoutPanelIsNew) {
      return;
    }

    const existing = this.rooms.find((r) => r.id === this.layoutPanelRoomId);
    if (!existing) {
      return;
    }

    this.layoutPanelCurrencySaving = true;
    const updated: Room = {
      ...existing,
      currencyCode: this.layoutPanelCurrencyCode,
      currencySymbol: this.layoutPanelCurrencySymbol,
    };

    this.roomService.updateRoom(this.layoutPanelRoomId, updated).subscribe({
      next: () => {
        const i = this.rooms.findIndex((r) => r.id === this.layoutPanelRoomId);
        if (i !== -1) {
          this.rooms[i] = updated;
        }
        this.layoutPanelCurrencySaving = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.layoutPanelCurrencySaving = false;
        this.alertRoomSaveError('تحديث عملة', err);
        this.cdr.markForCheck();
      },
    });
  }

  private syncLayoutPanelCurrencyFromRoom(room: Room | null): void {
    if (room?.currencyCode?.trim() && room.currencySymbol?.trim()) {
      this.layoutPanelCurrencyCode = room.currencyCode.trim();
      this.layoutPanelCurrencySymbol = room.currencySymbol.trim();
      return;
    }

    this.layoutPanelCurrencyCode = this.hotelCurrency.code();
    this.layoutPanelCurrencySymbol = this.hotelCurrency.symbol();
  }

  loadBookings(): void {
    this.bookingService.getBookings().subscribe({
      next: (data) => {
        this.allBookings = data;
        this.filterGuestsByDate();
      }
    });
  }

  filterGuestsByDate(): void {
    if (this.selectedGuestDate) {
      this.filteredBookings = this.allBookings.filter(
        (b) => toDateOnlyString(b.booking_Date) === this.selectedGuestDate
      );
    } else {
      this.filteredBookings = this.allBookings;
    }
  }

  editGuest(booking: Booking): void {
    if (!this.settingsEditable) {
      return;
    }
    this.editingBooking = { ...booking };
  }

  updateGuest(): void {
    this.requirePasswordConfirm(() => this.updateGuestConfirmed());
  }

  private updateGuestConfirmed(): void {
    if (this.editingBooking && this.editingBooking.id) {
      this.bookingService.updateBooking(this.editingBooking.id, this.editingBooking, {
        kind: 'booking_updated',
        params: bookingNotifyParams(this.editingBooking),
      }).subscribe({
        next: () => {
          this.uiMsg.show('تم تحديث بيانات النزيل بنجاح');
          this.loadBookings();
          this.editingBooking = null;
        },
        error: (err) => {
          console.error('updateGuest', err);
          const message = err?.error?.error?.message || err?.message || 'فشل تحديث البيانات';
          this.uiMsg.show(message);
        }
      });
    }
  }

  deleteGuest(id: number): void {
    this.requirePasswordConfirm(() => this.deleteGuestConfirmed(id));
  }

  private deleteGuestConfirmed(id: number): void {
    void this.uiMsg.confirm('هل أنت متأكد من حذف بيانات هذا النزيل نهائياً؟').then((ok) => {
      if (!ok) {
        return;
      }
      const booking = this.allBookings.find((b) => b.id === id);
      this.bookingService.deleteBooking(id, {
        kind: 'booking_deleted',
        params: booking ? bookingNotifyParams(booking) : undefined,
      }).subscribe({
        next: () => {
          this.uiMsg.success('تم حذف البيانات بنجاح');
          this.loadBookings();
        },
        error: (err) => {
          console.error('Delete error:', err);
          const message = err?.error?.error?.message || err?.message || 'خطأ غير معروف';
          this.uiMsg.error('فشل حذف البيانات: ' + message);
        },
      });
    });
  }

  formatTime12h(time?: string): string {
    if (!time) return '--:--';
    try {
      const parts = time.split(':');
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const period = hours >= 12 ? 'م' : 'ص';
      hours = hours % 12 || 12;
      return `${hours}:${minutes} ${period}`;
    } catch (e) {
      return time;
    }
  }


  ngOnInit(): void {
    this.isAuthorized = this.auth.canManageSettings();
    this.applyTabFromRoute();
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.applyTabFromRoute();
      this.cdr.markForCheck();
    });
    fromEvent(window, 'hotelUiLocaleChanged')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.activeTab === 'uiTranslations') {
          this.cdr.markForCheck();
        }
      });
    fromEvent(window, 'hotelUiTranslationsUpdated')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.activeTab !== 'uiTranslations') {
          return;
        }
        this.refreshUiTranslationsEditorForms();
        this.cdr.markForCheck();
      });
    this.destroyRef.onDestroy(() => {
      if (this.uiTranslationsAutoSaveTimer) {
        clearTimeout(this.uiTranslationsAutoSaveTimer);
      }
      if (this.uiTranslationsSearchAutoOpenTimer) {
        clearTimeout(this.uiTranslationsSearchAutoOpenTimer);
      }
    });
    this.loadHotelInfo();
    this.loadFloors();
    this.loadRooms();
    this.loadLayoutRoomCodeOptions();
    this.loadPaymentMethods();
    this.loadIdentityTypes();
    this.loadBookings();
    if (this.auth.canManageUsers()) {
      this.loadAppUsers();
    }
  }

  userRoleLabel(role: string | null | undefined): string {
    const key = HOTEL_USER_ROLE_OPTIONS.find(
      (o) => o.value === normalizeHotelUserRole(role),
    )?.labelKey;
    return key ? this.uiTranslations.screenText('settings', key) : '';
  }

  private emptyAppUserForm(): CreateUpdateHotelAppUserDto {
    return {
      firstName: '',
      lastName: '',
      userName: '',
      email: '',
      phoneNumber: '',
      password: '',
      role: HOTEL_USER_ROLE.Regular,
      allowNavigation: true,
    };
  }

  loadAppUsers(): void {
    this.appUsersLoading = true;
    this.hotelAppUserService.getAll().subscribe({
      next: (rows) => {
        this.appUsers = rows;
        this.appUsersLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('loadAppUsers', err);
        this.appUsersLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  addAppUser(): void {
    if (!this.ensureSettingsEditable()) {
      return;
    }
    const input = this.normalizeAppUserInput(this.newAppUser);
    if (!input.firstName || !input.lastName || !input.userName || !input.password) {
      this.uiMsg.show(this.uiTranslations.screenText('settings', 'usersRequiredFields'));
      return;
    }
    if (this.appUsers.some((u) => u.userName.toLowerCase() === input.userName.toLowerCase())) {
      this.uiMsg.show(this.uiTranslations.screenText('settings', 'usersDuplicateUserName'));
      return;
    }
    this.hotelAppUserService.create(input).subscribe({
      next: () => {
        this.newAppUser = this.emptyAppUserForm();
        this.loadAppUsers();
        this.uiMsg.show(this.uiTranslations.screenText('settings', 'usersAddSuccess'));
      },
      error: (err) => {
        console.error('addAppUser', err);
        this.uiMsg.show(this.uiTranslations.screenText('settings', 'usersSaveFail'));
      },
    });
  }

  editAppUser(user: HotelAppUserDto): void {
    if (!this.ensureSettingsEditable()) {
      return;
    }
    this.editingAppUser = { ...user };
  }

  cancelEditAppUser(): void {
    this.editingAppUser = null;
  }

  saveAppUserEdit(): void {
    if (!this.ensureSettingsEditable()) {
      return;
    }
    if (!this.editingAppUser?.id) {
      return;
    }
    const input = this.normalizeAppUserInput(this.editingAppUser);
    if (!input.firstName || !input.lastName || !input.userName) {
      this.uiMsg.show(this.uiTranslations.screenText('settings', 'usersRequiredFields'));
      return;
    }
    const duplicate = this.appUsers.some(
      (u) =>
        u.id !== this.editingAppUser!.id &&
        u.userName.toLowerCase() === input.userName.toLowerCase(),
    );
    if (duplicate) {
      this.uiMsg.show(this.uiTranslations.screenText('settings', 'usersDuplicateUserName'));
      return;
    }
    this.hotelAppUserService.update(this.editingAppUser.id, input).subscribe({
      next: () => {
        this.editingAppUser = null;
        this.loadAppUsers();
        this.uiMsg.show(this.uiTranslations.screenText('settings', 'usersUpdateSuccess'));
      },
      error: (err) => {
        console.error('saveAppUserEdit', err);
        this.uiMsg.show(this.uiTranslations.screenText('settings', 'usersSaveFail'));
      },
    });
  }

  deleteAppUser(user: HotelAppUserDto): void {
    if (!this.ensureSettingsEditable()) {
      return;
    }
    if (!user.id) {
      return;
    }
    void this.uiMsg.confirm('هل تريد حذف هذا المستخدم؟').then((ok) => {
      if (!ok) {
        return;
      }
      this.hotelAppUserService.delete(user.id).subscribe({
        next: () => {
          this.loadAppUsers();
          this.uiMsg.show(this.uiTranslations.screenText('settings', 'usersDeleteSuccess'));
        },
        error: (err) => {
          console.error('deleteAppUser', err);
          this.uiMsg.show(this.uiTranslations.screenText('settings', 'usersDeleteFail'));
        },
      });
    });
  }

  private normalizeAppUserInput(
    raw: CreateUpdateHotelAppUserDto | HotelAppUserDto,
  ): CreateUpdateHotelAppUserDto {
    return {
      firstName: (raw.firstName ?? '').trim(),
      lastName: (raw.lastName ?? '').trim(),
      userName: (raw.userName ?? '').trim(),
      email: (raw.email ?? '').trim(),
      phoneNumber: (raw.phoneNumber ?? '').trim(),
      password: (raw.password ?? '').trim(),
      role: normalizeHotelUserRole(raw.role),
      allowNavigation: raw.allowNavigation !== false,
    };
  }

  private applyTabFromRoute(): void {
    let tab = (this.route.snapshot.queryParamMap.get('tab') || '').trim();
    const navId = (this.route.snapshot.queryParamMap.get('nav') || '').trim();
    if (tab === 'general-codes') {
      tab = 'translations';
    }

    const navLeaf = findSettingsNavLeaf(navId);
    if (navLeaf) {
      if (navLeaf.requiresUsers && !this.auth.canManageUsers()) {
        this.redirectSettingsFallback();
        return;
      }
      if (navLeaf.requiresSettings && !this.auth.canManageSettings()) {
        this.redirectSettingsFallback();
        return;
      }
      this.activeSettingsNavId = navLeaf.id;
      if (navLeaf.tab) {
        this.activeTab = navLeaf.tab as typeof this.activeTab;
        this.afterActiveTabChanged();
      } else {
        this.activeTab = 'page';
      }
      return;
    }

    if (tab === 'page') {
      this.redirectSettingsFallback();
      return;
    }
    if (tab === 'users' && !this.auth.canManageUsers()) {
      this.redirectSettingsFallback();
      return;
    }
    if (tab === 'uiTranslations' && !this.auth.canManageSettings()) {
      this.redirectSettingsFallback();
      return;
    }
    if (tab && this.settingsTabKeys.has(tab)) {
      this.activeTab = tab as typeof this.activeTab;
      this.activeSettingsNavId = navId || this.defaultNavIdForTab(tab);
      this.afterActiveTabChanged();
      return;
    }
    this.activeTab = this.auth.canManageSettings() ? 'uiTranslations' : 'general';
    this.activeSettingsNavId = this.auth.canManageSettings() ? 'uiTranslation' : 'sys-hotels';
    if (!tab) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          tab: this.activeTab,
          nav: this.activeSettingsNavId,
        },
        replaceUrl: true,
      });
      if (this.activeTab === 'uiTranslations') {
        this.openUiTranslationsEditor();
      }
    }
  }

  private redirectSettingsFallback(): void {
    this.activeTab = 'general';
    this.activeSettingsNavId = 'sys-hotels';
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: 'general', nav: 'sys-hotels' },
      replaceUrl: true,
    });
  }

  private afterActiveTabChanged(): void {
    if (this.activeTab === 'uiTranslations') {
      this.openUiTranslationsEditor();
    }
    if (this.activeTab === 'users' && this.auth.canManageUsers()) {
      this.loadAppUsers();
    }
    if (this.activeTab === 'currency') {
      this.refreshAutomaticCurrency();
    }
    this.cdr.markForCheck();
  }

  private defaultNavIdForTab(tab: string): string | null {
    for (const entry of SETTINGS_PAGE_NAV) {
      if (entry.kind === 'leaf' && entry.tab === tab) {
        return entry.id;
      }
      if (entry.kind === 'section') {
        const match = entry.children.find((child) => child.tab === tab);
        if (match) {
          return match.id;
        }
      }
    }
    return null;
  }

  loadIdentityTypes(): void {
    this.identityTypesLoading = true;
    this.identityTypesError = '';
    this.identityService.getIdentityTypes().subscribe({
      next: (types) => {
        this.identityTypes = types.filter((t) => t.name?.trim());
        this.identityTypesLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading identity types', err);
        this.identityTypes = [];
        this.identityTypesLoading = false;
        this.identityTypesError = this.uiTranslations.screenText('settings', 'identitiesLoadError');
        this.cdr.markForCheck();
      },
    });
  }

  addIdentityType(): void {
    this.requirePasswordConfirm(() => this.addIdentityTypeConfirmed());
  }

  private addIdentityTypeConfirmed(): void {
    const name = this.newIdentityTypeName.trim();
    if (!name) {
      return;
    }
    const exists = this.identityTypes.some((t) => t.name.trim() === name);
    if (exists) {
      this.uiMsg.show(this.uiTranslations.screenText('settings', 'identitiesDuplicate'));
      return;
    }
    this.identityService.addIdentityType({ name }).subscribe({
      next: () => {
        this.newIdentityTypeName = '';
        this.loadIdentityTypes();
        this.uiMsg.show(this.uiTranslations.screenText('settings', 'identitiesAddSuccess'));
      },
      error: (err) => {
        console.error('addIdentityType', err);
        this.uiMsg.show(this.uiTranslations.screenText('settings', 'identitiesAddFail'));
      },
    });
  }

  deleteIdentityType(id: number | undefined): void {
    if (id == null || Number.isNaN(id)) {
      this.uiMsg.show(this.uiTranslations.screenText('settings', 'identitiesDeleteFail'));
      return;
    }
    this.requirePasswordConfirm(() => this.deleteIdentityTypeConfirmed(id));
  }

  private deleteIdentityTypeConfirmed(id: number): void {
    void this.uiMsg.confirm(this.uiTranslations.screenText('settings', 'identitiesDeleteConfirm')).then((ok) => {
      if (!ok) {
        return;
      }
      this.identityService.deleteIdentityType(id).subscribe({
        next: () => this.loadIdentityTypes(),
        error: (err) => {
          console.error('deleteIdentityType', err);
          this.uiMsg.error(this.uiTranslations.screenText('settings', 'identitiesDeleteFail'));
        },
      });
    });
  }

  setActiveTab(tab: typeof this.activeTab, navId?: string | null): void {
    if (tab === 'users' && !this.auth.canManageUsers()) {
      tab = 'general';
    }
    if (tab === 'uiTranslations' && !this.auth.canManageSettings()) {
      tab = 'general';
    }
    this.activeTab = tab;
    if (navId) {
      this.activeSettingsNavId = navId;
    } else if (!this.activeSettingsNavId || !this.navIdMatchesTab(this.activeSettingsNavId, tab)) {
      this.activeSettingsNavId = this.defaultNavIdForTab(tab);
    }
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab, nav: this.activeSettingsNavId ?? null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
    this.afterActiveTabChanged();
  }

  activeSettingsNavLeaf(): SettingsPageNavLeaf | null {
    return findSettingsNavLeaf(this.activeSettingsNavId);
  }

  private navIdMatchesTab(navId: string, tab: string): boolean {
    for (const entry of SETTINGS_PAGE_NAV) {
      if (entry.kind === 'leaf' && entry.id === navId) {
        return entry.tab === tab;
      }
      if (entry.kind === 'section') {
        const match = entry.children.find((child) => child.id === navId);
        if (match) {
          return match.tab === tab;
        }
      }
    }
    return false;
  }

  private refreshUiTranslationsReferenceColumns(): void {
    this.uiTranslationsReferenceAr = this.uiTranslations.loadLocaleFileForForm('ar');
    this.uiTranslationsReferenceEn = this.uiTranslations.loadLocaleFileForForm('en');
  }

  private refreshUiTranslationsEditorForms(): void {
    if (!this.isAuthorized) {
      return;
    }
    const editLocale = this.uiTranslationsLocale || this.restoreUiTranslationsEditorLocale();
    this.uiTranslationsLocale = editLocale;
    try {
      this.refreshUiTranslationsReferenceColumns();
      this.uiTranslationsForm = this.uiTranslations.loadLocaleFileForForm(editLocale);
      this.uiTranslationsFormLocale = editLocale;
      this.uiTranslationsError = '';
      this.rebuildUiTranslationEditorGroupsCache();
      this.uiTranslationsFormEpoch++;
      this.invalidateUiTranslationsFlatRowsCache();
    } catch (err) {
      console.error('refreshUiTranslationsEditorForms', err);
      this.uiTranslationsError = this.uiTranslations.screenText('settings', 'uiTranslationsLoadFail');
      this.uiTranslationsReferenceAr = null;
      this.uiTranslationsReferenceEn = null;
      this.uiTranslationsForm = null;
    }
  }

  private openUiTranslationsEditor(): void {
    if (!this.isAuthorized) {
      return;
    }
    this.uiTranslationsLocale = this.restoreUiTranslationsEditorLocale();
    this.uiTranslationsLoading = true;
    this.uiTranslationsError = '';
    this.uiTranslations.reloadFromBackend(() => {
      try {
        this.refreshUiTranslationsEditorForms();
        this.resetUiTranslationEditorPanelsOpen();
      } catch (err) {
        console.error('openUiTranslationsEditor', err);
        this.uiTranslationsError = this.uiTranslations.screenText('settings', 'uiTranslationsLoadFail');
        this.uiTranslationsReferenceAr = null;
        this.uiTranslationsReferenceEn = null;
        this.uiTranslationsForm = null;
      }
      this.uiTranslationsLoading = false;
      this.cdr.markForCheck();
    });
  }

  reloadUiTranslationsFromBackend(): void {
    this.openUiTranslationsEditor();
  }

  private isUiTranslationEditorLocale(value: string): value is UiExtraLocaleCode | 'ar' {
    return value === 'ar' || value === 'en' || value === 'fr' || value === 'tr';
  }

  /** لغة ملف JSON قيد التحرير — مستقلة عن شريط لغة الواجهة العلوي */
  private restoreUiTranslationsEditorLocale(): UiExtraLocaleCode | 'ar' {
    try {
      const raw = sessionStorage.getItem(HOTEL_UI_TRANSLATIONS_EDITOR_LOCALE_KEY);
      if (raw && this.isUiTranslationEditorLocale(raw)) {
        return raw;
      }
    } catch {
      /* ignore */
    }
    return 'ar';
  }

  private persistUiTranslationsEditorLocale(locale: UiExtraLocaleCode | 'ar'): void {
    try {
      sessionStorage.setItem(HOTEL_UI_TRANSLATIONS_EDITOR_LOCALE_KEY, locale);
    } catch {
      /* ignore */
    }
  }

  private syncUiTranslationFlatInputsBeforeSave(): void {
    if (!this.uiTranslationsForm) {
      return;
    }
    const inputs = Array.from(
      document.querySelectorAll<HTMLInputElement>('[data-ui-tr-field]'),
    );
    for (const input of inputs) {
      const trackId = input.getAttribute('data-ui-tr-field') ?? '';
      const value = input.value ?? '';
      const row = this.uiTranslationsFlatRowsBase().find((entry) => entry.trackId === trackId);
      if (!row) {
        continue;
      }
      if (!row.value.trim() && value.trim() === row.displayValue.trim()) {
        continue;
      }
      this.commitUiTranslationFlatEditorRow(row, value);
    }
  }

  saveUiTranslationsForm(options?: {
    silent?: boolean;
    locale?: UiExtraLocaleCode | 'ar';
    refreshAfter?: boolean;
    onComplete?: () => void;
  }): void {
    if (!this.ensureSettingsEditable()) {
      options?.onComplete?.();
      return;
    }
    if (this.uiTranslationsSaving) {
      return;
    }
    if (!this.uiTranslationsForm) {
      options?.onComplete?.();
      return;
    }
    if (this.uiTranslationsAutoSaveTimer) {
      clearTimeout(this.uiTranslationsAutoSaveTimer);
      this.uiTranslationsAutoSaveTimer = null;
    }
    this.syncUiTranslationFlatInputsBeforeSave();
    this.uiTranslationsSaving = true;
    this.uiTranslationsEditorOwnsSave = true;
    this.uiTranslationsError = '';
    const locale = options?.locale ?? this.uiTranslationsFormLocale;
    const refreshAfter = options?.refreshAfter !== false;
    this.uiTranslations.saveLocaleFileForm(locale, this.uiTranslationsForm).subscribe({
      next: (ok) => {
        this.uiTranslationsSaving = false;
        this.uiTranslationsEditorOwnsSave = false;
        if (!ok) {
          this.uiTranslationsError = this.uiTranslations.screenText('settings', 'uiTranslationsSaveFail');
          options?.onComplete?.();
          this.cdr.markForCheck();
          return;
        }
        this.refreshUiTranslationsReferenceColumns();
        if (refreshAfter) {
          this.uiTranslationsForm = this.uiTranslations.loadLocaleFileForForm(this.uiTranslationsFormLocale);
          this.rebuildUiTranslationEditorGroupsCache();
          this.invalidateUiTranslationsFlatRowsCache();
        }
        if (!options?.silent) {
          this.uiMsg.show(this.uiTranslations.screenText('settings', 'uiTranslationsSaveOk'));
        }
        options?.onComplete?.();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('saveUiTranslationsForm', err);
        this.uiTranslationsSaving = false;
        this.uiTranslationsEditorOwnsSave = false;
        this.uiTranslationsError = this.uiTranslations.screenText('settings', 'uiTranslationsSaveFail');
        options?.onComplete?.();
        this.cdr.markForCheck();
      },
    });
  }

  uiTranslationScreenGoLabel(): string {
    return this.uiTranslations.screenText('settings', 'uiTranslationsScreenGo');
  }

  navigateToUiTranslationScreen(screenId: string, settingsNavId?: string): void {
    if (!this.auth.canManageSettings()) {
      return;
    }
    const target = uiTranslationScreenNavigateTarget(screenId, settingsNavId);
    if (!target) {
      return;
    }
    void this.router
      .navigate(target.route, {
        queryParams: target.queryParams,
      })
      .then(() => {
        waitAndHighlightUiTranslationField(target.targetSelector);
      });
  }

  navigateToUiTranslationField(
    kind: UiTranslationFieldLocationKind,
    key: string,
    screenId?: string,
    settingsNavId?: string,
  ): void {
    if (!this.auth.canManageSettings()) {
      return;
    }
    const target = uiTranslationFieldNavigateTarget({
      kind,
      key,
      screenId,
      settingsNavId,
    });
    if (!target) {
      return;
    }

    void this.router
      .navigate(target.route, {
        queryParams: target.queryParams,
      })
      .then(() => {
        waitAndHighlightUiTranslationField(target.targetSelector);
      });
  }

  commitUiTranslationBrandSubtitle(value: string): void {
    if (!this.uiTranslationsForm) {
      return;
    }
    const next = value.trim();
    if (this.uiTranslationsForm.brandSubtitle === next) {
      return;
    }
    this.uiTranslationsForm.brandSubtitle = next;
    this.invalidateUiTranslationsFlatRowsCache();
    this.refreshUiTranslationGroupStatsAfterEdit();
  }

  commitUiTranslationChromeField(key: string, value: string): void {
    if (!this.uiTranslationsForm?.chrome) {
      return;
    }
    const next = value.trim();
    if (this.uiTranslationsForm.chrome[key] === next) {
      return;
    }
    this.uiTranslationsForm.chrome[key] = next;
    this.applyUiTranslationExactArabicTextMemory('chrome', key, next);
    this.invalidateUiTranslationsFlatRowsCache();
    this.refreshUiTranslationGroupStatsAfterEdit();
  }

  commitUiTranslationSidebarField(key: string, value: string): void {
    if (!this.uiTranslationsForm?.sidebarNav) {
      return;
    }
    const next = value.trim();
    if (this.uiTranslationsForm.sidebarNav[key] === next) {
      return;
    }
    this.uiTranslationsForm.sidebarNav[key] = next;
    this.applyUiTranslationExactArabicTextMemory('sidebarNav', key, next);
    this.invalidateUiTranslationsFlatRowsCache();
    this.refreshUiTranslationGroupStatsAfterEdit();
  }

  commitUiTranslationScreenField(screenId: string, key: string, value: string): void {
    const bucket = this.uiTranslationsForm?.screenCopy?.[screenId];
    if (!bucket) {
      return;
    }
    const next = value.trim();
    if (bucket[key] === next) {
      return;
    }
    bucket[key] = next;
    this.applyUiTranslationExactArabicTextMemory('screenCopy', key, next, screenId);
    this.invalidateUiTranslationsFlatRowsCache();
    this.refreshUiTranslationGroupStatsAfterEdit();
  }

  private applyUiTranslationExactArabicTextMemory(
    kind: 'chrome' | 'sidebarNav' | 'screenCopy',
    key: string,
    value: string,
    screenId?: string,
  ): void {
    if (!this.uiTranslationsForm || !this.uiTranslationsReferenceAr || !value) {
      return;
    }

    const referenceText = this.uiTranslationReferenceText(kind, key, screenId);
    if (!referenceText) {
      return;
    }

    for (const [candidateKey, candidateText] of Object.entries(this.uiTranslationsReferenceAr.chrome ?? {})) {
      if (
        candidateText.trim() === referenceText &&
        this.uiTranslationsForm.chrome &&
        this.uiTranslationShouldApplyMemory(this.uiTranslationsForm.chrome[candidateKey])
      ) {
        this.uiTranslationsForm.chrome[candidateKey] = value;
      }
    }

    for (const [candidateKey, candidateText] of Object.entries(this.uiTranslationsReferenceAr.sidebarNav ?? {})) {
      if (
        candidateText.trim() === referenceText &&
        this.uiTranslationsForm.sidebarNav &&
        this.uiTranslationShouldApplyMemory(this.uiTranslationsForm.sidebarNav[candidateKey])
      ) {
        this.uiTranslationsForm.sidebarNav[candidateKey] = value;
      }
    }

    for (const [candidateScreenId, messages] of Object.entries(this.uiTranslationsReferenceAr.screenCopy ?? {})) {
      const targetBucket = this.uiTranslationsForm.screenCopy?.[candidateScreenId];
      if (!targetBucket) {
        continue;
      }
      for (const [candidateKey, candidateText] of Object.entries(messages ?? {})) {
        if (
          candidateText.trim() === referenceText &&
          this.uiTranslationShouldApplyMemory(targetBucket[candidateKey])
        ) {
          targetBucket[candidateKey] = value;
        }
      }
    }
  }

  private uiTranslationShouldApplyMemory(currentValue: string | undefined): boolean {
    return !currentValue?.trim();
  }

  private uiTranslationReferenceText(
    kind: 'chrome' | 'sidebarNav' | 'screenCopy',
    key: string,
    screenId?: string,
  ): string {
    if (kind === 'chrome') {
      return this.uiTranslationsReferenceAr?.chrome?.[key]?.trim() ?? '';
    }
    if (kind === 'sidebarNav') {
      return this.uiTranslationsReferenceAr?.sidebarNav?.[key]?.trim() ?? '';
    }
    return this.uiTranslationsReferenceAr?.screenCopy?.[screenId ?? '']?.[key]?.trim() ?? '';
  }

  trackUiTranslationField(screenId: string, key: string): string {
    return `${this.uiTranslationsFormLocale}:${screenId}:${key}`;
  }

  private scheduleUiTranslationsAutoSave(): void {
    if (this.activeTab !== 'uiTranslations' || !this.uiTranslationsForm) {
      return;
    }
    if (this.uiTranslationsAutoSaveTimer) {
      clearTimeout(this.uiTranslationsAutoSaveTimer);
    }
    this.uiTranslationsAutoSaveTimer = setTimeout(() => {
      this.uiTranslationsAutoSaveTimer = null;
      this.saveUiTranslationsForm({ silent: true, refreshAfter: false });
    }, 1200);
  }

  onUiTranslationsSearchChange(): void {
    this.syncUiTranslationFlatInputsBeforeSave();
    this.uiTranslationsPage = 1;
    this.uiTranslationsFlatRowsCacheKey = '';
    this.uiTranslationsFlatRowsCache = [];
    if (this.uiTranslationsSearchAutoOpenTimer) {
      clearTimeout(this.uiTranslationsSearchAutoOpenTimer);
    }
    this.uiTranslationsSearchAutoOpenTimer = setTimeout(() => {
      this.uiTranslationsSearchAutoOpenTimer = null;
      this.uiTranslationsAutoOpenMatchingScreens();
    }, 350);
    this.cdr.markForCheck();
  }

  toggleUiTranslationsToolbarCollapsed(): void {
    this.uiTranslationsToolbarCollapsed = !this.uiTranslationsToolbarCollapsed;
  }

  openUiTranslationsToolbar(): void {
    this.uiTranslationsToolbarCollapsed = false;
  }

  closeUiTranslationsToolbar(): void {
    this.uiTranslationsToolbarCollapsed = true;
  }

  onUiTranslationsLocaleChange(nextLocale: UiExtraLocaleCode | 'ar'): void {
    this.uiTranslationsPage = 1;
    if (nextLocale === this.uiTranslationsFormLocale) {
      this.uiTranslationsLocale = nextLocale;
      this.persistUiTranslationsEditorLocale(nextLocale);
      this.refreshUiTranslationsEditorForms();
      this.cdr.markForCheck();
      return;
    }

    if (this.uiTranslationsAutoSaveTimer) {
      clearTimeout(this.uiTranslationsAutoSaveTimer);
      this.uiTranslationsAutoSaveTimer = null;
    }

    if (this.uiTranslationsSaving) {
      this.uiTranslationsPendingLocale = nextLocale;
      return;
    }

    const previousLocale = this.uiTranslationsFormLocale;
    const applyLocaleSwitch = () => {
      this.uiTranslationsLocale = nextLocale;
      this.persistUiTranslationsEditorLocale(nextLocale);
      if (!this.uiTranslationsForm) {
        this.cdr.markForCheck();
        return;
      }
      try {
        this.uiTranslationsForm = this.uiTranslations.loadLocaleFileForForm(nextLocale);
        this.uiTranslationsFormLocale = nextLocale;
        this.uiTranslationsError = '';
        this.rebuildUiTranslationEditorGroupsCache();
        this.uiTranslationsFormEpoch++;
        this.invalidateUiTranslationsFlatRowsCache();
      } catch (err) {
        console.error('onUiTranslationsLocaleChange', err);
        this.uiTranslationsError = this.uiTranslations.screenText('settings', 'uiTranslationsLoadFail');
        this.uiTranslationsForm = null;
      }
      this.cdr.markForCheck();
    };

    if (!this.uiTranslationsForm || !this.ensureSettingsEditable()) {
      applyLocaleSwitch();
      return;
    }

    this.saveUiTranslationsForm({
      silent: true,
      locale: previousLocale,
      refreshAfter: false,
      onComplete: () => {
        if (this.uiTranslationsPendingLocale) {
          const pending = this.uiTranslationsPendingLocale;
          this.uiTranslationsPendingLocale = null;
          this.onUiTranslationsLocaleChange(pending);
          return;
        }
        applyLocaleSwitch();
      },
    });
  }

  uiTranslationsEditableColumnTitle(): string {
    const keyByLocale: Record<UiExtraLocaleCode | 'ar', string> = {
      ar: 'uiTranslationsColEditableAr',
      en: 'uiTranslationsColEditableEn',
      fr: 'uiTranslationsColEditableFr',
      tr: 'uiTranslationsColEditableTr',
    };
    return this.uiTranslationsEditorChromeText(keyByLocale[this.uiTranslationsLocale]);
  }

  /** واجهة المحرر: عربي عند اختيار العربية، وإنجليزي عند الإنجليزية أو التركية أو الفرنسية */
  private uiTranslationsEditorChromeLocale(): UiExtraLocaleCode | 'ar' {
    const locale = this.uiTranslations.displayLocale();
    return locale === 'ar' ? 'ar' : 'en';
  }

  /** نصوص واجهة محرر الترجمة حسب الشريط العلوي؛ العمود الثالث فقط يتبع قائمة اللغة داخل الصفحة */
  uiTranslationsEditorChromeText(key: string): string {
    const locale = this.uiTranslationsEditorChromeLocale();
    const read = (code: UiExtraLocaleCode | 'ar'): string =>
      this.uiTranslations.screenTextForLocale(code, 'settings', key);
    const isUsable = (value: string): boolean => {
      const trimmed = value.trim();
      return !!trimmed && trimmed !== key && !/^\d+$/.test(trimmed);
    };
    const primary = read(locale);
    if (isUsable(primary)) {
      return primary;
    }
    if (locale !== 'en') {
      const en = read('en');
      if (isUsable(en)) {
        return en;
      }
    }
    return read('ar');
  }

  uiTranslationSystemToolLabel(toolId: UiTranslationSystemToolId): string {
    const keyByTool: Record<UiTranslationSystemToolId, string> = {
      texts: 'uiTranslationsToolTexts',
      buttons: 'uiTranslationsToolButtons',
      inputs: 'uiTranslationsToolInputs',
      selects: 'uiTranslationsToolSelects',
      tables: 'uiTranslationsToolTables',
      notifications: 'uiTranslationsToolNotifications',
      tabs: 'uiTranslationsToolTabs',
      modals: 'uiTranslationsToolModals',
    };
    return this.uiTranslationsEditorChromeText(keyByTool[toolId]);
  }

  uiTranslationEditorLocales(): readonly (UiExtraLocaleCode | 'ar')[] {
    return ['ar', 'en', 'fr', 'tr'];
  }

  uiTranslationEditorLocaleLabel(locale: UiExtraLocaleCode | 'ar'): string {
    const keyByLocale: Record<UiExtraLocaleCode | 'ar', string> = {
      ar: 'localeAr',
      en: 'localeEn',
      fr: 'localeFr',
      tr: 'localeTr',
    };
    const localized = this.uiTranslationsEditorChromeText(keyByLocale[locale]);
    const chromeLocale = this.uiTranslationsEditorChromeLocale();
    const fallback: Record<UiExtraLocaleCode | 'ar', string> =
      chromeLocale === 'ar'
        ? {
            ar: 'العربية',
            en: 'الإنجليزية',
            fr: 'الفرنسية',
            tr: 'التركية',
          }
        : {
            ar: 'Arabic',
            en: 'English',
            fr: 'French',
            tr: 'Turkish',
          };
    if (/^\d+$/.test(localized.trim())) {
      return fallback[locale];
    }
    return localized || fallback[locale];
  }

  uiTranslationEditorGroups(): readonly UiTranslationEditorGroup[] {
    return this.uiTranslationEditorGroupsCache;
  }

  /** محرر ترجمة الواجهة — يعرض القسم المختار من شريط «القسم» */
  uiTranslationEditorGroupsForView(): readonly UiTranslationEditorGroup[] {
    const groups = this.uiTranslationEditorGroups();
    if (this.activeTab !== 'uiTranslations' || !this.uiTranslationsJumpGroupId) {
      return groups;
    }
    const selected = groups.filter((group) => group.id === this.uiTranslationsJumpGroupId);
    return selected.length ? selected : groups;
  }

  trackUiTranslationGroup(_index: number, group: UiTranslationEditorGroup): string {
    return group.id;
  }

  trackUiTranslationScreen(_index: number, screenId: string): string {
    return screenId;
  }

  trackUiTranslationMsgKey(_index: number, msgKey: string): string {
    return `${this.uiTranslationsFormEpoch}:${msgKey}`;
  }

  trackUiTranslationChromeKey(_index: number, key: string): string {
    return `${this.uiTranslationsFormEpoch}:${key}`;
  }

  trackUiTranslationChromeSubsection(
    _index: number,
    subsection: { id: string },
  ): string {
    return subsection.id;
  }

  trackUiTranslationSidebarKey(_index: number, key: string): string {
    return `${this.uiTranslationsFormEpoch}:${key}`;
  }

  trackUiTranslationEpoch(_index: number, epoch: number): number {
    return epoch;
  }

  trackUiTranslationScreenSection(_index: number, section: UiTranslationScreenSection): string {
    return section.id;
  }

  trackSettingsUiTranslationPanel(_index: number, panel: SettingsUiTranslationPanel): string {
    return panel.navId;
  }

  trackSettingsUiTranslationRow(_index: number, row: SettingsUiTranslationRow): string {
    return `${row.screenId}:${row.key}`;
  }

  private rebuildUiTranslationEditorGroupsCache(): void {
    const screenIds = Object.keys(this.uiTranslationsForm?.screenCopy ?? {});
    this.uiTranslationEditorGroupsCache = uiTranslationEditorGroupsWithOther(screenIds);
    this.uiTranslationGroupScreenIdsCache.clear();
    this.uiTranslationScreenSectionsCache.clear();
    this.uiTranslationPanelSectionsCache.clear();
    const file = this.uiTranslationsForm;
    for (const group of this.uiTranslationEditorGroupsCache) {
      const ids = (group.screenIds ?? []).filter((id) => !!file?.screenCopy?.[id]);
      this.uiTranslationGroupScreenIdsCache.set(group.id, ids);
      for (const screenId of ids) {
        const keys = Object.keys(file?.screenCopy?.[screenId] ?? {}).sort((a, b) => a.localeCompare(b));
        this.uiTranslationScreenSectionsCache.set(
          screenId,
          uiTranslationScreenSectionsForEditor(screenId, keys),
        );
      }
    }
    this.refreshSettingsUiTranslationPanels();
    for (const panel of this.settingsUiTranslationPanels()) {
      const screenId = panel.rows[0]?.screenId ?? 'settings';
      this.uiTranslationPanelSectionsCache.set(
        panel.navId,
        uiTranslationScreenSectionsForEditor(screenId, panel.rows.map((row) => row.key)),
      );
    }
    this.rebuildUiTranslationGroupStatsCache();
  }

  private rebuildUiTranslationGroupStatsCache(options?: { keepUntranslatedFlatRows?: boolean }): void {
    this.uiTranslationGroupStatsCache.clear();
    if (!this.uiTranslationsForm) {
      return;
    }
    for (const group of this.uiTranslationEditorGroupsCache) {
      this.uiTranslationGroupStatsCache.set(group.id, this.computeGroupTranslationStats(group));
    }
    if (this.uiTranslationsSectionFilter === 'untranslated' && !options?.keepUntranslatedFlatRows) {
      this.rebuildUiTranslationsUntranslatedFlatCache();
    }
  }

  private countUiTranslationField(
    counters: { total: number; translated: number },
    value: string | undefined,
  ): void {
    counters.total++;
    if (isUiTranslationValueFilled(value)) {
      counters.translated++;
    }
  }

  uiTranslationsSystemMessageChromeKeys(): string[] {
    const chrome = this.uiTranslationsForm?.chrome ?? {};
    return Object.keys(chrome)
      .filter((key) => this.uiTranslationsSystemMessageChromeRowVisible(key))
      .sort((a, b) => a.localeCompare(b));
  }

  uiTranslationsSystemMessageScreenIds(): string[] {
    const screenCopy = this.uiTranslationsForm?.screenCopy ?? {};
    return Object.keys(screenCopy)
      .filter((screenId) => this.uiTranslationsSystemMessageScreenKeys(screenId).length > 0)
      .sort((a, b) => this.uiTranslationsScreenLabel(a).localeCompare(this.uiTranslationsScreenLabel(b)));
  }

  uiTranslationsSystemMessageScreenKeys(screenId: string): string[] {
    const msgs = this.uiTranslationsForm?.screenCopy?.[screenId] ?? {};
    return Object.keys(msgs)
      .filter((key) => this.uiTranslationsSystemMessageScreenRowVisible(screenId, key))
      .sort((a, b) => a.localeCompare(b));
  }

  uiTranslationsSystemMessagesHasContent(): boolean {
    return (
      this.uiTranslationsSystemMessageChromeKeys().length > 0 ||
      this.uiTranslationsSystemMessageScreenIds().length > 0
    );
  }

  uiTranslationsSystemMessageChromeRowVisible(key: string): boolean {
    if (!isUiTranslationSystemMessageKey(key) || isUiTranslationEditorChromeKeyExcluded(key)) {
      return false;
    }
    const value = this.uiTranslationsForm?.chrome?.[key];
    if (!this.uiTranslationsFieldMatchesSectionFilter(value)) {
      return false;
    }
    return this.uiTranslationsMatchesText(
      key,
      this.uiTranslationsReferenceAr?.chrome?.[key],
      this.uiTranslationsReferenceEn?.chrome?.[key],
      value,
    );
  }

  uiTranslationsSystemMessageScreenRowVisible(screenId: string, key: string): boolean {
    if (!isUiTranslationSystemMessageKey(key)) {
      return false;
    }
    const value = this.uiTranslationsForm?.screenCopy?.[screenId]?.[key];
    if (!this.uiTranslationsFieldMatchesSectionFilter(value)) {
      return false;
    }
    return this.uiTranslationsMatchesText(
      key,
      this.uiTranslationsScreenLabel(screenId),
      this.uiTranslationsReferenceAr?.screenCopy?.[screenId]?.[key],
      this.uiTranslationsReferenceEn?.screenCopy?.[screenId]?.[key],
      value,
    );
  }

  private computeGroupTranslationStats(
    group: UiTranslationEditorGroup,
  ): UiTranslationGroupTranslationStats {
    const counters = { total: 0, translated: 0 };
    const form = this.uiTranslationsForm;
    if (!form) {
      return emptyUiTranslationGroupStats();
    }

    if (group.includeAllSystemMessages) {
      for (const key of Object.keys(form.chrome ?? {})) {
        if (
          isUiTranslationSystemMessageKey(key) &&
          !isUiTranslationEditorChromeKeyExcluded(key)
        ) {
          this.countUiTranslationField(counters, form.chrome?.[key]);
        }
      }
      for (const msgs of Object.values(form.screenCopy ?? {})) {
        for (const key of Object.keys(msgs ?? {})) {
          if (isUiTranslationSystemMessageKey(key)) {
            this.countUiTranslationField(counters, msgs?.[key]);
          }
        }
      }
      return uiTranslationGroupStatsFromCounts(counters.total, counters.translated);
    }

    if (group.includeBrandSubtitle) {
      this.countUiTranslationField(counters, form.brandSubtitle);
    }

    if (group.includeAllChrome) {
      for (const key of Object.keys(form.chrome ?? {})) {
        if (isUiTranslationEditorChromeKeyExcluded(key) || isUiTranslationSystemMessageKey(key)) {
          continue;
        }
        this.countUiTranslationField(counters, form.chrome?.[key]);
      }
    }

    if (group.includeAllSidebar) {
      for (const section of this.uiTranslationSidebarSections()) {
        for (const key of uiTranslationSidebarSectionKeys(section)) {
          if (this.uiTranslationsSidebarKeyExists(key)) {
            this.countUiTranslationField(counters, form.sidebarNav?.[key]);
          }
        }
      }
    }

    for (const key of group.sidebarNavKeys ?? []) {
      if (this.uiTranslationsSidebarKeyExists(key)) {
        this.countUiTranslationField(counters, form.sidebarNav?.[key]);
      }
    }

    if (group.id === 'settings') {
      for (const panel of this.settingsUiTranslationPanels()) {
        for (const row of panel.rows) {
          if (isUiTranslationSystemMessageKey(row.key)) {
            continue;
          }
          this.countUiTranslationField(counters, form.screenCopy?.[row.screenId]?.[row.key]);
        }
      }
    } else {
      for (const screenId of group.screenIds ?? []) {
        const msgs = form.screenCopy?.[screenId];
        if (!msgs) {
          continue;
        }
        for (const key of Object.keys(msgs)) {
          if (isUiTranslationSystemMessageKey(key)) {
            continue;
          }
          this.countUiTranslationField(counters, msgs[key]);
        }
      }
    }

    return uiTranslationGroupStatsFromCounts(counters.total, counters.translated);
  }

  uiTranslationsGroupStats(group: UiTranslationEditorGroup): UiTranslationGroupTranslationStats {
    return this.uiTranslationGroupStatsCache.get(group.id) ?? emptyUiTranslationGroupStats();
  }

  uiTranslationsGroupStatsClass(group: UiTranslationEditorGroup): string {
    const stats = this.uiTranslationsGroupStats(group);
    if (!stats.total) {
      return 'ui-tr-group__stats--empty';
    }
    if (stats.untranslated === 0) {
      return 'ui-tr-group__stats--complete';
    }
    if (stats.translated === 0) {
      return 'ui-tr-group__stats--missing';
    }
    return 'ui-tr-group__stats--partial';
  }

  uiTranslationsGroupSectionFilterMatches(group: UiTranslationEditorGroup): boolean {
    return uiTranslationGroupMatchesSectionFilter(
      this.uiTranslationsSectionFilter,
      this.uiTranslationsGroupStats(group),
    );
  }

  uiTranslationEditorGroupsForJump(): readonly UiTranslationEditorGroup[] {
    return this.uiTranslationEditorGroups().filter(
      (group) =>
        this.uiTranslationsGroupHasContent(group) &&
        this.uiTranslationsGroupSectionFilterMatches(group),
    );
  }

  uiTranslationSystemPagePickerGroups(): readonly UiTranslationEditorGroup[] {
    return this.uiTranslationEditorGroupsForJump().filter((group) => group.id !== 'systemMessages');
  }

  uiTranslationSystemPagePickerOptions(): readonly UiTranslationSystemPageOption[] {
    const sidebarOption: UiTranslationSystemPageOption = {
      id: 'sidebar',
      screenId: 'sidebar',
      label: 'الشريط الجانبي',
    };
    const sidebarOrder = this.uiTranslationsVisualSidebarKeyOrder();
    const sidebarOrderIndex = new Map(sidebarOrder.map((key, index) => [key, index]));
    const screenOrder = (screenId: string): number => {
      const pathKeys = uiTranslationScreenNavPathKeys(screenId) ?? [screenId];
      const indexes = pathKeys
        .map((key) => sidebarOrderIndex.get(key))
        .filter((index): index is number => index !== undefined);
      return indexes.length ? Math.min(...indexes) : Number.MAX_SAFE_INTEGER;
    };
    const pages = Object.keys(this.uiTranslationsReferenceAr?.screenCopy ?? {})
      .map((screenId) => ({
        id: `screen:${screenId}`,
        screenId,
        label: this.uiTranslationsScreenLabel(screenId),
      }))
      .sort((a, b) => screenOrder(a.screenId) - screenOrder(b.screenId) || a.label.localeCompare(b.label));
    const dashboardIndex = pages.findIndex((page) => page.screenId === 'dashboard');
    if (dashboardIndex < 0) {
      return [sidebarOption, ...pages];
    }
    const dashboard = pages[dashboardIndex];
    const rest = pages.filter((_, index) => index !== dashboardIndex);
    return [dashboard, sidebarOption, ...rest];
  }

  uiTranslationSystemPagePickerValue(): string {
    return this.uiTranslationsJumpGroupId || '';
  }

  trackUiTranslationSystemPageOption(_index: number, page: UiTranslationSystemPageOption): string {
    return page.id;
  }

  uiTranslationsSectionFilterSummary(): { translatedFields: number; untranslatedFields: number } {
    let translatedFields = 0;
    let untranslatedFields = 0;
    for (const group of this.uiTranslationEditorGroupsForView()) {
      if (!this.uiTranslationsGroupHasContent(group)) {
        continue;
      }
      const stats = this.uiTranslationsGroupStats(group);
      translatedFields += stats.translated;
      untranslatedFields += stats.untranslated;
    }
    return { translatedFields, untranslatedFields };
  }

  uiTranslationsUntranslatedFlatRows(): readonly UiTranslationUntranslatedFlatRow[] {
    if (!this.uiTranslationsHasQuery()) {
      return this.uiTranslationsUntranslatedFlatCache;
    }
    return this.uiTranslationsUntranslatedFlatCache.filter((row) =>
      this.uiTranslationsMatchesText(
        row.key,
        row.contextLabel,
        row.referenceAr,
        row.referenceEn,
        row.defaultValue,
      ),
    );
  }

  trackUiTranslationUntranslatedFlatRow(
    _index: number,
    row: UiTranslationUntranslatedFlatRow,
  ): string {
    return row.trackId;
  }

  trackUiTranslationFlatEditorRow(_index: number, row: UiTranslationFlatEditorRow): string {
    return row.trackId;
  }

  private uiTranslationsFlatRowsBase(): UiTranslationFlatEditorRow[] {
    const form = this.uiTranslationsForm;
    const referenceAr = this.uiTranslationsReferenceAr;
    if (!form || !referenceAr) {
      return [];
    }
    const cacheKey = `${this.uiTranslationsFormEpoch}:${this.uiTranslationsFlatRowsRevision}:${this.uiTranslationsFormLocale}`;
    if (this.uiTranslationsFlatRowsBaseCacheKey === cacheKey) {
      return this.uiTranslationsFlatRowsBaseCache;
    }

    const rows: UiTranslationFlatEditorRow[] = [];
    const pushRow = (row: UiTranslationFlatEditorRow): void => {
      rows.push(row);
    };
    const displayValue = (value: string | undefined, seed: string): string =>
      (value ?? '').trim() || this.uiTranslationsMissingDisplayNumber(seed);
    const missingNumber = (seed: string): string => this.uiTranslationsMissingDisplayNumber(seed);

    if (referenceAr.brandSubtitle !== undefined) {
      const trackId = `${this.uiTranslationsFormLocale}:brandSubtitle`;
      const value = form.brandSubtitle ?? '';
      const seed = 'brandSubtitle';
      pushRow({
        kind: 'brandSubtitle',
        key: 'brandSubtitle',
        referenceAr: referenceAr.brandSubtitle ?? '',
        referenceEn: this.uiTranslationsReferenceEn?.brandSubtitle ?? '',
        value,
        displayValue: displayValue(value, seed),
        searchNumber: missingNumber(seed),
        trackId,
      });
    }

    for (const key of Object.keys(referenceAr.chrome ?? {}).sort((a, b) => a.localeCompare(b))) {
      const trackId = `${this.uiTranslationsFormLocale}:chrome:${key}`;
      const value = form.chrome?.[key] ?? '';
      const seed = `chrome:${key}`;
      pushRow({
        kind: 'chrome',
        key,
        referenceAr: referenceAr.chrome?.[key] ?? '',
        referenceEn: this.uiTranslationsReferenceEn?.chrome?.[key] ?? '',
        value,
        displayValue: displayValue(value, seed),
        searchNumber: missingNumber(seed),
        trackId,
      });
    }

    for (const key of this.uiTranslationsSidebarKeysInVisualOrder(referenceAr.sidebarNav ?? {})) {
      const trackId = `${this.uiTranslationsFormLocale}:sidebar:${key}`;
      const value = form.sidebarNav?.[key] ?? '';
      const seed = `sidebar:${key}`;
      pushRow({
        kind: 'sidebarNav',
        key,
        referenceAr: referenceAr.sidebarNav?.[key] ?? '',
        referenceEn: this.uiTranslationsReferenceEn?.sidebarNav?.[key] ?? '',
        value,
        displayValue: displayValue(value, seed),
        searchNumber: missingNumber(seed),
        trackId,
      });
    }

    for (const screenId of Object.keys(referenceAr.screenCopy ?? {}).sort((a, b) =>
      this.uiTranslationsScreenLabel(a).localeCompare(this.uiTranslationsScreenLabel(b)),
    )) {
      const messages = referenceAr.screenCopy?.[screenId] ?? {};
      for (const key of Object.keys(messages).sort((a, b) => a.localeCompare(b))) {
        const trackId = `${this.uiTranslationsFormLocale}:screen:${screenId}:${key}`;
        const value = form.screenCopy?.[screenId]?.[key] ?? '';
        const seed = `screen:${screenId}:${key}`;
        pushRow({
          kind: 'screenCopy',
          screenId,
          key,
          referenceAr: messages[key] ?? '',
          referenceEn: this.uiTranslationsReferenceEn?.screenCopy?.[screenId]?.[key] ?? '',
          value,
          displayValue: displayValue(value, seed),
          searchNumber: missingNumber(seed),
          trackId,
        });
      }
    }

    this.uiTranslationsFlatRowsBaseCacheKey = cacheKey;
    this.uiTranslationsFlatRowsBaseCache = rows;
    return rows;
  }

  private uiTranslationsSidebarKeysInVisualOrder(sidebarNav: Record<string, string>): string[] {
    const available = new Set(Object.keys(sidebarNav));
    const ordered = this.uiTranslationsVisualSidebarKeyOrder().filter((key) => available.has(key));
    const used = new Set(ordered);
    const rest = Object.keys(sidebarNav)
      .filter((key) => !used.has(key))
      .sort((a, b) => a.localeCompare(b));
    return [...ordered, ...rest];
  }

  private uiTranslationsVisualSidebarKeyOrder(): string[] {
    const keys: string[] = ['dashboard'];
    keys.push('frontDeskGroup');
    for (const entry of FRONT_DESK_NAV_ENTRIES) {
      if (isFrontDeskNavSubgroup(entry)) {
        keys.push(entry.labelKey, ...entry.children.map((child) => child.labelKey));
      } else {
        keys.push(entry.labelKey);
      }
    }
    keys.push('bookingsGroup', ...BOOKINGS_NAV_ITEMS.map((item) => item.labelKey));
    for (const section of ['cashier', 'crm', 'nightAuditor', 'housekeeping'] as const) {
      const group = PMS_SIDEBAR_GROUPS.find((entry) => entry.section === section);
      if (group) {
        keys.push(group.labelKey, ...group.items.map((item) => item.labelKey));
      }
    }
    keys.push('accountsGroup');
    const accountsGroup = PMS_SIDEBAR_GROUPS.find((entry) => entry.section === 'accounts');
    if (accountsGroup) {
      keys.push(...accountsGroup.items.map((item) => item.labelKey));
    }
    keys.push('settings');
    for (const entry of SETTINGS_SIDEBAR_NAV_ENTRIES) {
      if (isSettingsSidebarNavSubgroup(entry)) {
        keys.push(entry.labelKey, ...entry.children.map((child) => child.labelKey));
      } else {
        keys.push(entry.labelKey);
      }
    }
    keys.push('reports', ...REPORTS_NAV_ITEMS.map((item) => item.labelKey));
    return [...new Set(keys)];
  }

  private uiTranslationsMissingDisplayNumber(seed: string): string {
    let hash = 0;
    for (let index = 0; index < seed.length; index++) {
      hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
    }
    return String(1000 + (hash % 9000));
  }

  uiTranslationsFlatRows(): UiTranslationFlatEditorRow[] {
    const cacheKey = [
      this.uiTranslationsFormEpoch,
      this.uiTranslationsFlatRowsRevision,
      this.uiTranslationsFormLocale,
      this.activeUiTranslationSystemTool,
      this.uiTranslationsJumpGroupId,
      this.uiTranslationsSectionFilter,
      this.uiTranslationsSearch.trim().toLocaleLowerCase(),
    ].join(':');
    if (this.uiTranslationsFlatRowsCacheKey === cacheKey) {
      return this.uiTranslationsFlatRowsCache;
    }
    const hasSearch = this.uiTranslationsHasQuery();
    const rows = this.uiTranslationsFlatRowsBase().filter((row) => {
      if (!this.uiTranslationsFlatRowMatchesSelectedSystemPage(row)) {
        return false;
      }
      if (!hasSearch && !this.uiTranslationsFlatRowMatchesSystemTool(row, this.activeUiTranslationSystemTool)) {
        return false;
      }
      if (!this.uiTranslationsFieldMatchesSectionFilter(row.value)) {
        return false;
      }
      return this.uiTranslationsMatchesText(
        row.key,
        row.screenId ? this.uiTranslationsScreenLabel(row.screenId) : undefined,
        row.referenceAr,
        row.referenceEn,
        row.searchNumber,
        row.displayValue,
        row.value,
      );
    });
    if (hasSearch) {
      rows.sort((a, b) => this.uiTranslationsFlatSearchRank(a) - this.uiTranslationsFlatSearchRank(b));
    }
    this.uiTranslationsFlatRowsCacheKey = cacheKey;
    this.uiTranslationsFlatRowsCache = rows;
    return rows;
  }

  private uiTranslationsFlatSearchRank(row: UiTranslationFlatEditorRow): number {
    const q = this.uiTranslationsQuery();
    if (!q) {
      return 0;
    }
    const screenLabel = row.screenId ? this.uiTranslationsScreenLabel(row.screenId) : '';
    const groups = [
      [row.value, row.displayValue, row.searchNumber],
      [row.referenceAr, row.referenceEn],
      [row.key, screenLabel],
    ];
    for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
      for (const text of groups[groupIndex]) {
        const value = (text ?? '').trim().toLowerCase();
        if (value === q) {
          return groupIndex * 10;
        }
      }
      for (const text of groups[groupIndex]) {
        const value = (text ?? '').trim().toLowerCase();
        if (value.startsWith(q)) {
          return groupIndex * 10 + 1;
        }
      }
      for (const text of groups[groupIndex]) {
        const value = (text ?? '').trim().toLowerCase();
        if (value.includes(q)) {
          return groupIndex * 10 + 2;
        }
      }
    }
    return 100;
  }

  setActiveUiTranslationSystemTool(toolId: UiTranslationSystemToolId): void {
    this.activeUiTranslationSystemTool = toolId;
    this.uiTranslationsPage = 1;
    this.invalidateUiTranslationsFlatRowsCache();
    this.cdr.markForCheck();
  }

  uiTranslationsFlatResultSummary(): string {
    const locale = this.uiTranslationEditorLocaleLabel(this.uiTranslationsLocale);
    const section = this.uiTranslationSystemToolLabel(this.activeUiTranslationSystemTool);
    return `${locale} · ${section}`;
  }

  activeUiTranslationSystemToolConfig(): UiTranslationSystemTool {
    return (
      this.uiTranslationSystemTools.find((tool) => tool.id === this.activeUiTranslationSystemTool) ??
      this.uiTranslationSystemTools[0]
    );
  }

  uiTranslationsSystemToolStats(toolId: UiTranslationSystemToolId): UiTranslationGroupTranslationStats {
    const cacheKey = `${this.uiTranslationsFormEpoch}:${this.uiTranslationsFlatRowsRevision}:${this.uiTranslationsFormLocale}:${this.uiTranslationsJumpGroupId}:${toolId}`;
    const cached = this.uiTranslationsSystemToolStatsCache.get(toolId);
    if (cached?.key === cacheKey) {
      return cached.stats;
    }
    const rows = this.uiTranslationsFlatRowsBase().filter((row) =>
      this.uiTranslationsFlatRowMatchesSelectedSystemPage(row) &&
      this.uiTranslationsFlatRowMatchesSystemTool(row, toolId),
    );
    const translated = rows.filter((row) => isUiTranslationValueFilled(row.value)).length;
    const stats = uiTranslationGroupStatsFromCounts(rows.length, translated);
    this.uiTranslationsSystemToolStatsCache.set(toolId, { key: cacheKey, stats });
    return stats;
  }

  uiTranslationsSystemToolPercent(toolId: UiTranslationSystemToolId): number {
    const stats = this.uiTranslationsSystemToolStats(toolId);
    if (!stats.total) {
      return 0;
    }
    return Math.round((stats.translated / stats.total) * 100);
  }

  private uiTranslationsFlatRowMatchesSelectedSystemPage(row: UiTranslationFlatEditorRow): boolean {
    const groupId = this.uiTranslationsJumpGroupId;
    if (!groupId) {
      return false;
    }
    if (groupId === this.uiTranslationsAllPagesGroupId || groupId === 'systemMessages') {
      return true;
    }
    if (groupId === 'sidebar') {
      return row.kind === 'sidebarNav';
    }
    if (groupId.startsWith('screen:')) {
      const screenId = groupId.slice('screen:'.length);
      if (row.kind === 'screenCopy') {
        return row.screenId === screenId;
      }
      if (row.kind === 'sidebarNav') {
        return new Set(uiTranslationScreenNavPathKeys(screenId) ?? []).has(row.key);
      }
      return false;
    }
    const group = this.uiTranslationEditorGroups().find((entry) => entry.id === groupId);
    if (!group) {
      return true;
    }
    if (group.includeBrandSubtitle && row.kind === 'brandSubtitle') {
      return true;
    }
    if (group.includeAllChrome) {
      return row.kind === 'chrome' || row.kind === 'brandSubtitle';
    }
    if (group.includeAllSidebar) {
      return row.kind === 'sidebarNav';
    }
    const screenIds = new Set(group.screenIds ?? []);
    if (row.kind === 'screenCopy') {
      return !!row.screenId && screenIds.has(row.screenId);
    }
    if (row.kind === 'sidebarNav') {
      return this.uiTranslationsSelectedGroupSidebarKeys(group).has(row.key);
    }
    return false;
  }

  private uiTranslationsSelectedGroupSidebarKeys(group: UiTranslationEditorGroup): Set<string> {
    const keys = new Set<string>(group.sidebarNavKeys ?? []);
    for (const screenId of group.screenIds ?? []) {
      for (const key of uiTranslationScreenNavPathKeys(screenId) ?? []) {
        keys.add(key);
      }
    }
    if (group.titleSidebarKey) {
      keys.add(group.titleSidebarKey);
    }
    return keys;
  }

  private uiTranslationsFlatRowMatchesSystemTool(
    row: UiTranslationFlatEditorRow,
    toolId: UiTranslationSystemToolId,
  ): boolean {
    switch (toolId) {
      case 'texts':
        return this.uiTranslationKeyLooksPlainText(row);
      case 'buttons':
        return this.uiTranslationKeyLooksButton(row.key);
      case 'inputs':
        return this.uiTranslationKeyLooksInput(row.key);
      case 'selects':
        return this.uiTranslationKeyLooksDropdown(row.key);
      case 'tables':
        return this.uiTranslationKeyLooksTable(row.key);
      case 'notifications':
        return this.uiTranslationKeyLooksNotification(row.key);
      case 'tabs':
        return this.uiTranslationKeyLooksTab(row.key);
      case 'modals':
        return this.uiTranslationKeyLooksModal(row.key);
      default:
        return false;
    }
  }

  private uiTranslationKeyLooksPlainText(row: UiTranslationFlatEditorRow): boolean {
    return (
      row.kind === 'brandSubtitle' ||
      (
        !this.uiTranslationKeyLooksButton(row.key) &&
        !this.uiTranslationKeyLooksInput(row.key) &&
        !this.uiTranslationKeyLooksDropdown(row.key) &&
        !this.uiTranslationKeyLooksTable(row.key) &&
        !this.uiTranslationKeyLooksNotification(row.key) &&
        !this.uiTranslationKeyLooksTab(row.key) &&
        !this.uiTranslationKeyLooksModal(row.key)
      )
    );
  }

  private uiTranslationKeyLooksButton(key: string): boolean {
    return (
      key.startsWith('add') ||
      key.startsWith('btn') ||
      key.endsWith('Btn') ||
      key.endsWith('Button') ||
      key.endsWith('Submit') ||
      ['save', 'cancel', 'edit', 'delete', 'close', 'confirm'].includes(key)
    );
  }

  private uiTranslationKeyLooksInput(key: string): boolean {
    return (
      key.startsWith('field') ||
      key.startsWith('input') ||
      key.startsWith('ph') ||
      key.endsWith('Input') ||
      key.endsWith('Field') ||
      key.endsWith('Placeholder') ||
      key.endsWith('Ph') ||
      key.includes('Search')
    );
  }

  private uiTranslationKeyLooksDropdown(key: string): boolean {
    return (
      key.startsWith('select') ||
      key.startsWith('choose') ||
      key.startsWith('filter') ||
      key.endsWith('Select') ||
      key.endsWith('Dropdown') ||
      key.endsWith('Picker') ||
      key.endsWith('Option') ||
      key.includes('Locale') ||
      key.includes('Currency')
    );
  }

  private uiTranslationKeyLooksTable(key: string): boolean {
    return (
      key.startsWith('col') ||
      key.startsWith('table') ||
      key.startsWith('row') ||
      key.endsWith('Col') ||
      key.endsWith('Column') ||
      key.endsWith('Table') ||
      key.includes('Columns')
    );
  }

  private uiTranslationKeyLooksNotification(key: string): boolean {
    return (
      isUiTranslationSystemMessageKey(key) ||
      /(?:Toast|Notify|Notification|Message|Success|Fail|Failed|Error|Warning|Warn|Invalid|Duplicate|Required|Saved|Saving|Empty|Loading|Confirm)$/i.test(
        key,
      )
    );
  }

  private uiTranslationKeyLooksTab(key: string): boolean {
    return key.startsWith('tab') || key.endsWith('Tab') || key.includes('Tabs');
  }

  private uiTranslationKeyLooksModal(key: string): boolean {
    return (
      key.startsWith('modal') ||
      key.endsWith('Modal') ||
      key.includes('Modal') ||
      key.includes('Popup') ||
      key.includes('Dialog') ||
      key.includes('Panel')
    );
  }

  uiTranslationsFlatTotalRows(): number {
    return this.uiTranslationsFlatRows().length;
  }

  uiTranslationsFlatTotalPages(): number {
    return Math.max(1, Math.ceil(this.uiTranslationsFlatTotalRows() / this.uiTranslationsPageSize));
  }

  uiTranslationsFlatPageRows(): UiTranslationFlatEditorRow[] {
    const totalPages = this.uiTranslationsFlatTotalPages();
    const page = Math.min(Math.max(this.uiTranslationsPage, 1), totalPages);
    if (page !== this.uiTranslationsPage) {
      this.uiTranslationsPage = page;
    }
    const start = (page - 1) * this.uiTranslationsPageSize;
    return this.uiTranslationsFlatRows().slice(start, start + this.uiTranslationsPageSize);
  }

  uiTranslationsFlatPageNumbers(): number[] {
    const total = this.uiTranslationsFlatTotalPages();
    const start = Math.max(1, Math.min(this.uiTranslationsPage - 1, total - 3));
    const end = Math.min(total, start + 3);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  uiTranslationsFlatPageRangeLabel(): string {
    const total = this.uiTranslationsFlatTotalRows();
    if (total === 0) {
      return '0-0';
    }
    const currentPage = Math.min(Math.max(this.uiTranslationsPage, 1), this.uiTranslationsFlatTotalPages());
    const start = (currentPage - 1) * this.uiTranslationsPageSize + 1;
    const end = Math.min(start + this.uiTranslationsPageSize - 1, total);
    return `${start}-${end}`;
  }

  setUiTranslationsPage(page: number): void {
    this.uiTranslationsPage = Math.min(Math.max(page, 1), this.uiTranslationsFlatTotalPages());
  }

  nextUiTranslationsPage(): void {
    this.setUiTranslationsPage(this.uiTranslationsPage + 1);
  }

  previousUiTranslationsPage(): void {
    this.setUiTranslationsPage(this.uiTranslationsPage - 1);
  }

  private invalidateUiTranslationsFlatRowsCache(): void {
    this.uiTranslationsFlatRowsRevision++;
    this.uiTranslationsFlatRowsBaseCacheKey = '';
    this.uiTranslationsFlatRowsBaseCache = [];
    this.uiTranslationsFlatRowsCacheKey = '';
    this.uiTranslationsFlatRowsCache = [];
    this.uiTranslationsSystemToolStatsCache.clear();
  }

  commitUiTranslationFlatEditorRow(row: UiTranslationFlatEditorRow, value: string): void {
    if (!row.value.trim() && value.trim() === row.displayValue.trim()) {
      return;
    }
    if (row.kind === 'brandSubtitle') {
      this.commitUiTranslationBrandSubtitle(value);
      return;
    }
    if (row.kind === 'chrome') {
      this.commitUiTranslationChromeField(row.key, value);
      return;
    }
    if (row.kind === 'sidebarNav') {
      this.commitUiTranslationSidebarField(row.key, value);
      return;
    }
    this.commitUiTranslationScreenField(row.screenId ?? 'settings', row.key, value);
  }

  commitUiTranslationFlatField(row: UiTranslationUntranslatedFlatRow, value: string): void {
    switch (row.kind) {
      case 'brandSubtitle':
        this.commitUiTranslationBrandSubtitle(value);
        break;
      case 'chrome':
        this.commitUiTranslationChromeField(row.key, value);
        break;
      case 'sidebarNav':
        this.commitUiTranslationSidebarField(row.key, value);
        break;
      case 'screenCopy':
      case 'settings':
        this.commitUiTranslationScreenField(row.screenId ?? 'settings', row.key, value);
        break;
      default:
        break;
    }
  }

  onUiTranslationsSectionFilterChange(filter: UiTranslationSectionFilter): void {
    this.uiTranslationsSectionFilter = filter;
    this.uiTranslationsPage = 1;
    if (filter === 'untranslated') {
      this.uiTranslationsJumpGroupId = '';
      this.rebuildUiTranslationsUntranslatedFlatCache();
      this.cdr.markForCheck();
      this.scrollToFirstUntranslatedField();
      return;
    }

    const jumpGroups = this.uiTranslationEditorGroupsForJump();
    if (
      this.uiTranslationsJumpGroupId &&
      !jumpGroups.some((group) => group.id === this.uiTranslationsJumpGroupId)
    ) {
      this.uiTranslationsJumpGroupId = '';
    }
    if (this.uiTranslationsJumpGroupId) {
      this.uiTranslationsOpenGroups = new Set([this.uiTranslationsJumpGroupId]);
      this.autoOpenScreensForGroup(this.uiTranslationsJumpGroupId);
    }
    this.cdr.markForCheck();
  }

  private rebuildUiTranslationsUntranslatedFlatCache(): void {
    const rows: UiTranslationUntranslatedFlatRow[] = [];
    const form = this.uiTranslationsForm;
    if (!form) {
      this.uiTranslationsUntranslatedFlatCache = [];
      return;
    }

    for (const group of this.uiTranslationEditorGroupsForView()) {
      if (!this.uiTranslationsGroupHasContent(group)) {
        continue;
      }
      const groupTitle = this.uiTranslationsGroupTitle(group);

      if (group.includeAllSystemMessages) {
        for (const key of Object.keys(form.chrome ?? {}).sort((a, b) => a.localeCompare(b))) {
          if (
            !isUiTranslationSystemMessageKey(key) ||
            isUiTranslationEditorChromeKeyExcluded(key)
          ) {
            continue;
          }
          pushUntranslatedFlatRow(rows, {
            trackId: `chrome:${key}`,
            contextLabel: `${groupTitle} / ${this.uiTranslationsReferenceAr?.chrome?.[key] ?? key}`,
            referenceAr: this.uiTranslationsReferenceAr?.chrome?.[key] ?? '',
            referenceEn: this.uiTranslationsReferenceEn?.chrome?.[key] ?? '',
            value: form.chrome?.[key],
            kind: 'chrome',
            key,
          });
        }
        for (const screenId of Object.keys(form.screenCopy ?? {}).sort((a, b) => a.localeCompare(b))) {
          const msgs = form.screenCopy?.[screenId];
          if (!msgs) {
            continue;
          }
          const screenLabel = this.uiTranslationsScreenLabel(screenId);
          for (const key of Object.keys(msgs).sort((a, b) => a.localeCompare(b))) {
            if (!isUiTranslationSystemMessageKey(key)) {
              continue;
            }
            pushUntranslatedFlatRow(rows, {
              trackId: `screenCopy:${screenId}:${key}`,
              contextLabel: `${groupTitle} / ${screenLabel}`,
              referenceAr: this.uiTranslationsReferenceAr?.screenCopy?.[screenId]?.[key] ?? '',
              referenceEn: this.uiTranslationsReferenceEn?.screenCopy?.[screenId]?.[key] ?? '',
              value: msgs[key],
              kind: 'screenCopy',
              screenId,
              key,
            });
          }
        }
      }

      if (group.includeBrandSubtitle) {
        pushUntranslatedFlatRow(rows, {
          trackId: 'brandSubtitle:brandSubtitle',
          contextLabel: groupTitle,
          referenceAr: this.uiTranslationsReferenceAr?.brandSubtitle ?? '',
          referenceEn: this.uiTranslationsReferenceEn?.brandSubtitle ?? '',
          value: form.brandSubtitle,
          kind: 'brandSubtitle',
          key: 'brandSubtitle',
        });
      }

      if (group.includeAllChrome) {
        for (const key of Object.keys(form.chrome ?? {}).sort((a, b) => a.localeCompare(b))) {
          if (isUiTranslationEditorChromeKeyExcluded(key) || isUiTranslationSystemMessageKey(key)) {
            continue;
          }
          pushUntranslatedFlatRow(rows, {
            trackId: `chrome:${key}`,
            contextLabel: `${groupTitle} / ${this.uiTranslationsReferenceAr?.chrome?.[key] ?? key}`,
            referenceAr: this.uiTranslationsReferenceAr?.chrome?.[key] ?? '',
            referenceEn: this.uiTranslationsReferenceEn?.chrome?.[key] ?? '',
            value: form.chrome?.[key],
            kind: 'chrome',
            key,
          });
        }
      }

      if (group.includeAllSidebar) {
        for (const section of this.uiTranslationSidebarSections()) {
          for (const key of uiTranslationSidebarSectionKeys(section)) {
            if (!this.uiTranslationsSidebarKeyExists(key)) {
              continue;
            }
            const breadcrumb =
              section.id === 'settings'
                ? this.uiTranslationsSettingsSidebarBreadcrumb(key)
                : this.uiTranslationsLabelForNavKey(section.titleKey ?? section.id);
            pushUntranslatedFlatRow(rows, {
              trackId: `sidebarNav:${key}`,
              contextLabel: breadcrumb,
              referenceAr: this.uiTranslationsReferenceAr?.sidebarNav?.[key] ?? '',
              referenceEn: this.uiTranslationsReferenceEn?.sidebarNav?.[key] ?? '',
              value: form.sidebarNav?.[key],
              kind: 'sidebarNav',
              key,
            });
          }
        }
      }

      for (const key of this.uiTranslationsUniqueSidebarKeys(group.sidebarNavKeys ?? [])) {
        pushUntranslatedFlatRow(rows, {
          trackId: `sidebarNav:${key}`,
          contextLabel: `${groupTitle} / ${this.uiTranslationsLabelForNavKey(key)}`,
          referenceAr: this.uiTranslationsReferenceAr?.sidebarNav?.[key] ?? '',
          referenceEn: this.uiTranslationsReferenceEn?.sidebarNav?.[key] ?? '',
          value: form.sidebarNav?.[key],
          kind: 'sidebarNav',
          key,
        });
      }

      if (group.id === 'settings') {
        for (const panel of this.settingsUiTranslationPanels()) {
          const screenId = panel.rows[0]?.screenId ?? 'settings';
          const panelLabel = this.settingsUiTranslationPanelBreadcrumb(panel);
          for (const row of panel.rows) {
            if (isUiTranslationSystemMessageKey(row.key)) {
              continue;
            }
            pushUntranslatedFlatRow(rows, {
              trackId: `screenCopy:${row.screenId}:${row.key}`,
              contextLabel: panelLabel,
              referenceAr: this.uiTranslationsReferenceAr?.screenCopy?.[row.screenId]?.[row.key] ?? '',
              referenceEn: this.uiTranslationsReferenceEn?.screenCopy?.[row.screenId]?.[row.key] ?? '',
              value: form.screenCopy?.[row.screenId]?.[row.key],
              kind: 'screenCopy',
              key: row.key,
              screenId,
            });
          }
        }
      } else {
        for (const screenId of group.screenIds ?? []) {
          const msgs = form.screenCopy?.[screenId];
          if (!msgs) {
            continue;
          }
          const screenLabel = this.uiTranslationsScreenLabel(screenId);
          for (const key of Object.keys(msgs).sort((a, b) => a.localeCompare(b))) {
            if (isUiTranslationSystemMessageKey(key)) {
              continue;
            }
            pushUntranslatedFlatRow(rows, {
              trackId: `screenCopy:${screenId}:${key}`,
              contextLabel: `${groupTitle} / ${screenLabel}`,
              referenceAr: this.uiTranslationsReferenceAr?.screenCopy?.[screenId]?.[key] ?? '',
              referenceEn: this.uiTranslationsReferenceEn?.screenCopy?.[screenId]?.[key] ?? '',
              value: msgs[key],
              kind: 'screenCopy',
              key,
              screenId,
            });
          }
        }
      }
    }

    this.uiTranslationsUntranslatedFlatCache = rows;
  }

  exportUiTranslations(format: UiTranslationExportFormat): void {
    const rows = this.collectUiTranslationsExportRows();
    if (!rows.length) {
      this.uiMsg.show(this.uiTranslations.screenText('settings', 'uiTranslationsExportEmpty'));
      return;
    }

    const headers: [string, string, string] = [
      this.uiTranslations.screenText('settings', 'uiTranslationsColArabic'),
      this.uiTranslations.screenText('settings', 'uiTranslationsColEnglish'),
      this.uiTranslationsEditableColumnTitle(),
    ];
    const title = this.uiTranslations.screenText('settings', 'uiTranslationsTitle');
    const stamp = todayLocalDateString();
    const base = `ui-translations-${this.uiTranslationsLocale}-${this.uiTranslationsSectionFilter}-${stamp}`;

    switch (format) {
      case 'text':
        downloadUiTranslationExportFile(
          `${base}.txt`,
          buildUiTranslationExportText(rows, headers),
          'text/plain;charset=utf-8',
        );
        break;
      case 'excel':
        downloadUiTranslationExportFile(
          `${base}.xls`,
          buildUiTranslationExportHtmlTable(rows, headers, title),
          'application/vnd.ms-excel;charset=utf-8',
        );
        break;
      case 'pdf': {
        const printed = printUiTranslationExportPdf(title, headers, rows);
        if (!printed) {
          this.uiMsg.show(this.uiTranslations.screenText('settings', 'uiTranslationsExportPdfFail'));
        }
        break;
      }
      default:
        break;
    }
  }

  private collectUiTranslationsExportRows(): UiTranslationExportRow[] {
    const rows: UiTranslationExportRow[] = [];
    const form = this.uiTranslationsForm;
    if (!form) {
      return rows;
    }

    for (const group of this.uiTranslationEditorGroupsForView()) {
      if (!this.uiTranslationsGroupHasContent(group)) {
        continue;
      }

      if (group.includeAllSystemMessages) {
        for (const key of Object.keys(form.chrome ?? {}).sort((a, b) => a.localeCompare(b))) {
          if (
            !isUiTranslationSystemMessageKey(key) ||
            isUiTranslationEditorChromeKeyExcluded(key)
          ) {
            continue;
          }
          this.pushUiTranslationExportRowIfVisible(
            rows,
            `chrome:${key}`,
            this.uiTranslationsReferenceAr?.chrome?.[key],
            this.uiTranslationsReferenceEn?.chrome?.[key],
            form.chrome?.[key],
          );
        }
        for (const screenId of Object.keys(form.screenCopy ?? {}).sort((a, b) => a.localeCompare(b))) {
          const msgs = form.screenCopy?.[screenId];
          if (!msgs) {
            continue;
          }
          for (const key of Object.keys(msgs).sort((a, b) => a.localeCompare(b))) {
            if (!isUiTranslationSystemMessageKey(key)) {
              continue;
            }
            this.pushUiTranslationExportRowIfVisible(
              rows,
              `screenCopy:${screenId}:${key}`,
              this.uiTranslationsReferenceAr?.screenCopy?.[screenId]?.[key],
              this.uiTranslationsReferenceEn?.screenCopy?.[screenId]?.[key],
              msgs[key],
            );
          }
        }
      }

      if (group.includeBrandSubtitle) {
        this.pushUiTranslationExportRowIfVisible(
          rows,
          'brandSubtitle',
          this.uiTranslationsReferenceAr?.brandSubtitle,
          this.uiTranslationsReferenceEn?.brandSubtitle,
          form.brandSubtitle,
        );
      }

      if (group.includeAllChrome) {
        for (const key of Object.keys(form.chrome ?? {}).sort((a, b) => a.localeCompare(b))) {
          if (isUiTranslationEditorChromeKeyExcluded(key) || isUiTranslationSystemMessageKey(key)) {
            continue;
          }
          this.pushUiTranslationExportRowIfVisible(
            rows,
            `chrome:${key}`,
            this.uiTranslationsReferenceAr?.chrome?.[key],
            this.uiTranslationsReferenceEn?.chrome?.[key],
            form.chrome?.[key],
          );
        }
      }

      if (group.includeAllSidebar) {
        for (const section of this.uiTranslationSidebarSections()) {
          for (const key of uiTranslationSidebarSectionKeys(section)) {
            if (!this.uiTranslationsSidebarKeyExists(key)) {
              continue;
            }
            this.pushUiTranslationExportRowIfVisible(
              rows,
              `sidebarNav:${key}`,
              this.uiTranslationsReferenceAr?.sidebarNav?.[key],
              this.uiTranslationsReferenceEn?.sidebarNav?.[key],
              form.sidebarNav?.[key],
            );
          }
        }
      }

      for (const key of this.uiTranslationsUniqueSidebarKeys(group.sidebarNavKeys ?? [])) {
        this.pushUiTranslationExportRowIfVisible(
          rows,
          `sidebarNav:${key}`,
          this.uiTranslationsReferenceAr?.sidebarNav?.[key],
          this.uiTranslationsReferenceEn?.sidebarNav?.[key],
          form.sidebarNav?.[key],
        );
      }

      if (group.id === 'settings') {
        for (const panel of this.settingsUiTranslationPanels()) {
          for (const row of panel.rows) {
            if (isUiTranslationSystemMessageKey(row.key)) {
              continue;
            }
            this.pushUiTranslationExportRowIfVisible(
              rows,
              `screenCopy:${row.screenId}:${row.key}`,
              this.uiTranslationsReferenceAr?.screenCopy?.[row.screenId]?.[row.key],
              this.uiTranslationsReferenceEn?.screenCopy?.[row.screenId]?.[row.key],
              form.screenCopy?.[row.screenId]?.[row.key],
            );
          }
        }
      } else {
        for (const screenId of group.screenIds ?? []) {
          const msgs = form.screenCopy?.[screenId];
          if (!msgs) {
            continue;
          }
          for (const key of Object.keys(msgs).sort((a, b) => a.localeCompare(b))) {
            if (isUiTranslationSystemMessageKey(key)) {
              continue;
            }
            this.pushUiTranslationExportRowIfVisible(
              rows,
              `screenCopy:${screenId}:${key}`,
              this.uiTranslationsReferenceAr?.screenCopy?.[screenId]?.[key],
              this.uiTranslationsReferenceEn?.screenCopy?.[screenId]?.[key],
              msgs[key],
            );
          }
        }
      }
    }

    return rows;
  }

  private pushUiTranslationExportRowIfVisible(
    rows: UiTranslationExportRow[],
    fieldKey: string,
    referenceAr: string | undefined,
    referenceEn: string | undefined,
    value: string | undefined,
  ): void {
    if (!this.uiTranslationsFieldMatchesSectionFilter(value)) {
      return;
    }
    if (!this.uiTranslationsMatchesText(fieldKey, referenceAr, referenceEn, value)) {
      return;
    }
    rows.push({
      fieldKey,
      referenceAr: referenceAr ?? '',
      referenceEn: referenceEn ?? '',
      translation: value ?? '',
    });
  }

  uiTranslationsFieldMatchesSectionFilter(value: string | undefined | null): boolean {
    return uiTranslationValueMatchesSectionFilter(this.uiTranslationsSectionFilter, value);
  }

  uiTranslationsFieldNeedsTranslation(value: string | undefined | null): boolean {
    return !isUiTranslationValueFilled(value);
  }

  uiTranslationsBrandSubtitleRowVisible(): boolean {
    if (
      isUiTranslationCorruptedNumericPlaceholder(this.uiTranslationsReferenceAr?.brandSubtitle)
    ) {
      return false;
    }
    if (!this.uiTranslationsFieldMatchesSectionFilter(this.uiTranslationsForm?.brandSubtitle)) {
      return false;
    }
    return this.uiTranslationsMatchesText(
      'brandSubtitle',
      this.uiTranslationsReferenceAr?.brandSubtitle,
      this.uiTranslationsReferenceEn?.brandSubtitle,
      this.uiTranslationsForm?.brandSubtitle,
    );
  }

  uiTranslationsChromeRowVisible(key: string): boolean {
    if (isUiTranslationCorruptedNumericPlaceholder(this.uiTranslationsReferenceAr?.chrome?.[key])) {
      return false;
    }
    if (!this.uiTranslationsFieldMatchesSectionFilter(this.uiTranslationsForm?.chrome?.[key])) {
      return false;
    }
    if (!this.uiTranslationsHasQuery()) {
      return true;
    }
    return this.uiTranslationsMatchesText(
      key,
      this.uiTranslationsReferenceAr?.chrome?.[key],
      this.uiTranslationsReferenceEn?.chrome?.[key],
      this.uiTranslationsForm?.chrome?.[key],
    );
  }

  uiTranslationsSidebarKeyRowVisible(key: string, sectionId?: string): boolean {
    if (
      isUiTranslationCorruptedNumericPlaceholder(this.uiTranslationsReferenceAr?.sidebarNav?.[key])
    ) {
      return false;
    }
    if (!this.uiTranslationsSidebarKeyExists(key)) {
      return false;
    }
    if (!this.uiTranslationsFieldMatchesSectionFilter(this.uiTranslationsForm?.sidebarNav?.[key])) {
      return false;
    }
    if (!this.uiTranslationsHasQuery()) {
      return true;
    }
    return this.uiTranslationsSidebarKeyMatches(key, sectionId);
  }

  settingsUiTranslationRowVisible(row: SettingsUiTranslationRow): boolean {
    if (
      isUiTranslationCorruptedNumericPlaceholder(
        this.uiTranslationsReferenceAr?.screenCopy?.[row.screenId]?.[row.key],
      )
    ) {
      return false;
    }
    const value = this.uiTranslationsForm?.screenCopy?.[row.screenId]?.[row.key];
    if (!this.uiTranslationsFieldMatchesSectionFilter(value)) {
      return false;
    }
    return this.settingsUiTranslationRowMatches(row);
  }

  uiTranslationsScreenSectionRowVisible(screenId: string, msgKey: string): boolean {
    if (
      isUiTranslationCorruptedNumericPlaceholder(
        this.uiTranslationsReferenceAr?.screenCopy?.[screenId]?.[msgKey],
      )
    ) {
      return false;
    }
    const value = this.uiTranslationsForm?.screenCopy?.[screenId]?.[msgKey];
    if (!this.uiTranslationsFieldMatchesSectionFilter(value)) {
      return false;
    }
    return this.uiTranslationsScreenSectionRowMatches(screenId, msgKey);
  }

  private scrollToFirstUntranslatedField(): void {
    window.setTimeout(() => {
      const target = document.querySelector(
        '#ui-tr-untranslated-flat [data-ui-tr-untranslated="true"], [data-ui-tr-untranslated="true"]',
      ) as HTMLElement | null;
      if (!target) {
        return;
      }
      target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      const row = target.closest('.ui-tr-row');
      row?.classList.add('ui-tr-row--focus-pulse');
      window.setTimeout(() => row?.classList.remove('ui-tr-row--focus-pulse'), 2600);
    }, 120);
  }

  private refreshUiTranslationGroupStatsAfterEdit(): void {
    this.rebuildUiTranslationGroupStatsCache({
      keepUntranslatedFlatRows: this.uiTranslationsSectionFilter === 'untranslated',
    });
    this.cdr.markForCheck();
  }

  onUiTranslationsJumpGroupChange(groupId: string): void {
    this.uiTranslationsJumpGroupId = groupId || '';
    this.uiTranslationsPage = 1;
    this.invalidateUiTranslationsFlatRowsCache();
    if (!this.uiTranslationsJumpGroupId) {
      this.cdr.markForCheck();
      return;
    }
    if (
      this.uiTranslationsJumpGroupId === this.uiTranslationsAllPagesGroupId ||
      this.uiTranslationsJumpGroupId === 'sidebar' ||
      this.uiTranslationsJumpGroupId.startsWith('screen:')
    ) {
      this.cdr.markForCheck();
      return;
    }
    const selectedGroupId = this.uiTranslationsJumpGroupId;
    this.uiTranslationsOpenGroups = new Set([selectedGroupId]);
    this.autoOpenScreensForGroup(selectedGroupId);
    this.cdr.markForCheck();

    window.setTimeout(() => {
      const el = document.getElementById(`ui-tr-group-${selectedGroupId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  uiTranslationsGroupTitle(group: UiTranslationEditorGroup): string {
    if (group.titleSidebarKey) {
      return this.uiTranslations.sidebarLabel(group.titleSidebarKey);
    }
    if (group.titleSettingsKey) {
      return this.uiTranslations.screenText('settings', group.titleSettingsKey);
    }
    return group.id;
  }

  uiTranslationsGroupKey(group: UiTranslationEditorGroup): string {
    return group.titleSidebarKey ?? group.id;
  }

  private uiTranslationsSidebarKeyExists(key: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.uiTranslationsForm?.sidebarNav ?? {}, key);
  }

  private uiTranslationsUniqueSidebarKeys(keys: readonly string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const key of keys) {
      if (seen.has(key) || !this.uiTranslationsSidebarKeyExists(key)) {
        continue;
      }
      seen.add(key);
      out.push(key);
    }
    return out.sort((a, b) => a.localeCompare(b));
  }

  uiTranslationsGroupSidebarKeys(group: UiTranslationEditorGroup): string[] {
    if (group.includeAllSidebar) {
      return [];
    }
    const keys = group.sidebarNavKeys ?? [];
    return this.uiTranslationsUniqueSidebarKeys(keys).filter((key) =>
      this.uiTranslationsSidebarKeyRowVisible(key),
    );
  }

  readonly settingsSidebarNavEntries = SETTINGS_SIDEBAR_NAV_ENTRIES;
  readonly settingsUiTranslationSections: readonly SettingsPageNavSection[] =
    settingsUiTranslationSectionEntries();
  readonly isSettingsSidebarNavSubgroup = isSettingsSidebarNavSubgroup;
  private settingsUiTranslationPanelsCache: readonly SettingsUiTranslationPanel[] = [];

  uiTranslationSidebarSections(): readonly UiTranslationSidebarSection[] {
    const allKeys = Object.keys(this.uiTranslationsForm?.sidebarNav ?? {});
    return uiTranslationSidebarSectionsWithOther(allKeys);
  }

  uiTranslationsLabelForNavKey(key: string): string {
    return (
      this.uiTranslationsReferenceAr?.sidebarNav?.[key]?.trim() ||
      this.uiTranslations.sidebarLabel(key) ||
      this.uiTranslations.chromeLabel(key) ||
      key
    );
  }

  uiTranslationsBreadcrumbFromKeys(keys: readonly string[]): string {
    return keys.map((key) => this.uiTranslationsLabelForNavKey(key)).join(' / ');
  }

  uiTranslationsSettingsSidebarBreadcrumb(labelKey: string): string {
    return this.uiTranslationsBreadcrumbFromKeys(settingsSidebarNavPathKeys(labelKey));
  }

  uiTranslationsSettingsSidebarKeyMatches(labelKey: string): boolean {
    return this.uiTranslationsMatchesText(
      labelKey,
      this.uiTranslationsSettingsSidebarBreadcrumb(labelKey),
      this.uiTranslationsReferenceAr?.sidebarNav?.[labelKey],
      this.uiTranslationsReferenceEn?.sidebarNav?.[labelKey],
      this.uiTranslationsForm?.sidebarNav?.[labelKey],
    );
  }

  uiTranslationsSettingsSidebarKeyVisible(labelKey: string): boolean {
    return this.uiTranslationsSidebarKeyRowVisible(labelKey, 'settings');
  }

  uiTranslationsSettingsSubgroupVisible(entry: SettingsSidebarNavSubgroup): boolean {
    if (!this.uiTranslationsHasQuery()) {
      return entry.children.some((child) => this.uiTranslationsSidebarKeyExists(child.labelKey));
    }
    if (this.uiTranslationsSettingsSidebarKeyMatches(entry.labelKey)) {
      return true;
    }
    return entry.children.some((child) => this.uiTranslationsSettingsSidebarKeyVisible(child.labelKey));
  }

  uiTranslationsSettingsNavEntryVisible(entry: SettingsSidebarNavEntry): boolean {
    if (isSettingsSidebarNavSubgroup(entry)) {
      return this.uiTranslationsSettingsSubgroupVisible(entry);
    }
    return this.uiTranslationsSettingsSidebarKeyVisible(entry.labelKey);
  }

  uiTranslationsSettingsSubgroupOpen(subgroupId: string): boolean {
    return this.uiTranslationsOpenSidebarSections.has(`settings-sub-${subgroupId}`);
  }

  toggleUiTranslationsSettingsSubgroup(subgroupId: string): void {
    const key = `settings-sub-${subgroupId}`;
    const next = new Set(this.uiTranslationsOpenSidebarSections);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    this.uiTranslationsOpenSidebarSections = next;
    this.cdr.markForCheck();
  }

  uiTranslationsSidebarSectionHeadLabel(section: UiTranslationSidebarSection): string {
    if (section.titleKey) {
      return (
        this.uiTranslationsReferenceAr?.sidebarNav?.[section.titleKey]?.trim() ||
        this.uiTranslations.sidebarLabel(section.titleKey)
      );
    }
    if (section.titleSettingsKey) {
      return this.uiTranslations.screenText('settings', section.titleSettingsKey);
    }
    return section.id;
  }

  uiTranslationsSidebarSectionRowKeys(section: UiTranslationSidebarSection): string[] {
    const keys: string[] = [];
    if (section.titleKey && this.uiTranslationsSidebarKeyExists(section.titleKey)) {
      keys.push(section.titleKey);
    }
    keys.push(...this.uiTranslationsUniqueSidebarKeys(section.itemKeys));
    return keys.filter((key) => this.uiTranslationsSidebarKeyRowVisible(key, section.id));
  }

  private uiTranslationsSidebarKeyMatches(key: string, sectionId?: string): boolean {
    const breadcrumb =
      sectionId === 'settings' ? this.uiTranslationsSettingsSidebarBreadcrumb(key) : undefined;
    return this.uiTranslationsMatchesText(
      key,
      breadcrumb,
      this.uiTranslationsReferenceAr?.sidebarNav?.[key],
      this.uiTranslationsReferenceEn?.sidebarNav?.[key],
      this.uiTranslationsForm?.sidebarNav?.[key],
    );
  }

  uiTranslationsSidebarSectionHasContent(section: UiTranslationSidebarSection): boolean {
    return this.uiTranslationsSidebarSectionRowKeys(section).length > 0;
  }

  uiTranslationsSidebarSectionHasMatch(section: UiTranslationSidebarSection): boolean {
    if (!this.uiTranslationsHasQuery()) {
      return this.uiTranslationsSidebarSectionHasContent(section);
    }
    const head = this.uiTranslationsSidebarSectionHeadLabel(section);
    if (this.uiTranslationsMatchesText(section.id, head)) {
      return true;
    }
    const titleKey = section.titleKey;
    if (titleKey && this.uiTranslationsSidebarKeyMatches(titleKey)) {
      return true;
    }
    for (const key of section.itemKeys) {
      if (this.uiTranslationsSidebarKeyMatches(key, section.id)) {
        return true;
      }
    }
    return false;
  }

  uiTranslationsSidebarSectionVisible(section: UiTranslationSidebarSection): boolean {
    if (!this.uiTranslationsHasQuery()) {
      return this.uiTranslationsSidebarSectionHasContent(section);
    }
    return this.uiTranslationsSidebarSectionHasMatch(section);
  }

  toggleUiTranslationsSidebarSection(sectionId: string): void {
    const next = new Set(this.uiTranslationsOpenSidebarSections);
    if (next.has(sectionId)) {
      next.delete(sectionId);
    } else {
      next.add(sectionId);
    }
    this.uiTranslationsOpenSidebarSections = next;
    this.cdr.markForCheck();
  }

  uiTranslationsSidebarSectionOpen(sectionId: string): boolean {
    return this.uiTranslationsOpenSidebarSections.has(sectionId);
  }

  uiTranslationsGroupChromeKeys(group: UiTranslationEditorGroup): string[] {
    if (!group.includeAllChrome) {
      return [];
    }
    const file = this.uiTranslationsForm;
    if (!file?.chrome) {
      return [];
    }
    return Object.keys(file.chrome)
      .filter((key) => !isUiTranslationEditorChromeKeyExcluded(key) && !isUiTranslationSystemMessageKey(key))
      .sort((a, b) => a.localeCompare(b))
      .filter((key) => this.uiTranslationsChromeRowVisible(key));
  }

  /** مجموعات الـ chrome keys مصنّفة حسب موضعها في الواجهة للعرض المقسم */
  private static readonly CHROME_TOPBAR_KEYS = new Set<string>([
    'navRailExpandTitle', 'navRailCollapseTitle', 'navRailExpandAria', 'navRailCollapseAria',
    'langPickerLabel', 'langPickerAria', 'langPickerToggleAria', 'langPickerOtherLocales',
    'searchOverlayPlaceholder', 'searchOverlayAria', 'searchOverlayEsc',
    'searchOpenTitle', 'searchOpenAria',
    'settingsMenuHotel', 'settingsMenuUiTranslation', 'accountSettingsLink',
    'helpSettingsLink', 'helpSearchLink',
    'searchTagSummary', 'searchTagPage', 'searchTagBookings',
    'searchTagFrontDesk', 'searchTagRooms', 'searchTagReports',
    'loadingDataHint', 'loadingSlowHint', 'loadingRefreshBtn',
    'loadingRefreshTitle', 'loadingRefreshAria',
  ]);

  private static readonly CHROME_ACCOUNT_PANEL_KEYS = new Set<string>([
    'accountPanelTitle', 'accountMenuTitle',
    'accountRailOpenTitle', 'accountRailOpenAria', 'accountRailCloseTitle', 'accountRailCloseAria',
    'accountLocaleJsonHint', 'accountJsonEditorOpen', 'accountJsonEditorTitle',
    'accountJsonEditorSave', 'accountJsonEditorCancel', 'accountJsonEditorInvalid', 'accountJsonEditorSaveFailed',
    'notificationsMenuTitle', 'translationMenuTitle', 'langSectionSubtitle',
    'notificationsTitle', 'notificationsSubtitle', 'notificationsAria', 'notificationsEmpty',
    'notificationsMarkRead', 'notificationsClear',
    'notifyBookingCreated', 'notifyBookingUpdated', 'notifyBookingTransfer',
    'notifyBookingAddGuest', 'notifyBookingPayment', 'notifyBookingCheckout',
    'notifyBookingCancelled', 'notifyBookingDeleted',
    'notifyRoomCreated', 'notifyRoomUpdated', 'notifyRoomDeleted', 'notifyRoomStatus',
    'notifyTimeJustNow', 'notifyTimeMinutes', 'notifyTimeHours', 'notifyTimeDays',
    'toastSavedTitle', 'toastSaveFailedTitle', 'toastLocaleChangedTitle', 'toastLocaleChanged',
    'toastLocaleCategoryTitle', 'toastLocaleCategorySelected', 'toastCurrencySaved',
  ]);

  private static readonly CHROME_DB_SETTINGS_KEYS = new Set<string>([
    'uiInlineTranslationPh', 'uiInlineWorkbenchHint', 'uiInlineWorkbenchHintActive',
    'uiInlineTranslationToggleOn', 'uiInlineTranslationToggleOff',
    'uiInlineTranslationSaveExit', 'uiInlineTranslationSave',
    'uiInlineTranslationNavBlocked', 'uiInlineTranslationPickLocale',
    'messageConfirmTitle', 'messageConfirm', 'messageCancel', 'messageClose',
  ]);

  uiTranslationsChromeSubsections(group: UiTranslationEditorGroup): Array<{
    id: string;
    titleKey: string;
    keys: string[];
  }> {
    if (!group.includeAllChrome) return [];
    const allKeys = this.uiTranslationsGroupChromeKeys(group);
    const topBar = allKeys.filter(k => SettingsComponent.CHROME_TOPBAR_KEYS.has(k));
    const accountPanel = allKeys.filter(k => SettingsComponent.CHROME_ACCOUNT_PANEL_KEYS.has(k));
    const dbSettings = allKeys.filter(k => SettingsComponent.CHROME_DB_SETTINGS_KEYS.has(k));
    const other = allKeys.filter(
      k => !SettingsComponent.CHROME_TOPBAR_KEYS.has(k) &&
           !SettingsComponent.CHROME_ACCOUNT_PANEL_KEYS.has(k) &&
           !SettingsComponent.CHROME_DB_SETTINGS_KEYS.has(k)
    );
    return [
      { id: 'topBar', titleKey: 'uiTranslationsChromeSubTopBar', keys: topBar },
      { id: 'accountPanel', titleKey: 'uiTranslationsChromeSubAccount', keys: accountPanel },
      { id: 'dbSettings', titleKey: 'uiTranslationsChromeSubDb', keys: dbSettings },
      { id: 'other', titleKey: 'uiTranslationsChromeSubOther', keys: other },
    ].filter(s => s.keys.length > 0);
  }

  uiTranslationsGroupScreenIds(group: UiTranslationEditorGroup): string[] {
    if (group.id === 'settings') {
      return [];
    }
    const cached = this.uiTranslationGroupScreenIdsCache.get(group.id);
    const ids = cached ?? (group.screenIds ?? []).filter((id) => !!this.uiTranslationsForm?.screenCopy?.[id]);
    if (!this.uiTranslationsHasQuery() && this.uiTranslationsSectionFilter === 'all') {
      return ids;
    }
    return ids.filter((id) => this.uiTranslationsScreenHasMatch(id));
  }

  refreshSettingsUiTranslationPanels(): void {
    this.settingsUiTranslationPanelsCache = buildSettingsUiTranslationPanels(
      this.uiTranslationsForm?.screenCopy,
    );
  }

  settingsUiTranslationPanels(): readonly SettingsUiTranslationPanel[] {
    return this.settingsUiTranslationPanelsCache;
  }

  settingsUiTranslationTopPanels(): readonly SettingsUiTranslationPanel[] {
    return settingsUiTranslationTopLevelPanels(this.settingsUiTranslationPanels());
  }

  settingsUiTranslationSectionPanels(sectionId: string): readonly SettingsUiTranslationPanel[] {
    return settingsUiTranslationPanelsForSection(this.settingsUiTranslationPanels(), sectionId);
  }

  settingsUiTranslationPanelBreadcrumb(panel: SettingsUiTranslationPanel): string {
    return this.uiTranslationsBreadcrumbFromKeys(panel.pathKeys);
  }

  settingsUiTranslationPanelOpen(panel: SettingsUiTranslationPanel): boolean {
    return this.uiTranslationsOpenScreens.has(settingsUiTranslationPanelId(panel));
  }

  toggleSettingsUiTranslationPanel(panel: SettingsUiTranslationPanel): void {
    const panelId = settingsUiTranslationPanelId(panel);
    const next = new Set(this.uiTranslationsOpenScreens);
    if (next.has(panelId)) {
      next.delete(panelId);
      for (const section of this.uiTranslationsPanelSections(panel)) {
        next.delete(this.uiTranslationsScreenSectionStorageKey(panel.navId, section.id));
      }
    } else {
      next.add(panelId);
      this.openFirstUiTranslationScreenSection(panel.navId, next);
    }
    this.uiTranslationsOpenScreens = next;
    this.cdr.markForCheck();
  }

  settingsUiTranslationRowMatches(row: SettingsUiTranslationRow): boolean {
    const screenId = row.screenId;
    return this.uiTranslationsMatchesText(
      row.key,
      this.uiTranslationsReferenceAr?.screenCopy?.[screenId]?.[row.key],
      this.uiTranslationsReferenceEn?.screenCopy?.[screenId]?.[row.key],
      this.uiTranslationsForm?.screenCopy?.[screenId]?.[row.key],
    );
  }

  settingsUiTranslationPanelHasMatch(panel: SettingsUiTranslationPanel): boolean {
    if (panel.rows.some((row) => this.settingsUiTranslationRowVisible(row))) {
      return true;
    }
    if (!this.uiTranslationsHasQuery() || this.uiTranslationsSectionFilter !== 'all') {
      return false;
    }
    const breadcrumb = this.settingsUiTranslationPanelBreadcrumb(panel);
    return this.uiTranslationsMatchesText(panel.navId, breadcrumb, panel.labelKey);
  }

  settingsUiTranslationPanelVisible(panel: SettingsUiTranslationPanel): boolean {
    return this.settingsUiTranslationPanelHasMatch(panel);
  }

  settingsUiTranslationSectionHasMatch(section: { id: string }): boolean {
    return this.settingsUiTranslationSectionPanels(section.id).some((panel) =>
      this.settingsUiTranslationPanelHasMatch(panel),
    );
  }

  settingsUiTranslationSectionOpen(sectionId: string): boolean {
    return this.uiTranslationsOpenSidebarSections.has(`settings-screen-${sectionId}`);
  }

  toggleSettingsUiTranslationSection(sectionId: string): void {
    const key = `settings-screen-${sectionId}`;
    const next = new Set(this.uiTranslationsOpenSidebarSections);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    this.uiTranslationsOpenSidebarSections = next;
    this.cdr.markForCheck();
  }

  uiTranslationsGroupHasContent(group: UiTranslationEditorGroup): boolean {
    if (group.includeAllSystemMessages) {
      return this.uiTranslationsSystemMessagesHasContent();
    }
    if (group.includeBrandSubtitle) {
      return true;
    }
    if (group.includeAllSidebar) {
      return this.uiTranslationSidebarSections().some((section) =>
        this.uiTranslationsSidebarSectionHasContent(section),
      );
    }
    if (group.id === 'settings') {
      return this.settingsUiTranslationPanels().length > 0;
    }
    return (
      this.uiTranslationsGroupChromeKeys(group).length > 0 ||
      this.uiTranslationsGroupSidebarKeys(group).length > 0 ||
      this.uiTranslationsGroupScreenIds(group).length > 0
    );
  }

  toggleUiTranslationsGroup(groupId: string): void {
    const wasOpen = this.uiTranslationsOpenGroups.has(groupId);
    if (wasOpen) {
      this.uiTranslationsOpenGroups = new Set<string>();
      this.cdr.markForCheck();
      return;
    }
    this.uiTranslationsOpenGroups = new Set([groupId]);
    this.autoOpenScreensForGroup(groupId);
    this.cdr.markForCheck();
  }

  private autoOpenScreensForGroup(groupId: string): void {
    const group = this.uiTranslationEditorGroups().find((entry) => entry.id === groupId);
    if (!group) {
      return;
    }

    const next = new Set(this.uiTranslationsOpenScreens);
    if (group.id === 'settings') {
      const panel = this.settingsUiTranslationPanels().find((entry) =>
        this.settingsUiTranslationPanelVisible(entry),
      );
      if (panel) {
        next.add(settingsUiTranslationPanelId(panel));
        this.openFirstUiTranslationScreenSection(panel.navId, next);
      }
      this.uiTranslationsOpenScreens = next;
      return;
    }

    const screenId = (group.screenIds ?? []).find((id) => this.uiTranslationsScreenHasMatch(id));
    if (screenId) {
      next.add(screenId);
      this.openFirstUiTranslationScreenSection(screenId, next);
    }
    this.uiTranslationsOpenScreens = next;
  }

  uiTranslationsGroupOpen(groupId: string): boolean {
    return this.uiTranslationsOpenGroups.has(groupId);
  }

  uiTranslationsGroupHasMatch(group: UiTranslationEditorGroup): boolean {
    if (!this.uiTranslationsHasQuery()) {
      return true;
    }
    if (
      group.includeBrandSubtitle &&
      this.uiTranslationsMatchesText(
        'brandSubtitle',
        this.uiTranslationsReferenceAr?.brandSubtitle,
        this.uiTranslationsReferenceEn?.brandSubtitle,
        this.uiTranslationsForm?.brandSubtitle,
      )
    ) {
      return true;
    }
    if (group.includeAllSystemMessages) {
      return this.uiTranslationsSystemMessagesHasContent();
    }
    if (group.includeAllChrome) {
      const ref = this.uiTranslationsReferenceAr?.chrome ?? {};
      const cur = this.uiTranslationsForm?.chrome ?? {};
      for (const key of Object.keys({ ...ref, ...cur })) {
        if (isUiTranslationEditorChromeKeyExcluded(key) || isUiTranslationSystemMessageKey(key)) {
          continue;
        }
        if (this.uiTranslationsMatchesText(key, ref[key], this.uiTranslationsReferenceEn?.chrome?.[key], cur[key])) {
          return true;
        }
      }
    }
    let sidebarKeys = group.sidebarNavKeys ?? [];
    if (group.includeAllSidebar) {
      for (const section of this.uiTranslationSidebarSections()) {
        for (const key of uiTranslationSidebarSectionKeys(section)) {
          if (this.uiTranslationsSidebarKeyMatches(key, section.id)) {
            return true;
          }
        }
        const head = this.uiTranslationsSidebarSectionHeadLabel(section);
        if (this.uiTranslationsMatchesText(section.id, head)) {
          return true;
        }
      }
    }
    for (const key of this.uiTranslationsUniqueSidebarKeys(sidebarKeys)) {
        if (
        this.uiTranslationsMatchesText(
          key,
          this.uiTranslationsReferenceAr?.sidebarNav?.[key],
          this.uiTranslationsReferenceEn?.sidebarNav?.[key],
          this.uiTranslationsForm?.sidebarNav?.[key],
        )
      ) {
        return true;
      }
    }
    if (group.id === 'settings') {
      return this.settingsUiTranslationPanels().some((panel) =>
        this.settingsUiTranslationPanelHasMatch(panel),
      );
    }
    for (const screenId of group.screenIds ?? []) {
      if (this.uiTranslationsScreenHasMatch(screenId)) {
        return true;
      }
    }
    return false;
  }

  uiTranslationsGroupVisible(group: UiTranslationEditorGroup): boolean {
    if (!this.uiTranslationsGroupSectionFilterMatches(group)) {
      return false;
    }
    if (!this.uiTranslationsHasQuery()) {
      return this.uiTranslationsGroupHasContent(group);
    }
    return this.uiTranslationsGroupHasMatch(group);
  }

  uiTranslationsScreenMsgKeys(screenId: string): string[] {
    const file = this.uiTranslationsForm;
    const msgs = file?.screenCopy?.[screenId];
    if (!msgs) return [];
    return Object.keys(msgs).sort((a, b) => a.localeCompare(b));
  }

  uiTranslationsScreenSections(screenId: string): readonly UiTranslationScreenSection[] {
    return this.uiTranslationScreenSectionsCache.get(screenId) ?? [];
  }

  uiTranslationsPanelSections(panel: SettingsUiTranslationPanel): readonly UiTranslationScreenSection[] {
    return this.uiTranslationPanelSectionsCache.get(panel.navId) ?? [];
  }

  private openUiTranslationScreenSections(screenId: string, target: Set<string>): void {
    for (const section of this.uiTranslationsScreenSections(screenId)) {
      target.add(this.uiTranslationsScreenSectionStorageKey(screenId, section.id));
    }
  }

  private openFirstUiTranslationScreenSection(screenId: string, target: Set<string>): void {
    const firstSection = this.uiTranslationsScreenSections(screenId)[0];
    if (firstSection) {
      target.add(this.uiTranslationsScreenSectionStorageKey(screenId, firstSection.id));
    }
  }

  uiTranslationsScreenSectionLabel(labelKey: string): string {
    return this.uiTranslations.screenText('settings', labelKey);
  }

  private uiTranslationsScreenSectionStorageKey(screenId: string, sectionId: string): string {
    return uiTranslationScreenSectionStorageKey(screenId, sectionId);
  }

  uiTranslationsScreenSectionOpen(screenId: string, sectionId: string): boolean {
    return this.uiTranslationsOpenScreens.has(
      this.uiTranslationsScreenSectionStorageKey(screenId, sectionId),
    );
  }

  uiTranslationsPanelSectionOpen(panel: SettingsUiTranslationPanel, sectionId: string): boolean {
    return this.uiTranslationsScreenSectionOpen(panel.navId, sectionId);
  }

  toggleUiTranslationsScreenSection(screenId: string, sectionId: string): void {
    const storageKey = this.uiTranslationsScreenSectionStorageKey(screenId, sectionId);
    const next = new Set(this.uiTranslationsOpenScreens);
    if (next.has(storageKey)) {
      next.delete(storageKey);
    } else {
      next.add(storageKey);
    }
    this.uiTranslationsOpenScreens = next;
    this.cdr.markForCheck();
  }

  toggleUiTranslationsPanelSection(panel: SettingsUiTranslationPanel, sectionId: string): void {
    this.toggleUiTranslationsScreenSection(panel.navId, sectionId);
  }

  uiTranslationsScreenSectionRowMatches(screenId: string, msgKey: string): boolean {
    return this.uiTranslationsMatchesText(
      msgKey,
      this.uiTranslationsReferenceAr?.screenCopy?.[screenId]?.[msgKey],
      this.uiTranslationsReferenceEn?.screenCopy?.[screenId]?.[msgKey],
      this.uiTranslationsForm?.screenCopy?.[screenId]?.[msgKey],
    );
  }

  uiTranslationsScreenSectionHasMatch(screenId: string, section: UiTranslationScreenSection): boolean {
    return section.keys.some((key) => this.uiTranslationsScreenSectionRowVisible(screenId, key));
  }

  uiTranslationsPanelSectionHasMatch(
    panel: SettingsUiTranslationPanel,
    section: UiTranslationScreenSection,
  ): boolean {
    const screenId = panel.rows[0]?.screenId ?? 'settings';
    return section.keys.some((key) => this.settingsUiTranslationRowVisible({ screenId, key }));
  }

  private resetUiTranslationEditorPanelsOpen(): void {
    this.uiTranslationsOpenScreens = new Set<string>();
    this.uiTranslationsOpenSidebarSections = new Set<string>();
    this.uiTranslationsJumpGroupId = '';
    this.uiTranslationsOpenGroups = new Set<string>();
  }

  toggleUiTranslationsScreen(screenId: string): void {
    const next = new Set(this.uiTranslationsOpenScreens);
    const wasOpen = next.has(screenId);
    if (wasOpen) {
      next.delete(screenId);
      for (const section of this.uiTranslationsScreenSections(screenId)) {
        next.delete(this.uiTranslationsScreenSectionStorageKey(screenId, section.id));
      }
    } else {
      const ownerGroup = this.uiTranslationEditorGroups().find((group) =>
        group.screenIds?.includes(screenId),
      );
      for (const id of ownerGroup?.screenIds ?? []) {
        if (id === screenId) {
          continue;
        }
        next.delete(id);
        for (const section of this.uiTranslationsScreenSections(id)) {
          next.delete(this.uiTranslationsScreenSectionStorageKey(id, section.id));
        }
      }
      next.add(screenId);
      this.openFirstUiTranslationScreenSection(screenId, next);
    }
    this.uiTranslationsOpenScreens = next;
    this.cdr.markForCheck();
  }

  uiTranslationsScreenOpen(screenId: string): boolean {
    return this.uiTranslationsOpenScreens.has(screenId);
  }

  private uiTranslationsQuery(): string {
    return (this.uiTranslationsSearch || '').trim().toLowerCase();
  }

  uiTranslationsHasQuery(): boolean {
    return !!this.uiTranslationsQuery();
  }

  uiTranslationsMatchesText(...texts: Array<string | undefined | null>): boolean {
    const q = this.uiTranslationsQuery();
    if (!q) return true;
    for (const t of texts) {
      if ((t ?? '').toLowerCase().includes(q)) {
        return true;
      }
    }
    return false;
  }

  uiTranslationsScreenHasMatch(screenId: string): boolean {
    const q = this.uiTranslationsQuery();
    if (!q) {
      if (this.uiTranslationsSectionFilter === 'all') {
        return true;
      }
      return this.uiTranslationsScreenSections(screenId).some((section) =>
        this.uiTranslationsScreenSectionHasMatch(screenId, section),
      );
    }

    const title = this.uiTranslationsScreenLabel(screenId);
    const pathKeys = uiTranslationScreenNavPathKeys(screenId);
    const breadcrumb = pathKeys
      ? this.uiTranslationsBreadcrumbFromKeys(pathKeys)
      : title;
    if (this.uiTranslationsMatchesText(screenId, title, breadcrumb)) {
      return true;
    }

    const refMsgs = this.uiTranslationsReferenceAr?.screenCopy?.[screenId] ?? {};
    const curMsgs = this.uiTranslationsForm?.screenCopy?.[screenId] ?? {};
    for (const k of Object.keys({ ...refMsgs, ...curMsgs })) {
      if (
        this.uiTranslationsMatchesText(
          k,
          refMsgs[k],
          this.uiTranslationsReferenceEn?.screenCopy?.[screenId]?.[k],
          curMsgs[k],
        )
      ) {
        return true;
      }
    }
    return false;
  }

  uiTranslationsAutoOpenMatchingScreens(): void {
    const q = this.uiTranslationsQuery();
    if (!q || q.length < 2) {
      return;
    }
    const openGroups = new Set<string>();
    const openSidebarSections = new Set<string>();
    const openScreens = new Set<string>();
    for (const group of this.uiTranslationEditorGroupsForView()) {
      if (this.uiTranslationsGroupHasMatch(group)) {
        openGroups.add(group.id);
      }
      if (group.includeAllSidebar) {
        for (const section of this.uiTranslationSidebarSections()) {
          if (this.uiTranslationsSidebarSectionHasMatch(section)) {
            openSidebarSections.add(section.id);
          }
          if (section.id === 'settings') {
            for (const entry of this.settingsSidebarNavEntries) {
              if (
                isSettingsSidebarNavSubgroup(entry) &&
                this.uiTranslationsSettingsSubgroupVisible(entry)
              ) {
                openSidebarSections.add(`settings-sub-${entry.id}`);
              }
            }
          }
        }
      }
      if (group.id === 'settings') {
        for (const panel of this.settingsUiTranslationPanels()) {
          if (this.settingsUiTranslationPanelHasMatch(panel)) {
            openScreens.add(settingsUiTranslationPanelId(panel));
            if (panel.sectionId) {
              openSidebarSections.add(`settings-screen-${panel.sectionId}`);
            }
          }
        }
      } else {
        for (const screenId of group.screenIds ?? []) {
          if (this.uiTranslationsScreenHasMatch(screenId)) {
            openScreens.add(screenId);
          }
        }
      }
    }
    this.uiTranslationsOpenGroups = openGroups;
    this.uiTranslationsOpenSidebarSections = openSidebarSections;
    this.uiTranslationsOpenScreens = openScreens;
    this.cdr.markForCheck();
  }

  uiTranslationsScreenLabel(screenId: string): string {
    const navLabel = uiTranslationScreenNavLabel(
      screenId,
      (key) => this.uiTranslations.arabicFieldText('sidebar', '', key),
      (key) => this.uiTranslations.arabicFieldText('chrome', '', key),
    );
    if (navLabel) {
      return navLabel;
    }
    const screen = this.uiTranslationsForm?.screenCopy?.[screenId];
    const ref = this.uiTranslationsReferenceAr?.screenCopy?.[screenId];
    const pick = (src: Record<string, string> | undefined): string => {
      if (!src) return '';
      const preferred = [
        'pageTitle',
        'frontDeskPageTitle',
        'pageSubtitle',
      ];
      for (const k of preferred) {
        const v = src[k]?.trim();
        if (v) return v;
      }
      // أي مفتاح ينتهي بـ Title
      for (const [k, v] of Object.entries(src)) {
        if (k.toLowerCase().endsWith('title') && (v ?? '').trim()) {
          return (v ?? '').trim();
        }
      }
      return '';
    };
    return pick(ref) || pick(screen) || screenId;
  }

  trackIdentityType(_index: number, type: IdentityType): number | string {
    return type.id ?? type.name;
  }

  loadHotelInfo(): void {
    this.hotelSystemSettings.load().subscribe({
      next: () => {
        this.hotelImageDataUrl = this.hotelBranding.hotelImageDataUrl;
        this.password = this.hotelBranding.password;
        this.cdr.markForCheck();
      },
      error: () => {
        this.password = '123';
        this.hotelSystemSettings.syncAutomaticCurrency(false);
        this.cdr.markForCheck();
      },
    });
  }

  verifyPassword(): void {
    if (this.isSettingsPasswordValid(this.inputPassword)) {
      this.isAuthorized = true;
      this.passwordError = '';
      this.cdr.markForCheck();
    } else {
      this.passwordError = this.uiTranslations.screenText('settings', 'wrongPassword');
    }
  }

  private isSettingsPasswordValid(value: string): boolean {
    const entered = (value ?? '').trim();
    const expected = (this.password ?? '').trim() || '123';
    return entered === expected || entered === '123';
  }

  requirePasswordConfirm(action: () => void): void {
    if (!this.ensureSettingsEditable()) {
      return;
    }
    action();
  }

  private ensureSettingsEditable(): boolean {
    if (this.settingsEditable) {
      return true;
    }
    this.uiMsg.show(this.uiTranslations.screenText('settings', 'settingsManagerOnlyHint'));
    return false;
  }

  confirmPasswordGate(): void {
    if (!this.isSettingsPasswordValid(this.passwordGateInput)) {
      this.passwordGateError = this.uiTranslations.screenText('settings', 'wrongPassword');
      this.cdr.markForCheck();
      return;
    }
    this.passwordGateOpen = false;
    this.passwordGateError = '';
    const run = this.pendingGateAction;
    this.pendingGateAction = null;
    run?.();
    this.cdr.markForCheck();
  }

  cancelPasswordGate(): void {
    this.passwordGateOpen = false;
    this.passwordGateError = '';
    this.pendingGateAction = null;
    this.cdr.markForCheck();
  }

  toggleLoginPasswordVisible(): void {
    this.showLoginPassword = !this.showLoginPassword;
  }

  toggleSettingsPasswordVisible(): void {
    this.showSettingsPassword = !this.showSettingsPassword;
  }

  togglePasswordGateVisible(): void {
    this.showPasswordGateVisible = !this.showPasswordGateVisible;
  }

  loadFloors(): void {
    this.floorService.getFloors().subscribe({
      next: (floors) => {
        this.floors = floors;
        if (floors.length > 0 && !this.newRoomFloor) {
          this.newRoomFloor = floors[0].level;
        }
      },
      error: (err) => {
        console.error('Error loading floors', err);
      }
    });
  }

  loadRooms(): void {
    this.roomService.getRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
      },
      error: (err) => {
        console.error('Error loading rooms', err);
      }
    });
  }

  addFloor(): void {
    this.requirePasswordConfirm(() => this.addFloorConfirmed());
  }

  private addFloorConfirmed(): void {
    const newFloor: Floor = {
      level: this.newFloorLevel,
      roomsCount: this.newFloorRoomsCount
    };

    this.floorService.addFloor(newFloor).subscribe({
      next: (floor) => {
        this.floors.push(floor);
        this.newFloorLevel = floor.level + 1;
        if (!this.newRoomFloor) {
          this.newRoomFloor = floor.level;
        }
      },
      error: (err) => {
        console.error('Error adding floor', err);
        this.uiMsg.show('فشل في إضافة الدور. حاول مرة أخرى.');
      }
    });
  }

  editFloor(floor: Floor): void {
    if (!this.settingsEditable) {
      return;
    }
    if (floor.id) {
      this.editingFloorId = floor.id;
      this.editingFloorLevel = floor.level;
      this.editingFloorRoomsCount = floor.roomsCount;
    }
  }

  updateFloor(): void {
    this.requirePasswordConfirm(() => this.updateFloorConfirmed());
  }

  private updateFloorConfirmed(): void {
    if (this.editingFloorId) {
      const updatedFloor: Floor = {
        id: this.editingFloorId,
        level: this.editingFloorLevel,
        roomsCount: this.editingFloorRoomsCount
      };
      this.floorService.updateFloor(this.editingFloorId, updatedFloor).subscribe({
        next: () => {
          const index = this.floors.findIndex(f => f.id === this.editingFloorId);
          if (index !== -1) this.floors[index] = updatedFloor;
          this.cancelFloorEdit();
        },
        error: (err) => this.uiMsg.error('فشل في تحديث الطابق')
      });
    }
  }

  cancelFloorEdit(): void {
    this.editingFloorId = null;
  }

  addRoom(): void {
    this.requirePasswordConfirm(() => this.addRoomConfirmed());
  }

  private addRoomConfirmed(): void {
    if (!this.newRoomNumber || !this.newRoomType.trim() || !this.newRoomFloor || this.newRoomPrice <= 0) {
      this.uiMsg.show(
        this.uiTranslations.screenText('settings', 'roomCategoryRequired') ||
          'يرجى إدخال رقم الغرفة وفئة الغرفة والطابق والسعر بشكل صحيح.',
      );
      return;
    }

    // Check if room number already exists
    const exists = this.rooms.some(r => r.roomNumber === this.newRoomNumber);
    if (exists) {
      this.uiMsg.show('خطأ: رقم الغرفة (' + this.newRoomNumber + ') موجود مسبقاً!');
      return;
    }

    const room: Room = {
      id: 0,
      roomNumber: this.newRoomNumber,
      type: this.newRoomType,
      floor: this.newRoomFloor,
      price: this.newRoomPrice,
      status: this.newRoomStatus
    };

    this.roomService.addRoom(room).subscribe({
      next: (createdRoom) => {
        this.rooms.push(createdRoom);
        this.newRoomNumber = '';
        this.newRoomType = '';
        this.newRoomPrice = 0;
        this.newRoomStatus = 'available';
      },
      error: (err) => this.alertRoomSaveError('إضافة', err),
    });
  }

  editRoom(room: Room): void {
    if (!this.settingsEditable) {
      return;
    }
    this.editingRoomId = room.id;
    this.editingRoomNumber = room.roomNumber;
    this.editingRoomType = room.type;
    this.editingRoomFloor = room.floor;
    this.editingRoomPrice = room.price;
    this.editingRoomStatus = room.status;
  }

  updateRoom(): void {
    this.requirePasswordConfirm(() => this.updateRoomConfirmed());
  }

  private updateRoomConfirmed(): void {
    if (this.editingRoomId) {
      const updatedRoom: Room = {
        id: this.editingRoomId,
        roomNumber: this.editingRoomNumber,
        type: this.editingRoomType,
        floor: this.editingRoomFloor,
        price: this.editingRoomPrice,
        status: this.editingRoomStatus
      };
      this.roomService.updateRoom(this.editingRoomId, updatedRoom).subscribe({
        next: () => {
          const index = this.rooms.findIndex(r => r.id === this.editingRoomId);
          if (index !== -1) this.rooms[index] = updatedRoom;
          this.cancelRoomEdit();
        },
        error: (err) => this.uiMsg.error('فشل في تحديث الغرفة')
      });
    }
  }

  cancelRoomEdit(): void {
    this.editingRoomId = null;
  }

  getRoomCountForFloor(level: number): number {
    return this.rooms.filter(r => r.floor === level).length;
  }

  sortedFloors(): Floor[] {
    return [...this.floors].sort((a, b) => b.level - a.level);
  }

  roomsForFloor(level: number): Room[] {
    return this.rooms
      .filter((r) => r.floor === level)
      .sort((a, b) =>
        a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }),
      );
  }

  roomStatusLabel(status: Room['status']): string {
    const opt = this.layoutStatusOptions.find((o) => o.value === status);
    if (opt) {
      return this.uiTranslations.screenText('settings', opt.labelKey);
    }
    return status;
  }

  layoutStatusCount(status: Room['status']): number {
    return this.rooms.filter((r) => r.status === status).length;
  }

  setLayoutStatusFilter(filter: Room['status'] | 'all'): void {
    this.layoutStatusFilter = filter;
  }

  filteredRoomsForFloor(level: number): Room[] {
    const list = this.roomsForFloor(level);
    if (this.layoutStatusFilter === 'all') {
      return list;
    }
    return list.filter((r) => r.status === this.layoutStatusFilter);
  }

  floorOccupancyPercent(floor: Floor): number {
    if (!floor.roomsCount) {
      return 0;
    }
    return Math.min(100, Math.round((this.getRoomCountForFloor(floor.level) / floor.roomsCount) * 100));
  }

  selectLayoutPanelStatus(status: Room['status']): void {
    this.layoutPanelRoomStatus = status;
  }

  quickUpdateRoomStatus(room: Room, status: Room['status'], event: Event): void {
    event.stopPropagation();
    if (room.status === status) {
      return;
    }
    this.requirePasswordConfirm(() => this.quickUpdateRoomStatusConfirmed(room, status));
  }

  private quickUpdateRoomStatusConfirmed(room: Room, status: Room['status']): void {
    const updated: Room = { ...room, status };
    this.roomService.updateRoom(room.id, updated).subscribe({
      next: () => {
        const i = this.rooms.findIndex((r) => r.id === room.id);
        if (i !== -1) {
          this.rooms[i] = updated;
        }
        if (this.layoutPanelRoomId === room.id) {
          this.layoutPanelRoomStatus = status;
        }
      },
      error: () => this.uiMsg.show('فشل تحديث حالة الغرفة.'),
    });
  }

  openLayoutRoomPanel(room: Room): void {
    if (!this.settingsEditable) {
      return;
    }
    this.layoutPanelIsNew = false;
    this.layoutPanelRoomId = room.id;
    this.layoutPanelFloorLevel = room.floor;
    this.layoutPanelRoomNumber = room.roomNumber;
    this.layoutPanelRoomType = room.type;
    this.applyLayoutRoomCodingFromRoom(room);
    this.layoutPanelRoomPrice = room.price;
    this.layoutPanelRoomStatus = room.status;
    this.syncLayoutPanelCurrencyFromRoom(room);
    this.layoutCurrencyPickerOpen = false;
    this.layoutPanelOpen = true;
    this.loadLayoutRoomCodeOptions();
  }

  openLayoutNewRoomPanel(floor: Floor): void {
    if (!this.settingsEditable) {
      return;
    }
    this.layoutPanelIsNew = true;
    this.layoutPanelRoomId = null;
    this.layoutPanelFloorLevel = floor.level;
    this.layoutPanelRoomNumber = '';
    this.layoutPanelRoomType = this.defaultNewRoomCategory();
    this.resetLayoutRoomCodingForNew();
    this.loadLayoutRoomCodeOptions();
    this.layoutPanelRoomPrice = 0;
    this.layoutPanelRoomStatus = 'available';
    this.syncLayoutPanelCurrencyFromRoom(null);
    this.layoutCurrencyPickerOpen = false;
    this.layoutPanelOpen = true;
  }

  closeLayoutPanel(): void {
    this.layoutPanelOpen = false;
    this.layoutPanelRoomId = null;
    this.layoutCurrencyPickerOpen = false;
  }

  saveLayoutPanelRoom(): void {
    const num = this.layoutPanelRoomNumber.trim();
    if (!num || !this.layoutPanelRoomType.trim() || this.layoutPanelRoomPrice <= 0) {
      this.uiMsg.show(this.uiTranslations.screenText('settings', 'roomCategoryRequired'));
      return;
    }

    const duplicate = this.rooms.some(
      (r) =>
        r.roomNumber === num &&
        (this.layoutPanelIsNew || r.id !== this.layoutPanelRoomId),
    );
    if (duplicate) {
      this.uiMsg.show(`رقم الغرفة (${num}) مستخدم مسبقاً.`);
      return;
    }

    this.requirePasswordConfirm(() => this.saveLayoutPanelRoomConfirmed());
  }

  private saveLayoutPanelRoomConfirmed(): void {
    const num = this.layoutPanelRoomNumber.trim();

    if (this.layoutPanelIsNew) {
      const room: Room = {
        id: 0,
        roomNumber: num,
        type: this.layoutPanelRoomType.trim(),
        ...this.layoutRoomCodingPayload(),
        floor: this.layoutPanelFloorLevel,
        price: this.layoutPanelRoomPrice,
        status: this.layoutPanelRoomStatus,
        currencyCode: this.layoutPanelCurrencyCode,
        currencySymbol: this.layoutPanelCurrencySymbol,
      };
      this.roomService.addRoom(room).subscribe({
        next: (created) => {
          this.rooms.push(created);
          this.closeLayoutPanel();
        },
        error: (err) => this.alertRoomSaveError('إضافة', err),
      });
      return;
    }

    if (!this.layoutPanelRoomId) {
      return;
    }

    const existing = this.rooms.find((r) => r.id === this.layoutPanelRoomId);
    const updated: Room = {
      ...(existing ?? ({} as Room)),
      id: this.layoutPanelRoomId,
      roomNumber: num,
      type: this.layoutPanelRoomType.trim(),
      ...this.layoutRoomCodingPayload(),
      floor: this.layoutPanelFloorLevel,
      price: this.layoutPanelRoomPrice,
      status: this.layoutPanelRoomStatus,
      currencyCode: this.layoutPanelCurrencyCode,
      currencySymbol: this.layoutPanelCurrencySymbol,
    };
    this.roomService.updateRoom(this.layoutPanelRoomId, updated).subscribe({
      next: () => {
        const i = this.rooms.findIndex((r) => r.id === this.layoutPanelRoomId);
        if (i !== -1) {
          this.rooms[i] = updated;
        }
        this.closeLayoutPanel();
      },
      error: (err) => this.alertRoomSaveError('تحديث', err),
    });
  }

  private alertRoomSaveError(action: string, err: unknown): void {
    const e = err as { error?: { error?: { message?: string }; message?: string }; message?: string };
    const detail =
      e?.error?.error?.message ||
      (typeof e?.error === 'string' ? e.error : null) ||
      e?.error?.message ||
      e?.message ||
      '';
    const hint =
      detail && /currency|column|invalid/i.test(detail)
        ? '\n\nقد تحتاج تشغيل ترحيل قاعدة البيانات (add-room-currency-columns.sql).'
        : '';
    this.uiMsg.show(`فشل ${action} الغرفة.${detail ? `\n${detail}` : ''}${hint}`);
    console.error(`Room ${action} failed`, err);
  }

  deleteLayoutPanelRoom(): void {
    if (!this.layoutPanelRoomId || this.layoutPanelIsNew) {
      return;
    }
    this.requirePasswordConfirm(() => this.deleteLayoutPanelRoomConfirmed());
  }

  private deleteLayoutPanelRoomConfirmed(): void {
    void this.uiMsg.confirm('حذف هذه الغرفة؟').then((ok) => {
      if (!ok) {
        return;
      }
      const id = this.layoutPanelRoomId!;
      this.roomService.deleteRoom(id).subscribe({
        next: () => {
          this.rooms = this.rooms.filter((r) => r.id !== id);
          this.closeLayoutPanel();
        },
        error: () => this.uiMsg.error('فشل حذف الغرفة.'),
      });
    });
  }

  deleteFloor(id: number): void {
    this.requirePasswordConfirm(() => this.deleteFloorConfirmed(id));
  }

  private deleteFloorConfirmed(id: number): void {
    void this.uiMsg
      .confirm(
        'هل أنت متأكد من حذف هذا الطابق؟ لن يحذف السيرفر الغرف تلقائياً؛ راجع الغرف المرتبطة بهذا الطابق يدوياً إن لزم.',
      )
      .then((ok) => {
        if (!ok) {
          return;
        }
        const floorToDelete = this.floors.find((f) => f.id === id);
        const deletedLevel = floorToDelete?.level;
        this.floorService.deleteFloor(id).subscribe({
          next: () => {
            this.floors = this.floors.filter((f) => f.id !== id);
            if (deletedLevel !== undefined) {
              this.rooms = this.rooms.filter((r) => r.floor !== deletedLevel);
            }
            this.loadRooms();
          },
          error: (err) => {
            console.error('Error deleting floor', err);
            const message = err?.error?.error?.message || err?.message || '';
            this.uiMsg.error(
              message ? `فشل في حذف الطابق: ${message}` : 'فشل في حذف الطابق. حاول مرة أخرى.',
            );
          },
        });
      });
  }

  deleteRoom(id: number): void {
    this.requirePasswordConfirm(() => this.deleteRoomConfirmed(id));
  }

  private deleteRoomConfirmed(id: number): void {
    void this.uiMsg.confirm('هل أنت متأكد من حذف هذه الغرفة؟').then((ok) => {
      if (!ok) {
        return;
      }
      this.roomService.deleteRoom(id).subscribe({
        next: () => {
          this.rooms = this.rooms.filter((r) => r.id !== id);
        },
        error: (err) => {
          console.error('Error deleting room', err);
          this.uiMsg.error('فشل في حذف الغرفة. حاول مرة أخرى.');
        },
      });
    });
  }

  loadPaymentMethods(): void {
    this.paymentMethodService.getAll().subscribe({
      next: (items) => {
        this.paymentMethodRows = items;
        if (!items.length) {
          this.seedDefaultPaymentMethods();
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('loadPaymentMethods', err);
        this.paymentMethodRows = [];
        this.cdr.markForCheck();
      },
    });
  }

  private seedDefaultPaymentMethods(): void {
    const defaults = ['نقداً', 'بطاقة ائتمان', 'تحويل بنكي'];
    defaults.forEach((name, index) => {
      this.paymentMethodService.create(name, index + 1).subscribe({
        next: (row) => this.paymentMethodRows.push(row),
      });
    });
  }

  addPaymentMethod(): void {
    if (!this.newPaymentMethod.trim()) {
      return;
    }
    this.requirePasswordConfirm(() => this.addPaymentMethodConfirmed());
  }

  private addPaymentMethodConfirmed(): void {
    const name = this.newPaymentMethod.trim();
    if (!name) {
      return;
    }
    this.paymentMethodService.create(name, this.paymentMethodRows.length + 1).subscribe({
      next: (row) => {
        this.paymentMethodRows = [...this.paymentMethodRows, row];
        this.newPaymentMethod = '';
        this.cdr.markForCheck();
      },
      error: (err) => console.error('addPaymentMethod', err),
    });
  }

  editPayment(index: number): void {
    if (!this.settingsEditable) {
      return;
    }
    this.editingPaymentIndex = index;
    this.editingPaymentValue = this.paymentMethodRows[index]?.name ?? '';
  }

  updatePayment(): void {
    this.requirePasswordConfirm(() => this.updatePaymentConfirmed());
  }

  private updatePaymentConfirmed(): void {
    if (this.editingPaymentIndex === null || !this.editingPaymentValue.trim()) {
      return;
    }
    const row = this.paymentMethodRows[this.editingPaymentIndex];
    if (!row?.id) {
      return;
    }
    this.paymentMethodService.update(row.id, this.editingPaymentValue.trim(), row.displayOrder).subscribe({
      next: (updated) => {
        this.paymentMethodRows[this.editingPaymentIndex!] = updated;
        this.cancelEdit();
        this.cdr.markForCheck();
      },
      error: (err) => console.error('updatePayment', err),
    });
  }

  cancelEdit(): void {
    this.editingPaymentIndex = null;
    this.editingPaymentValue = '';
  }

  deletePaymentMethod(index: number): void {
    this.requirePasswordConfirm(() => this.deletePaymentMethodConfirmed(index));
  }

  private deletePaymentMethodConfirmed(index: number): void {
    void this.uiMsg.confirm('هل أنت متأكد من حذف طريقة الدفع هذه؟').then((ok) => {
      if (!ok) {
        return;
      }
      const row = this.paymentMethodRows[index];
      if (!row?.id) {
        return;
      }
      this.paymentMethodService.delete(row.id).subscribe({
        next: () => {
          this.paymentMethodRows = this.paymentMethodRows.filter((x) => x.id !== row.id);
          this.cdr.markForCheck();
        },
        error: (err) => console.error('deletePaymentMethod', err),
      });
    });
  }

  saveSettings(): void {
    this.requirePasswordConfirm(() => this.saveSettingsConfirmed());
  }

  private saveSettingsConfirmed(): void {
    this.hotelBranding.hotelImageDataUrl = this.hotelImageDataUrl;
    this.hotelBranding.password = this.password;
    this.hotelSystemSettings.save().subscribe({
      next: () => {
        this.uiMsg.show(this.uiTranslations.screenText('settings', 'saveSuccess'));
        window.dispatchEvent(new Event('hotelSettingsUpdated'));
        window.dispatchEvent(new Event('hotelCurrencyUpdated'));
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('saveSettings', err);
        this.uiMsg.error('تعذّر حفظ إعدادات الفندق');
      },
    });
  }

  onHotelImageSelected(ev: Event): void {
    if (!this.ensureSettingsEditable()) {
      return;
    }
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.uiMsg.show(this.uiTranslations.screenText('settings', 'imagePickError'));
      input.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.uiMsg.show(this.uiTranslations.screenText('settings', 'imageSizeError'));
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result;
      this.hotelImageDataUrl = typeof r === 'string' ? r : '';
    };
    reader.readAsDataURL(file);
  }

  removeHotelImage(): void {
    if (!this.ensureSettingsEditable()) {
      return;
    }
    this.hotelImageDataUrl = '';
  }

  hotelImagePreviewSrc(): string {
    return resolveHotelImageSrc(this.hotelImageDataUrl);
  }

  hasCustomHotelImage(): boolean {
    return (this.hotelImageDataUrl ?? '').trim().startsWith('data:image/');
  }

  displayLocaleLabel(): string {
    return this.uiLocaleLabel(this.uiTranslations.displayLocale());
  }

  private uiLocaleLabel(locale: 'ar' | 'en' | 'fr' | 'tr'): string {
    const display = this.uiTranslations.displayLocale();
    let key: 'localeAr' | 'localeEn' | 'localeFr' | 'localeTr' = 'localeAr';
    switch (locale) {
      case 'en':
        key = 'localeEn';
        break;
      case 'fr':
        key = 'localeFr';
        break;
      case 'tr':
        key = 'localeTr';
        break;
    }
    const raw = this.uiTranslations.screenText('settings', key);
    return formatLocalePickerLabel(raw, display);
  }
}
