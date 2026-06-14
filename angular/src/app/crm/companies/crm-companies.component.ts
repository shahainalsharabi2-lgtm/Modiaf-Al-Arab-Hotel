import { CommonModule } from '@angular/common';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { BookingService } from '../../services/booking.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { bookingsToCompanyRows } from './crm-companies.util';
import type {
  CrmCompanyRow,
  CrmCompanyScopeFilter,
  CrmCompanySortDir,
  CrmCompanySortKey,
  CrmCompanyViewMode,
} from './crm-companies.types';

@Component({
  selector: 'app-crm-companies',
  standalone: true,
  imports: [CommonModule, FormsModule, LocaleNumberPipe, UiInlineTextComponent],
  templateUrl: './crm-companies.component.html',
  styleUrls: ['./crm-companies.component.css'],
})
export class CrmCompaniesComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly bookingService = inject(BookingService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  allRows: CrmCompanyRow[] = [];
  loading = true;
  loadError = '';

  searchQuery = '';
  scopeFilter: CrmCompanyScopeFilter = 'all';
  viewMode: CrmCompanyViewMode = 'table';

  sortKey: CrmCompanySortKey = 'name';
  sortDir: CrmCompanySortDir = 'asc';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.loadRows();
  }

  label(key: string): string {
    return this.ui.screenText('crmCompanies', key);
  }

  loadRows(): void {
    this.loading = true;
    this.loadError = '';
    this.bookingService
      .getBookings()
      .pipe(
        catchError((err) => {
          console.error('crm companies: failed to load bookings', err);
          this.loadError = this.label('loadError');
          return of([]);
        }),
      )
      .subscribe((bookings) => {
        this.allRows = bookingsToCompanyRows(bookings);
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  setViewMode(mode: CrmCompanyViewMode): void {
    this.viewMode = mode;
  }

  get filteredRows(): CrmCompanyRow[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = this.allRows.filter((row) => {
      if (this.scopeFilter === 'withMobile' && !row.mobile) {
        return false;
      }
      if (this.scopeFilter === 'withForeignName' && !row.foreignName) {
        return false;
      }
      if (!q) {
        return true;
      }
      return [row.name, row.foreignName, row.country, row.mobile, row.email].some((v) =>
        v.toLowerCase().includes(q),
      );
    });
    rows = [...rows].sort((a, b) => this.compareRows(a, b));
    return rows;
  }

  toggleSort(key: CrmCompanySortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      return;
    }
    this.sortKey = key;
    this.sortDir = 'asc';
  }

  sortIcon(key: CrmCompanySortKey): string {
    if (this.sortKey !== key) {
      return 'fa-sort';
    }
    return this.sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  cellValue(value: string): string {
    return value?.trim() ? value : '—';
  }

  trackRow(_index: number, row: CrmCompanyRow): string {
    return row.id;
  }

  addCompany(): void {}

  importExport(): void {}

  rowActions(_row: CrmCompanyRow): void {}

  private compareRows(a: CrmCompanyRow, b: CrmCompanyRow): number {
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

  private sortValue(row: CrmCompanyRow, key: CrmCompanySortKey): string {
    switch (key) {
      case 'name':
        return row.name;
      case 'foreignName':
        return row.foreignName;
      case 'country':
        return row.country;
      case 'mobile':
        return row.mobile;
      case 'email':
        return row.email;
      default:
        return '';
    }
  }
}
