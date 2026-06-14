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
  EXT_SHOMOOS_KEY_OPTIONS,
  EXT_SHOMOOS_LINK_SEED,
  ExtShomoosLinkRowDto,
} from './ext-shomoos.seed';

type ShomoosTab = 'link' | 'guests';

interface ExtShomoosForm {
  number: string;
  keyName: string;
  value: string;
  description: string;
  isActive: boolean;
}

const EMPTY_FORM: ExtShomoosForm = {
  number: '',
  keyName: '',
  value: '',
  description: '',
  isActive: false,
};

@Component({
  selector: 'app-ext-shomoos',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './ext-shomoos.component.html',
  styleUrls: ['../hotel-chains/hotel-chains.component.scss', './ext-shomoos.component.scss'],
})
export class ExtShomoosComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() canEdit = true;

  rows: ExtShomoosLinkRowDto[] = [];
  activeTab: ShomoosTab = 'link';
  searchQuery = '';
  modalOpen = false;
  saving = false;
  editingId: number | null = null;
  form: ExtShomoosForm = { ...EMPTY_FORM };
  readonly keyOptions = EXT_SHOMOOS_KEY_OPTIONS;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = EXT_SHOMOOS_LINK_SEED.map((row) => ({ ...row }));
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

  setTab(tab: ShomoosTab): void {
    this.activeTab = tab;
    this.cdr.markForCheck();
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

  openEdit(row: ExtShomoosLinkRowDto): void {
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
      this.uiMsg.show(this.label('extShomoosRequiredFields'));
      return;
    }
    this.saving = true;
    const payload: ExtShomoosLinkRowDto = {
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
      this.uiMsg.show(this.label('extShomoosSaveSuccess'));
      this.cdr.markForCheck();
    }, 300);
  }

  filteredRows(): ExtShomoosLinkRowDto[] {
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
    return isActive ? this.label('extShomoosActiveYes') : this.label('extShomoosActiveNo');
  }
}
