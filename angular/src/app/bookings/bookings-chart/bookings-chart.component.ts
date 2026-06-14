import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { HotelCurrencyService } from '../../services/hotel-currency.service';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import {
  BOOKINGS_CHART_DEFAULT_FROM,
  BOOKINGS_CHART_DEFAULT_TO,
  buildBookingsChart,
  type BookingsChartDay,
  type BookingsChartRow,
} from './bookings-chart.static-data';

@Component({
  selector: 'app-bookings-chart',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent, LocaleNumberPipe],
  templateUrl: './bookings-chart.component.html',
  styleUrls: ['./bookings-chart.component.css'],
})
export class BookingsChartComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  readonly currency = inject(HotelCurrencyService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('chartScroll') chartScroll?: ElementRef<HTMLDivElement>;

  fromDate = BOOKINGS_CHART_DEFAULT_FROM;
  toDate = BOOKINGS_CHART_DEFAULT_TO;
  days: BookingsChartDay[] = [];
  rows: BookingsChartRow[] = [];
  visibleStart = 0;
  readonly visibleCount = 10;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rebuildChart();
  }

  label(key: string): string {
    return this.ui.screenText('bookingsChart', key);
  }

  get visibleDays(): BookingsChartDay[] {
    return this.days.slice(this.visibleStart, this.visibleStart + this.visibleCount);
  }

  visibleValue(row: BookingsChartRow, dayIndex: number): number {
    return row.values[this.visibleStart + dayIndex] ?? 0;
  }

  formatCell(row: BookingsChartRow, dayIndex: number): string {
    const value = this.visibleValue(row, dayIndex);
    if (row.format === 'percent') {
      return `${value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
    }
    if (row.format === 'money') {
      return `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })} ${this.currency.symbol()}`;
    }
    return String(value);
  }

  dayHeading(day: BookingsChartDay): string {
    return `${this.label(day.weekdayKey)} ${this.formatDisplayDate(day.iso)}`;
  }

  applyDates(): void {
    if (!this.fromDate || !this.toDate) {
      return;
    }
    if (this.fromDate > this.toDate) {
      this.toDate = this.fromDate;
    }
    this.rebuildChart();
  }

  scrollPrev(): void {
    this.visibleStart = Math.max(0, this.visibleStart - 1);
  }

  scrollNext(): void {
    const maxStart = Math.max(0, this.days.length - this.visibleCount);
    this.visibleStart = Math.min(maxStart, this.visibleStart + 1);
  }

  get canScrollPrev(): boolean {
    return this.visibleStart > 0;
  }

  get canScrollNext(): boolean {
    return this.visibleStart + this.visibleCount < this.days.length;
  }

  rowToneClass(row: BookingsChartRow): string {
    return `bc-row--${row.tone}`;
  }

  trackByRowId(_index: number, row: BookingsChartRow): string {
    return row.id;
  }

  trackByDayIso(_index: number, day: BookingsChartDay): string {
    return day.iso;
  }

  private rebuildChart(): void {
    const built = buildBookingsChart(this.fromDate, this.toDate);
    this.days = built.days;
    this.rows = built.rows;
    this.visibleStart = 0;
    this.cdr.markForCheck();
  }

  private formatDisplayDate(iso: string): string {
    const [y, m, d] = iso.split('-');
    return y && m && d ? `${y}-${m}-${d}` : iso;
  }
}
