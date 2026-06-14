import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { UiMessageService } from '../../services/ui-message.service';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { OPENING_BALANCES_SEED, OpeningBalanceRowDto } from './opening-balances.seed';

type SortKey = 'code' | 'name' | 'credit' | 'debit' | 'reference';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-opening-balances',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './opening-balances.component.html',
  styleUrls: [
    '../../settings/hotel-chains/hotel-chains.component.scss',
    './opening-balances.component.scss',
  ],
})
export class OpeningBalancesComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  rows: OpeningBalanceRowDto[] = [];
  searchQuery = '';
  sortKey: SortKey | null = null;
  sortDir: SortDir = 'asc';
  saving = false;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = OPENING_BALANCES_SEED.map((row) => ({ ...row }));
  }

  label(key: string): string {
    return this.ui.screenText('openingBalances', key);
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

  filteredRows(): OpeningBalanceRowDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = [...this.rows];

    if (q) {
      rows = rows.filter((row) => {
        const hay = [row.code, row.name, row.reference].join(' ').toLowerCase();
        return hay.includes(q);
      });
    }

    if (this.sortKey) {
      const dir = this.sortDir === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        let cmp = 0;
        switch (this.sortKey) {
          case 'code':
            cmp = a.code.localeCompare(b.code, 'en');
            break;
          case 'name':
            cmp = a.name.localeCompare(b.name, 'ar');
            break;
          case 'credit':
            cmp = a.credit - b.credit;
            break;
          case 'debit':
            cmp = a.debit - b.debit;
            break;
          case 'reference':
            cmp = a.reference.localeCompare(b.reference, 'ar');
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

  saveBalances(): void {
    if (this.saving) {
      return;
    }
    this.saving = true;
    window.setTimeout(() => {
      this.saving = false;
      this.uiMsg.show(this.label('saveSuccess'));
      this.cdr.markForCheck();
    }, 400);
  }

  importExport(): void {
    this.uiMsg.show(this.label('importExportHint'));
  }
}
