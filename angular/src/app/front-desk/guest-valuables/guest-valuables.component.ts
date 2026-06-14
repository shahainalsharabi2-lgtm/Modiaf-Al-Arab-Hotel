import { CommonModule } from '@angular/common';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { BookingService } from '../../services/booking.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import {
  bookingsToDepositReservations,
  filterDepositReservations,
  nextDepositReceiptNo,
  occupiedSafeBoxNumbers,
  type DepositReservationOption,
} from './guest-valuables.deposit.util';
import {
  GUEST_VALUABLE_DEPOSITS,
  LOST_FOUND_ITEMS,
  SAFE_BOX_NUMBERS,
  VALUABLE_CATEGORY_KEYS,
} from './guest-valuables.static-data';
import type {
  GuestValuableDepositRow,
  GuestValuableScopeFilter,
  GuestValuableSortKey,
  GuestValuablesSortDir,
  GuestValuablesTab,
  LostFoundItemRow,
  LostFoundScopeFilter,
  LostFoundSortKey,
} from './guest-valuables.types';

@Component({
  selector: 'app-guest-valuables',
  standalone: true,
  imports: [CommonModule, FormsModule, LocaleNumberPipe, UiInlineTextComponent],
  templateUrl: './guest-valuables.component.html',
  styleUrls: ['./guest-valuables.component.css'],
})
export class GuestValuablesComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly bookingService = inject(BookingService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly tabs: GuestValuablesTab[] = ['valuables', 'lostFound'];
  readonly categoryKeys = VALUABLE_CATEGORY_KEYS;
  readonly safeBoxNumbers = SAFE_BOX_NUMBERS;

  deposits: GuestValuableDepositRow[] = GUEST_VALUABLE_DEPOSITS.map((row) => ({ ...row }));
  lostItems: LostFoundItemRow[] = LOST_FOUND_ITEMS.map((row) => ({ ...row }));

  activeTab: GuestValuablesTab = 'valuables';
  valuablesScope: GuestValuableScopeFilter = 'all';
  lostScope: LostFoundScopeFilter = 'all';
  searchQuery = '';

  valuablesSortKey: GuestValuableSortKey = 'receiptNo';
  lostSortKey: LostFoundSortKey = 'referenceNo';
  sortDir: GuestValuablesSortDir = 'desc';

  depositModalOpen = false;
  depositBookingsLoading = false;
  depositFormError = '';
  reservationOptions: DepositReservationOption[] = [];
  reservationSearch = '';
  reservationListOpen = false;
  selectedBookingId = '';

  depositGuestName = '';
  depositRoomNo = '';
  depositQuantity = 1;
  depositCategoryKey = 'catOther';
  depositSafeBoxNo = '';
  depositDescription = '';
  depositStatement = '';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
  }

  label(key: string): string {
    return this.ui.screenText('guestValuables', key);
  }

  setTab(tab: GuestValuablesTab): void {
    this.activeTab = tab;
    this.searchQuery = '';
  }

  refresh(): void {
    this.deposits = GUEST_VALUABLE_DEPOSITS.map((row) => ({ ...row }));
    this.lostItems = LOST_FOUND_ITEMS.map((row) => ({ ...row }));
    this.cdr.markForCheck();
  }

  addDeposit(): void {
    this.resetDepositForm();
    this.depositModalOpen = true;
    this.loadDepositReservations();
  }

  closeDepositModal(): void {
    this.depositModalOpen = false;
    this.reservationListOpen = false;
    this.depositFormError = '';
  }

  openReservationList(): void {
    this.reservationListOpen = true;
  }

  closeReservationList(): void {
    window.setTimeout(() => {
      this.reservationListOpen = false;
      this.cdr.markForCheck();
    }, 150);
  }

  selectReservation(option: DepositReservationOption): void {
    this.selectedBookingId = option.id;
    this.reservationSearch = option.label;
    this.depositGuestName = option.guestName;
    this.depositRoomNo = option.roomNo;
    this.reservationListOpen = false;
    this.depositFormError = '';
  }

  submitDeposit(): void {
    const guestName = this.depositGuestName.trim();
    const description = this.depositDescription.trim();
    const safeBoxNo = this.depositSafeBoxNo.trim();
    const quantity = Math.max(1, Number(this.depositQuantity) || 1);

    if (!guestName || !description || !safeBoxNo) {
      this.depositFormError = this.label('depositRequiredHint');
      return;
    }

    if (this.occupiedSafeBoxes.has(safeBoxNo)) {
      this.depositFormError = this.label('depositSafeBoxHint');
      return;
    }

    const receiptNo = nextDepositReceiptNo(this.deposits);
    this.deposits = [
      {
        id: `dep-${Date.now()}`,
        receiptNo,
        guestName,
        roomNo: this.depositRoomNo.trim(),
        categoryKey: this.depositCategoryKey,
        description,
        quantity,
        safeBoxNo,
        status: 'in_custody',
      },
      ...this.deposits,
    ];
    this.closeDepositModal();
    this.cdr.markForCheck();
  }

  isSafeBoxDisabled(boxNo: string): boolean {
    return this.occupiedSafeBoxes.has(boxNo);
  }

  get filteredReservationOptions(): DepositReservationOption[] {
    return filterDepositReservations(this.reservationOptions, this.reservationSearch);
  }

  get occupiedSafeBoxes(): Set<string> {
    return occupiedSafeBoxNumbers(this.deposits);
  }

  registerLost(): void {}

  viewDeposit(_row: GuestValuableDepositRow): void {}

  viewLost(_row: LostFoundItemRow): void {}

  categoryLabel(key: string): string {
    return this.label(key);
  }

  custodyStatusLabel(status: GuestValuableDepositRow['status']): string {
    return status === 'delivered' ? this.label('statusDelivered') : this.label('statusInCustody');
  }

  lostStatusLabel(status: LostFoundItemRow['status']): string {
    switch (status) {
      case 'delivered':
        return this.label('lostStatusDelivered');
      case 'disposed':
        return this.label('lostStatusDisposed');
      case 'expired':
        return this.label('lostStatusExpired');
      default:
        return this.label('lostStatusOpen');
    }
  }

  safeBoxLabel(no: string): string {
    const value = String(no ?? '').trim();
    if (!value) {
      return '—';
    }
    return this.label('safeBoxLabel').replace('{no}', value);
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

  get filteredDeposits(): GuestValuableDepositRow[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = this.deposits.filter((row) => {
      if (this.valuablesScope === 'inCustody' && row.status !== 'in_custody') {
        return false;
      }
      if (this.valuablesScope === 'delivered' && row.status !== 'delivered') {
        return false;
      }
      if (!q) {
        return true;
      }
      return [row.receiptNo, row.guestName, row.roomNo, row.description, this.categoryLabel(row.categoryKey)]
        .some((v) => v.toLowerCase().includes(q));
    });
    rows = [...rows].sort((a, b) => this.compareValuables(a, b));
    return rows;
  }

  get filteredLostItems(): LostFoundItemRow[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = this.lostItems.filter((row) => {
      if (this.lostScope !== 'all' && row.status !== this.lostScope) {
        return false;
      }
      if (!q) {
        return true;
      }
      return [
        row.referenceNo,
        row.description,
        this.categoryLabel(row.categoryKey),
        row.foundLocation,
        row.safeBoxNo,
      ].some((v) => v.toLowerCase().includes(q));
    });
    rows = [...rows].sort((a, b) => this.compareLost(a, b));
    return rows;
  }

  toggleValuablesSort(key: GuestValuableSortKey): void {
    this.toggleSort(key);
  }

  toggleLostSort(key: LostFoundSortKey): void {
    this.toggleSort(key);
  }

  sortIcon(key: string): string {
    const activeKey = this.activeTab === 'valuables' ? this.valuablesSortKey : this.lostSortKey;
    if (activeKey !== key) {
      return 'fa-sort';
    }
    return this.sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  trackDeposit(_index: number, row: GuestValuableDepositRow): string {
    return row.id;
  }

  trackLost(_index: number, row: LostFoundItemRow): string {
    return row.id;
  }

  private resetDepositForm(): void {
    this.depositFormError = '';
    this.reservationSearch = '';
    this.selectedBookingId = '';
    this.depositGuestName = '';
    this.depositRoomNo = '';
    this.depositQuantity = 1;
    this.depositCategoryKey = 'catOther';
    this.depositSafeBoxNo = '';
    this.depositDescription = '';
    this.depositStatement = '';
    this.reservationListOpen = false;
  }

  private loadDepositReservations(): void {
    if (this.reservationOptions.length > 0 || this.depositBookingsLoading) {
      return;
    }
    this.depositBookingsLoading = true;
    this.bookingService
      .getBookings()
      .pipe(
        catchError((err) => {
          console.error('guest valuables: failed to load bookings', err);
          return of([]);
        }),
      )
      .subscribe((bookings) => {
        this.reservationOptions = bookingsToDepositReservations(bookings);
        this.depositBookingsLoading = false;
        this.cdr.markForCheck();
      });
  }

  private toggleSort(key: GuestValuableSortKey | LostFoundSortKey): void {
    const currentKey = this.activeTab === 'valuables' ? this.valuablesSortKey : this.lostSortKey;
    if (currentKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      return;
    }
    if (this.activeTab === 'valuables') {
      this.valuablesSortKey = key as GuestValuableSortKey;
    } else {
      this.lostSortKey = key as LostFoundSortKey;
    }
    this.sortDir = 'asc';
  }

  private compareValuables(a: GuestValuableDepositRow, b: GuestValuableDepositRow): number {
    return this.compareValues(this.valuablesValue(a, this.valuablesSortKey), this.valuablesValue(b, this.valuablesSortKey));
  }

  private compareLost(a: LostFoundItemRow, b: LostFoundItemRow): number {
    return this.compareValues(this.lostValue(a, this.lostSortKey), this.lostValue(b, this.lostSortKey));
  }

  private compareValues(av: string | number, bv: string | number): number {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    if (av < bv) {
      return -1 * dir;
    }
    if (av > bv) {
      return 1 * dir;
    }
    return 0;
  }

  private valuablesValue(row: GuestValuableDepositRow, key: GuestValuableSortKey): string | number {
    switch (key) {
      case 'receiptNo':
        return row.receiptNo;
      case 'guestName':
        return row.guestName;
      case 'roomNo':
        return Number(row.roomNo) || row.roomNo;
      case 'category':
        return this.categoryLabel(row.categoryKey);
      case 'description':
        return row.description;
      case 'quantity':
        return row.quantity;
      case 'safeBoxNo':
        return Number(row.safeBoxNo) || row.safeBoxNo;
      default:
        return '';
    }
  }

  private lostValue(row: LostFoundItemRow, key: LostFoundSortKey): string | number {
    switch (key) {
      case 'referenceNo':
        return row.referenceNo;
      case 'description':
        return row.description;
      case 'category':
        return this.categoryLabel(row.categoryKey);
      case 'foundLocation':
        return row.foundLocation;
      case 'safeBoxNo':
        return Number(row.safeBoxNo) || row.safeBoxNo;
      case 'status':
        return this.lostStatusLabel(row.status);
      case 'foundDate':
        return row.foundDate;
      default:
        return '';
    }
  }
}
