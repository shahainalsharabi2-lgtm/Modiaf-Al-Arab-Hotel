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
import { UiTranslationsService } from '../../services/ui-translations.service';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { AGENT_COMMISSIONS_SEED, AgentCommissionRowDto } from './agent-commissions.seed';

@Component({
  selector: 'app-agent-commissions',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './agent-commissions.component.html',
  styleUrls: ['./agent-commissions.component.scss'],
})
export class AgentCommissionsComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() canEdit = true;

  rows: AgentCommissionRowDto[] = [];
  searchQuery = '';
  openActionsId: number | null = null;

  filterCode = '';
  filterDescription = '';
  filterAmountType = 'all';
  filterAmount = '';
  filterPercentage = '';
  filterPerNight = 'all';
  filterPerStay = 'all';
  filterAccount = 'all';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = AGENT_COMMISSIONS_SEED.map((row) => ({ ...row }));
  }

  @HostListener('document:click')
  closeActionsMenu(): void {
    if (this.openActionsId !== null) {
      this.openActionsId = null;
      this.cdr.markForCheck();
    }
  }

  filteredRows(): AgentCommissionRowDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.rows.filter((row) => {
      if (q) {
        const hay = `${row.planName} ${row.code} ${row.description} ${row.amountType} ${row.account}`.toLowerCase();
        if (!hay.includes(q)) {
          return false;
        }
      }
      if (this.filterCode && !row.code.toLowerCase().includes(this.filterCode.trim().toLowerCase())) {
        return false;
      }
      if (this.filterDescription && !row.description.toLowerCase().includes(this.filterDescription.trim().toLowerCase())) {
        return false;
      }
      if (this.filterAmountType !== 'all' && row.amountType !== this.filterAmountType) {
        return false;
      }
      if (this.filterAmount && String(row.amount) !== this.filterAmount.trim()) {
        return false;
      }
      if (this.filterPercentage && String(row.percentage) !== this.filterPercentage.trim()) {
        return false;
      }
      if (this.filterPerNight === 'yes' && !row.perNight) {
        return false;
      }
      if (this.filterPerNight === 'no' && row.perNight) {
        return false;
      }
      if (this.filterPerStay === 'yes' && !row.perStay) {
        return false;
      }
      if (this.filterPerStay === 'no' && row.perStay) {
        return false;
      }
      if (this.filterAccount !== 'all' && row.account !== this.filterAccount) {
        return false;
      }
      return true;
    });
  }

  toggleActionsMenu(rowId: number, event: Event): void {
    event.stopPropagation();
    this.openActionsId = this.openActionsId === rowId ? null : rowId;
    this.cdr.markForCheck();
  }

  openCreate(): void {
    if (!this.canEdit) {
      return;
    }
  }
}
