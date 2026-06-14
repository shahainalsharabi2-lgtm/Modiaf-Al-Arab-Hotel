import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Booking } from '../../models/booking.model';
import { BookingService } from '../../services/booking.service';
import { HotelBrandingStoreService } from '../../services/hotel-branding-store.service';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { toDateOnlyString } from '../../utils/date-only';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import {
  bookingsForReport,
  reportUsesLiveSnapshot,
  sumBookingMoney,
  type ReportKind,
} from '../../utils/reports-filter.util';
import {
  ADVANCED_REPORT_CATEGORIES,
  advancedReportCategoryForReport,
  advancedReportLeaf,
  isBookingReportId,
  type AdvancedReportCategory,
  type AdvancedReportLeaf,
} from '../reports-advanced.config';

type SearchMode = 'all' | 'lastHour' | 'guest' | 'room' | 'floor';

@Component({
  selector: 'app-reports-advanced-center',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, UiInlineTextComponent],
  templateUrl: './reports-advanced-center.component.html',
  styleUrls: ['./reports-advanced-center.component.css'],
})
export class ReportsAdvancedCenterComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  readonly hotelBranding = inject(HotelBrandingStoreService);
  private readonly bookingService = inject(BookingService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly categories = ADVANCED_REPORT_CATEGORIES;

  treeSearch = '';
  openCategories = new Set<string>(
    ADVANCED_REPORT_CATEGORIES.filter((c) => c.reports.length).map((c) => c.id),
  );
  selectedReportId: string | null = 'bookings';
  previewRan = false;
  loading = false;

  fromDate = '';
  toDate = '';
  searchMode: SearchMode = 'all';
  searchGuest = '';
  searchRoom = '';
  searchFloor = '';

  allBookings: Booking[] = [];
  previewRows: Booking[] = [];

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    const today = toDateOnlyString(new Date());
    this.toDate = today;
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    this.fromDate = toDateOnlyString(monthAgo);

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const report = params.get('report');
      if (report && advancedReportLeaf(report)) {
        this.selectedReportId = report;
        const catId = advancedReportCategoryForReport(report);
        if (catId) {
          this.openCategories.add(catId);
        }
      }
      this.cdr.markForCheck();
    });

    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;
    this.bookingService.getBookings().subscribe({
      next: (rows) => {
        this.allBookings = rows;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.allBookings = [];
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  selectedLeaf(): AdvancedReportLeaf | null {
    return advancedReportLeaf(this.selectedReportId);
  }

  reportTitleKey(): string {
    const leaf = this.selectedLeaf();
    if (!leaf) {
      return 'advSelectReport';
    }
    if (isBookingReportId(leaf.id)) {
      const map: Record<ReportKind, string> = {
        bookings: 'reportBookingsTitle',
        staying: 'reportStayingListTitle',
        'staying-summary': 'reportStayingSummaryTitle',
        departing: 'reportDepartingTitle',
        cancelled: 'reportCancelledTitle',
        no_show: 'reportNoShowTitle',
      };
      return map[leaf.id as ReportKind];
    }
    return leaf.labelKey;
  }

  reportSubtitleKey(): string {
    const leaf = this.selectedLeaf();
    if (!leaf) {
      return 'advSelectReport';
    }
    if (isBookingReportId(leaf.id)) {
      const map: Record<ReportKind, string> = {
        bookings: 'reportBookingsSubtitle',
        staying: 'reportStayingListSubtitle',
        'staying-summary': 'reportStayingSummarySubtitle',
        departing: 'reportDepartingSubtitle',
        cancelled: 'reportCancelledSubtitle',
        no_show: 'reportNoShowSubtitle',
      };
      return map[leaf.id as ReportKind];
    }
    return 'tmplCatalogPlaceholder';
  }

  isBookingReport(): boolean {
    return isBookingReportId(this.selectedReportId);
  }

  toggleCategory(categoryId: string): void {
    if (this.openCategories.has(categoryId)) {
      this.openCategories.delete(categoryId);
    } else {
      this.openCategories.add(categoryId);
    }
    this.cdr.markForCheck();
  }

  isCategoryOpen(categoryId: string): boolean {
    return this.openCategories.has(categoryId);
  }

  categoryVisible(category: AdvancedReportCategory): boolean {
    const q = this.treeSearch.trim().toLowerCase();
    if (!q) {
      return true;
    }
    const title = this.ui.screenText('reports', category.labelKey).toLowerCase();
    if (title.includes(q)) {
      return true;
    }
    return category.reports.some((r) =>
      this.ui.screenText('reports', r.labelKey).toLowerCase().includes(q),
    );
  }

  reportVisible(leaf: AdvancedReportLeaf): boolean {
    const q = this.treeSearch.trim().toLowerCase();
    if (!q) {
      return true;
    }
    return this.ui.screenText('reports', leaf.labelKey).toLowerCase().includes(q);
  }

  selectReport(reportId: string): void {
    this.selectedReportId = reportId;
    this.previewRan = false;
    this.previewRows = [];
    const catId = advancedReportCategoryForReport(reportId);
    if (catId) {
      this.openCategories.add(catId);
    }
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { hub: 'advanced', report: reportId },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  isReportSelected(reportId: string): boolean {
    return this.selectedReportId === reportId;
  }

  usesLiveSnapshot(): boolean {
    return (
      isBookingReportId(this.selectedReportId) &&
      reportUsesLiveSnapshot(this.selectedReportId as ReportKind)
    );
  }

  runReport(): void {
    if (!this.selectedReportId) {
      return;
    }
    if (!isBookingReportId(this.selectedReportId)) {
      this.previewRows = [];
      this.previewRan = true;
      this.cdr.markForCheck();
      return;
    }
    let rows = bookingsForReport(
      this.allBookings,
      this.selectedReportId as ReportKind,
      this.fromDate,
      this.toDate,
    );
    rows = this.applySearchFilter(rows);
    this.previewRows = rows;
    this.previewRan = true;
    this.cdr.markForCheck();
  }

  refreshReport(): void {
    this.loadBookings();
    if (this.previewRan) {
      this.runReport();
    }
  }

  clearFilters(): void {
    const today = toDateOnlyString(new Date());
    this.toDate = today;
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    this.fromDate = toDateOnlyString(monthAgo);
    this.searchMode = 'all';
    this.searchGuest = '';
    this.searchRoom = '';
    this.searchFloor = '';
    this.cdr.markForCheck();
  }

  printPreview(): void {
    window.print();
  }

  stayingSummaryGuests(): number {
    return this.previewRows.length;
  }

  stayingSummaryTotal(): number {
    return sumBookingMoney(this.previewRows, 'total_Price');
  }

  stayingSummaryPaid(): number {
    return sumBookingMoney(this.previewRows, 'payment_Amount');
  }

  stayingSummaryRemaining(): number {
    return sumBookingMoney(this.previewRows, 'remaining_Amount');
  }

  guestName(booking: Booking): string {
    return `${booking.first_Name ?? ''} ${booking.last_Name ?? ''}`.trim();
  }

  statusLabel(status: string | undefined): string {
    switch (status) {
      case 'active':
        return this.ui.screenText('reports', 'statusActiveCount').replace(':', '').trim();
      case 'checked_out':
        return this.ui.screenText('reports', 'statusCheckedOutCount').replace(':', '').trim();
      case 'cancelled':
        return this.ui.screenText('reports', 'statusCancelledCount').replace(':', '').trim();
      case 'no_show':
        return this.ui.screenText('reports', 'statusNoShow');
      default:
        return status ?? '—';
    }
  }

  private applySearchFilter(rows: Booking[]): Booking[] {
    switch (this.searchMode) {
      case 'lastHour': {
        const cutoff = Date.now() - 60 * 60 * 1000;
        return rows.filter((b) => {
          const date = toDateOnlyString(b.booking_Date);
          const time = (b.booking_Time ?? '00:00').slice(0, 5);
          const ts = Date.parse(`${date}T${time}:00`);
          return Number.isFinite(ts) && ts >= cutoff;
        });
      }
      case 'guest': {
        const q = this.searchGuest.trim().toLowerCase();
        if (!q) {
          return rows;
        }
        return rows.filter((b) => {
          const name = this.guestName(b).toLowerCase();
          const phone = (b.phone_Number ?? '').toLowerCase();
          return name.includes(q) || phone.includes(q);
        });
      }
      case 'room': {
        const q = this.searchRoom.trim();
        if (!q) {
          return rows;
        }
        return rows.filter((b) => String(b.room_Number ?? '').includes(q));
      }
      case 'floor': {
        const q = this.searchFloor.trim();
        if (!q) {
          return rows;
        }
        return rows.filter((b) => String(b.floor ?? '').includes(q));
      }
      default:
        return rows;
    }
  }
}
