import { CommonModule } from '@angular/common';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import {
  NIGHT_AUDIT_SETTINGS_DEFAULTS,
  type NightAuditExpectedArrivalsAction,
  type NightAuditExpectedDeparturesAction,
  type NightAuditOpenCashiersAction,
  type NightAuditSettingsRow,
  type NightAuditSettingsScopeFilter,
  type NightAuditSettingsSortDir,
  type NightAuditSettingsSortKey,
  type NightAuditSettingsViewMode,
} from './night-audit-settings.types';

@Component({
  selector: 'app-night-audit-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LocaleNumberPipe, UiInlineTextComponent],
  templateUrl: './night-audit-settings.component.html',
  styleUrls: ['./night-audit-settings.component.css'],
})
export class NightAuditSettingsComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly arrivalsOptions: NightAuditExpectedArrivalsAction[] = ['no_show', 'keep', 'cancel'];
  readonly departuresOptions: NightAuditExpectedDeparturesAction[] = ['extend_stay', 'check_out', 'keep'];
  readonly cashiersOptions: NightAuditOpenCashiersAction[] = ['auto_close', 'keep_open', 'warn'];

  allRows: NightAuditSettingsRow[] = [{ ...NIGHT_AUDIT_SETTINGS_DEFAULTS }];

  searchQuery = '';
  scopeFilter: NightAuditSettingsScopeFilter = 'all';
  viewMode: NightAuditSettingsViewMode = 'table';

  sortKey: NightAuditSettingsSortKey = 'startTime';
  sortDir: NightAuditSettingsSortDir = 'asc';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
  }

  label(key: string): string {
    return this.ui.screenText('nightAuditSettings', key);
  }

  setViewMode(mode: NightAuditSettingsViewMode): void {
    this.viewMode = mode;
  }

  get filteredRows(): NightAuditSettingsRow[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = this.allRows.filter((row) => {
      if (this.scopeFilter === 'automatic' && !row.automatic) {
        return false;
      }
      if (this.scopeFilter === 'manual' && row.automatic) {
        return false;
      }
      if (!q) {
        return true;
      }
      return [
        row.startTime,
        String(row.attemptCount),
        this.arrivalsLabel(row.expectedArrivals),
        this.departuresLabel(row.expectedDepartures),
        this.cashiersLabel(row.openCashiers),
      ].some((v) => v.toLowerCase().includes(q));
    });
    rows = [...rows].sort((a, b) => this.compareRows(a, b));
    return rows;
  }

  toggleSort(key: NightAuditSettingsSortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      return;
    }
    this.sortKey = key;
    this.sortDir = 'asc';
  }

  sortIcon(key: NightAuditSettingsSortKey): string {
    if (this.sortKey !== key) {
      return 'fa-sort';
    }
    return this.sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  arrivalsLabel(value: NightAuditExpectedArrivalsAction): string {
    return this.label(`arrivals_${value}`);
  }

  departuresLabel(value: NightAuditExpectedDeparturesAction): string {
    return this.label(`departures_${value}`);
  }

  cashiersLabel(value: NightAuditOpenCashiersAction): string {
    return this.label(`cashiers_${value}`);
  }

  setAutomatic(row: NightAuditSettingsRow, automatic: boolean): void {
    row.automatic = automatic;
  }

  editRow(_row: NightAuditSettingsRow): void {}

  trackRow(_index: number, row: NightAuditSettingsRow): string {
    return row.id;
  }

  private compareRows(a: NightAuditSettingsRow, b: NightAuditSettingsRow): number {
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

  private sortValue(row: NightAuditSettingsRow, key: NightAuditSettingsSortKey): string | number {
    switch (key) {
      case 'automatic':
        return row.automatic ? 1 : 0;
      case 'startTime':
        return row.startTime;
      case 'attemptCount':
        return row.attemptCount;
      case 'expectedArrivals':
        return this.arrivalsLabel(row.expectedArrivals);
      case 'expectedDepartures':
        return this.departuresLabel(row.expectedDepartures);
      case 'openCashiers':
        return this.cashiersLabel(row.openCashiers);
      default:
        return '';
    }
  }
}
