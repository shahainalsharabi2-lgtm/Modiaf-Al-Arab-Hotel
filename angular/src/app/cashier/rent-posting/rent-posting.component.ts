import { CommonModule } from '@angular/common';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { BookingService } from '../../services/booking.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { bookingsToRentPostingRows } from './rent-posting.util';
import type { RentPostingRow, RentPostingSortDir, RentPostingSortKey } from './rent-posting.types';

@Component({
  selector: 'app-rent-posting',
  standalone: true,
  imports: [CommonModule, FormsModule, LocaleNumberPipe, UiInlineTextComponent],
  templateUrl: './rent-posting.component.html',
  styleUrls: ['./rent-posting.component.css'],
})
export class RentPostingComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly bookingService = inject(BookingService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly pageSizeOptions = [10, 50, 100, 500, 1000] as const;

  allRows: RentPostingRow[] = [];
  loading = true;
  loadError = '';

  selectedIds = new Set<string>();
  pageSize: (typeof this.pageSizeOptions)[number] = 10;
  currentPage = 1;

  sortKey: RentPostingSortKey = 'bookingNo';
  sortDir: RentPostingSortDir = 'asc';

  filterBookingNo = '';
  filterRoomNo = '';
  filterGuestName = '';
  filterArrival = '';
  filterDeparture = '';
  filterLastPost = '';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.loadRows();
  }

  label(key: string): string {
    return this.ui.screenText('rentPosting', key);
  }

  loadRows(): void {
    this.loading = true;
    this.loadError = '';
    this.bookingService
      .getBookings()
      .pipe(
        catchError((err) => {
          console.error('rent posting: failed to load bookings', err);
          this.loadError = this.label('loadError');
          return of([]);
        }),
      )
      .subscribe((bookings) => {
        this.allRows = bookingsToRentPostingRows(bookings);
        this.pruneSelection();
        this.loading = false;
        this.currentPage = 1;
        this.cdr.markForCheck();
      });
  }

  get filteredRows(): RentPostingRow[] {
    const bookingQ = this.filterBookingNo.trim().toLowerCase();
    const roomQ = this.filterRoomNo.trim().toLowerCase();
    const nameQ = this.filterGuestName.trim().toLowerCase();

    let rows = this.allRows.filter((row) => {
      if (bookingQ && !row.bookingNo.toLowerCase().includes(bookingQ)) {
        return false;
      }
      if (roomQ && !row.roomNo.toLowerCase().includes(roomQ)) {
        return false;
      }
      if (nameQ && !row.guestName.toLowerCase().includes(nameQ)) {
        return false;
      }
      if (this.filterArrival && row.arrivalDate !== this.filterArrival) {
        return false;
      }
      if (this.filterDeparture && row.departureDate !== this.filterDeparture) {
        return false;
      }
      if (this.filterLastPost && row.lastPostDate !== this.filterLastPost) {
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

  get pagedRows(): RentPostingRow[] {
    const safePage = Math.min(this.currentPage, this.totalPages);
    const start = (safePage - 1) * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  get allVisibleSelected(): boolean {
    return this.pagedRows.length > 0 && this.pagedRows.every((row) => this.selectedIds.has(row.id));
  }

  get someVisibleSelected(): boolean {
    return this.pagedRows.some((row) => this.selectedIds.has(row.id));
  }

  setPageSize(size: number): void {
    this.pageSize = size as (typeof this.pageSizeOptions)[number];
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    this.currentPage = Math.min(Math.max(1, page), this.totalPages);
  }

  toggleSort(key: RentPostingSortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      return;
    }
    this.sortKey = key;
    this.sortDir = 'asc';
  }

  sortIcon(key: RentPostingSortKey): string {
    if (this.sortKey !== key) {
      return 'fa-sort';
    }
    return this.sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  toggleRow(row: RentPostingRow): void {
    if (this.selectedIds.has(row.id)) {
      this.selectedIds.delete(row.id);
      return;
    }
    this.selectedIds.add(row.id);
  }

  toggleSelectAllVisible(): void {
    if (this.allVisibleSelected) {
      this.pagedRows.forEach((row) => this.selectedIds.delete(row.id));
      return;
    }
    this.pagedRows.forEach((row) => this.selectedIds.add(row.id));
  }

  isSelected(row: RentPostingRow): boolean {
    return this.selectedIds.has(row.id);
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

  trackRow(_index: number, row: RentPostingRow): string {
    return row.id;
  }

  postSelected(): void {
    // يُربط بخدمة ترحيل الإيجار عند توفرها في الخادم
  }

  postAll(): void {
    this.filteredRows.forEach((row) => this.selectedIds.add(row.id));
  }

  postRentAndTax(): void {
    // يُربط بخدمة ترحيل الإيجار عند توفرها في الخادم
  }

  cancelPosting(): void {
    this.selectedIds.clear();
  }

  pageSummary(): string {
    return this.label('pageSummary')
      .replace('{page}', String(this.currentPage | 0))
      .replace('{pages}', String(this.totalPages | 0))
      .replace('{count}', String(this.totalItems | 0));
  }

  private pruneSelection(): void {
    const valid = new Set(this.allRows.map((row) => row.id));
    for (const id of this.selectedIds) {
      if (!valid.has(id)) {
        this.selectedIds.delete(id);
      }
    }
  }

  private compareRows(a: RentPostingRow, b: RentPostingRow): number {
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

  private sortValue(row: RentPostingRow, key: RentPostingSortKey): string {
    switch (key) {
      case 'bookingNo':
        return row.bookingNo;
      case 'roomNo':
        return row.roomNo.padStart(6, '0');
      case 'guestName':
        return row.guestName;
      case 'arrivalDate':
        return row.arrivalDate;
      case 'departureDate':
        return row.departureDate;
      case 'lastPostDate':
        return row.lastPostDate;
      default:
        return '';
    }
  }
}
