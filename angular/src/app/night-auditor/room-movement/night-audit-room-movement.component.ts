import { CommonModule } from '@angular/common';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import {
  NIGHT_AUDIT_ROOM_MOVEMENT_DEFAULTS,
  type NightAuditRoomMovementRow,
  type NightAuditRoomMovementScopeFilter,
  type NightAuditRoomMovementSortDir,
  type NightAuditRoomMovementSortKey,
  type NightAuditRoomMovementViewMode,
} from './night-audit-room-movement.types';

@Component({
  selector: 'app-night-audit-room-movement',
  standalone: true,
  imports: [CommonModule, FormsModule, LocaleNumberPipe, UiInlineTextComponent],
  templateUrl: './night-audit-room-movement.component.html',
  styleUrls: ['./night-audit-room-movement.component.css'],
})
export class NightAuditRoomMovementComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  allRows: NightAuditRoomMovementRow[] = NIGHT_AUDIT_ROOM_MOVEMENT_DEFAULTS.map((row) => ({ ...row }));

  searchQuery = '';
  scopeFilter: NightAuditRoomMovementScopeFilter = 'all';
  viewMode: NightAuditRoomMovementViewMode = 'table';

  sortKey: NightAuditRoomMovementSortKey = 'workDate';
  sortDir: NightAuditRoomMovementSortDir = 'desc';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
  }

  label(key: string): string {
    return this.ui.screenText('nightAuditRoomMovement', key);
  }

  roomLabel(roomNo: string): string {
    const no = String(roomNo ?? '').trim();
    if (!no || no === '—') {
      return '—';
    }
    return `${this.label('roomPrefix')} ${no}`;
  }

  setViewMode(mode: NightAuditRoomMovementViewMode): void {
    this.viewMode = mode;
  }

  get filteredRows(): NightAuditRoomMovementRow[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = this.allRows.filter((row) => {
      if (this.scopeFilter === 'type1' && row.transferType !== 1) {
        return false;
      }
      if (this.scopeFilter === 'type3' && row.transferType !== 3) {
        return false;
      }
      if (!q) {
        return true;
      }
      return [
        row.workDate,
        this.roomLabel(row.oldRoomNo),
        this.roomLabel(row.newRoomNo),
        row.oldRoomType,
        row.newRoomType,
        String(row.oldAmount),
        String(row.newAmount),
        String(row.transferType),
      ].some((v) => v.toLowerCase().includes(q));
    });
    rows = [...rows].sort((a, b) => this.compareRows(a, b));
    return rows;
  }

  toggleSort(key: NightAuditRoomMovementSortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      return;
    }
    this.sortKey = key;
    this.sortDir = 'asc';
  }

  sortIcon(key: NightAuditRoomMovementSortKey): string {
    if (this.sortKey !== key) {
      return 'fa-sort';
    }
    return this.sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  trackRow(_index: number, row: NightAuditRoomMovementRow): string {
    return row.id;
  }

  printTable(): void {
    window.print();
  }

  private compareRows(a: NightAuditRoomMovementRow, b: NightAuditRoomMovementRow): number {
    const dir = this.sortDir === 'asc' ? 1 : -1;
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

  private sortValue(row: NightAuditRoomMovementRow, key: NightAuditRoomMovementSortKey): string | number {
    switch (key) {
      case 'workDate':
        return row.workDate;
      case 'oldRoom':
        return Number(row.oldRoomNo) || row.oldRoomNo;
      case 'newRoom':
        return Number(row.newRoomNo) || row.newRoomNo;
      case 'oldRoomType':
        return row.oldRoomType;
      case 'newRoomType':
        return row.newRoomType;
      case 'oldAmount':
        return row.oldAmount;
      case 'newAmount':
        return row.newAmount;
      case 'transferType':
        return row.transferType;
      default:
        return '';
    }
  }
}
