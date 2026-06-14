import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { HK_ROOM_INSPECTION_ITEM_ROWS } from './hk-room-inspection-items.static-data';
import type {
  HkRoomInspectionItemRow,
  HkRoomInspectionItemSortDir,
  HkRoomInspectionItemSortKey,
} from './hk-room-inspection-items.types';

@Component({
  selector: 'app-hk-room-inspection-items',
  standalone: true,
  imports: [CommonModule, FormsModule, LocaleNumberPipe, UiInlineTextComponent],
  templateUrl: './hk-room-inspection-items.component.html',
  styleUrls: ['./hk-room-inspection-items.component.css'],
})
export class HkRoomInspectionItemsComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  allRows: HkRoomInspectionItemRow[] = [...HK_ROOM_INSPECTION_ITEM_ROWS];
  searchQuery = '';

  sortKey: HkRoomInspectionItemSortKey = 'displayOrder';
  sortDir: HkRoomInspectionItemSortDir = 'asc';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
  }

  label(key: string): string {
    return this.ui.screenText('hkRoomInspectionItems', key);
  }

  get filteredRows(): HkRoomInspectionItemRow[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = this.allRows;
    if (q) {
      rows = rows.filter((row) =>
        [row.itemName, row.foreignName, row.category].some((v) => v.toLowerCase().includes(q)),
      );
    }
    return [...rows].sort((a, b) => this.compareRows(a, b));
  }

  toggleSort(key: HkRoomInspectionItemSortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      return;
    }
    this.sortKey = key;
    this.sortDir = 'asc';
  }

  sortIcon(key: HkRoomInspectionItemSortKey): string {
    if (this.sortKey !== key) {
      return 'fa-sort';
    }
    return this.sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  cellValue(value: string): string {
    return value?.trim() ? value : '—';
  }

  trackRow(_index: number, row: HkRoomInspectionItemRow): string {
    return row.id;
  }

  addNew(): void {}

  rowActions(_row: HkRoomInspectionItemRow): void {}

  private compareRows(a: HkRoomInspectionItemRow, b: HkRoomInspectionItemRow): number {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    if (
      this.sortKey === 'rowNo' ||
      this.sortKey === 'fineAmount' ||
      this.sortKey === 'defaultQuantity' ||
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

  private sortValue(row: HkRoomInspectionItemRow, key: HkRoomInspectionItemSortKey): string {
    switch (key) {
      case 'itemName':
        return row.itemName;
      case 'foreignName':
        return row.foreignName;
      case 'category':
        return row.category;
      default:
        return '';
    }
  }
}
