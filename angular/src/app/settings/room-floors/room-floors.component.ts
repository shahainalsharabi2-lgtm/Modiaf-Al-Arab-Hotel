import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostListener,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiMessageService } from '../../services/ui-message.service';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { ROOM_FLOORS_SEED, RoomFloorRowDto } from './room-floors.seed';

type ViewMode = 'list' | 'grid';
type StatusFilter = 'all' | 'active' | 'inactive';
type SortKey = 'name' | 'foreignName' | 'description' | 'serialNumber' | 'building';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-room-floors',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './room-floors.component.html',
  styleUrls: ['../hotel-chains/hotel-chains.component.scss', './room-floors.component.scss'],
})
export class RoomFloorsComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() canEdit = true;

  rows: RoomFloorRowDto[] = [];
  viewMode: ViewMode = 'list';
  searchQuery = '';
  statusFilter: StatusFilter = 'all';
  sortKey: SortKey | null = null;
  sortDir: SortDir = 'asc';
  pageIndex = 1;
  pageSize = 10;
  openActionsId: number | null = null;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = ROOM_FLOORS_SEED.map((row) => ({ ...row }));
  }

  @HostListener('document:click')
  closeActionsMenu(): void {
    if (this.openActionsId !== null) {
      this.openActionsId = null;
      this.cdr.markForCheck();
    }
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
    this.cdr.markForCheck();
  }

  toggleSort(key: SortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'asc';
    }
    this.cdr.markForCheck();
  }

  sortIcon(key: SortKey): string {
    if (this.sortKey !== key) {
      return 'fa-sort';
    }
    return this.sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  filteredRows(): RoomFloorRowDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = [...this.rows];
    if (q) {
      rows = rows.filter((r) => {
        const hay = `${r.name} ${r.foreignName ?? ''} ${r.description} ${r.serialNumber} ${r.building}`.toLowerCase();
        return hay.includes(q);
      });
    }
    if (this.sortKey) {
      const dir = this.sortDir === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        let cmp = 0;
        switch (this.sortKey) {
          case 'name':
            cmp = a.name.localeCompare(b.name, 'ar');
            break;
          case 'foreignName':
            cmp = (a.foreignName ?? '').localeCompare(b.foreignName ?? '', 'en');
            break;
          case 'description':
            cmp = a.description.localeCompare(b.description, 'ar');
            break;
          case 'serialNumber':
            cmp = a.serialNumber - b.serialNumber;
            break;
          case 'building':
            cmp = a.building - b.building;
            break;
        }
        if (cmp === 0) {
          cmp = a.id - b.id;
        }
        return cmp * dir;
      });
    } else {
      rows.sort((a, b) => a.serialNumber - b.serialNumber);
    }
    return rows;
  }

  totalRows(): number {
    return this.filteredRows().length;
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.totalRows() / this.pageSize));
  }

  pageNumbers(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  pagedRows(): RoomFloorRowDto[] {
    const rows = this.filteredRows();
    const start = (this.pageIndex - 1) * this.pageSize;
    return rows.slice(start, start + this.pageSize);
  }

  rangeFrom(): number {
    if (!this.totalRows()) {
      return 0;
    }
    return (this.pageIndex - 1) * this.pageSize + 1;
  }

  rangeTo(): number {
    return Math.min(this.pageIndex * this.pageSize, this.totalRows());
  }

  setPage(page: number): void {
    this.pageIndex = Math.min(Math.max(1, page), this.totalPages());
    this.cdr.markForCheck();
  }

  onPageSizeChange(): void {
    this.pageIndex = 1;
    this.cdr.markForCheck();
  }

  onSearchChange(): void {
    this.pageIndex = 1;
    this.cdr.markForCheck();
  }

  toggleActionsMenu(rowId: number, event: Event): void {
    event.stopPropagation();
    this.openActionsId = this.openActionsId === rowId ? null : rowId;
    this.cdr.markForCheck();
  }

  openCreate(): void {
    if (!this.canEdit) {
      return;
    }
  }

  openEdit(row: RoomFloorRowDto): void {
    if (!this.canEdit) {
      return;
    }
    void row;
  }

  deleteRow(row: RoomFloorRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openActionsId = null;
    void this.uiMsg.confirm(this.ui.screenText('settings', 'roomFloorsDeleteConfirm')).then((ok) => {
      if (!ok) {
        return;
      }
      this.rows = this.rows.filter((r) => r.id !== row.id);
      if (this.pageIndex > this.totalPages()) {
        this.pageIndex = this.totalPages();
      }
      this.cdr.markForCheck();
    });
  }
}
