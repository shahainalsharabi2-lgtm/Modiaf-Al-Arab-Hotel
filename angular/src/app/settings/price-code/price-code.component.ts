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
  PRICE_CODE_SEED,
  PriceCodeFormDto,
  PriceCodeFormTab,
  PriceCodeIncludedPackageDto,
  PriceCodeRowDto,
  emptyPriceCodeForm,
  formatPriceCodeDate,
  priceCodeRowToForm,
} from './price-code.seed';
import {
  PRICE_PACKAGES_SEED,
  calcMethodTranslationKey,
  calcRuleTranslationKey,
} from '../price-packages/price-packages.seed';

type ScreenMode = 'list' | 'form';
type SortKey =
  | 'number'
  | 'code'
  | 'name'
  | 'currency'
  | 'pricingStartDate'
  | 'pricingEndDate'
  | 'negotiable'
  | 'hospitality'
  | 'active';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-price-code',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './price-code.component.html',
  styleUrls: [
    '../hotel-chains/hotel-chains.component.scss',
    '../room-types/room-types.component.scss',
    './price-code.component.scss',
  ],
})
export class PriceCodeComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly formatPriceCodeDate = formatPriceCodeDate;
  readonly formTabs: PriceCodeFormTab[] = ['schedule', 'packages', 'posting', 'promotions'];

  @Input() canEdit = true;

  screenMode: ScreenMode = 'list';
  rows: PriceCodeRowDto[] = [];
  form: PriceCodeFormDto = emptyPriceCodeForm();
  activeFormTab: PriceCodeFormTab = 'schedule';
  sortKey: SortKey | null = null;
  sortDir: SortDir = 'asc';
  openActionsId: number | null = null;
  pickPackageOpen = false;
  pickPackageSearch = '';
  pickPackageSelected = new Set<string>();

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = PRICE_CODE_SEED.map((row) => ({ ...row }));
  }

  @HostListener('document:click')
  closeActionsMenu(): void {
    if (this.openActionsId !== null) {
      this.openActionsId = null;
      this.cdr.markForCheck();
    }
  }

  formTabKey(tab: PriceCodeFormTab): string {
    const keys: Record<PriceCodeFormTab, string> = {
      schedule: 'priceCodeTabSchedule',
      packages: 'priceCodeTabPackages',
      posting: 'priceCodeTabPosting',
      promotions: 'priceCodeTabPromotions',
    };
    return keys[tab];
  }

  formTabIcon(tab: PriceCodeFormTab): string {
    const icons: Record<PriceCodeFormTab, string> = {
      schedule: 'fa-th',
      packages: 'fa-box-open',
      posting: 'fa-cog',
      promotions: 'fa-tag',
    };
    return icons[tab];
  }

  setFormTab(tab: PriceCodeFormTab): void {
    this.activeFormTab = tab;
    this.cdr.markForCheck();
  }

  calcMethodLabel(key: string): string {
    return this.ui.screenText('settings', calcMethodTranslationKey(key));
  }

  calcRuleLabel(key: string): string {
    return this.ui.screenText('settings', calcRuleTranslationKey(key));
  }

  isUnsavedForm(): boolean {
    return this.form.id === null;
  }

  openPickPackage(): void {
    if (!this.canEdit) {
      return;
    }
    this.pickPackageSearch = '';
    this.pickPackageSelected = new Set<string>();
    this.pickPackageOpen = true;
    this.cdr.markForCheck();
  }

  closePickPackage(): void {
    this.pickPackageOpen = false;
    this.pickPackageSelected = new Set<string>();
    this.cdr.markForCheck();
  }

  filteredPackageCatalog() {
    const q = this.pickPackageSearch.trim().toLowerCase();
    const existing = new Set(this.form.includedPackages.map((item) => item.code));
    let items = PRICE_PACKAGES_SEED.filter((item) => !existing.has(item.code));
    if (q) {
      items = items.filter((item) => {
        const hay =
          `${item.code} ${item.name} ${this.calcMethodLabel(item.calculationMethodKey)} ${this.calcRuleLabel(item.calculationRuleKey)}`.toLowerCase();
        return hay.includes(q);
      });
    }
    return items;
  }

  pickPackageAllSelected(): boolean {
    const visible = this.filteredPackageCatalog();
    return visible.length > 0 && visible.every((item) => this.pickPackageSelected.has(item.code));
  }

  togglePickPackageAll(): void {
    const visible = this.filteredPackageCatalog();
    if (this.pickPackageAllSelected()) {
      visible.forEach((item) => this.pickPackageSelected.delete(item.code));
    } else {
      visible.forEach((item) => this.pickPackageSelected.add(item.code));
    }
    this.cdr.markForCheck();
  }

  togglePickPackage(code: string): void {
    if (this.pickPackageSelected.has(code)) {
      this.pickPackageSelected.delete(code);
    } else {
      this.pickPackageSelected.add(code);
    }
    this.cdr.markForCheck();
  }

  isPickPackageSelected(code: string): boolean {
    return this.pickPackageSelected.has(code);
  }

  confirmPickPackage(): void {
    const toAdd: PriceCodeIncludedPackageDto[] = PRICE_PACKAGES_SEED.filter((item) =>
      this.pickPackageSelected.has(item.code),
    ).map((item) => ({
      code: item.code,
      name: item.name,
      price: '',
      calculationMethodKey: item.calculationMethodKey,
      calculationRuleKey: item.calculationRuleKey,
    }));
    this.form = {
      ...this.form,
      includedPackages: [...this.form.includedPackages, ...toAdd],
    };
    this.closePickPackage();
  }

  removeIncludedPackage(item: PriceCodeIncludedPackageDto): void {
    if (!this.canEdit) {
      return;
    }
    this.form = {
      ...this.form,
      includedPackages: this.form.includedPackages.filter((row) => row.code !== item.code),
    };
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

  filteredRows(): PriceCodeRowDto[] {
    let rows = [...this.rows];
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
          case 'currency':
            cmp = a.currency.localeCompare(b.currency, 'en');
            break;
          case 'pricingStartDate':
            cmp = a.pricingStartDate.localeCompare(b.pricingStartDate);
            break;
          case 'pricingEndDate':
            cmp = a.pricingEndDate.localeCompare(b.pricingEndDate);
            break;
          case 'negotiable':
            cmp = Number(a.negotiable) - Number(b.negotiable);
            break;
          case 'hospitality':
            cmp = Number(a.hospitality) - Number(b.hospitality);
            break;
          case 'active':
            cmp = Number(a.active) - Number(b.active);
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

  toggleRowActive(row: PriceCodeRowDto, event: Event): void {
    event.stopPropagation();
    if (!this.canEdit) {
      return;
    }
    const input = event.target as HTMLInputElement;
    row.active = input.checked;
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
    this.form = emptyPriceCodeForm();
    this.activeFormTab = 'schedule';
    this.screenMode = 'form';
    this.cdr.markForCheck();
  }

  openEdit(row: PriceCodeRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openActionsId = null;
    this.form = priceCodeRowToForm(row);
    this.activeFormTab = 'schedule';
    this.screenMode = 'form';
    this.cdr.markForCheck();
  }

  deleteRow(row: PriceCodeRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openActionsId = null;
    void this.uiMsg.confirm(this.ui.screenText('settings', 'priceCodeDeleteConfirm')).then((ok) => {
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
              currency: this.form.currency,
              pricingStartDate: this.form.pricingStartDate,
              pricingEndDate: this.form.pricingEndDate,
              negotiable: this.form.negotiable,
              hospitality: this.form.hospitality,
              active: this.form.active,
            }
          : r,
      );
    } else {
      const nextId = this.rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
      const nextNumber = this.rows.reduce((max, r) => Math.max(max, r.number), 0) + 1;
      this.rows = [
        ...this.rows,
        {
          id: nextId,
          number: nextNumber,
          code: this.form.code,
          name: this.form.name,
          currency: this.form.currency,
          pricingStartDate: this.form.pricingStartDate,
          pricingEndDate: this.form.pricingEndDate,
          negotiable: this.form.negotiable,
          hospitality: this.form.hospitality,
          active: this.form.active,
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
      this.form = row ? priceCodeRowToForm(row) : emptyPriceCodeForm();
    } else {
      this.form = emptyPriceCodeForm();
    }
    this.cdr.markForCheck();
  }

  printForm(): void {
    void 0;
  }
}
