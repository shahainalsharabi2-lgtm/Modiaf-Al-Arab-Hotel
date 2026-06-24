import { CommonModule } from '@angular/common';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { ChangeDetectorRef, Component, DestroyRef, HostListener, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { HotelSymbolPipe } from '../../pipes/hotel-symbol.pipe';
import { RoomService } from '../../services/room.service';
import { BookingService } from '../../services/booking.service';
import { Room } from '../../models/room.model';
import { Booking } from '../../models/booking.model';
import { buildRoomPlanFromApi } from './room-plan-data.util';
import {
  type RoomPlanBuilding,
  type RoomPlanFooterSummary,
  type RoomPlanRoom,
  type RoomPlanStatCard,
} from './room-plan.types';

@Component({
  selector: 'app-room-plan',
  standalone: true,
  imports: [CommonModule, FormsModule, LocaleNumberPipe, HotelSymbolPipe, UiInlineTextComponent],
  templateUrl: './room-plan.component.html',
  styleUrls: ['./room-plan.component.css'],
})
export class RoomPlanComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly roomService = inject(RoomService);
  private readonly bookingService = inject(BookingService);

  statRow1: RoomPlanStatCard[] = [];
  statRow2: RoomPlanStatCard[] = [];
  buildings: RoomPlanBuilding[] = [];
  floors: number[] = [1];
  footer: RoomPlanFooterSummary = {
    occupancyRate: 0,
    totalCredit: 0,
    totalDebit: 0,
    totalNet: 0,
  };
  rooms: RoomPlanRoom[] = [];

  loading = true;
  loadError = '';

  activeBuildingId: RoomPlanBuilding['id'] = 'main';
  searchQuery = '';
  filterArrivals = false;
  filterPaymentDue = false;
  filterHighlightDue = false;
  selectedFloor: number | 'all' = 'all';
  dataFilter: 'all' | 'occupied' | 'vacant' = 'all';
  zoomLevel = 100;
  openStatMenuKey: string | null = null;
  activeStatQuickFilter: string | null = null;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.loadRoomPlan();
  }

  label(key: string): string {
    return this.ui.screenText('roomPlan', key);
  }

  get filteredRooms(): RoomPlanRoom[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.rooms.filter((room) => {
      if (room.buildingId !== this.activeBuildingId) {
        return false;
      }
      if (this.selectedFloor !== 'all' && room.floor !== this.selectedFloor) {
        return false;
      }
      if (this.filterArrivals && !room.hasArrival) {
        return false;
      }
      if (this.filterPaymentDue && !room.paymentDue) {
        return false;
      }
      if (this.activeStatQuickFilter === 'occupiedNow' && room.status !== 'occupied') {
        return false;
      }
      if (this.activeStatQuickFilter === 'vacantNow' && room.status === 'occupied') {
        return false;
      }
      if (this.activeStatQuickFilter === 'availableTonight' && room.status === 'occupied') {
        return false;
      }
      if (this.dataFilter === 'occupied' && room.status !== 'occupied') {
        return false;
      }
      if (this.dataFilter === 'vacant' && room.status === 'occupied') {
        return false;
      }
      if (q) {
        const typeLabel = this.label(room.typeKey).toLowerCase();
        return room.number.includes(q) || typeLabel.includes(q);
      }
      return true;
    });
  }

  setBuilding(id: RoomPlanBuilding['id']): void {
    this.activeBuildingId = id;
  }

  secondaryCardColumn(index: number): number {
    return index + 3;
  }

  toggleStatMenu(key: string, event: Event): void {
    event.stopPropagation();
    this.openStatMenuKey = this.openStatMenuKey === key ? null : key;
    this.cdr.markForCheck();
  }

  applyStatQuickFilter(key: string, mode: 'all' | 'match'): void {
    this.openStatMenuKey = null;
    this.activeStatQuickFilter = mode === 'all' ? null : key;
    this.cdr.markForCheck();
  }

  @HostListener('document:click')
  closeStatMenuOnOutsideClick(): void {
    if (this.openStatMenuKey) {
      this.openStatMenuKey = null;
      this.cdr.markForCheck();
    }
  }

  statToneClass(card: RoomPlanStatCard): string {
    return `rp-stat-card--${card.tone}`;
  }

  roomCardClass(room: RoomPlanRoom): Record<string, boolean> {
    return {
      [`rp-room-card--${room.status}`]: true,
      'rp-room-card--due-highlight': this.filterHighlightDue && !!room.paymentDue,
      'rp-room-card--dimmed': this.filterHighlightDue && !room.paymentDue,
    };
  }

  roomCornerIcon(room: RoomPlanRoom): string {
    return room.status === 'dirty' ? 'fa-broom' : 'fa-magic';
  }

  roomCornerIsClean(room: RoomPlanRoom): boolean {
    return room.status !== 'dirty';
  }

  isOccupied(room: RoomPlanRoom): boolean {
    return room.status === 'occupied';
  }

  trackRoom(_index: number, room: RoomPlanRoom): string {
    return room.id;
  }

  formatMoney(value: number): string {
    const abs = Math.abs(value);
    const formatted = abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (value < 0) {
      return `- ${formatted}`;
    }
    return formatted;
  }

  reload(): void {
    this.loadRoomPlan();
  }

  private loadRoomPlan(): void {
    this.loading = true;
    this.loadError = '';
    forkJoin({
      rooms: this.roomService.getRooms().pipe(
        catchError((err) => {
          console.error('room-plan: failed to load rooms', err);
          return throwError(() => err);
        }),
      ),
      bookings: this.bookingService.getBookings().pipe(
        catchError((err) => {
          console.error('room-plan: failed to load bookings', err);
          return of([] as Booking[]);
        }),
      ),
    }).subscribe({
      next: ({ rooms, bookings }) => {
        const payload = buildRoomPlanFromApi(rooms, bookings);
        this.statRow1 = payload.statsRow1;
        this.statRow2 = payload.statsRow2;
        this.buildings = payload.buildings;
        this.floors = payload.floors;
        this.footer = payload.footer;
        this.rooms = payload.rooms;
        if (!this.floors.includes(this.selectedFloor as number) && this.selectedFloor !== 'all') {
          this.selectedFloor = 'all';
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.loadError = this.ui.screenText('roomsRack', 'loadError');
        this.cdr.markForCheck();
      },
    });
  }
}
