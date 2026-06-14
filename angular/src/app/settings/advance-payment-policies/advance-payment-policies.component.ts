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
import { UiMessageService } from '../../services/ui-message.service';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import {
  ADVANCE_PAYMENT_POLICIES_SEED,
  AdvancePaymentPolicyRowDto,
  AdvancePaymentType,
  PolicyTimingType,
} from './advance-payment-policies.seed';

@Component({
  selector: 'app-advance-payment-policies',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './advance-payment-policies.component.html',
  styleUrls: ['./advance-payment-policies.component.scss'],
})
export class AdvancePaymentPoliciesComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() canEdit = true;

  rows: AdvancePaymentPolicyRowDto[] = [];
  searchQuery = '';
  openActionsId: number | null = null;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = ADVANCE_PAYMENT_POLICIES_SEED.map((row) => ({ ...row }));
  }

  @HostListener('document:click')
  closeActionsMenu(): void {
    if (this.openActionsId !== null) {
      this.openActionsId = null;
      this.cdr.markForCheck();
    }
  }

  filteredRows(): AdvancePaymentPolicyRowDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      return this.rows;
    }
    return this.rows.filter((row) => {
      const hay = [
        row.name,
        this.paymentTypeLabel(row.paymentType),
        row.value,
        this.policyTimingTypeLabel(row.policyTimingType),
        this.policyTimingLabel(row),
        row.bookingType,
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }

  paymentTypeLabel(type: AdvancePaymentType): string {
    return type === 'percentage'
      ? this.ui.screenText('settings', 'advancePaymentPoliciesTypePercentage')
      : this.ui.screenText('settings', 'advancePaymentPoliciesTypeAmount');
  }

  policyTimingTypeLabel(type: PolicyTimingType): string {
    return type === 'at_booking'
      ? this.ui.screenText('settings', 'advancePaymentPoliciesTimingAtBooking')
      : this.ui.screenText('settings', 'advancePaymentPoliciesTimingBeforeArrival');
  }

  policyTimingLabel(row: AdvancePaymentPolicyRowDto): string {
    const unit =
      row.policyTimingDays === 1
        ? this.ui.screenText('settings', 'advancePaymentPoliciesDaySingular')
        : this.ui.screenText('settings', 'advancePaymentPoliciesDayPlural');
    return `${row.policyTimingDays} ${unit}`;
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

  openEdit(row: AdvancePaymentPolicyRowDto): void {
    if (!this.canEdit) {
      return;
    }
    void row;
  }

  deleteRow(row: AdvancePaymentPolicyRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openActionsId = null;
    void this.uiMsg.confirm(this.ui.screenText('settings', 'advancePaymentPoliciesDeleteConfirm')).then((ok) => {
      if (!ok) {
        return;
      }
      this.rows = this.rows.filter((r) => r.id !== row.id);
      this.cdr.markForCheck();
    });
  }
}
