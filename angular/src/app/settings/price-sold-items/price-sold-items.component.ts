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
  PRICE_SOLD_ITEMS_SEED,
  PRICE_SOLD_ITEM_TYPE_OPTIONS,
  PriceSoldItemFormDto,
  PriceSoldItemImportExportRowDto,
  PriceSoldItemRowDto,
  emptyPriceSoldItemForm,
  itemTypeLabel,
  priceSoldItemRowToForm,
} from './price-sold-items.seed';

type ScreenMode = 'list' | 'form';
type ViewMode = 'list' | 'grid';
type StatusFilter = 'all' | 'active' | 'inactive';
type SortKey = 'name' | 'foreignName' | 'itemType';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-price-sold-items',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './price-sold-items.component.html',
  styleUrls: [
    '../hotel-chains/hotel-chains.component.scss',
    '../room-types/room-types.component.scss',
    '../room-rooms/room-rooms.component.scss',
    './price-sold-items.component.scss',
  ],
})
export class PriceSoldItemsComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() canEdit = true;

  readonly itemTypeOptions = PRICE_SOLD_ITEM_TYPE_OPTIONS;

  screenMode: ScreenMode = 'list';
  rows: PriceSoldItemRowDto[] = [];
  form: PriceSoldItemFormDto = emptyPriceSoldItemForm();
  viewMode: ViewMode = 'list';
  searchQuery = '';
  statusFilter: StatusFilter = 'all';
  sortKey: SortKey | null = null;
  sortDir: SortDir = 'asc';
  openActionsId: number | null = null;
  importExportOpen = false;
  importExportRows: PriceSoldItemImportExportRowDto[] = [];
  importExportFormat: 'XLSX' | 'CSV' = 'XLSX';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = PRICE_SOLD_ITEMS_SEED.map((row) => ({ ...row }));
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

  filteredRows(): PriceSoldItemRowDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = [...this.rows];
    if (q) {
      rows = rows.filter((r) => {
        const hay = `${r.name} ${r.foreignName} ${r.itemType}`.toLowerCase();
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
            cmp = a.foreignName.localeCompare(b.foreignName, 'en');
            break;
          case 'itemType':
            cmp = a.itemType.localeCompare(b.itemType, 'ar');
            break;
        }
        if (cmp === 0) {
          cmp = a.id - b.id;
        }
        return cmp * dir;
      });
    } else {
      rows.sort((a, b) => a.id - b.id);
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
    this.form = emptyPriceSoldItemForm();
    this.screenMode = 'form';
    this.cdr.markForCheck();
  }

  openEdit(row: PriceSoldItemRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openActionsId = null;
    this.form = priceSoldItemRowToForm(row);
    this.screenMode = 'form';
    this.cdr.markForCheck();
  }

  deleteRow(row: PriceSoldItemRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openActionsId = null;
    void this.uiMsg.confirm(this.ui.screenText('settings', 'priceSoldItemsDeleteConfirm')).then((ok) => {
      if (!ok) {
        return;
      }
      this.rows = this.rows.filter((r) => r.id !== row.id);
      this.cdr.markForCheck();
    });
  }

  cancelForm(): void {
    this.openList();
  }

  saveForm(): void {
    if (!this.canEdit) {
      return;
    }
    const typeLabel = itemTypeLabel(this.form.itemType);
    if (this.form.id) {
      this.rows = this.rows.map((r) =>
        r.id === this.form.id
          ? {
              ...r,
              name: this.form.name,
              foreignName: this.form.foreignName,
              itemType: typeLabel,
            }
          : r,
      );
    } else {
      const nextId = this.rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
      this.rows = [
        ...this.rows,
        {
          id: nextId,
          name: this.form.name,
          foreignName: this.form.foreignName,
          itemType: typeLabel,
        },
      ];
    }
    this.openList();
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

  ieToggleRow(row: PriceSoldItemImportExportRowDto): void {
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
}
