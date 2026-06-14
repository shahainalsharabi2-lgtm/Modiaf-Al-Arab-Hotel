import { CommonModule } from '@angular/common';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { BookingService } from '../../services/booking.service';
import { HotelCurrencyService } from '../../services/hotel-currency.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { todayLocalDateString } from '../../utils/date-only';
import { formatPmsMoney } from '../../utils/booking-display.util';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { HotelSymbolPipe } from '../../pipes/hotel-symbol.pipe';
import {
  bookingsToPreviousInvoiceRows,
  isWithinDateRange,
} from './previous-invoices.util';
import type {
  PreviousInvoiceRow,
  PreviousInvoiceSortDir,
  PreviousInvoiceSortKey,
} from './previous-invoices.types';

@Component({
  selector: 'app-previous-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule, LocaleNumberPipe, HotelSymbolPipe, UiInlineTextComponent],
  templateUrl: './previous-invoices.component.html',
  styleUrls: ['./previous-invoices.component.css'],
})
export class PreviousInvoicesComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly bookingService = inject(BookingService);
  private readonly hotelCurrency = inject(HotelCurrencyService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly pageSizeOptions = [10, 50, 100, 500, 1000] as const;

  allRows: PreviousInvoiceRow[] = [];
  loading = true;
  loadError = '';

  filterPanelOpen = false;
  filterFromDate = todayLocalDateString();
  filterToDate = todayLocalDateString();
  appliedFromDate = '';
  appliedToDate = '';

  pageSize: (typeof this.pageSizeOptions)[number] = 10;
  currentPage = 1;

  sortKey: PreviousInvoiceSortKey = 'issueDate';
  sortDir: PreviousInvoiceSortDir = 'desc';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.loadRows();
  }

  label(key: string): string {
    return this.ui.screenText('previousInvoices', key);
  }

  loadRows(): void {
    this.loading = true;
    this.loadError = '';
    this.bookingService
      .getBookings()
      .pipe(
        catchError((err) => {
          console.error('previous invoices: failed to load bookings', err);
          this.loadError = this.label('loadError');
          return of([]);
        }),
      )
      .subscribe((bookings) => {
        this.allRows = bookingsToPreviousInvoiceRows(bookings);
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

  get filteredRows(): PreviousInvoiceRow[] {
    let rows = this.allRows.filter((row) =>
      isWithinDateRange(row.issueDate, this.appliedFromDate, this.appliedToDate),
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

  get pagedRows(): PreviousInvoiceRow[] {
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

  toggleSort(key: PreviousInvoiceSortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      return;
    }
    this.sortKey = key;
    this.sortDir = 'asc';
  }

  sortIcon(key: PreviousInvoiceSortKey): string {
    if (this.sortKey !== key) {
      return 'fa-sort';
    }
    return this.sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  formatDate(iso: string): string {
    if (!iso) {
      return '';
    }
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) {
      return iso;
    }
    return `${d}/${m}/${y}`;
  }

  formatChipDate(iso: string): string {
    if (!iso) {
      return '';
    }
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) {
      return iso;
    }
    return `${y}/${m}/${d}`;
  }

  formatAmount(amount: number): string {
    return formatPmsMoney(amount, this.ui.displayLocale());
  }

  trackRow(_index: number, row: PreviousInvoiceRow): string {
    return row.id;
  }

  pageSummary(): string {
    return this.label('pageSummary')
      .replace('{page}', String(this.currentPage | 0))
      .replace('{pages}', String(this.totalPages | 0))
      .replace('{count}', String(this.totalItems | 0));
  }

  printTable(): void {
    const w = window.open('', '_blank');
    if (!w) {
      return;
    }
    const sym = this.hotelCurrency.symbol();
    const esc = (v: string) =>
      String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    const rows = this.filteredRows
      .map(
        (row) =>
          `<tr>
            <td>${esc(row.serialNo)}</td>
            <td dir="ltr">${esc(this.formatDate(row.issueDate))}</td>
            <td>${esc(row.guestName)}</td>
            <td>${esc(row.payerName)}</td>
            <td>${esc(row.windowNo)}</td>
            <td>${esc(row.bookingNo)}</td>
            <td>${esc(row.roomNo)}</td>
            <td dir="ltr">${esc(this.formatDate(row.arrivalDate))}</td>
            <td dir="ltr">${esc(this.formatDate(row.departureDate))}</td>
            <td>${esc(this.formatAmount(row.amount))} ${esc(sym)}</td>
          </tr>`,
      )
      .join('');
    w.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>${esc(this.label('pageTitle'))}</title>
      <style>body{font-family:Tahoma,sans-serif;padding:16px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #ccc;padding:6px 8px;text-align:start}th{background:#f5f5f5}</style>
      </head><body><h2>${esc(this.label('pageTitle'))}</h2><table><thead><tr>
      <th>${esc(this.label('colSerialNo'))}</th><th>${esc(this.label('colIssueDate'))}</th><th>${esc(this.label('colGuestName'))}</th>
      <th>${esc(this.label('colPayerName'))}</th><th>${esc(this.label('colWindowNo'))}</th><th>${esc(this.label('colBookingNo'))}</th>
      <th>${esc(this.label('colRoomNo'))}</th><th>${esc(this.label('colArrival'))}</th><th>${esc(this.label('colDeparture'))}</th><th>${esc(this.label('colAmount'))}</th>
      </tr></thead><tbody>${rows || `<tr><td colspan="10">${esc(this.label('emptyRows'))}</td></tr>`}</tbody></table></body></html>`);
    w.document.close();
    w.focus();
    w.print();
  }

  private compareRows(a: PreviousInvoiceRow, b: PreviousInvoiceRow): number {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    if (this.sortKey === 'amount') {
      const diff = a.amount - b.amount;
      return diff === 0 ? 0 : diff > 0 ? dir : -dir;
    }
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

  private sortValue(row: PreviousInvoiceRow, key: PreviousInvoiceSortKey): string {
    switch (key) {
      case 'serialNo':
        return row.serialNo;
      case 'issueDate':
        return row.issueDate;
      case 'guestName':
        return row.guestName;
      case 'payerName':
        return row.payerName;
      case 'windowNo':
        return row.windowNo.padStart(4, '0');
      case 'bookingNo':
        return row.bookingNo;
      case 'roomNo':
        return row.roomNo.padStart(6, '0');
      case 'arrivalDate':
        return row.arrivalDate;
      case 'departureDate':
        return row.departureDate;
      default:
        return '';
    }
  }
}
