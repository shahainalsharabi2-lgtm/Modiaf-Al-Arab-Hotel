import { CommonModule } from '@angular/common';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { RoomService } from '../../services/room.service';
import { BookingService } from '../../services/booking.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { buildRoomsRackModel, tileMatchesStatFilter } from './rooms-rack.util';
import type {
  RoomsRackBuilding,
  RoomsRackBuildingId,
  RoomsRackStatKey,
  RoomsRackTile,
  RoomsRackTypeFilterId,
} from './rooms-rack.types';

@Component({
  selector: 'app-rooms-rack',
  standalone: true,
  imports: [CommonModule, FormsModule, LocaleNumberPipe, UiInlineTextComponent],
  templateUrl: './rooms-rack.component.html',
  styleUrls: ['./rooms-rack.component.css'],
})
export class RoomsRackComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly roomService = inject(RoomService);
  private readonly bookingService = inject(BookingService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  loading = true;
  loadError = '';

  tiles: RoomsRackTile[] = [];
  stats = buildRoomsRackModel([], []).stats;
  buildings = buildRoomsRackModel([], []).buildings;
  typeFilters = buildRoomsRackModel([], []).typeFilters;

  activeBuildingId: RoomsRackBuildingId = 'main';
  typeFilter: RoomsRackTypeFilterId = 'all';
  activeStatFilter: RoomsRackStatKey | null = null;
  searchQuery = '';
  selectedTileId: string | null = null;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.loadData();
  }

  label(key: string): string {
    return this.ui.screenText('roomsRack', key);
  }

  loadData(): void {
    this.loading = true;
    this.loadError = '';
    let roomsFailed = false;
    forkJoin({
      rooms: this.roomService.getRooms().pipe(
        catchError((err) => {
          console.error('rooms rack: failed to load rooms', err);
          roomsFailed = true;
          return of([]);
        }),
      ),
      bookings: this.bookingService.getBookings().pipe(
        catchError((err) => {
          console.error('rooms rack: failed to load bookings', err);
          return of([]);
        }),
      ),
    }).subscribe(({ rooms, bookings }) => {
      if (roomsFailed) {
        this.loadError = this.label('loadError');
      }
      const model = buildRoomsRackModel(rooms, bookings);
      this.tiles = model.tiles;
      this.stats = model.stats;
      this.buildings = model.buildings;
      this.typeFilters = model.typeFilters;
      if (this.activeBuildingId === 'a' && !model.buildings.find((b) => b.id === 'a')?.count) {
        this.activeBuildingId = 'main';
      }
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  setBuilding(id: RoomsRackBuildingId): void {
    this.activeBuildingId = id;
    this.selectedTileId = null;
  }

  setTypeFilter(id: RoomsRackTypeFilterId): void {
    this.typeFilter = id;
    this.selectedTileId = null;
  }

  toggleStatFilter(key: RoomsRackStatKey): void {
    this.activeStatFilter = this.activeStatFilter === key ? null : key;
    this.selectedTileId = null;
  }

  selectTile(tile: RoomsRackTile): void {
    this.selectedTileId = this.selectedTileId === tile.id ? null : tile.id;
  }

  get filteredTiles(): RoomsRackTile[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.tiles.filter((tile) => {
      if (tile.buildingId !== this.activeBuildingId) {
        return false;
      }
      if (this.typeFilter !== 'all' && tile.typeFilterId !== this.typeFilter) {
        return false;
      }
      if (!tileMatchesStatFilter(tile, this.activeStatFilter)) {
        return false;
      }
      if (!q) {
        return true;
      }
      return tile.number.includes(q) || tile.typeLabel.toLowerCase().includes(q);
    });
  }

  get activeBuilding(): RoomsRackBuilding | undefined {
    return this.buildings.find((b) => b.id === this.activeBuildingId);
  }

  statToneClass(tone: string): string {
    return `rr-stat--${tone}`;
  }

  tileClass(tile: RoomsRackTile): Record<string, boolean> {
    return {
      [`rr-tile--${tile.status}`]: true,
      'rr-tile--selected': this.selectedTileId === tile.id,
    };
  }

  trackTile(_index: number, tile: RoomsRackTile): string {
    return tile.id;
  }

  trackStat(_index: number, stat: { key: string }): string {
    return stat.key;
  }

  trackTypeFilter(_index: number, opt: { id: string }): string {
    return opt.id;
  }
}
