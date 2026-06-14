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
import {
  PRICE_INQUIRY_PRICE_CODE_OPTIONS,
  PRICE_INQUIRY_RESULTS_SEED,
  PriceInquiryFilterDto,
  PriceInquiryResultRowDto,
  emptyPriceInquiryFilter,
  formatInquiryDate,
} from './price-inquiry.seed';

@Component({
  selector: 'app-price-inquiry',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './price-inquiry.component.html',
  styleUrls: [
    '../hotel-chains/hotel-chains.component.scss',
    '../room-types/room-types.component.scss',
    '../price-code/price-code.component.scss',
    './price-inquiry.component.scss',
  ],
})
export class PriceInquiryComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly formatInquiryDate = formatInquiryDate;
  readonly priceCodeOptions = PRICE_INQUIRY_PRICE_CODE_OPTIONS;

  @Input() canEdit = true;

  filter: PriceInquiryFilterDto = emptyPriceInquiryFilter();
  results: PriceInquiryResultRowDto[] = [];

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.results = PRICE_INQUIRY_RESULTS_SEED.map((row) => ({ ...row }));
  }

  runInquiry(): void {
    this.results = PRICE_INQUIRY_RESULTS_SEED.map((row) => ({ ...row }));
    this.cdr.markForCheck();
  }

  priceCodeLabel(labelKey: string): string {
    return this.ui.screenText('settings', labelKey);
  }

  resetFilter(): void {
    this.filter = emptyPriceInquiryFilter();
    this.results = PRICE_INQUIRY_RESULTS_SEED.map((row) => ({ ...row }));
    this.cdr.markForCheck();
  }
}
