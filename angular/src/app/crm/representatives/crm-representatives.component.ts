import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { CRM_REPRESENTATIVE_ROWS } from './crm-representatives.static-data';
import type {
  RepresentativeRow,
  RepresentativeSortDir,
  RepresentativeSortKey,
  RepresentativeViewMode,
} from './crm-representatives.types';

@Component({
  selector: 'app-crm-representatives',
  standalone: true,
  imports: [CommonModule, FormsModule, LocaleNumberPipe, UiInlineTextComponent],
  templateUrl: './crm-representatives.component.html',
  styleUrls: ['./crm-representatives.component.css'],
})
export class CrmRepresentativesComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  allRows: RepresentativeRow[] = [...CRM_REPRESENTATIVE_ROWS];
  searchQuery = '';
  scopeFilter = '';
  viewMode: RepresentativeViewMode = 'table';

  sortKey: RepresentativeSortKey = 'name';
  sortDir: RepresentativeSortDir = 'asc';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
  }

  label(key: string): string {
    return this.ui.screenText('crmRepresentatives', key);
  }

  setViewMode(mode: RepresentativeViewMode): void {
    this.viewMode = mode;
  }

  get filteredRows(): RepresentativeRow[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = this.allRows;
    if (this.scopeFilter === 'withMobile') {
      rows = rows.filter((row) => !!row.mobile.trim());
    }
    if (this.scopeFilter === 'withForeignName') {
      rows = rows.filter((row) => !!row.foreignName.trim());
    }
    if (q) {
      rows = rows.filter((row) =>
        [row.name, row.foreignName, row.mobile, row.email].some((v) => v.toLowerCase().includes(q)),
      );
    }
    return [...rows].sort((a, b) => this.compareRows(a, b));
  }

  toggleSort(key: RepresentativeSortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      return;
    }
    this.sortKey = key;
    this.sortDir = 'asc';
  }

  sortIcon(key: RepresentativeSortKey): string {
    if (this.sortKey !== key) {
      return 'fa-sort';
    }
    return this.sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  cellValue(value: string): string {
    return value?.trim() ? value : '—';
  }

  trackRow(_index: number, row: RepresentativeRow): string {
    return row.id;
  }

  addRepresentative(): void {}

  importExport(): void {}

  rowActions(_row: RepresentativeRow): void {}

  private compareRows(a: RepresentativeRow, b: RepresentativeRow): number {
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

  private sortValue(row: RepresentativeRow, key: RepresentativeSortKey): string {
    return row[key];
  }
}
