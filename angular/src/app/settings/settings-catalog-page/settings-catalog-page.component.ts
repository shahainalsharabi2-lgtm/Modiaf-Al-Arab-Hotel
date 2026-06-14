import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Input,
  OnChanges,
  OnInit,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { settingsSidebarNavPathKeys } from '../settings-page-nav.config';
import {
  loadSettingsCatalogRows,
  nextSettingsCatalogRowId,
  saveSettingsCatalogRows,
  type SettingsCatalogRow,
} from '../settings-catalog.store';

@Component({
  selector: 'app-settings-catalog-page',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './settings-catalog-page.component.html',
  styleUrls: ['./settings-catalog-page.component.css'],
})
export class SettingsCatalogPageComponent implements OnInit, OnChanges {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input({ required: true }) navId = '';
  @Input({ required: true }) labelKey = '';
  @Input() canEdit = true;

  rows: SettingsCatalogRow[] = [];
  modalOpen = false;
  editingId: string | null = null;
  form = this.emptyForm();

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
  }

  ngOnChanges(): void {
    this.reload();
  }

  breadcrumb(): string {
    return settingsSidebarNavPathKeys(this.labelKey)
      .map((key) => this.ui.sidebarLabel(key))
      .join(' / ');
  }

  pageTitle(): string {
    return this.ui.sidebarLabel(this.labelKey);
  }

  reload(): void {
    this.rows = loadSettingsCatalogRows(this.navId).sort(
      (a, b) => a.displayOrder - b.displayOrder || a.nameAr.localeCompare(b.nameAr, 'ar'),
    );
    this.cdr.markForCheck();
  }

  openCreate(): void {
    this.editingId = null;
    this.form = {
      ...this.emptyForm(),
      displayOrder: this.rows.length ? Math.max(...this.rows.map((r) => r.displayOrder)) + 1 : 1,
    };
    this.modalOpen = true;
  }

  openEdit(row: SettingsCatalogRow): void {
    this.editingId = row.id;
    this.form = { ...row };
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
    this.editingId = null;
    this.form = this.emptyForm();
  }

  saveRow(): void {
    const nameAr = this.form.nameAr.trim();
    if (!nameAr) {
      return;
    }
    const payload: SettingsCatalogRow = {
      id: this.editingId ?? nextSettingsCatalogRowId(),
      displayOrder: Number(this.form.displayOrder) || 0,
      nameAr,
      nameEn: this.form.nameEn.trim(),
      description: this.form.description.trim(),
    };
    const next = this.editingId
      ? this.rows.map((row) => (row.id === this.editingId ? payload : row))
      : [...this.rows, payload];
    saveSettingsCatalogRows(this.navId, next);
    this.reload();
    this.closeModal();
  }

  deleteRow(row: SettingsCatalogRow): void {
    const next = this.rows.filter((item) => item.id !== row.id);
    saveSettingsCatalogRows(this.navId, next);
    this.reload();
  }

  private emptyForm(): SettingsCatalogRow {
    return {
      id: '',
      displayOrder: 1,
      nameAr: '',
      nameEn: '',
      description: '',
    };
  }
}
