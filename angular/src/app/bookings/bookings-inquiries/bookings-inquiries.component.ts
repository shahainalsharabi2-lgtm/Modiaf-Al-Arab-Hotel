import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { formatPmsMoney } from '../../utils/booking-display.util';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { todayLocalDateString } from '../../utils/date-only';
import { bookingsToInquiryRows, isWithinDateRange } from './bookings-inquiries.util';
import type {
  BookingsInquiryRow,
  BookingsInquirySortDir,
  BookingsInquirySortKey,
  BookingsInquiryStatusKey,
} from './bookings-inquiries.types';

@Component({
  selector: 'app-bookings-inquiries',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LocaleNumberPipe, UiInlineTextComponent],
  templateUrl: './bookings-inquiries.component.html',
  styleUrls: ['./bookings-inquiries.component.css'],
})
export class BookingsInquiriesComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly bookingService = inject(BookingService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly pageSizeOptions = [10, 50, 100, 500, 1000] as const;

  allRows: BookingsInquiryRow[] = [];
  loading = true;
  loadError = '';

  filterPanelOpen = false;
  filterFromDate = todayLocalDateString();
  filterToDate = todayLocalDateString();
  appliedFromDate = todayLocalDateString();
  appliedToDate = todayLocalDateString();

  pageSize: (typeof this.pageSizeOptions)[number] = 10;
  currentPage = 1;

  sortKey: BookingsInquirySortKey = 'reservationNo';
  sortDir: BookingsInquirySortDir = 'desc';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.loadRows();
  }

  label(key: string): string {
    return this.ui.screenText('bookingsInquiries', key);
  }

  loadRows(): void {
    this.loading = true;
    this.loadError = '';
    this.bookingService
      .getBookings()
      .pipe(
        catchError((err) => {
          console.error('bookings inquiries: failed to load bookings', err);
          this.loadError = this.label('loadError');
          return of([]);
        }),
      )
      .subscribe((bookings) => {
        this.allRows = bookingsToInquiryRows(bookings);
        this.loading = false;
        this.currentPage = 1;
        this.cdr.markForCheck();
      });
  }

  refresh(): void {
    this.loadRows();
  }

  toggleFilterPanel(): void {
    this.filterPanelOpen = !this.filterPanelOpen;
    if (this.filterPanelOpen) {
      this.filterFromDate = this.appliedFromDate;
      this.filterToDate = this.appliedToDate;
    }
  }

  applyDateFilter(): void {
    this.appliedFromDate = this.filterFromDate;
    this.appliedToDate = this.filterToDate;
    this.filterPanelOpen = false;
    this.currentPage = 1;
  }

  clearDateFilters(): void {
    this.filterFromDate = '';
    this.filterToDate = '';
    this.appliedFromDate = '';
    this.appliedToDate = '';
    this.filterPanelOpen = false;
    this.currentPage = 1;
  }

  removeFromDate(): void {
    this.appliedFromDate = '';
    this.filterFromDate = '';
    this.currentPage = 1;
  }

  removeToDate(): void {
    this.appliedToDate = '';
    this.filterToDate = '';
    this.currentPage = 1;
  }

  get hasActiveDateFilters(): boolean {
    return !!this.appliedFromDate || !!this.appliedToDate;
  }

  get filteredRows(): BookingsInquiryRow[] {
    let rows = this.allRows.filter((row) =>
      isWithinDateRange(row.arrivalDate, this.appliedFromDate, this.appliedToDate),
    );
    rows = [...rows].sort((a, b) => this.compareRows(a, b));
    return rows;
  }

  get totalItems(): number {
    return this.filteredRows.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get pagedRows(): BookingsInquiryRow[] {
    const safePage = Math.min(this.currentPage, this.totalPages);
    const start = (safePage - 1) * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  setPageSize(size: number): void {
    this.pageSize = size as (typeof this.pageSizeOptions)[number];
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    this.currentPage = Math.min(Math.max(1, page), this.totalPages);
  }

  toggleSort(key: BookingsInquirySortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      return;
    }
    this.sortKey = key;
    this.sortDir = 'asc';
  }

  sortIcon(key: BookingsInquirySortKey): string {
    if (this.sortKey !== key) {
      return 'fa-sort';
    }
    return this.sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  statusLabel(key: BookingsInquiryStatusKey): string {
    return this.label(`status_${key}`);
  }

  formatDate(iso: string): string {
    if (!iso) {
      return '—';
    }
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) {
      return iso;
    }
    return `${y}/${m}/${d}`;
  }

  formatChipDate(iso: string): string {
    return this.formatDate(iso);
  }

  formatMoney(amount: number): string {
    return formatPmsMoney(amount, this.ui.displayLocale());
  }

  trackRow(_index: number, row: BookingsInquiryRow): string {
    return row.id;
  }

  pageSummary(): string {
    return this.label('pageSummary')
      .replace('{page}', String(this.currentPage | 0))
      .replace('{pages}', String(this.totalPages | 0))
      .replace('{count}', String(this.totalItems | 0));
  }

  printTable(): void {
    window.print();
  }

  private compareRows(a: BookingsInquiryRow, b: BookingsInquiryRow): number {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    const av = this.sortValue(a, this.sortKey);
    const bv = this.sortValue(b, this.sortKey);
    if (av < bv) {
      return -1 * dir;
    }
    if (av > bv) {
      return 1 * dir;
    }
    return 0;
  }

  private sortValue(row: BookingsInquiryRow, key: BookingsInquirySortKey): string | number {
    switch (key) {
      case 'reservationNo':
        return Number(row.reservationNo) || row.reservationNo;
      case 'guestName':
        return row.guestName;
      case 'arrivalDate':
        return row.arrivalDate;
      case 'nights':
        return row.nights;
      case 'departureDate':
        return row.departureDate;
      case 'roomNo':
        return Number(row.roomNo) || row.roomNo;
      case 'roomType':
        return row.roomType;
      case 'status':
        return this.statusLabel(row.statusKey);
      case 'total':
        return row.total;
      default:
        return '';
    }
  }
}
