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
  CreateUpdateCreditCardTypeDto,
  CreditCardTypeDto,
} from '../../services/credit-card-type.service';
import { UiMessageService } from '../../services/ui-message.service';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { CREDIT_CARD_TYPES_SEED } from './credit-card-types.seed';

type ViewMode = 'list' | 'grid';
type StatusFilter = 'all' | 'active' | 'inactive';
type SortKey = 'code' | 'name' | 'foreignName' | 'description' | 'displayOrder' | 'bank';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-credit-card-types',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './credit-card-types.component.html',
  styleUrls: ['../hotel-chains/hotel-chains.component.scss'],
})
export class CreditCardTypesComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() canEdit = true;

  rows: CreditCardTypeDto[] = [];
  saving = false;
  errorMessage = '';
  modalOpen = false;
  editingId: number | null = null;
  form: CreateUpdateCreditCardTypeDto = this.emptyForm();
  private nextId = CREDIT_CARD_TYPES_SEED.length + 1;

  viewMode: ViewMode = 'list';
  searchQuery = '';
  statusFilter: StatusFilter = 'all';
  sortKey: SortKey | null = null;
  sortDir: SortDir = 'asc';
  openActionsId: number | null = null;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = CREDIT_CARD_TYPES_SEED.map((row) => ({ ...row }));
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

  filteredRows(): CreditCardTypeDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = [...this.rows];
    if (this.statusFilter === 'active') {
      rows = rows.filter((r) => r.isActive);
    } else if (this.statusFilter === 'inactive') {
      rows = rows.filter((r) => !r.isActive);
    }
    if (q) {
      rows = rows.filter((r) => {
        const hay = `${r.code} ${r.name} ${r.foreignName ?? ''} ${r.description ?? ''} ${r.bank ?? ''}`.toLowerCase();
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
          case 'description':
            cmp = (a.description ?? '').localeCompare(b.description ?? '', 'ar');
            break;
          case 'displayOrder':
            cmp = a.displayOrder - b.displayOrder;
            break;
          case 'bank':
            cmp = (a.bank ?? '').localeCompare(b.bank ?? '', 'ar');
            break;
          default:
            cmp = a.code.localeCompare(b.code, 'en', { sensitivity: 'base' });
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
    this.form = {
      ...this.emptyForm(),
      displayOrder: this.rows.length ? Math.max(...this.rows.map((r) => r.displayOrder)) + 1 : 1,
      bank: 'شبكة وسيط',
    };
    this.modalOpen = true;
    this.openActionsId = null;
  }

  openEdit(row: CreditCardTypeDto): void {
    if (!this.canEdit) {
      return;
    }
    this.editingId = row.id;
    this.form = {
      code: row.code,
      name: row.name,
      foreignName: row.foreignName ?? '',
      description: row.description ?? '',
      displayOrder: row.displayOrder,
      isActive: row.isActive,
      bank: row.bank ?? '',
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
      this.errorMessage = this.ui.screenText('settings', 'creditCardTypesRequired');
      return;
    }
    const payload: CreditCardTypeDto = {
      id: this.editingId ?? this.nextId++,
      code,
      name,
      foreignName: (this.form.foreignName ?? '').trim() || null,
      description: (this.form.description ?? '').trim() || null,
      displayOrder: Number(this.form.displayOrder) || 0,
      isActive: !!this.form.isActive,
      bank: (this.form.bank ?? '').trim() || null,
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
    this.uiMsg.success(this.ui.screenText('settings', 'creditCardTypesSaveSuccess'));
    this.cdr.markForCheck();
  }

  deleteRow(row: CreditCardTypeDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openActionsId = null;
    void this.uiMsg.confirm(this.ui.screenText('settings', 'creditCardTypesDeleteConfirm')).then((ok) => {
      if (!ok) {
        return;
      }
      this.rows = this.rows.filter((r) => r.id !== row.id);
      this.uiMsg.success(this.ui.screenText('settings', 'creditCardTypesDeleteSuccess'));
      this.cdr.markForCheck();
    });
  }

  private emptyForm(): CreateUpdateCreditCardTypeDto {
    return {
      code: '',
      name: '',
      foreignName: '',
      description: '',
      displayOrder: 1,
      isActive: true,
      bank: '',
    };
  }
}
