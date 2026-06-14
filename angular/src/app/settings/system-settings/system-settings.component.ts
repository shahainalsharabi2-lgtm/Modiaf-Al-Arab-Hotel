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
import { SYSTEM_SETTINGS_SEED, SystemSettingRowDto } from './system-settings.seed';

type TypeFilter = 'all' | 'toggle' | 'select';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './system-settings.component.html',
  styleUrls: ['./system-settings.component.scss'],
})
export class SystemSettingsComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() canEdit = true;

  rows: SystemSettingRowDto[] = [];
  nameQuery = '';
  appliedNameQuery = '';
  typeFilter: TypeFilter = 'all';
  pageIndex = 1;
  pageSize = 10;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = SYSTEM_SETTINGS_SEED.map((row) => ({ ...row }));
  }

  applySearch(): void {
    this.appliedNameQuery = this.nameQuery.trim();
    this.pageIndex = 1;
    this.cdr.markForCheck();
  }

  onFilterChange(): void {
    this.pageIndex = 1;
    this.cdr.markForCheck();
  }

  filteredRows(): SystemSettingRowDto[] {
    const q = this.appliedNameQuery.toLowerCase();
    let rows = [...this.rows];
    if (this.typeFilter !== 'all') {
      rows = rows.filter((r) => r.controlType === this.typeFilter);
    }
    if (q) {
      rows = rows.filter((r) => r.name.toLowerCase().includes(q) || String(r.id).includes(q));
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

  pagedRows(): SystemSettingRowDto[] {
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
    this.pageIndex = Math.min(Math.max(1, page), this.totalPages());
    this.cdr.markForCheck();
  }

  onPageSizeChange(): void {
    this.pageIndex = 1;
    this.cdr.markForCheck();
  }

  toggleValue(row: SystemSettingRowDto): void {
    if (!this.canEdit || row.controlType !== 'toggle') {
      return;
    }
    row.toggleValue = !row.toggleValue;
    this.cdr.markForCheck();
  }
}
