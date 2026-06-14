import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { todayLocalDateString } from '../../utils/date-only';
import { HK_TASK_REQUEST_ROWS } from './hk-task-requests.static-data';
import { isWithinDateRange } from './hk-task-requests.util';
import type {
  HkTaskRequestRow,
  HkTaskRequestSortDir,
  HkTaskRequestSortKey,
  HkTaskRequestTab,
  HkTaskRequestViewMode,
} from './hk-task-requests.types';

@Component({
  selector: 'app-hk-task-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LocaleNumberPipe, UiInlineTextComponent],
  templateUrl: './hk-task-requests.component.html',
  styleUrls: ['./hk-task-requests.component.css'],
})
export class HkTaskRequestsComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly tabs: HkTaskRequestTab[] = ['incomplete', 'completed'];

  allRows: HkTaskRequestRow[] = [...HK_TASK_REQUEST_ROWS];
  activeTab: HkTaskRequestTab = 'incomplete';

  filterFromDate = todayLocalDateString();
  filterToDate = todayLocalDateString();
  appliedFromDate = todayLocalDateString();
  appliedToDate = todayLocalDateString();

  scopeFilter = '';
  searchQuery = '';
  viewMode: HkTaskRequestViewMode = 'table';

  sortKey: HkTaskRequestSortKey = 'serial';
  sortDir: HkTaskRequestSortDir = 'desc';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
  }

  label(key: string): string {
    return this.ui.screenText('hkTaskRequests', key);
  }

  tabLabel(tab: HkTaskRequestTab): string {
    return this.label(`tab_${tab}`);
  }

  tabCount(tab: HkTaskRequestTab): number {
    return this.allRows.filter((row) => (tab === 'completed') === row.completed).length;
  }

  setTab(tab: HkTaskRequestTab): void {
    this.activeTab = tab;
  }

  setViewMode(mode: HkTaskRequestViewMode): void {
    this.viewMode = mode;
  }

  applyDateFilter(): void {
    this.appliedFromDate = this.filterFromDate;
    this.appliedToDate = this.filterToDate;
  }

  get filteredRows(): HkTaskRequestRow[] {
    const q = this.searchQuery.trim().toLowerCase();
    const completed = this.activeTab === 'completed';
    let rows = this.allRows.filter(
      (row) =>
        row.completed === completed &&
        isWithinDateRange(row.taskDate, this.appliedFromDate, this.appliedToDate),
    );
    if (this.scopeFilter === 'withNotes') {
      rows = rows.filter((row) => !!row.notes.trim());
    }
    if (q) {
      rows = rows.filter((row) =>
        [row.taskName, row.notes, row.roomNo, row.employeeName].some((v) => v.toLowerCase().includes(q)),
      );
    }
    return [...rows].sort((a, b) => this.compareRows(a, b));
  }

  toggleSort(key: HkTaskRequestSortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      return;
    }
    this.sortKey = key;
    this.sortDir = 'asc';
  }

  sortIcon(key: HkTaskRequestSortKey): string {
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

  cellValue(value: string): string {
    return value?.trim() ? value : '—';
  }

  trackRow(_index: number, row: HkTaskRequestRow): string {
    return row.id;
  }

  executeTask(_row: HkTaskRequestRow): void {}

  rowActions(_row: HkTaskRequestRow): void {}

  addNew(): void {}

  private compareRows(a: HkTaskRequestRow, b: HkTaskRequestRow): number {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    if (this.sortKey === 'serial' || this.sortKey === 'roomCount') {
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

  private sortValue(row: HkTaskRequestRow, key: HkTaskRequestSortKey): string {
    switch (key) {
      case 'taskName':
        return row.taskName;
      case 'taskDate':
        return row.taskDate;
      case 'notes':
        return row.notes;
      case 'roomNo':
        return row.roomNo;
      case 'employeeName':
        return row.employeeName;
      default:
        return '';
    }
  }
}
