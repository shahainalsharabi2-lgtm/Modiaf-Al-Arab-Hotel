import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { HotelBrandingStoreService } from '../../services/hotel-branding-store.service';
import { HotelCurrencyService } from '../../services/hotel-currency.service';
import { PaymentMethodService } from '../../services/payment-method.service';
import { UiMessageService } from '../../services/ui-message.service';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { BOOKING_KIND_OPTIONS, BOOKING_SOURCE_OPTIONS } from '../../utils/booking-meta.options';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import type {
  GroupBookingAdvancePolicy,
  GroupBookingPackageLine,
  GroupBookingRoomCountMode,
  GroupBookingRoomLine,
  GroupBookingRoutingLine,
} from './group-booking.models';

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

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

@Component({
  selector: 'app-group-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, UiInlineTextComponent, LocaleNumberPipe],
  templateUrl: './group-booking.component.html',
  styleUrls: ['./group-booking.component.css'],
})
export class GroupBookingComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly fb = inject(FormBuilder);
  private readonly branding = inject(HotelBrandingStoreService);
  readonly currency = inject(HotelCurrencyService);
  private readonly paymentMethodService = inject(PaymentMethodService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly bookingKindOptions = BOOKING_KIND_OPTIONS;
  readonly bookingSourceOptions = BOOKING_SOURCE_OPTIONS;

  readonly marketCodeOptions = [
    { id: 'business', labelKey: 'marketBusiness' },
    { id: 'leisure', labelKey: 'marketLeisure' },
    { id: 'government', labelKey: 'marketGovernment' },
  ] as const;

  readonly nationalityOptions = [
    { id: 'SA', flag: '🇸🇦', labelKey: 'natSaudi' },
    { id: 'AE', flag: '🇦🇪', labelKey: 'natEmirati' },
    { id: 'EG', flag: '🇪🇬', labelKey: 'natEgyptian' },
    { id: 'JO', flag: '🇯🇴', labelKey: 'natJordanian' },
  ] as const;

  readonly roomTypeOptions = ['double', 'triple', 'quadruple', 'single'] as const;
  readonly childAgeSlots = [1, 2, 3, 4, 5] as const;

  paymentMethods: string[] = [];
  submitted = false;
  private syncingDates = false;

  roomLines: GroupBookingRoomLine[] = [];
  packageLines: GroupBookingPackageLine[] = [];
  advancePolicies: GroupBookingAdvancePolicy[] = [];
  routingLines: GroupBookingRoutingLine[] = [];

  roomLineSearch = '';
  draftRoomType = 'double';
  draftRoomCount = 10;
  draftAdults = 2;
  draftChildren: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  draftExtra = 0;

  readonly form = this.fb.group({
    hotelId: ['main', [Validators.required]],
    groupName: ['', [Validators.required]],
    nationality: ['SA', [Validators.required]],
    fromDate: [this.todayIso(), [Validators.required]],
    nights: [1, [Validators.required, Validators.min(1)]],
    toDate: [addDays(this.todayIso(), 1), [Validators.required]],
    bookingKind: ['confirmed', [Validators.required]],
    marketCode: ['business', [Validators.required]],
    bookingSource: ['company', [Validators.required]],
    paymentMethod: ['', [Validators.required]],
    company: [''],
    representatives: [''],
    agentSearch: [''],
    employee: ['tamer'],
    nusukAgreement: [''],
    priceCode: [''],
    supplier: [''],
    currencyCode: ['SAR', [Validators.required]],
    roomCountMode: ['flexible' as GroupBookingRoomCountMode, [Validators.required]],
    roomCount: [0, [Validators.min(0)]],
    guestCount: [0, [Validators.min(0)]],
    roomPrice: [0, [Validators.min(0)]],
    nightPrice: [0, [Validators.min(0)]],
    packagesAmount: [0, [Validators.min(0)]],
    taxAmount: [0, [Validators.min(0)]],
  });

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.initDefaultRouting();
    this.loadPaymentMethods();
    this.bindDateSync();
    this.recalculateSummary();
  }

  hotelOptions(): Array<{ id: string; name: string }> {
    const name = this.branding.displayName().trim() || this.label('defaultHotelName');
    return [{ id: 'main', name }];
  }

  label(key: string): string {
    return this.ui.screenText('groupBooking', key);
  }

  kindLabel(labelKey: string): string {
    return this.ui.screenText('booking', labelKey);
  }

  sourceLabel(labelKey: string): string {
    return this.ui.screenText('booking', labelKey);
  }

  roomTypeLabel(type: string): string {
    return this.ui.roomTypeLabel(type);
  }

  selectedNationalityFlag(): string {
    const id = this.form.get('nationality')?.value;
    return this.nationalityOptions.find((n) => n.id === id)?.flag ?? '🏳️';
  }

  get summaryNights(): number {
    return Math.max(0, Number(this.form.get('nights')?.value) || 0);
  }

  get summaryRooms(): number {
    return Math.max(0, Number(this.form.get('roomCount')?.value) || 0);
  }

  get summaryGuests(): number {
    return Math.max(0, Number(this.form.get('guestCount')?.value) || 0);
  }

  get summaryRoomPrice(): number {
    return Math.max(0, Number(this.form.get('roomPrice')?.value) || 0);
  }

  get summaryNightPrice(): number {
    return Math.max(0, Number(this.form.get('nightPrice')?.value) || 0);
  }

  get summaryAvgRoomPrice(): number {
    if (this.summaryRooms <= 0) {
      return 0;
    }
    return this.summaryRoomPrice / this.summaryRooms;
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

  get filteredRoomLines(): GroupBookingRoomLine[] {
    const q = this.roomLineSearch.trim().toLowerCase();
    if (!q) {
      return this.roomLines;
    }
    return this.roomLines.filter((line) => this.roomTypeLabel(line.roomType).toLowerCase().includes(q));
  }

  formatMoney(value: number): string {
    const n = Number.isFinite(value) ? value : 0;
    return `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${this.currency.symbol()}`;
  }

  stepNights(delta: number): void {
    const current = Number(this.form.get('nights')?.value) || 1;
    this.form.patchValue({ nights: Math.max(1, current + delta) });
    this.syncRoomLineNights();
    this.recalculateSummary();
  }

  setRoomCountMode(mode: GroupBookingRoomCountMode): void {
    this.form.patchValue({ roomCountMode: mode });
  }

  addRoomLine(): void {
    const count = Math.max(1, Number(this.draftRoomCount) || 1);
    const nights = this.summaryNights;
    const line: GroupBookingRoomLine = {
      id: newId(),
      roomType: this.draftRoomType,
      count,
      adults: Math.max(1, Number(this.draftAdults) || 1),
      child1: this.draftChildren[1] ?? 0,
      child2: this.draftChildren[2] ?? 0,
      child3: this.draftChildren[3] ?? 0,
      child4: this.draftChildren[4] ?? 0,
      child5: this.draftChildren[5] ?? 0,
      extra: this.draftExtra,
      available: 50,
      nights,
      totalPerPerson: 0,
    };
    this.roomLines = [...this.roomLines, line];
    this.recalculateSummary();
  }

  removeRoomLine(id: string): void {
    this.roomLines = this.roomLines.filter((l) => l.id !== id);
    this.recalculateSummary();
  }

  addPackageLine(): void {
    const nextIndex = this.packageLines.length + 1;
    this.packageLines = [
      ...this.packageLines,
      {
        id: newId(),
        code: `PKG-${nextIndex}`,
        name: this.label('samplePackageName'),
        quantity: 1,
        total: 0,
        calcMethod: this.label('calcMethodPerPerson'),
        calcBase: this.label('calcBaseStay'),
      },
    ];
    this.recalculateSummary();
  }

  removePackageLine(id: string): void {
    this.packageLines = this.packageLines.filter((l) => l.id !== id);
    this.recalculateSummary();
  }

  addAdvancePolicy(): void {
    this.advancePolicies = [
      ...this.advancePolicies,
      {
        id: newId(),
        policy: this.label('samplePolicyName'),
        percent: 25,
        amount: 0,
        dueDate: this.form.get('fromDate')?.value ?? this.todayIso(),
        notes: '',
      },
    ];
  }

  removeAdvancePolicy(id: string): void {
    this.advancePolicies = this.advancePolicies.filter((l) => l.id !== id);
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

  trackById(_index: number, row: { id: string }): string {
    return row.id;
  }

  private initDefaultRouting(): void {
    if (this.routingLines.length > 0) {
      return;
    }
    const deferred = this.form.get('paymentMethod')?.value || this.label('paymentDeferredDefault');
    this.routingLines = [
      {
        id: newId(),
        typeKey: 'routingTypeRooms',
        routingToKey: 'routingPostMaster',
        windowNo: 1,
        paymentMethod: deferred,
        notes: '',
      },
      {
        id: newId(),
        typeKey: 'routingTypeMeals',
        routingToKey: 'routingPostMaster',
        windowNo: 2,
        paymentMethod: deferred,
        notes: '',
      },
    ];
  }

  private syncRoomLineNights(): void {
    const nights = this.summaryNights;
    this.roomLines = this.roomLines.map((line) => ({ ...line, nights }));
  }

  private recalculateSummary(): void {
    let rooms = 0;
    let guests = 0;
    let roomPrice = 0;
    for (const line of this.roomLines) {
      rooms += line.count;
      const perRoomGuests =
        line.adults + line.child1 + line.child2 + line.child3 + line.child4 + line.child5 + line.extra;
      guests += perRoomGuests * line.count;
      roomPrice += line.totalPerPerson * line.count * Math.max(1, line.nights);
    }
    const packagesAmount = this.packageLines.reduce((sum, p) => sum + (p.total || 0), 0);
    const nightPrice = rooms > 0 && this.summaryNights > 0 ? roomPrice / (rooms * this.summaryNights) : 0;
    this.form.patchValue(
      {
        roomCount: rooms,
        guestCount: guests,
        roomPrice,
        nightPrice,
        packagesAmount,
      },
      { emitEvent: false },
    );
    this.cdr.markForCheck();
  }

  private bindDateSync(): void {
    this.form
      .get('fromDate')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((from) => {
        if (this.syncingDates || !from) {
          return;
        }
        const nights = Number(this.form.get('nights')?.value) || 1;
        this.syncingDates = true;
        this.form.patchValue({ toDate: addDays(from, nights) }, { emitEvent: false });
        this.syncingDates = false;
      });
    this.form
      .get('nights')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((nights) => {
        if (this.syncingDates) {
          return;
        }
        const from = this.form.get('fromDate')?.value;
        if (!from) {
          return;
        }
        const n = Math.max(1, Number(nights) || 1);
        this.syncingDates = true;
        this.form.patchValue({ toDate: addDays(from, n) }, { emitEvent: false });
        this.syncingDates = false;
        this.syncRoomLineNights();
        this.recalculateSummary();
      });
    this.form
      .get('toDate')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((to) => {
        if (this.syncingDates || !to) {
          return;
        }
        const from = this.form.get('fromDate')?.value;
        if (!from) {
          return;
        }
        this.syncingDates = true;
        this.form.patchValue({ nights: dayDiff(from, to) }, { emitEvent: false });
        this.syncingDates = false;
        this.syncRoomLineNights();
        this.recalculateSummary();
      });
  }

  private loadPaymentMethods(): void {
    this.paymentMethodService.getAll().subscribe({
      next: (items) => {
        this.paymentMethods = items.map((x) => x.name);
        const deferred = this.paymentMethods.find((m) => m.includes('آجل') || m.toLowerCase().includes('credit'));
        const pick = deferred ?? this.paymentMethods[0] ?? this.label('paymentDeferredDefault');
        if (!this.form.get('paymentMethod')?.value) {
          this.form.patchValue({ paymentMethod: pick });
        }
        this.initDefaultRouting();
        this.cdr.markForCheck();
      },
      error: () => {
        this.paymentMethods = [this.label('paymentDeferredDefault')];
        this.form.patchValue({ paymentMethod: this.paymentMethods[0] });
        this.initDefaultRouting();
        this.cdr.markForCheck();
      },
    });
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
