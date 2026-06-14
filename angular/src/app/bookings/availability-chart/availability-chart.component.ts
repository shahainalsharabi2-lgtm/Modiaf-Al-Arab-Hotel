import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import {
  AVAILABILITY_CHART_DEFAULT_FROM,
  AVAILABILITY_CHART_DEFAULT_TO,
  AVAILABILITY_CHART_HOTELS,
  AVAILABILITY_CHART_SELECTED_HOTELS,
  buildAvailabilityDays,
  cellValues,
  type AvailabilityChartDay,
  type AvailabilityChartHotel,
} from './availability-chart.static-data';

@Component({
  selector: 'app-availability-chart',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent, LocaleNumberPipe],
  templateUrl: './availability-chart.component.html',
  styleUrls: ['./availability-chart.component.css'],
})
export class AvailabilityChartComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly hotels = AVAILABILITY_CHART_HOTELS;
  readonly selectedHotelCount = AVAILABILITY_CHART_SELECTED_HOTELS;

  fromDate = AVAILABILITY_CHART_DEFAULT_FROM;
  toDate = AVAILABILITY_CHART_DEFAULT_TO;
  days: AvailabilityChartDay[] = [];
  visibleStart = 0;
  readonly visibleCount = 8;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rebuildDays();
  }

  label(key: string): string {
    return this.ui.screenText('availabilityChart', key);
  }

  hotelLabel(hotel: AvailabilityChartHotel): string {
    return this.label(hotel.labelKey);
  }

  get visibleDays(): AvailabilityChartDay[] {
    return this.days.slice(this.visibleStart, this.visibleStart + this.visibleCount);
  }

  dayHeading(day: AvailabilityChartDay): string {
    return `${day.iso} ${this.label(day.weekdayKey)}`;
  }

  cellFor(hotel: AvailabilityChartHotel, visibleIndex: number): { reserved: number; available: number } {
    return cellValues(hotel, this.visibleStart + visibleIndex);
  }

  hotelsSelectedLabel(): string {
    return this.label('hotelsSelected').replace('{0}', String(this.selectedHotelCount));
  }

  applyDates(): void {
    if (!this.fromDate || !this.toDate) {
      return;
    }
    if (this.fromDate > this.toDate) {
      this.toDate = this.fromDate;
    }
    this.rebuildDays();
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

  trackByDay(_i: number, day: AvailabilityChartDay): string {
    return day.iso;
  }

  trackByHotel(_i: number, hotel: AvailabilityChartHotel): string {
    return hotel.id;
  }

  private rebuildDays(): void {
    this.days = buildAvailabilityDays(this.fromDate, this.toDate);
    this.visibleStart = 0;
    this.cdr.markForCheck();
  }
}
