import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostListener,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { AR_ACCOUNTS_SEED, ArAccountRowDto } from './ar-accounts.seed';

type ViewMode = 'list' | 'grid';
type TypeFilter = 'all' | 'company' | 'individual';
type SortKey =
  | 'code'
  | 'name'
  | 'foreignName'
  | 'accountNumber'
  | 'countryCode'
  | 'cityCode'
  | 'mobile'
  | 'accountType'
  | 'balance';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-ar-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent, LocaleNumberPipe],
  templateUrl: './ar-accounts.component.html',
  styleUrls: ['../../settings/hotel-chains/hotel-chains.component.scss', './ar-accounts.component.scss'],
})
export class ArAccountsComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  rows: ArAccountRowDto[] = [];
  viewMode: ViewMode = 'list';
  searchQuery = '';
  typeFilter: TypeFilter = 'all';
  sortKey: SortKey | null = null;
  sortDir: SortDir = 'asc';
  openActionsId: number | null = null;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = AR_ACCOUNTS_SEED.map((row) => ({ ...row }));
  }

  @HostListener('document:click')
  closeActionsMenu(): void {
    if (this.openActionsId !== null) {
      this.openActionsId = null;
      this.cdr.markForCheck();
    }
  }

  label(key: string): string {
    return this.ui.screenText('arAccounts', key);
  }

  accountTypeLabel(type: ArAccountRowDto['accountType']): string {
    return type === 'company' ? this.label('accountTypeCompany') : this.label('accountTypeIndividual');
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

  filteredRows(): ArAccountRowDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = [...this.rows];

    if (this.typeFilter !== 'all') {
      rows = rows.filter((row) => row.accountType === this.typeFilter);
    }

    if (q) {
      rows = rows.filter((row) => {
        const hay = [
          row.code,
          row.name,
          row.foreignName,
          row.accountNumber,
          row.countryCode,
          row.cityCode,
          row.mobile,
          this.accountTypeLabel(row.accountType),
        ]
          .join(' ')
          .toLowerCase();
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
          case 'foreignName':
            cmp = a.foreignName.localeCompare(b.foreignName, 'ar');
            break;
          case 'accountNumber':
            cmp = a.accountNumber.localeCompare(b.accountNumber, 'en');
            break;
          case 'countryCode':
            cmp = a.countryCode.localeCompare(b.countryCode, 'en');
            break;
          case 'cityCode':
            cmp = a.cityCode.localeCompare(b.cityCode, 'en');
            break;
          case 'mobile':
            cmp = a.mobile.localeCompare(b.mobile, 'en');
            break;
          case 'accountType':
            cmp = a.accountType.localeCompare(b.accountType);
            break;
          case 'balance':
            cmp = a.balance - b.balance;
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

  toggleActionsMenu(id: number, event: Event): void {
    event.stopPropagation();
    this.openActionsId = this.openActionsId === id ? null : id;
    this.cdr.markForCheck();
  }

  displayValue(value: string): string {
    return value?.trim() ? value : '—';
  }
}
