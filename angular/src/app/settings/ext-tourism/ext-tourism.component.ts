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
  EXT_TOURISM_KEY_OPTIONS,
  EXT_TOURISM_LINK_SEED,
  ExtTourismLinkRowDto,
} from './ext-tourism.seed';

interface ExtTourismForm {
  number: string;
  keyName: string;
  value: string;
  description: string;
  isActive: boolean;
}

const EMPTY_FORM: ExtTourismForm = {
  number: '',
  keyName: '',
  value: '',
  description: '',
  isActive: false,
};

@Component({
  selector: 'app-ext-tourism',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './ext-tourism.component.html',
  styleUrls: ['../hotel-chains/hotel-chains.component.scss', '../ext-shomoos/ext-shomoos.component.scss'],
})
export class ExtTourismComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() canEdit = true;

  rows: ExtTourismLinkRowDto[] = [];
  searchQuery = '';
  modalOpen = false;
  saving = false;
  editingId: number | null = null;
  form: ExtTourismForm = { ...EMPTY_FORM };
  readonly keyOptions = EXT_TOURISM_KEY_OPTIONS;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = EXT_TOURISM_LINK_SEED.map((row) => ({ ...row }));
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

  openCreate(): void {
    if (!this.canEdit) {
      return;
    }
    this.editingId = null;
    this.form = { ...EMPTY_FORM };
    this.modalOpen = true;
    this.cdr.markForCheck();
  }

  openEdit(row: ExtTourismLinkRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.editingId = row.id;
    this.form = {
      number: row.number,
      keyName: row.keyName,
      value: row.value,
      description: row.description,
      isActive: row.isActive,
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
    if (!this.form.keyName.trim()) {
      this.uiMsg.show(this.label('extTourismRequiredFields'));
      return;
    }
    this.saving = true;
    const payload: ExtTourismLinkRowDto = {
      id: this.editingId ?? this.rows.reduce((max, row) => Math.max(max, row.id), 0) + 1,
      number: this.form.number.trim(),
      keyName: this.form.keyName.trim(),
      value: this.form.value.trim(),
      description: this.form.description.trim(),
      isActive: this.form.isActive,
    };
    if (this.editingId) {
      this.rows = this.rows.map((row) => (row.id === this.editingId ? payload : row));
    } else {
      this.rows = [...this.rows, payload];
    }
    window.setTimeout(() => {
      this.saving = false;
      this.modalOpen = false;
      this.uiMsg.show(this.label('extTourismSaveSuccess'));
      this.cdr.markForCheck();
    }, 300);
  }

  filteredRows(): ExtTourismLinkRowDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      return [...this.rows].sort((a, b) => a.id - b.id);
    }
    return this.rows
      .filter((row) => {
        const hay = [row.number, row.keyName, row.value, row.description].join(' ').toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => a.id - b.id);
  }

  activeLabel(isActive: boolean): string {
    return isActive ? this.label('extTourismActiveYes') : this.label('extTourismActiveNo');
  }
}
