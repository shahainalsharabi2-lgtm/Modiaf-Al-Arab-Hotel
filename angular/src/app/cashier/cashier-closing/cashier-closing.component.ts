import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { HotelSymbolPipe } from '../../pipes/hotel-symbol.pipe';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { formatPmsMoney } from '../../utils/booking-display.util';
import { todayLocalDateString } from '../../utils/date-only';
import {
  CASHIER_CLOSING_OPERATIONS,
  CASHIER_CLOSING_USERS,
  CASHIER_DEMO_SUMMARY,
} from './cashier-closing.static-data';
import type { CashierOperationRow, CashierShiftStatus } from './cashier-closing.types';

@Component({
  selector: 'app-cashier-closing',
  standalone: true,
  imports: [CommonModule, FormsModule, LocaleNumberPipe, HotelSymbolPipe, UiInlineTextComponent],
  templateUrl: './cashier-closing.component.html',
  styleUrls: ['./cashier-closing.component.css'],
})
export class CashierClosingComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly users = CASHIER_CLOSING_USERS;
  readonly pageSizeOptions = [10, 50, 100] as const;

  selectedUserId = CASHIER_CLOSING_USERS[0]?.id ?? '';
  shiftDate = todayLocalDateString();
  status: CashierShiftStatus = 'open';

  openingBalance = CASHIER_DEMO_SUMMARY.openingBalance;
  receipts = CASHIER_DEMO_SUMMARY.receipts;
  payments = CASHIER_DEMO_SUMMARY.payments;
  total = CASHIER_DEMO_SUMMARY.total;
  balance = CASHIER_DEMO_SUMMARY.balance;

  actualCash: number | null = CASHIER_DEMO_SUMMARY.actualCash;
  actualChecks: number | null = null;

  operations: CashierOperationRow[] = [...CASHIER_CLOSING_OPERATIONS];
  pageSize: (typeof this.pageSizeOptions)[number] = 10;
  currentPage = 1;

  closing = false;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
  }

  label(key: string): string {
    return this.ui.screenText('cashierClosing', key);
  }

  opLabel(row: CashierOperationRow): string {
    return this.label(row.descriptionKey);
  }

  get selectedUser() {
    return this.users.find((u) => u.id === this.selectedUserId) ?? this.users[0];
  }

  get totalOperationCount(): number {
    return this.operations.reduce((sum, row) => sum + row.count, 0);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.operations.length / this.pageSize));
  }

  get pagedOperations(): CashierOperationRow[] {
    const safePage = Math.min(this.currentPage, this.totalPages);
    const start = (safePage - 1) * this.pageSize;
    return this.operations.slice(start, start + this.pageSize);
  }

  formatMoney(amount: number | null | undefined): string {
    return formatPmsMoney(amount, this.ui.displayLocale());
  }

  formatDate(iso: string): string {
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) {
      return iso;
    }
    return `${y}/${m}/${d}`;
  }

  userInitial(username: string): string {
    const trimmed = username.trim();
    return trimmed ? trimmed.charAt(0).toLowerCase() : 'a';
  }

  trackOp(_index: number, row: CashierOperationRow): string {
    return row.id;
  }

  setPageSize(size: number): void {
    this.pageSize = size as (typeof this.pageSizeOptions)[number];
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    this.currentPage = Math.min(Math.max(1, page), this.totalPages);
  }

  pageSummary(): string {
    return this.label('pageSummary')
      .replace('{page}', String(this.currentPage | 0))
      .replace('{pages}', String(this.totalPages | 0))
      .replace('{count}', String(this.operations.length | 0));
  }

  closeCashier(): void {
    if (this.status === 'closed' || this.closing) {
      return;
    }
    this.closing = true;
    this.status = 'closed';
    this.closing = false;
  }

  printReport(): void {
    window.print();
  }

  amountClass(amount: number): string {
    return amount < 0 ? 'cc-amount--negative' : 'cc-amount--positive';
  }
}
