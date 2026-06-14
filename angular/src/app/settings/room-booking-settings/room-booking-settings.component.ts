import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import {
  ROOM_FILTER_PERMS_SEED,
  ROOM_STATUSES_SEED,
  RoomBookingSection,
  RoomFilterPermRowDto,
  RoomStatusRowDto,
} from './room-booking-settings.seed';

type ViewMode = 'list' | 'grid';
type StatusFilter = 'all' | 'active' | 'inactive';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-room-booking-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './room-booking-settings.component.html',
  styleUrls: ['./room-booking-settings.component.scss'],
})
export class RoomBookingSettingsComponent implements OnInit, OnChanges {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  @Input() canEdit = true;
  @Input() navId: string | null = 'sys-room-booking-statuses';

  activeSection: RoomBookingSection = 'statuses';
  statusRows: RoomStatusRowDto[] = [];
  filterPermRows: RoomFilterPermRowDto[] = [];

  displayBy = 'rooms';
  userQuery = 'admin';
  viewMode: ViewMode = 'list';
  searchQuery = '';
  statusFilter: StatusFilter = 'all';
  pageIndex = 1;
  pageSize = 10;
  openActionsId: number | null = null;

  filterSerial = '';
  filterStatusName = '';
  filterUsedIn = '';
  filterStatusType = '';
  filterColor = '';

  filterPermSerial = '';
  filterPermCode = '';
  filterPermName = '';
  filterPermLatinName = '';

  statusSortKey: 'serial' | 'statusName' | 'usedIn' | 'statusType' | 'colorHex' | null = null;
  statusSortDir: SortDir = 'asc';
  permSortKey: 'id' | 'code' | 'name' | 'latinName' | null = null;
  permSortDir: SortDir = 'asc';

  readonly pageSizeOptions = [10, 50, 100, 500, 1000];

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.statusRows = ROOM_STATUSES_SEED.map((row) => ({ ...row }));
    this.filterPermRows = ROOM_FILTER_PERMS_SEED.map((row) => ({ ...row }));
    this.syncSectionFromNav();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['navId']) {
      this.syncSectionFromNav();
    }
  }

  @HostListener('document:click')
  closeActionsMenu(): void {
    if (this.openActionsId !== null) {
      this.openActionsId = null;
      this.cdr.markForCheck();
    }
  }

  private syncSectionFromNav(): void {
    this.activeSection = this.navId === 'sys-room-plan-filter-perms' ? 'filterPerms' : 'statuses';
    this.pageIndex = 1;
    this.cdr.markForCheck();
  }

  setSection(section: RoomBookingSection): void {
    if (this.activeSection === section) {
      return;
    }
    const navId = section === 'filterPerms' ? 'sys-room-plan-filter-perms' : 'sys-room-booking-statuses';
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: 'page', nav: navId },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
    this.activeSection = section;
    this.pageIndex = 1;
    this.searchQuery = '';
    this.openActionsId = null;
    this.cdr.markForCheck();
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
    this.cdr.markForCheck();
  }

  clearUserQuery(): void {
    this.userQuery = '';
    this.cdr.markForCheck();
  }

  toggleStatusSort(key: NonNullable<typeof this.statusSortKey>): void {
    if (this.statusSortKey === key) {
      this.statusSortDir = this.statusSortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.statusSortKey = key;
      this.statusSortDir = 'asc';
    }
    this.cdr.markForCheck();
  }

  statusSortIcon(key: NonNullable<typeof this.statusSortKey>): string {
    if (this.statusSortKey !== key) {
      return 'fa-sort';
    }
    return this.statusSortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  togglePermSort(key: NonNullable<typeof this.permSortKey>): void {
    if (this.permSortKey === key) {
      this.permSortDir = this.permSortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.permSortKey = key;
      this.permSortDir = 'asc';
    }
    this.cdr.markForCheck();
  }

  permSortIcon(key: NonNullable<typeof this.permSortKey>): string {
    if (this.permSortKey !== key) {
      return 'fa-sort';
    }
    return this.permSortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  filteredStatusRows(): RoomStatusRowDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = [...this.statusRows];
    if (q) {
      rows = rows.filter((r) => {
        const hay = `${r.serial} ${r.statusName} ${r.usedIn} ${r.statusType} ${r.colorHex ?? ''}`.toLowerCase();
        return hay.includes(q);
      });
    }
    if (this.filterSerial.trim()) {
      const f = this.filterSerial.trim();
      rows = rows.filter((r) => String(r.serial).includes(f));
    }
    if (this.filterStatusName.trim()) {
      const f = this.filterStatusName.trim().toLowerCase();
      rows = rows.filter((r) => r.statusName.toLowerCase().includes(f));
    }
    if (this.filterUsedIn.trim()) {
      const f = this.filterUsedIn.trim().toLowerCase();
      rows = rows.filter((r) => r.usedIn.toLowerCase().includes(f));
    }
    if (this.filterStatusType.trim()) {
      const f = this.filterStatusType.trim().toLowerCase();
      rows = rows.filter((r) => r.statusType.toLowerCase().includes(f));
    }
    if (this.filterColor.trim()) {
      const f = this.filterColor.trim().toLowerCase();
      rows = rows.filter((r) => (r.colorHex ?? '').toLowerCase().includes(f));
    }
    if (this.statusSortKey) {
      const dir = this.statusSortDir === 'asc' ? 1 : -1;
      rows.sort((a, b) => this.compareStatusRows(a, b) * dir);
    }
    return rows;
  }

  private compareStatusRows(a: RoomStatusRowDto, b: RoomStatusRowDto): number {
    let cmp = 0;
    switch (this.statusSortKey) {
      case 'serial':
        cmp = a.serial - b.serial;
        break;
      case 'statusName':
        cmp = a.statusName.localeCompare(b.statusName, 'ar');
        break;
      case 'usedIn':
        cmp = a.usedIn.localeCompare(b.usedIn, 'en');
        break;
      case 'statusType':
        cmp = a.statusType.localeCompare(b.statusType, 'en');
        break;
      case 'colorHex':
        cmp = (a.colorHex ?? '').localeCompare(b.colorHex ?? '', 'en');
        break;
      default:
        cmp = a.serial - b.serial;
    }
    if (cmp === 0) {
      cmp = a.id - b.id;
    }
    return cmp;
  }

  filteredPermRows(): RoomFilterPermRowDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = [...this.filterPermRows];
    if (this.statusFilter === 'active') {
      rows = rows.filter((r) => r.allowed);
    } else if (this.statusFilter === 'inactive') {
      rows = rows.filter((r) => !r.allowed);
    }
    if (q) {
      rows = rows.filter((r) => {
        const hay = `${r.id} ${r.code} ${r.name} ${r.latinName}`.toLowerCase();
        return hay.includes(q);
      });
    }
    if (this.filterPermSerial.trim()) {
      const f = this.filterPermSerial.trim();
      rows = rows.filter((r) => String(r.id).includes(f));
    }
    if (this.filterPermCode.trim()) {
      const f = this.filterPermCode.trim().toLowerCase();
      rows = rows.filter((r) => r.code.toLowerCase().includes(f));
    }
    if (this.filterPermName.trim()) {
      const f = this.filterPermName.trim().toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(f));
    }
    if (this.filterPermLatinName.trim()) {
      const f = this.filterPermLatinName.trim().toLowerCase();
      rows = rows.filter((r) => r.latinName.toLowerCase().includes(f));
    }
    if (this.permSortKey) {
      const dir = this.permSortDir === 'asc' ? 1 : -1;
      rows.sort((a, b) => this.comparePermRows(a, b) * dir);
    }
    return rows;
  }

  private comparePermRows(a: RoomFilterPermRowDto, b: RoomFilterPermRowDto): number {
    let cmp = 0;
    switch (this.permSortKey) {
      case 'code':
        cmp = a.code.localeCompare(b.code, 'en');
        break;
      case 'name':
        cmp = a.name.localeCompare(b.name, 'ar');
        break;
      case 'latinName':
        cmp = a.latinName.localeCompare(b.latinName, 'en');
        break;
      default:
        cmp = a.id - b.id;
    }
    if (cmp === 0) {
      cmp = a.id - b.id;
    }
    return cmp;
  }

  activeRowsCount(): number {
    return this.activeSection === 'statuses'
      ? this.filteredStatusRows().length
      : this.filteredPermRows().length;
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.activeRowsCount() / this.pageSize));
  }

  pageNumbers(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  pagedStatusRows(): RoomStatusRowDto[] {
    const rows = this.filteredStatusRows();
    const start = (this.pageIndex - 1) * this.pageSize;
    return rows.slice(start, start + this.pageSize);
  }

  pagedPermRows(): RoomFilterPermRowDto[] {
    const rows = this.filteredPermRows();
    const start = (this.pageIndex - 1) * this.pageSize;
    return rows.slice(start, start + this.pageSize);
  }

  rangeFrom(): number {
    if (!this.activeRowsCount()) {
      return 0;
    }
    return (this.pageIndex - 1) * this.pageSize + 1;
  }

  rangeTo(): number {
    return Math.min(this.pageIndex * this.pageSize, this.activeRowsCount());
  }

  setPage(page: number): void {
    this.pageIndex = Math.min(Math.max(1, page), this.totalPages());
    this.cdr.markForCheck();
  }

  setPageSize(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.cdr.markForCheck();
  }

  onSearchChange(): void {
    this.pageIndex = 1;
    this.cdr.markForCheck();
  }

  toggleAllowed(row: RoomFilterPermRowDto): void {
    if (!this.canEdit) {
      return;
    }
    row.allowed = !row.allowed;
    this.cdr.markForCheck();
  }

  toggleActionsMenu(rowId: number, event: Event): void {
    event.stopPropagation();
    this.openActionsId = this.openActionsId === rowId ? null : rowId;
    this.cdr.markForCheck();
  }

  colorPillStyle(hex: string | null | undefined): Record<string, string> {
    if (!hex) {
      return {};
    }
    return { backgroundColor: hex, borderColor: hex };
  }
}
