import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import {
  HK_CHECK_ROOM_STATUS_FILTER_OPTIONS,
  HK_CHECK_ROOM_STATUS_ROWS,
} from './hk-check-room-status.static-data';
import type {
  HkBookingStatusKey,
  HkCheckRoomStatusRow,
  HkCheckRoomStatusSortDir,
  HkCheckRoomStatusSortKey,
  HkCheckRoomStatusViewMode,
  HkHousekeepingStatus,
  HkRoomOccupancyStatus,
} from './hk-check-room-status.types';

@Component({
  selector: 'app-hk-check-room-status',
  standalone: true,
  imports: [CommonModule, FormsModule, LocaleNumberPipe, UiInlineTextComponent],
  templateUrl: './hk-check-room-status.component.html',
  styleUrls: ['./hk-check-room-status.component.css'],
})
export class HkCheckRoomStatusComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly filterOptions = HK_CHECK_ROOM_STATUS_FILTER_OPTIONS;
  readonly pageSizeOptions = [10, 25, 50, 100] as const;

  allRows: HkCheckRoomStatusRow[] = [...HK_CHECK_ROOM_STATUS_ROWS];
  selectedIds = new Set<string>();

  filterRoomStatus = '';
  filterHkStatus = '';
  filterRoomType = '';
  filterBuilding = '';
  filterFloor = '';
  filterBookingStatus = '';

  appliedRoomStatus = '';
  appliedHkStatus = '';
  appliedRoomType = '';
  appliedBuilding = '';
  appliedFloor = '';
  appliedBookingStatus = '';

  scopeFilter = '';
  searchQuery = '';
  viewMode: HkCheckRoomStatusViewMode = 'table';

  pageSize: (typeof this.pageSizeOptions)[number] = 10;
  currentPage = 1;

  sortKey: HkCheckRoomStatusSortKey = 'roomNo';
  sortDir: HkCheckRoomStatusSortDir = 'asc';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
  }

  label(key: string): string {
    return this.ui.screenText('hkCheckRoomStatus', key);
  }

  roomStatusLabel(key: HkRoomOccupancyStatus): string {
    return this.label(`roomStatus_${key}`);
  }

  hkStatusLabel(key: HkHousekeepingStatus): string {
    return this.label(`hkStatus_${key}`);
  }

  bookingStatusLabel(key: HkBookingStatusKey): string {
    return this.label(`bookingStatus_${key}`);
  }

  compositeDetailsLabel(key: HkCheckRoomStatusRow['compositeDetailsKey']): string {
    return this.label(`compositeDetails_${key}`);
  }

  applyFilters(): void {
    this.appliedRoomStatus = this.filterRoomStatus;
    this.appliedHkStatus = this.filterHkStatus;
    this.appliedRoomType = this.filterRoomType;
    this.appliedBuilding = this.filterBuilding;
    this.appliedFloor = this.filterFloor;
    this.appliedBookingStatus = this.filterBookingStatus;
    this.currentPage = 1;
  }

  printTable(): void {
    window.print();
  }

  setViewMode(mode: HkCheckRoomStatusViewMode): void {
    this.viewMode = mode;
  }

  get filteredRows(): HkCheckRoomStatusRow[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = this.allRows.filter((row) => {
      if (this.appliedRoomStatus && row.roomStatus !== this.appliedRoomStatus) {
        return false;
      }
      if (this.appliedHkStatus && row.hkStatus !== this.appliedHkStatus) {
        return false;
      }
      if (this.appliedRoomType && row.roomTypeKey !== this.appliedRoomType) {
        return false;
      }
      if (this.appliedBuilding && row.buildingKey !== this.appliedBuilding) {
        return false;
      }
      if (this.appliedFloor && String(row.floor) !== this.appliedFloor) {
        return false;
      }
      if (this.appliedBookingStatus && row.bookingStatus !== this.appliedBookingStatus) {
        return false;
      }
      if (this.scopeFilter === 'occupied' && row.roomStatus !== 'occupied') {
        return false;
      }
      if (this.scopeFilter === 'dirty' && row.hkStatus !== 'dirty') {
        return false;
      }
      if (!q) {
        return true;
      }
      return [row.roomNo, row.name, row.foreignName, row.buildingLabel, row.roomTypeLabel].some((v) =>
        v.toLowerCase().includes(q),
      );
    });
    rows = [...rows].sort((a, b) => this.compareRows(a, b));
    return rows;
  }

  get totalItems(): number {
    return this.filteredRows.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get pagedRows(): HkCheckRoomStatusRow[] {
    const safePage = Math.min(this.currentPage, this.totalPages);
    const start = (safePage - 1) * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  get rangeFrom(): number {
    if (this.totalItems === 0) {
      return 0;
    }
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get rangeTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  get visiblePages(): Array<number | 'ellipsis'> {
    const total = this.totalPages;
    const current = this.currentPage;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: Array<number | 'ellipsis'> = [1];
    if (current > 3) {
      pages.push('ellipsis');
    }
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }
    if (current < total - 2) {
      pages.push('ellipsis');
    }
    pages.push(total);
    return pages;
  }

  get allPageSelected(): boolean {
    return this.pagedRows.length > 0 && this.pagedRows.every((row) => this.selectedIds.has(row.id));
  }

  setPageSize(size: number): void {
    this.pageSize = size as (typeof this.pageSizeOptions)[number];
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    this.currentPage = Math.min(Math.max(1, page), this.totalPages);
  }

  goFirstPage(): void {
    this.goToPage(1);
  }

  goLastPage(): void {
    this.goToPage(this.totalPages);
  }

  pageRangeSummary(): string {
    return this.label('pageRangeSummary')
      .replace('{from}', String(this.rangeFrom))
      .replace('{to}', String(this.rangeTo))
      .replace('{total}', String(this.totalItems));
  }

  toggleSort(key: HkCheckRoomStatusSortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      return;
    }
    this.sortKey = key;
    this.sortDir = 'asc';
  }

  sortIcon(key: HkCheckRoomStatusSortKey): string {
    if (this.sortKey !== key) {
      return 'fa-sort';
    }
    return this.sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  toggleRowSelection(row: HkCheckRoomStatusRow): void {
    if (this.selectedIds.has(row.id)) {
      this.selectedIds.delete(row.id);
      return;
    }
    this.selectedIds.add(row.id);
  }

  toggleSelectAllOnPage(): void {
    if (this.allPageSelected) {
      for (const row of this.pagedRows) {
        this.selectedIds.delete(row.id);
      }
      return;
    }
    for (const row of this.pagedRows) {
      this.selectedIds.add(row.id);
    }
  }

  isRowSelected(row: HkCheckRoomStatusRow): boolean {
    return this.selectedIds.has(row.id);
  }

  trackRow(_index: number, row: HkCheckRoomStatusRow): string {
    return row.id;
  }

  rowActions(_row: HkCheckRoomStatusRow): void {}

  private compareRows(a: HkCheckRoomStatusRow, b: HkCheckRoomStatusRow): number {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    if (this.sortKey === 'floor') {
      const diff = a.floor - b.floor;
      return diff === 0 ? 0 : diff > 0 ? dir : -dir;
    }
    const av = this.sortValue(a, this.sortKey);
    const bv = this.sortValue(b, this.sortKey);
    if (av < bv) {
      return -1 * dir;
    }
    if (av > bv) {
      return 1 * dir;
    }
    return 0;
  }

  private sortValue(row: HkCheckRoomStatusRow, key: HkCheckRoomStatusSortKey): string | number {
    switch (key) {
      case 'roomNo':
        return Number(row.roomNo);
      case 'name':
        return row.name;
      case 'building':
        return row.buildingLabel;
      case 'floor':
        return row.floor;
      case 'roomType':
        return row.roomTypeLabel;
      case 'foreignName':
        return row.foreignName;
      case 'roomStatus':
        return row.roomStatus;
      case 'hkStatus':
        return row.hkStatus;
      default:
        return '';
    }
  }
}
