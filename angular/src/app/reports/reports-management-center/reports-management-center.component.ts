import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import {
  MANAGED_REPORT_DEFINITIONS,
  REPORT_MANAGEMENT_CATEGORIES,
  type ManagedReportDefinition,
  type ReportManagementCategory,
} from '../reports-management.config';

type ManagementViewMode = 'list' | 'grid';
type VisibilityFilter = 'all' | 'visible' | 'hidden';

interface ManagedReportRow extends ManagedReportDefinition {
  showInAll: boolean;
}

const VISIBILITY_STORAGE_KEY = 'hotel-reports-management-visibility';

@Component({
  selector: 'app-reports-management-center',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, UiInlineTextComponent],
  templateUrl: './reports-management-center.component.html',
  styleUrls: ['./reports-management-center.component.css'],
})
export class ReportsManagementCenterComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly categories = REPORT_MANAGEMENT_CATEGORIES;

  rows: ManagedReportRow[] = [];
  searchQuery = '';
  categoryFilter: ReportManagementCategory | 'all' = 'all';
  visibilityFilter: VisibilityFilter = 'all';
  viewMode: ManagementViewMode = 'list';
  openActionsId: string | null = null;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = this.buildRows();
  }

  filteredRows(): ManagedReportRow[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.rows.filter((row) => {
      if (this.categoryFilter !== 'all' && row.category !== this.categoryFilter) {
        return false;
      }
      if (this.visibilityFilter === 'visible' && !row.showInAll) {
        return false;
      }
      if (this.visibilityFilter === 'hidden' && row.showInAll) {
        return false;
      }
      if (!q) {
        return true;
      }
      const ar = this.ui.screenText('reports', row.labelKey).toLowerCase();
      const en = this.ui.screenText('reports', row.foreignLabelKey).toLowerCase();
      return row.id.toLowerCase().includes(q) || ar.includes(q) || en.includes(q);
    });
  }

  setViewMode(mode: ManagementViewMode): void {
    this.viewMode = mode;
    this.closeActionsMenu();
    this.cdr.markForCheck();
  }

  toggleShowInAll(row: ManagedReportRow): void {
    row.showInAll = !row.showInAll;
    this.persistVisibility();
    this.cdr.markForCheck();
  }

  toggleActionsMenu(reportId: string, event: Event): void {
    event.stopPropagation();
    this.openActionsId = this.openActionsId === reportId ? null : reportId;
    this.cdr.markForCheck();
  }

  closeActionsMenu(): void {
    this.openActionsId = null;
    this.cdr.markForCheck();
  }

  copyProgrammaticId(row: ManagedReportRow): void {
    void navigator.clipboard?.writeText(row.id);
    this.closeActionsMenu();
  }

  toggleVisibilityFromMenu(row: ManagedReportRow): void {
    this.toggleShowInAll(row);
    this.closeActionsMenu();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.openActionsId) {
      this.closeActionsMenu();
    }
  }

  private buildRows(): ManagedReportRow[] {
    const saved = this.loadVisibility();
    return MANAGED_REPORT_DEFINITIONS.map((def) => ({
      ...def,
      showInAll: saved[def.id] ?? def.showInAllDefault,
    }));
  }

  private loadVisibility(): Record<string, boolean> {
    try {
      const raw = localStorage.getItem(VISIBILITY_STORAGE_KEY);
      if (!raw) {
        return {};
      }
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  private persistVisibility(): void {
    const map: Record<string, boolean> = {};
    for (const row of this.rows) {
      map[row.id] = row.showInAll;
    }
    localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(map));
  }
}
