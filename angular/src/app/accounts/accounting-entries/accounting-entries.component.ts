import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostListener,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { UiMessageService } from '../../services/ui-message.service';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import {
  ACCOUNTING_ENTRIES_SEED,
  ACCOUNTING_ENTRIES_WARNINGS,
  AccountingEntryRowDto,
} from './accounting-entries.seed';

@Component({
  selector: 'app-accounting-entries',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent, LocaleNumberPipe],
  templateUrl: './accounting-entries.component.html',
  styleUrls: [
    '../../settings/hotel-chains/hotel-chains.component.scss',
    '../chart-of-accounts-link/chart-of-accounts-link.component.scss',
    './accounting-entries.component.scss',
  ],
})
export class AccountingEntriesComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  rows: AccountingEntryRowDto[] = [];
  fromDate = '2025-01-01';
  toDate = '2025-12-04';
  warningsOpen = false;
  readonly warningKeys = ACCOUNTING_ENTRIES_WARNINGS;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = ACCOUNTING_ENTRIES_SEED.map((row) => ({ ...row }));
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.warningsOpen) {
      this.closeWarnings();
    }
  }

  label(key: string): string {
    return this.ui.screenText('accountingEntries', key);
  }

  totalEntries(): number {
    return this.rows.length;
  }

  viewEntries(): void {
    this.uiMsg.show(this.label('viewSuccess'));
    this.cdr.markForCheck();
  }

  printEntries(): void {
    this.uiMsg.show(this.label('printHint'));
  }

  createEntries(): void {
    this.warningsOpen = true;
    this.cdr.markForCheck();
  }

  cancelEntries(): void {
    this.uiMsg.show(this.label('cancelHint'));
  }

  transferEntries(): void {
    this.uiMsg.show(this.label('transferHint'));
  }

  closeWarnings(): void {
    this.warningsOpen = false;
    this.cdr.markForCheck();
  }
}
