import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { HotelCurrencyService } from '../../services/hotel-currency.service';
import { UiMessageService } from '../../services/ui-message.service';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { BOOKING_SOURCE_OPTIONS } from '../../utils/booking-meta.options';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) {
    return isoDate;
  }
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function dayDiff(fromIso: string, toIso: string): number {
  const from = new Date(`${fromIso}T12:00:00`);
  const to = new Date(`${toIso}T12:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return 1;
  }
  return Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000));
}

@Component({
  selector: 'app-revenue-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiInlineTextComponent, LocaleNumberPipe],
  templateUrl: './revenue-card.component.html',
  styleUrls: ['./revenue-card.component.css'],
})
export class RevenueCardComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly fb = inject(FormBuilder);
  readonly currency = inject(HotelCurrencyService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly bookingSourceOptions = BOOKING_SOURCE_OPTIONS;
  readonly bookingKindOptions = [{ id: 'walk_in', labelKey: 'bookingKindWalkIn' }] as const;
  readonly marketCodeOptions = [
    { id: 'business', labelKey: 'marketBusiness' },
    { id: 'leisure', labelKey: 'marketLeisure' },
    { id: 'government', labelKey: 'marketGovernment' },
  ] as const;
  readonly roomTypeOptions = ['postMaster'] as const;
  readonly roomOptions: string[] = [];

  submitted = false;
  notesOpen = false;
  private syncingDates = false;

  readonly form = this.fb.group({
    arrivalDate: [this.todayIso(), [Validators.required]],
    nights: [1, [Validators.required, Validators.min(1)]],
    departureDate: [addDays(this.todayIso(), 1), [Validators.required]],
    adults: [0, [Validators.min(0)]],
    guestSearch: ['', [Validators.required]],
    bookingKind: ['walk_in', [Validators.required]],
    bookingSource: [''],
    priceCode: [''],
    marketCode: [''],
    roomType: ['postMaster', [Validators.required]],
    roomNumber: [''],
    roomCount: [0],
    guestCount: [0],
    nightPrice: [0],
    avgRoomPrice: [0],
    roomPrice: [0],
    packagesAmount: [0],
    taxAmount: [0],
    notes: [''],
  });

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.bindDateSync();
    this.recalculateSummary();
  }

  label(key: string): string {
    return this.ui.screenText('revenueCard', key);
  }

  bookingKindLabel(labelKey: string): string {
    return this.ui.screenText('booking', labelKey);
  }

  sourceLabel(labelKey: string): string {
    return this.ui.screenText('booking', labelKey);
  }

  roomTypeLabel(type: string): string {
    if (type === 'postMaster') {
      return this.label('roomTypePostMaster');
    }
    return this.ui.roomTypeLabel(type);
  }

  get summaryRooms(): number {
    return Math.max(0, Number(this.form.get('roomCount')?.value) || 0);
  }

  get summaryGuests(): number {
    return Math.max(0, Number(this.form.get('guestCount')?.value) || 0);
  }

  get summaryNights(): number {
    return Math.max(0, Number(this.form.get('nights')?.value) || 0);
  }

  get summaryNightPrice(): number {
    return Math.max(0, Number(this.form.get('nightPrice')?.value) || 0);
  }

  get summaryAvgRoomPrice(): number {
    return Math.max(0, Number(this.form.get('avgRoomPrice')?.value) || 0);
  }

  get summaryRoomPrice(): number {
    return Math.max(0, Number(this.form.get('roomPrice')?.value) || 0);
  }

  get summaryPackages(): number {
    return Math.max(0, Number(this.form.get('packagesAmount')?.value) || 0);
  }

  get summaryTaxes(): number {
    return Math.max(0, Number(this.form.get('taxAmount')?.value) || 0);
  }

  get summaryTotal(): number {
    return this.summaryRoomPrice + this.summaryPackages + this.summaryTaxes;
  }

  formatMoney(value: number): string {
    const n = Number.isFinite(value) ? value : 0;
    return `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${this.currency.symbol()}`;
  }

  stepNights(delta: number): void {
    const current = Number(this.form.get('nights')?.value) || 1;
    this.form.patchValue({ nights: Math.max(1, current + delta) });
    this.recalculateSummary();
  }

  stepAdults(delta: number): void {
    const current = Number(this.form.get('adults')?.value) || 0;
    this.form.patchValue({ adults: Math.max(0, current + delta) });
    this.recalculateSummary();
  }

  toggleNotes(): void {
    this.notesOpen = !this.notesOpen;
  }

  submitBooking(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.uiMsg.show(this.label('validationRequired'));
      this.cdr.markForCheck();
      return;
    }
    this.uiMsg.success(this.label('bookSuccess'));
  }

  private recalculateSummary(): void {
    const adults = Math.max(0, Number(this.form.get('adults')?.value) || 0);
    const rooms = this.form.get('roomNumber')?.value?.trim() ? 1 : 0;
    this.form.patchValue(
      {
        roomCount: rooms,
        guestCount: adults,
      },
      { emitEvent: false },
    );
    this.cdr.markForCheck();
  }

  private bindDateSync(): void {
    this.form
      .get('arrivalDate')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((from) => {
        if (this.syncingDates || !from) {
          return;
        }
        const nights = Number(this.form.get('nights')?.value) || 1;
        this.syncingDates = true;
        this.form.patchValue({ departureDate: addDays(from, nights) }, { emitEvent: false });
        this.syncingDates = false;
        this.recalculateSummary();
      });

    this.form
      .get('nights')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((nights) => {
        if (this.syncingDates) {
          return;
        }
        const from = this.form.get('arrivalDate')?.value;
        if (!from) {
          return;
        }
        const n = Math.max(1, Number(nights) || 1);
        this.syncingDates = true;
        this.form.patchValue({ departureDate: addDays(from, n) }, { emitEvent: false });
        this.syncingDates = false;
        this.recalculateSummary();
      });

    this.form
      .get('departureDate')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((to) => {
        if (this.syncingDates || !to) {
          return;
        }
        const from = this.form.get('arrivalDate')?.value;
        if (!from) {
          return;
        }
        this.syncingDates = true;
        this.form.patchValue({ nights: dayDiff(from, to) }, { emitEvent: false });
        this.syncingDates = false;
        this.recalculateSummary();
      });

    this.form
      .get('roomNumber')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.recalculateSummary());
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
