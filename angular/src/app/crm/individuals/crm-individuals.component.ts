import { CommonModule } from '@angular/common';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { GuestRegistryService } from '../../services/guest-registry.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { guestRegistriesToIndividualRows } from './crm-individuals.util';
import type {
  CrmIndividualRow,
  CrmIndividualScopeFilter,
  CrmIndividualSortDir,
  CrmIndividualSortKey,
  CrmIndividualViewMode,
} from './crm-individuals.types';

@Component({
  selector: 'app-crm-individuals',
  standalone: true,
  imports: [CommonModule, FormsModule, LocaleNumberPipe, UiInlineTextComponent],
  templateUrl: './crm-individuals.component.html',
  styleUrls: ['./crm-individuals.component.css'],
})
export class CrmIndividualsComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly guestRegistry = inject(GuestRegistryService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  allRows: CrmIndividualRow[] = [];
  loading = true;
  loadError = '';

  searchQuery = '';
  scopeFilter: CrmIndividualScopeFilter = 'all';
  viewMode: CrmIndividualViewMode = 'table';

  sortKey: CrmIndividualSortKey = 'guestName';
  sortDir: CrmIndividualSortDir = 'asc';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.loadRows();
  }

  label(key: string): string {
    return this.ui.screenText('crmIndividuals', key);
  }

  loadRows(): void {
    this.loading = true;
    this.loadError = '';
    this.guestRegistry
      .getGuests()
      .pipe(
        catchError((err) => {
          console.error('crm individuals: failed to load guests', err);
          this.loadError = this.label('loadError');
          return of([]);
        }),
      )
      .subscribe((guests) => {
        this.allRows = guestRegistriesToIndividualRows(guests);
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  refresh(): void {
    this.loadRows();
  }

  setViewMode(mode: CrmIndividualViewMode): void {
    this.viewMode = mode;
  }

  get filteredRows(): CrmIndividualRow[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = this.allRows.filter((row) => {
      if (this.scopeFilter === 'withMobile' && !row.mobile) {
        return false;
      }
      if (this.scopeFilter === 'withId' && !row.idNumber) {
        return false;
      }
      if (!q) {
        return true;
      }
      return [
        row.guestName,
        row.country,
        row.nationality,
        row.birthPlace,
        row.birthDate,
        row.mobile,
        row.email,
        row.idNumber,
      ].some((v) => v.toLowerCase().includes(q));
    });
    rows = [...rows].sort((a, b) => this.compareRows(a, b));
    return rows;
  }

  toggleSort(key: CrmIndividualSortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      return;
    }
    this.sortKey = key;
    this.sortDir = 'asc';
  }

  sortIcon(key: CrmIndividualSortKey): string {
    if (this.sortKey !== key) {
      return 'fa-sort';
    }
    return this.sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  cellValue(value: string): string {
    return value?.trim() ? value : '—';
  }

  trackRow(_index: number, row: CrmIndividualRow): string {
    return row.id;
  }

  addGuest(): void {
    // تجربة واجهة — ربط نموذج إضافة لاحقاً
  }

  importExport(): void {
    // تجربة واجهة — ربط استيراد/تصدير لاحقاً
  }

  rowActions(_row: CrmIndividualRow): void {
    // تجربة واجهة — قائمة إجراءات لاحقاً
  }

  private compareRows(a: CrmIndividualRow, b: CrmIndividualRow): number {
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

  private sortValue(row: CrmIndividualRow, key: CrmIndividualSortKey): string {
    switch (key) {
      case 'guestName':
        return row.guestName;
      case 'country':
        return row.country;
      case 'nationality':
        return row.nationality;
      case 'birthPlace':
        return row.birthPlace;
      case 'birthDate':
        return row.birthDate;
      case 'mobile':
        return row.mobile;
      case 'email':
        return row.email;
      case 'idNumber':
        return row.idNumber;
      default:
        return '';
    }
  }
}
