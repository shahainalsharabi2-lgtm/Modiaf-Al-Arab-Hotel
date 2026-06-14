import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { bookingsToResidentGuestRows } from './resident-guests-data.util';
import type {
  ResidentGuestRow,
  ResidentGuestSortDir,
  ResidentGuestSortKey,
} from './resident-guests-data.types';

@Component({
  selector: 'app-resident-guests-data',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LocaleNumberPipe, UiInlineTextComponent],
  templateUrl: './resident-guests-data.component.html',
  styleUrls: ['./resident-guests-data.component.css'],
})
export class ResidentGuestsDataComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly bookingService = inject(BookingService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  allRows: ResidentGuestRow[] = [];
  loading = true;
  loadError = '';

  viewMode: 'grid' | 'list' = 'list';
  scopeFilter = '';
  searchTerm = '';

  selectedIds = new Set<string>();

  sortKey: ResidentGuestSortKey = 'reservationNo';
  sortDir: ResidentGuestSortDir = 'desc';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.loadRows();
  }

  label(key: string): string {
    return this.ui.screenText('residentGuestsData', key);
  }

  loadRows(): void {
    this.loading = true;
    this.loadError = '';
    this.bookingService
      .getBookings()
      .pipe(
        catchError((err) => {
          console.error('resident guests data: failed to load bookings', err);
          this.loadError = this.label('loadError');
          return of([]);
        }),
      )
      .subscribe((bookings) => {
        this.allRows = bookingsToResidentGuestRows(bookings);
        this.selectedIds.clear();
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  get roomTypeOptions(): string[] {
    const types = new Set<string>();
    for (const row of this.allRows) {
      if (row.roomType) {
        types.add(row.roomType);
      }
    }
    return [...types].sort((a, b) => a.localeCompare(b, 'ar'));
  }

  get filteredRows(): ResidentGuestRow[] {
    const q = this.searchTerm.trim().toLowerCase();
    let rows = this.allRows;
    if (this.scopeFilter) {
      rows = rows.filter((row) => row.roomType === this.scopeFilter);
    }
    if (q) {
      rows = rows.filter(
        (row) =>
          row.reservationNo.toLowerCase().includes(q) ||
          row.guestName.toLowerCase().includes(q) ||
          row.roomType.toLowerCase().includes(q),
      );
    }
    return [...rows].sort((a, b) => this.compareRows(a, b));
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
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

  guestInitial(name: string): string {
    const trimmed = name.trim();
    return trimmed ? trimmed.charAt(0) : 'ن';
  }

  trackRow(_index: number, row: ResidentGuestRow): string {
    return row.id;
  }

  isSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  get allVisibleSelected(): boolean {
    const rows = this.filteredRows;
    return rows.length > 0 && rows.every((row) => this.selectedIds.has(row.id));
  }

  get someVisibleSelected(): boolean {
    return this.filteredRows.some((row) => this.selectedIds.has(row.id)) && !this.allVisibleSelected;
  }

  toggleRow(id: string): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  toggleAllVisible(): void {
    if (this.allVisibleSelected) {
      for (const row of this.filteredRows) {
        this.selectedIds.delete(row.id);
      }
      return;
    }
    for (const row of this.filteredRows) {
      this.selectedIds.add(row.id);
    }
  }

  toggleSort(key: ResidentGuestSortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      return;
    }
    this.sortKey = key;
    this.sortDir = 'asc';
  }

  sortIcon(key: ResidentGuestSortKey): string {
    if (this.sortKey !== key) {
      return 'fa-sort';
    }
    return this.sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  private compareRows(a: ResidentGuestRow, b: ResidentGuestRow): number {
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

  private sortValue(row: ResidentGuestRow, key: ResidentGuestSortKey): string | number {
    switch (key) {
      case 'reservationNo':
        return Number(row.reservationNo) || row.reservationNo;
      case 'guestName':
        return row.guestName;
      case 'bookingDate':
        return row.bookingDate;
      case 'arrivalDate':
        return row.arrivalDate;
      case 'nights':
        return row.nights;
      case 'departureDate':
        return row.departureDate;
      default:
        return '';
    }
  }
}
