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
import { UiMessageService } from '../../services/ui-message.service';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { TAX_CLASSIFICATION_SEED, TaxClassificationRowDto } from './tax-classification.seed';

type SortKey =
  | 'id'
  | 'name'
  | 'foreignName'
  | 'description'
  | 'invoiceType'
  | 'isDefault'
  | 'displayOrder';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-tax-classification',
  standalone: true,
  imports: [CommonModule, UiInlineTextComponent],
  templateUrl: './tax-classification.component.html',
  styleUrls: [
    '../hotel-chains/hotel-chains.component.scss',
    '../tax-types/tax-types.component.scss',
    './tax-classification.component.scss',
  ],
})
export class TaxClassificationComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() canEdit = true;

  rows: TaxClassificationRowDto[] = [];
  sortKey: SortKey | null = null;
  sortDir: SortDir = 'asc';
  openActionsId: number | null = null;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = TAX_CLASSIFICATION_SEED.map((row) => ({ ...row }));
  }

  @HostListener('document:click')
  closeActionsMenu(): void {
    if (this.openActionsId !== null) {
      this.openActionsId = null;
      this.cdr.markForCheck();
    }
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

  invoiceTypeLabel(type: TaxClassificationRowDto['invoiceType']): string {
    return type === 'standard'
      ? this.ui.screenText('settings', 'taxClassificationInvoiceStandard')
      : type;
  }

  defaultLabel(isDefault: boolean): string {
    return isDefault
      ? this.ui.screenText('settings', 'taxClassificationYes')
      : this.ui.screenText('settings', 'taxClassificationNo');
  }

  filteredRows(): TaxClassificationRowDto[] {
    let rows = [...this.rows];
    if (this.sortKey) {
      const dir = this.sortDir === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        let cmp = 0;
        switch (this.sortKey) {
          case 'id':
            cmp = a.id - b.id;
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
          case 'invoiceType':
            cmp = a.invoiceType.localeCompare(b.invoiceType, 'en');
            break;
          case 'isDefault':
            cmp = Number(a.isDefault) - Number(b.isDefault);
            break;
          case 'displayOrder':
            cmp = a.displayOrder - b.displayOrder;
            break;
        }
        if (cmp === 0) {
          cmp = a.id - b.id;
        }
        return cmp * dir;
      });
    } else {
      rows.sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id);
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
  }

  openEdit(row: TaxClassificationRowDto): void {
    if (!this.canEdit) {
      return;
    }
    void row;
  }

  deleteRow(row: TaxClassificationRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openActionsId = null;
    void this.uiMsg.confirm(this.ui.screenText('settings', 'taxClassificationDeleteConfirm')).then((ok) => {
      if (!ok) {
        return;
      }
      this.rows = this.rows.filter((r) => r.id !== row.id);
      this.cdr.markForCheck();
    });
  }
}
