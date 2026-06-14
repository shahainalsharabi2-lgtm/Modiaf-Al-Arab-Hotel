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
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { AGENT_ACCOUNTS_SEED, AgentAccountRowDto } from './agent-accounts.seed';

type ViewMode = 'list' | 'grid';
type StatusFilter = 'all' | AgentAccountRowDto['status'];
type SortKey = 'agentName' | 'totalCommissionsDue' | 'totalCommissionsPaid' | 'balance' | 'status';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-agent-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent, LocaleNumberPipe],
  templateUrl: './agent-accounts.component.html',
  styleUrls: [
    '../../settings/hotel-chains/hotel-chains.component.scss',
    '../ar-accounts/ar-accounts.component.scss',
    './agent-accounts.component.scss',
  ],
})
export class AgentAccountsComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  rows: AgentAccountRowDto[] = [];
  viewMode: ViewMode = 'list';
  searchQuery = '';
  statusFilter: StatusFilter = 'all';
  sortKey: SortKey | null = null;
  sortDir: SortDir = 'asc';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = AGENT_ACCOUNTS_SEED.map((row) => ({ ...row }));
  }

  label(key: string): string {
    return this.ui.screenText('agentAccounts', key);
  }

  statusLabel(status: AgentAccountRowDto['status']): string {
    const keyByStatus: Record<AgentAccountRowDto['status'], string> = {
      open: 'statusOpen',
      closed: 'statusClosed',
      settled: 'statusSettled',
    };
    return this.label(keyByStatus[status]);
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

  filteredRows(): AgentAccountRowDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = [...this.rows];

    if (this.statusFilter !== 'all') {
      rows = rows.filter((row) => row.status === this.statusFilter);
    }

    if (q) {
      rows = rows.filter((row) => {
        const hay = [row.agentName, this.statusLabel(row.status)].join(' ').toLowerCase();
        return hay.includes(q);
      });
    }

    if (this.sortKey) {
      const dir = this.sortDir === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        let cmp = 0;
        switch (this.sortKey) {
          case 'agentName':
            cmp = a.agentName.localeCompare(b.agentName, 'ar');
            break;
          case 'totalCommissionsDue':
            cmp = a.totalCommissionsDue - b.totalCommissionsDue;
            break;
          case 'totalCommissionsPaid':
            cmp = a.totalCommissionsPaid - b.totalCommissionsPaid;
            break;
          case 'balance':
            cmp = a.balance - b.balance;
            break;
          case 'status':
            cmp = a.status.localeCompare(b.status);
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

  balanceClass(balance: number): string {
    return balance !== 0 ? 'aa-balance aa-balance--due' : 'aa-balance';
  }
}
