import { CommonModule } from '@angular/common';
import { UiInlineTextComponent } from '../ui-inline-text/ui-inline-text.component';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { RoomService } from '../../services/room.service';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { LocaleNumberPipe } from '../pipes/locale-number.pipe';
import { buildRoomStatusSummary, type RoomStatusSummary } from '../room-status-summary.util';

@Component({
  selector: 'app-room-status-panel',
  standalone: true,
  imports: [CommonModule, LocaleNumberPipe, UiInlineTextComponent],
  templateUrl: './room-status-panel.component.html',
  styleUrls: ['./room-status-panel.component.css'],
})
export class RoomStatusPanelComponent implements OnChanges {
  readonly ui = inject(UiTranslationsService);
  private readonly roomService = inject(RoomService);
  private readonly bookingService = inject(BookingService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() open = false;
  @Output() closed = new EventEmitter<void>();

  loading = false;
  error = '';
  summary: RoomStatusSummary | null = null;

  constructor() {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue === true) {
      this.loadSummary();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.open) {
      this.requestClose();
    }
  }

  requestClose(): void {
    this.closed.emit();
  }

  onBackdropClick(): void {
    this.requestClose();
  }

  onPanelClick(event: Event): void {
    event.stopPropagation();
  }

  private loadSummary(): void {
    this.loading = true;
    this.error = '';
    forkJoin({
      rooms: this.roomService.getRooms(),
      bookings: this.bookingService.getBookings(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ rooms, bookings }) => {
          this.summary = buildRoomStatusSummary(rooms, bookings);
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.error = this.ui.chromeLabel('roomStatusLoadError');
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }
}
