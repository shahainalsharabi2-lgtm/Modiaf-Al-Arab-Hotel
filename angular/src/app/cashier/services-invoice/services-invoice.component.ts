import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { HotelSymbolPipe } from '../../pipes/hotel-symbol.pipe';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { todayLocalDateString } from '../../utils/date-only';
import { formatPmsMoney } from '../../utils/booking-display.util';
import { SERVICES_INVOICE_ROWS } from './services-invoice.static-data';
import { isWithinDateRange } from './services-invoice.util';
import type {
  ServicesInvoiceRow,
  ServicesInvoiceSortDir,
  ServicesInvoiceSortKey,
} from './services-invoice.types';

@Component({
  selector: 'app-services-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule, LocaleNumberPipe, HotelSymbolPipe, UiInlineTextComponent],
  templateUrl: './services-invoice.component.html',
  styleUrls: ['./services-invoice.component.css'],
})
export class ServicesInvoiceComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly pageSizeOptions = [10, 50, 100, 500, 1000] as const;

  allRows: ServicesInvoiceRow[] = [];

  filterPanelOpen = false;
  filterFromDate = todayLocalDateString();
  filterToDate = todayLocalDateString();
  appliedFromDate = todayLocalDateString();
  appliedToDate = todayLocalDateString();

  pageSize: (typeof this.pageSizeOptions)[number] = 10;
  currentPage = 1;

  sortKey: ServicesInvoiceSortKey = 'invoiceDate';
  sortDir: ServicesInvoiceSortDir = 'desc';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.loadRows();
  }

  private loadRows(): void {
    const today = todayLocalDateString();
    this.allRows = SERVICES_INVOICE_ROWS.map((row) => ({
      ...row,
      invoiceDate: today,
      createdAt: row.createdAt || new Date().toISOString(),
    }));
  }

  label(key: string): string {
    return this.ui.screenText('servicesInvoice', key);
  }

  refresh(): void {
    this.loadRows();
    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  addNew(): void {}

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

  get filteredRows(): ServicesInvoiceRow[] {
    let rows = this.allRows.filter((row) =>
      isWithinDateRange(row.invoiceDate, this.appliedFromDate, this.appliedToDate),
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

  get pagedRows(): ServicesInvoiceRow[] {
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

  toggleSort(key: ServicesInvoiceSortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      return;
    }
    this.sortKey = key;
    this.sortDir = 'asc';
  }

  sortIcon(key: ServicesInvoiceSortKey): string {
    if (this.sortKey !== key) {
      return 'fa-sort';
    }
    return this.sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
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

  formatDateTime(iso: string): string {
    if (!iso) {
      return '—';
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return iso;
    }
    const loc = this.ui.displayLocale().startsWith('ar') ? 'ar-SA' : this.ui.displayLocale();
    return d.toLocaleString(loc, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  formatStatement(percent: number): string {
    return `${formatPmsMoney(percent, this.ui.displayLocale())}%`;
  }

  formatAmount(amount: number): string {
    return formatPmsMoney(amount, this.ui.displayLocale());
  }

  cellValue(value: string): string {
    return value?.trim() ? value : '—';
  }

  trackRow(_index: number, row: ServicesInvoiceRow): string {
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

  rowActions(_row: ServicesInvoiceRow): void {}

  private compareRows(a: ServicesInvoiceRow, b: ServicesInvoiceRow): number {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    if (this.sortKey === 'total' || this.sortKey === 'statementPercent') {
      const diff = a[this.sortKey] - b[this.sortKey];
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

  private sortValue(row: ServicesInvoiceRow, key: ServicesInvoiceSortKey): string {
    switch (key) {
      case 'invoiceNo':
        return row.invoiceNo;
      case 'invoiceDate':
        return row.invoiceDate;
      case 'createdAt':
        return row.createdAt;
      case 'returnInvoiceNo':
        return row.returnInvoiceNo;
      default:
        return '';
    }
  }
}
