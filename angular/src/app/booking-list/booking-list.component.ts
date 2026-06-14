import { ChangeDetectorRef, Component, DestroyRef, ElementRef, HostListener, inject, AfterViewInit, OnInit } from '@angular/core';
import { UiInlineTextComponent } from '../shared/ui-inline-text/ui-inline-text.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, fromEvent, merge, of, Subscription } from 'rxjs';
import { catchError, filter, throttleTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BookingService } from '../services/booking.service';
import { RoomService } from '../services/room.service';
import { Booking } from '../models/booking.model';
import { Room } from '../models/room.model';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { toDateOnlyString, todayLocalDateString } from '../utils/date-only';
import {
  bookingCheckInYmd,
  bookingCheckOutYmd,
  checkoutCountdownText as formatCheckoutCountdown,
  formatPmsMoney,
  formatSlashDate,
  pmsCardCountdownLabelKey,
  pmsCardCountdownText,
  isBookingActive,
  isBookingArriving,
  isBookingReserved,
  isExpiredReservedWithoutCheckIn,
  isBookingCurrentlyStaying,
  isBookingDepartingWithinWindow,
  isStayPeriodEnded,
  bookingsForGuestsWithMultipleActive,
  groupBookingsByGuestIdentity,
  type MultiBookingGuestGroup,
} from '../utils/booking-display.util';
import { bookingConfirmMeta } from '../utils/booking-meta.options';
import { UiTranslationsService } from '../services/ui-translations.service';
import { UiMessageService } from '../services/ui-message.service';
import { bindUiTranslationRefresh } from '../utils/ui-screen-i18n.helper';
import { HotelCurrencyService } from '../services/hotel-currency.service';
import { HotelBrandingStoreService } from '../services/hotel-branding-store.service';
import { bookingCurrencySymbol } from '../utils/booking-currency';
import { PmsBookingCardComponent } from '../shared/pms-booking-card/pms-booking-card.component';
import { LocaleNumberPipe } from '../shared/pipes/locale-number.pipe';
import {
  ADD_GUEST_BOOKING_STORAGE_KEY,
  CHECKIN_BOOKING_STORAGE_KEY,
} from '../booking-form/booking-form.component';
import { mapBookingFromApi } from '../utils/booking-api-map.util';
import {
  getTransferHintForBooking,
  readRecentRoomTransfers,
  ROOM_TRANSFERS_CHANGED_EVENT,
  type RecentRoomTransfer,
} from '../utils/room-transfer-display.util';
import { bookingNotifyParams } from '../utils/booking-notify-params.util';
import {
  DEV_COLORED_OUTLINES_STORAGE_KEY,
  DEV_OUTLINES_CHANGED_EVENT,
  DASHBOARD_VIEW_MODE_CHANGED_EVENT,
  DASHBOARD_VIEW_MODE_STORAGE_KEY,
  readBookingsCardLayoutEnabled,
} from '../utils/dev-outlines';
import {
  GeneralCodesService,
  type GeneralCodeItem,
} from '../general-codes/general-codes.service';
import {
  roomLocationFilterValues,
  sortGeneralCodeItems,
  storedGeneralCodeValueMatches,
} from '../utils/general-code-item.util';
import {
  createScrollChromeCompactState,
  readMaxScrollTop,
  resetScrollChromeCompactState,
  updateScrollChromeCompact,
} from '../utils/scroll-chrome-hide.util';

export interface BookingTransferDisplayRow {
  transfer: RecentRoomTransfer;
  booking?: Booking;
}

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PmsBookingCardComponent, LocaleNumberPipe, UiInlineTextComponent],
  templateUrl: './booking-list.component.html',
  styleUrls: ['./booking-list.component.css', '../rooms/rooms.component.css'],
})
export class BookingListComponent implements OnInit, AfterViewInit {
  readonly ui = inject(UiTranslationsService);
  private readonly uiMsg = inject(UiMessageService);
  readonly hotelBranding = inject(HotelBrandingStoreService);
  readonly hotelCurrency = inject(HotelCurrencyService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly hostEl = inject(ElementRef<HTMLElement>);

  bookings: Booking[] = [];
  private roomsByNumber = new Map<string, Room>();
  searchTerm: string = '';
  pmsFilterRoomLocation = '';
  roomLocationOptions: GeneralCodeItem[] = [];
  filterDate: string = '';
  loading = true;
  error = '';
  expandedBookingId: number | null = null;

  /** نافذة منبثقة لعرض تفاصيل النزيل (وضع البطاقات) */
  guestDetailModalBooking: Booking | null = null;

  /** نافذة ترحيل المبلغ */
  transferAmountModalBooking: Booking | null = null;
  transferAmountInput = '';
  transferAmountBusy = false;

  /** مغادرة مع تسوية مبلغ متبقٍ (المقيمون / المكاتب الأمامية) */
  departCheckoutModalBooking: Booking | null = null;
  departCheckoutPayInput = '';
  departCheckoutBusy = false;
  /** initiate = نقل إلى المغادرين | final = تسجيل خروج نهائي */
  private departFlowIntent: 'initiate' | 'final' = 'final';

  private readonly transferRoomStorageKey = 'hotelTransferRoomBooking';
  private readonly editBookingStorageKey = 'hotelEditBooking';

  /** واجهة بطاقات سجلات الحجز: خيارات المطوّر في الشريط أو «العرض المطوّر» في لوحة التحكم */
  bookingsCardLayout = false;

  /** حجم عرض بطاقات الحجز (٪) — نفس منزلق مخطط الغرف */
  pmsCardLayoutScale = 70;

  private readonly pmsCardScaleStorageKey = 'hotelBookingsPmsCardScale';

  /** شريط تبويبات جانبي (مثل «حالات العرض» في مخطط الغرف) */
  bookingsStatusRailOpen = true;

  private readonly bookingsRailStorageKey = 'hotelBookingsDevStatusRailOpen';

  /** لوحة بحث لاصقة قابلة للطي */
  bookingsFilterToolbarOpen = true;

  private readonly bookingsFilterStorageKey = 'hotelBookingsDevFilterToolbarOpen';

  /** الشريط العلوي — يُصغَّر إلى زر بحث عند التمرير، ويُفتح بالنقر */
  pmsTopChromeCompact = false;
  pmsTopChromePanelOpen = false;

  private pmsChromeScrollSub: Subscription | null = null;
  private readonly pmsTopChromeScrollState = createScrollChromeCompactState();

  /** تبويبات واجهة البطاقات — الافتراضي: الغرف المحجوزة */
  pmsTab: 'departing' | 'staying' | 'arriving' | 'multi' | 'unconfirmed' | 'transferred' | 'bookings' = 'staying';

  /** تبويبات صفحة سجلات الحجز (الحجوزات) — شريط أفقي */
  readonly bookingsHubTabs = [
    'arriving',
    'departing',
    'staying',
    'bookings',
    'unconfirmed',
    'multi',
  ] as const;

  bookingsHubViewMode: 'grid' | 'list' = 'grid';
  bookingsHubScopeFilter: '' | 'confirmed' | 'unconfirmed' = '';
  private readonly bookingsHubSelectedIds = new Set<number>();

  /** عند التنقل من القائمة: ?view=pms | ?view=records */
  private bookingsViewOverride: 'pms' | 'records' | null = null;

  /** آخر عمليات نقل الغرف */
  recentRoomTransfers: RecentRoomTransfer[] = [];

  constructor(
    private bookingService: BookingService,
    private roomService: RoomService,
    private generalCodesService: GeneralCodesService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.destroyRef.onDestroy(() => {
      this.pmsChromeScrollSub?.unsubscribe();
      this.pmsChromeScrollSub = null;
    });
    this.restorePmsCardScale();
    this.restoreBookingsRailPreference();
    this.restoreBookingsFilterPreference();
    this.wireBookingsLayoutSync();
    this.wireBookingsViewFromRoute();
    this.wirePmsTabFromRoute();
    this.wireRoomTransfersRefresh();
    this.refreshRoomTransfers();
    this.fetchBookings();
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => this.wirePmsTopChromeScrollHide());
  }

  private wirePmsTopChromeScrollHide(): void {
    this.pmsChromeScrollSub?.unsubscribe();
    this.pmsChromeScrollSub = null;

    if (!this.bookingsCardLayout) {
      if (resetScrollChromeCompactState(this.pmsTopChromeScrollState)) {
        this.pmsTopChromeCompact = false;
        this.pmsTopChromePanelOpen = false;
        this.cdr.markForCheck();
      }
      return;
    }

    const host = this.hostEl.nativeElement;
    const targets = new Set<HTMLElement>();
    const appContentEl = host.closest('.app-content') as HTMLElement | null;
    if (appContentEl) {
      targets.add(appContentEl);
    }
    const mainEl = host.querySelector('.rooms-dev-main') as HTMLElement | null;
    if (mainEl) {
      targets.add(mainEl);
    }

    const windowScroll$ = fromEvent(window, 'scroll', { passive: true });
    const targetScroll$ =
      targets.size > 0
        ? merge(...[...targets].map((el) => fromEvent(el, 'scroll', { passive: true })))
        : null;

    const onScroll = () => {
      updateScrollChromeCompact(
        this.pmsTopChromeScrollState,
        readMaxScrollTop(host),
        (compact) => {
          if (this.pmsTopChromeCompact !== compact) {
            this.pmsTopChromeCompact = compact;
            if (compact) {
              this.pmsTopChromePanelOpen = false;
            }
            this.cdr.markForCheck();
          }
        },
      );
    };

    onScroll();
    this.pmsChromeScrollSub = (targetScroll$ ? merge(windowScroll$, targetScroll$) : windowScroll$)
      .pipe(throttleTime(80))
      .subscribe(() => onScroll());
  }

  get showPmsTopChromePanel(): boolean {
    return !this.pmsTopChromeCompact || this.pmsTopChromePanelOpen;
  }

  get showPmsTopChromePill(): boolean {
    return this.pmsTopChromeCompact && !this.pmsTopChromePanelOpen;
  }

  get pmsTopChromePillLabel(): string {
    if (this.searchTerm.trim()) {
      return this.searchTerm.trim();
    }
    if (this.pmsFiltersActive) {
      return this.ui.screenText('rooms', 'filterActivePill');
    }
    return this.ui.screenText('bookings', 'pmsSearchPh');
  }

  openPmsTopChromePanel(): void {
    this.pmsTopChromePanelOpen = true;
    this.cdr.markForCheck();
    queueMicrotask(() => {
      const input = this.hostEl.nativeElement.querySelector(
        this.showBookingsHubChrome() ? '.bh-search-input' : '#bookings-top-chrome-search',
      ) as HTMLInputElement | null;
      input?.focus();
    });
  }

  closePmsTopChromePanel(): void {
    this.pmsTopChromePanelOpen = false;
    this.cdr.markForCheck();
  }

  private wireRoomTransfersRefresh(): void {
    fromEvent(window, ROOM_TRANSFERS_CHANGED_EVENT)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.refreshRoomTransfers();
        this.cdr.markForCheck();
      });
    fromEvent(window, 'focus')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refreshRoomTransfers());
  }

  private refreshRoomTransfers(): void {
    this.recentRoomTransfers = readRecentRoomTransfers();
  }

  private wirePmsTabFromRoute(): void {
    this.applyPmsTabQuery(this.route.snapshot.queryParamMap.get('pmsTab'));
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.applyPmsTabQuery(params.get('pmsTab'));
    });
  }

  private applyPmsTabQuery(tab: string | null): void {
    if (
      tab === 'departing' ||
      tab === 'staying' ||
      tab === 'arriving' ||
      tab === 'multi' ||
      tab === 'unconfirmed' ||
      tab === 'transferred'
    ) {
      if (this.isFrontDeskRoute()) {
        if (!this.isFrontDeskPmsTab(tab)) {
          this.pmsTab = 'staying';
          this.cdr.markForCheck();
          return;
        }
      }
      this.pmsTab = tab;
      this.cdr.markForCheck();
    }
  }

  private restoreBookingsRailPreference(): void {
    /* في المكاتب الأمامية: شريط الحالات ظاهر مثل الحجوزات */
    this.bookingsStatusRailOpen = true;
  }

  closeBookingsStatusRail(): void {
    this.bookingsStatusRailOpen = false;
    try {
      localStorage.setItem(this.bookingsRailStorageKey, '0');
    } catch {
      /* ignore */
    }
  }

  openBookingsStatusRail(): void {
    this.bookingsStatusRailOpen = true;
    try {
      localStorage.setItem(this.bookingsRailStorageKey, '1');
    } catch {
      /* ignore */
    }
  }

  private restoreBookingsFilterPreference(): void {
    try {
      if (localStorage.getItem(this.bookingsFilterStorageKey) === '0') {
        this.bookingsFilterToolbarOpen = false;
      }
    } catch {
      /* ignore */
    }
  }

  toggleBookingsFilterToolbar(): void {
    this.bookingsFilterToolbarOpen = !this.bookingsFilterToolbarOpen;
    try {
      localStorage.setItem(this.bookingsFilterStorageKey, this.bookingsFilterToolbarOpen ? '1' : '0');
    } catch {
      /* ignore */
    }
  }

  get bookingsActiveTotal(): number {
    return this.activeBookingsBase().length;
  }

  /** سجلات الحجز — بطاقات مرحلة الحجز (تسكين + طباعة) */
  isBookingsRecordsHub(): boolean {
    return this.bookingsViewOverride === 'records' && !this.isFrontDeskRoute();
  }

  /** المكاتب الأمامية — /front-desk (القادمون، المغادرون، المقيمون) */
  isFrontDeskHub(): boolean {
    if (!this.isFrontDeskRoute()) {
      return false;
    }
    const path = (this.router.url.split('?')[0] || '').replace(/\/$/, '') || '/';
    return path === '/front-desk';
  }

  /** واجهة hub أفقية: سجلات الحجز أو المكاتب الأمامية */
  showBookingsHubChrome(): boolean {
    return this.isBookingsRecordsHub() || this.isFrontDeskHub();
  }

  get pmsPageTitle(): string {
    if (this.isFrontDeskRoute()) {
      return this.ui.screenText('bookings', 'frontDeskPageTitle');
    }
    if (this.isBookingsRecordsHub()) {
      return this.ui.screenText('bookings', 'pageTitle');
    }
    return this.ui.screenText('bookings', 'pageTitle');
  }

  isFrontDeskRoute(): boolean {
    const path = (this.router.url.split('?')[0] || '').replace(/\/$/, '') || '/';
    return path === '/front-desk' || path.startsWith('/front-desk/');
  }

  /** قائمة ⋮ للقادمون/سجلات الحجز | المقيمون = قائمة إقامة */
  pmsCardPrimaryAction():
    | 'details'
    | 'checkIn'
    | 'stayingMenu'
    | 'arrivingMenu'
    | 'arrivingActions'
    | 'departing'
    | 'departingMenu' {
    if (this.isBookingsRecordsHub()) {
      if (this.pmsTab === 'staying') {
        return 'stayingMenu';
      }
      if (['arriving', 'bookings', 'unconfirmed'].includes(this.pmsTab)) {
        return 'arrivingActions';
      }
      return 'details';
    }
    if (this.isFrontDeskHub()) {
      if (this.pmsTab === 'staying') {
        return 'stayingMenu';
      }
      if (this.pmsTab === 'departing') {
        return 'departingMenu';
      }
      if (this.pmsTab === 'arriving') {
        return 'arrivingActions';
      }
    }
    if (this.pmsTab === 'arriving') {
      return 'arrivingMenu';
    }
    if (this.pmsTab === 'staying') {
      return 'stayingMenu';
    }
    if (this.pmsTab === 'departing' && this.isFrontDeskRoute()) {
      return 'departingMenu';
    }
    return 'details';
  }

  pmsCardHideFooter(): boolean {
    const action = this.pmsCardPrimaryAction();
    return action === 'stayingMenu' || action === 'arrivingMenu' || action === 'departingMenu';
  }

  /** شريط الحالات: مخفي في hub السجلات والمكاتب الأمامية */
  get showPmsStatusRail(): boolean {
    return this.bookingsCardLayout && !this.showBookingsHubChrome();
  }

  /** تبويبات المكاتب الأمامية فقط */
  readonly frontDeskPmsTabs = ['arriving', 'staying', 'departing'] as const;

  private readonly pmsRailTabOrderFull: readonly (typeof this.pmsTab)[] = [
    'departing',
    'staying',
    'arriving',
    'multi',
    'unconfirmed',
    'transferred',
  ];

  isFrontDeskPmsTab(tab: string): tab is (typeof this.frontDeskPmsTabs)[number] {
    return (this.frontDeskPmsTabs as readonly string[]).includes(tab);
  }

  get pmsRailTabOrder(): readonly (typeof this.pmsTab)[] {
    return this.isFrontDeskRoute() ? this.frontDeskPmsTabs : this.pmsRailTabOrderFull;
  }

  get pmsTabLabel(): string {
    const m: Record<typeof this.pmsTab, string> = {
      departing: this.ui.screenText('bookings', 'pmsTabDeparting'),
      staying: this.ui.screenText('bookings', 'pmsTabStaying'),
      arriving: this.ui.screenText('bookings', 'pmsTabArriving'),
      bookings: this.ui.screenText('bookings', 'pmsTabBookings'),
      multi: this.ui.screenText('bookings', 'pmsTabMultiBookings'),
      unconfirmed: this.ui.screenText('bookings', 'pmsTabCheckoutToday'),
      transferred: this.ui.screenText('bookings', 'pmsTabTransferred'),
    };
    return m[this.pmsTab];
  }

  isBookingsHubTab(tab: string): tab is (typeof this.bookingsHubTabs)[number] {
    return (this.bookingsHubTabs as readonly string[]).includes(tab);
  }

  bookingsHubTabLabel(tab: (typeof this.bookingsHubTabs)[number]): string {
    const keys: Record<(typeof this.bookingsHubTabs)[number], string> = {
      arriving: 'pmsTabArriving',
      departing: 'bookingsHubTabDeparting',
      staying: 'bookingsHubTabStaying',
      bookings: 'pmsTabBookings',
      unconfirmed: 'bookingsHubTabUnconfirmed',
      multi: 'bookingsHubTabOpenGroups',
    };
    return this.ui.screenText('bookings', keys[tab]);
  }

  bookingsHubTabCount(tab: (typeof this.bookingsHubTabs)[number]): number {
    return this.pmsTabCounts[tab];
  }

  get hubChromeTabs(): ReadonlyArray<(typeof this.pmsTab)> {
    if (this.isBookingsRecordsHub()) {
      return this.bookingsHubTabs;
    }
    if (this.isFrontDeskHub()) {
      return this.frontDeskPmsTabs;
    }
    return [];
  }

  hubChromeTabLabel(tab: (typeof this.pmsTab)): string {
    if (this.isFrontDeskHub()) {
      const keys: Record<(typeof this.frontDeskPmsTabs)[number], string> = {
        arriving: 'navArriving',
        departing: 'navDeparting',
        staying: 'navResidents',
      };
      const key = keys[tab as (typeof this.frontDeskPmsTabs)[number]];
      return key ? this.ui.sidebarLabel(key) : this.pmsTabLabel;
    }
    if (this.isBookingsHubTab(tab)) {
      return this.bookingsHubTabLabel(tab);
    }
    return this.pmsTabLabel;
  }

  hubChromeTabCount(tab: typeof this.pmsTab): number {
    return this.pmsTabCounts[tab as keyof typeof this.pmsTabCounts] ?? 0;
  }

  isHubChromeTab(tab: string): tab is typeof this.pmsTab {
    if (this.isBookingsRecordsHub()) {
      return this.isBookingsHubTab(tab);
    }
    if (this.isFrontDeskHub()) {
      return this.isFrontDeskPmsTab(tab);
    }
    return false;
  }

  setBookingsHubViewMode(mode: 'grid' | 'list'): void {
    this.bookingsHubViewMode = mode;
    this.bookingsHubSelectedIds.clear();
    this.cdr.markForCheck();
  }

  get bookingsHubSelectedRows(): Booking[] {
    return this.tabFilteredBookings.filter(
      (b) => b.id != null && this.bookingsHubSelectedIds.has(b.id)
    );
  }

  get bookingsHubAllRowsSelected(): boolean {
    const rows = this.tabFilteredBookings.filter((b) => b.id != null);
    return rows.length > 0 && rows.every((b) => this.bookingsHubSelectedIds.has(b.id!));
  }

  get bookingsHubSomeRowsSelected(): boolean {
    return this.bookingsHubSelectedRows.length > 0;
  }

  get bookingsHubBulkGroupDepartEnabled(): boolean {
    if (this.isFrontDeskHub()) {
      return this.pmsTab === 'departing' || this.pmsTab === 'staying' || this.bookingsHubSelectedRows.length > 1;
    }
    return (
      this.pmsTab === 'multi' ||
      this.pmsTab === 'staying' ||
      this.pmsTab === 'departing' ||
      this.bookingsHubSelectedRows.length > 1
    );
  }

  isBookingsHubRowSelected(booking: Booking): boolean {
    return booking.id != null && this.bookingsHubSelectedIds.has(booking.id);
  }

  toggleBookingsHubRowSelection(booking: Booking): void {
    if (booking.id == null) {
      return;
    }
    if (this.bookingsHubSelectedIds.has(booking.id)) {
      this.bookingsHubSelectedIds.delete(booking.id);
    } else {
      this.bookingsHubSelectedIds.add(booking.id);
    }
    this.cdr.markForCheck();
  }

  toggleBookingsHubSelectAll(): void {
    const rows = this.tabFilteredBookings.filter((b) => b.id != null);
    if (this.bookingsHubAllRowsSelected) {
      rows.forEach((b) => this.bookingsHubSelectedIds.delete(b.id!));
    } else {
      rows.forEach((b) => this.bookingsHubSelectedIds.add(b.id!));
    }
    this.cdr.markForCheck();
  }

  private bookingsHubBulkTargets(): Booking[] {
    const selected = this.bookingsHubSelectedRows;
    if (selected.length) {
      return selected;
    }
    return this.tabFilteredBookings.filter((b) => b.id != null);
  }

  bookingsHubConfirmationNo(booking: Booking): string {
    return String(booking.invoice_Number || booking.id || '—');
  }

  bookingsHubRoomTypeDisplay(booking: Booking): { text: string; highlight: boolean } {
    const value = String(booking.room_Type ?? '').trim();
    if (!value || value.toUpperCase() === 'PM') {
      return { text: 'PM', highlight: true };
    }
    return { text: value, highlight: false };
  }

  bookingsHubRoomNumberDisplay(booking: Booking): { text: string; highlight: boolean; pickRoom: boolean } {
    const value = String(booking.room_Number ?? '').trim();
    if (!value) {
      return {
        text: this.ui.screenText('bookings', 'bookingsHubPickRooms'),
        highlight: false,
        pickRoom: true,
      };
    }
    if (value.toUpperCase() === 'PM') {
      return { text: 'PM', highlight: true, pickRoom: false };
    }
    return { text: value, highlight: false, pickRoom: false };
  }

  bookingsHubStatusLabel(booking: Booking): string {
    switch (this.pmsTab) {
      case 'departing':
        return this.ui.screenText('bookings', 'bookingsHubStatusDeparting');
      case 'staying':
        return this.ui.screenText('bookings', 'bookingsHubStatusStaying');
      case 'bookings':
        return this.ui.screenText('bookings', 'statusReserved');
      case 'unconfirmed':
        return this.ui.screenText('bookings', 'bookingsHubTabUnconfirmed');
      case 'multi':
        return this.ui.screenText('bookings', 'bookingsHubTabOpenGroups');
      case 'arriving':
      default:
        return this.ui.screenText('bookings', 'bookingsHubStatusArrivingExpected');
    }
  }

  bookingsHubBalanceClass(booking: Booking): string {
    const balance = Number(booking.remaining_Amount) || 0;
    if (balance < 0) {
      return 'bh-money--credit';
    }
    if (balance > 0) {
      return 'bh-money--debt';
    }
    return '';
  }

  formatHubMoney(amount: number | undefined | null): string {
    return formatPmsMoney(amount, this.ui.displayLocale());
  }

  bookingsHubBulkPrint(): void {
    const targets = this.bookingsHubBulkTargets();
    if (!targets.length) {
      this.uiMsg.show(this.ui.screenText('bookings', 'bookingsHubBulkEmpty'));
      return;
    }
    targets.forEach((b) => this.printBookingCard(b));
  }

  bookingsHubBulkCheckInAll(): void {
    const targets = this.bookingsHubBulkTargets().filter(
      (b) => isBookingArriving(b) || isBookingReserved(b)
    );
    if (!targets.length) {
      this.uiMsg.show(this.ui.screenText('bookings', 'bookingsHubBulkEmpty'));
      return;
    }
    const msg = this.ui
      .screenText('bookings', 'bookingsHubBulkCheckInConfirm')
      .replace('{count}', String(targets.length));
    void this.uiMsg.confirm(msg).then((ok) => {
      if (!ok) {
        return;
      }
      this.performDirectCheckInBatch(targets);
    });
  }

  bookingsHubBulkGroupDepart(): void {
    const targets = this.bookingsHubBulkTargets();
    if (!targets.length) {
      this.uiMsg.show(this.ui.screenText('bookings', 'bookingsHubBulkEmpty'));
      return;
    }
    if (targets.length === 1) {
      this.onDepartGuest(targets[0]);
      return;
    }
    const msg = this.ui
      .screenText('bookings', 'bookingsHubBulkGroupDepartConfirm')
      .replace('{count}', String(targets.length));
    void this.uiMsg.confirm(msg).then((ok) => {
      if (ok) {
        this.onDepartGuest(targets[0]);
      }
    });
  }

  bookingsHubBulkCancelAll(): void {
    const targets = this.bookingsHubBulkTargets();
    if (!targets.length) {
      this.uiMsg.show(this.ui.screenText('bookings', 'bookingsHubBulkEmpty'));
      return;
    }
    const msg = this.ui
      .screenText('bookings', 'bookingsHubBulkCancelConfirm')
      .replace('{count}', String(targets.length));
    void this.uiMsg.confirm(msg).then((ok) => {
      if (!ok) {
        return;
      }
      targets.forEach((b) => this.runCancelBooking(b));
      this.bookingsHubSelectedIds.clear();
      this.cdr.markForCheck();
    });
  }

  private clearBookingsHubSelection(): void {
    this.bookingsHubSelectedIds.clear();
  }

  private restorePmsCardScale(): void {
    try {
      const v = localStorage.getItem(this.pmsCardScaleStorageKey);
      if (v == null) {
        return;
      }
      const n = parseInt(v, 10);
      if (!Number.isNaN(n) && n >= 70 && n <= 130) {
        this.pmsCardLayoutScale = n;
      }
    } catch {
      /* ignore */
    }
  }

  persistPmsCardScale(): void {
    try {
      localStorage.setItem(this.pmsCardScaleStorageKey, String(this.pmsCardLayoutScale));
    } catch {
      /* ignore */
    }
  }

  private wireBookingsLayoutSync(): void {
    this.syncBookingsLayoutMode();
    fromEvent(window, DEV_OUTLINES_CHANGED_EVENT)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.syncBookingsLayoutMode());
    fromEvent(window, DASHBOARD_VIEW_MODE_CHANGED_EVENT)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.syncBookingsLayoutMode());
    fromEvent<StorageEvent>(window, 'storage')
      .pipe(
        filter(
          (e) =>
            e.key === DEV_COLORED_OUTLINES_STORAGE_KEY ||
            e.key === DASHBOARD_VIEW_MODE_STORAGE_KEY ||
            e.key === null
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.syncBookingsLayoutMode());
  }

  private wireBookingsViewFromRoute(): void {
    const applyLayout = () => {
      if (this.isFrontDeskRoute()) {
        this.bookingsViewOverride = 'pms';
        this.bookingsCardLayout = true;
        this.filterDate = '';
        this.bookingsStatusRailOpen = false;
        const tab = this.route.snapshot.queryParamMap.get('pmsTab');
        if (tab && this.isFrontDeskPmsTab(tab)) {
          this.pmsTab = tab;
        } else {
          this.pmsTab = 'arriving';
          void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { pmsTab: 'arriving' },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        }
      } else if (this.isBookingsPath()) {
        const view = this.route.snapshot.queryParamMap.get('view');
        if (view === 'records') {
          this.bookingsViewOverride = 'records';
          this.bookingsCardLayout = true;
          const tab = this.route.snapshot.queryParamMap.get('pmsTab');
          this.pmsTab =
            tab && this.isBookingsHubTab(tab) ? tab : 'arriving';
          this.filterDate = '';
          this.bookingsStatusRailOpen = false;
        } else if (view === 'pms') {
          this.bookingsViewOverride = 'pms';
          this.bookingsCardLayout = true;
          this.filterDate = '';
          this.bookingsStatusRailOpen = true;
        } else {
          this.bookingsViewOverride = 'records';
          this.bookingsCardLayout = true;
          const tab = this.route.snapshot.queryParamMap.get('pmsTab');
          this.pmsTab = tab && this.isBookingsHubTab(tab) ? tab : 'arriving';
          this.filterDate = '';
          this.bookingsStatusRailOpen = false;
          void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { view: 'records', pmsTab: this.pmsTab },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        }
      } else {
        this.bookingsViewOverride = null;
        this.syncBookingsLayoutMode();
      }
      this.cdr.markForCheck();
    };
    applyLayout();
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (
        this.route.snapshot.queryParamMap.has('view') ||
        (this.showBookingsHubChrome() && this.route.snapshot.queryParamMap.has('pmsTab'))
      ) {
        applyLayout();
      }
    });
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => applyLayout());
  }

  private isBookingsPath(): boolean {
    const path = (this.router.url.split('?')[0] || '').replace(/\/$/, '') || '/';
    return path === '/bookings' || path.startsWith('/bookings/');
  }

  private syncBookingsLayoutMode(): void {
    if (this.bookingsViewOverride != null) {
      queueMicrotask(() => this.wirePmsTopChromeScrollHide());
      return;
    }
    this.bookingsCardLayout = readBookingsCardLayoutEnabled();
    if (this.bookingsCardLayout) {
      this.filterDate = '';
      this.bookingsStatusRailOpen = true;
    } else {
      this.filterDate = todayLocalDateString();
    }
    queueMicrotask(() => this.wirePmsTopChromeScrollHide());
  }

  get filteredBookings(): Booking[] {
    let filtered = this.bookings.filter((b) => b.status === 'active' || !b.status);

    if (!this.bookingsCardLayout && this.filterDate) {
      filtered = filtered.filter((b) => toDateOnlyString(b.booking_Date) === this.filterDate);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          (b.first_Name && b.first_Name.toLowerCase().includes(term)) ||
          (b.last_Name && b.last_Name.toLowerCase().includes(term)) ||
          (b.room_Number && b.room_Number.toLowerCase().includes(term)) ||
          (b.invoice_Number && b.invoice_Number.toLowerCase().includes(term))
      );
    }

    if (this.pmsFilterRoomLocation) {
      filtered = filtered.filter((b) => {
        const room = this.findRoomForBooking(b);
        return storedGeneralCodeValueMatches(room?.roomLocation, this.pmsFilterRoomLocation);
      });
    }

    return filtered;
  }

  pmsRoomLocationFilterOptions(): string[] {
    return roomLocationFilterValues([...this.roomsByNumber.values()], this.roomLocationOptions);
  }

  clearPmsFilters(): void {
    this.searchTerm = '';
    this.pmsFilterRoomLocation = '';
    this.cdr.markForCheck();
  }

  get pmsFiltersActive(): boolean {
    return !!(this.searchTerm.trim() || this.pmsFilterRoomLocation);
  }

  setPmsTab(tab: typeof this.pmsTab): void {
    if (this.isFrontDeskRoute() && !this.isFrontDeskPmsTab(tab)) {
      return;
    }
    if (this.isBookingsRecordsHub() && !this.isBookingsHubTab(tab)) {
      return;
    }
    this.pmsTab = tab;
    this.clearBookingsHubSelection();
    if (this.isFrontDeskRoute()) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { pmsTab: tab },
        queryParamsHandling: 'merge',
        replaceUrl: true,
        onSameUrlNavigation: 'ignore',
      });
    } else if (this.isBookingsRecordsHub()) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { view: 'records', pmsTab: tab },
        queryParamsHandling: 'merge',
        replaceUrl: true,
        onSameUrlNavigation: 'ignore',
      });
    }
    this.cdr.markForCheck();
  }

  get pmsTabCounts(): {
    departing: number;
    staying: number;
    arriving: number;
    bookings: number;
    multi: number;
    unconfirmed: number;
    transferred: number;
  } {
    const base = this.activeBookingsBase();
    const hubUnconfirmed = base.filter(
      (b) => isBookingReserved(b) && !bookingConfirmMeta(b).value
    ).length;
    return {
      departing: base.filter((b) => isBookingDepartingWithinWindow(b)).length,
      staying: base.filter((b) => isBookingCurrentlyStaying(b)).length,
      arriving: base.filter((b) => isBookingArriving(b)).length,
      bookings: base.filter((b) => isBookingReserved(b)).length,
      multi: bookingsForGuestsWithMultipleActive(this.bookings).length,
      unconfirmed: this.isBookingsRecordsHub()
        ? hubUnconfirmed
        : this.allBookingsExceptCancelled().filter((b) => this.isShownInCheckoutTodayTab(b)).length,
      transferred: this.recentRoomTransfers.length,
    };
  }

  get transferDisplayRows(): BookingTransferDisplayRow[] {
    return this.recentRoomTransfers.map((transfer) => ({
      transfer,
      booking: this.findBookingForTransfer(transfer),
    }));
  }

  private findBookingForTransfer(transfer: RecentRoomTransfer): Booking | undefined {
    if (transfer.bookingId != null) {
      const byId = this.bookings.find((b) => b.id === transfer.bookingId);
      if (byId) {
        return byId;
      }
    }
    const toRoom = transfer.toRoom.trim();
    if (toRoom) {
      return this.bookings.find((b) => String(b.room_Number ?? '').trim() === toRoom);
    }
    return undefined;
  }

  roomStatusLabelForNumber(roomNumber: string): string | null {
    const room = this.roomsByNumber.get(roomNumber.trim());
    if (!room) {
      return null;
    }
    switch (room.status) {
      case 'available':
        return this.ui.screenText('roomPreview', 'statusAvailable');
      case 'occupied':
        return this.ui.screenText('roomPreview', 'statusOccupied');
      case 'dirty':
        return this.ui.screenText('roomPreview', 'statusDirty');
      case 'maintenance':
        return this.ui.screenText('roomPreview', 'statusMaintenance');
      case 'suspended':
        return this.ui.screenText('roomPreview', 'statusSuspended');
      default:
        return null;
    }
  }

  formatTransferTime(iso: string): string {
    try {
      const loc = this.ui.displayLocale() === 'ar' ? 'ar-SA' : undefined;
      return new Date(iso).toLocaleString(loc, {
        dateStyle: 'short',
        timeStyle: 'short',
      });
    } catch {
      return iso;
    }
  }

  openTransferRow(row: BookingTransferDisplayRow): void {
    if (row.booking) {
      this.openGuestDetailModal(row.booking);
    }
  }

  get pmsMainHasContent(): boolean {
    if (this.pmsTab === 'transferred') {
      return this.transferDisplayRows.length > 0 || this.tabFilteredBookings.length > 0;
    }
    return this.tabFilteredBookings.length > 0;
  }

  get multiBookingGroups(): MultiBookingGuestGroup[] {
    const list =
      this.pmsTab === 'multi'
        ? bookingsForGuestsWithMultipleActive(this.bookings)
        : [];
    return groupBookingsByGuestIdentity(this.applySearchFilter(list));
  }

  get tabFilteredBookings(): Booking[] {
    if (!this.bookingsCardLayout) {
      return [];
    }
    const base = this.activeBookingsBase();
    let list: Booking[];
    switch (this.pmsTab) {
      case 'departing':
        list = base.filter((b) => isBookingDepartingWithinWindow(b));
        break;
      case 'staying':
        list = base.filter((b) => isBookingCurrentlyStaying(b));
        break;
      case 'arriving':
        list = base.filter((b) => isBookingArriving(b));
        break;
      case 'bookings':
        list = base.filter((b) => isBookingReserved(b));
        break;
      case 'multi':
        list = bookingsForGuestsWithMultipleActive(this.bookings);
        break;
      case 'unconfirmed':
        if (this.isBookingsRecordsHub()) {
          list = base.filter((b) => isBookingReserved(b) && !bookingConfirmMeta(b).value);
        } else {
          /* خروج اليوم: من سُجّل خروجه اليوم، أو حجز نشط انتهى وقت إقامته المجدول ولم يُسجَّل خروج بعد */
          list = this.allBookingsExceptCancelled().filter((b) => this.isShownInCheckoutTodayTab(b));
        }
        break;
      case 'transferred': {
        const bookingIds = new Set<number>();
        const toRooms = new Set<string>();
        for (const t of this.recentRoomTransfers) {
          if (t.bookingId != null) {
            bookingIds.add(t.bookingId);
          }
          if (t.toRoom) {
            toRooms.add(t.toRoom);
          }
        }
        list = this.bookings.filter((b) => {
          if (b.id != null && bookingIds.has(b.id)) {
            return true;
          }
          const num = String(b.room_Number ?? '').trim();
          return num && toRooms.has(num);
        });
        break;
      }
      default:
        list = base;
    }
    return this.applyHubScopeFilter(this.applySearchFilter(list));
  }

  private applyHubScopeFilter(bookings: Booking[]): Booking[] {
    if (!this.showBookingsHubChrome() || !this.bookingsHubScopeFilter) {
      return bookings;
    }
    if (this.bookingsHubScopeFilter === 'confirmed') {
      return bookings.filter((b) => bookingConfirmMeta(b).value);
    }
    return bookings.filter((b) => !bookingConfirmMeta(b).value);
  }

  guestInitial(booking: Booking): string {
    const n = (booking.first_Name || '').trim();
    return n ? n.charAt(0) : '?';
  }

  /** سطر «من غرفة → إلى غرفة» إن وُجد نقل حديث لهذا الحجز */
  bookingTransferDisplayLine(booking: Booking): string | null {
    const t = getTransferHintForBooking(
      readRecentRoomTransfers(),
      booking.id,
      booking.room_Number
    );
    if (!t) {
      return null;
    }
    return this.ui
      .screenText('bookings', 'detailRoomTransferred')
      .replace('{from}', t.fromRoom)
      .replace('{to}', t.toRoom);
  }

  checkInYmd(booking: Booking): string {
    return bookingCheckInYmd(booking);
  }

  checkOutYmd(booking: Booking): string {
    return bookingCheckOutYmd(booking);
  }

  bookingDateYmd(booking: Booking): string {
    return formatSlashDate(toDateOnlyString(booking.booking_Date));
  }

  get departCheckoutCanDepart(): boolean {
    const b = this.departCheckoutModalBooking;
    return !!b && (Number(b.remaining_Amount) || 0) <= 0;
  }

  formatSlashDate = formatSlashDate;
  pmsCardCountdownLabelKey = pmsCardCountdownLabelKey;
  pmsCardCountdownText = pmsCardCountdownText;
  bookingConfirmMeta = bookingConfirmMeta;

  openGuestDetailModal(booking: Booking): void {
    this.guestDetailModalBooking = booking;
  }

  closeGuestDetailModal(): void {
    this.guestDetailModalBooking = null;
  }

  @HostListener('document:keydown.escape')
  onGuestModalEscape(): void {
    if (this.departCheckoutModalBooking) {
      this.closeDepartCheckoutModal();
      return;
    }
    if (this.transferAmountModalBooking) {
      this.closeTransferAmountModal();
      return;
    }
    if (this.guestDetailModalBooking) {
      this.closeGuestDetailModal();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onPmsRailKeydown(event: KeyboardEvent): void {
    if (!this.bookingsCardLayout || this.isTypingInField(event.target)) {
      return;
    }
    if (
      this.guestDetailModalBooking ||
      this.transferAmountModalBooking ||
      this.departCheckoutModalBooking
    ) {
      return;
    }
    const target = event.target as HTMLElement | null;
    if (target?.closest('.sidebar-nav')) {
      return;
    }

    const key = event.key;
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      this.handlePmsRailArrow(key, event);
      return;
    }
    if (key === 'Enter') {
      this.handlePmsRailEnter(event);
    }
  }

  private isTypingInField(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    if (!el) {
      return false;
    }
    const tag = el.tagName?.toLowerCase();
    return (
      tag === 'input' ||
      tag === 'textarea' ||
      tag === 'select' ||
      el.isContentEditable
    );
  }

  private handlePmsRailArrow(key: string, event: KeyboardEvent): void {
    const order = this.pmsRailTabOrder;
    let idx = order.indexOf(this.pmsTab);
    if (idx < 0) {
      idx = 0;
    }
    event.preventDefault();
    if (!this.bookingsStatusRailOpen && this.showPmsStatusRail) {
      this.openBookingsStatusRail();
    }
    const delta = key === 'ArrowDown' ? 1 : -1;
    const nextTab = order[(idx + delta + order.length) % order.length];
    this.setPmsTab(nextTab);
    this.focusPmsRailTabButton(nextTab);
  }

  private handlePmsRailEnter(event: KeyboardEvent): void {
    if (!this.showPmsStatusRail) {
      return;
    }
    const target = event.target as HTMLElement | null;
    if (target?.hasAttribute('data-pms-rail-tab')) {
      return;
    }
    event.preventDefault();
    if (!this.bookingsStatusRailOpen) {
      this.openBookingsStatusRail();
      this.focusPmsRailTabButton(this.pmsTab);
      return;
    }
    this.focusBookingsMainPanel();
  }

  private focusPmsRailTabButton(tab: typeof this.pmsTab): void {
    queueMicrotask(() => {
      const btn = document.querySelector<HTMLElement>(`[data-pms-rail-tab="${tab}"]`);
      btn?.focus();
    });
  }

  private focusBookingsMainPanel(): void {
    queueMicrotask(() => {
      const panel = document.getElementById('bookings-pms-main-panel');
      if (panel) {
        panel.focus();
        panel.scrollIntoView({ block: 'nearest', behavior: 'auto' });
      }
    });
  }

  /** حجوزات تبويب «خروج اليوم» — بدون إلغاء/خروج، مع تجديد الحجز */
  isCheckoutTodayBooking(booking: Booking): boolean {
    return this.isShownInCheckoutTodayTab(booking);
  }

  renewBooking(booking: Booking): void {
    this.extendStayBooking(booking);
  }

  /** تمديد إقامة نزيل مقيم — تحميل بياناته في نموذج checkIn */
  extendStayBooking(booking: Booking): void {
    this.closeGuestDetailModal();
    try {
      sessionStorage.setItem(
        CHECKIN_BOOKING_STORAGE_KEY,
        JSON.stringify(mapBookingFromApi(booking))
      );
      sessionStorage.setItem('hotelExtendStayIntent', '1');
    } catch {
      /* ignore */
    }
    void this.router.navigate(['/front-desk/booking'], { queryParams: { mode: 'checkIn' } });
  }

  changeRoom(booking: Booking): void {
    this.closeGuestDetailModal();
    try {
      sessionStorage.setItem(
        this.transferRoomStorageKey,
        JSON.stringify(mapBookingFromApi(booking))
      );
    } catch {
      /* ignore */
    }
    void this.router.navigate(['/front-desk/booking'], { queryParams: { mode: 'transferRoom' } });
  }

  editBooking(booking: Booking): void {
    this.closeGuestDetailModal();
    try {
      sessionStorage.setItem(
        this.editBookingStorageKey,
        JSON.stringify(mapBookingFromApi(booking))
      );
    } catch {
      /* ignore */
    }
    void this.router.navigate(['/front-desk/booking'], { queryParams: { mode: 'editBooking' } });
  }

  /** تسكين حجز مسبق مباشرة دون فتح واجهة التسكين */
  checkInBooking(booking: Booking): void {
    this.closeGuestDetailModal();
    this.performDirectCheckIn(booking);
  }

  private performDirectCheckInBatch(bookings: readonly Booking[]): void {
    const eligible = bookings.filter((b) => b.id && (isBookingArriving(b) || isBookingReserved(b)));
    if (!eligible.length) {
      return;
    }
    forkJoin(
      eligible.map((booking) =>
        this.bookingService.updateBooking(
          booking.id!,
          {
            ...mapBookingFromApi(booking),
            status: 'active',
            booking_Confirmed: true,
          },
          { kind: 'booking_checkin', params: bookingNotifyParams(mapBookingFromApi(booking)) },
        ),
      ),
    ).subscribe({
      next: (saved) => {
        const idSet = new Set(eligible.map((b) => b.id));
        this.bookings = this.bookings.map((b) =>
          idSet.has(b.id) ? { ...b, status: 'active', booking_Confirmed: true } : b,
        );
        for (const item of saved) {
          const roomNum = String(item.room_Number ?? '').trim();
          if (roomNum) {
            this.updateRoomStatus(roomNum, 'occupied');
          }
        }
        this.uiMsg.success(this.ui.screenText('booking', 'checkInSuccess'));
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('performDirectCheckInBatch', err);
        const message = err?.error?.error?.message || err?.message || '';
        this.uiMsg.error(message || this.ui.screenText('bookings', 'cancelCheckInError'));
      },
    });
  }

  private performDirectCheckIn(booking: Booking): void {
    if (!booking.id) {
      return;
    }
    if (!isBookingArriving(booking) && !isBookingReserved(booking)) {
      return;
    }
    const updated: Booking = {
      ...mapBookingFromApi(booking),
      status: 'active',
      booking_Confirmed: true,
    };
    this.bookingService
      .updateBooking(booking.id, updated, {
        kind: 'booking_checkin',
        params: bookingNotifyParams(updated),
      })
      .subscribe({
        next: () => {
          const roomNum = String(booking.room_Number ?? '').trim();
          if (roomNum) {
            this.updateRoomStatus(roomNum, 'occupied');
          }
          this.bookings = this.bookings.map((b) =>
            b.id === booking.id ? { ...b, status: 'active', booking_Confirmed: true } : b,
          );
          this.uiMsg.success(this.ui.screenText('booking', 'checkInSuccess'));
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('performDirectCheckIn', err);
          const message = err?.error?.error?.message || err?.message || '';
          this.uiMsg.error(message || this.ui.screenText('bookings', 'cancelCheckInError'));
        },
      });
  }

  /** إلغاء التسكين — إرجاع الحجز لمسبق والغرفة متاحة */
  cancelCheckIn(booking: Booking): void {
    this.closeGuestDetailModal();
    if (!booking.id) {
      return;
    }
    void this.uiMsg.confirm(this.ui.screenText('bookings', 'cancelCheckInConfirm')).then((ok) => {
      if (!ok) {
        return;
      }
      const updated: Booking = { ...mapBookingFromApi(booking), status: 'reserved' };
      this.bookingService.updateBooking(booking.id!, updated, false).subscribe({
        next: () => {
          const roomNum = String(booking.room_Number ?? '').trim();
          if (roomNum) {
            this.updateRoomStatus(roomNum, 'available');
          }
          this.bookings = this.bookings.map((b) =>
            b.id === booking.id ? { ...b, status: 'reserved' } : b
          );
          this.uiMsg.success(this.ui.screenText('bookings', 'cancelCheckInSuccess'));
        },
        error: (err) => {
          console.error('cancelCheckIn', err);
          const message = err?.error?.error?.message || err?.message || '';
          this.uiMsg.error(message || this.ui.screenText('bookings', 'cancelCheckInError'));
        },
      });
    });
  }

  isBookingReserved = isBookingReserved;

  /** حجز جديد لنفس النزيل في غرفة مختلفة */
  addAnotherBookingForGuest(booking: Booking): void {
    if (!isBookingActive(booking)) {
      return;
    }
    this.closeGuestDetailModal();
    const mapped = mapBookingFromApi(booking);
    const payload: Partial<Booking> = {
      first_Name: mapped.first_Name,
      last_Name: mapped.last_Name,
      phone_Number: mapped.phone_Number,
      id_Number: mapped.id_Number,
      id_Type: mapped.id_Type,
      payment_Method: mapped.payment_Method,
      adults_Count: mapped.adults_Count,
      children_Count: mapped.children_Count,
      people_Count: mapped.people_Count,
      currencyCode: mapped.currencyCode,
      currencySymbol: mapped.currencySymbol,
      invoice_Number: mapped.invoice_Number,
    };
    try {
      sessionStorage.setItem(ADD_GUEST_BOOKING_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* ignore */
    }
    void this.router.navigate(['/front-desk/booking'], { queryParams: { mode: 'addGuestBooking' } });
  }

  canCleanBookedDirtyRoom(booking: Booking): boolean {
    if (!isBookingCurrentlyStaying(booking)) {
      return false;
    }
    const room = this.findRoomForBooking(booking);
    return room?.status === 'dirty';
  }

  cleanBookedDirtyRoom(booking: Booking): void {
    if (!this.canCleanBookedDirtyRoom(booking)) {
      return;
    }
    void this.uiMsg.confirm(this.ui.screenText('bookings', 'cleanRoomConfirm')).then((ok) => {
      if (!ok) {
        return;
      }
      this.runCleanBookedDirtyRoom(booking);
    });
  }

  private runCleanBookedDirtyRoom(booking: Booking): void {
    const num = String(booking.room_Number ?? '').trim();
    const nextStatus: Room['status'] = 'occupied';
    this.roomService.getRooms().subscribe({
      next: (rooms) => {
        const room = rooms.find((r) => String(r.roomNumber ?? '').trim() === num);
        if (!room?.id) {
          this.uiMsg.show(this.ui.screenText('bookings', 'cleanRoomError'));
          return;
        }
        const updated: Room = { ...room, status: nextStatus };
        this.roomService.updateRoom(room.id, updated, {
          kind: 'room_status',
          params: { room: num, status: nextStatus },
        }).subscribe({
          next: () => {
            this.roomsByNumber.set(num, updated);
            this.uiMsg.show(this.ui.screenText('bookings', 'cleanRoomSuccess'));
            this.cdr.markForCheck();
          },
          error: () => this.uiMsg.show(this.ui.screenText('bookings', 'cleanRoomError')),
        });
      },
      error: () => this.uiMsg.show(this.ui.screenText('bookings', 'cleanRoomError')),
    });
  }

  private findRoomForBooking(booking: Booking): Room | undefined {
    const num = String(booking.room_Number ?? '').trim();
    return num ? this.roomsByNumber.get(num) : undefined;
  }

  openTransferAmountModal(booking: Booking): void {
    if (!booking.remaining_Amount || booking.remaining_Amount <= 0) {
      this.uiMsg.show(this.ui.screenText('bookings', 'transferNoBalanceDue'));
      return;
    }
    this.transferAmountModalBooking = booking;
    this.transferAmountInput = String(booking.remaining_Amount);
    this.transferAmountBusy = false;
  }

  closeTransferAmountModal(): void {
    this.transferAmountModalBooking = null;
    this.transferAmountInput = '';
    this.transferAmountBusy = false;
  }

  submitTransferAmount(): void {
    const booking = this.transferAmountModalBooking;
    if (!booking) {
      return;
    }
    const remaining = booking.remaining_Amount || 0;
    const payment = parseFloat(this.transferAmountInput);
    if (isNaN(payment) || payment <= 0) {
      this.uiMsg.show(this.ui.screenText('bookings', 'transferInvalidAmount'));
      return;
    }
    if (payment > remaining) {
      this.uiMsg.show(this.ui.screenText('bookings', 'transferOverLimit'));
      return;
    }

    this.transferAmountBusy = true;
    const newPaidAmount = (booking.payment_Amount || 0) + payment;
    const newRemaining = remaining - payment;
    const updatedBooking: Booking = {
      ...booking,
      payment_Amount: newPaidAmount,
      remaining_Amount: newRemaining,
    };

    this.bookingService.updateBooking(updatedBooking.id!, updatedBooking, {
      kind: 'booking_payment',
      params: {
        ...bookingNotifyParams(booking),
        amount: String(payment),
      },
    }).subscribe({
      next: () => {
        booking.payment_Amount = newPaidAmount;
        booking.remaining_Amount = newRemaining;
        this.bookings = this.bookings.map((b) =>
          b.id === booking.id ? { ...b, payment_Amount: newPaidAmount, remaining_Amount: newRemaining } : b
        );
        if (this.guestDetailModalBooking?.id === booking.id) {
          this.guestDetailModalBooking = { ...this.guestDetailModalBooking, ...updatedBooking };
        }
        this.uiMsg.show(this.ui.screenText('bookings', 'transferSuccess'));
        this.closeTransferAmountModal();
      },
      error: (err) => {
        console.error('transferAmount', err);
        this.uiMsg.show(this.ui.screenText('bookings', 'changeRoomError'));
        this.transferAmountBusy = false;
      },
    });
  }

  guestDisplayName(booking: Booking): string {
    return `${booking.first_Name || ''} ${booking.last_Name || ''}`.trim() || '—';
  }

  private readHotelPrintProfile(): {
    name: string;
    address: string;
    landline: string;
    mobile: string;
    email: string;
    imageDataUrl: string;
  } {
    const fallbackName = this.ui.screenText('settings', 'loginTitle') || 'الفندق';
    const view = this.hotelBranding.brandingView();
    return {
      name: view.name || fallbackName,
      address: view.address,
      landline: view.landline,
      mobile: view.mobile,
      email: view.email,
      imageDataUrl:
        view.imageSrc && view.imageSrc.startsWith('data:image/') ? view.imageSrc : '',
    };
  }

  bookingCurrencySymbol(booking: Booking): string {
    return bookingCurrencySymbol(booking, this.hotelCurrency);
  }

  printBookingCard(booking: Booking): void {
    const w = window.open('', '_blank');
    if (!w) {
      this.uiMsg.show('يرجى السماح بالنوافذ المنبثقة للطباعة.');
      return;
    }
    const esc = (v: string | number | undefined | null) =>
      String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    const hotel = this.readHotelPrintProfile();
    const sym = esc(this.bookingCurrencySymbol(booking));
    const name = esc(`${booking.first_Name || ''} ${booking.last_Name || ''}`.trim() || '—');
    const phone = esc(booking.phone_Number || '—');
    const idLine = esc(`${booking.id_Type || '—'} — ${booking.id_Number || '—'}`);
    const inv = esc(booking.invoice_Number || '—');
    const room = esc(booking.room_Number || '—');
    const roomType = esc(booking.room_Type || '—');
    const ci = esc(this.formatSlashDate(this.checkInYmd(booking)));
    const co = esc(this.formatSlashDate(this.checkOutYmd(booking)));
    const nights = esc(booking.stay_Days ?? '—');
    const bookTime = esc(this.formatTime12h(booking.booking_Time));
    const adults = esc(booking.adults_Count ?? '—');
    const children = esc(booking.children_Count ?? '—');
    const loc = this.ui.displayLocale();
    const total = esc(formatPmsMoney(booking.total_Price, loc));
    const paid = esc(formatPmsMoney(booking.payment_Amount, loc));
    const bal = esc(formatPmsMoney(booking.remaining_Amount, loc));
    const hotelName = esc(hotel.name);
    const hotelAddr = esc(hotel.address || '—');
    const hotelTel = esc([hotel.landline, hotel.mobile].filter(Boolean).join(' · ') || '—');
    const hotelEmail = esc(hotel.email || '—');
    const logoBlock = hotel.imageDataUrl
      ? `<img class="hotel-logo" src="${hotel.imageDataUrl}" alt="" />`
      : `<div class="hotel-logo-fallback">${hotelName.charAt(0) || 'ف'}</div>`;
    const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"/><title>حجز ${inv}</title>
      <style>
        *{box-sizing:border-box}
        body{font-family:'Cairo','Segoe UI',Tahoma,sans-serif;padding:28px;color:#1a2b42;max-width:720px;margin:0 auto}
        .sheet{border:1px solid #1565c0;border-radius:16px;overflow:hidden}
        .hotel-head{display:flex;gap:20px;align-items:center;padding:20px 22px;background:linear-gradient(135deg,#1565c0,#42a5f5);color:#fff}
        .hotel-logo{width:88px;height:88px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,.5)}
        .hotel-logo-fallback{width:88px;height:88px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.2);font-size:2rem;font-weight:700}
        .hotel-meta h1{margin:0 0 8px;font-size:1.35rem}
        .hotel-meta p{margin:4px 0;font-size:.9rem;opacity:.95}
        .section{padding:18px 22px;border-top:1px solid #e3f2fd}
        .section h2{margin:0 0 12px;font-size:1rem;color:#1565c0}
        table{border-collapse:collapse;width:100%;font-size:.92rem}
        td,th{padding:8px 10px;border:1px solid #dbeafe;text-align:right}
        th{background:#f4f8fd;color:#1565c0;font-weight:600;width:38%}
        .foot{padding:12px 22px;font-size:.8rem;color:#5a6f88;text-align:center;background:#f4f8fd}
      </style></head><body>
      <div class="sheet">
        <header class="hotel-head">
          ${logoBlock}
          <div class="hotel-meta">
            <h1>${hotelName}</h1>
            <p>${hotelAddr}</p>
            <p>هاتف: ${hotelTel}</p>
            ${hotel.email ? `<p>بريد: ${hotelEmail}</p>` : ''}
          </div>
        </header>
        <section class="section">
          <h2>بيانات النزيل</h2>
          <table>
            <tr><th>الاسم</th><td>${name}</td></tr>
            <tr><th>الهاتف</th><td>${phone}</td></tr>
            <tr><th>الهوية</th><td>${idLine}</td></tr>
            <tr><th>رقم الفاتورة</th><td>${inv}</td></tr>
          </table>
        </section>
        <section class="section">
          <h2>تفاصيل الإقامة</h2>
          <table>
            <tr><th>الغرفة</th><td>${room} (${roomType})</td></tr>
            <tr><th>من · إلى</th><td>${ci} → ${co}</td></tr>
            <tr><th>الليالي</th><td>${nights}</td></tr>
            <tr><th>وقت الحجز</th><td>${bookTime}</td></tr>
            <tr><th>ع/الاشخاص</th><td>${adults} بالغ · ${children} طفل</td></tr>
          </table>
        </section>
        <section class="section">
          <h2>المالية</h2>
          <table>
            <tr><th>الإجمالي</th><td>${total} ${sym}</td></tr>
            <tr><th>المدفوع</th><td>${paid} ${sym}</td></tr>
            <tr><th>المتبقي</th><td>${bal} ${sym}</td></tr>
          </table>
        </section>
        <p class="foot">طُبع ${esc(new Date().toLocaleString('ar-SA'))}</p>
      </div>
      </body></html>`;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
      w.close();
    }, 200);
  }

  private activeBookingsBase(): Booking[] {
    return this.bookings.filter((b) => isBookingActive(b));
  }

  /** كل الحجوزات المعروضة في تبويب «الحجوزات» (ليس فقط النشطة): استبعاد الملغى فقط */
  private allBookingsExceptCancelled(): Booking[] {
    return this.bookings.filter(
      (b) => b.status !== 'cancelled' && !isExpiredReservedWithoutCheckIn(b),
    );
  }

  /** حجز مُنتَهٍ يُعرض في «خروج اليوم»: تم تسجيل الخروج، و(يوم المغادرة المجدول = اليوم أو تسجيل الخروج تم اليوم) */
  private isCheckoutCompletedToday(b: Booking): boolean {
    if (b.status !== 'checked_out') {
      return false;
    }
    const today = todayLocalDateString();
    if (this.checkOutYmd(b) === today) {
      return true;
    }
    if (b.lastModificationTime) {
      return toDateOnlyString(b.lastModificationTime) === today;
    }
    return false;
  }

  /**
   * هل تجاوزنا لحظة انتهاء الإقامة؟ (تاريخ/وقت الدخول + عدد الليالي) — نفس منطق التنبيه «انتهى وقت الحجز».
   */
  private isStayPeriodTimeEnded(b: Booking): boolean {
    return isStayPeriodEnded(b);
  }

  /** تبويب «خروج اليوم»: خروج مُسجَّل اليوم، أو نشط وانتهى وقت الحجز ولم يُخرَج بعد */
  private isShownInCheckoutTodayTab(b: Booking): boolean {
    if (b.status === 'cancelled') {
      return false;
    }
    if (this.isCheckoutCompletedToday(b)) {
      return true;
    }
    if (b.status === 'checked_out') {
      return false;
    }
    if (b.status && b.status !== 'active') {
      return false;
    }
    return this.isStayPeriodTimeEnded(b);
  }

  private applySearchFilter(bookings: Booking[]): Booking[] {
    if (!this.searchTerm.trim()) {
      return bookings;
    }
    const term = this.searchTerm.toLowerCase().trim();
    return bookings.filter(
      (b) =>
        (b.first_Name && b.first_Name.toLowerCase().includes(term)) ||
        (b.last_Name && b.last_Name.toLowerCase().includes(term)) ||
        (b.room_Number && b.room_Number.toLowerCase().includes(term)) ||
        (b.invoice_Number && b.invoice_Number.toLowerCase().includes(term)) ||
        (b.phone_Number && b.phone_Number.toLowerCase().includes(term)) ||
        (b.id_Number && b.id_Number.toLowerCase().includes(term))
    );
  }

  private addDaysToYmd(ymd: string, days: number): string {
    const [y, m, d] = ymd.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + days);
    const yy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  }

  toggleExpand(id: number | undefined): void {
    if (id === undefined) return;
    this.expandedBookingId = this.expandedBookingId === id ? null : id;
  }

  markBookingNoShow(booking: Booking): void {
    if (!booking.id) {
      return;
    }
    void this.uiMsg.confirm(this.ui.screenText('bookings', 'noShowConfirm')).then((ok) => {
      if (!ok) {
        return;
      }
      this.runMarkBookingNoShow(booking);
    });
  }

  private runMarkBookingNoShow(booking: Booking): void {
    const updated: Booking = { ...mapBookingFromApi(booking), status: 'no_show' };
    this.bookingService.updateBooking(booking.id!, updated, false).subscribe({
      next: () => {
        const roomNum = String(booking.room_Number ?? '').trim();
        if (roomNum) {
          this.updateRoomStatus(roomNum, 'available');
        }
        this.bookings = this.bookings.filter((b) => b.id !== booking.id);
        this.closeGuestDetailModal();
        this.uiMsg.show(this.ui.screenText('bookings', 'noShowSuccess'));
      },
      error: (err) => {
        console.error('markBookingNoShow', err);
        this.uiMsg.show(this.ui.screenText('bookings', 'noShowError'));
      },
    });
  }

  cancelBooking(booking: Booking): void {
    void this.uiMsg.confirm(this.ui.screenText('bookings', 'cancelReservationConfirm')).then((ok) => {
      if (!ok) {
        return;
      }
      this.runCancelBooking(booking);
    });
  }

  /** إلغاء تلقائي لحجز مسبق انتهت مهلة الإقامة دون تسكين */
  private autoCancelExpiredReservation(booking: Booking): void {
    if (!booking.id) {
      return;
    }
    const updatedBooking: Booking = {
      ...mapBookingFromApi(booking),
      status: 'cancelled',
      guest_Notes: String(booking.guest_Notes ?? '').trim(),
    };
    this.bookingService.updateBooking(booking.id, updatedBooking, false).subscribe({
      next: () => {
        const roomNum = String(booking.room_Number ?? '').trim();
        if (roomNum) {
          this.updateRoomStatus(roomNum, 'available');
        }
      },
      error: (err) => console.error('autoCancelExpiredReservation', err),
    });
  }

  private runCancelBooking(booking: Booking): void {
    const updatedBooking = { ...booking, status: 'cancelled' };
    this.bookingService.updateBooking(booking.id!, updatedBooking, {
      kind: 'booking_cancelled',
      params: bookingNotifyParams(booking),
    }).subscribe({
      next: () => {
        // Also set room back to available
        this.updateRoomStatus(booking.room_Number, 'available');
        this.bookings = this.bookings.filter(b => b.id !== booking.id);
        this.closeGuestDetailModal();
        this.uiMsg.show('تم إلغاء الحجز بنجاح.');
      },
      error: (err) => {
        console.error('cancelBooking', err);
        const message = err?.error?.error?.message || err?.message || 'خطأ غير معروف';
        this.uiMsg.show(`خطأ في إلغاء الحجز: ${message}`);
      }
    });
  }

  /** من المقيمين: نقل إلى المغادرين | من المغادرين: تسجيل خروج نهائي */
  onDepartGuest(booking: Booking): void {
    if (this.shouldInitiateDepartureFirst()) {
      this.initiateDeparture(booking);
      return;
    }
    this.checkOut(booking);
  }

  private shouldInitiateDepartureFirst(): boolean {
    return this.bookingsCardLayout && this.pmsTab === 'staying';
  }

  initiateDeparture(booking: Booking): void {
    const remaining = Number(booking.remaining_Amount) || 0;
    if (remaining > 0) {
      this.openDepartCheckoutModal(booking, 'initiate');
      return;
    }
    void this.uiMsg.confirm(this.ui.screenText('bookings', 'departInitiateConfirm')).then((ok) => {
      if (!ok) {
        return;
      }
      this.performInitiateDeparture(booking);
    });
  }

  checkOut(booking: Booking): void {
    const remaining = Number(booking.remaining_Amount) || 0;
    if (remaining > 0) {
      this.openDepartCheckoutModal(booking, 'final');
      return;
    }
    void this.uiMsg.confirm(this.ui.screenText('bookings', 'departConfirm')).then((ok) => {
      if (!ok) {
        return;
      }
      this.performCheckOut(booking);
    });
  }

  openDepartCheckoutModal(booking: Booking, intent: 'initiate' | 'final' = 'final'): void {
    this.departFlowIntent = intent;
    this.closeGuestDetailModal();
    this.closeTransferAmountModal();
    const mapped = mapBookingFromApi(booking);
    this.departCheckoutModalBooking = { ...mapped };
    this.departCheckoutPayInput = String(mapped.remaining_Amount ?? 0);
    this.departCheckoutBusy = false;
    this.cdr.markForCheck();
  }

  closeDepartCheckoutModal(): void {
    this.departCheckoutModalBooking = null;
    this.departCheckoutPayInput = '';
    this.departCheckoutBusy = false;
    this.departFlowIntent = 'final';
  }

  private syncBookingAfterPayment(updated: Booking): void {
    this.bookings = this.bookings.map((b) => (b.id === updated.id ? { ...b, ...updated } : b));
    if (this.guestDetailModalBooking?.id === updated.id) {
      this.guestDetailModalBooking = { ...this.guestDetailModalBooking, ...updated };
    }
    if (this.departCheckoutModalBooking?.id === updated.id) {
      this.departCheckoutModalBooking = { ...this.departCheckoutModalBooking, ...updated };
    }
    this.cdr.markForCheck();
  }

  submitDepartCheckoutPayment(): void {
    const booking = this.departCheckoutModalBooking;
    if (!booking?.id) {
      return;
    }
    const remaining = Number(booking.remaining_Amount) || 0;
    const payment = parseFloat(this.departCheckoutPayInput);
    if (Number.isNaN(payment) || payment <= 0) {
      this.uiMsg.show(this.ui.screenText('bookings', 'transferInvalidAmount'));
      return;
    }
    if (payment > remaining) {
      this.uiMsg.show(this.ui.screenText('bookings', 'transferOverLimit'));
      return;
    }

    this.departCheckoutBusy = true;
    const updatedBooking: Booking = {
      ...booking,
      payment_Amount: (Number(booking.payment_Amount) || 0) + payment,
      remaining_Amount: remaining - payment,
    };

    this.bookingService
      .updateBooking(booking.id, updatedBooking, {
        kind: 'booking_payment',
        params: {
          ...bookingNotifyParams(booking),
          amount: String(payment),
        },
      })
      .subscribe({
        next: () => {
          this.syncBookingAfterPayment(updatedBooking);
          this.departCheckoutPayInput =
            updatedBooking.remaining_Amount && updatedBooking.remaining_Amount > 0
              ? String(updatedBooking.remaining_Amount)
              : '';
          this.uiMsg.show(this.ui.screenText('bookings', 'transferSuccess'));
          this.departCheckoutBusy = false;
        },
        error: (err) => {
          console.error('departCheckoutPayment', err);
          this.uiMsg.show(this.ui.screenText('bookings', 'departCheckoutPayError'));
          this.departCheckoutBusy = false;
        },
      });
  }

  confirmDepartCheckout(): void {
    const booking = this.departCheckoutModalBooking;
    if (!booking?.id || (Number(booking.remaining_Amount) || 0) > 0) {
      this.uiMsg.show(this.ui.screenText('bookings', 'departCheckoutPayFirst'));
      return;
    }
    const intent = this.departFlowIntent;
    this.closeDepartCheckoutModal();
    if (intent === 'initiate') {
      this.performInitiateDeparture(booking);
      return;
    }
    this.performCheckOut(booking);
  }

  private performInitiateDeparture(booking: Booking): void {
    const updatedBooking: Booking = { ...mapBookingFromApi(booking), status: 'departing' };
    this.bookingService.updateBooking(booking.id!, updatedBooking, false).subscribe({
      next: () => {
        this.bookings = this.bookings.map((b) =>
          b.id === booking.id ? { ...b, status: 'departing' } : b
        );
        this.closeGuestDetailModal();
        this.setPmsTab('departing');
        this.uiMsg.show(this.ui.screenText('bookings', 'departInitiateSuccess'));
      },
      error: (err) => {
        console.error('initiateDeparture', err);
        const message = err?.error?.error?.message || err?.message || '';
        this.uiMsg.show(message || this.ui.screenText('bookings', 'departInitiateError'));
      },
    });
  }

  private performCheckOut(booking: Booking): void {
    const updatedBooking = { ...booking, status: 'checked_out' };
    this.bookingService
      .updateBooking(booking.id!, updatedBooking, {
        kind: 'booking_checkout',
        params: bookingNotifyParams(booking),
      })
      .subscribe({
        next: () => {
          this.updateRoomStatus(booking.room_Number, 'dirty');
          this.bookings = this.bookings.map((b) =>
            b.id === booking.id ? { ...booking, status: 'checked_out' } : b
          );
          this.closeGuestDetailModal();
          this.uiMsg.show(this.ui.screenText('bookings', 'departCheckoutSuccess'));
        },
        error: (err) => {
          console.error('checkOut', err);
          const message = err?.error?.error?.message || err?.message || '';
          this.uiMsg.show(message || this.ui.screenText('bookings', 'departCheckoutError'));
        },
      });
  }

  private updateRoomStatus(roomNumber: string, status: string): void {
    this.roomService.getRooms().subscribe(rooms => {
      const room = rooms.find(r => r.roomNumber === roomNumber);
      if (room) {
        const updatedRoom = { ...room, status: status as any };
        this.roomService.updateRoom(room.id, updatedRoom, false).subscribe();
      }
    });
  }

  payRemaining(booking: Booking): void {
    this.openTransferAmountModal(booking);
  }

  /** وقتاً نسبياً حتى لحظة الخروج المجدولة (نفس منطق التنبيه). */
  checkoutCountdownText(booking: Booking): string {
    return formatCheckoutCountdown(booking);
  }

  showRemainingTime(booking: Booking): void {
    const line = formatCheckoutCountdown(booking);
    if (line === '—') {
      this.uiMsg.show('بيانات التاريخ أو مدة الإقامة غير مكتملة.');
      return;
    }
    if (line === 'انتهى وقت الإقامة المجدول') {
      this.uiMsg.show('⚠️ انتهى وقت الحجز!\nيجب على النزيل المغادرة أو تمديد الإقامة.');
    } else {
      this.uiMsg.show(`⏳ الوقت المتبقي حتى الخروج:\n${line}.`);
    }
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

  fetchBookings(): void {
    this.loading = true;
    forkJoin({
      bookings: this.bookingService.getBookings(),
      rooms: this.roomService.getRooms(),
      roomLocations: this.generalCodesService.getList('room-locations').pipe(
        catchError((err) => {
          console.error('Error loading room locations for bookings filter', err);
          return of([] as GeneralCodeItem[]);
        }),
      ),
    }).subscribe({
      next: ({ bookings, rooms, roomLocations }) => {
        const expired = bookings.filter((b) => isExpiredReservedWithoutCheckIn(b) && b.id);
        this.bookings = bookings.filter((b) => !isExpiredReservedWithoutCheckIn(b));
        this.roomsByNumber = new Map(
          rooms.map((r) => [String(r.roomNumber ?? '').trim(), r] as const).filter(([k]) => !!k)
        );
        this.roomLocationOptions = sortGeneralCodeItems(roomLocations);
        this.refreshRoomTransfers();
        this.loading = false;
        for (const b of expired) {
          this.autoCancelExpiredReservation(b);
        }
        queueMicrotask(() => this.wirePmsTopChromeScrollHide());
      },
      error: (err) => {
        const timedOut =
          err?.name === 'TimeoutError' || err?.message?.includes?.('Timeout');
        this.error = timedOut
          ? 'انتهت مهلة الاتصال بالخادم. تأكد من تشغيل واجهة الـ API ثم أعد المحاولة.'
          : 'فشل في تحميل البيانات. تأكد من تشغيل الخادم.';
        this.loading = false;
        this.cdr.markForCheck();
        console.error(err);
      },
    });
  }

  private totalRoomsCount(): number {
    return this.roomsByNumber.size;
  }

  private uniqueRoomNumbersFor(bookings: Booking[], predicate: (b: Booking) => boolean): Set<string> {
    const nums = new Set<string>();
    for (const b of bookings) {
      if (!predicate(b)) {
        continue;
      }
      const n = String(b.room_Number ?? '').trim();
      if (n) {
        nums.add(n);
      }
    }
    return nums;
  }

  /** نسبة الحجوزات (حجز) — تختلف عن نسبة التسكين */
  get bookingsRatePercent(): number {
    const total = this.totalRoomsCount();
    if (total <= 0) return 0;
    const booked = this.uniqueRoomNumbersFor(this.bookings, (b) => isBookingActive(b)).size;
    return Math.round((booked / total) * 1000) / 10;
  }

  /** نسبة القادمين — حجوزات قادمة لم تُسكّن بعد */
  get arrivingRatePercent(): number {
    const total = this.totalRoomsCount();
    if (total <= 0) return 0;
    const arriving = this.uniqueRoomNumbersFor(this.bookings, (b) => isBookingArriving(b)).size;
    return Math.round((arriving / total) * 1000) / 10;
  }

  get bookingRateLine(): string {
    return '';
  }

}
