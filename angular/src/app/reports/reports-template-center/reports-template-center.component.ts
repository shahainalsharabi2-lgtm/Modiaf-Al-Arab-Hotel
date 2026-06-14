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

@Component({
  selector: 'app-reports-template-center',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, UiInlineTextComponent],
  templateUrl: './reports-template-center.component.html',
  styleUrls: ['./reports-template-center.component.css'],
})
export class ReportsTemplateCenterComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  readonly hotelBranding = inject(HotelBrandingStoreService);
  private readonly bookingService = inject(BookingService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly categories = ADVANCED_REPORT_CATEGORIES;

  treeSearch = '';
  openCategories = new Set<string>();
  selectedReportId: string | null = null;
  loading = false;
  templateReady = false;

  fromDate = '';
  toDate = '';
  allBookings: Booking[] = [];
  templateRows: Booking[] = [];

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.resetDateRange();
    for (const category of ADVANCED_REPORT_CATEGORIES) {
      if (category.reports.length) {
        this.openCategories.add(category.id);
      }
    }

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const report = params.get('report');
      if (report && advancedReportLeaf(report)) {
        this.selectedReportId = report;
        const catId = advancedReportCategoryForReport(report);
        if (catId) {
          this.openCategories.add(catId);
        }
        this.refreshTemplate();
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
        if (this.selectedReportId) {
          this.refreshTemplate();
        }
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
      return 'tmplCanvasEmpty';
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
    const catId = advancedReportCategoryForReport(reportId);
    if (catId) {
      this.openCategories.add(catId);
    }
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { hub: 'template', report: reportId },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
    this.refreshTemplate();
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

  refreshTemplate(): void {
    if (!this.selectedReportId) {
      this.templateRows = [];
      this.templateReady = false;
      this.cdr.markForCheck();
      return;
    }
    if (!isBookingReportId(this.selectedReportId)) {
      this.templateRows = [];
      this.templateReady = true;
      this.cdr.markForCheck();
      return;
    }
    this.templateRows = bookingsForReport(
      this.allBookings,
      this.selectedReportId as ReportKind,
      this.fromDate,
      this.toDate,
    );
    this.templateReady = true;
    this.cdr.markForCheck();
  }

  resetTemplate(): void {
    this.selectedReportId = null;
    this.templateRows = [];
    this.templateReady = false;
    this.treeSearch = '';
    this.openCategories.clear();
    this.resetDateRange();
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { hub: 'template', report: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
    this.cdr.markForCheck();
  }

  printTemplate(): void {
    window.print();
  }

  printDateLabel(): string {
    return toDateOnlyString(new Date());
  }

  stayingSummaryGuests(): number {
    return this.templateRows.length;
  }

  stayingSummaryTotal(): number {
    return sumBookingMoney(this.templateRows, 'total_Price');
  }

  stayingSummaryPaid(): number {
    return sumBookingMoney(this.templateRows, 'payment_Amount');
  }

  stayingSummaryRemaining(): number {
    return sumBookingMoney(this.templateRows, 'remaining_Amount');
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

  private resetDateRange(): void {
    const today = toDateOnlyString(new Date());
    this.toDate = today;
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    this.fromDate = toDateOnlyString(monthAgo);
  }
}
