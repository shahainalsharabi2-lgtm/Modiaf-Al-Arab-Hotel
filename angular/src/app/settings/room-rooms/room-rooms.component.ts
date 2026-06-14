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
import {
  ROOMS_SEED,
  RoomFormDto,
  RoomImportExportRowDto,
  RoomRowDto,
  emptyRoomForm,
  roomRowToForm,
} from './room-rooms.seed';

type ScreenMode = 'list' | 'form';
type ViewMode = 'list' | 'grid';
type StatusFilter = 'all' | 'active' | 'inactive';
type SortKey =
  | 'roomNumber'
  | 'name'
  | 'roomType'
  | 'foreignName'
  | 'occupancyStatus'
  | 'housekeepingStatus';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-room-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './room-rooms.component.html',
  styleUrls: [
    '../hotel-chains/hotel-chains.component.scss',
    '../room-types/room-types.component.scss',
    './room-rooms.component.scss',
  ],
})
export class RoomRoomsComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() canEdit = true;

  screenMode: ScreenMode = 'list';
  rows: RoomRowDto[] = [];
  form: RoomFormDto = emptyRoomForm();
  viewMode: ViewMode = 'list';
  searchQuery = '';
  statusFilter: StatusFilter = 'all';
  sortKey: SortKey | null = null;
  sortDir: SortDir = 'asc';
  openActionsId: number | null = null;
  importExportOpen = false;
  importExportRows: RoomImportExportRowDto[] = [];
  importExportFormat: 'XLSX' | 'CSV' = 'XLSX';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = ROOMS_SEED.map((row) => ({ ...row }));
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

  occupancyLabel(status: RoomRowDto['occupancyStatus']): string {
    return status === 'occupied'
      ? this.ui.screenText('settings', 'roomRoomsStatusOccupied')
      : this.ui.screenText('settings', 'roomRoomsStatusAvailable');
  }

  housekeepingLabel(status: RoomRowDto['housekeepingStatus']): string {
    return status === 'clean'
      ? this.ui.screenText('settings', 'roomRoomsHkClean')
      : this.ui.screenText('settings', 'roomRoomsHkDirty');
  }

  filteredRows(): RoomRowDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = [...this.rows];
    if (q) {
      rows = rows.filter((r) => {
        const hay = `${r.roomNumber} ${r.name} ${r.roomType} ${r.foreignName} ${r.compositeDetails ?? ''}`.toLowerCase();
        return hay.includes(q);
      });
    }
    if (this.sortKey) {
      const dir = this.sortDir === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        let cmp = 0;
        switch (this.sortKey) {
          case 'roomNumber':
            cmp = a.roomNumber - b.roomNumber;
            break;
          case 'name':
            cmp = a.name.localeCompare(b.name, 'ar');
            break;
          case 'roomType':
            cmp = a.roomType.localeCompare(b.roomType, 'ar');
            break;
          case 'foreignName':
            cmp = a.foreignName.localeCompare(b.foreignName, 'en');
            break;
          case 'occupancyStatus':
            cmp = a.occupancyStatus.localeCompare(b.occupancyStatus, 'en');
            break;
          case 'housekeepingStatus':
            cmp = a.housekeepingStatus.localeCompare(b.housekeepingStatus, 'en');
            break;
        }
        if (cmp === 0) {
          cmp = a.id - b.id;
        }
        return cmp * dir;
      });
    } else {
      rows.sort((a, b) => a.roomNumber - b.roomNumber);
    }
    return rows;
  }

  toggleActionsMenu(rowId: number, event: Event): void {
    event.stopPropagation();
    this.openActionsId = this.openActionsId === rowId ? null : rowId;
    this.cdr.markForCheck();
  }

  openList(): void {
    this.screenMode = 'list';
    this.openActionsId = null;
    this.cdr.markForCheck();
  }

  openCreate(): void {
    if (!this.canEdit) {
      return;
    }
    this.form = emptyRoomForm();
    this.screenMode = 'form';
    this.cdr.markForCheck();
  }

  openEdit(row: RoomRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openActionsId = null;
    this.form = roomRowToForm(row);
    this.screenMode = 'form';
    this.cdr.markForCheck();
  }

  deleteRow(row: RoomRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openActionsId = null;
    void this.uiMsg.confirm(this.ui.screenText('settings', 'roomRoomsDeleteConfirm')).then((ok) => {
      if (!ok) {
        return;
      }
      this.rows = this.rows.filter((r) => r.id !== row.id);
      this.cdr.markForCheck();
    });
  }

  importExport(): void {
    this.importExportOpen = true;
    this.cdr.markForCheck();
  }

  closeImportExport(): void {
    this.importExportOpen = false;
    this.cdr.markForCheck();
  }

  ieRowCount(): number {
    return this.importExportRows.length;
  }

  ieSelectedCount(): number {
    return this.importExportRows.filter((row) => row.selected).length;
  }

  ieAllSelected(): boolean {
    return this.importExportRows.length > 0 && this.ieSelectedCount() === this.importExportRows.length;
  }

  ieToggleSelectAll(): void {
    const selectAll = !this.ieAllSelected();
    this.importExportRows = this.importExportRows.map((row) => ({ ...row, selected: selectAll }));
    this.cdr.markForCheck();
  }

  ieToggleRow(row: RoomImportExportRowDto): void {
    row.selected = !row.selected;
    this.cdr.markForCheck();
  }

  ieImportFile(): void {
    void 0;
  }

  ieDownloadTemplate(): void {
    void 0;
  }

  ieClearTable(): void {
    this.importExportRows = [];
    this.cdr.markForCheck();
  }

  ieClearFormatting(): void {
    void 0;
  }

  ieExportData(): void {
    void 0;
  }

  ieSave(): void {
    if (!this.canEdit) {
      return;
    }
    this.closeImportExport();
  }

  saveForm(): void {
    if (!this.canEdit) {
      return;
    }
    this.openList();
  }

  deleteForm(): void {
    if (!this.canEdit) {
      return;
    }
    if (this.form.id) {
      this.rows = this.rows.filter((r) => r.id !== this.form.id);
    }
    this.openList();
  }

  printForm(): void {
    void 0;
  }

  undoChanges(): void {
    if (this.form.id) {
      const row = this.rows.find((r) => r.id === this.form.id);
      this.form = row ? roomRowToForm(row) : emptyRoomForm();
    } else {
      this.form = emptyRoomForm();
    }
    this.cdr.markForCheck();
  }
}
