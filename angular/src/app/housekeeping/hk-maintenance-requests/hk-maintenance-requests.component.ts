import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { HK_MAINTENANCE_REQUEST_ROWS } from './hk-maintenance-requests.static-data';
import type {
  HkMaintenanceRequestRow,
  HkMaintenanceRequestSortDir,
  HkMaintenanceRequestSortKey,
  HkMaintenanceRequestViewMode,
} from './hk-maintenance-requests.types';

@Component({
  selector: 'app-hk-maintenance-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, LocaleNumberPipe, UiInlineTextComponent],
  templateUrl: './hk-maintenance-requests.component.html',
  styleUrls: ['./hk-maintenance-requests.component.css'],
})
export class HkMaintenanceRequestsComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  allRows: HkMaintenanceRequestRow[] = [...HK_MAINTENANCE_REQUEST_ROWS];

  scopeFilter = '';
  searchQuery = '';
  viewMode: HkMaintenanceRequestViewMode = 'table';

  sortKey: HkMaintenanceRequestSortKey = 'serial';
  sortDir: HkMaintenanceRequestSortDir = 'desc';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
  }

  label(key: string): string {
    return this.ui.screenText('hkMaintenanceRequests', key);
  }

  setViewMode(mode: HkMaintenanceRequestViewMode): void {
    this.viewMode = mode;
  }

  get filteredRows(): HkMaintenanceRequestRow[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = [...this.allRows];
    if (this.scopeFilter === 'withReason') {
      rows = rows.filter((row) => !!row.reason.trim());
    }
    if (q) {
      rows = rows.filter((row) =>
        [String(row.serial), row.roomNo, row.reason, row.createdBy].some((v) => v.toLowerCase().includes(q)),
      );
    }
    return rows.sort((a, b) => this.compareRows(a, b));
  }

  toggleSort(key: HkMaintenanceRequestSortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      return;
    }
    this.sortKey = key;
    this.sortDir = 'asc';
  }

  sortIcon(key: HkMaintenanceRequestSortKey): string {
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

  trackRow(_index: number, row: HkMaintenanceRequestRow): string {
    return row.id;
  }

  completeMaintenance(_row: HkMaintenanceRequestRow): void {}

  private compareRows(a: HkMaintenanceRequestRow, b: HkMaintenanceRequestRow): number {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    if (this.sortKey === 'serial') {
      const diff = a.serial - b.serial;
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

  private sortValue(row: HkMaintenanceRequestRow, key: HkMaintenanceRequestSortKey): string | number {
    switch (key) {
      case 'roomNo':
        return Number(row.roomNo);
      case 'reason':
        return row.reason;
      case 'fromDate':
        return row.fromDate;
      case 'toDate':
        return row.toDate;
      case 'createdBy':
        return row.createdBy;
      case 'createdAt':
        return row.createdAt;
      default:
        return row.serial;
    }
  }
}
