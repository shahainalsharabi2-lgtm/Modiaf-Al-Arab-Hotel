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
  PRICE_PACKAGES_SEED,
  PricePackageFormDto,
  PricePackagePricingFormDto,
  PricePackagePricingRowDto,
  PricePackageRowDto,
  calcMethodTranslationKey,
  calcRuleTranslationKey,
  emptyPricePackageForm,
  emptyPricePackagePricingForm,
  formatPackageDate,
  pricePackageRowToForm,
} from './price-packages.seed';

type ScreenMode = 'list' | 'form';
type ViewMode = 'list' | 'grid';
type StatusFilter = 'all' | 'active' | 'inactive';
type SortKey = 'code' | 'name' | 'foreignName' | 'calculationMethodKey' | 'calculationRuleKey';
type PricingSortKey = 'fromDate' | 'toDate' | 'price';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-price-packages',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './price-packages.component.html',
  styleUrls: [
    '../hotel-chains/hotel-chains.component.scss',
    '../room-types/room-types.component.scss',
    '../price-seasons/price-seasons.component.scss',
    './price-packages.component.scss',
  ],
})
export class PricePackagesComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly formatPackageDate = formatPackageDate;
  readonly calcMethodOptions = [
    'everyNightExceptArrival',
    'arrivalDay',
    'departureNight',
    'everyNight',
  ] as const;
  readonly calcRuleOptions = ['perPerson'] as const;

  @Input() canEdit = true;

  screenMode: ScreenMode = 'list';
  rows: PricePackageRowDto[] = [];
  form: PricePackageFormDto = emptyPricePackageForm();
  viewMode: ViewMode = 'list';
  searchQuery = '';
  statusFilter: StatusFilter = 'all';
  sortKey: SortKey | null = null;
  sortDir: SortDir = 'asc';
  openActionsId: number | null = null;

  pricingSearchQuery = '';
  pricingViewMode: ViewMode = 'list';
  pricingSortKey: PricingSortKey | null = null;
  pricingSortDir: SortDir = 'asc';
  openPricingActionsId: number | null = null;
  pricingModalOpen = false;
  pricingForm: PricePackagePricingFormDto = emptyPricePackagePricingForm();
  pricingEditingId: number | null = null;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = PRICE_PACKAGES_SEED.map((row) => ({ ...row }));
  }

  @HostListener('document:click')
  closeActionsMenu(): void {
    let changed = false;
    if (this.openActionsId !== null) {
      this.openActionsId = null;
      changed = true;
    }
    if (this.openPricingActionsId !== null) {
      this.openPricingActionsId = null;
      changed = true;
    }
    if (changed) {
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

  setPricingViewMode(mode: ViewMode): void {
    this.pricingViewMode = mode;
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

  togglePricingSort(key: PricingSortKey): void {
    if (this.pricingSortKey === key) {
      this.pricingSortDir = this.pricingSortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.pricingSortKey = key;
      this.pricingSortDir = 'asc';
    }
    this.cdr.markForCheck();
  }

  sortIcon(key: SortKey): string {
    if (this.sortKey !== key) {
      return 'fa-sort';
    }
    return this.sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  pricingSortIcon(key: PricingSortKey): string {
    if (this.pricingSortKey !== key) {
      return 'fa-sort';
    }
    return this.pricingSortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  filteredRows(): PricePackageRowDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = [...this.rows];
    if (q) {
      rows = rows.filter((r) => {
        const hay =
          `${r.code} ${r.name} ${r.foreignName} ${this.calcMethodLabel(r.calculationMethodKey)} ${this.calcRuleLabel(r.calculationRuleKey)}`.toLowerCase();
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
          case 'foreignName':
            cmp = a.foreignName.localeCompare(b.foreignName, 'en');
            break;
          case 'calculationMethodKey':
            cmp = a.calculationMethodKey.localeCompare(b.calculationMethodKey, 'en');
            break;
          case 'calculationRuleKey':
            cmp = a.calculationRuleKey.localeCompare(b.calculationRuleKey, 'en');
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

  filteredPricingRows(): PricePackagePricingRowDto[] {
    const q = this.pricingSearchQuery.trim().toLowerCase();
    let rows = [...this.form.pricingRows];
    if (q) {
      rows = rows.filter((r) => {
        const hay = `${r.fromDate} ${r.toDate} ${r.price}`.toLowerCase();
        return hay.includes(q);
      });
    }
    if (this.pricingSortKey) {
      const dir = this.pricingSortDir === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        let cmp = 0;
        switch (this.pricingSortKey) {
          case 'fromDate':
            cmp = a.fromDate.localeCompare(b.fromDate);
            break;
          case 'toDate':
            cmp = a.toDate.localeCompare(b.toDate);
            break;
          case 'price':
            cmp = a.price.localeCompare(b.price, 'en', { numeric: true });
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

  togglePricingActionsMenu(rowId: number, event: Event): void {
    event.stopPropagation();
    this.openPricingActionsId = this.openPricingActionsId === rowId ? null : rowId;
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
    this.form = emptyPricePackageForm();
    this.screenMode = 'form';
    this.cdr.markForCheck();
  }

  openEdit(row: PricePackageRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openActionsId = null;
    this.form = pricePackageRowToForm(row);
    this.screenMode = 'form';
    this.cdr.markForCheck();
  }

  deleteRow(row: PricePackageRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openActionsId = null;
    void this.uiMsg.confirm(this.ui.screenText('settings', 'pricePackagesDeleteConfirm')).then((ok) => {
      if (!ok) {
        return;
      }
      this.rows = this.rows.filter((r) => r.id !== row.id);
      this.cdr.markForCheck();
    });
  }

  saveForm(): void {
    if (!this.canEdit) {
      return;
    }
    if (this.form.id) {
      this.rows = this.rows.map((r) =>
        r.id === this.form.id
          ? {
              ...r,
              code: this.form.code,
              name: this.form.name,
              foreignName: this.form.foreignName,
              calculationMethodKey: this.form.calculationMethod,
              calculationRuleKey: this.form.calculationRule,
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
          foreignName: this.form.foreignName,
          calculationMethodKey: this.form.calculationMethod,
          calculationRuleKey: this.form.calculationRule,
        },
      ];
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

  undoChanges(): void {
    if (this.form.id) {
      const row = this.rows.find((r) => r.id === this.form.id);
      this.form = row ? pricePackageRowToForm(row) : emptyPricePackageForm();
    } else {
      this.form = emptyPricePackageForm();
    }
    this.cdr.markForCheck();
  }

  printForm(): void {
    void 0;
  }

  openPricingCreate(): void {
    if (!this.canEdit) {
      return;
    }
    this.pricingEditingId = null;
    this.pricingForm = emptyPricePackagePricingForm();
    this.pricingModalOpen = true;
    this.cdr.markForCheck();
  }

  openPricingEdit(row: PricePackagePricingRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openPricingActionsId = null;
    this.pricingEditingId = row.id;
    this.pricingForm = {
      id: row.id,
      fromDate: row.fromDate,
      toDate: row.toDate,
      price: row.price,
    };
    this.pricingModalOpen = true;
    this.cdr.markForCheck();
  }

  closePricingModal(): void {
    this.pricingModalOpen = false;
    this.pricingEditingId = null;
    this.pricingForm = emptyPricePackagePricingForm();
    this.cdr.markForCheck();
  }

  savePricingForm(): void {
    if (!this.canEdit) {
      return;
    }
    if (this.pricingEditingId) {
      this.form = {
        ...this.form,
        pricingRows: this.form.pricingRows.map((r) =>
          r.id === this.pricingEditingId
            ? {
                ...r,
                fromDate: this.pricingForm.fromDate,
                toDate: this.pricingForm.toDate,
                price: this.pricingForm.price,
              }
            : r,
        ),
      };
    } else {
      const nextId = this.form.pricingRows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
      this.form = {
        ...this.form,
        pricingRows: [
          ...this.form.pricingRows,
          {
            id: nextId,
            fromDate: this.pricingForm.fromDate,
            toDate: this.pricingForm.toDate,
            price: this.pricingForm.price,
          },
        ],
      };
    }
    this.closePricingModal();
  }

  deletePricingRow(row: PricePackagePricingRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openPricingActionsId = null;
    void this.uiMsg.confirm(this.ui.screenText('settings', 'pricePackagesPricingDeleteConfirm')).then((ok) => {
      if (!ok) {
        return;
      }
      this.form = {
        ...this.form,
        pricingRows: this.form.pricingRows.filter((r) => r.id !== row.id),
      };
      this.cdr.markForCheck();
    });
  }

  pricingModalTitleKey(): string {
    return this.pricingEditingId ? 'pricePackagesPricingModalEditTitle' : 'pricePackagesPricingModalCreateTitle';
  }
}
