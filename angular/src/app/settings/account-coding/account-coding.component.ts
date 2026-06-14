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
  ACCOUNT_ACCOUNTS_SEED,
  ACCOUNT_MAIN_GROUPS_SEED,
  ACCOUNT_SUB_GROUPS_SEED,
  AccountCodingRowDto,
  AccountCodingTab,
} from './account-coding.seed';

type ViewMode = 'list' | 'grid';
type StatusFilter = 'all' | 'active' | 'inactive';
type SortKey = 'code' | 'name' | 'foreignName' | 'type' | 'sortOrder';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-account-coding',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './account-coding.component.html',
  styleUrls: ['../hotel-chains/hotel-chains.component.scss', './account-coding.component.scss'],
})
export class AccountCodingComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() canEdit = true;

  readonly codingTabs: AccountCodingTab[] = ['mainGroups', 'subGroups', 'accounts'];

  activeCodingTab: AccountCodingTab = 'mainGroups';
  mainGroups: AccountCodingRowDto[] = [];
  subGroups: AccountCodingRowDto[] = [];
  accounts: AccountCodingRowDto[] = [];

  viewMode: ViewMode = 'list';
  searchQuery = '';
  statusFilter: StatusFilter = 'all';
  sortKey: SortKey | null = null;
  sortDir: SortDir = 'asc';
  openActionsId: number | null = null;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.mainGroups = ACCOUNT_MAIN_GROUPS_SEED.map((row) => ({ ...row }));
    this.subGroups = ACCOUNT_SUB_GROUPS_SEED.map((row) => ({ ...row }));
    this.accounts = ACCOUNT_ACCOUNTS_SEED.map((row) => ({ ...row }));
  }

  @HostListener('document:click')
  closeActionsMenu(): void {
    if (this.openActionsId !== null) {
      this.openActionsId = null;
      this.cdr.markForCheck();
    }
  }

  setCodingTab(tab: AccountCodingTab): void {
    this.activeCodingTab = tab;
    this.searchQuery = '';
    this.sortKey = null;
    this.openActionsId = null;
    this.cdr.markForCheck();
  }

  codingTabLabelKey(tab: AccountCodingTab): string {
    switch (tab) {
      case 'subGroups':
        return 'accountCodingTabSubGroups';
      case 'accounts':
        return 'accountCodingTabAccounts';
      default:
        return 'accountCodingTabMainGroups';
    }
  }

  activeRows(): AccountCodingRowDto[] {
    switch (this.activeCodingTab) {
      case 'subGroups':
        return this.subGroups;
      case 'accounts':
        return this.accounts;
      default:
        return this.mainGroups;
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

  filteredRows(): AccountCodingRowDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = [...this.activeRows()];
    if (q) {
      rows = rows.filter((r) => {
        const hay = `${r.code} ${r.name} ${r.foreignName} ${r.type} ${r.sortOrder}`.toLowerCase();
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
            cmp = a.foreignName.localeCompare(b.foreignName, 'en');
            break;
          case 'type':
            cmp = a.type - b.type;
            break;
          case 'sortOrder':
            cmp = a.sortOrder - b.sortOrder;
            break;
          default:
            cmp = a.code - b.code;
        }
        if (cmp === 0) {
          cmp = a.id - b.id;
        }
        return cmp * dir;
      });
    } else {
      rows.sort((a, b) => a.sortOrder - b.sortOrder);
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

  openEdit(row: AccountCodingRowDto): void {
    if (!this.canEdit) {
      return;
    }
    void row;
  }

  deleteRow(row: AccountCodingRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openActionsId = null;
    void this.uiMsg.confirm(this.ui.screenText('settings', 'accountCodingDeleteConfirm')).then((ok) => {
      if (!ok) {
        return;
      }
      const remove = (list: AccountCodingRowDto[]) => list.filter((r) => r.id !== row.id);
      switch (this.activeCodingTab) {
        case 'subGroups':
          this.subGroups = remove(this.subGroups);
          break;
        case 'accounts':
          this.accounts = remove(this.accounts);
          break;
        default:
          this.mainGroups = remove(this.mainGroups);
      }
      this.cdr.markForCheck();
    });
  }
}
