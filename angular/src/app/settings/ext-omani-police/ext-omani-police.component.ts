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
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { UiMessageService } from '../../services/ui-message.service';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import {
  EXT_OMANI_POLICE_CATEGORIES,
  EXT_OMANI_POLICE_DATA_TYPES,
  EXT_OMANI_POLICE_MAPPING_SEED,
  ExtOmaniPoliceCategoryId,
  ExtOmaniPoliceMappingRowDto,
} from './ext-omani-police.seed';

interface ExtOmaniPoliceForm {
  serviceType: string;
  code: string;
  externalValue: string;
  dataType: string;
}

type TypeFilter = 'all' | (typeof EXT_OMANI_POLICE_DATA_TYPES)[number];

const EMPTY_FORM: ExtOmaniPoliceForm = {
  serviceType: '',
  code: '',
  externalValue: '',
  dataType: 'String',
};

@Component({
  selector: 'app-ext-omani-police',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './ext-omani-police.component.html',
  styleUrls: ['../hotel-chains/hotel-chains.component.scss', './ext-omani-police.component.scss'],
})
export class ExtOmaniPoliceComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() canEdit = true;

  readonly categories = EXT_OMANI_POLICE_CATEGORIES;
  readonly dataTypes = EXT_OMANI_POLICE_DATA_TYPES;

  rows: ExtOmaniPoliceMappingRowDto[] = [];
  activeCategory: ExtOmaniPoliceCategoryId = 'countries';
  searchQuery = '';
  typeFilter: TypeFilter = 'all';
  modalOpen = false;
  saving = false;
  editingId: number | null = null;
  form: ExtOmaniPoliceForm = { ...EMPTY_FORM };

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = EXT_OMANI_POLICE_MAPPING_SEED.map((row) => ({ ...row }));
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modalOpen) {
      this.closeModal();
    }
  }

  label(key: string): string {
    return this.ui.screenText('settings', key);
  }

  categoryLabel(labelKey: string): string {
    return this.label(labelKey);
  }

  setCategory(categoryId: ExtOmaniPoliceCategoryId): void {
    this.activeCategory = categoryId;
    this.cdr.markForCheck();
  }

  openCreate(): void {
    if (!this.canEdit) {
      return;
    }
    this.editingId = null;
    this.form = {
      ...EMPTY_FORM,
      serviceType: this.categoryLabel(
        this.categories.find((c) => c.id === this.activeCategory)?.labelKey ?? '',
      ),
    };
    this.modalOpen = true;
    this.cdr.markForCheck();
  }

  openEdit(row: ExtOmaniPoliceMappingRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.editingId = row.id;
    this.form = {
      serviceType: row.serviceType,
      code: row.code,
      externalValue: row.externalValue,
      dataType: row.dataType,
    };
    this.modalOpen = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.modalOpen = false;
    this.cdr.markForCheck();
  }

  saveRow(): void {
    if (!this.canEdit || this.saving) {
      return;
    }
    if (!this.form.code.trim() || !this.form.externalValue.trim()) {
      this.uiMsg.show(this.label('extOmaniPoliceRequiredFields'));
      return;
    }
    this.saving = true;
    const payload: ExtOmaniPoliceMappingRowDto = {
      id: this.editingId ?? this.rows.reduce((max, row) => Math.max(max, row.id), 0) + 1,
      categoryId: this.activeCategory,
      serviceType: this.form.serviceType.trim(),
      code: this.form.code.trim(),
      externalValue: this.form.externalValue.trim(),
      dataType: this.form.dataType,
    };
    if (this.editingId) {
      this.rows = this.rows.map((row) => (row.id === this.editingId ? payload : row));
    } else {
      this.rows = [...this.rows, payload];
    }
    window.setTimeout(() => {
      this.saving = false;
      this.modalOpen = false;
      this.uiMsg.show(this.label('extOmaniPoliceSaveSuccess'));
      this.cdr.markForCheck();
    }, 300);
  }

  deleteRow(row: ExtOmaniPoliceMappingRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.rows = this.rows.filter((r) => r.id !== row.id);
    this.cdr.markForCheck();
  }

  filteredRows(): ExtOmaniPoliceMappingRowDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.rows
      .filter((row) => row.categoryId === this.activeCategory)
      .filter((row) => (this.typeFilter === 'all' ? true : row.dataType === this.typeFilter))
      .filter((row) => {
        if (!q) {
          return true;
        }
        const hay = [row.serviceType, row.code, row.externalValue, row.dataType]
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => a.id - b.id);
  }
}
