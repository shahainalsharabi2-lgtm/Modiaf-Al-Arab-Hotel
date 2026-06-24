import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, HostListener, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin, fromEvent } from 'rxjs';
import { BookingService } from '../services/booking.service';
import { Booking } from '../models/booking.model';
import { Room } from '../models/room.model';
import { RoomService } from '../services/room.service';
import { DASHBOARD_VIEW_MODE_STORAGE_KEY, DASHBOARD_VIEW_MODE_CHANGED_EVENT } from '../utils/dev-outlines';
import { UiTranslationsService } from '../services/ui-translations.service';
import { HotelBrandingStoreService } from '../services/hotel-branding-store.service';
import { HotelSystemSettingsLoader } from '../services/hotel-system-settings.loader';
import { HotelCurrencyService, HOTEL_CURRENCY_UPDATED_EVENT } from '../services/hotel-currency.service';
import { bindUiTranslationRefresh } from '../utils/ui-screen-i18n.helper';
import { toDateOnlyString } from '../utils/date-only';
import {
  bookingCheckInYmd,
  bookingCheckOutYmd,
  isBookingActive,
  isBookingArriving,
  isBookingCurrentlyStaying,
  isBookingDepartingStatus,
  isBookingDepartingWithinWindow,
  isBookingReserved,
  syncBookingOccupancyCounts,
} from '../utils/booking-display.util';
import { LocaleNumberPipe } from '../shared/pipes/locale-number.pipe';
import { UiInlineTextComponent } from '../shared/ui-inline-text/ui-inline-text.component';
import {
  buildRoomTypeOccupancyRows,
  DashboardRoomTypeOccupancyRow,
  roomTypeBarSegmentPct,
  roomTypeChartAxisTicks,
  roomTypeChartMax,
} from './dashboard-charts.util';
import {
  buildDashboardEvents,
  buildLatestReservations,
  dashboardEventDescription,
  dashboardEventTitleKey,
  dashboardReservationStatusKey,
  filterDashboardEvents,
  formatDashboardEventTimestamp,
  formatDashboardTableDate,
} from './dashboard-feed.util';
import type {
  DashboardEventAdvancedFilter,
  DashboardEventFilter,
  DashboardEventItem,
  DashboardLatestReservationRow,
} from './dashboard-feed.types';
import {
  buildOccupiedRoomsTrendChart,
  buildReservationsTrendChart,
  buildWeeklyRoomStatusChart,
  DashboardOccupiedTrendChart,
  DashboardReservationsTrendChart,
  DashboardTrendPeriod,
  DashboardWeeklyRoomStatusChart,
  trendGridLineTopPct,
  weeklyBarHeightPct,
} from './dashboard-trend-charts.util';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LocaleNumberPipe, UiInlineTextComponent],
})
export class DashboardComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  readonly hotelBranding = inject(HotelBrandingStoreService);
  readonly hotelCurrency = inject(HotelCurrencyService);
  private readonly hotelSystemSettings = inject(HotelSystemSettingsLoader);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  viewMode: 'normal' | 'advanced' = 'advanced';
  availableRoomsCount = 0;
  bookingsCount = 0;
  totalRoomsCount = 0;
  bookedRoomsCount = 0;
  stayingRoomsCount = 0;
  maintenanceRoomsCount = 0;
  dirtyRoomsCount = 0;
  cleanRoomsCount = 0;
  suspendedRoomsCount = 0;
  arrivingCount = 0;
  departingCount = 0;
  residentsCount = 0;
  occupancyRateDetailed = 0;
  availabilityRateDetailed = 0;
  loading = true;
  error = '';
  hotelName = '';

  residentsSpark: number[] = [];
  departingSpark: number[] = [];
  arrivingSpark: number[] = [];
  roomTypeRows: DashboardRoomTypeOccupancyRow[] = [];
  roomTypeChartMaxValue = 200;
  roomTypeChartTicks: number[] = [0, 40, 80, 120, 160, 200];
  latestReservations: DashboardLatestReservationRow[] = [];
  dashboardEvents: DashboardEventItem[] = [];
  eventFilter: DashboardEventFilter = 'all';
  eventsFilterOpen = false;
  eventAdvancedFilter: DashboardEventAdvancedFilter = {
    status: '',
    importance: '',
    type: '',
    notificationId: '',
    search: '',
  };
  feedRefreshing = false;
  reservationsTrendPeriod: DashboardTrendPeriod = 'monthly';
  occupiedTrendPeriod: DashboardTrendPeriod = 'monthly';
  reservationsTrendChart: DashboardReservationsTrendChart | null = null;
  occupiedTrendChart: DashboardOccupiedTrendChart | null = null;
  weeklyRoomStatusChart: DashboardWeeklyRoomStatusChart | null = null;
  chartsAnimated = false;
  private cachedBookings: Booking[] = [];

  constructor(
    private roomService: RoomService,
    private bookingService: BookingService,
  ) {}

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    fromEvent(window, HOTEL_CURRENCY_UPDATED_EVENT)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.hotelCurrency.reloadFromStorage();
        this.cdr.markForCheck();
      });
    fromEvent(window, 'hotelSettingsUpdated')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadHotelInfo();
        this.cdr.markForCheck();
      });
    this.loadSavedViewMode();
    this.loadHotelInfo();
    this.loadDashboardStats();
  }

  get gaugeStrokeDash(): string {
    const pct = Math.max(0, Math.min(100, this.occupancyRateDetailed));
    return `${pct} 100`;
  }

  get dirtyBarPct(): number {
    if (this.totalRoomsCount <= 0) {
      return 0;
    }
    return (this.dirtyRoomsCount / this.totalRoomsCount) * 100;
  }

  get cleanBarPct(): number {
    if (this.totalRoomsCount <= 0) {
      return 0;
    }
    return (this.cleanRoomsCount / this.totalRoomsCount) * 100;
  }

  roomTypeSegmentPct(value: number): number {
    return roomTypeBarSegmentPct(value, this.roomTypeChartMaxValue);
  }

  get filteredDashboardEvents(): DashboardEventItem[] {
    return filterDashboardEvents(this.dashboardEvents, this.eventFilter, this.eventAdvancedFilter);
  }

  @HostListener('document:click', ['$event'])
  closeEventsFilterPanel(event: MouseEvent): void {
    if (!this.eventsFilterOpen) {
      return;
    }
    const target = event.target as HTMLElement | null;
    if (target?.closest('.pms-events-filter-wrap')) {
      return;
    }
    this.eventsFilterOpen = false;
    this.cdr.markForCheck();
  }

  setEventFilter(filter: DashboardEventFilter): void {
    this.eventFilter = filter;
  }

  toggleEventsFilterPanel(event: Event): void {
    event.stopPropagation();
    this.eventsFilterOpen = !this.eventsFilterOpen;
    this.cdr.markForCheck();
  }

  clearEventAdvancedFilters(event?: Event): void {
    event?.stopPropagation();
    this.eventAdvancedFilter = {
      status: '',
      importance: '',
      type: '',
      notificationId: '',
      search: '',
    };
    this.cdr.markForCheck();
  }

  refreshDashboardFeed(): void {
    if (this.feedRefreshing) {
      return;
    }
    this.feedRefreshing = true;
    this.bookingService.getBookings().subscribe({
      next: (bookings) => {
        this.cachedBookings = bookings;
        this.applyFeedData(bookings);
        this.rebuildTrendCharts();
        this.triggerChartsAnimation();
        this.feedRefreshing = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.feedRefreshing = false;
        this.cdr.markForCheck();
      },
    });
  }

  reservationStatusKey(status: DashboardLatestReservationRow['status']): string {
    return dashboardReservationStatusKey(status);
  }

  eventTitleKey(event: DashboardEventItem): string {
    return dashboardEventTitleKey(event.kind);
  }

  eventDescription(event: DashboardEventItem): string {
    const actor = this.ui.screenText('dashboard', 'eventActorDefault');
    const { key, params } = dashboardEventDescription(event.kind, event.reservationNumber, actor);
    let text = this.ui.screenText('dashboard', key);
    for (const [name, value] of Object.entries(params)) {
      text = text.replace(`{${name}}`, String(value));
    }
    return text;
  }

  formatEventTimestamp(date: Date): string {
    return formatDashboardEventTimestamp(date, this.ui.displayLocale());
  }

  formatTableDate(ymd: string): string {
    return formatDashboardTableDate(ymd);
  }

  setReservationsTrendPeriod(period: DashboardTrendPeriod): void {
    this.reservationsTrendPeriod = period;
    this.rebuildTrendCharts();
  }

  setOccupiedTrendPeriod(period: DashboardTrendPeriod): void {
    this.occupiedTrendPeriod = period;
    this.rebuildTrendCharts();
  }

  trendGridTop(tick: number, yMax: number): number {
    return trendGridLineTopPct(tick, yMax);
  }

  weeklyBarPct(value: number): number {
    return weeklyBarHeightPct(value, this.weeklyRoomStatusChart?.yMax ?? 0);
  }

  bookingViewQuery(booking: Booking): Record<string, string> {
    if (booking.id != null && booking.id > 0) {
      return { bookingId: String(booking.id) };
    }
    return {};
  }

  sparkArea(values: number[], width = 120, height = 44): { line: string; area: string } {
    const pad = 2;
    const series = values.length ? values : [0];
    const innerW = width - pad * 2;
    const innerH = height - pad * 2;
    const max = Math.max(...series, 1);
    const min = Math.min(...series, 0);
    const span = max - min || 1;
    const points = series.map((v, i) => {
      const x =
        pad + (series.length === 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
      const y = pad + innerH - ((v - min) / span) * innerH;
      return { x, y };
    });
    const line = points.map((p) => `${p.x},${p.y}`).join(' ');
    const areaPoints = points.map((p) => `L ${p.x},${p.y}`).join(' ');
    const area = `M ${points[0].x},${height - pad} ${areaPoints} L ${points[points.length - 1].x},${height - pad} Z`;
    return { line, area };
  }

  private loadSavedViewMode(): void {
    this.viewMode = 'advanced';
    try {
      localStorage.setItem(DASHBOARD_VIEW_MODE_STORAGE_KEY, 'advanced');
      window.dispatchEvent(new Event(DASHBOARD_VIEW_MODE_CHANGED_EVENT));
    } catch {
      /* ignore */
    }
  }

  private loadHotelInfo(): void {
    this.hotelSystemSettings.load().subscribe({
      next: () => {
        this.hotelName =
          this.hotelBranding.displayName() ||
          this.ui.screenText('settings', 'loginTitle') ||
          'نظام إدارة الفندق';
        this.cdr.markForCheck();
      },
    });
  }

  private loadDashboardStats(): void {
    this.loading = true;
    forkJoin({
      rooms: this.roomService.getRooms(),
      bookings: this.bookingService.getBookings(),
    }).subscribe({
      next: ({ rooms, bookings }) => {
        this.updateStats(rooms, bookings);
        this.loading = false;
        this.triggerChartsAnimation();
        this.cdr.markForCheck();
      },
      error: (err) => {
        const timedOut =
          err?.name === 'TimeoutError' || err?.message?.includes?.('Timeout');
        this.error = timedOut
          ? 'انتهت مهلة الاتصال بالخادم. شغّل المشروع الخلفي (API) ثم حدّث الصفحة.'
          : this.ui.screenText('dashboard', 'statsLoadError');
        console.error(err);
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private updateStats(rooms: Room[], bookings: Booking[]): void {
    this.totalRoomsCount = rooms.length;
    this.availableRoomsCount = rooms.filter((r) => r.status === 'available').length;
    this.maintenanceRoomsCount = rooms.filter((r) => r.status === 'maintenance').length;
    this.dirtyRoomsCount = rooms.filter((r) => r.status === 'dirty').length;
    this.suspendedRoomsCount = rooms.filter((r) => r.status === 'suspended').length;
    this.cleanRoomsCount = Math.max(0, this.totalRoomsCount - this.dirtyRoomsCount);
    this.bookingsCount = bookings.length;

    const activeBookings = bookings.filter((b) => isBookingActive(b));
    const bookedRooms = new Set<string>();
    const stayingRooms = new Set<string>();

    for (const b of activeBookings) {
      const roomNum = String(b.room_Number ?? '').trim();
      const isBookedRecord =
        isBookingReserved(b) || (isBookingArriving(b) && !isBookingCurrentlyStaying(b));
      if (isBookedRecord && roomNum) {
        bookedRooms.add(roomNum);
      }
      if (isBookingCurrentlyStaying(b) && roomNum) {
        stayingRooms.add(roomNum);
      }
    }

    this.bookedRoomsCount = bookedRooms.size;
    this.stayingRoomsCount = stayingRooms.size;
    this.residentsCount = this.stayingRoomsCount;
    this.arrivingCount = activeBookings.filter((b) => isBookingArriving(b)).length;
    this.departingCount = activeBookings.filter(
      (b) => isBookingDepartingStatus(b) || isBookingDepartingWithinWindow(b),
    ).length;

    const occupancyRaw =
      this.totalRoomsCount > 0 ? (this.stayingRoomsCount / this.totalRoomsCount) * 100 : 0;
    this.occupancyRateDetailed = Math.round(occupancyRaw * 10) / 10;
    this.availabilityRateDetailed = Math.round((100 - occupancyRaw) * 10) / 10;

    const sparks = this.buildFrontDeskSparklines(bookings);
    this.residentsSpark = sparks.residents;
    this.departingSpark = sparks.departing;
    this.arrivingSpark = sparks.arriving;

    this.roomTypeRows = buildRoomTypeOccupancyRows(rooms, bookings);
    this.roomTypeChartMaxValue = roomTypeChartMax(this.roomTypeRows);
    this.roomTypeChartTicks = roomTypeChartAxisTicks(this.roomTypeChartMaxValue);

    this.cachedBookings = bookings;
    this.applyFeedData(bookings);
    this.rebuildTrendCharts();
  }

  private applyFeedData(bookings: Booking[]): void {
    this.latestReservations = buildLatestReservations(bookings);
    this.dashboardEvents = buildDashboardEvents(bookings);
  }

  private rebuildTrendCharts(): void {
    this.reservationsTrendChart = buildReservationsTrendChart(
      this.cachedBookings,
      this.reservationsTrendPeriod,
    );
    this.occupiedTrendChart = buildOccupiedRoomsTrendChart(
      this.cachedBookings,
      this.occupiedTrendPeriod,
    );
    this.weeklyRoomStatusChart = buildWeeklyRoomStatusChart(
      this.cachedBookings,
      this.totalRoomsCount,
    );
  }

  private triggerChartsAnimation(): void {
    this.chartsAnimated = false;
    requestAnimationFrame(() => {
      this.chartsAnimated = true;
      this.cdr.markForCheck();
    });
  }

  private buildFrontDeskSparklines(bookings: Booking[]): {
    residents: number[];
    departing: number[];
    arriving: number[];
  } {
    const days = this.last7LocalDays();
    const residents: number[] = [];
    const departing: number[] = [];
    const arriving: number[] = [];

    for (const day of days) {
      let residentsDay = 0;
      let departingDay = 0;
      let arrivingDay = 0;

      for (const b of bookings) {
        if (b.status === 'cancelled' || b.status === 'checked_out') {
          continue;
        }
        if (this.bookingStayingOnDay(b, day)) {
          residentsDay += 1;
        }
        if (this.bookingDepartingOnDay(b, day)) {
          departingDay += 1;
        }
        if (this.bookingArrivingOnDay(b, day)) {
          arrivingDay += 1;
        }
      }

      residents.push(residentsDay);
      departing.push(departingDay);
      arriving.push(arrivingDay);
    }

    return { residents, departing, arriving };
  }

  private last7LocalDays(): string[] {
    const out: string[] = [];
    const base = new Date();
    base.setHours(12, 0, 0, 0);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      out.push(toDateOnlyString(d));
    }
    return out;
  }

  private bookingCoversDay(booking: Booking, day: string): boolean {
    const ci = bookingCheckInYmd(booking);
    const co = bookingCheckOutYmd(booking);
    if (!ci || !co) {
      return false;
    }
    return ci <= day && day < co;
  }

  private bookingStayingOnDay(booking: Booking, day: string): boolean {
    if (booking.status === 'cancelled' || booking.status === 'checked_out') {
      return false;
    }
    if (isBookingReserved(booking)) {
      return false;
    }
    return this.bookingCoversDay(booking, day);
  }

  private bookingArrivingOnDay(booking: Booking, day: string): boolean {
    if (!isBookingActive(booking)) {
      return false;
    }
    return bookingCheckInYmd(booking) === day;
  }

  private bookingDepartingOnDay(booking: Booking, day: string): boolean {
    if (!isBookingActive(booking)) {
      return false;
    }
    return bookingCheckOutYmd(booking) === day;
  }
}
