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
import { UiMessageService } from '../../services/ui-message.service';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import {
  CHART_OF_ACCOUNTS_LINK_SEED,
  ChartOfAccountsLinkRowDto,
} from './chart-of-accounts-link.seed';

interface ChartOfAccountsLinkForm {
  accountReference: string;
  accountNumber: string;
  accountName: string;
  operationCode: string;
  subAccount: string;
  costCenter: string;
}

type SortKey =
  | 'accountNumber'
  | 'accountName'
  | 'accountReference'
  | 'operationCode'
  | 'costCenter'
  | 'subAccount';
type SortDir = 'asc' | 'desc';

const EMPTY_FORM: ChartOfAccountsLinkForm = {
  accountReference: '',
  accountNumber: '',
  accountName: '',
  operationCode: '',
  subAccount: '',
  costCenter: '',
};

@Component({
  selector: 'app-chart-of-accounts-link',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent, LocaleNumberPipe],
  templateUrl: './chart-of-accounts-link.component.html',
  styleUrls: [
    '../../settings/hotel-chains/hotel-chains.component.scss',
    './chart-of-accounts-link.component.scss',
  ],
})
export class ChartOfAccountsLinkComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  rows: ChartOfAccountsLinkRowDto[] = [];
  searchQuery = '';
  sortKey: SortKey | null = null;
  sortDir: SortDir = 'asc';
  modalOpen = false;
  saving = false;
  form: ChartOfAccountsLinkForm = { ...EMPTY_FORM };

  readonly accountReferenceOptions = ['أصول', 'خصوم', 'إيرادات', 'مصروفات'];
  readonly accountNumberOptions = ['1001', '2001', '3001', '4001'];
  readonly operationCodeOptions = ['SALE', 'PAY', 'RCV', 'ADJ'];
  readonly subAccountOptions = ['فرعي 1', 'فرعي 2', 'فرعي 3'];
  readonly costCenterOptions = ['الإدارة', 'الاستقبال', 'المطعم', 'الصيانة'];

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = CHART_OF_ACCOUNTS_LINK_SEED.map((row) => ({ ...row }));
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modalOpen) {
      this.closeModal();
    }
  }

  label(key: string): string {
    return this.ui.screenText('chartOfAccountsLink', key);
  }

  totalAccounts(): number {
    return this.rows.length;
  }

  openCreate(): void {
    this.form = { ...EMPTY_FORM };
    this.modalOpen = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.modalOpen = false;
    this.cdr.markForCheck();
  }

  saveLink(): void {
    if (this.saving) {
      return;
    }
    if (!this.form.accountName.trim() || !this.form.accountNumber.trim()) {
      this.uiMsg.show(this.label('requiredFields'));
      return;
    }
    this.saving = true;
    const nextId = this.rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
    this.rows = [
      ...this.rows,
      {
        id: nextId,
        accountNumber: this.form.accountNumber.trim(),
        accountName: this.form.accountName.trim(),
        accountReference: this.form.accountReference.trim(),
        operationCode: this.form.operationCode.trim(),
        costCenter: this.form.costCenter.trim(),
        subAccount: this.form.subAccount.trim(),
      },
    ];
    window.setTimeout(() => {
      this.saving = false;
      this.modalOpen = false;
      this.uiMsg.show(this.label('saveSuccess'));
      this.cdr.markForCheck();
    }, 300);
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

  filteredRows(): ChartOfAccountsLinkRowDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = [...this.rows];

    if (q) {
      rows = rows.filter((row) => {
        const hay = [
          row.accountNumber,
          row.accountName,
          row.accountReference,
          row.operationCode,
          row.costCenter,
          row.subAccount,
        ]
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      });
    }

    if (this.sortKey) {
      const dir = this.sortDir === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        const cmp = String(a[this.sortKey!]).localeCompare(String(b[this.sortKey!]), 'ar') * dir;
        return cmp === 0 ? (a.id - b.id) * dir : cmp;
      });
    } else {
      rows.sort((a, b) => a.id - b.id);
    }

    return rows;
  }

  displayValue(value: string): string {
    return value?.trim() ? value : '—';
  }
}
