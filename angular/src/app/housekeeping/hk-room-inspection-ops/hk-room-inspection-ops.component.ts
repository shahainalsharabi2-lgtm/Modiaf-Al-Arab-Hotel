import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { HK_ROOM_INSPECTION_OPS_ROWS } from './hk-room-inspection-ops.static-data';
import type {
  HkRoomInspectionOpsRow,
  HkRoomInspectionOpsSortDir,
  HkRoomInspectionOpsSortKey,
  HkRoomInspectionStatus,
} from './hk-room-inspection-ops.types';

@Component({
  selector: 'app-hk-room-inspection-ops',
  standalone: true,
  imports: [CommonModule, FormsModule, LocaleNumberPipe, UiInlineTextComponent],
  templateUrl: './hk-room-inspection-ops.component.html',
  styleUrls: ['./hk-room-inspection-ops.component.css'],
})
export class HkRoomInspectionOpsComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  allRows: HkRoomInspectionOpsRow[] = [...HK_ROOM_INSPECTION_OPS_ROWS];
  searchQuery = '';

  sortKey: HkRoomInspectionOpsSortKey = 'inspectionDate';
  sortDir: HkRoomInspectionOpsSortDir = 'desc';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
  }

  label(key: string): string {
    return this.ui.screenText('hkRoomInspectionOps', key);
  }

  statusLabel(status: HkRoomInspectionStatus): string {
    return this.label(`status_${status}`);
  }

  get filteredRows(): HkRoomInspectionOpsRow[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = this.allRows;
    if (q) {
      rows = rows.filter((row) =>
        [String(row.rowNo), row.roomNo, this.statusLabel(row.status)].some((v) => v.toLowerCase().includes(q)),
      );
    }
    return [...rows].sort((a, b) => this.compareRows(a, b));
  }

  toggleSort(key: HkRoomInspectionOpsSortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      return;
    }
    this.sortKey = key;
    this.sortDir = 'asc';
  }

  sortIcon(key: HkRoomInspectionOpsSortKey): string {
    if (this.sortKey !== key) {
      return 'fa-sort';
    }
    return this.sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  formatDateTime(iso: string): string {
    if (!iso) {
      return '—';
    }
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return iso;
    }
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${d}/${m}/${y} ${h}:${min}`;
  }

  trackRow(_index: number, row: HkRoomInspectionOpsRow): string {
    return row.id;
  }

  addNewInspection(): void {}

  rowActions(_row: HkRoomInspectionOpsRow): void {}

  private compareRows(a: HkRoomInspectionOpsRow, b: HkRoomInspectionOpsRow): number {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    if (this.sortKey === 'rowNo' || this.sortKey === 'totalFines') {
      const diff = a[this.sortKey] - b[this.sortKey];
      return diff === 0 ? 0 : diff > 0 ? dir : -dir;
    }
    if (this.sortKey === 'roomNo') {
      const diff = Number(a.roomNo) - Number(b.roomNo);
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

  private sortValue(row: HkRoomInspectionOpsRow, key: HkRoomInspectionOpsSortKey): string {
    switch (key) {
      case 'inspectionDate':
        return row.inspectionDate;
      case 'status':
        return row.status;
      default:
        return '';
    }
  }
}
