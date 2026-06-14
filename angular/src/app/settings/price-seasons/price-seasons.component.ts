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
  PRICE_SEASONS_SEED,
  PriceSeasonFormDto,
  PriceSeasonRowDto,
  emptyPriceSeasonForm,
  formatSeasonDate,
  priceSeasonRowToForm,
} from './price-seasons.seed';

type ViewMode = 'list' | 'grid';
type StatusFilter = 'all' | 'active' | 'inactive';
type SortKey = 'code' | 'name' | 'foreignName' | 'description' | 'fromDate' | 'toDate';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-price-seasons',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './price-seasons.component.html',
  styleUrls: [
    '../hotel-chains/hotel-chains.component.scss',
    '../room-types/room-types.component.scss',
    './price-seasons.component.scss',
  ],
})
export class PriceSeasonsComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly formatSeasonDate = formatSeasonDate;

  @Input() canEdit = true;

  rows: PriceSeasonRowDto[] = [];
  form: PriceSeasonFormDto = emptyPriceSeasonForm();
  modalOpen = false;
  editingId: number | null = null;
  viewMode: ViewMode = 'list';
  searchQuery = '';
  statusFilter: StatusFilter = 'all';
  sortKey: SortKey | null = null;
  sortDir: SortDir = 'asc';
  openActionsId: number | null = null;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = PRICE_SEASONS_SEED.map((row) => ({ ...row }));
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

  filteredRows(): PriceSeasonRowDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = [...this.rows];
    if (q) {
      rows = rows.filter((r) => {
        const hay = `${r.code} ${r.name} ${r.foreignName} ${r.description} ${r.fromDate} ${r.toDate}`.toLowerCase();
        return hay.includes(q);
      });
    }
    if (this.sortKey) {
      const dir = this.sortDir === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        let cmp = 0;
        switch (this.sortKey) {
          case 'code':
            cmp = a.code.localeCompare(b.code, 'ar');
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
          case 'fromDate':
            cmp = a.fromDate.localeCompare(b.fromDate);
            break;
          case 'toDate':
            cmp = a.toDate.localeCompare(b.toDate);
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
    this.form = emptyPriceSeasonForm();
    this.modalOpen = true;
    this.cdr.markForCheck();
  }

  openEdit(row: PriceSeasonRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openActionsId = null;
    this.editingId = row.id;
    this.form = priceSeasonRowToForm(row);
    this.modalOpen = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.modalOpen = false;
    this.editingId = null;
    this.form = emptyPriceSeasonForm();
    this.cdr.markForCheck();
  }

  saveForm(): void {
    if (!this.canEdit) {
      return;
    }
    this.closeModal();
  }

  deleteRow(row: PriceSeasonRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openActionsId = null;
    void this.uiMsg.confirm(this.ui.screenText('settings', 'priceSeasonsDeleteConfirm')).then((ok) => {
      if (!ok) {
        return;
      }
      this.rows = this.rows.filter((r) => r.id !== row.id);
      this.cdr.markForCheck();
    });
  }

  modalTitleKey(): string {
    return this.editingId ? 'priceSeasonsModalEditTitle' : 'priceSeasonsModalCreateTitle';
  }
}
