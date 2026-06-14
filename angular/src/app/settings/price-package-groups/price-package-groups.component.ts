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
  PACKAGE_ITEM_CATALOG,
  PackageGroupItemDto,
  PackageItemCatalogDto,
  PRICE_PACKAGE_GROUPS_SEED,
  PricePackageGroupFormDto,
  PricePackageGroupRowDto,
  calcMethodTranslationKey,
  calcRuleTranslationKey,
  emptyPricePackageGroupForm,
  packageItemsSummary,
  pricePackageGroupRowToForm,
} from './price-package-groups.seed';

type ViewMode = 'list' | 'grid';
type StatusFilter = 'all' | 'active' | 'inactive';
type SortKey = 'code' | 'name' | 'price' | 'packageItemsText' | 'fullBoard' | 'sellSeparately';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-price-package-groups',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './price-package-groups.component.html',
  styleUrls: [
    '../hotel-chains/hotel-chains.component.scss',
    '../room-types/room-types.component.scss',
    './price-package-groups.component.scss',
  ],
})
export class PricePackageGroupsComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() canEdit = true;

  rows: PricePackageGroupRowDto[] = [];
  form: PricePackageGroupFormDto = emptyPricePackageGroupForm();
  modalOpen = false;
  editingId: number | null = null;
  viewMode: ViewMode = 'list';
  searchQuery = '';
  statusFilter: StatusFilter = 'all';
  sortKey: SortKey | null = null;
  sortDir: SortDir = 'asc';
  openActionsId: number | null = null;

  pickItemsOpen = false;
  pickSearchQuery = '';
  pickSelected = new Set<string>();

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = PRICE_PACKAGE_GROUPS_SEED.map((row) => ({ ...row }));
  }

  @HostListener('document:click')
  closeActionsMenu(): void {
    if (this.openActionsId !== null) {
      this.openActionsId = null;
      this.cdr.markForCheck();
    }
  }

  calcMethodLabel(key: string): string {
    return this.ui.screenText('settings', calcMethodTranslationKey(key));
  }

  calcRuleLabel(key: string): string {
    return this.ui.screenText('settings', calcRuleTranslationKey(key));
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

  filteredRows(): PricePackageGroupRowDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = [...this.rows];
    if (q) {
      rows = rows.filter((r) => {
        const hay = `${r.code} ${r.name} ${r.price} ${r.packageItemsText}`.toLowerCase();
        return hay.includes(q);
      });
    }
    if (this.sortKey) {
      const dir = this.sortDir === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        let cmp = 0;
        switch (this.sortKey) {
          case 'code':
            cmp = a.code.localeCompare(b.code, 'en', { sensitivity: 'base' });
            break;
          case 'name':
            cmp = a.name.localeCompare(b.name, 'ar');
            break;
          case 'price':
            cmp = a.price - b.price;
            break;
          case 'packageItemsText':
            cmp = a.packageItemsText.localeCompare(b.packageItemsText, 'ar');
            break;
          case 'fullBoard':
            cmp = Number(a.fullBoard) - Number(b.fullBoard);
            break;
          case 'sellSeparately':
            cmp = Number(a.sellSeparately) - Number(b.sellSeparately);
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

  openCreate(): void {
    if (!this.canEdit) {
      return;
    }
    this.editingId = null;
    this.form = emptyPricePackageGroupForm();
    this.modalOpen = true;
    this.cdr.markForCheck();
  }

  openEdit(row: PricePackageGroupRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openActionsId = null;
    this.editingId = row.id;
    this.form = pricePackageGroupRowToForm(row);
    this.modalOpen = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.modalOpen = false;
    this.editingId = null;
    this.form = emptyPricePackageGroupForm();
    this.cdr.markForCheck();
  }

  saveForm(): void {
    if (!this.canEdit) {
      return;
    }
    const itemsText = packageItemsSummary(this.form.items);
    const existing = this.form.id ? this.rows.find((r) => r.id === this.form.id) : null;
    const rowPrice = existing?.price ?? (this.form.items.length ? 90 : 0);

    if (this.form.id) {
      this.rows = this.rows.map((r) =>
        r.id === this.form.id
          ? {
              ...r,
              code: this.form.code,
              name: this.form.name,
              price: rowPrice,
              packageItemsText: itemsText,
              fullBoard: this.form.fullBoard,
              sellSeparately: this.form.sellSeparately,
            }
          : r,
      );
    } else {
      const nextId = this.rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
      this.rows = [
        ...this.rows,
        {
          id: nextId,
          code: this.form.code,
          name: this.form.name,
          price: rowPrice,
          packageItemsText: itemsText,
          fullBoard: this.form.fullBoard,
          sellSeparately: this.form.sellSeparately,
        },
      ];
    }
    this.closeModal();
  }

  deleteRow(row: PricePackageGroupRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openActionsId = null;
    void this.uiMsg.confirm(this.ui.screenText('settings', 'pricePackageGroupsDeleteConfirm')).then((ok) => {
      if (!ok) {
        return;
      }
      this.rows = this.rows.filter((r) => r.id !== row.id);
      this.cdr.markForCheck();
    });
  }

  modalTitleKey(): string {
    return this.editingId ? 'pricePackageGroupsModalEditTitle' : 'pricePackageGroupsModalCreateTitle';
  }

  openPickItems(): void {
    if (!this.canEdit) {
      return;
    }
    this.pickSearchQuery = '';
    this.pickSelected = new Set<string>();
    this.pickItemsOpen = true;
    this.cdr.markForCheck();
  }

  closePickItems(): void {
    this.pickItemsOpen = false;
    this.pickSelected = new Set<string>();
    this.cdr.markForCheck();
  }

  filteredCatalog(): PackageItemCatalogDto[] {
    const q = this.pickSearchQuery.trim().toLowerCase();
    const existing = new Set(this.form.items.map((item) => item.code));
    let items = PACKAGE_ITEM_CATALOG.filter((item) => !existing.has(item.code));
    if (q) {
      items = items.filter((item) => {
        const hay =
          `${item.code} ${item.name} ${item.price} ${this.calcMethodLabel(item.calculationMethodKey)} ${this.calcRuleLabel(item.calculationRuleKey)}`.toLowerCase();
        return hay.includes(q);
      });
    }
    return items;
  }

  pickAllSelected(): boolean {
    const visible = this.filteredCatalog();
    return visible.length > 0 && visible.every((item) => this.pickSelected.has(item.code));
  }

  togglePickAll(): void {
    const visible = this.filteredCatalog();
    if (this.pickAllSelected()) {
      visible.forEach((item) => this.pickSelected.delete(item.code));
    } else {
      visible.forEach((item) => this.pickSelected.add(item.code));
    }
    this.cdr.markForCheck();
  }

  togglePickItem(code: string): void {
    if (this.pickSelected.has(code)) {
      this.pickSelected.delete(code);
    } else {
      this.pickSelected.add(code);
    }
    this.cdr.markForCheck();
  }

  isPickSelected(code: string): boolean {
    return this.pickSelected.has(code);
  }

  confirmPickItems(): void {
    const toAdd = PACKAGE_ITEM_CATALOG.filter((item) => this.pickSelected.has(item.code)).map((item) => ({
      ...item,
    }));
    this.form = {
      ...this.form,
      items: [...this.form.items, ...toAdd],
    };
    this.closePickItems();
  }

  removeFormItem(item: PackageGroupItemDto): void {
    if (!this.canEdit) {
      return;
    }
    this.form = {
      ...this.form,
      items: this.form.items.filter((row) => row.code !== item.code),
    };
    this.cdr.markForCheck();
  }
}
