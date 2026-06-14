import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { CRM_BLACKLIST_ROWS } from './crm-blacklist.static-data';
import type {
  BlacklistEntityTab,
  BlacklistRow,
  BlacklistSortDir,
  BlacklistSortKey,
  BlacklistViewMode,
} from './crm-blacklist.types';

@Component({
  selector: 'app-crm-blacklist',
  standalone: true,
  imports: [CommonModule, FormsModule, LocaleNumberPipe, UiInlineTextComponent],
  templateUrl: './crm-blacklist.component.html',
  styleUrls: ['./crm-blacklist.component.css'],
})
export class CrmBlacklistComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly tabs: BlacklistEntityTab[] = ['guest', 'company', 'agent'];

  allRows: BlacklistRow[] = [...CRM_BLACKLIST_ROWS];
  activeTab: BlacklistEntityTab = 'guest';
  showAllData = false;
  searchQuery = '';
  scopeFilter = '';
  viewMode: BlacklistViewMode = 'table';

  sortKey: BlacklistSortKey = 'firstName';
  sortDir: BlacklistSortDir = 'asc';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
  }

  label(key: string): string {
    return this.ui.screenText('crmBlacklist', key);
  }

  tabLabel(tab: BlacklistEntityTab): string {
    return this.label(`tab_${tab}`);
  }

  setTab(tab: BlacklistEntityTab): void {
    this.activeTab = tab;
    this.showAllData = false;
  }

  setViewMode(mode: BlacklistViewMode): void {
    this.viewMode = mode;
  }

  toggleShowAll(): void {
    this.showAllData = !this.showAllData;
  }

  get filteredRows(): BlacklistRow[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = this.allRows;
    if (!this.showAllData) {
      rows = rows.filter((row) => row.entityType === this.activeTab);
    }
    if (this.scopeFilter === 'withMobile') {
      rows = rows.filter((row) => !!row.mobile.trim());
    }
    if (q) {
      rows = rows.filter((row) =>
        [row.firstName, row.secondName, row.middleName, row.lastName, row.mobile].some((v) =>
          v.toLowerCase().includes(q),
        ),
      );
    }
    return [...rows].sort((a, b) => this.compareRows(a, b));
  }

  toggleSort(key: BlacklistSortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      return;
    }
    this.sortKey = key;
    this.sortDir = 'asc';
  }

  sortIcon(key: BlacklistSortKey): string {
    if (this.sortKey !== key) {
      return 'fa-sort';
    }
    return this.sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  cellValue(value: string): string {
    return value?.trim() ? value : '—';
  }

  trackRow(_index: number, row: BlacklistRow): string {
    return row.id;
  }

  editRow(_row: BlacklistRow): void {}

  private compareRows(a: BlacklistRow, b: BlacklistRow): number {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    const av = this.sortValue(a, this.sortKey);
    const bv = this.sortValue(b, this.sortKey);
    if (av < bv) {
      return -1 * dir;
    }
    if (av > bv) {
      return 1 * dir;
    }
    return 0;
  }

  private sortValue(row: BlacklistRow, key: BlacklistSortKey): string {
    return row[key];
  }
}
