import { CommonModule } from '@angular/common';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { BookingService } from '../../services/booking.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { todayLocalDateString } from '../../utils/date-only';
import { formatPmsMoney } from '../../utils/booking-display.util';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import {
  bookingsToInvoiceNotificationRows,
  isWithinDateRange,
} from './invoices-notifications.util';
import {
  emptyInvoiceNotificationColumnFilters,
  type InvoiceNotificationColumnFilters,
  type InvoiceNotificationRow,
  type InvoiceNotificationSortDir,
  type InvoiceNotificationSortKey,
} from './invoices-notifications.types';

@Component({
  selector: 'app-invoices-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, LocaleNumberPipe, UiInlineTextComponent],
  templateUrl: './invoices-notifications.component.html',
  styleUrls: ['./invoices-notifications.component.css'],
})
export class InvoicesNotificationsComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly bookingService = inject(BookingService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly pageSizeOptions = [10, 50, 100, 500, 1000] as const;

  allRows: InvoiceNotificationRow[] = [];
  loading = true;
  loadError = '';

  filterPanelOpen = false;
  filterFromDate = todayLocalDateString();
  filterToDate = todayLocalDateString();
  appliedFromDate = '';
  appliedToDate = '';

  columnFilters: InvoiceNotificationColumnFilters = emptyInvoiceNotificationColumnFilters();

  pageSize: (typeof this.pageSizeOptions)[number] = 10;
  currentPage = 1;

  sortKey: InvoiceNotificationSortKey = 'invoiceDate';
  sortDir: InvoiceNotificationSortDir = 'desc';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.loadRows();
  }

  label(key: string): string {
    return this.ui.screenText('invoicesNotifications', key);
  }

  private mappingLabels(): Record<string, string> {
    return {
      typeInvoice: this.label('typeInvoice'),
      internalTypeRoom: this.label('internalTypeRoom'),
      internalTypeServices: this.label('internalTypeServices'),
      invoiceTypeSimplified: this.label('invoiceTypeSimplified'),
      invoiceTypeTax: this.label('invoiceTypeTax'),
      nameCashCustomer: this.label('nameCashCustomer'),
      statusSubmitted: this.label('statusSubmitted'),
      statusPending: this.label('statusPending'),
    };
  }

  loadRows(): void {
    this.loading = true;
    this.loadError = '';
    this.bookingService
      .getBookings()
      .pipe(
        catchError((err) => {
          console.error('invoices notifications: failed to load bookings', err);
          this.loadError = this.label('loadError');
          return of([]);
        }),
      )
      .subscribe((bookings) => {
        this.allRows = bookingsToInvoiceNotificationRows(bookings, this.mappingLabels());
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
      this.filterFromDate = this.appliedFromDate || todayLocalDateString();
      this.filterToDate = this.appliedToDate || todayLocalDateString();
    }
  }

  applyDateFilter(): void {
    this.appliedFromDate = this.filterFromDate;
    this.appliedToDate = this.filterToDate;
    this.filterPanelOpen = false;
    this.currentPage = 1;
  }

  clearDateFilters(): void {
    this.filterFromDate = todayLocalDateString();
    this.filterToDate = todayLocalDateString();
    this.appliedFromDate = '';
    this.appliedToDate = '';
    this.filterPanelOpen = false;
    this.currentPage = 1;
  }

  removeFromDate(): void {
    this.appliedFromDate = '';
    this.currentPage = 1;
  }

  removeToDate(): void {
    this.appliedToDate = '';
    this.currentPage = 1;
  }

  get hasActiveDateFilters(): boolean {
    return !!this.appliedFromDate || !!this.appliedToDate;
  }

  get filteredRows(): InvoiceNotificationRow[] {
    const cf = this.columnFilters;
    let rows = this.allRows.filter((row) => {
      if (!isWithinDateRange(row.invoiceDate, this.appliedFromDate, this.appliedToDate)) {
        return false;
      }
      if (cf.invoiceNo && !row.invoiceNo.toLowerCase().includes(cf.invoiceNo.trim().toLowerCase())) {
        return false;
      }
      if (cf.invoiceDate && !this.formatDate(row.invoiceDate).includes(cf.invoiceDate.trim())) {
        return false;
      }
      if (cf.currency && !row.currency.toLowerCase().includes(cf.currency.trim().toLowerCase())) {
        return false;
      }
      if (cf.amount && !this.formatAmount(row.amount).includes(cf.amount.trim())) {
        return false;
      }
      if (cf.typeLabel && !row.typeLabel.includes(cf.typeLabel.trim())) {
        return false;
      }
      if (cf.internalTypeLabel && !row.internalTypeLabel.includes(cf.internalTypeLabel.trim())) {
        return false;
      }
      if (cf.invoiceTypeLabel && !row.invoiceTypeLabel.includes(cf.invoiceTypeLabel.trim())) {
        return false;
      }
      if (cf.name && !row.name.includes(cf.name.trim())) {
        return false;
      }
      if (cf.statusLabel && !row.statusLabel.includes(cf.statusLabel.trim())) {
        return false;
      }
      if (cf.uuid && !row.uuid.toLowerCase().includes(cf.uuid.trim().toLowerCase())) {
        return false;
      }
      return true;
    });
    rows = [...rows].sort((a, b) => this.compareRows(a, b));
    return rows;
  }

  get totalItems(): number {
    return this.filteredRows.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get pagedRows(): InvoiceNotificationRow[] {
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

  toggleSort(key: InvoiceNotificationSortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      return;
    }
    this.sortKey = key;
    this.sortDir = 'asc';
  }

  sortIcon(key: InvoiceNotificationSortKey): string {
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
    return `${y}/${m}/${d}`;
  }

  formatChipDate(iso: string): string {
    return this.formatDate(iso);
  }

  formatAmount(amount: number): string {
    return formatPmsMoney(amount, this.ui.displayLocale());
  }

  trackRow(_index: number, row: InvoiceNotificationRow): string {
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
    const esc = (v: string) =>
      String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    const headers = [
      this.label('colInvoiceNo'),
      this.label('colInvoiceDate'),
      this.label('colCurrency'),
      this.label('colAmount'),
      this.label('colType'),
      this.label('colInternalType'),
      this.label('colInvoiceType'),
      this.label('colName'),
      this.label('colStatus'),
      this.label('colUuid'),
    ];
    const rows = this.filteredRows
      .map(
        (row) =>
          `<tr>
            <td>${esc(row.invoiceNo)}</td>
            <td dir="ltr">${esc(this.formatDate(row.invoiceDate))}</td>
            <td>${esc(row.currency)}</td>
            <td>${esc(this.formatAmount(row.amount))}</td>
            <td>${esc(row.typeLabel)}</td>
            <td>${esc(row.internalTypeLabel)}</td>
            <td>${esc(row.invoiceTypeLabel)}</td>
            <td>${esc(row.name)}</td>
            <td>${esc(row.statusLabel)}</td>
            <td dir="ltr">${esc(row.uuid)}</td>
          </tr>`,
      )
      .join('');
    w.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>${esc(this.label('pageTitle'))}</title>
      <style>body{font-family:Tahoma,sans-serif;padding:16px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #ccc;padding:6px 8px;text-align:start}th{background:#f5f5f5}</style>
      </head><body><h2>${esc(this.label('pageTitle'))}</h2><table><thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows || `<tr><td colspan="10">${esc(this.label('emptyRows'))}</td></tr>`}</tbody></table></body></html>`);
    w.document.close();
    w.focus();
    w.print();
  }

  exportExcel(): void {
    const headers = [
      this.label('colInvoiceNo'),
      this.label('colInvoiceDate'),
      this.label('colCurrency'),
      this.label('colAmount'),
      this.label('colType'),
      this.label('colInternalType'),
      this.label('colInvoiceType'),
      this.label('colName'),
      this.label('colStatus'),
      this.label('colUuid'),
    ];
    const lines = [headers.join('\t')];
    for (const row of this.filteredRows) {
      lines.push(
        [
          row.invoiceNo,
          this.formatDate(row.invoiceDate),
          row.currency,
          this.formatAmount(row.amount),
          row.typeLabel,
          row.internalTypeLabel,
          row.invoiceTypeLabel,
          row.name,
          row.statusLabel,
          row.uuid,
        ].join('\t'),
      );
    }
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/tab-separated-values;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-notifications-${todayLocalDateString()}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  }

  viewUuid(row: InvoiceNotificationRow): void {
    void navigator.clipboard?.writeText(row.uuid);
  }

  private compareRows(a: InvoiceNotificationRow, b: InvoiceNotificationRow): number {
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

  private sortValue(row: InvoiceNotificationRow, key: InvoiceNotificationSortKey): string {
    switch (key) {
      case 'invoiceNo':
        return row.invoiceNo;
      case 'invoiceDate':
        return row.invoiceDate;
      case 'currency':
        return row.currency;
      case 'typeLabel':
        return row.typeLabel;
      case 'internalTypeLabel':
        return row.internalTypeLabel;
      case 'invoiceTypeLabel':
        return row.invoiceTypeLabel;
      case 'name':
        return row.name;
      case 'statusLabel':
        return row.statusLabel;
      case 'uuid':
        return row.uuid;
      default:
        return '';
    }
  }
}
