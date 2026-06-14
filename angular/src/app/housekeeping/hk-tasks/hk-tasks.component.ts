import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { HK_TASK_ROWS } from './hk-tasks.static-data';
import type { HkTaskRow, HkTaskSortDir, HkTaskSortKey } from './hk-tasks.types';

@Component({
  selector: 'app-hk-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, LocaleNumberPipe, UiInlineTextComponent],
  templateUrl: './hk-tasks.component.html',
  styleUrls: ['./hk-tasks.component.css'],
})
export class HkTasksComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  allRows: HkTaskRow[] = [...HK_TASK_ROWS];
  searchQuery = '';

  sortKey: HkTaskSortKey = 'displayOrder';
  sortDir: HkTaskSortDir = 'asc';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
  }

  label(key: string): string {
    return this.ui.screenText('hkTasks', key);
  }

  get filteredRows(): HkTaskRow[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = this.allRows;
    if (q) {
      rows = rows.filter((row) =>
        [row.name, row.foreignName, row.code, row.description].some((v) => v.toLowerCase().includes(q)),
      );
    }
    return [...rows].sort((a, b) => this.compareRows(a, b));
  }

  toggleSort(key: HkTaskSortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      return;
    }
    this.sortKey = key;
    this.sortDir = 'asc';
  }

  sortIcon(key: HkTaskSortKey): string {
    if (this.sortKey !== key) {
      return 'fa-sort';
    }
    return this.sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  cellValue(value: string): string {
    return value?.trim() ? value : '—';
  }

  trackRow(_index: number, row: HkTaskRow): string {
    return row.id;
  }

  addNew(): void {}

  rowActions(_row: HkTaskRow): void {}

  private compareRows(a: HkTaskRow, b: HkTaskRow): number {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    if (
      this.sortKey === 'rowNo' ||
      this.sortKey === 'points' ||
      this.sortKey === 'timeUnit' ||
      this.sortKey === 'requiredTime' ||
      this.sortKey === 'displayOrder'
    ) {
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

  private sortValue(row: HkTaskRow, key: HkTaskSortKey): string {
    switch (key) {
      case 'name':
        return row.name;
      case 'foreignName':
        return row.foreignName;
      case 'code':
        return row.code;
      case 'description':
        return row.description;
      default:
        return '';
    }
  }
}
