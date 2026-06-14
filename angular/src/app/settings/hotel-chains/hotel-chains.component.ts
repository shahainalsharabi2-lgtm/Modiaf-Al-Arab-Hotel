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
import {
  CreateUpdateHotelChainDto,
  HotelChainDto,
} from '../../services/hotel-chain.service';
import { UiMessageService } from '../../services/ui-message.service';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { HOTEL_CHAINS_SEED } from './hotel-chains.seed';

type ViewMode = 'list' | 'grid';
type StatusFilter = 'all' | 'active' | 'inactive';
type SortKey = 'code' | 'name' | 'foreignName';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-hotel-chains',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './hotel-chains.component.html',
  styleUrls: ['./hotel-chains.component.scss'],
})
export class HotelChainsComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() canEdit = true;

  rows: HotelChainDto[] = [];
  saving = false;
  errorMessage = '';
  modalOpen = false;
  editingId: number | null = null;
  form: CreateUpdateHotelChainDto = this.emptyForm();
  private nextId = HOTEL_CHAINS_SEED.length + 1;

  viewMode: ViewMode = 'list';
  searchQuery = '';
  statusFilter: StatusFilter = 'all';
  sortKey: SortKey | null = null;
  sortDir: SortDir = 'asc';
  openActionsId: number | null = null;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = HOTEL_CHAINS_SEED.map((row) => ({ ...row }));
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

  filteredRows(): HotelChainDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = [...this.rows];
    if (this.statusFilter === 'active') {
      rows = rows.filter((r) => r.isActive);
    } else if (this.statusFilter === 'inactive') {
      rows = rows.filter((r) => !r.isActive);
    }
    if (q) {
      rows = rows.filter((r) => {
        const hay = `${r.code} ${r.name} ${r.foreignName ?? ''}`.toLowerCase();
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
          default:
            cmp = a.code.localeCompare(b.code, 'en', { sensitivity: 'base' });
        }
        if (cmp === 0) {
          cmp = a.displayOrder - b.displayOrder;
        }
        return cmp * dir;
      });
    } else {
      rows.sort((a, b) => a.displayOrder - b.displayOrder);
    }
    return rows;
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
    this.editingId = null;
    this.form = {
      ...this.emptyForm(),
      displayOrder: this.rows.length ? Math.max(...this.rows.map((r) => r.displayOrder)) + 1 : 1,
    };
    this.modalOpen = true;
    this.openActionsId = null;
  }

  openEdit(row: HotelChainDto): void {
    if (!this.canEdit) {
      return;
    }
    this.editingId = row.id;
    this.form = {
      code: row.code,
      name: row.name,
      foreignName: row.foreignName ?? '',
      notes: row.notes ?? '',
      displayOrder: row.displayOrder,
      isActive: row.isActive,
    };
    this.modalOpen = true;
    this.openActionsId = null;
  }

  closeModal(): void {
    this.modalOpen = false;
    this.editingId = null;
    this.form = this.emptyForm();
  }

  saveRow(): void {
    if (!this.canEdit) {
      return;
    }
    const code = this.form.code.trim();
    const name = this.form.name.trim();
    if (!code || !name) {
      this.errorMessage = this.ui.screenText('settings', 'hotelChainsRequired');
      return;
    }
    const payload: HotelChainDto = {
      id: this.editingId ?? this.nextId++,
      code,
      name,
      foreignName: (this.form.foreignName ?? '').trim() || null,
      notes: (this.form.notes ?? '').trim() || null,
      displayOrder: Number(this.form.displayOrder) || 0,
      isActive: !!this.form.isActive,
    };
    this.saving = true;
    this.errorMessage = '';
    if (this.editingId) {
      this.rows = this.rows.map((row) => (row.id === this.editingId ? payload : row));
    } else {
      this.rows = [...this.rows, payload];
    }
    this.saving = false;
    this.closeModal();
    this.uiMsg.success(this.ui.screenText('settings', 'hotelChainsSaveSuccess'));
    this.cdr.markForCheck();
  }

  deleteRow(row: HotelChainDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openActionsId = null;
    void this.uiMsg.confirm(this.ui.screenText('settings', 'hotelChainsDeleteConfirm')).then((ok) => {
      if (!ok) {
        return;
      }
      this.rows = this.rows.filter((r) => r.id !== row.id);
      this.uiMsg.success(this.ui.screenText('settings', 'hotelChainsDeleteSuccess'));
      this.cdr.markForCheck();
    });
  }

  private emptyForm(): CreateUpdateHotelChainDto {
    return {
      code: '',
      name: '',
      foreignName: '',
      notes: '',
      displayOrder: 1,
      isActive: true,
    };
  }
}
