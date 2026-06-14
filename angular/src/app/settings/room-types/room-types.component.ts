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
  ROOM_TYPES_LIST_SEED,
  RoomTypeFormDto,
  RoomTypeRowDto,
  emptyRoomTypeForm,
  roomTypeRowToForm,
} from './room-types.seed';

type ScreenMode = 'list' | 'form';
type ViewMode = 'list' | 'grid';
type StatusFilter = 'all' | 'active' | 'inactive';
type SortKey = 'number' | 'code' | 'name' | 'foreignName' | 'description';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-room-types',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './room-types.component.html',
  styleUrls: ['../hotel-chains/hotel-chains.component.scss', './room-types.component.scss'],
})
export class RoomTypesComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() canEdit = true;

  screenMode: ScreenMode = 'list';
  viewMode: ViewMode = 'list';
  searchQuery = '';
  statusFilter: StatusFilter = 'all';
  sortKey: SortKey | null = null;
  sortDir: SortDir = 'asc';
  openActionsId: number | null = null;

  rows: RoomTypeRowDto[] = [];
  form: RoomTypeFormDto = emptyRoomTypeForm();

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = ROOM_TYPES_LIST_SEED.map((row) => ({ ...row }));
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

  filteredRows(): RoomTypeRowDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = [...this.rows];
    if (q) {
      rows = rows.filter((r) => {
        const hay = `${r.number} ${r.code} ${r.name} ${r.foreignName} ${r.description}`.toLowerCase();
        return hay.includes(q);
      });
    }
    if (this.sortKey) {
      const dir = this.sortDir === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        let cmp = 0;
        switch (this.sortKey) {
          case 'number':
            cmp = a.number - b.number;
            break;
          case 'code':
            cmp = a.code.localeCompare(b.code, 'en', { sensitivity: 'base' });
            break;
          case 'name':
            cmp = a.name.localeCompare(b.name, 'ar');
            break;
          case 'foreignName':
            cmp = a.foreignName.localeCompare(b.foreignName, 'en');
            break;
          case 'description':
            cmp = a.description.localeCompare(b.description, 'en');
            break;
        }
        if (cmp === 0) {
          cmp = a.id - b.id;
        }
        return cmp * dir;
      });
    } else {
      rows.sort((a, b) => a.number - b.number);
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
    this.form = emptyRoomTypeForm();
    this.screenMode = 'form';
    this.cdr.markForCheck();
  }

  openEdit(row: RoomTypeRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openActionsId = null;
    this.form = roomTypeRowToForm(row);
    this.screenMode = 'form';
    this.cdr.markForCheck();
  }

  deleteRow(row: RoomTypeRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openActionsId = null;
    void this.uiMsg.confirm(this.ui.screenText('settings', 'roomTypesDeleteConfirm')).then((ok) => {
      if (!ok) {
        return;
      }
      this.rows = this.rows.filter((r) => r.id !== row.id);
      this.cdr.markForCheck();
    });
  }

  importExport(): void {
    void 0;
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
      this.form = row ? roomTypeRowToForm(row) : emptyRoomTypeForm();
    } else {
      this.form = emptyRoomTypeForm();
    }
    this.cdr.markForCheck();
  }
}
