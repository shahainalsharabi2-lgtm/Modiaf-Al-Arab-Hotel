import { CommonModule } from '@angular/common';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { BookingService } from '../../services/booking.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { todayLocalDateString } from '../../utils/date-only';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import {
  bookingsToNightAuditReservationRows,
  countNightAuditTabRows,
  isWithinDateRange,
  rowsForNightAuditTab,
} from './night-audit-reservations.util';
import type {
  NightAuditReservationRow,
  NightAuditReservationSortDir,
  NightAuditReservationSortKey,
  NightAuditReservationStatusKey,
  NightAuditReservationsTab,
} from './night-audit-reservations.types';

@Component({
  selector: 'app-night-audit-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule, LocaleNumberPipe, UiInlineTextComponent],
  templateUrl: './night-audit-reservations.component.html',
  styleUrls: ['./night-audit-reservations.component.css'],
})
export class NightAuditReservationsComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly bookingService = inject(BookingService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly tabs: NightAuditReservationsTab[] = ['reservations', 'depositRefund', 'departingBalance'];
  readonly pageSizeOptions = [10, 50, 100, 500] as const;

  allRows: NightAuditReservationRow[] = [];
  loading = true;
  loadError = '';

  activeTab: NightAuditReservationsTab = 'reservations';
  filterPanelOpen = false;
  filterFromDate = todayLocalDateString();
  filterToDate = todayLocalDateString();
  appliedFromDate = todayLocalDateString();
  appliedToDate = todayLocalDateString();

  pageSize: (typeof this.pageSizeOptions)[number] = 10;
  currentPage = 1;

  sortKey: NightAuditReservationSortKey = 'reservationNo';
  sortDir: NightAuditReservationSortDir = 'desc';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.loadRows();
  }

  label(key: string): string {
    return this.ui.screenText('nightAuditReservations', key);
  }

  tabLabel(tab: NightAuditReservationsTab): string {
    return this.label(`tab_${tab}`);
  }

  tabCount(tab: NightAuditReservationsTab): number | null {
    if (tab === 'reservations') {
      return null;
    }
    return countNightAuditTabRows(this.allRows, tab);
  }

  loadRows(): void {
    this.loading = true;
    this.loadError = '';
    this.bookingService
      .getBookings()
      .pipe(
        catchError((err) => {
          console.error('night audit reservations: failed to load bookings', err);
          this.loadError = this.label('loadError');
          return of([]);
        }),
      )
      .subscribe((bookings) => {
        this.allRows = bookingsToNightAuditReservationRows(bookings);
        this.loading = false;
        this.currentPage = 1;
        this.cdr.markForCheck();
      });
  }

  setTab(tab: NightAuditReservationsTab): void {
    this.activeTab = tab;
    this.currentPage = 1;
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

  get filteredRows(): NightAuditReservationRow[] {
    let rows = rowsForNightAuditTab(this.allRows, this.activeTab);
    rows = rows.filter((row) => isWithinDateRange(row.arrivalDate, this.appliedFromDate, this.appliedToDate));
    rows = [...rows].sort((a, b) => this.compareRows(a, b));
    return rows;
  }

  get totalItems(): number {
    return this.filteredRows.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get pagedRows(): NightAuditReservationRow[] {
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

  toggleSort(key: NightAuditReservationSortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      return;
    }
    this.sortKey = key;
    this.sortDir = 'asc';
  }

  sortIcon(key: NightAuditReservationSortKey): string {
    if (this.sortKey !== key) {
      return 'fa-sort';
    }
    return this.sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  statusLabel(key: NightAuditReservationStatusKey): string {
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

  trackRow(_index: number, row: NightAuditReservationRow): string {
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

  private compareRows(a: NightAuditReservationRow, b: NightAuditReservationRow): number {
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

  private sortValue(row: NightAuditReservationRow, key: NightAuditReservationSortKey): string | number {
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
      default:
        return '';
    }
  }
}
