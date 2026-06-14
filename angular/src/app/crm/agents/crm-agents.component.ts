import { CommonModule } from '@angular/common';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { BookingService } from '../../services/booking.service';
import { GuestRegistryService } from '../../services/guest-registry.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { buildAgentRows } from './crm-agents.util';
import type {
  CrmAgentRow,
  CrmAgentScopeFilter,
  CrmAgentSortDir,
  CrmAgentSortKey,
  CrmAgentViewMode,
} from './crm-agents.types';

@Component({
  selector: 'app-crm-agents',
  standalone: true,
  imports: [CommonModule, FormsModule, LocaleNumberPipe, UiInlineTextComponent],
  templateUrl: './crm-agents.component.html',
  styleUrls: ['./crm-agents.component.css'],
})
export class CrmAgentsComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly guestRegistry = inject(GuestRegistryService);
  private readonly bookingService = inject(BookingService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  allRows: CrmAgentRow[] = [];
  loading = true;
  loadError = '';

  searchQuery = '';
  scopeFilter: CrmAgentScopeFilter = 'all';
  viewMode: CrmAgentViewMode = 'table';

  sortKey: CrmAgentSortKey = 'name';
  sortDir: CrmAgentSortDir = 'asc';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.loadRows();
  }

  label(key: string): string {
    return this.ui.screenText('crmAgents', key);
  }

  loadRows(): void {
    this.loading = true;
    this.loadError = '';
    let guestsFailed = false;
    let bookingsFailed = false;
    forkJoin({
      guests: this.guestRegistry.getGuests().pipe(
        catchError((err) => {
          console.error('crm agents: failed to load guest registry', err);
          guestsFailed = true;
          return of([]);
        }),
      ),
      bookings: this.bookingService.getBookings().pipe(
        catchError((err) => {
          console.error('crm agents: failed to load bookings', err);
          bookingsFailed = true;
          return of([]);
        }),
      ),
    }).subscribe(({ guests, bookings }) => {
      if (guestsFailed && bookingsFailed) {
        this.loadError = this.label('loadError');
      }
      this.allRows = buildAgentRows(guests, bookings);
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  setViewMode(mode: CrmAgentViewMode): void {
    this.viewMode = mode;
  }

  get filteredRows(): CrmAgentRow[] {
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
      return [row.name, row.foreignName, row.mobile, row.email].some((v) => v.toLowerCase().includes(q));
    });
    rows = [...rows].sort((a, b) => this.compareRows(a, b));
    return rows;
  }

  toggleSort(key: CrmAgentSortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      return;
    }
    this.sortKey = key;
    this.sortDir = 'asc';
  }

  sortIcon(key: CrmAgentSortKey): string {
    if (this.sortKey !== key) {
      return 'fa-sort';
    }
    return this.sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  cellValue(value: string): string {
    return value?.trim() ? value : '—';
  }

  trackRow(_index: number, row: CrmAgentRow): string {
    return row.id;
  }

  addAgent(): void {}

  importExport(): void {}

  rowActions(_row: CrmAgentRow): void {}

  private compareRows(a: CrmAgentRow, b: CrmAgentRow): number {
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

  private sortValue(row: CrmAgentRow, key: CrmAgentSortKey): string {
    switch (key) {
      case 'name':
        return row.name;
      case 'foreignName':
        return row.foreignName;
      case 'mobile':
        return row.mobile;
      case 'email':
        return row.email;
      default:
        return '';
    }
  }
}
