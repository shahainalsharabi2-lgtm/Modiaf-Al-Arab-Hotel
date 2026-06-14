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
  PRICE_CATEGORIES_SEED,
  PriceCategoryFormDto,
  PriceCategoryRowDto,
  emptyPriceCategoryForm,
  priceCategoryRowToForm,
} from './price-categories.seed';

type ViewMode = 'list' | 'grid';
type StatusFilter = 'all' | 'active' | 'inactive';
type SortKey = 'code' | 'name' | 'foreignName' | 'description';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-price-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './price-categories.component.html',
  styleUrls: [
    '../hotel-chains/hotel-chains.component.scss',
    '../room-floors/room-floors.component.scss',
    '../room-types/room-types.component.scss',
    './price-categories.component.scss',
  ],
})
export class PriceCategoriesComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() canEdit = true;

  rows: PriceCategoryRowDto[] = [];
  form: PriceCategoryFormDto = emptyPriceCategoryForm();
  modalOpen = false;
  editingId: number | null = null;
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
    this.rows = PRICE_CATEGORIES_SEED.map((row) => ({ ...row }));
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

  filteredRows(): PriceCategoryRowDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = [...this.rows];
    if (q) {
      rows = rows.filter((r) => {
        const hay = `${r.code} ${r.name} ${r.foreignName} ${r.description}`.toLowerCase();
        return hay.includes(q);
      });
    }
    if (this.sortKey) {
      const dir = this.sortDir === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        let cmp = 0;
        switch (this.sortKey) {
          case 'code':
            cmp = a.code.localeCompare(b.code, 'en', { numeric: true });
            break;
          case 'name':
            cmp = a.name.localeCompare(b.name, 'ar');
            break;
          case 'foreignName':
            cmp = a.foreignName.localeCompare(b.foreignName, 'en');
            break;
          case 'description':
            cmp = a.description.localeCompare(b.description, 'ar');
            break;
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

  totalRows(): number {
    return this.filteredRows().length;
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.totalRows() / this.pageSize));
  }

  pageNumbers(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  pagedRows(): PriceCategoryRowDto[] {
    const start = (this.pageIndex - 1) * this.pageSize;
    return this.filteredRows().slice(start, start + this.pageSize);
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
    this.editingId = null;
    this.form = emptyPriceCategoryForm();
    this.modalOpen = true;
    this.cdr.markForCheck();
  }

  openEdit(row: PriceCategoryRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openActionsId = null;
    this.editingId = row.id;
    this.form = priceCategoryRowToForm(row);
    this.modalOpen = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.modalOpen = false;
    this.editingId = null;
    this.form = emptyPriceCategoryForm();
    this.cdr.markForCheck();
  }

  saveForm(): void {
    if (!this.canEdit) {
      return;
    }
    this.closeModal();
  }

  deleteRow(row: PriceCategoryRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openActionsId = null;
    void this.uiMsg.confirm(this.ui.screenText('settings', 'priceCategoriesDeleteConfirm')).then((ok) => {
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

  modalTitleKey(): string {
    return this.editingId ? 'priceCategoriesModalEditTitle' : 'priceCategoriesModalCreateTitle';
  }
}
