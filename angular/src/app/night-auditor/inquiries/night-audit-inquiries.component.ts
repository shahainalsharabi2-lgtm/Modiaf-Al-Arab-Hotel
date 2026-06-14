import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { todayLocalDateString } from '../../utils/date-only';
import { NIGHT_AUDIT_INQUIRY_ROWS } from './night-audit-inquiries.static-data';
import { isWithinDateRange } from './night-audit-inquiries.util';
import type {
  NightAuditInquiryRow,
  NightAuditInquirySortDir,
  NightAuditInquirySortKey,
} from './night-audit-inquiries.types';

@Component({
  selector: 'app-night-audit-inquiries',
  standalone: true,
  imports: [CommonModule, FormsModule, LocaleNumberPipe, UiInlineTextComponent],
  templateUrl: './night-audit-inquiries.component.html',
  styleUrls: ['./night-audit-inquiries.component.css'],
})
export class NightAuditInquiriesComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly pageSizeOptions = [10, 50, 100, 500, 1000] as const;

  allRows: NightAuditInquiryRow[] = [];

  filterPanelOpen = false;
  filterFromDate = todayLocalDateString();
  filterToDate = todayLocalDateString();
  appliedFromDate = todayLocalDateString();
  appliedToDate = todayLocalDateString();

  pageSize: (typeof this.pageSizeOptions)[number] = 10;
  currentPage = 1;

  sortKey: NightAuditInquirySortKey = 'transactionNo';
  sortDir: NightAuditInquirySortDir = 'desc';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.loadRows();
  }

  label(key: string): string {
    return this.ui.screenText('nightAuditInquiries', key);
  }

  loadRows(): void {
    const today = todayLocalDateString();
    this.allRows = NIGHT_AUDIT_INQUIRY_ROWS.map((row) => ({
      ...row,
      documentDate: today,
    }));
  }

  refresh(): void {
    this.loadRows();
    this.currentPage = 1;
    this.cdr.markForCheck();
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

  get filteredRows(): NightAuditInquiryRow[] {
    let rows = this.allRows.filter((row) =>
      isWithinDateRange(row.documentDate, this.appliedFromDate, this.appliedToDate),
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

  get pagedRows(): NightAuditInquiryRow[] {
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

  toggleSort(key: NightAuditInquirySortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      return;
    }
    this.sortKey = key;
    this.sortDir = 'asc';
  }

  sortIcon(key: NightAuditInquirySortKey): string {
    if (this.sortKey !== key) {
      return 'fa-sort';
    }
    return this.sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  accountLabel(row: NightAuditInquiryRow): string {
    return `${row.accountNo} - ${this.label(row.accountNameKey)}`;
  }

  descriptionLabel(row: NightAuditInquiryRow): string {
    return this.label(row.descriptionKey);
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

  cellValue(value: string): string {
    return value?.trim() ? value : '—';
  }

  trackRow(_index: number, row: NightAuditInquiryRow): string {
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

  private compareRows(a: NightAuditInquiryRow, b: NightAuditInquiryRow): number {
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

  private sortValue(row: NightAuditInquiryRow, key: NightAuditInquirySortKey): string {
    switch (key) {
      case 'transactionNo':
        return row.transactionNo.padStart(8, '0');
      case 'documentDate':
        return row.documentDate;
      case 'documentNo':
        return row.documentNo;
      case 'account':
        return this.accountLabel(row);
      case 'bookingNo':
        return row.bookingNo;
      case 'description':
        return this.descriptionLabel(row);
      default:
        return '';
    }
  }
}
