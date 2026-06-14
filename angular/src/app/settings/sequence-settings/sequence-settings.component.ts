import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { SEQUENCE_SETTINGS_SEED, SequenceSettingRowDto } from './sequence-settings.seed';

type ViewMode = 'list' | 'grid';
type StatusFilter = 'all' | 'active' | 'inactive';
type SortKey =
  | 'name'
  | 'sequenceLength'
  | 'module'
  | 'documentType'
  | 'sequenceType'
  | 'startsFrom'
  | 'increment'
  | 'lastValue';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-sequence-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './sequence-settings.component.html',
  styleUrls: ['../hotel-chains/hotel-chains.component.scss', './sequence-settings.component.scss'],
})
export class SequenceSettingsComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() canEdit = true;

  rows: SequenceSettingRowDto[] = [];
  viewMode: ViewMode = 'list';
  searchQuery = '';
  statusFilter: StatusFilter = 'all';
  sortKey: SortKey | null = null;
  sortDir: SortDir = 'asc';
  pageIndex = 1;
  pageSize = 10;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = SEQUENCE_SETTINGS_SEED.map((row) => ({ ...row }));
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

  filteredRows(): SequenceSettingRowDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = [...this.rows];
    if (this.statusFilter === 'active') {
      rows = rows.filter((r) => r.isActive);
    } else if (this.statusFilter === 'inactive') {
      rows = rows.filter((r) => !r.isActive);
    }
    if (q) {
      rows = rows.filter((r) => {
        const hay = `${r.name} ${r.module} ${r.documentType} ${r.sequenceType}`.toLowerCase();
        return hay.includes(q);
      });
    }
    if (this.sortKey) {
      const dir = this.sortDir === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        let cmp = 0;
        switch (this.sortKey) {
          case 'sequenceLength':
            cmp = a.sequenceLength - b.sequenceLength;
            break;
          case 'startsFrom':
            cmp = a.startsFrom - b.startsFrom;
            break;
          case 'increment':
            cmp = a.increment - b.increment;
            break;
          case 'lastValue':
            cmp = a.lastValue - b.lastValue;
            break;
          case 'module':
            cmp = a.module.localeCompare(b.module, 'ar');
            break;
          case 'documentType':
            cmp = a.documentType.localeCompare(b.documentType, 'ar');
            break;
          case 'sequenceType':
            cmp = a.sequenceType.localeCompare(b.sequenceType, 'ar');
            break;
          default:
            cmp = a.name.localeCompare(b.name, 'ar');
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

  totalRows(): number {
    return this.filteredRows().length;
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.totalRows() / this.pageSize));
  }

  pageNumbers(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  pagedRows(): SequenceSettingRowDto[] {
    const rows = this.filteredRows();
    const start = (this.pageIndex - 1) * this.pageSize;
    return rows.slice(start, start + this.pageSize);
  }

  rangeFrom(): number {
    if (!this.totalRows()) {
      return 0;
    }
    return (this.pageIndex - 1) * this.pageSize + 1;
  }

  rangeTo(): number {
    return Math.min(this.pageIndex * this.pageSize, this.totalRows());
  }

  setPage(page: number): void {
    const next = Math.min(Math.max(1, page), this.totalPages());
    this.pageIndex = next;
    this.cdr.markForCheck();
  }

  onPageSizeChange(): void {
    this.pageIndex = 1;
    this.cdr.markForCheck();
  }

  onSearchChange(): void {
    this.pageIndex = 1;
    this.cdr.markForCheck();
  }

  openCreate(): void {
    if (!this.canEdit) {
      return;
    }
  }

  openEdit(row: SequenceSettingRowDto): void {
    if (!this.canEdit) {
      return;
    }
    void row;
  }
}
