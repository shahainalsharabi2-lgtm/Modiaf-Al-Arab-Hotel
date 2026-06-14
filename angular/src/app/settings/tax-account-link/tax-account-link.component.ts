import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import {
  TAX_ACCOUNT_LINK_SEED,
  TaxAccountLinkModalRowDto,
  TaxAccountLinkRowDto,
} from './tax-account-link.seed';

type SortKey =
  | 'linkingMethod'
  | 'itemNumber'
  | 'itemName'
  | 'taxTypeName'
  | 'entityNumber'
  | 'entityName'
  | 'taxCode'
  | 'taxPercentage';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-tax-account-link',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './tax-account-link.component.html',
  styleUrls: [
    '../hotel-chains/hotel-chains.component.scss',
    '../room-types/room-types.component.scss',
    './tax-account-link.component.scss',
  ],
})
export class TaxAccountLinkComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() canEdit = true;

  rows: TaxAccountLinkRowDto[] = [];
  modalRows: TaxAccountLinkModalRowDto[] = [];
  modalOpen = false;
  modalTaxType = '';
  modalLinkBy = 'account';
  modalUnlinkedOnly = true;
  sortKey: SortKey | null = null;
  sortDir: SortDir = 'asc';
  pageIndex = 1;
  pageSize = 10;
  readonly pageSizes = [10, 50, 100, 500, 1000];

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = TAX_ACCOUNT_LINK_SEED.map((row) => ({ ...row }));
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

  formatPercentage(value: number): string {
    return value.toFixed(2);
  }

  filteredRows(): TaxAccountLinkRowDto[] {
    let rows = [...this.rows];
    if (this.sortKey) {
      const dir = this.sortDir === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        let cmp = 0;
        switch (this.sortKey) {
          case 'linkingMethod':
            cmp = a.linkingMethod.localeCompare(b.linkingMethod, 'ar');
            break;
          case 'itemNumber':
            cmp = a.itemNumber.localeCompare(b.itemNumber, 'en');
            break;
          case 'itemName':
            cmp = a.itemName.localeCompare(b.itemName, 'ar');
            break;
          case 'taxTypeName':
            cmp = a.taxTypeName.localeCompare(b.taxTypeName, 'ar');
            break;
          case 'entityNumber':
            cmp = a.entityNumber.localeCompare(b.entityNumber, 'en');
            break;
          case 'entityName':
            cmp = a.entityName.localeCompare(b.entityName, 'ar');
            break;
          case 'taxCode':
            cmp = a.taxCode.localeCompare(b.taxCode, 'en');
            break;
          case 'taxPercentage':
            cmp = a.taxPercentage - b.taxPercentage;
            break;
        }
        if (cmp === 0) {
          cmp = a.id - b.id;
        }
        return cmp * dir;
      });
    } else {
      rows.sort((a, b) => a.itemNumber.localeCompare(b.itemNumber, 'en'));
    }
    return rows;
  }

  totalRows(): number {
    return this.filteredRows().length;
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.totalRows() / this.pageSize));
  }

  pagedRows(): TaxAccountLinkRowDto[] {
    const start = (this.pageIndex - 1) * this.pageSize;
    return this.filteredRows().slice(start, start + this.pageSize);
  }

  setPageSize(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.cdr.markForCheck();
  }

  openCreate(): void {
    if (!this.canEdit) {
      return;
    }
    this.modalTaxType = '';
    this.modalLinkBy = 'account';
    this.modalUnlinkedOnly = true;
    this.modalRows = [];
    this.modalOpen = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.modalOpen = false;
    this.cdr.markForCheck();
  }

  fetchModalRows(): void {
    void 0;
  }

  saveModal(): void {
    if (!this.canEdit) {
      return;
    }
    this.closeModal();
  }
}
